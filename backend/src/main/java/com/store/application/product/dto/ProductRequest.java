package com.store.application.product.dto;

import java.math.BigDecimal;

public record ProductRequest(
    String name,
    String brand,
    String description,
    BigDecimal price,
    BigDecimal cashPrice,
    boolean requiresExpiration,
    int minStock,
    String saleUnit,
    boolean active,
    Long categoryId
) {}
