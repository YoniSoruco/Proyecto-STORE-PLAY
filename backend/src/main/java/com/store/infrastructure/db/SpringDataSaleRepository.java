package com.store.infrastructure.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataSaleRepository extends JpaRepository<SaleEntity, Long> {
}
