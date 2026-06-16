package com.store.application.product.dto;

public record SupplierResponse(
    Long id,
    String name,
    String address,
    String phoneNumber,
    boolean active
) {}
