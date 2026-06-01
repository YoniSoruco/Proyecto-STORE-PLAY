package com.store.infrastructure.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.ApplicationContext;
import liquibase.integration.spring.SpringLiquibase;

import javax.sql.DataSource;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("test")
public class LiquibaseConfigTest {

    @Autowired
    private ApplicationContext context;

    @MockBean
    private DataSource dataSource;

    @Test
    public void shouldInitializeLiquibaseForEachTenant() {
        // This test will fail because LiquibaseConfig doesn't exist yet
        Map<String, SpringLiquibase> beans = context.getBeansOfType(SpringLiquibase.class);
        
        // We expect at least two tenants for now as hardcoded in our logic
        assertThat(beans).containsKey("liquibaseTenant1");
        assertThat(beans).containsKey("liquibaseTenant2");
    }
}
