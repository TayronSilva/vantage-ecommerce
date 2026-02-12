import { api } from './api';
import type { AuthResponse, User } from '../types';

export const authService = {
    async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        localStorage.setItem('auth_token', response.access_token);
        return response;
    },

    async register(data: any): Promise<User> {
        return api.post<User>('/users', data);
    },

    async getMe(): Promise<User> {
        return api.get<User>('/users/me');
    },

    async updateProfile(data: Partial<User>): Promise<User> {
        return api.patch<User>('/users/me', data);
    },

    logout() {
        localStorage.removeItem('auth_token');
    }
};
