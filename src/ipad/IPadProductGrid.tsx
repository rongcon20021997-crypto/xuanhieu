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
        <p className="text-gray-500 text-lg">Chưa có sản phẩm trong danh mục này</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="grid grid-cols-4 gap-4 auto-rows-fr">
        {products.map(product => (
          <button
            key={product.id}
            onClick={() => onProductSelect(product)}
            className="bg-[#fcf9f5] border border-gray-100 rounded-xl overflow-hidden active:scale-95 transition-transform text-left flex flex-col h-full"
          >
            <div className="w-full h-40 bg-gray-100 relative flex-shrink-0">
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
                  💎
                </div>
              )}
              {product.stock_status === 'out_of_stock' && (
                <div className="absolute inset-0 bg-white/80 text-gray-800 flex items-center justify-center">
                  <span className="text-red-400 font-semibold text-[10px] bg-white/80 px-2 py-0.5 rounded-full">
                    Hết hàng
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-3 flex flex-col" style={{height: '80px'}}>
              <h3 className="text-gray-900 font-semibold text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>

              
              <div className="mt-auto flex items-end justify-between">
                <div></div>
                {product.listed_price > 0 && (
                  <p className="text-[#b08d3a] text-xs font-bold ml-auto">
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
