import { useState, useEffect, useCallback } from 'react';
import { supabase, Category, Product } from '../lib/supabase';
import IPadSidebar from './IPadSidebar';
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
    if (data) setCategories(data);
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
    <div className="flex flex-col h-screen bg-[#0d1b3e] text-white font-sans select-none overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-2 pb-1 text-xs text-white/70">
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
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-3 w-32">
          {view !== 'categories' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-[#c9a84c] active:opacity-70 transition-opacity"
            >
              <span className="text-xl">←</span>
              {view === 'detail' && selectedCategory && (
                <span className="text-sm truncate max-w-[80px]">{selectedCategory.name}</span>
              )}
            </button>
          )}
        </div>

        <h1 className="text-xl font-bold text-[#c9a84c] tracking-wide flex-1 text-center">
          {getTitle()}
        </h1>

        <div className="flex items-center gap-4 w-32 justify-end">
          <button
            onClick={() => setView('search')}
            className="text-white/80 hover:text-[#c9a84c] active:opacity-70 transition-colors"
          >
            <Search size={22} />
          </button>
          <button
            onClick={() => setView('quotations')}
            className="text-white/80 hover:text-[#c9a84c] active:opacity-70 transition-colors"
          >
            <FileText size={22} />
          </button>
          <button
            onClick={() => setView('interested')}
            className="text-white/80 hover:text-[#c9a84c] active:opacity-70 transition-colors"
          >
            <Bookmark size={22} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - only show for category/product views */}
        {(view === 'categories' || view === 'products' || view === 'detail') && showSidebar && (
          <IPadSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
          />
        )}

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {view === 'categories' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center flex flex-col items-center">
                <img src="/logoxuanhieu.png" alt="Xuân Hiếu Logo" className="h-24 object-contain mb-6" />
                <p className="text-[#c9a84c] text-4xl font-bold mb-4">{storeName}</p>
                <p className="text-white/50 text-lg">Chọn danh mục từ menu bên trái</p>
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
        <div className="w-32 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}
