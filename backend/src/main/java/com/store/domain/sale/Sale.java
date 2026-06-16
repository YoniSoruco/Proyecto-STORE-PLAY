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
  private BigDecimal roundingAmount; // Diferencia por redondeo en efectivo
  private InvoiceType invoiceType;
  private String invoiceNumber; // Ej: 00001-00000123
  private LocalDateTime createdAt;
  private List<SaleItem> items;
  private List<PaymentMethod> payments;

  public Sale() {}

  public Sale(Long id, int itemCount, BigDecimal subtotal, BigDecimal tax, BigDecimal total,
              BigDecimal roundingAmount, InvoiceType invoiceType, String invoiceNumber, 
              LocalDateTime createdAt, List<SaleItem> items, List<PaymentMethod> payments) {
    this.id = id;
    this.itemCount = itemCount;
    this.subtotal = subtotal;
    this.tax = tax;
    this.total = total;
    this.roundingAmount = roundingAmount;
    this.invoiceType = invoiceType;
    this.invoiceNumber = invoiceNumber;
    this.createdAt = createdAt;
    this.items = items;
    this.payments = payments;
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
  public BigDecimal getRoundingAmount() { return roundingAmount; }
  public void setRoundingAmount(BigDecimal roundingAmount) { this.roundingAmount = roundingAmount; }
  public InvoiceType getInvoiceType() { return invoiceType; }
  public void setInvoiceType(InvoiceType invoiceType) { this.invoiceType = invoiceType; }
  public String getInvoiceNumber() { return invoiceNumber; }
  public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
  public List<SaleItem> getItems() { return items; }
  public void setItems(List<SaleItem> items) { this.items = items; }
  public List<PaymentMethod> getPayments() { return payments; }
  public void setPayments(List<PaymentMethod> payments) { this.payments = payments; }
}
