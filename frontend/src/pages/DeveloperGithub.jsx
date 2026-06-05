import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Github, RefreshCw, Send, Plus, Trash2, ExternalLink, Lock, ShieldAlert, Rocket, FileCode } from 'lucide-react';

const DEFAULT_FILE = { path: '', content: '' };

export default function DeveloperGithub() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [updateSecret, setUpdateSecret] = useState('');
  const [files, setFiles] = useState([{ ...DEFAULT_FILE }]);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (!user.is_developer) {
      nav('/dashboard');
      return;
    }
    loadStatus();
  }, [user, nav]);

  async function loadStatus() {
    setLoading(true);
    try {
      const { data } = await api.get('/api/dev/github/status');
      setStatus(data);
    } catch (e) {
      toast.error('Nu pot citi statusul GitHub. Verifică GITHUB_TOKEN în backend/.env.');
    } finally {
      setLoading(false);
    }
  }

  function addFile() { setFiles([...files, { ...DEFAULT_FILE }]); }
  function removeFile(i) { setFiles(files.filter((_, idx) => idx !== i)); }
  function updateFile(i, key, val) {
    const next = [...files];
    next[i] = { ...next[i], [key]: val };
    setFiles(next);
  }

  async function handlePush() {
    if (!commitMessage.trim()) { toast.error('Adaugă un mesaj de commit.'); return; }
    const validFiles = files.filter(f => f.path.trim() && f.content !== '');
    if (validFiles.length === 0) { toast.error('Adaugă cel puțin un fișier cu cale și conținut.'); return; }
    setBusy(true);
    setLastResult(null);
    try {
      const { data } = await api.post('/api/dev/github/push', {
        prompt: prompt.trim(),
        commit_message: commitMessage.trim(),
        files: validFiles,
        update_secret: updateSecret.trim() || undefined,
      });
      setLastResult(data);
      toast.success(`${data.files_pushed} fișier(e) push-uite în branch-ul ${data.branch}`);
      await loadStatus();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Push eșuat. Verifică tokenul și secret-ul.');
    } finally {
      setBusy(false);
    }
  }

  if (!user?.is_developer) {
    return (
      <AppShell>
        <div className="p-8 max-w-2xl">
          <div className="flex items-center gap-3 text-sm bg-red-50 border border-red-200 p-4">
            <Lock className="w-5 h-5 text-red-700" />
            <span>Acces interzis. Doar contul Developer poate accesa această pagină.</span>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8 max-w-6xl" data-testid="dev-github-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3"><Github className="w-9 h-9" /> Push pe GitHub</h1>
            <p className="text-gray-600 mt-2 text-sm">Trimite fișiere direct în branch-ul <code className="bg-black text-[#FFB300] px-1.5">{status?.branch || 'main'}</code> al repo-ului — Render auto-deploy se declanșează în ~30 secunde.</p>
          </div>
          <button
            onClick={loadStatus}
            className="flex items-center gap-2 border border-black px-4 py-2 text-sm hover:bg-black hover:text-[#FFB300] transition-colors"
            data-testid="refresh-status-btn"
          >
            <RefreshCw className="w-4 h-4" /> Reîncarcă status
          </button>
        </div>

        {/* Status banner */}
        <div className="bg-white border-2 border-black p-5 mb-8" data-testid="repo-status-card">
          {loading ? (
            <div className="text-sm text-gray-500">Se încarcă status repo…</div>
          ) : status ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500">Repo</div>
                <a href={status.repo_url} target="_blank" rel="noreferrer" className="font-semibold text-[#FFB300] hover:underline flex items-center gap-1.5">
                  {status.owner}/{status.repo} <ExternalLink className="w-3 h-3" />
                </a>
                <div className="text-xs text-gray-500 mt-1">Branch: <code className="bg-gray-100 px-1">{status.branch}</code></div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500">Ultimul commit</div>
                <a href={status.last_commit_url} target="_blank" rel="noreferrer" className="font-mono text-sm hover:underline flex items-center gap-1.5" data-testid="last-commit-sha">
                  {status.last_commit_sha} <ExternalLink className="w-3 h-3" />
                </a>
                <div className="text-xs text-gray-500 mt-1 truncate" title={status.last_commit_message}>{status.last_commit_message}</div>
                {status.last_commit_date && (
                  <div className="text-xs text-gray-400 mt-1">{new Date(status.last_commit_date).toLocaleString('ro-RO')}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-red-600 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> GitHub indisponibil. Verifică <code>GITHUB_TOKEN</code> + <code>GITHUB_OWNER</code> + <code>GITHUB_REPO</code> în <code>backend/.env</code>.</div>
          )}
        </div>

        {/* Push form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600">Mesaj commit (subiect scurt)</label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="feat(api): adaugă endpoint X"
                className="w-full mt-1 px-3 py-2 border border-black text-sm font-mono"
                maxLength={150}
                data-testid="commit-message-input"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600">Prompt / context (opțional, atașat la commit body)</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descrie de ce faci această schimbare..."
                rows={3}
                className="w-full mt-1 px-3 py-2 border border-black text-sm resize-y"
                data-testid="commit-prompt-input"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600">Secret de actualizare (EPD_UPDATE_SECRET din .env)</label>
              <input
                type="password"
                value={updateSecret}
                onChange={(e) => setUpdateSecret(e.target.value)}
                placeholder="Lăsă gol dacă nu ai EPD_UPDATE_SECRET setat"
                className="w-full mt-1 px-3 py-2 border border-black text-sm font-mono"
                data-testid="update-secret-input"
                autoComplete="new-password"
              />
            </div>

            <div className="border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold flex items-center gap-2"><FileCode className="w-4 h-4" /> Fișiere de modificat ({files.length})</div>
                <button onClick={addFile} className="text-xs flex items-center gap-1.5 border border-black px-3 py-1.5 hover:bg-black hover:text-[#FFB300]" data-testid="add-file-btn">
                  <Plus className="w-3.5 h-3.5" /> Adaugă fișier
                </button>
              </div>

              <div className="space-y-4">
                {files.map((f, i) => (
                  <div key={i} className="border border-gray-300 p-3 bg-gray-50" data-testid={`file-row-${i}`}>
                    <div className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={f.path}
                        onChange={(e) => updateFile(i, 'path', e.target.value)}
                        placeholder="ex: backend/server.py"
                        className="flex-1 px-2 py-1.5 border border-black text-xs font-mono bg-white"
                        data-testid={`file-path-${i}`}
                      />
                      {files.length > 1 && (
                        <button onClick={() => removeFile(i)} className="px-2 py-1.5 border border-red-700 text-red-700 hover:bg-red-700 hover:text-white" data-testid={`remove-file-${i}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <textarea
                      value={f.content}
                      onChange={(e) => updateFile(i, 'content', e.target.value)}
                      placeholder="Conținut complet al fișierului…"
                      rows={6}
                      className="w-full mt-2 px-2 py-1.5 border border-black text-xs font-mono bg-white resize-y"
                      data-testid={`file-content-${i}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handlePush}
              disabled={busy}
              className="w-full bg-black text-[#FFB300] py-3 font-semibold flex items-center justify-center gap-2 hover:bg-[#FFB300] hover:text-black border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="push-btn"
            >
              {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {busy ? 'Se trimite…' : `Trimite ${files.filter(f => f.path).length} fișier(e) → GitHub`}
            </button>
          </div>

          {/* Right column — last result */}
          <div className="space-y-5">
            <div className="bg-[#FFB300] text-black border-2 border-black p-5">
              <h2 className="font-bold flex items-center gap-2 mb-3"><Rocket className="w-5 h-5" /> Cum funcționează</h2>
              <ol className="text-xs space-y-2 list-decimal pl-5">
                <li>Adaugi cale + conținut nou pentru fiecare fișier</li>
                <li>Apeși <strong>Trimite</strong> → commit pe branch-ul <code className="bg-black text-[#FFB300] px-1">{status?.branch || 'main'}</code></li>
                <li>Render detectează push-ul și face <strong>auto-deploy</strong> (~30s)</li>
                <li>Versiunea live se actualizează la <code className="bg-black text-[#FFB300] px-1 break-all">{status ? `${status.repo.toLowerCase()}-services.onrender.com` : 'energy-project-design-services.onrender.com'}</code></li>
              </ol>
            </div>

            {lastResult && (
              <div className="bg-white border-2 border-black p-5" data-testid="last-push-result">
                <h2 className="font-bold flex items-center gap-2 mb-3 text-sm"><Github className="w-4 h-4" /> Ultimul push</h2>
                <div className="text-xs space-y-1.5">
                  <div><strong>Branch:</strong> <code>{lastResult.branch}</code></div>
                  <div><strong>Fișiere:</strong> {lastResult.files_pushed}</div>
                </div>
                <div className="mt-3 space-y-1.5 max-h-72 overflow-y-auto">
                  {lastResult.results?.map((r, i) => (
                    <a
                      key={i}
                      href={r.commit_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs border border-gray-200 p-2 hover:border-black hover:bg-gray-50"
                    >
                      <div className="font-mono truncate">{r.path}</div>
                      <div className="text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <span className={r.operation === 'created' ? 'text-green-700' : 'text-blue-700'}>{r.operation}</span>
                        <span className="font-mono">{r.commit_sha?.slice(0, 7)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </a>
                  ))}
                </div>
                <a
                  href={lastResult.compare_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-xs mt-3 border border-black py-2 hover:bg-black hover:text-[#FFB300]"
                  data-testid="view-on-github-btn"
                >
                  Vezi pe GitHub ↗
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
