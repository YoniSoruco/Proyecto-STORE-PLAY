package com.store.infrastructure.db;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpringDataSaleRepository extends JpaRepository<SaleEntity, Long> {
    List<SaleEntity> findByCashSessionId(Long cashSessionId);
}
