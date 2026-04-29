import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/format';
import { AdminUser } from '../AdminApp';
import { Package, FileText, ShoppingBag, Tag, TrendingUp, AlertCircle } from 'lucide-react';

type Props = { user: AdminUser };

export default function AdminDashboard({ user }: Props) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    totalCategories: 0,
    totalQuotations: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [recentQuotations, setRecentQuotations] = useState<{ id: string; quotation_code: string; products: { name: string } | null; final_price: number; created_at: string }[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [products, cats, quotes, sales] = await Promise.all([
      supabase.from('products').select('id, stock_status'),
      supabase.from('categories').select('id').eq('is_active', true),
      supabase.from('quotations').select('id'),
      supabase.from('sales_records').select('final_price'),
    ]);

    const inStock = (products.data || []).filter(p => p.stock_status === 'in_stock').length;
    const outOfStock = (products.data || []).filter(p => p.stock_status === 'out_of_stock').length;
    const revenue = (sales.data || []).reduce((sum, s) => sum + Number(s.final_price), 0);

    setStats({
      totalProducts: (products.data || []).length,
      inStockProducts: inStock,
      outOfStockProducts: outOfStock,
      totalCategories: (cats.data || []).length,
      totalQuotations: (quotes.data || []).length,
      totalSales: (sales.data || []).length,
      totalRevenue: revenue,
    });

    const { data: recentQ } = await supabase
      .from('quotations')
      .select('id, quotation_code, products(name), final_price, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    if (recentQ) setRecentQuotations(recentQ as typeof recentQuotations);
  }

  const cards = [
    { label: 'Tổng sản phẩm', value: stats.totalProducts, icon: <Package size={22} />, color: 'blue' },
    { label: 'Còn hàng', value: stats.inStockProducts, icon: <TrendingUp size={22} />, color: 'emerald' },
    { label: 'Hết hàng', value: stats.outOfStockProducts, icon: <AlertCircle size={22} />, color: 'red' },
    { label: 'Danh mục', value: stats.totalCategories, icon: <Tag size={22} />, color: 'amber' },
    { label: 'Báo giá', value: stats.totalQuotations, icon: <FileText size={22} />, color: 'violet' },
    { label: 'Đã bán', value: stats.totalSales, icon: <ShoppingBag size={22} />, color: 'cyan' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    red: 'bg-red-500/10 text-red-400',
    amber: 'bg-amber-500/10 text-amber-400',
    violet: 'bg-violet-500/10 text-violet-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Xin chào, {user.name}!</h1>
        <p className="text-slate-400 mt-1">Tổng quan hệ thống hôm nay</p>
      </div>

      {/* Revenue card */}
      {(user.role === 'admin' || user.role === 'accountant') && (
        <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/20 rounded-2xl p-6 mb-6">
          <p className="text-amber-400/70 text-sm font-medium mb-1">Tổng doanh thu</p>
          <p className="text-amber-400 text-4xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${colorMap[card.color]} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-slate-400 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent quotations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Báo giá gần đây</h2>
        {recentQuotations.length === 0 ? (
          <p className="text-slate-500 text-sm">Chưa có báo giá nào</p>
        ) : (
          <div className="space-y-3">
            {recentQuotations.map(q => (
              <div key={q.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-amber-400/70 text-xs font-mono">{q.quotation_code}</p>
                  <p className="text-white text-sm mt-0.5">{q.products?.name ?? '—'}</p>
                </div>
                <p className="text-amber-400 font-semibold">{formatCurrency(q.final_price)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
