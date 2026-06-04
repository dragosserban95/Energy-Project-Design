
const SITE_URL = "https://energy-project-design-services.onrender.com";
let CONFIG = {};
let USER = null;
let currentPage = "Panou principal";
let industry = "Gaze naturale";
let workType = "Branșamente gaze naturale";

const STORAGE_KEY = "epd_big_update_state_v2";
const CHAT_KEY = "epd_ai_developer_chat_v2";
const pages = ["Panou principal","Date proiect","Date tehnice","Documentație","Șabloane OSD","Calcul","Ștampile","Email-uri","Verificări","Checklist","Registru proiecte","Import / Export","Planuri și licențe","Marketplace / Module","Asistent utilizator","AI Developer","Inside","Diagnostic","Actualizări","Construire / Lansare"];

const projectFields = ["beneficiar", "adresa_lucrare", "localitate", "judet", "telefon", "email", "osd", "tip_lucrare", "industrie", "numar_contract", "data_contract", "proiectant", "verificator_vgd", "responsabil_rte", "observatii"];
const technicalFields = ["debit_instalat", "presiune_regim", "diametru_conducta", "material_conducta", "lungime_bransament", "punct_racordare", "post_reglare", "contor", "categorie_consumator", "traseu", "observatii_tehnice"];
const vgdFields = ["verificator_vgd", "atestat_vgd", "data_verificare_vgd", "status_vgd", "observatii_vgd"];
const rteFields = ["responsabil_rte", "autorizatie_rte", "data_verificare_rte", "status_rte", "observatii_rte"];
const calcFields = ["calcul_debit", "calcul_presiune", "pierdere_presiune", "rezultat_calcul", "observatii_calcul"];
const documentTemplates = [{"id": "cerere", "name": "Cerere racordare", "body": "Către <osd>,\n\nSubsemnatul/Subscrisa <beneficiar>, solicit racordarea la sistemul de distribuție gaze naturale pentru imobilul situat în <adresa_lucrare>, <localitate>, <judet>.\n\nTip lucrare: <tip_lucrare>.\nData: <data_document>\nProiectant: <proiectant>"}, {"id": "memoriu", "name": "Memoriu tehnic", "body": "MEMORIU TEHNIC\n\nBeneficiar: <beneficiar>\nAdresă lucrare: <adresa_lucrare>\nDebit instalat: <debit_instalat>\nPresiune regim: <presiune_regim>\nDiametru conductă: <diametru_conducta>\nMaterial conductă: <material_conducta>\nLungime branșament: <lungime_bransament>\nObservații: <observatii_tehnice>"}, {"id": "fisa", "name": "Fișă date tehnice", "body": "FIȘĂ DATE TEHNICE\nBeneficiar: <beneficiar>\nOSD: <osd>\nPunct racordare: <punct_racordare>\nPost reglare: <post_reglare>\nContor: <contor>\nCategorie consumator: <categorie_consumator>"}, {"id": "vgd", "name": "Document verificare VGD", "body": "DOCUMENT VERIFICARE VGD\nVerificator: <verificator_vgd>\nAtestat: <atestat_vgd>\nData: <data_verificare_vgd>\nStatus: <status_vgd>\nObservații: <observatii_vgd>\n<stampila_vgd>"}, {"id": "rte", "name": "Document verificare RTE", "body": "DOCUMENT VERIFICARE RTE\nResponsabil RTE: <responsabil_rte>\nAutorizație: <autorizatie_rte>\nData: <data_verificare_rte>\nStatus: <status_rte>\nObservații: <observatii_rte>\n<stampila_rte>"}, {"id": "borderou", "name": "Borderou documente", "body": "BORDEROU DOCUMENTE\n1. Cerere racordare\n2. Memoriu tehnic\n3. Fișă date tehnice\n4. Verificare VGD\n5. Verificare RTE\nBeneficiar: <beneficiar>"}];
const emailTemplates = [{"id": "ofertare", "name": "Ofertare", "subject": "Ofertă documentație gaze naturale - <beneficiar>", "body": "Bună ziua,\n\nVă transmitem oferta pentru documentația tehnică aferentă lucrării <tip_lucrare> din <adresa_lucrare>.\n\nCu respect,\nEnergy Project Design Services"}, {"id": "lipsa", "name": "Solicitare date lipsă", "subject": "Date lipsă documentație - <beneficiar>", "body": "Bună ziua,\n\nPentru finalizarea documentației sunt necesare completări: <observatii>.\n\nMulțumim."}, {"id": "osd", "name": "Transmitere documentație OSD", "subject": "Documentație branșament gaze naturale - <beneficiar>", "body": "Către <osd>,\n\nVă transmitem documentația pentru lucrarea situată în <adresa_lucrare>.\n\nCu stimă,\n<proiectant>"}];

const defaultState = {
  project: Object.fromEntries(projectFields.map(k => [k, ""])),
  technical: Object.fromEntries(technicalFields.map(k => [k, ""])),
  vgd: {verificator_vgd:"", atestat_vgd:"", data_verificare_vgd:"", status_vgd:"neverificat", observatii_vgd:""},
  rte: {responsabil_rte:"", autorizatie_rte:"", data_verificare_rte:"", status_rte:"neverificat", observatii_rte:""},
  calcul: {calcul_debit:"", calcul_presiune:"", pierdere_presiune:"", rezultat_calcul:"", observatii_calcul:""},
  stamps: [],
  documents: [],
  emails: [],
  projects: [],
  plan: {plan:"Free", status:"activ", activatedAt:new Date().toISOString().slice(0,10), expiresAt:""},
  planRules: {Free:false, Trial:false, Basic:false, Expired:false, Developer:true},
  updates: []
};
defaultState.project.tip_lucrare = "Branșamente gaze naturale";
defaultState.project.industrie = "Gaze naturale";

let state = loadState();

function loadState() {
  try {
    return merge(structuredClone(defaultState), JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
  } catch {
    return structuredClone(defaultState);
  }
}
function merge(a,b) {
  for (const k in b) {
    if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k])) a[k] = merge(a[k] || {}, b[k]);
    else a[k] = b[k];
  }
  return a;
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(v) { return String(v ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function today() { return new Date().toISOString().slice(0,10); }
function toast(m) { const t=document.getElementById("toast"); if(!t) return alert(m); t.textContent=m; t.classList.remove("hidden"); setTimeout(()=>t.classList.add("hidden"),2500); }
async function api(url, opts={}) {
  const r = await fetch(url, {headers:{"Content-Type":"application/json"}, ...opts});
  const txt = await r.text();
  try { return JSON.parse(txt); } catch { return {ok:r.ok, raw:txt}; }
}
function canExport() {
  if ((state.plan.status || "").toLowerCase().includes("expirat")) return false;
  return Boolean(state.planRules[state.plan.plan || "Free"]);
}
function label(k) { return k.replaceAll("_"," ").replace(/\b\w/g, c => c.toUpperCase()); }
function activeProfile() { return industry === "Gaze naturale" && workType === "Branșamente gaze naturale"; }

async function boot() {
  try { CONFIG = await api("/api/config"); } catch {}
  fillProfile();
  healthLogin();
  const gu = localStorage.getItem("epd_google_user");
  if (gu) {
    try {
      const parsed = JSON.parse(gu);
      USER = {name: parsed.name || parsed.email, email: parsed.email, role: parsed.role || "User"};
      document.getElementById("login").classList.add("hidden");
      document.getElementById("app").classList.remove("hidden");
      buildNav();
      openPage("Panou principal");
    } catch {}
  }
}
boot();

async function healthLogin() {
  try {
    const h = await api("/api/health");
    const el = document.getElementById("loginStatus");
    if (el) el.textContent = `OpenAI=${h.openaiConfigured} GitHub=${h.githubUpdateConfigured} AutoApply=${h.autoApplyGithub}`;
  } catch {}
}

async function login() {
  const user = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value;
  const res = await api("/api/login", {method:"POST", body:JSON.stringify({user,password})});
  if (!res.ok) return alert("Login incorect.");
  USER = res.user || {name:user, role:"Developer"};
  if (String(USER.role || "").toLowerCase().includes("developer")) state.plan.plan = "Developer";
  saveState();
  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  buildNav();
  openPage("Panou principal");
}
function googleLogin() { window.location.href = "/api/auth/google"; }
function showRegister() { document.getElementById("authBox").classList.remove("hidden"); document.getElementById("authBox").innerHTML = '<h3>Cont nou</h3><p>Pregătit pentru AUTH_REGISTER_ENABLED + PostgreSQL.</p><input placeholder="Email"><input placeholder="Parolă" type="password"><button>Creează cont</button>'; }
function showForgot() { document.getElementById("authBox").classList.remove("hidden"); document.getElementById("authBox").innerHTML = '<h3>Resetare parolă</h3><p>Pregătit pentru SMTP.</p><input placeholder="Email"><button>Trimite link</button>'; }

function fillProfile() {
  const industries = ["Gaze naturale","Energie electrică","Apă-canal","Telecom / fibră optică","Fotovoltaice","Construcții","Infrastructură feroviară"];
  const works = ["Branșamente gaze naturale","Extindere de conductă gaze naturale","Instalații de utilizare gaze naturale","Modernizări conducte gaze naturale","Studii de fezabilitate gaze naturale"];
  document.getElementById("industry").innerHTML = industries.map(x => `<option ${x===industry?"selected":""}>${esc(x)}</option>`).join("");
  document.getElementById("workType").innerHTML = works.map(x => `<option ${x===workType?"selected":""}>${esc(x)}</option>`).join("");
  refreshPills();
}
function profileChanged() {
  industry = document.getElementById("industry").value;
  workType = document.getElementById("workType").value;
  refreshPills();
  openPage(currentPage);
}
function refreshPills() {
  const s = document.getElementById("statusPill");
  const p = document.getElementById("planPill");
  if (s) { s.textContent = activeProfile() ? "Activ" : "Blocat"; s.classList.toggle("warn", !activeProfile()); }
  if (p) { p.textContent = `${state.plan.plan} / export: ${canExport() ? "permis" : "blocat"}`; p.classList.toggle("warn", !canExport()); }
}
function buildNav() {
  document.getElementById("nav").innerHTML = pages.map(p => `<button class="nav" onclick="openPage('${p.replace(/'/g,"\\'")}')">${p}</button>`).join("");
}
function setTitle(t, sub) {
  document.getElementById("pageTitle").textContent = t;
  document.getElementById("pageSub").textContent = sub || (activeProfile() ? "Profil activ" : "Profil vizibil, blocat până la configurare");
  document.querySelectorAll(".nav").forEach(b => b.classList.toggle("active", b.textContent === t));
}
function content(html) { document.getElementById("content").innerHTML = html; }

function openPage(p) {
  currentPage = p; setTitle(p); refreshPills();
  const map = {
    "Panou principal": dashboard, "Date proiect": projectPage, "Date tehnice": technicalPage, "Documentație": docsPage,
    "Șabloane OSD": osdPage, "Calcul": calcPage, "Ștampile": stampsPage, "Email-uri": emailsPage,
    "Verificări": verifyPage, "Checklist": checklistPage, "Registru proiecte": registryPage, "Import / Export": importExportPage,
    "Planuri și licențe": plansPage, "Marketplace / Module": marketPage, "Asistent utilizator": assistantPage,
    "AI Developer": devPage, "Inside": insidePage, "Diagnostic": diagnosticPage, "Actualizări": updatesPage, "Construire / Lansare": launchPage
  };
  (map[p] || genericPage)(p);
}

function inputFor(obj, k) {
  const value = state[obj][k] || "";
  if (k.includes("observatii") || k === "traseu") return `<textarea onchange="setField('${obj}','${k}',this.value)">${esc(value)}</textarea>`;
  if (k.includes("data")) return `<input type="date" value="${esc(value)}" onchange="setField('${obj}','${k}',this.value)">`;
  if (k.includes("status")) return `<select onchange="setField('${obj}','${k}',this.value)">${["neverificat","în verificare","admis","respins","activ","expirat"].map(x=>`<option ${x===value?"selected":""}>${x}</option>`).join("")}</select>`;
  return `<input value="${esc(value)}" onchange="setField('${obj}','${k}',this.value)">`;
}
function form(obj, fields) { return `<div class="grid">${fields.map(k => `<label>${label(k)}${inputFor(obj,k)}</label>`).join("")}</div>`; }
function setField(obj,k,v) { state[obj][k]=v; saveState(); }
function chips(fields) { return fields.map(x => `<span class="placeholder">&lt;${x}&gt;</span>`).join(""); }

function values() {
  const stamp = role => {
    const s = state.stamps.find(x => x.role === role);
    return s ? `[Ștampilă ${role}: ${s.name}]` : `[Ștampilă ${role} lipsă]`;
  };
  return {...state.project, ...state.technical, ...state.vgd, ...state.rte, ...state.calcul,
    data_document: today(), numar_document:"AUTO", revizie:"0",
    stampila_proiectant: stamp("proiectant"), stampila_vgd: stamp("vgd"), stampila_rte: stamp("rte")
  };
}
function renderTemplate(t) {
  const v = values();
  return String(t || "").replace(/<([a-zA-Z0-9_ăîâșțĂÎÂȘȚ]+)>/g, (_, k) => v[k] || `<${k}>`);
}
function completion() {
  const required = ["beneficiar","adresa_lucrare","localitate","judet","osd","proiectant","debit_instalat","presiune_regim","diametru_conducta"];
  const ok = required.filter(k => state.project[k] || state.technical[k]).length;
  return Math.round(ok / required.length * 100);
}

function dashboard() {
  content(`<div class="grid3">
    <div class="card"><h3>Profil</h3><b>${industry} / ${workType}</b></div>
    <div class="card"><h3>Plan</h3><b>${state.plan.plan}</b><p>Export: ${canExport()?"permis":"blocat"}</p></div>
    <div class="card"><h3>Completare</h3><b>${completion()}%</b></div>
  </div>
  <div class="card"><h3>Flux principal</h3><p>Date proiect → Date tehnice → Documentație → Ștampile → VGD/RTE → Email-uri → Export.</p>
  <div class="row"><button onclick="openPage('Date proiect')">Date proiect</button><button onclick="openPage('Documentație')">Documentație</button><button onclick="openPage('AI Developer')">AI Developer</button></div></div>`);
}
function projectPage() { content(`<div class="card"><h3>Date proiect</h3>${form("project",projectFields)}<div class="row"><button class="primary" onclick="saveProject()">Salvează proiect</button><button onclick="openPage('Documentație')">Trimite către Documentație</button></div></div><div class="card"><h3>Placeholder-e</h3>${chips(projectFields)}</div>`); }
function saveProject() { state.projects.unshift({id:Date.now(), name:state.project.beneficiar || "Proiect fără nume", date:today(), status:completion()+"%"}); saveState(); toast("Proiect salvat."); }
function technicalPage() { content(`<div class="card"><h3>Date tehnice</h3>${form("technical",technicalFields)}<div class="row"><button class="primary" onclick="saveState();toast('Date tehnice salvate')">Salvează</button><button onclick="openPage('Calcul')">Trimite către Calcul</button></div></div><div class="card"><h3>Placeholder-e</h3>${chips(technicalFields)}</div>`); }

function docsPage() {
  const opts = documentTemplates.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("");
  content(`<div class="card"><h3>Motor documente</h3><div class="grid"><label>Tip document<select id="docTpl" onchange="loadDoc()">${opts}</select></label><label>Titlu<input id="docTitle"></label></div><label>Editor<textarea id="docEditor"></textarea></label><div class="row"><button onclick="loadDoc()">Încarcă șablon</button><button class="primary" onclick="previewDoc()">Previzualizare</button><button onclick="saveDoc()">Salvează document</button><button onclick="exportProject()">Export DOCX/PDF/ZIP</button></div></div><div class="card"><h3>Previzualizare</h3><pre id="docPreview"></pre></div><div class="card"><h3>Documente salvate</h3>${documentsTable()}</div>`);
  loadDoc();
}
function loadDoc() { const t = documentTemplates.find(x => x.id === document.getElementById("docTpl").value) || documentTemplates[0]; document.getElementById("docTitle").value=t.name; document.getElementById("docEditor").value=t.body; }
function previewDoc() { document.getElementById("docPreview").textContent = renderTemplate(document.getElementById("docEditor").value); }
function saveDoc() { previewDoc(); state.documents.unshift({id:Date.now(), title:document.getElementById("docTitle").value, body:document.getElementById("docPreview").textContent, date:today()}); saveState(); toast("Document salvat."); docsPage(); }
function documentsTable() { if(!state.documents.length) return '<p class="muted">Nu există documente salvate.</p>'; return `<table class="table"><tr><th>Titlu</th><th>Data</th></tr>${state.documents.map(d=>`<tr><td>${esc(d.title)}</td><td>${d.date}</td></tr>`).join("")}</table>`; }

function osdPage() { content(`<div class="card"><h3>Șabloane OSD</h3><p>Bibliotecă OSD pentru operatori gaze naturale.</p><div class="grid"><label>OSD<select><option>Distrigaz Sud Rețele</option><option>Delgaz Grid</option><option>Premier Energy</option></select></label><label>Șablon<input placeholder="Nume șablon"></label></div><div class="row"><button>Adaugă șablon</button><button>Scanează placeholder-e</button></div></div>`); }
function calcPage() { content(`<div class="card"><h3>Calcul</h3>${form("calcul",calcFields)}<div class="row"><button class="primary" onclick="runCalc()">Calculează demo</button></div></div>`); }
function runCalc() { const debit=Number(state.technical.debit_instalat||0); const lung=Number(state.technical.lungime_bransament||0); state.calcul.calcul_debit=String(debit); state.calcul.pierdere_presiune=(debit*lung*0.001).toFixed(3); state.calcul.rezultat_calcul=`Pierdere estimată: ${state.calcul.pierdere_presiune}`; saveState(); calcPage(); }

function stampsPage() { content(`<div class="card"><h3>Ștampile</h3><div class="grid3">${["proiectant","vgd","rte"].map(r=>`<div><h3>${r.toUpperCase()}</h3><input type="file" id="stamp_${r}"><button onclick="addStamp('${r}')">Încarcă</button></div>`).join("")}</div></div><div class="card"><h3>Ștampile mapate</h3>${stampsTable()}</div>`); }
function addStamp(role) { const f=document.getElementById("stamp_"+role).files[0]; state.stamps=state.stamps.filter(x=>x.role!==role); state.stamps.push({role,name:f?f.name:"ștampilă "+role,date:today()}); saveState(); stampsPage(); }
function stampsTable() { if(!state.stamps.length) return '<p class="muted">Nu există ștampile.</p>'; return `<table class="table">${state.stamps.map(s=>`<tr><td>${s.role}</td><td>${esc(s.name)}</td><td>&lt;stampila_${s.role}&gt;</td></tr>`).join("")}</table>`; }

function emailsPage() {
  const opts=emailTemplates.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join("");
  content(`<div class="card"><h3>Email-uri</h3><div class="grid"><label>Template<select id="emailTpl" onchange="loadEmail()">${opts}</select></label><label>Destinatar<input id="emailTo" value="${esc(state.project.email)}"></label></div><label>Subiect<input id="emailSubject"></label><label>Conținut<textarea id="emailBody"></textarea></label><div class="row"><button onclick="loadEmail()">Încarcă template</button><button class="primary" onclick="prepareEmail()">Pregătește email</button></div></div><div class="card"><h3>Previzualizare</h3><pre id="emailPreview"></pre></div>`);
  loadEmail();
}
function loadEmail() { const t=emailTemplates.find(x=>x.id===document.getElementById("emailTpl").value)||emailTemplates[0]; document.getElementById("emailSubject").value=renderTemplate(t.subject); document.getElementById("emailBody").value=renderTemplate(t.body); }
function prepareEmail() { const txt=`Către: ${document.getElementById("emailTo").value}\nSubiect: ${document.getElementById("emailSubject").value}\n\n${document.getElementById("emailBody").value}`; document.getElementById("emailPreview").textContent=txt; state.emails.unshift({id:Date.now(),date:today(),to:document.getElementById("emailTo").value,subject:document.getElementById("emailSubject").value}); saveState(); }

function verifyPage() { content(`<div class="grid"><div class="card"><h3>VGD</h3>${form("vgd",vgdFields)}<div class="row"><button onclick="authorize('vgd')">Autorizează VGD</button><button onclick="generateRoleDoc('vgd')">Generează document VGD</button></div></div><div class="card"><h3>RTE</h3>${form("rte",rteFields)}<div class="row"><button onclick="authorize('rte')">Autorizează RTE</button><button onclick="generateRoleDoc('rte')">Generează document RTE</button></div></div></div><div class="card"><h3>Validare</h3>${validation()}</div>`); }
function authorize(role) { state[role]["status_"+role] = "admis"; saveState(); verifyPage(); }
function generateRoleDoc(role) { const t=documentTemplates.find(x=>x.id===role); state.documents.unshift({id:Date.now(),title:t.name,body:renderTemplate(t.body),date:today()}); saveState(); toast("Document generat în Documentație."); }
function validation() { const miss=[]; ["beneficiar","adresa_lucrare","osd","proiectant"].forEach(k=>{if(!state.project[k])miss.push(k)}); ["debit_instalat","diametru_conducta"].forEach(k=>{if(!state.technical[k])miss.push(k)}); return miss.length ? `<p class="bad">Lipsesc:</p>${chips(miss)}` : '<p class="ok">Nu există erori critice.</p>'; }

function checklistPage() { const rows=[["Date proiect",!!state.project.beneficiar],["Date tehnice",!!state.technical.debit_instalat],["Documente",state.documents.length>0],["Ștampile",state.stamps.length>0],["VGD",state.vgd.status_vgd==="admis"],["RTE",state.rte.status_rte==="admis"],["Email",state.emails.length>0],["Export",canExport()]]; content(`<div class="card"><h3>Checklist</h3><table class="table">${rows.map(r=>`<tr><td>${r[0]}</td><td class="${r[1]?'ok':'bad'}">${r[1]?'Complet':'Lipsă / blocat'}</td></tr>`).join("")}</table></div>`); }
function registryPage() { content(`<div class="card"><h3>Registru proiecte</h3>${state.projects.length?`<table class="table">${state.projects.map(p=>`<tr><td>${esc(p.name)}</td><td>${p.date}</td><td>${p.status}</td></tr>`).join("")}</table>`:'<p class="muted">Nu există proiecte salvate.</p>'}</div>`); }
function importExportPage() { content(`<div class="card"><h3>Import / Export</h3><textarea id="importBox" placeholder="JSON proiect"></textarea><div class="row"><button onclick="importProject()">Import JSON</button><button onclick="exportProject()">Export proiect</button></div><p class="${canExport()?'ok':'bad'}">Export: ${canExport()?'permis':'blocat pentru planul curent'}</p></div>`); }
function importProject() { try { state=merge(state, JSON.parse(document.getElementById("importBox").value)); saveState(); toast("Import aplicat."); } catch { alert("JSON invalid."); } }
function exportProject() { if(!canExport()) return alert("Export blocat pentru Free/Trial/Basic/Expired. Disponibil pentru Developer/Premium."); const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="epd_project_export.json"; a.click(); }
function plansPage() { content(`<div class="card"><h3>Planuri</h3><div class="row"><button onclick="setPlan('Free')">Free</button><button onclick="setPlan('Trial')">Trial</button><button onclick="setPlan('Basic')">Basic</button><button onclick="setPlan('Developer')">Developer</button></div><pre>${JSON.stringify(state.plan,null,2)}</pre></div>`); }
function setPlan(p) { state.plan.plan=p; state.plan.status="activ"; saveState(); plansPage(); refreshPills(); }
function marketPage() { const mods=["OSD Templates","VGD/RTE","Import OCR","Planuri/Scheme","Marketplace șabloane","Document Engine Pro","Email Engine"]; content(`<div class="grid3">${mods.map(m=>`<div class="card locked"><h3>${m}</h3><p>Disponibil prin configurare Developer/Service.</p></div>`).join("")}</div>`); }

function assistantPage() { content(`<div class="card"><h3>Asistent utilizator</h3><div id="userChat" class="chat"><div class="msg ai">Întreabă despre documente, câmpuri, VGD/RTE, ștampile, emailuri sau export.</div></div><textarea id="userAsk"></textarea><button class="primary" onclick="askUser()">Întreabă</button></div>`); }
function askUser() { const q=document.getElementById("userAsk").value; const a=localHelp(q); document.getElementById("userChat").innerHTML += `<div class="msg user">${esc(q)}</div><div class="msg ai">${esc(a)}</div>`; }
function localHelp(q) { q=String(q||"").toLowerCase(); if(q.includes("export")) return "Exportul este permis doar pe Developer/Premium."; if(q.includes("vgd")) return "VGD se completează la Verificări."; if(q.includes("rte")) return "RTE se completează la Verificări."; if(q.includes("document")) return "Documentele se generează în Documentație după completarea datelor."; return "Completează paginile în ordinea fluxului principal."; }

function devPage() {
  const hist=JSON.parse(localStorage.getItem(CHAT_KEY)||"[]");
  content(`<div class="card"><h3>AI Developer — Chat</h3><div id="devChat" class="chat">${hist.map(m=>`<div class="msg ${m.role}">${esc(m.text)}</div>`).join("") || '<div class="msg ai">Scrie comanda pentru update.</div>'}</div><textarea id="devPrompt" placeholder="Comandă update..."></textarea><div class="row"><button class="primary" onclick="devSend()">Trimite</button><button onclick="devAnalyze()">Analiză</button><button onclick="devRun()">Run Update</button></div></div><div class="card"><h3>Raport</h3><pre id="devReport"></pre></div>`);
}
function devMsg(role,text) { const h=JSON.parse(localStorage.getItem(CHAT_KEY)||"[]"); h.push({role,text,date:new Date().toISOString()}); localStorage.setItem(CHAT_KEY,JSON.stringify(h)); devPage(); }
function devSend() { const p=document.getElementById("devPrompt").value; if(!p) return; devMsg("user",p); devMsg("ai","Comandă primită. Folosește Analiză sau Run Update."); }
async function devAnalyze() { const text=document.getElementById("devPrompt").value; const res=await api("/api/ai-developer/analyze",{method:"POST",body:JSON.stringify({text})}); document.getElementById("devReport").textContent=JSON.stringify(res,null,2); }
async function devRun() { const text=document.getElementById("devPrompt").value; if(!confirm("Rulez update prin backend?")) return; const res=await api("/api/update/run",{method:"POST",body:JSON.stringify({text})}); document.getElementById("devReport").textContent=JSON.stringify(res,null,2); }
function insidePage() { content('<div class="card locked"><h3>Inside</h3><p>Acces intern restricționat.</p></div>'); }
async function diagnosticPage() { content('<div class="card"><h3>Diagnostic</h3><pre id="diag">Se încarcă...</pre></div>'); const h=await api("/api/health"); document.getElementById("diag").textContent=JSON.stringify({site:SITE_URL, health:h, plan:state.plan, exportAllowed:canExport(), completion:completion()},null,2); }
function updatesPage() { content(`<div class="card"><h3>Actualizări</h3><input id="promptFiles" type="file" multiple><textarea id="manualPrompt" placeholder="Prompt manual"></textarea><div class="row"><button onclick="uploadPrompts()">Upload prompturi</button><button onclick="listPrompts()">Listă prompturi</button><button class="primary" onclick="runUpdate()">Run Update</button></div></div><div class="card"><h3>Log</h3><pre id="updateLog"></pre></div>`); }
async function uploadPrompts() { const fd=new FormData(); [...document.getElementById("promptFiles").files].forEach(f=>fd.append("files",f)); const txt=document.getElementById("manualPrompt").value; if(txt) fd.append("text",txt); const r=await fetch("/api/prompts/upload",{method:"POST",body:fd}); document.getElementById("updateLog").textContent=JSON.stringify(await r.json(),null,2); }
async function listPrompts() { document.getElementById("updateLog").textContent=JSON.stringify(await api("/api/prompts"),null,2); }
async function runUpdate() { const text=document.getElementById("manualPrompt").value; const res=await api("/api/update/run",{method:"POST",body:JSON.stringify({text})}); document.getElementById("updateLog").textContent=JSON.stringify(res,null,2); }
function launchPage() { content(`<div class="card"><h3>Construire / Lansare</h3><table class="table"><tr><td>Site</td><td>${SITE_URL}</td></tr><tr><td>Repository</td><td>dragosserban95/Energy-Project-Design</td></tr><tr><td>Auto-Deploy</td><td>ON în Render</td></tr></table></div>`); }
function genericPage(p) { content(`<div class="card"><h3>${esc(p)}</h3><p>Pagină pregătită operațional.</p></div>`); }
