package com.store.application.product.dto;

import java.math.BigDecimal;

public record ProductResponse(
    Long id,
    String name,
    String brand,
    String description,
    BigDecimal price,
    BigDecimal priceWithIva,
    BigDecimal cashPrice,
    boolean requiresExpiration,
    int totalStock,
    int minStock,
    String saleUnit,
    boolean active,
    Long categoryId,
    String categoryName
) {}
