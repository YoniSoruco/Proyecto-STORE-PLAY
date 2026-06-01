# Proposal: Inventory Enhancement

## Intent

Expand product model with brand, description, cost price, stock, sale unit, categories, and build a proper inventory management UI with modal-based product creation.

## Scope

### In Scope
- New `categories` table + Liquibase migration
- Expanded `products` table (brand, description, cost_price, stock, min_stock, sale_unit, category_id FK, is_active, timestamps)
- Backend: update entity, domain, DTOs, repository, service, controller
- Frontend: Product type, API client, InventoryPage with table + add-product modal
- Tests (backend + frontend)

### Out of Scope
- Stock movement history
- Purchase orders / supplier management
- Image upload

## Capabilities

### New Capabilities
- `inventory-management`: Product CRUD with categories, sale units, stock tracking

### Modified Capabilities
- None

## Approach

1. Add Liquibase changeset for new columns + categories table
2. Update backend: ProductEntity, Product, ProductRequest/Response, JpaProductRepository, ProductController
3. Frontend: expand Product type, rewrite InventoryPage with modal for add/edit
4. Tests

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| backend/.../db/changelog/db.changelog-master.xml | Modified | New changeset |
| backend/.../infrastructure/db/ProductEntity.java | Modified | New fields |
| backend/.../domain/product/Product.java | Modified | New fields |
| backend/.../application/product/dto/*.java | Modified | New fields |
| backend/.../infrastructure/db/JpaProductRepository.java | Modified | Mappings |
| backend/.../infrastructure/web/ProductController.java | Modified | Extended endpoints |
| frontend/src/api/products.ts | Modified | New fields |
| frontend/src/features/inventory/* | Modified | Full rewrite |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking API change | Med | Backward-compatible DTO (new fields nullable) |
| DB migration failure in prod | Low | New changeset only adds columns, no destructive changes |

## Rollback Plan

Revert Liquibase changeset, restore previous ProductEntity/domain/DTOs, revert frontend.

## Success Criteria

- [ ] Products list shows all new fields in table
- [ ] Add product modal creates product with all fields
- [ ] Edit product modal updates all fields
- [ ] 50+ tests passing
- [ ] Build passes
