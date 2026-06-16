package com.store.infrastructure.web;

import com.store.application.product.ProductService;
import com.store.application.product.dto.*;
import com.store.domain.product.Category;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductResponse> registerProduct(@RequestBody ProductRequest request) {
        ProductResponse response = productService.registerProduct(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> listProducts() {
        return ResponseEntity.ok(productService.listProducts());
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ProductResponse> findByBarcode(@PathVariable String barcode) {
        return productService.findByBarcode(barcode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        return productService.updateProduct(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        return productService.deleteProduct(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // Lotes (Batches)
    @GetMapping("/batches")
    public ResponseEntity<List<BatchResponse>> listAllBatches() {
        return ResponseEntity.ok(productService.listAllBatches());
    }

    @PostMapping("/{id}/batches")
    public ResponseEntity<BatchResponse> addBatch(@PathVariable Long id, @RequestBody BatchRequest request) {
        BatchRequest updatedRequest = new BatchRequest(id, request.branchId(), request.supplierId(), 
                request.barcode(), request.stock(), request.costPrice(), request.expirationDate());
        return ResponseEntity.ok(productService.createBatch(updatedRequest));
    }

    @GetMapping("/{id}/batches")
    public ResponseEntity<List<BatchResponse>> listBatches(@PathVariable Long id) {
        return ResponseEntity.ok(productService.listBatches(id));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<InventoryDashboardResponse> getDashboardData() {
        return ResponseEntity.ok(productService.getDashboardData());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> listCategories() {
        return ResponseEntity.ok(productService.listCategories());
    }

    // Proveedores (Suppliers)
    @PostMapping("/suppliers")
    public ResponseEntity<SupplierResponse> addSupplier(@RequestBody SupplierRequest request) {
        return ResponseEntity.ok(productService.registerSupplier(request));
    }

    @GetMapping("/suppliers")
    public ResponseEntity<List<SupplierResponse>> listSuppliers() {
        return ResponseEntity.ok(productService.listSuppliers());
    }

    @DeleteMapping("/suppliers/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        productService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String description = body.getOrDefault("description", "");
        Category category = productService.createCategory(name, description);
        return ResponseEntity.ok(category);
    }
}
