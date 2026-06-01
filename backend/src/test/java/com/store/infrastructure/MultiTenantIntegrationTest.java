package com.store.infrastructure;

import com.store.infrastructure.db.ProductEntity;
import com.store.infrastructure.db.SpringDataProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2test")
public class MultiTenantIntegrationTest {

    static PostgreSQLContainer<?> postgres;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        String activeProfiles = System.getProperty("spring.profiles.active", "");
        if (!activeProfiles.contains("h2test")) {
            try {
                postgres = new PostgreSQLContainer<>("postgres:16-alpine")
                        .withInitScript("init-schemas.sql");
                postgres.start();
                registry.add("spring.datasource.url", postgres::getJdbcUrl);
                registry.add("spring.datasource.username", postgres::getUsername);
                registry.add("spring.datasource.password", postgres::getPassword);
            } catch (Exception e) {
                System.err.println("Failed to start PostgreSQL container, falling back to H2 if configured: " + e.getMessage());
            }
        }
    }

    @AfterAll
    static void stopContainer() {
        if (postgres != null) {
            postgres.stop();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldIsolateDataBetweenTenants() throws Exception {
        ProductEntity product1 = new ProductEntity();
        product1.setName("Product Tenant 1");
        product1.setPrice(new BigDecimal("100.0000"));
        product1.setBarcode("T1-B1");

        // Save in tenant1
        mockMvc.perform(post("/test/products")
                .header("X-Tenant-ID", "tenant1")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(product1)))
                .andExpect(status().isOk());

        // Verify found in tenant1
        mockMvc.perform(get("/test/products")
                .header("X-Tenant-ID", "tenant1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Product Tenant 1"));

        // Verify NOT found in tenant2
        mockMvc.perform(get("/test/products")
                .header("X-Tenant-ID", "tenant2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Save another in tenant2
        ProductEntity product2 = new ProductEntity();
        product2.setName("Product Tenant 2");
        product2.setPrice(new BigDecimal("200.0000"));
        product2.setBarcode("T2-B2");

        mockMvc.perform(post("/test/products")
                .header("X-Tenant-ID", "tenant2")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(product2)))
                .andExpect(status().isOk());

        // Verify found in tenant2
        mockMvc.perform(get("/test/products")
                .header("X-Tenant-ID", "tenant2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Product Tenant 2"));
    }
}
