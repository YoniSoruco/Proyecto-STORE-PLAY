package com.store.infrastructure.db;

import com.store.domain.product.Batch;
import com.store.domain.product.Category;
import com.store.domain.product.Product;
import com.store.domain.product.ProductRepository;
import com.store.domain.product.Supplier;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JpaProductRepository implements ProductRepository {

    private final SpringDataProductRepository springDataProductRepository;
    private final SpringDataCategoryRepository springDataCategoryRepository;
    private final SpringDataBatchRepository springDataBatchRepository;
    private final SpringDataSupplierRepository springDataSupplierRepository;

    public JpaProductRepository(SpringDataProductRepository springDataProductRepository,
                                SpringDataCategoryRepository springDataCategoryRepository,
                                SpringDataBatchRepository springDataBatchRepository,
                                SpringDataSupplierRepository springDataSupplierRepository) {
        this.springDataProductRepository = springDataProductRepository;
        this.springDataCategoryRepository = springDataCategoryRepository;
        this.springDataBatchRepository = springDataBatchRepository;
        this.springDataSupplierRepository = springDataSupplierRepository;
    }

    @Override
    public Product save(Product product) {
        ProductEntity entity = mapToEntity(product);
        ProductEntity savedEntity = springDataProductRepository.save(entity);
        return mapToDomain(savedEntity);
    }

    @Override
    public Optional<Product> findById(Long id) {
        return springDataProductRepository.findById(id)
                .map(this::mapToDomain);
    }

    @Override
    public Optional<Product> findByBarcode(String barcode) {
        return springDataBatchRepository.findByBarcode(barcode)
                .map(batchEntity -> mapToDomain(batchEntity.getProduct()));
    }

    @Override
    public List<Product> findAll() {
        return springDataProductRepository.findAll()
                .stream()
                .map(this::mapToDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        springDataProductRepository.deleteById(id);
    }

    @Override
    public List<Category> findAllCategories() {
        return springDataCategoryRepository.findAll()
                .stream()
                .map(this::mapCategoryToDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Category> findCategoryById(Long id) {
        return springDataCategoryRepository.findById(id)
                .map(this::mapCategoryToDomain);
    }

    @Override
    public Category saveCategory(Category category) {
        CategoryEntity entity = mapCategoryToEntity(category);
        CategoryEntity saved = springDataCategoryRepository.save(entity);
        return mapCategoryToDomain(saved);
    }

    @Override
    public Batch saveBatch(Batch batch) {
        BatchEntity entity = mapBatchToEntity(batch);
        BatchEntity saved = springDataBatchRepository.save(entity);
        return mapBatchToDomain(saved);
    }

    @Override
    public List<Batch> findAllBatches() {
        return springDataBatchRepository.findAll()
                .stream()
                .map(this::mapBatchToDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Batch> findBatchesByProductId(Long productId) {
        return springDataBatchRepository.findByProduct_Id(productId)
                .stream()
                .map(this::mapBatchToDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Batch> findBatchByBarcode(String barcode) {
        return springDataBatchRepository.findByBarcode(barcode)
                .map(this::mapBatchToDomain);
    }

    @Override
    public void deleteBatchById(Long id) {
        springDataBatchRepository.deleteById(id);
    }

    @Override
    public Supplier saveSupplier(Supplier supplier) {
        SupplierEntity entity = mapSupplierToEntity(supplier);
        SupplierEntity saved = springDataSupplierRepository.save(entity);
        return mapSupplierToDomain(saved);
    }

    @Override
    public List<Supplier> findAllSuppliers() {
        return springDataSupplierRepository.findAll().stream()
                .map(this::mapSupplierToDomain).collect(Collectors.toList());
    }

    @Override
    public Optional<Supplier> findSupplierById(Long id) {
        return springDataSupplierRepository.findById(id).map(this::mapSupplierToDomain);
    }

    @Override
    public void deleteSupplierById(Long id) {
        springDataSupplierRepository.deleteById(id);
    }

    private ProductEntity mapToEntity(Product product) {
        ProductEntity entity = new ProductEntity();
        entity.setId(product.getId());
        entity.setName(product.getName());
        entity.setPrice(product.getPrice());
        entity.setCashPrice(product.getCashPrice());
        entity.setRequiresExpiration(product.isRequiresExpiration());
        entity.setBrand(product.getBrand());
        entity.setDescription(product.getDescription());
        entity.setMinStock(product.getMinStock());
        entity.setSaleUnit(product.getSaleUnit());
        entity.setActive(product.isActive());
        if (product.getCategoryId() != null) {
            springDataCategoryRepository.findById(product.getCategoryId())
                .ifPresent(entity::setCategory);
        }
        return entity;
    }

    private Product mapToDomain(ProductEntity entity) {
        Product product = new Product(
                entity.getId(),
                entity.getName(),
                entity.getBrand(),
                entity.getDescription(),
                entity.getPrice(),
                entity.getCashPrice(),
                entity.isRequiresExpiration(),
                entity.getMinStock(),
                entity.getSaleUnit(),
                entity.isActive(),
                entity.getCategory() != null ? entity.getCategory().getId() : null,
                entity.getCategory() != null ? entity.getCategory().getName() : null
        );
        
        // Calcular total stock
        if (entity.getBatches() != null) {
            int totalStock = entity.getBatches().stream().mapToInt(BatchEntity::getStock).sum();
            product.setTotalStock(totalStock);
        }
        
        return product;
    }

    private Batch mapBatchToDomain(BatchEntity entity) {
        return new Batch(
                entity.getId(),
                entity.getProductId(),
                entity.getBranchId(),
                entity.getSupplierId(),
                entity.getBarcode(),
                entity.getStock(),
                entity.getCostPrice(),
                entity.getAdmissionDate(),
                entity.getExpirationDate()
        );
    }

    private BatchEntity mapBatchToEntity(Batch batch) {
        BatchEntity entity = new BatchEntity();
        entity.setId(batch.getId());
        entity.setBranchId(batch.getBranchId());
        entity.setSupplierId(batch.getSupplierId());
        entity.setBarcode(batch.getBarcode());
        entity.setStock(batch.getStock());
        entity.setCostPrice(batch.getCostPrice());
        entity.setAdmissionDate(batch.getAdmissionDate());
        entity.setExpirationDate(batch.getExpirationDate());
        if (batch.getProductId() != null) {
            springDataProductRepository.findById(batch.getProductId())
                .ifPresent(entity::setProduct);
        }
        return entity;
    }

    private Category mapCategoryToDomain(CategoryEntity entity) {
        return new Category(entity.getId(), entity.getName(), entity.getDescription());
    }

    private CategoryEntity mapCategoryToEntity(Category category) {
        CategoryEntity entity = new CategoryEntity();
        entity.setId(category.getId());
        entity.setName(category.getName());
        entity.setDescription(category.getDescription());
        return entity;
    }

    private Supplier mapSupplierToDomain(SupplierEntity entity) {
        return new Supplier(entity.getId(), entity.getName(), entity.getAddress(), 
                entity.getPhoneNumber(), entity.isActive());
    }

    private SupplierEntity mapSupplierToEntity(Supplier supplier) {
        SupplierEntity entity = new SupplierEntity();
        entity.setId(supplier.getId());
        entity.setName(supplier.getName());
        entity.setAddress(supplier.getAddress());
        entity.setPhoneNumber(supplier.getPhoneNumber());
        entity.setActive(supplier.isActive());
        return entity;
    }
}
