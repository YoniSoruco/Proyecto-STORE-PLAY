package com.store.infrastructure.db;

import com.store.domain.tenant.TenantContext;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.stereotype.Component;

/**
 * Hibernate-specific resolver that retrieves the current tenant identifier
 * from the {@link TenantContext}. This allows Hibernate to know which
 * tenant's schema should be used for the current request.
 */
@Component
public class TenantIdentifierResolver implements CurrentTenantIdentifierResolver<String> {

    @Override
    public String resolveCurrentTenantIdentifier() {
        return TenantContext.getTenant();
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }
}
