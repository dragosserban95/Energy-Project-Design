const SITE_URL = "https://energy-project-design-services.onrender.com";

let CONFIG = {};
let USER = null;
let currentPage = "Panou principal";
let industry = "Gaze naturale";
let workType = "Branșamente gaze naturale";

const STORAGE_KEY = "epd_global_rebuild_state_v2";
const CHAT_KEY = "epd_ai_developer_chat_v2";

const pages = [
  "Panou principal",
  "Date proiect",
  "Date tehnice",
  "Departamente",
  "Documentație",
  "Ștampile",
  "Email-uri",
  "Verificări",
  "Checklist",
  "Șabloane OSD",
  "Calcul",
  "Registru proiecte",
  "Import / Export",
  "Planuri și licențe",
  "Marketplace / Module",
  "Asistent utilizator",
  "AI Developer",
  "Inside",
  "Diagnostic",
  "Actualizări",
  "Construire / Lansare",
  "Contact",
  "Setări / Cont",
  "Loguri / Integritate"
];

const projectFields = [
  "beneficiar","adresa_lucrare","localitate","judet","telefon","email","osd","tip_lucrare","industrie",
  "numar_contract","data_contract","proiectant","executant","verificator_vgd","responsabil_rte","observatii"
];

const technicalFields = [
  "debit_instalat","presiune_regim","diametru_conducta","material_conducta","lungime_bransament",
  "punct_racordare","post_reglare","contor","categorie_consumator","traseu","observatii_tehnice"
];

const vgdFields = ["verificator_vgd","atestat_vgd","data_verificare_vgd","status_vgd","observatii_vgd"];
const rteFields = ["responsabil_rte","autorizatie_rte","data_verificare_rte","status_rte","observatii_rte"];

const calcFields = [
  "putere_instalata_kw","debit_calculat_mc_h","debit_recomandat_mc_h","contor_orientativ",
  "risc_presiune","estimare_materiale","estimare_cost","rezultat_calcul","observatii_calcul"
];

const departments = [
  "Proiectare","Execuție","Avize","VGD","RTE","Ofertare","Contabilitate","Societate","Developer","Inside"
];

const documentTemplates = [
  {
    id:"cerere_racordare",
    name:"Cerere racordare",
    department:"Proiectare",
    body:"Către <osd>,\n\nSubsemnatul/Subscrisa <beneficiar>, solicit racordarea la sistemul de distribuție gaze naturale pentru imobilul situat în <adresa_lucrare>, <localitate>, <judet>.\n\nTip lucrare: <tip_lucrare>.\nData: <data_document>\nProiectant: <proiectant>\n\n<stampila_proiectant>"
  },
  {
    id:"memoriu_tehnic",
    name:"Memoriu tehnic",
    department:"Proiectare",
    body:"MEMORIU TEHNIC\n\nBeneficiar: <beneficiar>\nAdresă lucrare: <adresa_lucrare>\nDebit instalat: <debit_instalat>\nPresiune regim: <presiune_regim>\nDiametru conductă: <diametru_conducta>\nMaterial conductă: <material_conducta>\nLungime branșament: <lungime_bransament>\nTraseu: <traseu>\nObservații: <observatii_tehnice>"
  },
  {
    id:"fisa_date_tehnice",
    name:"Fișă date tehnice",
    department:"Proiectare",
    body:"FIȘĂ DATE TEHNICE\nBeneficiar: <beneficiar>\nOSD: <osd>\nPunct racordare: <punct_racordare>\nPost reglare: <post_reglare>\nContor: <contor>\nCategorie consumator: <categorie_consumator>"
  },
  {
    id:"borderou",
    name:"Borderou documente",
    department:"Documentație",
    body:"BORDEROU DOCUMENTE\n\n1. Cerere racordare\n2. Memoriu tehnic\n3. Fișă date tehnice\n4. Verificare VGD\n5. Verificare RTE\n\nBeneficiar: <beneficiar>\nData: <data_document>"
  },
  {
    id:"vgd",
    name:"Document verificare VGD",
    department:"VGD",
    body:"DOCUMENT VERIFICARE VGD\n\nVerificator: <verificator_vgd>\nAtestat: <atestat_vgd>\nData verificare: <data_verificare_vgd>\nStatus: <status_vgd>\nObservații: <observatii_vgd>\n\n<stampila_vgd>"
  },
  {
    id:"rte",
    name:"Document verificare RTE",
    department:"RTE",
    body:"DOCUMENT VERIFICARE RTE\n\nResponsabil RTE: <responsabil_rte>\nAutorizație: <autorizatie_rte>\nData verificare: <data_verificare_rte>\nStatus: <status_rte>\nObservații: <observatii_rte>\n\n<stampila_rte>"
  },
  {
    id:"adresa_osd",
    name:"Adresă către OSD",
    department:"Avize",
    body:"Către <osd>,\n\nVă transmitem documentația pentru lucrarea <tip_lucrare>, beneficiar <beneficiar>, amplasament <adresa_lucrare>.\n\nCu stimă,\n<proiectant>"
  }
];

const emailTemplates = [
  {
    id:"ofertare",
    name:"Ofertare",
    subject:"Ofertă documentație gaze naturale - <beneficiar>",
    body:"Bună ziua,\n\nVă transmitem oferta pentru documentația tehnică aferentă lucrării <tip_lucrare> din <adresa_lucrare>.\n\nCu respect,\nEnergy Project Design Services"
  },
  {
    id:"date_lipsa",
    name:"Solicitare date lipsă",
    subject:"Date lipsă documentație - <beneficiar>",
    body:"Bună ziua,\n\nPentru finalizarea documentației sunt necesare completări: <observatii>.\n\nMulțumim."
  },
  {
    id:"osd",
    name:"Transmitere documentație OSD",
    subject:"Documentație branșament gaze naturale - <beneficiar>",
    body:"Către <osd>,\n\nVă transmitem documentația pentru lucrarea situată în <adresa_lucrare>.\n\nCu stimă,\n<proiectant>"
  },
  {
    id:"vgd",
    name:"Transmitere verificare VGD",
    subject:"Document verificat VGD - <beneficiar>",
    body:"Bună ziua,\n\nDocumentația a fost verificată VGD. Status: <status_vgd>.\nObservații: <observatii_vgd>"
  },
  {
    id:"rte",
    name:"Transmitere verificare RTE",
    subject:"Document RTE - <beneficiar>",
    body:"Bună ziua,\n\nDocumentația RTE are status: <status_rte>.\nObservații: <observatii_rte>"
  }
];

const defaultState = {
  project:{
    beneficiar:"",adresa_lucrare:"",localitate:"",judet:"",telefon:"",email:"",osd:"",
    tip_lucrare:"Branșamente gaze naturale",industrie:"Gaze naturale",numar_contract:"",
    data_contract:"",proiectant:"",executant:"",verificator_vgd:"",responsabil_rte:"",observatii:""
  },
  technical:{
    debit_instalat:"",presiune_regim:"",diametru_conducta:"",material_conducta:"",
    lungime_bransament:"",punct_racordare:"",post_reglare:"",contor:"",
    categorie_consumator:"",traseu:"",observatii_tehnice:""
  },
  vgd:{verificator_vgd:"",atestat_vgd:"",data_verificare_vgd:"",status_vgd:"neverificat",observatii_vgd:""},
  rte:{responsabil_rte:"",autorizatie_rte:"",data_verificare_rte:"",status_rte:"neverificat",observatii_rte:""},
  calcul:{
    putere_instalata_kw:"",debit_calculat_mc_h:"",debit_recomandat_mc_h:"",
    contor_orientativ:"",risc_presiune:"",estimare_materiale:"",
    estimare_cost:"",rezultat_calcul:"",observatii_calcul:""
  },
  stamps:[],
  documents:[],
  emails:[],
  projects:[],
  imports:[],
  logs:[],
  plan:{plan:"Free",status:"activ",activatedAt:new Date().toISOString().slice(0,10),expiresAt:"",exportAllowed:false},
  planRules:{Free:false,Trial:false,Basic:false,Expired:false,Developer:true,Inside:true},
  updates:[]
};

let state = loadState();

function loadState(){
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return deepMerge(structuredClone(defaultState), stored);
  } catch {
    return structuredClone(defaultState);
  }
}

function deepMerge(a,b){
  for (const k in b) {
    if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k])) {
      a[k] = deepMerge(a[k] || {}, b[k]);
    } else {
      a[k] = b[k];
    }
  }
  return a;
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function esc(v){
  const map = {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
  return String(v ?? "").replace(/[&<>"']/g, function(c){ return map[c] || c; });
}

function today(){
  return new Date().toISOString().slice(0,10);
}

function toast(msg){
  const t = document.getElementById("toast");
  if (!t) return alert(msg);
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(function(){ t.classList.add("hidden"); }, 3000);
}

async function api(url, opts){
  const options = opts || {};
  const r = await fetch(url, { headers:{"Content-Type":"application/json"}, ...options });
  const txt = await r.text();
  try { return JSON.parse(txt); }
  catch { return { ok:r.ok, raw:txt }; }
}

function logAction(type, message){
  state.logs.unshift({type:type, message:message, date:new Date().toISOString()});
  saveState();
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
  checkLoginHealth();
  applyGoogleUser();
}
boot();

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
  const res = await api("/api/login", {method:"POST", body:JSON.stringify({user:user,password:password})});
  if (!res.ok) return alert("Login incorect sau backend indisponibil.");
  USER = res.user || {name:user,role:"Developer",plan:"Developer"};
  if (String(USER.role || "").toLowerCase().includes("developer")) {
    state.plan.plan = "Developer";
    state.plan.exportAllowed = true;
  }
  saveState();
  enterApp();
}

function enterApp(){
  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  buildNav();
  openPage("Panou principal");
}

function applyGoogleUser(){
  try {
    const raw = localStorage.getItem("epd_google_user");
    if (!raw) return;
    const googleUser = JSON.parse(raw);
    if (!googleUser || !googleUser.email) return;
    USER = {
      name: googleUser.name || googleUser.email,
      email: googleUser.email,
      role: googleUser.role || "User",
      plan: googleUser.plan || "Free",
      provider: "google"
    };
    state.plan.plan = USER.plan || "Free";
    state.plan.status = "activ";
    saveState();
    enterApp();
  } catch {}
}

function showRegister(){
  const el = document.getElementById("authBox");
  el.classList.remove("hidden");
  el.innerHTML = '<h3>Cont nou</h3><p class="muted">Interfață pregătită pentru PostgreSQL + AUTH_REGISTER_ENABLED.</p><input placeholder="Email"><input placeholder="Parolă" type="password"><button onclick="toast(\'Register pregătit pentru backend.\')">Creează cont</button>';
}

function showForgot(){
  const el = document.getElementById("authBox");
  el.classList.remove("hidden");
  el.innerHTML = '<h3>Recuperare parolă</h3><p class="muted">Interfață pregătită pentru SMTP + AUTH_FORGOT_ENABLED.</p><input placeholder="Email"><button onclick="toast(\'Forgot password pregătit pentru SMTP.\')">Trimite link resetare</button>';
}

function googleLogin(){
  window.location.href = "/api/auth/google";
}

function fillProfile(){
  const industries = ["Gaze naturale","Energie electrică","Apă-canal","Telecom / fibră optică","Fotovoltaice","Construcții","Infrastructură feroviară"];
  const works = ["Branșamente gaze naturale","Extindere de conductă gaze naturale","Instalații de utilizare gaze naturale","Modernizări conducte gaze naturale","Studii de fezabilitate gaze naturale"];

  document.getElementById("industry").innerHTML = industries.map(function(x){ return '<option ' + (x===industry ? "selected" : "") + '>' + esc(x) + '</option>'; }).join("");
  document.getElementById("workType").innerHTML = works.map(function(x){ return '<option ' + (x===workType ? "selected" : "") + '>' + esc(x) + '</option>'; }).join("");
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
  document.getElementById("nav").innerHTML = pages.map(function(p){
    return '<button class="nav" onclick="openPage(\'' + p.replace(/'/g,"\\'") + '\')">' + esc(p) + '</button>';
  }).join("");
}

function setTitle(t, sub){
  document.getElementById("pageTitle").textContent = t;
  document.getElementById("pageSub").textContent = sub || (activeProfile() ? "Profil activ" : "Profil vizibil, blocat până la configurare");
  document.querySelectorAll(".nav").forEach(function(b){ b.classList.toggle("active", b.textContent === t); });
}

function content(html){
  document.getElementById("content").innerHTML = html;
}

function openPage(p){
  currentPage = p;
  setTitle(p);
  refreshPills();

  const map = {
    "Panou principal": dashboardPage,
    "Date proiect": projectPage,
    "Date tehnice": technicalPage,
    "Departamente": departmentsPage,
    "Documentație": documentsPage,
    "Ștampile": stampsPage,
    "Email-uri": emailsPage,
    "Verificări": verificationPage,
    "Checklist": checklistPage,
    "Șabloane OSD": osdPage,
    "Calcul": calcPage,
    "Registru proiecte": registryPage,
    "Import / Export": importExportPage,
    "Planuri și licențe": plansPage,
    "Marketplace / Module": marketplacePage,
    "Asistent utilizator": userAssistantPage,
    "AI Developer": aiDeveloperPage,
    "Inside": insidePage,
    "Diagnostic": diagnosticPage,
    "Actualizări": updatesPage,
    "Construire / Lansare": launchPage,
    "Contact": contactPage,
    "Setări / Cont": settingsPage,
    "Loguri / Integritate": logsPage
  };

  if (map[p]) map[p]();
  else genericPage();
}

function label(k){
  return k.replaceAll("_"," ").replace(/\b\w/g, function(c){ return c.toUpperCase(); });
}

function inputFor(group,k){
  const value = state[group][k] || "";
  if (k.includes("observatii") || k === "traseu") {
    return '<textarea onchange="setField(\'' + group + '\',\'' + k + '\',this.value)">' + esc(value) + '</textarea>';
  }
  if (k.includes("data")) {
    return '<input type="date" value="' + esc(value) + '" onchange="setField(\'' + group + '\',\'' + k + '\',this.value)">';
  }
  if (k.includes("status")) {
    const opts = ["neverificat","în lucru","admis","respins","activ","expirat"];
    return '<select onchange="setField(\'' + group + '\',\'' + k + '\',this.value)">' + opts.map(function(x){
      return '<option ' + (x===value ? "selected" : "") + '>' + esc(x) + '</option>';
    }).join("") + '</select>';
  }
  return '<input value="' + esc(value) + '" onchange="setField(\'' + group + '\',\'' + k + '\',this.value)">';
}

function form(group, fields){
  return '<div class="grid">' + fields.map(function(k){
    return '<label>' + label(k) + inputFor(group,k) + '</label>';
  }).join("") + '</div>';
}

function setField(group,k,v){
  state[group][k] = v;
  saveState();
}

function chips(fields){
  return fields.map(function(x){ return '<span class="placeholder">&lt;' + esc(x) + '&gt;</span>'; }).join("");
}

function allValues(){
  function stampFor(role){
    const s = state.stamps.find(function(x){ return x.role === role; });
    return s ? "[Ștampilă " + role + ": " + s.name + "]" : "[Ștampilă " + role + " lipsă]";
  }
  return {
    ...state.project,
    ...state.technical,
    ...state.vgd,
    ...state.rte,
    ...state.calcul,
    data_document: today(),
    numar_document: "AUTO",
    revizie: "0",
    stampila_proiectant: stampFor("proiectant"),
    stampila_vgd: stampFor("vgd"),
    stampila_rte: stampFor("rte")
  };
}

function renderTemplate(text){
  const v = allValues();
  return String(text || "").replace(/<([a-zA-Z0-9_ăîâșțĂÎÂȘȚ]+)>/g, function(m,k){ return v[k] || m; });
}

function completion(){
  const required = ["beneficiar","adresa_lucrare","localitate","judet","osd","proiectant","debit_instalat","presiune_regim","diametru_conducta"];
  const ok = required.filter(function(k){ return state.project[k] || state.technical[k]; }).length;
  return Math.round(ok / required.length * 100);
}

function dashboardPage(){
  content('<div class="grid3">' +
    '<div class="card"><h3>Profil</h3><b>' + esc(industry) + ' / ' + esc(workType) + '</b><p>' + (activeProfile() ? "Activ" : "Blocat contextual") + '</p></div>' +
    '<div class="card"><h3>Plan</h3><b>' + esc(state.plan.plan) + '</b><p>Export: ' + (canExport() ? "permis" : "blocat") + '</p></div>' +
    '<div class="card"><h3>Completare</h3><b>' + completion() + '%</b><p>Grad completare proiect.</p></div>' +
  '</div>' +
  '<div class="card"><h3>Flux principal</h3><p>Date proiect → Date tehnice → Calcul → Documentație → Ștampile → Verificări VGD/RTE → Email-uri → Export.</p>' +
  '<div class="row"><button onclick="openPage(\'Date proiect\')">Date proiect</button><button onclick="openPage(\'Date tehnice\')">Date tehnice</button><button onclick="openPage(\'Documentație\')">Documentație</button><button onclick="openPage(\'Verificări\')">VGD/RTE</button></div></div>');
}

function projectPage(){
  content('<div class="card"><h3>Date proiect</h3>' + form("project",projectFields) +
  '<div class="row"><button class="primary" onclick="saveProject()">Salvează proiect</button><button onclick="openPage(\'Date tehnice\')">Continuă</button></div></div>' +
  '<div class="card"><h3>Placeholder-e proiect</h3>' + chips(projectFields) + '</div>');
}

function saveProject(){
  state.projects.unshift({id:Date.now(), name:state.project.beneficiar || "Proiect fără nume", date:today(), status:completion()+"%"});
  logAction("proiect","Proiect salvat");
  saveState();
  toast("Proiect salvat.");
}

function technicalPage(){
  content('<div class="card"><h3>Date tehnice</h3>' + form("technical",technicalFields) +
  '<div class="row"><button class="primary" onclick="saveState();toast(\'Date tehnice salvate\')">Salvează</button><button onclick="openPage(\'Calcul\')">Calculează</button></div></div>' +
  '<div class="card"><h3>Placeholder-e tehnice</h3>' + chips(technicalFields) + '</div>');
}

function departmentsPage(){
  content('<div class="grid3">' + departments.map(function(d){
    return '<div class="card"><h3>' + esc(d) + '</h3><p>Flux pregătit pentru rolul ' + esc(d) + '.</p><button onclick="toast(\'Departament selectat\')">Selectează</button></div>';
  }).join("") + '</div>');
}

function documentsPage(){
  const opts = documentTemplates.map(function(t){ return '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>'; }).join("");
  content('<div class="card"><h3>Motor documente</h3>' +
    '<div class="grid"><label>Tip document<select id="docTpl" onchange="loadDocTemplate()">' + opts + '</select></label><label>Titlu document<input id="docTitle"></label></div>' +
    '<label>Editor document<textarea id="docEditor"></textarea></label>' +
    '<div class="row"><button onclick="loadDocTemplate()">Încarcă șablon</button><button class="primary" onclick="previewDoc()">Previzualizare</button><button onclick="saveDoc()">Salvează document</button><button onclick="exportProject()">Export</button></div>' +
  '</div><div class="card"><h3>Previzualizare</h3><pre id="docPreview"></pre></div><div class="card"><h3>Documente salvate</h3>' + documentsTable() + '</div>');
  loadDocTemplate();
}

function loadDocTemplate(){
  const el = document.getElementById("docTpl");
  if (!el) return;
  const t = documentTemplates.find(function(x){ return x.id === el.value; }) || documentTemplates[0];
  document.getElementById("docTitle").value = t.name;
  document.getElementById("docEditor").value = t.body;
}

function previewDoc(){
  const out = renderTemplate(document.getElementById("docEditor").value);
  document.getElementById("docPreview").textContent = out;
}

function saveDoc(){
  previewDoc();
  state.documents.unshift({
    id:Date.now(),
    title:document.getElementById("docTitle").value,
    body:document.getElementById("docPreview").textContent,
    date:today()
  });
  logAction("document","Document generat");
  saveState();
  documentsPage();
}

function documentsTable(){
  if (!state.documents.length) return '<p class="muted">Nu există documente salvate.</p>';
  return '<table class="table"><tr><th>Titlu</th><th>Data</th></tr>' + state.documents.map(function(d){
    return '<tr><td>' + esc(d.title) + '</td><td>' + esc(d.date) + '</td></tr>';
  }).join("") + '</table>';
}

function stampsPage(){
  content('<div class="card"><h3>Ștampile</h3><div class="grid3">' +
    ["proiectant","vgd","rte"].map(function(r){
      return '<div class="card"><h3>' + r.toUpperCase() + '</h3><input type="file" id="stamp_' + r + '"><button onclick="addStamp(\'' + r + '\')">Încarcă / mapează</button></div>';
    }).join("") +
  '</div></div><div class="card"><h3>Ștampile mapate</h3>' + stampsTable() + '</div>');
}

function addStamp(role){
  const f = document.getElementById("stamp_"+role).files[0];
  state.stamps = state.stamps.filter(function(x){ return x.role !== role; });
  state.stamps.push({role:role, name:f ? f.name : "ștampilă "+role, date:today()});
  logAction("stampila","Ștampilă mapată pentru "+role);
  saveState();
  stampsPage();
}

function stampsTable(){
  if (!state.stamps.length) return '<p class="muted">Nu există ștampile mapate.</p>';
  return '<table class="table"><tr><th>Rol</th><th>Nume</th><th>Placeholder</th></tr>' + state.stamps.map(function(s){
    return '<tr><td>' + esc(s.role) + '</td><td>' + esc(s.name) + '</td><td>&lt;stampila_' + esc(s.role) + '&gt;</td></tr>';
  }).join("") + '</table>';
}

function emailsPage(){
  const opts = emailTemplates.map(function(t){ return '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>'; }).join("");
  content('<div class="card"><h3>Email-uri</h3>' +
    '<div class="grid"><label>Template<select id="emailTpl" onchange="loadEmailTemplate()">' + opts + '</select></label><label>Destinatar<input id="emailTo" value="' + esc(state.project.email) + '"></label></div>' +
    '<label>Subiect<input id="emailSubject"></label><label>Conținut<textarea id="emailBody"></textarea></label>' +
    '<div class="row"><button onclick="loadEmailTemplate()">Încarcă template</button><button class="primary" onclick="prepareEmail()">Pregătește email</button></div>' +
  '</div><div class="card"><h3>Previzualizare</h3><pre id="emailPreview"></pre></div>');
  loadEmailTemplate();
}

function loadEmailTemplate(){
  const t = emailTemplates.find(function(x){ return x.id === document.getElementById("emailTpl").value; }) || emailTemplates[0];
  document.getElementById("emailSubject").value = renderTemplate(t.subject);
  document.getElementById("emailBody").value = renderTemplate(t.body);
}

function prepareEmail(){
  const out = "Către: " + document.getElementById("emailTo").value + "\nSubiect: " + document.getElementById("emailSubject").value + "\n\n" + document.getElementById("emailBody").value;
  document.getElementById("emailPreview").textContent = out;
  state.emails.unshift({id:Date.now(), to:document.getElementById("emailTo").value, subject:document.getElementById("emailSubject").value, date:today()});
  logAction("email","Email pregătit");
  saveState();
}

function verificationPage(){
  content('<div class="grid">' +
    '<div class="card"><h3>Verificare VGD</h3>' + form("vgd",vgdFields) + '<div class="row"><button onclick="authorizeRole(\'vgd\')">Autorizează VGD</button><button onclick="generateRoleDoc(\'vgd\')">Generează document VGD</button></div></div>' +
    '<div class="card"><h3>Verificare RTE</h3>' + form("rte",rteFields) + '<div class="row"><button onclick="authorizeRole(\'rte\')">Autorizează RTE</button><button onclick="generateRoleDoc(\'rte\')">Generează document RTE</button></div></div>' +
  '</div><div class="card"><h3>Validare proiect</h3>' + validationReport() + '</div>');
}

function authorizeRole(role){
  state[role]["status_"+role] = "admis";
  logAction("verificare","Autorizare "+role.toUpperCase());
  saveState();
  verificationPage();
}

function generateRoleDoc(role){
  const t = documentTemplates.find(function(x){ return x.id === role; });
  state.documents.unshift({id:Date.now(), title:t.name, body:renderTemplate(t.body), date:today()});
  logAction("document","Document "+role.toUpperCase()+" generat");
  saveState();
  toast("Document generat în Documentație.");
}

function validationReport(){
  const missing = [];
  ["beneficiar","adresa_lucrare","localitate","judet","osd","proiectant"].forEach(function(k){ if (!state.project[k]) missing.push(k); });
  ["debit_instalat","presiune_regim","diametru_conducta"].forEach(function(k){ if (!state.technical[k]) missing.push(k); });
  if (missing.length) return '<p class="bad">Lipsesc date obligatorii:</p>' + chips(missing);
  return '<p class="ok">Nu există erori critice în datele principale.</p>';
}

function checklistPage(){
  const rows = [
    ["Date proiect", Boolean(state.project.beneficiar)],
    ["Date tehnice", Boolean(state.technical.debit_instalat)],
    ["Calcul", Boolean(state.calcul.rezultat_calcul)],
    ["Documente", state.documents.length > 0],
    ["Ștampile", state.stamps.length > 0],
    ["VGD", state.vgd.status_vgd === "admis"],
    ["RTE", state.rte.status_rte === "admis"],
    ["Email", state.emails.length > 0],
    ["Export", canExport()]
  ];
  content('<div class="card"><h3>Checklist proiect</h3><table class="table"><tr><th>Element</th><th>Status</th></tr>' + rows.map(function(r){
    return '<tr><td>' + esc(r[0]) + '</td><td class="' + (r[1] ? "ok" : "bad") + '">' + (r[1] ? "Complet" : "Lipsă / blocat") + '</td></tr>';
  }).join("") + '</table></div>');
}

function osdPage(){
  content('<div class="card"><h3>Șabloane OSD</h3><p>Bibliotecă OSD pentru branșamente gaze naturale.</p>' +
  '<div class="grid"><label>Operator<select onchange="state.project.osd=this.value;saveState()"><option>Distrigaz Sud Rețele</option><option>Delgaz Grid</option><option>Premier Energy</option><option>Alt OSD</option></select></label><label>Tip document<select><option>Cerere</option><option>Memoriu</option><option>Fișă tehnică</option><option>Adresă OSD</option></select></label></div>' +
  '<div class="row"><button onclick="toast(\'Șablon OSD pregătit.\')">Adaugă șablon</button><button onclick="openPage(\'Documentație\')">Generează documente</button></div></div>');
}

function calcPage(){
  content('<div class="card"><h3>Calcul tehnic</h3>' + form("calcul",calcFields) +
  '<div class="row"><button class="primary" onclick="runCalc()">Calculează automat</button><button onclick="openPage(\'Documentație\')">Trimite către documente</button></div></div>');
}

function runCalc(){
  const debit = Number(String(state.technical.debit_instalat || "0").replace(",","."));
  const lungime = Number(String(state.technical.lungime_bransament || "0").replace(",","."));
  const putere = debit * 10.6;
  state.calcul.putere_instalata_kw = putere ? putere.toFixed(2) : "";
  state.calcul.debit_calculat_mc_h = debit ? debit.toFixed(2) : "";
  state.calcul.debit_recomandat_mc_h = debit ? (debit * 1.1).toFixed(2) : "";
  state.calcul.risc_presiune = lungime > 30 ? "verificare necesară" : "normal";
  state.calcul.estimare_materiale = lungime ? "Țeavă/materiale pentru aproximativ " + lungime + " m" : "";
  state.calcul.estimare_cost = lungime ? (lungime * 120).toFixed(0) + " RON estimativ" : "";
  state.calcul.rezultat_calcul = "Calcul orientativ generat.";
  logAction("calcul","Calcul tehnic generat");
  saveState();
  calcPage();
}

function registryPage(){
  content('<div class="card"><h3>Registru proiecte</h3>' + (state.projects.length ? '<table class="table"><tr><th>Proiect</th><th>Data</th><th>Status</th></tr>' + state.projects.map(function(p){
    return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.date) + '</td><td>' + esc(p.status) + '</td></tr>';
  }).join("") + '</table>' : '<p class="muted">Nu există proiecte salvate.</p>') + '</div>');
}

function importExportPage(){
  content('<div class="card"><h3>Import / Export</h3><textarea id="importBox" placeholder="Lipește JSON proiect"></textarea><div class="row"><button onclick="importProject()">Import JSON</button><button class="primary" onclick="exportProject()">Export proiect</button></div><p class="' + (canExport() ? "ok" : "bad") + '">Export: ' + (canExport() ? "permis" : "blocat pentru planul curent") + '</p></div>');
}

function importProject(){
  try {
    const obj = JSON.parse(document.getElementById("importBox").value);
    state = deepMerge(state, obj);
    saveState();
    logAction("import","Import JSON aplicat");
    toast("Import aplicat.");
  } catch {
    alert("JSON invalid.");
  }
}

function exportProject(){
  if (!canExport()) return alert("Export blocat pentru Free/Trial/Basic/Expired. Disponibil pentru Developer.");
  const blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "epd_project_export.json";
  a.click();
  logAction("export","Export proiect");
}

function plansPage(){
  const plans = ["Free","Trial","Basic","Developer","Inside"];
  const rows = plans.map(function(p){
    return '<tr><td>' + p + '</td><td>' + (state.planRules[p] ? "Da" : "Nu") + '</td><td><button onclick="setPlan(\'' + p + '\')">Setează</button></td></tr>';
  }).join("");
  content('<div class="card"><h3>Planuri și licențe</h3><table class="table"><tr><th>Plan</th><th>Export</th><th>Acțiune</th></tr>' + rows + '</table><pre>' + esc(JSON.stringify(state.plan,null,2)) + '</pre></div>');
}

function setPlan(p){
  state.plan.plan = p;
  state.plan.status = "activ";
  state.plan.exportAllowed = Boolean(state.planRules[p]);
  logAction("plan","Plan setat: "+p);
  saveState();
  plansPage();
  refreshPills();
}

function marketplacePage(){
  const mods = ["OSD Templates Pro","VGD/RTE Pro","Import OCR","Planuri/Scheme","Marketplace șabloane","Document Engine Pro","Email Engine","Calcul avansat"];
  content('<div class="grid3">' + mods.map(function(m){
    return '<div class="card locked"><h3>' + esc(m) + '</h3><p>Modul pregătit pentru activare Developer/Service.</p><button onclick="toast(\'Modul pregătit\')">Detalii</button></div>';
  }).join("") + '</div>');
}

function userAssistantPage(){
  content('<div class="card"><h3>Asistent utilizator</h3><div id="userChat" class="chat"><div class="msg ai">Întreabă despre documente, câmpuri, VGD/RTE, ștampile, emailuri sau export.</div></div><textarea id="userAsk" placeholder="Întrebarea ta..."></textarea><button class="primary" onclick="askUserAssistant()">Întreabă</button></div>');
}

function askUserAssistant(){
  const q = document.getElementById("userAsk").value;
  const a = localHelp(q);
  document.getElementById("userChat").innerHTML += '<div class="msg user">' + esc(q) + '</div><div class="msg ai">' + esc(a) + '</div>';
}

function localHelp(q){
  q = String(q || "").toLowerCase();
  if (q.includes("export")) return "Exportul este blocat pentru Free/Trial/Basic și permis pentru Developer.";
  if (q.includes("vgd")) return "Verificarea VGD se completează în pagina Verificări.";
  if (q.includes("rte")) return "RTE se completează în pagina Verificări.";
  if (q.includes("ștampil") || q.includes("stamp")) return "Ștampilele se mapează în pagina Ștampile și apar ca placeholder-e.";
  if (q.includes("document")) return "Documentele se generează în Documentație după completarea datelor.";
  return "Completează paginile în ordinea fluxului principal din Panou principal.";
}

function aiDeveloperPage(){
  const hist = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
  content('<div class="card"><h3>AI Developer — Chat</h3><div id="devChat" class="chat">' + (hist.map(function(m){
    return '<div class="msg ' + esc(m.role) + '">' + esc(m.text) + '</div>';
  }).join("") || '<div class="msg ai">Scrie comanda pentru update.</div>') + '</div><textarea id="devPrompt" placeholder="Comandă update..."></textarea><div class="row"><button class="primary" onclick="devSend()">Trimite</button><button onclick="devAnalyze()">Analiză</button><button onclick="devRunUpdate()">Run Update</button></div></div><div class="card"><h3>Raport AI Developer</h3><pre id="devReport"></pre></div>');
}

function devPush(role,text){
  const h = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
  h.push({role:role,text:text,date:new Date().toISOString()});
  localStorage.setItem(CHAT_KEY, JSON.stringify(h));
}

function devSend(){
  const p = document.getElementById("devPrompt").value;
  if (!p) return;
  devPush("user",p);
  devPush("ai","Comandă primită. Folosește Analiză sau Run Update.");
  aiDeveloperPage();
}

async function devAnalyze(){
  const text = document.getElementById("devPrompt").value;
  const res = await api("/api/ai-developer/analyze", {method:"POST", body:JSON.stringify({text:text})});
  document.getElementById("devReport").textContent = JSON.stringify(res,null,2);
}

async function devRunUpdate(){
  const text = document.getElementById("devPrompt").value;
  if (!confirm("Rulez update prin backend?")) return;
  const res = await api("/api/update/run", {method:"POST", body:JSON.stringify({text:text})});
  document.getElementById("devReport").textContent = JSON.stringify(res,null,2);
}

function insidePage(){
  content('<div class="card locked"><h3>Inside</h3><p>Acces intern restricționat. Funcții sensibile blocate fără confirmări suplimentare.</p></div>');
}

async function diagnosticPage(){
  content('<div class="card"><h3>Diagnostic</h3><pre id="diag">Se încarcă...</pre></div>');
  const h = await api("/api/health");
  const report = {
    site:SITE_URL,
    health:h,
    plan:state.plan,
    exportAllowed:canExport(),
    completion:completion(),
    documents:state.documents.length,
    stamps:state.stamps.length,
    emails:state.emails.length
  };
  document.getElementById("diag").textContent = JSON.stringify(report,null,2);
}

function updatesPage(){
  content('<div class="card"><h3>Actualizări / Run Update</h3><input id="promptFiles" type="file" multiple><textarea id="manualPrompt" placeholder="Prompt manual pentru update..."></textarea><div class="row"><button onclick="uploadPrompts()">Upload prompturi</button><button onclick="listPrompts()">Listă prompturi</button><button class="primary" onclick="runUpdate()">Run Update</button></div></div><div class="card"><h3>Log update</h3><pre id="updateLog"></pre></div>');
}

async function uploadPrompts(){
  const fd = new FormData();
  Array.from(document.getElementById("promptFiles").files).forEach(function(f){ fd.append("files",f); });
  const txt = document.getElementById("manualPrompt").value;
  if (txt) fd.append("text",txt);
  const r = await fetch("/api/prompts/upload", {method:"POST", body:fd});
  document.getElementById("updateLog").textContent = JSON.stringify(await r.json(),null,2);
}

async function listPrompts(){
  document.getElementById("updateLog").textContent = JSON.stringify(await api("/api/prompts"),null,2);
}

async function runUpdate(){
  const text = document.getElementById("manualPrompt").value;
  const res = await api("/api/update/run", {method:"POST", body:JSON.stringify({text:text})});
  document.getElementById("updateLog").textContent = JSON.stringify(res,null,2);
}

function launchPage(){
  content('<div class="card"><h3>Construire / Lansare</h3><table class="table"><tr><td>Site</td><td>' + SITE_URL + '</td></tr><tr><td>Repository</td><td>dragosserban95/Energy-Project-Design</td></tr><tr><td>Auto-Deploy</td><td>ON în Render</td></tr></table></div>');
}

function contactPage(){
  content('<div class="card"><h3>Contact</h3><p>Energy Project Design Services</p><p>Email configurabil prin SMTP_FROM.</p></div>');
}

function settingsPage(){
  content('<div class="card"><h3>Setări / Cont</h3><pre>' + esc(JSON.stringify({user:USER, plan:state.plan},null,2)) + '</pre><button onclick="localStorage.removeItem(\'epd_google_user\');location.reload()">Logout local</button></div>');
}

function logsPage(){
  content('<div class="card"><h3>Loguri / Integritate</h3>' + (state.logs.length ? '<table class="table"><tr><th>Tip</th><th>Mesaj</th><th>Data</th></tr>' + state.logs.map(function(l){
    return '<tr><td>' + esc(l.type) + '</td><td>' + esc(l.message) + '</td><td>' + esc(l.date) + '</td></tr>';
  }).join("") + '</table>' : '<p class="muted">Nu există loguri locale.</p>') + '</div>');
}

function genericPage(){
  content('<div class="card"><h3>' + esc(currentPage) + '</h3><p>Pagină pregătită operațional.</p></div>');
}
