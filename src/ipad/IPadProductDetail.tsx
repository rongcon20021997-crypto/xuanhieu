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
  const [discountInput, setDiscountInput] = useState('0');
  const [calcResult, setCalcResult] = useState<null | { discountAmount: number; finalPrice: number; valid: boolean }>(null);
  const [saved, setSaved] = useState(false);
  const [quoteSaved, setQuoteSaved] = useState(false);
  const [zoomImg, setZoomImg] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [product.id]);

  // Tính lại giá mỗi khi discountInput thay đổi hoặc popup mở
  useEffect(() => {
    const disc = parseFloat(discountInput);
    if (isNaN(disc) || disc < 0) {
      setCalcResult(null);
      return;
    }
    const valid = disc <= product.max_discount_percent;
    const discountAmount = Math.round(product.listed_price * disc / 100);
    const finalPrice = product.listed_price - discountAmount;
    setCalcResult({ discountAmount, finalPrice, valid });
  }, [discountInput, showPriceCalc, product]);

  async function loadMedia() {
    const items: MediaItem[] = [];
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order');

    // Đưa video lên đầu nếu có
    if (product.video_url) {
      items.push({ id: 'video', url: product.video_url, type: 'video' });
    }

    if (data && data.length > 0) {
      data.forEach((img: ProductImage) => {
        items.push({ id: img.id, url: img.image_url, type: 'image', is_thumbnail: img.is_thumbnail });
      });
    } else if (product.thumbnail_url) {
      items.push({ id: 'thumb', url: product.thumbnail_url, type: 'image', is_thumbnail: true });
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
        {/* Left: media gallery */}
        <div className="w-1/2 flex flex-col relative" style={{ background: 'rgba(8,6,4,0.95)' }}>
          <div className="flex-1 relative overflow-hidden"
            onClick={() => currentMedia?.type === 'image' && setZoomImg(true)}>
            {currentMedia ? (
              currentMedia.type === 'video' ? (
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
                <img
                  src={currentMedia.url}
                  alt={product.name}
                  className="w-full h-full object-contain cursor-zoom-in"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl"
                style={{ color: '#2a1e0a' }}>💎</div>
            )}

            {currentMedia?.type === 'image' && (
              <button className="absolute top-3 right-3 p-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c' }}>
                <ZoomIn size={18} />
              </button>
            )}

            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setCurrentIdx(i => Math.max(0, i - 1)); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all"
                  style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c' }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setCurrentIdx(i => Math.min(mediaItems.length - 1, i + 1)); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all"
                  style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c' }}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails strip */}
          {mediaItems.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto"
              style={{ borderTop: '1px solid rgba(201,168,76,0.1)', background: 'rgba(10,8,4,0.8)' }}>
              {mediaItems.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIdx(i)}
                  className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden transition-all relative"
                  style={{
                    border: i === currentIdx
                      ? '2px solid #c9a84c'
                      : '2px solid rgba(255,255,255,0.06)',
                    opacity: i === currentIdx ? 1 : 0.5,
                    boxShadow: i === currentIdx ? '0 0 8px rgba(201,168,76,0.3)' : 'none',
                  }}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'rgba(20,16,8,0.9)' }}>
                      <Play size={16} style={{ color: '#c9a84c' }} fill="#c9a84c" />
                    </div>
                  ) : (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  )}
                  {item.type === 'video' && (
                    <div className="absolute bottom-0.5 right-0.5">
                      <Film size={8} style={{ color: '#8a6a30' }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: info */}
        <div className="w-1/2 p-6 overflow-y-auto"
          style={{ borderLeft: '1px solid rgba(201,168,76,0.08)', background: 'rgba(12,10,6,0.97)' }}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[10px] font-mono" style={{ color: '#8a6a30' }}>{product.code}</p>
              <h2 className="text-lg font-bold mt-1 leading-tight" style={{ color: '#e8d8b0' }}>{product.name}</h2>
            </div>
            <button
              onClick={saveInterested}
              className="p-2 rounded-lg transition-all"
              style={{
                background: saved ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                border: saved ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.06)',
                color: saved ? '#c9a84c' : '#4a3a20',
              }}
            >
              <Bookmark size={22} fill={saved ? '#c9a84c' : 'none'} />
            </button>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium mb-4 ${product.stock_status === 'in_stock' ? '' : ''}`}
            style={{
              background: product.stock_status === 'in_stock' ? 'rgba(50,160,80,0.12)' : 'rgba(180,40,40,0.12)',
              border: product.stock_status === 'in_stock' ? '1px solid rgba(80,200,100,0.2)' : '1px solid rgba(220,80,80,0.2)',
              color: product.stock_status === 'in_stock' ? '#60c070' : '#e06060',
            }}>
            <span className="w-1.5 h-1.5 rounded-full"
              style={{ background: product.stock_status === 'in_stock' ? '#60c070' : '#e06060' }} />
            {product.stock_status === 'in_stock' ? `Còn hàng (${product.stock_quantity})` : 'Hết hàng'}
          </div>

          <div className="mb-4">
            <p className="text-2xl font-bold" style={{ color: '#c9a84c' }}>{formatCurrency(product.listed_price)}</p>
            {product.promotion_price && product.promotion_price > 0 && (
              <p className="text-xs line-through mt-0.5" style={{ color: '#4a3a20' }}>{formatCurrency(product.promotion_price)}</p>
            )}
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {product.material && (
              <div className="rounded-xl p-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.08)' }}>
                <p className="text-[10px] mb-0.5" style={{ color: '#5a4a30' }}>Chất liệu</p>
                <p className="text-xs font-medium" style={{ color: '#c8b890' }}>{product.material}</p>
              </div>
            )}
            {product.weight && (
              <div className="rounded-xl p-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.08)' }}>
                <p className="text-[10px] mb-0.5" style={{ color: '#5a4a30' }}>Trọng lượng</p>
                <p className="text-xs font-medium" style={{ color: '#c8b890' }}>{product.weight}</p>
              </div>
            )}
            {product.size && (
              <div className="rounded-xl p-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.08)' }}>
                <p className="text-[10px] mb-0.5" style={{ color: '#5a4a30' }}>Kích thước</p>
                <p className="text-xs font-medium" style={{ color: '#c8b890' }}>{product.size}</p>
              </div>
            )}
            <div className="rounded-xl p-2.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.08)' }}>
              <p className="text-[10px] mb-0.5" style={{ color: '#5a4a30' }}>Giảm tối đa</p>
              <p className="text-xs font-medium" style={{ color: '#c8b890' }}>{product.max_discount_percent}%</p>
            </div>
          </div>

          {product.description && (
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#6a5a40' }}>{product.description}</p>
          )}

          <button
            onClick={() => setShowPriceCalc(true)}
            className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all duration-200 active:scale-95 mb-3 text-sm"
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #a07830)',
              color: '#0a0a0a',
              boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
            }}
          >
            <Calculator size={18} />
            Tính giá cho khách
          </button>
        </div>
      </div>

      {/* Zoom modal */}
      {zoomImg && currentMedia?.type === 'image' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.95)' }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{
              background: 'linear-gradient(160deg, #181410, #120e08)',
              border: '1px solid rgba(201,168,76,0.25)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 40px rgba(201,168,76,0.06)',
            }}>
            {/* Modal header */}
            <div className="flex justify-between items-center px-5 py-4"
              style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', background: 'rgba(255,255,255,0.02)' }}>
              <h3 className="font-bold flex items-center gap-2" style={{ color: '#c8b890' }}>
                <Calculator size={18} style={{ color: '#c9a84c' }} /> Tính giá cho khách
              </h3>
              <button onClick={() => setShowPriceCalc(false)}
                className="text-2xl leading-none transition-colors"
                style={{ color: '#4a3a20' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#c9a84c'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#4a3a20'}>
                &times;
              </button>
            </div>

            {/* Table body */}
            <div className="p-5">
              {/* Input giảm giá — to, rõ, trên cùng */}
              <div className="mb-4">
                <label className="text-sm block mb-1.5" style={{ color: '#7a6a50' }}>
                  Giảm giá <span style={{ color: '#5a4a30' }}></span>
                </label>
                <input
                  type="number"
                  value={discountInput}
                  onChange={e => setDiscountInput(e.target.value)}
                  placeholder="Nhập % giảm giá..."
                  min="0"
                  max={product.max_discount_percent}
                  className="w-full rounded-xl px-4 py-3 text-lg focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(201,168,76,0.25)',
                    color: '#e8d8b0',
                  }}
                  autoFocus
                />
              </div>

              <table className="w-full text-sm border-collapse">
                <tbody>
                  {/* Giá niêm yết */}
                  <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                    <td className="py-3 pr-4 font-medium" style={{ color: '#8a7a60', width: '55%' }}>Giá niêm yết</td>
                    <td className="py-3 text-right font-semibold" style={{ color: '#c8b890' }}>
                      {formatCurrency(product.listed_price)}
                    </td>
                  </tr>

                  {/* Giảm tối đa */}
                  <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                    <td className="py-3 pr-4 font-medium" style={{ color: '#8a7a60' }}>Giảm tối đa cho phép</td>
                    <td className="py-3 text-right font-semibold" style={{ color: '#c9a84c' }}>
                      {product.max_discount_percent}%
                    </td>
                  </tr>

                  {/* Số tiền giảm */}
                  <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                    <td className="py-3 pr-4 font-medium" style={{ color: '#8a7a60' }}>Số tiền giảm</td>
                    <td className="py-3 text-right font-semibold" style={{ color: '#e06060' }}>
                      {calcResult ? `- ${formatCurrency(calcResult.discountAmount)}` : '—'}
                    </td>
                  </tr>

                  {/* Giá khách thanh toán */}
                  <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                    <td className="py-3 pr-4 font-bold" style={{ color: '#c8b890' }}>Giá khách thanh toán</td>
                    <td className="py-3 text-right font-bold text-lg" style={{ color: '#c9a84c' }}>
                      {calcResult ? formatCurrency(calcResult.finalPrice) : formatCurrency(product.listed_price)}
                    </td>
                  </tr>

                  {/* Trạng thái */}
                  <tr>
                    <td className="pt-3 pr-4 font-bold" style={{ color: '#c8b890' }}>Trạng thái</td>
                    <td className="pt-3 text-right">
                      {calcResult ? (
                        calcResult.valid ? (
                          <span className="inline-block px-3 py-1 rounded-lg text-sm font-bold"
                            style={{ background: 'rgba(50,160,80,0.15)', border: '1px solid rgba(80,200,100,0.25)', color: '#60c070' }}>
                            Hợp lệ
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-lg text-sm font-bold"
                            style={{ background: 'rgba(180,40,40,0.15)', border: '1px solid rgba(220,80,80,0.25)', color: '#e06060' }}>
                            Không hợp lệ
                          </span>
                        )
                      ) : (
                        <span className="text-sm" style={{ color: '#4a3a20' }}>—</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Action button */}
              {calcResult && calcResult.valid && (
                <button
                  onClick={saveQuotation}
                  className="w-full mt-5 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(50,160,80,0.85), rgba(30,120,60,0.85))',
                    border: '1px solid rgba(80,200,100,0.2)',
                    color: '#d0f0d8',
                    boxShadow: '0 4px 16px rgba(50,160,80,0.2)',
                  }}
                >
                  {quoteSaved ? '✓ Đã gửi yêu cầu thành công' : 'Yêu Cầu Kho'}
                </button>
              )}
              {calcResult && !calcResult.valid && (
                <p className="mt-4 text-center text-xs" style={{ color: '#a04040' }}>
                  Mức giảm vượt quá {product.max_discount_percent}% tối đa cho phép.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
