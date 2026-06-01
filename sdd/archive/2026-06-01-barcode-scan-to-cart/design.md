# Design: Barcode Scan to Cart

## Data Flow

```
┌──────────────┐     scanDetected        ┌──────────────────┐
│  Scanner     │ ──────────────────────▶  │  processScan     │
│  (camera /   │                          │  (thunk)         │
│   manual /   │                          │                  │
│   physical)  │                          │  1. setStatus    │
└──────────────┘                          │     ('searching')│
                                          │  2. GET /api/    │
                                          │     products/    │
                                          │     barcode/{X}  │
                                          │  3. if found →   │
                                          │     addItem()    │
                                          │     feedback:    │
                                          │     "Added: X"   │
                                          │  4. if not →     │
                                          │     feedback:    │
                                          │     "Not found"  │
                                          │  5. setStatus    │
                                          │     ('idle')     │
                                          └──────┬───────────┘
                                                 │
                                          ┌──────▼───────────┐
                                          │  posCartSlice    │
                                          │  addItem reducer │
                                          │  → merge by ID   │
                                          │  → recalc totals │
                                          └──────────────────┘
```

## Key Decisions

### 1. Thunk, no middleware

La lógica de búsqueda vive en un **`createAsyncThunk`** (`processScan`) dentro del slice `posScannerSlice`. No necesitamos saga ni listener middleware — el thunk maneja el ciclo async (pending/fulfilled/rejected) y permite que el componente muestre estados de búsqueda.

### 2. Feedback en el slice, no en el componente

El estado `feedback` vive en `posScannerSlice` como `{ message: string | null, severity: 'success' | 'warning' }`. El componente `Scanner` solo lo lee y lo muestra. El slice se encarga de limpiarlo después de 3 segundos (via `setTimeout` en el `fulfilled` handler, o con un cleanup action).

### 3. Auto-focus con `inputRef`

El input manual usa `useRef` + `useEffect` para hacer foco al montar y después de cada scan. El lector físico solo necesita un input enfocado para mandar el código + Enter.

## Interfaces

```typescript
// Added to PosScannerState
interface ScanFeedback {
  message: string;
  severity: 'success' | 'warning';
}

interface PosScannerState {
  status: ScannerStatus;
  lastScan: ScanResult | null;
  feedback: ScanFeedback | null;  // ← NEW
  error: string | null;
}
```

## Component Changes

### Scanner.tsx
- Importar `getProductByBarcode` de `api/products`
- En `handleManualSubmit` y en el bucle de cámara: en lugar de solo dispatchear `scanDetected`, dispatchear `processScan(barcode)`
- Leer `feedback` del slice y mostrar `Alert` temporizado
- `useRef<HTMLInputElement>` + `useEffect` para auto-focus

### posScannerSlice.ts
- Agregar `processScan` async thunk
- Agregar `clearFeedback` reducer
- Agregar `feedback` al estado inicial
- Manejar `pending` → `status: 'searching'`, `fulfilled` → feedback + addItem, `rejected` → feedback error
