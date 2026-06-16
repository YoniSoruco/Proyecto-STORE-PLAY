package com.store.application.product.dto;

public record SupplierRequest(
    String name,
    String address,
    String phoneNumber,
    boolean active
) {}
