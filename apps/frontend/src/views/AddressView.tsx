import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Loader2, Edit2 } from 'lucide-react';
import { addressService } from '../services/address';
import type { Address } from '../types';

export default function AddressView() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchingCep, setSearchingCep] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        zipCode: '',
        phone: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        additional: '',
        reference: ''
    });

    const fetchAddresses = async () => {
        try {
            const data = await addressService.getMyAddresses();
            setAddresses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao buscar endereços:', error);
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleCepBlur = async () => {
        const cep = formData.zipCode.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setSearchingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        } finally {
            setSearchingCep(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await addressService.update(editingId, formData);
            } else {
                await addressService.create({
                    ...formData,
                    isDefault: addresses.length === 0
                });
            }
            handleCloseForm();
            fetchAddresses();
        } catch (error) {
            alert('Erro ao salvar endereço. Verifique se todos os campos estão preenchidos corretamente.');
        }
    };

    const handleEdit = (addr: Address) => {
        setFormData({
            name: addr.name,
            zipCode: addr.zipCode,
            phone: addr.phone,
            street: addr.street,
            number: addr.number,
            neighborhood: addr.neighborhood,
            city: addr.city,
            state: addr.state,
            additional: addr.additional || '',
            reference: addr.reference || ''
        });
        setEditingId(addr.id);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            name: '', zipCode: '', phone: '', street: '', number: '',
            neighborhood: '', city: '', state: '', additional: '', reference: ''
        });
    };

    const handleSetDefault = async (id: number) => {
        try {
            await addressService.setDefault(id);
            fetchAddresses();
        } catch (error) {
            alert('Erro ao definir como padrão');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Deseja excluir este endereço?')) {
            try {
                await addressService.delete(id);
                fetchAddresses();
            } catch (error) {
                alert('Erro ao excluir endereço');
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h2 className="text-3xl font-black tracking-tight uppercase">Meus Endereços</h2>
                    <p className="text-zinc-500 font-medium">Gerencie seus locais de entrega</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                    >
                        <Plus size={20} />
                        NOVO ENDEREÇO
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[3rem] border border-zinc-100 mb-12 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl shadow-zinc-100">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
                        <div className="md:col-span-6 mb-2">
                            <span className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase">{editingId ? 'Edição' : 'Cadastro'}</span>
                            <h3 className="text-2xl font-black tracking-tight uppercase">{editingId ? 'Deseja alterar algo?' : 'Onde vamos entregar?'}</h3>
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Destinatário</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 ring-zinc-200 outline-none font-bold"
                                placeholder="Nome de quem recebe"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Telefone de Contato</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 ring-zinc-200 outline-none font-bold"
                                placeholder="(00) 00000-0000"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">CEP</label>
                            <div className="relative">
                                <input
                                    required
                                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 ring-zinc-200 outline-none font-bold"
                                    placeholder="00000-000"
                                    value={formData.zipCode}
                                    onBlur={handleCepBlur}
                                    onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                />
                                {searchingCep && <Loader2 className="absolute right-4 top-4 animate-spin text-zinc-400" size={20} />}
                            </div>
                        </div>

                        <div className="md:col-span-4">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Rua / Logradouro</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 ring-zinc-200 outline-none font-bold"
                                placeholder="Avenida Brasil..."
                                value={formData.street}
                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Número</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-zinc-900 text-white border border-zinc-900 rounded-2xl focus:ring-4 ring-blue-500/20 outline-none font-bold placeholder:text-zinc-500"
                                placeholder="S/N, 123..."
                                value={formData.number}
                                onChange={e => setFormData({ ...formData, number: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-4">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Bairro</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 ring-zinc-200 outline-none font-bold"
                                placeholder="Ex: Centro"
                                value={formData.neighborhood}
                                onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-4">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Cidade</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 ring-zinc-200 outline-none font-bold"
                                placeholder="Ex: São Paulo"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Estado (UF)</label>
                            <input
                                required
                                maxLength={2}
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 ring-zinc-200 outline-none font-bold uppercase text-center"
                                placeholder="SP"
                                value={formData.state}
                                onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Complemento</label>
                            <input
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 ring-zinc-200 outline-none font-bold"
                                placeholder="Apto, Bloco..."
                                value={formData.additional}
                                onChange={e => setFormData({ ...formData, additional: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Referência</label>
                            <input
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 ring-zinc-200 outline-none font-bold"
                                placeholder="Próximo ao..."
                                value={formData.reference}
                                onChange={e => setFormData({ ...formData, reference: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col md:flex-row gap-4">
                        <button
                            type="submit"
                            className="flex-1 py-5 bg-zinc-900 text-white font-black rounded-2xl tracking-[0.2em] hover:bg-zinc-800 shadow-2xl shadow-zinc-200 transition-all uppercase text-xs"
                        >
                            {editingId ? 'Salvar Alterações' : 'Salvar Novo Endereço'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCloseForm}
                            className="px-10 py-5 bg-zinc-100 text-zinc-400 font-bold rounded-2xl hover:bg-zinc-200 transition-colors uppercase text-xs"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-zinc-300" size={40} />
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-24 bg-zinc-50/50 rounded-[4rem] border-4 border-dashed border-zinc-100">
                    <MapPin size={64} className="mx-auto text-zinc-200 mb-6" />
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Nenhum endereço cadastrado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {addresses.map(addr => (
                        <div
                            key={addr.id}
                            className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col md:flex-row justify-between md:items-center gap-8 ${addr.isDefault ? 'border-zinc-900 bg-zinc-900 text-white shadow-2xl shadow-zinc-200' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
                        >
                            <div className="flex gap-8 items-center flex-1">
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-white/10 text-white' : 'bg-zinc-50 text-zinc-300'}`}>
                                    <MapPin size={32} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="font-black text-xl leading-tight uppercase tracking-tight">{addr.street}, {addr.number}</h3>
                                        {addr.isDefault && (
                                            <span className="bg-white text-zinc-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Principal</span>
                                        )}
                                    </div>
                                    <div className={`text-sm font-bold tracking-tight ${addr.isDefault ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                        <p className="uppercase">{addr.neighborhood}, {addr.city} - {addr.state}</p>
                                        <p className="mt-1 flex gap-2 flex-wrap items-center">
                                            <span>CEP: {addr.zipCode}</span>
                                            <span className="opacity-30">|</span>
                                            <span className="uppercase text-[10px] tracking-widest">Para: {addr.name}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleEdit(addr)}
                                    className={`p-4 rounded-2xl transition-all ${addr.isDefault ? 'text-zinc-500 hover:text-white hover:bg-white/10' : 'text-zinc-300 hover:text-blue-600 hover:bg-blue-50'}`}
                                >
                                    <Edit2 size={24} />
                                </button>
                                {!addr.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(addr.id)}
                                        className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-[10px] font-black tracking-widest hover:bg-blue-600 transition-all uppercase shadow-lg shadow-zinc-200"
                                    >
                                        Usar como Padrão
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(addr.id)}
                                    className={`p-4 rounded-2xl transition-all ${addr.isDefault ? 'text-zinc-500 hover:text-white hover:bg-white/10' : 'text-zinc-300 hover:text-red-500 hover:bg-red-50'}`}
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
