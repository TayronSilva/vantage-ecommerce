import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Trash2,
    User,
    Package,
    Star,
    Calendar,
    ShieldAlert,
    ArrowLeft,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { reviewService, type Review } from '../../services/reviews';

interface ModerationViewProps {
    onBack?: () => void;
}

const ModerationView: React.FC<ModerationViewProps> = ({ onBack }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const data = await reviewService.getAll();
            setReviews(data);
        } catch (error) {
            console.error('Erro ao buscar reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover esta avaliação? Esta ação é irreversível.')) return;

        setDeletingId(id);
        try {
            await reviewService.delete(id);
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error) {
            console.error('Erro ao deletar review:', error);
            alert('Não foi possível remover a avaliação.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 selection:bg-zinc-900 selection:text-white pb-20 relative overflow-hidden font-sans">
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-multiply z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <header className="max-w-[1400px] mx-auto px-6 py-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-zinc-900 text-white rounded-2xl shadow-xl shadow-zinc-900/20">
                                <ShieldAlert size={24} />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Moderation Hub</h2>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 mb-4">
                            Gestão de <span className="text-zinc-400">Conteúdo</span>
                        </h1>
                        <p className="text-zinc-500 font-medium max-w-xl leading-relaxed">
                            Monitore as interações dos clientes e garanta um ambiente seguro e profissional para a comunidade Vantage.
                        </p>
                    </div>

                    {onBack && (
                        <button
                            onClick={onBack}
                            className="group flex items-center gap-4 py-4 px-8 bg-white border border-zinc-100 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:shadow-xl hover:border-zinc-900 transition-all active:scale-95"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Painel Admin
                        </button>
                    )}
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto px-6 mb-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Total Reviews', value: reviews.length, icon: MessageSquare, color: 'text-blue-600' },
                        { label: 'Rating Médio', value: (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1), icon: Star, color: 'text-amber-500' },
                        { label: 'Alertas', value: 0, icon: ShieldAlert, color: 'text-rose-500' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white/60 backdrop-blur-md border border-white p-8 rounded-[2.5rem] shadow-sm flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all duration-500">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{stat.label}</p>
                                <p className="text-4xl font-black tracking-tighter">{stat.value}</p>
                            </div>
                            <div className={`p-4 bg-white rounded-2xl shadow-inner ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-6 relative z-10">
                {loading ? (
                    <div className="h-[400px] bg-white/40 backdrop-blur-sm border border-white rounded-[3rem] flex flex-col items-center justify-center gap-6">
                        <Loader2 size={40} className="animate-spin text-zinc-300" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Sincronizando Feed...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="h-[400px] bg-white border border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center gap-6">
                        <div className="p-8 bg-zinc-50 rounded-full">
                            <CheckCircle2 size={48} className="text-zinc-200" />
                        </div>
                        <p className="text-zinc-400 font-medium text-lg">Nenhuma avaliação encontrada para moderar.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="group relative bg-white/70 backdrop-blur-lg border border-white p-8 md:p-12 rounded-[3.5rem] shadow-sm hover:shadow-2xl hover:bg-white transition-all duration-700 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        disabled={deletingId === review.id}
                                        className="p-6 bg-rose-50 text-rose-600 rounded-3xl hover:bg-rose-600 hover:text-white transition-all shadow-lg shadow-rose-600/10 active:scale-90 disabled:opacity-50"
                                        title="Remover Comentário"
                                    >
                                        {deletingId === review.id ? <Loader2 className="animate-spin" size={24} /> : <Trash2 size={24} />}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
                                    <div className="md:col-span-4 space-y-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-white shadow-xl shadow-zinc-900/20">
                                                <User size={28} />
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold tracking-tight">{review.user.name}</p>
                                                <p className="text-zinc-400 text-sm">{review.user.email}</p>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-zinc-50/50 rounded-3xl border border-zinc-100 flex items-center gap-6 group-hover:bg-white transition-colors">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100">
                                                <Package className="text-zinc-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Produto</p>
                                                <p className="font-bold">{review.product?.name || 'Vantage Product'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-8 flex flex-col justify-between h-full">
                                        <div className="mb-10">
                                            <div className="flex items-center gap-2 mb-8">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={20}
                                                        className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"}
                                                    />
                                                ))}
                                                <span className="ml-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">
                                                    {new Date(review.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-2xl md:text-3xl font-medium text-zinc-700 leading-tight tracking-tight">
                                                "{review.comment || 'Sem comentário fornecido.'}"
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-6 pt-8 border-t border-zinc-50">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                <CheckCircle2 size={12} />
                                                Visible
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                <Calendar size={12} />
                                                Verified Purchase
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ModerationView;
