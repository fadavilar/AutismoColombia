/* Contenido editorial y tablas resumen de la app "TEA en Colombia".
   Cada cifra proviene del libro de cálculo del proyecto (Inequidad_TEA_Departamentos_v13112026)
   o del documento del proyecto (versión del 18/11/2026). Las cifras por departamento están en
   js/datos.js, generado por scripts/build_data.py. */
window.TEA_CONTENIDO = {
  meta: {
    titulo: "Trastorno del espectro autista (TEA) en Colombia",
    subtitulo: "Atención, oferta de servicios e inequidad territorial con datos públicos",
    corte: "Datos a noviembre de 2026",
    autor: "Fabián Dávila Ramírez, MD, MBA, PhD",
    institucion: "Fundación Universitaria Navarra (UNINAVARRA), Neiva · Especialización en Medicina Familiar",
    proyecto: "Barreras para el diagnóstico oportuno del Trastorno del Espectro Autista (TEA) en Colombia: una revisión sistemática de la literatura",
    version: "v0.1 · 20/11/2026",
    orcid: "https://orcid.org/0000-0002-1678-7288"
  },

  aviso: "Trabajo en construcción con la Fundación Universitaria Navarra (UNINAVARRA). Las cifras son resultados preliminares del componente de datos secundarios del proyecto; la revisión sistemática sigue en curso y los números pueden cambiar cuando se completen la búsqueda, el tamizaje por pares y la verificación de las fuentes oficiales.",

  stats: [
    { value: "51.474", label: "Personas atendidas con F84 en 2024", detail: "RIPS, diagnóstico principal, 33 territorios" },
    { value: "97,8", label: "Por 100.000 habitantes", detail: "Tasa nacional de personas atendidas (2024)" },
    { value: "20 veces", label: "Brecha entre departamentos", detail: "De 12,0 (Guainía) a 240,1 (Atlántico)" },
    { value: "19,9 %", label: "Vive en municipios sin neuropediatría", detail: "10.245 de 51.474 personas atendidas" },
    { value: "590", label: "Sedes con neuropediatría", detail: "REPS 13/11/2026; 4 departamentos sin ninguna" },
    { value: "11,4 %", label: "Atenciones fuera del departamento", detail: "Residentes atendidos en IPS de otro departamento" }
  ],

  panorama: {
    intro: [
      "El TEA es un trastorno del neurodesarrollo con dificultades persistentes en la comunicación y la interacción social y patrones de conducta, intereses o actividades restringidos y repetitivos. La OMS estima que 1 de cada 127 personas tiene autismo y una revisión de 71 estudios situó la mediana mundial de prevalencia en 100 por 10.000.",
      "El diagnóstico puede hacerse de forma estable desde el segundo año de vida, pero en la vigilancia de los CDC de Estados Unidos la mediana de edad al primer diagnóstico fue de 47 meses (2022). En Colombia, la Resolución 3280 de 2018 ordena tamizar con M-CHAT entre los 18 y 30 meses en la consulta de primera infancia.",
      "Esta app muestra lo que dicen los registros públicos del sistema de salud colombiano: cuántas personas se atienden con diagnóstico de TEA (código CIE-10 F84), dónde viven, dónde se atienden, con qué oferta de neuropediatría cuenta cada departamento y qué tan desigual es esa distribución."
    ],
    lectura: "Las tasas son prevalencia tratada (personas con al menos una atención registrada con F84 como diagnóstico principal), no prevalencia del trastorno: no cuentan a quienes no consultan o se registran con otro diagnóstico.",
    sexo: { hombres: 76.3, mujeres: 23.7, n: 53685 },
    edad: [
      { grupo: "0 a 5 años", pct: 16.7 },
      { grupo: "6 a 11 años", pct: 55.2 },
      { grupo: "12 a 17 años", pct: 15.5, derivado: true },
      { grupo: "18 años o más", pct: 12.6 }
    ],
    edadNota: "Tabla de edad y sexo del cubo RIPS 2024 (n = 53.685; excluye personas sin sexo registrado). La edad es la de la atención, no la edad al diagnóstico. El grupo de 12 a 17 años es el complemento de los otros tres (100 − 16,7 − 55,2 − 12,6).",
    regimen: [
      { nombre: "Contributivo", y2024: 35241, y2025: 85940 },
      { nombre: "Subsidiado", y2024: 17876, y2025: 17639 }
    ],
    regimenNota: "Registros persona-régimen, sin deduplicar entre regímenes. En 2025 el número de personas casi se duplica (102.066; 194,0 por 100.000) y el aumento se concentra en el régimen contributivo: coincide con el cambio de reporte al RIPS como soporte de la factura electrónica (Resolución 2275 de 2023) y no se interpreta como un aumento de la prevalencia."
  },

  /* Serie nacional (hoja Serie, resumen por año) */
  serieNacional: [
    { anio: 2019, personas: 23030, tasa: 43.8, gini: 0.261, theil: 0.134, ci: 0.092 },
    { anio: 2020, personas: 18666, tasa: 35.5, gini: 0.283, theil: 0.142, ci: 0.101 },
    { anio: 2021, personas: 26490, tasa: 50.3, gini: 0.268, theil: 0.132, ci: 0.053 },
    { anio: 2022, personas: 32402, tasa: 61.6, gini: 0.290, theil: 0.152, ci: 0.032 },
    { anio: 2023, personas: 43622, tasa: 82.9, gini: 0.281, theil: 0.137, ci: 0.042 },
    { anio: 2024, personas: 51474, tasa: 97.8, gini: 0.240, theil: 0.100, ci: 0.044 },
    { anio: 2025, personas: 102066, tasa: 194.0, gini: 0.269, theil: 0.127, ci: 0.012 }
  ],
  serieNota: "La serie usa la población DANE 2024 como denominador fijo (aproximación). La transición a FEV-RIPS en 2025 rompe la comparabilidad con 2019-2024: 2024 es el año de referencia.",

  /* Hoja Inequidad + Modelos_Python (IC95 % bootstrap, 4.000 réplicas de departamentos) */
  indices: [
    { indicador: "Personas atendidas 2024", gini: 0.240, giniIC: [0.142, 0.314], theil: 0.100, theilIC: [0.037, 0.168], mld: 0.101, ci: 0.044, ciIC: [-0.047, 0.129] },
    { indicador: "Atenciones 2024", gini: 0.486, giniIC: [0.239, 0.589], theil: 0.460, theilIC: [0.104, 0.681], mld: 0.422, ci: 0.027, ciIC: [-0.174, 0.222] },
    { indicador: "Sedes de neuropediatría", gini: 0.381, giniIC: [0.262, 0.478], theil: 0.257, theilIC: [0.132, 0.414], mld: null, ci: -0.190, ciIC: [-0.339, -0.031] },
    { indicador: "Personas atendidas 2025", gini: 0.269, giniIC: [0.152, 0.355], theil: 0.127, theilIC: [0.044, 0.216], mld: 0.129, ci: 0.012, ciIC: [-0.066, 0.129] }
  ],
  indicesNota: "Medidas ponderadas por población entre los 33 territorios. El índice de concentración (Wagstaff) ordena los departamentos de más a menos pobres según el IPM: valores positivos indican más tasa en los menos pobres; negativos, en los más pobres. La MLD no está definida para las sedes porque cuatro departamentos tienen cero.",

  theilRegional: {
    regiones: [
      { region: "Caribe", pob: 12130521, personas: 16983, sedes: 296, tasa: 140.0, sedes100k: 2.44 },
      { region: "Bogotá", pob: 7918660, personas: 8719, sedes: 80, tasa: 110.1, sedes100k: 1.01 },
      { region: "Oriental", pob: 9966135, personas: 9121, sedes: 60, tasa: 91.5, sedes100k: 0.60 },
      { region: "Central", pob: 12486760, personas: 10272, sedes: 98, tasa: 82.3, sedes100k: 0.78 },
      { region: "Pacífica", pob: 8567038, personas: 5473, sedes: 44, tasa: 63.9, sedes100k: 0.51 },
      { region: "Amazonía-Orinoquía", pob: 1544639, personas: 906, sedes: 12, tasa: 58.7, sedes100k: 0.78 }
    ],
    total: 0.100328, entre: 0.037529, dentro: 0.062799, pctEntre: 37.4
  },

  otrasMedidas: [
    { k: "Mediana de las tasas departamentales", v: "79,0 por 100.000" },
    { k: "Razón máximo/mínimo", v: "20,0" },
    { k: "Razón percentil 90 / percentil 10", v: "4,77" },
    { k: "Razón percentil 75 / percentil 25", v: "2,00" },
    { k: "Disimilitud personas atendidas vs. sedes", v: "0,233 (IC95 % 0,124 a 0,350)" },
    { k: "Disimilitud población vs. sedes", v: "0,285" },
    { k: "Disimilitud población vs. personas atendidas", v: "0,173" },
    { k: "Gini de personas atendidas sin Atlántico", v: "0,197 (Theil 0,065)" }
  ],

  /* Regresión cuasi-Poisson ecológica (offset ln población; n = 33) */
  modelos: [
    { var: "IPM (por +10 puntos porcentuales)", modelo: "A", rr: 0.71, lo: 0.55, hi: 0.92, p: "0,010" },
    { var: "Sedes por 100.000 hab. (por +1)", modelo: "A", rr: 1.32, lo: 1.14, hi: 1.53, p: "< 0,001" },
    { var: "IPM (+10 pp), ajustado por Bogotá", modelo: "B", rr: 0.70, lo: 0.53, hi: 0.94, p: "0,017" },
    { var: "Sedes/100.000, ajustado por Bogotá", modelo: "B", rr: 1.32, lo: 1.13, hi: 1.54, p: "< 0,001" },
    { var: "Bogotá D.C. (indicadora)", modelo: "B", rr: 0.95, lo: 0.63, hi: 1.42, p: "0,80" }
  ],
  modelosNota: "Sensibilidad sin Atlántico: RR del IPM 0,79 (p = 0,027) y de las sedes 1,21 (p = 0,006). Índices de pendiente según IPM: personas atendidas RII 1,30 (IC95 % 0,73 a 2,31); sedes RII 0,31 (0,14 a 0,69).",

  correlaciones: [
    { par: "Tasa de personas atendidas ~ sedes por 100.000", rho: 0.648, p: "< 0,001" },
    { par: "Atenciones por persona ~ sedes por 100.000", rho: 0.548, p: "0,001" },
    { par: "Sedes por 100.000 ~ IPM", rho: 0.030, p: "0,87" },
    { par: "Atenciones por persona ~ IPM", rho: 0.080, p: "0,66" },
    { par: "Tasa de personas atendidas ~ IPM", rho: -0.416, p: "0,016" },
    { par: "Tasa de personas atendidas ~ % atenciones fuera del dpto.", rho: -0.503, p: "0,003" },
    { par: "Sedes por 100.000 ~ % atenciones fuera del dpto.", rho: -0.530, p: "0,002" }
  ],

  hallazgos: [
    { t: "La atención registrada es desigual, y más dentro de las regiones que entre ellas", d: "La tasa varía 20 veces entre departamentos. El 62,6 % de la desigualdad (Theil) ocurre entre departamentos de una misma región; un análisis solo regional ocultaría la mayor parte." },
    { t: "La oferta de neuropediatría no sigue la pobreza", d: "Varios departamentos pobres del Caribe tienen más sedes por habitante, mientras que en la Amazonía-Orinoquía la mitad de los departamentos no tiene ninguna sede (Amazonas, Guainía, Vaupés y Vichada)." },
    { t: "Tener sedes es necesario, pero no suficiente", d: "La tasa de personas atendidas aumenta con la oferta (RR 1,32 por cada sede adicional por 100.000) y disminuye con la pobreza aun a igual oferta (RR 0,71 por cada 10 puntos de IPM)." }
  ],
  hallazgosNota: "Lectura del equipo del proyecto a partir de datos ecológicos: son hipótesis para orientar la revisión sistemática, no conclusiones causales.",

  huila: {
    texto: [
      "UNINAVARRA tiene sede en Neiva, por eso el proyecto incluye una lectura para el Huila.",
      "En 2024 el Huila registró 944 personas atendidas con F84 (79,0 por 100.000), por debajo de la tasa nacional (97,8). Contaba con 9 sedes con neuropediatría (0,75 por 100.000), el 18,8 % de las personas atendidas vivía en municipios sin sede y el 15,8 % de las atenciones de sus residentes se prestó fuera del departamento.",
      "Casi la mitad de esas atenciones fuera del Huila (832 de 1.695) se prestaron en Bogotá D.C. El número de personas atendidas pasó de 333 en 2019 a 944 en 2024."
    ]
  },

  normativa: {
    ley2628: {
      nombre: "Ley 2628 de 2026",
      fecha: "26 de agosto de 2026 · Diario Oficial No. 53.604",
      objeto: "Establece medidas, servicios y mecanismos de atención integral para la protección e inclusión de las personas con TEA, trastornos del neurodesarrollo y condiciones similares, en salud, educación, trabajo y vida en comunidad, y busca un diagnóstico pronto y eficaz.",
      url: "https://dapre.presidencia.gov.co/normativa/normativa/LEY%20No.%202628%20DEL%2026%20DE%20AGOSTO%20DE%202026.pdf",
      urlCompilada: "https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_2628_2026.htm",
      articulos: [
        { art: "Art. 4", tema: "Política pública", d: "El Ministerio de Salud creará la política pública de atención, acompañamiento y protección para personas con TEA; departamentos, distritos y municipios deberán desarrollarla.", plazoMeses: 12, eje: "salud" },
        { art: "Art. 6", tema: "Investigación y protocolo", d: "El Ministerio de Salud, con el Instituto Nacional de Salud, desarrollará investigación para actualizar el Protocolo Clínico de Atención.", plazoMeses: null, eje: "salud" },
        { art: "Art. 7", tema: "Certificado Único de Trastorno del Neurodesarrollo", d: "Centros especializados certificarán en un término de dos meses desde que la EPS recibe el diagnóstico. El trámite es voluntario y no puede usarse como barrera de acceso a servicios de salud.", plazoMeses: null, plazoTexto: "2 meses por caso", eje: "salud" },
        { art: "Art. 7, par. 2", tema: "Ruta de atención", d: "El Ministerio de Salud establecerá la ruta dentro del año siguiente a la vigencia de la ley.", plazoMeses: 12, eje: "salud" },
        { art: "Art. 8", tema: "Estadísticas", d: "El DANE incluirá parámetros para identificar a estas personas en los censos; los ministerios de Salud y de Educación harán seguimiento y conteo estadístico en sus bases de datos.", plazoMeses: null, eje: "informacion" },
        { art: "Art. 9", tema: "Contenido mínimo de la política", d: "Actualizar el protocolo clínico de diagnóstico, tratamiento y ruta de atención de niños, niñas y adolescentes con TEA; equipo interdisciplinario; guía de atención integral en el curso de vida; suficiencia de medicamentos.", plazoMeses: null, eje: "salud" },
        { art: "Art. 10", tema: "Comité Nacional de Inclusión", d: "Presidido por el ministro de Salud; se reúne al menos dos veces al año e informa cada año a las Comisiones Séptimas del Congreso. Debe reglamentarse en seis meses.", plazoMeses: 6, eje: "gobernanza" },
        { art: "Art. 12", tema: "Detección temprana", d: "Se propenderá por la detección y atención temprana mediante la remisión de los profesionales en las evaluaciones pediátricas periódicas.", plazoMeses: null, eje: "salud" },
        { art: "Art. 13", tema: "Ruta de Atención Médica", d: "El Ministerio de Salud establecerá y coordinará una ruta de atención médica clara y pública.", plazoMeses: null, eje: "salud" },
        { art: "Art. 14", tema: "Capacitación en salud", d: "Programa nacional de capacitación y sensibilización para el trato en salud; el personal de atención primaria en relación directa con personas con TEA deberá capacitarse y constará en el RETHUS.", plazoMeses: 12, eje: "salud" },
        { art: "Arts. 15 a 18", tema: "Educación inclusiva", d: "Ruta de inclusión escolar, cupos mínimos, capacitación docente y un módulo en el sistema de matrícula para consolidar la información.", plazoMeses: null, eje: "educacion" },
        { art: "Arts. 19 a 23", tema: "Familia, cuidadores y trabajo", d: "Apoyo y flexibilidad laboral para familiares, campañas de sensibilización, inserción laboral (Ministerio del Trabajo y SENA) y emprendimiento.", plazoMeses: null, eje: "social" },
        { art: "Art. 24", tema: "2 de abril", d: "Los ministerios de Salud y de Educación realizarán actividades cada 2 de abril.", plazoMeses: null, eje: "social" }
      ],
      nota: "Resumen propio de los artículos a partir de la copia compilada en el normograma del MinTIC; para efectos legales consulte el texto oficial. Las fechas límite de la línea de tiempo son una estimación que cuenta los plazos desde la sanción (26/08/2026)."
    },
    pnsm: {
      nombre: "Política Nacional de Salud Mental 2024-2033",
      emisor: "Ministerio de Salud y Protección Social, 2024",
      url: "https://www.colpsic.org.co/wp-content/uploads/2025/09/Politica-Nacional-de-Salud-Mental-2024-2033-MinSalud-Colombia-v1.pdf",
      objetivo: "Garantizar la salud mental individual, familiar y colectiva como un derecho humano universal, mediante ejes estratégicos y transversales, la Atención Primaria en Salud (APS) y la Red Mixta en Salud Mental, con enfoques poblacional, interseccional y territorial.",
      ejes: [
        { n: 1, nombre: "Promoción de la salud mental" },
        { n: 2, nombre: "Prevención de problemas, trastornos de la salud mental y epilepsia" },
        { n: 3, nombre: "Atención integral de los problemas y trastornos mentales" },
        { n: 4, nombre: "Rehabilitación integral e inclusión social" },
        { n: 5, nombre: "Gestión, articulación y coordinación sectorial y transectorial" }
      ],
      neurodesarrollo: [
        { pag: 16, d: "Define los trastornos del neurodesarrollo como variaciones de los circuitos cerebrales que se manifiestan desde la infancia y suelen acompañar a la persona toda la vida, como el autismo, el TDAH y las discapacidades del aprendizaje." },
        { pag: 60, d: "En el eje 2, la prevención secundaria busca la identificación temprana y la detección oportuna de los problemas y trastornos de salud mental." },
        { pag: 65, d: "El Ministerio promoverá una estrategia para la prevención e identificación temprana de la epilepsia y de otros trastornos neurológicos y del neurodesarrollo, con diagnóstico y tratamiento oportunos." }
      ],
      contexto: "Actualiza la política adoptada por la Resolución 4886 de 2018, en cumplimiento del artículo 166 de la Ley 2294 de 2023 (Plan Nacional de Desarrollo 2022-2026), y se alinea con el Plan Decenal de Salud Pública 2022-2031.",
      nota: "Copia del documento alojada por el Colegio Colombiano de Psicólogos; las páginas citadas corresponden a esa copia."
    },
    minsalud: {
      nombre: "Salud mental · Ministerio de Salud y Protección Social",
      url: "https://www.minsalud.gov.co/salud/publica/salud-mental",
      temas: ["Línea 106: orientación, apoyo en crisis y gestión del riesgo", "Prevención del suicidio", "Salud mental comunitaria", "Trastornos asociados", "Observatorio de Salud Mental (SISPRO)", "Encuesta Nacional de Salud Mental", "Política de Salud Mental", "Guías y documentos técnicos (mhGAP, primeros auxilios psicológicos)"]
    },
    res3280: {
      nombre: "Resolución 3280 de 2018 (RIAS de promoción y mantenimiento de la salud)",
      d: "Ordena el tamizaje con M-CHAT entre los 18 y 30 meses en la consulta de primera infancia, con derivación a atención resolutiva ante resultados alterados.",
      url: "https://www.minsalud.gov.co/Normatividad_Nuevo/Resoluci%C3%B3n%20No.%203280%20de%2020183280.pdf"
    }
  },

  revision: {
    pregunta: "¿Cuáles son las barreras que enfrentan los profesionales de la salud y las familias durante el proceso de diagnóstico del TEA en el contexto de la atención primaria en Colombia?",
    pcc: [
      { k: "Población", d: "Personas que viven con TEA, de cualquier edad, con análisis por grupos etarios; también estudios sobre cuidadores y profesionales de salud que describan barreras para el diagnóstico." },
      { k: "Concepto", d: "Diagnóstico temprano y oportunidad del diagnóstico del TEA, y barreras para el diagnóstico oportuno (institucionales, sociales, económicas, culturales o del sistema de salud)." },
      { k: "Contexto", d: "Colombia, el SGSSS y los determinantes sociales de la salud (nivel socioeconómico, régimen de aseguramiento, ruralidad, pertenencia étnica, educación de los cuidadores)." }
    ],
    metodos: "Revisión sistemática de métodos mixtos con reporte PRISMA 2020, evaluación de calidad con JBI y MMAT y síntesis sin metaanálisis (SWiM). Búsqueda en PubMed, LILACS, SciELO y Embase (corte: 12/11/2026); el protocolo se registrará en PROSPERO.",
    prisma: {
      bases: [ { base: "PubMed", n: 34 }, { base: "LILACS", n: 71 }, { base: "SciELO", n: 29 }, { base: "Embase", n: 251 } ],
      identificados: 385, duplicados: 92, tamizados: 293, excluidos: 280, textoCompleto: 13,
      motivos: [
        { m: "Sin datos de Colombia o sin foco en diagnóstico oportuno o barreras", n: 92 },
        { m: "Estudios biomédicos, genéticos o en población sin TEA", n: 90 },
        { m: "Intervención, tratamiento o educación", n: 44 },
        { m: "Resúmenes de congreso", n: 40 },
        { m: "Publicados antes de 2010", n: 14 }
      ]
    },
    prismaNota: "Cifras preliminares: se actualizarán al completar Redalyc, la repetición de LILACS y de SciELO desde 2010, la literatura gris y el tamizaje independiente por dos revisores."
  },

  metodologia: {
    fuentes: [
      { k: "RIPS (SISPRO)", d: "Personas y atenciones con diagnóstico principal F84 (CIE-10) por departamento y municipio de residencia y por departamento de la IPS, 2019-2025. Año de referencia: 2024." },
      { k: "REPS", d: "Sedes con el servicio 388 (neuropediatría) habilitado, con telemedicina y de naturaleza pública; corte del 13/11/2026." },
      { k: "DANE", d: "Proyección de población 2024 por departamento e Índice de Pobreza Multidimensional (IPM) 2024." }
    ],
    unidad: "Estudio ecológico transversal: 33 territorios (32 departamentos y Bogotá D.C.). Los registros con residencia desconocida se excluyen de las tasas (en 2024, 2.893 personas y 37.271 atenciones).",
    medidas: "Gini, Theil T y desviación logarítmica media ponderados por población, con descomposición entre y dentro de regiones; índice de concentración según IPM; índices de pendiente (SII/RII); disimilitud; correlaciones de Spearman y regresión cuasi-Poisson con offset de población; IC por bootstrap (4.000 réplicas) y jackknife.",
    limitaciones: [
      "El análisis es ecológico: las asociaciones entre departamentos no se pueden atribuir a las personas ni demuestran causalidad.",
      "El RIPS registra atenciones facturadas con F84 como diagnóstico principal; las tasas son prevalencia tratada, no carga de enfermedad.",
      "La transición al RIPS como soporte de la factura electrónica (2025) rompe la comparabilidad de la serie.",
      "Las sedes REPS indican habilitación, no capacidad, tiempos de espera ni disponibilidad real, y su corte (2026) difiere del año de las atenciones (2024).",
      "La población 2024 se tomó de una fuente secundaria que reproduce las proyecciones del DANE; junto con el IPM está pendiente de verificación contra la tabla oficial.",
      "Con 33 unidades los intervalos son amplios y los índices son sensibles a valores atípicos como Atlántico.",
      "No se calcularon tasas por régimen por falta de denominadores de afiliados verificados."
    ]
  },

  fuentes: [
    { grupo: "Normativa y política pública", items: [
      { label: "Ley 2628 de 2026 (Presidencia de la República)", url: "https://dapre.presidencia.gov.co/normativa/normativa/LEY%20No.%202628%20DEL%2026%20DE%20AGOSTO%20DE%202026.pdf" },
      { label: "Ley 2628 de 2026, texto compilado (normograma MinTIC)", url: "https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_2628_2026.htm" },
      { label: "Política Nacional de Salud Mental 2024-2033 (MinSalud)", url: "https://www.colpsic.org.co/wp-content/uploads/2025/09/Politica-Nacional-de-Salud-Mental-2024-2033-MinSalud-Colombia-v1.pdf" },
      { label: "Salud mental, Ministerio de Salud y Protección Social", url: "https://www.minsalud.gov.co/salud/publica/salud-mental" },
      { label: "Resolución 3280 de 2018 (RIAS)", url: "https://www.minsalud.gov.co/Normatividad_Nuevo/Resoluci%C3%B3n%20No.%203280%20de%2020183280.pdf" }
    ]},
    { grupo: "Fuentes de datos", items: [
      { label: "SISPRO, Sistema Integrado de Información de la Protección Social", url: "https://www.sispro.gov.co/" },
      { label: "REPS, Registro Especial de Prestadores de Servicios de Salud", url: "https://prestadores.minsalud.gov.co/habilitacion/" },
      { label: "DANE, proyecciones de población", url: "https://www.dane.gov.co/index.php/estadisticas-por-tema/demografia-y-poblacion/proyecciones-de-poblacion" },
      { label: "DANE, pobreza multidimensional", url: "https://www.dane.gov.co/index.php/estadisticas-por-tema/pobreza-y-condiciones-de-vida/pobreza-multidimensional" }
    ]},
    { grupo: "Literatura citada", items: [
      { label: "OMS. Autismo (nota descriptiva)", url: "https://www.who.int/es/news-room/fact-sheets/detail/autism-spectrum-disorders" },
      { label: "Zeidan J et al. Global prevalence of autism. Autism Res. 2022", url: "https://doi.org/10.1002/aur.2696" },
      { label: "García-Zambrano S, Pinto-Ocampo RH. How many autistic children are there in Colombia? J Autism Dev Disord. 2024", url: "https://doi.org/10.1007/s10803-024-06534-9" },
      { label: "Shaw KA et al. ADDM Network, 2022. MMWR Surveill Summ. 2025", url: "https://doi.org/10.15585/mmwr.ss7402a1" },
      { label: "Pierce K et al. Diagnostic stability from 12 months. JAMA Pediatr. 2019", url: "https://doi.org/10.1001/jamapediatrics.2019.0624" },
      { label: "Wieckowski AT et al. Early and repeated screening. J Pediatr. 2021", url: "https://doi.org/10.1016/j.jpeds.2021.03.009" },
      { label: "Hyman SL et al. AAP clinical report on ASD. Pediatrics. 2020", url: "https://doi.org/10.1542/peds.2019-3447" },
      { label: "Paula CS et al. Barriers to care in six Latin American countries. Autism. 2020", url: "https://doi.org/10.1177/1362361320940073" },
      { label: "Smith-Young J et al. Barriers to ASD diagnostic services. JBI Evid Synth. 2025", url: "https://doi.org/10.11124/JBIES-23-00332" },
      { label: "Page MJ et al. PRISMA 2020. BMJ. 2021", url: "https://doi.org/10.1136/bmj.n71" },
      { label: "Benchimol EI et al. RECORD statement. PLoS Med. 2015", url: "https://doi.org/10.1371/journal.pmed.1001885" },
      { label: "Wagstaff A et al. On the measurement of inequalities in health. Soc Sci Med. 1991", url: "https://doi.org/10.1016/0277-9536(91)90212-U" }
    ]},
    { grupo: "Otras apps del autor", items: [
      { label: "HealthFactAnalytics: apps abiertas", url: "https://sites.google.com/view/healtyanalytics/inicio" }
    ]}
  ]
};
