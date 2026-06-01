package com.store.infrastructure.db;

import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class MultiTenantConnectionProviderImplTest {

    @Mock
    private DataSource dataSource;

    @Mock
    private Connection connection;

    @Mock
    private java.sql.DatabaseMetaData metaData;

    @Mock
    private PreparedStatement preparedStatement;

    private MultiTenantConnectionProviderImpl provider;

    @BeforeEach
    void setUp() throws SQLException {
        MockitoAnnotations.openMocks(this);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metaData);
        when(metaData.getDatabaseProductName()).thenReturn("PostgreSQL");
        when(connection.prepareStatement(anyString())).thenReturn(preparedStatement);
        provider = new MultiTenantConnectionProviderImpl(dataSource);
    }

    @Test
    void shouldGetAnyConnectionFromDataSource() throws SQLException {
        Connection conn = provider.getAnyConnection();
        assertThat(conn).isSameAs(connection);
        verify(dataSource).getConnection();
    }

    @Test
    void shouldGetConnectionAndSetSearchPath() throws SQLException {
        Connection conn = provider.getConnection("tenant_a");
        
        assertThat(conn).isSameAs(connection);
        verify(connection).prepareStatement("SET search_path TO tenant_a");
        verify(preparedStatement).execute();
    }

    @Test
    void shouldResetSearchPathOnRelease() throws SQLException {
        provider.releaseConnection("tenant_a", connection);
        
        verify(connection).prepareStatement("SET search_path TO public");
        verify(preparedStatement).execute();
        verify(connection).close();
    }

    @Test
    void shouldSupportHibernate6() {
        assertThat(provider).isInstanceOf(org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider.class);
    }
}
