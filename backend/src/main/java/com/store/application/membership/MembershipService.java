package com.store.application.membership;

import com.store.application.membership.dto.MemberRequest;
import com.store.application.membership.dto.MemberResponse;
import com.store.infrastructure.db.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MembershipService {

    private final SpringDataMembershipRepository membershipRepository;
    private final SpringDataUserRepository userRepository;
    private final SpringDataBranchRepository branchRepository;

    public MembershipService(SpringDataMembershipRepository membershipRepository,
                             SpringDataUserRepository userRepository,
                             SpringDataBranchRepository branchRepository) {
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
    }

    @Transactional
    public MemberResponse addMember(MemberRequest request) {
    String currentTenantId = com.store.domain.tenant.TenantContext.getTenant();
    final StringBuilder activationToken = new StringBuilder();

    // 1. Buscar o crear el usuario en la tabla global (identidad)
    UserEntity user = userRepository.findByEmail(request.email())
            .orElseGet(() -> {
                UserEntity newUser = new UserEntity();
                newUser.setEmail(request.email());
                newUser.setFullName(request.fullName());
                // No seteamos password real, generamos token de activación
                String token = java.util.UUID.randomUUID().toString();
                newUser.setPassword("PENDING_ACTIVATION_" + java.util.UUID.randomUUID()); 
                newUser.setResetToken(token);
                newUser.setResetTokenExpiry(java.time.LocalDateTime.now().plusDays(7)); // 7 días para activar
                newUser.setActive(true);
                newUser.setSystemAdmin(false);
                activationToken.append(token);
                return userRepository.save(newUser);
            });

    // 2. Verificar si ya es miembro de este negocio
    boolean exists = !membershipRepository.findByUserIdAndTenantId(user.getId(), currentTenantId).isEmpty();

    if (exists) {
        throw new RuntimeException("El usuario ya es miembro de este negocio");
    }

    // 3. Crear la membresía local en esquema público
    MembershipEntity membership = new MembershipEntity();
    membership.setUserId(user.getId());
    membership.setTenantId(currentTenantId);
    membership.setRole(request.role());
    membership.setBranchId(request.branchId());
    membership.setActive(true);

    return mapToResponse(membershipRepository.save(membership), activationToken.toString());
}

    @Transactional(readOnly = true)
    public List<MemberResponse> listMembers() {
        String currentTenantId = com.store.domain.tenant.TenantContext.getTenant();
        return membershipRepository.findAll().stream()
                .filter(m -> m.getTenantId().equals(currentTenantId))
                .map(m -> this.mapToResponse(m, null))
                .toList();
    }

    @Transactional
    public void removeMember(Long id) {
        membershipRepository.deleteById(id);
    }

    private MemberResponse mapToResponse(MembershipEntity membership, String token) {
        UserEntity user = userRepository.findById(membership.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado en tabla global"));
        
        String branchName = "Todas";
        if (membership.getBranchId() != null) {
            branchName = branchRepository.findById(membership.getBranchId())
                    .map(BranchEntity::getName)
                    .orElse("Desconocida");
        }

        return new MemberResponse(
                membership.getId(),
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                membership.getRole(),
                membership.getBranchId(),
                branchName,
                membership.isActive(),
                token
        );
    }
}
