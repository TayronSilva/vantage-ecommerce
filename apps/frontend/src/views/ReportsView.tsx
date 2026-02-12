import { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, ShoppingBag, CreditCard, ArrowBigRight, Loader2 } from 'lucide-react';
import { reportsService } from '../services/reports';
import type { SalesReport } from '../services/reports';

export default function ReportsView() {
    const [report, setReport] = useState<SalesReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const fetchReport = async () => {
        setLoading(true);
        try {
            const data = await reportsService.getSalesReport(dateRange.start, dateRange.end);
            setReport(data);
        } catch (error) {
            console.error('Erro ao buscar relatório:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const handleExport = async () => {
        setExporting(true);
        try {
            await reportsService.exportSalesReport(dateRange.start, dateRange.end);
        } catch (error) {
            console.error('Erro ao exportar:', error);
        } finally {
            setExporting(false);
        }
    };

    if (loading && !report) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px]">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Carregando dados do relatório...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Relatórios de Vendas</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Análise de desempenho e exportação de dados</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100 shadow-sm">
                        <div className="flex items-center gap-2 px-3">
                            <Calendar size={14} className="text-zinc-400" />
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="bg-transparent text-[10px] font-black uppercase tracking-tight outline-none"
                            />
                        </div>
                        <ArrowBigRight size={14} className="text-zinc-200" />
                        <div className="flex items-center gap-2 px-3">
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="bg-transparent text-[10px] font-black uppercase tracking-tight outline-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-3 px-6 py-3.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-zinc-200"
                    >
                        {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        Exportar CSV
                    </button>
                </div>
            </div>

            {report && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm group hover:border-blue-100 transition-all">
                            <TrendingUp className="mb-4 text-blue-500 group-hover:scale-110 transition-transform" size={24} />
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Receita Total</p>
                            <p className="text-3xl font-black mt-1">R$ {report.summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm group hover:border-zinc-300 transition-all">
                            <ShoppingBag className="mb-4 text-zinc-900 group-hover:scale-110 transition-transform" size={24} />
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total de Pedidos</p>
                            <p className="text-3xl font-black mt-1">{report.summary.totalOrders}</p>
                            <div className="flex gap-4 mt-2">
                                <span className="text-[9px] font-black text-green-500 uppercase">{report.summary.paidOrders} Pagos</span>
                                <span className="text-[9px] font-black text-amber-500 uppercase">{report.summary.pendingOrders} Pendentes</span>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm group hover:border-zinc-300 transition-all">
                            <BarChart3 className="mb-4 text-zinc-400 group-hover:scale-110 transition-transform" size={24} />
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ticket Médio</p>
                            <p className="text-3xl font-black mt-1">R$ {report.summary.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-zinc-900 p-10 rounded-[3rem] text-white shadow-2xl">
                            <div className="flex justify-between items-center mb-10">
                                <h4 className="text-sm font-black uppercase tracking-[0.2em]">Desempenho Diário</h4>
                                <BarChart3 size={20} className="text-zinc-600" />
                            </div>

                            <div className="h-[200px] flex items-end gap-3 px-2">
                                {report.dailyBreakdown.slice(-7).map((day, i) => {
                                    const maxRevenue = Math.max(...report.dailyBreakdown.map(d => d.revenue), 1);
                                    const height = (day.revenue / maxRevenue) * 100;
                                    return (
                                        <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-4 group">
                                            <div
                                                className="w-full bg-blue-500 rounded-t-xl transition-all duration-1000 group-hover:bg-blue-400 cursor-pointer relative"
                                                style={{ height: `${Math.max(height, 5)}%` }}
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-zinc-900 text-[8px] font-black px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-zinc-100 z-10">
                                                    R$ {day.revenue.toLocaleString('pt-BR')}
                                                </div>
                                            </div>
                                            <span className="text-[8px] font-black text-zinc-500 tracking-tighter uppercase whitespace-nowrap">
                                                {new Date(day.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm">
                            <div className="flex justify-between items-center mb-10">
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">Métodos de Pagamento</h4>
                                <CreditCard size={20} className="text-zinc-200" />
                            </div>

                            <div className="space-y-6">
                                {report.byPaymentMethod.map((item, i) => {
                                    const maxRevenue = Math.max(...report.byPaymentMethod.map(d => d.revenue), 1);
                                    const percentage = (item.revenue / maxRevenue) * 100;
                                    return (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-zinc-900">{item.method}</span>
                                                <span className="text-zinc-400">R$ {item.revenue.toLocaleString('pt-BR')} ({item.count})</span>
                                            </div>
                                            <div className="h-3 w-full bg-zinc-50 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-zinc-900 rounded-full transition-all duration-1000"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {report.byPaymentMethod.length === 0 && (
                                    <p className="text-center text-zinc-300 text-[10px] font-black py-10 uppercase tracking-widest">Nenhuma venda registrada</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden">
                        <div className="p-10 border-b border-zinc-50 flex justify-between items-center">
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">Vendas por Produto</h4>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Produtos mais vendidos no período</p>
                            </div>
                            <span className="px-4 py-2 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-full">Top {report.byProduct.length}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-zinc-50/50">
                                        <th className="px-10 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Produto</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Vendas</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Receita</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {report.byProduct.map((product, i) => (
                                        <tr key={i} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="px-10 py-6">
                                                <p className="text-sm font-black text-zinc-900 group-hover:text-blue-600 transition-colors uppercase tracking-tighter">
                                                    {product.productName}
                                                </p>
                                                <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest mt-0.5">ID: {product.productId.split('-')[0]}</p>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-900 text-xs font-black">
                                                    {product.quantitySold}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right text-sm font-black text-zinc-900">
                                                R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                    {report.byProduct.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-10 py-20 text-center text-zinc-300 text-[10px] font-black uppercase tracking-widest italic">
                                                Nenhum produto vendido neste período
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
