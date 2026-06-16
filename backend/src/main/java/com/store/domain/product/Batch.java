package com.store.domain.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class Batch {
    private Long id;
    private Long productId;
    private Long branchId;
    private Long supplierId;
    private String barcode;
    private int stock;
    private BigDecimal costPrice;
    private LocalDateTime admissionDate;
    private LocalDateTime expirationDate;
    private Map<String, Object> metadata;

    public Batch() {
        this.metadata = new HashMap<>();
    }

    public Batch(Long id, Long productId, Long branchId, Long supplierId, String barcode, int stock, BigDecimal costPrice,
                 LocalDateTime admissionDate, LocalDateTime expirationDate) {
        this(id, productId, branchId, supplierId, barcode, stock, costPrice, admissionDate, expirationDate, new HashMap<>());
    }

    public Batch(Long id, Long productId, Long branchId, Long supplierId, String barcode, int stock, BigDecimal costPrice,
                 LocalDateTime admissionDate, LocalDateTime expirationDate, Map<String, Object> metadata) {
        this.id = id;
        this.productId = productId;
        this.branchId = branchId;
        this.supplierId = supplierId;
        this.barcode = barcode;
        this.stock = stock;
        this.costPrice = costPrice;
        this.admissionDate = admissionDate;
        this.expirationDate = expirationDate;
        this.metadata = metadata != null ? metadata : new HashMap<>();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public BigDecimal getCostPrice() { return costPrice; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }
    public LocalDateTime getAdmissionDate() { return admissionDate; }
    public void setAdmissionDate(LocalDateTime admissionDate) { this.admissionDate = admissionDate; }
    public LocalDateTime getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDateTime expirationDate) { this.expirationDate = expirationDate; }
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

    public boolean isExpired() {
        return expirationDate != null && expirationDate.isBefore(LocalDateTime.now());
    }
}
