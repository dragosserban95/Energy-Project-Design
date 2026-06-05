import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { FileText, Stamp, ShieldCheck, FileCheck2, ArrowRight, Plus } from 'lucide-react';

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const [counts, setCounts] = useState({ templates: 0, stamps: 0, certs: 0, docs: 0 });
  const [recent, setRecent] = useState([]);
  const [params] = useSearchParams();
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [t, s, c, d] = await Promise.all([
          api.get('/templates'), api.get('/stamps'), api.get('/certificates'), api.get('/documents'),
        ]);
        setCounts({ templates: t.data.length, stamps: s.data.length, certs: c.data.length, docs: d.data.length });
        setRecent(d.data.slice(0, 5));
      } catch (_) {}
    })();
  }, []);

  // Stripe redirect handler: ?session_id=...
  useEffect(() => {
    const sid = params.get('session_id');
    if (!sid) return;
    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const { data } = await api.get(`/payments/status/${sid}`);
        if (data.payment_status === 'paid') {
          toast.success('Plată reușită — plan actualizat');
          await refresh();
          nav('/dashboard', { replace: true });
          return;
        }
        if (data.status === 'expired') {
          toast.error('Sesiunea de plată a expirat'); return;
        }
      } catch (_) {}
      if (attempts < 6) setTimeout(poll, 2000);
    };
    poll();
  }, [params, refresh, nav]);

  const stats = [
    { label: 'Șabloane', value: counts.templates, icon: FileText, to: '/templates' },
    { label: 'Ștampile', value: counts.stamps, icon: Stamp, to: '/stamps' },
    { label: 'Certificate', value: counts.certs, icon: ShieldCheck, to: '/certificates' },
    { label: 'Documente', value: counts.docs, icon: FileCheck2, to: '/documents' },
  ];

  return (
    <AppShell title={`Bun venit, ${user?.name?.split(' ')[0] || ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200 mb-10 stagger" data-testid="dashboard-stats">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link to={s.to} key={s.label} className="bg-white p-6 hover:bg-gray-50 transition-colors group" data-testid={`stat-${s.label}`}>
              <div className="flex items-start justify-between">
                <Icon className="w-5 h-5 text-gray-400 group-hover:text-black" />
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#FFB300] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="mt-4 text-3xl font-bold tracking-tight">{s.value}</div>
              <div className="label mt-1">{s.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold">Documente recente</h2>
            <Link to="/documents" className="text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-black">Toate →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500 text-sm mb-4">Niciun document încă.</p>
              <Link to="/templates" className="amber-btn text-sm py-2" data-testid="empty-cta-template"><Plus className="w-4 h-4" /> Încarcă un șablon</Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recent.map((d) => (
                <li key={d.document_id} className="px-6 py-4 flex items-center justify-between" data-testid={`recent-doc-${d.document_id}`}>
                  <div>
                    <div className="font-medium text-sm">{d.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(d.created_at).toLocaleString('ro-RO')}
                      {d.signed && <span className="ml-2 inline-block px-1.5 py-0.5 bg-[#FFB300] text-black text-[10px] uppercase tracking-wider">Semnat</span>}
                      {d.stamped && <span className="ml-2 inline-block px-1.5 py-0.5 border border-gray-300 text-[10px] uppercase tracking-wider">Ștampilat</span>}
                    </div>
                  </div>
                  <Link to="/documents" className="text-sm text-gray-600 hover:text-black">Deschide →</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-black text-white p-8">
          <div className="label text-[#FFB300] mb-3">// Plan curent</div>
          <div className="text-3xl font-bold tracking-tight mb-1 uppercase">{user?.plan}</div>
          <p className="text-gray-400 text-sm mb-6">
            {user?.plan === 'free' ? 'Aveți acces la 5 documente gratuit.' : `Plan activ. ${user?.plan_renews_at ? `Se reînnoiește: ${new Date(user.plan_renews_at).toLocaleDateString('ro-RO')}.` : ''}`}
          </p>
          {user?.plan === 'free' && (
            <Link to="/pricing" className="amber-btn w-full" data-testid="upgrade-btn">Upgrade plan</Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
