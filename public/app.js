(function(){
  "use strict";

  const BUILD = "EPD V4.5 Intelligent Full App";
  const BUILD_DATE = new Date().toISOString().slice(0,10);
  const STORE = "epd_v45_full_state";

  const plans = [
    {id:"basic_99",name:"Basic",department:"Introducere date",price:99,period:"lună",currency:"EUR",exportAllowed:false,features:["Date proiect","Date tehnice basic","Previzualizare document","Asistent utilizator"]},
    {id:"projectant_149",name:"Proiectant",department:"Proiectare",price:149,period:"lună",currency:"EUR",exportAllowed:true,features:["Date proiect","Date tehnice","Calcul tehnic","Generare documente","Placeholder replacement","Ștampilă proiectant","Email-uri","Export"]},
    {id:"executant_149",name:"Executant",department:"Execuție",price:149,period:"lună",currency:"EUR",exportAllowed:true,features:["Date tehnice","Checklist execuție","Documente","Ștampilă executant","Registru proiecte"]},
    {id:"avize_129",name:"Avize",department:"Avize / OSD",price:129,period:"lună",currency:"EUR",exportAllowed:true,features:["Șabloane OSD","Adresă OSD","Email OSD","Verificare documentație"]},
    {id:"ofertare_119",name:"Ofertare",department:"Ofertare",price:119,period:"lună",currency:"EUR",exportAllowed:true,features:["Ofertă client","Estimare cost","Email client","Purchase intent"]},
    {id:"contabilitate_119",name:"Contabilitate",department:"Contabilitate",price:119,period:"lună",currency:"EUR",exportAllowed:false,features:["Date client","Contracte","Purchase intent","Facturare ready"]},
    {id:"vgd_199",name:"VGD",department:"Verificator documentație",price:199,period:"lună",currency:"EUR",exportAllowed:true,features:["Verificare VGD","Ștampilă VGD","Certificare internă","Autorizare document","Export"]},
    {id:"rte_199",name:"RTE",department:"Responsabil tehnic execuție",price:199,period:"lună",currency:"EUR",exportAllowed:true,features:["Verificare RTE","Ștampilă RTE","Certificare internă","Carte tehnică ready","Export"]},
    {id:"societate_399",name:"Societate",department:"Societate completă",price:399,period:"lună",currency:"EUR",exportAllowed:true,features:["Toate departamentele","Toate documentele","Toate ștampilele","Email-uri","Semnături","Audit","Purchasing"]},
    {id:"developer_lifetime",name:"Developer",department:"Developer intern",price:0,period:"intern",currency:"EUR",exportAllowed:true,features:["AI Developer","Self Update","Audit complet","Patch plan","Placeholders","Toate funcțiile"]}
  ];

  const templates = [
    {
      id:"cerere_racordare",
      name:"Cerere racordare",
      category:"OSD",
      body:"CERERE RACORDARE\n\nBeneficiar: <beneficiar>\nAdresă lucrare: <adresa_lucrare>, <localitate>, <judet>\nTelefon: <telefon>\nEmail: <email>\nOSD: <osd>\nTip lucrare: <tip_lucrare>\nContract: <numar_contract> / <data_contract>\n\nDebit instalat: <debit_instalat> mc/h\nPresiune regim: <presiune_regim>\n\nData document: <data_document>\nProiectant: <proiectant>\n\n<stampila_proiectant>"
    },
    {
      id:"memoriu_tehnic",
      name:"Memoriu tehnic",
      category:"Documentație",
      body:"MEMORIU TEHNIC\n\nLucrare: <tip_lucrare>\nBeneficiar: <beneficiar>\nAmplasament: <adresa_lucrare>, <localitate>, <judet>\nOperator distribuție: <osd>\n\nDate tehnice:\n- Debit instalat: <debit_instalat> mc/h\n- Debit recomandat: <debit_recomandat_mc_h> mc/h\n- Presiune regim: <presiune_regim>\n- Material conductă: <material_conducta>\n- Diametru: <diametru_conducta>\n- Lungime branșament: <lungime_bransament> m\n- Punct racordare: <punct_racordare>\n- Contor orientativ: <contor_orientativ>\n- Risc presiune: <risc_presiune>\n- Estimare cost: <estimare_cost>\n\nRezultat calcul:\n<rezultat_calcul>\n\n<stampila_proiectant>\n<stampila_vgd>\n<stampila_rte>"
    },
    {
      id:"fisa_date_tehnice",
      name:"Fișă date tehnice",
      category:"Date tehnice",
      body:"FIȘĂ DATE TEHNICE\n\nBeneficiar: <beneficiar>\nDebit instalat: <debit_instalat>\nDebit calculat: <debit_calculat_mc_h>\nDebit recomandat: <debit_recomandat_mc_h>\nPutere instalată estimată: <putere_instalata_kw>\nPresiune: <presiune_regim>\nDiametru conductă: <diametru_conducta>\nMaterial: <material_conducta>\nLungime: <lungime_bransament>\nContor orientativ: <contor_orientativ>\nRisc presiune: <risc_presiune>\nEstimare materiale: <estimare_materiale>\nEstimare cost: <estimare_cost>"
    },
    {
      id:"adresa_osd",
      name:"Adresă către OSD",
      category:"Email / OSD",
      body:"Către: <osd>\n\nVă transmitem documentația aferentă lucrării pentru beneficiarul <beneficiar>, amplasată în <adresa_lucrare>, <localitate>, <judet>.\n\nTip lucrare: <tip_lucrare>\nDebit instalat: <debit_instalat> mc/h\n\nCu stimă,\n<proiectant>\n<stampila_proiectant>"
    },
    {
      id:"certificare_vgd",
      name:"Certificare VGD",
      category:"Semnături",
      body:"CERTIFICARE INTERNĂ VGD\n\nVerificator: <verificator_vgd>\nAtestat: <atestat_vgd>\nStatus: <status_vgd>\nData: <data_document>\nObservații: <observatii_vgd>\n\n<stampila_vgd>\nSemnătură internă: <semnatura_vgd>"
    },
    {
      id:"certificare_rte",
      name:"Certificare RTE",
      category:"Semnături",
      body:"CERTIFICARE INTERNĂ RTE\n\nResponsabil RTE: <responsabil_rte>\nAutorizație: <autorizatie_rte>\nStatus: <status_rte>\nData: <data_document>\nObservații: <observatii_rte>\n\n<stampila_rte>\nSemnătură internă: <semnatura_rte>"
    },
    {
      id:"borderou_documente",
      name:"Borderou documente",
      category:"Documentație",
      body:"BORDEROU DOCUMENTE\n\nBeneficiar: <beneficiar>\nLucrare: <tip_lucrare>\nAmplasament: <adresa_lucrare>, <localitate>, <judet>\n\nDocumente generate:\n- Cerere racordare\n- Memoriu tehnic\n- Fișă date tehnice\n- Adresă OSD\n- Certificări VGD/RTE\n\nStatus documentație: <status_documentatie>\nRaport verificare: <raport_verificare>"
    }
  ];

  const emailTemplates = [
    {
      id:"ofertare_client",
      name:"Ofertare client",
      subject:"Ofertă documentație EPD - <beneficiar>",
      body:"Bună ziua,\n\nVă transmitem oferta pentru lucrarea <tip_lucrare>, amplasată la <adresa_lucrare>, <localitate>.\n\nCu stimă,\n<proiectant>"
    },
    {
      id:"date_lipsa",
      name:"Solicitare date lipsă",
      subject:"Date lipsă documentație - <beneficiar>",
      body:"Bună ziua,\n\nPentru finalizarea documentației aferente lucrării <tip_lucrare>, avem nevoie de completarea datelor lipsă indicate în raportul de verificare.\n\nCu stimă,\n<proiectant>"
    },
    {
      id:"transmitere_osd",
      name:"Trimitere documentație către OSD",
      subject:"Documentație <tip_lucrare> - <beneficiar>",
      body:"Bună ziua,\n\nVă transmitem documentația aferentă lucrării <tip_lucrare> pentru beneficiarul <beneficiar>, amplasată la <adresa_lucrare>, <localitate>, <judet>.\n\nCu stimă,\n<proiectant>"
    },
    {
      id:"transmitere_vgd",
      name:"Trimitere către VGD",
      subject:"Verificare VGD - <beneficiar>",
      body:"Bună ziua,\n\nVă transmitem documentația pentru verificare VGD.\nBeneficiar: <beneficiar>\nLucrare: <tip_lucrare>\n\nCu stimă,\n<proiectant>"
    },
    {
      id:"transmitere_rte",
      name:"Trimitere către RTE",
      subject:"Verificare RTE - <beneficiar>",
      body:"Bună ziua,\n\nVă transmitem documentația pentru verificare RTE.\nBeneficiar: <beneficiar>\nLucrare: <tip_lucrare>\n\nCu stimă,\n<proiectant>"
    }
  ];

  const placeholders = {
    "Login":["email_utilizator","parola","rol_utilizator","plan_utilizator","status_cont","data_login"],
    "Date proiect":["beneficiar","adresa_lucrare","localitate","judet","telefon","email","osd","tip_lucrare","numar_contract","data_contract","proiectant","executant","verificator_vgd","responsabil_rte","observatii"],
    "Date tehnice":["debit_instalat","presiune_regim","diametru_conducta","material_conducta","lungime_bransament","punct_racordare","post_reglare","contor","categorie_consumator","traseu","putere_instalata_kw","debit_calculat_mc_h","debit_recomandat_mc_h","contor_orientativ","risc_presiune","estimare_materiale","estimare_cost","rezultat_calcul","observatii_tehnice"],
    "Documente":["tip_document","continut_document","previzualizare_document","data_document","stampila_proiectant","stampila_vgd","stampila_rte","semnatura_vgd","semnatura_rte"],
    "Ștampile":["stampila_proiectant","stampila_executant","stampila_vgd","stampila_rte"],
    "Email-uri":["email_destinatar","email_subiect","email_continut","email_template","mailto"],
    "Semnături":["semnatura_proiectant","semnatura_vgd","semnatura_rte","certificat_intern"],
    "Verifică documentație":["status_date_proiect","status_date_tehnice","status_documente","status_stampile","status_emailuri","status_semnaturi","status_plan","lipsuri_documentatie","raport_verificare"],
    "Planuri":["plan_id","departament","pret","features","export_allowed","purchase_intent"],
    "AI Developer":["developer_prompt","diagnostic_mode","patch_plan","run_update","validation_required","report_required"],
    "Audit":["audit_login","audit_pagini","audit_butoane","audit_backend","audit_frontend","audit_encoding","audit_vandabilitate"]
  };

  const defaultState = {
    user:null,
    activePlan:"developer_lifetime",
    project:{
      beneficiar:"",
      adresa_lucrare:"",
      localitate:"",
      judet:"",
      telefon:"",
      email:"",
      osd:"Distrigaz Sud Rețele",
      tip_lucrare:"Branșament gaze naturale",
      numar_contract:"",
      data_contract:"",
      proiectant:"",
      executant:"",
      verificator_vgd:"",
      responsabil_rte:"",
      observatii:""
    },
    technical:{
      debit_instalat:"",
      presiune_regim:"",
      diametru_conducta:"",
      material_conducta:"PEHD",
      lungime_bransament:"",
      punct_racordare:"",
      post_reglare:"",
      contor:"",
      categorie_consumator:"",
      traseu:"",
      putere_instalata_kw:"",
      debit_calculat_mc_h:"",
      debit_recomandat_mc_h:"",
      contor_orientativ:"",
      risc_presiune:"",
      estimare_materiale:"",
      estimare_cost:"",
      rezultat_calcul:"",
      observatii_tehnice:""
    },
    stamps:{
      proiectant:"",
      executant:"",
      vgd:"",
      rte:""
    },
    signatures:[],
    documents:[],
    emails:[],
    purchases:[],
    logs:[],
    selfUpdateReports:[],
    settings:{
      companyName:"Energy Project Design Services",
      uiMode:"V4.5",
      language:"ro-RO"
    }
  };

  let state = loadState();

  const navigation = [
    ["Dashboard","Panou principal","Principal"],
    ["Project","Date proiect","Workflow"],
    ["Technical","Date tehnice","Workflow"],
    ["Calculations","Calcul inteligent","Workflow"],
    ["Documents","Documente","Documente"],
    ["Stamps","Ștampile","Documente"],
    ["Emails","Email-uri","Comunicare"],
    ["Signatures","Semnături digitale","Comunicare"],
    ["Verify","Verifică documentație","Control"],
    ["Plans","Planuri departamente","Comercial"],
    ["Purchasing","Purchasing","Comercial"],
    ["Assistant","Asistent comenzi","Asistenți"],
    ["Placeholders","Placeholders","Developer"],
    ["Audit","Audit interfață","Developer"],
    ["SelfUpdate","Self Update inteligent","Developer"],
    ["Developer","AI Developer","Developer"],
    ["Settings","Setări / Cont","Sistem"],
    ["Logs","Loguri","Sistem"]
  ];

  function clone(v){ return JSON.parse(JSON.stringify(v)); }

  function merge(a,b){
    Object.keys(b || {}).forEach(function(k){
      if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && a[k]) a[k] = merge(a[k], b[k]);
      else a[k] = b[k];
    });
    return a;
  }

  function loadState(){
    try{
      return merge(clone(defaultState), JSON.parse(localStorage.getItem(STORE) || "{}"));
    }catch{
      return clone(defaultState);
    }
  }

  function saveState(){
    localStorage.setItem(STORE, JSON.stringify(state));
  }

  function esc(v){
    return String(v ?? "").replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }

  function log(type,message){
    state.logs.unshift({type,message,date:new Date().toLocaleString("ro-RO")});
    state.logs = state.logs.slice(0,300);
    saveState();
  }

  function appRoot(){
    return document.getElementById("app");
  }

  function mount(html){
    const view = document.getElementById("view");
    if (view) view.innerHTML = html;
  }

  function currentPlan(){
    return plans.find(p => p.id === state.activePlan) || plans[0];
  }

  function field(group,key,label,type){
    type = type || "text";
    const value = state[group][key] || "";
    return '<label>'+esc(label)+'<input type="'+esc(type)+'" value="'+esc(value)+'" oninput="EPD.setField(\''+group+'\',\''+key+'\',this.value)"></label>';
  }

  function area(group,key,label){
    const value = state[group][key] || "";
    return '<label>'+esc(label)+'<textarea oninput="EPD.setField(\''+group+'\',\''+key+'\',this.value)">'+esc(value)+'</textarea></label>';
  }

  function statusBadge(ok,text){
    return '<span class="'+(ok ? 'badge' : 'badge warn')+'">'+esc(text)+'</span>';
  }

  function download(filename,text,type){
    const blob = new Blob([text], {type:type || "text/plain;charset=utf-8"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function copyText(text){
    navigator.clipboard.writeText(text).then(function(){
      alert("Copiat.");
    }).catch(function(){
      alert("Nu am putut copia automat.");
    });
  }

  function getAllValues(){
    return Object.assign(
      {},
      state.project,
      state.technical,
      {
        data_document:new Date().toISOString().slice(0,10),
        stampila_proiectant:state.stamps.proiectant || "[Ștampilă proiectant lipsă]",
        stampila_executant:state.stamps.executant || "[Ștampilă executant lipsă]",
        stampila_vgd:state.stamps.vgd || "[Ștampilă VGD lipsă]",
        stampila_rte:state.stamps.rte || "[Ștampilă RTE lipsă]",
        semnatura_vgd:findSignature("vgd"),
        semnatura_rte:findSignature("rte"),
        status_documentatie:getReadiness().score + "%",
        raport_verificare:getReadiness().missing.join("; ")
      }
    );
  }

  function replacePlaceholders(text){
    const values = getAllValues();
    return String(text || "").replace(/<([a-zA-Z0-9_ăîâșțĂÎÂȘȚ]+)>/g, function(match,key){
      return values[key] !== undefined && values[key] !== null && values[key] !== "" ? String(values[key]) : match;
    });
  }

  function findSignature(role){
    const found = state.signatures.find(s => String(s.role).toLowerCase() === role);
    return found ? found.certificateId + " / " + found.signer : "[Semnătură internă " + role.toUpperCase() + " lipsă]";
  }

  function requiredProjectFields(){
    return ["beneficiar","adresa_lucrare","localitate","judet","telefon","email","osd","tip_lucrare","proiectant"];
  }

  function requiredTechnicalFields(){
    return ["debit_instalat","presiune_regim","diametru_conducta","material_conducta","lungime_bransament","punct_racordare"];
  }

  function getReadiness(){
    const checks = [];
    function add(name, ok, detail){ checks.push({name, ok:!!ok, detail}); }

    const missingProject = requiredProjectFields().filter(k => !state.project[k]);
    const missingTechnical = requiredTechnicalFields().filter(k => !state.technical[k]);

    add("Login", !!state.user, state.user ? "Autentificat" : "Neautentificat");
    add("Date proiect", missingProject.length === 0, missingProject.length ? "Lipsă: " + missingProject.join(", ") : "Complete");
    add("Date tehnice", missingTechnical.length === 0, missingTechnical.length ? "Lipsă: " + missingTechnical.join(", ") : "Complete");
    add("IF calculus", !!state.technical.rezultat_calcul, state.technical.rezultat_calcul || "Nerulat");
    add("Documente", state.documents.length > 0, state.documents.length + " documente generate");
    add("Ștampile", !!(state.stamps.proiectant || state.stamps.vgd || state.stamps.rte), "Proiectant/VGD/RTE");
    add("Email-uri", state.emails.length > 0, state.emails.length + " email-uri pregătite");
    add("Semnături", state.signatures.length > 0, state.signatures.length + " certificate interne");
    add("Plan", !!state.activePlan, currentPlan().name);
    add("Purchasing", state.purchases.length > 0, state.purchases.length + " intenții achiziție");
    add("Export", currentPlan().exportAllowed, currentPlan().exportAllowed ? "Permis" : "Limitat de plan");

    const ok = checks.filter(x => x.ok).length;
    const score = Math.round(ok / checks.length * 100);
    const missing = checks.filter(x => !x.ok).map(x => x.name + ": " + x.detail);

    return {checks, score, missing};
  }

  function renderLogin(){
    appRoot().innerHTML =
      '<div class="login-shell">'+
        '<div class="login-card">'+
          '<div class="login-hero">'+
            '<div class="logo-mark">EPD</div>'+
            '<h1>Energy Project Design Services</h1>'+
            '<p>Platformă V4.5 pentru proiecte gaze naturale: date proiect, date tehnice, documente cu placeholder-e, ștampile, email-uri, semnături, planuri, purchasing, audit și self-update inteligent.</p>'+
            '<p><b>'+BUILD+'</b> — build '+esc(BUILD_DATE)+'</p>'+
            '<div class="row">'+
              '<span class="badge">Workflow complet</span>'+
              '<span class="badge blue">OpenAI-ready</span>'+
              '<span class="badge">GitHub update-ready</span>'+
            '</div>'+
          '</div>'+
          '<div class="login-form">'+
            '<h2>Autentificare</h2>'+
            '<p class="muted">Intrare demonstrabilă pentru interfața V4.5. Backend-ul rămâne verificabil prin /api/health.</p>'+
            '<label>Email<input id="loginEmail" value="developer@epd.local"></label>'+
            '<label>Parolă<input id="loginPassword" type="password" value="developer"></label>'+
            '<div class="row" style="margin-top:14px">'+
              '<button class="primary" onclick="EPD.login(false)">Autentificare</button>'+
              '<button class="blue" onclick="EPD.login(true)">Intrare Developer</button>'+
              '<button onclick="EPD.healthLogin()">Verifică backend</button>'+
            '</div>'+
            '<pre id="loginHealth" style="margin-top:14px;display:none"></pre>'+
          '</div>'+
        '</div>'+
      '</div>';
  }

  function renderShell(){
    const plan = currentPlan();
    const ready = getReadiness();

    const groups = {};
    navigation.forEach(n => {
      if (!groups[n[2]]) groups[n[2]] = [];
      groups[n[2]].push(n);
    });

    const navHtml = Object.keys(groups).map(group => {
      return '<div class="nav-title">'+esc(group)+'</div>' +
        groups[group].map(n => '<button id="nav_'+esc(n[0])+'" onclick="EPD.open(\''+esc(n[0])+'\')">'+esc(n[1])+'</button>').join("");
    }).join("");

    appRoot().innerHTML =
      '<div class="app-shell">'+
        '<aside class="sidebar">'+
          '<div class="brand">'+
            '<div class="logo-mark">EPD</div>'+
            '<div><b>Energy Project Design</b><small>V4.5 Intelligent</small></div>'+
          '</div>'+
          '<div class="nav">'+navHtml+'</div>'+
        '</aside>'+
        '<main class="main">'+
          '<div class="topbar">'+
            '<div>'+
              '<h1 id="pageTitle">Panou principal</h1>'+
              '<div class="muted">'+esc(state.user.name)+' · Plan: '+esc(plan.name)+' · '+esc(BUILD)+'</div>'+
            '</div>'+
            '<div class="row">'+
              '<span class="badge">Scor '+ready.score+'%</span>'+
              '<button onclick="EPD.exportAll()">Export</button>'+
              '<button onclick="EPD.logout()">Logout</button>'+
            '</div>'+
          '</div>'+
          '<div id="view"></div>'+
        '</main>'+
      '</div>';

    openPage("Dashboard");
  }

  function setTitle(key){
    const item = navigation.find(n => n[0] === key);
    const t = document.getElementById("pageTitle");
    if (t && item) t.textContent = item[1];
    document.querySelectorAll(".nav button").forEach(b => b.classList.remove("active"));
    const btn = document.getElementById("nav_"+key);
    if (btn) btn.classList.add("active");
  }

  function openPage(key){
    setTitle(key);
    const map = {
      Dashboard:pageDashboard,
      Project:pageProject,
      Technical:pageTechnical,
      Calculations:pageCalculations,
      Documents:pageDocuments,
      Stamps:pageStamps,
      Emails:pageEmails,
      Signatures:pageSignatures,
      Verify:pageVerify,
      Plans:pagePlans,
      Purchasing:pagePurchasing,
      Assistant:pageAssistant,
      Placeholders:pagePlaceholders,
      Audit:pageAudit,
      SelfUpdate:pageSelfUpdate,
      Developer:pageDeveloper,
      Settings:pageSettings,
      Logs:pageLogs
    };
    (map[key] || pageDashboard)();
  }

  function pageDashboard(){
    const ready = getReadiness();
    const plan = currentPlan();

    mount(
      '<div class="grid4">'+
        card("Versiune",'<h2>V4.5</h2><p class="muted">Interfață completă, vizibilă direct în public/app.js.</p>')+
        card("Scor documentație",'<div class="progress"><span style="width:'+ready.score+'%"></span></div><p><b>'+ready.score+'%</b></p>')+
        card("Plan activ",'<h2>'+esc(plan.name)+'</h2><p>'+esc(plan.department)+'</p>')+
        card("Artefacte",'<p>Documente: <b>'+state.documents.length+'</b></p><p>Email-uri: <b>'+state.emails.length+'</b></p><p>Certificate: <b>'+state.signatures.length+'</b></p>')+
      '</div>'+
      '<div class="card">'+
        '<h2>Workflow principal</h2>'+
        '<p>Date proiect → Date tehnice → Calcul inteligent → Documente → Ștampile → Email-uri → Semnături → Verifică documentație → Planuri → Self Update.</p>'+
        '<div class="row">'+
          '<button class="primary" onclick="EPD.open(\'Project\')">Începe cu Date proiect</button>'+
          '<button onclick="EPD.open(\'Technical\')">Date tehnice</button>'+
          '<button onclick="EPD.open(\'Documents\')">Generează document</button>'+
          '<button onclick="EPD.open(\'Verify\')">Verifică documentație</button>'+
          '<button class="blue" onclick="EPD.open(\'SelfUpdate\')">Self Update inteligent</button>'+
        '</div>'+
      '</div>'+
      '<div class="card">'+
        '<h3>Status rapid</h3>'+
        renderStatusTable(ready.checks)+
      '</div>'
    );
  }

  function card(title,body){
    return '<div class="card"><h3>'+esc(title)+'</h3>'+body+'</div>';
  }

  function renderStatusTable(checks){
    return '<table class="table"><tr><th>Element</th><th>Status</th><th>Detalii</th></tr>'+
      checks.map(c => '<tr><td>'+esc(c.name)+'</td><td class="'+(c.ok?'ok':'bad')+'">'+(c.ok?'OK':'Lipsă')+'</td><td>'+esc(c.detail)+'</td></tr>').join("")+
      '</table>';
  }

  function pageProject(){
    mount(
      '<div class="card">'+
        '<h2>Date proiect</h2>'+
        '<p class="muted">Câmpurile de aici alimentează documentele, placeholder-ele, email-urile și verificarea centrală.</p>'+
        '<div class="grid">'+
          field("project","beneficiar","Beneficiar")+
          field("project","adresa_lucrare","Adresă lucrare")+
          field("project","localitate","Localitate")+
          field("project","judet","Județ")+
          field("project","telefon","Telefon")+
          field("project","email","Email")+
          field("project","osd","Operator OSD")+
          field("project","tip_lucrare","Tip lucrare")+
          field("project","numar_contract","Număr contract")+
          field("project","data_contract","Dată contract","date")+
          field("project","proiectant","Proiectant")+
          field("project","executant","Executant")+
          field("project","verificator_vgd","Verificator VGD")+
          field("project","responsabil_rte","Responsabil RTE")+
        '</div>'+
        area("project","observatii","Observații proiect")+
        '<div class="row" style="margin-top:14px">'+
          '<button class="primary" onclick="EPD.saveProject()">Salvează date proiect</button>'+
          '<button onclick="EPD.validateProject()">Validează date proiect</button>'+
          '<button onclick="EPD.generateProjectPlaceholders()">Generează placeholder-e proiect</button>'+
          '<button onclick="EPD.open(\'Technical\')">Continuă la Date tehnice</button>'+
        '</div>'+
      '</div>'+
      '<div class="card">'+
        '<h3>Casete inteligente Date proiect</h3>'+
        '<div class="grid">'+
          calcBox("Completare date beneficiar","Verifică beneficiar, adresă, localitate, județ, telefon, email.", projectStatus().beneficiary, "EPD.validateProject()")+
          calcBox("Validare OSD","Verifică operatorul de distribuție și localizarea.", projectStatus().osd, "EPD.validateProject()")+
          calcBox("Contract","Verifică număr contract și data contractului.", projectStatus().contract, "EPD.validateProject()")+
          calcBox("Placeholder readiness","Verifică ce placeholder-e de proiect pot fi generate.", projectStatus().placeholders, "EPD.generateProjectPlaceholders()")+
        '</div>'+
      '</div>'
    );
  }

  function projectStatus(){
    const p = state.project;
    const beneficiaryFields = ["beneficiar","adresa_lucrare","localitate","judet","telefon","email"];
    const missingBeneficiary = beneficiaryFields.filter(k => !p[k]);
    const placeholderMissing = Object.keys(p).filter(k => !p[k]);

    return {
      beneficiary: missingBeneficiary.length ? "Date lipsă: " + missingBeneficiary.join(", ") : "Complet",
      osd: p.osd ? "OSD selectat: " + p.osd : "Selectează operatorul de distribuție",
      contract: p.numar_contract && p.data_contract ? "Contract complet" : "Contract incomplet",
      placeholders: placeholderMissing.length ? "Placeholder-e lipsă: " + placeholderMissing.join(", ") : "Toate placeholder-ele proiect sunt pregătite"
    };
  }

  function calcBox(title,explanation,result,handler){
    return '<div class="calc-box">'+
      '<h3>'+esc(title)+'</h3>'+
      '<p class="muted small">'+esc(explanation)+'</p>'+
      '<div class="calc-result">'+esc(result)+'</div>'+
      '<div class="row" style="margin-top:10px">'+
        '<button onclick="'+handler+'">Recalculează</button>'+
        '<button onclick="EPD.copyRaw(\''+esc(String(result).replace(/'/g,"\\'"))+'\')">Copiază</button>'+
      '</div>'+
    '</div>';
  }

  function pageTechnical(){
    mount(
      '<div class="card">'+
        '<h2>Date tehnice</h2>'+
        '<div class="grid">'+
          field("technical","debit_instalat","Debit instalat mc/h")+
          field("technical","presiune_regim","Presiune regim")+
          field("technical","diametru_conducta","Diametru conductă")+
          field("technical","material_conducta","Material conductă")+
          field("technical","lungime_bransament","Lungime branșament m")+
          field("technical","punct_racordare","Punct racordare")+
          field("technical","post_reglare","Post reglare")+
          field("technical","contor","Contor")+
          field("technical","categorie_consumator","Categorie consumator")+
          field("technical","traseu","Traseu")+
          field("technical","putere_instalata_kw","Putere instalată kW")+
          field("technical","debit_calculat_mc_h","Debit calculat mc/h")+
          field("technical","debit_recomandat_mc_h","Debit recomandat mc/h")+
          field("technical","contor_orientativ","Contor orientativ")+
          field("technical","risc_presiune","Risc presiune")+
          field("technical","estimare_materiale","Estimare materiale")+
          field("technical","estimare_cost","Estimare cost")+
        '</div>'+
        area("technical","observatii_tehnice","Observații tehnice")+
        '<div class="row" style="margin-top:14px">'+
          '<button class="primary" onclick="EPD.runCalculus()">Rulează IF calculus</button>'+
          '<button onclick="EPD.validateTechnical()">Validează date tehnice</button>'+
          '<button onclick="EPD.open(\'Calculations\')">Deschide Calcul inteligent</button>'+
          '<button onclick="EPD.open(\'Documents\')">Continuă la Documente</button>'+
        '</div>'+
      '</div>'+
      '<div class="card"><h3>Rezultat calcul</h3><pre>'+esc(JSON.stringify(state.technical,null,2))+'</pre></div>'
    );
  }

  function pageCalculations(){
    const t = state.technical;
    const boxes = [
      ["Debit calculat","Sursă: debit_instalat","debit_calculat_mc_h = debit_instalat",t.debit_calculat_mc_h || "Nerulat"],
      ["Debit recomandat","Sursă: debit_instalat","debit_recomandat_mc_h = debit_instalat × 1.10",t.debit_recomandat_mc_h || "Nerulat"],
      ["Putere instalată estimată","Sursă: debit_instalat","putere_instalata_kw = debit_instalat × 10.6",t.putere_instalata_kw || "Nerulat"],
      ["Risc presiune","Sursă: lungime_branșament + presiune_regim","dacă lungime > 30 → verificare necesară",t.risc_presiune || "Nerulat"],
      ["Estimare cost","Sursă: lungime + material + diametru","estimare demo = lungime × 120 RON",t.estimare_cost || "Nerulat"],
      ["Recomandare contor","Sursă: debit_recomandat","G4/G6/G10/verificare",t.contor_orientativ || "Nerulat"],
      ["Completare tehnică","Sursă: câmpuri obligatorii","scor completare tehnică",technicalStatus()]
    ].map(b => '<div class="calc-box"><h3>'+esc(b[0])+'</h3><p class="muted">'+esc(b[1])+'</p><p><b>Formulă:</b> '+esc(b[2])+'</p><div class="calc-result">'+esc(b[3])+'</div></div>').join("");

    mount(
      '<div class="card">'+
        '<h2>Casete inteligente de calcul variabil</h2>'+
        '<p>Laborator central pentru calcule, condiții IF, rezultate și recomandări tehnice.</p>'+
        '<div class="row">'+
          '<button class="primary" onclick="EPD.runCalculus()">Recalculează toate</button>'+
          '<button onclick="EPD.exportCalculationReport()">Export raport calcul</button>'+
          '<button onclick="EPD.open(\'Technical\')">Trimite în Date tehnice</button>'+
        '</div>'+
      '</div>'+
      '<div class="grid">'+boxes+'</div>'
    );
  }

  function technicalStatus(){
    const missing = requiredTechnicalFields().filter(k => !state.technical[k]);
    return missing.length ? "Lipsă: " + missing.join(", ") : "Date tehnice complete";
  }

  function runCalculus(){
    const t = state.technical;
    const debit = num(t.debit_instalat);
    const lungime = num(t.lungime_bransament);

    if (debit > 0) {
      t.debit_calculat_mc_h = debit.toFixed(2);
      t.debit_recomandat_mc_h = (debit * 1.10).toFixed(2);
      t.putere_instalata_kw = (debit * 10.6).toFixed(2);

      if (debit <= 6) t.contor_orientativ = "G4";
      else if (debit <= 10) t.contor_orientativ = "G6";
      else if (debit <= 16) t.contor_orientativ = "G10";
      else t.contor_orientativ = "verificare dimensionare contor";
    }

    if (!t.presiune_regim) t.risc_presiune = "presiune lipsă";
    else if (lungime > 30) t.risc_presiune = "verificare presiune necesară";
    else t.risc_presiune = "normal";

    if (lungime > 0) {
      t.estimare_cost = (lungime * 120).toFixed(0) + " RON estimativ";
      t.estimare_materiale = "Conductă " + (t.material_conducta || "material nespecificat") + ", DN " + (t.diametru_conducta || "nespecificat") + ", lungime " + lungime + " m";
    }

    t.rezultat_calcul = "IF calculus rulat la " + new Date().toLocaleString("ro-RO") + ". Debit recomandat: " + (t.debit_recomandat_mc_h || "n/a") + ", risc presiune: " + (t.risc_presiune || "n/a") + ".";
    log("Calcul", "IF calculus rulat.");
    saveState();
  }

  function num(v){
    const n = Number(String(v || "0").replace(",","."));
    return isFinite(n) ? n : 0;
  }

  function pageDocuments(){
    const opts = templates.map(t => '<option value="'+esc(t.id)+'">'+esc(t.name)+' — '+esc(t.category)+'</option>').join("");
    const last = state.documents[0];

    mount(
      '<div class="card">'+
        '<h2>Documente cu placeholder-e</h2>'+
        '<label>Template document<select id="docTemplate">'+opts+'</select></label>'+
        '<div class="row" style="margin-top:14px">'+
          '<button class="primary" onclick="EPD.generateDocument()">Generează document</button>'+
          '<button onclick="EPD.scanDocumentPlaceholders()">Scanează placeholder-e</button>'+
          '<button onclick="EPD.copyLastDocument()">Copiază document</button>'+
          '<button onclick="EPD.exportLastDocumentJson()">Export JSON</button>'+
          '<button onclick="EPD.exportLastDocumentHtml()">Export HTML</button>'+
        '</div>'+
      '</div>'+
      '<div class="card"><h3>Preview document generat</h3><div class="doc-preview" id="docPreview">'+esc(last ? last.body : "Nu există document generat.")+'</div></div>'+
      '<div class="card"><h3>Istoric documente</h3>'+renderDocumentsTable()+'</div>'
    );
  }

  function renderDocumentsTable(){
    if (!state.documents.length) return '<p class="muted">Nu există documente generate.</p>';
    return '<table class="table"><tr><th>Document</th><th>Data</th><th>Acțiuni</th></tr>'+
      state.documents.map((d,i) => '<tr><td>'+esc(d.name)+'</td><td>'+esc(d.date)+'</td><td><button onclick="EPD.previewDocument('+i+')">Preview</button></td></tr>').join("")+
      '</table>';
  }

  function pageStamps(){
    mount(
      '<div class="card"><h2>Ștampile</h2><p>Ștampilele se mapează în documente prin placeholder-ele &lt;stampila_proiectant&gt;, &lt;stampila_vgd&gt;, &lt;stampila_rte&gt;.</p></div>'+
      '<div class="grid">'+
        stampBox("proiectant","Ștampilă proiectant")+
        stampBox("executant","Ștampilă executant")+
        stampBox("vgd","Ștampilă VGD")+
        stampBox("rte","Ștampilă RTE")+
      '</div>'+
      '<div class="card"><h3>Status ștampile</h3>'+renderStampStatus()+'</div>'
    );
  }

  function stampBox(key,label){
    return '<div class="card">'+
      '<h3>'+esc(label)+'</h3>'+
      '<label>Text / cod / descriere ștampilă<textarea oninput="EPD.setStamp(\''+key+'\',this.value)">'+esc(state.stamps[key] || "")+'</textarea></label>'+
      '<div class="row" style="margin-top:10px">'+
        '<button onclick="EPD.saveStamps()">Salvează</button>'+
        '<button onclick="EPD.copyRaw(\''+esc((state.stamps[key] || "").replace(/'/g,"\\'"))+'\')">Copiază</button>'+
      '</div>'+
      '<div class="calc-result"><b>Preview:</b><br>'+esc(state.stamps[key] || "Lipsă")+'</div>'+
    '</div>';
  }

  function renderStampStatus(){
    const rows = ["proiectant","executant","vgd","rte"].map(k => {
      const ok = !!state.stamps[k];
      return '<tr><td>'+esc(k)+'</td><td class="'+(ok?'ok':'bad')+'">'+(ok?'Încărcată':'Lipsă')+'</td><td>&lt;stampila_'+esc(k)+'&gt;</td></tr>';
    }).join("");
    return '<table class="table"><tr><th>Rol</th><th>Status</th><th>Placeholder</th></tr>'+rows+'</table>';
  }

  function pageEmails(){
    const opts = emailTemplates.map(t => '<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>').join("");
    const last = state.emails[0];

    mount(
      '<div class="card">'+
        '<h2>Email-uri</h2>'+
        '<div class="grid">'+
          '<label>Template email<select id="emailTemplate" onchange="EPD.loadEmailTemplate()">'+opts+'</select></label>'+
          '<label>Destinatar<input id="emailTo" value="'+esc(state.project.email || "")+'"></label>'+
        '</div>'+
        '<label>Subiect<input id="emailSubject" value="Documentație EPD - <beneficiar>"></label>'+
        '<label>Conținut<textarea id="emailBody">Bună ziua,\\n\\nVă transmitem documentația pentru <beneficiar>, lucrarea <tip_lucrare>.\\n\\nCu stimă,\\n<proiectant></textarea></label>'+
        '<div class="row" style="margin-top:14px">'+
          '<button class="primary" onclick="EPD.prepareEmail()">Pregătește email</button>'+
          '<button onclick="EPD.openMailClient()">Deschide client email</button>'+
          '<button onclick="EPD.copyLastEmail()">Copiază email</button>'+
        '</div>'+
      '</div>'+
      '<div class="card"><h3>Ultimul email</h3><pre>'+esc(JSON.stringify(last || {},null,2))+'</pre></div>'+
      '<div class="card"><h3>Istoric email-uri</h3>'+renderEmailTable()+'</div>'
    );
  }

  function renderEmailTable(){
    if (!state.emails.length) return '<p class="muted">Nu există email-uri pregătite.</p>';
    return '<table class="table"><tr><th>Către</th><th>Subiect</th><th>Data</th></tr>'+
      state.emails.map(e => '<tr><td>'+esc(e.to)+'</td><td>'+esc(e.subject)+'</td><td>'+esc(e.date)+'</td></tr>').join("")+
      '</table>';
  }

  function pageSignatures(){
    mount(
      '<div class="card">'+
        '<h2>Semnături digitale / certificare internă</h2>'+
        '<p class="muted">Aceasta este o certificare internă demonstrabilă. Pentru semnătură calificată legală este necesar un provider eIDAS/certificat calificat.</p>'+
        '<div class="grid">'+
          '<label>Rol<select id="sigRole"><option value="proiectant">Proiectant</option><option value="vgd">VGD</option><option value="rte">RTE</option></select></label>'+
          '<label>Semnatar<input id="sigSigner" value="'+esc(state.project.proiectant || state.project.verificator_vgd || state.project.responsabil_rte || "")+'"></label>'+
          '<label>Document<input id="sigDoc" value="Documentație EPD"></label>'+
        '</div>'+
        '<div class="row" style="margin-top:14px">'+
          '<button class="primary" onclick="EPD.certifySignature()">Certifică intern</button>'+
          '<button onclick="EPD.exportCertificates()">Export certificate</button>'+
        '</div>'+
      '</div>'+
      '<div class="card"><h3>Istoric certificate</h3><pre>'+esc(JSON.stringify(state.signatures,null,2))+'</pre></div>'
    );
  }

  function pageVerify(){
    const ready = getReadiness();

    mount(
      '<div class="card">'+
        '<h2>Verifică documentație</h2>'+
        '<p>Control central pentru Date proiect, Date tehnice, Documente, Ștampile, Email-uri, VGD/RTE, plan și export.</p>'+
        '<div class="progress"><span style="width:'+ready.score+'%"></span></div>'+
        '<p><b>Scor completare: '+ready.score+'%</b></p>'+
        '<div class="row">'+
          '<button class="primary" onclick="EPD.runFullAudit()">Rulează audit complet</button>'+
          '<button onclick="EPD.copyVerificationReport()">Copiază raport</button>'+
          '<button onclick="EPD.exportVerificationJson()">Export raport JSON</button>'+
        '</div>'+
      '</div>'+
      '<div class="card"><h3>Status workflow</h3>'+renderStatusTable(ready.checks)+'</div>'+
      '<div class="card"><h3>Lipsuri și recomandări</h3><pre>'+esc(ready.missing.length ? ready.missing.join("\n") : "Documentația este pregătită pentru fluxul demonstrabil.")+'</pre></div>'
    );
  }

  function pagePlans(){
    const plan = currentPlan();
    const rows = plans.map(p => {
      return '<tr>'+
        '<td><b>'+esc(p.name)+'</b></td>'+
        '<td>'+esc(p.department)+'</td>'+
        '<td>'+esc(p.price)+' '+esc(p.currency)+' / '+esc(p.period)+'</td>'+
        '<td>'+p.features.map(f => '<span class="chip">'+esc(f)+'</span>').join("")+'</td>'+
        '<td class="'+(p.exportAllowed?'ok':'warn')+'">'+(p.exportAllowed?'Permis':'Limitat')+'</td>'+
        '<td><button class="primary" onclick="EPD.purchasePlan(\''+esc(p.id)+'\')">Achiziționează</button></td>'+
      '</tr>';
    }).join("");

    mount(
      '<div class="card">'+
        '<h2>Planuri departamente</h2>'+
        '<p>Plan curent: <b>'+esc(plan.name)+'</b>. Fiecare plan are preț, funcții și drepturi de export.</p>'+
        '<div class="row">'+
          '<button onclick="EPD.calculatePlanResult()">Calculează plan recomandat</button>'+
          '<button onclick="EPD.open(\'Purchasing\')">Purchasing</button>'+
        '</div>'+
      '</div>'+
      '<div class="card"><table class="table"><tr><th>Plan</th><th>Departament</th><th>Preț</th><th>Funcții</th><th>Export</th><th>Achiziție</th></tr>'+rows+'</table></div>'+
      '<div class="card"><h3>Rezultantă plan</h3><pre id="planResult">'+esc(JSON.stringify(calculatePlanResult(),null,2))+'</pre></div>'
    );
  }

  function calculatePlanResult(){
    const ready = getReadiness();
    let recommended = plans[0];

    if (ready.score > 40) recommended = plans.find(p => p.id === "projectant_149") || recommended;
    if (state.documents.length || state.signatures.length) recommended = plans.find(p => p.id === "societate_399") || recommended;
    if (state.user && state.user.role === "Developer") recommended = plans.find(p => p.id === "developer_lifetime") || recommended;

    const current = currentPlan();

    return {
      planCurent: current.name,
      pretCurent: current.price + " " + current.currency,
      planRecomandat: recommended.name,
      pretRecomandat: recommended.price + " " + recommended.currency,
      exportCurent: current.exportAllowed ? "permis" : "limitat/blocat",
      functiiCurente: current.features,
      functiiRecomandate: recommended.features,
      motiv: "Recomandare calculată după scor workflow, documente, semnături și rol."
    };
  }

  function pagePurchasing(){
    const last = state.purchases[0];

    mount(
      '<div class="card">'+
        '<h2>Purchasing</h2>'+
        '<p>Flux local de purchase intent, pregătit pentru conectare Stripe / Netopia / SmartBill.</p>'+
        '<label>Selectează plan<select id="purchasePlan">'+plans.map(p => '<option value="'+esc(p.id)+'">'+esc(p.name)+' — '+esc(p.price)+' EUR</option>').join("")+'</select></label>'+
        '<div class="row" style="margin-top:14px">'+
          '<button class="primary" onclick="EPD.createPurchaseIntent()">Creează purchase intent</button>'+
          '<button onclick="EPD.exportPurchases()">Export istoric achiziții</button>'+
        '</div>'+
      '</div>'+
      '<div class="card"><h3>Ultimul purchase intent</h3><pre>'+esc(JSON.stringify(last || {},null,2))+'</pre></div>'
    );
  }

  function pageAssistant(){
    mount(
      '<div class="card">'+
        '<h2>Asistent comenzi</h2>'+
        '<p>Interpretează comenzi și recomandă pagina/acțiunea potrivită.</p>'+
        '<textarea id="cmdBox" placeholder="Ex: generează document, adaugă ștampilă VGD, pregătește email, rulează calcul, verifică documentația"></textarea>'+
        '<div class="row" style="margin-top:14px">'+
          '<button class="primary" onclick="EPD.runCommand()">Execută comandă</button>'+
          '<button onclick="EPD.open(\'SelfUpdate\')">Trimite către Self Update</button>'+
        '</div>'+
      '</div>'+
      '<div class="card"><h3>Răspuns asistent</h3><pre id="cmdOut">Nerulat.</pre></div>'
    );
  }

  function pagePlaceholders(){
    const html = Object.keys(placeholders).map(page => {
      return '<div class="card"><h3>'+esc(page)+'</h3>'+placeholders[page].map(p => '<span class="chip">&lt;'+esc(p)+'&gt;</span>').join("")+'</div>';
    }).join("");

    mount(
      '<div class="card"><h2>Placeholders</h2><p>Registru central structurat pe pagini. Folosit de documente, email-uri, ștampile, semnături și verificare.</p></div>'+
      html
    );
  }

  function pageAudit(){
    const report = auditInterface();

    mount(
      '<div class="card">'+
        '<h2>Audit interfață</h2>'+
        '<p>Diagnostic pagină cu pagină și funcție cu funcție, inclusiv butoane, state, export și encoding.</p>'+
        '<div class="row">'+
          '<button class="primary" onclick="EPD.runFullAudit()">Rulează audit</button>'+
          '<button onclick="EPD.copyAudit()">Copiază audit</button>'+
          '<button onclick="EPD.exportAudit()">Export audit</button>'+
        '</div>'+
      '</div>'+
      '<div class="card"><h3>Raport audit</h3>'+renderAuditTable(report)+'</div>'+
      '<div class="card"><h3>Auto-repair proposal</h3><pre>'+esc(JSON.stringify(buildRepairProposal(),null,2))+'</pre></div>'
    );
  }

  function auditInterface(){
    const pages = [
      ["Login",["Autentificare","Intrare Developer","Verifică backend"],!!state.user],
      ["Panou principal",["Workflow","Status","Export"],true],
      ["Date proiect",["Salvează","Validează","Generează placeholder-e"],requiredProjectFields().every(k => !!state.project[k])],
      ["Date tehnice",["Rulează IF calculus","Validează","Continuă"],requiredTechnicalFields().every(k => !!state.technical[k])],
      ["Calcul inteligent",["Recalculează","Export raport"],!!state.technical.rezultat_calcul],
      ["Documente",["Scanează placeholder-e","Generează","Export JSON/HTML"],state.documents.length > 0],
      ["Ștampile",["Salvează","Preview","Mapare"],!!(state.stamps.proiectant || state.stamps.vgd || state.stamps.rte)],
      ["Email-uri",["Template","Pregătește","Mailto","Istoric"],state.emails.length > 0],
      ["Semnături",["Certificare","Istoric","Export"],state.signatures.length > 0],
      ["Planuri",["Matrice","Preț","Funcții","Export"],plans.length >= 10],
      ["Purchasing",["Purchase intent","Istoric"],state.purchases.length > 0],
      ["Asistent",["Interpretare","Rutare"],true],
      ["Self Update",["Diagnostic","Prompt","Run update"],true],
      ["Encoding",["UTF-8","Diacritice"],true]
    ];

    return pages.map(p => ({
      page:p[0],
      expected:p[1],
      ok:p[2],
      severity:p[2] ? "ok" : "warning",
      recommendation:p[2] ? "Funcțional" : "Completează/rulează funcția aferentă paginii."
    }));
  }

  function renderAuditTable(items){
    return '<table class="table"><tr><th>Pagină</th><th>Funcții așteptate</th><th>Status</th><th>Recomandare</th></tr>'+
      items.map(x => '<tr><td>'+esc(x.page)+'</td><td>'+x.expected.map(e => '<span class="chip">'+esc(e)+'</span>').join("")+'</td><td class="'+(x.ok?'ok':'warn')+'">'+(x.ok?'OK':'De completat')+'</td><td>'+esc(x.recommendation)+'</td></tr>').join("")+
      '</table>';
  }

  function buildRepairProposal(){
    return auditInterface().filter(x => !x.ok).map(x => ({
      page:x.page,
      missing:x.expected,
      suggestedPatch:"Completează câmpuri, handler, validare, state persistence și raport.",
      risk:"low",
      mode:"additive"
    }));
  }

  function pageSelfUpdate(){
    const prompt = buildSelfUpdatePrompt();

    mount(
      '<div class="card">'+
        '<h2>Self Update inteligent</h2>'+
        '<p>Acest modul generează diagnostic, prompt de update și poate apela ruta backend /api/update/run dacă este disponibilă.</p>'+
        '<div class="row">'+
          '<button class="primary" onclick="EPD.runSelfDiagnosis()">Rulează diagnostic local</button>'+
          '<button onclick="EPD.copySelfUpdatePrompt()">Copiază prompt update</button>'+
          '<button class="blue" onclick="EPD.callRunUpdate()">Apelează /api/update/run</button>'+
        '</div>'+
      '</div>'+
      '<div class="card"><h3>Prompt self-update</h3><textarea class="codearea" id="selfUpdatePrompt">'+esc(prompt)+'</textarea></div>'+
      '<div class="card"><h3>Rezultat self-update</h3><pre id="selfUpdateOut">'+esc(JSON.stringify(state.selfUpdateReports[0] || {status:"Nerulat"},null,2))+'</pre></div>'
    );
  }

  function buildSelfUpdatePrompt(){
    return [
      "EPD V4.5 INTELLIGENT SELF UPDATE",
      "",
      "Scop: repară funcțiile lipsă conform arhitecturii reale încărcate public.",
      "",
      "Reguli:",
      "- Nu face restore din commit vechi.",
      "- Nu face full rebuild orb.",
      "- Nu crea React/src dacă site-ul servește public/app.js.",
      "- Integrează update-ul în fișierele reale încărcate.",
      "- Păstrează /api/health, app.listen și Google OAuth stabile.",
      "- Verifică node --check server.js și node --check public/app.js înainte de commit.",
      "- Când utilizatorul cere funcții, interpretează ca funcții lipsă/incomplete conform scopului paginii.",
      "",
      "Lipsuri detectate:",
      ...getReadiness().missing.map(x => "- " + x),
      "",
      "Pagini obligatorii:",
      navigation.map(n => "- " + n[1]).join("\n"),
      "",
      "Funcții obligatorii:",
      "- Casete inteligente de calcul variabil",
      "- Generare documente cu placeholder-e",
      "- Ștampile mapate în documente",
      "- Email-uri cu placeholder replacement",
      "- Certificare internă semnături",
      "- Planuri pe departamente cu preț",
      "- Purchasing intent",
      "- Asistent comenzi",
      "- Audit interfață",
      "- AI Developer patch plan",
      "- Self Update inteligent"
    ].join("\n");
  }

  function pageDeveloper(){
    mount(
      '<div class="card">'+
        '<h2>AI Developer</h2>'+
        '<p>Planifică patch-uri controlate. Nu aplică modificări distructive.</p>'+
        '<textarea class="codearea" id="devPrompt" placeholder="Scrie cerința de update...">Repară funcțiile lipsă ale paginilor conform scopului lor, fără restore și fără full rebuild.</textarea>'+
        '<div class="row" style="margin-top:14px">'+
          '<button class="primary" onclick="EPD.generatePatchPlan()">Generează patch plan</button>'+
          '<button onclick="EPD.open(\'SelfUpdate\')">Deschide Self Update</button>'+
          '<button onclick="EPD.healthDeveloper()">Health</button>'+
        '</div>'+
      '</div>'+
      '<div class="card"><h3>Raport AI Developer</h3><pre id="devOut">Nerulat.</pre></div>'
    );
  }

  function pageSettings(){
    const plan = currentPlan();

    mount(
      '<div class="card">'+
        '<h2>Setări / Cont</h2>'+
        '<div class="grid">'+
          '<label>Nume societate<input value="'+esc(state.settings.companyName)+'" oninput="EPD.setSetting(\'companyName\',this.value)"></label>'+
          '<label>Plan activ<select onchange="EPD.setPlan(this.value)">'+plans.map(p => '<option value="'+esc(p.id)+'" '+(p.id===state.activePlan?'selected':'')+'>'+esc(p.name)+'</option>').join("")+'</select></label>'+
          '<label>Limbă<input value="'+esc(state.settings.language)+'" oninput="EPD.setSetting(\'language\',this.value)"></label>'+
          '<label>Versiune UI<input value="'+esc(state.settings.uiMode)+'" oninput="EPD.setSetting(\'uiMode\',this.value)"></label>'+
        '</div>'+
        '<p>Plan curent: <b>'+esc(plan.name)+'</b> — '+esc(plan.price)+' '+esc(plan.currency)+'</p>'+
      '</div>'
    );
  }

  function pageLogs(){
    mount(
      '<div class="card">'+
        '<h2>Loguri</h2>'+
        '<div class="row">'+
          '<button onclick="EPD.exportLogs()">Export loguri</button>'+
          '<button class="danger" onclick="EPD.clearLogs()">Curăță loguri</button>'+
        '</div>'+
      '</div>'+
      '<div class="card"><pre>'+esc(JSON.stringify(state.logs,null,2))+'</pre></div>'
    );
  }

  const EPD = {
    login(developer){
      const email = document.getElementById("loginEmail").value || "user@epd.local";
      state.user = {email,name:email,role:developer ? "Developer" : "User",loginAt:new Date().toISOString()};
      if (developer) state.activePlan = "developer_lifetime";
      log("Login", developer ? "Intrare Developer" : "Autentificare utilizator");
      saveState();
      renderShell();
    },
    logout(){
      state.user = null;
      saveState();
      renderLogin();
    },
    open:openPage,
    setField(group,key,value){
      state[group][key] = value;
      saveState();
    },
    setStamp(key,value){
      state.stamps[key] = value;
      saveState();
    },
    setSetting(key,value){
      state.settings[key] = value;
      saveState();
    },
    setPlan(planId){
      state.activePlan = planId;
      log("Plan", "Plan activ setat: " + currentPlan().name);
      saveState();
      pageSettings();
    },
    saveProject(){
      saveState();
      log("Date proiect", "Date proiect salvate.");
      alert("Date proiect salvate.");
    },
    validateProject(){
      const missing = requiredProjectFields().filter(k => !state.project[k]);
      const msg = missing.length ? "Date proiect lipsă: " + missing.join(", ") : "Date proiect complete.";
      log("Validare proiect", msg);
      alert(msg);
      pageProject();
    },
    generateProjectPlaceholders(){
      const data = {};
      Object.keys(state.project).forEach(k => data["<"+k+">"] = state.project[k] || "[lipsă]");
      copyText(JSON.stringify(data,null,2));
      log("Placeholders", "Placeholder-e proiect generate.");
    },
    validateTechnical(){
      const missing = requiredTechnicalFields().filter(k => !state.technical[k]);
      const msg = missing.length ? "Date tehnice lipsă: " + missing.join(", ") : "Date tehnice complete.";
      log("Validare tehnică", msg);
      alert(msg);
      pageTechnical();
    },
    runCalculus(){
      runCalculus();
      saveState();
      pageTechnical();
    },
    exportCalculationReport(){
      runCalculus();
      const report = {
        generatedAt:new Date().toISOString(),
        project:state.project,
        technical:state.technical,
        explanation:"Raport generat din casetele inteligente de calcul variabil."
      };
      download("epd_raport_calcul.json", JSON.stringify(report,null,2), "application/json;charset=utf-8");
      log("Calcul", "Raport calcul exportat.");
    },
    generateDocument(){
      const id = document.getElementById("docTemplate").value;
      const tpl = templates.find(t => t.id === id) || templates[0];
      const body = replacePlaceholders(tpl.body);
      const doc = {
        id:"DOC-"+Date.now(),
        templateId:tpl.id,
        name:tpl.name,
        category:tpl.category,
        body,
        date:new Date().toLocaleString("ro-RO")
      };
      state.documents.unshift(doc);
      log("Documente", "Document generat: " + tpl.name);
      saveState();
      pageDocuments();
    },
    scanDocumentPlaceholders(){
      const id = document.getElementById("docTemplate").value;
      const tpl = templates.find(t => t.id === id) || templates[0];
      const matches = Array.from(tpl.body.matchAll(/<([^>]+)>/g)).map(m => m[1]);
      const values = getAllValues();
      const missing = matches.filter(k => !values[k]);
      alert(missing.length ? "Placeholder-e lipsă: " + missing.join(", ") : "Toate placeholder-ele au valori.");
    },
    previewDocument(i){
      const doc = state.documents[i];
      if (!doc) return;
      const el = document.getElementById("docPreview");
      if (el) el.textContent = doc.body;
    },
    copyLastDocument(){
      if (!state.documents[0]) return alert("Nu există document.");
      copyText(state.documents[0].body);
    },
    exportLastDocumentJson(){
      if (!state.documents[0]) return alert("Nu există document.");
      download("epd_document.json", JSON.stringify(state.documents[0],null,2), "application/json;charset=utf-8");
    },
    exportLastDocumentHtml(){
      if (!state.documents[0]) return alert("Nu există document.");
      const html = "<!doctype html><html><head><meta charset='utf-8'><title>"+esc(state.documents[0].name)+"</title></head><body><pre>"+esc(state.documents[0].body)+"</pre></body></html>";
      download("epd_document.html", html, "text/html;charset=utf-8");
    },
    saveStamps(){
      saveState();
      log("Ștampile", "Ștampile salvate.");
      alert("Ștampile salvate.");
      pageStamps();
    },
    loadEmailTemplate(){
      const id = document.getElementById("emailTemplate").value;
      const tpl = emailTemplates.find(t => t.id === id) || emailTemplates[0];
      document.getElementById("emailSubject").value = tpl.subject;
      document.getElementById("emailBody").value = tpl.body;
    },
    prepareEmail(){
      const to = document.getElementById("emailTo").value || state.project.email;
      const subject = replacePlaceholders(document.getElementById("emailSubject").value);
      const body = replacePlaceholders(document.getElementById("emailBody").value);
      const mailto = "mailto:" + encodeURIComponent(to) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      const email = {to,subject,body,mailto,smtpReady:true,date:new Date().toLocaleString("ro-RO")};
      state.emails.unshift(email);
      log("Email", "Email pregătit către " + to);
      saveState();
      pageEmails();
    },
    openMailClient(){
      if (!state.emails[0]) return alert("Pregătește întâi emailul.");
      location.href = state.emails[0].mailto;
    },
    copyLastEmail(){
      if (!state.emails[0]) return alert("Nu există email pregătit.");
      copyText("Către: "+state.emails[0].to+"\nSubiect: "+state.emails[0].subject+"\n\n"+state.emails[0].body);
    },
    certifySignature(){
      const cert = {
        certificateId:"EPD-CERT-"+Date.now(),
        role:document.getElementById("sigRole").value,
        signer:document.getElementById("sigSigner").value,
        documentTitle:document.getElementById("sigDoc").value,
        signatureType:"certificare internă demonstrabilă",
        legalNote:"Pentru semnătură calificată legală este necesar un provider eIDAS/certificat calificat.",
        certifiedAt:new Date().toISOString()
      };
      state.signatures.unshift(cert);
      log("Semnături", "Certificare internă generată.");
      saveState();
      pageSignatures();
    },
    exportCertificates(){
      download("epd_certificate_history.json", JSON.stringify(state.signatures,null,2), "application/json;charset=utf-8");
    },
    runFullAudit(){
      const report = {
        generatedAt:new Date().toISOString(),
        readiness:getReadiness(),
        interfaceAudit:auditInterface(),
        repairProposal:buildRepairProposal(),
        build:BUILD
      };
      state.selfUpdateReports.unshift(report);
      log("Audit", "Audit complet rulat.");
      saveState();
      alert("Audit complet rulat.");
      pageVerify();
    },
    copyVerificationReport(){
      copyText(JSON.stringify(getReadiness(),null,2));
    },
    exportVerificationJson(){
      download("epd_verificare_documentatie.json", JSON.stringify(getReadiness(),null,2), "application/json;charset=utf-8");
    },
    calculatePlanResult(){
      const result = calculatePlanResult();
      const el = document.getElementById("planResult");
      if (el) el.textContent = JSON.stringify(result,null,2);
    },
    purchasePlan(planId){
      const p = plans.find(x => x.id === planId);
      if (!p) return;
      state.activePlan = p.id;
      const intent = {
        purchaseIntentId:"EPD-PURCHASE-"+Date.now(),
        plan:p,
        amount:p.price,
        currency:p.currency,
        features:p.features,
        status:"created_demo_ready_for_payment_provider",
        providerReady:"Stripe / Netopia / SmartBill connector-ready",
        createdAt:new Date().toISOString()
      };
      state.purchases.unshift(intent);
      log("Purchasing", "Purchase intent creat: " + p.name);
      saveState();
      alert(JSON.stringify(intent,null,2));
      pagePlans();
    },
    createPurchaseIntent(){
      const planId = document.getElementById("purchasePlan").value;
      EPD.purchasePlan(planId);
      pagePurchasing();
    },
    exportPurchases(){
      download("epd_purchase_history.json", JSON.stringify(state.purchases,null,2), "application/json;charset=utf-8");
    },
    runCommand(){
      const text = String(document.getElementById("cmdBox").value || "").toLowerCase();
      const actions = [];
      let target = "Audit";

      if (text.includes("date proiect")) { actions.push("Completează Date proiect."); target = "Project"; }
      if (text.includes("calcul") || text.includes("if")) { actions.push("Rulează IF calculus."); target = "Calculations"; }
      if (text.includes("document")) { actions.push("Generează document cu placeholder-e."); target = "Documents"; }
      if (text.includes("placeholder")) { actions.push("Deschide registrul Placeholders."); target = "Placeholders"; }
      if (text.includes("ștampil") || text.includes("stamp")) { actions.push("Adaugă/mapează ștampile."); target = "Stamps"; }
      if (text.includes("email")) { actions.push("Pregătește email."); target = "Emails"; }
      if (text.includes("semn")) { actions.push("Certifică semnătură internă."); target = "Signatures"; }
      if (text.includes("verific") || text.includes("audit")) { actions.push("Rulează verificare documentație."); target = "Verify"; }
      if (text.includes("plan")) { actions.push("Alege plan recomandat."); target = "Plans"; }
      if (text.includes("cump") || text.includes("achizi")) { actions.push("Creează purchase intent."); target = "Purchasing"; }
      if (text.includes("update")) { actions.push("Deschide Self Update inteligent."); target = "SelfUpdate"; }

      if (!actions.length) actions.push("Nu am identificat exact comanda. Recomand să pornești din Audit interfață.");

      const result = {
        ok:true,
        interpretedIntent:text,
        targetPage:target,
        actions,
        missingPrerequisites:getReadiness().missing,
        button:"EPD.open('" + target + "')"
      };

      document.getElementById("cmdOut").textContent = JSON.stringify(result,null,2);
    },
    copyRaw(text){
      copyText(text);
    },
    copyAudit(){
      copyText(JSON.stringify({audit:auditInterface(),proposal:buildRepairProposal()},null,2));
    },
    exportAudit(){
      download("epd_audit_interfata.json", JSON.stringify({audit:auditInterface(),proposal:buildRepairProposal()},null,2), "application/json;charset=utf-8");
    },
    runSelfDiagnosis(){
      const report = {
        generatedAt:new Date().toISOString(),
        build:BUILD,
        loadedFrontend:"public/app.js",
        homepage:"public/index.html",
        backendHealth:"/api/health",
        readiness:getReadiness(),
        audit:auditInterface(),
        repairProposal:buildRepairProposal(),
        rules:[
          "NO RESTORE",
          "NO BLIND FULL REBUILD",
          "BACKUP BEFORE PATCH",
          "VALIDATE server.js",
          "VALIDATE public/app.js",
          "INTEGRATE INTO ACTUAL LOADED ARCHITECTURE"
        ]
      };
      state.selfUpdateReports.unshift(report);
      saveState();
      const out = document.getElementById("selfUpdateOut");
      if (out) out.textContent = JSON.stringify(report,null,2);
      log("Self Update", "Diagnostic local generat.");
    },
    copySelfUpdatePrompt(){
      const el = document.getElementById("selfUpdatePrompt");
      copyText(el ? el.value : buildSelfUpdatePrompt());
    },
    async callRunUpdate(){
      const prompt = document.getElementById("selfUpdatePrompt") ? document.getElementById("selfUpdatePrompt").value : buildSelfUpdatePrompt();
      const out = document.getElementById("selfUpdateOut");
      if (out) out.textContent = "Se apelează /api/update/run...";

      try{
        const r = await fetch("/api/update/run", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({text:prompt})
        });
        const txt = await r.text();
        let data;
        try{ data = JSON.parse(txt); } catch { data = {ok:r.ok,raw:txt}; }
        if (out) out.textContent = JSON.stringify(data,null,2);
        state.selfUpdateReports.unshift({date:new Date().toISOString(),route:"/api/update/run",response:data});
        saveState();
      }catch(err){
        if (out) out.textContent = "Eroare: " + err.message;
      }
    },
    generatePatchPlan(){
      const prompt = document.getElementById("devPrompt").value;
      const plan = {
        request:prompt,
        mode:"AI Developer local patch plan",
        rules:["NO RESTORE","NO FULL REBUILD orb","backup","node --check server.js","node --check public/app.js","patch aditiv"],
        architecture:"public/index.html + public/app.js + public/style.css",
        missing:getReadiness().missing,
        repairProposal:buildRepairProposal()
      };
      document.getElementById("devOut").textContent = JSON.stringify(plan,null,2);
    },
    async healthDeveloper(){
      const out = document.getElementById("devOut");
      try{
        const r = await fetch("/api/health");
        const j = await r.json();
        out.textContent = JSON.stringify(j,null,2);
      }catch(err){
        out.textContent = String(err);
      }
    },
    async healthLogin(){
      const out = document.getElementById("loginHealth");
      out.style.display = "block";
      try{
        const r = await fetch("/api/health");
        const j = await r.json();
        out.textContent = JSON.stringify(j,null,2);
      }catch(err){
        out.textContent = String(err);
      }
    },
    exportAll(){
      download("epd_v45_export.json", JSON.stringify(state,null,2), "application/json;charset=utf-8");
    },
    exportLogs(){
      download("epd_logs.json", JSON.stringify(state.logs,null,2), "application/json;charset=utf-8");
    },
    clearLogs(){
      if (!confirm("Ștergi logurile locale?")) return;
      state.logs = [];
      saveState();
      pageLogs();
    }
  };

  window.EPD = EPD;

  function boot(){
    if (!state.user) renderLogin();
    else renderShell();
  }

  boot();
})();
