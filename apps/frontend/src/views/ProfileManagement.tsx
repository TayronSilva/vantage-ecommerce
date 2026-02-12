import { useState, useEffect } from 'react';
import { Plus, Shield, Loader2, Check, Edit2, Trash2 } from 'lucide-react';
import { permissionService } from '../services/permissions';

export default function ProfileManagement() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        ruleIds: [] as number[]
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            const [profilesData, rulesData] = await Promise.all([
                permissionService.getProfiles(),
                permissionService.getRules()
            ]);
            setProfiles(profilesData);
            setRules(rulesData);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await permissionService.updateProfile(editingId, formData);
            } else {
                await permissionService.createProfile(formData);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ name: '', description: '', ruleIds: [] });
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao salvar perfil');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (profile: any) => {
        setEditingId(profile.id);
        setFormData({
            name: profile.name,
            description: profile.description || '',
            ruleIds: profile.rules.map((r: any) => r.id)
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleRule = (ruleId: number) => {
        setFormData(prev => ({
            ...prev,
            ruleIds: prev.ruleIds.includes(ruleId)
                ? prev.ruleIds.filter(id => id !== ruleId)
                : [...prev.ruleIds, ruleId]
        }));
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Excluir este perfil permanentemente? Usuários vinculados perderão estas permissões.')) return;
        try {
            await permissionService.deleteProfile(id);
            fetchData();
        } catch (error) {
            alert('Erro ao excluir perfil. Verifique se há usuários vinculados que impedem a exclusão.');
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Perfis de Acesso</h3>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-800 shadow-xl shadow-zinc-200"
                    >
                        <Plus size={20} /> NOVO PERFIL
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 mb-12 shadow-xl shadow-zinc-100 animate-in zoom-in-95 duration-300">
                    <h4 className="text-lg font-black uppercase mb-6 tracking-tight">
                        {editingId ? 'Editar Perfil' : 'Criar Novo Perfil'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Nome do Perfil</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold"
                                placeholder="Ex: Gerente de Vendas"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                disabled={formData.name === 'OWNER' || formData.name === 'CUSTOMER'}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Descrição</label>
                            <input
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none"
                                placeholder="O que este perfil pode fazer?"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 ml-1">Regras e Permissões ({formData.ruleIds.length})</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {rules.map(rule => (
                                <div
                                    key={rule.id}
                                    onClick={() => toggleRule(rule.id)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${formData.ruleIds.includes(rule.id)
                                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg'
                                        : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:bg-white hover:border-zinc-300'
                                        }`}
                                >
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">{rule.name}</p>
                                        <p className={`text-[8px] font-bold uppercase tracking-widest opacity-60`}>{rule.slug}</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${formData.ruleIds.includes(rule.id) ? 'bg-white/20' : 'bg-zinc-200 group-hover:bg-zinc-300'
                                        }`}>
                                        {formData.ruleIds.includes(rule.id) ? <Check size={14} /> : <Plus size={14} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-4 bg-zinc-900 text-white font-black rounded-2xl tracking-widest hover:bg-zinc-800 shadow-xl shadow-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : 'SALVAR PERFIL'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setEditingId(null); }}
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
                    {profiles.map(profile => (
                        <div key={profile.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                                    <Shield size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(profile)} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><Edit2 size={16} /></button>
                                    {profile.name !== 'OWNER' && profile.name !== 'CUSTOMER' && (
                                        <button onClick={() => handleDelete(profile.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                    )}
                                </div>
                            </div>

                            <h4 className="text-xl font-black uppercase tracking-tight mb-2">{profile.name}</h4>
                            <p className="text-xs font-bold text-zinc-400 leading-relaxed mb-6 flex-1">{profile.description || 'Nenhuma descrição fornecida.'}</p>

                            <div className="flex items-end justify-between pt-6 border-t border-zinc-50">
                                <div>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Permissões</span>
                                    <p className="text-2xl font-black">{profile.rules.length}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Usuários</span>
                                    <p className="text-2xl font-black">{profile._count?.users || 0}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
