import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface FooterProps {
    onViewChange: (view: any) => void;
}

const Footer: React.FC<FooterProps> = ({ onViewChange }) => {
    return (
        <footer className="bg-zinc-50 mt-20 px-6 md:px-16 py-20 border-t border-zinc-100">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => onViewChange('home')}>
                        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-xs">V</span>
                        </div>
                        <span className="font-black text-xl tracking-tight">VANTAGE</span>
                    </div>
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                        Essenciais com tecnologia. Design minimalista que eleva sua rotina diária.
                    </p>
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6">Ajuda</h4>
                    <ul className="text-sm font-bold text-zinc-500 space-y-4">
                        <li className="hover:text-zinc-900 cursor-pointer transition-colors" onClick={() => onViewChange('orders')}>Rastrear Pedido</li>
                        <li className="hover:text-zinc-900 cursor-pointer transition-colors" onClick={() => onViewChange('returns')}>Trocas e Devoluções</li>
                        <li className="hover:text-zinc-900 cursor-pointer transition-colors">Fale Conosco</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6">Sobre</h4>
                    <ul className="text-sm font-bold text-zinc-500 space-y-4">
                        <li className="hover:text-zinc-900 cursor-pointer transition-colors" onClick={() => onViewChange('terms')}>Termos de Uso</li>
                        <li className="hover:text-zinc-900 cursor-pointer transition-colors" onClick={() => onViewChange('privacy')}>Privacidade</li>
                        <li className="hover:text-zinc-900 cursor-pointer transition-colors">Sustentabilidade</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6">Newsletter</h4>
                    <div className="flex gap-2">
                        <input className="bg-white border border-zinc-200 rounded-xl px-4 py-2 text-xs font-bold outline-none flex-1 focus:border-zinc-900" placeholder="Seu e-mail" />
                        <button className="bg-zinc-900 text-white p-2 rounded-xl">
                            <ArrowLeft className="rotate-180" size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
