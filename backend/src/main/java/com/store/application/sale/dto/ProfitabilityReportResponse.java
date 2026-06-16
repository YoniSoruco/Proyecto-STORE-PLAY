package com.store.application.sale.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProfitabilityReportResponse(
    BigDecimal totalRevenue,
    BigDecimal totalCost,
    BigDecimal netProfit,
    BigDecimal averageMargin,
    List<ProductProfitDto> topProducts
) {
    public record ProductProfitDto(
        Long productId,
        String productName,
        BigDecimal revenue,
        BigDecimal cost,
        BigDecimal profit,
        BigDecimal margin
    ) {}
}
