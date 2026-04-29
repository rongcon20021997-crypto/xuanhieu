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
        <div className="w-1/2 flex flex-col bg-gray-50 relative">
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
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">💎</div>
            )}

            {currentMedia?.type === 'image' && (
              <button className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 bg-white/80 text-gray-800 p-1.5 rounded-lg">
                <ZoomIn size={18} />
              </button>
            )}

            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setCurrentIdx(i => Math.max(0, i - 1)); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full text-gray-800 hover:bg-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setCurrentIdx(i => Math.min(mediaItems.length - 1, i + 1)); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full text-gray-800 hover:bg-white"
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
                    <div className="w-full h-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                      <Play size={16} className="text-[#b08d3a]" fill="#c9a84c" />
                    </div>
                  ) : (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  )}
                  {item.type === 'video' && (
                    <div className="absolute bottom-0.5 right-0.5">
                      <Film size={8} className="text-gray-600" />
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
              <p className="text-[#b08d3a] text-[10px] font-mono">{product.code}</p>
              <h2 className="text-gray-800 text-lg font-bold mt-1 leading-tight">{product.name}</h2>
            </div>
            <button
              onClick={saveInterested}
              className={`p-2 rounded-lg transition-all ${saved ? 'text-[#b08d3a] bg-[#c9a84c]/20' : 'text-gray-500 hover:text-[#b08d3a]'}`}
            >
              <Bookmark size={22} fill={saved ? '#c9a84c' : 'none'} />
            </button>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium mb-4 ${product.stock_status === 'in_stock' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${product.stock_status === 'in_stock' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {product.stock_status === 'in_stock' ? `Còn hàng (${product.stock_quantity})` : 'Hết hàng'}
          </div>

          <div className="mb-4">
            <p className="text-2xl font-bold text-[#b08d3a]">{formatCurrency(product.listed_price)}</p>
            {product.promotion_price && product.promotion_price > 0 && (
              <p className="text-gray-500 text-xs line-through mt-0.5">{formatCurrency(product.promotion_price)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {product.material && (
              <div className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-gray-500 text-[10px] mb-0.5">Chất liệu</p>
                <p className="text-gray-800 text-xs font-medium">{product.material}</p>
              </div>
            )}
            {product.weight && (
              <div className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-gray-500 text-[10px] mb-0.5">Trọng lượng</p>
                <p className="text-gray-800 text-xs font-medium">{product.weight}</p>
              </div>
            )}
            {product.size && (
              <div className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-gray-500 text-[10px] mb-0.5">Kích thước</p>
                <p className="text-gray-800 text-xs font-medium">{product.size}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-2.5">
              <p className="text-gray-500 text-[10px] mb-0.5">Giảm tối đa</p>
              <p className="text-gray-800 text-xs font-medium">{product.max_discount_percent}%</p>
            </div>
          </div>

          {product.description && (
            <p className="text-gray-600 text-xs leading-relaxed mb-4">{product.description}</p>
          )}

          <button
            onClick={() => setShowPriceCalc(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b8943e] text-gray-800 font-bold py-3 rounded-xl transition-colors mb-3 text-sm shadow-sm"
          >
            <Calculator size={18} />
            Tính giá cho khách
          </button>
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

      {/* Price Calc Modal */}
      {showPriceCalc && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Calculator size={18} className="text-[#b08d3a]" /> Tính giá cho khách
              </h3>
              <button onClick={() => setShowPriceCalc(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="text-gray-600 text-sm block mb-1.5">
                  % Giảm giá (tối đa <span className="font-bold text-[#b08d3a]">{product.max_discount_percent}%</span>)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={discountInput}
                    onChange={e => { setDiscountInput(e.target.value); setCalcResult(null); }}
                    placeholder="Nhập phần trăm..."
                    min="0"
                    max={product.max_discount_percent}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
                    autoFocus
                  />
                  <button
                    onClick={calcPrice}
                    className="bg-[#b08d3a] hover:bg-[#9c7d33] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
                  >
                    Tính
                  </button>
                </div>
              </div>

              {calcResult && (
                <div className={`rounded-xl p-4 transition-all ${calcResult.valid ? 'bg-[#fcf9f5] border border-[#c9a84c]/30' : 'bg-red-50 border border-red-200'}`}>
                  {calcResult.valid ? (
                    <>
                      <div className="flex justify-between text-sm mb-2.5">
                        <span className="text-gray-500">Giá niêm yết</span>
                        <span className="text-gray-800 font-medium">{formatCurrency(product.listed_price)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2.5">
                        <span className="text-gray-500">Giảm {discountInput}%</span>
                        <span className="text-red-500 font-medium">- {formatCurrency(calcResult.discountAmount)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between items-center">
                        <span className="text-gray-800 font-bold">Khách thanh toán</span>
                        <span className="text-[#b08d3a] font-bold text-xl">{formatCurrency(calcResult.finalPrice)}</span>
                      </div>
                      <button
                        onClick={saveQuotation}
                        className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        {quoteSaved ? '✓ Đã lưu báo giá thành công' : 'Lưu báo giá này'}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-red-500 font-semibold mb-1">Không hợp lệ</p>
                      <p className="text-red-400 text-sm">
                        Mức giảm vượt quá {product.max_discount_percent}% tối đa cho phép của sản phẩm này.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
