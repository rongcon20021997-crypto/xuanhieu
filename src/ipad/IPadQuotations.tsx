import { useState, useEffect } from 'react';
import { supabase, Quotation } from '../lib/supabase';
import { formatCurrency, formatDate } from '../lib/format';

export default function IPadQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from('quotations')
      .select('*, products(name, code, thumbnail_url)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setQuotations(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-gray-600 text-sm font-medium mb-4 uppercase tracking-widest">Báo giá gần đây</h2>
      {quotations.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400 text-lg">Chưa có báo giá nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotations.map(q => (
            <div key={q.id} className="bg-white shadow-sm border border-gray-100 rounded-xl p-4 flex items-center gap-4">
              {q.products?.thumbnail_url && (
                <img src={q.products.thumbnail_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[#b08d3a] text-xs font-mono">{q.quotation_code}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${q.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : q.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-white text-gray-500'}`}>
                    {q.status === 'confirmed' ? 'Đã xác nhận' : q.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý'}
                  </span>
                </div>
                <p className="text-gray-800 font-medium text-sm truncate">{q.products?.name}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-gray-500 text-xs">Giảm {q.discount_percent}%</span>
                  <span className="text-[#b08d3a] font-semibold text-sm">{formatCurrency(q.final_price)}</span>
                  <span className="text-gray-400 text-xs ml-auto">{formatDate(q.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
