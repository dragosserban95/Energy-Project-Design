(function(){
  "use strict";

  var STORE = "epd_final_v5_state";

  var plans = [
    {id:"basic_99",name:"Basic",department:"Introducere date",price:99,features:["date_proiect","date_tehnice_basic","document_preview","assistant_user"],exportAllowed:false},
    {id:"projectant_149",name:"Proiectant",department:"Proiectare",price:149,features:["date_proiect","date_tehnice","calcul_tehnic","document_generate","placeholder_replace","stamp_proiectant","email_prepare","export"],exportAllowed:true},
    {id:"executant_149",name:"Executant",department:"Execuție",price:149,features:["date_tehnice","checklist","document_generate","stamp_executant","registru"],exportAllowed:true},
    {id:"avize_129",name:"Avize",department:"Avize / OSD",price:129,features:["osd_templates","adresa_osd","email_osd","document_check"],exportAllowed:true},
    {id:"ofertare_119",name:"Ofertare",department:"Ofertare",price:119,features:["oferta","estimare_cost","email_client","purchase_intent"],exportAllowed:true},
    {id:"contabilitate_119",name:"Contabilitate",department:"Contabilitate",price:119,features:["client_data","contract_data","purchase_intent","invoice_ready"],exportAllowed:false},
    {id:"vgd_199",name:"VGD",department:"Verificator documentație",price:199,features:["vgd_check","stamp_vgd","signature_certify","document_authorize","document_check","export"],exportAllowed:true},
    {id:"rte_199",name:"RTE",department:"Responsabil tehnic execuție",price:199,features:["rte_check","stamp_rte","signature_certify","document_authorize","document_check","export"],exportAllowed:true},
    {id:"societate_399",name:"Societate",department:"Societate completă",price:399,features:["all_departments","all_documents","all_stamps","all_emails","all_signatures","audit","purchase_intent"],exportAllowed:true},
    {id:"developer_lifetime",name:"Developer",department:"Developer",price:0,features:["developer_audit","deep_scan","placeholders","patch_plan","run_update","all_features"],exportAllowed:true}
  ];

  var templates = [
    {
      id:"cerere_racordare",
      name:"Cerere racordare",
      body:"CERERE RACORDARE\n\nBeneficiar: <beneficiar>\nAdresă lucrare: <adresa_lucrare>, <localitate>, <judet>\nOSD: <osd>\nTip lucrare: <tip_lucrare>\nDebit instalat: <debit_instalat> mc/h\nPresiune regim: <presiune_regim>\n\nData: <data_document>\nProiectant: <proiectant>\n<stampila_proiectant>"
    },
    {
      id:"memoriu_tehnic",
      name:"Memoriu tehnic",
      body:"MEMORIU TEHNIC\n\nLucrare: <tip_lucrare>\nBeneficiar: <beneficiar>\nAmplasament: <adresa_lucrare>, <localitate>, <judet>\nConductă: <material_conducta>, DN <diametru_conducta>\nLungime branșament: <lungime_bransament> m\nPunct racordare: <punct_racordare>\nContor: <contor>\nRezultat calcul: <rezultat_calcul>\n\n<stampila_proiectant>\n<stampila_vgd>\n<stampila_rte>"
    },
    {
      id:"fisa_date_tehnice",
      name:"Fișă date tehnice",
      body:"FIȘĂ DATE TEHNICE\n\nBeneficiar: <beneficiar>\nDebit instalat: <debit_instalat>\nDebit calculat: <debit_calculat_mc_h>\nDebit recomandat: <debit_recomandat_mc_h>\nPutere instalată: <putere_instalata_kw>\nRisc presiune: <risc_presiune>\nEstimare cost: <estimare_cost>"
    },
    {
      id:"certificare_vgd",
      name:"Certificare VGD",
      body:"CERTIFICARE INTERNĂ VGD\n\nVerificator: <verificator_vgd>\nAtestat: <atestat_vgd>\nStatus: <status_vgd>\nData: <data_document>\n\n<stampila_vgd>\nSemnătură: <semnatura_vgd>"
    },
    {
      id:"certificare_rte",
      name:"Certificare RTE",
      body:"CERTIFICARE INTERNĂ RTE\n\nResponsabil RTE: <responsabil_rte>\nAutorizație: <autorizatie_rte>\nStatus: <status_rte>\nData: <data_document>\n\n<stampila_rte>\nSemnătură: <semnatura_rte>"
    }
  ];

  var placeholders = {
    "Login":["email_utilizator","parola","rol_utilizator","plan_utilizator","status_cont"],
    "Date proiect":["beneficiar","adresa_lucrare","localitate","judet","telefon","email","osd","tip_lucrare","numar_contract","data_contract","proiectant","executant"],
    "Date tehnice":["debit_instalat","presiune_regim","diametru_conducta","material_conducta","lungime_bransament","punct_racordare","contor","putere_instalata_kw","risc_presiune"],
    "Documente":["tip_document","continut_document","previzualizare_document","data_document","stampila_proiectant","stampila_vgd","stampila_rte"],
    "Ștampile":["stampila_proiectant","stampila_vgd","stampila_rte"],
    "Email-uri":["email_destinatar","email_subiect","email_continut","mailto"],
    "Semnături":["semnatura_proiectant","semnatura_vgd","semnatura_rte","certificat_intern"],
    "Planuri":["plan_id","departament","pret","features","purchase_intent"],
    "Audit":["audit_login","audit_pagini","audit_butoane","audit_backend","audit_frontend","audit_vandabilitate"]
  };

  var defaults = {
    user:null,
    plan:"developer_lifetime",
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
      responsabil_rte:""
    },
    technical:{
      debit_instalat:"",
      presiune_regim:"",
      diametru_conducta:"",
      material_conducta:"PEHD",
      lungime_bransament:"",
      punct_racordare:"",
      contor:"",
      putere_instalata_kw:"",
      debit_calculat_mc_h:"",
      debit_recomandat_mc_h:"",
      risc_presiune:"",
      estimare_cost:"",
      rezultat_calcul:""
    },
    stamps:{proiectant:"",vgd:"",rte:""},
    docs:[],
    emails:[],
    signatures:[],
    purchases:[],
    logs:[]
  };

  function clone(x){ return JSON.parse(JSON.stringify(x)); }

  var state = load();

  function load(){
    try {
      var raw = JSON.parse(localStorage.getItem(STORE) || "{}");
      return merge(clone(defaults), raw);
    } catch(e) {
      return clone(defaults);
    }
  }

  function merge(a,b){
    Object.keys(b || {}).forEach(function(k){
      if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && a[k]) a[k] = merge(a[k], b[k]);
      else a[k] = b[k];
    });
    return a;
  }

  function save(){
    localStorage.setItem(STORE, JSON.stringify(state));
  }

  function esc(v){
    return String(v == null ? "" : v).replace(/[&<>"']/g,function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }

  function log(type,msg){
    state.logs.unshift({type:type,message:msg,date:new Date().toLocaleString("ro-RO")});
    save();
  }

  function card(t,b){ return '<div class="card"><h3>'+esc(t)+'</h3>'+b+'</div>'; }

  function mount(html){ document.getElementById("view").innerHTML = html; }

  function field(group,key,label){
    return '<label>'+esc(label)+'<input value="'+esc(state[group][key])+'" oninput="EPD.setField(\''+group+'\',\''+key+'\',this.value)"></label>';
  }

  function area(group,key,label){
    return '<label>'+esc(label)+'<textarea oninput="EPD.setField(\''+group+'\',\''+key+'\',this.value)">'+esc(state[group][key])+'</textarea></label>';
  }

  function complete(){
    var items = [
      state.user,
      state.project.beneficiar,
      state.project.adresa_lucrare,
      state.project.localitate,
      state.project.judet,
      state.technical.debit_instalat,
      state.technical.diametru_conducta,
      state.stamps.proiectant,
      state.docs.length,
      state.emails.length,
      state.signatures.length
    ];
    var ok = items.filter(Boolean).length;
    return Math.round(ok / items.length * 100);
  }

  function render(){
    if (!state.user) return renderLogin();

    var nav = [
      ["Dashboard","Panou principal"],
      ["Project","Date proiect"],
      ["Technical","Date tehnice"],
      ["Docs","Documente"],
      ["Stamps","Ștampile"],
      ["Emails","Email-uri"],
      ["Signatures","Semnături digitale"],
      ["Plans","Planuri departamente"],
      ["Assistant","Asistent comenzi"],
      ["Placeholders","Placeholders"],
      ["Audit","Audit interfață"],
      ["Developer","AI Developer"]
    ];

    document.getElementById("app").innerHTML =
      '<div class="app">'+
        '<aside class="sidebar">'+
          '<div class="logo"><div class="logo-mark">EPD</div><div><b>Energy Project Design</b><div class="muted">V5.0 Sellable</div></div></div>'+
          '<div class="nav"><div class="nav-title">Aplicație</div>'+
          nav.map(function(n){ return '<button id="nav_'+n[0]+'" onclick="EPD.open(\''+n[0]+'\')">'+esc(n[1])+'</button>'; }).join("")+
          '</div>'+
        '</aside>'+
        '<main class="main">'+
          '<div class="topbar">'+
            '<div><b>'+esc(state.user.name)+'</b><div class="muted">Plan activ: '+esc(state.plan)+'</div></div>'+
            '<div class="row"><span class="badge">V5.0</span><span class="badge">Completare '+complete()+'%</span><button onclick="EPD.exportData()">Export</button><button onclick="EPD.logout()">Logout</button></div>'+
          '</div>'+
          '<div id="view"></div>'+
        '</main>'+
      '</div>';

    open("Dashboard");
  }

  function renderLogin(){
    document.getElementById("app").innerHTML =
      '<div class="login">'+
        '<div class="login-card">'+
          '<div class="login-hero">'+
            '<div class="logo-mark">EPD</div>'+
            '<h1>Energy Project Design Services</h1>'+
            '<p>Platformă V5 pentru proiecte gaze naturale: date proiect, date tehnice, documente cu placeholder-e, ștampile, email-uri, semnături, planuri și audit.</p>'+
            '<p><b>Produs pregătit pentru prezentare și listare.</b></p>'+
          '</div>'+
          '<div class="login-form">'+
            '<h2>Autentificare</h2>'+
            '<label>Email<input id="loginEmail" value="developer@epd.local"></label>'+
            '<label>Parolă<input id="loginPass" type="password" value="developer"></label>'+
            '<div class="row"><button class="primary" onclick="EPD.login()">Intră în aplicație</button><button onclick="EPD.loginDeveloper()">Developer</button></div>'+
            '<p class="muted">Autentificare demonstrabilă local. Backend-ul rămâne stabil pe Render.</p>'+
          '</div>'+
        '</div>'+
      '</div>';
  }

  function open(page){
    document.querySelectorAll(".nav button").forEach(function(b){ b.classList.remove("active"); });
    var n = document.getElementById("nav_"+page);
    if (n) n.classList.add("active");

    var pages = {
      Dashboard:dashboard,
      Project:project,
      Technical:technical,
      Docs:docs,
      Stamps:stamps,
      Emails:emails,
      Signatures:signatures,
      Plans:plansPage,
      Assistant:assistant,
      Placeholders:placeholdersPage,
      Audit:audit,
      Developer:developer
    };
    (pages[page] || dashboard)();
  }

  function dashboard(){
    var p = complete();
    mount(
      '<div class="grid3">'+
        card("Nivel aplicație",'<h2>V5.0</h2><p>Interfață vandabilă pentru prezentare.</p>')+
        card("Completare",'<div class="progress"><span style="width:'+p+'%"></span></div><p><b>'+p+'%</b></p>')+
        card("Backend",'<button onclick="EPD.health()">Verifică /api/health</button><pre id="healthBox"></pre>')+
      '</div>'+
      '<div class="card"><h2>Workflow principal</h2><p>Date proiect → Date tehnice → Documente → Ștampile → Email-uri → Semnături → Planuri → Audit.</p><div class="row"><button class="primary" onclick="EPD.open(\'Project\')">Începe proiect</button><button onclick="EPD.open(\'Docs\')">Generează document</button><button onclick="EPD.open(\'Plans\')">Planuri și purchasing</button></div></div>'
    );
  }

  function project(){
    mount('<div class="card"><h2>Date proiect</h2><div class="grid">'+
      field("project","beneficiar","Beneficiar")+
      field("project","adresa_lucrare","Adresă lucrare")+
      field("project","localitate","Localitate")+
      field("project","judet","Județ")+
      field("project","telefon","Telefon")+
      field("project","email","Email")+
      field("project","osd","OSD")+
      field("project","tip_lucrare","Tip lucrare")+
      field("project","numar_contract","Număr contract")+
      field("project","data_contract","Data contract")+
      field("project","proiectant","Proiectant")+
      field("project","executant","Executant")+
      field("project","verificator_vgd","Verificator VGD")+
      field("project","responsabil_rte","Responsabil RTE")+
      '</div><div class="row"><button class="primary" onclick="EPD.saveProject()">Salvează</button><button onclick="EPD.open(\'Technical\')">Continuă</button></div></div>');
  }

  function technical(){
    mount('<div class="card"><h2>Date tehnice + IF calculus</h2><div class="grid">'+
      field("technical","debit_instalat","Debit instalat mc/h")+
      field("technical","presiune_regim","Presiune regim")+
      field("technical","diametru_conducta","Diametru conductă")+
      field("technical","material_conducta","Material conductă")+
      field("technical","lungime_bransament","Lungime branșament m")+
      field("technical","punct_racordare","Punct racordare")+
      field("technical","contor","Contor")+
      field("technical","estimare_cost","Estimare cost")+
      '</div><div class="row"><button class="primary" onclick="EPD.calc()">Rulează calcule</button><button onclick="EPD.open(\'Docs\')">Documente</button></div></div>'+
      '<div class="card"><h3>Rezultat</h3><pre>'+esc(JSON.stringify(state.technical,null,2))+'</pre></div>');
  }

  function replacePlaceholders(txt){
    var vals = {};
    Object.assign(vals,state.project,state.technical);
    vals.data_document = new Date().toISOString().slice(0,10);
    vals.stampila_proiectant = state.stamps.proiectant || "[Ștampilă proiectant]";
    vals.stampila_vgd = state.stamps.vgd || "[Ștampilă VGD]";
    vals.stampila_rte = state.stamps.rte || "[Ștampilă RTE]";
    vals.semnatura_vgd = "[Semnătură internă VGD]";
    vals.semnatura_rte = "[Semnătură internă RTE]";
    return String(txt).replace(/<([a-zA-Z0-9_ăîâșțĂÎÂȘȚ]+)>/g,function(m,k){ return vals[k] || m; });
  }

  function docs(){
    var opts = templates.map(function(t){ return '<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>'; }).join("");
    mount('<div class="card"><h2>Generare documente cu placeholder-e</h2><label>Template<select id="docTemplate">'+opts+'</select></label><div class="row"><button class="primary" onclick="EPD.generateDoc()">Generează document</button><button onclick="EPD.copyDoc()">Copiază document</button></div></div>'+
      '<div class="card"><h3>Preview document</h3><div class="doc" id="docPreview">'+esc(state.docs[0] ? state.docs[0].body : "Nu există document generat.")+'</div></div>'+
      '<div class="card"><h3>Istoric</h3>'+docsTable()+'</div>');
  }

  function docsTable(){
    if (!state.docs.length) return '<p class="muted">Nu există documente.</p>';
    return '<table class="table"><tr><th>Document</th><th>Data</th></tr>'+state.docs.map(function(d){ return '<tr><td>'+esc(d.name)+'</td><td>'+esc(d.date)+'</td></tr>'; }).join("")+'</table>';
  }

  function stamps(){
    mount('<div class="card"><h2>Ștampile în documente</h2><div class="grid">'+
      area("stamps","proiectant","Ștampilă proiectant")+
      area("stamps","vgd","Ștampilă VGD")+
      area("stamps","rte","Ștampilă RTE")+
      '</div><button class="primary" onclick="EPD.saveStamps()">Salvează ștampile</button></div>');
  }

  function emails(){
    mount('<div class="card"><h2>Email-uri</h2><label>Către<input id="emailTo" value="'+esc(state.project.email)+'"></label><label>Subiect<input id="emailSubject" value="Documentație EPD - <beneficiar>"></label><label>Conținut<textarea id="emailBody">Bună ziua,\n\nVă transmitem documentația pentru <beneficiar>, lucrarea <tip_lucrare>.\n\nCu stimă,\n<proiectant></textarea></label><div class="row"><button class="primary" onclick="EPD.prepareEmail()">Pregătește email</button><button onclick="EPD.openMail()">Deschide client email</button></div></div><div class="card"><h3>Ultimul email</h3><pre>'+esc(JSON.stringify(state.emails[0] || {},null,2))+'</pre></div>');
  }

  function signatures(){
    mount('<div class="card"><h2>Certificare digitală semnături</h2><p>Workflow intern demonstrabil. Pentru semnătură calificată se conectează provider eIDAS.</p><div class="grid"><label>Rol<select id="sigRole"><option>proiectant</option><option>vgd</option><option>rte</option></select></label><label>Semnatar<input id="sigSigner" value="'+esc(state.project.proiectant || state.project.verificator_vgd || state.project.responsabil_rte)+'"></label><label>Document<input id="sigDoc" value="Documentație EPD"></label></div><button class="primary" onclick="EPD.certify()">Certifică intern</button></div><div class="card"><h3>Certificate</h3><pre>'+esc(JSON.stringify(state.signatures,null,2))+'</pre></div>');
  }

  function plansPage(){
    var rows = plans.map(function(p){
      return '<tr><td><b>'+esc(p.name)+'</b></td><td>'+esc(p.department)+'</td><td>'+esc(p.price)+' EUR / lună</td><td>'+p.features.map(function(f){ return '<span class="chip">'+esc(f)+'</span>'; }).join("")+'</td><td><button class="primary" onclick="EPD.purchase(\''+esc(p.id)+'\')">Purchasing</button></td></tr>';
    }).join("");
    mount('<div class="card"><h2>Planuri departamente</h2><p>Fiecare rezultantă de plan are preț și funcții alocate.</p></div><div class="card"><table class="table"><tr><th>Plan</th><th>Departament</th><th>Preț</th><th>Funcții</th><th>Achiziție</th></tr>'+rows+'</table></div>');
  }

  function assistant(){
    mount('<div class="card"><h2>Asistent comenzi</h2><textarea id="cmd" placeholder="Ex: generează memoriu tehnic, adaugă ștampilă VGD, pregătește email către OSD"></textarea><button class="primary" onclick="EPD.command()">Execută comandă</button></div><div class="card"><h3>Răspuns</h3><pre id="cmdOut"></pre></div>');
  }

  function placeholdersPage(){
    var html = Object.keys(placeholders).map(function(k){
      return '<div class="card"><h3>'+esc(k)+'</h3>'+placeholders[k].map(function(p){ return '<span class="chip">&lt;'+esc(p)+'&gt;</span>'; }).join("")+'</div>';
    }).join("");
    mount('<div class="card"><h2>Placeholders</h2><p>Registru central structurat pe pagini.</p></div>'+html);
  }

  function audit(){
    var checks = [
      ["Login",!!state.user],
      ["Date proiect",!!(state.project.beneficiar && state.project.adresa_lucrare)],
      ["Date tehnice",!!(state.technical.debit_instalat && state.technical.diametru_conducta)],
      ["Calcule",!!state.technical.rezultat_calcul],
      ["Documente",state.docs.length>0],
      ["Ștampile",!!(state.stamps.proiectant || state.stamps.vgd || state.stamps.rte)],
      ["Email-uri",state.emails.length>0],
      ["Semnături",state.signatures.length>0],
      ["Planuri",plans.length>=10],
      ["Purchasing",true],
      ["Asistent comenzi",true],
      ["Export",true]
    ];
    var rows = checks.map(function(c){ return '<tr><td>'+esc(c[0])+'</td><td class="'+(c[1]?"ok":"bad")+'">'+(c[1]?"OK":"Lipsă / de completat")+'</td></tr>'; }).join("");
    mount('<div class="card"><h2>Audit interfață și funcții</h2><p>Diagnostic pagină cu pagină, pornind de la Login.</p><table class="table"><tr><th>Funcție</th><th>Status</th></tr>'+rows+'</table></div><div class="card"><h3>Loguri</h3><pre>'+esc(JSON.stringify(state.logs,null,2))+'</pre></div>');
  }

  function developer(){
    mount('<div class="card"><h2>AI Developer</h2><textarea id="devPrompt" placeholder="Cerință update..."></textarea><div class="row"><button class="primary" onclick="EPD.patchPlan()">Patch plan</button><button onclick="EPD.health()">Health</button></div></div><div class="card"><h3>Raport</h3><pre id="devOut"></pre></div>');
  }

  window.EPD = {
    login:function(){
      var email = document.getElementById("loginEmail").value || "developer@epd.local";
      state.user = {email:email,name:email,role:"User"};
      log("login","Autentificare utilizator");
      save();
      render();
    },
    loginDeveloper:function(){
      var email = document.getElementById("loginEmail").value || "developer@epd.local";
      state.user = {email:email,name:email,role:"Developer"};
      state.plan = "developer_lifetime";
      log("login","Autentificare Developer");
      save();
      render();
    },
    logout:function(){
      state.user = null;
      save();
      render();
    },
    open:open,
    setField:function(g,k,v){
      state[g][k] = v;
      save();
    },
    saveProject:function(){
      log("date proiect","Date proiect salvate");
      save();
      alert("Date proiect salvate.");
    },
    calc:function(){
      var debit = Number(String(state.technical.debit_instalat || "0").replace(",","."));
      var lungime = Number(String(state.technical.lungime_bransament || "0").replace(",","."));
      state.technical.putere_instalata_kw = debit ? (debit*10.6).toFixed(2) : "";
      state.technical.debit_calculat_mc_h = debit ? debit.toFixed(2) : "";
      state.technical.debit_recomandat_mc_h = debit ? (debit*1.1).toFixed(2) : "";
      state.technical.risc_presiune = lungime > 30 ? "verificare necesară" : "normal";
      state.technical.estimare_cost = lungime ? (lungime*120).toFixed(0)+" RON estimativ" : "";
      state.technical.rezultat_calcul = "IF calculus generat.";
      log("calcul","IF calculus generat");
      save();
      technical();
    },
    saveStamps:function(){
      log("ștampile","Ștampile salvate");
      save();
      alert("Ștampile salvate.");
    },
    generateDoc:function(){
      var id = document.getElementById("docTemplate").value;
      var t = templates.filter(function(x){ return x.id === id; })[0] || templates[0];
      var body = replacePlaceholders(t.body);
      state.docs.unshift({id:Date.now(),name:t.name,body:body,date:new Date().toLocaleString("ro-RO")});
      log("document","Document generat: "+t.name);
      save();
      docs();
    },
    copyDoc:function(){
      if (!state.docs[0]) return alert("Nu există document.");
      navigator.clipboard.writeText(state.docs[0].body);
      alert("Document copiat.");
    },
    prepareEmail:function(){
      var to = document.getElementById("emailTo").value || state.project.email;
      var subject = replacePlaceholders(document.getElementById("emailSubject").value);
      var body = replacePlaceholders(document.getElementById("emailBody").value);
      var mailto = "mailto:"+encodeURIComponent(to)+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
      state.emails.unshift({to:to,subject:subject,body:body,mailto:mailto,date:new Date().toLocaleString("ro-RO"),smtpReady:true});
      log("email","Email pregătit");
      save();
      emails();
    },
    openMail:function(){
      if (!state.emails[0]) return alert("Pregătește întâi emailul.");
      location.href = state.emails[0].mailto;
    },
    certify:function(){
      var cert = {
        certificateId:"EPD-CERT-"+Date.now(),
        role:document.getElementById("sigRole").value,
        signer:document.getElementById("sigSigner").value,
        documentTitle:document.getElementById("sigDoc").value,
        signatureType:"certificare internă",
        legalNote:"Pentru semnătură calificată se conectează provider eIDAS.",
        certifiedAt:new Date().toISOString()
      };
      state.signatures.unshift(cert);
      log("semnătură","Certificare internă generată");
      save();
      signatures();
    },
    purchase:function(planId){
      var p = plans.filter(function(x){ return x.id === planId; })[0];
      var intent = {purchaseIntentId:"EPD-PURCHASE-"+Date.now(),plan:p,amount:p.price,currency:"EUR",status:"created_demo_ready_for_payment_provider"};
      state.purchases.unshift(intent);
      state.plan = p.id;
      log("purchasing","Purchase intent "+p.name);
      save();
      alert(JSON.stringify(intent,null,2));
      plansPage();
    },
    command:function(){
      var t = String(document.getElementById("cmd").value || "").toLowerCase();
      var actions = [];
      if (t.indexOf("document") >= 0) actions.push("Deschide Documente și generează template.");
      if (t.indexOf("stamp") >= 0 || t.indexOf("ștampil") >= 0) actions.push("Deschide Ștampile și completează rolurile.");
      if (t.indexOf("email") >= 0) actions.push("Deschide Email-uri și pregătește mesaj.");
      if (t.indexOf("semn") >= 0) actions.push("Deschide Semnături digitale.");
      if (t.indexOf("plan") >= 0 || t.indexOf("preț") >= 0 || t.indexOf("pret") >= 0) actions.push("Deschide Planuri departamente.");
      if (!actions.length) actions.push("Pornește din Audit interfață.");
      document.getElementById("cmdOut").textContent = JSON.stringify({ok:true,actions:actions},null,2);
    },
    patchPlan:function(){
      var text = document.getElementById("devPrompt").value;
      var out = {
        ok:true,
        request:text,
        rules:["NO RESTORE","NO FULL REBUILD fără aprobare","backup înainte","node --check după","patch aditiv"],
        recommendation:"Aplică doar modificări țintite pe pagina/funcția cerută."
      };
      document.getElementById("devOut").textContent = JSON.stringify(out,null,2);
    },
    health:async function(){
      try{
        var r = await fetch("/api/health");
        var j = await r.json();
        var el = document.getElementById("healthBox") || document.getElementById("devOut");
        if (el) el.textContent = JSON.stringify(j,null,2);
      }catch(e){
        alert(String(e));
      }
    },
    exportData:function(){
      var blob = new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "epd_v5_export.json";
      a.click();
    }
  };

  render();
})();
