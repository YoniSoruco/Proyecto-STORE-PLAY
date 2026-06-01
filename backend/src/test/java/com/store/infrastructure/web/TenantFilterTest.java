package com.store.infrastructure.web;

import com.store.domain.tenant.TenantContext;
import com.store.infrastructure.config.WebConfig;
import com.store.infrastructure.db.SpringDataProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TestController.class)
@Import(WebConfig.class)
class TenantFilterTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SpringDataProductRepository productRepository;

    @Test
    void shouldReturnBadRequestWhenTenantHeaderIsMissing() throws Exception {
        mockMvc.perform(get("/test"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldProceedWhenTenantHeaderIsPresent() throws Exception {
        mockMvc.perform(get("/test")
                .header("X-Tenant-ID", "tenant1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Current tenant: tenant1"));
    }

    @Test
    void shouldProceedWithDifferentTenant() throws Exception {
        mockMvc.perform(get("/test")
                .header("X-Tenant-ID", "acme-corp"))
                .andExpect(status().isOk())
                .andExpect(content().string("Current tenant: acme-corp"));
    }
}
