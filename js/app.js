/* Panorama del TEA en Colombia: motor y gráficos interactivos (SVG, sin dependencias). */
(function(){
"use strict";

const D = window.TEA_DATOS;
const C = window.TEA_CONTENIDO;
const DEP = D.deptos.slice();
const BY = {}; DEP.forEach(d=>{ BY[d.cod] = d; });
const NAC = { pob: 52613753, pers24: 51474, tasa24: 97.8, sedes100k: 1.12, pctFuera: 11.4, atenPorPersona: 12.1, tasaAten: 1214 };
// Tasa de atención = atenciones a personas con F84 / personas atendidas con F84 x 100 (denominador: personas con TEA atendidas)
DEP.forEach(d=>{ d.tasaAten = d.pers24 ? 100*d.aten24/d.pers24 : null; d.esperados = d.pob/127; d.pctEsp = 100*d.pers24/d.esperados; d.pctEsp25 = 100*d.pers25/d.esperados; d.pctLocal = 100 - d.pctFuera; d.pctConSede = 100 - d.pctSinSede; });
// Totales del cubo nacional (personas únicas, con y sin departamento de residencia)
const CUBO = { p24: 54367, p25: 109135 };
const REGION_ORDER = ["Caribe","Bogotá","Central","Oriental","Pacífica","Amazonía-Orinoquía"];
const REGION_CLASS = { "Caribe":"rg-caribe", "Bogotá":"rg-bogota", "Central":"rg-central", "Oriental":"rg-oriental", "Pacífica":"rg-pacifica", "Amazonía-Orinoquía":"rg-amazonia" };
const SVGNS = "http://www.w3.org/2000/svg";

/* ---------------------------------------------------------------- utilidades */
function el(tag, attrs, children){
  const node = document.createElement(tag);
  if(attrs){ Object.keys(attrs).forEach(k=>{
    if(attrs[k] === null || attrs[k] === undefined || attrs[k] === false) return;
    if(k === "class") node.setAttribute("class", attrs[k]);
    else if(k === "html") node.innerHTML = attrs[k];
    else if(k.startsWith("on") && typeof attrs[k] === "function") node.addEventListener(k.slice(2), attrs[k]);
    else node.setAttribute(k, attrs[k]);
  }); }
  (children||[]).forEach(c=>{ if(c !== null && c !== undefined && c !== false) node.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c); });
  return node;
}
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function fmt(n, dec){
  if(n === null || n === undefined || isNaN(n)) return "n.d.";
  const d = dec === undefined ? 0 : dec;
  return Number(n).toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/^-/, "−");
}
function svgEl(w, h, cls, label){
  const s = document.createElementNS(SVGNS, "svg");
  s.setAttribute("viewBox", "0 0 " + w + " " + h);
  s.setAttribute("class", "chart-svg " + (cls||"") + (w >= 600 && !/map-svg|size-legend|story-svg/.test(cls||"") ? " wide-svg" : ""));
  s.setAttribute("role", "img");
  if(label) s.setAttribute("aria-label", label);
  return s;
}
function niceStep(raw){
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
}
function niceMax(v){
  if(v <= 0) return 1;
  const st = niceStep(v / 5);
  return Math.ceil(v / st - 1e-9) * st;
}
function ticks(max){
  const st = niceStep(max / 5);
  const out = []; for(let t=0; t <= max + st*1e-6; t += st) out.push(+t.toFixed(6)); return out;
}
function sourceLine(text){ return el("p",{class:"chart-source"},[text]); }
function callout(text, kind){ return el("div",{class:"callout " + (kind||"")},[text]); }
function confidenceTag(level){
  const L = { verificado:"Verificado en fuente pública", "nota-autor":"Lectura del equipo", pendiente:"Pendiente de verificación", preliminar:"Resultado preliminar" };
  return el("span",{class:"confidence-tag confidence-"+level, title:"Procedencia del dato: "+(L[level]||level)},[L[level]||level]);
}
function scrollSoon(id){
  // La sección se abre con una transición de altura; mientras dura, la página aún no tiene su
  // altura final y el desplazamiento se queda corto (caía en el encabezado). Al navegar a un
  // elemento concreto se despliega su sección sin animación y luego se desplaza.
  const t = document.getElementById(id), it = t && t.closest(".acc-item");
  if(it){ it.classList.add("instant"); void it.offsetHeight; }
  scrollToId(id);
  window.setTimeout(()=>{ if(it) it.classList.remove("instant"); scrollToId(id); }, 350);
}
function scrollToId(id){
  const t = document.getElementById(id); if(!t) return;
  const y = t.getBoundingClientRect().top + window.scrollY - 86;
  window.scrollTo({ top: y, behavior: "smooth" });
}
function downloadCSV(filename, header, rows){
  const lines = [header.join(";")].concat(rows.map(r=> r.map(v=>{
    if(v === null || v === undefined) return "";
    const s = typeof v === "number" ? String(v).replace(".", ",") : String(v);
    return /[;"\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
  }).join(";")));
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = el("a",{ href: URL.createObjectURL(blob), download: filename });
  document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 400);
}

/* ---------------------------------------------------------------- tooltip compartido */
const tip = el("div",{ class:"chart-tip", role:"tooltip", hidden:"" });
document.body.appendChild(tip);
function showTip(html, evt, anchor){
  tip.innerHTML = html; tip.hidden = false;
  let x, y;
  if(evt && evt.clientX !== undefined && evt.type !== "focus"){ x = evt.clientX; y = evt.clientY; }
  else if(anchor){ const r = anchor.getBoundingClientRect(); x = r.left + r.width/2; y = r.top; }
  else return;
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  let left = x + 14, top = y - th - 12;
  if(left + tw > window.innerWidth - 8) left = x - tw - 14;
  if(left < 8) left = 8;
  if(top < 8) top = y + 18;
  tip.style.left = left + "px"; tip.style.top = top + "px";
}
function hideTip(){ tip.hidden = true; }
function bindTip(node, htmlFn){
  node.addEventListener("mousemove", e=> showTip(htmlFn(), e));
  node.addEventListener("mouseleave", hideTip);
  node.addEventListener("focus", e=> showTip(htmlFn(), e, node));
  node.addEventListener("blur", hideTip);
}
window.addEventListener("scroll", hideTip, { passive:true });

/* ---------------------------------------------------------------- estado compartido */
const STATE = { sel: "41", listeners: [] };
function onSelect(fn){ STATE.listeners.push(fn); }
function selectDept(cod){ if(!BY[cod]) return; STATE.sel = cod; STATE.listeners.forEach(fn=>fn(cod)); }

/* ---------------------------------------------------------------- tema */
const THEME_KEY = "teaco_theme";
function applyTheme(mode){
  if(mode === "light" || mode === "dark") document.documentElement.setAttribute("data-theme", mode);
  else document.documentElement.removeAttribute("data-theme");
}
function currentTheme(){
  const a = document.documentElement.getAttribute("data-theme");
  if(a) return a;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
try{ applyTheme(localStorage.getItem(THEME_KEY)); }catch(e){}
const TEXT_KEY = "teaco_text", TEXT_SIZES = [ { k:"0", l:"Normal", p:"100 %" }, { k:"1", l:"Grande", p:"115 %" }, { k:"2", l:"Muy grande", p:"130 %" }, { k:"3", l:"Máximo", p:"150 %" } ];
function applyTextSize(k){ if(!TEXT_SIZES.some(t=> t.k === k)) k = "0"; document.documentElement.setAttribute("data-text", k); try{ localStorage.setItem(TEXT_KEY, k); }catch(e){} document.querySelectorAll(".ts-opt").forEach(b=> b.setAttribute("aria-pressed", b.dataset.k === k ? "true" : "false")); }
try{ const k0 = localStorage.getItem(TEXT_KEY); if(k0) document.documentElement.setAttribute("data-text", k0); }catch(e){}
function stepTextSize(d){ const cur = +(document.documentElement.getAttribute("data-text") || 0); applyTextSize(String(Math.max(0, Math.min(3, cur + d)))); }
function toggleTheme(){
  const next = currentTheme() === "dark" ? "light" : "dark";
  applyTheme(next); try{ localStorage.setItem(THEME_KEY, next); }catch(e){}
}

/* ---------------------------------------------------------------- secciones: de lo descriptivo a los cruces */
const PARTS = [
  { id:"I", k:"Primera parte", t:"El marco: qué explica la atención y qué ordenan las normas", d:"Qué factores explican la atención del autismo y qué ordenan la Ley 2628 y la Política de Salud Mental." },
  { id:"II", k:"Segunda parte", t:"Los datos: qué muestran los registros públicos", d:"Qué muestran los registros públicos, primero la prevalencia (absoluta, relativa y esperada), luego la cobertura (frecuencia y cercanía) y después la oferta, la pobreza y la desigualdad." },
  { id:"III", k:"Tercera parte", t:"¿Cómo se hizo?", d:"La revisión sistemática en curso, los métodos, el glosario y las referencias." }
];
const SECTIONS = [
  { id:"contexto", part:null, toc:"Resumen", title:"Resumen", sub:"Introducción, métodos, resultados y conclusiones", open:true,
    subs:[{id:"resumen-introduccion",label:"Introducción"},{id:"resumen-metodos",label:"Métodos y códigos CIE-10"},{id:"resumen-resultados",label:"Resultados"},{id:"resumen-conclusiones",label:"Conclusiones"},{id:"contexto-relato",label:"Los resultados, paso a paso"},{id:"contexto-preguntas",label:"Recorrido del documento"}] },
  { id:"causal", part:"I", toc:"¿Qué explica las atenciones?", title:"¿Qué explica el número de atenciones de un departamento?", sub:"Diagrama causal: oferta, pacientes, severidad, oportunidad del diagnóstico, equipos y registro", open:false,
    subs:[{id:"causal-diagrama",label:"Diagrama causal"}] },
  { id:"normativa", part:"I", toc:"Ley 2628 de 2026", title:"¿Qué ordena la Ley 2628 de 2026 y qué queda por reglamentar?", sub:"Ruta del tamizaje a la inclusión, primera infancia, artículos, plazos y retos de implementación", open:false,
    subs:[{id:"normativa-ruta",label:"Del tamizaje al diagnóstico"},{id:"normativa-infancia",label:"Tamizaje en primera infancia"},{id:"normativa-ley",label:"La ley y sus plazos"},{id:"normativa-vacios",label:"Retos de implementación"}] },
  { id:"paralelo", part:"I", toc:"Ley y Política de Salud Mental", title:"¿Cómo se relaciona la ley con la Política Nacional de Salud Mental?", sub:"Resumen comparativo, paralelo punto por punto y lo que dice la política sobre el neurodesarrollo", open:false,
    subs:[{id:"paralelo-resumen",label:"Resumen comparativo"},{id:"normativa-paralelo",label:"Frente a frente"},{id:"normativa-pnsm",label:"La política en detalle"},{id:"normativa-minsalud",label:"Salud mental en MinSalud"}] },
  { id:"instrumentos", part:"I", toc:"Herramientas por edad", title:"¿Con qué herramientas se detecta y diagnostica el autismo en cada etapa de la vida?", sub:"Tamizaje y diagnóstico desde la primera infancia hasta la adultez", open:false,
    subs:[{id:"instrumentos-linea",label:"Herramientas según la edad"}] },
  { id:"territorio", part:"II", toc:"Prevalencia: absoluta, relativa y esperada", title:"¿Cuántas personas se atienden, cuántas por habitante y cuántas se esperarían?", sub:"Prevalencia absoluta, relativa y esperada, en el país y por departamento", open:false,
    subs:[{id:"territorio-tres",label:"Las tres medidas, juntas"},{id:"territorio-deptos",label:"Por departamento"},{id:"territorio-mapa",label:"Mapa de la prevalencia relativa"},{id:"territorio-serie",label:"Serie nacional 2019-2025"},{id:"territorio-evolucion",label:"Evolución por departamento"},{id:"territorio-tabla",label:"Tabla y descarga"}] },
  { id:"intensidad", part:"II", toc:"Cobertura: frecuencia y cercanía", title:"¿Qué cobertura reciben: cuánta atención y qué tan cerca de su residencia?", sub:"Atenciones por cada 100 personas atendidas y atención cerca del lugar de residencia", open:false,
    subs:[{id:"intensidad-ranking",label:"Frecuencia de la atención"},{id:"intensidad-cercania",label:"Cercanía a la residencia"},{id:"intensidad-ambas",label:"Frecuencia y cercanía a la vez"},{id:"movilidad-flujos",label:"¿Dónde se atienden?"},{id:"movilidad-balance",label:"Receptores y emisores"},{id:"intensidad-cruce",label:"Prevalencia vs. frecuencia"}] },
  { id:"nacional", part:"II", toc:"¿Quiénes son?", title:"¿Quiénes son las personas atendidas y qué cambió en el registro de 2025?", sub:"Edad, sexo, régimen de afiliación e hipótesis sobre la ruptura de la serie", open:false,
    subs:[{id:"nacional-edad",label:"Edad y sexo"},{id:"nacional-regimen",label:"Régimen y ruptura de 2025"}] },
  { id:"oferta", part:"II", toc:"Oferta y demanda", title:"¿Dónde está la oferta de neuropediatría y sigue a la demanda?", sub:"Sedes del REPS frente a los casos esperados; lo que se aparta, ¿es riqueza o región?", open:false,
    subs:[{id:"oferta-mapa",label:"Mapa de la oferta"},{id:"oferta-demanda",label:"¿La oferta sigue a la demanda?"},{id:"oferta-residuo",label:"Más o menos sedes de las esperadas"},{id:"oferta-ranking",label:"Telemedicina y sedes públicas"}] },
  { id:"ofertaatencion", part:"II", toc:"Oferta vs. pacientes", title:"¿Se atiende a más personas donde hay más oferta?", sub:"Disponibilidad del servicio frente a pacientes y posible necesidad no atendida", open:false,
    subs:[{id:"ofertaatencion-cruce",label:"Oferta vs. pacientes"},{id:"movilidad-cruce",label:"Oferta vs. cercanía"}] },
  { id:"pobreza", part:"II", toc:"Pobreza vs. atención", title:"¿Se atiende menos donde hay más pobreza?", sub:"Pobreza multidimensional (IPM) frente a atención, oferta y movilidad", open:false,
    subs:[{id:"pobreza-ipm",label:"¿Qué es el IPM?"},{id:"pobreza-cruce",label:"Pobreza vs. indicadores"},{id:"pobreza-modelo",label:"Oferta y pobreza a la vez"}] },
  { id:"desigualdad", part:"II", toc:"Síntesis de desigualdad", title:"¿Qué tan desigual es la distribución y cómo ha cambiado?", sub:"Glosario de índices, curvas de Lorenz, IC95 %, Theil regional y tendencia", open:false,
    subs:[{id:"desigualdad-glosario",label:"Glosario de índices"},{id:"desigualdad-lorenz",label:"Curvas de Lorenz"},{id:"desigualdad-indices",label:"Índices con IC95 %"},{id:"desigualdad-theil",label:"Entre y dentro de regiones"},{id:"desigualdad-tiempo",label:"Evolución 2019-2025"},{id:"desigualdad-cruces",label:"Resumen de los cruces"}] },
  { id:"huila", part:"II", toc:"Huila", title:"¿Cómo está el Huila frente al país?", sub:"El departamento sede de UNINAVARRA", open:false },
  { id:"revision", part:"III", toc:"Revisión en curso", title:"¿Qué sigue? La revisión sistemática en curso", sub:"Pregunta PCC, búsqueda y diagrama PRISMA preliminar", open:false },
  { id:"metodologia", part:"III", toc:"Métodos y equipo", title:"¿Cómo se hizo y quiénes lo hicieron?", sub:"Fuentes, códigos F84, definiciones de las tasas, advertencias y equipo de UNINAVARRA", open:false },
  { id:"glosario", part:"III", toc:"Glosario", title:"Glosario", sub:"Términos, indicadores y medidas de desigualdad, con enlace a su fuente", open:false },
  { id:"referencias", part:"III", toc:"Referencias", title:"Referencias", sub:"Literatura y normas citadas, con enlaces verificables", open:false }
];
SECTIONS.forEach((s,i)=>{ s.num = String(i+1).padStart(2,"0"); });
const SEC = {}; SECTIONS.forEach(s=> SEC[s.id] = s);

function buildAccordion(){
  const root = document.getElementById("accordion");
  let acc = root, curPart;
  SECTIONS.forEach(s=>{
    if(s.part && s.part !== curPart){
      curPart = s.part; const P = PARTS.find(x=> x.id === s.part);
      root.appendChild(el("div",{class:"part-head part-"+P.id, id:"parte-"+P.id},[ el("span",{class:"part-k"},[P.k]), el("h2",null,[P.t]), el("p",null,[P.d]) ]));
      acc = el("div",{class:"part-group part-"+P.id}); root.appendChild(acc);
    }
    const header = el("button",{ class:"acc-header", type:"button", "aria-expanded": s.open ? "true":"false", "aria-controls":"panel-"+s.id },[
      el("span",{class:"num"},[s.num]),
      el("span",{class:"titles"},[ el("h3",null,[s.title]), el("span",{class:"sub"},[s.sub]) ]),
      el("span",{class:"chev", html:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>'})
    ]);
    const item = el("div",{ class:"acc-item" + (s.open ? " open":""), id:"sec-"+s.id },[
      header,
      el("div",{class:"acc-panel", id:"panel-"+s.id, role:"region"},[ el("div",null,[ el("div",{class:"acc-body", id:"body-"+s.id}) ]) ])
    ]);
    header.addEventListener("click", ()=> toggleSection(item, header));
    acc.appendChild(item);
  });
}
function toggleSection(item, header, force){
  const open = typeof force === "boolean" ? force : !item.classList.contains("open");
  item.classList.toggle("open", open);
  header.setAttribute("aria-expanded", open ? "true":"false");
  if(open) item.dispatchEvent(new CustomEvent("opened"));
}
function openSection(id){
  const item = document.getElementById("sec-"+id); if(!item) return;
  toggleSection(item, item.querySelector(".acc-header"), true);
}
function setAll(open){ document.querySelectorAll(".acc-item").forEach(i=> toggleSection(i, i.querySelector(".acc-header"), open)); }
function sub(body, id, title, subtitle){
  body.appendChild(el("h3",{id:id, class:"subsection-title"},[title]));
  if(subtitle) body.appendChild(el("p",{class:"subsection-subtitle"},[subtitle]));
}
function chips(options, active, onPick, label){
  const row = el("div",{class:"filter-row", role:"group", "aria-label": label||"Opciones"});
  options.forEach(o=>{
    const b = el("button",{ class:"filter-chip" + (o.id === active ? " active":""), type:"button", "aria-pressed": o.id === active ? "true":"false", "data-id": o.id },[o.label]);
    b.addEventListener("click", ()=>{
      row.querySelectorAll(".filter-chip").forEach(x=>{ x.classList.remove("active"); x.setAttribute("aria-pressed","false"); });
      b.classList.add("active"); b.setAttribute("aria-pressed","true");
      onPick(o.id);
    });
    row.appendChild(b);
  });
  return row;
}
function deptSelect(id, label, onChange){
  const s = el("select",{ id:id, class:"dept-select", "aria-label": label });
  REGION_ORDER.forEach(rg=>{
    const og = el("optgroup",{ label: rg });
    DEP.filter(d=>d.region===rg).sort((a,b)=> a.nombre.localeCompare(b.nombre,"es")).forEach(d=>{
      og.appendChild(el("option",{ value:d.cod },[d.nombre]));
    });
    s.appendChild(og);
  });
  s.value = STATE.sel;
  s.addEventListener("change", ()=> onChange(s.value));
  onSelect(cod=>{ if(s.value !== cod) s.value = cod; });
  return el("label",{class:"select-wrap"},[ el("span",null,[label]), s ]);
}

/* ---------------------------------------------------------------- hero */
/* ---------------------------------------------------------------- estadística básica (para las lecturas) */
function median(a){ const s = a.slice().sort((x,y)=>x-y), n = s.length; return n ? (n%2 ? s[(n-1)/2] : (s[n/2-1]+s[n/2])/2) : NaN; }
function ranks(a){
  const idx = a.map((v,i)=>[v,i]).sort((x,y)=> x[0]-y[0]); const r = new Array(a.length); let i = 0;
  while(i < idx.length){ let j = i; while(j+1 < idx.length && idx[j+1][0] === idx[i][0]) j++; const avg = (i+j)/2 + 1; for(let k=i;k<=j;k++) r[idx[k][1]] = avg; i = j+1; }
  return r;
}
function pearson(x, y){
  const n = x.length, mx = x.reduce((a,b)=>a+b,0)/n, my = y.reduce((a,b)=>a+b,0)/n; let sxy=0, sxx=0, syy=0;
  for(let i=0;i<n;i++){ sxy += (x[i]-mx)*(y[i]-my); sxx += (x[i]-mx)*(x[i]-mx); syy += (y[i]-my)*(y[i]-my); }
  return sxx && syy ? sxy/Math.sqrt(sxx*syy) : NaN;
}
function spearman(x, y){ return pearson(ranks(x), ranks(y)); }
function strength(r){ const a = Math.abs(r); return a >= 0.6 ? "fuerte" : a >= 0.4 ? "moderada" : a >= 0.2 ? "débil" : "prácticamente nula"; }
function joinNames(arr){ if(arr.length <= 1) return arr.join(""); return arr.slice(0,-1).join(", ") + " y " + arr[arr.length-1]; }
function reading(){ return el("div",{class:"reading", "aria-live":"polite"}); }
function setReading(node, html){ node.innerHTML = '<span class="reading-k">Lectura del gráfico</span><p>' + html + '</p>'; }
function howTo(text){ return el("p",{class:"howto"},[ el("strong",null,["¿Cómo leerlo? "]), text.charAt(0).toUpperCase() + text.slice(1) ]); }
function legend(items){ return el("div",{class:"legend"}, items.map(i=> el("span",{class:"legend-item"},[ el("span",{class:"legend-sw " + i[0]}), i[1] ]))); }
function regionChips(onPick, label){ return chips([{id:"todas",label:"Todas las regiones"}].concat(REGION_ORDER.map(r=>({id:r,label:r}))), "todas", onPick, label || "Filtrar por región"); }
function scopeName(reg){ return reg === "todas" ? "el país" : "la región " + reg; }

/* ---------------------------------------------------------------- indicadores */
const INDICATORS = [
  { id:"tasa24", plain:"personas atendidas por habitante", label:"Prevalencia atendida: personas atendidas por 100.000 hab. (2024)", short:"prevalencia atendida", dec:1, unit:" por 100.000 hab.", nac:97.8 },
  { id:"tasa25", plain:"personas atendidas por habitante en 2025", label:"Prevalencia atendida 2025: personas por 100.000 hab. (registro FEV-RIPS)", short:"prevalencia atendida 2025", dec:1, unit:" por 100.000 hab.", nac:194.0 },
  { id:"tasaAten", plain:"atenciones por cada persona atendida", label:"Tasa de atención: atenciones por 100 personas atendidas (2024)", short:"tasa de atención", dec:0, unit:" por 100 atendidos", nac:1214 },
  { id:"pctLocal", plain:"atención dentro del propio departamento", label:"Atenciones prestadas en el departamento de residencia (2024, %)", short:"atención en el propio departamento", pal:"teal", dec:1, unit:" %", nac:88.6 },
  { id:"pctConSede", plain:"personas en municipios con sede", label:"Personas atendidas que viven en municipios con sede de neuropediatría (%)", short:"proporción de personas en municipios con sede", pal:"teal", dec:1, unit:" %", nac:80.1 },
  { id:"sedes100k", plain:"sedes de neuropediatría por habitante", label:"Sedes con neuropediatría por 100.000 hab.", short:"oferta de neuropediatría", dec:2, unit:" por 100.000", nac:1.12 },
  { id:"pctTele", plain:"sedes con telemedicina", label:"% de sedes con telemedicina", short:"% de sedes con telemedicina", dec:1, unit:" %", nac:15.9 },
  { id:"pctPub", plain:"sedes públicas", label:"% de sedes de naturaleza pública", short:"% de sedes públicas", dec:1, unit:" %", nac:5.6 },
  { id:"pctSinSede", plain:"personas atendidas en municipios sin sede", label:"% de personas atendidas que viven en municipios sin sede", short:"% en municipios sin sede", dec:1, unit:" %", nac:19.9 },
  { id:"pctFuera", plain:"atención fuera del departamento", label:"% de atenciones recibidas fuera del departamento", short:"atención fuera del departamento", dec:1, unit:" %", nac:11.4 },
  { id:"ipm", plain:"pobreza", label:"Pobreza multidimensional (IPM 2024, % de personas pobres)", short:"pobreza (IPM)", dec:1, unit:" %" }
];
const IND = {}; INDICATORS.forEach(i=> IND[i.id] = i);
function vfmt(d, k){ return fmt(d[k], IND[k].dec) + IND[k].unit; }
function quantileBreaks(vals, k){
  const v = vals.filter(x=> x !== null && !isNaN(x)).sort((a,b)=>a-b); const out = [];
  for(let i=1;i<k;i++) out.push(v[Math.min(v.length-1, Math.floor(i*v.length/k))]);
  return out;
}
function classOf(v, br){ if(v === null || v === undefined) return -1; let c = 0; while(c < br.length && v >= br[c]) c++; return c; }
function deptCardHTML(d, extra){
  return "<h5>"+esc(d.nombre)+"</h5><p class='tip-region'>"+esc(d.region)+" · IPM "+fmt(d.ipm,1)+" %</p>" +
    "<p>Prevalencia atendida 2024: <b>"+fmt(d.tasa24,1)+"</b> por 100.000 hab. ("+fmt(d.pers24)+" personas; ≈ "+fmt(100*d.pers24/d.esperados,0)+" % de los casos esperados)</p>" +
    "<p>Tasa de atención: <b>"+fmt(d.tasaAten,0)+"</b> atenciones por 100 atendidos</p>" +
    "<p>Sedes con neuropediatría: <b>"+fmt(d.sedes)+"</b> ("+fmt(d.sedes100k,2)+" por 100.000)</p>" +
    "<p>Atenciones fuera del dpto.: <b>"+fmt(d.pctFuera,1)+" %</b></p>" + (extra || "");
}
function rankOf(cod, key){ return DEP.filter(d=> d[key] !== null).slice().sort((a,b)=> b[key]-a[key]).findIndex(x=> x.cod === cod) + 1; }

/* ---------------------------------------------------------------- hero */
function renderHero(){
  const m = C.meta;
  document.getElementById("hero-framework").textContent = "Análisis preliminar";
  document.getElementById("hero-title").textContent = m.titulo;
  document.getElementById("hero-lede").textContent = "Resumen del marco normativo y de los datos públicos de SISPRO (RIPS), REPS y DANE, como análisis preliminar. El recorrido tiene tres partes: primero, qué explica la atención y qué ordenan las normas; después, qué muestran los datos; al final, cómo se hizo.";
  const strip = el("ol",{class:"thread", "aria-label":"Recorrido del documento"});
  PARTS.forEach(P=>{
    const first = SECTIONS.find(x=> x.part === P.id);
    const b = el("button",{type:"button", class:"thread-step part-"+P.id},[ el("span",{class:"thread-k"},[P.k]), el("strong",null,[P.t]), el("span",{class:"thread-d"},[P.d]) ]);
    b.addEventListener("click", ()=>{ openSection(first.id); scrollSoon("parte-"+P.id); });
    strip.appendChild(el("li",null,[b]));
  });
  document.getElementById("hero-lede").after(strip);
  document.getElementById("hero-period").textContent = m.corte;
  document.getElementById("byline").innerHTML = "<strong>Equipo UNINAVARRA:</strong> " + C.equipo.map(p=> esc(p.nombre) + " <span class='role'>(" + esc(p.rol) + ")</span>").join(" · ") + "<br>" + esc(m.institucion) + " · " + esc(m.version);
  document.getElementById("wip-text").textContent = C.aviso;
  const g = document.getElementById("stat-grid");
  C.stats.forEach(s=> g.appendChild(el("div",{class:"stat-card"},[ el("div",{class:"value"},[s.value]), el("div",{class:"label"},[s.label]), el("div",{class:"detail"},[s.detail]) ])));
}

/* ---------------------------------------------------------------- widget: mapa coroplético */
function mapWidget(body, opts){
  let ind = opts.def;
  if(opts.inds.length > 1) body.appendChild(chips(opts.inds.map(i=>({id:i, label:IND[i].short.charAt(0).toUpperCase()+IND[i].short.slice(1)})), ind, id=>{ ind = id; paint(); }, "Indicador del mapa"));
  const wrap = el("div",{class:"map-layout"});
  const mapBox = el("div",{class:"chart-box map-box"});
  const M = D.mapa;
  const svg = svgEl(M.w, M.h, "map-svg", "Mapa de Colombia por departamento");
  const ins = M.inset;
  svg.innerHTML = '<rect x="'+ins.x+'" y="'+ins.y+'" width="'+ins.w+'" height="'+ins.h+'" rx="6" class="map-inset"/><text x="'+(ins.x+6)+'" y="'+(ins.y+12)+'" class="map-inset-lab">San Andrés y Prov.</text>';
  const shapes = {};
  DEP.forEach(d=>{
    const p = document.createElementNS(SVGNS,"path");
    p.setAttribute("d", M.paths[d.cod]); p.setAttribute("class","dpto"); p.setAttribute("tabindex","0");
    p.setAttribute("role","button"); p.setAttribute("aria-label", d.nombre);
    bindTip(p, ()=> deptCardHTML(d, "<p class='tip-ind'>"+esc(IND[ind].label)+": <b>"+vfmt(d,ind)+"</b> · puesto "+rankOf(d.cod,ind)+" de "+DEP.filter(x=>x[ind]!==null).length+"</p>"));
    p.addEventListener("click", ()=> selectDept(d.cod));
    p.addEventListener("keydown", e=>{ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); selectDept(d.cod); } });
    svg.appendChild(p); shapes[d.cod] = p;
  });
  mapBox.appendChild(svg);
  const leg = el("div",{class:"map-legend"}); mapBox.appendChild(leg);
  wrap.appendChild(mapBox);
  const card = el("aside",{class:"dept-card", "aria-live":"polite"}); wrap.appendChild(card);
  body.appendChild(wrap);
  const rd = reading(); body.appendChild(rd);
  function paint(){
    const I = IND[ind], list = DEP.filter(d=> d[ind] !== null);
    const br = quantileBreaks(list.map(d=>d[ind]), 6);
    DEP.forEach(d=>{ const c = classOf(d[ind], br); shapes[d.cod].setAttribute("class", "dpto " + (c < 0 ? "q-na" : "q"+c) + (STATE.sel === d.cod ? " sel":"")); });
    mapBox.classList.toggle("pal-teal", I.pal === "teal");
    leg.innerHTML = "";
    leg.appendChild(el("span",{class:"legend-title"},[I.label]));
    const sorted = list.map(d=>d[ind]).sort((a,b)=>a-b);
    const edges = [sorted[0]].concat(br).concat([sorted[sorted.length-1]]);
    const row = el("div",{class:"legend-scale"});
    for(let i=0;i<6;i++) row.appendChild(el("span",{class:"legend-step"},[ el("span",{class:"legend-sw q"+i}), fmt(edges[i], I.dec) + "–" + fmt(edges[i+1], I.dec) ]));
    leg.appendChild(row);
    leg.appendChild(el("span",{class:"legend-nac"},["Colores por sextiles: 6 grupos con igual número de departamentos; la escala va de valores bajos (izquierda) a altos (derecha)." + (I.nac !== undefined ? " Nacional: " + fmt(I.nac, I.dec) + I.unit + "." : "")]));
    // lectura
    const hi = list.reduce((a,b)=> b[ind] > a[ind] ? b : a), lo = list.reduce((a,b)=> b[ind] < a[ind] ? b : a);
    const top = list.filter(d=> classOf(d[ind], br) === 5).sort((a,b)=> b[ind]-a[ind]);
    const regs = {}; top.forEach(d=> regs[d.region] = (regs[d.region]||0) + 1);
    const regTxt = Object.keys(regs).sort((a,b)=> regs[b]-regs[a]).map(r=> r + " (" + regs[r] + ")");
    let t = "<b>" + esc(I.label) + ".</b> El valor más alto es el de " + esc(hi.nombre) + " (" + vfmt(hi,ind) + ") y el más bajo el de " + esc(lo.nombre) + " (" + vfmt(lo,ind) + ")";
    if(lo[ind] > 0) t += ", una razón de " + fmt(hi[ind]/lo[ind],1) + " veces";
    t += ". La mediana de los departamentos es " + fmt(median(list.map(d=>d[ind])), I.dec) + I.unit;
    if(I.nac !== undefined){ const n = list.filter(d=> d[ind] > I.nac).length; t += " y " + n + " de " + list.length + " superan el valor nacional (" + fmt(I.nac, I.dec) + I.unit + ")"; }
    t += ". El grupo de valores más altos reúne a " + joinNames(top.map(d=>esc(d.nombre))) + ", sobre todo de " + joinNames(regTxt) + ".";
    const s = BY[STATE.sel];
    if(s[ind] !== null) t += " " + esc(s.nombre) + " (seleccionado): " + vfmt(s,ind) + ", puesto " + rankOf(s.cod,ind) + " de " + list.length + ".";
    if(opts.extra) t += " " + opts.extra(ind);
    setReading(rd, t);
  }
  function drawCard(cod){
    const d = BY[cod]; card.innerHTML = "";
    card.appendChild(el("span",{class:"eyebrow-sm"},[d.region]));
    card.appendChild(el("h4",null,[d.nombre]));
    const rows = [
      ["Población 2024", fmt(d.pob)], ["Personas atendidas 2024", fmt(d.pers24)], ["Prevalencia atendida (/100.000 hab.)", fmt(d.tasa24,1) + " (nac. 97,8)"],
      ["Tasa de atención (/100 atendidos)", fmt(d.tasaAten,0) + " (nac. 1.214)"], ["Sedes con neuropediatría", fmt(d.sedes) + (d.sedes ? " · " + fmt(d.sedesTele) + " con telemedicina" : "")],
      ["Sedes por 100.000", fmt(d.sedes100k,2) + " (nac. 1,12)"], ["% atenciones fuera del dpto.", fmt(d.pctFuera,1) + " %"],
      ["% en municipios sin sede", fmt(d.pctSinSede,1) + " %"], ["IPM 2024", fmt(d.ipm,1) + " %"]
    ];
    const dl = el("dl",{class:"kv"});
    rows.forEach(r=>{ dl.appendChild(el("dt",null,[r[0]])); dl.appendChild(el("dd",null,[r[1]])); });
    card.appendChild(dl);
    if(d.sedes === 0) card.appendChild(callout("Sin sedes con neuropediatría habilitadas en el REPS.", "callout-warn"));
    if(d.pers24 < 30) card.appendChild(el("p",{class:"muted small"},["Conteo pequeño: interpretar las tasas con cautela."]));
    card.appendChild(el("p",{class:"muted small"},["Haz clic en otro departamento para cambiar la selección."]));
  }
  onSelect(cod=>{ paint(); drawCard(cod); });
  paint(); drawCard(STATE.sel);
}

/* ---------------------------------------------------------------- widget: ranking filtrable */
function rankingWidget(body, opts){
  let ind = opts.def, reg = "todas";
  if(opts.inds && opts.inds.length > 1) body.appendChild(chips(opts.inds.map(i=>({id:i,label:IND[i].short.charAt(0).toUpperCase()+IND[i].short.slice(1)})), ind, id=>{ ind = id; draw(); }, "Indicador"));
  body.appendChild(regionChips(id=>{ reg = id; draw(); }));
  const box = el("div",{class:"chart-box"}); body.appendChild(box);
  body.appendChild(legend(REGION_ORDER.map(r=>["rg-sw "+REGION_CLASS[r], r]).concat([["ref-sw","Valor nacional"]])));
  const rd = reading(); body.appendChild(rd);
  let bars = {};
  function draw(){
    const I = IND[ind];
    const list = DEP.filter(d=> (reg === "todas" || d.region === reg) && d[ind] !== null).sort((a,b)=> b[ind]-a[ind]);
    const w = 640, rowH = 22, pad = { l:150, r:58, t:22, b:8 }, h = pad.t + list.length*rowH + pad.b;
    const mx = niceMax(Math.max(...list.map(d=>d[ind]), I.nac || 0)), iw = w - pad.l - pad.r;
    const s = svgEl(w, h, "rank-svg", "Ranking por " + I.label);
    let bg = "";
    ticks(mx).forEach(t=>{ const x = pad.l + iw*t/mx; bg += '<line x1="'+x+'" x2="'+x+'" y1="'+(pad.t-6)+'" y2="'+(h-pad.b)+'" class="grid"/><text x="'+x+'" y="'+(pad.t-10)+'" class="axis-lab" text-anchor="middle">'+fmt(t, mx<10?1:0)+'</text>'; });
    bg += '<text x="'+(pad.l + iw/2)+'" y="9" class="axis-title" text-anchor="middle">'+esc(I.label)+'</text>';
    s.innerHTML = bg; bars = {};
    list.forEach((d,i)=>{
      const y = pad.t + i*rowH, bw = iw * d[ind]/mx;
      const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g rank-row" + (STATE.sel===d.cod?" sel":"")); g.setAttribute("role","button"); g.setAttribute("aria-label", d.nombre + ": " + vfmt(d,ind));
      g.innerHTML = '<rect x="0" y="'+y+'" width="'+w+'" height="'+rowH+'" class="row-hit"/><text x="'+(pad.l-8)+'" y="'+(y+15)+'" class="axis-lab" text-anchor="end">'+esc(d.nombre)+'</text>' +
        '<rect x="'+pad.l+'" y="'+(y+4)+'" width="'+Math.max(bw,1)+'" height="'+(rowH-8)+'" rx="3" class="rg-bar '+REGION_CLASS[d.region]+'"/><text x="'+(pad.l+bw+5)+'" y="'+(y+15)+'" class="bar-val">'+fmt(d[ind], I.dec)+'</text>';
      bindTip(g, ()=> deptCardHTML(d));
      g.addEventListener("click", ()=> selectDept(d.cod));
      g.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); selectDept(d.cod); } });
      s.appendChild(g); bars[d.cod] = g;
    });
    if(I.nac !== undefined && I.nac <= mx){ const x = pad.l + iw*I.nac/mx; const ln = document.createElementNS(SVGNS,"line"); ln.setAttribute("x1",x); ln.setAttribute("x2",x); ln.setAttribute("y1",pad.t-4); ln.setAttribute("y2",h-pad.b); ln.setAttribute("class","ref-line"); s.appendChild(ln); }
    box.innerHTML = ""; box.appendChild(s);
    // lectura
    const vals = list.map(d=>d[ind]);
    let t = "En " + scopeName(reg) + " (" + list.length + (list.length === 1 ? " territorio" : " territorios") + ") la " + esc(I.short) + " va de " + vfmt(list[list.length-1],ind) + " en " + esc(list[list.length-1].nombre) + " a " + vfmt(list[0],ind) + " en " + esc(list[0].nombre) + "; la mediana es " + fmt(median(vals), I.dec) + I.unit + ".";
    if(I.nac !== undefined){ const n = list.filter(d=> d[ind] > I.nac).length; t += " " + n + " de " + list.length + " están por encima del valor nacional (" + fmt(I.nac, I.dec) + I.unit + ")."; }
    if(reg !== "todas"){
      const allMed = median(DEP.filter(d=>d[ind]!==null).map(d=>d[ind]));
      t += " La mediana de la región es " + (median(vals) > allMed ? "mayor" : median(vals) < allMed ? "menor" : "igual") + " que la de los 33 territorios (" + fmt(allMed, I.dec) + I.unit + ").";
    }
    if(opts.extra) t += " " + opts.extra(ind, list, reg);
    setReading(rd, t);
  }
  onSelect(()=> Object.keys(bars).forEach(c=> bars[c].classList.toggle("sel", c === STATE.sel)));
  draw();
}

/* ---------------------------------------------------------------- widget: dispersión con cuadrantes */
/* ---------------------------------------------------------------- widget: dispersión con cuadrantes */
const OMS_PREV = 1/127;   // prevalencia de referencia de la OMS (todas las edades), solo para la aproximación de brecha
const SIZES = {
  pob: { label:"población", val:d=>d.pob, f:v=> v>=1e6 ? fmt(v/1e6,1)+" M hab." : fmt(v/1e3)+" mil hab." },
  aten24: { label:"número de atenciones", val:d=>d.aten24, f:v=> v>=1e3 ? fmt(v/1e3)+" mil atenciones" : fmt(v)+" atenciones" },
  atenTasa: { label:"atenciones por 100.000 hab.", val:d=>d.aten24/d.pob*1e5, f:v=> fmt(v)+" por 100.000" }
};
function niceRef(v){ const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v/p; return (m>=5?5:m>=2?2:1)*p; }
function sizeLegendFor(key, maxV, rFn){
  const S = SIZES[key], vals = [niceRef(maxV/12), niceRef(maxV/3), niceRef(maxV)].filter((v,i,a)=> a.indexOf(v)===i);
  const w = 360, h = 58;
  const s = svgEl(w, h, "size-legend", "Tamaño de las burbujas: " + S.label);
  let g = '<text x="0" y="12" class="axis-lab strong">Tamaño de la burbuja = '+esc(S.label)+'</text>', x = 6;
  vals.forEach(v=>{ const r = rFn(v); g += '<circle cx="'+(x+r)+'" cy="'+(50-r)+'" r="'+r+'" class="size-ref"/><text x="'+(x+2*r+4)+'" y="48" class="axis-lab">'+esc(S.f(v))+'</text>'; x += 2*r + 8 + S.f(v).length*5.6; });
  s.innerHTML = g;
  return s;
}
function plainCorr(rho, X, Y){
  const a = Math.abs(rho);
  const xs = X.plain || X.short, ys = Y.plain || Y.short;
  if(a < 0.2) return "no se ve una relación clara entre " + esc(xs) + " y " + esc(ys) + " (ρ = " + fmt(rho,2) + ")";
  const fuerza = a >= 0.6 ? "clara y fuerte" : a >= 0.4 ? "moderada" : "débil";
  return "donde hay más " + esc(xs) + " suele haber " + (rho > 0 ? "más " : "menos ") + esc(ys) + ": la relación es " + fuerza + " (ρ = " + fmt(rho,2) + "; 0 es ninguna relación y 1 una relación perfecta)";
}
function scatterWidget(body, o){
  let yk = o.ys[0], reg = "todas", sk = (o.sizes || ["pob"])[0];
  if(o.ys.length > 1) body.appendChild(chips(o.ys.map(k=>({id:k, label:"Eje vertical: " + IND[k].short})), yk, id=>{ yk = id; draw(); }, "Indicador del eje vertical"));
  if(o.sizes && o.sizes.length > 1) body.appendChild(chips(o.sizes.map(k=>({id:k, label:"Tamaño: " + SIZES[k].label})), sk, id=>{ sk = id; draw(); }, "Tamaño de las burbujas"));
  body.appendChild(regionChips(id=>{ reg = id; draw(); }, "Resaltar región"));
  const box = el("div",{class:"chart-box"}); body.appendChild(box);
  const ipmBr = [10, 15, 20, 30];
  body.appendChild(o.colorBy === "ipm"
    ? legend([["bub-sw ipm0","IPM < 10 %"],["bub-sw ipm1","10–15 %"],["bub-sw ipm2","15–20 %"],["bub-sw ipm3","20–30 %"],["bub-sw ipm4","≥ 30 %"],["ref-sw","Valor nacional (o mediana)"]])
    : legend(REGION_ORDER.map(r=>["rg-sw "+REGION_CLASS[r], r]).concat([["ref-sw","Valor nacional (o mediana)"]])));
  if(o.colorBy === "ipm") body.appendChild(el("p",{class:"legend-note"},["Color: pobreza del departamento (IPM del DANE, % de personas en hogares pobres). Más oscuro = más pobreza."]));
  const slw = el("div",{class:"size-legend-wrap"}); body.appendChild(slw);
  const rd = reading(); body.appendChild(rd);
  function draw(){
    const X = IND[o.x], Y = IND[yk], SZ = SIZES[sk];
    const all = DEP.filter(d=> d[o.x] !== null && d[yk] !== null);
    const inR = d=> reg === "todas" || d.region === reg;
    const maxS = Math.max(...all.map(SZ.val));
    const rFn = v=> Math.max(2.5, 24*Math.sqrt(v/maxS));
    slw.innerHTML = ""; slw.appendChild(sizeLegendFor(sk, maxS, rFn));
    const refX = X.nac !== undefined ? X.nac : median(all.map(d=>d[o.x])), refY = Y.nac !== undefined ? Y.nac : median(all.map(d=>d[yk]));
    const refXLab = X.nac !== undefined ? "nacional " + fmt(refX, X.dec) : "mediana " + fmt(refX, X.dec);
    const refYLab = Y.nac !== undefined ? "nacional " + fmt(refY, Y.dec) : "mediana " + fmt(refY, Y.dec);
    const w = 680, h = o.std ? 440 : 420, pad = { l: o.std ? 70 : 58, r:24, t:22, b: o.std ? 62 : 46 }, iw = w-pad.l-pad.r, ih = h-pad.t-pad.b;
    let PX, PY, zX = null, zY = null;
    const s = svgEl(w, h, "scatter-svg", "Dispersión de " + X.short + " y " + Y.short);
    let g = "";
    if(o.std){
      // Ejes estandarizados (desviaciones estándar respecto al valor nacional): el cruce de los cuadrantes queda en el centro.
      const sd = a=>{ const m = a.reduce((p,c)=>p+c,0)/a.length; return Math.sqrt(a.reduce((p,c)=>p+(c-m)*(c-m),0)/(a.length-1)); };
      const sX = sd(all.map(d=>d[o.x])), sY = sd(all.map(d=>d[yk])), L = 3;
      zX = v=> (v-refX)/sX; zY = v=> (v-refY)/sY;
      const cl = z=> Math.max(-L*0.985, Math.min(L*0.985, z));
      PX = v => pad.l + iw*(cl(zX(v))+L)/(2*L); PY = v => pad.t + ih - ih*(cl(zY(v))+L)/(2*L);
      for(let k=-L;k<=L;k++){
        const rx = refX + k*sX, ry = refY + k*sY, xk = pad.l + iw*(k+L)/(2*L), yk2 = pad.t + ih - ih*(k+L)/(2*L);
        const kl = k === 0 ? "nacional" : (k>0?"+":"−") + Math.abs(k) + " DE";
        g += '<line x1="'+xk+'" x2="'+xk+'" y1="'+pad.t+'" y2="'+(h-pad.b)+'" class="grid"/><text x="'+xk+'" y="'+(h-pad.b+15)+'" class="axis-lab" text-anchor="middle">'+(rx >= 0 ? fmt(rx, X.dec) : "")+'</text><text x="'+xk+'" y="'+(h-pad.b+28)+'" class="axis-lab small-lab" text-anchor="middle">'+kl+'</text>';
        g += '<line x1="'+pad.l+'" x2="'+(w-pad.r)+'" y1="'+yk2+'" y2="'+yk2+'" class="grid"/><text x="'+(pad.l-8)+'" y="'+(yk2+1)+'" class="axis-lab" text-anchor="end">'+(ry >= 0 ? fmt(ry, Y.dec) : "")+'</text><text x="'+(pad.l-8)+'" y="'+(yk2+12)+'" class="axis-lab small-lab" text-anchor="end">'+kl+'</text>';
      }
      g += '<text x="'+(pad.l+iw/2)+'" y="'+(h-6)+'" class="axis-title" text-anchor="middle">'+esc(X.label)+'</text>';
      g += '<text transform="translate(12,'+(pad.t+ih/2)+') rotate(-90)" class="axis-title" text-anchor="middle">'+esc(Y.label)+'</text>';
    } else {
      const mxX = niceMax(Math.max(...all.map(d=>d[o.x]))), mxY = niceMax(Math.max(...all.map(d=>d[yk])));
      PX = v => pad.l + iw*v/mxX; PY = v => pad.t + ih - ih*v/mxY;
      ticks(mxY).forEach(t=>{ g += '<line x1="'+pad.l+'" x2="'+(w-pad.r)+'" y1="'+PY(t)+'" y2="'+PY(t)+'" class="grid"/><text x="'+(pad.l-8)+'" y="'+(PY(t)+4)+'" class="axis-lab" text-anchor="end">'+fmt(t, mxY<10?1:0)+'</text>'; });
      ticks(mxX).forEach(t=>{ g += '<line x1="'+PX(t)+'" x2="'+PX(t)+'" y1="'+pad.t+'" y2="'+(h-pad.b)+'" class="grid"/><text x="'+PX(t)+'" y="'+(h-pad.b+16)+'" class="axis-lab" text-anchor="middle">'+fmt(t, mxX<10?1:0)+'</text>'; });
      g += '<text x="'+(pad.l+iw/2)+'" y="'+(h-6)+'" class="axis-title" text-anchor="middle">'+esc(X.label)+'</text>';
      g += '<text transform="translate(14,'+(pad.t+ih/2)+') rotate(-90)" class="axis-title" text-anchor="middle">'+esc(Y.label)+'</text>';
    }
    g += '<line x1="'+PX(refX)+'" x2="'+PX(refX)+'" y1="'+pad.t+'" y2="'+(h-pad.b)+'" class="ref-line"/><line x1="'+pad.l+'" x2="'+(w-pad.r)+'" y1="'+PY(refY)+'" y2="'+PY(refY)+'" class="ref-line"/>';
    if(!o.std) g += '<text x="'+(PX(refX)+4)+'" y="'+(pad.t+10)+'" class="axis-lab">'+refXLab+'</text><text x="'+(w-pad.r-4)+'" y="'+(PY(refY)-5)+'" class="axis-lab" text-anchor="end">'+refYLab+'</text>';
    const q = o.quad;
    g += '<text x="'+(w-pad.r-6)+'" y="'+(pad.t+26)+'" class="quad-lab" text-anchor="end">'+esc(q.hh)+'</text><text x="'+(pad.l+6)+'" y="'+(pad.t+26)+'" class="quad-lab">'+esc(q.lh)+'</text>';
    g += '<text x="'+(pad.l+6)+'" y="'+(h-pad.b-8)+'" class="quad-lab'+(o.flagLL?' quad-flag':'')+'">'+esc(q.ll)+'</text><text x="'+(w-pad.r-6)+'" y="'+(h-pad.b-8)+'" class="quad-lab" text-anchor="end">'+esc(q.hl)+'</text>';
    s.innerHTML = g;
    all.slice().sort((a,b)=> SZ.val(b)-SZ.val(a)).forEach(d=>{
      const r = rFn(SZ.val(d));
      const c = document.createElementNS(SVGNS,"circle");
      c.setAttribute("cx", PX(d[o.x])); c.setAttribute("cy", PY(d[yk])); c.setAttribute("r", r);
      const col = o.colorBy === "ipm" ? "bub ipm" + classOf(d.ipm, ipmBr) : "bub rgb " + REGION_CLASS[d.region];
      const clipped = o.std && (Math.abs(zX(d[o.x])) > 3 || Math.abs(zY(d[yk])) > 3);
      c.setAttribute("class", col + (inR(d) ? "" : " faded") + (d.cod === STATE.sel ? " sel" : "") + (clipped ? " clipped" : ""));
      c.setAttribute("tabindex","0"); c.setAttribute("role","button"); c.setAttribute("aria-label", d.nombre + ": " + X.short + " " + vfmt(d,o.x) + ", " + Y.short + " " + vfmt(d,yk));
      const quadName = (d[o.x] >= refX ? (d[yk] >= refY ? q.hh : q.hl) : (d[yk] >= refY ? q.lh : q.ll));
      const brecha = (o.need ? "<p class='tip-ind'>Personas esperadas si 1 de cada 127 tuviera autismo: ~" + fmt(d.pob*OMS_PREV) + "; atendidas: " + fmt(d.pers24) + " (≈ " + fmt(100*d.pers24/(d.pob*OMS_PREV),0) + " %; " + fmt(100*d.pers25/(d.pob*OMS_PREV),0) + " % con el registro de 2025)</p>" : "") +
        (o.std ? "<p class='muted'>Posición en el gráfico: " + fmt(zX(d[o.x]),1) + " DE en el eje horizontal y " + fmt(zY(d[yk]),1) + " DE en el vertical respecto al valor nacional" + (clipped ? " (fuera de escala: se dibuja en el borde)" : "") + ".</p>" : "");
      bindTip(c, ()=> "<h5>"+esc(d.nombre)+"</h5><p class='tip-region'>"+esc(d.region)+" · IPM "+fmt(d.ipm,1)+" %</p><p>"+esc(X.label)+": <b>"+vfmt(d,o.x)+"</b><br>"+esc(Y.label)+": <b>"+vfmt(d,yk)+"</b><br>Tamaño ("+esc(SZ.label)+"): <b>"+esc(SZ.f(SZ.val(d)))+"</b></p><p class='tip-ind'>Cuadrante: "+esc(quadName.toLowerCase())+"</p>" + brecha);
      c.addEventListener("click", ()=> selectDept(d.cod));
      c.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); selectDept(d.cod); } });
      s.appendChild(c);
    });
    all.filter(d=> inR(d) && (reg !== "todas" || (o.labels||[]).includes(d.cod) || d.cod === STATE.sel)).forEach(d=>{
      const r = rFn(SZ.val(d));
      const t = document.createElementNS(SVGNS,"text"); const atEnd = PX(d[o.x]) + r + 6 + d.nombre.length*6 > w; t.setAttribute("x", PX(d[o.x]) + (atEnd ? -r - 4 : r + 3)); if(atEnd) t.setAttribute("text-anchor","end"); t.setAttribute("y", PY(d[yk]) + 4);
      t.setAttribute("class","pt-lab" + (d.cod === STATE.sel ? " sel-pt-lab" : "")); t.textContent = d.nombre.replace(" D.C.",""); s.appendChild(t);
    });
    box.innerHTML = ""; box.appendChild(s);
    // lectura dinámica en lenguaje llano
    const sub = all.filter(inR);
    const cnt = { hh:[], hl:[], lh:[], ll:[] };
    sub.forEach(d=>{ cnt[(d[o.x] >= refX ? "h" : "l") + (d[yk] >= refY ? "h" : "l")].push(d); });
    let t = "En " + scopeName(reg) + " (" + sub.length + " departamentos): ";
    t += sub.length >= 5 ? plainCorr(spearman(sub.map(d=>d[o.x]), sub.map(d=>d[yk])), X, Y) + ". " : "con menos de 5 departamentos no tiene sentido medir la relación. ";
    t += cnt.hh.length + " están arriba a la derecha («" + esc(q.hh.toLowerCase()) + "») y " + cnt.ll.length + " abajo a la izquierda («" + esc(q.ll.toLowerCase()) + "»)";
    if(o.flagLL && cnt.ll.length) t += ": " + joinNames(cnt.ll.sort((a,b)=> a[yk]-b[yk]).slice(0,6).map(d=>esc(d.nombre))) + (cnt.ll.length > 6 ? " y otros" : "");
    t += ".";
    if(o.need){
      const P = sub.reduce((a,d)=>a+d.pob,0), A = sub.reduce((a,d)=>a+d.pers24,0), A25 = sub.reduce((a,d)=>a+d.pers25,0);
      t += " Como aproximación a la necesidad no atendida: si 1 de cada 127 personas tuviera autismo (estimación de la OMS), en " + scopeName(reg) + " habría unas " + fmt(P*OMS_PREV) + " personas con autismo y se atendieron " + fmt(A) + " (≈ " + fmt(100*A/(P*OMS_PREV),0) + " %). Con el registro de 2025, que según la hipótesis del equipo se acerca más al número real, serían " + fmt(A25) + " (≈ " + fmt(100*A25/(P*OMS_PREV),0) + " %): aun así, la mayoría de las personas esperadas no aparece atendida.";
    }
    const sd = BY[STATE.sel];
    if(sd[o.x] !== null && sd[yk] !== null){
      const qn = (sd[o.x] >= refX ? (sd[yk] >= refY ? q.hh : q.hl) : (sd[yk] >= refY ? q.lh : q.ll));
      t += " " + esc(sd.nombre) + " (seleccionado) está en «" + esc(qn.toLowerCase()) + "»" + (o.need ? " y atendió a cerca del " + fmt(100*sd.pers24/(sd.pob*OMS_PREV),0) + " % de las personas esperadas" : "") + ".";
    }
    if(o.extra) t += " " + o.extra(yk, reg);
    setReading(rd, t);
  }
  onSelect(draw);
  draw();
}


/* ================================================================= 01 CONTEXTO */
function cie10List(){
  return el("div",{class:"cie-block"},[
    el("h5",null,["Códigos CIE-10 incluidos (diagnóstico principal)"]),
    el("ul",{class:"cie-list no-term"}, C.cie10.map(x=> el("li",null,[ el("strong",null,[x.c]), el("span",null,[x.n]) ]))),
    el("p",{class:"muted small"},[C.cie10Nota])
  ]);
}
function renderContexto(){
  const body = document.getElementById("body-contexto"), R = C.resumen;
  const block = (id, title, kids)=> body.appendChild(el("section",{class:"abs-block", id:id, "aria-labelledby":id+"-t"},[ el("h3",{class:"abs-title", id:id+"-t"},[title]), el("div",{class:"abs-body"}, kids) ]));
  block("resumen-introduccion", "Introducción", R.introduccion.map(p=> el("p",null,[p])));
  block("resumen-metodos", "Métodos", R.metodos.map(p=>{ const k = p.indexOf(":"); return el("p",null,[ el("strong",null,[p.slice(0,k+1)]), p.slice(k+1) ]); }).concat([ cie10List() ]));
  const ol = el("ol",{class:"abs-results"});
  C.hallazgos.forEach(h=>{
    const b = el("button",{class:"finding-link", type:"button", "aria-label":"Ver el análisis de " + h.t},["Ver el análisis"]);
    b.addEventListener("click", ()=>{ openSection(h.sec); scrollSoon("sec-"+h.sec); });
    ol.appendChild(el("li",null,[ el("strong",null,[h.t + ". "]), h.d + " ", b ]));
  });
  block("resumen-resultados", "Resultados", [ ol ]);
  block("resumen-conclusiones", "Conclusiones", [ el("ul",{class:"abs-concl"}, R.conclusiones.map(c=> el("li",null,[c]))) ]);
  body.appendChild(el("div",{class:"tag-row"},[confidenceTag("nota-autor"), confidenceTag("preliminar")]));
  renderStory(body);
  body.appendChild(el("div",{class:"scope-limits"},[ el("p",{class:"scope-text"},[ el("strong",null,["¿Cómo leer las cifras? "]), C.panorama.lectura ]) ]));
  sub(body, "contexto-preguntas", "Recorrido del documento", "Cada sección responde una pregunta. La primera parte arma el marco con el que se leen los datos de la segunda.");
  PARTS.forEach(P=>{
    body.appendChild(el("h4",{class:"q-part part-"+P.id},[P.k + ": " + P.t]));
    const ql = el("ol",{class:"question-list part-"+P.id});
    SECTIONS.filter(s=> s.part === P.id).forEach(s=>{
      const b = el("button",{type:"button", class:"q-link"},[ el("span",{class:"q-num"},[s.num]), s.title ]);
      b.addEventListener("click", ()=>{ openSection(s.id); scrollSoon("sec-"+s.id); });
      ql.appendChild(el("li",null,[b, el("span",{class:"q-sub"},[s.sub])]));
    });
    body.appendChild(ql);
  });
  body.appendChild(el("p",{class:"muted small"},["Los términos subrayados con puntos muestran su definición al pasar el cursor o el foco; las normas citadas enlazan a su texto. Glosario completo en la sección " + SEC.glosario.num + " y referencias en la " + SEC.referencias.num + "."]));
}

/* ================================================================= 02 NACIONAL */
const YEARS = [2019,2020,2021,2022,2023,2024,2025];
function renderNacional(){
  const body = document.getElementById("body-nacional");
  body.appendChild(el("p",null,["Vistas la prevalencia y la cobertura, esta sección describe a las personas atendidas por edad, sexo y régimen de afiliación, y explica por qué el registro de 2025 no se puede comparar sin más con los años anteriores."]));
  sub(body, "nacional-edad", "Edad y sexo de las personas atendidas en 2024");
  const two = el("div",{class:"two-col"});
  const ed = C.panorama.edad, w = 360, rowH = 40, h = ed.length*rowH + 16;
  const s = svgEl(w, h, "", "Distribución por grupo de edad");
  ed.forEach((e,i)=>{
    const y = 8 + i*rowH, bw = (w-170) * e.pct / 60;
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g");
    g.innerHTML = '<text x="0" y="'+(y+22)+'" class="axis-lab">'+esc(e.grupo)+'</text><rect x="110" y="'+(y+6)+'" width="'+(w-170)+'" height="24" rx="5" class="bar-track"/><rect x="110" y="'+(y+6)+'" width="'+bw+'" height="24" rx="5" class="bar-fill'+(e.derivado?' bar-derived':'')+'"/><text x="'+(116+bw)+'" y="'+(y+23)+'" class="bar-val">'+fmt(e.pct,1)+' %</text>';
    bindTip(g, ()=> "<h5>"+esc(e.grupo)+"</h5><p>"+fmt(e.pct,1)+" % de las personas atendidas"+(e.derivado?" (complemento de los otros grupos)":"")+"</p>");
    s.appendChild(g);
  });
  two.appendChild(el("div",{class:"chart-box"},[ el("h4",{class:"chart-title"},["Grupo de edad"]), s ]));
  const sx = C.panorama.sexo;
  two.appendChild(el("div",{class:"chart-box"},[ el("h4",{class:"chart-title"},["Sexo"]),
    el("div",{class:"split-bar", role:"img", "aria-label":"Hombres "+fmt(sx.hombres,1)+" %, mujeres "+fmt(sx.mujeres,1)+" %"},[
      el("span",{class:"split-a", style:"width:"+sx.hombres+"%"},["Hombres "+fmt(sx.hombres,1)+" %"]), el("span",{class:"split-b", style:"width:"+sx.mujeres+"%"},[fmt(sx.mujeres,1)+" %"]) ]) ]));
  body.appendChild(two);
  const rd2 = reading(); body.appendChild(rd2);
  setReading(rd2, "Más de la mitad de las personas atendidas (55,2 %) tiene entre 6 y 11 años y solo el 16,7 % tiene 5 años o menos, la etapa en la que el diagnóstico oportuno tiene más impacto. Como la edad es la de la atención y no la del diagnóstico, esto no mide directamente el retraso diagnóstico, pero es coherente con una atención que se concentra en la edad escolar. Por cada mujer se atendieron cerca de " + fmt(sx.hombres/sx.mujeres,1) + " hombres; la literatura internacional describe una razón cercana a 4 a 1 en la prevalencia.");
  body.appendChild(sourceLine(C.panorama.edadNota));

  sub(body, "nacional-regimen", "Régimen de afiliación y ruptura de la serie en 2025", "Elige la medida: el salto de 2025 no se ve igual en las personas que en las atenciones.");
  let rm = "y";
  const RM = { y:{ t:"Personas", f:(r,a)=> r["y"+a], u:"registros persona-régimen", dec:0 }, a:{ t:"Atenciones", f:(r,a)=> r["a"+a], u:"atenciones", dec:0 }, t:{ t:"Tasa de atención", f:(r,a)=> 100*r["a"+a]/r["y"+a], u:"atenciones por 100 personas", dec:0 } };
  body.appendChild(chips([{id:"y",label:"Personas"},{id:"a",label:"Atenciones"},{id:"t",label:"Tasa de atención"}], rm, id=>{ rm = id; drawReg(); }, "Medida por régimen"));
  const rbox = el("div",{class:"chart-box"}); body.appendChild(rbox);
  body.appendChild(legend([["bar-fill","2024 (año de referencia)"],["bar-alt","2025 (FEV-RIPS)"]]));
  const rd3 = reading(); body.appendChild(rd3);
  function drawReg(){
    const rg = C.panorama.regimen, M = RM[rm], w2 = 580, h2 = 240, pad = { l:78, r:16, t:20, b:40 };
    const s2 = svgEl(w2, h2, "", M.t + " por régimen, 2024 y 2025"), mx = niceMax(Math.max(...rg.map(r=> Math.max(M.f(r,2024), M.f(r,2025))))), ih = h2-pad.t-pad.b, iw = w2-pad.l-pad.r;
    let gs = "";
    ticks(mx).forEach(t=>{ const y = pad.t + ih - ih*t/mx; gs += '<line x1="'+pad.l+'" x2="'+(w2-pad.r)+'" y1="'+y+'" y2="'+y+'" class="grid"/><text x="'+(pad.l-8)+'" y="'+(y+4)+'" class="axis-lab" text-anchor="end">'+fmt(t)+'</text>'; });
    gs += '<text x="12" y="'+(pad.t+ih/2)+'" class="axis-title" text-anchor="middle" transform="rotate(-90 12 '+(pad.t+ih/2)+')">'+M.u.charAt(0).toUpperCase()+M.u.slice(1)+'</text>';
    s2.innerHTML = gs;
    const gw = iw/rg.length;
    rg.forEach((r,i)=>{
      [[2024,"bar-fill"],[2025,"bar-fill bar-alt"]].forEach((b,j)=>{
        const v = M.f(r,b[0]), bh = ih*v/mx, x = pad.l + i*gw + gw*0.18 + j*gw*0.33, y = pad.t + ih - bh, g = document.createElementNS(SVGNS,"g");
        g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g");
        g.innerHTML = '<rect x="'+x+'" y="'+y+'" width="'+(gw*0.3)+'" height="'+bh+'" rx="4" class="'+b[1]+'"/><text x="'+(x+gw*0.15)+'" y="'+(y-6)+'" class="bar-val" text-anchor="middle">'+fmt(v)+'</text>';
        bindTip(g, ()=> "<h5>"+esc(r.nombre)+" · "+b[0]+"</h5><p>"+fmt(v)+" "+M.u+"</p>");
        s2.appendChild(g);
      });
      const t = document.createElementNS(SVGNS,"text"); t.setAttribute("x", pad.l+i*gw+gw/2); t.setAttribute("y", h2-14); t.setAttribute("class","axis-lab strong"); t.setAttribute("text-anchor","middle"); t.textContent = r.nombre; s2.appendChild(t);
    });
    rbox.innerHTML = ""; rbox.appendChild(s2);
    const k = (r)=> M.f(r,2025)/M.f(r,2024), c0 = rg[0], c1 = rg[1];
    let t = rm === "y" ? "En personas, el subsidiado casi no cambió (" + fmt(c1.y2024) + " en 2024 y " + fmt(c1.y2025) + " en 2025), mientras que el contributivo se multiplicó por " + fmt(k(c0),1) + " (de " + fmt(c0.y2024) + " a " + fmt(c0.y2025) + ")."
      : rm === "a" ? "En atenciones, la ruptura alcanza a los dos regímenes: se multiplicaron por " + fmt(k(c0),1) + " en el contributivo (de " + fmt(c0.a2024) + " a " + fmt(c0.a2025) + ") y por " + fmt(k(c1),1) + " en el subsidiado (de " + fmt(c1.a2024) + " a " + fmt(c1.a2025) + "). La serie del subsidiado no se rompe en personas, pero sí en atenciones."
      : "Cada 100 personas del contributivo pasaron de " + fmt(M.f(c0,2024)) + " a " + fmt(M.f(c0,2025)) + " atenciones, y cada 100 del subsidiado, de " + fmt(M.f(c1,2024)) + " a " + fmt(M.f(c1,2025)) + ": en ambos se registra más atención por persona con el nuevo esquema.";
    setReading(rd3, t + " Como las personas pueden aparecer en más de un régimen y faltan denominadores de afiliados verificados, no se calcula prevalencia por régimen.");
  }
  drawReg();
  body.appendChild(sourceLine(C.panorama.regimenNota));
  body.appendChild(el("h4",{class:"chart-title"},["¿Por qué las personas aumentan en el contributivo y no en el subsidiado?"]));
  const hg = el("div",{class:"hyp-grid"});
  C.panorama.hipotesis.forEach((hp,i)=> hg.appendChild(el("article",{class:"hyp-card" + (i===0 ? " hyp-main" : "")},[ el("span",{class:"hyp-k"},[hp.quien]), el("h4",null,[hp.t]), el("p",null,[hp.d]) ])));
  body.appendChild(hg);
  body.appendChild(el("p",{class:"muted small"},[C.panorama.hipotesisNota]));
  body.appendChild(el("div",{class:"tag-row"},[confidenceTag("nota-autor"), confidenceTag("pendiente")]));
}

/* ================================================================= 03 TERRITORIO */
function renderTerritorio(){
  const body = document.getElementById("body-territorio");
  body.appendChild(el("p",null,["La prevalencia se cuenta aquí de tres maneras al mismo tiempo, porque ninguna se entiende sola. La absoluta dice cuántas personas se atendieron; la relativa, cuántas por cada 100.000 habitantes, para comparar territorios de distinto tamaño; y la esperada, cuántas habría si 1 de cada 127 personas tuviera autismo (OMS). La comparación entre atendida y esperada orienta sobre la distancia que falta, sin medir la necesidad."]));
  sub(body, "territorio-tres", "Las tres medidas, juntas", "País, 2024 (año de referencia) y 2025 (nuevo registro FEV-RIPS).");
  const esp = DEP.reduce((a,d)=>a+d.esperados,0), p24 = DEP.reduce((a,d)=>a+d.pers24,0), p25 = DEP.reduce((a,d)=>a+d.pers25,0), P = DEP.reduce((a,d)=>a+d.pob,0);
  const rows = [
    ["Absoluta", "¿Cuántas personas se atendieron?", fmt(CUBO.p24) + " (" + fmt(p24) + " con residencia conocida)", fmt(CUBO.p25) + " (" + fmt(p25) + " con residencia conocida)"],
    ["Relativa", "¿Cuántas por cada 100.000 habitantes?", fmt(p24/P*1e5,1), fmt(p25/P*1e5,1)],
    ["Esperada", "¿Cuántas habría si 1 de cada 127 tuviera autismo?", fmt(esp) + " personas; " + fmt(esp/P*1e5,0) + " por 100.000", "Igual: se usa la población de 2024"],
    ["Atendida ÷ esperada", "¿Qué parte de las esperadas se atendió?", "≈ " + fmt(100*p24/esp,0) + " %", "≈ " + fmt(100*p25/esp,0) + " %"]
  ];
  const tb = el("table",{class:"cmp-table"}), tbd = el("tbody");
  tb.appendChild(el("thead",null,[ el("tr",null,["Prevalencia","Pregunta que responde","2024","2025"].map(x=> el("th",{scope:"col"},[x]))) ]));
  rows.forEach(r=> tbd.appendChild(el("tr",null,[ el("th",{scope:"row"},[r[0]]), el("td",null,[r[1]]), el("td",null,[r[2]]), el("td",null,[r[3]]) ])));
  tb.appendChild(tbd); body.appendChild(el("div",{class:"table-wrap"},[tb]));
  body.appendChild(el("div",{class:"chart-box"},[ tresBarras(esp, p25, p24, P, "Prevalencia esperada y atendida, en personas y por 100.000 habitantes") ]));
  const rd = reading(); body.appendChild(rd);
  setReading(rd, "Cada barra muestra a la vez la medida absoluta (personas) y la relativa (por 100.000 habitantes). Se esperarían unas " + fmt(esp) + " personas con autismo (" + fmt(esp/P*1e5,0) + " por 100.000); el registro de 2024 muestra atendidas a " + fmt(p24) + " con residencia conocida (" + fmt(p24/P*1e5,1) + "), cerca de 12 de cada 100 esperadas, y el de 2025 a " + fmt(p25) + " (" + fmt(p25/P*1e5,1) + "), cerca de 25 de cada 100. Con el total del cubo nacional, que incluye a quienes no tienen departamento registrado, serían " + fmt(100*CUBO.p24/esp,0) + " y " + fmt(100*CUBO.p25/esp,0) + " de cada 100.");
  body.appendChild(sourceLine("Fuente: SISPRO-RIPS (F84.0 a F84.9 como diagnóstico principal) 2024 y 2025; DANE (población 2024, usada también como denominador de 2025); OMS (1 de cada 127). Las tasas usan solo personas con departamento de residencia conocido; la conciliación de totales está en la sección " + SEC.metodologia.num + "."));
  sub(body, "territorio-deptos", "Las tres medidas por departamento", "Absoluta y esperada a la izquierda; relativa y esperada a la derecha; al final, la parte de las esperadas que se atendió.");
  tresMedidas(body);
  sub(body, "territorio-mapa", "Mapa de la prevalencia relativa");
  body.appendChild(howTo("el mapa usa la medida relativa, porque la absoluta solo mostraría qué departamentos son más grandes. El color indica el grupo (sextil) en que cae cada valor. Haz clic en un departamento para seleccionarlo: la selección se comparte con todos los gráficos."));
  mapWidget(body, { inds:["tasa24","tasa25"], def:"tasa24", extra: ind=> ind === "tasa25" ? "En 2025 casi todos los departamentos suben con el nuevo registro; compárese el orden más que los valores." : "La esperada es la misma en todos: 787 por 100.000 habitantes. Ningún departamento pasa del 31 % de ella (Atlántico)." });
  body.appendChild(sourceLine("Fuente: SISPRO-RIPS; DANE (población 2024). Límites: Marco Geoestadístico Nacional del DANE, simplificados."));
  sub(body, "territorio-serie", "Serie nacional 2019-2025", "Elige la medida absoluta o la relativa.");
  {
  let metric = "personas";
  body.appendChild(chips([{id:"personas",label:"Número de personas"},{id:"tasa",label:"Por 100.000 habitantes"}], metric, id=>{ metric = id; draw(); }, "Medida"));
  const box = el("div",{class:"chart-box"}); body.appendChild(box);
  const rd = reading(); body.appendChild(rd);
  body.appendChild(sourceLine(C.serieNota + " Fuente: SISPRO-RIPS; DANE."));
  function draw(){
    const ser = C.serieNacional, w = 640, h = 280, pad = { l:62, r:16, t:22, b:30 }, iw = w-pad.l-pad.r, ih = h-pad.t-pad.b;
    const mx = niceMax(Math.max(...ser.map(s=> s[metric]))), bw = iw/ser.length;
    const s = svgEl(w, h, "", "Serie nacional");
    let g = "";
    ticks(mx).forEach(t=>{ const y = pad.t + ih - ih*t/mx; g += '<line x1="'+pad.l+'" x2="'+(w-pad.r)+'" y1="'+y+'" y2="'+y+'" class="grid"/><text x="'+(pad.l-8)+'" y="'+(y+4)+'" class="axis-lab" text-anchor="end">'+fmt(t)+'</text>'; });
    g += '<text x="12" y="'+(pad.t+ih/2)+'" class="axis-title" text-anchor="middle" transform="rotate(-90 12 '+(pad.t+ih/2)+')">'+(metric==="tasa" ? "Personas por 100.000 hab." : "Personas atendidas")+'</text>';
    s.innerHTML = g;
    ser.forEach((v,i)=>{
      const bh = ih*v[metric]/mx, x = pad.l + i*bw + bw*0.18, y = pad.t + ih - bh;
      const gg = document.createElementNS(SVGNS,"g"); gg.setAttribute("tabindex","0"); gg.setAttribute("class","bar-g");
      gg.innerHTML = '<rect x="'+x+'" y="'+y+'" width="'+(bw*0.64)+'" height="'+bh+'" rx="4" class="bar-fill'+(i===6?' bar-alt':'')+'"/><text x="'+(x+bw*0.32)+'" y="'+(y-6)+'" class="bar-val" text-anchor="middle">'+fmt(v[metric], metric==="tasa"?1:0)+'</text><text x="'+(x+bw*0.32)+'" y="'+(h-10)+'" class="axis-lab" text-anchor="middle">'+v.anio+'</text>';
      bindTip(gg, ()=> "<h5>"+v.anio+"</h5><p>"+fmt(v.personas)+" personas · "+fmt(v.tasa,1)+" por 100.000</p>"+(i===6?"<p class='muted'>Cambio de reporte (FEV-RIPS): no comparable.</p>":""));
      s.appendChild(gg);
    });
    box.innerHTML = ""; box.appendChild(s);
    const a = ser[0], b = ser[5], c20 = ser[1];
    setReading(rd, "Personas con residencia conocida. Entre 2019 y 2024 pasaron de " + fmt(a.personas) + " a " + fmt(b.personas) + " (" + fmt(100*(b.personas/a.personas-1),0) + " % más) y la prevalencia atendida de " + fmt(a.tasa,1) + " a " + fmt(b.tasa,1) + " por 100.000 habitantes. El único descenso fue en 2020 (" + fmt(c20.personas) + ", " + fmt(100*(c20.personas/a.personas-1),0) + " % frente a 2019). La barra naranja de 2025 (" + fmt(ser[6].personas) + ") casi duplica a 2024. No se interpreta como un aumento de casos: coincide con el cambio al RIPS como soporte de la factura electrónica y, según la hipótesis del equipo, sería una medición más completa, más cercana al número real (ver «Régimen y ruptura de 2025»). 2024 sigue siendo el año de referencia porque es comparable con 2019-2023. El aumento sostenido puede reflejar más diagnóstico y registro, no necesariamente más TEA.");
  }
  draw();
  }
  sub(body, "territorio-evolucion", "Evolución 2019-2025 por departamento", "Cada línea fina es un departamento; la gruesa, el total nacional; la naranja, el departamento seleccionado.");
  trendWidget(body);
  sub(body, "territorio-tabla", "Tabla por departamento y descarga");
  body.appendChild(dataTable());
}
/* barras nacionales: la misma longitud expresa personas y personas por 100.000 (una sola población) */
function tresBarras(esp, p25, p24, P, label, cls){
  const rows = [["Esperada (1 de cada 127, OMS)", esp, "bar-nat"],["Atendida, registro de 2025", p25, "bar-fill bar-alt"],["Atendida, 2024", p24, "bar-fill"]];
  const narrow = !!cls, w = narrow ? 400 : 580, rowH = narrow ? 84 : 58, h = rows.length*rowH + 10, sv = svgEl(w, h, cls || "", label); let g = "";
  rows.forEach((r,i)=>{
    const y = 10 + i*rowH, bw = Math.max(3, (w - (narrow ? 8 : 230))*r[1]/esp), val = fmt(r[1]) + ' personas · ' + fmt(r[1]/P*1e5, r[1]===esp?0:1) + ' por 100.000';
    g += '<text x="0" y="'+(y+12)+'" class="axis-lab strong">'+esc(r[0])+'</text><rect x="0" y="'+(y+20)+'" width="'+bw+'" height="24" rx="4" class="'+r[2]+'"/><text x="'+(narrow ? 0 : bw+8)+'" y="'+(narrow ? y+60 : y+37)+'" class="bar-val">'+val+'</text>';
  });
  sv.innerHTML = g; return sv;
}
function tresMedidas(body){
  let yr = "24", sort = "abs", reg = "todas";
  body.appendChild(chips([{id:"24",label:"2024"},{id:"25",label:"2025 (FEV-RIPS)"}], yr, id=>{ yr = id; draw(); }, "Año"));
  body.appendChild(chips([{id:"abs",label:"Ordenar por absoluta"},{id:"rel",label:"Ordenar por relativa"},{id:"esp",label:"Ordenar por esperada"}], sort, id=>{ sort = id; draw(); }, "Orden"));
  body.appendChild(regionChips(id=>{ reg = id; draw(); }));
  body.appendChild(howTo("la barra gris es lo esperado y la de color, lo atendido. A la izquierda, en personas; a la derecha, por 100.000 habitantes. La esperada relativa es igual en todos (787); por eso ordenar por la relativa es ordenar por la parte de las esperadas que se atendió."));
  const box = el("div",{class:"chart-box"}); body.appendChild(box);
  body.appendChild(legend([["bar-nat","Esperada"],["bar-fill","Atendida"]]));
  const rd = reading(); body.appendChild(rd);
  body.appendChild(sourceLine("Fuente: SISPRO-RIPS; DANE (población 2024); OMS. La esperada supone igual frecuencia en todo el país. Con pocas personas atendidas, un caso cambia mucho el porcentaje."));
  function draw(){
    const pk = "pers"+yr, rk = "tasa"+yr, ek = yr === "24" ? "pctEsp" : "pctEsp25";
    const list = DEP.filter(d=> reg === "todas" || d.region === reg).sort((a,b)=> sort === "abs" ? b[pk]-a[pk] : sort === "rel" ? b[rk]-a[rk] : b.esperados-a.esperados);
    const w = 760, rowH = 22, pad = { l:142, t:38 }, h = pad.t + list.length*rowH + 8, cA = 200, xB = pad.l + cA + 132, cB = 150;
    const mxA = niceMax(Math.max(...list.map(d=> Math.max(d.esperados, d[pk])))), mxB = 1e5/127;
    const s = svgEl(w, h, "tres-svg", "Prevalencia absoluta, relativa y esperada por departamento");
    s.innerHTML = '<text x="'+pad.l+'" y="14" class="axis-title">Personas: atendidas de esperadas</text><text x="'+xB+'" y="14" class="axis-title">Por 100.000 hab. (esperada: 787)</text><text x="'+(w-4)+'" y="14" text-anchor="end" class="axis-title">% de esperada</text><line x1="'+(xB+cB)+'" x2="'+(xB+cB)+'" y1="'+(pad.t-8)+'" y2="'+(h-6)+'" class="ref-line"/>';
    list.forEach((d,i)=>{
      const y = pad.t + i*rowH, g = document.createElementNS(SVGNS,"g"); g.setAttribute("class","bar-g rank-row" + (d.cod === STATE.sel ? " sel" : "")); g.setAttribute("tabindex","0"); g.setAttribute("role","button");
      g.setAttribute("aria-label", d.nombre + ": " + fmt(d[pk]) + " personas atendidas de " + fmt(d.esperados) + " esperadas; " + fmt(d[rk],1) + " por 100.000 habitantes; " + fmt(d[ek],0) + " % de la esperada");
      const wE = Math.max(1, cA*d.esperados/mxA), wP = Math.max(1, cA*d[pk]/mxA), wR = Math.max(1, cB*d[rk]/mxB);
      g.innerHTML = '<rect x="0" y="'+y+'" width="'+w+'" height="'+rowH+'" class="row-hit"/><text x="'+(pad.l-8)+'" y="'+(y+15)+'" text-anchor="end" class="axis-lab">'+esc(d.nombre)+'</text>' +
        '<rect x="'+pad.l+'" y="'+(y+4)+'" width="'+wE+'" height="'+(rowH-8)+'" rx="2" class="bar-nat"/><rect x="'+pad.l+'" y="'+(y+7)+'" width="'+wP+'" height="'+(rowH-14)+'" rx="2" class="bar-fill"/><text x="'+(pad.l+cA+6)+'" y="'+(y+15)+'" class="axis-lab">'+fmt(d[pk])+' de '+fmt(d.esperados)+'</text>' +
        '<rect x="'+xB+'" y="'+(y+4)+'" width="'+cB+'" height="'+(rowH-8)+'" rx="2" class="bar-nat"/><rect x="'+xB+'" y="'+(y+7)+'" width="'+Math.min(wR,cB)+'" height="'+(rowH-14)+'" rx="2" class="bar-fill"/><text x="'+(xB+cB+6)+'" y="'+(y+15)+'" class="bar-val">'+fmt(d[rk],1)+'</text><text x="'+(w-4)+'" y="'+(y+15)+'" text-anchor="end" class="bar-val">'+fmt(d[ek],0)+' %</text>';
      bindTip(g, ()=> deptCardHTML(d)); g.addEventListener("click", ()=> selectDept(d.cod));
      g.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); selectDept(d.cod); } });
      s.appendChild(g);
    });
    box.innerHTML = ""; box.appendChild(s);
    const P = list.reduce((a,d)=>a+d.pob,0), A = list.reduce((a,d)=>a+d[pk],0), E = list.reduce((a,d)=>a+d.esperados,0), hi = list.reduce((a,b)=> b[ek]>a[ek]?b:a), lo = list.reduce((a,b)=> b[ek]<a[ek]?b:a), abs = list.reduce((a,b)=> b[pk]>a[pk]?b:a), sd = BY[STATE.sel];
    let t = "En " + scopeName(reg) + ", en 20" + yr + " se atendió a " + fmt(A) + " personas (absoluta), " + fmt(A/P*1e5,1) + " por 100.000 habitantes (relativa), frente a " + fmt(E) + " que se esperarían (" + fmt(100*A/E,0) + " %). ";
    if(list.length > 1){ t += "Donde más personas se atienden es " + esc(abs.nombre) + " (" + fmt(abs[pk]) + "), pero la mayor parte de las esperadas se atiende en " + esc(hi.nombre) + " (" + fmt(hi[ek],0) + " %) y la menor en " + esc(lo.nombre) + " (" + fmt(lo[ek],0) + " %). "; if(abs.cod === hi.cod) t = t.replace(", pero la mayor", ", y también la mayor"); }
    t += esc(sd.nombre) + " (seleccionado): " + fmt(sd[pk]) + " de " + fmt(sd.esperados) + " esperadas, " + fmt(sd[rk],1) + " por 100.000 (" + fmt(sd[ek],0) + " %).";
    setReading(rd, t);
  }
  onSelect(draw); draw();
}
function trendWidget(body){
  let reg = "todas", show25 = true;
  const ctr = el("div",{class:"control-row"});
  ctr.appendChild(deptSelect("sel-tendencia", "Resaltar", cod=> selectDept(cod)));
  const t25 = el("label",{class:"check"},[ el("input",{type:"checkbox", checked:"", id:"chk-2025"}), " Incluir 2025 (ruptura de serie)" ]);
  t25.querySelector("input").addEventListener("change", e=>{ show25 = e.target.checked; draw(); });
  ctr.appendChild(t25); body.appendChild(ctr);
  body.appendChild(regionChips(id=>{ reg = id; draw(); }));
  const box = el("div",{class:"chart-box"}); body.appendChild(box);
  const rd = reading(); body.appendChild(rd);
  body.appendChild(sourceLine(C.serieNota));
  const rate = (d,i)=> d.serie[i] / d.pob * 1e5;
  function draw(){
    const yrs = show25 ? YEARS : YEARS.slice(0,6), n = yrs.length;
    const list = DEP.filter(d=> reg === "todas" || d.region === reg || d.cod === STATE.sel);
    const mx = niceMax(Math.max(...list.map(d=> Math.max(...d.serie.slice(0,n).map((v,i)=> rate(d,i)))), ...C.serieNacional.slice(0,n).map(s=>s.tasa)));
    const w = 680, h = 340, pad = { l:52, r:110, t:14, b:32 }, iw = w-pad.l-pad.r, ih = h-pad.t-pad.b;
    const X = i => pad.l + iw * i/(n-1), Y = v => pad.t + ih - ih*v/mx;
    const s = svgEl(w, h, "line-svg", "Serie de tasas por departamento");
    let g = "";
    if(show25) g += '<rect x="'+((X(5)+X(6))/2)+'" y="'+pad.t+'" width="'+((X(6)-X(5))/2+4)+'" height="'+ih+'" class="break-band"/><text x="'+(X(6)-4)+'" y="'+(pad.t+12)+'" class="axis-lab" text-anchor="end">FEV-RIPS</text>';
    ticks(mx).forEach(t=>{ g += '<line x1="'+pad.l+'" x2="'+(w-pad.r)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" class="grid"/><text x="'+(pad.l-8)+'" y="'+(Y(t)+4)+'" class="axis-lab" text-anchor="end">'+fmt(t)+'</text>'; });
    yrs.forEach((y,i)=>{ g += '<text x="'+X(i)+'" y="'+(h-10)+'" class="axis-lab" text-anchor="middle">'+y+'</text>'; });
    g += '<text x="12" y="'+(pad.t+ih/2)+'" class="axis-title" text-anchor="middle" transform="rotate(-90 12 '+(pad.t+ih/2)+')">Personas por 100.000 hab.</text>';
    s.innerHTML = g;
    const sel = BY[STATE.sel];
    yrs.forEach((y,i)=>{
      const hit = document.createElementNS(SVGNS,"rect"); hit.setAttribute("x", X(i) - iw/(n-1)/2); hit.setAttribute("y", pad.t); hit.setAttribute("width", iw/(n-1)); hit.setAttribute("height", ih); hit.setAttribute("class","col-hit");
      bindTip(hit, ()=> "<h5>"+y+"</h5><p>Nacional: <b>"+fmt(C.serieNacional[i].tasa,1)+"</b><br>"+esc(sel.nombre)+": <b>"+fmt(rate(sel,i),1)+"</b> ("+fmt(sel.serie[i])+" personas)</p>");
      s.appendChild(hit);
    });
    list.forEach(d=>{
      if(d.cod === STATE.sel) return;
      const p = document.createElementNS(SVGNS,"path");
      p.setAttribute("d", d.serie.slice(0,n).map((v,i)=> (i?"L":"M") + X(i).toFixed(1) + "," + Y(rate(d,i)).toFixed(1)).join(""));
      p.setAttribute("class","spag " + (reg === "todas" ? "spag-ctx" : REGION_CLASS[d.region])); p.setAttribute("tabindex","0");
      bindTip(p, ()=> "<h5>"+esc(d.nombre)+"</h5><p>"+yrs.map((y,i)=> y+": "+fmt(rate(d,i),1)).join("<br>")+"</p><p class='muted'>Clic para resaltar</p>");
      p.addEventListener("click", ()=> selectDept(d.cod));
      s.appendChild(p);
    });
    const nat = document.createElementNS(SVGNS,"g");
    nat.innerHTML = '<path d="'+C.serieNacional.slice(0,n).map((v,i)=> (i?"L":"M")+X(i)+","+Y(v.tasa)).join("")+'" class="nat-line"/><text x="'+(X(n-1)+6)+'" y="'+(Y(C.serieNacional[n-1].tasa)+4)+'" class="line-lab strong">Nacional</text>';
    s.appendChild(nat);
    const hl = document.createElementNS(SVGNS,"g"); let pts = "";
    sel.serie.slice(0,n).forEach((v,i)=>{ pts += '<circle cx="'+X(i)+'" cy="'+Y(rate(sel,i))+'" r="3.6" class="sel-dot"/>'; });
    hl.innerHTML = '<path d="'+sel.serie.slice(0,n).map((v,i)=> (i?"L":"M")+X(i)+","+Y(rate(sel,i))).join("")+'" class="sel-line"/>' + pts + '<text x="'+(X(n-1)+6)+'" y="'+(Y(rate(sel,n-1))+14)+'" class="line-lab sel-lab">'+esc(sel.nombre)+'</text>';
    s.appendChild(hl);
    box.innerHTML = ""; box.appendChild(s);
    const grp = DEP.filter(d=> reg === "todas" || d.region === reg);
    const P = grp.reduce((a,d)=>a+d.pob,0), r19 = grp.reduce((a,d)=>a+d.serie[0],0)/P*1e5, r24 = grp.reduce((a,d)=>a+d.serie[5],0)/P*1e5;
    const grow = grp.map(d=>({ d:d, g: d.serie[0] ? d.serie[5]/d.serie[0] : null })).filter(x=> x.g !== null && x.d.serie[0] >= 20).sort((a,b)=> b.g-a.g);
    let t = "En " + scopeName(reg) + " la prevalencia atendida conjunta pasó de " + fmt(r19,1) + " por 100.000 habitantes en 2019 a " + fmt(r24,1) + " en 2024 (×" + fmt(r24/r19,1) + "). ";
    if(grow.length >= 2) t += "Entre los departamentos con al menos 20 personas en 2019, el mayor crecimiento fue el de " + esc(grow[0].d.nombre) + " (×" + fmt(grow[0].g,1) + ") y el menor el de " + esc(grow[grow.length-1].d.nombre) + " (×" + fmt(grow[grow.length-1].g,1) + "). ";
    t += esc(sel.nombre) + ": " + fmt(sel.serie[0]) + " personas en 2019 y " + fmt(sel.serie[5]) + " en 2024 (" + fmt(rate(sel,0),1) + " → " + fmt(rate(sel,5),1) + " por 100.000).";
    setReading(rd, t);
  }
  onSelect(draw); draw();
}

/* ================================================================= 04 INTENSIDAD */
function renderIntensidad(){
  const body = document.getElementById("body-intensidad");
  body.appendChild(el("p",null,["Después de saber a cuántas personas se atiende, la cobertura responde qué reciben. Se presenta en dos dimensiones. La frecuencia es la tasa de atención: atenciones a personas con F84 por cada 100 personas atendidas con F84. La cercanía es la oportunidad de atenderse cerca del lugar de residencia: qué parte de las atenciones se presta en el propio departamento y qué parte de las personas vive en un municipio con sede de neuropediatría. Los registros no traen tiempos de espera ni distancias."]));
  const kp = el("div",{class:"stat-grid compact"});
  [["1.214","atenciones por cada 100 personas atendidas","unas 12 por persona en 2024; 2.922 con el registro de 2025"],["88,6 %","de las atenciones en el propio departamento","11,4 % fuera o sin prestador registrado"],["80,1 %","de las personas en municipios con sede","19,9 % en municipios sin neuropediatría"]].forEach(k=> kp.appendChild(el("div",{class:"stat-card"},[ el("div",{class:"value"},[k[0]]), el("div",{class:"label"},[k[1]]), el("div",{class:"detail"},[k[2]]) ])));
  body.appendChild(kp);
  sub(body, "intensidad-ranking", "Frecuencia: atenciones por cada 100 personas atendidas, 2024");
  rankingWidget(body, { def:"tasaAten", extra:(ind, list, reg)=> reg === "todas" ? "La frecuencia varía más que la prevalencia atendida: las atenciones están más concentradas entre departamentos (Gini 0,486) que las personas atendidas (Gini 0,240). Parte de la diferencia puede venir de la forma de registrar y facturar." : "" });
  sub(body, "intensidad-cercania", "Cercanía: ¿se atienden cerca de donde viven?", "Más oscuro significa más cercanía. Cambia el indicador.");
  mapWidget(body, { inds:["pctLocal","pctConSede"], def:"pctLocal", extra: ind=> ind === "pctLocal" ? "El resto de las atenciones se prestó en otro departamento o no tiene prestador registrado." : "En el país, 10.245 de 51.474 personas atendidas (19,9 %) viven en municipios sin sede." });
  body.appendChild(sourceLine("Fuente: SISPRO-RIPS 2024 (matriz de residencia por prestador y cruce municipal con el REPS del 13/11/2026)."));
  sub(body, "intensidad-ambas", "Frecuencia y cercanía a la vez", "Cada burbuja es un departamento.");
  body.appendChild(howTo("más a la derecha, más atenciones se prestan en el propio departamento; más arriba, más atenciones recibe cada 100 personas atendidas. Las líneas punteadas son los valores del país. El tamaño es la población y el color, la región."));
  scatterWidget(body, { x:"pctLocal", ys:["tasaAten"], colorBy:"region", labels:["08","13","05","11","94","99","97","25","41"],
    quad:{ hh:"Más cerca y más frecuente", lh:"Más lejos, más frecuente", ll:"Más lejos y menos frecuente", hl:"Más cerca, menos frecuente" } });
  body.appendChild(sourceLine("Fuente: SISPRO-RIPS 2024."));
  sub(body, "movilidad-flujos", "¿Dónde se atienden los residentes de cada departamento?", "Elige un departamento de residencia.");
  const ctr = el("div",{class:"control-row"}); ctr.appendChild(deptSelect("sel-flujos", "Residentes de", cod=> selectDept(cod))); body.appendChild(ctr);
  const fbox = el("div",{class:"chart-box"}); body.appendChild(fbox);
  body.appendChild(legend([["fl-local","Propio departamento"],["fl-out","Otro departamento"],["fl-na","Sin dato del prestador"]]));
  const frd = reading(); body.appendChild(frd);
  function drawFlows(){
    fbox.innerHTML = ""; fbox.appendChild(flowChart(STATE.sel));
    const d = BY[STATE.sel], row = D.flujos[d.cod], tot = d.aten24;
    const dest = Object.keys(row).filter(k=> k!==d.cod && k!=="-1").sort((a,b)=> row[b]-row[a]);
    const local = row[d.cod] || 0;
    let t = esc(d.nombre) + ": de " + fmt(tot) + " atenciones de sus residentes, " + fmt(100*local/tot,1) + " % se prestó en el propio departamento y " + fmt(d.pctFuera,1) + " % fuera o sin prestador registrado.";
    if(dest.length){ t += " El principal destino fue " + esc(BY[dest[0]].nombre) + " (" + fmt(row[dest[0]]) + "; " + fmt(100*row[dest[0]]/tot,1) + " %)"; t += dest.length > 1 ? ", seguido de " + esc(BY[dest[1]].nombre) + " (" + fmt(row[dest[1]]) + ")." : "."; }
    t += d.sedes === 0 ? " El departamento no tiene sedes con neuropediatría." : " Tiene " + fmt(d.sedes) + " sedes con neuropediatría (" + fmt(d.sedes100k,2) + " por 100.000).";
    setReading(frd, t);
  }
  onSelect(drawFlows); drawFlows();
  sub(body, "movilidad-balance", "Departamentos receptores y emisores", "Saldo neto = atenciones prestadas por las IPS del departamento menos atenciones recibidas por sus residentes.");
  body.appendChild(balanceChart());
  const brd = reading(); body.appendChild(brd);
  setReading(brd, "Bogotá D.C. es el gran receptor: sus IPS prestaron 20.703 atenciones más que las recibidas por sus residentes y el 29 % de lo que prestaron fue para personas de otros departamentos o con residencia desconocida. Atlántico y Valle del Cauca también reciben más de lo que envían. Entre los emisores netos están departamentos vecinos de esos polos (Cundinamarca y Boyacá cerca de Bogotá; Magdalena y Bolívar cerca de Atlántico; Risaralda cerca de Valle del Cauca), lo que sugiere que la cercanía geográfica pesa además de la falta de oferta.");
  sub(body, "intensidad-cruce", "¿Donde se atiende a más personas también se les atiende más?", "Cruce entre la prevalencia relativa (eje horizontal) y la frecuencia (eje vertical).");
  body.appendChild(howTo("las líneas punteadas marcan los valores nacionales y dividen el gráfico en cuatro cuadrantes. Arriba a la derecha están los departamentos que atienden a más personas por habitante y con más atenciones por persona."));
  scatterWidget(body, { x:"tasa24", ys:["tasaAten"], colorBy:"region", labels:["08","13","70","44","05","17","11"],
    quad:{ hh:"Más personas y más frecuencia", lh:"Menos personas, más frecuencia", ll:"Menos personas y menos frecuencia", hl:"Más personas, menos frecuencia" } });
  body.appendChild(sourceLine("Fuente: SISPRO-RIPS 2024. Correlación calculada en el navegador para los departamentos filtrados; con los 33 territorios coincide con el cálculo del proyecto."));
}

/* ================================================================= 05 OFERTA */
function renderOferta(){
  const body = document.getElementById("body-oferta");
  body.appendChild(el("p",null,["La oferta se aproxima con las sedes que tienen habilitado el servicio de neuropediatría (código 388) en el REPS. Es un indicador de habilitación: no dice cuántos especialistas hay, cuántas horas atienden ni cuánto se espera por una cita."]));
  const kp = el("div",{class:"stat-grid compact"});
  [["590","sedes con neuropediatría","1,12 por 100.000 habitantes"],["15,9 %","ofrecen telemedicina","94 sedes"],["5,6 %","son públicas","33 sedes"],["4","departamentos sin ninguna sede","Amazonas, Guainía, Vaupés y Vichada"],["115 de 966","municipios con sede","de los municipios con personas atendidas"]].forEach(k=> kp.appendChild(el("div",{class:"stat-card"},[ el("div",{class:"value"},[k[0]]), el("div",{class:"label"},[k[1]]), el("div",{class:"detail"},[k[2]]) ])));
  body.appendChild(kp);
  sub(body, "oferta-mapa", "Mapa de la oferta");
  mapWidget(body, { inds:["sedes100k"], def:"sedes100k", extra: ()=> "Los cuatro departamentos sin sede comparten el grupo más bajo del mapa." });
  body.appendChild(sourceLine("Fuente: REPS, corte 13/11/2026; DANE (población 2024)."));
  demandWidget(body);
  sub(body, "oferta-ranking", "Ranking de la oferta, telemedicina y sedes públicas", "Cambia el indicador para ver qué parte de la oferta es telemedicina o pública.");
  rankingWidget(body, { def:"sedes100k", inds:["sedes100k","pctTele","pctPub"], extra:(ind)=> ind === "sedes100k" ? "Sucre (5,39), Guaviare (3,55) y La Guajira (2,58) tienen más sedes por habitante que Bogotá (1,01): una sede habilitada no equivale a capacidad, y en departamentos con pocas personas atendidas cada sede pesa mucho en la tasa." : "Los porcentajes se calculan solo para los departamentos con al menos una sede; con pocas sedes un solo caso cambia mucho el porcentaje (por ejemplo, Putumayo tiene una sede y es de telemedicina)." });
}

/* ================================================================= 06 OFERTA VS ATENCIÓN */
/* ================================================================= 06 OFERTA VS PACIENTES (v4) */
function renderOfertaAtencion(){
  const body = document.getElementById("body-ofertaatencion");
  body.appendChild(el("p",null,["Primer cruce: si la oferta importa, los departamentos con más sedes de neuropediatría por habitante deberían atender a más personas. Aquí se compara la disponibilidad del servicio (eje horizontal) con el número de pacientes por habitante (eje vertical); el tamaño de cada burbuja es el número de atenciones. Abajo a la izquierda quedan los departamentos con poca oferta y pocos pacientes: es donde es más probable que haya necesidades sin atender."]));
  sub(body, "ofertaatencion-cruce", "Disponibilidad del servicio frente a personas atendidas");
  body.appendChild(howTo("cada burbuja es un departamento. Más a la derecha, más sedes de neuropediatría por habitante; más arriba, más personas atendidas por habitante. Para que el valor nacional quede en el centro, los ejes están en desviaciones estándar (DE) respecto al país; los números de los ejes y del recuadro emergente son los valores reales. Los departamentos a más de 3 DE se dibujan en el borde con línea punteada. El tamaño muestra el número de atenciones (puedes cambiarlo a atenciones por habitante o a población) y el color, la pobreza del departamento."));
  scatterWidget(body, { x:"sedes100k", ys:["tasa24"], sizes:["aten24","atenTasa","pob"], colorBy:"ipm", labels:["08","13","11","70","95","99","94","44","27","52"], need:true, flagLL:true, std:true,
    quad:{ hh:"Más oferta y más pacientes", lh:"Menos oferta, más pacientes", ll:"Menos oferta y menos pacientes: posible necesidad no atendida", hl:"Más oferta, menos pacientes" },
    extra:(yk, reg)=> reg === "todas" ? "En el modelo del proyecto, cada sede adicional por 100.000 habitantes se asocia con un 32 % más de personas atendidas, aun comparando departamentos igual de pobres." : "" });
  body.appendChild(el("aside",{class:"disclosure", "aria-label":"Advertencias sobre este gráfico"},[
    el("h4",null,["Antes de sacar conclusiones"]),
    el("ul",null,[
      el("li",null,["Es una comparación entre departamentos (análisis ecológico): no dice nada de personas concretas ni prueba que la oferta cause la atención."]),
      el("li",null,["«Posible necesidad no atendida» es una aproximación. Supone que el autismo es igual de frecuente en todos los departamentos y usa la estimación mundial de la OMS (1 de cada 127 personas), que no se ha medido en Colombia; el porcentaje sirve para comparar territorios, no como cifra exacta de personas sin atender."]),
      el("li",null,["La oferta solo cuenta sedes con neuropediatría habilitadas (REPS 2026), no especialistas, horas ni otras disciplinas (psiquiatría infantil, psicología, fonoaudiología, terapia ocupacional)."]),
      el("li",null,["El número de atenciones depende también de cómo se registra y factura cada servicio, y del tamaño del departamento: por eso puedes cambiar el tamaño a atenciones por 100.000 habitantes."]),
      el("li",null,["Con pocos pacientes (Vaupés, Guainía, Vichada) un solo caso cambia mucho la prevalencia atendida."]),
      el("li",null,["Los ejes estandarizados cambian la posición, no el orden: un departamento a +1 DE está una desviación estándar por encima del valor nacional. Como la oferta es muy asimétrica (Sucre tiene 5,39 sedes por 100.000), la mitad izquierda queda más vacía: casi ningún departamento puede estar a más de 1 DE por debajo de 1,12."])
    ])
  ]));
  body.appendChild(sourceLine("Fuente: SISPRO-RIPS 2024 y 2025; REPS 13/11/2026; DANE; OMS (prevalencia de referencia)."));
  sub(body, "movilidad-cruce", "¿Hay menos desplazamiento donde hay más oferta?");
  body.appendChild(howTo("eje horizontal: sedes por 100.000 habitantes; eje vertical: el indicador de movilidad elegido. Si la oferta local evita desplazamientos, los puntos deberían bajar hacia la derecha. El color indica la pobreza (IPM)."));
  scatterWidget(body, { x:"sedes100k", ys:["pctFuera","pctSinSede"], colorBy:"ipm", labels:["94","99","97","25","15","70","11"],
    quad:{ hh:"Más oferta y más desplazamiento", lh:"Menos oferta y más desplazamiento", ll:"Menos oferta y menos desplazamiento", hl:"Más oferta y menos desplazamiento" },
    extra:(yk, reg)=> reg === "todas" && yk === "pctFuera" ? "Donde hay menos sedes, más atenciones se prestan fuera del departamento; y donde la gente debe salir, se atiende a menos personas por habitante." : "" });
}

/* ================================================================= 02 DIAGRAMA CAUSAL */
function renderCausal(){
  const body = document.getElementById("body-causal");
  body.appendChild(el("p",null,["Antes de mirar los datos, un mapa de lo que puede explicar el número de atenciones de un departamento. El número de atenciones resulta de cuántas personas se atienden y de cuánta atención recibe cada una; detrás de ambas están la oferta, la detección, la condición de cada persona, el aseguramiento y la forma de registrar. Este diagrama es la guía de la segunda parte: cada factor medido enlaza con la sección donde están sus datos."]));
  sub(body, "causal-diagrama", "Diagrama causal del número de atenciones", "Modelo conceptual: qué factores pueden aumentar o reducir las atenciones de un departamento y cuáles se pueden medir con estos datos.");
  causalDiagram(body);
}

/* ---------------------------------------------------------------- diagrama causal */
function causalDiagram(body){
  const K = C.causal;
  body.appendChild(howTo("las flechas van de la causa al efecto; «+» indica que el factor tiende a aumentar lo que sigue y «−» que tiende a reducirlo. Los recuadros con borde continuo se miden en este análisis; los punteados, no. Pasa el cursor o haz clic en un factor para ver qué se sabe de él."));
  const colX = [10, 200, 390, 580, 760], bw = 170, bh = 54, rowY = r=> 20 + r*76;
  const w = 940, h = 20 + 5*76;
  const s = svgEl(w, h, "causal-svg", "Diagrama causal del número de atenciones");
  s.innerHTML = '<defs><marker id="carr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="arrow-head"/></marker></defs>';
  const pos = {};
  K.nodos.forEach(n=>{ const y = n.id === "atenciones" ? rowY(2) - 8 : rowY(n.row); pos[n.id] = { x: colX[n.col], y: y, w: n.id === "atenciones" ? 160 : bw, h: n.id === "atenciones" ? 70 : bh }; });
  const edgeEls = [];
  const cols = ["Contexto y determinantes", "Detección y oferta", "Personas y su condición", "Intensidad y registro", "Resultado"];
  colX.forEach((x,i)=>{ const t = document.createElementNS(SVGNS,"text"); t.setAttribute("x", x); t.setAttribute("y", 12); t.setAttribute("class","causal-col"); t.textContent = cols[i]; s.appendChild(t); });
  K.aristas.forEach(e=>{
    const a = pos[e.de], b = pos[e.a];
    const x1 = a.x + a.w, y1 = a.y + a.h/2, x2 = b.x - 3, y2 = b.y + b.h/2, mx = (x1+x2)/2;
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("class","cedge " + (e.s === "−" ? "neg" : e.s === "+" ? "pos" : "mix")); g.setAttribute("tabindex","0");
    g.innerHTML = '<path d="M'+x1+','+y1+' C'+mx+','+y1+' '+mx+','+y2+' '+x2+','+y2+'" marker-end="url(#carr)"/><text x="'+(mx)+'" y="'+((y1+y2)/2 - 3)+'" text-anchor="middle" class="cedge-sign">'+esc(e.s)+'</text>';
    g.dataset.de = e.de; g.dataset.a = e.a;
    bindTip(g, ()=> "<h5>"+esc(K.nodos.find(n=>n.id===e.de).t)+" → "+esc(K.nodos.find(n=>n.id===e.a).t)+"</h5><p>"+esc(e.d)+"</p>");
    s.appendChild(g); edgeEls.push(g);
  });
  const nodeEls = {};
  const detail = el("div",{class:"reading causal-detail", "aria-live":"polite"});
  K.nodos.forEach(n=>{
    const p = pos[n.id];
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("class","cnode m-" + n.m + (n.id === "atenciones" ? " cnode-out" : "")); g.setAttribute("tabindex","0"); g.setAttribute("role","button");
    const lines = wrapText(n.t, n.id === "atenciones" ? 18 : 24);
    g.innerHTML = '<rect x="'+p.x+'" y="'+p.y+'" width="'+p.w+'" height="'+p.h+'" rx="9"/>' + lines.map((l,i)=>'<text x="'+(p.x+p.w/2)+'" y="'+(p.y + p.h/2 - (lines.length-1)*7 + i*14 + 4)+'" text-anchor="middle">'+esc(l)+'</text>').join("") +
      '<text x="'+(p.x+p.w-6)+'" y="'+(p.y+11)+'" text-anchor="end" class="cnode-badge">'+(n.m==="si"?"medido":n.m==="parcial"?"en parte":"sin dato")+'</text>';
    bindTip(g, ()=> "<h5>"+esc(n.t)+"</h5><p>"+esc(n.d)+"</p>");
    const pick = ()=>{
      Object.values(nodeEls).forEach(x=> x.classList.remove("on"));
      g.classList.add("on");
      edgeEls.forEach(e=> e.classList.toggle("dim", e.dataset.de !== n.id && e.dataset.a !== n.id));
      const ins = K.aristas.filter(e=> e.a === n.id), outs = K.aristas.filter(e=> e.de === n.id);
      detail.innerHTML = "";
      detail.appendChild(el("h4",null,[n.t + " · " + (n.m==="si"?"medido en este análisis":n.m==="parcial"?"medido en parte":"sin dato en este análisis")]));
      detail.appendChild(el("p",null,[n.d]));
      if(ins.length) detail.appendChild(el("p",null,[ el("strong",null,["Lo afectan: "]), ins.map(e=> K.nodos.find(x=>x.id===e.de).t + " (" + e.s + ")").join("; ") + "." ]));
      if(outs.length) detail.appendChild(el("p",null,[ el("strong",null,["Afecta a: "]), outs.map(e=> K.nodos.find(x=>x.id===e.a).t + " (" + e.s + ")").join("; ") + "." ]));
      if(n.sec){ const b = el("button",{class:"finding-link", type:"button"},["Ver los datos de este factor →"]); b.addEventListener("click", ()=>{ openSection(n.sec); scrollSoon("sec-"+n.sec); }); detail.appendChild(b); }
      decorate(detail);
    };
    g.addEventListener("click", pick);
    g.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); pick(); } });
    s.appendChild(g); nodeEls[n.id] = g;
  });
  body.appendChild(el("div",{class:"diagram-wrap causal-wrap"},[s]));
  body.appendChild(legend([["cn-si","Medido en este análisis"],["cn-parcial","Medido en parte"],["cn-no","Sin dato (hipótesis)"],["ce-pos","Aumenta (+)"],["ce-neg","Reduce (−)"],["ce-mix","Depende (±)"]]));
  body.appendChild(detail);
  setReading(detail, "Haz clic en un factor para ver qué lo afecta, a qué afecta y qué datos hay. En resumen: el número de atenciones es el número de personas atendidas multiplicado por la tasa de atención (atenciones por cada 100 atendidos, dividida por 100). La oferta, a su vez, sigue en buena parte a la demanda esperada. Con estos datos se miden la oferta, la pobreza, la movilidad, las personas atendidas y la intensidad, pero no la severidad, la edad al diagnóstico, la composición de los equipos ni las autorizaciones de las EPS: por eso las diferencias entre departamentos no se pueden atribuir solo a la oferta.");
  const lt = el("button",{class:"btn a11y-list-toggle", type:"button", "aria-expanded":"false"},["Ver el diagrama como lista"]);
  const lst = el("ul",{class:"a11y-list"}); lst.hidden = true;
  K.aristas.forEach(e=> lst.appendChild(el("li",null,[ el("div",{class:"a11y-title"},[K.nodos.find(n=>n.id===e.de).t + " → " + K.nodos.find(n=>n.id===e.a).t + " (" + e.s + ")"]), el("div",{class:"a11y-meta"},[e.d]) ])));
  lt.addEventListener("click", ()=>{ lst.hidden = !lst.hidden; lt.setAttribute("aria-expanded", lst.hidden?"false":"true"); lt.textContent = lst.hidden ? "Ver el diagrama como lista" : "Ocultar la lista"; });
  body.appendChild(lt); body.appendChild(lst);
  body.appendChild(sourceLine(K.nota));
  body.appendChild(el("div",{class:"tag-row"},[confidenceTag("nota-autor")]));
}
function wrapText(t, n){ const words = t.split(" "), out = []; let cur = ""; words.forEach(w=>{ if((cur + " " + w).trim().length > n && cur){ out.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }); if(cur) out.push(cur); return out.slice(0,3); }



/* ---------------------------------------------------------------- ideas clave por sección (titulares de lectura) */
const CLAVES = {
  causal: "El número de atenciones depende de cuántas personas se atienden y de cuánta atención recibe cada una; varios de sus determinantes aún no se miden en los registros públicos.",
  normativa: "La Ley 2628 crea derechos y fija plazos hasta agosto de 2027, y la Resolución 3280 ya define el tamizaje de la primera infancia; la reglamentación puede articularlos con metas e indicadores.",
  paralelo: "La ley y la Política de Salud Mental se complementan en detección, atención, formación, información e inclusión, y pueden articularse en diagnóstico y coordinación.",
  instrumentos: "La EAD-3 y el m-Chat son las herramientas de la primera infancia según la Resolución 3280; hay otras validadas para detectar y diagnosticar el autismo en las demás edades.",
  nacional: "La mayoría son hombres y más de la mitad tiene entre 6 y 11 años; en 2025 las personas registradas aumentaron sobre todo en el contributivo, y las atenciones, en ambos regímenes.",
  territorio: "En 2024 se atendió a 51.474 personas con residencia conocida (absoluta), 97,8 por 100.000 habitantes (relativa), frente a 414.282 esperadas: cerca del 12 %, y cerca del 25 % con el registro de 2025.",
  intensidad: "Cada 100 personas atendidas recibieron 1.214 atenciones y el 88,6 % de ellas se prestó en su departamento; ambas cifras cambian mucho entre territorios.",
  oferta: "Las sedes de neuropediatría siguen a la demanda; lo que se aparta depende más de la región que de la pobreza.",
  ofertaatencion: "Donde hay más oferta se atiende a más personas; cerca de la mitad de los departamentos queda por debajo del país en ambas medidas.",
  pobreza: "A igual oferta, más pobreza se asocia con menos personas atendidas.",
  desigualdad: "La desigualdad entre departamentos es mayor en las atenciones que en las personas atendidas, y ocurre sobre todo dentro de las regiones.",
  huila: "El Huila atiende a menos personas por habitante que el país, con una tasa de atención similar a la nacional."
};

/* ---------------------------------------------------------------- relato con desplazamiento (scrollytelling) */
const STORY = [
  { t:"Absoluta, relativa y esperada: en 2024 se atendió a cerca de 12 de cada 100 personas esperadas", d:"Se atendió a 51.474 personas con residencia conocida (54.367 en total): 97,8 por 100.000 habitantes. Si 1 de cada 127 personas tuviera autismo (OMS), se esperarían 414.282, o 787 por 100.000. Con el registro de 2025 serían cerca de 25 de cada 100.", sec:"territorio" },
  { t:"La distancia con lo esperado cambia mucho entre territorios", d:"La prevalencia relativa va de 12 por 100.000 habitantes en Guainía a 240 en Atlántico, frente a 787 esperadas en todos: de un 2 % a un 30 % de lo esperado.", sec:"territorio" },
  { t:"Cobertura, frecuencia: cuánta atención recibe cada persona atendida", d:"Cada 100 personas atendidas recibieron 1.214 atenciones en el año. Va de 359 en Antioquia a 2.642 en Atlántico. Parte de la diferencia puede venir de la intensidad de las terapias y parte de la forma de registrar.", sec:"intensidad" },
  { t:"Cobertura, cercanía: ocho de cada diez personas viven en un municipio con sede", d:"El 80,1 % de las personas atendidas vive en un municipio con sede de neuropediatría y el 88,6 % de las atenciones se presta en el departamento de residencia. La telemedicina, presente en el 15,9 % de las sedes, puede acercar el servicio donde falta.", sec:"intensidad" },
  { t:"Las sedes siguen a la demanda; el Caribe tiene más de las esperadas", d:"Donde se esperan más casos hay más sedes de neuropediatría (ρ = 0,80). Lo que se aparta de esa relación depende más de la región que de la pobreza: en el mapa, el naranja indica más sedes de las esperadas y el azul, menos.", sec:"oferta" },
  { t:"A igual oferta, más pobreza va con menos personas atendidas", d:"Según el modelo del proyecto, por cada 10 puntos más de pobreza multidimensional la prevalencia atendida es un 29 % menor, aun con la misma oferta. El acceso al diagnóstico parece depender de algo más que de las sedes.", sec:"pobreza" },
  { t:"La Ley 2628 fija hitos para 2027 y estos datos pueden servir de línea de base", d:"La ley prevé reglamentar el Comité Nacional de Inclusión hacia febrero de 2027 y la política pública, la ruta de atención y la capacitación hacia agosto de 2027.", sec:"normativa" }
];
function renderStory(body){
  const host = document.getElementById("sec-contexto"); if(host) host.classList.add("story-host");
  sub(body, "contexto-relato", "Los resultados, paso a paso", "Desplázate: el gráfico cambia con cada paso y cada paso enlaza con su análisis completo.");
  const M = D.mapa;
  const avg = a=> a.reduce((x,y)=>x+y,0)/a.length;
  const esp = DEP.reduce((a,d)=>a+d.esperados,0), p24 = DEP.reduce((a,d)=>a+d.pers24,0), p25 = DEP.reduce((a,d)=>a+d.pers25,0);
  const lx = DEP.map(d=> Math.log(d.esperados)), ly = DEP.map(d=> Math.log(d.sedes+0.5)), mx = avg(lx), my = avg(ly);
  let sxy = 0, sxx = 0; lx.forEach((x,i)=>{ sxy += (x-mx)*(ly[i]-my); sxx += (x-mx)*(x-mx); });
  const bb = sxy/sxx, aa = my - bb*mx, RES = {}; DEP.forEach((d,i)=> RES[d.cod] = ly[i] - (aa + bb*lx[i]));
  function centroid(path){ const n = path.match(/-?\d+(\.\d+)?/g).map(Number); let x = 0, y = 0, k = 0; for(let i=0;i+1<n.length;i+=2){ x += n[i]; y += n[i+1]; k++; } return [x/k, y/k]; }
  function miniMap(cls, labels, label){
    const sv = svgEl(M.w, M.h, "map-svg story-svg", label);
    let g = '<rect x="'+M.inset.x+'" y="'+M.inset.y+'" width="'+M.inset.w+'" height="'+M.inset.h+'" rx="6" class="map-inset"/>';
    DEP.forEach(d=>{ g += '<path d="'+M.paths[d.cod]+'" class="dpto '+cls(d)+'"/>'; });
    labels.forEach(l=>{ const c = centroid(M.paths[l[0]]); g += '<text x="'+c[0].toFixed(1)+'" y="'+c[1].toFixed(1)+'" text-anchor="middle" class="pt-lab story-lab">'+esc(l[1])+'</text>'; });
    sv.innerHTML = g; return sv;
  }
  function seqCls(key){ const list = DEP.filter(d=> d[key] !== null), br = quantileBreaks(list.map(d=>d[key]), 6); return d=> d[key] === null ? "q-na" : "q" + classOf(d[key], br); }
  function ramp(lo, hi){ return el("div",{class:"story-ramp"},[ el("span",null,[lo]) ].concat([0,1,2,3,4,5].map(i=> el("i",{class:"q"+i}))).concat([ el("span",null,[hi]) ])); }
  function bars(rows, label, fmtv){
    const w = 560, rowH = 58, h = rows.length*rowH + 10, mxv = Math.max(...rows.map(r=>r[1]));
    const sv = svgEl(w, h, "story-svg", label); let g = "";
    rows.forEach((r,i)=>{ const y = 10 + i*rowH, bw = Math.max(3, (w-130)*r[1]/mxv); g += '<text x="0" y="'+(y+12)+'" class="axis-lab strong">'+esc(r[0])+'</text><rect x="0" y="'+(y+20)+'" width="'+bw+'" height="24" rx="4" class="'+(r[2]||"bar-fill")+'"/><text x="'+(bw+8)+'" y="'+(y+37)+'" class="bar-val">'+esc(fmtv(r[1]))+'</text>'; });
    sv.innerHTML = g; return sv;
  }
  const hiT = DEP.slice().sort((a,b)=> b.tasa24-a.tasa24)[0], loT = DEP.slice().sort((a,b)=> a.tasa24-b.tasa24)[0];
  const hiA = DEP.slice().sort((a,b)=> b.tasaAten-a.tasaAten)[0], loA = DEP.slice().sort((a,b)=> a.tasaAten-b.tasaAten)[0];
  const hiR = DEP.slice().sort((a,b)=> RES[b.cod]-RES[a.cod])[0], loR = DEP.slice().sort((a,b)=> RES[a.cod]-RES[b.cod])[0];
  const dv = d=>{ const v = RES[d.cod]; return v < -0.6 ? "dv-n2" : v < -0.2 ? "dv-n1" : v <= 0.2 ? "dv-0" : v <= 0.6 ? "dv-p1" : "dv-p2"; };
  const FR = [
    { cap:"Prevalencia absoluta, relativa y esperada", g: ()=> tresBarras(esp, p25, p24, DEP.reduce((a,d)=>a+d.pob,0), "Personas esperadas y atendidas, en número y por 100.000 habitantes", "story-svg"), note:"Personas con residencia conocida. Fuente: SISPRO-RIPS 2024 y 2025; DANE; OMS. Supone la misma frecuencia en todo el país." },
    { cap:"Prevalencia relativa 2024 (por 100.000 habitantes; esperada: 787)", g: ()=> miniMap(seqCls("tasa24"), [[hiT.cod, hiT.nombre + " " + fmt(hiT.tasa24,0)],[loT.cod, loT.nombre + " " + fmt(loT.tasa24,0)]], "Mapa de la prevalencia atendida"), legend: ()=> ramp("Menos", "Más"), note:"Colores por sextiles. Fuente: SISPRO-RIPS 2024; DANE." },
    { cap:"Frecuencia 2024 (atenciones por 100 personas atendidas)", g: ()=> miniMap(seqCls("tasaAten"), [[hiA.cod, hiA.nombre + " " + fmt(hiA.tasaAten,0)],[loA.cod, loA.nombre + " " + fmt(loA.tasaAten,0)]], "Mapa de la tasa de atención"), legend: ()=> ramp("Menos", "Más"), note:"Colores por sextiles. Fuente: SISPRO-RIPS 2024." },
    { cap:"Personas atendidas que viven en municipios con sede (%)", pal:"teal", g: ()=> miniMap(seqCls("pctConSede"), [], "Mapa del porcentaje de personas en municipios con sede"), legend: ()=> ramp("Menos", "Más"), note:"Colores por sextiles. Fuente: SISPRO-RIPS 2024; REPS 13/11/2026." },
    { cap:"Sedes de neuropediatría frente a las esperadas por la demanda", g: ()=> miniMap(dv, [[hiR.cod, hiR.nombre],[loR.cod, loR.nombre]], "Mapa de sedes observadas frente a esperadas"), legend: ()=> el("div",{class:"story-ramp dv"},[ el("span",null,["Menos de las esperadas"]), el("i",{class:"dv-n2"}), el("i",{class:"dv-n1"}), el("i",{class:"dv-0"}), el("i",{class:"dv-p1"}), el("i",{class:"dv-p2"}), el("span",null,["Más"]) ]), note:"Demanda = población ÷ 127. Ajuste exploratorio de este análisis. Fuente: REPS 13/11/2026; DANE." },
    { cap:"Prevalencia atendida relativa según la pobreza, a igual oferta", g: ()=> bars([10,20,30,40,50,60,70].map(v=> ["IPM de " + v + " %", 100*Math.pow(0.71, (v-10)/10), "bar-fill"]), "Prevalencia atendida relativa según el IPM", v=> fmt(v,0)), note:"Índice: 100 = departamento con IPM de 10 %. Cálculo con la razón de tasas del modelo cuasi-Poisson (0,71 por cada 10 puntos de IPM, ajustada por oferta)." },
    { cap:"Hitos de la Ley 2628 de 2026", g: ()=>{
        const w = 560, h = 210, sv = svgEl(w, h, "story-svg", "Hitos de la Ley 2628"), x0 = 30, x1 = w-30, t0 = new Date(2026,7,26).getTime(), t1 = new Date(2027,7,26).getTime(), X = d=> x0 + (x1-x0)*(d.getTime()-t0)/(t1-t0);
        const hitos = [[new Date(2026,7,26),"Sanción","26 ago 2026"],[new Date(2027,1,26),"Comité Nacional de Inclusión","feb 2027"],[new Date(2027,7,26),"Política, ruta y capacitación","ago 2027"]];
        let g = '<line x1="'+x0+'" x2="'+x1+'" y1="90" y2="90" class="tl-axis"/>';
        hitos.forEach((hh,i)=>{ const x = X(hh[0]), anc = i === 0 ? "start" : i === 2 ? "end" : "middle"; g += '<circle cx="'+x+'" cy="90" r="9" class="tl-dot"/><text x="'+x+'" y="60" text-anchor="'+anc+'" class="axis-lab strong">'+esc(hh[1])+'</text><text x="'+x+'" y="124" text-anchor="'+anc+'" class="axis-lab">'+esc(hh[2])+'</text>'; });
        const hoy = new Date(); if(hoy.getTime() > t0 && hoy.getTime() < t1){ const x = X(hoy); g += '<line x1="'+x+'" x2="'+x+'" y1="72" y2="150" class="tl-today"/><text x="'+(x+4)+'" y="164" class="axis-lab tl-today-lab">Hoy</text>'; }
        sv.innerHTML = g; return sv; }, note:"Plazos contados desde la sanción (26/08/2026). Fuente: Ley 2628 de 2026." }
  ];
  const wrap = el("div",{class:"story"});
  const gr = el("div",{class:"story-graphic", "aria-hidden":"true"});
  const frames = FR.map((f,i)=>{ const fig = el("figure",{class:"story-frame" + (f.pal ? " pal-" + f.pal : "") + (i===0?" on":"")},[ el("figcaption",{class:"story-cap"},[f.cap]) ]); fig.appendChild(f.g()); if(f.legend) fig.appendChild(f.legend()); fig.appendChild(el("p",{class:"story-note"},[f.note])); gr.appendChild(fig); return fig; });
  const stepsBox = el("div",{class:"story-steps"});
  const steps = STORY.map((st,i)=>{
    const b = el("button",{type:"button", class:"finding-link"},["Ver el análisis completo"]);
    b.addEventListener("click", ()=>{ openSection(st.sec); scrollSoon("sec-"+st.sec); });
    const sec = el("section",{class:"story-step" + (i===0?" on":""), "data-i":String(i), "aria-label":"Paso " + (i+1) + " de " + STORY.length},[ el("div",{class:"story-card"},[ el("span",{class:"story-n"},["Paso " + (i+1) + " de " + STORY.length]), el("h4",null,[st.t]), el("p",null,[st.d]), b ]) ]);
    stepsBox.appendChild(sec); return sec;
  });
  wrap.appendChild(gr); wrap.appendChild(stepsBox); body.appendChild(wrap);
  const setActive = i=>{ frames.forEach((f,j)=> f.classList.toggle("on", j===i)); steps.forEach((s,j)=> s.classList.toggle("on", j===i)); };
  if("IntersectionObserver" in window){
    const io = new IntersectionObserver(es=> es.forEach(e=>{ if(e.isIntersecting) setActive(+e.target.dataset.i); }), { rootMargin:"-50% 0px -40% 0px" });
    steps.forEach(st=> io.observe(st));
  }
  steps.forEach(st=> st.addEventListener("focusin", ()=> setActive(+st.dataset.i)));
}

/* ---------------------------------------------------------------- tamaño del texto */
function initTextSize(){
  const btn = document.getElementById("text-size-btn"), menu = document.getElementById("text-size-menu");
  if(!btn || !menu) return;
  TEXT_SIZES.forEach(t=>{
    const b = el("button",{type:"button", class:"ts-opt", "data-k":t.k, "aria-pressed":"false"},[ el("span",null,[t.l]), el("span",{class:"ts-p"},[t.p]) ]);
    b.addEventListener("click", ()=>{ applyTextSize(t.k); });
    menu.appendChild(b);
  });
  applyTextSize(document.documentElement.getAttribute("data-text") || "0");
  btn.addEventListener("click", ()=>{ const open = menu.hidden; menu.hidden = !open; btn.setAttribute("aria-expanded", open ? "true" : "false"); if(open){ const cur = menu.querySelector('[aria-pressed="true"]'); if(cur) cur.focus(); } });
  document.addEventListener("click", e=>{ if(!menu.hidden && !e.target.closest("#text-size")){ menu.hidden = true; btn.setAttribute("aria-expanded","false"); } });
}

/* ---------------------------------------------------------------- oferta frente a demanda */
function demandWidget(body){
  sub(body, "oferta-demanda", "¿La oferta sigue a la demanda?", "Primer paso: comparar el número de sedes con el tamaño de la demanda. Si la oferta sigue a la demanda, los puntos se alinean cerca de la línea.");
  let dem = "esp", colorBy = "region";
  const DM = { esp:{ label:"Casos esperados (población ÷ 127)", short:"casos esperados", val:d=> d.esperados }, per:{ label:"Personas atendidas 2024", short:"personas atendidas", val:d=> d.pers24 } };
  body.appendChild(chips([{id:"esp",label:"Demanda: casos esperados (OMS)"},{id:"per",label:"Demanda: personas atendidas"}], dem, id=>{ dem = id; draw(); }, "Medida de la demanda"));
  body.appendChild(chips([{id:"region",label:"Color: región"},{id:"ipm",label:"Color: pobreza (IPM)"}], colorBy, id=>{ colorBy = id; draw(); }, "Color de los puntos"));
  body.appendChild(howTo("cada punto es un departamento. El eje horizontal es la demanda y el vertical, el número de sedes con neuropediatría; ambos en escala logarítmica, porque los departamentos van de cientos a decenas de miles de casos. La línea es lo que se esperaría según la demanda (ajuste en el navegador). Arriba de la línea: más sedes de las esperadas; abajo: menos."));
  const box = el("div",{class:"chart-box"}); body.appendChild(box);
  const lg = el("div"); body.appendChild(lg);
  const rd = reading(); body.appendChild(rd);
  sub(body, "oferta-residuo", "Lo que se aparta de la demanda: ¿riqueza o región?", "Segundo paso: para cada departamento, sedes que tiene frente a las que se esperarían por su demanda. Si la riqueza explicara la diferencia, los departamentos menos pobres estarían arriba.");
  const box2 = el("div",{class:"chart-box"}); body.appendChild(box2);
  const rd2 = reading(); body.appendChild(rd2);
  body.appendChild(sourceLine("Fuente: REPS 13/11/2026; DANE 2024; SISPRO-RIPS 2024; OMS (1 de cada 127). Ajuste por mínimos cuadrados de ln(sedes + 0,5) sobre ln(demanda), calculado en el navegador; es un análisis exploratorio de este análisis, no del libro del proyecto."));
  body.appendChild(el("div",{class:"tag-row"},[confidenceTag("preliminar")]));
  const ipmBr = [10, 15, 20, 30];
  function fit(xs, ys){ const n = xs.length, mx = xs.reduce((a,b)=>a+b,0)/n, my = ys.reduce((a,b)=>a+b,0)/n; let sxy=0, sxx=0, syy=0; for(let i=0;i<n;i++){ sxy += (xs[i]-mx)*(ys[i]-my); sxx += (xs[i]-mx)**2; syy += (ys[i]-my)**2; } const b = sxy/sxx; return { a: my - b*mx, b: b, r2: sxy*sxy/(sxx*syy) }; }
  function eta2(vals){ const m = vals.reduce((a,b)=>a+b,0)/vals.length; let st = 0, sb = 0; vals.forEach(v=> st += (v-m)**2); REGION_ORDER.forEach(rg=>{ const g = DEP.map((d,i)=> d.region === rg ? vals[i] : null).filter(v=> v !== null); if(g.length){ const gm = g.reduce((a,b)=>a+b,0)/g.length; sb += g.length*(gm-m)**2; } }); return sb/st; }
  function cls(d){ return colorBy === "ipm" ? "bub ipm" + classOf(d.ipm, ipmBr) : "bub rgb " + REGION_CLASS[d.region]; }
  function draw(){
    const M = DM[dem];
    const lx = DEP.map(d=> Math.log(M.val(d))), ly = DEP.map(d=> Math.log(d.sedes + 0.5));
    const F = fit(lx, ly), res = DEP.map((d,i)=> ly[i] - (F.a + F.b*lx[i]));
    DEP.forEach((d,i)=>{ d._res = res[i]; d._espSedes = Math.max(0, Math.exp(F.a + F.b*lx[i]) - 0.5); });
    const w = 680, h = 400, pad = { l:58, r:24, t:18, b:46 }, iw = w-pad.l-pad.r, ih = h-pad.t-pad.b;
    const xmin = Math.log(Math.min(...DEP.map(M.val))*0.8), xmax = Math.log(Math.max(...DEP.map(M.val))*1.2), ymin = Math.log(0.5), ymax = Math.log(100.5);
    const PX = v=> pad.l + iw*(Math.log(v)-xmin)/(xmax-xmin), PYl = l=> pad.t + ih - ih*(l-ymin)/(ymax-ymin), PY = n=> PYl(Math.log(n + 0.5));
    const s = svgEl(w, h, "scatter-svg", "Sedes de neuropediatría frente a la demanda");
    let g = "";
    [0,1,2,5,10,20,50,100].forEach(t=>{ g += '<line x1="'+pad.l+'" x2="'+(w-pad.r)+'" y1="'+PY(t)+'" y2="'+PY(t)+'" class="grid"/><text x="'+(pad.l-8)+'" y="'+(PY(t)+4)+'" class="axis-lab" text-anchor="end">'+t+'</text>'; });
    [10,30,100,300,1000,3000,10000,30000,60000].forEach(t=>{ if(Math.log(t) < xmin || Math.log(t) > xmax) return; g += '<line x1="'+PX(t)+'" x2="'+PX(t)+'" y1="'+pad.t+'" y2="'+(h-pad.b)+'" class="grid"/><text x="'+PX(t)+'" y="'+(h-pad.b+16)+'" class="axis-lab" text-anchor="middle">'+fmt(t)+'</text>'; });
    g += '<text x="'+(pad.l+iw/2)+'" y="'+(h-6)+'" class="axis-title" text-anchor="middle">'+esc(M.label)+' (escala logarítmica)</text>';
    g += '<text transform="translate(14,'+(pad.t+ih/2)+') rotate(-90)" class="axis-title" text-anchor="middle">Sedes con neuropediatría (escala logarítmica)</text>';
    const x0 = Math.exp(xmin), x1 = Math.exp(xmax);
    g += '<line x1="'+PX(x0)+'" y1="'+PYl(F.a+F.b*xmin)+'" x2="'+PX(x1)+'" y2="'+PYl(F.a+F.b*xmax)+'" class="fit-line"/>';
    g += '<text x="'+(w-pad.r-6)+'" y="'+(pad.t+14)+'" class="quad-lab" text-anchor="end">Más sedes de las esperadas</text><text x="'+(w-pad.r-6)+'" y="'+(h-pad.b-8)+'" class="quad-lab" text-anchor="end">Menos sedes de las esperadas</text>';
    s.innerHTML = g;
    DEP.forEach(d=>{
      const c = document.createElementNS(SVGNS,"circle");
      c.setAttribute("cx", PX(M.val(d))); c.setAttribute("cy", PY(d.sedes)); c.setAttribute("r", 6);
      c.setAttribute("class", cls(d) + (d.cod === STATE.sel ? " sel" : "")); c.setAttribute("tabindex","0"); c.setAttribute("role","button");
      c.setAttribute("aria-label", d.nombre + ": " + fmt(d.sedes) + " sedes; " + M.short + " " + fmt(M.val(d)));
      bindTip(c, ()=> "<h5>"+esc(d.nombre)+"</h5><p class='tip-region'>"+esc(d.region)+" · IPM "+fmt(d.ipm,1)+" %</p><p>Sedes: <b>"+fmt(d.sedes)+"</b><br>"+esc(M.label)+": <b>"+fmt(M.val(d))+"</b><br>Sedes esperadas por su demanda: <b>"+fmt(d._espSedes,1)+"</b></p>");
      c.addEventListener("click", ()=> selectDept(d.cod));
      s.appendChild(c);
    });
    DEP.filter(d=> ["11","05","08","70","25","99","27","19","23"].includes(d.cod) || d.cod === STATE.sel).forEach(d=>{
      const t = document.createElementNS(SVGNS,"text"); t.setAttribute("x", PX(M.val(d)) + 8); t.setAttribute("y", PY(d.sedes) + 4);
      t.setAttribute("class","pt-lab" + (d.cod === STATE.sel ? " sel-pt-lab" : "")); t.textContent = d.nombre.replace(" D.C.",""); s.appendChild(t);
    });
    box.innerHTML = ""; box.appendChild(s);
    lg.innerHTML = ""; lg.appendChild(colorBy === "ipm" ? legend([["bub-sw ipm0","IPM < 10 %"],["bub-sw ipm1","10–15 %"],["bub-sw ipm2","15–20 %"],["bub-sw ipm3","20–30 %"],["bub-sw ipm4","≥ 30 %"],["fit-sw","Sedes esperadas por la demanda"]]) : legend(REGION_ORDER.map(r=>["rg-sw "+REGION_CLASS[r], r]).concat([["fit-sw","Sedes esperadas por la demanda"]])));
    const rho = spearman(DEP.map(M.val), DEP.map(d=> d.sedes));
    setReading(rd, "La oferta sí sigue a la demanda: los departamentos con más " + esc(M.short) + " tienen más sedes (ρ = " + fmt(rho,2) + "). En escala logarítmica, el tamaño de la demanda explica cerca del " + fmt(100*F.r2,0) + " % de las diferencias en el número de sedes, y la pendiente (" + fmt(F.b,2) + ") indica que " + (F.b > 0.85 ? "las sedes crecen casi en proporción a la demanda" : "las sedes crecen algo menos que la demanda: los departamentos grandes tienen menos sedes por caso") + ". " + (dem === "per" ? "Ojo: las personas atendidas dependen a su vez de la oferta, así que esta comparación exagera el ajuste; la de casos esperados es la más limpia." : "Los casos esperados suponen la misma frecuencia de autismo en todo el país (1 de cada 127)."));
    // residuos
    const list = DEP.slice().sort((a,b)=> b._res - a._res);
    const w2 = 680, rowH = 17, pad2 = { l:150, r:150, t:24 }, h2 = pad2.t + list.length*rowH + 8, iw2 = w2 - pad2.l - pad2.r, cx = pad2.l + iw2/2;
    const mxr = Math.max(...list.map(d=> Math.abs(d._res)));
    const s2 = svgEl(w2, h2, "", "Sedes observadas frente a esperadas por departamento");
    let g2 = '<line x1="'+cx+'" x2="'+cx+'" y1="'+(pad2.t-6)+'" y2="'+h2+'" class="axis"/><text x="'+(cx-6)+'" y="12" class="axis-lab" text-anchor="end">Menos sedes de las esperadas</text><text x="'+(cx+6)+'" y="12" class="axis-lab">Más sedes de las esperadas</text>';
    s2.innerHTML = g2;
    list.forEach((d,i)=>{
      const y = pad2.t + i*rowH, bw = (iw2/2)*Math.abs(d._res)/mxr, pos = d._res >= 0;
      const gg = document.createElementNS(SVGNS,"g"); gg.setAttribute("class","bar-g rank-row" + (d.cod === STATE.sel ? " sel" : "")); gg.setAttribute("tabindex","0");
      const fill = colorBy === "ipm" ? "bub ipm" + classOf(d.ipm, ipmBr) : "bub rgb " + REGION_CLASS[d.region];
      gg.innerHTML = '<rect x="0" y="'+y+'" width="'+w2+'" height="'+rowH+'" class="row-hit"/><text x="'+(pad2.l-8)+'" y="'+(y+12)+'" class="axis-lab" text-anchor="end">'+esc(d.nombre)+'</text><rect x="'+(pos?cx:cx-bw)+'" y="'+(y+3)+'" width="'+Math.max(bw,1)+'" height="'+(rowH-6)+'" rx="2" class="'+fill+'"/><text x="'+(w2-pad2.r+8)+'" y="'+(y+12)+'" class="axis-lab">'+fmt(d.sedes)+' de '+fmt(d._espSedes, d._espSedes < 10 ? 1 : 0)+' esperadas</text>';
      bindTip(gg, ()=> "<h5>"+esc(d.nombre)+"</h5><p class='tip-region'>"+esc(d.region)+" · IPM "+fmt(d.ipm,1)+" %</p><p>Tiene <b>"+fmt(d.sedes)+"</b> sedes; por su demanda se esperarían <b>"+fmt(d._espSedes,1)+"</b>.</p>");
      gg.addEventListener("click", ()=> selectDept(d.cod));
      s2.appendChild(gg);
    });
    box2.innerHTML = ""; box2.appendChild(s2);
    const rIpm = spearman(res, DEP.map(d=> d.ipm)), e2 = eta2(res);
    const top = list.slice(0,5).map(d=> esc(d.nombre)), bot = list.slice(-6).reverse().map(d=> esc(d.nombre));
    const cari = DEP.filter(d=> d.region === "Caribe"), cariUp = cari.filter(d=> d._res > 0).length;
    setReading(rd2, "Lo que sobra o falta frente a la demanda casi no se relaciona con la pobreza (ρ con el IPM = " + fmt(rIpm,2) + ": " + (Math.abs(rIpm) < 0.2 ? "prácticamente nula" : strength(rIpm)) + "). En cambio, la región explica cerca del " + fmt(100*e2,0) + " % de esas diferencias: " + cariUp + " de los " + cari.length + " departamentos del Caribe tienen más sedes de las esperadas. Con más sedes de las esperadas están " + joinNames(top) + "; con menos, " + joinNames(bot) + ". Cundinamarca se explica en parte por su cercanía a Bogotá, adonde viajan sus residentes. Descartada la riqueza, quedan como explicaciones la región (cómo se organizan las redes de prestadores y dónde se habilitan servicios) y la cercanía a los grandes polos; con estos datos no se puede ir más allá.");
  }
  onSelect(draw); draw();
}

/* ---------------------------------------------------------------- navegación entre preguntas */
function addSectionNav(){
  SECTIONS.forEach((s,i)=>{
    const body = document.getElementById("body-"+s.id); if(!body) return;
    if(CLAVES[s.id]) body.insertBefore(el("p",{class:"key-idea"},[ el("strong",null,["En una frase. "]), CLAVES[s.id] ]), body.firstChild);
    const prev = SECTIONS[i-1], next = SECTIONS[i+1];
    const nav = el("nav",{class:"sec-nav", "aria-label":"Navegación entre preguntas"});
    const mk = (t, kind)=>{
      const b = el("button",{type:"button", class:"sec-nav-btn " + kind},[ el("span",{class:"sec-nav-k"},[kind === "prev" ? "Pregunta anterior" : (t.part !== s.part && t.part ? "Siguiente parte · " + PARTS.find(x=>x.id===t.part).t : "Siguiente pregunta")]), el("span",{class:"sec-nav-t"},[t.num + ". " + t.title]) ]);
      b.addEventListener("click", ()=>{ const cur = document.getElementById("sec-"+s.id); toggleSection(cur, cur.querySelector(".acc-header"), false); openSection(t.id); scrollSoon("sec-"+t.id); });
      return b;
    };
    nav.appendChild(prev ? mk(prev, "prev") : el("span"));
    if(next) nav.appendChild(mk(next, "next"));
    body.appendChild(nav);
  });
}

/* ================================================================= 11 INSTRUMENTOS POR CICLO VITAL */
function renderInstrumentos(){
  const body = document.getElementById("body-instrumentos");
  const I = C.instrumentos;
  body.appendChild(el("p",null,[I.intro]));
  sub(body, "instrumentos-linea", "Herramientas según la edad", "Cada barra muestra las edades para las que se diseñó la herramienta. Las franjas de fondo indican qué porcentaje de las personas atendidas en 2024 estaba en cada etapa.");
  const tipos = ["Vigilancia","Tamizaje","Apoyo al diagnóstico","Diagnóstico"], tcls = { "Vigilancia":"tp-vig", "Tamizaje":"tp-tam", "Apoyo al diagnóstico":"tp-apo", "Diagnóstico":"tp-dia" };
  // escala por tramos: la primera infancia necesita más espacio que la adultez
  const knots = [[0,0],[3,0.25],[6,0.38],[12,0.56],[18,0.72],[65,1]];
  const w = 760, pad = { l:250, r:16, t:56 }, iw = w - pad.l - pad.r, rowH = 30, h = pad.t + I.items.length*rowH + 14;
  const AX = a=>{ for(let i=1;i<knots.length;i++){ if(a <= knots[i][0]){ const [a0,f0] = knots[i-1], [a1,f1] = knots[i]; return pad.l + iw*(f0 + (f1-f0)*(a-a0)/(a1-a0)); } } return pad.l + iw; };
  const s = svgEl(w, h, "life-svg", "Instrumentos de detección y diagnóstico según la edad");
  const etapas = [ { a:0, b:6, t:"0 a 5 años", p:16.7 }, { a:6, b:12, t:"6 a 11 años", p:55.2 }, { a:12, b:18, t:"12 a 17 años", p:15.4 }, { a:18, b:65, t:"18 años o más", p:12.6 } ];
  let g = "";
  etapas.forEach((e,i)=>{ g += '<rect x="'+AX(e.a)+'" y="'+(pad.t-46)+'" width="'+(AX(e.b)-AX(e.a))+'" height="'+(h-pad.t+46-8)+'" class="etapa e'+i+'"/><text x="'+((AX(e.a)+AX(e.b))/2)+'" y="'+(pad.t-32)+'" text-anchor="middle" class="axis-lab strong">'+e.t+'</text><text x="'+((AX(e.a)+AX(e.b))/2)+'" y="'+(pad.t-18)+'" text-anchor="middle" class="axis-lab">'+fmt(e.p,1)+' % de atendidos</text>'; });
  [0,1,2,3,4,6,12,18,30,65].forEach(a=>{ g += '<line x1="'+AX(a)+'" x2="'+AX(a)+'" y1="'+(pad.t-6)+'" y2="'+(h-8)+'" class="grid"/><text x="'+AX(a)+'" y="'+(pad.t-4)+'" text-anchor="middle" class="axis-lab small-lab">'+a+'</text>'; });
  g += '<text x="'+(pad.l-8)+'" y="'+(pad.t-4)+'" text-anchor="end" class="axis-title">Edad (años)</text>';
  s.innerHTML = g;
  const det = el("div",{class:"reading causal-detail", "aria-live":"polite"});
  I.items.forEach((it,i)=>{
    const y = pad.t + i*rowH + 4, x1 = AX(it.desde), x2 = AX(it.hasta);
    const gg = document.createElementNS(SVGNS,"g"); gg.setAttribute("class","bar-g life-row"); gg.setAttribute("tabindex","0"); gg.setAttribute("role","button");
    gg.innerHTML = '<rect x="0" y="'+(y-3)+'" width="'+w+'" height="'+rowH+'" class="row-hit"/><text x="'+(pad.l-8)+'" y="'+(y+15)+'" text-anchor="end" class="axis-lab">'+esc(it.nombre)+'</text><rect x="'+x1+'" y="'+(y+3)+'" width="'+Math.max(x2-x1,4)+'" height="'+(rowH-12)+'" rx="5" class="'+tcls[it.tipo]+'"/>' + (it.norma ? '<text x="'+(x2+6)+'" y="'+(y+15)+'" class="axis-lab strong">'+esc(it.norma)+'</text>' : "");
    const html = ()=> "<h5>"+esc(it.nombre)+" · "+esc(it.tipo)+"</h5><p>Edades: "+(it.edadTxt ? esc(it.edadTxt) : fmt(it.desde,it.desde%1?1:0)+" a "+(it.hasta>=65?"adultez":fmt(it.hasta,it.hasta%1?1:0)+" años"))+"<br>Responde: "+esc(it.quien)+"</p><p>"+esc(it.d)+"</p>";
    bindTip(gg, html);
    const pick = ()=>{
      det.innerHTML = "";
      det.appendChild(el("h4",null,[it.nombre + " · " + it.tipo]));
      det.appendChild(el("p",null,["Edades: " + (it.edadTxt ? it.edadTxt : (it.desde < 1 ? "desde los " + Math.round(it.desde*12) + " meses" : it.desde < 3 && it.desde % 1 ? "desde los " + Math.round(it.desde*12) + " meses" : "desde los " + it.desde + " años") + (it.hasta >= 65 ? " hasta la adultez" : " hasta los " + (it.hasta % 1 ? Math.round(it.hasta*12) + " meses" : it.hasta + " años"))) + ". Responde: " + it.quien + "."]));
      det.appendChild(el("p",null,[it.d]));
      det.appendChild(el("p",{class:"link-row"},[ "Referencia: ", el("a",{href:it.url, target:"_blank", rel:"noopener"},[it.ref]) ]));
      decorate(det);
    };
    gg.addEventListener("click", pick); gg.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); pick(); } });
    s.appendChild(gg);
  });
  body.appendChild(el("div",{class:"diagram-wrap life-wrap"},[s]));
  body.appendChild(legend([["tp-vig","Vigilancia del desarrollo"],["tp-tam","Tamizaje (detecta riesgo)"],["tp-apo","Apoyo al diagnóstico"],["tp-dia","Diagnóstico (lo confirma un equipo)"]]));
  body.appendChild(det);
  setReading(det, "En la primera infancia, la Resolución 3280 de 2018 define la EAD-3 en cada consulta y el m-Chat entre los 18 y los 30 meses; el 83 % de las personas atendidas en 2024 tenía 6 años o más. Para escolares, adolescentes y adultos existen cuestionarios de tamizaje validados (SCQ, CAST, AQ en sus versiones) y para todas las edades instrumentos diagnósticos (ADOS-2, ADI-R) que debe aplicar un equipo entrenado. La reglamentación de la Ley 2628 es una oportunidad para orientar la detección en las demás edades. Haz clic en una barra para ver el detalle.");
  body.appendChild(el("p",{class:"muted small"},[I.nota]));
  body.appendChild(el("h4",{class:"chart-title"},["Guías de referencia"]));
  body.appendChild(el("ul",{class:"ref-list"}, I.guias.map(g=> el("li",null,[ el("a",{href:g.url, target:"_blank", rel:"noopener"},[g.label]) ]))));
}

/* ================================================================= 12 NORMATIVA: vacíos y paralelo */
function renderNormativaExtras(){
  const body = document.getElementById("body-normativa");
  const L = C.normativa.ley2628;
  // vacíos: al final de la sección de la ley
  const frag = document.createDocumentFragment();
  const h = el("h3",{id:"normativa-vacios", class:"subsection-title"},["¿Qué retos tiene la implementación de la ley?"]);
  frag.appendChild(h);
  frag.appendChild(el("p",{class:"subsection-subtitle"},[C.vaciosNota]));
  const grid = el("div",{class:"gap-grid"});
  C.vacios.forEach((v,i)=> grid.appendChild(el("article",{class:"gap-card"},[
    el("span",{class:"finding-num"},[String(i+1)]),
    el("h4",null,[v.t]), el("p",null,[v.d]),
    el("p",{class:"gap-dato"},[v.dato]),
    el("a",{href:L.urlCompilada + "#" + v.art, target:"_blank", rel:"noopener", class:"small"},["Ver artículo " + v.art + " de la ley"])
  ])));
  frag.appendChild(grid);
  frag.appendChild(el("div",{class:"tag-row"},[confidenceTag("nota-autor")]));
  body.appendChild(frag);
  // sección siguiente: resumen comparativo y paralelo, antes del detalle de la PNSM
  const bodyP = document.getElementById("body-paralelo");
  const f2 = document.createDocumentFragment();
  f2.appendChild(el("p",null,["La Ley 2628 se dirige de forma específica a las personas con TEA y otros trastornos del neurodesarrollo: crea derechos, mecanismos y plazos. La Política Nacional de Salud Mental 2024-2033 tiene un alcance más amplio y aborda el autismo dentro de los trastornos del neurodesarrollo (p. 16). Las dos se complementan y pueden articularse."]));
  f2.appendChild(el("h3",{id:"paralelo-resumen", class:"subsection-title"},["Resumen comparativo"]));
  const cmp = [
    ["¿Qué es?", "Ley de la República (2026)", "Política del Ministerio de Salud (2024), con horizonte a 2033"],
    ["¿A quién se dirige?", "Personas con TEA, otros trastornos del neurodesarrollo (como TDAH y trastornos del aprendizaje) y condiciones similares", "Toda la población: salud mental, problemas y trastornos mentales y epilepsia"],
    ["¿Cómo aborda el autismo?", "Es su tema central", "Dentro de los trastornos del neurodesarrollo (p. 16), con un enfoque general de salud mental"],
    ["¿Qué ofrece?", "Política pública propia, ruta de atención, certificado, estadísticas, capacitación, inclusión escolar y laboral", "Cinco ejes: promoción, prevención, atención, rehabilitación e inclusión, y gestión"],
    ["¿Qué plazos fija?", "6 y 12 meses para reglamentar comité, política, ruta y capacitación", "Sin plazos específicos para el neurodesarrollo"],
    ["¿Qué puede fortalecerse?", "Orientaciones para adultos, metas de detección e indicadores de oportunidad", "Acciones específicas para el neurodesarrollo y articulación con la ley"]
  ];
  const tb = el("table",{class:"cmp-table"});
  tb.appendChild(el("thead",null,[ el("tr",null,[ el("th",{scope:"col"},[""]), el("th",{scope:"col"},["Ley 2628 de 2026"]), el("th",{scope:"col"},["Política Nacional de Salud Mental 2024-2033"]) ]) ]));
  const tbb = el("tbody"); cmp.forEach(c=> tbb.appendChild(el("tr",null,[ el("th",{scope:"row"},[c[0]]), el("td",null,[c[1]]), el("td",null,[c[2]]) ]))); tb.appendChild(tbb);
  f2.appendChild(el("div",{class:"table-wrap"},[tb]));
  f2.appendChild(el("p",{class:"muted small"},["Resumen del equipo a partir de los dos textos; para efectos legales consulte los documentos oficiales."]));
  f2.appendChild(el("h3",{id:"normativa-paralelo", class:"subsection-title"},["La ley y la política, frente a frente"]));
  f2.appendChild(el("p",{class:"subsection-subtitle"},["Así se corresponden sus contenidos, punto por punto."]));
  const P = C.paralelo, w = 820, rowH = 64, pad = 26, h2 = pad + P.length*rowH, lw = 300, rx = w - lw;
  const s = svgEl(w, h2, "par-svg", "Paralelo entre la Ley 2628 y la Política Nacional de Salud Mental");
  let g = '<text x="'+(lw/2)+'" y="16" text-anchor="middle" class="axis-title">Ley 2628 de 2026</text><text x="'+(rx+lw/2)+'" y="16" text-anchor="middle" class="axis-title">Política Nacional de Salud Mental 2024-2033</text>';
  s.innerHTML = g;
  P.forEach((r,i)=>{
    const y = pad + i*rowH;
    const gg = document.createElementNS(SVGNS,"g"); gg.setAttribute("class","par-row rel-" + r.rel); gg.setAttribute("tabindex","0");
    const L1 = wrapText(r.ley, 40), R1 = wrapText(r.pnsm, 40);
    gg.innerHTML = '<rect x="0" y="'+(y+4)+'" width="'+lw+'" height="'+(rowH-12)+'" rx="8" class="par-box"/>' + L1.map((l,j)=>'<text x="10" y="'+(y+22+j*14)+'" class="par-txt">'+esc(l)+'</text>').join("") +
      '<rect x="'+rx+'" y="'+(y+4)+'" width="'+lw+'" height="'+(rowH-12)+'" rx="8" class="par-box'+(r.rel==="solo-ley"?" par-empty":"")+'"/>' + R1.map((l,j)=>'<text x="'+(rx+10)+'" y="'+(y+22+j*14)+'" class="par-txt">'+esc(l)+'</text>').join("") +
      '<line x1="'+(lw+4)+'" x2="'+(rx-4)+'" y1="'+(y+rowH/2-2)+'" y2="'+(y+rowH/2-2)+'" class="par-link"/><text x="'+(w/2)+'" y="'+(y+rowH/2-8)+'" text-anchor="middle" class="par-tag">'+(r.rel==="coincide"?"se complementan":r.rel==="vacio"?"por articular":"solo en la ley")+'</text>';
    bindTip(gg, ()=> "<h5>"+esc(r.ley)+"</h5><p>"+esc(r.d)+"</p>");
    s.appendChild(gg);
  });
  f2.appendChild(el("div",{class:"diagram-wrap par-wrap"},[s]));
  f2.appendChild(legend([["rel-coincide-sw","Se complementan"],["rel-vacio-sw","Por articular"],["rel-solo-sw","Solo en la ley"]]));
  const rd = reading(); f2.appendChild(rd);
  setReading(rd, "La ley y la política coinciden en detectar a tiempo, definir rutas de atención, formar al personal, medir y promover la inclusión. Hay dos temas por articular: el diagnóstico (la ley se centra en niños, niñas y adolescentes y la política tiene un enfoque general) y la coordinación (cada una tiene sus propias instancias). Pasa el cursor por cada fila para ver el detalle.");
  const lst = el("ul",{class:"a11y-list"}); lst.hidden = true;
  P.forEach(r=> lst.appendChild(el("li",null,[ el("div",{class:"a11y-title"},[r.ley + " ↔ " + r.pnsm]), el("div",{class:"a11y-meta"},[r.d]) ])));
  const lt = el("button",{class:"btn a11y-list-toggle", type:"button", "aria-expanded":"false"},["Ver el paralelo como lista"]);
  lt.addEventListener("click", ()=>{ lst.hidden = !lst.hidden; lt.setAttribute("aria-expanded", lst.hidden?"false":"true"); lt.textContent = lst.hidden ? "Ver el paralelo como lista" : "Ocultar la lista"; });
  f2.appendChild(lt); f2.appendChild(lst);
  bodyP.insertBefore(f2, document.getElementById("normativa-pnsm"));
}


/* ================================================================= 07 POBREZA */
function renderPobreza(){
  const body = document.getElementById("body-pobreza");
  body.appendChild(el("p",null,["Siguiente cruce: la pobreza del territorio. En la sección de la oferta se vio que las sedes siguen a la demanda y que lo que se aparta de ella no depende de la riqueza; aquí la pregunta es si la pobreza pesa sobre la atención misma. En los estudios sobre detección, un mayor nivel socioeconómico se asocia con un diagnóstico más frecuente y más temprano, lo que sugiere que en los hogares de menos recursos el problema es el acceso al diagnóstico y no la ocurrencia del trastorno."]));
  sub(body, "pobreza-ipm", "¿Qué es el IPM?");
  body.appendChild(el("div",{class:"card ipm-card"},[ el("p",null,[C.ipmDef]) ]));
  mapWidget(body, { inds:["ipm"], def:"ipm" });
  body.appendChild(sourceLine("Fuente: DANE, IPM 2024 por departamento (valor digitado en el proyecto; pendiente de verificación contra la tabla oficial)."));
  sub(body, "pobreza-cruce", "Pobreza frente a atención, oferta y movilidad", "Elige el indicador del eje vertical.");
  body.appendChild(howTo("el eje horizontal es el IPM (más a la derecha, más pobreza). Como no hay un IPM nacional en los datos del proyecto, la línea vertical es la mediana de los departamentos. El color indica la región."));
  scatterWidget(body, { x:"ipm", ys:["tasa24","sedes100k","tasaAten","pctFuera"], colorBy:"region", labels:["99","94","97","27","44","11","08"],
    quad:{ hh:"Más pobreza y valor alto", lh:"Menos pobreza, valor alto", ll:"Menos pobreza, valor bajo", hl:"Más pobreza y valor bajo" },
    extra:(yk, reg)=>{
      if(reg !== "todas") return "";
      return { tasa24:"En los departamentos más pobres se atiende a menos personas por habitante, y es poco probable que sea casualidad (p = 0,016).",
        sedes100k:"La oferta de sedes no sigue a la pobreza: hay departamentos pobres del Caribe con muchas sedes y departamentos de la Amazonía-Orinoquía sin ninguna.",
        tasaAten:"Que un departamento sea pobre no cambia la tasa de atención: cuántas atenciones recibe cada persona atendida.",
        pctFuera:"Los cuatro departamentos con más atención fuera (Guainía, Vichada, Vaupés y Cundinamarca) incluyen tres de los más pobres, pero también uno de los menos pobres, vecino de Bogotá." }[yk];
    } });
  sub(body, "pobreza-modelo", "Oferta y pobreza a la vez", "Regresión cuasi-Poisson de las personas atendidas en 2024 (offset: población; n = 33). RR > 1: más atención; RR < 1: menos.");
  forestChart(body);
  const rd = reading(); body.appendChild(rd);
  setReading(rd, "Al considerar oferta y pobreza juntas, cada 10 puntos más de IPM se asocian con una prevalencia atendida 0,71 veces la de referencia (29 % menos; IC95 % 0,55 a 0,92), aun a igual oferta, y cada sede adicional por 100.000 habitantes con una prevalencia atendida 1,32 veces mayor. Los resultados casi no cambian al ajustar por Bogotá (modelo B) ni al excluir a Atlántico (RR 0,79 y 1,21). Contar con sedes parece necesario pero no suficiente: la pobreza se asocia con menos atención por vías que las sedes no capturan (aseguramiento, autorizaciones, distancia, conocimiento de las familias y del primer nivel).");
  body.appendChild(sourceLine(C.modelosNota));
}
function forestChart(body){
  const ms = C.modelos;
  const fw = 640, fH = 34, fpad = { l:250, r:110, t:24, b:10 }, fh = fpad.t + ms.length*fH + fpad.b, fiw = fw - fpad.l - fpad.r;
  const lmin = Math.log(0.4), lmax = Math.log(2), FX = v => fpad.l + fiw*(Math.log(v)-lmin)/(lmax-lmin);
  const fs = svgEl(fw, fh, "", "Razones de tasas del modelo cuasi-Poisson");
  let fg = "";
  [0.5,0.75,1,1.5,2].forEach(t=>{ fg += '<line x1="'+FX(t)+'" x2="'+FX(t)+'" y1="'+(fpad.t-6)+'" y2="'+(fh-fpad.b)+'" class="grid'+(t===1?' zero':'')+'"/><text x="'+FX(t)+'" y="'+(fpad.t-10)+'" class="axis-lab" text-anchor="middle">'+fmt(t,2)+'</text>'; });
  fg += '<text x="'+FX(1)+'" y="9" class="axis-title" text-anchor="middle">Razón de tasas (RR, escala logarítmica)</text>';
  fs.innerHTML = fg;
  ms.forEach((m,i)=>{
    const y = fpad.t + i*fH + fH/2;
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g");
    g.innerHTML = '<text x="'+(fpad.l-10)+'" y="'+(y+4)+'" class="axis-lab" text-anchor="end">'+esc(m.modelo+". "+m.var)+'</text><line x1="'+FX(m.lo)+'" x2="'+FX(m.hi)+'" y1="'+y+'" y2="'+y+'" class="ci-line"/><rect x="'+(FX(m.rr)-5)+'" y="'+(y-5)+'" width="10" height="10" class="pt-sq"/><text x="'+(fw-fpad.r+8)+'" y="'+(y+4)+'" class="bar-val">'+fmt(m.rr,2)+' ('+fmt(m.lo,2)+'–'+fmt(m.hi,2)+')</text>';
    bindTip(g, ()=> "<h5>"+esc(m.var)+"</h5><p>RR "+fmt(m.rr,2)+" · IC95 % "+fmt(m.lo,2)+" a "+fmt(m.hi,2)+" · p "+m.p+"</p>"+(m.hi<1||m.lo>1?"<p>El IC no incluye 1: asociación compatible con los datos.</p>":"<p>El IC incluye 1: sin evidencia de asociación.</p>"));
    fs.appendChild(g);
  });
  body.appendChild(el("div",{class:"chart-box"},[ legend([["pt-sw","Razón de tasas (RR)"],["ci-sw","IC95 %"]]), fs ]));
}


function dataTable(){
  const cols = [
    ["cod","Cód."],["nombre","Departamento"],["region","Región"],["pob","Población 2024"],["ipm","IPM %"],
    ["pers24","Personas 2024"],["tasa24","Prev. atendida 2024 (/100.000 hab.)"],["aten24","Atenciones 2024"],["tasaAten","Tasa de atención (/100 atendidos)"],
    ["sedes","Sedes neuroped."],["sedes100k","Sedes/100.000"],["pctFuera","% fuera"],["pctSinSede","% sin sede"],["pers25","Personas 2025"],["tasa25","Prev. atendida 2025"]
  ];
  const dec = { ipm:1, tasa24:1, tasaAten:0, sedes100k:2, pctFuera:1, pctSinSede:1, tasa25:1 };
  let sortKey = "tasa24", asc = false;
  const wrap = el("div",{class:"data-table-toggle-wrap"});
  const btn = el("button",{class:"data-table-toggle", type:"button", "aria-expanded":"false"},["Ver la tabla completa (33 territorios) ", el("span",{class:"chev", html:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'})]);
  const panel = el("div",{class:"data-table-panel", hidden:""});
  const dl = el("button",{class:"csv-download", type:"button"},["Descargar CSV"]);
  dl.addEventListener("click", ()=> downloadCSV("tea_colombia_departamentos_2024.csv", cols.map(c=>c[1]), DEP.map(d=> cols.map(c=> d[c[0]]))));
  panel.appendChild(el("div",{class:"data-table-actions"},[dl]));
  panel.appendChild(el("p",{class:"data-table-note"},["Haz clic en un encabezado para ordenar. Prevalencia atendida: personas atendidas con F84 por 100.000 habitantes (población DANE 2024). Tasa de atención: atenciones a personas con F84 por cada 100 personas atendidas con F84. % fuera: atenciones de residentes prestadas en IPS de otro departamento. % sin sede: personas atendidas que viven en municipios sin sede con neuropediatría."]));
  const tw = el("div",{class:"table-wrap"});
  panel.appendChild(tw);
  function draw(){
    const list = DEP.slice().sort((a,b)=>{
      const x = a[sortKey], y = b[sortKey];
      if(typeof x === "string") return asc ? x.localeCompare(y,"es") : y.localeCompare(x,"es");
      return asc ? (x??-1)-(y??-1) : (y??-1)-(x??-1);
    });
    const t = el("table",{class:"data-table"});
    const tr = el("tr");
    cols.forEach(c=>{
      const th = el("th",{scope:"col", "aria-sort": sortKey===c[0] ? (asc?"ascending":"descending") : "none"},[]);
      const b = el("button",{type:"button", class:"th-sort"},[c[1] + (sortKey===c[0] ? (asc?" ▲":" ▼") : "")]);
      b.addEventListener("click", ()=>{ if(sortKey===c[0]) asc = !asc; else { sortKey = c[0]; asc = typeof DEP[0][c[0]] === "string"; } draw(); });
      th.appendChild(b); tr.appendChild(th);
    });
    t.appendChild(el("thead",null,[tr]));
    const tb = el("tbody");
    list.forEach(d=>{
      const r = el("tr",{class: STATE.sel === d.cod ? "sel" : null});
      cols.forEach(c=> r.appendChild(el("td",{class: typeof d[c[0]] === "number" ? "num" : null},[ typeof d[c[0]] === "number" ? fmt(d[c[0]], dec[c[0]]||0) : (d[c[0]] ?? "n.d.") ])));
      tb.appendChild(r);
    });
    t.appendChild(tb);
    tw.innerHTML = ""; tw.appendChild(t);
  }
  btn.addEventListener("click", ()=>{
    const open = panel.hidden; panel.hidden = !open; btn.classList.toggle("open", open); btn.setAttribute("aria-expanded", open?"true":"false"); if(open) draw();
  });
  onSelect(()=>{ if(!panel.hidden) draw(); });
  wrap.appendChild(btn); wrap.appendChild(panel);
  return wrap;
}

function flowChart(cod){
  const d = BY[cod], row = D.flujos[cod], tot = d.aten24;
  const items = Object.keys(row).map(k=>({ k:k, n:row[k] })).sort((a,b)=> b.n-a.n);
  const local = items.filter(i=>i.k===cod), na = items.filter(i=>i.k==="-1"), others = items.filter(i=> i.k!==cod && i.k!=="-1");
  const top = others.slice(0,7), rest = others.slice(7);
  const rows = local.map(i=>({ lab: "Propio departamento", n:i.n, cls:"fl-local" }))
    .concat(top.map(i=>({ lab: BY[i.k].nombre, n:i.n, cls:"fl-out", cod:i.k })))
    .concat(rest.length ? [{ lab: "Otros " + rest.length + " departamentos", n: rest.reduce((s,i)=>s+i.n,0), cls:"fl-out" }] : [])
    .concat(na.map(i=>({ lab:"Sin dato del prestador", n:i.n, cls:"fl-na" })));
  const w = 640, rowH = 26, pad = { l:170, r:110, t:6, b:6 }, h = pad.t + rows.length*rowH + pad.b, iw = w-pad.l-pad.r;
  const s = svgEl(w, h, "", "Destino de las atenciones de " + d.nombre);
  rows.forEach((r,i)=>{
    const y = pad.t + i*rowH, bw = Math.max(1, iw * r.n/tot);
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g");
    g.innerHTML = '<text x="'+(pad.l-8)+'" y="'+(y+17)+'" class="axis-lab" text-anchor="end">'+esc(r.lab)+'</text>' +
      '<rect x="'+pad.l+'" y="'+(y+4)+'" width="'+iw+'" height="'+(rowH-8)+'" rx="4" class="bar-track"/>' +
      '<rect x="'+pad.l+'" y="'+(y+4)+'" width="'+bw+'" height="'+(rowH-8)+'" rx="4" class="'+r.cls+'"/>' +
      '<text x="'+(pad.l+iw+6)+'" y="'+(y+17)+'" class="bar-val">'+fmt(r.n)+' · '+fmt(100*r.n/tot,1)+' %</text>';
    bindTip(g, ()=> "<h5>"+esc(r.lab)+"</h5><p>"+fmt(r.n)+" atenciones de residentes de "+esc(d.nombre)+" ("+fmt(100*r.n/tot,1)+" %)</p>");
    s.appendChild(g);
  });
  return s;
}

function balanceChart(){
  const colSum = {};
  Object.keys(D.flujos).forEach(r=> Object.keys(D.flujos[r]).forEach(c=>{ colSum[c] = (colSum[c]||0) + D.flujos[r][c]; }));
  const list = DEP.map(d=>({ d:d, net:(colSum[d.cod]||0) - d.aten24, prest: colSum[d.cod]||0 })).sort((a,b)=> b.net-a.net);
  const show = list.slice(0,6).concat(list.slice(-6));
  const w = 640, rowH = 24, pad = { l:150, r:20, t:8, b:8 }, h = pad.t + show.length*rowH + pad.b + 10;
  const mx = Math.max(...show.map(x=>Math.abs(x.net)));
  const iw = w-pad.l-pad.r, cx = pad.l + iw/2;
  const s = svgEl(w, h, "", "Saldo neto de atenciones por departamento");
  s.innerHTML = '<line x1="'+cx+'" x2="'+cx+'" y1="'+pad.t+'" y2="'+(h-pad.b)+'" class="axis"/>';
  show.forEach((x,i)=>{
    const y = pad.t + i*rowH + (i>=6?10:0), bw = (iw/2-50) * Math.abs(x.net)/mx;
    const pos = x.net >= 0;
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g");
    g.innerHTML = '<text x="'+(pad.l-8)+'" y="'+(y+16)+'" class="axis-lab" text-anchor="end">'+esc(x.d.nombre)+'</text>' +
      '<rect x="'+(pos?cx:cx-bw)+'" y="'+(y+4)+'" width="'+Math.max(bw,1)+'" height="'+(rowH-8)+'" rx="3" class="'+(pos?"net-pos":"net-neg")+'"/>' +
      '<text x="'+(pos?cx+bw+5:cx-bw-5)+'" y="'+(y+16)+'" class="bar-val" text-anchor="'+(pos?"start":"end")+'">'+(pos?"+":"")+fmt(x.net)+'</text>';
    bindTip(g, ()=> "<h5>"+esc(x.d.nombre)+"</h5><p>Prestadas por sus IPS: "+fmt(x.prest)+"<br>Recibidas por sus residentes: "+fmt(x.d.aten24)+"<br>Saldo: <b>"+(pos?"+":"")+fmt(x.net)+"</b></p>");
    s.appendChild(g);
  });
  return el("div",{class:"chart-box"},[ legend([["net-pos","Receptor neto (6 mayores)"],["net-neg","Emisor neto (6 mayores)"]]), s ]);
}

function lorenz(key){
  const arr = DEP.map(d=>({ h:d[key], w:d.pob })).sort((a,b)=> (a.h/a.w)-(b.h/b.w));
  const H = arr.reduce((s,x)=>s+x.h,0), W = arr.reduce((s,x)=>s+x.w,0);
  const pts = [[0,0]]; let ch = 0, cw = 0;
  arr.forEach(x=>{ ch += x.h; cw += x.w; pts.push([cw/W, ch/H]); });
  let area = 0; for(let i=1;i<pts.length;i++) area += (pts[i][0]-pts[i-1][0])*(pts[i][1]+pts[i-1][1]);
  return { pts:pts, gini: 1-area };
}

/* ================================================================= 09 DESIGUALDAD */
const GLOS_IDX = ["razon","lorenz","gini","theil","mld","ci","sii","disim","rho","rr","ic"];
function renderDesigualdad(){
  const body = document.getElementById("body-desigualdad");
  body.appendChild(el("p",null,["Las secciones anteriores compararon departamentos de a dos indicadores. Aquí se responde, en conjunto, qué tan parejo o disparejo está repartido el acceso entre departamentos y si ha cambiado con el tiempo. Se usan medidas estándar de equidad en salud; abajo se explica cada una en una frase."]));
  sub(body, "desigualdad-glosario", "Glosario de los índices de desigualdad", "¿Qué mide cada índice y cómo se interpreta su valor?");
  const gg = el("div",{class:"concept-grid"});
  GLOS_IDX.forEach(id=>{ const g = C.glosario.find(x=>x.id===id); if(!g) return;
    const more = el("button",{class:"finding-link", type:"button"},["Definición completa →"]);
    more.addEventListener("click", ()=>{ openSection("glosario"); scrollSoon("glos-"+id); const d = document.getElementById("glos-"+id); if(d){ d.classList.add("flash"); setTimeout(()=> d.classList.remove("flash"), 2200); } });
    gg.appendChild(el("div",{class:"concept-card", id:"idx-"+id},[ el("h4",null,[g.t]), el("p",null,[g.p || g.d]), more ])); });
  body.appendChild(gg);

  sub(body, "desigualdad-lorenz", "Curvas de Lorenz", "Población acumulada (departamentos ordenados de menor a mayor tasa) frente al porcentaje acumulado de cada indicador. Activa o desactiva cada curva.");
  const series = [ { key:"pers24", lab:"Personas atendidas", cls:"lz-a", on:true }, { key:"aten24", lab:"Atenciones", cls:"lz-b", on:true }, { key:"sedes", lab:"Sedes de neuropediatría", cls:"lz-c", on:true } ];
  series.forEach(sr=> sr.L = lorenz(sr.key));
  const toggles = el("div",{class:"filter-row"});
  series.forEach(sr=>{
    const b = el("button",{class:"filter-chip active "+sr.cls+"-chip", type:"button", "aria-pressed":"true"},[sr.lab + " · Gini " + fmt(sr.L.gini,3)]);
    b.addEventListener("click", ()=>{ sr.on = !sr.on; b.classList.toggle("active", sr.on); b.setAttribute("aria-pressed", sr.on?"true":"false"); drawL(); });
    toggles.appendChild(b);
  });
  body.appendChild(toggles);
  const lwrap = el("div",{class:"lorenz-layout"});
  const lbox = el("div",{class:"chart-box lorenz-box"}); lwrap.appendChild(lbox);
  const lrd = reading(); lwrap.appendChild(lrd);
  body.appendChild(lwrap);
  function at(L, x){ const p = L.pts; for(let i=1;i<p.length;i++){ if(p[i][0] >= x){ const t = (x-p[i-1][0])/(p[i][0]-p[i-1][0]); return p[i-1][1] + t*(p[i][1]-p[i-1][1]); } } return 1; }
  function drawL(){
    const S = 380, pad = 44, iw = S - pad - 14, X = v => pad + iw*v, Y = v => 14 + iw - iw*v;
    const s = svgEl(S, S, "lorenz-svg", "Curvas de Lorenz");
    let g = '';
    [0,.25,.5,.75,1].forEach(t=>{ g += '<line x1="'+X(t)+'" x2="'+X(t)+'" y1="14" y2="'+Y(0)+'" class="grid"/><line x1="'+X(0)+'" x2="'+X(1)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" class="grid"/><text x="'+X(t)+'" y="'+(Y(0)+16)+'" class="axis-lab" text-anchor="middle">'+(t*100)+'%</text><text x="'+(pad-6)+'" y="'+(Y(t)+4)+'" class="axis-lab" text-anchor="end">'+(t*100)+'%</text>'; });
    g += '<line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(1)+'" y2="'+Y(1)+'" class="eq-line"/><text x="'+X(.62)+'" y="'+(Y(.66)-4)+'" class="axis-lab" transform="rotate(-45 '+X(.62)+' '+(Y(.66)-4)+')">igualdad perfecta</text>';
    g += '<text x="'+X(.5)+'" y="'+(S-4)+'" class="axis-title" text-anchor="middle">Población acumulada</text>';
    s.innerHTML = g;
    const on = series.filter(sr=>sr.on);
    on.forEach(sr=>{
      const p = document.createElementNS(SVGNS,"path");
      p.setAttribute("d", sr.L.pts.map((q,i)=> (i?"L":"M")+X(q[0]).toFixed(1)+","+Y(q[1]).toFixed(1)).join(""));
      p.setAttribute("class","lz " + sr.cls); p.setAttribute("tabindex","0");
      bindTip(p, ()=> "<h5>"+esc(sr.lab)+"</h5><p>Gini "+fmt(sr.L.gini,3)+". El 50 % de la población con menor tasa concentra el "+fmt(100*at(sr.L,.5),1)+" % del indicador.</p>");
      s.appendChild(p);
    });
    lbox.innerHTML = ""; lbox.appendChild(s);
    if(!on.length){ setReading(lrd, "Activa al menos una curva para ver la lectura."); return; }
    const srt = on.slice().sort((a,b)=> b.L.gini - a.L.gini);
    let t = "Imagina a la mitad de los colombianos que vive en los departamentos con menos atención. Si todo estuviera repartido de forma pareja, esa mitad recibiría la mitad de todo. ";
    t += "Pero esa mitad recibe solo " + joinNames(srt.map(sr=> "el <b>" + fmt(100*at(sr.L,.5),0) + " %</b> de las " + esc(sr.lab.toLowerCase()))) + ".";
    if(srt.length > 1) t += " Por eso la curva de " + esc(srt[0].lab.toLowerCase()) + " es la que más se aleja de la diagonal: es lo más desigualmente repartido.";
    setReading(lrd, t);
  }
  drawL();
  body.appendChild(sourceLine("Curvas calculadas en el navegador a partir de la tabla por departamento; reproducen los Gini del libro de cálculo del proyecto (0,240; 0,486; 0,381)."));

  sub(body, "desigualdad-indices", "Índices de desigualdad con intervalos de confianza", "Elige la medida. Los bigotes son IC95 % por bootstrap de departamentos (4.000 réplicas).");
  let mm = "gini";
  body.appendChild(chips([{id:"gini",label:"Gini"},{id:"theil",label:"Theil T"},{id:"ci",label:"Índice de concentración (IPM)"}], mm, id=>{ mm = id; drawIdx(); }, "Medida"));
  const ibox = el("div",{class:"chart-box"}); body.appendChild(ibox);
  const ird = reading(); body.appendChild(ird);
  const NAMES = { gini:"Gini", theil:"Theil T", ci:"índice de concentración" };
  function drawIdx(){
    const rows = C.indices, lo = mm === "ci" ? -0.4 : 0, hi = mm === "ci" ? 0.3 : 0.7;
    const w = 640, rowH = 40, pad = { l:190, r:30, t:26, b:10 }, h = pad.t + rows.length*rowH + pad.b, iw = w-pad.l-pad.r;
    const X = v => pad.l + iw*(v-lo)/(hi-lo);
    const s = svgEl(w, h, "", "Índices de desigualdad");
    let g = "";
    for(let t=lo; t<=hi+1e-9; t+=0.1){ g += '<line x1="'+X(t)+'" x2="'+X(t)+'" y1="'+(pad.t-6)+'" y2="'+(h-pad.b)+'" class="grid'+(Math.abs(t)<1e-9?' zero':'')+'"/><text x="'+X(t)+'" y="'+(pad.t-10)+'" class="axis-lab" text-anchor="middle">'+fmt(t,1)+'</text>'; }
    g += '<text x="'+(pad.l+iw/2)+'" y="9" class="axis-title" text-anchor="middle">Valor del índice (punto) e IC95 % (bigotes)</text>';
    if(mm === "ci") g += '<text x="'+(X(lo)+4)+'" y="'+(h-2)+'" class="quad-lab">← en los más pobres</text><text x="'+(X(hi)-4)+'" y="'+(h-2)+'" class="quad-lab" text-anchor="end">en los menos pobres →</text>';
    s.innerHTML = g;
    rows.forEach((r,i)=>{
      const v = r[mm], ic = r[mm+"IC"], y = pad.t + i*rowH + rowH/2;
      const gg = document.createElementNS(SVGNS,"g"); gg.setAttribute("tabindex","0"); gg.setAttribute("class","bar-g");
      gg.innerHTML = '<text x="'+(pad.l-10)+'" y="'+(y+4)+'" class="axis-lab" text-anchor="end">'+esc(r.indicador)+'</text><line x1="'+X(ic[0])+'" x2="'+X(ic[1])+'" y1="'+y+'" y2="'+y+'" class="ci-line"/><line x1="'+X(ic[0])+'" x2="'+X(ic[0])+'" y1="'+(y-6)+'" y2="'+(y+6)+'" class="ci-line"/><line x1="'+X(ic[1])+'" x2="'+X(ic[1])+'" y1="'+(y-6)+'" y2="'+(y+6)+'" class="ci-line"/><circle cx="'+X(v)+'" cy="'+y+'" r="6" class="pt'+(i===3?' pt-alt':'')+'"/>';
      bindTip(gg, ()=> "<h5>"+esc(r.indicador)+"</h5><p>Gini "+fmt(r.gini,3)+" ("+fmt(r.giniIC[0],3)+" a "+fmt(r.giniIC[1],3)+")<br>Theil "+fmt(r.theil,3)+" ("+fmt(r.theilIC[0],3)+" a "+fmt(r.theilIC[1],3)+")<br>MLD "+(r.mld===null?"n.d.":fmt(r.mld,3))+"<br>Índice de concentración "+fmt(r.ci,3)+" ("+fmt(r.ciIC[0],3)+" a "+fmt(r.ciIC[1],3)+")</p>");
      s.appendChild(gg);
    });
    ibox.innerHTML = ""; ibox.appendChild(s);
    const r24 = rows.slice(0,3);
    let t;
    if(mm === "ci"){
      t = "Esta medida responde: ¿lo que se reparte va más a los departamentos pobres o a los menos pobres? 0 significa que no hay inclinación. Las sedes de neuropediatría se inclinan algo hacia los departamentos más pobres (−0,19) y es el único caso en que el resultado no es atribuible al azar. Las personas atendidas y las atenciones se inclinan un poco hacia los menos pobres, pero tan poco que podría ser casualidad.";
    } else {
      const srt = r24.slice().sort((a,b)=> b[mm]-a[mm]).map(r=> Object.assign({}, r, { indicador: r.indicador.replace(" 2024","") }));
      t = "Esta medida va de 0 (todos los departamentos con la misma tasa) a " + (mm === "gini" ? "1 (todo concentrado en uno solo)" : "valores mayores cuanto más concentrado está") + ". Lo más desigual son las " + esc(srt[0].indicador.toLowerCase()) + " (" + fmt(srt[0][mm],2) + "), luego las " + esc(srt[1].indicador.toLowerCase()) + " (" + fmt(srt[1][mm],2) + ") y lo menos desigual, las " + esc(srt[2].indicador.toLowerCase()) + " (" + fmt(srt[2][mm],2) + "). Los bigotes son el margen de error: son largos porque solo hay 33 departamentos y algunos muy distintos al resto, como Atlántico.";
    }
    setReading(ird, t);
  }
  drawIdx();
  body.appendChild(sourceLine(C.indicesNota));
  const om = el("dl",{class:"kv kv-wide"});
  C.otrasMedidas.forEach(o=>{ om.appendChild(el("dt",null,[o.k])); om.appendChild(el("dd",null,[o.v])); });
  body.appendChild(el("div",{class:"card"},[ el("h4",null,["Otras medidas de distribución (personas atendidas 2024)"]), om ]));

  sub(body, "desigualdad-theil", "¿La desigualdad está entre regiones o dentro de ellas?", "Descomposición del Theil T de las personas atendidas en 2024.");
  const T = C.theilRegional;
  const tb = el("div",{class:"chart-box"});
  tb.appendChild(el("div",{class:"split-bar", role:"img", "aria-label":"Entre regiones 37,4 %, dentro de regiones 62,6 %"},[
    el("span",{class:"split-a", style:"width:"+T.pctEntre+"%"},["Entre regiones " + fmt(T.pctEntre,1) + " %"]), el("span",{class:"split-b", style:"width:"+(100-T.pctEntre)+"%"},["Dentro de las regiones " + fmt(100-T.pctEntre,1) + " %"]) ]));
  const rw = 640, rr = T.regiones, rH = 30, rpad = { l:160, r:150, t:10 }, rh = rpad.t + rr.length*rH + 6, riw = rw - rpad.l - rpad.r;
  const rs = svgEl(rw, rh, "", "Tasa y sedes por región");
  rr.forEach((x,i)=>{
    const y = rpad.t + i*rH, bw = riw * x.tasa/150;
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g");
    g.innerHTML = '<text x="'+(rpad.l-8)+'" y="'+(y+19)+'" class="axis-lab" text-anchor="end">'+esc(x.region)+'</text><rect x="'+rpad.l+'" y="'+(y+5)+'" width="'+bw+'" height="'+(rH-10)+'" rx="4" class="rg-bar '+REGION_CLASS[x.region]+'"/><text x="'+(rpad.l+bw+6)+'" y="'+(y+19)+'" class="bar-val">'+fmt(x.tasa,1)+' /100.000 · '+fmt(x.sedes100k,2)+' sedes</text>';
    bindTip(g, ()=> "<h5>"+esc(x.region)+"</h5><p>Población "+fmt(x.pob)+"<br>Personas atendidas "+fmt(x.personas)+" ("+fmt(x.tasa,1)+" por 100.000)<br>Sedes "+fmt(x.sedes)+" ("+fmt(x.sedes100k,2)+" por 100.000)</p>");
    rs.appendChild(g);
  });
  tb.appendChild(rs); body.appendChild(tb);
  const trd = reading(); body.appendChild(trd);
  setReading(trd, "El Caribe es la región que más atiende (140 por 100.000) y la Amazonía-Orinoquía (59) y la Pacífica (64) las que menos. Pero saber en qué región está un departamento explica poco más de un tercio (37 %) de las diferencias; el resto (63 %) son diferencias entre vecinos de la misma región, como Atlántico (240) frente a Cesar (73), ambos en el Caribe. Mirar solo regiones esconde la mayor parte del problema.");

  sub(body, "desigualdad-tiempo", "¿Ha cambiado la desigualdad entre 2019 y 2025?");
  const idxBox = el("div",{class:"small-multiples"});
  [["gini","Gini",0.35],["theil","Theil T",0.2],["ci","Índice de concentración (IPM)",0.12]].forEach(m=>{
    const w = 300, h = 170, pad = { l:40, r:12, t:12, b:26 }, iw = w-pad.l-pad.r, ih = h-pad.t-pad.b, ser = C.serieNacional;
    const X = i => pad.l + iw*i/6, Y = v => pad.t + ih - ih*v/m[2];
    const s = svgEl(w, h, "", m[1] + " 2019-2025");
    let g = '<rect x="'+(X(5.5))+'" y="'+pad.t+'" width="'+(X(6)-X(5.5)+6)+'" height="'+ih+'" class="break-band"/>';
    [0, m[2]/2, m[2]].forEach(t=>{ g += '<line x1="'+pad.l+'" x2="'+(w-pad.r)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" class="grid"/><text x="'+(pad.l-6)+'" y="'+(Y(t)+4)+'" class="axis-lab" text-anchor="end">'+fmt(t,2)+'</text>'; });
    [0,2,4,6].forEach(i=>{ g += '<text x="'+X(i)+'" y="'+(h-8)+'" class="axis-lab" text-anchor="middle">'+YEARS[i]+'</text>'; });
    g += '<path d="'+ser.map((v,i)=>(i?"L":"M")+X(i)+","+Y(v[m[0]])).join("")+'" class="nat-line thin"/>';
    s.innerHTML = g;
    ser.forEach((v,i)=>{
      const c = document.createElementNS(SVGNS,"circle"); c.setAttribute("cx",X(i)); c.setAttribute("cy",Y(v[m[0]])); c.setAttribute("r","4.5"); c.setAttribute("class","pt" + (i===6?" pt-alt":"")); c.setAttribute("tabindex","0");
      bindTip(c, ()=> "<h5>"+m[1]+" · "+v.anio+"</h5><p><b>"+fmt(v[m[0]],3)+"</b></p>"+(i===6?"<p class='muted'>Leer con cautela: cambio de reporte.</p>":""));
      s.appendChild(c);
    });
    idxBox.appendChild(el("div",{class:"chart-box"},[ el("h4",{class:"chart-title"},[m[1]]), s ]));
  });
  body.appendChild(idxBox);
  const erd = reading(); body.appendChild(erd);
  setReading(erd, "Entre 2019 y 2024 la desigualdad entre departamentos (Gini y Theil) subió y bajó sin una tendencia clara y fue la más baja en 2024. Lo que sí cambió es la ventaja de los departamentos menos pobres: en 2019-2020 concentraban más la atención y desde 2022 esa ventaja es casi nula, porque la atención creció en todo el país. El punto naranja de 2025 no se compara por el cambio en la forma de reportar.");

  sub(body, "desigualdad-cruces", "Resumen de los cruces", "Correlaciones de Spearman entre departamentos (n = 33) de los cruces de la segunda parte. Haz clic en una barra para ir a su análisis.");
  const cr = C.correlaciones.map((c,i)=> Object.assign({ sec: ["ofertaatencion","intensidad","pobreza","pobreza","pobreza","intensidad","ofertaatencion"][i] }, c));
  const cw = 640, cH = 28, cpad = { l:330, r:60, t:8 }, ch = cpad.t + cr.length*cH + 6, ciw = cw - cpad.l - cpad.r, cx0 = cpad.l + ciw/2;
  const cs = svgEl(cw, ch, "", "Correlaciones de Spearman");
  cs.innerHTML = '<line x1="'+cx0+'" x2="'+cx0+'" y1="'+cpad.t+'" y2="'+ch+'" class="axis"/>';
  cr.forEach((c,i)=>{
    const y = cpad.t + i*cH, bw = (ciw/2) * Math.abs(c.rho), pos = c.rho >= 0;
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g rank-row"); g.setAttribute("role","button");
    g.innerHTML = '<rect x="0" y="'+y+'" width="'+cw+'" height="'+cH+'" class="row-hit"/><text x="'+(cpad.l-10)+'" y="'+(y+18)+'" class="axis-lab" text-anchor="end">'+esc(c.par)+'</text><rect x="'+(pos?cx0:cx0-bw)+'" y="'+(y+6)+'" width="'+Math.max(bw,1)+'" height="'+(cH-12)+'" rx="3" class="'+(pos?"net-pos":"net-neg")+'"/><text x="'+(pos?cx0+bw+5:cx0-bw-5)+'" y="'+(y+18)+'" class="bar-val" text-anchor="'+(pos?"start":"end")+'">'+fmt(c.rho,2)+'</text>';
    bindTip(g, ()=> "<h5>"+esc(c.par)+"</h5><p>ρ de Spearman "+fmt(c.rho,3)+" · p "+c.p+" · asociación "+strength(c.rho)+"</p><p class='muted'>Clic para ir al análisis</p>");
    const go = ()=>{ openSection(c.sec); scrollSoon("sec-"+c.sec); };
    g.addEventListener("click", go); g.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); go(); } });
    cs.appendChild(g);
  });
  body.appendChild(el("div",{class:"chart-box"},[ legend([["net-pos","Asociación positiva"],["net-neg","Asociación negativa"]]), cs ]));
  const crd = reading(); body.appendChild(crd);
  setReading(crd, "Barras hacia la derecha: cuando un indicador sube, el otro también; hacia la izquierda: cuando uno sube, el otro baja; cuanto más larga, más clara la relación. Lo que más pesa es la oferta: donde hay más sedes se atiende a más personas, cada una recibe más atenciones y menos gente sale del departamento. La pobreza va con menos atención, pero no con menos sedes. Describen departamentos, no personas, y no prueban causas.");
  body.appendChild(el("div",{class:"tag-row"},[confidenceTag("preliminar")]));
}

/* ================================================================= 10 HUILA */
function renderHuila(){
  const body = document.getElementById("body-huila");
  const h = BY["41"];
  C.huila.texto.forEach(p=> body.appendChild(el("p",null,[p])));
  const comp = [
    ["Prevalencia atendida (por 100.000 hab.)", h.tasa24, NAC.tasa24, 1, "tasa24"], ["Sedes de neuropediatría por 100.000", h.sedes100k, NAC.sedes100k, 2, "sedes100k"],
    ["Tasa de atención (por 100 atendidos)", h.tasaAten, NAC.tasaAten, 0, "tasaAten"], ["% atenciones fuera del dpto.", h.pctFuera, NAC.pctFuera, 1, "pctFuera"],
    ["% personas en municipios sin sede", h.pctSinSede, 19.9, 1, "pctSinSede"]
  ];
  const w = 640, rowH = 48, pad = { l:230, r:70, t:8 }, hh = pad.t + comp.length*rowH, iw = w-pad.l-pad.r;
  const s = svgEl(w, hh, "", "Huila frente al total nacional");
  comp.forEach((c,i)=>{
    const mx = Math.max(c[1], c[2]) * 1.15, y = pad.t + i*rowH;
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g");
    g.innerHTML = '<text x="'+(pad.l-10)+'" y="'+(y+22)+'" class="axis-lab" text-anchor="end">'+esc(c[0])+'</text><rect x="'+pad.l+'" y="'+(y+4)+'" width="'+(iw*c[1]/mx)+'" height="15" rx="3" class="bar-fill"/><text x="'+(pad.l+iw*c[1]/mx+5)+'" y="'+(y+16)+'" class="bar-val">Huila '+fmt(c[1],c[3])+'</text><rect x="'+pad.l+'" y="'+(y+22)+'" width="'+(iw*c[2]/mx)+'" height="15" rx="3" class="bar-nat"/><text x="'+(pad.l+iw*c[2]/mx+5)+'" y="'+(y+34)+'" class="bar-val muted">Nacional '+fmt(c[2],c[3])+'</text>';
    bindTip(g, ()=> "<h5>"+esc(c[0])+"</h5><p>Huila: <b>"+fmt(c[1],c[3])+"</b> (puesto "+rankOf("41",c[4])+" de 33)<br>Colombia: "+fmt(c[2],c[3])+"</p>");
    s.appendChild(g);
  });
  body.appendChild(el("div",{class:"chart-box"},[ legend([["bar-fill","Huila"],["bar-nat","Colombia"]]), s ]));
  const rd = reading(); body.appendChild(rd);
  setReading(rd, "El Huila está por debajo del país en prevalencia atendida (79,0 frente a 97,8 personas por 100.000 habitantes; puesto " + rankOf("41","tasa24") + " de 33) y en sedes por habitante (0,75 frente a 1,12), pero cerca en tasa de atención (" + fmt(h.tasaAten,0) + " frente a " + fmt(NAC.tasaAten,0) + " atenciones por 100 personas atendidas). Su movilidad es algo mayor que la nacional (15,8 % de atenciones fuera frente a 11,4 %) y su porcentaje de personas en municipios sin sede (18,8 %) es similar al del país (19,9 %).");
  body.appendChild(el("h4",{class:"chart-title"},["Destino de las atenciones de los residentes del Huila (2024)"]));
  body.appendChild(el("div",{class:"chart-box"},[flowChart("41")]));
  const rd2 = reading(); body.appendChild(rd2);
  setReading(rd2, "El 84,2 % de las atenciones de los residentes del Huila se prestó en el propio departamento. De las que salieron, casi la mitad (832 de 1.695) fue a Bogotá D.C. y 375 a Atlántico. El número de personas atendidas pasó de 333 en 2019 a 944 en 2024.");
  const btn = el("button",{class:"btn", type:"button"},["Ver el Huila en el mapa"]);
  btn.addEventListener("click", ()=>{ selectDept("41"); openSection("territorio"); scrollSoon("territorio-mapa"); });
  body.appendChild(el("p",null,[btn]));
  body.appendChild(sourceLine("Fuente: SISPRO-RIPS 2024; REPS 13/11/2026; DANE."));
}

/* ================================================================= 14 GLOSARIO y 15 REFERENCIAS */
function renderGlosario(){
  const body = document.getElementById("body-glosario");
  body.appendChild(el("p",null,["Definiciones breves de los términos que aparecen en el documento. En el texto, los términos subrayados con puntos muestran esta definición al pasar el cursor o el foco del teclado."]));
  const dl = el("dl",{class:"glossary"});
  C.glosario.slice().sort((a,b)=> a.t.localeCompare(b.t,"es")).forEach(g=>{
    dl.appendChild(el("dt",{id:"glos-"+g.id},[g.t]));
    dl.appendChild(el("dd",null,[ g.p ? el("strong",{class:"g-plain no-term"},["En pocas palabras: " + g.p + " "]) : null, g.d, el("span",{class:"g-ref"},[ "Referencia: ", g.url ? el("a",{href:g.url, target:"_blank", rel:"noopener"},[g.fuente]) : g.fuente ]) ]));
  });
  body.appendChild(dl);
}
function renderReferencias(){
  const body = document.getElementById("body-referencias");
  body.appendChild(el("p",null,["Literatura y normas citadas (formato Vancouver). Cada enlace lleva al DOI o al sitio oficial; se verificó que respondieran el 20/11/2026."]));
  const ol = el("ol",{class:"ref-list"});
  C.referencias.forEach(r=> ol.appendChild(el("li",null,[ r.c + " ", el("a",{href:r.url, target:"_blank", rel:"noopener"},[r.url.replace(/^https?:\/\//,"")]) ])));
  body.appendChild(ol);
}

/* ---------------------------------------------------------------- tooltips de términos y enlaces a normas */
const GLOS = {}; C.glosario.forEach(g=> GLOS[g.id] = g);
const TERM_RE = C.glosario.map(g=> ({ id:g.id, re:new RegExp(g.re, "i") }));
const NORM_RE = C.normas.map(n=> ({ url:n.url, re:new RegExp(n.re) }));
function decorate(root){
  const nodes = root.querySelectorAll("p, li, dd, blockquote, .finding-card p, .reading p");
  nodes.forEach(n=>{
    if(n.closest(".glossary, .ref-list, .chart-tip, svg, .stat-card, .legend, .search-panel, .sources-panel") || n.dataset.dec) return;
    n.dataset.dec = "1";
    const scope = n.closest(".reading") || n.closest(".acc-body") || root;
    const used = scope.__terms || (scope.__terms = new Set());
    const walker = document.createTreeWalker(n, NodeFilter.SHOW_TEXT, { acceptNode: t=> t.parentNode.closest("a, button, .term, code, strong.no-term") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const texts = []; while(walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(tn=>{
      let node = tn;
      let guard = 0;
      while(node && guard++ < 12){
        const txt = node.nodeValue; let best = null;
        NORM_RE.forEach(nr=>{ const m = nr.re.exec(txt); if(m && (!best || m.index < best.m.index)) best = { m:m, kind:"norm", url:nr.url }; });
        TERM_RE.forEach(tr=>{ if(used.has(tr.id)) return; const m = tr.re.exec(txt); if(m && (!best || m.index < best.m.index)) best = { m:m, kind:"term", id:tr.id }; });
        if(!best) break;
        const after = node.splitText(best.m.index); const rest = after.splitText(best.m[0].length);
        let w;
        if(best.kind === "norm") w = el("a",{ href:best.url, target:"_blank", rel:"noopener", class:"norm-link", title:"Abrir el texto de la norma" },[after.nodeValue]);
        else { used.add(best.id); w = el("span",{ class:"term", tabindex:"0", "data-term":best.id, role:"button", "aria-label": after.nodeValue + ": ver definición" },[after.nodeValue]); }
        after.parentNode.replaceChild(w, after);
        node = rest;
      }
    });
  });
}
function initTerms(){
  const html = id=>{ const g = GLOS[id]; return "<h5>"+esc(g.t)+"</h5><p>"+esc(g.p || g.d)+"</p>"+(g.url?"<p class='muted'>Referencia: "+esc(g.fuente)+"</p>":"")+"<p class='muted'>Clic: ver en el glosario</p>"; };
  document.addEventListener("mouseover", e=>{ const t = e.target.closest && e.target.closest(".term"); if(t) showTip(html(t.dataset.term), e); });
  document.addEventListener("mousemove", e=>{ const t = e.target.closest && e.target.closest(".term"); if(t) showTip(html(t.dataset.term), e); });
  document.addEventListener("mouseout", e=>{ if(e.target.closest && e.target.closest(".term")) hideTip(); });
  document.addEventListener("focusin", e=>{ const t = e.target.closest && e.target.closest(".term"); if(t) showTip(html(t.dataset.term), e, t); });
  document.addEventListener("focusout", e=>{ if(e.target.closest && e.target.closest(".term")) hideTip(); });
  const go = t=>{ hideTip(); openSection("glosario"); const id = "glos-"+t.dataset.term; scrollSoon(id); const d = document.getElementById(id); if(d){ d.classList.add("flash"); setTimeout(()=> d.classList.remove("flash"), 2200); } };
  document.addEventListener("click", e=>{ const t = e.target.closest && e.target.closest(".term"); if(t) go(t); });
  document.addEventListener("keydown", e=>{ const t = e.target.closest && e.target.closest(".term"); if(t && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); go(t); } });
  // las lecturas se regeneran al filtrar: se decoran de nuevo
  const mo = new MutationObserver(muts=> muts.forEach(m=> m.target.closest && m.target.closest(".reading") && decorate(m.target.closest(".reading"))));
  document.querySelectorAll(".reading").forEach(r=> mo.observe(r, { childList:true }));
}

/* ================================================================= 07 NORMATIVA */
function addMonths(date, m){ const d = new Date(date.getTime()); d.setMonth(d.getMonth()+m); return d; }
function fdate(d){ return d.toLocaleDateString("es-CO",{ day:"numeric", month:"short", year:"numeric" }); }
function renderNormativa(){
  let body = document.getElementById("body-normativa");
  const N = C.normativa;
  body.appendChild(el("p",null,["En 2026 Colombia adoptó la Ley 2628, que establece medidas de atención integral, inclusión y protección para las personas con TEA, otros trastornos del neurodesarrollo (como el TDAH y los trastornos del aprendizaje) y condiciones similares. Es la norma más cercana a las personas con TEA; su relación con la Política Nacional de Salud Mental 2024-2033 se analiza en la sección siguiente."]));

  sub(body, "normativa-ruta", "Del tamizaje al diagnóstico: dónde interviene cada norma", "Esquema de lectura del equipo del proyecto. Pasa el cursor o el foco por cada paso.");
  const steps = [
    { t:"Tamizaje", s:"Según la edad", d:"Resolución 3280 de 2018: EAD-3 en cada consulta de primera infancia y test m-Chat entre los 18 y los 30 meses. El artículo 12 de la Ley 2628 orienta la detección temprana. Para las demás edades, ver «Herramientas por edad».", norma:"Res. 3280 de 2018" },
    { t:"Remisión", s:"Evaluaciones pediátricas", d:"Resolución 3280 de 2018: ante alteraciones se deriva a evaluación a profundidad del desarrollo. Ley 2628, art. 12: se propenderá por la detección y atención temprana mediante la remisión de los profesionales en las evaluaciones pediátricas periódicas.", norma:"Ley 2628, art. 12" },
    { t:"Diagnóstico", s:"Equipo interdisciplinario", d:"Ley 2628, arts. 6 y 9: actualizar el protocolo clínico de diagnóstico, tratamiento y ruta de atención de niños, niñas y adolescentes con TEA. Los adultos no tienen una ruta diagnóstica explícita.", norma:"Ley 2628, arts. 6 y 9" },
    { t:"Certificación", s:"2 meses (voluntaria)", d:"Ley 2628, art. 7: Certificado Único de Trastorno del Neurodesarrollo en dos meses desde que la EPS recibe el diagnóstico; no puede usarse como barrera de acceso.", norma:"Ley 2628, art. 7" },
    { t:"Atención integral", s:"Ruta pública", d:"Ley 2628, art. 13 y PNSM eje 3: ruta de atención médica clara y pública y atención integral de los problemas y trastornos mentales.", norma:"Ley 2628, art. 13 · PNSM" },
    { t:"Inclusión", s:"Educación, familia, trabajo", d:"Ley 2628, arts. 15 a 23 y PNSM eje 4: inclusión escolar, apoyo a cuidadores, inserción laboral, rehabilitación e inclusión social.", norma:"Ley 2628 · PNSM eje 4" }
  ];
  const w = 760, h = 150, bw = 112, gap = (w - 20 - steps.length*bw)/(steps.length-1);
  const s = svgEl(w, h, "flow-steps", "Ruta del tamizaje a la inclusión");
  s.innerHTML = '<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arrow-head"/></marker></defs>';
  steps.forEach((st,i)=>{
    const x = 10 + i*(bw+gap);
    if(i < steps.length-1){ const l = document.createElementNS(SVGNS,"line"); l.setAttribute("x1",x+bw+2); l.setAttribute("x2",x+bw+gap-3); l.setAttribute("y1",60); l.setAttribute("y2",60); l.setAttribute("class","flow-arrow"); l.setAttribute("marker-end","url(#arr)"); s.appendChild(l); }
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("class","node-box step-node"); g.setAttribute("tabindex","0");
    g.innerHTML = '<rect x="'+x+'" y="26" width="'+bw+'" height="68" rx="10"/><text x="'+(x+bw/2)+'" y="52" text-anchor="middle" class="step-t">'+esc(st.t)+'</text><text x="'+(x+bw/2)+'" y="70" text-anchor="middle" class="actors">'+esc(st.s)+'</text><text x="'+(x+bw/2)+'" y="118" text-anchor="middle" class="step-norma">'+esc(st.norma)+'</text>';
    bindTip(g, ()=> "<h5>"+esc(st.t)+"</h5><p>"+esc(st.d)+"</p>");
    s.appendChild(g);
  });
  body.appendChild(el("div",{class:"diagram-wrap"},[s]));
  const lst = el("ul",{class:"a11y-list compact-list"});
  steps.forEach(st=> lst.appendChild(el("li",null,[ el("div",{class:"a11y-title"},[st.t + " · " + st.norma]), el("div",{class:"a11y-meta"},[st.d]) ])));
  const lt = el("button",{class:"btn a11y-list-toggle", type:"button", "aria-expanded":"false"},["Ver como lista"]);
  lst.hidden = true;
  lt.addEventListener("click", ()=>{ lst.hidden = !lst.hidden; lt.setAttribute("aria-expanded", lst.hidden?"false":"true"); lt.textContent = lst.hidden ? "Ver como lista" : "Ocultar lista"; });
  body.appendChild(lt); body.appendChild(lst);
  body.appendChild(el("div",{class:"tag-row"},[confidenceTag("nota-autor")]));

  const Z = N.res3280;
  sub(body, "normativa-infancia", "Primera infancia: valoración del desarrollo y tamizaje", Z.nombre + " · " + Z.fecha);
  body.appendChild(el("p",null,[ el("strong",null,["¿Cuál es su alcance? "]), Z.alcance ]));
  const zt = el("table",{class:"cmp-table"}), ztb = el("tbody");
  zt.appendChild(el("thead",null,[ el("tr",null,["¿Qué se aplica?","¿A quién?","¿Cómo?"].map(x=> el("th",{scope:"col"},[x]))) ]));
  Z.filas.forEach(f=> ztb.appendChild(el("tr",null,[ el("th",{scope:"row"},[f[0]]), el("td",null,[f[1]]), el("td",null,[f[2]]) ]))); zt.appendChild(ztb);
  body.appendChild(el("div",{class:"table-wrap"},[zt]));
  body.appendChild(el("p",null,[Z.lectura]));
  body.appendChild(el("p",{class:"link-row"},[ el("a",{href:Z.url, target:"_blank", rel:"noopener"},["Texto compilado (Supersalud)"]), " · ", el("a",{href:Z.urlPdf, target:"_blank", rel:"noopener"},["Texto oficial (MinSalud, PDF)"]) ]));

  const L = N.ley2628;
  sub(body, "normativa-ley", L.nombre, L.fecha);
  body.appendChild(el("div",{class:"card law-card"},[
    el("p",null,[ el("strong",null,["Objeto. "]), L.objeto ]),
    el("p",{class:"muted"},[ el("strong",null,["Alcance. "]), L.alcance ]),
    el("p",{class:"link-row"},[
      el("a",{href:L.url, target:"_blank", rel:"noopener"},["Texto oficial (Presidencia, PDF)"]), " · ",
      el("a",{href:L.urlCompilada, target:"_blank", rel:"noopener"},["Texto compilado (normograma MinTIC)"])
    ])
  ]));
  // línea de tiempo de plazos
  const sanc = new Date(2026, 7, 26), hoy = new Date();
  const plazos = L.articulos.filter(a=> a.plazoMeses);
  const groups = {}; plazos.forEach(a=>{ (groups[a.plazoMeses] = groups[a.plazoMeses] || []).push(a); });
  const tw = 760, th = 200, tp = 40, tiw = tw - 2*tp;
  const t0 = sanc.getTime(), t1 = addMonths(sanc, 15).getTime();
  const TX = d => tp + tiw*(d.getTime()-t0)/(t1-t0);
  const ts = svgEl(tw, th, "timeline-svg", "Plazos de la Ley 2628 de 2026");
  let tg = '<line x1="'+tp+'" x2="'+(tw-tp)+'" y1="70" y2="70" class="tl-axis"/>';
  for(let m=0;m<=14;m+=2){ const d = addMonths(sanc,m); tg += '<line x1="'+TX(d)+'" x2="'+TX(d)+'" y1="66" y2="74" class="tl-tick"/><text x="'+TX(d)+'" y="90" class="axis-lab" text-anchor="middle">'+d.toLocaleDateString("es-CO",{month:"short", year:"2-digit"})+'</text>'; }
  tg += '<circle cx="'+TX(sanc)+'" cy="70" r="6" class="tl-start"/><text x="'+TX(sanc)+'" y="50" class="axis-lab strong" text-anchor="start">Sanción 26/08/2026</text>';
  if(hoy > sanc && hoy < new Date(t1)){ tg += '<line x1="'+TX(hoy)+'" x2="'+TX(hoy)+'" y1="40" y2="100" class="tl-today"/><text x="'+(TX(hoy)+4)+'" y="108" class="axis-lab tl-today-lab">Hoy</text>'; }
  ts.innerHTML = tg;
  Object.keys(groups).forEach(m=>{
    const d = addMonths(sanc, +m), x = TX(d), arts = groups[m];
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("class","tl-mark"); g.setAttribute("tabindex","0");
    const anc = x > tw*0.72 ? "end" : "middle", lx = anc === "end" ? x + 8 : x;
    g.innerHTML = '<line x1="'+x+'" x2="'+x+'" y1="70" y2="128" class="tl-stem"/><circle cx="'+x+'" cy="70" r="8" class="tl-dot"/><text x="'+x+'" y="74" text-anchor="middle" class="tl-dot-lab">'+arts.length+'</text><text x="'+lx+'" y="144" text-anchor="'+anc+'" class="axis-lab strong">'+m+' meses · '+fdate(d)+'</text>' + arts.map((a,j)=>'<text x="'+lx+'" y="'+(160+j*14)+'" text-anchor="'+anc+'" class="axis-lab">'+esc(a.art+" · "+a.tema)+'</text>').join("");
    bindTip(g, ()=> "<h5>Plazo de "+m+" meses (≈ "+fdate(d)+")</h5>" + arts.map(a=>"<p><b>"+esc(a.art)+" · "+esc(a.tema)+".</b> "+esc(a.d)+"</p>").join(""));
    ts.appendChild(g);
  });
  body.appendChild(el("h4",{class:"chart-title"},["Línea de tiempo de los plazos para el Gobierno"]));
  body.appendChild(el("div",{class:"diagram-wrap"},[ts]));
  body.appendChild(sourceLine(L.nota));

  let eje = "todos";
  const EJES = [{id:"todos",label:"Todos"},{id:"salud",label:"Salud"},{id:"informacion",label:"Información"},{id:"gobernanza",label:"Gobernanza"},{id:"educacion",label:"Educación"},{id:"social",label:"Familia y trabajo"}];
  body.appendChild(chips(EJES, eje, id=>{ eje = id; drawArts(); }, "Filtrar artículos"));
  const artBox = el("div",{class:"art-list"});
  body.appendChild(artBox);
  function drawArts(){
    artBox.innerHTML = "";
    L.articulos.filter(a=> eje==="todos" || a.eje===eje).forEach(a=>{
      artBox.appendChild(el("article",{class:"art-item", id:"art-"+a.art.replace(/[^a-z0-9]/gi,"")},[
        el("div",{class:"art-head"},[ el("a",{class:"art-num", href:L.urlCompilada + "#" + a.ancla, target:"_blank", rel:"noopener", title:"Ver el artículo en el texto compilado de la ley"},[a.art]), el("h4",null,[a.tema]),
          a.plazoMeses ? el("span",{class:"level-pill level-media"},["Plazo: " + a.plazoMeses + " meses"]) : (a.plazoTexto ? el("span",{class:"level-pill level-media"},[a.plazoTexto]) : null) ]),
        el("p",null,[a.d])
      ]));
    });
  }
  drawArts();
  body.appendChild(callout("¿Por qué importan los datos de este análisis para la ley? La ruta de atención (art. 13), la capacitación del personal de atención primaria (art. 14) y el seguimiento estadístico (art. 8) necesitan saber dónde y con qué oferta se atiende hoy el TEA. El 19,9 % de las personas atendidas vive en municipios sin sede de neuropediatría y solo el 15,9 % de las sedes ofrece telemedicina.", "callout-info"));

  const P = N.pnsm;
  body = document.getElementById("body-paralelo");
  sub(body, "normativa-pnsm", "La política en detalle: " + P.nombre, P.emisor);
  body.appendChild(el("p",null,[ el("strong",null,["Objetivo general. "]), P.objetivo ]));
  body.appendChild(el("p",{class:"muted small"},[P.contexto]));
  const ejesWrap = el("div",{class:"ejes-grid"});
  P.ejes.forEach(e=> ejesWrap.appendChild(el("div",{class:"eje-card"},[ el("span",{class:"eje-n"},["Eje " + e.n]), el("p",null,[e.nombre]) ])));
  body.appendChild(ejesWrap);
  body.appendChild(el("h4",{class:"chart-title"},["¿Qué dice sobre el neurodesarrollo?"]));
  const nl = el("ul",{class:"gap-list"});
  P.neurodesarrollo.forEach(n=> nl.appendChild(el("li",null,[ el("span",null,[ n.d + " ", el("span",{class:"cite-tag"},["p. " + n.pag]) ]) ])));
  body.appendChild(nl);
  body.appendChild(el("p",{class:"link-row"},[ el("a",{href:P.url, target:"_blank", rel:"noopener"},["Documento de la política (PDF)"]), " · ", P.nota ]));

  const M = N.minsalud;
  sub(body, "normativa-minsalud", "Salud mental en el Ministerio de Salud", "Portal de salud mental del Ministerio de Salud y Protección Social.");
  const tl = el("div",{class:"tag-row"});
  M.temas.forEach(t=> tl.appendChild(el("span",{class:"tag-pill"},[t])));
  body.appendChild(tl);
  body.appendChild(el("p",{class:"link-row"},[ el("a",{href:M.url, target:"_blank", rel:"noopener"},["minsalud.gov.co/salud/publica/salud-mental"]) ]));
  body.appendChild(callout("Si tú o alguien cercano necesita orientación o apoyo en crisis de salud mental, la Línea 106 del Ministerio de Salud ofrece orientación, apoyo en crisis y gestión del riesgo.", "callout-info"));
}

/* ================================================================= 08 REVISIÓN */
function renderRevision(){
  const body = document.getElementById("body-revision");
  const R = C.revision;
  body.appendChild(el("p",null,["El componente principal del proyecto es una revisión sistemática que busca explicar por qué se retrasa el diagnóstico del TEA en Colombia. Los datos de las secciones anteriores describen cuánto, dónde y con qué oferta; la revisión aportará el porqué."]));
  body.appendChild(el("blockquote",{class:"question"},[R.pregunta]));
  const g = el("div",{class:"pcc-grid"});
  R.pcc.forEach(p=> g.appendChild(el("div",{class:"pcc-card"},[ el("span",{class:"k"},[p.k]), el("p",null,[p.d]) ])));
  body.appendChild(g);
  body.appendChild(el("p",null,[R.metodos]));
  body.appendChild(el("h4",{class:"chart-title"},["Diagrama de flujo PRISMA 2020 (preliminar)"]));
  const P = R.prisma;
  const w = 720, h = 330, s = svgEl(w, h, "prisma-svg", "Diagrama PRISMA preliminar");
  function box(x,y,bw,bh,title,lines,cls){
    return '<g class="prisma-box '+(cls||"")+'"><rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+bh+'" rx="8"/><text x="'+(x+12)+'" y="'+(y+20)+'" class="prisma-title">'+esc(title)+'</text>' + lines.map((l,i)=>'<text x="'+(x+12)+'" y="'+(y+38+i*15)+'" class="prisma-label">'+esc(l)+'</text>').join("") + '</g>';
  }
  let sv = '<defs><marker id="parr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="arrow-head"/></marker></defs>';
  sv += box(20,14,300,88,"Registros identificados: "+P.identificados, P.bases.map(b=> b.base+": "+b.n).reduce((a,c,i)=>{ if(i%2===0) a.push(c); else a[a.length-1] += " · " + c; return a; },[]));
  sv += box(400,14,300,60,"Duplicados retirados: "+P.duplicados, ["Antes del tamizaje"], "prisma-removed");
  sv += box(20,128,300,60,"Registros tamizados: "+P.tamizados, ["Por título y resumen"]);
  sv += box(400,108,300,104,"Registros excluidos: "+P.excluidos, P.motivos.map(m=> m.n+" · "+(m.m.length>38? m.m.slice(0,36)+"…" : m.m)), "prisma-removed");
  sv += box(20,236,300,70,"Informes a texto completo: "+P.textoCompleto, ["Evaluación de elegibilidad en curso"], "prisma-included");
  sv += '<line x1="170" y1="102" x2="170" y2="126" class="prisma-arrow" marker-end="url(#parr)"/><line x1="320" y1="44" x2="398" y2="44" class="prisma-arrow" marker-end="url(#parr)"/><line x1="170" y1="188" x2="170" y2="234" class="prisma-arrow" marker-end="url(#parr)"/><line x1="320" y1="158" x2="398" y2="158" class="prisma-arrow" marker-end="url(#parr)"/>';
  s.innerHTML = sv;
  body.appendChild(el("div",{class:"diagram-wrap"},[s]));
  // motivos interactivos
  const mw = 640, mH = 30, mpad = { l:330, r:50, t:6 }, mh = mpad.t + P.motivos.length*mH, miw = mw - mpad.l - mpad.r;
  const ms = svgEl(mw, mh, "", "Motivos de exclusión en el tamizaje");
  P.motivos.forEach((m,i)=>{
    const y = mpad.t + i*mH, bw = miw*m.n/100;
    const gg = document.createElementNS(SVGNS,"g"); gg.setAttribute("tabindex","0"); gg.setAttribute("class","bar-g");
    gg.innerHTML = '<text x="'+(mpad.l-10)+'" y="'+(y+19)+'" class="axis-lab" text-anchor="end">'+esc(m.m.length>50?m.m.slice(0,48)+"…":m.m)+'</text><rect x="'+mpad.l+'" y="'+(y+6)+'" width="'+bw+'" height="'+(mH-12)+'" rx="4" class="bar-fill"/><text x="'+(mpad.l+bw+5)+'" y="'+(y+19)+'" class="bar-val">'+m.n+'</text>';
    bindTip(gg, ()=> "<h5>"+esc(m.m)+"</h5><p>"+m.n+" de "+P.excluidos+" registros excluidos ("+fmt(100*m.n/P.excluidos,1)+" %)</p>");
    ms.appendChild(gg);
  });
  body.appendChild(el("div",{class:"chart-box"},[ el("h4",{class:"chart-title"},["Motivos de exclusión en el tamizaje por título y resumen"]), ms ]));
  body.appendChild(sourceLine(R.prismaNota));
  body.appendChild(el("div",{class:"tag-row"},[confidenceTag("preliminar")]));
}

/* ================================================================= 09 METODOLOGÍA */
function renderMetodologia(){
  const body = document.getElementById("body-metodologia");
  const M = C.metodologia;
  const g = el("div",{class:"pcc-grid"});
  M.fuentes.forEach(f=> g.appendChild(el("div",{class:"pcc-card"},[ el("span",{class:"k"},[f.k]), el("p",null,[f.d]) ])));
  body.appendChild(g);
  body.appendChild(el("p",null,[ el("strong",null,["Diseño. "]), M.unidad ]));
  body.appendChild(el("h4",{class:"chart-title", id:"metodologia-codigos"},["¿Qué cuenta el código F84?"]));
  body.appendChild(cie10List());
  body.appendChild(el("p",null,[M.codigos]));
  body.appendChild(el("h4",{class:"chart-title", id:"metodologia-totales"},["¿Por qué hay varios totales?"]));
  const tt = el("table",{class:"cmp-table"}), ttb = el("tbody");
  tt.appendChild(el("thead",null,[ el("tr",null,["Total","Cifra","¿Para qué se usa?"].map(x=> el("th",{scope:"col"},[x]))) ]));
  M.totales.forEach(x=> ttb.appendChild(el("tr",null,[ el("th",{scope:"row"},[x.k]), el("td",null,[x.v]), el("td",null,[x.d]) ]))); tt.appendChild(ttb);
  body.appendChild(el("div",{class:"table-wrap"},[tt]));
  body.appendChild(el("h4",{class:"chart-title", id:"metodologia-definiciones"},["¿Cómo se calcula cada medida?"]));
  const dt = el("table",{class:"cmp-table def-table"});
  dt.appendChild(el("thead",null,[ el("tr",null,[ el("th",{scope:"col"},["Medida"]), el("th",{scope:"col"},["Fórmula"]), el("th",{scope:"col"},["¿Qué indica?"]) ]) ]));
  const dtb = el("tbody"); M.definiciones.forEach(x=> dtb.appendChild(el("tr",null,[ el("th",{scope:"row"},[x.k]), el("td",null,[ el("code",null,[x.f]) ]), el("td",null,[x.d]) ]))); dt.appendChild(dtb);
  body.appendChild(el("div",{class:"table-wrap"},[dt]));
  body.appendChild(el("p",null,[ el("strong",null,["Medidas de desigualdad. "]), M.medidas ]));
  body.appendChild(el("h4",{class:"chart-title"},["Limitaciones y advertencias de lectura"]));
  const ul = el("ul",{class:"limit-list"});
  M.limitaciones.forEach(l=> ul.appendChild(el("li",null,[ el("span",null,[l]) ])));
  body.appendChild(ul);
  body.appendChild(el("h4",{class:"chart-title"},["Reproducibilidad"]));
  body.appendChild(el("p",null,["Las cifras por departamento de este análisis se generan con scripts/build_data.py directamente desde el libro de cálculo del proyecto, sin digitación. Los índices, modelos e intervalos provienen del código de Python del proyecto (pandas, SciPy, statsmodels; semilla del bootstrap 20261113). El informe sigue la guía RECORD para estudios con datos rutinarios y PRISMA 2020 para la revisión."]));
  body.appendChild(el("p",null,["Uso de los datos: solo datos agregados por departamento, de acceso público, sin variables que identifiquen a personas ni a profesionales (investigación sin riesgo, artículo 11 de la Resolución 8430 de 1993)."]));
  body.appendChild(el("h4",{class:"chart-title", id:"metodologia-equipo"},["Equipo del proyecto"]));
  body.appendChild(el("p",null,["Proyecto «" + C.meta.proyecto + "», " + C.meta.institucion + ". Análisis preliminar de datos públicos y del marco normativo; la revisión sistemática está en curso."]));
  const eq = el("ul",{class:"team-list"});
  C.equipo.forEach(p=> eq.appendChild(el("li",null,[ el("strong",null,[p.nombre]), " · " + p.rol, p.cred ? el("span",{class:"team-cred"},[p.cred]) : null ])));
  body.appendChild(eq);
  body.appendChild(el("p",{class:"link-row"},[ el("a",{href:C.meta.uninavarraUrl, target:"_blank", rel:"noopener"},["Fundación Universitaria Navarra (UNINAVARRA)"]) ]));
}

/* ---------------------------------------------------------------- TOC, scrollspy, breadcrumb */
function renderTOC(){
  const toc = document.getElementById("toc");
  let curPart;
  SECTIONS.forEach(s=>{
    if(s.part && s.part !== curPart){ curPart = s.part; const P = PARTS.find(x=> x.id === s.part); toc.appendChild(el("div",{class:"toc-part part-"+P.id},[ el("span",null,[P.k]), " ", P.t ])); }
    const a = el("a",{ href:"#sec-"+s.id, class:"toc-link", "data-target":s.id },[ el("span",{class:"toc-num"},[s.num]), s.toc || s.title ]);
    a.addEventListener("click", e=>{ e.preventDefault(); openSection(s.id); scrollToId("sec-"+s.id); closeSidebar(); });
    toc.appendChild(a);
    (s.subs||[]).forEach(su=>{
      const b = el("a",{ href:"#"+su.id, class:"toc-link sub", "data-target":s.id, "data-sub":su.id },[su.label]);
      b.addEventListener("click", e=>{ e.preventDefault(); openSection(s.id); scrollSoon(su.id); closeSidebar(); });
      toc.appendChild(b);
    });
  });
  document.getElementById("section-count-hint").textContent = SECTIONS.length + " secciones · pulsa / para buscar";
}
function initScrollspy(){
  const bc = document.getElementById("breadcrumb");
  function update(){
    let cur = null;
    SECTIONS.forEach(s=>{ const n = document.getElementById("sec-"+s.id); if(n && n.getBoundingClientRect().top < 140) cur = s; });
    let curSub = null;
    if(cur && document.getElementById("sec-"+cur.id).classList.contains("open")){
      (cur.subs||[]).forEach(su=>{ const n = document.getElementById(su.id); if(n && n.getBoundingClientRect().top < 160) curSub = su; });
    }
    document.querySelectorAll(".toc-link").forEach(a=>{
      const isSub = a.hasAttribute("data-sub");
      a.classList.toggle("active", !!cur && (isSub ? curSub && a.getAttribute("data-sub")===curSub.id : a.getAttribute("data-target")===cur.id && !curSub));
    });
    bc.innerHTML = "";
    if(cur){
      bc.appendChild(el("div",{class:"container"},[ el("a",{href:"#main"},["Inicio"]), el("span",{class:"sep"},[" / "]), el("span",{class: curSub?null:"current"},[cur.toc || cur.title]),
        curSub ? el("span",{class:"sep"},[" / "]) : null, curSub ? el("span",{class:"current"},[curSub.label]) : null ]));
    }
  }
  window.addEventListener("scroll", ()=> requestAnimationFrame(update), { passive:true });
  update();
}

/* ---------------------------------------------------------------- búsqueda */
function buildSearchIndex(){
  const idx = [];
  SECTIONS.forEach(s=>{ idx.push({ type:"Pregunta", label:s.title, detail:s.sub, sec:s.id, anchor:"sec-"+s.id });
    (s.subs||[]).forEach(su=> idx.push({ type:"Subsección", label:su.label, detail:s.title, sec:s.id, anchor:su.id })); });
  DEP.forEach(d=> idx.push({ type:"Departamento", label:d.nombre, detail:d.region + " · prevalencia atendida 2024 " + fmt(d.tasa24,1) + " por 100.000 · " + fmt(d.sedes) + " sedes", sec:"territorio", anchor:"territorio-mapa", dept:d.cod }));
  INDICATORS.forEach(i=> idx.push({ type:"Indicador", label:i.label, detail:"Indicador por departamento", sec:"territorio", anchor:"territorio-tabla" }));
  C.cie10.forEach(x=> idx.push({ type:"CIE-10", label:x.c + " " + x.n, detail:"Código incluido en las consultas", sec:"contexto", anchor:"resumen-metodos" }));
  C.hallazgos.forEach(h=> idx.push({ type:"Resultado", label:h.t, detail:h.d, sec:h.sec, anchor:"sec-"+h.sec }));
  C.glosario.forEach(g=> idx.push({ type:"Glosario", label:g.t, detail:g.d, sec:"glosario", anchor:"glos-"+g.id }));
  C.normativa.ley2628.articulos.forEach(a=> idx.push({ type:"Ley 2628", label:a.art + " · " + a.tema, detail:a.d, sec:"normativa", anchor:"normativa-ley" }));
  C.normativa.pnsm.ejes.forEach(e=> idx.push({ type:"Política de Salud Mental", label:"Eje " + e.n + ". " + e.nombre, detail:"PNSM 2024-2033", sec:"paralelo", anchor:"normativa-pnsm" }));
  C.metodologia.limitaciones.forEach(l=> idx.push({ type:"Limitación", label:l.slice(0,70) + (l.length>70?"…":""), detail:l, sec:"metodologia", anchor:"sec-metodologia" }));
  C.referencias.forEach(r=> idx.push({ type:"Referencia", label:r.c.slice(0,80) + (r.c.length>80?"…":""), detail:r.url, sec:"referencias", anchor:"sec-referencias" }));
  C.equipo.forEach(p=> idx.push({ type:"Equipo", label:p.nombre, detail:p.rol, sec:"metodologia", anchor:"sec-metodologia" }));
  C.instrumentos.items.forEach(it=> idx.push({ type:"Herramienta", label:it.nombre, detail:it.tipo + " · " + it.quien, sec:"instrumentos", anchor:"instrumentos-linea" }));
  C.vacios.forEach(v=> idx.push({ type:"Vacío de la ley", label:v.t, detail:v.d, sec:"normativa", anchor:"normativa-vacios" }));
  C.causal.nodos.forEach(n=> idx.push({ type:"Diagrama causal", label:n.t, detail:n.d, sec:"causal", anchor:"causal-diagrama" }));
  STORY.forEach(st=> idx.push({ type:"Relato", label:st.t, detail:st.d, sec:"contexto", anchor:"contexto-relato" }));
  C.panorama.hipotesis.forEach(h=> idx.push({ type:"Hipótesis 2025", label:h.t, detail:h.d, sec:"nacional", anchor:"nacional-regimen" }));
  C.metodologia.definiciones.forEach(x=> idx.push({ type:"Definición", label:x.k, detail:x.f + ". " + x.d, sec:"metodologia", anchor:"metodologia-definiciones" }));
  return idx;
}
function norm(s){ return String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase(); }
function initSearch(){
  const IDX = buildSearchIndex();
  const panel = document.getElementById("search-panel"), input = document.getElementById("search-input"), list = document.getElementById("search-results");
  let results = [], active = -1;
  function open(){ panel.hidden = false; input.value = ""; render(); setTimeout(()=> input.focus(), 10); }
  function close(){ panel.hidden = true; }
  function render(){
    const q = norm(input.value.trim());
    list.innerHTML = "";
    if(!q){ results = []; input.setAttribute("aria-expanded","false"); return; }
    const terms = q.split(/\s+/);
    results = IDX.filter(r=>{ const t = norm(r.label + " " + r.detail + " " + r.type); return terms.every(x=> t.includes(x)); }).slice(0,14);
    active = results.length ? 0 : -1;
    input.setAttribute("aria-expanded", results.length ? "true":"false");
    if(!results.length){ list.appendChild(el("li",{class:"search-empty"},["Sin resultados para «" + input.value + "»"])); return; }
    results.forEach((r,i)=>{
      const li = el("li",{class:"search-result" + (i===active?" active":""), role:"option", id:"sr-"+i, "aria-selected": i===active?"true":"false"},[
        el("span",{class:"sr-type"},[r.type]), el("div",{class:"sr-label"},[r.label]), el("div",{class:"sr-detail"},[r.detail])
      ]);
      li.addEventListener("click", ()=> go(r));
      list.appendChild(li);
    });
  }
  function go(r){
    close();
    if(r.dept) selectDept(r.dept);
    openSection(r.sec);
    scrollSoon(r.anchor);
  }
  function move(d){
    if(!results.length) return;
    active = (active + d + results.length) % results.length;
    list.querySelectorAll(".search-result").forEach((li,i)=>{ li.classList.toggle("active", i===active); li.setAttribute("aria-selected", i===active?"true":"false"); });
    const a = list.querySelector(".search-result.active"); if(a) a.scrollIntoView({ block:"nearest" });
  }
  input.addEventListener("input", render);
  input.addEventListener("keydown", e=>{
    if(e.key === "ArrowDown"){ e.preventDefault(); move(1); }
    else if(e.key === "ArrowUp"){ e.preventDefault(); move(-1); }
    else if(e.key === "Enter" && active >= 0){ e.preventDefault(); go(results[active]); }
    else if(e.key === "Escape"){ close(); }
  });
  document.getElementById("search-trigger").addEventListener("click", open);
  document.getElementById("search-close").addEventListener("click", close);
  panel.addEventListener("click", e=>{ if(e.target === panel) close(); });
  return { open, close, isOpen: ()=> !panel.hidden };
}

/* ---------------------------------------------------------------- paneles y atajos */
function closeSidebar(){
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebar-scrim").hidden = true;
  document.getElementById("toc-toggle").setAttribute("aria-expanded","false");
}
function initMobileSidebar(){
  const btn = document.getElementById("toc-toggle"), sb = document.getElementById("sidebar"), scrim = document.getElementById("sidebar-scrim");
  btn.addEventListener("click", ()=>{ const o = !sb.classList.contains("open"); sb.classList.toggle("open", o); scrim.hidden = !o; btn.setAttribute("aria-expanded", o?"true":"false"); });
  scrim.addEventListener("click", closeSidebar);
}
function renderSources(){
  const b = document.getElementById("sources-panel-body");
  C.fuentes.forEach(g=>{
    if(!g.items.length) return;
    b.appendChild(el("div",{class:"sources-panel-group"},[ el("h3",null,[g.grupo]),
      el("ul",{class:"sources-panel-list"}, g.items.map(i=> el("li",null,[ el("a",{href:i.url, target:"_blank", rel:"noopener"},[i.label]) ]))) ]));
  });
  const btn = document.getElementById("sources-panel-btn"), panel = document.getElementById("sources-panel");
  function show(){ panel.hidden = false; closeSidebar(); scrollSoon("sources-panel"); }
  btn.addEventListener("click", show);
  document.querySelectorAll(".js-open-sources").forEach(x=> x.addEventListener("click", e=>{ e.preventDefault(); show(); }));
}
function initShortcuts(search){
  const help = document.getElementById("shortcuts-panel");
  function toggleHelp(force){ help.hidden = typeof force === "boolean" ? !force : !help.hidden; }
  document.getElementById("help-toggle").addEventListener("click", ()=> toggleHelp());
  document.getElementById("shortcuts-close").addEventListener("click", ()=> toggleHelp(false));
  help.addEventListener("click", e=>{ if(e.target === help) toggleHelp(false); });
  document.addEventListener("keydown", e=>{
    const tag = (e.target.tagName||"").toLowerCase();
    const typing = tag === "input" || tag === "textarea" || tag === "select";
    if(e.key === "Escape"){
      const tsm = document.getElementById("text-size-menu");
      if(tsm && !tsm.hidden){ tsm.hidden = true; document.getElementById("text-size-btn").setAttribute("aria-expanded","false"); document.getElementById("text-size-btn").focus(); }
      else if(search.isOpen()) search.close(); else if(!help.hidden) toggleHelp(false); else closeSidebar();
      hideTip(); return;
    }
    if(typing) return;
    if(e.key === "+" || e.key === "="){ e.preventDefault(); stepTextSize(1); return; }
    if(e.key === "-" || e.key === "_"){ e.preventDefault(); stepTextSize(-1); return; }
    if(e.key === "/"){ e.preventDefault(); search.open(); }
    else if(e.key === "?"){ e.preventDefault(); toggleHelp(); }
  });
}
function initFocusMode(){
  const btn = document.getElementById("focus-toggle");
  btn.addEventListener("click", ()=>{ const on = !document.body.classList.contains("focus-mode"); document.body.classList.toggle("focus-mode", on); btn.setAttribute("aria-pressed", on?"true":"false"); });
}
function initScrollTop(){
  const b = document.getElementById("scroll-top");
  window.addEventListener("scroll", ()=>{ b.hidden = window.scrollY < 600; }, { passive:true });
  b.addEventListener("click", ()=> window.scrollTo({ top:0, behavior:"smooth" }));
}
function renderFooter(){
  document.getElementById("year").textContent = "2026";
  document.getElementById("footer-disclaimer").textContent = C.aviso + " Este análisis describe datos administrativos agregados; no ofrece orientación clínica individual.";
  document.getElementById("footer-author").innerHTML = "Equipo: " + C.equipo.map(p=> "<strong>" + esc(p.nombre) + "</strong> (" + esc(p.rol) + ")").join(", ") + ". Elaboración: " + esc(C.meta.autor) + ", " + esc(C.meta.autorCred.charAt(0).toLowerCase() + C.meta.autorCred.slice(1)) + " (<a href='" + C.meta.orcid + "' target='_blank' rel='noopener'>ORCID</a>). Proyecto: " + esc(C.meta.proyecto) + ", <a href='" + C.meta.uninavarraUrl + "' target='_blank' rel='noopener'>" + esc(C.meta.institucion) + "</a>.";
  const cc = document.getElementById("cc-badge");
  cc.href = "https://creativecommons.org/publicdomain/zero/1.0/deed.es"; cc.textContent = "CC0 1.0";
  document.getElementById("footer-license-text").textContent = "Textos, gráficos y código bajo dedicación al dominio público CC0 1.0 Universal; se agradece citar la fuente. Los datos de origen pertenecen a sus fuentes oficiales (SISPRO, REPS, DANE).";
}

/* ---------------------------------------------------------------- arranque */
function boot(){
  renderHero();
  buildAccordion();
  renderContexto();
  renderCausal();
  renderTerritorio();
  renderIntensidad();
  renderNacional();
  renderOferta();
  renderOfertaAtencion();
  renderPobreza();
  renderDesigualdad();
  renderHuila();
  renderInstrumentos();
  renderNormativa();
  renderNormativaExtras();
  renderRevision();
  renderMetodologia();
  renderGlosario();
  renderReferencias();
  addSectionNav();
  renderTOC();
  renderSources();
  renderFooter();
  decorate(document.getElementById("accordion"));
  decorate(document.querySelector(".hero"));
  initTerms();
  document.querySelectorAll(".js-export-pdf").forEach(b=> b.addEventListener("click", ()=> window.print()));
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("expand-all").addEventListener("click", ()=> setAll(true));
  document.getElementById("collapse-all").addEventListener("click", ()=> setAll(false));
  initMobileSidebar();
  const search = initSearch();
  initShortcuts(search);
  initFocusMode();
  initTextSize();
  initScrollTop();
  initScrollspy();
}
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
