package com.store.infrastructure.db;

import com.store.domain.tenant.TenantContext;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class TenantIdentifierResolverTest {

    private final TenantIdentifierResolver resolver = new TenantIdentifierResolver();

    @Test
    void shouldReturnCurrentTenantFromContext() {
        TenantContext.runWithTenant("tenant-abc", () -> {
            assertThat(resolver.resolveCurrentTenantIdentifier()).isEqualTo("tenant-abc");
        });
    }

    @Test
    void shouldReturnPublicWhenNoTenantInContext() {
        assertThat(resolver.resolveCurrentTenantIdentifier()).isEqualTo("public");
    }

    @Test
    void validateExistingCurrentSessions() {
        assertThat(resolver.validateExistingCurrentSessions()).isTrue();
    }
}
