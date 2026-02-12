import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { View } from '../types';

interface LoginViewProps {
    onNavigate: (view: View) => void;
    onSuccess: () => void;
}

export default function LoginView({ onNavigate, onSuccess }: LoginViewProps) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ email, password });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-zinc-100 shadow-xl shadow-zinc-100/50">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black mb-2 tracking-tight">BEM-VINDO</h2>
                    <p className="text-zinc-500">Acesse sua conta VANTAGE</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 italic">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
                        <input
                            type="email"
                            required
                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
                            placeholder="exemplo@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
                        <input
                            type="password"
                            required
                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 mt-4 bg-zinc-900 text-white font-black rounded-2xl tracking-widest hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'CARREGANDO...' : 'ENTRAR'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-50 text-center">
                    <p className="text-zinc-500 text-sm">
                        Não tem uma conta?{' '}
                        <button
                            onClick={() => onNavigate('register')}
                            className="text-zinc-900 font-bold hover:underline"
                        >
                            Cadastre-se
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
