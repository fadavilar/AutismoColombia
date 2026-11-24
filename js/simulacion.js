/* Simulación del modelo de dinámica de sistemas (mismos ids que js/dinamica.js).
   Solo se simula la parte con datos; el resto del diagrama sigue siendo conceptual.
   Procedencia (ev): dato | lit | norma (con fuente) · cal (ajustado a la serie) · sup (supuesto con rango) · dec (decisión que se explora). */
(function(){
"use strict";
const C0 = 23030, NORMA = 2027; // personas atendidas en 2019; año desde el que actúan las decisiones
const desde = (t, v)=> t >= NORMA ? v : 1;
/* valores del comienzo (2019): despejados para que el año inicial sea coherente */
const v20  = p=> p.cap0 * (p.w0 - p.tau) / p.w0;                       // confirmaciones por año
const s20  = p=> v20(p) * p.w0;                                        // espera = personas en fila ÷ salidas (ley de Little)
const s10  = p=> p.pob * p.prev / 1e5 - C0 - s20(p);                   // esperadas menos atendidas menos en espera
const horas = p=> p.cap0 * p.hd + C0 * p.at * p.ha;                    // horas de los equipos en 2019
const exp0 = p=> C0 / (C0 + p.ke);
const conf0 = 0.5;
window.TEA_SIMULACION = {
  titulo: "Oportunidad del diagnóstico de TEA", unidadT: "año", t0: 2019, t1: 2032, dt: 1/32, salida: 0.5, presente: 2024, rupturaT: "Cambio de registro (FEV-RIPS)",
  refs: {
    gbd: { t: "Santomauro et al., 2025", u: "https://doi.org/10.1016/S2215-0366(24)00363-8" },
    gal: { t: "Galliver et al., 2017", u: "https://doi.org/10.1136/bmjpo-2017-000052" },
    tal: { t: "Talero-Gutiérrez et al., 2012", u: "https://doi.org/10.1016/j.nrleng.2012.03.001" },
    sam: { t: "Sampedro-Tobón et al., 2013", u: "https://www.medigraphic.com/pdfs/bmhim/hi-2013/hi136f.pdf" },
    gut: { t: "Gutiérrez-Ruiz, 2019", u: "https://doi.org/10.21615/cesp.12.2.2" }
  },
  param: {
    pob:  { t: "Población del país", u: "habitantes", v: 52613753, ev: "dato", fuente: "DANE, proyección 2024 (fija en todo el periodo)" },
    prev: { t: "Prevalencia de autismo", u: "por 100.000 habitantes", v: 788.3, min: 663.8, max: 927.2, ev: "lit", ref: "gbd" },
    at:   { t: "Atenciones por persona al año", u: "atenciones por persona", v: 12.1, ev: "dato", fuente: "RIPS 2024: 625.010 ÷ 51.474" },
    el:   { t: "Respuesta de la oferta a la demanda", u: "% de sedes por cada 1 % de personas", v: 0.83, min: 0.60, max: 1.06, ev: "dato", fuente: "Regresión log-log entre 29 departamentos con sede (REPS 2026 y RIPS 2024); rango: IC95 %" },
    hd:   { t: "Horas de equipo por evaluación", u: "horas", v: 13, min: 9.6, max: 15.5, ev: "lit", ref: "gal" },
    w0:   { t: "Espera en 2019", u: "años", v: 1.37, min: 0.8, max: 2, ev: "lit", ref: ["gut", "sam", "tal"], fuente: "Aproximación: meses entre la primera preocupación y el diagnóstico en tres centros (Cartagena 9,6; Medellín 16,4; Bogotá 24); se usa la mediana" },
    cap0: { t: "Evaluaciones posibles en 2019", u: "evaluaciones por año", v: 5563, min: 2000, max: 12000, b0: 4265, b1: 7170, ev: "cal", fuente: "Ajustado a las personas atendidas de 2021 a 2024" },
    ha:   { t: "Horas de los equipos de diagnóstico por atención", u: "horas", v: 0.25, min: 0.1, max: 0.5, ev: "sup" },
    to:   { t: "Demora en ampliar la oferta", u: "años", v: 2, min: 1, max: 4, ev: "sup" },
    te:   { t: "Demora en ganar experiencia", u: "años", v: 2, min: 1, max: 4, ev: "sup" },
    ke:   { t: "Pacientes con los que la experiencia llega a la mitad", u: "personas", v: 50000, min: 15000, max: 150000, ev: "sup" },
    en:   { t: "Personas que entran a la espera por cada una que salía (2019)", u: "personas", v: 1, min: 0.8, max: 1.4, ev: "sup" },
    tau:  { t: "Duración mínima del proceso", u: "años", v: 0.25, min: 0.1, max: 0.5, ev: "sup" },
    th:   { t: "Espera en la que la oportunidad cae a un tercio", u: "años", v: 2, min: 1, max: 3, ev: "sup" },
    de:   { t: "Peso de la confianza en la consulta", u: "0 a 1", v: 0.3, min: 0, max: 0.6, ev: "sup" },
    xd:   { t: "Detección y remisión", u: "× la base", v: 1, min: 0.5, max: 2, paso: 0.05, mando: 1, ev: "dec" },
    xo:   { t: "Oferta de equipos de diagnóstico", u: "× la base", v: 1, min: 0.75, max: 2, paso: 0.05, mando: 1, ev: "dec" },
    xh:   { t: "Tiempo de los equipos de diagnóstico en cada atención", u: "× la base", v: 1, min: 0.5, max: 1.25, paso: 0.05, mando: 1, ev: "dec" }
  },
  niveles: {
    s1: { t: "Personas con TEA sin diagnóstico", u: "personas", v0: s10, ev: "lit", ref: "gbd" },
    s2: { t: "Personas en espera de evaluación", u: "personas", v0: s20, ev: "sup" },
    c:  { t: "Pacientes con diagnóstico de TEA", u: "personas", v0: C0, ev: "dato", fuente: "RIPS 2019: personas atendidas con F84 y residencia conocida" }
  },
  retardos: {
    exp: { t: "Experiencia del primer nivel", u: "0 a 1", tau: p=> p.te, f: (x, p, t, H)=> H.sat(x.c, p.ke) },
    ofe: { t: "Oferta de equipos de diagnóstico", u: "veces la de 2019", tau: p=> p.to, v0: 1, f: (x, p, t)=> Math.pow(x.dem / C0, p.el) * desde(t, p.xo) }
  },
  aux: {
    dem:  { t: "Demanda registrada", u: "personas por año", f: x=> x.c },
    aten: { t: "Atenciones a pacientes", u: "atenciones por año", f: (x, p)=> p.at * x.c },
    // horas que quedan después de atender, convertidas en evaluaciones; siempre queda al menos el 3 %
    cap:  { t: "Capacidad libre para diagnosticar", u: "evaluaciones por año", f: (x, p, t)=>{ const h = horas(p) * x.ofe, o = p.ha * desde(t, p.xh) * x.aten; return Math.max(0.03 * h, h - o) / p.hd; } },
    tie:  { t: "Tiempo de espera", u: "años", f: (x, p)=> p.tau + x.s2 / x.cap },
    opor: { t: "Oportunidad del diagnóstico", u: "0 a 1", f: (x, p, t, H)=> H.dec(x.tie, p.th) },
    conf: { t: "Confianza y recursos de la familia", u: "0 a 1", f: (x, p, t, H)=> H.ese(x.opor, H.dec(p.w0, p.th), 3) },
    brecha: { t: "Brecha diagnóstica percibida", u: "0 a 1", f: (x, p)=> 1 - x.c / (p.pob * p.prev / 1e5) }
  },
  flujos: {
    v1: { t: "Detección y remisión", u: "personas por año", de: "s1", a: "s2", f: (x, p, t)=> p.en * v20(p) * (x.s1 / s10(p)) * (x.exp / exp0(p)) * (1 + p.de * (x.conf / conf0 - 1)) * desde(t, p.xd) },
    v2: { t: "Confirmación del diagnóstico", u: "personas por año", de: "s2", a: "c", f: (x, p)=> x.s2 / (p.tau + x.s2 / x.cap) }
  },
  observado: { c: { fuente: "RIPS, personas atendidas con F84 y residencia conocida", pts: [[2019,23030],[2020,18666],[2021,26490],[2022,32402],[2023,43622],[2024,51474],[2025,102066]], excluir: [2019, 2020, 2025], ruptura: [2024.5] } },
  resultado: { id: "c" }, robustez: ["c", "tie"],
  ver: ["c", "s2", "tie", "opor", "cap", "v1", "v2"],
  escenarios: [
    { id: "det", t: "Más detección", d: "Desde 2027 la detección y la remisión suben a 1,5 veces (tamizaje de la Resolución 3280 y capacitación de la Ley 2628).", p: { xd: 1.5 } },
    { id: "ofe", t: "Más oferta", d: "Desde 2027 la oferta de equipos tiende a 1,5 veces la del escenario base (equipos interdisciplinarios de la Ley 2628), con su demora.", p: { xo: 1.5 } },
    { id: "rep", t: "Tareas distribuidas", d: "Desde 2027 los equipos que diagnostican dedican 20 % menos horas a cada atención, porque otras disciplinas asumen una parte.", p: { xh: 0.8 } },
    { id: "amb", t: "Detección y oferta a la vez", d: "Desde 2027 la detección y la oferta suben juntas a 1,5 veces.", p: { xd: 1.5, xo: 1.5 } }
  ],
  faltan: [
    "Personas con diagnóstico nuevo en cada año (los registros cuentan personas atendidas, no diagnósticos nuevos)",
    "Personas en espera de evaluación y tiempo entre la remisión y la confirmación, por año y territorio",
    "Edad a la primera preocupación y edad al diagnóstico, con cobertura nacional",
    "Horas de los equipos que diagnostican: cuántas hay y cómo se reparten entre evaluar y atender",
    "Sedes habilitadas por año (el REPS usado aquí es un solo corte)",
    "Una serie con el registro FEV-RIPS de al menos cinco años comparables"
  ],
  nota: "Modelo determinista, con integración de Euler y paso de 1/32 de año. Simula 14 de las 18 variables del diagrama y cinco de sus siete bucles (R2, R3, R4, B1 y B2); el reconocimiento social (R1) y el cierre de la brecha (B3) siguen siendo conceptuales, porque no se encontraron datos para cuantificarlos y la serie nacional no permite separarlos de los demás. Supuestos de estructura: población fija, sin nacimientos, muertes ni salidas; las personas atendidas en el año representan a quienes tienen diagnóstico; las atenciones por persona no cambian de un año a otro; la oferta cambia de forma continua aunque una sede se abra por saltos; y siempre queda al menos el 3 % de las horas para evaluar. No se usaron para ajustar 2019 (es el punto de partida), 2020 (caída de atenciones en el primer año de la pandemia) ni 2025 (cambio de registro). El modelo no reproduce la caída de 2020 ni toda la aceleración posterior. Las magnitudes de los escenarios son ilustrativas. Los umbrales para llamar calibrada a una simulación (cinco puntos y error medio de 20 % o menos) son convenciones."
};
})();
