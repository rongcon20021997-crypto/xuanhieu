import { useState, useEffect } from 'react';
import { supabase, Product, Category } from '../../lib/supabase';
import { formatCurrency } from '../../lib/format';
import { AdminUser } from '../AdminApp';
import { Plus, CreditCard as Edit2, Eye, EyeOff, Search, X } from 'lucide-react';
import AdminProductForm from '../components/AdminProductForm';

type Props = { user: AdminUser };

export default function AdminProducts({ user }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null | 'new'>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const [prods, cats] = await Promise.all([
      supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
    ]);
    if (prods.data) setProducts(prods.data);
    if (cats.data) setCategories(cats.data);
    setLoading(false);
  }

  async function toggleVisible(product: Product) {
    await supabase.from('products').update({ is_visible_ipad: !product.is_visible_ipad, updated_at: new Date().toISOString() }).eq('id', product.id);
    load();
  }

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category_id === filterCat;
    const matchStock = !filterStock || p.stock_status === filterStock;
    return matchSearch && matchCat && matchStock;
  });

  const canEdit = user.role === 'admin' || user.role === 'warehouse';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sản phẩm</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} sản phẩm</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setEditProduct('new')}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={18} />
            Thêm sản phẩm
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mã..."
            className="flex-1 bg-transparent text-slate-800 text-sm focus:outline-none placeholder-slate-500"
          />
          {search && <button onClick={() => setSearch('')}><X size={14} className="text-slate-500" /></button>}
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-600 text-sm focus:outline-none focus:border-amber-500"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={filterStock}
          onChange={e => setFilterStock(e.target.value)}
          className="bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-600 text-sm focus:outline-none focus:border-amber-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="in_stock">Còn hàng</option>
          <option value="out_of_stock">Hết hàng</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Sản phẩm</th>
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Danh mục</th>
                <th className="text-right text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Giá niêm yết</th>
                <th className="text-center text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Tồn kho</th>
                <th className="text-center text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">iPad</th>
                <th className="text-right text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.thumbnail_url && (
                        <img src={product.thumbnail_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-slate-800 font-medium text-sm">{product.name}</p>
                        <p className="text-slate-500 text-xs font-mono mt-0.5">{product.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{product.categories?.name || '—'}</td>
                  <td className="px-6 py-4 text-right text-amber-600 font-semibold text-sm">{formatCurrency(product.listed_price)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${product.stock_status === 'in_stock' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-500/10 text-red-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${product.stock_status === 'in_stock' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      {product.stock_status === 'in_stock' ? `${product.stock_quantity}` : 'Hết'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {canEdit ? (
                      <button onClick={() => toggleVisible(product)} className={`p-1.5 rounded-lg transition-all ${product.is_visible_ipad ? 'text-emerald-600 hover:bg-emerald-100' : 'text-slate-600 hover:bg-slate-100'}`}>
                        {product.is_visible_ipad ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    ) : (
                      product.is_visible_ipad ? <Eye size={16} className="text-emerald-600 mx-auto" /> : <EyeOff size={16} className="text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {canEdit && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditProduct(product)} className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Không tìm thấy sản phẩm</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editProduct !== null && (
        <AdminProductForm
          product={editProduct === 'new' ? null : editProduct}
          categories={categories}
          onClose={() => setEditProduct(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
