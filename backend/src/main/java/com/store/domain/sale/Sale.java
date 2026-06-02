package com.store.domain.sale;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class Sale {

  private Long id;
  private int itemCount;
  private BigDecimal subtotal;
  private BigDecimal tax;
  private BigDecimal total;
  private LocalDateTime createdAt;
  private List<SaleItem> items;

  public Sale() {}

  public Sale(Long id, int itemCount, BigDecimal subtotal, BigDecimal tax, BigDecimal total,
              LocalDateTime createdAt, List<SaleItem> items) {
    this.id = id;
    this.itemCount = itemCount;
    this.subtotal = subtotal;
    this.tax = tax;
    this.total = total;
    this.createdAt = createdAt;
    this.items = items;
  }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public int getItemCount() { return itemCount; }
  public void setItemCount(int itemCount) { this.itemCount = itemCount; }
  public BigDecimal getSubtotal() { return subtotal; }
  public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
  public BigDecimal getTax() { return tax; }
  public void setTax(BigDecimal tax) { this.tax = tax; }
  public BigDecimal getTotal() { return total; }
  public void setTotal(BigDecimal total) { this.total = total; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
  public List<SaleItem> getItems() { return items; }
  public void setItems(List<SaleItem> items) { this.items = items; }
}
