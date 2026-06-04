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
function val(x,d=0){const n=Number(String(x??"{}").replace(",","."));return Number.isFinite(n)?n:d}
function esc(s){return String(s??"").replace(/[&<>"]+/g,c=>{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])}
function slug(s){return String(s||"element").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"*").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")||"element"}

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
  // remaining code...
}

// Function to handle new document upload
async function uploadDocument(){
  const fd=new FormData();
  const files=document.getElementById('newFiles').files;
  Array.from(files).forEach(file => fd.append('files', file));
  const response=await fetch('/api/documents/upload', {method:"POST", body:fd});
  const result=await response.json();
  toast(result.message);
}
