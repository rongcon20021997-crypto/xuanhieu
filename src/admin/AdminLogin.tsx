import { useState } from 'react';
import { AdminUser } from './AdminApp';
import { Eye, EyeOff, Gem } from 'lucide-react';

type Props = {
  onLogin: (user: AdminUser) => void;
};

const DEMO_USERS: (AdminUser & { password: string })[] = [
  { id: '1', email: 'admin@xuanhieu.vn', password: 'admin123', name: 'Admin', role: 'admin' },
  { id: '2', email: 'kho@xuanhieu.vn', password: 'kho123', name: 'Nhân viên Kho', role: 'warehouse' },
  { id: '3', email: 'sale@xuanhieu.vn', password: 'sale123', name: 'Nhân viên Sale', role: 'sale' },
  { id: '4', email: 'ketoan@xuanhieu.vn', password: 'ketoan123', name: 'Kế toán', role: 'accountant' },
];

export default function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const found = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (found) {
        const { password: _p, ...user } = found;
        onLogin(user);
      } else {
        setError('Email hoặc mật khẩu không đúng');
      }
      setLoading(false);
    }, 600);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-24 h-24 mb-4 bg-slate-900 rounded-2xl flex items-center justify-center p-2 border border-slate-800 shadow-xl">
            <img src="/logoxuanhieu.png" alt="Xuân Hiếu Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Xuân Hiếu Jewelry</h1>
          <p className="text-slate-400 mt-1 text-sm">Hệ thống quản trị cửa hàng</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
          <h2 className="text-white font-semibold text-lg mb-6">Đăng nhập</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@xuanhieu.vn"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
            <p className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wide">Tài khoản demo</p>
            <div className="space-y-1">
              {DEMO_USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => { setEmail(u.email); setPassword(u.password); }}
                  className="w-full text-left text-xs text-slate-400 hover:text-slate-200 py-1 transition-colors"
                >
                  <span className="text-amber-500/70">{u.role}</span> — {u.email} / {u.password}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
