package com.store.application.product;

import com.store.application.product.dto.ProductRequest;
import com.store.application.product.dto.ProductResponse;
import com.store.domain.product.Category;
import com.store.domain.product.Product;
import com.store.domain.product.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private final ProductRequest defaultRequest = new ProductRequest(
        "Apples", new BigDecimal("1.50"), "12345", null, null, null, 0, 0, "unit", true, null
    );

    private final Product defaultProduct = new Product(
        1L, "Apples", new BigDecimal("1.50"), "12345", null, null, null, 0, 0, "unit", true, null, null
    );

    @Test
    void shouldRegisterProductSuccessfully() {
        when(productRepository.save(any(Product.class))).thenReturn(defaultProduct);

        ProductResponse response = productService.registerProduct(defaultRequest);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.name()).isEqualTo("Apples");
        assertThat(response.barcode()).isEqualTo("12345");
    }

    @Test
    void shouldListAllProducts() {
        List<Product> products = List.of(
            defaultProduct,
            new Product(2L, "Oranges", new BigDecimal("2.00"), "67890",
                null, null, null, 0, 0, "unit", true, null, null)
        );
        when(productRepository.findAll()).thenReturn(products);

        List<ProductResponse> response = productService.listProducts();

        assertThat(response).hasSize(2);
        assertThat(response.get(0).name()).isEqualTo("Apples");
        assertThat(response.get(1).name()).isEqualTo("Oranges");
    }

    @Test
    void shouldFindProductByBarcode() {
        String barcode = "12345";
        when(productRepository.findByBarcode(barcode)).thenReturn(java.util.Optional.of(defaultProduct));

        java.util.Optional<ProductResponse> response = productService.findByBarcode(barcode);

        assertThat(response).isPresent();
        assertThat(response.get().name()).isEqualTo("Apples");
        assertThat(response.get().barcode()).isEqualTo(barcode);
    }

    @Test
    void shouldReturnEmptyWhenProductNotFound() {
        String barcode = "99999";
        when(productRepository.findByBarcode(barcode)).thenReturn(java.util.Optional.empty());

        java.util.Optional<ProductResponse> response = productService.findByBarcode(barcode);

        assertThat(response).isEmpty();
    }

    @Test
    void shouldListCategories() {
        List<Category> categories = List.of(new Category(1L, "Fiambres", "Fiambres y embutidos"));
        when(productRepository.findAllCategories()).thenReturn(categories);

        List<Category> result = productService.listCategories();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Fiambres");
    }

    @Test
    void shouldCreateCategory() {
        Category category = new Category(null, "Lácteos", "Productos lácteos");
        when(productRepository.saveCategory(any(Category.class))).thenReturn(
            new Category(1L, "Lácteos", "Productos lácteos")
        );

        Category result = productService.createCategory("Lácteos", "Productos lácteos");

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Lácteos");
    }
}
