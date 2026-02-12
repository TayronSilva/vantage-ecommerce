import { api } from './api';

export interface Exchange {
    id: string;
    orderId: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    evidenceUrls: string[];
    adminNotes?: string;
    createdAt: string;
}

export const exchangeService = {
    async createRequest(data: { orderId: string; reason: string; evidenceUrls?: string[] }): Promise<Exchange> {
        return api.post<Exchange>('/exchanges/request', data);
    },

    async getMyRequests(): Promise<Exchange[]> {
        return api.get<Exchange[]>('/exchanges/me');
    },

    async getAll(): Promise<any[]> {
        return api.get<any[]>('/exchanges');
    },

    async updateStatus(id: string, data: { status: string; adminNotes?: string }): Promise<Exchange> {
        return api.patch<Exchange>(`/exchanges/${id}/status`, data);
    }
};
