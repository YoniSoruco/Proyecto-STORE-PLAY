package com.store.domain.sale;

import java.util.List;
import java.util.Optional;

public interface SaleRepository {
  Sale save(Sale sale);
  List<Sale> findAll();
  Optional<Sale> findById(Long id);
}
