## Exploration: mui-integration

### Current State
The project currently uses a basic React setup with Redux Toolkit and React Router. Styling is a mix of basic Tailwind CSS (`App.tsx`, `MainLayout.tsx`) and inline styles with standard HTML elements (`InventoryPage.tsx`, `ProductList.tsx`). There is no UI component library installed. The POS module (Cart and Scanner) does not exist yet.

### Affected Areas
- `frontend/package.json` — needs new dependencies.
- `frontend/src/main.tsx` or `App.tsx` — requires adding MUI's `ThemeProvider` and `CssBaseline`.
- `frontend/src/features/inventory/InventoryPage.tsx` — needs refactoring to use MUI layout components (`Container`, `Grid`, or `Stack`).
- `frontend/src/features/inventory/components/ProductList.tsx` — needs refactoring to use MUI `Table`, `TableContainer`, `TableHead`, `TableRow`, `TableCell`, etc.
- `frontend/src/features/inventory/components/ProductForm.tsx` — needs refactoring to use MUI `TextField`, `Button`, `Box`, etc.
- `frontend/src/features/pos/*` (new files) — need to be created using MUI components (e.g., `Grid` for layout, `Card` for the scanner, `List` for cart items).

### Approaches
1. **Full MUI Migration with Default Theme**
   - Install `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`.
   - Wrap the app in `ThemeProvider` with a default `createTheme()`.
   - Replace all raw HTML elements and inline styles in `InventoryPage`, `ProductList`, and `ProductForm` with MUI equivalents.
   - Build the new POS module using MUI layout and data display components.
   - Pros: Consistent design system, lots of built-in components (Table, TextField), easy future customization per tenant.
   - Cons: Adds some bundle size, requires learning MUI API for developers not familiar.
   - Effort: Medium

2. **MUI with Tailwind Integration**
   - Keep Tailwind for layout/spacing and use MUI for complex components (Tables, Inputs, Buttons).
   - Pros: Leverages existing Tailwind setup, potentially faster layout building.
   - Cons: Two styling paradigms mixed together, potential specificity issues if not configured correctly (MUI provides a way to make its CSS inject first).
   - Effort: Medium

### Recommendation
**Approach 1 (Full MUI Migration with Default Theme)** is recommended. Since this is an enterprise/POS system, consistency and data-dense components (Tables, DataGrids, Forms) provided by MUI are highly valuable. A unified styling approach through MUI's theme system will make it much easier to implement the multi-tenant coloring (e.g., fetching a tenant's primary color and applying it to the MUI theme) compared to mixing it with Tailwind.

### Risks
- Mixing Tailwind and MUI styles might lead to confusing CSS specificity bugs if old classes are left behind.
- Refactoring `ProductForm` and `ProductList` requires ensuring that form state and Redux integration remain intact.

### Ready for Proposal
Yes — the orchestrator can propose the full MUI migration and proceed to define the spec.