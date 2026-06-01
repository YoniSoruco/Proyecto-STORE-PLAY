# Design: MUI Integration

## Technical Approach

Full MUI migration via component-by-component refactor. Install `@mui/material` + `@emotion/react` + `@emotion/styled` + `@mui/icons-material`. Wrap the app root in `ThemeProvider` + `CssBaseline` (inside `<Provider>` but wrapping `<BrowserRouter>`). Refactor existing inventory components to MUI equivalents while preserving all Redux hooks/state exactly. Build POS Cart and Scanner from scratch using MUI components. Existing Tailwind classes in non-refactored areas remain untouched.

The order of execution: (1) install deps + theme setup, (2) refactor `InventoryPage` → `ProductForm` → `ProductList`, (3) build POS slices + types, (4) build `Cart`, (5) build `Scanner`, (6) add routes in `App.tsx`.

## Architecture Decisions

### Decision: ThemeProvider placement

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Wrap `<Provider>` | Theme available outside React tree, but breaks MUI's context | ❌ |
| Wrap `<BrowserRouter>` | Theme inside Redux context, correct for MUI | ✅ |
| Wrap `<App>` inside routes | Works but scopes theme too late | ❌ |

**Choice**: Insert `ThemeProvider` + `CssBaseline` inside `<Provider>` but wrapping both `<BrowserRouter>` and `<App>` in `main.tsx`. Redux hooks inside theme consumers work, and CssBaseline normalizes before any rendering.

### Decision: Component-by-component refactor

**Choice**: Refactor one component at a time, commit after each.
**Alternatives**: Big-bang rewrite of all inventory files.
**Rationale**: Big-bang risks breaking form state or Redux wiring with no intermediate checkpoints. Component-by-component lets us verify visual parity and test after each file. Inventory has only 3 components — low coordination cost.

### Decision: POS Redux slice design

**Choice**: Two slices — `posCart` (data: line items, totals) and `posScanner` (state: camera status, last scan). Separate files per existing pattern (`src/features/pos/posCartSlice.ts`, `src/features/pos/posScannerSlice.ts`).
**Rationale**: Cart and scanner are independent concerns. Cart manages lists and math; scanner manages device state and debounce. Merging them would create a single reducer with unrelated branches. Follows the existing `inventorySlice.ts` / `uiSlice.ts` pattern.

### Decision: Tailwind + MUI coexistence

**Choice**: Existing Tailwind classes stay. New code uses MUI `sx` prop or `styled()`. No new Tailwind classes in refactored files.
**Rationale**: CssBaseline normalizes MUI's CSS reset. Tailwind `@tailwind base` may conflict marginally, but the proposal classifies this as Medium risk with acceptable mitigation. Full Tailwind removal is out of scope.

## Data Flow

```
┌──────────────┐       ┌─────────────────────┐       ┌──────────────────┐
│  Scanner     │       │  Cart               │       │  Inventory API   │
│  (camera or  │       │  (MUI List/Card)    │       │  (products.ts)   │
│   manual)    │       │                     │       │                  │
└──────┬───────┘       └────────┬────────────┘       └────────┬─────────┘
       │                        │                            │
       │ dispatch               │ dispatch                   │
       │ scanResult(barcode)    │ addItem / removeItem       │ fetch by barcode
       ▼                        ▼                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        Redux Store                                   │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────────────────┐  │
│  │ posScanner   │  │ posCart        │  │ inventory               │  │
│  │ .lastScan    │  │ .items[]       │  │ .searchResult           │  │
│  │ .status      │  │ .totals        │  │ .products[]             │  │
│  └──────────────┘  └────────────────┘  └─────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
        │                            │
        │ useSelector                │ useSelector
        ▼                            ▼
┌──────────────┐       ┌────────────────────────┐
│ Scanner UI   │       │ Cart UI + Checkout btn │
│ (MUI Card)   │       │ (MUI List/Typography)  │
└──────────────┘       └────────────────────────┘
```

**Cart lifecycle**: user action → `dispatch(addItem(product))` → slice reducer mutates `items[]` + recomputes `totals` via `createSlice` reducer → `useSelector` triggers re-render.

**Scanner lifecycle**: camera detects barcode → `dispatch(scanDetected({ barcode, source }))` → slice checks 2s debounce via `lastScanAt` → if allowed, dispatches to `inventory/searchProductByBarcode` thunk → result stored in `inventory.searchResult`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `frontend/package.json` | Modify | Add `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material` |
| `frontend/src/main.tsx` | Modify | Wrap app in `<ThemeProvider>` + `<CssBaseline>` |
| `frontend/src/features/inventory/InventoryPage.tsx` | Modify | Replace divs with MUI `Container`, `Stack`, `Typography` |
| `frontend/src/features/inventory/components/ProductForm.tsx` | Modify | Replace `<input>` / `<button>` with MUI `TextField`, `Button`, `Box` |
| `frontend/src/features/inventory/components/ProductList.tsx` | Modify | Replace `<table>` with MUI `Table`, `TableContainer`, `TableHead`, `TableBody`, `Paper` |
| `frontend/src/features/pos/posCartSlice.ts` | Create | Redux slice: `CartItem[]`, add/remove/clear reducers, totals computed in reducer |
| `frontend/src/features/pos/posScannerSlice.ts` | Create | Redux slice: camera status, last scan timestamp, debounce logic |
| `frontend/src/features/pos/Cart.tsx` | Create | POS cart component: MUI `List`, `ListItem`, `Card`, `Typography`, `Button` |
| `frontend/src/features/pos/Scanner.tsx` | Create | POS scanner component: browser `getUserMedia`, `BarcodeDetector` API or manual input fallback, MUI `Card`, `TextField`, `Button` |
| `frontend/src/App.tsx` | Modify | Add routes for `/pos` pointing to POS page container |
| `frontend/src/store/index.ts` | Modify | Register `posCart` and `posScanner` reducers |

## Interfaces / Contracts

```typescript
// --- posCart ---
interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartTotals {
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
}

interface PosCartState {
  items: CartItem[];
  totals: CartTotals;
}

// --- posScanner ---
type ScannerStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable';

interface ScanResult {
  barcode: string;
  source: 'camera' | 'manual';
  scannedAt: number; // epoch ms, for debounce
}

interface PosScannerState {
  status: ScannerStatus;
  lastScan: ScanResult | null;
  error: string | null;
}
```

`CartTotals` is computed inside the slice reducer (not a selector) so state is always consistent after any mutation. Tax uses a flat rate constant (e.g., `TAX_RATE = 0.08`) defined in the slice file.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `posCartSlice` reducers (add, remove, clear, totals) | Pure reducer tests — no mocking needed. Verify merge behavior and empty/corner cases. Follow `inventorySlice.test.ts` pattern. |
| Unit | `posScannerSlice` reducers (status transitions, debounce) | Pure reducer tests. Verify duplicate scan suppression window. |
| Integration | `Scanner` + `Cart` rendering with MUI | RTL + vitest: render components with mock store, verify MUI elements render and Redux integration works. |
| Visual | Inventory page parity | Manual verification — existing layout should match after refactor. |

Existing `inventorySlice.test.ts` is unaffected; no changes needed there.

## Migration / Rollout

No data migration required. POS slices have empty initial state — they populate only on user interaction. Rollout is a single PR: install deps → theme → refactor inventory → POS slices → POS components → routes.

## Resolved Questions

- [x] **Barcode detection**: `BarcodeDetector` nativo (Chromium) con fallback a `zbar-wasm`. Cero bundle en navegadores modernos, cobertura total con fallback.
- [x] **POS page layout**: `frontend/src/features/pos/PosPage.tsx` dedicado, consistente con el patrón `InventoryPage.tsx` existente.
