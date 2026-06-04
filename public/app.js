let CONFIG = {};
let USER = null;
let currentPage = "Panou principal";
let industry = "Gaze naturale";
let workType = "Branșamente gaze naturale";
let data = JSON.parse(localStorage.getItem("epd_v3_data") || "{}");
let generated = JSON.parse(localStorage.getItem("epd_v3_generated") || "[]");

const pages = ["Panou principal","Date proiect","Date tehnice","Documentație","Șabloane OSD","Calcul","Ștampile","Email-uri","Verificări","Checklist","Registru proiecte","Import / Export","Planuri și licențe","Marketplace / Module","Asistent utilizator","AI Developer","Inside","Diagnostic","Actualizări","Construire / Lansare"];

async function boot(){
  CONFIG = await api("/api/config");
  fillProfile();
}
boot();

async function api(url, opts={}){
  const r = await fetch(url, {headers: {"Content-Type":"application/json"}, ...opts});
  return await r.json();
}
function toast(x){const t=document.getElementById("toast");t.textContent=x;t.classList.remove("hidden");setTimeout(()=>t.classList.add("hidden"),3000)}
function save(){localStorage.setItem("epd_v3_data",JSON.stringify(data));localStorage.setItem("epd_v3_generated",JSON.stringify(generated))}
function today(){return new Date().toISOString().slice(0,10)}
function now(){return new Date().toISOString().slice(0,19)}
function val(x,d=0){const n=Number(String(x??"").replace(",","."));return Number.isFinite(n)?n:d}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
function slug(s){return String(s||"element").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")||"element"}

async function health(){const h=await api("/api/health");document.getElementById("health").textContent=JSON.stringify(h)}
async function login(){
  const res = await api("/api/login",{method:"POST",body:JSON.stringify({user:document.getElementById("user").value,password:document.getElementById("pass").value})});
  if(!res.ok) return alert("Login incorect");
  USER=res.user; document.getElementById("login").classList.add("hidden"); document.getElementById("app").classList.remove("hidden"); buildNav(); openPage("Panou principal");
}
function fillProfile(){
  if(!CONFIG.profiles) return;
  document.getElementById("industry").innerHTML = CONFIG.profiles.industries.map(x=>`<option ${x===industry?"selected":""}>${x}</option>`).join("");
  document.getElementById("workType").innerHTML = CONFIG.profiles.workTypes.map(x=>`<option ${x===workType?"selected":""}>${x}</option>`).join("");
  refreshStatus();
}
function activeProfile(){return industry==="Gaze naturale" && workType==="Branșamente gaze naturale"}
function profileChanged(){industry=document.getElementById("industry").value;workType=document.getElementById("workType").value;refreshStatus();openPage(currentPage)}
function refreshStatus(){const s=document.getElementById("status"); if(!s)return; s.textContent=activeProfile()?"Activ":"Pregătit, blocat până la configurare"; s.parentElement.classList.toggle("warn",!activeProfile())}
function buildNav(){const nav=document.getElementById("nav");nav.innerHTML=pages.map(p=>`<button class="nav" onclick="openPage('${p}')">${p}</button>`).join("")}
function setTitle(t,sub=""){document.getElementById("title").textContent=t;document.getElementById("subtitle").textContent=sub||"EPD V3 Backend Ready";document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.textContent===t))}
function content(x){document.getElementById("content").innerHTML=x}

function openPage(p){
  currentPage=p; setTitle(p, activeProfile()?"Profil activ":"Profil blocat contextual");
  if(!activeProfile() && !["Panou principal","AI Developer","Actualizări","Diagnostic","Construire / Lansare","Planuri și licențe"].includes(p)){
    return content(`<div class="panel"><h3>${p} blocat</h3><p>Profilul ${industry} / ${workType} există în arhitectură, dar nu este configurat încă. Activează-l prin Service/AI Developer/Update Center.</p></div>`);
  }
  const map = {"Panou principal":dashboard,"Date proiect":()=>form("Date proiect"),"Date tehnice":()=>form("Date tehnice"),"Email-uri":()=>form("Email-uri"),"Calcul":calcPage,"Documentație":docsPage,"Șabloane OSD":templatesPage,"Ștampile":stampsPage,"Verificări":checksPage,"Checklist":checklistPage,"Registru proiecte":registryPage,"Import / Export":exportPage,"Planuri și licențe":plansPage,"Marketplace / Module":marketPage,"Asistent utilizator":assistantPage,"AI Developer":aiPage,"Inside":insidePage,"Diagnostic":diagPage,"Actualizări":updatesPage,"Construire / Lansare":releasePage};
  (map[p]||dashboard)();
}
function pageData(p){data[p]??=defaults(p);return data[p]}
function defaults(p){const o={};Object.values(CONFIG.fields?.[p]||{}).flat().forEach(([c,l,t,r,d])=>o[c]=d??"");return o}
function calculate(){const t=pageData("Date tehnice");const power=val(t.debit_instalat_kw,58),de=val(t.diametru_conducta_existenta_mm,90),db=val(t.diametru_bransament_mm,32);const debit=Math.round(power/9.5*100)/100,rec=Math.round(Math.max(debit*1.15,debit+.5)*100)/100;const meter=rec<=6?"G4":rec<=10?"G6":rec<=16?"G10":rec<=25?"G16":"dimensionare specială";Object.assign(t,{debit_calculat_mc_h:debit,debit_recomandat_mc_h:rec,tip_contor:meter,teu_bransament:`Teu/șa branșament ${Math.trunc(de)}-${Math.trunc(db)} mm`,mufa_bransament:`Mufă PE ${Math.trunc(db)} mm`,robinet_bransament:`Robinet branșament ${Math.trunc(db)} mm`,racord_tranzitie:`Racord tranziție ${Math.trunc(db)} mm`});save();return t}
function placeholders(){calculate();const d={...pageData("Date proiect"),...pageData("Date tehnice"),...pageData("Email-uri")};const o={};Object.entries(d).forEach(([k,v])=>o[`<${k}>`]=v);o["<data_generare>"]=now();return o}
function applyPH(txt){let r=String(txt);Object.entries(placeholders()).forEach(([k,v])=>r=r.split(k).join(String(v??"")));return r}
function generateDocs(){generated=Object.entries(CONFIG.templates||{}).map(([name,t])=>({name:name+".txt",content:applyPH(t)}));save();return generated.map(x=>x.name).join("\n")}

function dashboard(){calculate();const p=pageData("Date proiect");content(`<div class="grid"><div class="card"><small>Profil</small><h3>${workType}</h3></div><div class="card"><small>Proiect</small><h3>${esc(p.numar_proiect)}</h3></div><div class="card"><small>Beneficiar</small><h3>${esc(p.beneficiar)}</h3></div><div class="card"><small>Server</small><h3>Backend</h3></div></div><div class="panel"><h3>Flux principal</h3><div class="actions"><button class="primary" onclick="openPage('Date proiect')">Date proiect</button><button onclick="openPage('Date tehnice')">Date tehnice</button><button onclick="openPage('AI Developer')">AI Developer</button><button onclick="openPage('Actualizări')">Actualizări</button></div></div>`)}
function form(page){const groups=Object.keys(CONFIG.fields?.[page]||{});content(`<div class="tabs">${groups.map((g,i)=>`<button class="tab ${i?'':'active'}" onclick="group('${page}','${g}')">${g}</button>`).join("")}</div><div id="formarea"></div><div class="panel actions"><button class="primary" onclick="saveForm('${page}')">Salvează</button><button onclick="alert(phReport())">Substituenți</button>${page==="Date tehnice"?`<button onclick="saveForm('${page}');alert(calcReport())">Calculează</button>`:""}</div>`);group(page,groups[0])}
function group(page,g){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.textContent===g));const d=pageData(page);document.getElementById("formarea").innerHTML=`<div class="formgrid">${CONFIG.fields[page][g].map(([c,l,t,r,df])=>{const v=d[c]??df??"";const inp=t==="textarea"?`<textarea data-page="${page}" data-code="${c}">${esc(v)}</textarea>`:t==="checkbox"?`<label><input type="checkbox" data-page="${page}" data-code="${c}" ${v==="DA"?"checked":""}> DA</label>`:`<input type="${t}" data-page="${page}" data-code="${c}" value="${esc(v)}">`;return `<div class="field"><label>${l}${r?" *":""}</label>${inp}<small>&lt;${c}&gt;</small></div>`}).join("")}</div>`}
function saveForm(p){document.querySelectorAll(`[data-page="${p}"]`).forEach(el=>pageData(p)[el.dataset.code]=el.type==="checkbox"?(el.checked?"DA":"NU"):el.value);if(p==="Date tehnice")calculate();save();toast("Salvat")}
function phReport(){return Object.entries(placeholders()).map(([k,v])=>`${k} = ${v}`).join("\n")}
function calcReport(){const r=calculate();return [`Debit calculat: ${r.debit_calculat_mc_h} mc/h`,`Debit recomandat: ${r.debit_recomandat_mc_h} mc/h`,`Contor: ${r.tip_contor}`,`Teu/șa: ${r.teu_bransament}`,`Mufă: ${r.mufa_bransament}`,`Robinet: ${r.robinet_bransament}`].join("\n")}
function command(title,cmds){content(`<div class="panel"><h3>${title}</h3><div class="actions" id="cmds"></div></div><div class="panel output" id="out"></div>`);const c=document.getElementById("cmds"),o=document.getElementById("out");cmds.forEach(([l,fn],i)=>{const b=document.createElement("button");b.textContent=l;if(i===0)b.className="primary";b.onclick=async()=>o.textContent=String(await fn());c.appendChild(b)})}
function calcPage(){command("Calcul", [["Calculează",calcReport],["Substituenți",phReport]])}
function docsPage(){command("Documentație", [["Generează",generateDocs],["Preview",()=>generated.map(d=>`==== ${d.name} ====\n${d.content}`).join("\n\n")]])}
function templatesPage(){command("Șabloane OSD", [["Listă",()=>Object.keys(CONFIG.templates).join("\n")],["Substituenți",phReport]])}
function stampsPage(){command("Ștampile", [["Aplică marcaje",()=>{if(!generated.length)generateDocs();generated=generated.map(d=>({...d,content:d.content+"\n\nȘTAMPILE / AUTORIZĂRI\n[Societate]\n[VGD]\n[RTE]\n"}));save();return generated.map(x=>x.name).join("\n")} ]])}
function checks(){return ["Verificări",`Profil activ: ${activeProfile()}`,`Documente generate: ${generated.length}`,`Beneficiar: ${!!pageData("Date proiect").beneficiar}`,`Debit: ${!!calculate().debit_calculat_mc_h}`].join("\n")}
function checksPage(){command("Verificări", [["Rulează",checks]])}
function checklistPage(){content(`<div class="panel"><h3>Checklist</h3>${["Date proiect","Date tehnice","Calcul","Documente","Export"].map(x=>`<label><input type="checkbox"> ${x}</label>`).join("")}</div>`)}
function registryPage(){command("Registru proiecte", [["Date brute",()=>JSON.stringify(data,null,2)]])}
function exportProject(){const pack={at:now(),data,generated};download("EPD_V3_EXPORT.json",JSON.stringify(pack,null,2),"application/json")}
function exportPage(){command("Import / Export", [["Export JSON",()=>{exportProject();return "Exportat"}],["Export TXT",()=>{download("EPD_DOCUMENTE.txt",generated.map(d=>`== ${d.name} ==\n${d.content}`).join("\n\n"),"text/plain");return "TXT exportat"}]])}
function plansPage(){content(`<div class="panel"><h3>Planuri și licențe</h3><p>Planuri configurabile prin backend/fișiere data.</p></div>`)}
function marketPage(){content(`<div class="panel"><h3>Marketplace / Module</h3><p>Module: OSD, VGD, RTE, extinderi, instalații, studii, industrii viitoare.</p></div>`)}
function assistantPage(){command("Asistent utilizator", [["Ce lipsește?",checks],["Calculează",calcReport],["Generează",generateDocs]])}
function insidePage(){content(`<div class="panel"><h3>Inside</h3><p>Safe mode. Funcțiile destructive sunt blocate.</p></div>`)}
function diagPage(){command("Diagnostic", [["Health",async()=>JSON.stringify(await api("/api/health"),null,2)],["Config",()=>JSON.stringify(CONFIG.promptMaster,null,2)],["Verificări",checks]])}
function releasePage(){command("Construire / Lansare", [["Manifest",()=>JSON.stringify({version:"V3",profile:{industry,workType},at:now()},null,2)],["Descărcări",async()=>JSON.stringify(await api("/api/downloads"),null,2)]])}

function aiPage(){content(`<div class="panel"><h3>AI Developer</h3><p>Conectare OpenAI prin backend. Dacă OPENAI_API_KEY nu este setat, rulează analiza locală.</p><textarea id="aiText" placeholder="Prompt suplimentar pentru AI Developer..."></textarea><div class="actions"><button class="primary" onclick="aiAnalyze()">Analizează cu AI Developer</button><button onclick="openPage('Actualizări')">Upload prompturi</button></div></div><div class="panel output" id="out"></div>`)}
async function aiAnalyze(){const res=await api("/api/ai-developer/analyze",{method:"POST",body:JSON.stringify({text:document.getElementById("aiText").value})});document.getElementById("out").textContent=JSON.stringify(res,null,2)}
function updatesPage(){content(`<div class="panel"><h3>Actualizări / Run Update</h3><p>Încarcă fișiere prompt/conversație. AI Developer le citește prin backend și generează update package.</p><input type="file" id="files" multiple><textarea id="manualPrompt" placeholder="Sau lipește prompt manual..."></textarea><div class="actions"><button class="primary" onclick="uploadPrompts()">Upload prompturi</button><button onclick="listPrompts()">Listă prompturi</button><button onclick="runUpdate()">Run Update</button></div></div><div class="panel output" id="out"></div>`)}
async function uploadPrompts(){const fd=new FormData();[...document.getElementById("files").files].forEach(f=>fd.append("files",f));fd.append("text",document.getElementById("manualPrompt").value);const r=await fetch("/api/prompts/upload",{method:"POST",body:fd});document.getElementById("out").textContent=JSON.stringify(await r.json(),null,2)}
async function listPrompts(){document.getElementById("out").textContent=JSON.stringify(await api("/api/prompts"),null,2)}
async function runUpdate(){const r=await api("/api/update/run",{method:"POST",body:JSON.stringify({})});document.getElementById("out").textContent=JSON.stringify(r,null,2)}

function download(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
