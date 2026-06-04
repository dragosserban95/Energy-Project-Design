const SITE_URL = "https://energy-project-design-services.onrender.com";

let CONFIG = {};
let USER = null;
let currentPage = "Panou principal";
let industry = "Gaze naturale";
let workType = "Branșamente gaze naturale";

const STORAGE_KEY = "epd_services_clean_state_v1";
const CHAT_KEY = "epd_ai_developer_chat_clean_v1";

const pages = [
  "Panou principal",
  "Date proiect",
  "Date tehnice",
  "Documentație",
  "Șabloane OSD",
  "Calcul",
  "Ștampile",
  "Email-uri",
  "Verificări",
  "Checklist",
  "Registru proiecte",
  "Import / Export",
  "Planuri și licențe",
  "Marketplace / Module",
  "Asistent utilizator",
  "AI Developer",
  "Inside",
  "Diagnostic",
  "Actualizări",
  "Construire / Lansare"
];

const fields = {
  project: ["beneficiar","adresa_lucrare","localitate","judet","telefon","email","osd","tip_lucrare","industrie","numar_contract","data_contract","proiectant","executant","verificator_vgd","responsabil_rte","observatii"],
  technical: ["debit_instalat","presiune_regim","diametru_conducta","material_conducta","lungime_bransament","punct_racordare","post_reglare","contor","categorie_consumator","traseu","observatii_tehnice"],
  vgd: ["verificator_vgd","atestat_vgd","data_verificare_vgd","status_vgd","observatii_vgd"],
  rte: ["responsabil_rte","autorizatie_rte","data_verificare_rte","status_rte","observatii_rte"],
  calcul: ["calcul_debit","calcul_presiune","pierdere_presiune","rezultat_calcul","observatii_calcul"]
};

const documentTemplates = [
  {id:"cerere_racordare",name:"Cerere racordare",body:"Către <osd>,\n\nSubsemnatul/Subscrisa <beneficiar>, solicit racordarea la sistemul de distribuție gaze naturale pentru imobilul situat în <adresa_lucrare>, <localitate>, <judet>.\n\nTip lucrare: <tip_lucrare>\nData: <data_document>\nProiectant: <proiectant>\n<stampila_proiectant>"},
  {id:"memoriu_tehnic",name:"Memoriu tehnic",body:"MEMORIU TEHNIC\n\nBeneficiar: <beneficiar>\nAdresă lucrare: <adresa_lucrare>\nDebit instalat: <debit_instalat>\nPresiune regim: <presiune_regim>\nDiametru conductă: <diametru_conducta>\nMaterial conductă: <material_conducta>\nLungime branșament: <lungime_bransament>\nTraseu: <traseu>\nObservații: <observatii_tehnice>"},
  {id:"fisa_date_tehnice",name:"Fișă date tehnice",body:"FIȘĂ DATE TEHNICE\nBeneficiar: <beneficiar>\nOSD: <osd>\nPunct racordare: <punct_racordare>\nPost reglare: <post_reglare>\nContor: <contor>\nCategorie consumator: <categorie_consumator>"},
  {id:"borderou",name:"Borderou documente",body:"BORDEROU DOCUMENTE\n\n1. Cerere racordare\n2. Memoriu tehnic\n3. Fișă date tehnice\n4. Document verificare VGD\n5. Document verificare RTE\n\nBeneficiar: <beneficiar>\nData: <data_document>"},
  {id:"vgd",name:"Document verificare VGD",body:"DOCUMENT VERIFICARE VGD\n\nVerificator: <verificator_vgd>\nAtestat: <atestat_vgd>\nData verificare: <data_verificare_vgd>\nStatus: <status_vgd>\nObservații: <observatii_vgd>\n<stampila_vgd>"},
  {id:"rte",name:"Document verificare RTE",body:"DOCUMENT VERIFICARE RTE\n\nResponsabil RTE: <responsabil_rte>\nAutorizație: <autorizatie_rte>\nData verificare: <data_verificare_rte>\nStatus: <status_rte>\nObservații: <observatii_rte>\n<stampila_rte>"},
  {id:"adresa_osd",name:"Adresă către OSD",body:"Către <osd>,\n\nVă transmitem documentația pentru lucrarea <tip_lucrare>, beneficiar <beneficiar>, amplasament <adresa_lucrare>.\n\nCu stimă,\n<proiectant>"}
];

const emailTemplates = [
  {id:"ofertare",name:"Ofertare",subject:"Ofertă documentație gaze naturale - <beneficiar>",body:"Bună ziua,\n\nVă transmitem oferta pentru documentația tehnică aferentă lucrării <tip_lucrare> din <adresa_lucrare>.\n\nCu respect,\nEnergy Project Design Services"},
  {id:"date_lipsa",name:"Solicitare date lipsă",subject:"Date lipsă documentație - <beneficiar>",body:"Bună ziua,\n\nPentru finalizarea documentației sunt necesare următoarele date: <observatii>.\n\nMulțumim."},
  {id:"transmitere_osd",name:"Transmitere documentație OSD",subject:"Documentație branșament gaze naturale - <beneficiar>",body:"Către <osd>,\n\nVă transmitem documentația pentru lucrarea situată în <adresa_lucrare>.\n\nCu stimă,\n<proiectant>"},
  {id:"vgd",name:"Transmitere verificare VGD",subject:"Document verificat VGD - <beneficiar>",body:"Bună ziua,\n\nDocumentația a fost verificată VGD. Status: <status_vgd>.\nObservații: <observatii_vgd>"},
  {id:"rte",name:"Transmitere verificare RTE",subject:"Document RTE - <beneficiar>",body:"Bună ziua,\n\nDocumentația RTE are status: <status_rte>.\nObservații: <observatii_rte>"}
];

const defaultState = {
  project:{beneficiar:"",adresa_lucrare:"",localitate:"",judet:"",telefon:"",email:"",osd:"",tip_lucrare:"Branșamente gaze naturale",industrie:"Gaze naturale",numar_contract:"",data_contract:"",proiectant:"",executant:"",verificator_vgd:"",responsabil_rte:"",observatii:""},
  technical:{debit_instalat:"",presiune_regim:"",diametru_conducta:"",material_conducta:"",lungime_bransament:"",punct_racordare:"",post_reglare:"",contor:"",categorie_consumator:"",traseu:"",observatii_tehnice:""},
  vgd:{verificator_vgd:"",atestat_vgd:"",data_verificare_vgd:"",status_vgd:"neverificat",observatii_vgd:""},
  rte:{responsabil_rte:"",autorizatie_rte:"",data_verificare_rte:"",status_rte:"neverificat",observatii_rte:""},
  calcul:{calcul_debit:"",calcul_presiune:"",pierdere_presiune:"",rezultat_calcul:"",observatii_calcul:""},
  stamps:[],
  documents:[],
  emails:[],
  projects:[],
  updates:[],
  account:null,
  plan:{plan:"Free",status:"activ",activatedAt:new Date().toISOString().slice(0,10),expiresAt:""},
  planRules:{Free:false,Trial:false,Basic:false,Expired:false,Developer:true,Premium:true,Inside:true}
};

let state = loadState();

function loadState(){
  try {
    return deepMerge(structuredClone(defaultState), JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
  } catch {
    return structuredClone(defaultState);
  }
}

function deepMerge(a,b){
  for (const k in b) {
    if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k])) a[k] = deepMerge(a[k] || {}, b[k]);
    else a[k] = b[k];
  }
  return a;
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function esc(v){
  const map = {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
  return String(v ?? "").replace(/[&<>"']/g, c => map[c] || c);
}

function today(){
  return new Date().toISOString().slice(0,10);
}

function toast(msg){
  const t = document.getElementById("toast");
  if (!t) return alert(msg);
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 3000);
}

async function api(url, opts = {}){
  const r = await fetch(url, {credentials:"include", headers:{"Content-Type":"application/json"}, ...opts});
  const txt = await r.text();
  try { return JSON.parse(txt); } catch { return {ok:r.ok, raw:txt}; }
}

function canExport(){
  const plan = state.plan.plan || "Free";
  const status = String(state.plan.status || "activ").toLowerCase();
  if (status.includes("expirat")) return false;
  return Boolean(state.planRules[plan]);
}

function activeProfile(){
  return industry === "Gaze naturale" && workType === "Branșamente gaze naturale";
}

async function boot(){
  try { CONFIG = await api("/api/config"); } catch { CONFIG = {}; }
  fillProfile();
  await checkExistingSession();
  checkLoginHealth();
}
boot();

async function checkExistingSession(){
  try {
    const res = await api("/api/auth/me");
    if (res.ok && res.authenticated && res.user) {
      enterPlatform(res.user);
      return true;
    }
  } catch {}
  return false;
}

async function checkLoginHealth(){
  try {
    const h = await api("/api/health");
    const el = document.getElementById("loginStatus");
    if (el) el.textContent = "Status: OpenAI=" + h.openaiConfigured + " GitHub=" + h.githubUpdateConfigured + " AutoApply=" + h.autoApplyGithub;
  } catch {}
}

async function login(){
  const user = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value;

  if (user.includes("@")) {
    const res = await api("/api/auth/email/login", {method:"POST", body:JSON.stringify({email:user,password})});
    if (res.ok && res.user) return enterPlatform(res.user);
  }

  const res = await api("/api/login", {method:"POST", body:JSON.stringify({user,password})});
  if (!res.ok) return alert("Login incorect sau backend indisponibil.");

  const u = res.user || {name:user,email:user,role:"Developer",plan:"Developer",provider:"developer"};
  enterPlatform(u);
}

function enterPlatform(user){
  USER = user || {role:"User",plan:"Free"};
  state.account = {
    email: USER.email || USER.name || "",
    name: USER.name || USER.email || "",
    provider: USER.provider || "local",
    role: USER.role || "User",
    lastLoginAt: new Date().toISOString()
  };

  if (USER.role && String(USER.role).toLowerCase().includes("developer")) state.plan.plan = "Developer";
  else state.plan.plan = USER.plan || state.plan.plan || "Free";

  saveState();

  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  buildNav();
  openPage("Panou principal");
}

function showRegister(){
  const el = document.getElementById("authBox");
  el.classList.remove("hidden");
  el.innerHTML = '<h3>Cont nou utilizator</h3><p class="muted">Contul se salvează în platformă pe baza email-ului.</p><label>Nume</label><input id="regName" placeholder="Nume"><label>Email</label><input id="regEmail" placeholder="email@exemplu.ro"><label>Parolă</label><input id="regPassword" type="password" placeholder="Parolă"><button class="primary" onclick="registerAccount()">Creează cont și intră în aplicație</button>';
}

async function registerAccount(){
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const res = await api("/api/auth/register", {method:"POST", body:JSON.stringify({name,email,password})});
  if (!res.ok) return alert(res.error || "Nu s-a putut crea contul.");
  enterPlatform(res.user);
}

function showForgot(){
  const el = document.getElementById("authBox");
  el.classList.remove("hidden");
  el.innerHTML = '<h3>Recuperare parolă</h3><p class="muted">Funcția SMTP este pregătită pentru activare backend.</p><input placeholder="Email"><button onclick="toast(\'Solicitare pregătită pentru SMTP.\')">Trimite link resetare</button>';
}

function googleLogin(){
  window.location.href = "/api/auth/google";
}

async function logout(){
  await api("/api/auth/logout", {method:"POST"});
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function fillProfile(){
  const industries = ["Gaze naturale","Energie electrică","Apă-canal","Telecom / fibră optică","Fotovoltaice","Construcții","Infrastructură feroviară"];
  const works = ["Branșamente gaze naturale","Extindere de conductă gaze naturale","Instalații de utilizare gaze naturale","Modernizări conducte gaze naturale","Studii de fezabilitate gaze naturale"];

  const i = document.getElementById("industry");
  const w = document.getElementById("workType");
  if (i) i.innerHTML = industries.map(x => '<option ' + (x === industry ? "selected" : "") + '>' + esc(x) + '</option>').join("");
  if (w) w.innerHTML = works.map(x => '<option ' + (x === workType ? "selected" : "") + '>' + esc(x) + '</option>').join("");

  refreshPills();
}

function profileChanged(){
  industry = document.getElementById("industry").value;
  workType = document.getElementById("workType").value;
  state.project.industrie = industry;
  state.project.tip_lucrare = workType;
  saveState();
  refreshPills();
  openPage(currentPage);
}

function refreshPills(){
  const s = document.getElementById("statusPill");
  const p = document.getElementById("planPill");
  if (s) {
    s.textContent = activeProfile() ? "Activ" : "Blocat";
    s.classList.toggle("warn", !activeProfile());
  }
  if (p) {
    p.textContent = (state.plan.plan || "Free") + " / export: " + (canExport() ? "permis" : "blocat");
    p.classList.toggle("warn", !canExport());
  }
}

function buildNav(){
  document.getElementById("nav").innerHTML = pages.map(p => '<button class="nav" onclick="openPage(\'' + p.replace(/'/g,"\\'") + '\')">' + esc(p) + '</button>').join("");
}

function setTitle(t, sub){
  document.getElementById("pageTitle").textContent = t;
  document.getElementById("pageSub").textContent = sub || (activeProfile() ? "Profil activ" : "Profil blocat contextual");
  document.querySelectorAll(".nav").forEach(b => b.classList.toggle("active", b.textContent === t));
}

function content(html){
  document.getElementById("content").innerHTML = html;
}

function openPage(p){
  currentPage = p;
  setTitle(p);
  refreshPills();

  const map = {
    "Panou principal": pageDashboard,
    "Date proiect": pageProject,
    "Date tehnice": pageTechnical,
    "Documentație": pageDocuments,
    "Șabloane OSD": pageTemplates,
    "Calcul": pageCalcul,
    "Ștampile": pageStamps,
    "Email-uri": pageEmails,
    "Verificări": pageVerifications,
    "Checklist": pageChecklist,
    "Registru proiecte": pageRegistry,
    "Import / Export": pageImportExport,
    "Planuri și licențe": pagePlans,
    "Marketplace / Module": pageMarketplace,
    "Asistent utilizator": pageAssistant,
    "AI Developer": pageAIDeveloper,
    "Inside": pageInside,
    "Diagnostic": pageDiagnostic,
    "Actualizări": pageUpdates,
    "Construire / Lansare": pageLaunch
  };

  (map[p] || pageGeneric)();
}

function labelFor(f){
  return f.replaceAll("_"," ").replace(/\b\w/g, c => c.toUpperCase());
}

function inputFor(group,f){
  const value = state[group][f] || "";
  if (f.includes("observatii") || f === "traseu") return '<textarea onchange="setField(\'' + group + '\',\'' + f + '\',this.value)">' + esc(value) + '</textarea>';
  if (f.includes("data")) return '<input type="date" value="' + esc(value) + '" onchange="setField(\'' + group + '\',\'' + f + '\',this.value)">';
  if (f.includes("status")) {
    const opts = ["neverificat","în verificare","admis","respins","activ","expirat"];
    return '<select onchange="setField(\'' + group + '\',\'' + f + '\',this.value)">' + opts.map(x => '<option ' + (x === value ? "selected" : "") + '>' + esc(x) + '</option>').join("") + '</select>';
  }
  return '<input value="' + esc(value) + '" onchange="setField(\'' + group + '\',\'' + f + '\',this.value)">';
}

function fieldGroup(group,list){
  return '<div class="grid">' + list.map(f => '<label>' + labelFor(f) + inputFor(group,f) + '</label>').join("") + '</div>';
}

function setField(group,f,v){
  state[group] = state[group] || {};
  state[group][f] = v;
  saveState();
}

function stampText(role){
  const s = state.stamps.find(x => x.role === role);
  return s ? "[Ștampilă " + role + ": " + s.name + "]" : "[Ștampilă " + role + " lipsă]";
}

function allValues(){
  return {
    ...state.project,
    ...state.technical,
    ...state.vgd,
    ...state.rte,
    ...state.calcul,
    data_document: today(),
    numar_document: "AUTO",
    revizie: "0",
    stampila_proiectant: stampText("proiectant"),
    stampila_vgd: stampText("vgd"),
    stampila_rte: stampText("rte")
  };
}

function renderTemplate(text){
  const values = allValues();
  return String(text || "").replace(/<([a-zA-Z0-9_ăîâșțĂÎÂȘȚ]+)>/g, (m,k) => values[k] || m);
}

function missingPlaceholders(text){
  const values = allValues();
  const all = [...String(text || "").matchAll(/<([a-zA-Z0-9_ăîâșțĂÎÂȘȚ]+)>/g)].map(m => m[1]);
  return [...new Set(all.filter(k => !values[k]))];
}

function chips(list){
  return '<div>' + list.map(x => '<span class="placeholder">&lt;' + esc(x) + '&gt;</span>').join("") + '</div>';
}

function completionScore(){
  const req = ["beneficiar","adresa_lucrare","localitate","judet","osd","proiectant","debit_instalat","presiune_regim","diametru_conducta"];
  const filled = req.filter(k => String(state.project[k] || state.technical[k] || "").trim().length > 0).length;
  return Math.round(filled / req.length * 100);
}

function pageDashboard(){
  content('<div class="grid3"><div class="kpi"><strong>Profil</strong><span>' + (activeProfile() ? "Activ" : "Blocat") + '</span></div><div class="kpi"><strong>Plan</strong><span>' + esc(state.plan.plan) + '</span></div><div class="kpi"><strong>Completare</strong><span>' + completionScore() + '%</span></div></div><div class="card"><h3>Flux principal</h3><p>Date proiect → Date tehnice → Calcul → Documentație → Ștampile → Verificări VGD/RTE → Email-uri → Export.</p><div class="actions"><button onclick="openPage(\'Date proiect\')">Date proiect</button><button onclick="openPage(\'Date tehnice\')">Date tehnice</button><button onclick="openPage(\'Documentație\')">Documentație</button><button onclick="openPage(\'Verificări\')">VGD/RTE</button></div></div><div class="card"><h3>Cont curent</h3><pre>' + esc(JSON.stringify(state.account || USER || {}, null, 2)) + '</pre><button onclick="logout()">Logout</button></div>');
}

function pageProject(){
  content('<div class="card"><h3>Date proiect</h3>' + fieldGroup("project",fields.project) + '<div class="actions"><button class="primary" onclick="saveProjectSnapshot()">Salvează proiect</button><button onclick="openPage(\'Documentație\')">Trimite către Documentație</button></div></div><div class="card"><h3>Placeholder-e Date proiect</h3>' + chips(fields.project) + '</div>');
}

function saveProjectSnapshot(){
  state.projects.unshift({id:Date.now(),name:state.project.beneficiar || "Proiect fără nume",date:today(),status:completionScore() + "% complet",project:structuredClone(state.project)});
  saveState();
  toast("Proiect salvat în registru.");
}

function pageTechnical(){
  content('<div class="card"><h3>Date tehnice</h3>' + fieldGroup("technical",fields.technical) + '<div class="actions"><button class="primary" onclick="saveState();toast(\'Date tehnice salvate.\')">Salvează</button><button onclick="openPage(\'Calcul\')">Trimite către Calcul</button></div></div><div class="card"><h3>Placeholder-e Date tehnice</h3>' + chips(fields.technical) + '</div>');
}

function pageDocuments(){
  const opts = documentTemplates.map(t => '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>').join("");
  content('<div class="card"><h3>Motor documente</h3><div class="grid"><label>Tip document<select id="docTpl" onchange="loadDocTpl()">' + opts + '</select></label><label>Titlu document<input id="docTitle" value="Document tehnic"></label></div><label>Editor document<textarea id="docEditor"></textarea></label><div class="actions"><button onclick="loadDocTpl()">Încarcă șablon</button><button class="primary" onclick="previewDoc()">Previzualizare</button><button onclick="saveDoc()">Salvează document</button><button onclick="exportProject()">Export JSON</button></div></div><div class="card"><h3>Previzualizare / placeholder-e</h3><pre id="docPreview"></pre><div id="docMissing"></div></div><div class="card"><h3>Documente salvate</h3>' + renderDocs() + '</div>');
  loadDocTpl();
}

function loadDocTpl(){
  const id = document.getElementById("docTpl")?.value || documentTemplates[0].id;
  const t = documentTemplates.find(x => x.id === id) || documentTemplates[0];
  document.getElementById("docEditor").value = t.body;
  document.getElementById("docTitle").value = t.name;
}

function previewDoc(){
  const raw = document.getElementById("docEditor").value;
  const rendered = renderTemplate(raw);
  document.getElementById("docPreview").textContent = rendered;
  const miss = missingPlaceholders(raw);
  document.getElementById("docMissing").innerHTML = miss.length ? '<p class="status-bad">Placeholder-e lipsă:</p>' + chips(miss) : '<p class="status-ok">Toate placeholder-ele au valori sau fallback.</p>';
}

function saveDoc(){
  previewDoc();
  state.documents.unshift({id:Date.now(),title:document.getElementById("docTitle").value,raw:document.getElementById("docEditor").value,rendered:document.getElementById("docPreview").textContent,date:today()});
  saveState();
  toast("Document salvat.");
  pageDocuments();
}

function renderDocs(){
  if (!state.documents.length) return '<p class="muted">Nu există documente salvate.</p>';
  return '<table class="table"><tr><th>Titlu</th><th>Data</th><th>Acțiuni</th></tr>' + state.documents.map(d => '<tr><td>' + esc(d.title) + '</td><td>' + esc(d.date) + '</td><td><button onclick="downloadText(\'' + d.id + '\')">Descarcă TXT</button></td></tr>').join("") + '</table>';
}

function downloadText(id){
  const d = state.documents.find(x => String(x.id) === String(id));
  if (!d) return;
  if (!canExport()) return alert("Export blocat pentru planul curent.");
  const blob = new Blob([d.rendered], {type:"text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (d.title || "document") + ".txt";
  a.click();
}

function pageTemplates(){
  content('<div class="card"><h3>Șabloane OSD</h3><p>Bibliotecă OSD pentru profilul activ.</p><div class="grid"><label>OSD<select><option>Distrigaz Sud Rețele</option><option>Delgaz Grid</option><option>Premier Energy</option><option>Alt OSD</option></select></label><label>Șablon<input placeholder="Nume șablon"></label></div><div class="actions"><button onclick="toast(\'Șablon pregătit.\')">Adaugă șablon</button><button onclick="openPage(\'Documentație\')">Generează document</button></div></div>');
}

function pageCalcul(){
  content('<div class="card"><h3>Calcul tehnic</h3>' + fieldGroup("calcul",fields.calcul) + '<div class="actions"><button class="primary" onclick="runCalc()">Calculează demo</button><button onclick="openPage(\'Documentație\')">Trimite rezultat către Documentație</button></div></div>');
}

function runCalc(){
  const debit = Number(String(state.technical.debit_instalat || "0").replace(",","."));
  const lungime = Number(String(state.technical.lungime_bransament || "0").replace(",","."));
  state.calcul.calcul_debit = debit ? debit.toFixed(2) : "";
  state.calcul.pierdere_presiune = debit && lungime ? (debit * lungime * 0.001).toFixed(3) : "";
  state.calcul.rezultat_calcul = "Calcul orientativ generat pentru debit și lungime.";
  saveState();
  pageCalcul();
  toast("Calcul actualizat.");
}

function pageStamps(){
  content('<div class="card"><h3>Ștampile</h3><div class="grid3">' + ["proiectant","vgd","rte"].map(role => '<div><h3>' + role.toUpperCase() + '</h3><input type="file" id="stamp_' + role + '" accept="image/*"><button onclick="addStamp(\'' + role + '\')">Încarcă ștampilă ' + role + '</button></div>').join("") + '</div></div><div class="card"><h3>Ștampile încărcate</h3>' + renderStamps() + '</div>');
}

function addStamp(role){
  const f = document.getElementById("stamp_" + role).files[0];
  state.stamps = state.stamps.filter(x => x.role !== role);
  state.stamps.push({role:role,name:f ? f.name : "Ștampilă " + role,date:today()});
  saveState();
  pageStamps();
}

function renderStamps(){
  if (!state.stamps.length) return '<p class="muted">Nu există ștampile.</p>';
  return '<table class="table"><tr><th>Rol</th><th>Nume</th><th>Placeholder</th></tr>' + state.stamps.map(s => '<tr><td>' + esc(s.role) + '</td><td>' + esc(s.name) + '</td><td>&lt;stampila_' + esc(s.role) + '&gt;</td></tr>').join("") + '</table>';
}

function pageEmails(){
  const opts = emailTemplates.map(t => '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>').join("");
  content('<div class="card"><h3>Email-uri</h3><div class="grid"><label>Template<select id="emailTpl" onchange="loadEmailTpl()">' + opts + '</select></label><label>Destinatar<input id="emailTo" value="' + esc(state.project.email) + '"></label></div><label>CC<input id="emailCc"></label><label>Subiect<input id="emailSubject"></label><label>Conținut<textarea id="emailBody"></textarea></label><div class="actions"><button onclick="loadEmailTpl()">Încarcă template</button><button class="primary" onclick="prepareEmail()">Pregătește email</button></div></div><div class="card"><h3>Email pregătit</h3><pre id="emailPreview"></pre></div>');
  loadEmailTpl();
}

function loadEmailTpl(){
  const t = emailTemplates.find(x => x.id === document.getElementById("emailTpl").value) || emailTemplates[0];
  document.getElementById("emailSubject").value = renderTemplate(t.subject);
  document.getElementById("emailBody").value = renderTemplate(t.body);
}

function prepareEmail(){
  const txt = "Către: " + document.getElementById("emailTo").value + "\nCC: " + document.getElementById("emailCc").value + "\nSubiect: " + document.getElementById("emailSubject").value + "\n\n" + document.getElementById("emailBody").value;
  document.getElementById("emailPreview").textContent = txt;
  state.emails.unshift({id:Date.now(),to:document.getElementById("emailTo").value,subject:document.getElementById("emailSubject").value,date:today(),body:document.getElementById("emailBody").value});
  saveState();
}

function pageVerifications(){
  content('<div class="grid"><div class="card"><h3>Verificare VGD</h3>' + fieldGroup("vgd",fields.vgd) + '<div class="actions"><button class="primary" onclick="authorize(\'vgd\')">Autorizează VGD</button><button onclick="generateRoleDoc(\'vgd\')">Generează document VGD</button></div></div><div class="card"><h3>Verificare RTE</h3>' + fieldGroup("rte",fields.rte) + '<div class="actions"><button class="primary" onclick="authorize(\'rte\')">Autorizează RTE</button><button onclick="generateRoleDoc(\'rte\')">Generează document RTE</button></div></div></div><div class="card"><h3>Validare proiect</h3>' + renderValidation() + '</div>');
}

function authorize(role){
  if (role === "vgd" && (!state.vgd.verificator_vgd || !state.vgd.atestat_vgd)) return alert("Lipsesc date VGD obligatorii.");
  if (role === "rte" && (!state.rte.responsabil_rte || !state.rte.autorizatie_rte)) return alert("Lipsesc date RTE obligatorii.");
  state[role]["status_" + role] = "admis";
  saveState();
  pageVerifications();
}

function generateRoleDoc(role){
  const tpl = documentTemplates.find(x => x.id === role);
  state.documents.unshift({id:Date.now(),title:tpl.name,raw:tpl.body,rendered:renderTemplate(tpl.body),date:today()});
  saveState();
  toast("Document " + role.toUpperCase() + " generat în Documentație.");
}

function renderValidation(){
  const missing = [];
  ["beneficiar","adresa_lucrare","localitate","judet","osd","proiectant"].forEach(k => { if (!state.project[k]) missing.push(k); });
  ["debit_instalat","presiune_regim","diametru_conducta"].forEach(k => { if (!state.technical[k]) missing.push(k); });
  return missing.length ? '<p class="status-bad">Câmpuri lipsă:</p>' + chips(missing) : '<p class="status-ok">Nu există erori critice.</p>';
}

function pageChecklist(){
  const items = [
    ["Date proiect", Boolean(state.project.beneficiar && state.project.adresa_lucrare)],
    ["Date tehnice", Boolean(state.technical.debit_instalat && state.technical.diametru_conducta)],
    ["Documente", state.documents.length > 0],
    ["Ștampilă proiectant", state.stamps.some(x => x.role === "proiectant")],
    ["VGD", state.vgd.status_vgd === "admis"],
    ["RTE", state.rte.status_rte === "admis"],
    ["Email pregătit", state.emails.length > 0],
    ["Plan export", canExport()]
  ];
  content('<div class="card"><h3>Checklist proiect</h3><table class="table"><tr><th>Item</th><th>Status</th></tr>' + items.map(r => '<tr><td>' + esc(r[0]) + '</td><td class="' + (r[1] ? "status-ok" : "status-bad") + '">' + (r[1] ? "Complet" : "Lipsă / blocat") + '</td></tr>').join("") + '</table></div>');
}

function pageRegistry(){
  content('<div class="card"><h3>Registru proiecte</h3>' + (state.projects.length ? '<table class="table"><tr><th>Proiect</th><th>Data</th><th>Status</th></tr>' + state.projects.map(p => '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.date) + '</td><td>' + esc(p.status) + '</td></tr>').join("") + '</table>' : '<p class="muted">Nu există proiecte salvate.</p>') + '</div>');
}

function pageImportExport(){
  content('<div class="card"><h3>Import / Export</h3><label>Import JSON<textarea id="importText"></textarea></label><div class="actions"><button onclick="importProject()">Import JSON</button><button onclick="exportProject()">Export proiect</button></div><p class="' + (canExport() ? "status-ok" : "status-bad") + '">Export: ' + (canExport() ? "permis" : "blocat pentru planul curent") + '</p></div>');
}

function importProject(){
  try {
    state = deepMerge(state, JSON.parse(document.getElementById("importText").value));
    saveState();
    toast("Import aplicat.");
  } catch {
    alert("JSON invalid.");
  }
}

function exportProject(){
  if (!canExport()) return alert("Export blocat pentru Free/Trial/Basic/Expired.");
  const blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "epd_project_export.json";
  a.click();
}

function pagePlans(){
  const planBtns = ["Free","Trial","Basic","Developer","Premium","Inside"].map(p => '<button onclick="setPlan(\'' + p + '\')">' + p + '</button>').join("");
  content('<div class="card"><h3>Planuri și licențe</h3><div class="actions">' + planBtns + '</div><pre>' + esc(JSON.stringify(state.plan,null,2)) + '</pre><p>Export permis: <strong>' + (canExport() ? "DA" : "NU") + '</strong></p></div>');
}

function setPlan(plan){
  state.plan.plan = plan;
  state.plan.status = "activ";
  saveState();
  pagePlans();
  refreshPills();
}

function pageMarketplace(){
  const mods = ["OSD Templates","VGD/RTE","Import OCR","Planuri/Scheme","Marketplace șabloane","Document Engine Pro","Email Engine"];
  content('<div class="grid3">' + mods.map(m => '<div class="card locked"><h3>' + esc(m) + '</h3><p>Modul premium pregătit pentru activare.</p></div>').join("") + '</div>');
}

function pageAssistant(){
  content('<div class="card"><h3>Asistent utilizator</h3><div id="userChat" class="chat"><div class="msg ai">Întreabă despre documente, câmpuri lipsă, VGD/RTE, ștampile, emailuri sau export.</div></div><textarea id="userAsk"></textarea><button class="primary" onclick="askUserAssistant()">Întreabă</button></div>');
}

function askUserAssistant(){
  const q = document.getElementById("userAsk").value;
  const a = localAssistant(q);
  const chat = document.getElementById("userChat");
  chat.innerHTML += '<div class="msg user">' + esc(q) + '</div><div class="msg ai">' + esc(a) + '</div>';
}

function localAssistant(q){
  q = String(q || "").toLowerCase();
  if (q.includes("export")) return "Exportul depinde de plan. Developer, Premium și Inside au export permis.";
  if (q.includes("vgd")) return "VGD se completează în Verificări și generează document dedicat.";
  if (q.includes("rte")) return "RTE se completează în Verificări și generează document dedicat.";
  if (q.includes("ștampil") || q.includes("stamp")) return "Ștampilele se mapează la proiectant, VGD și RTE.";
  if (q.includes("document")) return "Completează datele, apoi intră în Documentație și alege șablonul.";
  return "Fluxul recomandat este: Date proiect → Date tehnice → Calcul → Documentație → Ștampile → Verificări → Email-uri → Export.";
}

function pageAIDeveloper(){
  const history = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
  content('<div class="card"><h3>AI Developer</h3><div id="devChat" class="chat">' + (history.map(m => '<div class="msg ' + (m.role === "user" ? "user" : "ai") + '">' + esc(m.text) + '</div>').join("") || '<div class="msg ai">Scrie o comandă de update.</div>') + '</div><label>Comandă<textarea id="devPrompt"></textarea></label><div class="actions"><button class="primary" onclick="sendDevChat()">Trimite</button><button onclick="runDevAnalyze()">Analiză</button><button onclick="runDevUpdate()">Run Update direct</button><button onclick="clearDevChat()">Curăță</button></div></div><div class="card"><h3>Raport</h3><pre id="devReport"></pre></div>');
}

function devHistory(role,text){
  const h = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
  h.push({role,text,date:new Date().toISOString()});
  localStorage.setItem(CHAT_KEY, JSON.stringify(h));
}

function sendDevChat(){
  const p = document.getElementById("devPrompt").value.trim();
  if (!p) return;
  devHistory("user",p);
  devHistory("ai","Comandă primită. Folosește Analiză sau Run Update direct.");
  pageAIDeveloper();
}

async function runDevAnalyze(){
  const text = document.getElementById("devPrompt").value;
  const res = await api("/api/ai-developer/analyze", {method:"POST", body:JSON.stringify({text})});
  document.getElementById("devReport").textContent = JSON.stringify(res,null,2);
}

async function runDevUpdate(){
  const text = document.getElementById("devPrompt").value;
  if (!confirm("Rulez update direct prin backend și GitHub?")) return;
  const res = await runDirectUpdateFlow(text);
  document.getElementById("devReport").textContent = JSON.stringify(res,null,2);
}

function clearDevChat(){
  localStorage.removeItem(CHAT_KEY);
  pageAIDeveloper();
}

function pageInside(){
  content('<div class="card locked"><h3>Inside</h3><p>Acces intern restricționat. Funcțiile distructive sunt dezactivate.</p></div>');
}

async function pageDiagnostic(){
  content('<div class="card"><h3>Diagnostic</h3><pre id="diag">Se încarcă...</pre></div>');
  const h = await api("/api/health");
  let auth = {};
  try { auth = await api("/api/auth/status"); } catch {}
  document.getElementById("diag").textContent = JSON.stringify({site:SITE_URL,health:h,auth,profile:{industry,workType,active:activeProfile()},plan:state.plan,account:state.account,completion:completionScore()}, null, 2);
}

function pageUpdates(){
  content('<div class="card"><h3>Actualizări / Run Update</h3><p>Rulează update direct: prompt → propunere → aplicare GitHub → Render Auto-Deploy. Nu mai folosește ZIP manual.</p><input id="promptFiles" type="file" multiple><label>Prompt manual<textarea id="manualPrompt"></textarea></label><div class="actions"><button onclick="uploadPrompts()">Upload prompturi</button><button onclick="listPrompts()">Listă prompturi</button><button class="primary" onclick="runUpdate()">Run Update direct</button></div></div><div class="card"><h3>Log update</h3><pre id="updateLog"></pre></div>');
}

async function uploadPrompts(){
  const fd = new FormData();
  Array.from(document.getElementById("promptFiles").files).forEach(f => fd.append("files",f));
  const text = document.getElementById("manualPrompt").value;
  if (text.trim()) fd.append("text",text);
  const r = await fetch("/api/prompts/upload", {method:"POST", body:fd});
  document.getElementById("updateLog").textContent = JSON.stringify(await r.json(), null, 2);
}

async function listPrompts(){
  const res = await api("/api/prompts");
  document.getElementById("updateLog").textContent = JSON.stringify(res,null,2);
}

async function runUpdate(){
  const text = document.getElementById("manualPrompt").value;
  if (!confirm("Rulez update direct?")) return;
  const res = await runDirectUpdateFlow(text);
  state.updates.unshift({date:today(),ok:res.ok,id:res.id || "",mode:"direct"});
  saveState();
  document.getElementById("updateLog").textContent = JSON.stringify(res,null,2);
}

async function runDirectUpdateFlow(text){
  const generated = await api("/api/update/run", {method:"POST", body:JSON.stringify({text})});

  if (generated.githubApply && generated.githubApply.applied && generated.githubApply.applied.length) {
    return generated;
  }

  const files = generated.proposal && generated.proposal.files ? generated.proposal.files : [];

  if (!files.length) {
    return generated;
  }

  const applied = await api("/api/update/direct-apply", {
    method:"POST",
    body:JSON.stringify({
      files,
      message:"Direct Run Update from EPD frontend"
    })
  });

  return {ok:applied.ok, generated, directApply:applied};
}

function pageLaunch(){
  content('<div class="card"><h3>Construire / Lansare</h3><table class="table"><tr><td>Link public</td><td>' + location.origin + '</td></tr><tr><td>Repository</td><td>dragosserban95 / Energy-Project-Design</td></tr><tr><td>Auto-Deploy</td><td>Render Auto-Deploy</td></tr></table><div class="actions"><button onclick="pageDiagnostic()">Diagnostic</button><button onclick="openPage(\'Actualizări\')">Run Update</button></div></div>');
}

function pageGeneric(){
  content('<div class="card"><h3>' + esc(currentPage) + '</h3><p>Pagină pregătită operațional.</p></div>');
}