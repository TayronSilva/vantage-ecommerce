import { api } from './api';
import type { Product } from '../types';

export const productService = {
    async getAll(): Promise<Product[]> {
        const response = await api.get<any[]>('/products');
        return response.map(p => this.mapToFrontend(p));
    },

    async getCategories(): Promise<any[]> {
        return api.get<any[]>('/categories');
    },

    async getById(id: number): Promise<Product> {
        const response = await api.get<any>(`/products/${id}`);
        return this.mapToFrontend(response);
    },

    mapToFrontend(p: any): Product {
        const colorMap: Record<string, string> = {
            'Preto': '#000000',
            'Branco': '#FFFFFF',
            'Azul': '#0000FF',
            'Vermelho': '#FF0000',
            'Verde': '#008000',
            'Amarelo': '#FFFF00',
            'Rosa': '#FFC0CB',
            'Cinza': '#808080',
            'Marrom': '#8B4513',
            'Bege': '#F5F5DC',
            'Laranja': '#FFA500',
            'Roxo': '#800080',
            'Ciano': '#00FFFF',
            'Magenta': '#FF00FF',
        };

        return {
            id: p.id,
            name: p.name,
            price: Number(p.price),
            description: p.description,
            category: p.category?.name || 'Casual',
            rating: p.rating || 5,
            stockQuantity: p.stocks?.reduce((acc: number, s: any) => acc + s.quantity, 0) || 0,
            images: p.images || [],
            colors: p.stocks?.length > 0 ? p.stocks.map((s: any) => {
                return {
                    name: s.color || 'Padrão',
                    hex: colorMap[s.color] || '#000000',
                    img: p.images?.find((img: any) => img.isMain)?.url || p.images?.[0]?.url || '/assets/products/placeholder.jpg',
                    stockId: s.id
                };
            }) : [
                {
                    name: 'Padrão',
                    hex: '#000000',
                    img: p.images?.find((img: any) => img.isMain)?.url || p.images?.[0]?.url || '/assets/products/placeholder.jpg',
                    stockId: ''
                }
            ]
        };
    },

    async create(data: any): Promise<Product> {
        return api.post<Product>('/products', data);
    },

    async update(id: number, data: Partial<Product>): Promise<Product> {
        return api.patch<Product>(`/products/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        return api.delete(`/products/${id}`);
    },

    async getStocks(): Promise<any[]> {
        return api.get<any[]>('/stocks');
    },

    async updateStock(id: string, data: any): Promise<any> {
        return api.patch<any>(`/stocks/${id}`, data);
    },

    async createStock(data: any): Promise<any> {
        return api.post<any>('/stocks', data);
    },

    async deleteStock(id: string): Promise<void> {
        return api.delete(`/stocks/${id}`);
    }
};
