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
        <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/40 text-lg">Chưa có sản phẩm trong danh mục này</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="grid grid-cols-4 gap-3">
        {products.map(product => (
          <button
            key={product.id}
            onClick={() => onProductSelect(product)}
            className="bg-[#122040] rounded-xl overflow-hidden active:scale-95 transition-transform text-left group"
          >
            <div className="aspect-square overflow-hidden bg-[#0a1628] relative">
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl">
                  💎
                </div>
              )}
              {product.stock_status === 'out_of_stock' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-red-400 font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">
                    Hết hàng
                  </span>
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-white text-xs font-medium truncate">{product.name}</p>
              <p className="text-white/40 text-[10px] mt-0.5">{product.code}</p>
              {product.listed_price > 0 && (
                <p className="text-[#c9a84c] text-xs font-semibold mt-1">
                  {formatCurrency(product.listed_price)}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
