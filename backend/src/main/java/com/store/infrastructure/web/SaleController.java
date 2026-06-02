package com.store.infrastructure.web;

import com.store.application.sale.SaleService;
import com.store.application.sale.dto.SaleRequest;
import com.store.application.sale.dto.SaleResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

  private final SaleService saleService;

  public SaleController(SaleService saleService) {
    this.saleService = saleService;
  }

  @PostMapping
  public ResponseEntity<?> createSale(@RequestBody SaleRequest request) {
    try {
      SaleResponse response = saleService.createSale(request);
      return ResponseEntity.ok(response);
    } catch (IllegalArgumentException | IllegalStateException e) {
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    }
  }

  private record ErrorResponse(String error) {}
}
