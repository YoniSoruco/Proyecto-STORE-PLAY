package com.store.infrastructure.db;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpringDataMembershipRepository extends JpaRepository<MembershipEntity, Long> {
    java.util.List<MembershipEntity> findByUserId(Long userId);
    java.util.List<MembershipEntity> findByUserIdAndTenantId(Long userId, String tenantId);
}
