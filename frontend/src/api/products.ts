import apiClient from './client';

export interface Product {
  id: number;
  name: string;
  price: number;
  barcode: string;
  brand: string | null;
  description: string | null;
  costPrice: number | null;
  stock: number;
  minStock: number;
  saleUnit: string;
  active: boolean;
  categoryId: number | null;
  categoryName: string | null;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  barcode: string;
  brand?: string;
  description?: string;
  costPrice?: number;
  stock?: number;
  minStock?: number;
  saleUnit?: string;
  active?: boolean;
  categoryId?: number | null;
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
