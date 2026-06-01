package com.store.domain.product;

import java.util.List;
import java.util.Optional;

public interface ProductRepository {
    Product save(Product product);
    List<Product> findAll();
    Optional<Product> findById(Long id);
    Optional<Product> findByBarcode(String barcode);
    void deleteById(Long id);
    List<Category> findAllCategories();
    Optional<Category> findCategoryById(Long id);
    Category saveCategory(Category category);
}
