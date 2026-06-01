# POS Cart Specification

## Purpose

In-memory POS cart: line items, running totals, checkout trigger via Redux.

## Requirements

### Requirement: Add Item to Cart

The system **MUST** add a line item with product ID, name, unit price, and quantity. Duplicate products **MUST** merge quantities. Totals **MUST** recalculate after each mutation.

#### Scenario: Add unique product

- GIVEN the cart is empty
- WHEN the user adds product "ABC-123" qty 2
- THEN the cart has 1 line item with qty 2

#### Scenario: Duplicate merges quantity

- GIVEN the cart has product "ABC-123" qty 1
- WHEN the user adds the same product qty 3
- THEN the cart has 1 line item with qty 4

### Requirement: Remove Item from Cart

The system **MUST** remove a line item by product ID and recalculate totals. Removing a non-existent ID **MUST NOT** change state.

#### Scenario: Remove existing item

- GIVEN the cart has 2 line items
- WHEN the user removes one
- THEN the cart has 1 line item and totals update

#### Scenario: Remove non-existent item

- GIVEN the cart has 1 line item
- WHEN the user removes an ID not in cart
- THEN the cart is unchanged

### Requirement: Display Cart Totals

The cart **MUST** show item count, subtotal, tax, and total. Currency **SHOULD** format with two decimals.

#### Scenario: Totals computed

- GIVEN the cart has items at $10 and $5
- WHEN rendered
- THEN subtotal is $15.00, total is subtotal plus tax

#### Scenario: Empty cart

- GIVEN the cart is empty
- WHEN rendered
- THEN all totals display 0.00

### Requirement: Checkout Trigger

The system **MUST** dispatch a Redux event with items and totals on checkout. Empty cart **MUST** disable the button and **MUST NOT** dispatch.

#### Scenario: Non-empty dispatches

- GIVEN the cart has items
- WHEN the user clicks checkout
- THEN a Redux action is dispatched with items and totals

#### Scenario: Empty cart blocked

- GIVEN the cart is empty
- WHEN the user clicks checkout
- THEN no action is dispatched and the button is disabled
