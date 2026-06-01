# Delta for POS Scanner

## MODIFIED Requirements

### Requirement: Barcode Detection

The system **SHOULD** detect barcodes and QR codes from the camera feed. Detected codes **MUST** dispatch to Redux with source "camera". Duplicate scans within 2 seconds **MUST NOT** dispatch. After dispatch, the system **MUST** trigger a product lookup and add the result to the cart automatically.
(Previously: Detected codes dispatched to Redux only, no side effects.)

#### Scenario: Scan from camera

- GIVEN the camera feed is active
- WHEN a valid barcode appears
- THEN a scan result dispatches, the product is looked up, and if found it is added to the cart

#### Scenario: Duplicate suppressed

- GIVEN a barcode was scanned 1 second ago
- WHEN the same code appears again
- THEN no action dispatches and no lookup occurs

### Requirement: Manual Barcode Entry

The system **MUST** provide a text input. Input **MUST** be numeric, 8–14 characters. Valid submission (Enter or button) **MUST** dispatch with source "manual" and clear the field. Invalid input **MUST** show a validation error. After valid submission, the system **MUST** trigger product lookup and add to cart.
(Previously: Manual entry dispatched to Redux only, no side effects.)

#### Scenario: Valid manual entry

- GIVEN the input field is focused
- WHEN the user types "8901234567890" and presses Enter
- THEN a scan dispatches, the product is looked up, and if found it is added to the cart

#### Scenario: Invalid entry rejected

- GIVEN the input field is focused
- WHEN the user types "abc" and presses Enter
- THEN no scan dispatches and a validation error is shown
