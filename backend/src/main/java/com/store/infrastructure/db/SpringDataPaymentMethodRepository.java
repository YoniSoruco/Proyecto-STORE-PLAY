package com.store.infrastructure.db;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpringDataPaymentMethodRepository extends JpaRepository<PaymentMethodEntity, Long> {
    List<PaymentMethodEntity> findBySaleId(Long saleId);
}
