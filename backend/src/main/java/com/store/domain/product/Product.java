package com.store.domain.product;

import java.math.BigDecimal;

public class Product {
    private Long id;
    private String name;
    private String brand;
    private String description;
    private BigDecimal price; // Precio de lista / crédito
    private BigDecimal cashPrice; // Precio en efectivo
    private boolean requiresExpiration;
    private int minStock;
    private String saleUnit;
    private boolean active;
    private Long categoryId;
    private String categoryName;
    private int totalStock; // Calculado de los lotes

    public Product() {}

    public Product(Long id, String name, String brand, String description, BigDecimal price,
                   BigDecimal cashPrice, boolean requiresExpiration, int minStock,
                   String saleUnit, boolean active, Long categoryId, String categoryName) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.description = description;
        this.price = price;
        this.cashPrice = cashPrice;
        this.requiresExpiration = requiresExpiration;
        this.minStock = minStock;
        this.saleUnit = saleUnit;
        this.active = active;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getCashPrice() { return cashPrice; }
    public void setCashPrice(BigDecimal cashPrice) { this.cashPrice = cashPrice; }
    public boolean isRequiresExpiration() { return requiresExpiration; }
    public void setRequiresExpiration(boolean requiresExpiration) { this.requiresExpiration = requiresExpiration; }
    public int getMinStock() { return minStock; }
    public void setMinStock(int minStock) { this.minStock = minStock; }
    public String getSaleUnit() { return saleUnit; }
    public void setSaleUnit(String saleUnit) { this.saleUnit = saleUnit; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public int getTotalStock() { return totalStock; }
    public void setTotalStock(int totalStock) { this.totalStock = totalStock; }

    // Campos calculados no guardados (Lógica de negocio para la UI)
    public BigDecimal getPriceWithIva() {
        if (price == null) return BigDecimal.ZERO;
        return price.multiply(new BigDecimal("1.21")); // Ejemplo 21%
    }
}
