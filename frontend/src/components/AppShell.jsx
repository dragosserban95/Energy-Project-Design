import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, FileText, Stamp, ShieldCheck, FileCheck2, Settings, LogOut, Flame } from 'lucide-react';

const NAV = [
  { to: '/dashboard', label: 'Panou', icon: LayoutDashboard, tid: 'nav-dashboard' },
  { to: '/templates', label: 'Șabloane', icon: FileText, tid: 'nav-templates' },
  { to: '/stamps', label: 'Ștampile', icon: Stamp, tid: 'nav-stamps' },
  { to: '/certificates', label: 'Certificate', icon: ShieldCheck, tid: 'nav-certificates' },
  { to: '/documents', label: 'Documente', icon: FileCheck2, tid: 'nav-documents' },
  { to: '/settings', label: 'Setări', icon: Settings, tid: 'nav-settings' },
];

export default function AppShell({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col" data-testid="app-sidebar">
        <div className="px-6 py-5 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black text-[#FFB300] flex items-center justify-center">
              <Flame className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold tracking-tight">StampDoc</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">România</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = location.pathname === n.to || (n.to !== '/dashboard' && location.pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                data-testid={n.tid}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm ${
                  active ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 bg-[#FFB300] text-black font-bold flex items-center justify-center rounded-full">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-medium truncate" data-testid="user-name">{user?.name}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Plan: {user?.plan}</div>
            </div>
          </div>
          <button
            data-testid="logout-btn"
            onClick={async () => { await logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 text-sm text-gray-700 hover:text-black px-3 py-2 hover:bg-gray-100 rounded-sm"
          >
            <LogOut className="w-4 h-4" /> Deconectare
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight" data-testid="page-title">{title}</h1>
          <div className="text-xs text-gray-500 uppercase tracking-[0.2em]">{user?.email}</div>
        </header>
        <main className="flex-1 px-8 py-8 page-enter">{children}</main>
      </div>
    </div>
  );
}
