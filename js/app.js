/* TEA en Colombia: motor del explorador y gráficos interactivos (SVG, sin dependencias). */
(function(){
"use strict";

const D = window.TEA_DATOS;
const C = window.TEA_CONTENIDO;
const DEP = D.deptos.slice();
const BY = {}; DEP.forEach(d=>{ BY[d.cod] = d; });
const NAC = { pob: 52613753, pers24: 51474, tasa24: 97.8, sedes100k: 1.12, pctFuera: 11.4, atenPorPersona: 12.1 };
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
  return Number(n).toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function svgEl(w, h, cls, label){
  const s = document.createElementNS(SVGNS, "svg");
  s.setAttribute("viewBox", "0 0 " + w + " " + h);
  s.setAttribute("class", "chart-svg " + (cls||""));
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
function toggleTheme(){
  const next = currentTheme() === "dark" ? "light" : "dark";
  applyTheme(next); try{ localStorage.setItem(THEME_KEY, next); }catch(e){}
}

/* ---------------------------------------------------------------- secciones */
const SECTIONS = [
  { id:"panorama", num:"01", title:"Panorama nacional", sub:"Qué es el TEA, cuántas personas se atienden y quiénes son", open:true,
    subs:[{id:"panorama-hallazgos",label:"Tres hallazgos"},{id:"panorama-edad",label:"Edad y sexo"},{id:"panorama-regimen",label:"Régimen y ruptura de 2025"}] },
  { id:"mapa", num:"02", title:"Mapa por departamento", sub:"Tasa de atención, oferta de neuropediatría y acceso en los 33 territorios", open:true,
    subs:[{id:"mapa-coropletico",label:"Mapa interactivo"},{id:"mapa-ranking",label:"Ranking"},{id:"mapa-tabla",label:"Tabla y descarga"}] },
  { id:"tendencia", num:"03", title:"Tendencia 2019-2025", sub:"Evolución de la tasa de personas atendidas y de la desigualdad", open:false,
    subs:[{id:"tendencia-tasa",label:"Tasa por departamento"},{id:"tendencia-indices",label:"Índices de inequidad"}] },
  { id:"oferta", num:"04", title:"Oferta y acceso", sub:"Sedes de neuropediatría, atención fuera del departamento y flujos", open:false,
    subs:[{id:"oferta-dispersion",label:"Oferta vs. atención"},{id:"oferta-flujos",label:"¿Dónde se atienden?"},{id:"oferta-balance",label:"Departamentos receptores"}] },
  { id:"inequidad", num:"05", title:"Medidas de inequidad", sub:"Curvas de Lorenz, índices con IC95 %, Theil regional y modelos", open:false,
    subs:[{id:"inequidad-lorenz",label:"Curvas de Lorenz"},{id:"inequidad-indices",label:"Índices"},{id:"inequidad-theil",label:"Theil por región"},{id:"inequidad-modelos",label:"Modelos y correlaciones"}] },
  { id:"huila", num:"06", title:"Lectura para el Huila", sub:"El departamento sede de UNINAVARRA frente al país", open:false },
  { id:"normativa", num:"07", title:"Marco normativo y de política", sub:"Ley 2628 de 2026, Política Nacional de Salud Mental 2024-2033 y MinSalud", open:false,
    subs:[{id:"normativa-ruta",label:"Del tamizaje al diagnóstico"},{id:"normativa-ley",label:"Ley 2628 de 2026"},{id:"normativa-pnsm",label:"Política de Salud Mental"},{id:"normativa-minsalud",label:"Salud mental en MinSalud"}] },
  { id:"revision", num:"08", title:"Revisión sistemática en curso", sub:"Pregunta PCC, búsqueda y diagrama PRISMA preliminar", open:false },
  { id:"metodologia", num:"09", title:"Metodología y limitaciones", sub:"Fuentes, medidas, reproducibilidad y advertencias de lectura", open:false }
];

function buildAccordion(){
  const acc = document.getElementById("accordion");
  SECTIONS.forEach(s=>{
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
function renderHero(){
  const m = C.meta;
  document.getElementById("hero-title").textContent = m.titulo;
  document.getElementById("hero-lede").textContent = m.subtitulo + ". Explorador interactivo con datos de SISPRO (RIPS), REPS y DANE, y con el marco normativo vigente.";
  document.getElementById("hero-period").textContent = m.corte;
  document.getElementById("byline").innerHTML = "<strong>" + esc(m.autor) + "</strong> · " + esc(m.institucion) + " · " + esc(m.version);
  document.getElementById("wip-text").textContent = C.aviso;
  const g = document.getElementById("stat-grid");
  C.stats.forEach(s=> g.appendChild(el("div",{class:"stat-card"},[
    el("div",{class:"value"},[s.value]), el("div",{class:"label"},[s.label]), el("div",{class:"detail"},[s.detail])
  ])));
}

/* ================================================================= 01 PANORAMA */
function renderPanorama(){
  const body = document.getElementById("body-panorama");
  C.panorama.intro.forEach(p=> body.appendChild(el("p",null,[p])));
  body.appendChild(el("div",{class:"scope-limits"},[ el("p",{class:"scope-text"},[ el("strong",null,["Cómo leer las cifras. "]), C.panorama.lectura ]) ]));

  sub(body, "panorama-hallazgos", "Tres hallazgos del análisis territorial", C.hallazgosNota);
  const hz = el("div",{class:"finding-grid"});
  C.hallazgos.forEach((h,i)=> hz.appendChild(el("article",{class:"finding-card"},[
    el("span",{class:"finding-num"},[String(i+1)]), el("h4",null,[h.t]), el("p",null,[h.d])
  ])));
  body.appendChild(hz);
  body.appendChild(el("div",{class:"tag-row"},[confidenceTag("nota-autor"), confidenceTag("preliminar")]));

  sub(body, "panorama-edad", "Personas atendidas en 2024 por edad y sexo");
  const box = el("div",{class:"two-col"});
  // Edad: barras horizontales
  const ed = C.panorama.edad;
  const w = 360, rowH = 40, h = ed.length*rowH + 16;
  const s = svgEl(w, h, "", "Distribución por grupo de edad");
  const max = 60;
  ed.forEach((e,i)=>{
    const y = 8 + i*rowH, bw = (w-170) * e.pct / max;
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g");
    g.innerHTML = '<text x="0" y="'+(y+22)+'" class="axis-lab">'+esc(e.grupo)+'</text>' +
      '<rect x="110" y="'+(y+6)+'" width="'+(w-170)+'" height="24" rx="5" class="bar-track"/>' +
      '<rect x="110" y="'+(y+6)+'" width="'+bw+'" height="24" rx="5" class="bar-fill'+(e.derivado?' bar-derived':'')+'"/>' +
      '<text x="'+(116+bw)+'" y="'+(y+23)+'" class="bar-val">'+fmt(e.pct,1)+' %</text>';
    bindTip(g, ()=> "<h5>"+esc(e.grupo)+"</h5><p>"+fmt(e.pct,1)+" % de las personas atendidas"+(e.derivado?" (complemento de los otros grupos)":"")+"</p>");
    s.appendChild(g);
  });
  const sx = C.panorama.sexo;
  const sexBox = el("div",{class:"chart-box"},[
    el("h4",{class:"chart-title"},["Sexo"]),
    el("div",{class:"split-bar", role:"img", "aria-label":"Hombres "+fmt(sx.hombres,1)+" %, mujeres "+fmt(sx.mujeres,1)+" %"},[
      el("span",{class:"split-a", style:"width:"+sx.hombres+"%"},["Hombres "+fmt(sx.hombres,1)+" %"]),
      el("span",{class:"split-b", style:"width:"+sx.mujeres+"%"},[fmt(sx.mujeres,1)+" %"])
    ]),
    el("p",{class:"muted small"},["Por cada mujer atendida con F84 se atendieron cerca de 3,2 hombres. La literatura internacional describe una razón hombre:mujer de alrededor de 4 a 1 en la prevalencia."]),
  ]);
  box.appendChild(el("div",{class:"chart-box"},[ el("h4",{class:"chart-title"},["Grupo de edad"]), s ]));
  box.appendChild(sexBox);
  body.appendChild(box);
  body.appendChild(sourceLine(C.panorama.edadNota));

  sub(body, "panorama-regimen", "Régimen de afiliación y ruptura de la serie en 2025",
    "Personas atendidas por régimen, 2024 frente a 2025. El salto del contributivo es un efecto del nuevo esquema de reporte.");
  const rg = C.panorama.regimen;
  const w2 = 560, h2 = 230, pad = { l:56, r:16, t:16, b:40 };
  const s2 = svgEl(w2, h2, "", "Personas por régimen 2024 y 2025");
  const mx = niceMax(Math.max(...rg.map(r=>r.y2025)));
  const ih = h2 - pad.t - pad.b, iw = w2 - pad.l - pad.r;
  let svg = "";
  ticks(mx,4).forEach(t=>{ const y = pad.t + ih - ih*t/mx; svg += '<line x1="'+pad.l+'" x2="'+(w2-pad.r)+'" y1="'+y+'" y2="'+y+'" class="grid"/><text x="'+(pad.l-8)+'" y="'+(y+4)+'" class="axis-lab" text-anchor="end">'+fmt(t)+'</text>'; });
  s2.innerHTML = svg;
  const gw = iw / rg.length;
  rg.forEach((r,i)=>{
    [["2024", r.y2024, "bar-fill"],["2025", r.y2025, "bar-fill bar-alt"]].forEach((b,j)=>{
      const bh = ih * b[1]/mx, x = pad.l + i*gw + gw*0.18 + j*gw*0.33, y = pad.t + ih - bh;
      const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g");
      g.innerHTML = '<rect x="'+x+'" y="'+y+'" width="'+(gw*0.3)+'" height="'+bh+'" rx="4" class="'+b[2]+'"/><text x="'+(x+gw*0.15)+'" y="'+(y-6)+'" class="bar-val" text-anchor="middle">'+fmt(b[1])+'</text>';
      bindTip(g, ()=> "<h5>"+esc(r.nombre)+" · "+b[0]+"</h5><p>"+fmt(b[1])+" registros persona-régimen</p>");
      s2.appendChild(g);
    });
    const t = document.createElementNS(SVGNS,"text"); t.setAttribute("x", pad.l + i*gw + gw/2); t.setAttribute("y", h2-14); t.setAttribute("class","axis-lab strong"); t.setAttribute("text-anchor","middle"); t.textContent = r.nombre; s2.appendChild(t);
  });
  body.appendChild(el("div",{class:"chart-box"},[ legend([["bar-fill","2024 (año de referencia)"],["bar-fill bar-alt","2025 (FEV-RIPS)"]]), s2 ]));
  body.appendChild(sourceLine(C.panorama.regimenNota));
}
function legend(items){
  return el("div",{class:"legend"}, items.map(i=> el("span",{class:"legend-item"},[ el("span",{class:"legend-sw " + i[0]}), i[1] ])));
}

/* ================================================================= 02 MAPA */
const INDICATORS = [
  { id:"tasa24", label:"Personas atendidas /100.000 (2024)", short:"Tasa 2024", dec:1, unit:" por 100.000", nac:97.8 },
  { id:"sedes100k", label:"Sedes de neuropediatría /100.000", short:"Sedes /100.000", dec:2, unit:" por 100.000", nac:1.12 },
  { id:"pctFuera", label:"% de atenciones fuera del departamento", short:"% fuera", dec:1, unit:" %", nac:11.4, worse:true },
  { id:"pctSinSede", label:"% de personas en municipios sin sede", short:"% sin sede", dec:1, unit:" %", nac:19.9, worse:true },
  { id:"atenPorPersona", label:"Atenciones por persona (2024)", short:"Atenciones/persona", dec:1, unit:"", nac:12.1 },
  { id:"ipm", label:"Pobreza multidimensional, IPM 2024 (%)", short:"IPM", dec:1, unit:" %", worse:true },
  { id:"tasa25", label:"Personas atendidas /100.000 (2025, sensibilidad)", short:"Tasa 2025", dec:1, unit:" por 100.000", nac:194.0 }
];
const IND = {}; INDICATORS.forEach(i=> IND[i.id] = i);
function quantileBreaks(vals, k){
  const v = vals.filter(x=> x !== null && !isNaN(x)).sort((a,b)=>a-b);
  const out = [];
  for(let i=1;i<k;i++){ out.push(v[Math.min(v.length-1, Math.floor(i*v.length/k))]); }
  return out;
}
function classOf(v, br){ if(v === null || v === undefined) return -1; let c = 0; while(c < br.length && v >= br[c]) c++; return c; }

function deptCardHTML(d){
  return "<h5>"+esc(d.nombre)+"</h5><p class='tip-region'>"+esc(d.region)+"</p>" +
    "<p>Tasa 2024: <b>"+fmt(d.tasa24,1)+"</b> por 100.000 · "+fmt(d.pers24)+" personas</p>" +
    "<p>Sedes con neuropediatría: <b>"+fmt(d.sedes)+"</b> ("+fmt(d.sedes100k,2)+" /100.000)</p>" +
    "<p>Atenciones fuera del dpto.: <b>"+fmt(d.pctFuera,1)+" %</b> · IPM "+fmt(d.ipm,1)+" %</p>";
}

function renderMapa(){
  const body = document.getElementById("body-mapa");
  body.appendChild(el("p",null,["Elige un indicador para colorear el mapa. Pasa el cursor (o el foco del teclado) sobre un departamento para ver sus cifras y haz clic para fijarlo: la selección se comparte con la tendencia, los flujos y la dispersión."]));
  sub(body, "mapa-coropletico", "Mapa interactivo");
  let ind = "tasa24";
  const picker = chips(INDICATORS.map(i=>({id:i.id,label:i.short})), ind, id=>{ ind = id; paint(); drawRanking(); }, "Indicador del mapa");
  body.appendChild(picker);

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
    bindTip(p, ()=> deptCardHTML(d) + "<p class='tip-ind'>"+esc(IND[ind].label)+": <b>"+fmt(d[ind], IND[ind].dec)+IND[ind].unit+"</b></p>");
    p.addEventListener("click", ()=> selectDept(d.cod));
    p.addEventListener("keydown", e=>{ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); selectDept(d.cod); } });
    svg.appendChild(p); shapes[d.cod] = p;
  });
  mapBox.appendChild(svg);
  const leg = el("div",{class:"map-legend"});
  mapBox.appendChild(leg);
  wrap.appendChild(mapBox);
  const card = el("aside",{class:"dept-card", "aria-live":"polite"});
  wrap.appendChild(card);
  body.appendChild(wrap);
  body.appendChild(sourceLine("Fuente: SISPRO-RIPS (personas y atenciones con F84 como diagnóstico principal), REPS (sedes con servicio 388, corte 13/11/2026) y DANE (población e IPM 2024). Límites departamentales: Marco Geoestadístico Nacional del DANE, simplificados. Colores por sextiles: más oscuro = valor más alto."));

  function paint(){
    const I = IND[ind];
    const vals = DEP.map(d=>d[ind]);
    const br = quantileBreaks(vals, 6);
    DEP.forEach(d=>{
      const c = classOf(d[ind], br);
      shapes[d.cod].setAttribute("class", "dpto " + (c < 0 ? "q-na" : "q"+c) + (STATE.sel === d.cod ? " sel":""));
    });
    leg.innerHTML = "";
    leg.appendChild(el("span",{class:"legend-title"},[I.label]));
    const sorted = vals.filter(v=>v!==null).sort((a,b)=>a-b);
    const edges = [sorted[0]].concat(br).concat([sorted[sorted.length-1]]);
    const row = el("div",{class:"legend-scale"});
    for(let i=0;i<6;i++){
      row.appendChild(el("span",{class:"legend-step"},[ el("span",{class:"legend-sw q"+i}), fmt(edges[i], I.dec) + "–" + fmt(edges[i+1], I.dec) ]));
    }
    leg.appendChild(row);
    if(I.nac !== undefined) leg.appendChild(el("span",{class:"legend-nac"},["Nacional: " + fmt(I.nac, I.dec) + I.unit]));
  }
  function drawCard(cod){
    const d = BY[cod];
    card.innerHTML = "";
    card.appendChild(el("span",{class:"eyebrow-sm"},[d.region]));
    card.appendChild(el("h4",null,[d.nombre]));
    const rows = [
      ["Población 2024", fmt(d.pob)],
      ["Personas atendidas 2024", fmt(d.pers24)],
      ["Tasa por 100.000", fmt(d.tasa24,1) + "  (nacional 97,8)"],
      ["Atenciones por persona", fmt(d.atenPorPersona,1)],
      ["Sedes con neuropediatría", fmt(d.sedes) + (d.sedes ? " · " + fmt(d.sedesTele) + " con telemedicina" : "")],
      ["Sedes por 100.000", fmt(d.sedes100k,2)],
      ["% atenciones fuera del dpto.", fmt(d.pctFuera,1) + " %"],
      ["% personas en municipios sin sede", fmt(d.pctSinSede,1) + " %"],
      ["IPM 2024", fmt(d.ipm,1) + " %"],
      ["Personas atendidas 2025", fmt(d.pers25) + " (" + fmt(d.tasa25,1) + " /100.000)"]
    ];
    const dl = el("dl",{class:"kv"});
    rows.forEach(r=>{ dl.appendChild(el("dt",null,[r[0]])); dl.appendChild(el("dd",null,[r[1]])); });
    card.appendChild(dl);
    const rank = DEP.slice().sort((a,b)=> b.tasa24 - a.tasa24).findIndex(x=>x.cod===cod) + 1;
    card.appendChild(el("p",{class:"muted small"},["Puesto " + rank + " de 33 por tasa de personas atendidas en 2024."]));
    if(d.sedes === 0) card.appendChild(callout("Sin sedes con neuropediatría habilitadas en el REPS.", "callout-warn"));
    if(d.pers24 < 30) card.appendChild(el("p",{class:"muted small"},["Conteo pequeño: interpretar la tasa con cautela."]));
  }
  onSelect(cod=>{ paint(); drawCard(cod); highlightRanking(); });

  sub(body, "mapa-ranking", "Ranking de departamentos", "Ordenado por el indicador elegido arriba. Filtra por región; la línea punteada marca el valor nacional.");
  let reg = "todas";
  body.appendChild(chips([{id:"todas",label:"Todas"}].concat(REGION_ORDER.map(r=>({id:r,label:r}))), reg, id=>{ reg = id; drawRanking(); }, "Región"));
  const rankBox = el("div",{class:"chart-box"});
  body.appendChild(rankBox);
  body.appendChild(legend(REGION_ORDER.map(r=>["rg-sw "+REGION_CLASS[r], r])));
  let rankBars = {};
  function drawRanking(){
    const I = IND[ind];
    const list = DEP.filter(d=> reg === "todas" || d.region === reg).filter(d=> d[ind] !== null).sort((a,b)=> b[ind]-a[ind]);
    const w = 640, rowH = 22, pad = { l:150, r:58, t:22, b:8 }, h = pad.t + list.length*rowH + pad.b;
    const mx = niceMax(Math.max(...list.map(d=>d[ind]), I.nac || 0));
    const iw = w - pad.l - pad.r;
    const s = svgEl(w, h, "rank-svg", "Ranking por " + I.label);
    let bg = "";
    ticks(mx,4).forEach(t=>{ const x = pad.l + iw*t/mx; bg += '<line x1="'+x+'" x2="'+x+'" y1="'+(pad.t-6)+'" y2="'+(h-pad.b)+'" class="grid"/><text x="'+x+'" y="'+(pad.t-10)+'" class="axis-lab" text-anchor="middle">'+fmt(t, mx<10?1:0)+'</text>'; });
    s.innerHTML = bg;
    rankBars = {};
    list.forEach((d,i)=>{
      const y = pad.t + i*rowH, bw = iw * d[ind]/mx;
      const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g rank-row" + (STATE.sel===d.cod?" sel":"")); g.setAttribute("role","button"); g.setAttribute("aria-label", d.nombre + ": " + fmt(d[ind],I.dec) + I.unit);
      g.innerHTML = '<rect x="0" y="'+y+'" width="'+w+'" height="'+rowH+'" class="row-hit"/>' +
        '<text x="'+(pad.l-8)+'" y="'+(y+15)+'" class="axis-lab" text-anchor="end">'+esc(d.nombre)+'</text>' +
        '<rect x="'+pad.l+'" y="'+(y+4)+'" width="'+Math.max(bw,1)+'" height="'+(rowH-8)+'" rx="3" class="rg-bar '+REGION_CLASS[d.region]+'"/>' +
        '<text x="'+(pad.l+bw+5)+'" y="'+(y+15)+'" class="bar-val">'+fmt(d[ind], I.dec)+'</text>';
      bindTip(g, ()=> deptCardHTML(d));
      g.addEventListener("click", ()=> selectDept(d.cod));
      g.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); selectDept(d.cod); } });
      s.appendChild(g); rankBars[d.cod] = g;
    });
    if(I.nac !== undefined && I.nac <= mx){
      const x = pad.l + iw*I.nac/mx;
      const ln = document.createElementNS(SVGNS,"g");
      ln.innerHTML = '<line x1="'+x+'" x2="'+x+'" y1="'+(pad.t-4)+'" y2="'+(h-pad.b)+'" class="ref-line"/>';
      s.appendChild(ln);
    }
    rankBox.innerHTML = ""; rankBox.appendChild(s);
  }
  function highlightRanking(){ Object.keys(rankBars).forEach(c=> rankBars[c].classList.toggle("sel", c === STATE.sel)); }

  sub(body, "mapa-tabla", "Tabla por departamento y descarga");
  body.appendChild(dataTable());

  paint(); drawCard(STATE.sel); drawRanking();
}

function dataTable(){
  const cols = [
    ["cod","Cód."],["nombre","Departamento"],["region","Región"],["pob","Población 2024"],["ipm","IPM %"],
    ["pers24","Personas 2024"],["tasa24","Tasa 2024"],["aten24","Atenciones 2024"],["atenPorPersona","Aten./persona"],
    ["sedes","Sedes neuroped."],["sedes100k","Sedes/100.000"],["pctFuera","% fuera"],["pctSinSede","% sin sede"],["pers25","Personas 2025"],["tasa25","Tasa 2025"]
  ];
  const dec = { ipm:1, tasa24:1, atenPorPersona:1, sedes100k:2, pctFuera:1, pctSinSede:1, tasa25:1 };
  let sortKey = "tasa24", asc = false;
  const wrap = el("div",{class:"data-table-toggle-wrap"});
  const btn = el("button",{class:"data-table-toggle", type:"button", "aria-expanded":"false"},["Ver la tabla completa (33 territorios) ", el("span",{class:"chev", html:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'})]);
  const panel = el("div",{class:"data-table-panel", hidden:""});
  const dl = el("button",{class:"csv-download", type:"button"},["Descargar CSV"]);
  dl.addEventListener("click", ()=> downloadCSV("tea_colombia_departamentos_2024.csv", cols.map(c=>c[1]), DEP.map(d=> cols.map(c=> d[c[0]]))));
  panel.appendChild(el("div",{class:"data-table-actions"},[dl]));
  panel.appendChild(el("p",{class:"data-table-note"},["Haz clic en un encabezado para ordenar. Tasas por 100.000 habitantes (población DANE 2024). % fuera: atenciones de residentes prestadas en IPS de otro departamento. % sin sede: personas atendidas que viven en municipios sin sede con neuropediatría."]));
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

/* ================================================================= 03 TENDENCIA */
const YEARS = [2019,2020,2021,2022,2023,2024,2025];
function renderTendencia(){
  const body = document.getElementById("body-tendencia");
  body.appendChild(el("p",null,["Entre 2019 y 2024 el número de personas atendidas con F84 pasó de 23.030 a 51.474 y la tasa nacional de 43,8 a 97,8 por 100.000 habitantes. El salto de 2025 (194,0) coincide con el cambio de reporte a la factura electrónica y no se interpreta como un aumento de la prevalencia."]));
  sub(body, "tendencia-tasa", "Tasa de personas atendidas por departamento, 2019-2025", "Cada línea fina es un departamento; la línea gruesa es el total nacional. Elige un departamento para resaltarlo.");
  let reg = "todas", show25 = true;
  const ctr = el("div",{class:"control-row"});
  ctr.appendChild(deptSelect("sel-tendencia", "Resaltar", cod=> selectDept(cod)));
  const t25 = el("label",{class:"check"},[ el("input",{type:"checkbox", checked:"", id:"chk-2025"}), " Incluir 2025 (ruptura de serie)" ]);
  t25.querySelector("input").addEventListener("change", e=>{ show25 = e.target.checked; draw(); });
  ctr.appendChild(t25);
  body.appendChild(ctr);
  body.appendChild(chips([{id:"todas",label:"Todas las regiones"}].concat(REGION_ORDER.map(r=>({id:r,label:r}))), reg, id=>{ reg = id; draw(); }, "Región"));
  const box = el("div",{class:"chart-box"});
  body.appendChild(box);
  const note = el("p",{class:"chart-readout", "aria-live":"polite"});
  body.appendChild(note);
  body.appendChild(sourceLine(C.serieNota + " Fuente: SISPRO-RIPS; DANE."));

  function rate(d,i){ return d.serie[i] / d.pob * 1e5; }
  function draw(){
    const yrs = show25 ? YEARS : YEARS.slice(0,6);
    const n = yrs.length;
    const list = DEP.filter(d=> reg === "todas" || d.region === reg || d.cod === STATE.sel);
    const mxv = Math.max(...list.map(d=> Math.max(...d.serie.slice(0,n).map((v,i)=> rate(d,i)))), ...C.serieNacional.slice(0,n).map(s=>s.tasa));
    const mx = niceMax(mxv);
    const w = 680, h = 340, pad = { l:52, r:110, t:14, b:32 }, iw = w-pad.l-pad.r, ih = h-pad.t-pad.b;
    const X = i => pad.l + iw * i/(n-1), Y = v => pad.t + ih - ih*v/mx;
    const s = svgEl(w, h, "line-svg", "Serie de tasas por departamento");
    let g = "";
    if(show25){ g += '<rect x="'+((X(4.999)+X(5))/2 + (X(6)-X(5))/2)+'" y="'+pad.t+'" width="'+((X(6)-X(5))/2+4)+'" height="'+ih+'" class="break-band"/><text x="'+(X(6)-4)+'" y="'+(pad.t+12)+'" class="axis-lab" text-anchor="end">FEV-RIPS</text>'; }
    ticks(mx,5).forEach(t=>{ g += '<line x1="'+pad.l+'" x2="'+(w-pad.r)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" class="grid"/><text x="'+(pad.l-8)+'" y="'+(Y(t)+4)+'" class="axis-lab" text-anchor="end">'+fmt(t)+'</text>'; });
    yrs.forEach((y,i)=>{ g += '<text x="'+X(i)+'" y="'+(h-10)+'" class="axis-lab" text-anchor="middle">'+y+'</text>'; });
    s.innerHTML = g;
    const sel = BY[STATE.sel];
    list.forEach(d=>{
      if(d.cod === STATE.sel) return;
      const p = document.createElementNS(SVGNS,"path");
      p.setAttribute("d", d.serie.slice(0,n).map((v,i)=> (i?"L":"M") + X(i).toFixed(1) + "," + Y(rate(d,i)).toFixed(1)).join(""));
      p.setAttribute("class","spag " + REGION_CLASS[d.region]);
      p.setAttribute("tabindex","0");
      bindTip(p, ()=> "<h5>"+esc(d.nombre)+"</h5><p>"+yrs.map((y,i)=> y+": "+fmt(rate(d,i),1)).join("<br>")+"</p><p class='muted'>Clic para resaltar</p>");
      p.addEventListener("click", ()=> selectDept(d.cod));
      s.appendChild(p);
    });
    const nat = document.createElementNS(SVGNS,"g");
    nat.innerHTML = '<path d="'+C.serieNacional.slice(0,n).map((v,i)=> (i?"L":"M")+X(i)+","+Y(v.tasa)).join("")+'" class="nat-line"/>' +
      '<text x="'+(X(n-1)+6)+'" y="'+(Y(C.serieNacional[n-1].tasa)+4)+'" class="line-lab strong">Nacional</text>';
    s.appendChild(nat);
    const hl = document.createElementNS(SVGNS,"g");
    let pts = "";
    sel.serie.slice(0,n).forEach((v,i)=>{ pts += '<circle cx="'+X(i)+'" cy="'+Y(rate(sel,i))+'" r="3.6" class="sel-dot"/>'; });
    hl.innerHTML = '<path d="'+sel.serie.slice(0,n).map((v,i)=> (i?"L":"M")+X(i)+","+Y(rate(sel,i))).join("")+'" class="sel-line"/>' + pts +
      '<text x="'+(X(n-1)+6)+'" y="'+(Y(rate(sel,n-1))+4)+'" class="line-lab sel-lab">'+esc(sel.nombre)+'</text>';
    s.appendChild(hl);
    // eje de lectura por año
    yrs.forEach((y,i)=>{
      const hit = document.createElementNS(SVGNS,"rect");
      hit.setAttribute("x", X(i) - iw/(n-1)/2); hit.setAttribute("y", pad.t); hit.setAttribute("width", iw/(n-1)); hit.setAttribute("height", ih); hit.setAttribute("class","col-hit");
      bindTip(hit, ()=> "<h5>"+y+"</h5><p>Nacional: <b>"+fmt(C.serieNacional[i].tasa,1)+"</b> ("+fmt(C.serieNacional[i].personas)+" personas)</p><p>"+esc(sel.nombre)+": <b>"+fmt(rate(sel,i),1)+"</b> ("+fmt(sel.serie[i])+" personas)</p>");
      s.insertBefore(hit, s.firstChild.nextSibling);
    });
    box.innerHTML = ""; box.appendChild(s);
    const a = sel.serie[0], b = sel.serie[5];
    note.textContent = sel.nombre + ": " + fmt(a) + " personas atendidas en 2019 y " + fmt(b) + " en 2024 (" + fmt(rate(sel,0),1) + " → " + fmt(rate(sel,5),1) + " por 100.000)" + (show25 ? "; " + fmt(sel.serie[6]) + " en 2025." : ".");
  }
  onSelect(draw);
  draw();

  sub(body, "tendencia-indices", "Evolución de la desigualdad entre departamentos", "Gini y Theil de las personas atendidas e índice de concentración según el IPM (positivo = más tasa en los departamentos menos pobres).");
  const idxBox = el("div",{class:"small-multiples"});
  [["gini","Gini",0.35],["theil","Theil T",0.2],["ci","Índice de concentración (IPM)",0.12]].forEach(m=>{
    const w = 300, h = 170, pad = { l:40, r:12, t:12, b:26 }, iw = w-pad.l-pad.r, ih = h-pad.t-pad.b;
    const ser = C.serieNacional;
    const X = i => pad.l + iw*i/6, Y = v => pad.t + ih - ih*v/m[2];
    const s = svgEl(w, h, "", m[1] + " 2019-2025");
    let g = '<rect x="'+(X(5.5))+'" y="'+pad.t+'" width="'+(X(6)-X(5.5)+6)+'" height="'+ih+'" class="break-band"/>';
    ticks(m[2],4).forEach(t=>{ g += '<line x1="'+pad.l+'" x2="'+(w-pad.r)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" class="grid"/><text x="'+(pad.l-6)+'" y="'+(Y(t)+4)+'" class="axis-lab" text-anchor="end">'+fmt(t,2)+'</text>'; });
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
  body.appendChild(el("p",null,["El Gini se mantuvo entre 0,240 y 0,290 sin una tendencia clara (mínimo en 2024), mientras que el índice de concentración bajó de +0,092 (2019) y +0,101 (2020) a +0,032-0,044 en 2022-2024: la mayor concentración inicial de la atención en los departamentos menos pobres se atenuó."]));
}

/* ================================================================= 04 OFERTA */
function renderOferta(){
  const body = document.getElementById("body-oferta");
  body.appendChild(el("p",null,["Según el REPS (corte 13/11/2026) hay 590 sedes con neuropediatría habilitada en el país (1,12 por 100.000 habitantes): el 15,9 % ofrece telemedicina y el 5,6 % es de naturaleza pública. Amazonas, Guainía, Vaupés y Vichada no tienen ninguna. Hay 966 municipios con personas atendidas y solo 115 con alguna sede."]));

  sub(body, "oferta-dispersion", "Oferta de neuropediatría frente a la tasa de atención", "Cada burbuja es un departamento (tamaño = población; color = IPM). Correlación de Spearman ρ = 0,65 (p < 0,001).");
  const w = 680, h = 400, pad = { l:56, r:20, t:16, b:44 }, iw = w-pad.l-pad.r, ih = h-pad.t-pad.b;
  const mxX = 6, mxY = 250;
  const X = v => pad.l + iw*v/mxX, Y = v => pad.t + ih - ih*v/mxY;
  const s = svgEl(w, h, "scatter-svg", "Dispersión de sedes por 100.000 y tasa de personas atendidas");
  let g = "";
  ticks(mxY,5).forEach(t=>{ g += '<line x1="'+pad.l+'" x2="'+(w-pad.r)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" class="grid"/><text x="'+(pad.l-8)+'" y="'+(Y(t)+4)+'" class="axis-lab" text-anchor="end">'+fmt(t)+'</text>'; });
  ticks(mxX,6).forEach(t=>{ g += '<line x1="'+X(t)+'" x2="'+X(t)+'" y1="'+pad.t+'" y2="'+(h-pad.b)+'" class="grid"/><text x="'+X(t)+'" y="'+(h-pad.b+16)+'" class="axis-lab" text-anchor="middle">'+fmt(t)+'</text>'; });
  g += '<text x="'+(pad.l+iw/2)+'" y="'+(h-6)+'" class="axis-title" text-anchor="middle">Sedes con neuropediatría por 100.000 habitantes</text>';
  g += '<text transform="translate(14,'+(pad.t+ih/2)+') rotate(-90)" class="axis-title" text-anchor="middle">Personas atendidas por 100.000 (2024)</text>';
  g += '<line x1="'+pad.l+'" x2="'+(w-pad.r)+'" y1="'+Y(97.8)+'" y2="'+Y(97.8)+'" class="ref-line"/><text x="'+(w-pad.r-4)+'" y="'+(Y(97.8)-5)+'" class="axis-lab" text-anchor="end">Nacional 97,8</text>';
  s.innerHTML = g;
  const ipmBr = [10, 15, 20, 30];
  const dots = {};
  DEP.slice().sort((a,b)=> b.pob-a.pob).forEach(d=>{
    const r = 4 + 18*Math.sqrt(d.pob/7918660);
    const c = document.createElementNS(SVGNS,"circle");
    c.setAttribute("cx", X(d.sedes100k)); c.setAttribute("cy", Y(d.tasa24)); c.setAttribute("r", r);
    c.setAttribute("class","bub ipm" + classOf(d.ipm, ipmBr)); c.setAttribute("tabindex","0"); c.setAttribute("role","button"); c.setAttribute("aria-label", d.nombre);
    bindTip(c, ()=> deptCardHTML(d));
    c.addEventListener("click", ()=> selectDept(d.cod));
    c.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); selectDept(d.cod); } });
    s.appendChild(c); dots[d.cod] = c;
    if(["08","13","11","70","95","99","94"].includes(d.cod)){
      const t = document.createElementNS(SVGNS,"text"); t.setAttribute("x", X(d.sedes100k)+r+3); t.setAttribute("y", Y(d.tasa24)+4); t.setAttribute("class","pt-lab"); t.textContent = d.nombre.replace(" D.C.",""); s.appendChild(t);
    }
  });
  const selLab = document.createElementNS(SVGNS,"text"); selLab.setAttribute("class","pt-lab sel-pt-lab");
  s.appendChild(selLab);
  function hl(){
    Object.keys(dots).forEach(k=> dots[k].classList.toggle("sel", k===STATE.sel));
    const d = BY[STATE.sel], c = dots[STATE.sel];
    selLab.setAttribute("x", +c.getAttribute("cx") + +c.getAttribute("r") + 4); selLab.setAttribute("y", +c.getAttribute("cy") - 6);
    selLab.textContent = ["08","13","11","70","95","99","94"].includes(d.cod) ? "" : d.nombre;
  }
  onSelect(hl); hl();
  body.appendChild(el("div",{class:"chart-box"},[
    legend([["bub-sw ipm0","IPM < 10 %"],["bub-sw ipm1","10–15 %"],["bub-sw ipm2","15–20 %"],["bub-sw ipm3","20–30 %"],["bub-sw ipm4","≥ 30 %"]]), s ]));
  body.appendChild(sourceLine("Fuente: SISPRO-RIPS 2024; REPS 13/11/2026; DANE. Sedes REPS = habilitación, no capacidad ni tiempos de espera."));

  sub(body, "oferta-flujos", "¿Dónde se atienden los residentes de cada departamento?", "Atenciones de 2024 según el departamento de la IPS. Elige un departamento de residencia.");
  const ctr = el("div",{class:"control-row"});
  ctr.appendChild(deptSelect("sel-flujos", "Residentes de", cod=> selectDept(cod)));
  body.appendChild(ctr);
  const fbox = el("div",{class:"chart-box"});
  body.appendChild(fbox);
  const fnote = el("p",{class:"chart-readout", "aria-live":"polite"});
  body.appendChild(fnote);
  function drawFlows(){
    fbox.innerHTML = ""; fbox.appendChild(flowChart(STATE.sel));
    const d = BY[STATE.sel], row = D.flujos[d.cod], tot = d.aten24;
    const dest = Object.keys(row).filter(k=> k!==d.cod && k!=="-1").sort((a,b)=> row[b]-row[a]);
    fnote.textContent = d.nombre + ": " + fmt(d.pctFuera,1) + " % de " + fmt(tot) + " atenciones se prestó fuera del departamento" + (dest.length ? "; el principal destino fue " + BY[dest[0]].nombre + " (" + fmt(row[dest[0]]) + ")." : ".");
  }
  onSelect(drawFlows); drawFlows();
  body.appendChild(sourceLine("Fuente: SISPRO-RIPS 2024, matriz residencia × departamento de la IPS. \"Sin dato del prestador\" corresponde a la columna -1 del cubo. La atención fuera del departamento puede reflejar falta de oferta local, remisión a mayor complejidad o cercanía geográfica; los datos no permiten distinguirlo."));

  sub(body, "oferta-balance", "Departamentos receptores y emisores", "Saldo neto = atenciones prestadas por las IPS del departamento (a residentes de cualquier lugar) menos atenciones recibidas por sus residentes (en cualquier lugar).");
  body.appendChild(balanceChart());
  body.appendChild(el("p",null,["Las IPS de Bogotá D.C. prestaron 20.703 atenciones más que las recibidas por sus residentes, y el 29 % de las atenciones que prestaron fue para personas de otros departamentos o con residencia desconocida."]));
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

/* ================================================================= 05 INEQUIDAD */
function lorenz(key){
  const arr = DEP.map(d=>({ h:d[key], w:d.pob })).sort((a,b)=> (a.h/a.w)-(b.h/b.w));
  const H = arr.reduce((s,x)=>s+x.h,0), W = arr.reduce((s,x)=>s+x.w,0);
  const pts = [[0,0]]; let ch = 0, cw = 0;
  arr.forEach(x=>{ ch += x.h; cw += x.w; pts.push([cw/W, ch/H]); });
  let area = 0; for(let i=1;i<pts.length;i++) area += (pts[i][0]-pts[i-1][0])*(pts[i][1]+pts[i-1][1]);
  return { pts:pts, gini: 1-area };
}
function renderInequidad(){
  const body = document.getElementById("body-inequidad");
  body.appendChild(el("p",null,["La distribución de las personas atendidas fue moderadamente desigual respecto de la población (Gini 0,240), la de las atenciones fue más desigual (Gini 0,486) y la de las sedes, intermedia (Gini 0,381). Todas las medidas se ponderan por población."]));

  sub(body, "inequidad-lorenz", "Curvas de Lorenz", "Población acumulada (departamentos ordenados de menor a mayor tasa) frente al porcentaje acumulado de cada indicador. Cuanto más se aleja de la diagonal, más desigual. Activa o desactiva cada curva.");
  const series = [ { key:"pers24", lab:"Personas atendidas", cls:"lz-a", on:true }, { key:"aten24", lab:"Atenciones", cls:"lz-b", on:true }, { key:"sedes", lab:"Sedes de neuropediatría", cls:"lz-c", on:true } ];
  series.forEach(sr=> sr.L = lorenz(sr.key));
  const toggles = el("div",{class:"filter-row"});
  series.forEach(sr=>{
    const b = el("button",{class:"filter-chip active "+sr.cls+"-chip", type:"button", "aria-pressed":"true"},[sr.lab + " · Gini " + fmt(sr.L.gini,3)]);
    b.addEventListener("click", ()=>{ sr.on = !sr.on; b.classList.toggle("active", sr.on); b.setAttribute("aria-pressed", sr.on?"true":"false"); drawL(); });
    toggles.appendChild(b);
  });
  body.appendChild(toggles);
  const lbox = el("div",{class:"chart-box lorenz-box"});
  body.appendChild(lbox);
  function drawL(){
    const S = 380, pad = 44, iw = S - pad - 14;
    const X = v => pad + iw*v, Y = v => 14 + iw - iw*v;
    const s = svgEl(S, S, "lorenz-svg", "Curvas de Lorenz");
    let g = '';
    [0,.25,.5,.75,1].forEach(t=>{ g += '<line x1="'+X(t)+'" x2="'+X(t)+'" y1="14" y2="'+Y(0)+'" class="grid"/><line x1="'+X(0)+'" x2="'+X(1)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" class="grid"/><text x="'+X(t)+'" y="'+(Y(0)+16)+'" class="axis-lab" text-anchor="middle">'+(t*100)+'%</text><text x="'+(pad-6)+'" y="'+(Y(t)+4)+'" class="axis-lab" text-anchor="end">'+(t*100)+'%</text>'; });
    g += '<line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(1)+'" y2="'+Y(1)+'" class="eq-line"/>';
    g += '<text x="'+(X(.5))+'" y="'+(S-4)+'" class="axis-title" text-anchor="middle">Población acumulada</text>';
    s.innerHTML = g;
    series.filter(sr=>sr.on).forEach(sr=>{
      const p = document.createElementNS(SVGNS,"path");
      p.setAttribute("d", sr.L.pts.map((q,i)=> (i?"L":"M")+X(q[0]).toFixed(1)+","+Y(q[1]).toFixed(1)).join(""));
      p.setAttribute("class","lz " + sr.cls); p.setAttribute("tabindex","0");
      bindTip(p, ()=> "<h5>"+esc(sr.lab)+"</h5><p>Gini (curva) "+fmt(sr.L.gini,3)+"</p>");
      s.appendChild(p);
    });
    lbox.innerHTML = ""; lbox.appendChild(s);
  }
  drawL();
  body.appendChild(sourceLine("Curvas calculadas en el navegador a partir de la tabla por departamento; reproducen los Gini del libro de cálculo (0,240; 0,486; 0,381)."));

  sub(body, "inequidad-indices", "Índices de inequidad con intervalos de confianza", "Elige la medida. Los bigotes son IC95 % por bootstrap de departamentos (4.000 réplicas).");
  let mm = "gini";
  body.appendChild(chips([{id:"gini",label:"Gini"},{id:"theil",label:"Theil T"},{id:"ci",label:"Índice de concentración (IPM)"}], mm, id=>{ mm = id; drawIdx(); }, "Medida"));
  const ibox = el("div",{class:"chart-box"});
  body.appendChild(ibox);
  function drawIdx(){
    const rows = C.indices;
    const lo = mm === "ci" ? -0.4 : 0, hi = mm === "ci" ? 0.3 : (mm === "gini" ? 0.7 : 0.7);
    const w = 640, rowH = 40, pad = { l:190, r:30, t:26, b:10 }, h = pad.t + rows.length*rowH + pad.b, iw = w-pad.l-pad.r;
    const X = v => pad.l + iw*(v-lo)/(hi-lo);
    const s = svgEl(w, h, "", "Índices de inequidad");
    let g = "";
    const step = mm === "ci" ? 0.1 : 0.1;
    for(let t=lo; t<=hi+1e-9; t+=step){ g += '<line x1="'+X(t)+'" x2="'+X(t)+'" y1="'+(pad.t-6)+'" y2="'+(h-pad.b)+'" class="grid'+(Math.abs(t)<1e-9?' zero':'')+'"/><text x="'+X(t)+'" y="'+(pad.t-10)+'" class="axis-lab" text-anchor="middle">'+fmt(t,1)+'</text>'; }
    s.innerHTML = g;
    rows.forEach((r,i)=>{
      const v = r[mm], ic = r[mm+"IC"], y = pad.t + i*rowH + rowH/2;
      const gg = document.createElementNS(SVGNS,"g"); gg.setAttribute("tabindex","0"); gg.setAttribute("class","bar-g");
      gg.innerHTML = '<text x="'+(pad.l-10)+'" y="'+(y+4)+'" class="axis-lab" text-anchor="end">'+esc(r.indicador)+'</text>' +
        '<line x1="'+X(ic[0])+'" x2="'+X(ic[1])+'" y1="'+y+'" y2="'+y+'" class="ci-line"/>' +
        '<line x1="'+X(ic[0])+'" x2="'+X(ic[0])+'" y1="'+(y-6)+'" y2="'+(y+6)+'" class="ci-line"/><line x1="'+X(ic[1])+'" x2="'+X(ic[1])+'" y1="'+(y-6)+'" y2="'+(y+6)+'" class="ci-line"/>' +
        '<circle cx="'+X(v)+'" cy="'+y+'" r="6" class="pt'+(i===3?' pt-alt':'')+'"/>';
      bindTip(gg, ()=> "<h5>"+esc(r.indicador)+"</h5><p>Gini "+fmt(r.gini,3)+" ("+fmt(r.giniIC[0],3)+" a "+fmt(r.giniIC[1],3)+")<br>Theil "+fmt(r.theil,3)+" ("+fmt(r.theilIC[0],3)+" a "+fmt(r.theilIC[1],3)+")<br>MLD "+(r.mld===null?"n.d.":fmt(r.mld,3))+"<br>CI (IPM) "+fmt(r.ci,3)+" ("+fmt(r.ciIC[0],3)+" a "+fmt(r.ciIC[1],3)+")</p>");
      s.appendChild(gg);
    });
    ibox.innerHTML = ""; ibox.appendChild(s);
  }
  drawIdx();
  body.appendChild(sourceLine(C.indicesNota));
  body.appendChild(el("p",null,["El único índice de concentración con IC que excluye el cero es el de las sedes (−0,190): hay relativamente más sedes por habitante en departamentos más pobres, coherente con la mayor oferta por habitante que se observa en departamentos del Caribe."]));
  const om = el("dl",{class:"kv kv-wide"});
  C.otrasMedidas.forEach(o=>{ om.appendChild(el("dt",null,[o.k])); om.appendChild(el("dd",null,[o.v])); });
  body.appendChild(el("div",{class:"card"},[ el("h4",null,["Otras medidas de distribución (personas atendidas 2024)"]), om ]));

  sub(body, "inequidad-theil", "Descomposición del Theil por región", "El 37,4 % de la desigualdad se explica por diferencias entre regiones y el 62,6 % por diferencias entre departamentos de una misma región.");
  const T = C.theilRegional;
  const tb = el("div",{class:"chart-box"});
  tb.appendChild(el("div",{class:"split-bar", role:"img", "aria-label":"Theil entre regiones 37,4 %, dentro de regiones 62,6 %"},[
    el("span",{class:"split-a", style:"width:"+T.pctEntre+"%"},["Entre regiones " + fmt(T.pctEntre,1) + " %"]),
    el("span",{class:"split-b", style:"width:"+(100-T.pctEntre)+"%"},["Dentro de las regiones " + fmt(100-T.pctEntre,1) + " %"])
  ]));
  const rw = 640, rr = T.regiones, rH = 30, rpad = { l:160, r:120, t:10 }, rh = rpad.t + rr.length*rH + 6, riw = rw - rpad.l - rpad.r;
  const rs = svgEl(rw, rh, "", "Tasa y sedes por región");
  rr.forEach((x,i)=>{
    const y = rpad.t + i*rH, bw = riw * x.tasa/150;
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g");
    g.innerHTML = '<text x="'+(rpad.l-8)+'" y="'+(y+19)+'" class="axis-lab" text-anchor="end">'+esc(x.region)+'</text><rect x="'+rpad.l+'" y="'+(y+5)+'" width="'+bw+'" height="'+(rH-10)+'" rx="4" class="rg-bar '+REGION_CLASS[x.region]+'"/><text x="'+(rpad.l+bw+6)+'" y="'+(y+19)+'" class="bar-val">'+fmt(x.tasa,1)+' /100.000 · '+fmt(x.sedes100k,2)+' sedes</text>';
    bindTip(g, ()=> "<h5>"+esc(x.region)+"</h5><p>Población "+fmt(x.pob)+"<br>Personas atendidas "+fmt(x.personas)+" ("+fmt(x.tasa,1)+" /100.000)<br>Sedes "+fmt(x.sedes)+" ("+fmt(x.sedes100k,2)+" /100.000)</p>");
    rs.appendChild(g);
  });
  tb.appendChild(rs);
  body.appendChild(tb);
  body.appendChild(sourceLine("Theil T total 0,100 = 0,038 entre regiones + 0,063 dentro de regiones. Un análisis solo regional ocultaría la mayor parte de la heterogeneidad."));

  sub(body, "inequidad-modelos", "Modelos ecológicos y correlaciones", "Regresión cuasi-Poisson de las personas atendidas en 2024 con offset del logaritmo de la población (n = 33). RR > 1: más atención.");
  const ms = C.modelos;
  const fw = 640, fH = 34, fpad = { l:250, r:110, t:24, b:10 }, fh = fpad.t + ms.length*fH + fpad.b, fiw = fw - fpad.l - fpad.r;
  const lmin = Math.log(0.4), lmax = Math.log(2);
  const FX = v => fpad.l + fiw*(Math.log(v)-lmin)/(lmax-lmin);
  const fs = svgEl(fw, fh, "", "Razones de tasas del modelo cuasi-Poisson");
  let fg = "";
  [0.5,0.75,1,1.5,2].forEach(t=>{ fg += '<line x1="'+FX(t)+'" x2="'+FX(t)+'" y1="'+(fpad.t-6)+'" y2="'+(fh-fpad.b)+'" class="grid'+(t===1?' zero':'')+'"/><text x="'+FX(t)+'" y="'+(fpad.t-10)+'" class="axis-lab" text-anchor="middle">'+fmt(t,2)+'</text>'; });
  fs.innerHTML = fg;
  ms.forEach((m,i)=>{
    const y = fpad.t + i*fH + fH/2;
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g");
    g.innerHTML = '<text x="'+(fpad.l-10)+'" y="'+(y+4)+'" class="axis-lab" text-anchor="end">'+esc(m.modelo+". "+m.var)+'</text><line x1="'+FX(m.lo)+'" x2="'+FX(m.hi)+'" y1="'+y+'" y2="'+y+'" class="ci-line"/><rect x="'+(FX(m.rr)-5)+'" y="'+(y-5)+'" width="10" height="10" class="pt-sq"/><text x="'+(fw-fpad.r+8)+'" y="'+(y+4)+'" class="bar-val">'+fmt(m.rr,2)+' ('+fmt(m.lo,2)+'–'+fmt(m.hi,2)+')</text>';
    bindTip(g, ()=> "<h5>"+esc(m.var)+"</h5><p>RR "+fmt(m.rr,2)+" · IC95 % "+fmt(m.lo,2)+" a "+fmt(m.hi,2)+" · p "+m.p+"</p>");
    fs.appendChild(g);
  });
  body.appendChild(el("div",{class:"chart-box"},[fs]));
  body.appendChild(sourceLine("Modelo A: IPM y sedes. Modelo B: además una indicadora de Bogotá D.C. " + C.modelosNota));

  const cw = 640, cr = C.correlaciones, cH = 28, cpad = { l:330, r:60, t:8 }, ch = cpad.t + cr.length*cH + 6, ciw = cw - cpad.l - cpad.r, cx0 = cpad.l + ciw/2;
  const cs = svgEl(cw, ch, "", "Correlaciones de Spearman");
  cs.innerHTML = '<line x1="'+cx0+'" x2="'+cx0+'" y1="'+cpad.t+'" y2="'+ch+'" class="axis"/>';
  cr.forEach((c,i)=>{
    const y = cpad.t + i*cH, bw = (ciw/2) * Math.abs(c.rho), pos = c.rho >= 0;
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g");
    g.innerHTML = '<text x="'+(cpad.l-10)+'" y="'+(y+18)+'" class="axis-lab" text-anchor="end">'+esc(c.par)+'</text><rect x="'+(pos?cx0:cx0-bw)+'" y="'+(y+6)+'" width="'+Math.max(bw,1)+'" height="'+(cH-12)+'" rx="3" class="'+(pos?"net-pos":"net-neg")+'"/><text x="'+(pos?cx0+bw+5:cx0-bw-5)+'" y="'+(y+18)+'" class="bar-val" text-anchor="'+(pos?"start":"end")+'">'+fmt(c.rho,2)+'</text>';
    bindTip(g, ()=> "<h5>"+esc(c.par)+"</h5><p>ρ de Spearman "+fmt(c.rho,3)+" · p "+c.p+"</p>");
    cs.appendChild(g);
  });
  body.appendChild(el("div",{class:"chart-box"},[ el("h4",{class:"chart-title"},["Correlaciones de Spearman entre departamentos (n = 33)"]), cs ]));
  body.appendChild(el("div",{class:"tag-row"},[confidenceTag("preliminar")]));
}

/* ================================================================= 06 HUILA */
function renderHuila(){
  const body = document.getElementById("body-huila");
  const h = BY["41"];
  C.huila.texto.forEach(p=> body.appendChild(el("p",null,[p])));
  const comp = [
    ["Personas atendidas /100.000", h.tasa24, NAC.tasa24, 1],
    ["Sedes de neuropediatría /100.000", h.sedes100k, NAC.sedes100k, 2],
    ["Atenciones por persona", h.atenPorPersona, NAC.atenPorPersona, 1],
    ["% atenciones fuera del dpto.", h.pctFuera, NAC.pctFuera, 1],
    ["% personas en municipios sin sede", h.pctSinSede, 19.9, 1]
  ];
  const w = 640, rowH = 48, pad = { l:230, r:70, t:8 }, hh = pad.t + comp.length*rowH, iw = w-pad.l-pad.r;
  const s = svgEl(w, hh, "", "Huila frente al total nacional");
  comp.forEach((c,i)=>{
    const mx = Math.max(c[1], c[2]) * 1.15, y = pad.t + i*rowH;
    const g = document.createElementNS(SVGNS,"g"); g.setAttribute("tabindex","0"); g.setAttribute("class","bar-g");
    g.innerHTML = '<text x="'+(pad.l-10)+'" y="'+(y+22)+'" class="axis-lab" text-anchor="end">'+esc(c[0])+'</text>' +
      '<rect x="'+pad.l+'" y="'+(y+4)+'" width="'+(iw*c[1]/mx)+'" height="15" rx="3" class="bar-fill"/><text x="'+(pad.l+iw*c[1]/mx+5)+'" y="'+(y+16)+'" class="bar-val">Huila '+fmt(c[1],c[3])+'</text>' +
      '<rect x="'+pad.l+'" y="'+(y+22)+'" width="'+(iw*c[2]/mx)+'" height="15" rx="3" class="bar-nat"/><text x="'+(pad.l+iw*c[2]/mx+5)+'" y="'+(y+34)+'" class="bar-val muted">Nacional '+fmt(c[2],c[3])+'</text>';
    bindTip(g, ()=> "<h5>"+esc(c[0])+"</h5><p>Huila: <b>"+fmt(c[1],c[3])+"</b><br>Colombia: "+fmt(c[2],c[3])+"</p>");
    s.appendChild(g);
  });
  body.appendChild(el("div",{class:"chart-box"},[ legend([["bar-fill","Huila"],["bar-nat","Colombia"]]), s ]));
  body.appendChild(el("h4",{class:"chart-title"},["Destino de las atenciones de los residentes del Huila (2024)"]));
  body.appendChild(el("div",{class:"chart-box"},[flowChart("41")]));
  const btn = el("button",{class:"btn", type:"button"},["Ver el Huila en el mapa"]);
  btn.addEventListener("click", ()=>{ selectDept("41"); openSection("mapa"); setTimeout(()=> scrollToId("mapa-coropletico"), 60); });
  body.appendChild(el("p",null,[btn]));
  body.appendChild(sourceLine("Fuente: SISPRO-RIPS 2024; REPS 13/11/2026; DANE. Cruce RIPS-REPS por municipio de residencia."));
}

/* ================================================================= 07 NORMATIVA */
function addMonths(date, m){ const d = new Date(date.getTime()); d.setMonth(d.getMonth()+m); return d; }
function fdate(d){ return d.toLocaleDateString("es-CO",{ day:"numeric", month:"short", year:"numeric" }); }
function renderNormativa(){
  const body = document.getElementById("body-normativa");
  const N = C.normativa;
  body.appendChild(el("p",null,["En 2026 Colombia adoptó una ley específica para las personas con TEA y trastornos del neurodesarrollo, que se suma a la Política Nacional de Salud Mental 2024-2033 y a la ruta de promoción y mantenimiento de la salud (Resolución 3280 de 2018), donde está el tamizaje en la primera infancia."]));

  sub(body, "normativa-ruta", "Del tamizaje al diagnóstico: dónde interviene cada norma", "Esquema de lectura del equipo del proyecto. Pasa el cursor o el foco por cada paso.");
  const steps = [
    { t:"Tamizaje", s:"M-CHAT 18-30 meses", d:"Resolución 3280 de 2018: tamizaje con M-CHAT en la consulta de primera infancia y derivación ante un resultado alterado.", norma:"Res. 3280/2018" },
    { t:"Remisión", s:"Evaluaciones pediátricas", d:"Ley 2628, art. 12: se propenderá por la detección y atención temprana mediante la remisión de los profesionales en las evaluaciones pediátricas periódicas.", norma:"Ley 2628, art. 12" },
    { t:"Diagnóstico", s:"Equipo interdisciplinario", d:"Ley 2628, arts. 6 y 9: actualizar el protocolo clínico de diagnóstico, tratamiento y ruta de atención de niños, niñas y adolescentes con TEA.", norma:"Ley 2628, arts. 6 y 9" },
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

  const L = N.ley2628;
  sub(body, "normativa-ley", L.nombre, L.fecha);
  body.appendChild(el("div",{class:"card law-card"},[
    el("p",null,[ el("strong",null,["Objeto. "]), L.objeto ]),
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
        el("div",{class:"art-head"},[ el("span",{class:"art-num"},[a.art]), el("h4",null,[a.tema]),
          a.plazoMeses ? el("span",{class:"level-pill level-media"},["Plazo: " + a.plazoMeses + " meses"]) : (a.plazoTexto ? el("span",{class:"level-pill level-media"},[a.plazoTexto]) : null) ]),
        el("p",null,[a.d])
      ]));
    });
  }
  drawArts();
  body.appendChild(callout("Por qué importan los datos de esta app para la ley: la ruta de atención (art. 13), la capacitación del personal de atención primaria (art. 14) y el seguimiento estadístico (art. 8) necesitan saber dónde y con qué oferta se atiende hoy el TEA. El 19,9 % de las personas atendidas vive en municipios sin sede de neuropediatría y solo el 15,9 % de las sedes ofrece telemedicina.", "callout-info"));

  const P = N.pnsm;
  sub(body, "normativa-pnsm", P.nombre, P.emisor);
  body.appendChild(el("p",null,[ el("strong",null,["Objetivo general. "]), P.objetivo ]));
  body.appendChild(el("p",{class:"muted small"},[P.contexto]));
  const ejesWrap = el("div",{class:"ejes-grid"});
  P.ejes.forEach(e=> ejesWrap.appendChild(el("div",{class:"eje-card"},[ el("span",{class:"eje-n"},["Eje " + e.n]), el("p",null,[e.nombre]) ])));
  body.appendChild(ejesWrap);
  body.appendChild(el("h4",{class:"chart-title"},["Qué dice sobre el neurodesarrollo"]));
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
  const R = N.res3280;
  body.appendChild(el("div",{class:"card"},[ el("h4",null,[R.nombre]), el("p",null,[R.d]), el("p",{class:"link-row"},[ el("a",{href:R.url, target:"_blank", rel:"noopener"},["Resolución 3280 de 2018 (PDF)"]) ]) ]));
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
  body.appendChild(el("p",null,[ el("strong",null,["Medidas. "]), M.medidas ]));
  body.appendChild(el("h4",{class:"chart-title"},["Limitaciones y advertencias de lectura"]));
  const ul = el("ul",{class:"limit-list"});
  M.limitaciones.forEach(l=> ul.appendChild(el("li",null,[ el("span",null,[l]) ])));
  body.appendChild(ul);
  body.appendChild(el("h4",{class:"chart-title"},["Reproducibilidad"]));
  body.appendChild(el("p",null,["Las cifras por departamento de esta app se generan con scripts/build_data.py directamente desde el libro de cálculo del proyecto, sin digitación. Los índices, modelos e intervalos provienen del código de Python del proyecto (pandas, SciPy, statsmodels; semilla del bootstrap 20261113). El informe sigue la guía RECORD para estudios con datos rutinarios y PRISMA 2020 para la revisión."]));
  body.appendChild(el("p",null,["Uso de los datos: solo datos agregados por departamento, de acceso público, sin variables que identifiquen a personas ni a profesionales (investigación sin riesgo, artículo 11 de la Resolución 8430 de 1993)."]));
}

/* ---------------------------------------------------------------- TOC, scrollspy, breadcrumb */
function renderTOC(){
  const toc = document.getElementById("toc");
  SECTIONS.forEach(s=>{
    const a = el("a",{ href:"#sec-"+s.id, class:"toc-link", "data-target":s.id },[ el("span",{class:"toc-num"},[s.num]), s.title ]);
    a.addEventListener("click", e=>{ e.preventDefault(); openSection(s.id); scrollToId("sec-"+s.id); closeSidebar(); });
    toc.appendChild(a);
    (s.subs||[]).forEach(su=>{
      const b = el("a",{ href:"#"+su.id, class:"toc-link sub", "data-target":s.id, "data-sub":su.id },[su.label]);
      b.addEventListener("click", e=>{ e.preventDefault(); openSection(s.id); setTimeout(()=> scrollToId(su.id), 40); closeSidebar(); });
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
      bc.appendChild(el("div",{class:"container"},[ el("a",{href:"#main"},["Inicio"]), el("span",{class:"sep"},[" / "]), el("span",{class: curSub?null:"current"},[cur.title]),
        curSub ? el("span",{class:"sep"},[" / "]) : null, curSub ? el("span",{class:"current"},[curSub.label]) : null ]));
    }
  }
  window.addEventListener("scroll", ()=> requestAnimationFrame(update), { passive:true });
  update();
}

/* ---------------------------------------------------------------- búsqueda */
function buildSearchIndex(){
  const idx = [];
  SECTIONS.forEach(s=>{ idx.push({ type:"Sección", label:s.title, detail:s.sub, sec:s.id, anchor:"sec-"+s.id });
    (s.subs||[]).forEach(su=> idx.push({ type:"Subsección", label:su.label, detail:s.title, sec:s.id, anchor:su.id })); });
  DEP.forEach(d=> idx.push({ type:"Departamento", label:d.nombre, detail:d.region + " · tasa 2024 " + fmt(d.tasa24,1) + " · " + fmt(d.sedes) + " sedes", sec:"mapa", anchor:"mapa-coropletico", dept:d.cod }));
  INDICATORS.forEach(i=> idx.push({ type:"Indicador", label:i.label, detail:"Mapa por departamento", sec:"mapa", anchor:"mapa-coropletico" }));
  C.hallazgos.forEach(h=> idx.push({ type:"Hallazgo", label:h.t, detail:h.d, sec:"panorama", anchor:"panorama-hallazgos" }));
  C.normativa.ley2628.articulos.forEach(a=> idx.push({ type:"Ley 2628", label:a.art + " · " + a.tema, detail:a.d, sec:"normativa", anchor:"normativa-ley" }));
  C.normativa.pnsm.ejes.forEach(e=> idx.push({ type:"Política de Salud Mental", label:"Eje " + e.n + ". " + e.nombre, detail:"PNSM 2024-2033", sec:"normativa", anchor:"normativa-pnsm" }));
  C.metodologia.limitaciones.forEach(l=> idx.push({ type:"Limitación", label:l.slice(0,70) + (l.length>70?"…":""), detail:l, sec:"metodologia", anchor:"sec-metodologia" }));
  C.revision.prisma.motivos.forEach(m=> idx.push({ type:"Revisión", label:m.m, detail:m.n + " registros excluidos", sec:"revision", anchor:"sec-revision" }));
  [["M-CHAT","Tamizaje 18-30 meses (Resolución 3280 de 2018)","normativa","normativa-ruta"],["Línea 106","Orientación y apoyo en crisis de salud mental","normativa","normativa-minsalud"],["Certificado Único de Trastorno del Neurodesarrollo","Ley 2628, art. 7","normativa","normativa-ley"],["Telemedicina","15,9 % de las sedes de neuropediatría","oferta","sec-oferta"],["Gini","Curvas de Lorenz e índices","inequidad","inequidad-lorenz"],["Theil","Descomposición entre y dentro de regiones","inequidad","inequidad-theil"],["Cuasi-Poisson","Modelos ecológicos","inequidad","inequidad-modelos"],["PRISMA","Diagrama de flujo preliminar","revision","sec-revision"],["UNINAVARRA","Fundación Universitaria Navarra, Neiva","huila","sec-huila"]].forEach(x=> idx.push({ type:"Tema", label:x[0], detail:x[1], sec:x[2], anchor:x[3] }));
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
    setTimeout(()=> scrollToId(r.anchor), 60);
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
  function show(){ panel.hidden = false; closeSidebar(); setTimeout(()=> scrollToId("sources-panel"), 30); }
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
      if(search.isOpen()) search.close(); else if(!help.hidden) toggleHelp(false); else closeSidebar();
      hideTip(); return;
    }
    if(typing) return;
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
  document.getElementById("footer-disclaimer").textContent = C.aviso + " Esta app describe datos administrativos agregados; no ofrece orientación clínica individual.";
  document.getElementById("footer-author").innerHTML = "Autor: <strong>" + esc(C.meta.autor) + "</strong> (<a href='" + C.meta.orcid + "' target='_blank' rel='noopener'>ORCID</a>) · Proyecto: " + esc(C.meta.proyecto) + ", " + esc(C.meta.institucion) + ".";
  const cc = document.getElementById("cc-badge");
  cc.href = "https://creativecommons.org/publicdomain/zero/1.0/deed.es"; cc.textContent = "CC0 1.0";
  document.getElementById("footer-license-text").textContent = "Textos, gráficos y código bajo dedicación al dominio público CC0 1.0 Universal; se agradece citar la fuente. Los datos de origen pertenecen a sus fuentes oficiales (SISPRO, REPS, DANE).";
}

/* ---------------------------------------------------------------- arranque */
function boot(){
  renderHero();
  buildAccordion();
  renderPanorama();
  renderMapa();
  renderTendencia();
  renderOferta();
  renderInequidad();
  renderHuila();
  renderNormativa();
  renderRevision();
  renderMetodologia();
  renderTOC();
  renderSources();
  renderFooter();
  document.querySelectorAll(".js-export-pdf").forEach(b=> b.addEventListener("click", ()=> window.print()));
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("expand-all").addEventListener("click", ()=> setAll(true));
  document.getElementById("collapse-all").addEventListener("click", ()=> setAll(false));
  initMobileSidebar();
  const search = initSearch();
  initShortcuts(search);
  initFocusMode();
  initScrollTop();
  initScrollspy();
}
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
