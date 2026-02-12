import React from 'react';
import { Star, Heart } from 'lucide-react';
import type { Product } from '../../types';
import { wishlistService } from '../../services/wishlist';

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
    const [activeColorIdx, setActiveColorIdx] = React.useState(0);
    const [isFav, setIsFav] = React.useState(wishlistService.isFavorite(product.id));

    React.useEffect(() => {
        const handleUpdate = () => setIsFav(wishlistService.isFavorite(product.id));
        window.addEventListener('wishlist_updated', handleUpdate);
        return () => window.removeEventListener('wishlist_updated', handleUpdate);
    }, [product.id]);

    const handleToggleFav = (e: React.MouseEvent) => {
        e.stopPropagation();
        const state = wishlistService.toggleFavorite(product);
        setIsFav(state);
    };

    return (
        <div
            className="group cursor-pointer product-card-anim"
            onClick={() => onClick(product)}
        >
            <div className="aspect-[4/5] bg-zinc-50 rounded-[2rem] md:rounded-[2.5rem] p-6 lg:p-8 relative overflow-hidden flex items-center justify-center transition-all border border-zinc-100 group-hover:bg-white group-hover:border-zinc-300 group-hover:shadow-2xl group-hover:shadow-zinc-200/50">
                {product.stockQuantity === 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                        <span className="bg-zinc-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">Indisponível</span>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 lg:top-6 lg:left-6 flex flex-col gap-2 z-30">
                    {product.isBestSeller && (
                        <span className="bg-white border border-zinc-900 text-zinc-900 px-2 py-0.5 lg:px-3 lg:py-1 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-widest">
                            BEST SELLER
                        </span>
                    )}
                    {product.oldPrice && (
                        <span className="bg-zinc-900 text-white px-2 py-0.5 lg:px-3 lg:py-1 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-widest">
                            {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                        </span>
                    )}
                </div>

                <div className="absolute top-4 right-4 lg:top-6 lg:right-6 flex flex-col gap-3 z-30">
                    <button
                        className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center shadow-sm transition-all backdrop-blur-md ${isFav ? 'bg-zinc-900 text-white shadow-zinc-900/20' : 'bg-white/80 hover:bg-white text-zinc-400 hover:text-red-500'}`}
                        onClick={handleToggleFav}
                    >
                        <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                    </button>
                </div>
                <img
                    src={product.colors[activeColorIdx].img}
                    className="product-image w-full h-full object-contain transition-all duration-700 group-hover:scale-110 mix-blend-multiply"
                    alt={product.name}
                />
            </div>
            <div className="mt-4 lg:mt-6 flex justify-between items-start px-2">
                <div className="flex-1">
                    <h3 className="font-bold text-base lg:text-lg leading-tight mb-1 lg:mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-2">{product.name}</h3>
                    <div className="flex gap-1 mb-1 lg:mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={12}
                                fill={i < product.rating ? "currentColor" : "none"}
                                className={i < product.rating ? "text-yellow-400" : "text-zinc-200"}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                        <span className="font-black text-xl lg:text-2xl">R$ {product.price.toFixed(2)}</span>
                        {product.oldPrice && (
                            <span className="text-zinc-400 line-through text-[10px] lg:text-sm font-bold">R$ {product.oldPrice.toFixed(2)}</span>
                        )}
                    </div>
                </div>
                <div className="flex gap-1.5 lg:gap-2 pt-1 lg:pt-2">
                    {product.colors.map((c, idx) => (
                        <button
                            key={c.hex}
                            onMouseEnter={(e) => { e.stopPropagation(); setActiveColorIdx(idx); }}
                            onClick={(e) => { e.stopPropagation(); setActiveColorIdx(idx); }}
                            className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full border-2 transition-all ${activeColorIdx === idx ? 'border-zinc-900 scale-125' : 'border-zinc-200 hover:scale-110'}`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
