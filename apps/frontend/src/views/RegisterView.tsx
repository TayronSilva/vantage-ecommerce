import React, { useState } from 'react';
import { authService } from '../services/auth';
import type { View } from '../types';

interface RegisterViewProps {
    onNavigate: (view: View) => void;
    onSuccess: () => void;
}

export default function RegisterView({ onNavigate, onSuccess }: RegisterViewProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cpf: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...registerData } = formData;
            await authService.register(registerData);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta. Verifique os dados.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-zinc-100 shadow-xl shadow-zinc-100/50">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black mb-2 tracking-tight">CRIAR CONTA</h2>
                    <p className="text-zinc-500">Junte-se à comunidade VANTAGE</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 italic">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
                            placeholder="Ex: João Silva"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
                            placeholder="exemplo@email.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">CPF</label>
                        <input
                            name="cpf"
                            type="text"
                            required
                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
                            placeholder="000.000.000-00"
                            value={formData.cpf}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
                                placeholder="••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Confirmar</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
                                placeholder="••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 mt-4 bg-zinc-900 text-white font-black rounded-2xl tracking-widest hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'CADASTRANDO...' : 'CADASTRAR'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-50 text-center">
                    <p className="text-zinc-500 text-sm">
                        Já tem uma conta?{' '}
                        <button
                            onClick={() => onNavigate('login')}
                            className="text-zinc-900 font-bold hover:underline"
                        >
                            Fazer Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
