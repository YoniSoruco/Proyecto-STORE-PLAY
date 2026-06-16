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

    // 1. Buscar o crear el usuario en la tabla global (identidad)
    UserEntity user = userRepository.findByEmail(request.email())
            .orElseGet(() -> {
                UserEntity newUser = new UserEntity();
                newUser.setEmail(request.email());
                newUser.setFullName(request.fullName());
                newUser.setPassword("$2a$10$v7K6vM9.K7H8Y7W2vP.hM.Lz.Qy/1uE3Z5u6o/5/3m7N/P7h.1o9."); // temp123
                newUser.setActive(true);
                newUser.setSystemAdmin(false);
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

    return mapToResponse(membershipRepository.save(membership));
}

    @Transactional(readOnly = true)
    public List<MemberResponse> listMembers() {
        String currentTenantId = com.store.domain.tenant.TenantContext.getTenant();
        return membershipRepository.findAll().stream()
                .filter(m -> m.getTenantId().equals(currentTenantId))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void removeMember(Long id) {
        membershipRepository.deleteById(id);
    }

    private MemberResponse mapToResponse(MembershipEntity membership) {
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
                membership.isActive()
        );
    }
}
