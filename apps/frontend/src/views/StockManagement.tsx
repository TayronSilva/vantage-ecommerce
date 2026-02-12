import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { productService } from '../services/products';
import { useAuth } from '../context/AuthContext';

export default function StockManagement() {
    const { can } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [stocks, setStocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [newStock, setNewStock] = useState({
        size: '',
        color: '',
        quantity: 1
    });

    const [submitting, setSubmitting] = useState(false);
    const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

    const isManager = can('stock:manage');

    const fetchData = async () => {
        try {
            const [stocksData, productsData] = await Promise.all([
                productService.getStocks(),
                productService.getAll()
            ]);
            setStocks(stocksData);
            setProducts(productsData);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId) {
            alert('Selecione um produto');
            return;
        }
        setSubmitting(true);
        try {
            await productService.createStock({
                productId: selectedProductId,
                ...newStock,
                quantity: Number(newStock.quantity)
            });
            setShowForm(false);
            setNewStock({ size: '', color: '', quantity: 1 });
            setSelectedProductId('');
            fetchData();
        } catch (error) {
            alert('Erro ao cadastrar estoque. Verifique se essa combinação (Produto + Tamanho + Cor) já existe.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (id: string, currentQty: number, delta: number) => {
        const newQty = Math.max(0, currentQty + delta);
        setUpdatingStockId(id);
        try {
            await productService.updateStock(id, { quantity: newQty });
            await fetchData();
        } catch (error) {
            alert('Erro ao atualizar estoque');
        } finally {
            setUpdatingStockId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir permanentemente este registro de estoque?')) return;
        setUpdatingStockId(id);
        try {
            await productService.deleteStock(id);
            await fetchData();
        } catch (error) {
            alert('Erro ao excluir estoque');
        } finally {
            setUpdatingStockId(null);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Gerenciar Estoque</h3>
                {!showForm && isManager && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-800 shadow-xl shadow-zinc-200"
                    >
                        <Plus size={20} /> ENTRADA DE ESTOQUE
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 mb-12 shadow-xl shadow-zinc-100 animate-in zoom-in-95 duration-300">
                    <h4 className="text-lg font-black uppercase mb-6 tracking-tight">Novo Registro de Estoque</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-2">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Selecionar Produto</label>
                            <select
                                required
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold"
                                value={selectedProductId}
                                onChange={e => setSelectedProductId(e.target.value)}
                            >
                                <option value="">Escolha um produto...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Tamanho (Opcional)</label>
                            <input
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none"
                                placeholder="Ex: G, 40L, Único"
                                value={newStock.size}
                                onChange={e => setNewStock({ ...newStock, size: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Cor / Variante</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none"
                                placeholder="Ex: Preto, Azul, #FF0000"
                                value={newStock.color}
                                onChange={e => setNewStock({ ...newStock, color: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Quantidade Inicial</label>
                            <input
                                required type="number" min="0"
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none"
                                value={newStock.quantity}
                                onChange={e => setNewStock({ ...newStock, quantity: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-4 bg-zinc-900 text-white font-black rounded-2xl tracking-widest hover:bg-zinc-800 shadow-xl shadow-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : 'CONFIRMAR ENTRADA'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
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
                <div className="grid grid-cols-1 gap-4">
                    {stocks.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-50 rounded-[3rem] border-4 border-dashed border-zinc-100">
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Nenhum registro de estoque encontrado.</p>
                        </div>
                    ) : stocks.map(s => (
                        <div key={s.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-6">
                                <div
                                    className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-[8px] font-black uppercase text-white shadow-zinc-100 overflow-hidden text-center p-1"
                                    style={{ backgroundColor: s.color.startsWith('#') ? s.color : '#27272a' }}
                                >
                                    {s.color}
                                </div>
                                <div>
                                    <h4 className="font-black text-lg uppercase tracking-tight leading-tight">{s.product?.name || 'Produto Desconhecido'}</h4>
                                    <div className="flex gap-3 mt-1">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2 py-0.5 rounded-md border border-zinc-100">COR: {s.color}</p>
                                        {s.size && <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2 py-0.5 rounded-md border border-zinc-100">TAM: {s.size}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-8">
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">Quantidade</span>
                                    <p className="text-3xl font-black leading-none mt-1">{s.quantity}</p>
                                </div>

                                <div className="flex bg-zinc-100 p-1.5 rounded-2xl gap-1">
                                    <button
                                        disabled={updatingStockId === s.id || !isManager}
                                        onClick={() => handleUpdate(s.id, s.quantity, -1)}
                                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                    >
                                        {updatingStockId === s.id ? <Loader2 className="animate-spin w-4 h-4" /> : '-'}
                                    </button>
                                    <button
                                        disabled={updatingStockId === s.id || !isManager}
                                        onClick={() => handleUpdate(s.id, s.quantity, 1)}
                                        className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                    >
                                        {updatingStockId === s.id ? <Loader2 className="animate-spin w-4 h-4" /> : '+'}
                                    </button>
                                    <button
                                        disabled={updatingStockId === s.id || !isManager}
                                        onClick={() => handleDelete(s.id)}
                                        className="w-10 h-10 bg-zinc-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50 ml-2"
                                        title="Excluir Variação"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
