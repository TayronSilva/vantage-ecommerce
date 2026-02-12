import React, { useEffect, useState } from 'react';
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { productService } from '../services/products';
import type { Product } from '../types';
import ProductCard from '../components/products/ProductCard';

interface HomeViewProps {
    onProductClick: (product: Product) => void;
    onCategorySelect: (category: string | null) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onProductClick, onCategorySelect }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [productsData] = await Promise.all([
                    productService.getAll(),
                    productService.getCategories()
                ]);
                setProducts(productsData);

                const requestedCategories = [
                    { id: 'casual', name: 'Casual', icon: '🎒' },
                    { id: 'escolar', name: 'Escolar', icon: '📚' },
                    { id: 'executivo', name: 'Executivo', icon: '💼' },
                    { id: 'viagem', name: 'Viagem', icon: '✈️' }
                ];
                setCategories(requestedCategories);
            } catch (error) {
                console.error('Erro ao buscar dados iniciais:', error);
            } finally {
                setLoading(false);
                setCategoriesLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    return (
        <div className="animate-in fade-in duration-700">
            <section className="px-4 md:px-16 py-6 md:py-10">
                <div className="w-full min-h-[380px] md:min-h-[480px] lg:min-h-[520px] bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden flex items-center border border-zinc-200/50">
                    <div className="px-8 md:px-24 z-10 max-w-2xl py-12 md:py-16">
                        <span className="bg-zinc-900 text-white px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[9px] md:text-[11px] font-bold uppercase tracking-[0.15em]">Nova Coleção 2026</span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.02em] mt-5 md:mt-6 leading-[0.95]">
                            ESSENCIAIS<br />COM TECNOLOGIA
                        </h1>
                        <p className="mt-6 md:mt-8 text-zinc-600 text-sm md:text-base font-medium max-w-sm md:max-w-md leading-relaxed">
                            Design minimalista encontra funcionalidade premium. Descubra produtos que elevam sua rotina diária.
                        </p>
                        <button
                            onClick={() => onCategorySelect(null)}
                            className="mt-8 md:mt-10 bg-zinc-900 text-white px-10 py-4 md:px-12 md:py-5 rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.1em] hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                            Explorar Agora
                        </button>
                    </div>
                    <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
                        <div className="absolute inset-0 bg-gradient-to-l from-white/80 to-transparent" />
                        {products.length > 0 && (
                            <img
                                src={products[0].colors[0].img}
                                className="product-image w-full h-full object-contain p-24 mix-blend-multiply rotate-6 scale-110"
                                alt="Destaque"
                            />
                        )}
                    </div>
                </div>
            </section>

            <section className="px-6 md:px-16 py-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoriesLoading ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="h-48 bg-zinc-50 rounded-[2rem] border border-zinc-100 animate-pulse" />
                        ))
                    ) : (
                        categories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => onCategorySelect(cat.name)}
                                className="group cursor-pointer relative h-48 bg-zinc-50 rounded-[2rem] border border-zinc-100 flex flex-col items-center justify-center transition-all hover:bg-white hover:shadow-2xl hover:-translate-y-2"
                            >
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm mb-4 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors text-xl">
                                    {cat.icon || <Plus size={20} />}
                                </div>
                                <span className="font-black text-lg uppercase tracking-tighter">{cat.name}</span>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className="px-6 md:px-16 py-16 overflow-hidden">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.3em] mb-3 block">Recomendados</span>
                        <h2 className="text-4xl font-black tracking-tighter uppercase">OS MAIS DESEJADOS</h2>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { document.getElementById('product-carousel')?.scrollBy({ left: -400, behavior: 'smooth' }) }}
                            className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <button
                            onClick={() => { document.getElementById('product-carousel')?.scrollBy({ left: 400, behavior: 'smooth' }) }}
                            className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
                    </div>
                ) : (
                    <div
                        id="product-carousel"
                        className="flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto no-scrollbar pb-10 snap-x snap-mandatory"
                    >
                        {products.map(p => (
                            <div key={p.id} className="min-w-[260px] md:min-w-[320px] lg:min-w-[360px] snap-start">
                                <ProductCard product={p} onClick={onProductClick} />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomeView;
