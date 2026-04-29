import { useState, useEffect } from 'react';
import { supabase, Quotation } from '../../lib/supabase';
import { formatCurrency, formatDate } from '../../lib/format';
import { Search, X } from 'lucide-react';

export default function AdminQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from('quotations')
      .select('*, products(name, code, thumbnail_url)')
      .order('created_at', { ascending: false });
    if (data) setQuotations(data);
    setLoading(false);
  }

  async function updateStatus(id: string, status: Quotation['status']) {
    await supabase.from('quotations').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    load();
  }

  const filtered = quotations.filter(q => {
    const matchSearch = !search || q.quotation_code.toLowerCase().includes(search.toLowerCase()) || (q.products?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400',
    confirmed: 'bg-emerald-500/10 text-emerald-400',
    cancelled: 'bg-red-500/10 text-red-400',
  };
  const statusLabels: Record<string, string> = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã hủy',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Báo giá</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} báo giá</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo mã hoặc sản phẩm..."
            className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
          />
          {search && <button onClick={() => setSearch('')}><X size={14} className="text-slate-500" /></button>}
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-amber-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Mã BG</th>
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Sản phẩm</th>
                <th className="text-right text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Giá niêm yết</th>
                <th className="text-center text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">% Giảm</th>
                <th className="text-right text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Giá cuối</th>
                <th className="text-center text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Trạng thái</th>
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Thời gian</th>
                <th className="text-right text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <tr key={q.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-amber-400/80 text-xs font-mono">{q.quotation_code}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {q.products?.thumbnail_url && (
                        <img src={q.products.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-white text-sm">{q.products?.name ?? '—'}</p>
                        <p className="text-slate-500 text-xs font-mono">{q.products?.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400 text-sm">{formatCurrency(q.listed_price)}</td>
                  <td className="px-6 py-4 text-center text-red-400 text-sm font-medium">{q.discount_percent}%</td>
                  <td className="px-6 py-4 text-right text-amber-400 font-semibold text-sm">{formatCurrency(q.final_price)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[q.status]}`}>
                      {statusLabels[q.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(q.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {q.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(q.id, 'confirmed')} className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">Xác nhận</button>
                          <button onClick={() => updateStatus(q.id, 'cancelled')} className="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">Hủy</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-500">Chưa có báo giá nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
