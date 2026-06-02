package com.store.infrastructure.db;

import com.store.domain.product.Product;
import com.store.domain.sale.Sale;
import com.store.domain.sale.SaleItem;
import com.store.domain.sale.SaleRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JpaSaleRepository implements SaleRepository {

  private final SpringDataSaleRepository saleRepo;
  private final SpringDataSaleItemRepository itemRepo;
  private final SpringDataProductRepository productRepo;

  public JpaSaleRepository(SpringDataSaleRepository saleRepo,
                           SpringDataSaleItemRepository itemRepo,
                           SpringDataProductRepository productRepo) {
    this.saleRepo = saleRepo;
    this.itemRepo = itemRepo;
    this.productRepo = productRepo;
  }

  @Override
  public Sale save(Sale sale) {
    SaleEntity entity = new SaleEntity();
    entity.setItemCount(sale.getItemCount());
    entity.setSubtotal(sale.getSubtotal());
    entity.setTax(sale.getTax());
    entity.setTotal(sale.getTotal());
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

    saved.setId(saved.getId());
    sale.setId(saved.getId());
    sale.setItems(savedItems);
    return sale;
  }

  @Override
  public void reduceStock(Product product, int quantity) {
    productRepo.findById(product.getId()).ifPresent(entity -> {
      entity.setStock(product.getStock());
      productRepo.save(entity);
    });
  }

  private SaleItem mapItemToDomain(SaleItemEntity entity) {
    return new SaleItem(entity.getId(), entity.getSaleId(), entity.getProductId(),
        entity.getProductName(), entity.getUnitPrice(), entity.getQuantity());
  }
}
