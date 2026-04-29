import { useState, useEffect } from 'react';
import { supabase, ActivityLog } from '../../lib/supabase';
import { formatDate } from '../../lib/format';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setLogs(data);
    setLoading(false);
  }

  const moduleColors: Record<string, string> = {
    products: 'bg-blue-500/10 text-blue-400',
    categories: 'bg-cyan-500/10 text-cyan-400',
    quotations: 'bg-amber-500/10 text-amber-400',
    sales: 'bg-emerald-500/10 text-emerald-400',
    users: 'bg-violet-500/10 text-violet-400',
    settings: 'bg-slate-500/10 text-slate-400',
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Lịch sử thao tác</h1>
        <p className="text-slate-400 text-sm mt-1">100 thao tác gần nhất</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-500">Chưa có lịch sử thao tác</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Thời gian</th>
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Người dùng</th>
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Module</th>
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Hành động</th>
                <th className="text-left text-slate-500 text-xs uppercase tracking-wide px-6 py-4 font-medium">Đối tượng</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(log.created_at)}</td>
                  <td className="px-6 py-3 text-white text-sm">{log.user_name || '—'}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${moduleColors[log.module] || 'bg-slate-700 text-slate-400'}`}>
                      {log.module}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-300 text-sm">{log.action}</td>
                  <td className="px-6 py-3 text-slate-500 text-xs font-mono">{log.object_id || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
