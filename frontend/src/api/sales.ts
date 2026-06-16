import apiClient from './client';
import type { CartItem, CartTotals } from '@/features/pos/posCartSlice';

export interface PaymentRequest {
  method: string;
  amount: number;
}

export interface SaleRequest {
  items: { productId: number; name: string; price: number; quantity: number }[];
  payments: PaymentRequest[];
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  roundingAmount: number;
  invoiceType: string;
}

export interface SaleResponse {
  id: number;
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  roundingAmount: number;
  invoiceType: string;
  invoiceNumber: string;
  createdAt: string;
  items: { productId: number; productName: string; unitPrice: number; quantity: number }[];
  payments: { method: string; amount: number }[];
}

export const submitSale = async (
  items: CartItem[], 
  totals: CartTotals, 
  payments: PaymentRequest[],
  roundingAmount: number = 0,
  invoiceType: string = 'TICKET_NO_FISCAL'
): Promise<SaleResponse> => {
  const payload: SaleRequest = {
    items: items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
    payments,
    itemCount: totals.itemCount,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    roundingAmount,
    invoiceType,
  };
  const response = await apiClient.post<SaleResponse>('/api/sales', payload);
  return response.data;
};

export const fetchSales = async (): Promise<SaleResponse[]> => {
  const response = await apiClient.get<SaleResponse[]>('/api/sales');
  return response.data;
};
