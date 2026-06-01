# Tasks: MUI Integration

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~550 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full MUI integration | PR 1 | single PR, size exception needed |

## Phase 1: Foundation — Dependencies and Theme

- [x] 1.1 Install `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material` in `frontend/package.json` via npm
- [x] 1.2 Add ThemeProvider + CssBaseline in `frontend/src/main.tsx`: import from MUI, wrap `<BrowserRouter>` + `<App>` inside `<Provider>`

## Phase 2: Inventory Refactor — MUI Components

- [x] 2.1 Refactor `frontend/src/features/inventory/InventoryPage.tsx`: replace divs with MUI `Container`, `Stack`, `Typography` — preserve all Redux hooks exactly
- [x] 2.2 Refactor `frontend/src/features/inventory/components/ProductForm.tsx`: replace `<input>`/`<button>` with MUI `TextField`, `Button`, `Box` — preserve form state and handlers
- [x] 2.3 Refactor `frontend/src/features/inventory/components/ProductList.tsx`: replace `<table>` with MUI `Table`, `TableContainer`, `TableHead`, `TableBody`, `Paper`

## Phase 3: POS Implementation — Slices, Components, Routing

- [x] 3.1 Create `frontend/src/features/pos/posCartSlice.ts`: `CartItem`/`CartTotals`/`PosCartState` types, add/remove/clear reducers with quantity-merge and totals
- [x] 3.2 Create `frontend/src/features/pos/posScannerSlice.ts`: `ScannerStatus`/`ScanResult`/`PosScannerState` types, status-transition reducers, 2s debounce on scan
- [x] 3.3 Register `posCart` and `posScanner` reducers in `frontend/src/store/index.ts`
- [x] 3.4 Create `frontend/src/features/pos/Cart.tsx`: MUI `List`/`ListItem`/`Card`/`Typography`/`Button` — display items, totals, checkout dispatch, disabled on empty
- [x] 3.5 Create `frontend/src/features/pos/Scanner.tsx`: camera `getUserMedia` + `BarcodeDetector` (or manual input fallback) in MUI `Card`/`TextField`/`Button` — dispatch scan results, validate 8–14 char numeric
- [x] 3.6 Create `frontend/src/features/pos/PosPage.tsx`: container composing `Cart` and `Scanner` via MUI `Grid`, consistent with `InventoryPage` pattern
- [x] 3.7 Add `/pos` route in `frontend/src/App.tsx` pointing to `PosPage`

## Phase 4: Testing

- [x] 4.1 Write `frontend/src/features/pos/posCartSlice.test.ts`: test add (unique + merge), remove (existing + non-existent), totals computation (multiple items + empty), checkout dispatch and empty-blocked
- [x] 4.2 Write `frontend/src/features/pos/posScannerSlice.test.ts`: test status transitions, scan dispatch, 2s duplicate suppression, manual entry validation
- [x] 4.3 Write `frontend/src/features/pos/Cart.test.tsx`: RTL render with mock store — verify MUI elements render, items list, totals display, checkout button state
- [x] 4.4 Write `frontend/src/features/pos/Scanner.test.tsx`: RTL render with mock store — verify manual input renders, valid/invalid submission, camera permission fallback messaging
