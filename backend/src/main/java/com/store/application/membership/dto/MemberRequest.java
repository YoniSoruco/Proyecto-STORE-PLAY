package com.store.application.membership.dto;

import com.store.domain.tenant.UserRole;

public record MemberRequest(
    String email,
    String fullName, // Opcional, por si queremos crearlo si no existe
    UserRole role,
    Long branchId
) {}
