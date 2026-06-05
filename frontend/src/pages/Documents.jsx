import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api, { API } from '../lib/api';
import { toast } from 'sonner';
import { Download, Trash2, Mail, ShieldCheck, FileCheck2 } from 'lucide-react';

export default function Documents() {
  const [items, setItems] = useState([]);
  const [emailOpen, setEmailOpen] = useState(null);
  const [emailForm, setEmailForm] = useState({ recipients: '', subject: 'Document de la StampDoc', body: 'Bună ziua,\n\nVă transmitem documentul atașat.\n\nCu stimă,' });

  const load = async () => {
    const { data } = await api.get('/documents');
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const download = (doc, sig = false) => {
    const token = localStorage.getItem('auth_token') || '';
    const url = `${API}/documents/${doc.document_id}/${sig ? 'signature' : 'download'}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' })
      .then(r => r.blob())
      .then(b => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = sig ? doc.name.replace(/\.docx$/i, '.p7s') : doc.name;
        a.click();
      });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Ștergeți documentul?')) return;
    await api.delete(`/documents/${id}`);
    toast.success('Șters'); await load();
  };

  const sendEmail = async (docId) => {
    const list = emailForm.recipients.split(/[,\s;]+/).map(s => s.trim()).filter(Boolean);
    if (!list.length) { toast.error('Adăugați destinatari'); return; }
    try {
      await api.post('/documents/email', { document_id: docId, recipients: list, subject: emailForm.subject, body: emailForm.body });
      toast.success('Email trimis');
      setEmailOpen(null);
    } catch (err) { toast.error(err?.response?.data?.detail || 'Eroare'); }
  };

  return (
    <AppShell title="Documente generate">
      {items.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center text-sm text-gray-500">
          Niciun document încă. Începeți prin a încărca un șablon.
        </div>
      ) : (
        <div className="bg-white border border-gray-200" data-testid="documents-list">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-[0.15em] text-gray-500">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Nume</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Creat</th>
                <th className="text-right px-6 py-3 font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((d) => (
                <tr key={d.document_id} data-testid={`doc-row-${d.document_id}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium">
                      <FileCheck2 className="w-4 h-4 text-gray-400" /> {d.name}
                    </div>
                    {d.signature_hash && <div className="text-[10px] text-gray-400 mono mt-1">{d.signature_hash.slice(0,32)}…</div>}
                  </td>
                  <td className="px-6 py-4">
                    {d.signed && <span className="inline-block px-1.5 py-0.5 bg-[#FFB300] text-black text-[10px] uppercase tracking-wider mr-1">Semnat</span>}
                    {d.stamped && <span className="inline-block px-1.5 py-0.5 border border-gray-300 text-[10px] uppercase tracking-wider">Ștampilat</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs">{new Date(d.created_at).toLocaleString('ro-RO')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => download(d)} className="ghost-btn text-xs" data-testid={`download-${d.document_id}`}><Download className="w-3.5 h-3.5" />DOCX</button>
                      {d.signed && (
                        <button onClick={() => download(d, true)} className="ghost-btn text-xs" data-testid={`download-sig-${d.document_id}`}><ShieldCheck className="w-3.5 h-3.5" />.p7s</button>
                      )}
                      <button onClick={() => setEmailOpen(d.document_id)} className="ghost-btn text-xs" data-testid={`email-${d.document_id}`}><Mail className="w-3.5 h-3.5" />Email</button>
                      <button onClick={() => onDelete(d.document_id)} className="text-gray-400 hover:text-[#DC2626] p-1.5"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {emailOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setEmailOpen(null)}>
          <div onClick={e=>e.stopPropagation()} className="bg-white border border-gray-200 max-w-lg w-full p-6 space-y-4" data-testid="email-modal">
            <h3 className="font-semibold">Trimite pe email</h3>
            <input value={emailForm.recipients} onChange={e=>setEmailForm({...emailForm, recipients:e.target.value})} placeholder="email1@x.ro, email2@y.ro" className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" data-testid="modal-recipients" />
            <input value={emailForm.subject} onChange={e=>setEmailForm({...emailForm, subject:e.target.value})} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" data-testid="modal-subject" />
            <textarea value={emailForm.body} onChange={e=>setEmailForm({...emailForm, body:e.target.value})} rows={5} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" data-testid="modal-body" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEmailOpen(null)} className="ghost-btn">Anulează</button>
              <button onClick={() => sendEmail(emailOpen)} className="amber-btn" data-testid="modal-send">Trimite</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
