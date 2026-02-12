import { api } from './api';

export const userService = {
    async getAll(): Promise<any[]> {
        return api.get<any[]>('/users');
    },

    async createInternal(data: any): Promise<any> {
        return api.post<any>('/users/internal', data);
    },

    async delete(id: number): Promise<void> {
        return api.delete(`/users/${id}`);
    },

    async update(id: number, data: any): Promise<any> {
        return api.patch<any>(`/users/${id}`, data);
    },

    async updateMe(data: any): Promise<any> {
        return api.patch<any>('/users/me', data);
    }
};
