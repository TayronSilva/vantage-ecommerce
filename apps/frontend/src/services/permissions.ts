import { api } from './api';

export const permissionService = {
    async getRules(): Promise<any[]> {
        return api.get<any[]>('/permissions/rules');
    },

    async getProfiles(): Promise<any[]> {
        return api.get<any[]>('/permissions/profiles');
    },

    async createProfile(data: { name: string; description?: string; ruleIds: number[] }): Promise<any> {
        return api.post<any>('/permissions/profiles', data);
    },

    async updateProfile(id: number, data: { name?: string; description?: string; ruleIds?: number[] }): Promise<any> {
        return api.put<any>(`/permissions/profiles/${id}`, data);
    },

    async deleteProfile(id: number): Promise<void> {
        return api.delete(`/permissions/profiles/${id}`);
    },

    async assignProfile(userId: number, profileId: number): Promise<void> {
        return api.post(`/permissions/users/${userId}/profiles/${profileId}`, {});
    },

    async removeProfile(userId: number, profileId: number): Promise<void> {
        return api.delete(`/permissions/users/${userId}/profiles/${profileId}`);
    }
};
