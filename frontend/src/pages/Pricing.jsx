import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Check, Flame, ArrowLeft } from 'lucide-react';

const PLANS = [
  { id: 'free', name: 'Free', price: 0, period: '/lună', desc: 'Pentru evaluare', highlight: false,
    features: ['5 documente / total', '1 ștampilă', 'Suport prin email', 'Generare DOCX nelimitată'] },
  { id: 'pro', name: 'Pro', price: 99, period: '/lună', desc: 'Pentru firme mici-medii', highlight: true,
    features: ['200 documente / lună', 'Ștampile nelimitate', 'Certificate PKI nelimitate', 'Semnătură digitală .p7s', 'Trimitere automată email', 'Suport prioritar'] },
  { id: 'enterprise', name: 'Enterprise', price: 299, period: '/lună', desc: 'Echipe & integrări', highlight: false,
    features: ['2000 documente / lună', 'Tot din Pro', 'API access', 'Onboarding dedicat', 'Branding personalizat', 'SLA 24h'] },
];

export default function Pricing() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(null);

  const onSelect = async (planId) => {
    if (planId === 'free') {
      if (user) nav('/dashboard'); else nav('/register');
      return;
    }
    if (!user) { nav('/login'); return; }
    setBusy(planId);
    try {
      const { data } = await api.post('/payments/checkout', { plan_id: planId, origin_url: window.location.origin });
      window.location.href = data.url;
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Eroare plată');
    } finally { setBusy(null); }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black text-[#FFB300] flex items-center justify-center"><Flame className="w-4 h-4" strokeWidth={2.5} /></div>
            <div className="font-bold tracking-tight">StampDoc<span className="text-[#FFB300]">.ro</span></div>
          </Link>
          <Link to={user ? '/dashboard' : '/'} className="ghost-btn text-sm"><ArrowLeft className="w-4 h-4" /> Înapoi</Link>
        </div>
      </header>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="label mb-3 text-center">// Planuri & tarife</div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter text-center mb-3">Alegeți planul potrivit firmei dvs.</h1>
          <p className="text-gray-600 text-center max-w-xl mx-auto mb-12">Toate prețurile sunt în RON și includ TVA. Anulați oricând.</p>

          <div className="grid md:grid-cols-3 gap-px bg-gray-200 border border-gray-200 stagger" data-testid="pricing-grid">
            {PLANS.map((p) => (
              <div key={p.id} className={`p-8 flex flex-col bg-white relative ${p.highlight ? 'ring-2 ring-[#FFB300] ring-inset' : ''}`} data-testid={`plan-${p.id}`}>
                {p.highlight && <div className="absolute top-0 right-0 bg-[#FFB300] text-black text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1">Recomandat</div>}
                <div className="label mb-2">{p.desc}</div>
                <h3 className="text-2xl font-bold tracking-tight mb-4">{p.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold tracking-tighter">{p.price}</span>
                  <span className="text-lg text-gray-500 ml-1">RON</span>
                  <span className="text-sm text-gray-500 ml-1">{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2"><Check className="w-4 h-4 text-[#16A34A] mt-0.5 shrink-0" />{f}</li>
                  ))}
                </ul>
                <button
                  onClick={() => onSelect(p.id)}
                  disabled={busy === p.id || user?.plan === p.id}
                  data-testid={`select-${p.id}`}
                  className={p.highlight ? 'amber-btn w-full disabled:opacity-50' : 'outline-btn w-full justify-center disabled:opacity-50'}
                >
                  {user?.plan === p.id ? 'Plan activ' : (busy === p.id ? 'Se procesează...' : (p.id === 'free' ? 'Începe gratuit' : 'Activează plan'))}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center text-sm text-gray-500">
            Aveți nevoie de plan customizat sau facturare anuală? <a href="mailto:contact@stampdoc.ro" className="text-black font-semibold">Contactați-ne</a>.
          </div>
        </div>
      </section>
    </div>
  );
}
