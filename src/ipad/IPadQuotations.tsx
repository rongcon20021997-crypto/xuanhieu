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
        <div className="w-8 h-8 rounded-full animate-spin"
          style={{ border: '2px solid rgba(201,168,76,0.2)', borderTopColor: '#c9a84c' }} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-sm font-medium mb-5 uppercase tracking-widest" style={{ color: '#5a4a30' }}>
        Báo giá gần đây
      </h2>

      {quotations.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-lg" style={{ color: '#4a3a20' }}>Chưa có báo giá nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotations.map(q => (
            <div key={q.id}
              className="flex items-center gap-4 rounded-xl p-4 transition-all"
              style={{
                background: 'linear-gradient(160deg, rgba(28,24,18,0.95), rgba(20,17,12,0.98))',
                border: '1px solid rgba(201,168,76,0.1)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
              }}>
              {q.products?.thumbnail_url && (
                <img
                  src={q.products.thumbnail_url}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  style={{ border: '1px solid rgba(201,168,76,0.12)' }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-mono" style={{ color: '#8a6a30' }}>{q.quotation_code}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: q.status === 'confirmed'
                        ? 'rgba(50,160,80,0.12)'
                        : q.status === 'cancelled'
                        ? 'rgba(180,40,40,0.12)'
                        : 'rgba(255,255,255,0.05)',
                      border: q.status === 'confirmed'
                        ? '1px solid rgba(80,200,100,0.2)'
                        : q.status === 'cancelled'
                        ? '1px solid rgba(220,80,80,0.2)'
                        : '1px solid rgba(255,255,255,0.08)',
                      color: q.status === 'confirmed'
                        ? '#60c070'
                        : q.status === 'cancelled'
                        ? '#e06060'
                        : '#7a6a50',
                    }}>
                    {q.status === 'confirmed' ? 'Đã xác nhận' : q.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý'}
                  </span>
                </div>
                <p className="font-medium text-sm truncate" style={{ color: '#c8b890' }}>{q.products?.name}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs" style={{ color: '#5a4a30' }}>Giảm {q.discount_percent}%</span>
                  <span className="font-semibold text-sm" style={{ color: '#c9a84c' }}>{formatCurrency(q.final_price)}</span>
                  <span className="text-xs ml-auto" style={{ color: '#4a3a20' }}>{formatDate(q.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
