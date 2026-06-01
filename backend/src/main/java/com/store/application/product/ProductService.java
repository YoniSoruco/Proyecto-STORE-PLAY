package com.store.application.product;

import com.store.application.product.dto.ProductRequest;
import com.store.application.product.dto.ProductResponse;
import com.store.domain.product.Category;
import com.store.domain.product.Product;
import com.store.domain.product.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductResponse registerProduct(ProductRequest request) {
        Product product = new Product(null, request.name(), request.price(), request.barcode(),
                request.brand(), request.description(), request.costPrice(), request.stock(),
                request.minStock(), request.saleUnit(), request.active(), request.categoryId(), null);
        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    public List<ProductResponse> listProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Optional<ProductResponse> findByBarcode(String barcode) {
        return productRepository.findByBarcode(barcode)
                .map(this::mapToResponse);
    }

    public Optional<ProductResponse> updateProduct(Long id, ProductRequest request) {
        return productRepository.findById(id).map(existing -> {
            Product updated = new Product(id, request.name(), request.price(), request.barcode(),
                    request.brand(), request.description(), request.costPrice(), request.stock(),
                    request.minStock(), request.saleUnit(), request.active(), request.categoryId(), null);
            return mapToResponse(productRepository.save(updated));
        });
    }

    public boolean deleteProduct(Long id) {
        return productRepository.findById(id).map(product -> {
            productRepository.deleteById(id);
            return true;
        }).orElse(false);
    }

    public List<Category> listCategories() {
        return productRepository.findAllCategories();
    }

    public Category createCategory(String name, String description) {
        Category category = new Category(null, name, description);
        return productRepository.saveCategory(category);
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(), product.getName(), product.getPrice(), product.getBarcode(),
                product.getBrand(), product.getDescription(), product.getCostPrice(),
                product.getStock(), product.getMinStock(), product.getSaleUnit(),
                product.isActive(), product.getCategoryId(), product.getCategoryName()
        );
    }
}
