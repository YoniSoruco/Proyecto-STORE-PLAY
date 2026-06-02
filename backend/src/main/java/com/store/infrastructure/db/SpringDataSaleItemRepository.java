package com.store.infrastructure.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataSaleItemRepository extends JpaRepository<SaleItemEntity, Long> {
  List<SaleItemEntity> findBySaleId(Long saleId);
}
