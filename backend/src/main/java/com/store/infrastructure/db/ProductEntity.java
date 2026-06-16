package com.store.infrastructure.db;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
public class ProductEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(name = "cash_price", precision = 19, scale = 4)
    private BigDecimal cashPrice;

    @Column(name = "requires_expiration", nullable = false)
    private boolean requiresExpiration;

    private String brand;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "min_stock")
    private int minStock;

    @Column(name = "sale_unit", nullable = false, length = 5)
    private String saleUnit;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private CategoryEntity category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BatchEntity> batches;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getCashPrice() { return cashPrice; }
    public void setCashPrice(BigDecimal cashPrice) { this.cashPrice = cashPrice; }
    public boolean isRequiresExpiration() { return requiresExpiration; }
    public void setRequiresExpiration(boolean requiresExpiration) { this.requiresExpiration = requiresExpiration; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getMinStock() { return minStock; }
    public void setMinStock(int minStock) { this.minStock = minStock; }
    public String getSaleUnit() { return saleUnit; }
    public void setSaleUnit(String saleUnit) { this.saleUnit = saleUnit; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public CategoryEntity getCategory() { return category; }
    public void setCategory(CategoryEntity category) { this.category = category; }
    public List<BatchEntity> getBatches() { return batches; }
    public void setBatches(List<BatchEntity> batches) { this.batches = batches; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
