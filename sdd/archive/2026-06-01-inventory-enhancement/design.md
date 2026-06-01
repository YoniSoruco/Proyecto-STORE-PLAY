# Design: Inventory Enhancement

## Technical Approach

Extend existing hexagonal architecture: Liquibase changeset adds columns + categories table, update ProductEntity/domain/DTOs through each layer, and rewrite InventoryPage with MUI modal dialog for add/edit.

## Architecture Decisions

### Decision: New fields as nullable where sensible

**Choice**: brand, description, cost_price, min_stock nullable; name, price, barcode, sale_unit, stock NOT NULL with defaults
**Rationale**: Avoid breaking existing data. A product can exist without a brand or description but MUST have name, price, and sale_unit.

### Decision: Categories as separate table vs enum

**Choice**: Separate `categories` table with FK from products
**Alternatives**: Enum in code, string column
**Rationale**: Categories are user-managed, not fixed. FK ensures referential integrity.

### Decision: sale_unit as VARCHAR check constraint

**Choice**: Store as VARCHAR(5) with CHECK (sale_unit IN ('unit','kg','g','l','ml'))
**Alternatives**: Enum in Java
**Rationale**: Liquibase CHECK is simpler than JPA enum mapping. The domain model will validate.

### Decision: Modal vs separate page for add/edit

**Choice**: MUI Dialog for both add and edit
**Rationale**: Already used in ProductEditDialog. Faster UX than page navigation. Reuse same form component.

## Data Flow

```
Browser ──GET /api/products──→ Controller ──→ Service ──→ Repository ──→ DB
Browser ←── JSON ────────────── Controller ←── Service ←── Repository ←── DB

Add: Browser ──POST /api/products──→ Controller → Service → Repository → DB
Edit: Browser ──PUT /api/products/:id ──→ ...
Delete: Browser ──DELETE /api/products/:id ──→ ...
```

## File Changes

### Backend

| File | Action | Description |
|------|--------|-------------|
| `db/changelog/db.changelog-master.xml` | Modify | Add changeset 003: categories table + new product columns |
| `infrastructure/db/ProductEntity.java` | Modify | Add brand, description, costPrice, stock, minStock, saleUnit, active, categoryId, createdAt, updatedAt |
| `domain/product/Product.java` | Modify | Same new fields |
| `application/product/dto/ProductRequest.java` | Modify | Add new fields |
| `application/product/dto/ProductResponse.java` | Modify | Add new fields |
| `infrastructure/db/JpaProductRepository.java` | Modify | Update entity↔domain mappings |
| `infrastructure/web/ProductController.java` | Modify | Add GET /api/categories, POST /api/categories endpoints |
| `application/product/ProductService.java` | Modify | Add category CRUD, update product mapping |
| `domain/product/ProductRepository.java` | Modify | Add category methods |
| `infrastructure/db/SpringDataProductRepository.java` | Modify | No changes needed (JPA handles new columns) |
| New: `domain/product/Category.java` | Create | Category domain model |
| New: `infrastructure/db/CategoryEntity.java` | Create | Category JPA entity |

### Frontend

| File | Action | Description |
|------|--------|-------------|
| `api/products.ts` | Modify | Add brand, description, costPrice, stock, minStock, saleUnit, isActive, categoryId, categoryName to Product + CreateProductRequest |
| `api/categories.ts` | Create | Category type + getCategories, createCategory API |
| `features/inventory/InventoryPage.tsx` | Modify | Full rewrite with table + add modal button |
| `features/inventory/components/ProductForm.tsx` | Modify | Extend with all new fields |
| `features/inventory/components/ProductList.tsx` | Modify | Add brand, stock, category, sale_unit columns |
| `features/inventory/components/ProductEditDialog.tsx` | Modify | Extend with all new fields |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Backend unit | ProductService CRUD + categories | Mockito |
| Backend integration | Multi-tenant isolation with new schema | MockMvc + H2 |
| Frontend unit | InventoryPage renders products, modal opens/submits | Vitest + RTL |

## Migration

No migration needed. New columns are additive (nullable or have defaults). Categories table is new.

## Open Questions

- None
