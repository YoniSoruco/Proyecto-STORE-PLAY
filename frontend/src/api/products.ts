import apiClient from './client';

export interface Product {
  id: number;
  name: string;
  brand: string | null;
  description: string | null;
  price: number; // Precio de lista
  priceWithIva: number; // Calculado
  cashPrice: number; // Precio efectivo
  requiresExpiration: boolean;
  totalStock: number;
  minStock: number;
  saleUnit: string;
  active: boolean;
  categoryId: number | null;
  categoryName: string | null;
}

export interface Batch {
  id: number;
  productId: number;
  branchId: number;
  barcode: string;
  stock: number;
  costPrice: number | null;
  admissionDate: string;
  expirationDate: string | null;
  expired: boolean;
  supplierName?: string | null;
}

export interface InventoryDashboard {
  totalProducts: number;
  lowStockCount: number;
  nearExpirationCount: number;
  expiredCount: number;
  lowStockProducts: Product[];
  expiringBatches: Batch[];
}

export interface CreateProductRequest {
  name: string;
  brand?: string;
  description?: string;
  price: number;
  cashPrice: number;
  requiresExpiration: boolean;
  minStock?: number;
  saleUnit?: string;
  active?: boolean;
  categoryId?: number | null;
}

export interface CreateBatchRequest {
  barcode: string;
  stock: number;
  costPrice: number;
  expirationDate?: string | null;
  supplierId?: number;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>('/api/products');
  return response.data;
};

export const createProduct = async (product: CreateProductRequest): Promise<Product> => {
  const response = await apiClient.post<Product>('/api/products', product);
  return response.data;
};

export const getProductByBarcode = async (barcode: string): Promise<Product> => {
  const response = await apiClient.get<Product>(`/api/products/barcode/${barcode}`);
  return response.data;
};

export const updateProduct = async (id: number, product: CreateProductRequest): Promise<Product> => {
  const response = await apiClient.put<Product>(`/api/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/products/${id}`);
};

export const getBatches = async (productId: number): Promise<Batch[]> => {
  const response = await apiClient.get<Batch[]>(`/api/products/${productId}/batches`);
  return response.data;
};

export const getAllBatches = async (): Promise<Batch[]> => {
  const response = await apiClient.get<Batch[]>('/api/products/batches');
  return response.data;
};

export const addBatch = async (productId: number, batch: CreateBatchRequest): Promise<Batch> => {
  const response = await apiClient.post<Batch>(`/api/products/${productId}/batches`, batch);
  return response.data;
};

export const getDashboardData = async (): Promise<InventoryDashboard> => {
  const response = await apiClient.get<InventoryDashboard>('/api/products/dashboard');
  return response.data;
};
