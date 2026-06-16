package com.store.application.membership.dto;

public record BranchResponse(
    Long id,
    String name,
    String address,
    boolean active
) {}
