# Inventory Management Specification

## Purpose

Manage product catalog with categories, sale units, stock tracking, and full CRUD via UI.

## Requirements

### Requirement: Product Fields

Products MUST support these fields: name, brand, description, price, cost_price, barcode (unique), stock, min_stock, sale_unit, is_active, category_id.

#### Scenario: Create product with all fields

- GIVEN a valid category exists
- WHEN creating a product with name, brand, price, barcode, sale_unit, stock, and category_id
- THEN the product is saved and returns a 200 response with the full product

#### Scenario: Create product missing required fields

- WHEN creating a product without name or price
- THEN the API returns 400 Bad Request

#### Scenario: Duplicate barcode rejected

- GIVEN a product with barcode "123" exists
- WHEN creating another product with barcode "123"
- THEN the API returns 409 Conflict

### Requirement: Categories

The system MUST support product categories with id, name (unique), and description.

#### Scenario: Create and list categories

- WHEN creating a category "Fiambres" and fetching all categories
- THEN the list includes "Fiambres"

### Requirement: Sale Units

Products MUST support sale_unit with values: `unit`, `kg`, `g`, `l`, `ml`.

#### Scenario: Product with weight-based pricing

- GIVEN a product with sale_unit "kg" and price 15.00
- WHEN a POS scan adds 0.5 kg to cart
- THEN the cart line total is 7.50

### Requirement: Inventory UI

The inventory page MUST show a table with: name, brand, price, stock, category, sale_unit, barcode, actions.

#### Scenario: Table renders with products

- GIVEN products exist in the database
- WHEN navigating to /inventory
- THEN a table shows all products with name, brand, price, stock

#### Scenario: Empty state

- GIVEN no products exist
- WHEN navigating to /inventory
- THEN a "No hay productos disponibles" message shows

### Requirement: Add Product Modal

A button MUST open a modal/dialog with fields for all product attributes.

#### Scenario: Open and submit modal

- WHEN clicking "Agregar Producto" button and filling all fields
- THEN the product is created and appears in the table

#### Scenario: Validation errors

- WHEN submitting the modal with empty required fields
- THEN inline validation errors prevent submission

### Requirement: Edit Product Modal

Clicking edit on a product row MUST open a pre-filled modal.

#### Scenario: Edit and save

- WHEN editing a product and changing its price
- THEN the table reflects the updated price

### Requirement: Delete Product

A delete button per row MUST prompt confirmation before deleting.

#### Scenario: Confirm delete

- WHEN clicking delete and confirming
- THEN the product is removed from the table

#### Scenario: Cancel delete

- WHEN clicking delete and canceling
- THEN the product remains in the table
