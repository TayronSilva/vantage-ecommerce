import { useState, useEffect } from 'react';
import { CheckCircle2, Copy, ShoppingBag, MapPin, CreditCard, ChevronRight, RefreshCw, Loader2, FileDown } from 'lucide-react';
import { orderService } from '../services/orders';
import { generateInvoicePDF } from '../utils/invoiceGenerator';

interface SuccessViewProps {
    order: any;
    onGoHome: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({ order: initialOrder, onGoHome }) => {
    const [orderData, setOrderData] = useState(initialOrder);
    const [verifying, setVerifying] = useState(false);
    const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

    useEffect(() => {
        setOrderData(initialOrder);
    }, [initialOrder]);

    if (!orderData) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                <ShoppingBag size={64} className="text-zinc-200 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-tight">Ops! Nenhum pedido encontrado</h2>
                <button onClick={onGoHome} className="mt-8 text-blue-600 font-bold uppercase text-xs tracking-widest">Voltar para a loja</button>
            </div>
        );
    }

    const currentOrder = orderData.order;
    const isPix = currentOrder.paymentType === 'PIX' || currentOrder.paymentMethod === 'pix' || currentOrder.paymentMethod === 'PIX';
    const isPaid = currentOrder.status === 'PAID' || currentOrder.status === 'Pago';

    const handleVerifyStatus = async () => {
        setVerifying(true);
        setVerifyMessage(null);
        try {
            const updatedOrder = await orderService.verifyStatus(currentOrder.id);
            if (updatedOrder.status === 'PAID' || updatedOrder.status === 'Pago') {
                setOrderData({ ...orderData, order: updatedOrder });
                setVerifyMessage('Pagamento Confirmado!');
            } else {
                setVerifyMessage('Pagamento ainda não identificado.');
            }
        } catch (error) {
            setVerifyMessage('Erro ao verificar. Tente novamente.');
        } finally {
            setVerifying(false);
            setTimeout(() => setVerifyMessage(null), 3000);
        }
    };

    const handleDownloadInvoice = () => {
        const invoiceData = {
            order: {
                id: currentOrder.id,
                createdAt: currentOrder.createdAt,
                total: Number(currentOrder.total),
                paymentMethod: currentOrder.paymentType || currentOrder.paymentMethod || 'PIX',
                status: currentOrder.status
            },
            user: currentOrder.user || { name: (currentOrder as any).user?.name || 'Cliente', email: currentOrder.user?.email || 'N/A' },
            items: (currentOrder.items || []).map((item: any) => ({
                name: item.productName || item.name,
                quantity: item.quantity,
                price: Number(item.productPrice || item.price),
                selectedColor: item.color
            })),
            address: currentOrder.address,
            payment: orderData.payment
        };
        generateInvoicePDF(invoiceData);
    };

    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-zinc-200/50 overflow-hidden border border-zinc-100">
                    <div className="p-8 md:p-16">
                        <div className="flex flex-col items-center text-center mb-16">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 animate-in zoom-in duration-700 ${isPaid ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'}`}>
                                {isPaid ? <CheckCircle2 size={48} /> : <RefreshCw size={48} className="animate-spin-slow" />}
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-2">Pedido #{currentOrder.id.slice(-8).toUpperCase()}</span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">
                                {isPaid ? 'Pedido Confirmado!' : 'Aguardando Pagamento'}
                            </h2>
                            <p className="text-zinc-500 font-medium max-w-md">
                                {isPaid
                                    ? 'Seu pagamento foi processado e seu pedido está em separação.'
                                    : 'Finalize o pagamento via Pix em até 30 minutos para processarmos seu pedido.'}
                            </p>
                        </div>

                        {isPix && !isPaid && (
                            <div className="bg-zinc-950 text-white rounded-[2.5rem] p-10 md:p-12 mb-16 relative overflow-hidden">
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                    <div className="bg-white p-4 rounded-3xl shrink-0">
                                        {orderData.payment?.qrCodeBase64 ? (
                                            <img src={`data:image/png;base64,${orderData.payment.qrCodeBase64}`} alt="QR Code" className="w-40 h-40" />
                                        ) : (
                                            <div className="w-40 h-40 bg-zinc-100 flex items-center justify-center text-zinc-300">QR Code</div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-xl font-bold mb-4">Pague com Pix</h3>
                                        <p className="text-zinc-400 text-sm mb-6">Aponte a câmera do seu celular ou copie o código abaixo.</p>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(orderData.payment?.qrCode || '');
                                                    alert('Código Copiado!');
                                                }}
                                                className="bg-white text-zinc-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"
                                            >
                                                <Copy size={18} /> Copiar Código
                                            </button>
                                            <button
                                                onClick={handleVerifyStatus}
                                                disabled={verifying}
                                                className="bg-zinc-800 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {verifying ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                                                {verifyMessage || 'Verificar Pagamento'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 pb-2">Informação do Pedido</h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Contato</p>
                                        <p className="font-bold text-sm text-zinc-900 line-clamp-1">{initialOrder?.user?.email || 'Aguardando e-mail'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Pagamento</p>
                                        <div className="flex items-center gap-2">
                                            {(isPix) ? <span className="px-2 py-0.5 bg-teal-50 text-teal-600 text-[10px] font-black rounded uppercase">Pix</span> : <CreditCard size={14} className="text-zinc-400" />}
                                            <p className="font-bold text-sm text-zinc-900">R$ {Number(currentOrder.total).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isPaid ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {isPaid ? 'Pago' : 'Pendente'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 pb-2">Entrega e Cobrança</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <MapPin size={18} className="text-zinc-300 shrink-0 mt-1" />
                                        <div>
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Endereço de Entrega</p>
                                            <p className="text-sm font-bold text-zinc-900 capitalize">Tayrone</p>
                                            <p className="text-xs text-zinc-500 font-medium">Travessa Rio Sarapuí, 560</p>
                                            <p className="text-xs text-zinc-500 font-medium">Mesquita - RJ</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-[18px]" /> {/* Spacer */}
                                        <div>
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Endereço de Cobrança</p>
                                            <p className="text-xs text-zinc-500 font-medium">Mesmo endereço de entrega</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 pt-10 border-t border-zinc-100 flex flex-col items-center gap-6">
                            <button
                                onClick={handleDownloadInvoice}
                                className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                            >
                                <FileDown size={18} /> Baixar Fatura (PDF)
                            </button>
                            <button
                                onClick={onGoHome}
                                className="w-full bg-zinc-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-3"
                            >
                                Voltar para a Loja <ChevronRight size={18} />
                            </button>
                            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest group cursor-pointer hover:text-zinc-900 transition-colors">Precisando de ajuda? Entre em contato</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessView;
