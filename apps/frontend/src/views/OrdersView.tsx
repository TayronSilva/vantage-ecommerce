import { useState, useEffect } from 'react';
import { Package, ChevronRight, Clock, CheckCircle2, XCircle, Truck, ShoppingBag, RefreshCw, AlertCircle, Loader2, FileDown, MapPin, ReceiptText } from 'lucide-react';
import { orderService } from '../services/orders';
import { exchangeService } from '../services/exchange';
import { generateInvoicePDF } from '../utils/invoiceGenerator';
import type { Order } from '../types';

export default function OrdersView() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
    const [exchangeReason, setExchangeReason] = useState('');
    const [submittingExchange, setSubmittingExchange] = useState(false);
    const [pixQrCode, setPixQrCode] = useState<{ qrCode: string; qrCodeBase64: string } | null>(null);
    const [loadingPix, setLoadingPix] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

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

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderService.getMyOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <CheckCircle2 size={16} className="text-green-500" />;
            case 'CANCELED': return <XCircle size={16} className="text-red-500" />;
            case 'ENVIADO': return <Truck size={16} className="text-blue-500" />;
            case 'EXCHANGE_REQUESTED': return <RefreshCw size={16} className="text-blue-500 animate-spin" />;
            case 'EXCHANGED': return <RefreshCw size={16} className="text-emerald-500" />;
            case 'RETURNED': return <AlertCircle size={16} className="text-zinc-500" />;
            default: return <Clock size={16} className="text-amber-500" />;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-50 text-green-700 border-green-100';
            case 'CANCELED': return 'bg-red-50 text-red-700 border-red-100';
            case 'ENVIADO': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'EXCHANGE_REQUESTED': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'EXCHANGED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'RETURNED': return 'bg-zinc-50 text-zinc-700 border-zinc-100';
            default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    const handleExchangeRequest = async () => {
        if (!selectedOrder || !exchangeReason.trim()) return;
        setSubmittingExchange(true);
        try {
            await exchangeService.createRequest({
                orderId: selectedOrder.id,
                reason: exchangeReason
            });
            alert('Sua solicitação de troca foi enviada com sucesso! Analisaremos em breve.');
            setIsExchangeModalOpen(false);
            setSelectedOrder(null);
            setExchangeReason('');
            fetchOrders();
        } catch (error) {
            console.error('Erro ao solicitar troca:', error);
            alert('Não foi possível processar sua solicitação no momento.');
        } finally {
            setSubmittingExchange(false);
        }
    };


    const fetchPixQrCode = async (orderId: string) => {
        setLoadingPix(true);
        setPixQrCode(null);
        try {
            const response = await orderService.getPixQrCode(orderId);
            setPixQrCode(response);
        } catch (error) {
            console.error('Erro ao buscar QR Code Pix:', error);
        } finally {
            setLoadingPix(false);
        }
    };

    useEffect(() => {
        if (selectedOrder && selectedOrder.status === 'PENDING' && (selectedOrder.paymentMethod === 'PIX' || selectedOrder.paymentType === 'PIX')) {
            fetchPixQrCode(selectedOrder.id);
        } else {
            setPixQrCode(null);
        }
    }, [selectedOrder]);

    const handleDownloadInvoice = (order: Order) => {
        const invoiceData = {
            order: {
                id: order.id,
                createdAt: order.createdAt,
                total: Number(order.total),
                paymentMethod: order.paymentType || order.paymentMethod || 'PIX',
                status: order.status
            },
            user: (order as any).user || { name: (order as any).user?.name || 'Cliente', email: 'N/A' },
            items: (order.items || []).map((item: any) => ({
                name: item.productName || item.name,
                quantity: item.quantity,
                price: Number(item.productPrice || item.price),
                selectedColor: item.color
            })),
            address: order.address,
            payment: {}
        };
        generateInvoicePDF(invoiceData);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 size={40} className="text-zinc-200 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Carregando pedidos...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="mb-12">
                <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">Minhas Compras</span>
                <h2 className="text-4xl font-black tracking-tighter uppercase mt-1">Histórico de Pedidos</h2>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-24 bg-zinc-50/50 rounded-[3rem] border-4 border-dashed border-zinc-100">
                    <Package size={64} className="mx-auto text-zinc-200 mb-6" />
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Você ainda não fez nenhum pedido</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-8 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                    >
                        Começar a Comprar
                    </button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map(order => (
                        <div
                            key={order.id}
                            className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 md:p-10 hover:border-zinc-200 transition-all hover:shadow-2xl hover:shadow-zinc-200/50 group"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${getStatusStyle(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {getStatusLabel(order.status)}
                                        </div>
                                        <span className="text-zinc-300 text-xs font-bold font-mono">#{order.id.slice(-8).toUpperCase()}</span>
                                    </div>

                                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6">
                                        Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>

                                    <div className="flex -space-x-4 mb-8">
                                        {order.items.slice(0, 4).map((item, i) => (
                                            <div key={i} className="w-14 h-14 rounded-2xl bg-zinc-50 border-4 border-white flex items-center justify-center p-2 shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} className="w-full h-full object-contain mix-blend-multiply" alt={item.productName} />
                                                ) : (
                                                    <ShoppingBag size={20} className="text-zinc-300" />
                                                )}
                                            </div>
                                        ))}
                                        {order.items.length > 4 && (
                                            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border-4 border-white flex items-center justify-center shadow-md">
                                                <span className="text-white text-[10px] font-black">+{order.items.length - 4}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col md:items-end justify-between gap-6">
                                    <div className="text-left md:text-right">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Total do Pedido</span>
                                        <p className="text-3xl font-black">R$ {Number(order.total).toFixed(2)}</p>
                                    </div>

                                    <button
                                        className="bg-zinc-50 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        Ver Detalhes <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedOrder && !isExchangeModalOpen && (
                <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 md:p-14 relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-8 right-8 w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-colors z-10"
                        >
                            <XCircle size={24} className="text-zinc-400" />
                        </button>

                        <div className="mb-10">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Resumo do Pedido</span>
                            <h3 className="text-3xl font-black tracking-tight uppercase mt-2">Pedido #{selectedOrder.id.slice(-8).toUpperCase()}</h3>
                        </div>

                        <div className="mb-12">
                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 pb-2">Itens</h4>
                            <div className="space-y-4">
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-6 group/item">
                                        <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center p-2 border border-zinc-100 group-hover/item:border-zinc-200 transition-colors">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} className="w-full h-full object-contain mix-blend-multiply" alt={item.productName} />
                                            ) : (
                                                <ShoppingBag size={20} className="text-zinc-300" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <p className="text-sm font-black uppercase tracking-tight">{item.productName}</p>
                                                <p className="text-sm font-black text-zinc-900">R$ {(Number(item.productPrice) * item.quantity).toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase">{item.quantity}x</span>
                                                {item.color && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-zinc-200" />
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase">{item.color}</span>
                                                    </div>
                                                )}
                                                {item.size && (
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-100 px-1.5 py-0.5 rounded">{item.size}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10 mb-12">
                            <div>
                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 pb-2 flex items-center gap-2">
                                    <ReceiptText size={12} /> Pagamento
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                        <span className="text-[9px] font-black text-zinc-400 uppercase">Subtotal</span>
                                        <span className="text-xs font-black">R$ {Number(selectedOrder.subtotal).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4">
                                        <span className="text-[9px] font-black text-zinc-400 uppercase">Frete</span>
                                        <span className="text-xs font-black">R$ {Number(selectedOrder.freight).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-zinc-900 text-white p-4 rounded-2xl shadow-xl shadow-zinc-200">
                                        <span className="text-[9px] font-black text-white/50 uppercase">Total</span>
                                        <span className="text-lg font-black">R$ {Number(selectedOrder.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {pixQrCode && selectedOrder.status === 'PENDING' && (
                                <div className="mt-6 pt-6 border-t border-zinc-100">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Pague com Pix</p>
                                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex flex-col items-center text-center">
                                        {pixQrCode.qrCodeBase64 && (
                                            <img
                                                src={`data:image/png;base64,${pixQrCode.qrCodeBase64}`}
                                                alt="QR Code Pix"
                                                className="w-32 h-32 mb-4 mix-blend-multiply"
                                            />
                                        )}
                                        <p className="text-xs text-zinc-500 mb-3 font-medium">Escaneie o QR Code ou copie o código abaixo:</p>
                                        <div className="flex gap-2 w-full">
                                            <input
                                                type="text"
                                                readOnly
                                                value={pixQrCode.qrCode}
                                                className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 text-[10px] text-zinc-500 font-mono focus:outline-none"
                                            />
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(pixQrCode.qrCode);
                                                    alert('Código Pix copiado!');
                                                }}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl transition-colors"
                                                title="Copiar Código"
                                            >
                                                <ReceiptText size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 pb-2 flex items-center gap-2">
                                    <MapPin size={12} /> Endereço
                                </h4>
                                {selectedOrder.address ? (
                                    <div className="text-zinc-600 space-y-2">
                                        <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">{selectedOrder.address.name}</p>
                                        <p className="text-xs font-medium leading-relaxed">
                                            {selectedOrder.address.street}, {selectedOrder.address.number}<br />
                                            {selectedOrder.address.neighborhood}<br />
                                            {selectedOrder.address.city} - {selectedOrder.address.state}<br />
                                            CEP: {selectedOrder.address.zipCode}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-400 font-medium italic">Endereço não disponível</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {selectedOrder.status !== 'CANCELED' && (
                                <button
                                    onClick={() => handleDownloadInvoice(selectedOrder)}
                                    className="py-6 bg-blue-600 text-white font-black rounded-3xl uppercase tracking-widest text-xs transition-all hover:bg-blue-700 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <FileDown size={14} /> Baixar Fatura (PDF)
                                </button>
                            )}

                            {(selectedOrder.status === 'PAID' || selectedOrder.status === 'ENVIADO') ? (
                                <button
                                    onClick={() => setIsExchangeModalOpen(true)}
                                    className="py-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-black rounded-3xl uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={14} /> Solicitar Troca
                                </button>
                            ) : (
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="py-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-black rounded-3xl uppercase tracking-widest text-xs transition-all"
                                >
                                    Fechar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isExchangeModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 md:p-14 relative animate-in zoom-in-95 duration-300 overflow-hidden text-center md:text-left">
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />
                        <button
                            onClick={() => setIsExchangeModalOpen(false)}
                            className="absolute top-8 right-8 w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-colors"
                        >
                            <XCircle size={24} className="text-zinc-400" />
                        </button>

                        <div className="mb-10">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Logística Reversa</span>
                            <h3 className="text-4xl font-black tracking-tight uppercase mt-2">Solicitar Troca</h3>
                            <p className="text-zinc-400 text-sm mt-4 font-medium">Por favor, descreva o motivo da troca para o pedido #{selectedOrder.id.slice(-8).toUpperCase()}.</p>
                        </div>

                        <div className="mb-12">
                            <textarea
                                value={exchangeReason}
                                onChange={(e) => setExchangeReason(e.target.value)}
                                placeholder="Ex: O tamanho ficou pequeno, ou o produto apresenta defeito na costura..."
                                className="w-full h-48 bg-zinc-50 border border-zinc-100 rounded-[2rem] p-8 text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <button
                                onClick={() => setIsExchangeModalOpen(false)}
                                className="py-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-black rounded-3xl uppercase tracking-widest text-[10px] transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleExchangeRequest}
                                disabled={!exchangeReason.trim() || submittingExchange}
                                className="py-6 bg-zinc-900 text-white font-black rounded-3xl uppercase tracking-widest text-[10px] transition-all hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-zinc-900 flex items-center justify-center gap-3"
                            >
                                {submittingExchange ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={14} />}
                                Enviar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
