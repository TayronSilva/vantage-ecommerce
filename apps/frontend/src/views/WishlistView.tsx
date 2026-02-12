import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { wishlistService } from '../services/wishlist';
import type { Product } from '../types';
import ProductCard from '../components/products/ProductCard';

interface WishlistViewProps {
    onProductClick: (product: Product) => void;
}

export default function WishlistView({ onProductClick }: WishlistViewProps) {
    const [wishlist, setWishlist] = useState<Product[]>([]);

    useEffect(() => {
        setWishlist(wishlistService.getWishlist());

        const handleUpdate = () => {
            setWishlist(wishlistService.getWishlist());
        };

        window.addEventListener('wishlist_updated', handleUpdate);
        return () => window.removeEventListener('wishlist_updated', handleUpdate);
    }, []);

    return (
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 py-12">
            <div className="mb-16 text-center">
                <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">Sua Curadoria</span>
                <h2 className="text-5xl font-black tracking-tighter uppercase mt-2">Lista de Desejos</h2>
                <div className="w-20 h-1 bg-zinc-900 mx-auto mt-6 rounded-full" />
            </div>

            {wishlist.length === 0 ? (
                <div className="text-center py-32 bg-zinc-50/50 rounded-[4rem] border-4 border-dashed border-zinc-100 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-zinc-200/50 mb-8">
                        <Heart size={40} className="text-zinc-200" />
                    </div>
                    <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-sm mb-8">Sua lista está vazia por enquanto</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-zinc-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-zinc-300 flex items-center gap-3"
                    >
                        Explorar Coleções <ArrowRight size={18} />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {wishlist.map(product => (
                        <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ProductCard
                                product={product}
                                onClick={onProductClick}
                            />
                        </div>
                    ))}
                </div>
            )}

            {wishlist.length > 0 && (
                <div className="mt-20 p-12 bg-zinc-900 rounded-[3rem] text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Gostou das suas escolhas?</h3>
                        <p className="text-zinc-400 font-medium mb-8 max-w-md mx-auto">Aproveite para garantir seus itens favoritos antes que o estoque acabe.</p>
                        <button className="bg-white text-zinc-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                            Adicionar Tudo ao Carrinho
                        </button>
                    </div>
                    <ShoppingBag size={200} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
                </div>
            )}
        </div>
    );
}
