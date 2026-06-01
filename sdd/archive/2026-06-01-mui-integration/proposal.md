# Proposal: MUI Integration

## Intent

Integrate Material UI as the project's design system to replace the current mix of basic Tailwind and inline styles. This creates a consistent UI language across all features and provides the data-dense components (Table, TextField, Cards) needed for the upcoming POS module.

## Scope

### In Scope
- Install MUI packages (`@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`)
- Add `ThemeProvider` + `CssBaseline` to the app root
- Refactor `InventoryPage` → MUI layout (Container, Grid/Stack)
- Refactor `ProductList` → MUI Table components
- Refactor `ProductForm` → MUI TextField, Button, Box
- Build POS Cart module from scratch with MUI (List, Card, Button, Typography)
- Build POS Scanner module from scratch with MUI (Card, Grid, Button)

### Out of Scope
- Multi-tenant dynamic theming (deferred after migration)
- MUI DataGrid / XGrid (keep basic Table for now)
- Full removal of Tailwind CSS (existing classes stay; new code uses MUI)
- Dark mode toggle
- Unit tests for new POS components (covered in spec phase)

## Capabilities

> Contract between proposal and specs phases.

### New Capabilities
- `pos-cart`: Shopping cart for POS — add/remove items, display totals, checkout trigger
- `pos-scanner`: Barcode/QR scanner integration — camera preview, manual input fallback, scan result dispatch

### Modified Capabilities
- None — inventory refactor is a pure UI replacement with no behavior or requirement changes

## Approach

Full MUI Migration with Default Theme (Approach 1 from exploration):

1. Install MUI + Emotion packages via npm
2. Wrap root component in `ThemeProvider` with `createTheme()` defaults + `CssBaseline`
3. Refactor inventory feature: replace raw HTML / inline styles with MUI equivalents, component by component
4. Build POS feature from scratch using MUI layout and data-display components
5. Keep existing Tailwind classes untouched; new code uses MUI's `sx` prop or `styled` API

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/package.json` | Modified | Add 4 deps: @mui/material, @emotion/react, @emotion/styled, @mui/icons-material |
| `frontend/src/main.tsx` | Modified | Wrap app in ThemeProvider + CssBaseline |
| `frontend/src/features/inventory/InventoryPage.tsx` | Modified | Replace divs with Container, Grid, Stack |
| `frontend/src/features/inventory/components/ProductList.tsx` | Modified | Replace table HTML with MUI Table, TableContainer, etc. |
| `frontend/src/features/inventory/components/ProductForm.tsx` | Modified | Replace inputs/buttons with MUI TextField, Button, Box |
| `frontend/src/features/pos/Cart.tsx` | New | POS cart with MUI List, Card, Typography |
| `frontend/src/features/pos/Scanner.tsx` | New | POS scanner with MUI Card, Grid, Button |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Tailwind + MUI style conflicts | Medium | Keep existing Tailwind classes untouched. Use CssBaseline to normalize. Scope MUI to new / refactored code only. |
| Breaking form state or Redux during refactor | Medium | Refactor one component at a time, test after each. Preserve all Redux hooks and handlers exactly. |
| Bundle size increase | Low | MUI tree-shakes unused components. Monitor with Vite's build report. |

## Rollback Plan

1. `git checkout` each modified file to restore originals
2. Remove MUI/Emotion deps from `package.json` and run `npm install`
3. Delete any new POS files under `frontend/src/features/pos/`
4. Verify app builds (`npm run build`) and tests pass (`npm run test`)

## Dependencies

- `@mui/material` ^7.x, `@emotion/react` ^11.x, `@emotion/styled` ^11.x, `@mui/icons-material` ^7.x

## Success Criteria

- [ ] App builds and runs with zero errors after MUI installation
- [ ] InventoryPage, ProductList, ProductForm render with same layout (visual parity)
- [ ] ProductForm state + Redux integration works (add/edit product succeeds)
- [ ] POS Cart renders with MUI components, items can be added/removed
- [ ] POS Scanner renders camera view or manual input fallback
- [ ] No regressions in existing tests (`npm run test`)
