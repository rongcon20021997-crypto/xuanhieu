import { useEffect, useState } from 'react';
import { supabase, Category, Product } from '../lib/supabase';
import { formatCurrency } from '../lib/format';

type Props = {
  category: Category;
  onProductSelect: (p: Product) => void;
};

export default function IPadProductGrid({ category, onProductSelect }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [category.id]);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('category_id', category.id)
      .eq('is_visible_ipad', true)
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
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

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-base" style={{ color: '#4a3a20' }}>Chưa có sản phẩm trong danh mục này</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 product-grid-scroll">
      <div className="grid grid-cols-4 gap-4 auto-rows-fr">
        {products.map(product => (
          <button
            key={product.id}
            onClick={() => onProductSelect(product)}
            className="rounded-2xl overflow-hidden active:scale-95 transition-all duration-200 text-left flex flex-col h-full group"
            style={{
              background: 'linear-gradient(160deg, rgba(28,24,18,0.95), rgba(20,17,12,0.98))',
              border: '1px solid rgba(201,168,76,0.12)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.border = '1px solid rgba(201,168,76,0.35)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(201,168,76,0.1)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.border = '1px solid rgba(201,168,76,0.12)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
            }}
          >
            <div className="w-full h-40 relative flex-shrink-0 overflow-hidden"
              style={{ background: 'rgba(15,12,8,0.8)' }}>
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl"
                  style={{ color: '#3a2a10' }}>
                  💎
                </div>
              )}

              {/* Subtle gold gradient overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-12"
                style={{ background: 'linear-gradient(to top, rgba(10,8,4,0.7), transparent)' }} />

              {product.stock_status === 'out_of_stock' && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.65)' }}>
                  <span className="text-[10px] font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(180,40,40,0.2)', border: '1px solid rgba(220,80,80,0.3)', color: '#e06060' }}>
                    Hết hàng
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 flex flex-col" style={{ height: '80px' }}>
              <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2"
                style={{ color: '#c8b890' }}>{product.name}</h3>
              <div className="mt-auto flex items-end justify-between">
                <div></div>
                {product.listed_price > 0 && (
                  <p className="text-xs font-bold ml-auto"
                    style={{ color: '#c9a84c' }}>
                    {formatCurrency(product.listed_price)}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
