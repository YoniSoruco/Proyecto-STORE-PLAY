package com.store.infrastructure.web;

import com.store.domain.tenant.TenantContext;
import com.store.infrastructure.db.ProductEntity;
import com.store.infrastructure.db.SpringDataProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/test")
public class TestController {
    private final SpringDataProductRepository productRepository;

    public TestController(SpringDataProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public String test() {
        return "Current tenant: " + TenantContext.getTenant();
    }

    @PostMapping("/products")
    public ProductEntity saveProduct(@RequestBody ProductEntity product) {
        return productRepository.save(product);
    }

    @GetMapping("/products")
    public List<ProductEntity> getProducts() {
        return productRepository.findAll();
    }
}
