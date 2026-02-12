import type { Product } from '../types';

const WISHLIST_KEY = 'vantage_wishlist';

export const wishlistService = {
    getWishlist(): Product[] {
        const stored = localStorage.getItem(WISHLIST_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    toggleFavorite(product: Product): boolean {
        const wishlist = this.getWishlist();
        const index = wishlist.findIndex(p => p.id === product.id);

        if (index > -1) {
            wishlist.splice(index, 1);
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
            window.dispatchEvent(new Event('wishlist_updated'));
            return false;
        } else {
            wishlist.push(product);
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
            window.dispatchEvent(new Event('wishlist_updated'));
            return true;
        }
    },

    isFavorite(productId: number): boolean {
        const wishlist = this.getWishlist();
        return wishlist.some(p => p.id === productId);
    }
};
