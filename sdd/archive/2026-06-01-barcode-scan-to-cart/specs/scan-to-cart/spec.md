# Scan-to-Cart Specification

## Purpose

Pipeline that connects a barcode scan (from camera, manual input, or physical scanner) with automatic product lookup and cart insertion.

## Requirements

### Requirement: Scan Triggers Product Lookup

The system **MUST** search for a product by barcode when a scan is detected. The lookup **MUST** use `GET /api/products/barcode/{barcode}`. While the lookup is in-flight, the UI **SHOULD** show a loading state.

#### Scenario: Scan finds product

- GIVEN a product exists with barcode "8901234567890"
- WHEN the scanner detects that barcode
- THEN the system fetches the product and adds it to the cart

#### Scenario: Scan does not find product

- GIVEN no product exists with barcode "0000000000000"
- WHEN the scanner detects that barcode
- THEN the system shows a "Product not found" feedback
- AND no item is added to the cart

### Requirement: Auto-Add to Cart on Match

When the product lookup succeeds, the system **MUST** dispatch `addItem` with quantity 1 and the product's id, name, and price.

#### Scenario: Product added after scan

- GIVEN the cart has 0 items
- WHEN a scan resolves to a valid product
- THEN the cart has 1 line item with the scanned product
- AND the scanner shows a brief "Added: {product name}" feedback

### Requirement: Feedback on Scan Result

The system **MUST** show temporary feedback after each scan attempt — success (product name added) or failure (not found). The feedback **MUST** auto-dismiss after 3 seconds.

#### Scenario: Success feedback

- GIVEN a scan just resolved to a valid product
- THEN the scanner displays a success message with the product name
- AFTER 3 seconds the message disappears

#### Scenario: Failure feedback

- GIVEN a scan resolved to no product
- THEN the scanner displays a "Product not found" warning
- AFTER 3 seconds the message disappears

### Requirement: Physical Scanner Support

The manual input field **MUST** auto-focus when the scanner component mounts, and **SHOULD** re-focus after each successful scan. This ensures physical barcode readers work without clicking.

#### Scenario: Auto-focus on mount

- GIVEN the scanner component renders
- THEN the manual input field has focus

#### Scenario: Re-focus after scan

- GIVEN a scan just completed (camera or manual)
- THEN the manual input field receives focus again
