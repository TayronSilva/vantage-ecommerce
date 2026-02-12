import { api } from './api';

export interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        name: string;
        email?: string;
    };
    product?: {
        name: string;
    };
}

export interface AverageRating {
    average: number;
    count: number;
}

export const reviewService = {
    async getAll(): Promise<Review[]> {
        return api.get<Review[]>('/reviews');
    },

    async create(data: { rating: number; comment?: string; productId: string }): Promise<Review> {
        return api.post<Review>('/reviews', data);
    },

    async getByProductId(productId: string): Promise<Review[]> {
        return api.get<Review[]>(`/reviews/product/${productId}`);
    },

    async getAverageRating(productId: string): Promise<AverageRating> {
        return api.get<AverageRating>(`/reviews/product/${productId}/average`);
    },

    async delete(id: string): Promise<void> {
        return api.delete(`/reviews/${id}`);
    }
};
