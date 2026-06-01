package com.store.infrastructure.db;

import com.store.domain.product.Category;
import com.store.domain.product.Product;
import com.store.domain.product.ProductRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JpaProductRepository implements ProductRepository {

    private final SpringDataProductRepository springDataProductRepository;
    private final SpringDataCategoryRepository springDataCategoryRepository;

    public JpaProductRepository(SpringDataProductRepository springDataProductRepository,
                                SpringDataCategoryRepository springDataCategoryRepository) {
        this.springDataProductRepository = springDataProductRepository;
        this.springDataCategoryRepository = springDataCategoryRepository;
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
        return springDataProductRepository.findByBarcode(barcode)
                .map(this::mapToDomain);
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

    private ProductEntity mapToEntity(Product product) {
        ProductEntity entity = new ProductEntity();
        entity.setId(product.getId());
        entity.setName(product.getName());
        entity.setPrice(product.getPrice());
        entity.setBarcode(product.getBarcode());
        entity.setBrand(product.getBrand());
        entity.setDescription(product.getDescription());
        entity.setCostPrice(product.getCostPrice());
        entity.setStock(product.getStock());
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
        return new Product(
                entity.getId(),
                entity.getName(),
                entity.getPrice(),
                entity.getBarcode(),
                entity.getBrand(),
                entity.getDescription(),
                entity.getCostPrice(),
                entity.getStock(),
                entity.getMinStock(),
                entity.getSaleUnit(),
                entity.isActive(),
                entity.getCategory() != null ? entity.getCategory().getId() : null,
                entity.getCategory() != null ? entity.getCategory().getName() : null
        );
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
}
