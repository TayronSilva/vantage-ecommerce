import { useState, useEffect } from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';
import type { CartItem, Address, OrderCreateResponse } from '../types';
import { addressService } from '../services/address';
import { orderService } from '../services/orders';
import CardPaymentForm from '../components/payment/CardPaymentForm';

interface CheckoutViewProps {
    cart: CartItem[];
    subtotal: number;
    shippingCost: number;
    total: number;
    onSuccess: (orderData: any) => void;
    onClearCart: () => void;
    onNavigate: (view: any) => void;
}

export default function CheckoutView({ cart, subtotal, shippingCost, total: _total, onSuccess, onClearCart, onNavigate }: CheckoutViewProps) {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto' | null>(null);
    const [loading, setLoading] = useState(false);

    const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
    const [step, setStep] = useState<'checkout' | 'payment'>('checkout');
    const [createdOrder, setCreatedOrder] = useState<OrderCreateResponse | null>(null);
    const [savedCards, setSavedCards] = useState<any[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    const [localShippingCost, setLocalShippingCost] = useState(shippingCost);

    const BOLETO_FEE = 3.49;

    useEffect(() => {
        if (selectedAddressId) {
            const addr = addresses.find(a => a.id === selectedAddressId);
            if (addr) {
                const zipPrefix = addr.zipCode.substring(0, 2);
                const calculatedFreight = zipPrefix === '26' ? 8.00 : 20.00;
                setLocalShippingCost(calculatedFreight);
            }
        }
    }, [selectedAddressId, addresses]);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const data = await addressService.getMyAddresses();
                setAddresses(data);

                if (data && data.length > 0) {
                    const defaultAddr = data.find(a => a.isDefault) || data[0];
                    if (defaultAddr) {
                        setSelectedAddressId(defaultAddr.id);
                    }
                } else {
                    console.warn('Nenhum endereço retornado da API');
                }
            } catch (error: any) {
                console.error('Erro ao buscar endereços:', error);
                const msg = error.response?.data?.message || error.message;
                if (msg?.includes('Permissão') || msg?.includes('denied')) {
                    alert('Erro de permissão ao buscar endereços. Por favor, verifique sua conta.');
                }
            }
        };

        const fetchSavedCards = async () => {
            try {
                const cards = await orderService.getSavedCards();
                setSavedCards(cards);
            } catch (error) {
                console.error('Erro ao buscar cartões salvos:', error);
            }
        };

        fetchAddresses();
        fetchSavedCards();
    }, []);

    const handleRemoveCard = async (id: string) => {
        if (!confirm('Deseja remover este cartão?')) return;
        try {
            await orderService.removeSavedCard(id);
            setSavedCards(prev => prev.filter(c => c.id !== id));
            if (selectedCardId === id) setSelectedCardId(null);
        } catch (error) {
            alert('Erro ao remover cartão');
        }
    };

    const subtotalCost = subtotal;
    const totalWithFreight = subtotalCost + localShippingCost;

    const pixDiscount = paymentMethod === 'pix' ? totalWithFreight * 0.1 : 0;
    const boletoFee = paymentMethod === 'boleto' ? BOLETO_FEE : 0;
    const finalTotal = totalWithFreight - pixDiscount + boletoFee;

    const handleCreateOrder = async () => {
        if (!selectedAddressId) {
            alert('Por favor, selecione um endereço.');
            return;
        }

        if (!paymentMethod) {
            alert('Por favor, selecione um método de pagamento.');
            return;
        }

        setLoading(true);
        try {
            const response = await orderService.create({
                addressId: selectedAddressId,
                paymentMethod,
                items: cart.map(i => ({
                    stockId: i.stockId,
                    quantity: i.quantity
                }))
            });

            setCreatedOrder(response);

            if (paymentMethod === 'pix' || paymentMethod === 'boleto') {
                setStep('payment');
                onClearCart();
            }
        } catch (error: any) {
            alert(error.response?.data?.message || error.message || 'Erro ao criar pedido');
        } finally {
            setLoading(false);
        }
    };

    const handleCardPayment = async (cardData: any) => {
        if (loading) return;
        setLoading(true);
        try {
            let orderToPay = createdOrder;

            if (!orderToPay) {
                if (!selectedAddressId) {
                    alert('Por favor, selecione um endereço de entrega primeiro.');
                    setLoading(false);
                    return;
                }

                orderToPay = await orderService.create({
                    addressId: selectedAddressId,
                    paymentMethod: paymentMethod === 'card' ? 'credit_card' : (paymentMethod as any),
                    items: cart.map(i => ({
                        stockId: i.stockId,
                        quantity: i.quantity
                    }))
                });
                setCreatedOrder(orderToPay);
            }

            if (!orderToPay) throw new Error('Falha ao inicializar o pedido.');

            const response = await orderService.payWithCard({
                orderId: orderToPay.order.id,
                token: cardData.token,
                cardId: cardData.cardId,
                saveCard: cardData.saveCard,
                installments: cardData.installments || 1,
                paymentMethodId: cardData.paymentMethodId || paymentMethod,
            });


            if (response.status === 'approved') {
                setStep('payment');
                onClearCart();
            } else {
                const detail = response.statusDetail || response.status;
                let message = 'Pagamento recusado. Tente outro cartão.';

                if (detail === 'cc_rejected_bad_filled_card_number') message = 'Verifique o número do cartão.';
                if (detail === 'cc_rejected_bad_filled_date') message = 'Verifique a data de validade.';
                if (detail === 'cc_rejected_bad_filled_other') message = 'Verifique os dados do cartão.';
                if (detail === 'cc_rejected_bad_filled_security_code') message = 'Verifique o código de segurança.';
                if (detail === 'cc_rejected_blacklist') message = 'Não pudemos processar seu pagamento.';
                if (detail === 'cc_rejected_call_for_authorize') message = 'Você deve autorizar o pagamento com seu banco.';
                if (detail === 'cc_rejected_card_disabled') message = 'Ligue para seu banco para ativar seu cartão.';
                if (detail === 'cc_rejected_card_error') message = 'Não conseguimos processar seu pagamento.';
                if (detail === 'cc_rejected_duplicated_payment') message = 'Você já fez um pagamento com esse valor.';
                if (detail === 'cc_rejected_high_risk') message = 'Seu pagamento foi recusado por segurança.';
                if (detail === 'cc_rejected_insufficient_amount') message = 'Saldo insuficiente.';
                if (detail === 'cc_rejected_invalid_installments') message = 'O meio de pagamento não processa pagamentos em parcelas.';
                if (detail === 'cc_rejected_max_attempts') message = 'Você atingiu o limite de tentativas permitidas.';
                if (detail === 'cc_rejected_other_reason') message = 'O banco não processou o pagamento.';

                alert(`Pagamento não aprovado: ${message}`);
            }
        } catch (error: any) {
            console.error('Erro pagamento:', error);
            const msg = error.response?.data?.message || error.message;

            if (msg.includes('Invalid card_token_id') || msg.includes('token')) {
                alert(`Erro no Pagamento: ${msg}. Verifique se os dados do cartão estão corretos.`);
            } else {
                alert(msg || 'Erro ao processar pagamento do cartão');
            }
        } finally {
            setLoading(false);
        }
    };



    if (step === 'payment' && createdOrder) {
        const orderInfo = {
            contact: { email: 'lucashenrique@email.com' },
            delivery: addresses.find(a => a.id === selectedAddressId),
            billing: addresses.find(a => a.id === selectedAddressId),
            method: paymentMethod === 'pix' ? 'Pix' : 'Cartão de Crédito'
        };

        const SuccessLayout = ({ children }: { children: React.ReactNode }) => (
            <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#333] flex items-center justify-center p-6">
                <div className="bg-white max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-12 lg:p-16 flex flex-col justify-between">
                        <div>

                            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                                Confirmação nº {createdOrder.order.id.slice(0, 8).toUpperCase()}
                            </div>
                            <h1 className="text-3xl font-bold mb-2">
                                {paymentMethod === 'card' ? 'Pedido Confirmado!' : 'Pedido Recebido!'}
                            </h1>
                            <p className="text-xs text-gray-400 mb-8">
                                {paymentMethod === 'pix'
                                    ? 'Finalize o pagamento via Pix em até 30 minutos.'
                                    : 'Seu pagamento foi aprovado com sucesso.'}
                            </p>

                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center mb-12">
                                {children}
                            </div>

                            <div className="mt-8">
                                <h3 className="font-bold text-sm mb-4">Informação do Pedido</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-gray-100 rounded-xl p-6">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Informação de Contato</p>
                                        <p className="text-xs font-medium">{orderInfo.contact.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Forma de Pagamento</p>
                                        <p className="text-xs font-medium">{orderInfo.method} - R$ {Number(createdOrder.order.total).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Endereço de Entrega</p>
                                        <p className="text-xs font-medium">{orderInfo.delivery?.name}</p>
                                        <p className="text-xs text-gray-500">{orderInfo.delivery?.street}, {orderInfo.delivery?.number}</p>
                                        <p className="text-xs text-gray-500">{orderInfo.delivery?.city} - {orderInfo.delivery?.state}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Endereço de Cobrança</p>
                                        <p className="text-xs font-medium">{orderInfo.billing?.name}</p>
                                        <p className="text-xs text-gray-500">{orderInfo.billing?.street}, {orderInfo.billing?.number}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onSuccess(createdOrder)}
                            className="bg-[#1A1A1A] text-white w-full py-4 rounded-lg text-sm font-bold uppercase tracking-widest mt-8 hover:bg-black transition-all"
                        >
                            Voltar para a Loja
                        </button>
                    </div>

                    <div className="bg-white p-12 lg:p-16 border-l border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="max-w-xs mx-auto mb-8">
                            {cart[0] && <img src={cart[0].img} alt={cart[0].name} className="w-full mix-blend-multiply" />}
                        </div>
                        <h2 className="text-xl font-bold mb-2">Obrigado(a) pela preferência <span className="text-red-500">♥</span></h2>
                    </div>
                </div>
            </div>
        );

        if (paymentMethod === 'pix' && createdOrder.payment?.qrCodeBase64) {
            return (
                <SuccessLayout>
                    <img src={`data:image/png;base64,${createdOrder.payment.qrCodeBase64}`} alt="QR Code Pix" className="w-48 h-48 mix-blend-multiply" />
                    <div className="w-full mt-6">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={createdOrder.payment.qrCode}
                                className="w-full text-[10px] bg-gray-100 border-none rounded p-2 text-gray-500 truncate"
                            />
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(createdOrder.payment?.qrCode || '');
                                alert('Código Copiado!');
                            }}
                            className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg text-xs font-bold uppercase mt-2 hover:bg-black"
                        >
                            Copiar Código
                        </button>
                    </div>
                </SuccessLayout>
            );
        }

        if (paymentMethod === 'card') {
            return (
                <SuccessLayout>
                    <div className="flex flex-col items-center py-4">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <svg viewBox="0 0 24 24" className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Pagamento Aprovado</h3>
                        <p className="text-xs text-gray-400 mt-2">Sua compra foi processada com sucesso.</p>
                    </div>
                </SuccessLayout>
            );
        }

        if (paymentMethod === 'boleto') {
            return (
                <SuccessLayout>
                    <div className="flex flex-col items-center py-4">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <CreditCard className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Boleto Gerado</h3>
                        <p className="text-xs text-gray-400 mt-2 text-center">Verifique seu e-mail para acessar o boleto bancário.</p>
                    </div>
                </SuccessLayout>
            );
        }

    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#333]">
            <div className="max-w-7xl mx-auto px-6 py-12 flex justify-center">
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-[10px] md:text-sm font-black uppercase tracking-[0.2em]">
                    <span
                        className={`cursor-pointer transition-all ${activeStep === 1 ? 'text-black border-b-4 border-black pb-2' : 'text-zinc-300 hover:text-black'}`}
                        onClick={() => setActiveStep(1)}
                    >
                        1. Carrinho
                    </span>
                    <span
                        className={`transition-all ${activeStep === 2 ? 'text-black border-b-4 border-black pb-2' : 'text-zinc-300 cursor-pointer hover:text-black'}`}
                        onClick={() => activeStep > 1 && setActiveStep(2)}
                    >
                        2. Informações
                    </span>
                    <span
                        className={`transition-all ${activeStep === 3 ? 'text-black border-b-4 border-black pb-2' : 'text-zinc-300 cursor-pointer hover:text-black'}`}
                        onClick={() => activeStep > 2 && setActiveStep(3)}
                    >
                        3. Pagamento
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className={`grid grid-cols-1 gap-12 ${activeStep === 1 ? 'lg:grid-cols-1' : 'lg:grid-cols-12'}`}>
                    <div className={activeStep === 1 ? 'lg:col-span-1' : 'lg:col-span-7'}>
                        {activeStep === 1 && (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-500 lg:col-span-12">
                                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-zinc-100">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Revisar Itens</h2>
                                    <div className="space-y-6">
                                        {cart.map(item => (
                                            <div key={item.cartId} className="flex gap-8 items-center pb-6 border-b border-zinc-50 last:border-0 last:pb-0">
                                                <div className="w-24 h-24 bg-zinc-50 rounded-3xl p-4 flex items-center justify-center flex-shrink-0">
                                                    <img src={item.img} alt={item.name} className="max-w-full max-h-full mix-blend-multiply" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black uppercase text-sm tracking-tight">{item.name}</h4>
                                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Cor: {item.selectedColor}</p>
                                                    <p className="text-sm font-black mt-2">R$ {item.price.toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Qtd</p>
                                                    <p className="text-lg font-black">{item.quantity}x</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-12 flex justify-between items-center bg-zinc-50 p-8 rounded-3xl">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total dos Produtos</p>
                                            <p className="text-3xl font-black">R$ {subtotalCost.toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveStep(2)}
                                            className="bg-zinc-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                                        >
                                            Próximo Passo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">Endereço de Entrega</h2>
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-8">Selecione onde deseja receber sua Vantage</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.length > 0 ? (
                                            addresses.map(addr => (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => setSelectedAddressId(addr.id)}
                                                    className={`p-6 rounded-[2rem] border transition-all cursor-pointer ${selectedAddressId === addr.id ? 'border-2 border-zinc-900 bg-white shadow-xl scale-[1.02]' : 'border-zinc-100 bg-white hover:border-zinc-300'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className={`w-5 h-5 rounded-full border border-zinc-200 flex items-center justify-center ${selectedAddressId === addr.id ? 'bg-zinc-900 border-zinc-900' : 'bg-white'}`}>
                                                            {selectedAddressId === addr.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                                        </div>
                                                        {addr.isDefault && <span className="text-[9px] font-black uppercase bg-zinc-900 text-white px-3 py-1 rounded-full tracking-widest">Principal</span>}
                                                    </div>
                                                    <p className="text-sm font-black uppercase tracking-tight">{addr.name}</p>
                                                    <p className="text-xs text-zinc-500 font-bold mt-2">{addr.street}, {addr.number}</p>
                                                    <p className="text-xs text-zinc-500 font-bold">{addr.city} - {addr.state}</p>
                                                    <p className="text-xs text-zinc-500 font-bold">{addr.zipCode}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-zinc-100">
                                                <p className="text-zinc-400 font-black uppercase text-xs tracking-[0.2em]">Nenhum endereço encontrado</p>
                                            </div>
                                        )}

                                        <div
                                            onClick={() => onNavigate('addresses')}
                                            className="p-6 rounded-[2rem] border border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50/30 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[160px] group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                                <span className="text-2xl text-zinc-400">+</span>
                                            </div>
                                            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Novo Endereço</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-8 border-t border-zinc-100">
                                    <button
                                        onClick={() => setActiveStep(1)}
                                        className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-all"
                                    >
                                        <ArrowRight className="rotate-180 w-4 h-4" />
                                        Voltar
                                    </button>
                                    <button
                                        onClick={() => setActiveStep(3)}
                                        disabled={!selectedAddressId}
                                        className="bg-zinc-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 disabled:opacity-50"
                                    >
                                        Ir para Pagamento
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeStep === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">Método de Pagamento</h2>
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-8">Transação Segura Vantage-Gate</p>

                                    <div className="space-y-4">
                                        <div
                                            onClick={() => setPaymentMethod('pix')}
                                            className={`block border rounded-[2rem] p-6 cursor-pointer transition-all ${paymentMethod === 'pix' ? 'border-2 border-zinc-900 bg-white shadow-xl' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-5 h-5 rounded-full border border-zinc-200 flex items-center justify-center ${paymentMethod === 'pix' ? 'bg-zinc-900 border-zinc-900' : 'bg-white'}`}>
                                                        {paymentMethod === 'pix' && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-black uppercase tracking-tight text-zinc-900">Pix - 10% OFF</span>
                                                        <span className="text-[9px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-black uppercase tracking-wider">SEM TAXAS</span>
                                                    </div>
                                                </div>
                                                <svg viewBox="0 0 24 24" className="h-6 w-auto text-[#32BCAD]" fill="currentColor"><path d="M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156" /></svg>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setPaymentMethod('card')}
                                            className={`block border rounded-[2rem] p-6 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-2 border-zinc-900 bg-white shadow-xl' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-5 h-5 rounded-full border border-zinc-200 flex items-center justify-center ${paymentMethod === 'card' ? 'bg-zinc-900 border-zinc-900' : 'bg-white'}`}>
                                                        {paymentMethod === 'card' && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <span className="text-sm font-black uppercase tracking-tight text-zinc-900">Cartão de Crédito</span>
                                                </div>
                                                <CreditCard size={24} className="text-zinc-900" />
                                            </div>

                                            {paymentMethod === 'card' && savedCards.length > 0 && (
                                                <div className="mt-8 space-y-4 pt-6 border-t border-zinc-50">
                                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Cartões Salvos</p>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {savedCards.map(card => (
                                                            <div
                                                                key={card.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedCardId(prev => prev === card.id ? null : card.id);
                                                                }}
                                                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedCardId === card.id ? 'border-2 border-zinc-900 bg-zinc-50' : 'border-zinc-100 hover:border-zinc-200 bg-white'}`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    {card.thumbnail ? <img src={card.thumbnail} alt="" className="w-10 h-6 object-contain" /> : <CreditCard size={20} />}
                                                                    <div className="text-xs font-black">•••• {card.lastFour} <span className="text-zinc-400 ml-2">{card.expirationMonth}/{card.expirationYear}</span></div>
                                                                </div>
                                                                <button onClick={(e) => { e.stopPropagation(); handleRemoveCard(card.id); }} className="text-[9px] font-black uppercase text-red-500 p-2">Remover</button>
                                                            </div>
                                                        ))}
                                                        <div
                                                            onClick={(e) => { e.stopPropagation(); setSelectedCardId(null); }}
                                                            className={`flex items-center gap-4 p-4 rounded-2xl border text-xs font-black uppercase tracking-tight cursor-pointer ${selectedCardId === null ? 'border-2 border-zinc-900 bg-zinc-50' : 'border-zinc-100 bg-white'}`}
                                                        >
                                                            <div className="w-10 h-6 flex items-center justify-center border border-dashed border-zinc-300 rounded text-zinc-400">+</div>
                                                            Usar Novo Cartão
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            onClick={() => setPaymentMethod('boleto')}
                                            className={`block border rounded-[2rem] p-6 cursor-pointer transition-all ${paymentMethod === 'boleto' ? 'border-2 border-zinc-900 bg-white shadow-xl' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-5 h-5 rounded-full border border-zinc-200 flex items-center justify-center ${paymentMethod === 'boleto' ? 'bg-zinc-900 border-zinc-900' : 'bg-white'}`}>
                                                        {paymentMethod === 'boleto' && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-black uppercase tracking-tight text-zinc-900">Boleto Bancário</span>
                                                        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-black uppercase tracking-wider">+R$ 3,49</span>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center"><CreditCard size={18} className="text-zinc-400" /></div>
                                            </div>
                                        </div>
                                    </div>

                                    {paymentMethod === 'card' && !selectedCardId && (
                                        <div className="mt-12 bg-zinc-50 p-10 rounded-[3rem] border border-zinc-100">
                                            <CardPaymentForm total={finalTotal} onSubmit={handleCardPayment} loading={loading} />
                                        </div>
                                    )}

                                    {paymentMethod === 'card' && selectedCardId && (
                                        <div className="mt-12 space-y-6">
                                            <button
                                                onClick={() => handleCardPayment({ cardId: selectedCardId })}
                                                disabled={loading}
                                                className="w-full h-20 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-2xl disabled:opacity-50"
                                            >
                                                {loading ? 'Processando...' : 'Finalizar com Cartão Salvo'}
                                            </button>
                                        </div>
                                    )}

                                    {(paymentMethod === 'pix' || paymentMethod === 'boleto') && (
                                        <button
                                            onClick={handleCreateOrder}
                                            disabled={loading}
                                            className="w-full h-20 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-2xl disabled:opacity-50 mt-8"
                                        >
                                            {loading ? 'Processando...' : 'Confirmar e Pagar'}
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => setActiveStep(2)}
                                    className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-all"
                                >
                                    <ArrowRight className="rotate-180 w-4 h-4" />
                                    Voltar
                                </button>
                            </div>
                        )}
                    </div>

                    {activeStep !== 1 && (
                        <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-white p-8 rounded-lg shadow-sm">
                                {cart.map(item => (
                                    <div key={item.cartId} className="flex gap-4 mb-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0 last:mb-0">
                                        <div className="w-16 h-16 bg-[#F5F5F5] rounded-md p-2 flex items-center justify-center">
                                            <img src={item.img} alt={item.name} className="max-w-full max-h-full mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold">{item.name}</h4>
                                            <p className="text-xs text-gray-500">{item.selectedColor} | {item.quantity > 1 && `${item.quantity}x`}</p>
                                        </div>
                                        <div className="text-sm font-bold">R$ {(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                ))}

                                <div className="mt-8 space-y-3 pt-6 border-t border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-medium">R$ {subtotalCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Frete</span>
                                        <span className="font-medium">{localShippingCost === 0 ? 'GRÁTIS' : `R$ ${localShippingCost.toFixed(2)}`}</span>
                                    </div>
                                    {paymentMethod === 'boleto' && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-amber-600 font-bold">Taxa de Processamento (Boleto)</span>
                                            <span className="text-amber-600 font-bold">R$ {BOLETO_FEE.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {paymentMethod === 'pix' && (
                                        <div className="flex justify-between text-sm text-[#32BCAD]">
                                            <span>Pix (10% OFF)</span>
                                            <span>- R$ {pixDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-100 mt-4">
                                        <span>TOTAL</span>
                                        <span>R$ {finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
