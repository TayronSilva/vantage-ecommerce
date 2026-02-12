import React from 'react';
import { X, Trash2, Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
import type { CartItem } from '../../types';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    onUpdateQty: (cartId: string, delta: number) => void;
    onRemove: (cartId: string) => void;
    onCheckout: () => void;
    subtotal: number;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
    isOpen, onClose, cart, onUpdateQty, onRemove, onCheckout, subtotal
}) => {
    return (
        <>
            <div
                className={`fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div className={`fixed right-0 top-0 h-full w-full max-w-[450px] bg-white z-50 shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
                <div className="p-8 border-b border-zinc-200 flex justify-between items-center bg-white sticky top-0">
                    <div className="flex items-center gap-3">
                        <h2 className="font-black text-2xl tracking-tight uppercase">Seu Carrinho</h2>
                        <span className="text-xs bg-zinc-900 text-white px-3 py-1.5 rounded-full font-bold">{cart.length}</span>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 border border-zinc-200 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {cart.map(item => (
                        <div key={item.cartId} className="flex gap-6 group animate-in slide-in-from-right-4">
                            <div className="w-28 h-28 bg-zinc-50 rounded-2xl p-4 flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-zinc-200 group-hover:border-zinc-300 transition-colors">
                                <img src={item.img} className="w-full h-full object-contain mix-blend-multiply" alt={item.name} />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="text-xs font-black uppercase tracking-tight leading-tight pr-4">{item.name}</h3>
                                        <button
                                            onClick={() => onRemove(item.cartId)}
                                            className="text-zinc-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                            title="Remover produto"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{item.selectedColor} | U</p>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-4 bg-zinc-50 rounded-full px-4 py-2 border border-zinc-200 shadow-inner">
                                        <button onClick={() => onUpdateQty(item.cartId, -1)} className="text-zinc-400 hover:text-zinc-900 transition-colors"><Minus size={14} /></button>
                                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => onUpdateQty(item.cartId, 1)} className="text-zinc-400 hover:text-zinc-900 transition-colors"><Plus size={14} /></button>
                                    </div>
                                    <p className="font-black text-sm">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
                                <ShoppingCart size={32} />
                            </div>
                            <p className="text-zinc-400 font-bold">Seu carrinho está vazio.</p>
                            <button onClick={onClose} className="text-xs font-black uppercase tracking-[0.2em] border-b-2 border-zinc-900 pb-1 hover:text-blue-600 hover:border-blue-600 transition-all">Começar a comprar</button>
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-8 border-t border-zinc-100 bg-zinc-50/50">
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center font-bold text-zinc-400 text-sm">
                                <span className="uppercase tracking-widest text-[10px]">Cálculo de Frete</span>
                                <Plus size={14} />
                            </div>
                            <div className="flex justify-between items-center text-2xl font-black">
                                <span className="tracking-tighter uppercase">Subtotal</span>
                                <span>R$ {subtotal.toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Taxas e frete calculados no checkout.</p>
                        </div>
                        <button
                            onClick={onCheckout}
                            className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-3"
                        >
                            Finalizar Compra <ArrowLeft className="rotate-180" size={16} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
