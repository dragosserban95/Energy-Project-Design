import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Wrench, ShieldAlert, Sparkles, Lock, ExternalLink } from 'lucide-react';

export default function Developer() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('Diagnostic complet al aplicației.');
  const [openaiKey, setOpenaiKey] = useState('');
  const [useExternal, setUseExternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [safetyRules, setSafetyRules] = useState([]);

  useEffect(() => {
    if (!user?.is_developer) return;
    api.get('/dev/safety-rules').then(({ data }) => setSafetyRules(data.rules || [])).catch(() => {});
  }, [user]);

  if (!user) return null;
  if (!user.is_developer) {
    return <AppShell title="AI Developer">
      <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 p-8 text-center">
        <Lock className="w-10 h-10 text-[#DC2626] mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acces restricționat</h2>
        <p className="text-sm text-gray-700">Această secțiune este accesibilă doar contului Developer (<code className="mono bg-white px-1.5 py-0.5">dragosserban95@gmail.com</code>).</p>
      </div>
    </AppShell>;
  }

  const run = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    try {
      const payload = { prompt };
      if (useExternal && openaiKey.trim()) payload.openai_api_key = openaiKey.trim();
      const { data } = await api.post('/dev/plan', payload);
      setResult(data);
      toast.success('Plan generat');
    } catch (err) { toast.error(err?.response?.data?.detail || 'Eroare'); }
    finally { setBusy(false); }
  };

  return (
    <AppShell title="AI Developer" subtitle="Plan Mode controlat — Apply Mode necesită confirmare umană">
      {/* Safety banner */}
      <div className="bg-[#FFB300]/10 border border-[#FFB300]/30 p-4 mb-6 flex items-start gap-3" data-testid="dev-safety">
        <ShieldAlert className="w-5 h-5 text-[#92400E] mt-0.5" />
        <div className="text-sm text-[#92400E]">
          <strong>Mod sigur Plan Mode.</strong> Acest panel NU modifică fișiere și NU execută cod automat.
          Generează doar diagnostic + plan + checklist de validare pentru ca dvs. (sau un agent extern: Claude / Emergent / OpenAI Codex / ChatGPT) să aplice modificările manual cu confirmare umană.
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Prompt panel */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-black text-[#FFB300] flex items-center justify-center"><Wrench className="w-5 h-5" /></div>
            <div>
              <div className="font-semibold">Prompt dezvoltare</div>
              <div className="text-xs text-gray-500">Descrieți ce funcție vreți să adăugați, ce bug vreți să corectați sau ce industrie nouă vreți să activați.</div>
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30 mono"
            placeholder="ex: Adaugă industria 'electrical_engineering' cu subdomeniul 'bransamente electrice'"
            data-testid="dev-prompt"
          />

          <div className="mt-4 bg-[#F9FAFB] border border-gray-200 p-3">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <input type="checkbox" checked={useExternal} onChange={(e) => setUseExternal(e.target.checked)} className="accent-[#FFB300]" data-testid="use-external" />
              <Sparkles className="w-4 h-4 text-[#FFB300]" />
              Folosește OpenAI (bring-your-own-key) pentru enriched plan
            </label>
            {useExternal && (
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full border border-gray-300 px-3 py-2 text-xs rounded-sm mono"
                data-testid="openai-key-input"
              />
            )}
            <div className="text-[10px] text-gray-500 mt-2">
              Cheia nu este stocată — folosită doar pentru acest apel. Compatibil cu OpenAI Codex, ChatGPT API, gpt-4o-mini.
            </div>
          </div>

          <button onClick={run} disabled={busy} className="amber-btn w-full mt-4 disabled:opacity-50" data-testid="dev-plan-btn">
            {busy ? 'Se generează plan...' : 'Generează plan de implementare'}
          </button>

          {result && (
            <div className="mt-6 space-y-4" data-testid="dev-result">
              <div>
                <div className="label mb-2">// Diagnostic</div>
                {result.diagnostic?.missing_capabilities?.length === 0 ? (
                  <div className="text-sm text-[#16A34A]">Nicio capabilitate critică lipsă.</div>
                ) : (
                  <ul className="text-sm space-y-1">
                    {result.diagnostic?.missing_capabilities?.map((m, i) => <li key={i} className="text-[#DC2626]">• {m}</li>)}
                  </ul>
                )}
              </div>

              <div>
                <div className="label mb-2">// Pași propuși</div>
                <ol className="text-sm space-y-1 list-decimal pl-5 text-gray-700">
                  {(result.proposed_steps || []).map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>

              {result.external_llm_advice && (
                <div>
                  <div className="label mb-2 text-[#FFB300]">// Sfat OpenAI (extern)</div>
                  <div className="bg-[#F9FAFB] border-l-2 border-[#FFB300] p-3 text-sm whitespace-pre-wrap font-mono text-xs">{result.external_llm_advice}</div>
                </div>
              )}

              <div>
                <div className="label mb-2">// Checklist validare</div>
                <ul className="text-sm space-y-1">
                  {(result.validation_checklist || []).map((v, i) => <li key={i} className="flex items-start gap-2"><span className="text-gray-400">[ ]</span>{v}</li>)}
                </ul>
              </div>

              <div className="bg-[#FFB300]/10 border border-[#FFB300]/30 p-3 text-xs text-[#92400E]">
                <strong>Apply Mode separat.</strong> Pentru a aplica acești pași, transmiteți planul de mai sus către agentul principal (Emergent E1, Claude, OpenAI Codex sau ChatGPT) împreună cu confirmarea umană.
              </div>
            </div>
          )}
        </div>

        {/* Side: rules + handoff */}
        <div className="space-y-4 self-start">
          <div className="bg-white border border-gray-200 p-5">
            <div className="label mb-3">// Reguli de siguranță</div>
            <ul className="text-xs space-y-2 text-gray-700">
              {safetyRules.map((r, i) => <li key={i} className="flex items-start gap-2"><span className="text-[#FFB300] mono">{String(i + 1).padStart(2, '0')}.</span>{r}</li>)}
            </ul>
          </div>

          <div className="bg-black text-white p-5">
            <div className="label text-[#FFB300] mb-3">// Handoff către alt AI</div>
            <p className="text-xs text-gray-300 mb-3">Acest cod poate fi continuat oricând cu:</p>
            <ul className="text-xs space-y-1.5">
              <li>• Emergent (acest agent, E1)</li>
              <li>• Anthropic Claude (Sonnet, Opus)</li>
              <li>• OpenAI ChatGPT / GPT-4o</li>
              <li>• OpenAI Codex / Copilot</li>
            </ul>
            <p className="text-[10px] text-gray-400 mt-3">Tot codul este în <code className="text-[#FFB300]">/app</code>. PRD-ul în <code className="text-[#FFB300]">/app/memory/PRD.md</code>.</p>
            <a href="https://platform.openai.com" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-[#FFB300] hover:underline">
              OpenAI Platform <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-white border border-gray-200 p-5">
            <div className="label mb-3">// Status repo</div>
            {result?.diagnostic && (
              <ul className="text-xs space-y-1.5">
                <li className="flex justify-between"><span>Stripe live key</span><span className={result.diagnostic.missing_capabilities.some(m => m.includes('Stripe')) ? 'text-[#DC2626]' : 'text-[#16A34A]'}>{result.diagnostic.missing_capabilities.some(m => m.includes('Stripe')) ? 'lipsă' : 'OK'}</span></li>
                <li className="flex justify-between"><span>QES credențiale</span><span className={result.diagnostic.missing_capabilities.some(m => m.includes('QES')) ? 'text-[#DC2626]' : 'text-[#16A34A]'}>{result.diagnostic.missing_capabilities.some(m => m.includes('QES')) ? 'lipsă' : 'OK'}</span></li>
                <li className="flex justify-between"><span>Gmail user</span><span className={result.diagnostic.missing_capabilities.some(m => m.includes('Gmail')) ? 'text-[#DC2626]' : 'text-[#16A34A]'}>{result.diagnostic.missing_capabilities.some(m => m.includes('Gmail')) ? 'lipsă' : 'OK'}</span></li>
                <li className="flex justify-between"><span>System templates</span><span className="text-[#16A34A]">OK</span></li>
              </ul>
            )}
            {!result && <div className="text-xs text-gray-500">Rulați un plan pentru diagnostic.</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
