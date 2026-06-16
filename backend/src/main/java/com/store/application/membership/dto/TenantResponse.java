package com.store.application.membership.dto;

import java.util.List;

public record TenantResponse(
    String id,
    String name,
    String verticalType,
    String primaryColor,
    List<String> features,
    boolean active
) {}
