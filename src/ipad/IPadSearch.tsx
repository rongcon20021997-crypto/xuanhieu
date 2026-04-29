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
      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center gap-3 rounded-2xl px-4 py-3 transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(201,168,76,0.2)',
          }}>
          <Search size={20} style={{ color: '#6a5a40' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm theo tên hoặc mã sản phẩm..."
            className="flex-1 bg-transparent text-base focus:outline-none"
            style={{ color: '#c8b890', caretColor: '#c9a84c' }}
            autoFocus
          />
        </div>
        <button
          onClick={handleSearch}
          className="font-bold px-6 rounded-2xl transition-all duration-200 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #c9a84c, #a07830)',
            color: '#0a0a0a',
            boxShadow: '0 4px 16px rgba(201,168,76,0.25)',
          }}
        >
          Tìm
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full animate-spin"
            style={{ border: '2px solid rgba(201,168,76,0.2)', borderTopColor: '#c9a84c' }} />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="flex items-center justify-center flex-1">
          <p className="text-lg" style={{ color: '#4a3a20' }}>Không tìm thấy sản phẩm nào</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-3 gap-4 overflow-y-auto">
          {results.map(product => (
            <button
              key={product.id}
              onClick={() => onProductSelect(product)}
              className="rounded-2xl overflow-hidden text-left active:scale-95 transition-all duration-200 group"
              style={{
                background: 'linear-gradient(160deg, rgba(28,24,18,0.95), rgba(20,17,12,0.98))',
                border: '1px solid rgba(201,168,76,0.12)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(201,168,76,0.35)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(201,168,76,0.12)';
              }}
            >
              <div className="aspect-square overflow-hidden relative"
                style={{ background: 'rgba(15,12,8,0.8)' }}>
                {product.thumbnail_url ? (
                  <img
                    src={product.thumbnail_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl"
                    style={{ color: '#3a2a10' }}>💎</div>
                )}
                {product.stock_status === 'out_of_stock' && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.65)' }}>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: 'rgba(180,40,40,0.2)', border: '1px solid rgba(220,80,80,0.3)', color: '#e06060' }}>
                      Hết hàng
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-[10px] font-mono" style={{ color: '#8a6a30' }}>{product.code}</p>
                <p className="text-sm font-medium mt-0.5 truncate" style={{ color: '#c8b890' }}>{product.name}</p>
                <p className="text-sm font-semibold mt-1" style={{ color: '#c9a84c' }}>{formatCurrency(product.listed_price)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!searched && (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <Search size={48} className="mx-auto mb-4" style={{ color: '#2a1e0a' }} />
            <p className="text-base" style={{ color: '#4a3a20' }}>Nhập tên hoặc mã sản phẩm để tìm kiếm</p>
          </div>
        </div>
      )}
    </div>
  );
}
