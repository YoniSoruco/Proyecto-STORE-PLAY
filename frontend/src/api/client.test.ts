import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import apiClient, { injectStore } from './client';

const server = setupServer(
  http.get('*/test-endpoint', ({ request }) => {
    const tenantId = request.headers.get('X-Tenant-ID');
    return HttpResponse.json({ tenantId });
  })
);

describe('apiClient interceptor', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should inject X-Tenant-ID header when tenantId is present in store', async () => {
    const mockStore = {
      getState: () => ({
        tenant: { activeTenantId: 'tenant-abc' },
      }),
    };
    injectStore(mockStore);

    const response = await apiClient.get('/test-endpoint');
    expect(response.data.tenantId).toBe('tenant-abc');
  });

  it('should not inject X-Tenant-ID header when tenantId is null', async () => {
    const mockStore = {
      getState: () => ({
        tenant: { activeTenantId: null },
      }),
    };
    injectStore(mockStore);

    const response = await apiClient.get('/test-endpoint');
    expect(response.data.tenantId).toBeNull();
  });
});
