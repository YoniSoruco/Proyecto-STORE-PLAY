# POS Scanner Specification

## Purpose

Barcode/QR scanner — live camera capture with auto-detection and manual text entry fallback. Dispatches results to Redux.

## Requirements

### Requirement: Camera Preview

The system **MUST** request camera permission on mount. If granted, a live feed **MUST** display. If denied or unavailable, an error state **MUST** show with fallback to manual input.

#### Scenario: Permission granted

- GIVEN the device has a camera
- WHEN the scanner mounts and permission is granted
- THEN a live preview is visible

#### Scenario: Permission denied

- GIVEN the device has a camera
- WHEN permission is denied
- THEN manual input is shown as fallback

### Requirement: Barcode Detection

The system **SHOULD** detect barcodes and QR codes from the camera feed. Detected codes **MUST** dispatch to Redux with source "camera". Duplicate scans within 2 seconds **MUST NOT** dispatch.

#### Scenario: Scan from camera

- GIVEN the camera feed is active
- WHEN a valid barcode appears
- THEN a scan result dispatches with source "camera"

#### Scenario: Duplicate suppressed

- GIVEN a barcode was scanned 1 second ago
- WHEN the same code appears again
- THEN no action dispatches

### Requirement: Manual Barcode Entry

The system **MUST** provide a text input. Input **MUST** be numeric, 8–14 characters. Valid submission (Enter or button) **MUST** dispatch with source "manual" and clear the field. Invalid input **MUST** show a validation error.

#### Scenario: Valid manual entry

- GIVEN the input field is focused
- WHEN the user types "8901234567890" and presses Enter
- THEN a scan dispatches with source "manual" and the field clears

#### Scenario: Invalid entry rejected

- GIVEN the input field is focused
- WHEN the user types "abc" and presses Enter
- THEN no scan dispatches and a validation error is shown
