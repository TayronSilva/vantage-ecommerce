import { api } from './api';
import type { Order, OrderCreateResponse } from '../types';

export const orderService = {
    async create(data: any): Promise<OrderCreateResponse> {
        return api.post<OrderCreateResponse>('/orders', data);
    },

    async getAll(): Promise<Order[]> {
        return api.get<Order[]>('/orders');
    },

    async getMyOrders(): Promise<Order[]> {
        return api.get<Order[]>('/orders/me');
    },

    async getById(id: string): Promise<Order> {
        return api.get<Order>(`/orders/${id}`);
    },

    async cancel(id: string): Promise<void> {
        return api.patch(`/orders/${id}/cancel`, {});
    },

    async payWithCard(data: any): Promise<any> {
        return api.post<any>('/payments/card', data);
    },

    async getSavedCards(): Promise<any[]> {
        return api.get<any[]>('/payments/cards');
    },

    async removeSavedCard(id: string): Promise<void> {
        return api.delete(`/payments/cards/${id}`);
    },

    async verifyStatus(id: string): Promise<any> {
        return api.get<any>(`/orders/${id}/verify`);
    },

    async getPixQrCode(orderId: string): Promise<{ qrCode: string; qrCodeBase64: string }> {
        return api.get<{ qrCode: string; qrCodeBase64: string }>(`/orders/${orderId}/pix`);
    }
};
