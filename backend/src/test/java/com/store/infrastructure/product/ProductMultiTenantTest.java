package com.store.infrastructure.product;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.application.product.dto.ProductRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2test")
public class ProductMultiTenantTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldIsolateProductsBetweenTenants() throws Exception {
        ProductRequest product1 = new ProductRequest("Apple", new BigDecimal("1.5000"), "12345",
            null, null, null, 0, 0, "unit", true, null);
        ProductRequest product2 = new ProductRequest("Banana", new BigDecimal("0.7500"), "67890",
            null, null, null, 0, 0, "unit", true, null);

        mockMvc.perform(post("/api/products")
                .header("X-Tenant-ID", "tenant1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(product1)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/products")
                .header("X-Tenant-ID", "tenant2")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(product2)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/products")
                .header("X-Tenant-ID", "tenant1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Apple"))
                .andExpect(jsonPath("$[0].barcode").value("12345"));

        mockMvc.perform(get("/api/products")
                .header("X-Tenant-ID", "tenant2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Banana"))
                .andExpect(jsonPath("$[0].barcode").value("67890"));
    }
}
