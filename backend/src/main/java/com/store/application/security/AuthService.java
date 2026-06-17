package com.store.application.security;

import com.store.application.security.dto.LoginResponse;
import com.store.domain.tenant.UserRole;
import com.store.infrastructure.db.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AuthService {

    private final SpringDataUserRepository userRepository;
    private final SpringDataTenantRepository tenantRepository;
    private final SpringDataMembershipRepository membershipRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AuthService(SpringDataUserRepository userRepository, 
                       SpringDataTenantRepository tenantRepository,
                       SpringDataMembershipRepository membershipRepository,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils,
                       UserDetailsService userDetailsService,
                       org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.membershipRepository = membershipRepository;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    @jakarta.annotation.PostConstruct
    public void initDefaultUsers() {
        updateUserPassword("admin@storeplay.com", "admin123");
        updateUserPassword("owner@test.com", "owner123");
    }

    private void updateUserPassword(String email, String rawPassword) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
        });
    }

    @Transactional(readOnly = true)
    public LoginResponse login(String email, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        String jwtToken = jwtUtils.generateToken(userDetails);

        List<LoginResponse.TenantAccessDto> accessList = new ArrayList<>();

        if (user.isSystemAdmin()) {
            tenantRepository.findAll().forEach(t -> {
                accessList.add(new LoginResponse.TenantAccessDto(
                        t.getId(), t.getName(), t.getVerticalType(), t.getPrimaryColor(),
                        UserRole.SUPERADMIN, null, t.getFeatures()
                ));
            });
        } else {
            for (TenantEntity t : tenantRepository.findAll()) {
                accessList.addAll(findMembershipsForTenant(user.getId(), t));
            }
        }

        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.isSystemAdmin(),
                accessList,
                jwtToken
        );
    }

    @Transactional
    public String requestPasswordReset(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Si el email existe, se enviarán instrucciones de recuperación."));

        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusHours(2));
        userRepository.save(user);

        // TODO: Enviar email real aquí. Por ahora lo devolvemos para pruebas.
        System.out.println("DEBUG: Reset Token para " + email + ": " + token);
        return token;
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        UserEntity user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido o expirado"));

        if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    private List<LoginResponse.TenantAccessDto> findMembershipsForTenant(Long userId, TenantEntity tenant) {
        return membershipRepository.findByUserIdAndTenantId(userId, tenant.getId()).stream()
                .map(m -> {
                    List<String> grantedFeatures = (m.getRole() == UserRole.OWNER || m.getRole() == UserRole.SUPERADMIN)
                            ? tenant.getFeatures()
                            : new ArrayList<>(m.getFeatures());

                    return new LoginResponse.TenantAccessDto(
                        tenant.getId(), tenant.getName(), tenant.getVerticalType(), tenant.getPrimaryColor(),
                        m.getRole(), m.getBranchIds(), grantedFeatures
                    );
                }).toList();
    }
}
