import React, { useState } from 'react';
import { ShoppingCart, Search, User as UserIcon, Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { View, CartItem } from '../../types';

interface HeaderProps {
    cart: CartItem[];
    onViewChange: (view: View) => void;
    onOpenCart: () => void;
    onSearch: (query: string) => void;
    onCategorySelect: (category: string | null) => void;
}

const Header: React.FC<HeaderProps> = ({ cart, onViewChange, onOpenCart, onSearch, onCategorySelect }) => {
    const { isAuthenticated, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const hasAdminAccess = user && user.role !== 'CUSTOMER';

    const handleViewChange = (view: View) => {
        onViewChange(view);
        setIsMenuOpen(false);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchValue(val);
        onSearch(val);
        if (val.trim()) {
            handleViewChange('store');
        }
    };

    const handleCategoryClick = (cat: string | null) => {
        onCategorySelect(cat);
        handleViewChange('store');
    };

    return (
        <>
            <header className="flex items-center justify-between px-6 md:px-20 py-6 border-b border-zinc-100 sticky top-0 bg-white/95 backdrop-blur-xl z-50 safe-top">
                <div className="flex items-center gap-4 cursor-pointer group shrink-0" onClick={() => handleViewChange('home')}>
                    <div className="w-10 h-10 md:w-11 md:h-11 bg-zinc-900 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-all shadow-lg shadow-zinc-200">
                        <span className="text-white font-black text-sm md:text-base">V</span>
                    </div>
                    <span className="font-black text-xl md:text-2xl tracking-tighter">VANTAGE</span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden xl:flex items-center gap-12 text-xs font-black tracking-[0.15em] text-zinc-400">
                    <button onClick={() => handleCategoryClick(null)} className="hover:text-zinc-900 transition-colors uppercase py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-zinc-900 after:transition-all hover:after:w-full">Coleções</button>
                    <button onClick={() => handleCategoryClick('Novidades')} className="hover:text-zinc-900 transition-colors uppercase py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-zinc-900 after:transition-all hover:after:w-full">Novidades</button>
                    <button onClick={() => handleCategoryClick('Mais Vendidos')} className="hover:text-zinc-900 transition-colors uppercase py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-zinc-900 after:transition-all hover:after:w-full">Mais Vendidos</button>
                    <button onClick={() => handleCategoryClick('Ofertas')} className="hover:text-zinc-900 transition-colors uppercase py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-zinc-900 after:transition-all hover:after:w-full">Ofertas</button>
                </nav>

                <div className="flex items-center gap-4 md:gap-8">
                    {/* Desktop Search */}
                    <div className="hidden lg:flex bg-zinc-50 rounded-full px-6 py-2.5 items-center gap-3 border border-zinc-100 focus-within:border-zinc-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-zinc-900/5 transition-all w-64">
                        <Search size={16} className="text-zinc-400" />
                        <input
                            className="bg-transparent text-xs outline-none w-full font-bold uppercase tracking-widest placeholder:text-zinc-300"
                            placeholder="Pesquisar..."
                            value={searchValue}
                            onChange={handleSearch}
                        />
                    </div>

                    <div className="flex items-center gap-2 md:gap-6">
                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="lg:hidden p-2 rounded-full hover:bg-zinc-50 transition-colors"
                        >
                            <Search size={20} className="text-zinc-400" />
                        </button>

                        <div
                            className="flex items-center gap-3 cursor-pointer hover:text-blue-600 transition-colors group"
                            onClick={() => handleViewChange(isAuthenticated ? 'profile' : 'login')}
                        >
                            <UserIcon size={20} className="group-hover:scale-110 transition-transform" />
                            {isAuthenticated && (
                                <div className="hidden md:flex flex-col">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-0.5">Olá,</span>
                                    <span className="text-xs font-black leading-none">{user?.name.split(' ')[0]}</span>
                                </div>
                            )}
                        </div>

                        {hasAdminAccess && (
                            <button
                                onClick={() => handleViewChange('admin-dashboard')}
                                className="hidden 2xl:block bg-zinc-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black tracking-widest hover:bg-blue-600 transition-all uppercase shadow-md active:scale-95"
                            >
                                Painel Admin
                            </button>
                        )}

                        <button
                            onClick={() => handleViewChange('wishlist')}
                            className="hidden sm:block p-2 rounded-full hover:bg-zinc-50 transition-colors group"
                        >
                            <Heart size={20} className="group-hover:text-red-500 group-hover:scale-110 transition-all" />
                        </button>

                        <button onClick={onOpenCart} className="relative group p-2 rounded-full hover:bg-zinc-50 transition-colors">
                            <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                            {cart.length > 0 && (
                                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-in fade-in zoom-in border-2 border-white shadow-sm">
                                    {cart.reduce((a, b) => a + b.quantity, 0)}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="xl:hidden p-2 rounded-full hover:bg-zinc-50 transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Search Overlay */}
            <div className={`fixed inset-x-0 h-20 bg-white border-b border-zinc-100 z-[49] transition-all duration-300 ${isSearchOpen ? 'top-16 md:top-20' : '-top-full'}`}>
                <div className="h-full px-6 flex items-center gap-4">
                    <Search size={20} className="text-zinc-400" />
                    <input
                        className="bg-transparent text-sm outline-none w-full font-bold uppercase tracking-widest placeholder:text-zinc-300"
                        placeholder="O que você está procurando?"
                        autoFocus={isSearchOpen}
                        value={searchValue}
                        onChange={handleSearch}
                    />
                    <button onClick={() => setIsSearchOpen(false)}><X size={20} className="text-zinc-400" /></button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] transition-opacity duration-500 xl:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)} />
            <div className={`fixed left-0 top-0 h-full w-full max-w-[300px] bg-white z-[70] shadow-2xl transition-transform duration-500 transform xl:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="p-8 border-b border-zinc-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-sm">V</span>
                        </div>
                        <span className="font-black text-xl tracking-tighter">VANTAGE</span>
                    </div>
                    <button onClick={() => setIsMenuOpen(false)}><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <nav className="flex flex-col gap-6">
                        <h3 className="text-[10px] font-black tracking-[0.3em] text-zinc-300 uppercase">Menu Principal</h3>
                        <button onClick={() => handleViewChange('home')} className="text-left font-black text-lg uppercase tracking-tight hover:text-blue-600 transition-colors">Início</button>
                        <button onClick={() => handleCategoryClick(null)} className="text-left font-black text-lg uppercase tracking-tight hover:text-blue-600 transition-colors">Produtos</button>
                        <button onClick={() => handleViewChange('wishlist')} className="text-left font-black text-lg uppercase tracking-tight hover:text-blue-600 transition-colors">Favoritos</button>
                        <button onClick={() => handleViewChange('profile')} className="text-left font-black text-lg uppercase tracking-tight hover:text-blue-600 transition-colors">Minha Conta</button>
                    </nav>

                    <nav className="flex flex-col gap-6 pt-8 border-t border-zinc-50">
                        <h3 className="text-[10px] font-black tracking-[0.3em] text-zinc-300 uppercase">Categorias</h3>
                        <button onClick={() => handleCategoryClick('Casual')} className="text-left font-bold text-zinc-500 uppercase tracking-widest text-xs hover:text-zinc-900 transition-colors">Casual</button>
                        <button onClick={() => handleCategoryClick('Escolar')} className="text-left font-bold text-zinc-500 uppercase tracking-widest text-xs hover:text-zinc-900 transition-colors">Escolar</button>
                        <button onClick={() => handleCategoryClick('Executivo')} className="text-left font-bold text-zinc-500 uppercase tracking-widest text-xs hover:text-zinc-900 transition-colors">Executivo</button>
                        <button onClick={() => handleCategoryClick('Viagem')} className="text-left font-bold text-zinc-500 uppercase tracking-widest text-xs hover:text-zinc-900 transition-colors">Viagem</button>
                    </nav>

                    {hasAdminAccess && (
                        <div className="pt-8 border-t border-zinc-50">
                            <button
                                onClick={() => handleViewChange('admin-dashboard')}
                                className="w-full bg-zinc-900 text-white p-4 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-blue-600 transition-all shadow-lg"
                            >
                                Painel Administrativo
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-zinc-50 border-t border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Vantage Store © 2026</p>
                </div>
            </div>
        </>
    );
};

export default Header;
