# Tasks: Inventory Enhancement

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~480 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

## Phase 1: Database & Backend Models

- [x] 1.1 Add Liquibase changeset 003: `categories` table + new `products` columns
- [x] 1.2 Create `CategoryEntity.java`, `Category.java`, mapper
- [x] 1.3 Update `ProductEntity.java` with all new fields + category ManyToOne
- [x] 1.4 Update `Product.java` domain model with new fields
- [x] 1.5 Update `ProductRequest.java` and `ProductResponse.java` DTOs
- [x] 1.6 Update `JpaProductRepository.java` entity↔domain mappings
- [x] 1.7 Add category repository methods + `SpringDataCategoryRepository`

## Phase 2: Backend API

- [x] 2.1 Update `ProductService.java` with new field handling + category CRUD
- [x] 2.2 Update `ProductController.java`: add GET/POST /api/products/categories
- [x] 2.3 Update backend unit tests (`ProductServiceTest`)
- [x] 2.4 Update backend integration tests (`ProductMultiTenantTest`)

## Phase 3: Frontend API Layer

- [x] 3.1 Update `api/products.ts` with all new fields
- [x] 3.2 Create `api/categories.ts` with Category type + API functions

## Phase 4: Inventory UI

- [x] 4.1 Rewrite `ProductForm.tsx` with brand, description, cost_price, stock, min_stock, sale_unit select, category select
- [x] 4.2 Rewrite `ProductList.tsx` with nombre, marca, precio, stock, categoría, unidad, código, acciones columns
- [x] 4.3 Rewrite `ProductEditDialog.tsx` with all new fields
- [x] 4.4 Update `InventoryPage.tsx` with toggle form + categories fetch
- [x] 4.5 Update `inventorySlice.ts` with categories state + fetchCategories thunk

## Phase 5: Tests & Verify

- [x] 5.1 Update frontend tests (inventorySlice.test.ts, posScannerSlice.test.ts)
- [x] 5.2 Frontend tests: 47/47 pass
- [x] 5.3 Frontend build: passes
- [ ] 5.4 Backend needs Maven to compile (not available in this env)
