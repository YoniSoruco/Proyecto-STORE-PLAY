package com.store.application.security.dto;

import com.store.domain.tenant.UserRole;
import java.util.List;

public record LoginResponse(
    Long userId,
    String email,
    String fullName,
    boolean isSystemAdmin,
    List<TenantAccessDto> availableTenants,
    String token
) {
    public record TenantAccessDto(
        String tenantId, 
        String tenantName, 
        String verticalType, 
        String primaryColor,
        UserRole role,
        Long branchId,
        List<String> features
    ) {}
}
