import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Target, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

const STATUSES = [
  { id: 'draft', label: 'Schiță', stage: 0, color: 'bg-gray-100 border-gray-300', text: 'text-gray-700' },
  { id: 'date_proiect_incomplete', label: 'Date proiect incomplete', stage: 1, color: 'bg-amber-50 border-amber-300', text: 'text-amber-800' },
  { id: 'date_tehnice_incomplete', label: 'Date tehnice incomplete', stage: 2, color: 'bg-amber-50 border-amber-300', text: 'text-amber-800' },
  { id: 'calcul_neefectuat', label: 'Calcul neefectuat', stage: 3, color: 'bg-amber-50 border-amber-300', text: 'text-amber-800' },
  { id: 'documente_generate', label: 'Documente generate', stage: 4, color: 'bg-blue-50 border-blue-300', text: 'text-blue-800' },
  { id: 'in_verificare_vgd', label: 'În verificare VGD', stage: 5, color: 'bg-blue-50 border-blue-300', text: 'text-blue-800' },
  { id: 'in_verificare_rte', label: 'În verificare RTE', stage: 6, color: 'bg-blue-50 border-blue-300', text: 'text-blue-800' },
  { id: 'transmis_osd', label: 'Transmis OSD', stage: 7, color: 'bg-blue-50 border-blue-300', text: 'text-blue-800' },
  { id: 'aprobat', label: 'Aprobat', stage: 8, color: 'bg-green-50 border-green-300', text: 'text-green-800' },
  { id: 'respins', label: 'Respins', stage: 8, color: 'bg-red-50 border-red-300', text: 'text-red-800' },
  { id: 'finalizat', label: 'Finalizat', stage: 9, color: 'bg-green-50 border-green-400', text: 'text-green-900' },
  { id: 'arhivat', label: 'Arhivat', stage: 10, color: 'bg-gray-100 border-gray-400', text: 'text-gray-700' },
];

export default function Lifecycle() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/lifecycle/current');
        setData(data);
      } catch (e) { toast.error('Eroare încărcare lifecycle.'); }
      finally { setLoading(false); }
    })();
  }, [reloadKey]);

  async function transition(toStatusId) {
    if (toStatusId === data?.current_status) return;
    setBusy(true);
    try {
      await api.post('/lifecycle/set-status', { status: toStatusId });
      toast.success(`Status schimbat în „${STATUSES.find(s => s.id === toStatusId)?.label || toStatusId}".`);
      setReloadKey(k => k + 1);
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Eroare schimbare status.');
    } finally { setBusy(false); }
  }

  // Group statuses into 4 columns by phase
  const columns = [
    { title: 'Date & date tehnice', stages: [0, 1, 2, 3] },
    { title: 'Producție', stages: [4] },
    { title: 'Verificare & transmitere', stages: [5, 6, 7] },
    { title: 'Decizie & arhivare', stages: [8, 9, 10] },
  ];

  const currentStatus = data?.current_status;
  const currentStage = data?.status_meta?.stage ?? 0;

  return (
    <AppShell>
      <div className="p-8 max-w-7xl" data-testid="lifecycle-page">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3"><Target className="w-8 h-8" /> Workflow proiect — Kanban</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-3xl">
            Vizualizează etapele proiectului tău activ. Click pe oricare status pentru a-l aplica manual.
            <span className="text-amber-700 ml-1">Statusurile de pe etapele 0-4 sunt auto-detectate din completitudinea datelor; cele 5-10 se setează manual.</span>
          </p>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500 py-12 text-center">Se încarcă workflow-ul…</div>
        ) : !data ? (
          <div className="text-sm text-gray-500 py-12 text-center">Nu există un proiect activ.</div>
        ) : (
          <>
            {/* Current state banner */}
            <div className="bg-black text-[#FFB300] p-5 mb-6 flex items-center justify-between gap-4 flex-wrap" data-testid="lifecycle-current-banner">
              <div className="flex items-center gap-4">
                <div className="text-xs uppercase tracking-wider">Status curent</div>
                <div className="text-2xl font-bold">{data.status_meta.label}</div>
                <div className="text-xs">Etapa {currentStage}/10</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider">Scor completare</div>
                <div className="text-3xl font-bold">{data.score.overall_score}/100</div>
              </div>
            </div>

            {/* Kanban columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kanban-board">
              {columns.map((col) => (
                <div key={col.title} className="bg-white border-2 border-black" data-testid={`col-${col.title.toLowerCase().replace(/[^a-z]/g, '-')}`}>
                  <div className="bg-black text-[#FFB300] px-4 py-2.5 text-xs uppercase tracking-wider font-bold">{col.title}</div>
                  <div className="p-3 space-y-2 min-h-[200px]">
                    {STATUSES.filter(s => col.stages.includes(s.stage)).map((s) => {
                      const isCurrent = s.id === currentStatus;
                      const isPast = s.stage < currentStage;
                      const isFuture = s.stage > currentStage;
                      return (
                        <button
                          key={s.id}
                          onClick={() => transition(s.id)}
                          disabled={busy || isCurrent}
                          className={`w-full text-left p-3 border-2 transition-all hover:scale-[1.02] disabled:cursor-not-allowed ${isCurrent ? 'bg-black text-[#FFB300] border-black' : isPast ? 'bg-green-50 border-green-300 text-green-900' : `${s.color} ${s.text}`} ${isFuture ? 'opacity-70' : ''}`}
                          data-testid={`status-${s.id}`}
                          title={isCurrent ? 'Status curent' : `Click pentru a seta acest status`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold">{s.label}</span>
                            {isCurrent ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : isPast ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-700" /> : <Clock className="w-3.5 h-3.5 shrink-0" />}
                          </div>
                          <div className="text-[10px] opacity-70 mt-1">Etapa {s.stage}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* NBA */}
            <div className="mt-6 bg-[#FFB300] text-black border-2 border-black p-4 flex items-center justify-between gap-4 flex-wrap" data-testid="lifecycle-nba">
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold">Următorul pas recomandat</div>
                <div className="font-bold text-base mt-1">{data.next_best_action.title}</div>
                <div className="text-xs mt-1">{data.next_best_action.description}</div>
              </div>
              <a href={data.next_best_action.action_url} className="bg-black text-[#FFB300] px-4 py-2 text-xs font-semibold flex items-center gap-1.5 hover:bg-white hover:text-black border border-black" data-testid="nba-action">
                {data.next_best_action.action_label} <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
