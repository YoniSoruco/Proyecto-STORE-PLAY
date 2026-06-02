package com.store.domain.sale;

import java.math.BigDecimal;

public class SaleItem {

  private Long id;
  private Long saleId;
  private Long productId;
  private String productName;
  private BigDecimal unitPrice;
  private int quantity;

  public SaleItem() {}

  public SaleItem(Long id, Long saleId, Long productId, String productName,
                  BigDecimal unitPrice, int quantity) {
    this.id = id;
    this.saleId = saleId;
    this.productId = productId;
    this.productName = productName;
    this.unitPrice = unitPrice;
    this.quantity = quantity;
  }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public Long getSaleId() { return saleId; }
  public void setSaleId(Long saleId) { this.saleId = saleId; }
  public Long getProductId() { return productId; }
  public void setProductId(Long productId) { this.productId = productId; }
  public String getProductName() { return productName; }
  public void setProductName(String productName) { this.productName = productName; }
  public BigDecimal getUnitPrice() { return unitPrice; }
  public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
  public int getQuantity() { return quantity; }
  public void setQuantity(int quantity) { this.quantity = quantity; }
}
