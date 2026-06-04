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
function val(x,d=0){const n=Number(String(x??""").replace(",","."));return Number.isFinite(n)?n:d}
function esc(s){return String(s??""").replace(/[&<>\