import { useState, useEffect } from 'react';
import { Package, Search, Eye, Filter, CheckCircle2, XCircle, Truck, Clock, AlertCircle, RefreshCw, Calendar, MapPin, User, Mail, Phone, CreditCard } from 'lucide-react';
import { orderService } from '../../services/orders';
import type { Order } from '../../types';

export default function AdminOrdersView() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderService.getAll();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.cpf?.includes(searchTerm);

        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
            case 'CANCELED': return 'bg-red-100 text-red-700 border-red-200';
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'ENVIADO': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'PENDING': 'Pendente',
            'PAID': 'Pago',
            'CANCELED': 'Cancelado',
            'ENVIADO': 'Enviado',
            'DELIVERED': 'Entregue',
            'EXPIRED': 'Expirado'
        };
        return labels[status] || status;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Gerenciar Pedidos</h2>
                    <p className="text-zinc-400 text-sm">Visualize e gerencie todos os pedidos da loja.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por ID, Nome, CPF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="ALL">Todos os Status</option>
                        <option value="PENDING">Pendentes</option>
                        <option value="PAID">Pagos</option>
                        <option value="ENVIADO">Enviados</option>
                        <option value="CANCELED">Cancelados</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-100 text-xs uppercase font-black text-zinc-400 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Pedido</th>
                                <th className="px-6 py-4">Cliente (Pagador)</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">Carregando pedidos...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">Nenhum pedido encontrado.</td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-zinc-600">#{order.id.slice(0, 8).toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-900">{order.user?.name || 'N/A'}</span>
                                                <span className="text-xs text-zinc-500">{order.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">
                                            {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-zinc-900">
                                            R$ {Number(order.total).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-blue-600 transition-colors"
                                                title="Ver Detalhes"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-zinc-100 flex justify-between items-start bg-zinc-50/50">
                            <div>
                                <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase">Detalhes do Pedido</span>
                                <h3 className="text-2xl font-black mt-1">#{selectedOrder.id.toUpperCase()}</h3>
                                <p className="text-zinc-500 text-sm mt-1">Realizado em {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                                <XCircle className="text-zinc-400" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">
                                        <User size={14} /> Quem Pagou (Cliente)
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-500">
                                                {selectedOrder.user?.name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-900">{selectedOrder.user?.name || 'Nome não informado'}</p>
                                                <p className="text-xs text-zinc-500">ID: {selectedOrder.userId}</p>
                                            </div>
                                        </div>
                                        <div className="h-px bg-zinc-200/50 my-2" />
                                        <div className="space-y-2 text-sm">
                                            <p className="flex items-center gap-2 text-zinc-600">
                                                <Mail size={14} /> {selectedOrder.user?.email}
                                            </p>
                                            <p className="flex items-center gap-2 text-zinc-600">
                                                <CreditCard size={14} /> CPF: {selectedOrder.user?.cpf || 'Não informado'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">
                                        <MapPin size={14} /> Quem Recebe (Entrega)
                                    </h4>
                                    {selectedOrder.address ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                                    <Truck size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-zinc-900">{selectedOrder.address.name}</p>
                                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                                        <Phone size={10} /> {selectedOrder.address.phone}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-px bg-zinc-200/50 my-2" />
                                            <p className="text-sm text-zinc-600 leading-relaxed">
                                                {selectedOrder.address.street}, {selectedOrder.address.number}
                                                {selectedOrder.address.additional && <span className="text-zinc-400"> ({selectedOrder.address.additional})</span>}
                                                <br />
                                                {selectedOrder.address.neighborhood}
                                                <br />
                                                {selectedOrder.address.city} - {selectedOrder.address.state}
                                                <br />
                                                <span className="font-mono text-xs bg-zinc-200 px-1 rounded">CEP {selectedOrder.address.zipCode}</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-32 text-zinc-400">
                                            <AlertCircle size={24} className="mb-2" />
                                            <p className="text-xs">Endereço não disponível</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                                    <Package size={14} /> Itens do Pedido
                                </h4>
                                <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-zinc-50 text-xs uppercase font-bold text-zinc-400">
                                            <tr>
                                                <th className="px-4 py-3">Produto</th>
                                                <th className="px-4 py-3 text-center">Qtd</th>
                                                <th className="px-4 py-3 text-right">Preço Un.</th>
                                                <th className="px-4 py-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {selectedOrder.items?.map((item, i) => (
                                                <tr key={i}>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-zinc-900">{item.productName || item.name}</div>
                                                        <div className="text-xs text-zinc-400">
                                                            {item.color && `Cor: ${item.color}`} {item.size && `| Tam: ${item.size}`}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-mono">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right font-mono">R$ {Number(item.productPrice || item.price).toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right font-mono font-bold">R$ {(Number(item.productPrice || item.price) * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <div className="w-full md:w-1/3 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                    <div className="space-y-2 text-sm text-zinc-600">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span className="font-mono">R$ {Number(selectedOrder.subtotal).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Frete</span>
                                            <span className="font-mono">R$ {Number(selectedOrder.freight).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="h-px bg-zinc-200 my-4" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-black uppercase tracking-widest text-zinc-900">Total</span>
                                        <span className="text-xl font-black text-blue-600">R$ {Number(selectedOrder.total).toFixed(2)}</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-zinc-200">
                                        <p className="text-xs text-center text-zinc-400 uppercase tracking-widest font-bold">
                                            Pagamento via {selectedOrder.paymentMethod || selectedOrder.paymentType || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-6 py-3 bg-white border border-zinc-200 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-colors"
                            >
                                Fechar
                            </button>
                            ,StartLine:310,TargetContent:                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
