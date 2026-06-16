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

    // Lotes (Batches)
    Batch saveBatch(Batch batch);
    List<Batch> findAllBatches();
    List<Batch> findBatchesByProductId(Long productId);
    Optional<Batch> findBatchByBarcode(String barcode);
    void deleteBatchById(Long id);

    // Proveedores (Suppliers)
    Supplier saveSupplier(Supplier supplier);
    List<Supplier> findAllSuppliers();
    Optional<Supplier> findSupplierById(Long id);
    void deleteSupplierById(Long id);
}
