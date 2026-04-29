import { useState } from 'react';
import { supabase, Product } from '../lib/supabase';
import { formatCurrency } from '../lib/format';
import { Search } from 'lucide-react';

type Props = {
  onProductSelect: (p: Product) => void;
};

export default function IPadSearch({ onProductSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('is_visible_ipad', true)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
      .order('name');
    if (data) setResults(data);
    setSearched(true);
    setLoading(false);
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/20 focus-within:border-[#c9a84c] transition-colors">
          <Search size={20} className="text-white/40" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm theo tên hoặc mã sản phẩm..."
            className="flex-1 bg-transparent text-white placeholder-white/40 text-base focus:outline-none"
            autoFocus
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-[#c9a84c] hover:bg-[#b8943e] text-[#0d1b3e] font-bold px-6 rounded-xl transition-colors"
        >
          Tìm
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="flex items-center justify-center flex-1">
          <p className="text-white/40 text-lg">Không tìm thấy sản phẩm nào</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-3 gap-4 overflow-y-auto">
          {results.map(product => (
            <button
              key={product.id}
              onClick={() => onProductSelect(product)}
              className="bg-[#122040] rounded-xl overflow-hidden text-left active:scale-95 transition-transform group"
            >
              <div className="aspect-square overflow-hidden bg-[#0a1628] relative">
                {product.thumbnail_url ? (
                  <img
                    src={product.thumbnail_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl">💎</div>
                )}
                {product.stock_status === 'out_of_stock' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-red-400 text-xs font-semibold bg-black/60 px-2 py-0.5 rounded-full">Hết hàng</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-[#c9a84c] text-[10px] font-mono">{product.code}</p>
                <p className="text-white text-sm font-medium mt-0.5 truncate">{product.name}</p>
                <p className="text-[#c9a84c] text-sm font-semibold mt-1">{formatCurrency(product.listed_price)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!searched && (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <Search size={48} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-base">Nhập tên hoặc mã sản phẩm để tìm kiếm</p>
          </div>
        </div>
      )}
    </div>
  );
}
