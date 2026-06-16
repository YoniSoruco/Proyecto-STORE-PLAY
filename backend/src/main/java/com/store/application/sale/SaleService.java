package com.store.application.sale;

import com.store.application.sale.dto.SaleRequest;
import com.store.application.sale.dto.SaleResponse;
import com.store.application.sale.dto.SaleResponse.SaleItemResponse;
import com.store.application.security.SecurityContextService;
import com.store.domain.product.Batch;
import com.store.domain.product.Product;
import com.store.domain.product.ProductRepository;
import com.store.domain.sale.*;
import com.store.infrastructure.db.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SaleService {

  private final SaleRepository saleRepository;
  private final SpringDataSaleRepository saleRepo;
  private final ProductRepository productRepository;
  private final SecurityContextService securityContext;
  private final SpringDataCashSessionRepository sessionRepository;

  public SaleService(SaleRepository saleRepository, 
                     SpringDataSaleRepository saleRepo,
                     ProductRepository productRepository, 
                     SecurityContextService securityContext,
                     SpringDataCashSessionRepository sessionRepository) {
    this.saleRepository = saleRepository;
    this.saleRepo = saleRepo;
    this.productRepository = productRepository;
    this.securityContext = securityContext;
    this.sessionRepository = sessionRepository;
  }

  @Transactional
  public SaleResponse createSale(SaleRequest request) {
    // Buscar sesión de caja activa para el usuario actual
    Long currentUserId = securityContext.getCurrentUserId();
    CashSessionEntity session = sessionRepository.findFirstByBranchIdAndUserIdAndOpenTrueOrderByOpenedAtDesc(
            securityContext.getCurrentBranchId(), currentUserId)
            .orElseThrow(() -> new IllegalStateException("Debe abrir caja antes de realizar una venta"));

    List<SaleItem> items = new ArrayList<>();

    for (var reqItem : request.items()) {
      Product product = productRepository.findById(reqItem.productId())
          .orElseThrow(() -> new IllegalArgumentException(
              "Producto no encontrado: " + reqItem.productId()));

      if (product.getTotalStock() < reqItem.quantity()) {
        throw new IllegalStateException(
            "Stock insuficiente para " + product.getName()
                + ": disponible " + product.getTotalStock()
                + ", requerido " + reqItem.quantity());
      }

      // Reducir stock de los lotes (FIFO/FEFO)
      reduceStockFromBatches(product.getId(), reqItem.quantity());

      SaleItem item = new SaleItem(null, null, product.getId(),
          product.getName(), reqItem.price(), reqItem.quantity());
      items.add(item);
    }

    InvoiceType invoiceType = InvoiceType.valueOf(request.invoiceType());
    String invoiceNumber = generateMockInvoiceNumber(invoiceType);

    Sale sale = new Sale(null, request.itemCount(), request.subtotal(),
        request.tax(), request.total(), request.roundingAmount(), 
        invoiceType, invoiceNumber,
        LocalDateTime.now(), items, 
        request.payments().stream().map(p -> new PaymentMethod(null, null, p.method(), p.amount())).toList());
    
    // Vincular sesión de caja
    Sale saved = saleRepository.save(sale);
    updateSaleWithSession(saved.getId(), session.getId());

    return mapToResponse(saved);
  }

  private void updateSaleWithSession(Long saleId, Long sessionId) {
      SaleEntity entity = saleRepo.findById(saleId).orElseThrow();
      entity.setCashSessionId(sessionId);
      saleRepo.save(entity);
  }

  @Transactional(readOnly = true)
  public List<SaleResponse> listSales() {
    return saleRepository.findAll().stream()
        .map(this::mapToResponse)
        .sorted(Comparator.comparing(SaleResponse::createdAt).reversed())
        .toList();
  }

  private String generateMockInvoiceNumber(InvoiceType type) {
    String prefix = "0001";
    long random = (long) (Math.random() * 1000000);
    return prefix + "-" + String.format("%08d", random);
  }

  private void reduceStockFromBatches(Long productId, int quantityToReduce) {
    Long currentBranchId = securityContext.getCurrentBranchId();
    List<Batch> batches = productRepository.findBatchesByProductId(productId).stream()
        .filter(b -> b.getBranchId().equals(currentBranchId) && b.getStock() > 0)
        .sorted(Comparator.comparing((Batch b) -> b.getExpirationDate() == null ? LocalDateTime.MAX : b.getExpirationDate())
            .thenComparing(Batch::getAdmissionDate))
        .toList();

    int remaining = quantityToReduce;
    for (Batch batch : batches) {
      if (remaining <= 0) break;

      int toTake = Math.min(batch.getStock(), remaining);
      batch.setStock(batch.getStock() - toTake);
      productRepository.saveBatch(batch);
      remaining -= toTake;
    }

    if (remaining > 0) {
      throw new IllegalStateException("Error al reducir stock: inconsistencia detectada.");
    }
  }

  private SaleResponse mapToResponse(Sale sale) {
    List<SaleItemResponse> itemResponses = sale.getItems().stream()
        .map(item -> new SaleItemResponse(
            item.getProductId(), item.getProductName(),
            item.getUnitPrice(), item.getQuantity()))
        .toList();

    List<SaleResponse.PaymentMethodResponse> paymentResponses = sale.getPayments().stream()
        .map(p -> new SaleResponse.PaymentMethodResponse(p.getMethod(), p.getAmount()))
        .toList();

    return new SaleResponse(
        sale.getId(), sale.getItemCount(), sale.getSubtotal(),
        sale.getTax(), sale.getTotal(), sale.getRoundingAmount(),
        sale.getInvoiceType().name(), sale.getInvoiceNumber(),
        sale.getCreatedAt(), itemResponses, paymentResponses);
  }
}
