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
        <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-gray-600 text-sm font-medium mb-4 uppercase tracking-widest">Sản phẩm quan tâm</h2>
      {items.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400 text-lg">Chưa có sản phẩm quan tâm</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden relative group">
              <button
                onClick={() => item.products && onProductSelect(item.products as Product)}
                className="w-full text-left"
              >
                <div className="aspect-square overflow-hidden bg-gray-50">
                  {item.products?.thumbnail_url ? (
                    <img src={item.products.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">💎</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-gray-800 text-sm font-medium truncate">{item.products?.name}</p>
                  <p className="text-[#b08d3a] text-sm font-semibold mt-1">{formatCurrency(item.products?.listed_price ?? 0)}</p>
                  <p className="text-gray-400 text-xs mt-1">{formatDate(item.created_at)}</p>
                </div>
              </button>
              <button
                onClick={() => remove(item.id)}
                className="absolute top-2 right-2 bg-white/80 text-gray-800 p-1.5 rounded-lg text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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
