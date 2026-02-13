import { useState, useEffect } from 'react';
import { User, MapPin, Heart, LayoutDashboard, Box, LogOut, ChevronRight, Package, RefreshCcw, Shield, BarChart3, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AddressView from './AddressView';
import AdminDashboard from './AdminDashboard';
import ProductManagement from './ProductManagement';
import StockManagement from './StockManagement';
import UserManagement from './UserManagement';
import ProfileManagement from './ProfileManagement';
import OrdersView from './OrdersView';
import WishlistView from './WishlistView';
import ReportsView from './ReportsView';
import ModerationView from './admin/ModerationView';
import { exchangeService, type Exchange } from '../services/exchange';
import { userService } from '../services/users';
import { orderService } from '../services/orders';
import { Loader2, Save, ShoppingBag, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import type { Order } from '../types';

import AdminOrdersView from './admin/AdminOrdersView';

type SettingsSubView = 'account' | 'addresses' | 'orders' | 'all-orders' | 'returns' | 'wishlist' | 'dashboard' | 'products' | 'stocks' | 'profiles' | 'users' | 'reports' | 'moderation';

export default function SettingsView() {
    const { user, logout, can } = useAuth();
    const [activeSubView, setActiveSubView] = useState<SettingsSubView>('account');
    const [editingName, setEditingName] = useState(user?.name || '');
    const [newPassword, setNewPassword] = useState('');
    const [updating, setUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loadingRecentOrders, setLoadingRecentOrders] = useState(false);
    const [exchangeRequests, setExchangeRequests] = useState<Exchange[]>([]);
    const [loadingExchanges, setLoadingExchanges] = useState(false);

    const fetchData = async () => {
        if (!user) return;
        setLoadingRecentOrders(true);
        setLoadingExchanges(true);
        try {
            const [ordersData, exchangesData] = await Promise.all([
                orderService.getMyOrders(),
                exchangeService.getMyRequests()
            ]);
            setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 3) : []);
            setExchangeRequests(Array.isArray(exchangesData) ? exchangesData : []);
        } catch (error) {
            if ((error as Error)?.message?.includes('Token') || (error as any)?.response?.status === 401) {
                return;
            }
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoadingRecentOrders(false);
            setLoadingExchanges(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const getExchangeStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'PENDING': 'Pendente',
            'APPROVED': 'Aprovado',
            'REJECTED': 'Recusado',
            'COMPLETED': 'Concluído'
        };
        return labels[status] || status;
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'PENDING': 'Pendente',
            'PAID': 'Pago',
            'CANCELED': 'Cancelado',
            'RETURNED': 'Devolvido',
            'EXCHANGED': 'Trocado',
            'EXCHANGE_REQUESTED': 'Troca Solicitada'
        };
        return labels[status] || status;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <CheckCircle2 size={14} className="text-green-500" />;
            case 'CANCELED': return <XCircle size={14} className="text-red-500" />;
            case 'EXCHANGE_REQUESTED': return <RefreshCw size={14} className="text-blue-500 animate-spin" />;
            default: return <Clock size={14} className="text-amber-500" />;
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setUpdateMessage(null);
        try {
            const data: any = { name: editingName };
            if (newPassword) data.password = newPassword;

            await userService.updateMe(data);
            setUpdateMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            setNewPassword('');
            setIsEditing(false);
        } catch (error) {
            setUpdateMessage({ type: 'error', text: 'Erro ao atualizar perfil. Tente novamente.' });
        } finally {
            setUpdating(false);
        }
    };

    const hasAdminAccess = user && user.role !== 'CUSTOMER';

    const renderSubView = () => {
        switch (activeSubView) {
            case 'account':
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">Dados Pessoais</h3>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Gerencie suas informações de conta</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {updateMessage && (
                                    <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-full animate-in fade-in zoom-in ${updateMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {updateMessage.text}
                                    </span>
                                )}
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all active:scale-95"
                                    >
                                        Editar Perfil
                                    </button>
                                )}
                            </div>
                        </div>

                        {!isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl animate-in fade-in duration-500">
                                <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-[2rem]">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Nome Completo</label>
                                    <p className="text-lg font-bold text-zinc-900">{user?.name}</p>
                                </div>
                                <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-[2rem]">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">E-mail</label>
                                    <p className="text-lg font-bold text-zinc-900">{user?.email}</p>
                                </div>
                                <div className="p-8 bg-zinc-100/30 border border-zinc-100 rounded-[2rem]">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">CPF</label>
                                    <p className="text-lg font-bold text-zinc-400 italic">***.***.***-**</p>
                                </div>
                                <div className="p-8 bg-zinc-100/30 border border-zinc-100 rounded-[2rem]">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Senha</label>
                                    <p className="text-lg font-bold text-zinc-400">••••••••••••</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl animate-in slide-in-from-top-4 duration-500">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        className="w-full px-8 py-5 bg-zinc-50 border border-zinc-100 rounded-3xl font-bold focus:ring-4 ring-zinc-900/5 outline-none transition-all focus:bg-white focus:border-zinc-300 shadow-sm"
                                        placeholder="Seu nome completo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">E-mail (Não editável)</label>
                                    <div className="px-8 py-5 bg-zinc-100/50 border border-zinc-100 rounded-3xl font-bold text-zinc-400 cursor-not-allowed">
                                        {user?.email}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">CPF (Não editável)</label>
                                    <div className="px-8 py-5 bg-zinc-100/50 border border-zinc-100 rounded-3xl font-bold text-zinc-400 cursor-not-allowed italic">
                                        ***.***.***-**
                                    </div>
                                </div>

                                <div className="md:col-span-2 mt-4 pt-8 border-t border-zinc-50">
                                    <h4 className="text-sm font-black uppercase tracking-wider mb-6">Segurança</h4>
                                    <div className="max-w-md">
                                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-1">Nova Senha</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-8 py-5 bg-zinc-50 border border-zinc-100 rounded-3xl font-bold focus:ring-4 ring-zinc-900/5 outline-none transition-all focus:bg-white focus:border-zinc-300 shadow-sm"
                                            placeholder="Deixe em branco para não alterar"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 mt-6 flex flex-col md:flex-row gap-4">
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="flex items-center justify-center gap-3 px-12 py-5 bg-zinc-900 text-white font-black rounded-3xl tracking-[0.2em] uppercase text-xs hover:bg-blue-600 transition-all shadow-xl shadow-zinc-200 disabled:opacity-50"
                                    >
                                        {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        Salvar Alterações
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditingName(user?.name || '');
                                            setNewPassword('');
                                        }}
                                        className="px-12 py-5 bg-white border border-zinc-100 text-zinc-400 font-black rounded-3xl tracking-[0.2em] uppercase text-xs hover:bg-zinc-50 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="mt-20">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Pedidos Recentes</h3>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Últimas 3 compras realizadas</p>
                                </div>
                                <button
                                    onClick={() => setActiveSubView('orders')}
                                    className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                                >
                                    Ver Todos
                                </button>
                            </div>

                            {loadingRecentOrders ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3">
                                    <Loader2 size={32} className="animate-spin text-zinc-200" />
                                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Buscando...</span>
                                </div>
                            ) : recentOrders.length > 0 ? (
                                <div className="grid gap-4">
                                    {recentOrders.map(order => (
                                        <div key={order.id} className="p-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] flex items-center justify-between group hover:border-zinc-200 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                    <Package size={20} className="text-zinc-300" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-xs font-black uppercase tracking-tight">Pedido #{order.id.slice(-6).toUpperCase()}</span>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-zinc-100 rounded-full">
                                                            {getStatusIcon(order.status)}
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{getStatusLabel(order.status)}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                        {new Date(order.createdAt).toLocaleDateString('pt-BR')} • {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-zinc-900 mb-1">R$ {Number(order.total).toFixed(2)}</p>
                                                <button
                                                    onClick={() => {
                                                        setActiveSubView('orders');
                                                    }}
                                                    className="text-[9px] font-black uppercase tracking-widest text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    Detalhes
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-zinc-50/50 rounded-[3rem] border-4 border-dashed border-zinc-100 py-20 text-center">
                                    <Package size={48} className="mx-auto text-zinc-200 mb-4" />
                                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Nenhum pedido foi realizado ainda.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'addresses': return <AddressView />;
            case 'dashboard': return <AdminDashboard />;
            case 'products': return <ProductManagement />;
            case 'stocks': return <StockManagement />;
            case 'orders': return <OrdersView />;
            case 'all-orders': return <AdminOrdersView />;
            case 'wishlist': return <WishlistView onProductClick={() => { }} />;
            case 'users': return <UserManagement />;
            case 'returns':
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="mb-10">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Trocas & Devoluções</h3>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Histórico de suas solicitações de logística reversa</p>
                        </div>

                        {loadingExchanges ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 size={40} className="animate-spin text-zinc-100" />
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">Carregando solicitações...</span>
                            </div>
                        ) : exchangeRequests.length > 0 ? (
                            <div className="grid gap-6">
                                {exchangeRequests.map(exchange => (
                                    <div key={exchange.id} className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 md:p-10 hover:border-zinc-200 transition-all hover:shadow-2xl hover:shadow-zinc-200/50">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${exchange.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        exchange.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                                                            exchange.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                'bg-blue-50 text-blue-700 border-blue-100'
                                                        }`}>
                                                        {exchange.status === 'PENDING' ? <Clock size={12} /> :
                                                            exchange.status === 'APPROVED' ? <CheckCircle2 size={12} /> :
                                                                exchange.status === 'REJECTED' ? <XCircle size={12} /> :
                                                                    <RefreshCw size={12} />
                                                        }
                                                        {getExchangeStatusLabel(exchange.status)}
                                                    </div>
                                                    <span className="text-zinc-300 text-xs font-bold font-mono">#{exchange.id.slice(0, 8).toUpperCase()}</span>
                                                </div>

                                                <p className="text-sm font-black uppercase tracking-tight mb-2">Pedido Relacionado: #{exchange.orderId.slice(-8).toUpperCase()}</p>
                                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 mb-4">
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Motivo da Solicitação</p>
                                                    <p className="text-xs text-zinc-600 leading-relaxed font-medium">"{exchange.reason}"</p>
                                                </div>

                                                {exchange.adminNotes && (
                                                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Resposta do Suporte</p>
                                                        <p className="text-xs text-blue-700 leading-relaxed font-medium italic">"{exchange.adminNotes}"</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right flex flex-col justify-center">
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Solicitado em</p>
                                                <p className="text-sm font-black text-zinc-900">{new Date(exchange.createdAt).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-zinc-50/50 rounded-[3rem] border-4 border-dashed border-zinc-100">
                                <RefreshCcw size={48} className="mx-auto text-zinc-200 mb-4" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Nenhuma solicitação encontrada</h3>
                                <p className="text-zinc-400 text-[10px] mt-2 font-bold uppercase tracking-wider">Suas solicitações de troca ou devolução aparecerão aqui.</p>
                            </div>
                        )}
                    </div>
                );
            case 'moderation': return <ModerationView />;
            case 'reports': return <ReportsView />;
            case 'profiles': return <ProfileManagement />;
            default:
                return (
                    <div className="py-20 text-center animate-in fade-in duration-500">
                        <Box size={48} className="mx-auto text-zinc-200 mb-4" />
                        <h3 className="text-xl font-black uppercase">Em brevissimo!</h3>
                        <p className="text-zinc-400 mt-2">Esta funcionalidade está sendo finalizada.</p>
                    </div>
                );
        }
    };

    const MenuItem = ({ id, label, icon: Icon, requiredPermission }: { id: SettingsSubView, label: string, icon: any, requiredPermission?: string }) => {
        if (requiredPermission && !can(requiredPermission)) return null;

        return (
            <button
                onClick={() => setActiveSubView(id)}
                className={`w-full flex items-center justify-between group transition-all py-3 ${activeSubView === id ? 'text-zinc-900 border-r-4 border-zinc-900' : 'text-zinc-400 hover:text-zinc-900'}`}
            >
                <div className="flex items-center gap-4">
                    <Icon size={18} className={`${activeSubView === id ? 'text-zinc-900' : 'text-zinc-300 group-hover:text-zinc-900'}`} />
                    <span className={`text-sm tracking-tight uppercase transition-all ${activeSubView === id ? 'font-black' : 'font-bold'}`}>
                        {label}
                    </span>
                </div>
                {activeSubView === id && <ChevronRight size={16} className="text-zinc-900" />}
            </button>
        );
    };

    const AdminMenuItem = ({ id, label, icon: Icon, requiredPermission }: { id: SettingsSubView, label: string, icon: any, requiredPermission?: string }) => {
        if (requiredPermission && !can(requiredPermission)) return null;

        return (
            <button
                onClick={() => setActiveSubView(id)}
                className={`w-full flex items-center justify-between group transition-all py-3 px-4 rounded-xl ${activeSubView === id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Icon size={18} className={activeSubView === id ? 'text-white' : 'text-zinc-400 group-hover:text-white'} />
                    <span className={`text-sm tracking-tight uppercase transition-all ${activeSubView === id ? 'font-black' : 'font-bold'}`}>
                        {label}
                    </span>
                </div>
                {activeSubView === id && <ChevronRight size={16} className="text-white" />}
            </button>
        );
    };

    return (
        <div className="max-w-[90rem] mx-auto px-4 md:px-16 pt-24 md:pt-32 pb-16 md:pb-24">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-20">
                <aside className="lg:w-72 shrink-0">
                    <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 gap-8 lg:gap-12 lg:pb-0 pb-4 border-b lg:border-0 border-zinc-100 mb-8 lg:mb-0">
                        <div className="flex shrink-0 lg:flex-col gap-6 lg:gap-2">
                            <h2 className="hidden lg:block text-[10px] font-black tracking-[0.3em] text-zinc-300 uppercase mb-4">Conta</h2>
                            <MenuItem id="account" label="Minha conta" icon={User} />
                            <MenuItem id="addresses" label="Endereços" icon={MapPin} />
                        </div>

                        <div className="flex shrink-0 lg:flex-col gap-6 lg:gap-2">
                            <h2 className="hidden lg:block text-[10px] font-black tracking-[0.3em] text-zinc-300 uppercase mb-4">Compras</h2>
                            <MenuItem id="orders" label="Pedidos" icon={ShoppingBag} />
                            <MenuItem id="returns" label="Trocas" icon={RefreshCcw} />
                        </div>

                        <div className="flex shrink-0 lg:flex-col gap-6 lg:gap-2">
                            <h2 className="hidden lg:block text-[10px] font-black tracking-[0.3em] text-zinc-300 uppercase mb-4">Favoritos</h2>
                            <MenuItem id="wishlist" label="Desejos" icon={Heart} />
                        </div>

                        {hasAdminAccess && (
                            <div className="flex shrink-0 lg:flex-col gap-4 lg:gap-2 lg:p-8 lg:bg-gradient-to-br lg:from-zinc-900 lg:via-zinc-900 lg:to-zinc-800 lg:rounded-[2rem] lg:shadow-2xl lg:shadow-zinc-300/50 lg:border lg:border-zinc-700/50">
                                <div className="hidden lg:flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <Shield size={16} className="text-white" />
                                    </div>
                                    <h2 className="text-sm font-black tracking-tight text-white uppercase">Admin</h2>
                                </div>
                                <div className="flex lg:flex-col gap-4 lg:gap-2">
                                    <AdminMenuItem id="dashboard" label="Dashboard" icon={LayoutDashboard} requiredPermission="order:view" />
                                    <AdminMenuItem id="all-orders" label="Pedidos" icon={ShoppingBag} requiredPermission="order:manage" />
                                    <AdminMenuItem id="reports" label="Relatórios" icon={BarChart3} requiredPermission="report:view" />
                                    <AdminMenuItem id="products" label="Produtos" icon={Package} requiredPermission="product:view" />
                                    <AdminMenuItem id="stocks" label="Estoque" icon={Box} requiredPermission="stock:view" />
                                    <AdminMenuItem id="users" label="Usuários" icon={User} requiredPermission="user:view" />
                                    <AdminMenuItem id="profiles" label="Perfis" icon={Shield} requiredPermission="profile:view" />
                                    <AdminMenuItem id="moderation" label="Moderação" icon={ShieldAlert} requiredPermission="review:manage" />
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => logout(() => window.location.href = '/')}
                        className="hidden lg:flex mt-8 items-center gap-4 text-red-500 font-black text-sm tracking-widest uppercase hover:text-red-600 transition-colors px-1"
                    >
                        <LogOut size={18} />
                        Sair da Conta
                    </button>
                </aside>

                <main className="flex-1 min-w-0">
                    <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 min-h-[500px] md:min-h-[600px] shadow-sm md:shadow-none border border-zinc-100 md:border-0">
                        {renderSubView()}

                        <button
                            onClick={() => logout(() => window.location.href = '/')}
                            className="lg:hidden mt-20 flex items-center gap-4 text-red-500 font-black text-sm tracking-widest uppercase hover:text-red-600 transition-colors w-full justify-center py-6 border-t border-zinc-50"
                        >
                            <LogOut size={18} />
                            Sair da Conta
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
