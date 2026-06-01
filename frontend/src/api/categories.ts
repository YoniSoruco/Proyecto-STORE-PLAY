import apiClient from './client';

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>('/api/products/categories');
  return response.data;
};

export const createCategory = async (name: string, description?: string): Promise<Category> => {
  const response = await apiClient.post<Category>('/api/products/categories', { name, description });
  return response.data;
};
