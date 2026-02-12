import { useState, useEffect } from 'react';
import { Plus, User, UserPlus, Shield, Loader2, Trash2, X, Check } from 'lucide-react';
import { userService } from '../services/users';
import { permissionService } from '../services/permissions';

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cpf: '',
        password: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [updatingProfile, setUpdatingProfile] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            const [usersData, profilesData] = await Promise.all([
                userService.getAll(),
                permissionService.getProfiles()
            ]);
            setUsers(usersData);
            setProfiles(profilesData);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await userService.createInternal(formData);
            setShowForm(false);
            setFormData({ name: '', email: '', cpf: '', password: '' });
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao criar usuário');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleProfile = async (profileId: number) => {
        if (!selectedUser) return;
        setUpdatingProfile(profileId);
        try {
            const hasProfile = selectedUser.profiles.some((p: any) => p.accessProfile.id === profileId);
            if (hasProfile) {
                await permissionService.removeProfile(selectedUser.id, profileId);
            } else {
                await permissionService.assignProfile(selectedUser.id, profileId);
            }
            const updatedUsers = await userService.getAll();
            setUsers(updatedUsers);
            setSelectedUser(updatedUsers.find((u: any) => u.id === selectedUser.id));
        } catch (error: any) {
            alert('Erro ao atualizar perfil do usuário');
        } finally {
            setUpdatingProfile(null);
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm('Desativar este usuário permanentemente?')) return;
        try {
            await userService.delete(id);
            fetchData();
        } catch (error) {
            alert('Erro ao deletar usuário');
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Gerenciar Usuários Internos</h3>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-zinc-800 shadow-xl shadow-zinc-200"
                    >
                        <UserPlus size={20} /> CADASTRAR OPERADOR
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleCreateUser} className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 mb-12 shadow-xl shadow-zinc-100 animate-in zoom-in-95 duration-300">
                    <h4 className="text-lg font-black uppercase mb-6 tracking-tight">Novo Acesso Interno</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold"
                                placeholder="Ex: Lucas Staff"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">E-mail de Acesso</label>
                            <input
                                required type="email"
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold"
                                placeholder="staff@onback.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">CPF (11 dígitos)</label>
                            <input
                                required
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold"
                                placeholder="00011122233"
                                value={formData.cpf}
                                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Senha Provisória</label>
                            <input
                                required type="password"
                                className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-4 bg-zinc-900 text-white font-black rounded-2xl tracking-widest hover:bg-zinc-800 shadow-xl shadow-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : 'CONFIRMAR CADASTRO'}
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
                    {users.map(u => (
                        <div key={u.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                                    <User size={28} />
                                </div>
                                <div>
                                    <h4 className="font-black text-lg uppercase tracking-tight leading-tight">{u.name}</h4>
                                    <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">{u.email}</p>
                                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                        {u.profiles.map((p: any) => (
                                            <span key={p.accessProfile.id} className="text-[8px] font-black text-white bg-zinc-900 px-3 py-1 rounded-full uppercase tracking-[0.1em] flex-shrink-0">
                                                {p.accessProfile.name}
                                            </span>
                                        ))}
                                        {u.profiles.length === 0 && <span className="text-[8px] font-black text-zinc-300 border border-dashed border-zinc-200 px-3 py-1 rounded-full uppercase tracking-[0.1em]">Sem Perfil</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedUser(u)}
                                    className="bg-zinc-50 text-zinc-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
                                >
                                    Gerenciar Acessos
                                </button>
                                {u.email !== 'admin@onback.com' && (
                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="w-12 h-12 bg-zinc-50 text-zinc-300 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden relative">
                        <button onClick={() => setSelectedUser(null)} className="absolute top-8 right-8 text-zinc-400 hover:text-zinc-900"><X size={24} /></button>

                        <h4 className="text-xl font-black uppercase tracking-tight mb-2">GERENCIAR PERFIS</h4>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-8">{selectedUser.name}</p>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {profiles.map(profile => {
                                const hasProfile = selectedUser.profiles.some((p: any) => p.accessProfile.id === profile.id);
                                return (
                                    <div
                                        key={profile.id}
                                        onClick={() => toggleProfile(profile.id)}
                                        className={`p-6 rounded-3xl border cursor-pointer transition-all flex items-center justify-between group ${hasProfile
                                            ? 'bg-zinc-900 border-zinc-900 text-white shadow-xl translate-x-2'
                                            : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300 text-zinc-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasProfile ? 'bg-white/10' : 'bg-white'}`}>
                                                <Shield size={20} className={hasProfile ? 'text-white' : 'text-zinc-400'} />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-tight">{profile.name}</p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${hasProfile ? 'opacity-50' : 'text-zinc-400'}`}>
                                                    {profile.rules.length} Permissões
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${hasProfile ? 'bg-white text-zinc-900' : 'bg-zinc-200 group-hover:bg-zinc-300 text-zinc-400'
                                            }`}>
                                            {updatingProfile === profile.id ? <Loader2 className="animate-spin" size={16} /> : (hasProfile ? <Check size={18} /> : <Plus size={18} />)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setSelectedUser(null)}
                            className="w-full mt-8 py-4 bg-zinc-100 text-zinc-900 font-black rounded-2xl hover:bg-zinc-200 transition-colors uppercase tracking-widest"
                        >
                            FECHAR
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
