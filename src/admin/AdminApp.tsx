import { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'warehouse' | 'sale' | 'accountant';
};

export default function AdminApp() {
  const [user, setUser] = useState<AdminUser | null>(null);

  if (!user) {
    return <AdminLogin onLogin={setUser} />;
  }

  return <AdminLayout user={user} onLogout={() => setUser(null)} />;
}
