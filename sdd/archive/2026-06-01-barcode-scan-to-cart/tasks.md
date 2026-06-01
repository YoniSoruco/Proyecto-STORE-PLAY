# Tasks: Barcode Scan to Cart

Estimated total: ~80-100 lines changed

## Phase 1: Redux Slice Changes

### Task 1.1 — Add `processScan` thunk + `feedback` state

File: `frontend/src/features/pos/posScannerSlice.ts`

- Add `import { createAsyncThunk } from '@reduxjs/toolkit'`
- Add `import { getProductByBarcode } from '@/api/products'`
- Add `processScan` async thunk:
  - Calls `getProductByBarcode(barcode)`
  - On success: dispatch `addItem` from posCartSlice with product + qty 1, return feedback `{ message: "Added: {name}", severity: "success" }`
  - On failure (404/error): return feedback `{ message: "Product not found", severity: "warning" }`
- Add `ScanFeedback` interface: `{ message: string; severity: 'success' | 'warning' }`
- Add `feedback: ScanFeedback | null` to `PosScannerState` and `initialState`
- Add `clearFeedback` reducer
- Handle `processScan.pending` → set `status: 'searching'`
- Handle `processScan.fulfilled` → set `feedback`, keep `lastScan`
- Handle `processScan.rejected` → set feedback error, reset status
- Add auto-clear of feedback after 3s in fulfilled handler

### Task 1.2 — Update `scanDetected` to not interfere

- Ensure `scanDetected` still sets `lastScan` but doesn't conflict with `processScan`
- The flow: `scanDetected` sets `lastScan` → `processScan` does the async work

## Phase 2: Component Changes

### Task 2.1 — Connect scanner camera to processScan

File: `frontend/src/features/pos/Scanner.tsx`

- Import `processScan` from slice
- In `useEffect` camera loop: replace `dispatch(scanDetected(...))` with `dispatch(processScan(barcode))` (keep `scanDetected` too if needed for dedup)
- Actually: keep `scanDetected` for dedup, call `processScan` only when dedup passes

### Task 2.2 — Connect manual input to processScan

File: `frontend/src/features/pos/Scanner.tsx`

- In `handleManualSubmit`: after validation passes, dispatch `processScan(trimmed)` instead of `scanDetected`
- Still dispatch `scanDetected` for dedup tracking

### Task 2.3 — Add feedback display

File: `frontend/src/features/pos/Scanner.tsx`

- Read `feedback` from `state.posScanner`
- When feedback is not null, show an Alert (success=green, warning=yellow)
- Feedback auto-disappears (handled in slice)

### Task 2.4 — Auto-focus for physical scanner

File: `frontend/src/features/pos/Scanner.tsx`

- Add `useRef<HTMLInputElement>()` for the TextField
- Add `useEffect` on mount to focus
- Add `useEffect` watching `feedback` — re-focus after feedback appears (scan complete)
- Add `inputRef` to TextField's `inputRef` prop

## Phase 3: Tests

### Task 3.1 — Tests for processScan thunk

File: `frontend/src/features/pos/posScannerSlice.test.ts`

- Test: scan resolves to existing product → feedback success
- Test: scan resolves to missing product → feedback warning
- Test: feedback state after clearFeedback dispatch

### Task 3.2 — Updated Scanner component tests

File: `frontend/src/features/pos/Scanner.test.tsx`

- Test: manual valid scan calls API and shows success feedback
- Test: manual invalid scan shows validation error (not feedback)
- Test: auto-focus on mount
