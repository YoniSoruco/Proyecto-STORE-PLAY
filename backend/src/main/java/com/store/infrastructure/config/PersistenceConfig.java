package com.store.infrastructure.config;

import com.store.infrastructure.db.MultiTenantConnectionProviderImpl;
import com.store.infrastructure.db.TenantIdentifierResolver;
import org.hibernate.cfg.AvailableSettings;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for persistence related beans.
 * Configures multi-tenancy support for Hibernate by registering
 * a {@link HibernatePropertiesCustomizer}.
 */
@Configuration
public class PersistenceConfig {

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer(
            MultiTenantConnectionProviderImpl multiTenantConnectionProvider,
            TenantIdentifierResolver tenantIdentifierResolver) {
        return hibernateProperties -> {
            hibernateProperties.put(AvailableSettings.MULTI_TENANT_CONNECTION_PROVIDER, multiTenantConnectionProvider);
            hibernateProperties.put(AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER, tenantIdentifierResolver);
        };
    }
}
