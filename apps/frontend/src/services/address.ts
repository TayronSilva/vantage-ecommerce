import { api } from './api';
import type { Address } from '../types';

export const addressService = {
    async getMyAddresses(): Promise<Address[]> {
        return api.get<Address[]>('/address/me');
    },

    async create(data: Partial<Address>): Promise<Address> {
        return api.post<Address>('/address', data);
    },

    async update(id: number, data: Partial<Address>): Promise<Address> {
        return api.patch<Address>(`/address/${id}`, data);
    },

    async setDefault(id: number): Promise<void> {
        return api.patch(`/address/${id}/set-default`, {});
    },

    async delete(id: number): Promise<void> {
        return api.delete(`/address/${id}`);
    }
};
