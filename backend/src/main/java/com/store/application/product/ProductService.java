package com.store.application.product;

import com.store.application.product.dto.*;
import com.store.application.security.SecurityContextService;
import com.store.domain.product.Batch;
import com.store.domain.product.Category;
import com.store.domain.product.Product;
import com.store.domain.product.ProductRepository;
import com.store.domain.product.Supplier;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final SecurityContextService securityContext;

    public ProductService(ProductRepository productRepository, SecurityContextService securityContext) {
        this.productRepository = productRepository;
        this.securityContext = securityContext;
    }

    public ProductResponse registerProduct(ProductRequest request) {
        Product product = new Product(null, request.name(), request.brand(), request.description(),
                request.price(), request.cashPrice(), request.requiresExpiration(),
                request.minStock(), request.saleUnit(), request.active(), request.categoryId(), null);
        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    public List<ProductResponse> listProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Optional<ProductResponse> findByBarcode(String barcode) {
        return productRepository.findByBarcode(barcode)
                .map(this::mapToResponse);
    }

    public Optional<ProductResponse> updateProduct(Long id, ProductRequest request) {
        return productRepository.findById(id).map(existing -> {
            Product updated = new Product(id, request.name(), request.brand(), request.description(),
                    request.price(), request.cashPrice(), request.requiresExpiration(),
                    request.minStock(), request.saleUnit(), request.active(), request.categoryId(), null);
            return mapToResponse(productRepository.save(updated));
        });
    }

    public boolean deleteProduct(Long id) {
        return productRepository.findById(id).map(product -> {
            productRepository.deleteById(id);
            return true;
        }).orElse(false);
    }

    // Lotes (Batches)
    public BatchResponse createBatch(BatchRequest request) {
        Long branchId = request.branchId() != null ? request.branchId() : securityContext.getCurrentBranchId();
        Batch batch = new Batch(null, request.productId(), branchId, request.supplierId(), request.barcode(), 
                request.stock(), request.costPrice(), LocalDateTime.now(), request.expirationDate());
        Batch saved = productRepository.saveBatch(batch);
        return mapToBatchResponse(saved);
    }

    public List<BatchResponse> listAllBatches() {
        Long branchId = securityContext.getCurrentBranchId();
        return productRepository.findAllBatches().stream()
                .filter(b -> b.getBranchId().equals(branchId))
                .map(this::mapToBatchResponse)
                .collect(Collectors.toList());
    }

    public List<BatchResponse> listBatches(Long productId) {
        Long branchId = securityContext.getCurrentBranchId();
        return productRepository.findBatchesByProductId(productId)
                .stream()
                .filter(b -> b.getBranchId().equals(branchId))
                .map(this::mapToBatchResponse)
                .collect(Collectors.toList());
    }

    public List<Category> listCategories() {
        return productRepository.findAllCategories();
    }

    public Category createCategory(String name, String description) {
        Category category = new Category(null, name, description);
        return productRepository.saveCategory(category);
    }

    // Proveedores (Suppliers)
    public SupplierResponse registerSupplier(SupplierRequest request) {
        Supplier supplier = new Supplier(null, request.name(), request.address(), 
                request.phoneNumber(), request.active());
        Supplier saved = productRepository.saveSupplier(supplier);
        return mapToSupplierResponse(saved);
    }

    public List<SupplierResponse> listSuppliers() {
        return productRepository.findAllSuppliers().stream()
                .map(this::mapToSupplierResponse).toList();
    }

    public void deleteSupplier(Long id) {
        productRepository.deleteSupplierById(id);
    }

    public InventoryDashboardResponse getDashboardData() {
        Long branchId = securityContext.getCurrentBranchId();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nearExpirationThreshold = now.plusDays(30);

        List<Product> allProducts = productRepository.findAll();
        List<ProductResponse> lowStockProducts = new ArrayList<>();
        List<BatchResponse> expiringBatches = new ArrayList<>();
        int nearExpirationCount = 0;
        int expiredCount = 0;

        for (Product product : allProducts) {
            List<Batch> productBatches = productRepository.findBatchesByProductId(product.getId()).stream()
                    .filter(b -> b.getBranchId().equals(branchId))
                    .toList();

            int branchStock = productBatches.stream().mapToInt(Batch::getStock).sum();
            
            if (product.isActive() && branchStock <= product.getMinStock()) {
                product.setTotalStock(branchStock);
                lowStockProducts.add(mapToResponse(product));
            }

            for (Batch batch : productBatches) {
                if (batch.getStock() > 0 && batch.getExpirationDate() != null) {
                    if (batch.getExpirationDate().isBefore(now)) {
                        expiredCount++;
                        expiringBatches.add(mapToBatchResponse(batch));
                    } else if (batch.getExpirationDate().isBefore(nearExpirationThreshold)) {
                        nearExpirationCount++;
                        expiringBatches.add(mapToBatchResponse(batch));
                    }
                }
            }
        }

        return new InventoryDashboardResponse(
                allProducts.size(),
                lowStockProducts.size(),
                nearExpirationCount,
                expiredCount,
                lowStockProducts,
                expiringBatches
        );
    }

    private ProductResponse mapToResponse(Product product) {
        Long currentBranchId = securityContext.getCurrentBranchId();
        
        // Calcular stock solo para la sucursal actual
        int branchStock = productRepository.findBatchesByProductId(product.getId()).stream()
                .filter(b -> b.getBranchId().equals(currentBranchId))
                .mapToInt(Batch::getStock)
                .sum();

        return new ProductResponse(
                product.getId(), product.getName(), product.getBrand(), product.getDescription(),
                product.getPrice(), product.getPriceWithIva(), product.getCashPrice(),
                product.isRequiresExpiration(), branchStock, product.getMinStock(),
                product.getSaleUnit(), product.isActive(), product.getCategoryId(),
                product.getCategoryName()
        );
    }

    private BatchResponse mapToBatchResponse(Batch batch) {
        boolean isAdmin = securityContext.isAdmin();
        String supplierName = batch.getSupplierId() != null ? 
                productRepository.findSupplierById(batch.getSupplierId()).map(Supplier::getName).orElse(null) : null;

        return new BatchResponse(
                batch.getId(), batch.getProductId(), batch.getBranchId(), 
                batch.getSupplierId(), supplierName,
                batch.getBarcode(), 
                batch.getStock(),
                isAdmin ? batch.getCostPrice() : null,
                batch.getAdmissionDate(), batch.getExpirationDate(),
                batch.isExpired()
        );
    }

    private SupplierResponse mapToSupplierResponse(Supplier supplier) {
        return new SupplierResponse(
                supplier.getId(), supplier.getName(), supplier.getAddress(), 
                supplier.getPhoneNumber(), supplier.isActive()
        );
    }
}
