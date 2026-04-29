import { AdminUser } from './AdminApp';
import { AdminPage } from './AdminLayout';
import {
  LayoutDashboard, Package, Tag, FileText, ShoppingBag,
  BarChart2, ClipboardList, Settings, LogOut, Gem
} from 'lucide-react';

type Props = {
  user: AdminUser;
  page: AdminPage;
  onNavigate: (p: AdminPage) => void;
  onLogout: () => void;
};

type NavItem = { page: AdminPage; label: string; icon: React.ReactNode; roles: AdminUser['role'][] };

const navItems: NavItem[] = [
  { page: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={18} />, roles: ['admin', 'warehouse', 'sale', 'accountant'] },
  { page: 'products', label: 'Sản phẩm', icon: <Package size={18} />, roles: ['admin', 'warehouse'] },
  { page: 'categories', label: 'Danh mục', icon: <Tag size={18} />, roles: ['admin', 'warehouse'] },
  { page: 'quotations', label: 'Báo giá', icon: <FileText size={18} />, roles: ['admin', 'sale', 'accountant'] },
  { page: 'sales', label: 'Bán hàng', icon: <ShoppingBag size={18} />, roles: ['admin', 'accountant', 'sale'] },
  { page: 'reports', label: 'Báo cáo', icon: <BarChart2 size={18} />, roles: ['admin', 'accountant'] },
  { page: 'logs', label: 'Lịch sử', icon: <ClipboardList size={18} />, roles: ['admin'] },
  { page: 'settings', label: 'Cài đặt', icon: <Settings size={18} />, roles: ['admin'] },
];

const roleLabels: Record<AdminUser['role'], string> = {
  admin: 'Quản trị viên',
  warehouse: 'Nhân viên Kho',
  sale: 'Nhân viên Sale',
  accountant: 'Kế toán',
};

export default function AdminSidebar({ user, page, onNavigate, onLogout }: Props) {
  const accessible = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-60 bg-white shadow-sm border-r border-slate-200 flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
            <img src="/logoxuanhieu.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-800 font-semibold text-sm truncate">Xuân Hiếu</p>
            <p className="text-slate-500 text-xs">Quản trị hệ thống</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {accessible.map(item => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              page === item.page
                ? 'bg-amber-100 text-amber-600 font-medium'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 font-bold text-sm flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-800 text-sm font-medium truncate">{user.name}</p>
            <p className="text-slate-500 text-xs truncate">{roleLabels[user.role]}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
