'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  LogOut,
  User,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/programas', label: 'Programas', icon: BookOpen, docenteOnly: true },
  { href: '/admin/pagos', label: 'Pagos', icon: CreditCard, docenteOnly: true },
  { href: '/admin/docentes', label: 'Docentes', icon: Users, superadminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [user, loading, router, isLoginPage]);

  // On login page: always render children, no guard needed
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="top-nav-layout">
      {/* ── TOP NAV ── */}
      <header className="top-nav">
        <div className="nav-brand">
          <h1>POSTGRADO</h1>
          <p>Control de Pagos</p>
        </div>

        <nav className="nav-links">
          {NAV_ITEMS.filter((item) => {
            if (item.superadminOnly && user.role !== 'superadmin') return false;
            if (item.docenteOnly && user.role !== 'docente') return false;
            return true;
          }).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link${pathname === href || pathname.startsWith(href + '/') ? ' active' : ''}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="nav-user">
          <div className="nav-user-info">
            <span className="user-name">{user.nombre}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <button className="btn btn-outline btn-logout" onClick={handleLogout}>
            <LogOut size={14} />
            Salir
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
