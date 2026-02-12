import { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Box, Users, ChevronRight, Loader2 } from 'lucide-react';
import ProductManagement from './ProductManagement.tsx';
import StockManagement from './StockManagement.tsx';
import { reportsService } from '../services/reports';

type AdminTab = 'overview' | 'products' | 'stocks' | 'users';

interface DashboardStats {
    todaySales: number;
    totalProducts: number;
    totalStock: number;
    totalCustomers: number;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const data = await reportsService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'products': return <ProductManagement />;
            case 'stocks': return <StockManagement />;
            case 'overview':
            default:
                if (loading) {
                    return (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 size={40} className="text-zinc-200 animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Carregando dados...</p>
                        </div>
                    );
                }

                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
                        {[
                            { label: 'Vendas Hoje', value: `R$ ${(stats?.todaySales || 0).toFixed(2)}`, icon: LayoutDashboard, color: 'text-blue-500' },
                            { label: 'Produtos', value: String(stats?.totalProducts || 0), icon: ShoppingBag, color: 'text-zinc-900' },
                            { label: 'Em Estoque', value: String(stats?.totalStock || 0), icon: Box, color: 'text-zinc-400' },
                            { label: 'Clientes', value: String(stats?.totalCustomers || 0), icon: Users, color: 'text-zinc-900' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm">
                                <stat.icon className={`mb-4 ${stat.color}`} size={24} />
                                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black mt-1">{stat.value}</p>
                            </div>
                        ))}

                        <div className="lg:col-span-4 mt-8">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                AÇÕES RÁPIDAS <ChevronRight size={20} className="text-zinc-300" />
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setActiveTab('products')}
                                    className="p-8 bg-zinc-900 text-white rounded-[2.5rem] font-black text-left hover:bg-zinc-800 transition-all flex justify-between items-center group"
                                >
                                    <div>
                                        <span className="text-[10px] text-zinc-400 tracking-widest uppercase">Gerenciar</span>
                                        <p className="text-2xl uppercase tracking-tighter">Produtos & Catálogo</p>
                                    </div>
                                    <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                                <button
                                    onClick={() => setActiveTab('stocks')}
                                    className="p-8 bg-white border border-zinc-100 rounded-[2.5rem] font-black text-left hover:bg-zinc-50 transition-all flex justify-between items-center group"
                                >
                                    <div>
                                        <span className="text-[10px] text-zinc-400 tracking-widest uppercase">Ajustar</span>
                                        <p className="text-2xl uppercase tracking-tighter">Estoque & Cores</p>
                                    </div>
                                    <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform text-zinc-300" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50/50">
            <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <span className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">Administração</span>
                        <h2 className="text-4xl font-black tracking-tighter mt-1 uppercase">Painel de Controle</h2>
                    </div>

                    <nav className="flex bg-white p-1.5 rounded-2xl border border-zinc-100 shadow-sm overflow-x-auto no-scrollbar">
                        {[
                            { id: 'overview', label: 'Dashboard' },
                            { id: 'products', label: 'Produtos' },
                            { id: 'stocks', label: 'Estoque' },
                            { id: 'users', label: 'Clientes' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as AdminTab)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {renderContent()}
            </div>
        </div>
    );
}
