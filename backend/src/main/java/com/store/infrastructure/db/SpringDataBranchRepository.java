package com.store.infrastructure.db;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataBranchRepository extends JpaRepository<BranchEntity, Long> {
}
