package com.store.domain.product;

import java.math.BigDecimal;

public class Product {
    private Long id;
    private String name;
    private BigDecimal price;
    private String barcode;
    private String brand;
    private String description;
    private BigDecimal costPrice;
    private int stock;
    private int minStock;
    private String saleUnit;
    private boolean active;
    private Long categoryId;
    private String categoryName;

    public Product() {}

    public Product(Long id, String name, BigDecimal price, String barcode, String brand,
                   String description, BigDecimal costPrice, int stock, int minStock,
                   String saleUnit, boolean active, Long categoryId, String categoryName) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.barcode = barcode;
        this.brand = brand;
        this.description = description;
        this.costPrice = costPrice;
        this.stock = stock;
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
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getCostPrice() { return costPrice; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
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
}
