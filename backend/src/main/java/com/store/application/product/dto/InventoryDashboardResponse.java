package com.store.application.product.dto;

import java.util.List;

public record InventoryDashboardResponse(
    long totalProducts,
    int lowStockCount,
    int nearExpirationCount,
    int expiredCount,
    List<ProductResponse> lowStockProducts,
    List<BatchResponse> expiringBatches
) {}
