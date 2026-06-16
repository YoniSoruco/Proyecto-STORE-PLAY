package com.store.infrastructure.db;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "payment_methods")
public class PaymentMethodEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "sale_id", nullable = false)
  private Long saleId;

  @Column(nullable = false)
  private String method;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal amount;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public Long getSaleId() { return saleId; }
  public void setSaleId(Long saleId) { this.saleId = saleId; }
  public String getMethod() { return method; }
  public void setMethod(String method) { this.method = method; }
  public BigDecimal getAmount() { return amount; }
  public void setAmount(BigDecimal amount) { this.amount = amount; }
}
