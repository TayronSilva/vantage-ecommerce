import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { Product } from '../types';
import { productService } from '../services/products';
import ProductCard from '../components/products/ProductCard';

interface FilterState {
    priceRange: string[];
    promo: string[];
    gender: string[];
    category: string[];
    size: string[];
    color: string[];
}

interface StoreViewProps {
    onProductClick: (product: Product) => void;
    searchQuery?: string;
    activeCategory?: string | null;
}

const StoreView: React.FC<StoreViewProps> = ({ onProductClick, searchQuery = '', activeCategory: globalCategory = null }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('relevant');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [activeFilters, setActiveFilters] = useState<FilterState>({
        priceRange: [],
        promo: [],
        gender: [],
        category: globalCategory ? [globalCategory.toLowerCase()] : [],
        size: [],
        color: []
    });

    const filterOptions = useMemo(() => {

        const getPriceCount = (max: number) => products.filter(p => p.price <= max).length;
        const getPromoCount = (min: number) => products.filter(p => (p.discountPercentage || 0) >= min).length;
        const getGenderCount = (val: string) => products.filter(p => p.gender?.toLowerCase() === val.toLowerCase()).length;
        const getCategoryCount = (val: string) => {
            if (val === 'best-seller') return products.filter(p => p.isBestSeller).length;
            return products.filter(p => p.category.toLowerCase() === val.toLowerCase()).length;
        };

        return {
            price: [
                { label: 'Até R$99', value: '99', count: getPriceCount(99) },
                { label: 'Até R$199', value: '199', count: getPriceCount(199) },
                { label: 'Até R$399', value: '399', count: getPriceCount(399) }
            ],
            promo: [
                { label: 'A partir de 10% OFF', value: '10', count: getPromoCount(10) },
                { label: 'A partir de 20% OFF', value: '20', count: getPromoCount(20) },
                { label: 'A partir de 30% OFF', value: '30', count: getPromoCount(30) }
            ],
            gender: [
                { label: 'Homem', value: 'Homem', count: getGenderCount('Homem') },
                { label: 'Mulher', value: 'Mulher', count: getGenderCount('Mulher') },
                { label: 'Unissex', value: 'Unissex', count: getGenderCount('Unissex') }
            ],
            category: [
                { label: 'Best Seller', value: 'best-seller', count: getCategoryCount('best-seller') },
                { label: 'Casual', value: 'casual', count: getCategoryCount('casual') },
                { label: 'Esportivo', value: 'esportivo', count: getCategoryCount('esportivo') }
            ]
        };
    }, [products]);

    useEffect(() => {
        if (globalCategory !== undefined) {
            setActiveFilters(prev => ({
                ...prev,
                category: globalCategory ? [globalCategory.toLowerCase()] : []
            }));
        }
    }, [globalCategory]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productService.getAll();
                setProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                console.error('Erro ao buscar produtos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        let result = [...products];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query)
            );
        }


        if (activeFilters.priceRange.length > 0) {
            const maxPrice = Math.max(...activeFilters.priceRange.map(v => parseInt(v)));
            result = result.filter(p => p.price <= maxPrice);
        }

        if (activeFilters.promo.length > 0) {
            const minPromo = Math.min(...activeFilters.promo.map(v => parseInt(v)));
            result = result.filter(p => (p.discountPercentage || 0) >= minPromo);
        }

        if (activeFilters.gender.length > 0) {
            result = result.filter(p => activeFilters.gender.includes(p.gender || ''));
        }

        if (activeFilters.category.length > 0) {
            result = result.filter(p => {
                const isMatch = activeFilters.category.includes(p.category.toLowerCase());
                const isBestSeller = activeFilters.category.includes('best-seller') && p.isBestSeller;
                return isMatch || isBestSeller;
            });
        }

        if (sortBy === 'price-asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
            result.sort((b, a) => b.price - a.price);
        } else if (sortBy === 'new') {
            result.reverse();
        }

        setFilteredProducts(result);
    }, [activeFilters, sortBy, products, searchQuery]);

    const toggleFilter = (type: keyof FilterState, value: string) => {
        setActiveFilters(prev => {
            const current = prev[type];
            const next = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [type]: next };
        });
    };

    const FilterSidebar = ({ isMobile = false }) => (
        <div className={isMobile ? "space-y-10 pb-10" : "w-64 flex-shrink-0 space-y-10"}>
            {!isMobile && (
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-100">
                    <SlidersHorizontal size={20} />
                    <span className="font-black text-xs uppercase tracking-widest">Filtros</span>
                </div>
            )}

            <div>
                <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6">Preço</h3>
                <div className="space-y-4">
                    {filterOptions.price.map(f => (
                        <label key={f.value} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={activeFilters.priceRange.includes(f.value)}
                                className="w-5 h-5 rounded border-zinc-300 focus:ring-zinc-900 checked:bg-zinc-900"
                                onChange={() => toggleFilter('priceRange', f.value)}
                            />
                            <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-950 transition-colors">
                                {f.label} <span className="text-zinc-300 ml-1">({f.count})</span>
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6">Promo</h3>
                <div className="space-y-4">
                    {filterOptions.promo.map(f => (
                        <label key={f.value} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={activeFilters.promo.includes(f.value)}
                                className="w-5 h-5 rounded border-zinc-300 focus:ring-zinc-900 checked:bg-zinc-900"
                                onChange={() => toggleFilter('promo', f.value)}
                            />
                            <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-950 transition-colors">
                                {f.label} <span className="text-zinc-300 ml-1">({f.count})</span>
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6">Gênero</h3>
                <div className="space-y-4">
                    {filterOptions.gender.map(f => (
                        <label key={f.value} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={activeFilters.gender.includes(f.value)}
                                className="w-5 h-5 rounded border-zinc-300 focus:ring-zinc-900 checked:bg-zinc-900"
                                onChange={() => toggleFilter('gender', f.value)}
                            />
                            <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-950 transition-colors">
                                {f.label} <span className="text-zinc-300 ml-1">({f.count})</span>
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6">Categoria</h3>
                <div className="space-y-4">
                    {filterOptions.category.map(f => (
                        <label key={f.value} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={activeFilters.category.includes(f.value)}
                                className="w-5 h-5 rounded border-zinc-300 focus:ring-zinc-900 checked:bg-zinc-900"
                                onChange={() => toggleFilter('category', f.value)}
                            />
                            <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-950 transition-colors">
                                {f.label} <span className="text-zinc-300 ml-1">({f.count})</span>
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-16 py-8 md:py-12">
            <div className="mb-8 md:mb-10">
                <div className="bg-zinc-900 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden relative min-h-[180px] md:min-h-[220px] lg:min-h-[250px] flex items-center p-6 md:p-10 lg:p-16">
                    <div className="z-10 max-w-xl">
                        <h1 className="text-zinc-100 text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-3 uppercase">
                            Catálogo
                        </h1>
                        <p className="text-zinc-400 text-sm md:text-base font-medium">
                            Explore nossa coleção exclusiva com design minimalista e qualidade premium.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                <aside className="hidden lg:block">
                    <FilterSidebar />
                </aside>

                <div className={`fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100] transition-opacity duration-500 lg:hidden ${isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsFilterOpen(false)} />
                <div className={`fixed right-0 top-0 h-full w-full max-w-[320px] bg-white z-[110] shadow-2xl transition-transform duration-500 transform lg:hidden ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
                    <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                        <span className="font-black text-sm uppercase tracking-widest">Filtros</span>
                        <button onClick={() => setIsFilterOpen(false)} className="w-10 h-10 border border-zinc-100 rounded-full flex items-center justify-center">
                            <ChevronDown className="rotate-90" size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">
                        <FilterSidebar isMobile />
                    </div>
                    <div className="p-6 border-t border-zinc-100">
                        <button
                            onClick={() => setIsFilterOpen(false)}
                            className="w-full bg-zinc-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest"
                        >
                            Ver {filteredProducts.length} Resultados
                        </button>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 md:mb-10">
                        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                            <button
                                onClick={() => setIsFilterOpen(true)}
                                className="lg:hidden flex items-center gap-2 px-6 py-3 border border-zinc-200 rounded-xl font-black text-xs uppercase tracking-widest hover:border-zinc-900 transition-all"
                            >
                                <SlidersHorizontal size={16} /> Filtrar
                            </button>
                            <span className="font-black text-[10px] md:text-xs uppercase tracking-widest text-zinc-400">
                                {filteredProducts.length} Produtos
                            </span>
                        </div>

                        <div className="relative group w-full sm:w-auto">
                            <select
                                className="w-full sm:w-auto appearance-none bg-white border border-zinc-200 px-6 py-3 pr-12 rounded-xl font-black text-xs uppercase tracking-widest outline-none hover:border-zinc-900 transition-all cursor-pointer"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="relevant">MAIS RELEVANTES</option>
                                <option value="price-asc">MENOR PREÇO</option>
                                <option value="price-desc">MAIOR PREÇO</option>
                                <option value="new">LANÇAMENTOS</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" size={16} />
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-[4/5] bg-zinc-50 rounded-[2.5rem] animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={onProductClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoreView;
