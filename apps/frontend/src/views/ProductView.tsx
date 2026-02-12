import React, { useState, useEffect } from 'react';
import {
    Star,
    ShoppingCart,
    ShieldCheck,
    Truck,
    ArrowLeft,
    Share2,
    Heart,
    MessageSquare,
    User,
    Loader2,
    ChevronDown
} from 'lucide-react';
import { reviewService, type Review } from '../services/reviews';
import { useAuth } from '../context/AuthContext';

interface ProductViewProps {
    product: any;
    onBack: () => void;
    onAddToCart: (product: any, colorIdx: number, quantity: number) => void;
}

const ProductView: React.FC<ProductViewProps> = ({ product, onBack, onAddToCart }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const { isAuthenticated } = useAuth();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });

    useEffect(() => {
        const fetchReviews = async () => {
            if (!product.id) return;
            setLoadingReviews(true);
            try {
                const [reviewsData, ratingData] = await Promise.all([
                    reviewService.getByProductId(product.id),
                    reviewService.getAverageRating(product.id)
                ]);
                setReviews(reviewsData);
                setAverageRating(ratingData);
            } catch (error) {
                console.error('Erro ao buscar reviews:', error);
            } finally {
                setLoadingReviews(false);
            }
        };
        fetchReviews();
    }, [product.id]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await reviewService.create({
                ...newReview,
                productId: product.id
            });
            setNewReview({ rating: 5, comment: '' });
            const [updatedReviews, updatedRating] = await Promise.all([
                reviewService.getByProductId(product.id),
                reviewService.getAverageRating(product.id)
            ]);
            setReviews(updatedReviews);
            setAverageRating(updatedRating);
        } catch (error) {
            console.error('Erro ao enviar review:', error);
            alert('Erro ao enviar avaliação. Tente novamente mais tarde.');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F0F0] text-zinc-900 selection:bg-zinc-900 selection:text-white pb-20 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <nav className="max-w-[1400px] mx-auto px-6 py-10 md:py-14 relative z-10">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-900 transition-all"
                >
                    <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-zinc-900 transition-colors">
                        <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <span>Voltar ao Acervo</span>
                </button>
            </nav>

            <main className="max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32 items-start">

                    <div className="flex flex-col md:flex-row gap-8 lg:sticky lg:top-10">
                        <div className="order-2 md:order-1 flex md:flex-col gap-4">
                            {product.images?.map((img: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-14 h-14 md:w-20 md:h-20 rounded-3xl overflow-hidden border-2 transition-all p-1 flex-shrink-0 ${selectedImage === idx ? 'border-zinc-900 shadow-2xl scale-110 bg-white' : 'border-transparent opacity-30 hover:opacity-100 hover:scale-105'
                                        }`}
                                >
                                    <img src={img.url} alt="" className="w-full h-full object-cover rounded-2xl" />
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 order-1 md:order-2 bg-white rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden relative aspect-[4/5] max-h-[800px] group/stage border border-white">
                            <img
                                src={product.images?.[selectedImage]?.url || product.images?.[0]?.url || '/assets/products/placeholder.jpg'}
                                alt={product.name}
                                className="w-full h-full object-contain p-12 transition-transform duration-700 group-hover/stage:scale-105"
                            />

                            <div className="absolute top-10 right-10 flex flex-col gap-4">
                                <button className="w-14 h-14 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl hover:bg-zinc-900 hover:text-white transition-all active:scale-90 group/btn">
                                    <Heart size={22} className="group-hover/btn:scale-110 transition-transform" />
                                </button>
                                <button className="w-14 h-14 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl hover:bg-zinc-900 hover:text-white transition-all active:scale-90 group/btn">
                                    <Share2 size={22} className="group-hover/btn:scale-110 transition-transform" />
                                </button>
                            </div>

                            <div className="absolute bottom-10 left-10 flex items-center gap-3 bg-zinc-900/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Estoque Limitado</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col pt-6 lg:pt-16">
                        <div className="space-y-12">
                            <header className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="bg-blue-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-500/20">
                                        Vantage Lab
                                    </span>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400/5 rounded-full border border-yellow-400/10">
                                        <Star size={14} fill="#fbbf24" className="text-yellow-400" />
                                        <span className="text-[12px] font-black text-yellow-700">{averageRating.average.toFixed(1)}</span>
                                    </div>
                                </div>

                                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-[-0.05em] leading-[0.85] text-zinc-900">
                                    {product.name}
                                </h1>
                                <div className="flex items-baseline gap-4">
                                    <p className="text-4xl font-black text-zinc-900 tracking-tighter">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                    </p>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Em 12x sem juros</span>
                                </div>
                            </header>

                            <p className="text-zinc-500 text-lg md:text-xl leading-relaxed font-medium max-w-lg border-l-4 border-zinc-100 pl-8">
                                {product.description}
                            </p>

                            <div className="space-y-8 pt-6">
                                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                                    <div className="flex items-center bg-white border border-zinc-100 rounded-3xl p-1.5 h-20 shadow-xl shadow-zinc-200/50 flex-shrink-0">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-16 h-full flex items-center justify-center text-2xl font-light hover:bg-zinc-50 rounded-2xl transition-all active:scale-90"
                                        >-</button>
                                        <span className="w-12 text-center font-black text-lg">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-16 h-full flex items-center justify-center text-2xl font-light hover:bg-zinc-50 rounded-2xl transition-all active:scale-90"
                                        >+</button>
                                    </div>
                                    <button
                                        onClick={() => onAddToCart(product, 0, quantity)}
                                        className="flex-1 h-20 bg-zinc-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-5 hover:bg-blue-600 transition-all active:scale-[0.97] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:shadow-blue-500/30 group/buy"
                                    >
                                        <ShoppingCart size={22} className="group-hover/buy:scale-110 transition-transform" />
                                        Obter Agora
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pb-6">
                                <div className="group/feature bg-white/40 border border-white p-8 rounded-[3rem] transition-all hover:bg-white hover:shadow-2xl hover:shadow-zinc-200/50">
                                    <Truck size={24} className="mb-4 text-zinc-400 group-hover/feature:text-zinc-900 transition-colors" />
                                    <p className="text-[12px] font-black uppercase tracking-widest text-zinc-900">Priority Ship</p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-2 leading-relaxed">Logística Vantage Premium em 24h</p>
                                </div>
                                <div className="group/feature bg-white/40 border border-white p-8 rounded-[3rem] transition-all hover:bg-white hover:shadow-2xl hover:shadow-zinc-200/50">
                                    <ShieldCheck size={24} className="mb-4 text-zinc-400 group-hover/feature:text-zinc-900 transition-colors" />
                                    <p className="text-[12px] font-black uppercase tracking-widest text-zinc-900">Eterna</p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-2 leading-relaxed">Garantia vitalícia contra o tempo</p>
                                </div>
                            </div>

                            <div className="border-t border-zinc-200 divide-y divide-zinc-100">
                                {[
                                    { title: 'DNA Tecnológico', content: 'Desenvolvido com polímero aeroespacial Vantage-X. Projetado para resistir a décadas de uso sem fadiga estrutural.' },
                                    { title: 'Sustentabilidade Reativa', content: '100% dos materiais são de fonte regenerativa. Compensação automática de carbono em cada transação Vantage.' },
                                    { title: 'Dimensões Elite', content: 'Engenharia de volume inteligente de 30L em chassi ultra-compacto de 46cm. Perfeito para cabine executiva.' }
                                ].map(item => (
                                    <AccordionItem key={item.title} title={item.title} content={item.content} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <section className="max-w-[1400px] mx-auto px-6 mt-48 relative z-10">
                <div className="flex flex-col xl:flex-row justify-between items-end gap-12 mb-32">
                    <div className="space-y-6">
                        <span className="text-blue-600 font-black text-sm uppercase tracking-[0.6em] block">Coletivo Vantage</span>
                        <h2 className="text-6xl md:text-9xl font-black tracking-[-0.08em] uppercase leading-[0.75] text-zinc-900">
                            Fatos &<br />Evidências
                        </h2>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12 bg-white/60 backdrop-blur-3xl p-16 rounded-[4rem] shadow-2xl border border-white">
                        <div className="text-center md:text-left">
                            <p className="text-9xl font-black tracking-tighter leading-none text-zinc-900">{averageRating.average.toFixed(1)}</p>
                            <p className="text-[11px] font-black text-zinc-600 uppercase mt-6 tracking-[0.3em]">Média de Satisfação</p>
                        </div>
                        <div className="h-24 w-px bg-zinc-200 hidden md:block" />
                        <div className="flex flex-col gap-3 w-56">
                            {[5, 4, 3, 2, 1].map((n) => (
                                <div key={n} className="group/bar flex items-center gap-4">
                                    <span className="text-[10px] font-black w-2 text-zinc-800 transition-colors">{n}</span>
                                    <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden p-0.5">
                                        <div
                                            className="h-full bg-zinc-900 rounded-full transition-all duration-[2000ms] shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                                            style={{ width: `${averageRating.count > 0 ? (reviews.filter(r => r.rating === n).length / averageRating.count) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] font-black text-zinc-600 w-8">{reviews.filter(r => r.rating === n).length}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    <aside className="lg:col-span-4 lg:sticky lg:top-10">
                        {isAuthenticated ? (
                            <div className="bg-zinc-900 text-white p-14 rounded-[4rem] shadow-2xl relative group overflow-hidden border border-white/5">
                                <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-1000 blur-3xl" />
                                <div className="relative z-10">
                                    <h4 className="text-3xl font-black uppercase mb-3 tracking-tighter">Sua Voz</h4>
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-14 leading-relaxed">Exerça seu poder de crítica</p>

                                    <form onSubmit={handleSubmitReview} className="space-y-12">
                                        <div className="flex gap-4">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                                                    className="transition-all hover:scale-125 active:scale-90"
                                                >
                                                    <Star
                                                        size={36}
                                                        fill={star <= newReview.rating ? "#fbbf24" : "none"}
                                                        className={star <= newReview.rating ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-white/10"}
                                                    />
                                                </button>
                                            ))}
                                        </div>

                                        <div className="space-y-6">
                                            <textarea
                                                value={newReview.comment}
                                                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                                placeholder="Como a Vantage mudou sua perspectiva?"
                                                className="w-full h-52 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-base font-medium outline-none focus:ring-4 ring-blue-500/20 focus:bg-white/10 transition-all resize-none placeholder:text-zinc-600 text-white"
                                                required
                                            />
                                            <button
                                                type="submit"
                                                disabled={submittingReview}
                                                className="w-full h-20 bg-white text-zinc-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 shadow-2xl"
                                            >
                                                {submittingReview ? <Loader2 size={24} className="animate-spin" /> : <MessageSquare size={24} />}
                                                Firmar no Quadro
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="p-20 text-center bg-white rounded-[5rem] border border-zinc-100 shadow-xl flex flex-col items-center justify-center gap-10 min-h-[550px]">
                                <div className="w-32 h-32 bg-zinc-50 rounded-[3.5rem] flex items-center justify-center text-zinc-200 border-4 border-zinc-100/50">
                                    <User size={64} strokeWidth={1} />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-zinc-900 font-black uppercase text-xl tracking-tight">Portal de Clientes</p>
                                    <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px] max-w-[240px] leading-loose mx-auto">
                                        Identificação necessária para registrar evidências de uso no ecossistema Vantage.
                                    </p>
                                </div>
                            </div>
                        )}
                    </aside>

                    <div className="lg:col-span-8">
                        {loadingReviews ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-80 bg-white/60 rounded-[4rem] animate-pulse border border-white shadow-sm" />
                                ))}
                            </div>
                        ) : reviews.length > 0 ? (
                            <div className="columns-1 md:columns-2 gap-12 space-y-12">
                                {reviews.map(review => (
                                    <div key={review.id} className="break-inside-avoid p-12 bg-white/80 backdrop-blur-sm border border-white rounded-[4rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:-translate-y-4 hover:bg-white transition-all duration-700 group">
                                        <div className="flex items-center gap-5 mb-10">
                                            <div className="w-16 h-16 bg-zinc-900 text-white rounded-[1.75rem] flex items-center justify-center font-black text-2xl group-hover:bg-blue-600 transition-all duration-500 shadow-xl shadow-zinc-900/10">
                                                {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'V'}
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-base font-black uppercase tracking-tighter text-zinc-900">{review.user?.name || 'Membro Vantage'}</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} fill={i < review.rating ? "#fbbf24" : "none"} className={i < review.rating ? "text-yellow-400" : "text-zinc-200"} />
                                                        ))}
                                                    </div>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-100" />
                                                    <span className="text-[10px] text-zinc-300 font-black uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-base md:text-lg text-zinc-500 leading-relaxed font-semibold mb-10 italic">
                                            "{review.comment}"
                                        </p>
                                        <footer className="flex items-center gap-3 pt-10 border-t border-zinc-50 opacity-60">
                                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Autenticidade Vantage Assegurada</span>
                                        </footer>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white/40 rounded-[5rem] border-4 border-white border-dashed">
                                <MessageSquare size={64} className="text-zinc-100 mb-8" />
                                <p className="text-2xl font-black uppercase tracking-tight text-zinc-900">Território Aberto</p>
                                <p className="text-zinc-400 font-bold uppercase tracking-[0.3em] text-[11px] mt-4 border-y border-zinc-100 py-4 px-8">Aguardando seu veredito elite.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

const AccordionItem: React.FC<{ title: string; content: string }> = ({ title, content }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-transparent group/acc">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-8 flex justify-between items-center cursor-pointer transition-all"
            >
                <div className="flex items-center gap-6">
                    <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isOpen ? 'bg-blue-600 scale-125' : 'bg-zinc-200'}`} />
                    <span className={`font-black text-sm uppercase tracking-[0.3em] transition-all duration-500 ${isOpen ? 'text-zinc-900 translate-x-3' : 'text-zinc-400'}`}>
                        {title}
                    </span>
                </div>
                <ChevronDown size={22} className={`transition-transform duration-700 text-zinc-300 group-hover/acc:text-zinc-900 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-700 ease-out ${isOpen ? 'max-h-80 pb-12 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pl-9 pr-12">
                    <p className="text-[11px] md:text-xs font-black text-zinc-400 leading-loose uppercase tracking-[0.2em]">
                        {content}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductView;
