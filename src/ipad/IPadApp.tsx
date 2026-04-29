import { useState, useEffect, useCallback } from 'react';
import { supabase, Category, Product } from '../lib/supabase';
import IPadCategoryTabs from './IPadCategoryTabs';
import IPadProductGrid from './IPadProductGrid';
import IPadProductDetail from './IPadProductDetail';
import IPadSearch from './IPadSearch';
import IPadQuotations from './IPadQuotations';
import IPadInterested from './IPadInterested';
import { Search, Bookmark, FileText } from 'lucide-react';

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
    <div className="flex flex-col h-screen select-none overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%)', color: '#e8e0d0' }}>

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-2 pb-1 text-xs" style={{ color: '#8a7a60' }}>
        <span className="font-semibold px-2 py-0.5 rounded-full text-[11px]"
          style={{ background: 'linear-gradient(135deg, #c9a84c, #a07830)', color: '#0a0a0a' }}>
          {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="flex items-center gap-1" style={{ color: '#6a5a40' }}>
          <span>▲▲▲</span>
          <span>WiFi</span>
          <span>■■■</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4"
        style={{
          background: 'rgba(15,13,10,0.95)',
          borderBottom: '1px solid rgba(201,168,76,0.15)',
          backdropFilter: 'blur(20px)',
        }}>
        <div className="flex items-center gap-4">
          <img src="/logoxuanhieu.png" alt="Logo" className="h-10 object-contain" style={{ filter: 'brightness(0.9) contrast(1.1)' }} />
          <div className="h-8 w-px" style={{ background: 'rgba(201,168,76,0.3)' }} />
          <p className="text-lg" style={{ color: '#a09080' }}>
            Xin chào, <span className="font-bold" style={{ color: '#c9a84c' }}>Quý khách</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[
            { icon: <Search size={20} />, action: () => setView('search'), active: view === 'search' },
            { icon: <FileText size={20} />, action: () => setView('quotations'), active: view === 'quotations' },
            { icon: <Bookmark size={20} />, action: () => setView('interested'), active: view === 'interested' },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              className="relative p-2.5 rounded-xl transition-all duration-200"
              style={{
                background: btn.active
                  ? 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(160,120,48,0.15))'
                  : 'rgba(255,255,255,0.04)',
                border: btn.active
                  ? '1px solid rgba(201,168,76,0.5)'
                  : '1px solid rgba(255,255,255,0.06)',
                color: btn.active ? '#c9a84c' : '#6a5a40',
                boxShadow: btn.active ? '0 0 12px rgba(201,168,76,0.15)' : 'none',
              }}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden px-6 pt-4">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 active:scale-95"
              style={{
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.25)',
                color: '#c9a84c',
              }}
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
                <div className="relative mb-8">
                  <div className="absolute inset-0 rounded-full blur-3xl opacity-20"
                    style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }} />
                  <img src="/logoxuanhieu.png" alt="Xuân Hiếu Logo" className="relative h-24 object-contain" />
                </div>
                <p className="text-4xl font-bold mb-3"
                  style={{ background: 'linear-gradient(135deg, #c9a84c, #e8d090, #a07830)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {storeName}
                </p>
                <p className="text-base" style={{ color: '#5a4a30' }}>Chọn danh mục từ menu bên trên</p>
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
        <div className="w-32 h-1 rounded-full" style={{ background: 'rgba(201,168,76,0.2)' }} />
      </div>
    </div>
  );
}
