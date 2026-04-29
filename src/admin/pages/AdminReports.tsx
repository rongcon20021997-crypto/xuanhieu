import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/format';
import { BarChart2, Package, TrendingUp, FileText } from 'lucide-react';

type ReportTab = 'revenue' | 'stock' | 'quotations' | 'discounts';

export default function AdminReports() {
  const [tab, setTab] = useState<ReportTab>('revenue');
  const [revenueByCategory, setRevenueByCategory] = useState<{ name: string; revenue: number; count: number }[]>([]);
  const [stockData, setStockData] = useState<{ in_stock: number; out_of_stock: number; categories: { name: string; in_stock: number; out_of_stock: number }[] }>({ in_stock: 0, out_of_stock: 0, categories: [] });
  const [quotationStats, setQuotationStats] = useState<{ total: number; confirmed: number; cancelled: number; pending: number; totalDiscount: number }>({ total: 0, confirmed: 0, cancelled: 0, pending: 0, totalDiscount: 0 });
  const [discountData, setDiscountData] = useState<{ sale_user_name: string; count: number; avg_discount: number; total_discount: number }[]>([]);

  useEffect(() => {
    loadRevenueByCategory();
    loadStockData();
    loadQuotationStats();
    loadDiscountData();
  }, []);

  async function loadRevenueByCategory() {
    const { data } = await supabase
      .from('sales_records')
      .select('final_price, products(category_id, categories(name))');
    if (!data) return;
    const map: Record<string, { revenue: number; count: number; name: string }> = {};
    data.forEach((r: { final_price: number; products: { categories: { name: string } } | null }) => {
      const name = (r.products as { categories: { name: string } } | null)?.categories?.name ?? 'Không rõ';
      if (!map[name]) map[name] = { revenue: 0, count: 0, name };
      map[name].revenue += Number(r.final_price);
      map[name].count += 1;
    });
    setRevenueByCategory(Object.values(map).sort((a, b) => b.revenue - a.revenue));
  }

  async function loadStockData() {
    const { data } = await supabase
      .from('products')
      .select('stock_status, categories(name)');
    if (!data) return;
    const inStock = data.filter(p => p.stock_status === 'in_stock').length;
    const outOfStock = data.filter(p => p.stock_status === 'out_of_stock').length;
    const catMap: Record<string, { name: string; in_stock: number; out_of_stock: number }> = {};
    data.forEach((p: { stock_status: string; categories: { name: string } | null }) => {
      const name = p.categories?.name ?? 'Không rõ';
      if (!catMap[name]) catMap[name] = { name, in_stock: 0, out_of_stock: 0 };
      if (p.stock_status === 'in_stock') catMap[name].in_stock++;
      else catMap[name].out_of_stock++;
    });
    setStockData({ in_stock: inStock, out_of_stock: outOfStock, categories: Object.values(catMap) });
  }

  async function loadQuotationStats() {
    const { data } = await supabase.from('quotations').select('status, discount_amount');
    if (!data) return;
    const total = data.length;
    const confirmed = data.filter(q => q.status === 'confirmed').length;
    const cancelled = data.filter(q => q.status === 'cancelled').length;
    const pending = data.filter(q => q.status === 'pending').length;
    const totalDiscount = data.reduce((sum, q) => sum + Number(q.discount_amount), 0);
    setQuotationStats({ total, confirmed, cancelled, pending, totalDiscount });
  }

  async function loadDiscountData() {
    const { data } = await supabase.from('quotations').select('sale_user_name, discount_percent, discount_amount');
    if (!data) return;
    const map: Record<string, { count: number; totalDiscount: number; totalPercent: number }> = {};
    data.forEach(q => {
      const name = q.sale_user_name || 'Không rõ';
      if (!map[name]) map[name] = { count: 0, totalDiscount: 0, totalPercent: 0 };
      map[name].count++;
      map[name].totalDiscount += Number(q.discount_amount);
      map[name].totalPercent += Number(q.discount_percent);
    });
    setDiscountData(Object.entries(map).map(([name, v]) => ({
      sale_user_name: name,
      count: v.count,
      avg_discount: v.count > 0 ? v.totalPercent / v.count : 0,
      total_discount: v.totalDiscount,
    })).sort((a, b) => b.total_discount - a.total_discount));
  }

  const tabs = [
    { key: 'revenue' as ReportTab, label: 'Doanh thu', icon: <TrendingUp size={16} /> },
    { key: 'stock' as ReportTab, label: 'Tồn kho', icon: <Package size={16} /> },
    { key: 'quotations' as ReportTab, label: 'Báo giá', icon: <FileText size={16} /> },
    { key: 'discounts' as ReportTab, label: 'Giảm giá', icon: <BarChart2 size={16} /> },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Báo cáo</h1>
        <p className="text-slate-400 text-sm mt-1">Thống kê tổng quan hệ thống</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.key ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Revenue */}
      {tab === 'revenue' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Doanh thu theo danh mục</h2>
            {revenueByCategory.length === 0 ? (
              <p className="text-slate-500 text-sm">Chưa có dữ liệu bán hàng</p>
            ) : (
              <div className="space-y-3">
                {revenueByCategory.map(r => {
                  const maxRev = revenueByCategory[0]?.revenue || 1;
                  return (
                    <div key={r.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 text-sm">{r.name}</span>
                        <div className="text-right">
                          <span className="text-amber-400 font-semibold text-sm">{formatCurrency(r.revenue)}</span>
                          <span className="text-slate-500 text-xs ml-2">({r.count} bán)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${(r.revenue / maxRev) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stock */}
      {tab === 'stock' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
              <p className="text-emerald-400/70 text-sm mb-1">Còn hàng</p>
              <p className="text-emerald-400 text-4xl font-bold">{stockData.in_stock}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
              <p className="text-red-400/70 text-sm mb-1">Hết hàng</p>
              <p className="text-red-400 text-4xl font-bold">{stockData.out_of_stock}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Danh mục</th>
                  <th className="text-center text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Còn hàng</th>
                  <th className="text-center text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Hết hàng</th>
                </tr>
              </thead>
              <tbody>
                {stockData.categories.map(c => (
                  <tr key={c.name} className="border-b border-slate-800/50">
                    <td className="px-6 py-3 text-white text-sm">{c.name}</td>
                    <td className="px-6 py-3 text-center text-emerald-400 font-medium">{c.in_stock}</td>
                    <td className="px-6 py-3 text-center text-red-400 font-medium">{c.out_of_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quotations */}
      {tab === 'quotations' && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Tổng báo giá', value: quotationStats.total, color: 'blue' },
            { label: 'Đã xác nhận', value: quotationStats.confirmed, color: 'emerald' },
            { label: 'Chờ xử lý', value: quotationStats.pending, color: 'amber' },
            { label: 'Đã hủy', value: quotationStats.cancelled, color: 'red' },
          ].map(s => (
            <div key={s.label} className={`bg-${s.color}-500/10 border border-${s.color}-500/20 rounded-2xl p-6`}>
              <p className="text-slate-400 text-sm mb-1">{s.label}</p>
              <p className="text-white text-4xl font-bold">{s.value}</p>
            </div>
          ))}
          <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-1">Tổng số tiền giảm giá đã báo</p>
            <p className="text-red-400 text-3xl font-bold">{formatCurrency(quotationStats.totalDiscount)}</p>
          </div>
        </div>
      )}

      {/* Discounts */}
      {tab === 'discounts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Nhân viên</th>
                <th className="text-center text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Số báo giá</th>
                <th className="text-center text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">% Giảm TB</th>
                <th className="text-right text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Tổng giảm</th>
              </tr>
            </thead>
            <tbody>
              {discountData.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Chưa có dữ liệu</td></tr>
              ) : discountData.map(d => (
                <tr key={d.sale_user_name} className="border-b border-slate-800/50">
                  <td className="px-6 py-4 text-white font-medium">{d.sale_user_name}</td>
                  <td className="px-6 py-4 text-center text-slate-400">{d.count}</td>
                  <td className="px-6 py-4 text-center text-amber-400">{d.avg_discount.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-right text-red-400 font-semibold">{formatCurrency(d.total_discount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
