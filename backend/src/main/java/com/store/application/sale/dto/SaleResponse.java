package com.store.application.sale.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SaleResponse(
    Long id,
    int itemCount,
    BigDecimal subtotal,
    BigDecimal tax,
    BigDecimal total,
    BigDecimal roundingAmount,
    String invoiceType,
    String invoiceNumber,
    LocalDateTime createdAt,
    List<SaleItemResponse> items,
    List<PaymentMethodResponse> payments
) {
  public record SaleItemResponse(
      Long productId,
      String productName,
      BigDecimal unitPrice,
      int quantity
  ) {}

  public record PaymentMethodResponse(
      String method,
      BigDecimal amount
  ) {}
}
