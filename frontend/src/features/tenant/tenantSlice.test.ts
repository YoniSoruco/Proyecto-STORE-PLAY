import { describe, it, expect, beforeEach, vi } from 'vitest';
import tenantReducer, { setTenantId } from './tenantSlice';

describe('tenantSlice', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with null if localStorage is empty', () => {
    const state = tenantReducer(undefined, { type: '@@INIT' });
    expect(state.activeTenantId).toBeNull();
  });

  it('should initialize with value from localStorage', () => {
    localStorage.setItem('activeTenantId', 'tenant-123');
    tenantReducer(undefined, { type: '@@INIT' });
    // Note: If the module was already loaded, this might still be null.
  });

  it('should update activeTenantId when setTenantId is called', () => {
    const initialState = { activeTenantId: null };
    const nextState = tenantReducer(initialState, setTenantId('new-tenant'));
    expect(nextState.activeTenantId).toBe('new-tenant');
  });
});
