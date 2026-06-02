package com.store.application.sale;

import com.store.application.sale.dto.SaleRequest;
import com.store.application.sale.dto.SaleResponse;
import com.store.application.sale.dto.SaleResponse.SaleItemResponse;
import com.store.domain.product.Product;
import com.store.domain.product.ProductRepository;
import com.store.domain.sale.Sale;
import com.store.domain.sale.SaleItem;
import com.store.domain.sale.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SaleService {

  private final SaleRepository saleRepository;
  private final ProductRepository productRepository;

  public SaleService(SaleRepository saleRepository, ProductRepository productRepository) {
    this.saleRepository = saleRepository;
    this.productRepository = productRepository;
  }

  @Transactional
  public SaleResponse createSale(SaleRequest request) {
    List<SaleItem> items = new ArrayList<>();

    for (var reqItem : request.items()) {
      Product product = productRepository.findById(reqItem.productId())
          .orElseThrow(() -> new IllegalArgumentException(
              "Producto no encontrado: " + reqItem.productId()));

      if (product.getStock() < reqItem.quantity()) {
        throw new IllegalStateException(
            "Stock insuficiente para " + product.getName()
                + ": disponible " + product.getStock()
                + ", requerido " + reqItem.quantity());
      }

      SaleItem item = new SaleItem(null, null, product.getId(),
          product.getName(), product.getPrice(), reqItem.quantity());
      items.add(item);

      product.setStock(product.getStock() - reqItem.quantity());
      saleRepository.reduceStock(product, reqItem.quantity());
    }

    Sale sale = new Sale(null, request.itemCount(), request.subtotal(),
        request.tax(), request.total(), LocalDateTime.now(), items);
    Sale saved = saleRepository.save(sale);

    return mapToResponse(saved);
  }

  private SaleResponse mapToResponse(Sale sale) {
    List<SaleItemResponse> itemResponses = sale.getItems().stream()
        .map(item -> new SaleItemResponse(
            item.getProductId(), item.getProductName(),
            item.getUnitPrice(), item.getQuantity()))
        .toList();

    return new SaleResponse(
        sale.getId(), sale.getItemCount(), sale.getSubtotal(),
        sale.getTax(), sale.getTotal(), sale.getCreatedAt(), itemResponses);
  }
}
