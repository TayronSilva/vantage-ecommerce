import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Lock, User } from 'lucide-react';

interface CardPaymentFormProps {
    total: number;
    onSubmit: (data: any) => void;
    loading: boolean;
}

declare const MercadoPago: any;

export default function CardPaymentForm({ total, onSubmit, loading }: CardPaymentFormProps) {
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardholderName: '',
        cardExpirationMonth: '',
        cardExpirationYear: '',
        securityCode: '',
        identificationType: 'CPF',
        identificationNumber: ''
    });
    const [saveCard, setSaveCard] = useState(false);
    const [paymentMethodId, setPaymentMethodId] = useState('');
    const [installments, setInstallments] = useState(1);
    const [mpInstance, setMpInstance] = useState<any>(null);

    useEffect(() => {
        const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
        if (publicKey && typeof MercadoPago !== 'undefined') {
            const mp = new MercadoPago(publicKey);
            setMpInstance(mp);
        } else {
            console.warn('Mercado Pago Public Key not found or SDK not loaded');
        }
    }, [MercadoPago]);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'installments') {
            setInstallments(Number(value));
            return;
        }

        let formattedValue = value;
        if (name === 'cardNumber') formattedValue = value.replace(/\D/g, '');
        if (name === 'securityCode') formattedValue = value.replace(/\D/g, '').substring(0, 4);
        if (name === 'identificationNumber') formattedValue = value.replace(/\D/g, '').substring(0, 11);
        if (name === 'cardholderName') formattedValue = value.toUpperCase();

        if (name === 'expiry') {
            const clean = value.replace(/\D/g, '');
            if (clean.length >= 2) {
                setFormData(prev => ({
                    ...prev,
                    cardExpirationMonth: clean.substring(0, 2),
                    cardExpirationYear: '20' + clean.substring(2, 4)
                }));
            }
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));

        if (name === 'cardNumber' && formattedValue.length >= 6 && mpInstance) {
            try {
                const bin = formattedValue.substring(0, 6);
                const paymentMethods = await mpInstance.getPaymentMethods({ bin });
                if (paymentMethods.results && paymentMethods.results.length > 0) {
                    const methodId = paymentMethods.results[0].id;
                    setPaymentMethodId(methodId);
                }
            } catch (err) {
                console.error('Error detecting payment method:', err);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!mpInstance) {
            alert('Erro de configuração: Mercado Pago não inicializado.');
            return;
        }

        if (!paymentMethodId) {
            alert('Não foi possível identificar a bandeira do cartão. Verifique o número.');
            return;
        }

        try {
            const cardToken = await mpInstance.createCardToken({
                cardNumber: formData.cardNumber,
                cardholderName: formData.cardholderName,
                cardExpirationMonth: formData.cardExpirationMonth,
                cardExpirationYear: formData.cardExpirationYear,
                securityCode: formData.securityCode,
                identificationType: 'CPF',
                identificationNumber: formData.identificationNumber,
            });

            onSubmit({
                token: cardToken.id,
                paymentMethodId: paymentMethodId,
                installments: installments,
                saveCard: saveCard
            });

        } catch (error: any) {
            console.error('Erro ao gerar token:', error);

            const cause = error.cause || error.message;
            let displayMessage = 'Verifique os dados do cartão.';

            if (Array.isArray(cause) && cause.length > 0) {
                const code = cause[0].code;
                const description = cause[0].description;

                if (code === '208' || code === '209') displayMessage = 'Validade do cartão incorreta.';
                if (code === '214') displayMessage = 'Número do documento inválido.';
                if (code === '220') displayMessage = 'Banco emissor não disponível.';
                if (code === '221') displayMessage = 'Nome no cartão incompleto ou incorreto.';
                if (code === '224') displayMessage = 'Código de segurança inválido.';
                if (code === 'E301') displayMessage = 'Número do cartão inválido.';

                if (displayMessage === 'Verifique os dados do cartão.') {
                    displayMessage = `Erro: ${description || code}`;
                }
            } else if (typeof cause === 'string') {
                displayMessage = cause;
            }

            alert(displayMessage);
        }
    };

    return (
        <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter flex items-center gap-3">
                <CreditCard className="text-zinc-900" />
                DADOS DO CARTÃO
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="cardNumber" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Número do Cartão</label>
                    <div className="relative">
                        <input
                            id="cardNumber"
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            placeholder="0000 0000 0000 0000"
                            className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 pl-12 font-mono font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                            required
                            autoComplete="cc-number"
                        />
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={20} />
                        {paymentMethodId && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <span className="text-[10px] font-black bg-zinc-100 px-2 py-1 rounded text-zinc-400 uppercase">{paymentMethodId}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="cardholderName" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Nome no Cartão</label>
                    <div className="relative">
                        <input
                            id="cardholderName"
                            type="text"
                            name="cardholderName"
                            value={formData.cardholderName}
                            onChange={handleChange}
                            placeholder="COMO ESTÁ NO CARTÃO"
                            className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 pl-12 font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all uppercase"
                            required
                            autoComplete="cc-name"
                        />
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={20} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="expiry" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Validade (MM/AA)</label>
                        <div className="relative">
                            <input
                                id="expiry"
                                type="text"
                                name="expiry"
                                onChange={handleChange}
                                placeholder="MM/AA"
                                maxLength={5}
                                className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 pl-12 font-mono font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                                required
                                autoComplete="cc-exp"
                            />
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={20} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="securityCode" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">CVV</label>
                        <div className="relative">
                            <input
                                id="securityCode"
                                type="text"
                                name="securityCode"
                                value={formData.securityCode}
                                onChange={handleChange}
                                placeholder="123"
                                className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 pl-12 font-mono font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                                required
                                autoComplete="cc-csc"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={20} />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="installments" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Parcelas</label>
                    <div className="relative">
                        <select
                            id="installments"
                            name="installments"
                            value={installments}
                            onChange={handleChange}
                            className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 pl-12 font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all appearance-none"
                            required
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                <option key={n} value={n}>
                                    {n}x de R$ {(total / n).toFixed(2)} (Total: R$ {total.toFixed(2)})
                                </option>
                            ))}
                        </select>
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={20} />
                    </div>
                </div>

                <div>
                    <label htmlFor="identificationNumber" className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">CPF do Titular</label>
                    <div className="relative">
                        <input
                            id="identificationNumber"
                            type="text"
                            name="identificationNumber"
                            value={formData.identificationNumber}
                            onChange={handleChange}
                            placeholder="000.000.000-00"
                            className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 pl-12 font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                            required
                        />
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={20} />
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${saveCard ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-200 group-hover:border-zinc-300'}`}>
                            {saveCard && <Lock size={12} className="text-white" />}
                        </div>
                        <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Salvar este cartão para compras futuras</span>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                        />
                    </label>
                </div>

                <div className="pt-6 border-t border-zinc-200 mt-6">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Total a Pagar</span>
                        <span className="text-3xl font-black text-zinc-900">R$ {total.toFixed(2)}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zinc-900 text-white h-20 rounded-[2rem] font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                        {loading ? 'PROCESSANDO...' : 'PAGAR AGORA'}
                    </button>

                    <p className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                        <Lock size={12} /> Ambiente Seguro
                    </p>
                </div>
            </form>
        </div>
    );
}
