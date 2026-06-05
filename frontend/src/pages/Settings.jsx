import AppShell from '../components/AppShell';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, CreditCard } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  return (
    <AppShell title="Setări">
      <div className="grid lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
        <div className="lg:col-span-2 bg-white p-8">
          <div className="label mb-4">// Profil</div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-2"><dt className="text-gray-500">Nume</dt><dd className="font-medium" data-testid="settings-name">{user?.name}</dd></div>
            <div className="flex justify-between border-b border-gray-100 pb-2"><dt className="text-gray-500">Email</dt><dd className="font-medium" data-testid="settings-email">{user?.email}</dd></div>
            <div className="flex justify-between border-b border-gray-100 pb-2"><dt className="text-gray-500">Firmă</dt><dd className="font-medium">{user?.company || '—'}</dd></div>
            <div className="flex justify-between border-b border-gray-100 pb-2"><dt className="text-gray-500">Autentificare</dt><dd className="font-medium uppercase">{user?.auth_provider}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Membru din</dt><dd className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString('ro-RO') : '—'}</dd></div>
          </dl>

          <div className="label mt-10 mb-4">// Configurare email Gmail</div>
          <div className="bg-[#F9FAFB] border border-gray-200 p-5 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 mt-0.5 text-gray-500" />
              <div>
                <p className="text-gray-700 mb-2">Pentru trimiterea pe email, adăugați variabilele <code className="mono bg-white px-1 border border-gray-200">GMAIL_USER</code> și <code className="mono bg-white px-1 border border-gray-200">GMAIL_APP_PASSWORD</code> în fișierul <code className="mono bg-white px-1 border border-gray-200">backend/.env</code>.</p>
                <p className="text-xs text-gray-500">Generați un app password din contul dvs. Google: <span className="mono">myaccount.google.com → Security → 2-Step Verification → App passwords</span>.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8">
          <div className="label mb-4">// Plan & facturare</div>
          <div className="flex items-center gap-2 mb-2"><CreditCard className="w-4 h-4" /> <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Plan curent</span></div>
          <div className="text-2xl font-bold uppercase tracking-tight mb-2" data-testid="current-plan">{user?.plan}</div>
          {user?.plan_renews_at && (
            <div className="text-xs text-gray-500 mb-4">Reînnoire: {new Date(user.plan_renews_at).toLocaleDateString('ro-RO')}</div>
          )}
          <Link to="/pricing" className="amber-btn w-full" data-testid="manage-plan-btn">Gestionează plan</Link>

          <div className="label mt-10 mb-4">// Securitate</div>
          <div className="flex items-center gap-2 text-sm text-gray-600"><ShieldCheck className="w-4 h-4 text-[#16A34A]" /> Toate fișierele sunt criptate la repaus.</div>
        </div>
      </div>
    </AppShell>
  );
}
