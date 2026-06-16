package com.store.domain.sale;

import java.math.BigDecimal;

public class PaymentMethod {
    private Long id;
    private Long saleId;
    private String method; // EFECTIVO, TARJETA_DEBITO, TARJETA_CREDITO, TRANSFERENCIA
    private BigDecimal amount;

    public PaymentMethod() {}

    public PaymentMethod(Long id, Long saleId, String method, BigDecimal amount) {
        this.id = id;
        this.saleId = saleId;
        this.method = method;
        this.amount = amount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSaleId() { return saleId; }
    public void setSaleId(Long saleId) { this.saleId = saleId; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
