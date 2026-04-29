import { useState, useEffect } from 'react';
import { supabase, InterestedProduct, Product } from '../lib/supabase';
import { formatCurrency, formatDate } from '../lib/format';
import { Trash2 } from 'lucide-react';

type Props = {
  onProductSelect: (p: Product) => void;
};

export default function IPadInterested({ onProductSelect }: Props) {
  const [items, setItems] = useState<InterestedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from('interested_products')
      .select('*, products(*, categories(*))')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setItems(data);
    setLoading(false);
  }

  async function remove(id: string) {
    await supabase.from('interested_products').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
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
        Sản phẩm quan tâm
      </h2>

      {items.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-lg" style={{ color: '#4a3a20' }}>Chưa có sản phẩm quan tâm</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id}
              className="rounded-2xl overflow-hidden relative group transition-all duration-200"
              style={{
                background: 'linear-gradient(160deg, rgba(28,24,18,0.95), rgba(20,17,12,0.98))',
                border: '1px solid rgba(201,168,76,0.12)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(201,168,76,0.3)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(201,168,76,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(201,168,76,0.12)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
              }}
            >
              <button
                onClick={() => item.products && onProductSelect(item.products as Product)}
                className="w-full text-left"
              >
                <div className="aspect-square overflow-hidden" style={{ background: 'rgba(15,12,8,0.8)' }}>
                  {item.products?.thumbnail_url ? (
                    <img
                      src={item.products.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl"
                      style={{ color: '#2a1e0a' }}>💎</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate" style={{ color: '#c8b890' }}>{item.products?.name}</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: '#c9a84c' }}>{formatCurrency(item.products?.listed_price ?? 0)}</p>
                  <p className="text-xs mt-1" style={{ color: '#4a3a20' }}>{formatDate(item.created_at)}</p>
                </div>
              </button>

              {/* Delete button */}
              <button
                onClick={() => remove(item.id)}
                className="absolute top-2 right-2 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  border: '1px solid rgba(180,40,40,0.3)',
                  color: '#a04040',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e06060'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#a04040'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
