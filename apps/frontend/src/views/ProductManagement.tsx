import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Camera, Loader2 } from 'lucide-react';
import { productService } from '../services/products';
import type { Product } from '../types';

import { useAuth } from '../context/AuthContext';

export default function ProductManagement() {
    const { can } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        oldPrice: '',
        gender: '',
        isBestSeller: false,
        categoryId: '',
        weight: '0.8',
        width: '30',
        height: '45',
        length: '15'
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchData = async () => {
        try {
            const [productsData, catsData] = await Promise.all([
                productService.getAll(),
                productService.getCategories()
            ]);
            setProducts(productsData);
            setCategories(catsData);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            oldPrice: product.oldPrice?.toString() || '',
            gender: product.gender || '',
            isBestSeller: product.isBestSeller || false,
            categoryId: categories.find(c => c.name.toLowerCase() === product.category.toLowerCase())?.id?.toString() || '',
            weight: '0.8',
            width: '30',
            height: '45',
            length: '15'
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const body = new FormData();
            body.append('name', formData.name);
            body.append('description', formData.description);
            body.append('price', formData.price);
            if (formData.oldPrice) body.append('oldPrice', formData.oldPrice);
            if (formData.gender) body.append('gender', formData.gender);
            body.append('isBestSeller', formData.isBestSeller.toString());
            body.append('categoryId', formData.categoryId);
            body.append('weight', formData.weight);
            body.append('width', formData.width);
            body.append('height', formData.height);
            body.append('length', formData.length);

            if (selectedFiles.length > 0) {
                selectedFiles.forEach(file => {
                    body.append('files', file);
                });
            }

            const token = localStorage.getItem('auth_token');
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const url = editingProduct
                ? `${API_BASE_URL}/products/${editingProduct.id}`
                : `${API_BASE_URL}/products`;
            const method = editingProduct ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ao ${editingProduct ? 'atualizar' : 'criar'} produto`);
            }

            setShowForm(false);
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '', oldPrice: '', gender: '', isBestSeller: false, categoryId: '', weight: '0.8', width: '30', height: '45', length: '15' });
            setSelectedFiles([]);
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Erro ao salvar produto. Verifique se o backend está rodando e se você tem as permissões necessárias.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Excluir este produto permanentemente?')) {
            try {
                await productService.delete(id);
                fetchData();
            } catch (error) {
                alert('Erro ao excluir produto');
            }
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                    {editingProduct ? 'Editar Produto' : 'Gerenciar Produtos'}
                </h3>
                {(!showForm && can('product:create')) && (
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setFormData({ name: '', description: '', price: '', oldPrice: '', gender: '', isBestSeller: false, categoryId: '', weight: '0.8', width: '30', height: '45', length: '15' });
                            setShowForm(true);
                        }}
                        className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-800 shadow-xl shadow-zinc-200"
                    >
                        <Plus size={20} /> NOVO PRODUTO
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 mb-12 shadow-xl shadow-zinc-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Nome do Produto</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-2 ring-zinc-100"
                                placeholder="Ex: Mochila Minimalist Pro"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Preço (R$)</label>
                            <input
                                required type="number" step="0.01"
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none"
                                placeholder="299.90"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Preço Antigo (R$)</label>
                            <input
                                type="number" step="0.01"
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none"
                                placeholder="499.00"
                                value={formData.oldPrice}
                                onChange={e => setFormData({ ...formData, oldPrice: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Gênero</label>
                            <select
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">Não especificado</option>
                                <option value="Homem">Homem</option>
                                <option value="Mulher">Mulher</option>
                                <option value="Unissex">Unissex</option>
                            </select>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Configurações</label>
                            <label className="flex items-center gap-3 px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-zinc-900 rounded-lg cursor-pointer"
                                    checked={formData.isBestSeller}
                                    onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })}
                                />
                                <span className="text-sm font-bold uppercase tracking-tight">Best Seller</span>
                            </label>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                            <select
                                required
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold"
                                value={formData.categoryId}
                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            >
                                <option value="">Selecione...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Peso (kg)</label>
                            <input
                                required type="number" step="0.001"
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none"
                                placeholder="0.800"
                                value={formData.weight}
                                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Largura (cm)</label>
                            <input
                                required type="number"
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none"
                                placeholder="30"
                                value={formData.width}
                                onChange={e => setFormData({ ...formData, width: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Altura (cm)</label>
                            <input
                                required type="number"
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none"
                                placeholder="45"
                                value={formData.height}
                                onChange={e => setFormData({ ...formData, height: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Comprimento (cm)</label>
                            <input
                                required type="number"
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none"
                                placeholder="15"
                                value={formData.length}
                                onChange={e => setFormData({ ...formData, length: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 ml-1">Imagens do Produto</label>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="relative aspect-square bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden group/img">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            className="w-full h-full object-cover"
                                            onLoad={(e) => URL.revokeObjectURL((e.target as any).src)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                        {index === 0 && (
                                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-zinc-900/80 text-white text-[8px] font-black uppercase rounded-full">
                                                Principal
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="relative aspect-square bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 transition-all">
                                    <input
                                        type="file"
                                        multiple
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={e => {
                                            const files = Array.from(e.target.files || []);
                                            setSelectedFiles(prev => [...prev, ...files]);
                                        }}
                                    />
                                    <Plus size={24} className="text-zinc-300 mb-1" />
                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Adicionar</p>
                                </div>
                            </div>

                            {selectedFiles.length === 0 && (
                                <div className="p-12 border-2 border-dashed border-zinc-100 rounded-[2rem] flex flex-col items-center justify-center text-center bg-zinc-50/30">
                                    <Camera size={32} className="text-zinc-200 mb-3" />
                                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Nenhuma imagem selecionada</p>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Descrição Detalhada</label>
                            <textarea
                                rows={4}
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none"
                                placeholder="Descreva as características da mochila..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-10 flex gap-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-4 bg-zinc-900 text-white font-black rounded-2xl tracking-widest hover:bg-zinc-800 shadow-xl shadow-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : (editingProduct ? 'ATUALIZAR PRODUTO' : 'CRIAR PRODUTO')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setEditingProduct(null);
                                setFormData({ name: '', description: '', price: '', oldPrice: '', gender: '', isBestSeller: false, categoryId: '', weight: '0.8', width: '30', height: '45', length: '15' });
                                setSelectedFiles([]);
                            }}
                            className="px-10 py-4 bg-zinc-100 text-zinc-500 font-bold rounded-2xl hover:bg-zinc-200"
                        >
                            CANCELAR
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-300" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(p => (
                        <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-zinc-100 flex gap-4 items-center group">
                            <div className="w-20 h-20 bg-zinc-50 rounded-2xl p-2 border border-zinc-50 flex-shrink-0">
                                <img src={p.colors[0].img} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h4 className="font-black text-sm uppercase truncate">{p.name}</h4>
                                <p className="text-xs font-bold text-zinc-400 mt-1">R$ {p.price.toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                {can('product:update') && (
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                )}
                                {can('product:delete') && <button onClick={() => handleDelete(p.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
