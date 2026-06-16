package com.store.application.membership.dto;

public record BranchRequest(
    String name,
    String address,
    boolean active
) {}
