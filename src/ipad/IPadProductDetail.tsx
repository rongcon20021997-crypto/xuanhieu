import { useState, useEffect } from 'react';
import { Product, ProductImage, supabase } from '../lib/supabase';
import { formatCurrency, generateQuotationCode } from '../lib/format';
import { Bookmark, Calculator, ChevronLeft, ChevronRight, ZoomIn, Play, Film } from 'lucide-react';

type Props = {
  product: Product;
  onBack: () => void;
};

type MediaItem = {
  id: string;
  url: string;
  type: 'image' | 'video';
  is_thumbnail?: boolean;
};

export default function IPadProductDetail({ product, onBack }: Props) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showPriceCalc, setShowPriceCalc] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [calcResult, setCalcResult] = useState<null | { discountAmount: number; finalPrice: number; valid: boolean }>(null);
  const [saved, setSaved] = useState(false);
  const [quoteSaved, setQuoteSaved] = useState(false);
  const [zoomImg, setZoomImg] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [product.id]);

  async function loadMedia() {
    const items: MediaItem[] = [];

    // Load images from product_images table
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order');

    if (data && data.length > 0) {
      data.forEach((img: ProductImage) => {
        items.push({ id: img.id, url: img.image_url, type: 'image', is_thumbnail: img.is_thumbnail });
      });
    } else if (product.thumbnail_url) {
      // Fallback to thumbnail_url
      items.push({ id: 'thumb', url: product.thumbnail_url, type: 'image', is_thumbnail: true });
    }

    // Add video if exists
    if (product.video_url) {
      items.push({ id: 'video', url: product.video_url, type: 'video' });
    }

    setMediaItems(items);
    setCurrentIdx(0);
  }

  const currentMedia = mediaItems[currentIdx];

  function calcPrice() {
    const disc = parseFloat(discountInput);
    if (isNaN(disc) || disc < 0) return;
    const valid = disc <= product.max_discount_percent;
    const discountAmount = Math.round(product.listed_price * disc / 100);
    const finalPrice = product.listed_price - discountAmount;
    setCalcResult({ discountAmount, finalPrice, valid });
  }

  async function saveQuotation() {
    if (!calcResult || !calcResult.valid) return;
    await supabase.from('quotations').insert({
      quotation_code: generateQuotationCode(),
      product_id: product.id,
      listed_price: product.listed_price,
      discount_percent: parseFloat(discountInput),
      discount_amount: calcResult.discountAmount,
      final_price: calcResult.finalPrice,
      sale_user_name: 'Sale iPad',
      status: 'pending',
    });
    setQuoteSaved(true);
    setTimeout(() => setQuoteSaved(false), 2000);
  }

  async function saveInterested() {
    await supabase.from('interested_products').insert({
      product_id: product.id,
      sale_user_name: 'Sale iPad',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex gap-0 h-full">
        {/* Left: media gallery (images + video) */}
        <div className="w-1/2 flex flex-col bg-[#0a1628] relative">
          <div className="flex-1 relative overflow-hidden" onClick={() => currentMedia?.type === 'image' && setZoomImg(true)}>
            {currentMedia ? (
              currentMedia.type === 'video' ? (
                /* Video player */
                <video
                  key={currentMedia.id}
                  src={currentMedia.url}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                  autoPlay
                  muted
                />
              ) : (
                /* Image */
                <img
                  src={currentMedia.url}
                  alt={product.name}
                  className="w-full h-full object-contain cursor-zoom-in"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-6xl">💎</div>
            )}

            {currentMedia?.type === 'image' && (
              <button className="absolute top-3 right-3 text-white/60 hover:text-white bg-black/40 p-1.5 rounded-lg">
                <ZoomIn size={18} />
              </button>
            )}

            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setCurrentIdx(i => Math.max(0, i - 1)); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setCurrentIdx(i => Math.min(mediaItems.length - 1, i + 1)); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails strip */}
          {mediaItems.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {mediaItems.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all relative ${i === currentIdx ? 'border-[#c9a84c]' : 'border-transparent opacity-60'}`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-[#122040] flex items-center justify-center">
                      <Play size={16} className="text-[#c9a84c]" fill="#c9a84c" />
                    </div>
                  ) : (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  )}
                  {item.type === 'video' && (
                    <div className="absolute bottom-0.5 right-0.5">
                      <Film size={8} className="text-white/70" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: info */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[#c9a84c] text-sm font-mono">{product.code}</p>
              <h2 className="text-white text-xl font-bold mt-1 leading-tight">{product.name}</h2>
            </div>
            <button
              onClick={saveInterested}
              className={`p-2 rounded-lg transition-all ${saved ? 'text-[#c9a84c] bg-[#c9a84c]/20' : 'text-white/50 hover:text-[#c9a84c]'}`}
            >
              <Bookmark size={22} fill={saved ? '#c9a84c' : 'none'} />
            </button>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4 ${product.stock_status === 'in_stock' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${product.stock_status === 'in_stock' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {product.stock_status === 'in_stock' ? `Còn hàng (${product.stock_quantity})` : 'Hết hàng'}
          </div>

          <div className="mb-5">
            <p className="text-3xl font-bold text-[#c9a84c]">{formatCurrency(product.listed_price)}</p>
            {product.promotion_price && product.promotion_price > 0 && (
              <p className="text-white/40 text-sm line-through mt-1">{formatCurrency(product.promotion_price)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {product.material && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/40 text-xs mb-1">Chất liệu</p>
                <p className="text-white text-sm font-medium">{product.material}</p>
              </div>
            )}
            {product.weight && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/40 text-xs mb-1">Trọng lượng</p>
                <p className="text-white text-sm font-medium">{product.weight}</p>
              </div>
            )}
            {product.size && (
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/40 text-xs mb-1">Kích thước</p>
                <p className="text-white text-sm font-medium">{product.size}</p>
              </div>
            )}
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-white/40 text-xs mb-1">Giảm tối đa</p>
              <p className="text-white text-sm font-medium">{product.max_discount_percent}%</p>
            </div>
          </div>

          {product.description && (
            <p className="text-white/60 text-sm leading-relaxed mb-5">{product.description}</p>
          )}

          <button
            onClick={() => setShowPriceCalc(!showPriceCalc)}
            className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b8943e] text-[#0d1b3e] font-bold py-3.5 rounded-xl transition-colors mb-3"
          >
            <Calculator size={20} />
            Tính giá cho khách
          </button>

          {showPriceCalc && (
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <div>
                <label className="text-white/60 text-xs block mb-1.5">
                  % Giảm giá (tối đa {product.max_discount_percent}%)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={discountInput}
                    onChange={e => { setDiscountInput(e.target.value); setCalcResult(null); }}
                    placeholder="Nhập % giảm"
                    min="0"
                    max={product.max_discount_percent}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                  />
                  <button
                    onClick={calcPrice}
                    className="bg-[#c9a84c]/20 hover:bg-[#c9a84c]/30 text-[#c9a84c] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Tính
                  </button>
                </div>
              </div>

              {calcResult && (
                <div className={`rounded-xl p-4 ${calcResult.valid ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  {calcResult.valid ? (
                    <>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Giá niêm yết</span>
                        <span className="text-white">{formatCurrency(product.listed_price)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Giảm {discountInput}%</span>
                        <span className="text-red-400">- {formatCurrency(calcResult.discountAmount)}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex justify-between">
                        <span className="text-white font-semibold">Khách thanh toán</span>
                        <span className="text-[#c9a84c] font-bold text-lg">{formatCurrency(calcResult.finalPrice)}</span>
                      </div>
                      <button
                        onClick={saveQuotation}
                        className="w-full mt-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        {quoteSaved ? '✓ Đã lưu báo giá' : 'Lưu báo giá'}
                      </button>
                    </>
                  ) : (
                    <p className="text-red-400 text-sm text-center font-medium">
                      Mức giảm vượt quá {product.max_discount_percent}% tối đa cho phép
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Zoom modal - only for images */}
      {zoomImg && currentMedia?.type === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setZoomImg(false)}
        >
          <img
            src={currentMedia.url}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
