# Delta for POS Cart

## MODIFIED Requirements

### Requirement: Add Item to Cart

The system **MUST** add a line item with product ID, name, unit price, and quantity. Duplicate products **MUST** merge quantities. Totals **MUST** recalculate after each mutation. Items **MAY** be added via the scan pipeline in addition to manual cart interaction.
(Previously: Items only added via manual cart interaction.)

#### Scenario: Add unique product (unchanged)

- GIVEN the cart is empty
- WHEN the user adds product "ABC-123" qty 2
- THEN the cart has 1 line item with qty 2

#### Scenario: Duplicate merges quantity (unchanged)

- GIVEN the cart has product "ABC-123" qty 1
- WHEN the user adds the same product qty 3
- THEN the cart has 1 line item with qty 4

#### Scenario: Added via scan

- GIVEN the cart has 0 items
- WHEN a scan resolves to product "ABC-123"
- THEN the cart has 1 line item with qty 1
