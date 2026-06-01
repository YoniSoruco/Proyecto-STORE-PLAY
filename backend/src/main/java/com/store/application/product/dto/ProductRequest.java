package com.store.application.product.dto;

import java.math.BigDecimal;

public record ProductRequest(
    String name,
    BigDecimal price,
    String barcode,
    String brand,
    String description,
    BigDecimal costPrice,
    int stock,
    int minStock,
    String saleUnit,
    boolean active,
    Long categoryId
) {}
