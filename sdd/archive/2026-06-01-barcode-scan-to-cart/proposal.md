# Proposal: Barcode Scan to Cart

## Intent

Hoy el Scanner detecta el código de barras pero no hace nada con él — queda guardado en `posScanner.lastScan` sin efecto visible. El usuario tiene que escanear, después ir a `PosProductSearch`, buscar y agregar manualmente. Para un POS esto es inaceptable: el scan debe buscar el producto y agregarlo al carrito automáticamente, ya venga de cámara, lector físico o input manual.

## Scope

### In Scope
- Conectar `scanDetected` con búsqueda por barcode (`GET /api/products/barcode/{barcode}`)
- Agregar producto al carrito automáticamente si existe
- Feedback visual: producto agregado / no encontrado
- Auto-limpiar estado del scanner post-scan
- Soportar lector físico: focus automático en el input manual al montar el componente
- Soportar cámara: misma lógica, detecta → busca → agrega

### Out of Scope
- `zbar-wasm` fallback para iOS/Firefox (lo cubre otro cambio)
- Soporte multi-código (escaneos simultáneos)
- Historial de escaneos
- Sonido/vibración en scan exitoso

## Capabilities

### New Capabilities
- `scan-to-cart`: Pipeline scan → búsqueda → agregar al carrito con feedback

### Modified Capabilities
- `pos-cart`: El cart ahora recibe items vía scan además de búsqueda manual
- `pos-scanner`: El scanner ahora ejecuta side effects al detectar un código

## Approach

1. En `Scanner.tsx`, cuando se detecte un scan (cámara o manual), en lugar de solo dispatchear `scanDetected`, dispatchear un thunk asíncrono que:
   - Busque el producto por barcode (`api/products.ts:getProductByBarcode`)
   - Si existe → `addItem` al carrito + feedback "Producto X agregado"
   - Si no existe → feedback "Producto no encontrado"
2. Agregar `autoFocus` al input manual para que lector físico funcione sin click
3. Mostrar feedback visual temporizado (Alert que desaparece a los 3s)
4. Agregar tests del flujo completo

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/src/features/pos/Scanner.tsx` | Modified | Conectar scan → búsqueda → cart + feedback |
| `frontend/src/features/pos/posScannerSlice.ts` | Modified | Agregar estado `feedback` y thunk `processScan` |
| `frontend/src/api/products.ts` | Unchanged | Ya tiene `getProductByBarcode` |
| `frontend/src/features/pos/Scanner.test.tsx` | Modified | Tests del nuevo flujo |
| `frontend/src/features/pos/posScannerSlice.test.ts` | Modified | Tests del thunk y feedback |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Barcode detectado pero producto no existe en DB | Medium | Feedback claro "no encontrado", no rompe flujo |
| Raza condición: scan rápido duplicado | Low | Ya existe dedup de 2s en el slice |
| Lector físico envía el código + Enter antes de que React monte el componente | Low | `autoFocus` + ref para capturar input temprano |

## Rollback Plan

1. Revertir cambios en `Scanner.tsx`, `posScannerSlice.ts` y test files
2. `npm run test` para verificar que no hay regresiones
3. `npm run build` para verificar build

## Dependencies

- `api/products.ts:getProductByBarcode` — ya existe
- `posCartSlice:addItem` — ya existe

## Success Criteria

- [ ] Scan por cámara → producto se agrega al carrito automáticamente
- [ ] Scan manual/lector físico → producto se agrega al carrito automáticamente
- [ ] Producto no existente → feedback "no encontrado", no se agrega nada
- [ ] Input manual tiene foco automático para lector físico
- [ ] Feedback visual desaparece después de 3s
- [ ] Todos los tests existentes siguen pasando
- [ ] Tests nuevos cubren el flujo scan → búsqueda → add
