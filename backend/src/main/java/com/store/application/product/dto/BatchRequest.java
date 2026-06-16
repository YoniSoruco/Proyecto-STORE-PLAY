package com.store.application.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BatchRequest(
    Long productId,
    Long branchId,
    Long supplierId,
    String barcode,
    int stock,
    BigDecimal costPrice,
    LocalDateTime expirationDate
) {}
