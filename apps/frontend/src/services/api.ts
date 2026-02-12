
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
    private getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    public async requestRaw(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const token = this.getToken();
        const headers = new Headers(options.headers);

        if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            window.dispatchEvent(new Event('auth_unauthorized'));
        }

        return response;
    }

    public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await this.requestRaw(endpoint, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Erro na requisição');
        }

        return (result && typeof result === 'object' && 'data' in result) ? result.data : result;
    }

    get<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    post<T>(endpoint: string, body: any) {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    patch<T>(endpoint: string, body: any) {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    put<T>(endpoint: string, body: any) {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }
}

export const api = new ApiService();
