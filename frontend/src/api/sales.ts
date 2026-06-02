import apiClient from './client';
import type { CartItem, CartTotals } from '@/features/pos/posCartSlice';

export interface SaleRequest {
  items: { productId: number; name: string; price: number; quantity: number }[];
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface SaleResponse {
  id: number;
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  items: { productId: number; productName: string; unitPrice: number; quantity: number }[];
}

export const submitSale = async (items: CartItem[], totals: CartTotals): Promise<SaleResponse> => {
  const payload: SaleRequest = {
    items: items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
    itemCount: totals.itemCount,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
  };
  const response = await apiClient.post<SaleResponse>('/api/sales', payload);
  return response.data;
};
