package com.store.infrastructure.db;

import com.store.domain.sale.PaymentMethod;
import com.store.domain.sale.Sale;
import com.store.domain.sale.SaleItem;
import com.store.domain.sale.SaleRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class JpaSaleRepository implements SaleRepository {

  private final SpringDataSaleRepository saleRepo;
  private final SpringDataSaleItemRepository itemRepo;
  private final SpringDataPaymentMethodRepository paymentRepo;

  public JpaSaleRepository(SpringDataSaleRepository saleRepo,
                           SpringDataSaleItemRepository itemRepo,
                           SpringDataPaymentMethodRepository paymentRepo) {
    this.saleRepo = saleRepo;
    this.itemRepo = itemRepo;
    this.paymentRepo = paymentRepo;
  }

  @Override
  public Sale save(Sale sale) {
    SaleEntity entity = new SaleEntity();
    entity.setItemCount(sale.getItemCount());
    entity.setSubtotal(sale.getSubtotal());
    entity.setTax(sale.getTax());
    entity.setTotal(sale.getTotal());
    entity.setRoundingAmount(sale.getRoundingAmount());
    entity.setInvoiceType(sale.getInvoiceType());
    entity.setInvoiceNumber(sale.getInvoiceNumber());
    entity.setCreatedAt(sale.getCreatedAt());
    SaleEntity saved = saleRepo.save(entity);

    List<SaleItem> savedItems = sale.getItems().stream()
        .map(item -> {
          SaleItemEntity ie = new SaleItemEntity();
          ie.setSaleId(saved.getId());
          ie.setProductId(item.getProductId());
          ie.setProductName(item.getProductName());
          ie.setUnitPrice(item.getUnitPrice());
          ie.setQuantity(item.getQuantity());
          SaleItemEntity savedItem = itemRepo.save(ie);
          return mapItemToDomain(savedItem);
        })
        .toList();

    List<PaymentMethod> savedPayments = sale.getPayments().stream()
        .map(payment -> {
          PaymentMethodEntity pe = new PaymentMethodEntity();
          pe.setSaleId(saved.getId());
          pe.setMethod(payment.getMethod());
          pe.setAmount(payment.getAmount());
          PaymentMethodEntity savedPayment = paymentRepo.save(pe);
          return mapPaymentToDomain(savedPayment);
        })
        .toList();

    sale.setId(saved.getId());
    sale.setItems(savedItems);
    sale.setPayments(savedPayments);
    return sale;
  }

  @Override
  public List<Sale> findAll() {
    return saleRepo.findAll().stream()
        .map(this::mapToDomain)
        .toList();
  }

  @Override
  public Optional<Sale> findById(Long id) {
    return saleRepo.findById(id).map(this::mapToDomain);
  }

  private Sale mapToDomain(SaleEntity entity) {
    List<SaleItem> items = itemRepo.findBySaleId(entity.getId()).stream()
        .map(this::mapItemToDomain)
        .toList();
    List<PaymentMethod> payments = paymentRepo.findBySaleId(entity.getId()).stream()
        .map(this::mapPaymentToDomain)
        .toList();

    return new Sale(
        entity.getId(), entity.getItemCount(), entity.getSubtotal(),
        entity.getTax(), entity.getTotal(), entity.getRoundingAmount(),
        entity.getInvoiceType(), entity.getInvoiceNumber(),
        entity.getCreatedAt(), items, payments
    );
  }

  private SaleItem mapItemToDomain(SaleItemEntity entity) {
    return new SaleItem(entity.getId(), entity.getSaleId(), entity.getProductId(),
        entity.getProductName(), entity.getUnitPrice(), entity.getQuantity());
  }

  private PaymentMethod mapPaymentToDomain(PaymentMethodEntity entity) {
    return new PaymentMethod(entity.getId(), entity.getSaleId(), 
        entity.getMethod(), entity.getAmount());
  }
}
