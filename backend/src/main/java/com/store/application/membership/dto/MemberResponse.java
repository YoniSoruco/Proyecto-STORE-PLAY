package com.store.application.membership.dto;

import com.store.domain.tenant.UserRole;

public record MemberResponse(
    Long id,
    Long userId,
    String email,
    String fullName,
    String phoneNumber,
    UserRole role,
    java.util.Set<Long> branchIds,
    java.util.Set<String> features,
    boolean active,
    String activationToken
) {}
