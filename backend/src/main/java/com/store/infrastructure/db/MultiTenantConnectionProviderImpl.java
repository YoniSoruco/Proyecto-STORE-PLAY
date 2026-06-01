package com.store.infrastructure.db;

import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Component
public class MultiTenantConnectionProviderImpl implements MultiTenantConnectionProvider<Object> {

    private final DataSource dataSource;

    public MultiTenantConnectionProviderImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public Connection getAnyConnection() throws SQLException {
        return dataSource.getConnection();
    }

    @Override
    public void releaseAnyConnection(Connection connection) throws SQLException {
        connection.close();
    }

    @Override
    public Connection getConnection(Object tenantIdentifier) throws SQLException {
        String tenantId = (String) tenantIdentifier;
        Connection connection = getAnyConnection();
        try {
            String dbName = connection.getMetaData().getDatabaseProductName();
            String sql = dbName.equalsIgnoreCase("H2") ? "SET SCHEMA " + tenantId : "SET search_path TO " + tenantId;
            try (var statement = connection.prepareStatement(sql)) {
                statement.execute();
            }
        } catch (SQLException e) {
            connection.close();
            throw e;
        }
        return connection;
    }

    @Override
    public void releaseConnection(Object tenantIdentifier, Connection connection) throws SQLException {
        try {
            String dbName = connection.getMetaData().getDatabaseProductName();
            String sql = dbName.equalsIgnoreCase("H2") ? "SET SCHEMA PUBLIC" : "SET search_path TO public";
            try (var statement = connection.prepareStatement(sql)) {
                statement.execute();
            }
        } finally {
            connection.close();
        }
    }

    @Override
    public boolean supportsAggressiveRelease() {
        return false;
    }

    @Override
    public boolean isUnwrappableAs(Class<?> unwrapType) {
        return false;
    }

    @Override
    public <T> T unwrap(Class<T> unwrapType) {
        return null;
    }
}
