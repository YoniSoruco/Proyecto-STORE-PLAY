package com.store.application.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BatchResponse(
    Long id,
    Long productId,
    Long branchId,
    Long supplierId,
    String supplierName,
    String barcode,
    int stock,
    BigDecimal costPrice,
    LocalDateTime admissionDate,
    LocalDateTime expirationDate,
    boolean expired
) {}
