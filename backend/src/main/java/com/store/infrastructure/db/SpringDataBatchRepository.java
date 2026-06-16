package com.store.infrastructure.db;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SpringDataBatchRepository extends JpaRepository<BatchEntity, Long> {
    List<BatchEntity> findByProduct_Id(Long productId);
    Optional<BatchEntity> findByBarcode(String barcode);
}
