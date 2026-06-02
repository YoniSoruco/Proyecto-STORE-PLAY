package com.store.domain.sale;

import com.store.domain.product.Product;

public interface SaleRepository {
  Sale save(Sale sale);
  void reduceStock(Product product, int quantity);
}
