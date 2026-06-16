package com.store.infrastructure.db;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "batches")
public class BatchEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(nullable = false, unique = true)
    private String barcode;

    @Column(nullable = false)
    private int stock;

    @Column(name = "cost_price", precision = 19, scale = 4)
    private BigDecimal costPrice;

    @Column(name = "admission_date", nullable = false)
    private LocalDateTime admissionDate;

    @Column(name = "expiration_date")
    private LocalDateTime expirationDate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ProductEntity getProduct() { return product; }
    public Long getProductId() { return product != null ? product.getId() : null; }
    public void setProduct(ProductEntity product) { this.product = product; }
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
}
