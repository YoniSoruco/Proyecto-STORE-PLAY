package com.store.infrastructure.config;

import com.store.infrastructure.db.MultiTenantConnectionProviderImpl;
import com.store.infrastructure.db.TenantIdentifierResolver;
import org.hibernate.cfg.AvailableSettings;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class PersistenceConfigTest {

    @Autowired
    private ApplicationContext context;

    @MockBean
    private DataSource dataSource;

    @Autowired
    private HibernatePropertiesCustomizer customizer;

    @Autowired
    private MultiTenantConnectionProviderImpl multiTenantConnectionProvider;

    @Autowired
    private TenantIdentifierResolver tenantIdentifierResolver;

    @Test
    void shouldRegisterHibernatePropertiesCustomizerBean() {
        assertThat(context.containsBean("hibernatePropertiesCustomizer")).isTrue();
    }

    @Test
    void shouldConfigureMultiTenancyProperties() {
        Map<String, Object> hibernateProperties = new HashMap<>();
        customizer.customize(hibernateProperties);

        assertThat(hibernateProperties.get(AvailableSettings.MULTI_TENANT_CONNECTION_PROVIDER))
                .isEqualTo(multiTenantConnectionProvider);
        assertThat(hibernateProperties.get(AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER))
                .isEqualTo(tenantIdentifierResolver);
    }
}
