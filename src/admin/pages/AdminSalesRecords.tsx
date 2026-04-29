import { useState, useEffect } from 'react';
import { supabase, SalesRecord, Product } from '../../lib/supabase';
import { formatCurrency, formatDate, generateQuotationCode } from '../../lib/format';
import { Plus, Search, X } from 'lucide-react';

export default function AdminSalesRecords() {
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_id: '', final_price: '', discount_percent: '', note: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    const [recs, prods] = await Promise.all([
      supabase.from('sales_records').select('*, products(name, code, thumbnail_url, listed_price)').order('sold_at', { ascending: false }),
      supabase.from('products').select('*').eq('is_visible_ipad', true).order('name'),
    ]);
    if (recs.data) setRecords(recs.data);
    if (prods.data) setProducts(prods.data);
    setLoading(false);
  }

  async function handleSave() {
    const product = products.find(p => p.id === form.product_id);
    if (!product) return;
    await supabase.from('sales_records').insert({
      product_id: form.product_id,
      listed_price: product.listed_price,
      final_price: parseFloat(form.final_price) || product.listed_price,
      discount_percent: parseFloat(form.discount_percent) || 0,
      sale_user_name: 'Admin',
      note: form.note,
      sold_at: new Date().toISOString(),
    });
    setShowForm(false);
    setForm({ product_id: '', final_price: '', discount_percent: '', note: '' });
    load();
  }

  const selectedProduct = products.find(p => p.id === form.product_id);

  const filtered = records.filter(r => {
    return !search || (r.products?.name ?? '').toLowerCase().includes(search.toLowerCase());
  });

  const totalRevenue = filtered.reduce((sum, r) => sum + Number(r.final_price), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bán hàng</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} giao dịch · Doanh thu: <span className="text-amber-600 font-semibold">{formatCurrency(totalRevenue)}</span></p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={18} />
          Ghi nhận bán hàng
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
            className="flex-1 bg-transparent text-slate-800 text-sm focus:outline-none placeholder-slate-500"
          />
          {search && <button onClick={() => setSearch('')}><X size={14} className="text-slate-500" /></button>}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Sản phẩm</th>
                <th className="text-right text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Giá niêm yết</th>
                <th className="text-center text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">% Giảm</th>
                <th className="text-right text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Giá bán</th>
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Nhân viên</th>
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Thời gian bán</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {r.products?.thumbnail_url && (
                        <img src={r.products.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-slate-800 text-sm">{r.products?.name ?? '—'}</p>
                        <p className="text-slate-500 text-xs font-mono">{r.products?.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 text-sm">{formatCurrency(r.listed_price)}</td>
                  <td className="px-6 py-4 text-center text-red-400 text-sm">{r.discount_percent}%</td>
                  <td className="px-6 py-4 text-right text-amber-600 font-semibold text-sm">{formatCurrency(r.final_price)}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{r.sale_user_name}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(r.sold_at)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Chưa có giao dịch nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white shadow-sm border border-slate-300 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-slate-800 font-semibold text-lg">Ghi nhận bán hàng</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-slate-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-500 text-sm block mb-1.5">Sản phẩm *</label>
                <select value={form.product_id} onChange={e => { const p = products.find(p => p.id === e.target.value); setForm(f => ({ ...f, product_id: e.target.value, final_price: p?.listed_price?.toString() ?? '' })); }} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-amber-500">
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                </select>
              </div>
              {selectedProduct && (
                <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-500">
                  Giá niêm yết: <span className="text-amber-600 font-semibold">{formatCurrency(selectedProduct.listed_price)}</span>
                </div>
              )}
              <div>
                <label className="text-slate-500 text-sm block mb-1.5">% Giảm giá</label>
                <input type="number" value={form.discount_percent} onChange={e => { const disc = parseFloat(e.target.value) || 0; const price = selectedProduct ? selectedProduct.listed_price * (1 - disc / 100) : 0; setForm(f => ({ ...f, discount_percent: e.target.value, final_price: Math.round(price).toString() })); }} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-amber-500" min="0" max="100" />
              </div>
              <div>
                <label className="text-slate-500 text-sm block mb-1.5">Giá bán thực tế (VNĐ)</label>
                <input type="number" value={form.final_price} onChange={e => setForm(f => ({ ...f, final_price: e.target.value }))} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-slate-500 text-sm block mb-1.5">Ghi chú</label>
                <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-amber-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 bg-white hover:bg-slate-100 text-slate-600 py-3 rounded-xl transition-colors">Hủy</button>
              <button onClick={handleSave} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-3 rounded-xl transition-colors">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
