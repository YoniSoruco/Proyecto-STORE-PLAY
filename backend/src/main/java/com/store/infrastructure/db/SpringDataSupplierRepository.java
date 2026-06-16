package com.store.infrastructure.db;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataSupplierRepository extends JpaRepository<SupplierEntity, Long> {
}
