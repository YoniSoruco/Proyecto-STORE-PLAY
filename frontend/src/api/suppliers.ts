import apiClient from './client';

export interface Supplier {
  id: number;
  name: string;
  address: string | null;
  phoneNumber: string | null;
  active: boolean;
}

export interface CreateSupplierRequest {
  name: string;
  address?: string;
  phoneNumber?: string;
  active: boolean;
}

export const getSuppliers = async (): Promise<Supplier[]> => {
  const response = await apiClient.get<Supplier[]>('/api/products/suppliers');
  return response.data;
};

export const createSupplier = async (supplier: CreateSupplierRequest): Promise<Supplier> => {
  const response = await apiClient.post<Supplier>('/api/products/suppliers', supplier);
  return response.data;
};

export const deleteSupplier = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/products/suppliers/${id}`);
};
