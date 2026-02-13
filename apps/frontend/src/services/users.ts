import { api } from './api';

export const userService = {
    async getAll(): Promise<any[]> {
        return api.get<any[]>('/users');
    },

    async createInternal(data: any): Promise<any> {
        return api.post<any>('/users/internal', data);
    },

    async deactivate(id: number): Promise<{ id: number; email: string; isActive: boolean }> {
        return api.patch(`/users/${id}/deactivate`, {});
    },

    async update(id: number, data: any): Promise<any> {
        return api.patch<any>(`/users/${id}`, data);
    },

    async updateMe(data: any): Promise<any> {
        return api.patch<any>('/users/me', data);
    }
};
