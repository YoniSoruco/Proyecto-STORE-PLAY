package com.store.infrastructure.config;

import liquibase.Liquibase;
import liquibase.exception.LiquibaseException;
import liquibase.integration.spring.SpringLiquibase;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

@Configuration
public class LiquibaseConfig {

    private final List<String> tenants = List.of("tenant1", "tenant2");

    @Bean
    public SpringLiquibase liquibase(DataSource ds) {
        return new SpringLiquibase() {
            @Override
            public void afterPropertiesSet() throws LiquibaseException {
                setDataSource(ds);
                setChangeLog("classpath:/db/changelog/db.changelog-master.xml");

                for (String tenant : tenants) {
                    setDefaultSchema(tenant);
                    try (Connection conn = ds.getConnection()) {
                        createSchema(conn, tenant);
                        Liquibase liquibase = createLiquibase(conn);
                        performUpdate(liquibase);
                    } catch (SQLException e) {
                        throw new LiquibaseException("Migration failed for tenant: " + tenant, e);
                    }
                }
            }

            private void createSchema(Connection conn, String schema) {
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute("CREATE SCHEMA IF NOT EXISTS " + schema);
                } catch (Exception e) {
                    throw new RuntimeException("Failed to create schema: " + schema, e);
                }
            }
        };
    }
}
