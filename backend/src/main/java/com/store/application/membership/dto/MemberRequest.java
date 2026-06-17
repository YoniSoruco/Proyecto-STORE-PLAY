package com.store.application.membership.dto;

import com.store.domain.tenant.UserRole;

public record MemberRequest(
    String email,
    String fullName,
    String phoneNumber,
    UserRole role,
    java.util.Set<Long> branchIds
) {}
