package com.store.domain.tenant;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TenantContextTest {

    @Test
    void shouldBindAndRetrieveTenant() {
        String tenantId = "test-tenant";
        
        TenantContext.runWithTenant(tenantId, () -> {
            assertEquals(tenantId, TenantContext.getTenant());
        });
    }

    @Test
    void shouldReturnDefaultTenantWhenNotSet() {
        assertEquals("public", TenantContext.getTenant());
    }

    @Test
    void shouldClearTenantAfterScopeEnds() {
        String tenantId = "test-tenant";
        
        TenantContext.runWithTenant(tenantId, () -> {
            assertEquals(tenantId, TenantContext.getTenant());
        });
        
        assertEquals("public", TenantContext.getTenant());
    }
}
