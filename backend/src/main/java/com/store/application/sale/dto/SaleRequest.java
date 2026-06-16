package com.store.application.sale.dto;

import java.math.BigDecimal;
import java.util.List;

public record SaleRequest(
    List<SaleItemRequest> items,
    List<PaymentRequest> payments,
    int itemCount,
    BigDecimal subtotal,
    BigDecimal tax,
    BigDecimal total,
    BigDecimal roundingAmount,
    String invoiceType
) {
  public record SaleItemRequest(
      Long productId,
      String name,
      BigDecimal price,
      int quantity
  ) {}

  public record PaymentRequest(
      String method,
      BigDecimal amount
  ) {}
}
