import { describe, it, expect } from 'vitest';
import tenantReducer, { setTenantId } from './tenantSlice';

describe('tenantSlice', () => {
  it('should initialize with default tenant1', () => {
    const state = tenantReducer(undefined, { type: '@@INIT' });
    expect(state.activeTenantId).toBe('tenant1');
  });

  it('should update activeTenantId when setTenantId is called', () => {
    const initialState = { activeTenantId: null };
    const nextState = tenantReducer(initialState, setTenantId('new-tenant'));
    expect(nextState.activeTenantId).toBe('new-tenant');
  });
});
