/* Motor de simulación de dinámica de sistemas (sin dependencias). No se edita por proyecto.
   Núcleo: funciona en el navegador (window.Simulador) y en node (require). Interfaz: Motor.simulador(body, S, {diagrama}).
   El modelo va en js/simulacion.js (window.SIMULACION). Guía: references/simulacion.md de la skill.
   Regla: se simula en la medida en que haya datos. El nivel (0, 1 o 2) lo calcula el motor, no se declara. */
(function(raiz){
"use strict";
/* ================================================================ formas no lineales */
const lim = (x, a, b)=> Math.max(a, Math.min(b, x));
const H = {
  lim: lim,
  sat: (x, k)=> { const u = Math.max(0, x); return u / (u + (k === undefined ? 1 : k)); },               // saturación: 0 a 1; k = semisaturación
  ese: (x, x0, n)=> { const u = Math.pow(Math.max(0, x), n || 3), v = Math.pow(x0, n || 3); return u / (u + v); }, // curva en S
  dec: (x, k)=> Math.exp(-Math.max(0, x) / k),                                                             // caída que se frena
  umb: (x, x0, ancho)=> 1 / (1 + Math.exp(-(x - x0) / Math.max(1e-9, ancho || x0*0.05))),                 // umbral
  esc: (x, paso)=> Math.floor(x / paso) * paso,                                                           // escalones
  libre: u=> lim(1 - u, 0, 1),                                                                            // capacidad que queda con una ocupación u
  cong: u=> 1 / Math.max(0.02, 1 - Math.min(u, 0.98)),                                                    // congestión: espera relativa con ocupación u
  min: (...a)=> Math.min(...a),                                                                           // factor limitante
  tabla: (x, pts)=> { if(x <= pts[0][0]) return pts[0][1]; for(let i=1;i<pts.length;i++) if(x <= pts[i][0]){ const a = pts[i-1], b = pts[i]; return a[1] + (b[1]-a[1])*(x-a[0])/(b[0]-a[0]); } return pts[pts.length-1][1]; }
};
const keys = o=> Object.keys(o || {});
const num = (x, p)=> typeof x === "function" ? x(p) : x;
const valores = S=>{ const p = {}; keys(S.param).forEach(k=> p[k] = S.param[k].v); return p; };

/* ================================================================ integración (Euler con límite de existencias) */
function instante(S, x, p, t){
  for(const k in S.aux) x[k] = S.aux[k].f(x, p, t, H);
  for(const k in S.flujos) x[k] = S.flujos[k].f(x, p, t, H);
}
function correr(S, p0, o){
  o = o || {};
  const p = Object.assign(valores(S), p0 || {}), dt = o.dt || S.dt || 1/32, n = Math.round((S.t1 - S.t0)/dt), cada = Math.max(1, Math.round((o.salida || S.salida || 0.25)/dt));
  const x = {}, Ns = keys(S.niveles), Fs = keys(S.flujos), Rs = keys(S.retardos), out = { t:[], v:{}, limitado:0, nube:0 };
  const SAL = Ns.map(k=> Fs.filter(f=> S.flujos[f].de === k)), tau = {}, d = {}, dr = {};
  Ns.forEach(k=> x[k] = num(S.niveles[k].v0, p));
  Rs.forEach(k=> x[k] = 0);
  // los retardos empiezan en equilibrio con su entrada (o en v0 si se declara)
  for(let i=0;i<4 && Rs.length;i++){ instante(S, x, p, S.t0); Rs.forEach(k=>{ const r = S.retardos[k]; x[k] = r.v0 !== undefined ? num(r.v0, p) : r.f(x, p, S.t0, H); }); }
  const ids = Ns.concat(Rs, keys(S.aux), Fs); ids.forEach(k=> out.v[k] = []);
  for(let i=0;i<=n;i++){
    const t = S.t0 + i*dt; instante(S, x, p, t);
    // ningún flujo puede sacar más de lo que hay
    Ns.forEach((k,j)=>{ const sal = SAL[j]; let tot = 0; for(const f of sal) tot += Math.max(0, x[f]); if(tot*dt > x[k] + 1e-12 && tot > 0){ const c = Math.max(0, x[k])/(tot*dt); sal.forEach(f=>{ x[f] *= c; }); out.limitado++; } });
    if(i % cada === 0 || i === n){ out.t.push(+t.toFixed(9)); ids.forEach(k=> out.v[k].push(x[k])); }
    if(i === n) break;
    for(const k of Ns) d[k] = 0;
    Fs.forEach(f=>{ const F = S.flujos[f]; if(F.de) d[F.de] -= x[f]; else out.nube += x[f]*dt; if(F.a) d[F.a] += x[f]; else out.nube -= x[f]*dt; });
    for(const k of Rs){ const r = S.retardos[k]; if(tau[k] === undefined) tau[k] = Math.max(dt, num(r.tau, p)); dr[k] = (r.f(x, p, t, H) - x[k]) / tau[k]; }
    for(const k of Ns) x[k] += d[k]*dt;
    for(const k of Rs) x[k] += dr[k]*dt;
  }
  return out;
}
function en(r, id, t){ // interpola la salida
  const T = r.t, V = r.v[id]; if(t <= T[0]) return V[0];
  for(let i=1;i<T.length;i++) if(t <= T[i] + 1e-9) return V[i-1] + (V[i]-V[i-1])*(t-T[i-1])/(T[i]-T[i-1]);
  return V[V.length-1];
}

/* ================================================================ ajuste, calibración e incertidumbre */
function puntos(S, modo){ // modo: "usar" (calibración), "retener" (validación)
  const out = [];
  keys(S.observado).forEach(id=>{ const O = S.observado[id]; O.pts.forEach(q=>{ if((O.excluir||[]).includes(q[0]) || q[0] < S.t0 || q[0] > S.t1) return; const ret = (O.retener||[]).includes(q[0]); if((modo === "retener") === ret) out.push({ id:id, t:q[0], y:q[1] }); }); });
  return out;
}
function mape(S, p, modo){ const P = puntos(S, modo); if(!P.length) return null; const r = correr(S, p); return P.reduce((a,q)=> a + Math.abs(en(r,q.id,q.t)-q.y)/Math.max(1e-9,Math.abs(q.y)), 0)/P.length*100; }
const perdida = (S, p, P)=>{ const r = correr(S, p); let e = 0; P.forEach(q=>{ const d = (en(r,q.id,q.t)-q.y)/Math.max(1e-9,Math.abs(q.y)); e += d*d; }); return isFinite(e) ? e : 1e12; };
const libres = S=> keys(S.param).filter(k=> S.param[k].ev === "cal");
function calibrar(S, opt){ // Nelder-Mead con límites (transformación logística)
  opt = opt || {}; const L = libres(S), P = opt.puntos || puntos(S, "usar"); if(!L.length || !P.length) return null;
  const a = k=> S.param[k].min, b = k=> S.param[k].max, dec = z=>{ const p = {}; L.forEach((k,i)=> p[k] = a(k) + (b(k)-a(k))/(1+Math.exp(-z[i]))); return p; };
  const enc = k=>{ const u = lim((S.param[k].v-a(k))/(b(k)-a(k)), .02, .98); return Math.log(u/(1-u)); }, f = z=> perdida(S, dec(z), P);
  const inicios = [L.map(enc), L.map(()=> 0)]; let mejor = null;
  inicios.forEach(z0=>{
    let sx = [z0].concat(z0.map((_,i)=> z0.map((v,j)=> v + (i===j ? 1 : 0)))).map(z=> ({ z:z, e:f(z) }));
    for(let it=0; it<(opt.iter||400); it++){
      sx.sort((u,v)=> u.e-v.e); const n = z0.length, c = z0.map((_,j)=> sx.slice(0,n).reduce((s,q)=> s+q.z[j],0)/n), W = sx[n], mk = g=>{ const z = c.map((v,j)=> v + g*(W.z[j]-v)); return { z:z, e:f(z) }; };
      if(Math.abs(sx[n].e-sx[0].e) < 1e-14 && it > 40) break;
      const r = mk(-1);
      if(r.e < sx[0].e){ const x = mk(-2); sx[n] = x.e < r.e ? x : r; }
      else if(r.e < sx[n-1].e) sx[n] = r;
      else { const k = mk(r.e < W.e ? -.5 : .5); if(k.e < Math.min(W.e, r.e)) sx[n] = k; else sx = sx.map((q,i)=>{ if(!i) return q; const z = q.z.map((v,j)=> sx[0].z[j] + .5*(v-sx[0].z[j])); return { z:z, e:f(z) }; }); }
    }
    sx.sort((u,v)=> u.e-v.e); if(!mejor || sx[0].e < mejor.e) mejor = sx[0];
  });
  return { p: dec(mejor.z), error: mejor.e, n: P.length };
}
function azar(semilla){ let s = semilla >>> 0; return ()=>{ s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function triangular(u, a, m, b){ if(b <= a) return m; const c = (m-a)/(b-a); return u < c ? a + Math.sqrt(u*(b-a)*(m-a)) : b - Math.sqrt((1-u)*(b-a)*(b-m)); }
function remuestreo(S, n){ // remuestreo de residuos: intervalo de los parámetros calibrados
  const c = calibrar(S); if(!c) return null; const P = puntos(S,"usar"), r = correr(S, c.p), pred = P.map(q=> en(r,q.id,q.t)), res = P.map((q,i)=> Math.log(Math.max(1e-9,q.y)/Math.max(1e-9,pred[i]))), R = azar(7), L = libres(S), acc = {}; L.forEach(k=> acc[k] = []);
  for(let i=0;i<(n||60);i++){ const Q = P.map((q,j)=> ({ id:q.id, t:q.t, y: pred[j]*Math.exp(res[Math.floor(R()*res.length)]) })), k = calibrar(S, { puntos:Q, iter:160 }); L.forEach(x=> acc[x].push(k.p[x])); }
  const out = {}; L.forEach(k=>{ const v = acc[k].sort((a,b)=> a-b); out[k] = [v[Math.floor(v.length*.05)], v[Math.min(v.length-1, Math.floor(v.length*.95))]]; }); return { base:c, intervalo:out };
}
const rango = q=> q.min !== undefined && q.max !== undefined && q.max > q.min;
const incierto = q=> rango(q) && q.ev !== "dec"; // una decisión (palanca) no es incertidumbre: no entra en la franja ni en la sensibilidad
function banda(S, p0, fijos, n){ // percentiles 5 y 95 al variar los parámetros inciertos que no se fijaron
  const R = azar(11), K = keys(S.param).filter(k=> incierto(S.param[k]) && !(fijos||[]).includes(k)), runs = [];
  for(let i=0;i<(n||200);i++){ const p = Object.assign({}, p0); K.forEach(k=>{ const q = S.param[k], lo = q.b0 !== undefined ? q.b0 : q.min, hi = q.b1 !== undefined ? q.b1 : q.max; p[k] = triangular(R(), lo, lim(q.v, lo, hi), hi); }); runs.push(correr(S, p)); }
  return { t: runs[0].t, k:K, q:(id, a)=> runs[0].t.map((_,i)=>{ const v = runs.map(r=> r.v[id][i]).sort((x,y)=> x-y); return v[Math.min(v.length-1, Math.max(0, Math.round(a*(v.length-1))))]; }) };
}
function tornado(S, id, p0){
  return keys(S.param).filter(k=> incierto(S.param[k])).map(k=>{ const q = S.param[k], lo = q.b0 !== undefined ? q.b0 : q.min, hi = q.b1 !== undefined ? q.b1 : q.max, f = v=>{ const r = correr(S, Object.assign({}, p0, { [k]: v })); return r.v[id][r.v[id].length-1]; }; return { k:k, lo:lo, hi:hi, a:f(lo), b:f(hi) }; }).sort((x,y)=> Math.abs(y.b-y.a) - Math.abs(x.b-x.a));
}

// ¿se sostiene la comparación? Cada combinación de parámetros inciertos se corre con y sin el escenario
function robustez(S, ids, n){
  n = n || 150; const R = azar(23), K = keys(S.param).filter(k=> incierto(S.param[k])), out = {}; (S.escenarios||[]).forEach(e=>{ out[e.id] = {}; ids.forEach(id=> out[e.id][id] = []); });
  for(let i=0;i<n;i++){ const p = {}; K.forEach(k=>{ const q = S.param[k], lo = q.b0 !== undefined ? q.b0 : q.min, hi = q.b1 !== undefined ? q.b1 : q.max; p[k] = triangular(R(), lo, lim(q.v, lo, hi), hi); }); const b = correr(S, p), z = (r,id)=> r.v[id][r.v[id].length-1]; (S.escenarios||[]).forEach(e=>{ const r = correr(S, Object.assign({}, p, e.p)); ids.forEach(id=> out[e.id][id].push(z(r,id)/Math.max(1e-9, z(b,id)) - 1)); }); }
  keys(out).forEach(e=> ids.forEach(id=>{ const v = out[e][id].sort((x,y)=> x-y), q = u=> v[Math.min(n-1, Math.round(u*(n-1)))]; out[e][id] = { sube: v.filter(x=> x > 1e-6).length/n, baja: v.filter(x=> x < -1e-6).length/n, lo:q(.05), med:q(.5), hi:q(.95) }; }));
  return out;
}

/* ================================================================ ¿hasta dónde alcanzan los datos?
   0 = no se simula; 1 = exploratoria (índice, con rango); 2 = calibrada con serie observada.
   Los umbrales (5 puntos, 20 % de error) son convenciones de esta plantilla, no reglas universales. */
function nivelDatos(S){
  const P = S.param || {}, mal = [], falta = [], con = ["dato","lit","norma"], obs = puntos(S,"usar"), L = libres(S);
  const sup = keys(P).filter(k=> P[k].ev === "sup").concat(keys(S.niveles).filter(k=> S.niveles[k].ev === "sup")), real = keys(P).filter(k=> con.includes(P[k].ev)), n0 = keys(S.niveles).filter(k=> con.includes(S.niveles[k].ev));
  keys(P).forEach(k=>{ if((P[k].ev === "lit" || P[k].ev === "norma" || P[k].ev === "dato") && !P[k].ref && !P[k].fuente) mal.push("«" + P[k].t + "» no tiene fuente"); if(["sup","cal","dec"].includes(P[k].ev) && !rango(P[k])) mal.push("«" + P[k].t + "» no tiene rango (min y max)"); });
  if(!n0.length) falta.push("el valor inicial de al menos un nivel con fuente");
  if(!real.length && !L.length && !obs.length) falta.push("al menos un parámetro con fuente o una serie observada");
  if(S.ejemplo) return { n:2, ejemplo:true, t:"Plantilla con valores de relleno", motivos:["Los números no describen nada real."], falta:[], mal:mal };
  if(falta.length || mal.length) return { n:0, t:"Sin datos suficientes para simular", motivos:mal, falta:falta.concat(S.faltan||[]), mal:mal };
  const m = []; let e = null;
  if(obs.length < 5) m.push("hay " + obs.length + " puntos observados utilizables y se piden 5");
  if(obs.length <= L.length + 1) m.push("hay " + L.length + " parámetros calibrados para " + obs.length + " puntos");
  if(sup.length) m.push(sup.length === 1 ? "un valor es un supuesto" : sup.length + " valores son supuestos");
  if(obs.length){ e = mape(S, null, "usar"); if(e > 20) m.push("el error medio frente a lo observado es de " + e.toFixed(0) + " % (se pide 20 % o menos)"); }
  if(m.length) return { n:1, t:"Simulación exploratoria", motivos:m, falta:S.faltan||[], mape:e };
  return { n:2, t:"Simulación calibrada", motivos:[], falta:S.faltan||[], mape:e, retenido: mape(S, null, "retener"), puntos:obs.length };
}

/* ================================================================ pruebas del modelo (las usa scripts/verificar_simulacion.js) */
function lecturas(f, x, p, t){ const q = new Set(); f(new Proxy(x, { get:(o,k)=>{ if(typeof k === "string") q.add(k); return o[k]; } }), p, t, H); return q; }
function probar(S, D){
  const E = [], A = [], p = valores(S), base = correr(S, p), N = keys(S.niveles), T = base.t.length - 1, ult = (r,k)=> r.v[k][r.v[k].length-1];
  const ecu = Object.assign({}, S.retardos, S.aux, S.flujos);
  if(S.ejemplo) A.push("ejemplo:true: el modelo trae valores de relleno; no publicar así");
  if(S.resultado && !base.v[S.resultado.id]) E.push("resultado.id no existe: " + S.resultado.id);
  keys(S.flujos).forEach(k=> ["de","a"].forEach(z=>{ const id = S.flujos[k][z]; if(id && !S.niveles[id]) E.push("el flujo " + k + " usa un nivel que no existe: " + id); }));
  keys(S.param).forEach(k=>{ const q = S.param[k]; if(!q.u) E.push("parámetro sin unidad: " + k); if(rango(q) && (q.v < q.min || q.v > q.max)) E.push("valor fuera de rango: " + k); if(q.ev === "lit" && !q.ref) E.push("«literatura» sin referencia: " + k); if(!["dato","lit","norma","sup","cal","dec"].includes(q.ev)) E.push("evidencia no reconocida en " + k + ": " + q.ev); });
  N.concat(keys(S.aux), keys(S.flujos), keys(S.retardos)).forEach(k=>{ if(!(S.niveles[k]||ecu[k]).u) E.push("variable sin unidad: " + k); if(base.v[k].some(v=> !isFinite(v))) E.push("valores no finitos en " + k); });
  N.forEach(k=>{ if(Math.min(...base.v[k]) < -1e-6) E.push("el nivel " + k + " se vuelve negativo"); });
  // conservación
  const suma = i=> N.reduce((a,k)=> a + base.v[k][i], 0), difer = Math.abs(suma(T) - suma(0) - base.nube), esc = Math.max(1, Math.abs(suma(0)));
  if(difer/esc > 1e-6) E.push("no se conserva la masa: diferencia de " + difer);
  // paso de integración
  const fino = correr(S, p, { dt:(S.dt||1/32)/2 }); N.forEach(k=>{ const d = Math.abs(ult(fino,k)-ult(base,k))/Math.max(1e-9,Math.abs(ult(fino,k))); if(d > .01) E.push("el paso dt es grueso: " + k + " cambia " + (d*100).toFixed(1) + " % al partirlo en dos"); });
  if(base.limitado) A.push("en el escenario base un nivel se agotó " + base.limitado + " veces y hubo que limitar su salida");
  // extremos
  keys(S.param).filter(k=> rango(S.param[k])).forEach(k=> ["min","max"].forEach(z=>{ const r = correr(S, { [k]: S.param[k][z] }); keys(r.v).forEach(id=>{ if(r.v[id].some(v=> !isFinite(v))) E.push("con " + k + " en su " + z + ", " + id + " no es finito"); else if(S.niveles[id] && Math.min(...r.v[id]) < -1e-6) E.push("con " + k + " en su " + z + ", el nivel " + id + " es negativo"); }); }));
  // coherencia con el diagrama: mismas flechas y mismos signos
  if(D){
    const ids = new Set(D.nodos.map(n=> n.id)), enSim = id=> !!(S.niveles[id] || ecu[id]), todos = keys(base.v), est = [0,.25,.5,.75,1].map(u=>{ const i = Math.round(u*T), x = {}; todos.forEach(k=> x[k] = base.v[k][i]); return { x:x, t:base.t[i] }; });
    todos.forEach(k=>{ if(!ids.has(k)) E.push("variable simulada que no está en el diagrama: " + k); });
    const tub = (D.tuberias||[]).map(t=> t[0] + ">" + t[1]);
    keys(S.flujos).forEach(k=>{ const F = S.flujos[k]; if(F.de && ids.has(F.de) && !tub.includes(F.de + ">" + k)) E.push("falta la tubería " + F.de + " > " + k + " en el diagrama"); if(F.a && ids.has(F.a) && !tub.includes(k + ">" + F.a)) E.push("falta la tubería " + k + " > " + F.a + " en el diagrama"); });
    keys(ecu).forEach(k=>{ const lee = new Set(); est.forEach(s=> lecturas(ecu[k].f, s.x, p, s.t).forEach(q=> lee.add(q))); lee.forEach(q=>{ if(!D.aristas.some(e=> e.de === q && e.a === k) && !tub.includes(q + ">" + k)) E.push("influencia oculta: la ecuación de " + k + " usa " + q + " y el diagrama no la muestra"); }); ecu[k]._lee = lee; });
    D.aristas.forEach(e=>{
      if(!enSim(e.a) || !enSim(e.de)){ if(enSim(e.a)) A.push("flecha sin simular: " + e.de + " > " + e.a); return; }
      if(!ecu[e.a]){ E.push("la flecha " + e.de + " > " + e.a + " llega a un nivel; los niveles solo cambian por flujos"); return; }
      if(!ecu[e.a]._lee.has(e.de)){ E.push("la flecha " + e.de + " > " + e.a + " no aparece en la ecuación"); return; }
      let mas = 0, menos = 0; est.forEach(s=>{ const h = Math.max(1e-6, Math.abs(s.x[e.de])*.02), f = z=> ecu[e.a].f(Object.assign({}, s.x, { [e.de]: z }), p, s.t, H), d = f(s.x[e.de]+h) - f(s.x[e.de]-h); if(d > 1e-12) mas++; if(d < -1e-12) menos++; });
      const s = e.s === "+" ? 1 : -1; if((s > 0 && menos) || (s < 0 && mas)) E.push("signo contrario: " + e.de + " > " + e.a + " dice «" + e.s + "» y la ecuación responde al revés"); else if(!mas && !menos) A.push("la flecha " + e.de + " > " + e.a + " no tuvo efecto en los puntos probados");
      if(e.dm && !S.retardos?.[e.a]) A.push("la flecha " + e.de + " > " + e.a + " marca una demora y su destino no es un retardo");
    });
  }
  // reparto del error
  const n = nivelDatos(S);
  return { errores:E, avisos:A, nivel:n };
}
const Simulador = { H, correr, en, valores, puntos, mape, calibrar, remuestreo, banda, tornado, robustez, nivelDatos, probar, libres };
if(typeof module !== "undefined" && module.exports) module.exports = Simulador;
raiz.Simulador = Simulador;

/* ================================================================ interfaz */
const M = raiz.Motor; if(!M || typeof document === "undefined") return;
const { el, esc, fmt, svgEl, VW, MOB, bindTip, SVGNS } = M;
const nf = v=>{ const a = Math.abs(v); return fmt(v, a >= 100 ? 0 : a >= 10 ? 1 : a >= 1 ? 2 : a === 0 ? 0 : 3).replace(/(,\d*?)0+$/, "$1").replace(/,$/, ""); };
// cuánto agrandan el texto de los gráficos la pantalla y el control de tamaño: los márgenes crecen con él
const esc1 = ()=>{ const g = getComputedStyle(document.documentElement), x = n=> parseFloat(g.getPropertyValue(n)) || 1; return x("--svg-scale") * x("--svg-m"); };
const pct = v=> (v > 0 ? "+" : "") + fmt(v, Math.abs(v) < 10 ? 1 : 0) + " %";
const ESTADO = {}; // recuerda el escenario al redibujar por cambio de pantalla
M.simulador = function(body, S, opt){
  opt = opt || {}; const niv = nivelDatos(S), EV = { dato:"Dato de este análisis", lit:"Literatura", norma:"Norma", sup:"Supuesto del equipo", cal:"Calibrado con la serie", dec:"Decisión que se explora" };
  const aviso = el("div",{class:"sim-nivel sim-n" + (niv.ejemplo ? "e" : niv.n), role:"note"},[ el("strong",null,[niv.t + ". "]), niv.ejemplo ? "Sirve para ver cómo funciona; se reemplaza por datos verificables antes de publicar." : niv.n === 2 ? "Los parámetros tienen fuente y el modelo reproduce la serie observada (" + niv.puntos + " puntos, error medio de " + fmt(niv.mape,1) + " %" + (niv.retenido !== null && niv.retenido !== undefined ? "; " + fmt(niv.retenido,1) + " % en los puntos que no se usaron para ajustar" : "") + ")." : niv.n === 1 ? "Muestra cómo respondería el sistema según la estructura del modelo, no cuánto valdrá. Por eso se expresa como índice y con un rango: " + niv.motivos.join("; ") + "." : "El diagrama queda como modelo conceptual." ]);
  body.appendChild(aviso);
  if(niv.falta.length) body.appendChild(el("details",{class:"sim-falta"},[ el("summary",null,["¿Qué datos harían falta?"]), el("ul",null, niv.falta.map(x=> el("li",null,[x]))) ]));
  if(niv.n === 0) return null;

  const base = correr(S), P0 = valores(S), id0 = (S.resultado && S.resultado.id) || keys(S.niveles)[0], T = base.t, nT = T.length;
  const def = id=> (S.niveles||{})[id] || (S.flujos||{})[id] || (S.aux||{})[id] || (S.retardos||{})[id];
  const st = ESTADO[S.titulo||"sim"] || (ESTADO[S.titulo||"sim"] = { p:Object.assign({}, P0), esc:"base", ver:id0, t:nT-1 });
  const indice = niv.n === 1, ref = id=> base.v[id][0] > 0 ? base.v[id][0] : Math.max(...base.v[id].map(Math.abs)) || 1, K = id=> indice ? 100/ref(id) : 1, uni = id=> indice ? "índice (" + (base.v[id][0] > 0 ? "inicio" : "máximo base") + " = 100)" : def(id).u;
  let cur, bd, timer = null, marca = null;
  body.appendChild(M.howTo("mueve un control o elige un escenario y mira cómo cambia la línea. La línea discontinua gris es el escenario base; la franja es el rango en el que se mueve el resultado cuando los parámetros inciertos varían dentro de sus límites" + (keys(S.observado).length ? "; los círculos son lo observado" : "") + "."));
  // escenarios
  const ESC = [{ id:"base", t:"Escenario base", d:"Valores de partida.", p:{} }].concat(S.escenarios||[]);
  const rowE = el("div",{class:"filter-row", role:"group", "aria-label":"Escenario"});
  ESC.forEach(e=>{ const b = el("button",{type:"button", class:"filter-chip", "data-esc":e.id, title:e.d},[e.t]); b.addEventListener("click", ()=>{ st.toc = 1; st.p = Object.assign({}, P0, e.p); st.esc = e.id; sync(); recalcular(); }); rowE.appendChild(b); });
  body.appendChild(rowE);
  // controles
  const caja = el("div",{class:"sim-mandos", role:"group", "aria-label":"Parámetros"}), ins = {};
  keys(S.param).filter(k=> S.param[k].mando && rango(S.param[k])).forEach(k=>{
    const q = S.param[k], idx = "sim-" + k, out = el("output",{for:idx, class:"sim-out"}), r = el("input",{type:"range", id:idx, min:String(q.min), max:String(q.max), step:String(q.paso || (q.max-q.min)/100)});
    r.addEventListener("input", ()=>{ st.toc = 1; st.p[k] = +r.value; st.esc = "propio"; out.textContent = nf(st.p[k]) + " " + q.u; r.setAttribute("aria-valuetext", out.textContent); marcarEsc(); pedir(); });
    ins[k] = { r:r, out:out, q:q };
    caja.appendChild(el("div",{class:"sim-mando"},[ el("label",{for:idx},[q.t]), out, r, el("span",{class:"sim-rango"},["de " + nf(q.min) + " a " + nf(q.max) + " · base " + nf(q.v)]) ]));
  });
  if(caja.children.length) body.appendChild(caja);
  // variable que se mira
  const vis = (S.ver || keys(S.niveles)).filter(id=> base.v[id]);
  if(!vis.includes(st.ver)) st.ver = vis[0];
  body.appendChild(M.chips(vis.map(id=> ({ id:id, label:def(id).t })), st.ver, id=>{ st.ver = id; dibujar(); sensibilidad(); leer(); }, "Variable que se muestra"));
  const tit = el("h4",{class:"chart-title sim-tit"}), box = el("div",{class:"chart-box sim-box"},[tit]); body.appendChild(box);
  body.appendChild(M.legend([["sim-l-cur","Escenario elegido"],["sim-l-base","Escenario base"],["sim-l-band","Rango (percentiles 5 a 95)"]].concat(keys(S.observado).length ? [["sim-l-obs","Observado"]].concat(keys(S.observado).some(k=> (S.observado[k].excluir||[]).length) ? [["sim-l-exc","Observado, no usado para ajustar"]] : [], keys(S.observado).some(k=> (S.observado[k].ruptura||[]).length) ? [["sim-l-rup", S.rupturaT || "Ruptura de la serie"]] : []) : [])));
  // tiempo
  const tr = el("input",{type:"range", min:"0", max:String(nT-1), step:"1", "aria-label":"Momento de la simulación"}), tl = el("output",{class:"sim-out"}), play = el("button",{type:"button", class:"btn"},["▶ Recorrer"]);
  tr.addEventListener("input", ()=>{ parar(); st.toc = 1; st.t = +tr.value; momento(); });
  play.addEventListener("click", ()=>{ if(timer) return parar(); st.toc = 1; if(st.t >= nT-1) st.t = 0; play.textContent = "❚❚ Pausar"; timer = setInterval(()=>{ if(!box.isConnected){ clearInterval(timer); return; } if(st.t >= nT-1) return parar(); st.t++; momento(); }, Math.max(60, Math.min(260, 7000/nT))); });
  const parar = ()=>{ if(timer){ clearInterval(timer); timer = null; } play.textContent = "▶ Recorrer"; };
  const rst = el("button",{type:"button", class:"btn"},["Volver al escenario base"]); rst.addEventListener("click", ()=>{ parar(); st.toc = 0; st.t = nT-1; st.p = Object.assign({}, P0); st.esc = "base"; sync(); recalcular(); });
  const csv = el("button",{type:"button", class:"btn"},["Descargar la simulación (CSV)"]); csv.addEventListener("click", ()=>{ const ids = keys(cur.v); M.downloadCSV("simulacion.csv", [S.unidadT||"tiempo"].concat(ids.map(i=> def(i).t + " (" + def(i).u + ")")), cur.t.map((t,i)=> [t].concat(ids.map(k=> cur.v[k][i])))); });
  body.appendChild(el("div",{class:"sim-tiempo"},[ play, tr, tl ]));
  // los niveles en pequeño, junto al control del tiempo (los del diagrama pueden quedar fuera de la pantalla)
  const tq = {}; body.appendChild(el("div",{class:"sim-tanques"}, keys(S.niveles).map(id=>{ const fill = el("i"), v = el("output",{class:"sim-out"}); tq[id] = { fill:fill, v:v }; return el("div",{class:"sim-tanque"},[ el("span",{class:"sim-vaso","aria-hidden":"true"},[fill]), el("div",null,[ el("span",{class:"sim-tq-t"},[def(id).t]), v, el("span",{class:"sim-rango"},[uni(id)]) ]) ]); }))); body.appendChild(el("div",{class:"control-row"},[rst, csv]));
  const lec = M.reading(); body.appendChild(lec);
  M.sub(body, (opt.id||"sim") + "-sensibilidad", "¿De qué depende más el resultado?", "Cada barra mueve un solo parámetro incierto entre su mínimo y su máximo, para la variable que elegiste arriba.");
  const tit2 = el("h4",{class:"chart-title sim-tit"}), tb = el("div",{class:"chart-box sim-torn"},[tit2]); body.appendChild(tb);
  body.appendChild(M.legend([["sim-l-lo","Parámetro en su mínimo"],["sim-l-hi","Parámetro en su máximo"]]));
  const lecT = M.reading(); body.appendChild(lecT);
  // firmeza de la comparación entre escenarios
  if((S.robustez||[]).length && (S.escenarios||[]).length){
    M.sub(body, (opt.id||"sim") + "-firmeza", "¿Se sostiene la comparación entre escenarios?", "Cada escenario se comparó con la base en 150 combinaciones de los parámetros inciertos. Se muestra el cambio mediano al final, con su rango (percentiles 5 a 95).");
    const hueco = el("div"); body.appendChild(hueco); const lecR = M.reading(); body.appendChild(lecR);
    const hacer = ()=>{ const r = robustez(S, S.robustez, 150), P = x=> pct(x*100);
      hueco.appendChild(M.tabla(["Escenario"].concat(S.robustez.map(id=> def(id).t)), S.escenarios.map(e=> [e.t].concat(S.robustez.map(id=>{ const z = r[e.id][id], s = z.med >= 0 ? z.sube : z.baja; return P(z.med) + " (" + P(z.lo) + " a " + P(z.hi) + "); " + (z.med >= 0 ? "sube" : "baja") + " en el " + fmt(s*100,0) + " % de las combinaciones"; }))), "sim-firme")); hueco.querySelectorAll("tbody tr").forEach(f=> f.querySelectorAll("td").forEach((c,i)=> c.setAttribute("data-l", def(S.robustez[i]).t)));
      const todo = S.escenarios.every(e=> S.robustez.every(id=> Math.max(r[e.id][id].sube, r[e.id][id].baja) >= .95));
      M.setReading(lecR, (todo ? "El <strong>sentido</strong> del cambio se mantiene en casi todas las combinaciones; el <strong>tamaño</strong>, no: los rangos son amplios. " : "El sentido del cambio depende de los supuestos en al menos un escenario. ") + "Vale dentro de la estructura de este modelo: si faltara una relación importante, la comparación podría cambiar."); };
    if(raiz.requestIdleCallback) raiz.requestIdleCallback(hacer, { timeout:3000 }); else setTimeout(hacer, 400);
  }
  // parámetros y fuentes
  M.sub(body, (opt.id||"sim") + "-parametros", "¿De dónde sale cada número?");
  const refs = S.refs || {}, fte = q=>{ const L = [].concat(q.ref || []).map(x=> refs[x]).filter(Boolean); return L.length ? el("span",null, L.reduce((a,r,i)=> a.concat(i ? ["; "] : [], el("a",{href:r.u, target:"_blank", rel:"noopener"},[r.t])), []).concat(q.fuente ? [". " + q.fuente] : [])) : (q.fuente || (q.ev === "sup" ? "Sin fuente: se explora con un rango" : q.ev === "dec" ? "La mueve quien explora; no es un efecto estimado" : q.ev === "cal" ? "Ajustado a lo observado" : "")); };
  body.appendChild(M.tabla(["Parámetro","Valor","Rango explorado","Procedencia","Fuente"], keys(S.param).map(k=>{ const q = S.param[k]; return [q.t, nf(q.v) + " " + q.u, rango(q) ? nf(q.min) + " a " + nf(q.max) : "fijo", EV[q.ev], fte(q)]; }).concat(keys(S.niveles).map(k=>{ const q = S.niveles[k]; return ["Valor inicial: " + M.lowFirst(q.t), nf(base.v[k][0]) + " " + q.u, "fijo", EV[q.ev] || "", fte(q)]; })), "sim-par"));
  if(S.nota) body.appendChild(el("p",{class:"muted small"},[S.nota]));

  function marcarEsc(){ rowE.querySelectorAll("[data-esc]").forEach(b=>{ const on = b.dataset.esc === st.esc; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on ? "true" : "false"); }); }
  function sync(){ keys(ins).forEach(k=>{ const z = ins[k]; z.r.value = String(st.p[k]); z.out.textContent = nf(st.p[k]) + " " + z.q.u; z.r.setAttribute("aria-valuetext", z.out.textContent); }); marcarEsc(); }
  // mientras se arrastra, una franja rápida; al soltar, la completa
  let pend = null, fin = null; function pedir(){ clearTimeout(fin); fin = setTimeout(()=> recalcular(), 350); if(pend) return; pend = setTimeout(()=>{ pend = null; recalcular(40); }, 40); }
  function recalcular(n){ cur = correr(S, st.p); bd = banda(S, st.p, keys(st.p).filter(k=> st.p[k] !== P0[k]), n || 200); dibujar(); if(n) return; sensibilidad(); leer(); }
  function dibujar(){
    const id = st.ver, k = K(id), lo = bd.q(id,.05).map(v=> v*k), hi = bd.q(id,.95).map(v=> v*k), B = base.v[id].map(v=> v*k), V = cur.v[id].map(v=> v*k), O = S.observado && S.observado[id], op = O ? O.pts.filter(q=> q[0] >= S.t0 && q[0] <= S.t1) : [];
    const mx = M.niceMax(Math.max(...hi, ...B, ...V, ...op.map(q=> q[1]*k))), Z = esc1(), w = VW(ancho(box),380), h = VW(430,360), m = { l:Math.round(16+38*Z), r:VW(Math.round(24+92*Z),18), t:16, b:Math.round(14+20*Z) }, iw = w-m.l-m.r, ih = h-m.t-m.b;
    const X = t=> m.l + iw*(t-S.t0)/(S.t1-S.t0), Y = v=> m.t + ih*(1 - v/mx), path = a=> a.map((v,i)=> (i?"L":"M") + X(T[i]).toFixed(1) + "," + Y(v).toFixed(1)).join("");
    const s = svgEl(w, h, "sim-svg story-svg", def(id).t + ": simulación de " + S.t0 + " a " + S.t1); let g = "";
    M.ticks(mx).forEach(t=> g += '<line class="grid" x1="'+m.l+'" x2="'+(w-m.r)+'" y1="'+Y(t)+'" y2="'+Y(t)+'"/><text class="sim-ax" x="'+(m.l-8)+'" y="'+(Y(t)+5)+'" text-anchor="end">'+(mx >= 1e4 ? M.compact(t) : fmt(t, mx < 1 ? 2 : mx < 10 && t%1 ? 1 : 0))+'</text>');
    const ps = Math.max(1, M.niceStep((S.t1-S.t0)/VW(8, Z > 1.6 ? 2 : 4))); for(let t=Math.ceil(S.t0); t<=S.t1+1e-9; t+=Math.max(1,Math.round(ps))) g += '<text class="sim-ax" x="'+X(t)+'" y="'+(h-10)+'" text-anchor="middle">'+t+'</text>';
    tit.textContent = def(id).t + ", " + uni(id);
    (O && O.ruptura || []).forEach(t=> g += '<line class="sim-rup" x1="'+X(t)+'" x2="'+X(t)+'" y1="'+m.t+'" y2="'+(m.t+ih)+'"/>');
    if(S.presente !== undefined && S.presente < S.t1) g += '<line class="sim-hoy" x1="'+X(S.presente)+'" x2="'+X(S.presente)+'" y1="'+m.t+'" y2="'+(m.t+ih)+'"/><text class="sim-ax" x="'+(X(Math.max(S.presente, ...((O && O.ruptura) || []).filter(t=> t - S.presente < 2)))+6)+'" y="'+(m.t+14)+'">proyección →</text>';
    g += '<path class="sim-band" d="'+path(hi)+lo.map((v,i)=> i).reverse().map(i=> "L"+X(T[i]).toFixed(1)+","+Y(lo[i]).toFixed(1)).join("")+'z"/><path class="sim-base" d="'+path(B)+'"/><path class="sim-cur" d="'+path(V)+'"/>';
    op.forEach(q=> g += '<circle class="sim-obs'+((O.excluir||[]).includes(q[0]) ? " sim-exc" : "")+'" cx="'+X(q[0])+'" cy="'+Y(q[1]*k)+'" r="5.5"/>');
    if(!MOB()){ const y1 = Y(V[nT-1]), y0 = Y(B[nT-1]), ig = Math.abs(y1-y0) < 1; g += '<text class="sim-ax sim-lc" x="'+(w-m.r+8)+'" y="'+(y1+5+(ig || Math.abs(y1-y0) >= 20 ? 0 : y1 < y0 ? -8 : 8))+'">'+(st.esc === "base" ? "Base" : "Elegido")+" "+nf(V[nT-1])+'</text>' + (ig ? "" : '<text class="sim-ax" x="'+(w-m.r+8)+'" y="'+(y0+5+(Math.abs(y1-y0) >= 20 ? 0 : y1 < y0 ? 12 : -12))+'">Base '+nf(B[nT-1])+'</text>'); }
    g += '<line class="sim-marca" y1="'+m.t+'" y2="'+(m.t+ih)+'" x1="0" x2="0"/><circle class="sim-marca-p" r="6"/>';
    s.innerHTML = g;
    const hw = iw/Math.max(1,nT-1);
    T.forEach((t,i)=>{ const r = document.createElementNS(SVGNS,"rect"); r.setAttribute("x", X(t)-hw/2); r.setAttribute("y", m.t); r.setAttribute("width", Math.max(1,hw)); r.setAttribute("height", ih); r.setAttribute("class","col-hit"); if(i % Math.max(1,Math.round(nT/12)) === 0){ r.setAttribute("tabindex","0"); r.setAttribute("role","img"); r.setAttribute("aria-label", nf(t) + ": " + nf(V[i])); }
      bindTip(r, ()=>{ const ob = op.find(q=> Math.abs(q[0]-t) < 1e-6); return "<h5>"+cuando(t)+"</h5><p>Escenario elegido: <b>"+nf(V[i])+"</b><br>Rango: "+nf(lo[i])+" a "+nf(hi[i])+"<br>Base: "+nf(B[i])+(ob ? "<br>Observado: <b>"+nf(ob[1]*k)+"</b>"+((O.excluir||[]).includes(ob[0]) ? " (no se usó para ajustar)" : (O.retener||[]).includes(ob[0]) ? " (reservado para validar)" : "") : "")+"</p><p class='muted'>"+esc(uni(id))+"</p>"; });
      r.addEventListener("click", ()=>{ parar(); st.toc = 1; st.t = i; momento(); }); s.appendChild(r); });
    marca = { l:s.querySelector(".sim-marca"), p:s.querySelector(".sim-marca-p"), X:X, Y:Y, V:V };
    [...box.querySelectorAll("svg.sim-svg")].forEach(x=> x.remove()); box.appendChild(s); momento();
  }
  const fechaT = t=> Math.abs(t - Math.round(t)) < 1e-6 ? String(Math.round(t)) : t.toFixed(2).replace(".", ",");
  const ancho = b=> b.clientWidth > 200 ? Math.max(520, Math.min(1000, b.clientWidth - 40)) : 900; // a la medida de la caja
  const cuando = t=> S.t0 >= 1000 || !S.unidadT ? fechaT(t) : S.unidadT + " " + fechaT(t);
  function momento(){
    const i = Math.min(st.t, nT-1); tr.value = String(i); tl.textContent = cuando(T[i]); tr.setAttribute("aria-valuetext", cuando(T[i]));
    if(marca){ const x = marca.X(T[i]); marca.l.setAttribute("x1",x); marca.l.setAttribute("x2",x); marca.p.setAttribute("cx",x); marca.p.setAttribute("cy",marca.Y(marca.V[i])); }
    keys(S.niveles).forEach(id=>{ const mx = Math.max(...base.v[id], ...cur.v[id]) || 1; tq[id].fill.style.height = (100*cur.v[id][i]/mx).toFixed(1) + "%"; tq[id].v.textContent = nf(cur.v[id][i]*K(id)); });
    if(opt.diagrama && opt.diagrama.svg.isConnected) keys(S.niveles).forEach(id=>{ if(!st.toc) return opt.diagrama.valor(id, null); const mx = Math.max(...base.v[id], ...cur.v[id]) || 1; opt.diagrama.valor(id, cur.v[id][i]/mx, nf(cur.v[id][i]*K(id)) + (indice ? " (índice)" : "") + " · " + cuando(T[i])); });
  }
  function sensibilidad(){
    const id0 = st.ver, k = K(id0), b = cur.v[id0][nT-1]*k, R = tornado(S, id0, st.p).map(r=> Object.assign(r, { a:r.a*k, b:r.b*k })).filter(r=> Math.abs(r.b-r.a) > 1e-9).slice(0,8);
    tb.querySelectorAll("svg").forEach(x=> x.remove());
    if(!R.length){ M.setReading(lecT, "Ningún parámetro incierto cambia el resultado."); return; }
    const w = VW(ancho(tb),380), Z = esc1(), f = VW(Math.round(22+26*Z), Math.round(34+34*Z)), L = VW(Math.round(60+205*Z), Math.round(10+36*Z)), rr = VW(Math.round(10+40*Z), Math.round(10+36*Z)), h = R.length*f + 44, mn = Math.min(b, ...R.map(r=> Math.min(r.a,r.b))), mxx = Math.max(b, ...R.map(r=> Math.max(r.a,r.b))), ext = (mxx-mn)*.14 || 1, x0 = mn-ext*VW(1,.1), x1 = mxx+ext*VW(1,.1), X = v=> L + (w-L-rr)*(v-x0)/(x1-x0);
    const s = svgEl(w, h, "sim-tsvg story-svg", "Sensibilidad del resultado"); tit2.textContent = def(id0).t + " (" + cuando(S.t1) + "), " + uni(id0); let g = '<line class="sim-cero" x1="'+X(b)+'" x2="'+X(b)+'" y1="4" y2="'+(h-24)+'"/><text class="sim-ax" x="'+X(b)+'" y="'+(h-4)+'" text-anchor="middle">'+nf(b)+'</text>'; s.innerHTML = g;
    R.forEach((r,i)=>{ const y = 6 + i*f, by = y + VW(7, 10+Math.round(29*Z)), bh = VW(f-14, 24), q = S.param[r.k], gg = document.createElementNS(SVGNS,"g"), bar = (v,c)=> '<rect class="'+c+'" x="'+Math.min(X(v),X(b))+'" y="'+by+'" width="'+Math.abs(X(v)-X(b))+'" height="'+bh+'"/>', num = v=> '<text class="sim-ax sim-v" x="'+(X(v)+(v < b ? -6 : 6))+'" y="'+(by+bh/2+5)+'" text-anchor="'+(v < b ? "end" : "start")+'">'+nf(v)+'</text>';
      let lb = M.wrapText(q.t, MOB() ? Math.floor(44/(Z/1.42)) : 30); if(lb.length > 2) lb = [lb[0], lb[1] + "…"]; const lh = Math.round(13*Z);
      gg.innerHTML = lb.map((z,n)=> '<text class="sim-lab" x="'+VW(L-Math.round(8+46*Z),6)+'" y="'+VW(by+bh/2+5+(n-(lb.length-1)/2)*lh, by-8-(lb.length-1-n)*lh)+'" text-anchor="'+VW("end","start")+'">'+esc(z)+'</text>').join("") + bar(r.a,"sim-lo") + bar(r.b,"sim-hi") + (Math.abs(r.a-b) > 1e-9 ? num(r.a) : "") + (Math.abs(r.b-b) > 1e-9 ? num(r.b) : "");
      gg.setAttribute("tabindex","0"); gg.setAttribute("role","img"); gg.setAttribute("aria-label", q.t + ": de " + nf(r.a) + " a " + nf(r.b));
      bindTip(gg, ()=> "<h5>"+esc(q.t)+"</h5><p>En "+nf(r.lo)+" "+esc(q.u)+": <b>"+nf(r.a)+"</b><br>En "+nf(r.hi)+" "+esc(q.u)+": <b>"+nf(r.b)+"</b></p><p class='muted'>"+EV[q.ev]+"</p>"); s.appendChild(gg); });
    tb.appendChild(s);
    const q = S.param[R[0].k];
    M.setReading(lecT, "El resultado depende sobre todo de «" + esc(M.lowFirst(q.t)) + "»: entre sus límites, «" + esc(M.lowFirst(def(id0).t)) + "» va de <strong>" + nf(Math.min(R[0].a,R[0].b)) + "</strong> a <strong>" + nf(Math.max(R[0].a,R[0].b)) + "</strong>. " + (q.ev === "sup" ? "Como es un supuesto, medirlo reduciría más la incertidumbre que cualquier otro dato." : "Procedencia: " + M.lowFirst(EV[q.ev]) + ".") + (R.length > 1 ? " Le sigue «" + esc(M.lowFirst(S.param[R[1].k].t)) + "»." : ""));
  }
  function leer(){
    const id = st.ver, k = K(id), i = nT-1, v = cur.v[id][i]*k, b = base.v[id][i]*k, lo = bd.q(id,.05)[i]*k, hi = bd.q(id,.95)[i]*k, e = ESC.find(x=> x.id === st.esc), mov = keys(st.p).filter(q=> st.p[q] !== P0[q]);
    let h = (st.esc === "base" ? "En el escenario base" : e ? "Con «" + esc(M.lowFirst(e.t)) + "»" : "Con los valores elegidos") + ", «" + esc(M.lowFirst(def(id).t)) + "» llega a <strong>" + nf(v) + "</strong> al final (" + cuando(S.t1) + "; " + esc(uni(id)) + "; rango de " + nf(lo) + " a " + nf(hi) + "). ";
    if(st.esc !== "base" && b) h += Math.abs(v/b-1) < .0005 ? "Es lo mismo que en el escenario base. " : "Es " + pct((v/b-1)*100) + " frente al escenario base (" + nf(b) + "). ";
    if(mov.length) h += "Cambió: " + mov.map(q=> esc(M.lowFirst(S.param[q].t)) + " (de " + nf(P0[q]) + " a " + nf(st.p[q]) + ")").join("; ") + ". ";
    h += "La franja recoge los parámetros inciertos, no los errores de la estructura del modelo." + (indice ? " Sirve para comparar escenarios, no para pronosticar." : "");
    M.setReading(lec, h);
  }
  sync(); recalcular();
  const mo = new MutationObserver(()=>{ if(!box.isConnected) return mo.disconnect(); dibujar(); sensibilidad(); }); mo.observe(document.documentElement, { attributes:true, attributeFilter:["data-text"] });
  return { estado:st };
};
})(typeof window !== "undefined" ? window : globalThis);
