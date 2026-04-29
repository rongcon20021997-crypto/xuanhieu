import { useState, useRef, useEffect } from 'react';
import { supabase, Product, Category, ProductImage } from '../../lib/supabase';
import { X, Upload, Image, Film, Trash2, GripVertical, Plus, Loader2 } from 'lucide-react';

type Props = {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
};

const inputCls = "w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-500 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-slate-500 text-xs block mb-1.5 font-medium">{label}</label>
      {children}
    </div>
  );
}

export default function AdminProductForm({ product, categories, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    code: product?.code ?? '',
    name: product?.name ?? '',
    category_id: product?.category_id ?? '',
    material: product?.material ?? '',
    weight: product?.weight ?? '',
    size: product?.size ?? '',
    description: product?.description ?? '',
    listed_price: product?.listed_price?.toString() ?? '0',
    promotion_price: product?.promotion_price?.toString() ?? '',
    max_discount_percent: product?.max_discount_percent?.toString() ?? '10',
    stock_quantity: product?.stock_quantity?.toString() ?? '0',
    stock_status: product?.stock_status ?? 'in_stock',
    is_visible_ipad: product?.is_visible_ipad ?? true,
    thumbnail_url: product?.thumbnail_url ?? '',
    video_url: product?.video_url ?? '',
  });

  // Images state
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [removeExistingVideo, setRemoveExistingVideo] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Load existing images when editing
  useEffect(() => {
    if (product) {
      loadExistingImages();
    }
  }, [product]);

  async function loadExistingImages() {
    if (!product) return;
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order');
    if (data) setExistingImages(data);
  }

  // Handle image file selection
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    setNewImageFiles(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewImagePreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same files can be selected again
    e.target.value = '';
  }

  // Handle video file selection
  function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('video/')) return;

    // Max 100MB
    if (file.size > 100 * 1024 * 1024) {
      setError('Video tối đa 100MB');
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setRemoveExistingVideo(true);
    e.target.value = '';
  }

  // Remove a new image (not yet uploaded)
  function removeNewImage(index: number) {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  // Mark existing image for deletion
  function removeExistingImage(imageId: string) {
    setDeletedImageIds(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  }

  // Remove selected video
  function removeVideo() {
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview('');
    setRemoveExistingVideo(true);
  }

  // Set as thumbnail
  function setAsThumbnail(url: string) {
    setForm(prev => ({ ...prev, thumbnail_url: url }));
  }


  // Upload a file to Supabase Storage
  async function uploadFile(file: File, bucket: string, path: string): Promise<string | null> {
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (upErr) {
      console.error('Upload error:', upErr);
      return null;
    }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
  }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim()) {
      setError('Vui lòng nhập mã và tên sản phẩm');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const timestamp = Date.now();
      const productCode = form.code.trim().replace(/[^a-zA-Z0-9]/g, '_');
      let thumbnailUrl = form.thumbnail_url;
      let videoUrl = form.video_url;

      // 1. Upload new images
      const uploadedImageUrls: string[] = [];
      if (newImageFiles.length > 0) {
        setUploadProgress(`Đang tải ${newImageFiles.length} hình ảnh...`);
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          const ext = file.name.split('.').pop() || 'jpg';
          const path = `products/${productCode}/${timestamp}_${i}.${ext}`;
          setUploadProgress(`Đang tải hình ${i + 1}/${newImageFiles.length}...`);
          const url = await uploadFile(file, 'product-media', path);
          if (url) {
            uploadedImageUrls.push(url);
          }
        }
      }

      // 1.1 Ensure thumbnail_url is valid
      const activeExisting = existingImages.filter(img => !deletedImageIds.includes(img.id));
      const allAvailableUrls = [
        ...activeExisting.map(img => img.image_url),
        ...uploadedImageUrls
      ];

      // If current thumbnail is deleted or not set, and we have images, pick the first one
      if ((!thumbnailUrl || !allAvailableUrls.includes(thumbnailUrl)) && allAvailableUrls.length > 0) {
        thumbnailUrl = allAvailableUrls[0];
      } else if (allAvailableUrls.length === 0) {
        thumbnailUrl = '';
      }


      // 2. Upload video
      if (videoFile) {
        setUploadProgress('Đang tải video...');
        const ext = videoFile.name.split('.').pop() || 'mp4';
        const path = `products/${productCode}/${timestamp}_video.${ext}`;
        const url = await uploadFile(videoFile, 'product-media', path);
        if (url) videoUrl = url;
      } else if (removeExistingVideo) {
        videoUrl = '';
      }

      // 3. Save product data
      setUploadProgress('Đang lưu sản phẩm...');
      const data: Record<string, unknown> = {
        code: form.code.trim(),
        name: form.name.trim(),
        category_id: form.category_id || null,
        material: form.material,
        weight: form.weight,
        size: form.size,
        description: form.description,
        listed_price: parseFloat(form.listed_price) || 0,
        promotion_price: form.promotion_price ? parseFloat(form.promotion_price) : null,
        max_discount_percent: parseFloat(form.max_discount_percent) || 10,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        stock_status: form.stock_status,
        is_visible_ipad: form.is_visible_ipad,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        updated_at: new Date().toISOString(),
      };

      let productId = product?.id;
      let err;

      if (product) {
        ({ error: err } = await supabase.from('products').update(data).eq('id', product.id));
        // If video_url column doesn't exist yet, retry without it
        if (err && err.message?.includes('video_url')) {
          delete data.video_url;
          ({ error: err } = await supabase.from('products').update(data).eq('id', product.id));
        }
      } else {
        let res = await supabase.from('products').insert(data).select('id').single();
        // If video_url column doesn't exist yet, retry without it
        if (res.error && res.error.message?.includes('video_url')) {
          delete data.video_url;
          res = await supabase.from('products').insert(data).select('id').single();
        }
        err = res.error;
        if (res.data) productId = res.data.id;
      }

      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }

      // 4. Delete removed images from product_images
      if (deletedImageIds.length > 0 && productId) {
        await supabase.from('product_images').delete().in('id', deletedImageIds);
      }

      // 5. Insert new images into product_images
      if (uploadedImageUrls.length > 0 && productId) {
        const maxOrder = existingImages.length;
        const imageRows = uploadedImageUrls.map((url, i) => ({
          product_id: productId,
          image_url: url,
          is_thumbnail: url === thumbnailUrl,
          sort_order: maxOrder + i,
        }));
        await supabase.from('product_images').insert(imageRows);
      }

      // 6. Update is_thumbnail for existing images
      if (productId) {
        // First reset all to false
        await supabase.from('product_images').update({ is_thumbnail: false }).eq('product_id', productId);
        // Set the correct one to true
        await supabase.from('product_images').update({ is_thumbnail: true }).eq('product_id', productId).eq('image_url', thumbnailUrl);
      }


      setUploadProgress('');
      onSaved();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định');
      setSaving(false);
      setUploadProgress('');
    }
  }



  const activeExistingImages = existingImages.filter(img => !deletedImageIds.includes(img.id));
  const totalImages = activeExistingImages.length + newImagePreviews.length;
  const hasVideo = (form.video_url && !removeExistingVideo) || videoFile;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white shadow-sm border border-slate-300 rounded-2xl w-full max-w-3xl my-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-slate-800 font-semibold text-lg">{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* ═══ MEDIA SECTION ═══ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
              <Image size={16} className="text-amber-600" />
              Hình ảnh & Video sản phẩm
            </div>

            {/* Image Upload Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 text-xs font-medium">
                  Hình ảnh ({totalImages} ảnh)
                </span>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-300 font-medium transition-colors"
                >
                  <Plus size={14} />
                  Thêm ảnh
                </button>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              {/* Image Grid */}
              <div className="grid grid-cols-5 gap-2">
                {/* Existing images */}
                {activeExistingImages.map((img) => (
                  <div key={img.id} className={`relative group aspect-square rounded-xl overflow-hidden border ${form.thumbnail_url === img.image_url ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-300'} bg-white cursor-pointer`} onClick={() => setAsThumbnail(img.image_url)}>
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    {form.thumbnail_url === img.image_url && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        CHÍNH
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeExistingImage(img.id);
                      }}
                      className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-slate-800 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                    {form.thumbnail_url !== img.image_url && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-medium">Đặt làm ảnh chính</span>
                      </div>
                    )}
                  </div>
                ))}


                {/* New image previews */}
                {newImagePreviews.map((preview, i) => (
                  <div key={`new-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-amber-500/30 bg-white">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-emerald-500/80 text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      MỚI
                    </span>
                    <button
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-slate-800 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {/* Add more button */}
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-600 hover:border-amber-500/50 flex flex-col items-center justify-center gap-1.5 transition-colors group"
                >
                  <Upload size={18} className="text-slate-500 group-hover:text-amber-600 transition-colors" />
                  <span className="text-[10px] text-slate-500 group-hover:text-amber-600 font-medium">Thêm ảnh</span>
                </button>
              </div>
            </div>

            {/* Video Upload Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Film size={14} className="text-purple-400" />
                  <span className="text-slate-500 text-xs font-medium">
                    Video sản phẩm (tối đa 1 video, ≤ 100MB)
                  </span>
                </div>
              </div>

              {hasVideo ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-white">
                  <div className="flex items-center gap-3 p-3">
                    {/* Video preview */}
                    <div className="w-32 h-20 rounded-lg overflow-hidden bg-black flex-shrink-0">
                      {videoFile && videoPreview ? (
                        <video src={videoPreview} className="w-full h-full object-cover" muted />
                      ) : form.video_url && !removeExistingVideo ? (
                        <video src={form.video_url} className="w-full h-full object-cover" muted />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 text-sm font-medium truncate">
                        {videoFile ? videoFile.name : 'Video hiện tại'}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Đã tải lên'}
                      </p>
                    </div>
                    <button
                      onClick={removeVideo}
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full py-6 rounded-xl border-2 border-dashed border-slate-600 hover:border-purple-500/50 flex flex-col items-center gap-2 transition-colors group"
                >
                  <Film size={24} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                  <span className="text-xs text-slate-500 group-hover:text-purple-400 font-medium">
                    Nhấn để chọn video (MP4, MOV...)
                  </span>
                </button>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* ═══ PRODUCT INFO SECTION ═══ */}
          <div className="border-t border-slate-200 pt-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Mã sản phẩm *">
                <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Tên sản phẩm *">
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Danh mục">
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className={inputCls}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Chất liệu">
                <input type="text" value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Trọng lượng">
                <input type="text" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Kích thước">
                <input type="text" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Giá niêm yết (VNĐ)">
                <input type="number" value={form.listed_price} onChange={e => setForm(f => ({ ...f, listed_price: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Giá khuyến mãi (VNĐ)">
                <input type="number" value={form.promotion_price} onChange={e => setForm(f => ({ ...f, promotion_price: e.target.value }))} className={inputCls} placeholder="Không có" />
              </Field>
              <Field label="Giảm tối đa (%)">
                <input type="number" value={form.max_discount_percent} onChange={e => setForm(f => ({ ...f, max_discount_percent: e.target.value }))} className={inputCls} min="0" max="100" />
              </Field>
              <Field label="Số lượng tồn kho">
                <input type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} className={inputCls} min="0" />
              </Field>
              <Field label="Trạng thái tồn kho">
                <select value={form.stock_status} onChange={e => setForm(f => ({ ...f, stock_status: e.target.value as 'in_stock' | 'out_of_stock' }))} className={inputCls}>
                  <option value="in_stock">Còn hàng</option>
                  <option value="out_of_stock">Hết hàng</option>
                </select>
              </Field>
              <Field label="Hiển thị trên iPad">
                <select value={form.is_visible_ipad ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_visible_ipad: e.target.value === 'true' }))} className={inputCls}>
                  <option value="true">Hiển thị</option>
                  <option value="false">Ẩn</option>
                </select>
              </Field>
              <div className="col-span-2">
                <Field label="Mô tả sản phẩm">
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={`${inputCls} resize-none`} />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Error / Progress */}
        {error && (
          <div className="px-6 pb-2">
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          </div>
        )}
        {uploadProgress && (
          <div className="px-6 pb-2">
            <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-100 border border-amber-500/20 rounded-lg px-3 py-2">
              <Loader2 size={14} className="animate-spin" />
              {uploadProgress}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button onClick={onClose} className="flex-1 bg-white hover:bg-slate-100 text-slate-600 py-3 rounded-xl transition-colors">Hủy</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
}
