import { useState, useEffect, useCallback } from 'react';
import { supabase, Category, Product } from '../lib/supabase';
import IPadCategoryTabs from './IPadCategoryTabs';
import IPadProductGrid from './IPadProductGrid';
import IPadProductDetail from './IPadProductDetail';
import IPadSearch from './IPadSearch';
import IPadQuotations from './IPadQuotations';
import IPadInterested from './IPadInterested';
import { Search, Settings, Bookmark, FileText } from 'lucide-react';

type View = 'categories' | 'products' | 'detail' | 'search' | 'quotations' | 'interested';

export default function IPadApp() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [view, setView] = useState<View>('categories');
  const [storeName, setStoreName] = useState('Xuân Hiếu');
  const [idleTimeout, setIdleTimeout] = useState(120);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showSidebar] = useState(true);

  useEffect(() => {
    loadCategories();
    loadSettings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > idleTimeout * 1000) {
        setView('categories');
        setSelectedCategory(null);
        setSelectedProduct(null);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [lastActivity, idleTimeout]);

  const resetIdle = useCallback(() => setLastActivity(Date.now()), []);

  useEffect(() => {
    const events = ['touchstart', 'mousedown', 'mousemove', 'keydown', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetIdle));
    return () => events.forEach(e => window.removeEventListener(e, resetIdle));
  }, [resetIdle]);

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (data) {
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0]);
        setView('products');
      }
    }
  }

  async function loadSettings() {
    const { data } = await supabase.from('app_settings').select('*');
    if (data) {
      const name = data.find(s => s.key === 'store_name');
      const timeout = data.find(s => s.key === 'app_idle_timeout_seconds');
      if (name) setStoreName(name.value);
      if (timeout) setIdleTimeout(parseInt(timeout.value));
    }
  }

  function handleCategorySelect(cat: Category) {
    setSelectedCategory(cat);
    setView('products');
  }

  function handleProductSelect(product: Product) {
    setSelectedProduct(product);
    setView('detail');
  }

  function handleBack() {
    if (view === 'detail') {
      setView(selectedCategory ? 'products' : 'search');
    } else {
      setView('categories');
      setSelectedCategory(null);
    }
  }

  const getTitle = () => {
    if (view === 'search') return 'Tìm kiếm';
    if (view === 'quotations') return 'Báo giá';
    if (view === 'interested') return 'Quan tâm';
    if (view === 'detail' && selectedProduct) return selectedProduct.name;
    if (view === 'products' && selectedCategory) return selectedCategory.name;
    return storeName;
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] text-gray-800 font-sans select-none overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-2 pb-1 text-xs text-gray-600">
        <span className="font-semibold text-white bg-red-500 px-2 py-0.5 rounded-full text-[11px]">
          {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex items-center gap-1">
          <span>▲▲▲</span>
          <span>WiFi</span>
          <span>■■■</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-[#fcf9f5] border-b border-gray-200">
        <div className="flex items-center gap-4">
          <img src="/logoxuanhieu.png" alt="Logo" className="h-10 object-contain" />
          <div className="h-8 w-px bg-gray-300" />
          <p className="text-gray-600 text-lg">
            Xin chào, <span className="font-bold text-[#b08d3a]">Quý khách</span>
          </p>
        </div>

        <div className="flex items-center gap-6 justify-end">
          <button
            onClick={() => setView('search')}
            className="text-gray-500 hover:text-[#b08d3a] active:opacity-70 transition-colors"
          >
            <Search size={24} />
          </button>
          <button
            onClick={() => setView('quotations')}
            className="text-gray-500 hover:text-[#b08d3a] active:opacity-70 transition-colors"
          >
            <FileText size={24} />
          </button>
          <button
            onClick={() => setView('interested')}
            className="text-gray-500 hover:text-[#b08d3a] active:opacity-70 transition-colors"
          >
            <Bookmark size={24} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50 px-6 pt-4">
        {/* Categories Header */}
        {(view === 'categories' || view === 'products') && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 overflow-hidden">
               <IPadCategoryTabs
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelect={handleCategorySelect}
               />
            </div>
          </div>
        )}

        {/* Back button for detail view */}
        {view === 'detail' && (
          <div className="mb-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-[#b08d3a] hover:underline bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm font-medium"
            >
              <span className="text-xl leading-none">←</span> Quay lại
            </button>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {view === 'categories' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center flex flex-col items-center">
                <img src="/logoxuanhieu.png" alt="Xuân Hiếu Logo" className="h-24 object-contain mb-6" />
                <p className="text-[#b08d3a] text-4xl font-bold mb-4">{storeName}</p>
                <p className="text-gray-500 text-lg">Chọn danh mục từ menu bên trái</p>
              </div>
            </div>
          )}
          {view === 'products' && selectedCategory && (
            <IPadProductGrid
              category={selectedCategory}
              onProductSelect={handleProductSelect}
            />
          )}
          {view === 'detail' && selectedProduct && (
            <IPadProductDetail
              product={selectedProduct}
              onBack={handleBack}
            />
          )}
          {view === 'search' && (
            <IPadSearch onProductSelect={handleProductSelect} />
          )}
          {view === 'quotations' && (
            <IPadQuotations />
          )}
          {view === 'interested' && (
            <IPadInterested onProductSelect={handleProductSelect} />
          )}
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="flex justify-center py-2">
        <div className="w-32 h-1 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
}
