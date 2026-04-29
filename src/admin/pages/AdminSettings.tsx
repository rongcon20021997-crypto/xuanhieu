import { useState, useEffect } from 'react';
import { supabase, AppSetting } from '../../lib/supabase';
import { Save } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('app_settings').select('*').order('key');
    if (data) {
      setSettings(data);
      const v: Record<string, string> = {};
      data.forEach(s => { v[s.key] = s.value; });
      setValues(v);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    await Promise.all(
      settings.map(s =>
        supabase.from('app_settings').update({ value: values[s.key] ?? s.value, updated_at: new Date().toISOString() }).eq('id', s.id)
      )
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  }

  const labelMap: Record<string, string> = {
    store_name: 'Tên cửa hàng',
    store_logo_url: 'URL Logo cửa hàng',
    home_banner_url: 'URL Banner trang chủ',
    app_idle_timeout_seconds: 'Thời gian chờ auto logout (giây)',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Cài đặt hệ thống</h1>
          <p className="text-slate-400 text-sm mt-1">Cấu hình app iPad và thông tin cửa hàng</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Save size={18} />
          {saved ? 'Đã lưu!' : saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 max-w-2xl">
          {settings.map(s => (
            <div key={s.key}>
              <label className="text-slate-300 text-sm font-medium block mb-1.5">
                {labelMap[s.key] || s.key}
              </label>
              {s.description && <p className="text-slate-500 text-xs mb-2">{s.description}</p>}
              <input
                type="text"
                value={values[s.key] ?? ''}
                onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
