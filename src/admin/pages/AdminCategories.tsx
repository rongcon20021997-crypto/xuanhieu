import { useState, useEffect } from 'react';
import { supabase, Category } from '../../lib/supabase';
import { Plus, CreditCard as Edit2, Eye, EyeOff, GripVertical } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', image_url: '', sort_order: 0 });

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    if (data) setCategories(data);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', image_url: '', sort_order: categories.length + 1 });
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, image_url: cat.image_url, sort_order: cat.sort_order });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    if (editing) {
      await supabase.from('categories').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id);
    } else {
      await supabase.from('categories').insert({ ...form, is_active: true });
    }
    setShowForm(false);
    load();
  }

  async function toggleActive(cat: Category) {
    await supabase.from('categories').update({ is_active: !cat.is_active, updated_at: new Date().toISOString() }).eq('id', cat.id);
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Danh mục sản phẩm</h1>
          <p className="text-slate-400 text-sm mt-1">{categories.length} danh mục</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={18} />
          Thêm danh mục
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium w-8" />
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Tên danh mục</th>
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Thứ tự</th>
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Trạng thái</th>
                <th className="text-right text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4">
                    <GripVertical size={16} className="text-slate-600" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {cat.image_url && (
                        <img src={cat.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <span className="text-white font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{cat.sort_order}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cat.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.is_active ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      {cat.is_active ? 'Hiển thị' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleActive(cat)} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all" title={cat.is_active ? 'Ẩn' : 'Hiện'}>
                        {cat.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button onClick={() => openEdit(cat)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold text-lg mb-5">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-1.5">Tên danh mục *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1.5">URL hình ảnh</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1.5">Thứ tự hiển thị</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl transition-colors">Hủy</button>
              <button onClick={handleSave} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-3 rounded-xl transition-colors">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
