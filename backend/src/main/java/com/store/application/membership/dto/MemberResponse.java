package com.store.application.membership.dto;

import com.store.domain.tenant.UserRole;

public record MemberResponse(
    Long id,
    Long userId,
    String email,
    String fullName,
    UserRole role,
    Long branchId,
    String branchName,
    boolean active,
    String activationToken
) {}
