package com.store.domain.tenant;

/**
 * Utility to manage the ScopedValue for the current tenant.
 * Uses Java 21 ScopedValue for efficient and safe tenant propagation.
 */
public class TenantContext {
    private static final ScopedValue<String> CURRENT_TENANT = ScopedValue.newInstance();

    private TenantContext() {
        // Private constructor to prevent instantiation
    }

    /**
     * Executes the given action within the context of the specified tenant.
     * @param tenant The tenant identifier to bind.
     * @param action The action to execute.
     */
    public static void runWithTenant(String tenant, Runnable action) {
        ScopedValue.where(CURRENT_TENANT, tenant).run(action);
    }

    /**
     * Retrieves the current tenant identifier from the scoped context.
     * @return The current tenant identifier, or "public" if none is set.
     */
    public static String getTenant() {
        return CURRENT_TENANT.orElse("public");
    }
}
