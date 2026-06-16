package com.store.infrastructure.db;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SpringDataCashSessionRepository extends JpaRepository<CashSessionEntity, Long> {
    Optional<CashSessionEntity> findFirstByBranchIdAndUserIdAndOpenTrueOrderByOpenedAtDesc(Long branchId, Long userId);
}
