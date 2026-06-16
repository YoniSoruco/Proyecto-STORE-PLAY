package com.store.application.sale;

import com.store.application.sale.dto.ProfitabilityReportResponse;
import com.store.domain.product.Batch;
import com.store.domain.product.ProductRepository;
import com.store.domain.sale.Sale;
import com.store.domain.sale.SaleItem;
import com.store.domain.sale.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public ReportService(SaleRepository saleRepository, ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public ProfitabilityReportResponse getProfitabilityReport() {
        List<Sale> allSales = saleRepository.findAll();
        
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        Map<Long, ProfitabilityReportResponse.ProductProfitDto> productStats = new HashMap<>();

        for (Sale sale : allSales) {
            // El revenue es el total de la venta menos el redondeo (lo que realmente cobramos)
            totalRevenue = totalRevenue.add(sale.getTotal().subtract(sale.getRoundingAmount()));

            for (SaleItem item : sale.getItems()) {
                // Para calcular el costo, necesitamos saber el costo de los lotes usados.
                // Como actualmente no guardamos qué lote específico se usó en cada SaleItem (FIFO manual),
                // vamos a usar el costo promedio actual de los lotes del producto como aproximación,
                // o el costo del último lote ingresado.
                // TODO: En una fase avanzada, guardar mapping SaleItem <-> Batch
                
                BigDecimal unitCost = getEstimatedUnitCost(item.getProductId());
                BigDecimal itemTotalCost = unitCost.multiply(BigDecimal.valueOf(item.getQuantity()));
                totalCost = totalCost.add(itemTotalCost);

                updateProductStats(productStats, item, itemTotalCost);
            }
        }

        BigDecimal netProfit = totalRevenue.subtract(totalCost);
        BigDecimal averageMargin = totalRevenue.compareTo(BigDecimal.ZERO) > 0 
            ? netProfit.divide(totalRevenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;

        List<ProfitabilityReportResponse.ProductProfitDto> topProducts = productStats.values().stream()
                .sorted(Comparator.comparing(ProfitabilityReportResponse.ProductProfitDto::profit).reversed())
                .limit(10)
                .toList();

        return new ProfitabilityReportResponse(totalRevenue, totalCost, netProfit, averageMargin, topProducts);
    }

    private BigDecimal getEstimatedUnitCost(Long productId) {
        return productRepository.findBatchesByProductId(productId).stream()
                .filter(b -> b.getStock() >= 0)
                .map(Batch::getCostPrice)
                .filter(Objects::nonNull)
                .findFirst() // Usamos el costo del primer lote encontrado como proxy (simplificado)
                .orElse(BigDecimal.ZERO);
    }

    private void updateProductStats(Map<Long, ProfitabilityReportResponse.ProductProfitDto> stats, SaleItem item, BigDecimal cost) {
        ProfitabilityReportResponse.ProductProfitDto existing = stats.get(item.getProductId());
        
        BigDecimal revenue = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        BigDecimal profit = revenue.subtract(cost);
        
        if (existing == null) {
            stats.put(item.getProductId(), new ProfitabilityReportResponse.ProductProfitDto(
                item.getProductId(), item.getProductName(), revenue, cost, profit, 
                revenue.compareTo(BigDecimal.ZERO) > 0 ? profit.divide(revenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)) : BigDecimal.ZERO
            ));
        } else {
            BigDecimal newRevenue = existing.revenue().add(revenue);
            BigDecimal newCost = existing.cost().add(cost);
            BigDecimal newProfit = newRevenue.subtract(newCost);
            stats.put(item.getProductId(), new ProfitabilityReportResponse.ProductProfitDto(
                item.getProductId(), item.getProductName(), newRevenue, newCost, newProfit,
                newRevenue.compareTo(BigDecimal.ZERO) > 0 ? newProfit.divide(newRevenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)) : BigDecimal.ZERO
            ));
        }
    }
}
