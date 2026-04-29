import { useState } from 'react';
import { AdminUser } from './AdminApp';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminQuotations from './pages/AdminQuotations';
import AdminSalesRecords from './pages/AdminSalesRecords';
import AdminReports from './pages/AdminReports';
import AdminActivityLogs from './pages/AdminActivityLogs';
import AdminSettings from './pages/AdminSettings';

export type AdminPage =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'quotations'
  | 'sales'
  | 'reports'
  | 'logs'
  | 'settings';

type Props = {
  user: AdminUser;
  onLogout: () => void;
};

export default function AdminLayout({ user, onLogout }: Props) {
  const [page, setPage] = useState<AdminPage>('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <AdminDashboard user={user} />;
      case 'products': return <AdminProducts user={user} />;
      case 'categories': return <AdminCategories />;
      case 'quotations': return <AdminQuotations />;
      case 'sales': return <AdminSalesRecords />;
      case 'reports': return <AdminReports />;
      case 'logs': return <AdminActivityLogs />;
      case 'settings': return <AdminSettings />;
      default: return <AdminDashboard user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <AdminSidebar user={user} page={page} onNavigate={setPage} onLogout={onLogout} />
      <main className="flex-1 overflow-auto bg-slate-950">
        {renderPage()}
      </main>
    </div>
  );
}
