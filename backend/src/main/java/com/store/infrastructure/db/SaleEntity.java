package com.store.infrastructure.db;

import com.store.domain.sale.InvoiceType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales")
public class SaleEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "item_count", nullable = false)
  private int itemCount;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal subtotal;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal tax;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal total;

  @Column(name = "rounding_amount", precision = 12, scale = 2)
  private BigDecimal roundingAmount;

  @Enumerated(EnumType.STRING)
  @Column(name = "invoice_type", length = 20)
  private InvoiceType invoiceType;

  @Column(name = "invoice_number", length = 50)
  private String invoiceNumber;

  @Column(name = "cash_session_id")
  private Long cashSessionId;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

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
  public BigDecimal getRoundingAmount() { return roundingAmount; }
  public void setRoundingAmount(BigDecimal roundingAmount) { this.roundingAmount = roundingAmount; }
  public InvoiceType getInvoiceType() { return invoiceType; }
  public void setInvoiceType(InvoiceType invoiceType) { this.invoiceType = invoiceType; }
  public String getInvoiceNumber() { return invoiceNumber; }
  public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
  public Long getCashSessionId() { return cashSessionId; }
  public void setCashSessionId(Long cashSessionId) { this.cashSessionId = cashSessionId; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
