package com.store.application.sale.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CashSessionResponse(
    Long id,
    Long branchId,
    Long userId,
    LocalDateTime openedAt,
    LocalDateTime closedAt,
    BigDecimal initialAmount,
    BigDecimal finalAmountExpected,
    BigDecimal finalAmountReal,
    boolean open
) {}
