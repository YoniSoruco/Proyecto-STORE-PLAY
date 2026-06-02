package com.store.application.sale.dto;

import java.math.BigDecimal;
import java.util.List;

public record SaleRequest(
    List<SaleItemRequest> items,
    int itemCount,
    BigDecimal subtotal,
    BigDecimal tax,
    BigDecimal total
) {
  public record SaleItemRequest(
      Long productId,
      String name,
      BigDecimal price,
      int quantity
  ) {}
}
