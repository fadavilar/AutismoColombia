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
    uninavarraUrl: "https://www.uninavarra.edu.co/",
    institucion: "Fundación Universitaria Navarra (UNINAVARRA), Neiva · Especialización en Medicina Familiar",
    proyecto: "Barreras para el diagnóstico oportuno del Trastorno del Espectro Autista (TEA) en Colombia: una revisión sistemática de la literatura",
    version: "v0.1 · 20/11/2026",
    orcid: "https://orcid.org/0000-0002-1678-7288"
  },

  aviso: "Análisis preliminar de datos públicos (SISPRO-RIPS, REPS y DANE) y del marco normativo, en construcción con la Fundación Universitaria Navarra (UNINAVARRA). Las cifras provienen del componente de datos secundarios del proyecto; la revisión sistemática sigue en curso y los números pueden cambiar cuando se completen la búsqueda, el tamizaje por pares y la verificación de las fuentes oficiales.",

  equipo: [
    { nombre: "Leydi Hernández", rol: "estudiante, Especialización en Medicina Familiar" },
    { nombre: "Wilmer Esquivel", rol: "estudiante, Especialización en Medicina Familiar" },
    { nombre: "Jhonatan Andrés Portes", rol: "tutor del proyecto" },
    { nombre: "Fabián Dávila Ramírez", rol: "docente de investigación; análisis de datos y app" }
  ],

  ipmDef: "El Índice de Pobreza Multidimensional (IPM) del DANE mide el porcentaje de personas que viven en hogares con privaciones simultáneas en cinco dimensiones: condiciones educativas del hogar, condiciones de la niñez y la juventud, trabajo, salud, y acceso a servicios públicos y condiciones de la vivienda (15 indicadores). Un hogar se considera pobre si tiene privaciones en al menos el 33 % de los indicadores ponderados. Un IPM de 70 % (Vichada) significa que 7 de cada 10 personas del departamento viven en hogares pobres; uno de 5 % (Bogotá), que lo es 1 de cada 20.",

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
    { t: "Se atiende 20 veces más en unos departamentos que en otros", d: "La tasa de personas atendidas va de 12,0 por 100.000 en Guainía a 240,1 en Atlántico (nacional 97,8). Las tasas más bajas están en la Amazonía-Orinoquía y la región Pacífica.", sec: "territorio" },
    { t: "La intensidad de la atención es aún más desigual que la cobertura", d: "Las atenciones por persona van de 3,6 (Antioquia) a 26,4 (Atlántico); las atenciones están más concentradas entre departamentos (Gini 0,486) que las personas atendidas (0,240).", sec: "intensidad" },
    { t: "La oferta de neuropediatría no sigue la pobreza", d: "Varios departamentos pobres del Caribe tienen muchas sedes por habitante, mientras que cuatro departamentos de la Amazonía-Orinoquía no tienen ninguna (Amazonas, Guainía, Vaupés y Vichada).", sec: "oferta" },
    { t: "Más oferta, más atención; más pobreza, menos atención", d: "La tasa aumenta 1,32 veces por cada sede adicional por 100.000 habitantes y es 0,71 veces la de referencia por cada 10 puntos más de IPM, aun a igual oferta: tener sedes es necesario, pero no suficiente.", sec: "pobreza" },
    { t: "Uno de cada cinco vive donde no hay neuropediatría", d: "El 19,9 % de las personas atendidas vive en municipios sin sede; en Guainía el 100 % de las atenciones se presta fuera del departamento y Bogotá recibe 20.703 atenciones netas de otros territorios.", sec: "movilidad" },
    { t: "La desigualdad está más dentro de las regiones que entre ellas", d: "El 62,6 % de la desigualdad (Theil) ocurre entre departamentos de una misma región; un análisis solo regional ocultaría la mayor parte.", sec: "desigualdad" }
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
        { ancla: "4", art: "Art. 4", tema: "Política pública", d: "El Ministerio de Salud creará la política pública de atención, acompañamiento y protección para personas con TEA; departamentos, distritos y municipios deberán desarrollarla.", plazoMeses: 12, eje: "salud" },
        { ancla: "6", art: "Art. 6", tema: "Investigación y protocolo", d: "El Ministerio de Salud, con el Instituto Nacional de Salud, desarrollará investigación para actualizar el Protocolo Clínico de Atención.", plazoMeses: null, eje: "salud" },
        { ancla: "7", art: "Art. 7", tema: "Certificado Único de Trastorno del Neurodesarrollo", d: "Centros especializados certificarán en un término de dos meses desde que la EPS recibe el diagnóstico. El trámite es voluntario y no puede usarse como barrera de acceso a servicios de salud.", plazoMeses: null, plazoTexto: "2 meses por caso", eje: "salud" },
        { ancla: "7", art: "Art. 7, par. 2", tema: "Ruta de atención", d: "El Ministerio de Salud establecerá la ruta dentro del año siguiente a la vigencia de la ley.", plazoMeses: 12, eje: "salud" },
        { ancla: "8", art: "Art. 8", tema: "Estadísticas", d: "El DANE incluirá parámetros para identificar a estas personas en los censos; los ministerios de Salud y de Educación harán seguimiento y conteo estadístico en sus bases de datos.", plazoMeses: null, eje: "informacion" },
        { ancla: "9", art: "Art. 9", tema: "Contenido mínimo de la política", d: "Actualizar el protocolo clínico de diagnóstico, tratamiento y ruta de atención de niños, niñas y adolescentes con TEA; equipo interdisciplinario; guía de atención integral en el curso de vida; suficiencia de medicamentos.", plazoMeses: null, eje: "salud" },
        { ancla: "10", art: "Art. 10", tema: "Comité Nacional de Inclusión", d: "Presidido por el ministro de Salud; se reúne al menos dos veces al año e informa cada año a las Comisiones Séptimas del Congreso. Debe reglamentarse en seis meses.", plazoMeses: 6, eje: "gobernanza" },
        { ancla: "12", art: "Art. 12", tema: "Detección temprana", d: "Se propenderá por la detección y atención temprana mediante la remisión de los profesionales en las evaluaciones pediátricas periódicas.", plazoMeses: null, eje: "salud" },
        { ancla: "13", art: "Art. 13", tema: "Ruta de Atención Médica", d: "El Ministerio de Salud establecerá y coordinará una ruta de atención médica clara y pública.", plazoMeses: null, eje: "salud" },
        { ancla: "14", art: "Art. 14", tema: "Capacitación en salud", d: "Programa nacional de capacitación y sensibilización para el trato en salud; el personal de atención primaria en relación directa con personas con TEA deberá capacitarse y constará en el RETHUS.", plazoMeses: 12, eje: "salud" },
        { ancla: "15", art: "Arts. 15 a 18", tema: "Educación inclusiva", d: "Ruta de inclusión escolar, cupos mínimos, capacitación docente y un módulo en el sistema de matrícula para consolidar la información.", plazoMeses: null, eje: "educacion" },
        { ancla: "19", art: "Arts. 19 a 23", tema: "Familia, cuidadores y trabajo", d: "Apoyo y flexibilidad laboral para familiares, campañas de sensibilización, inserción laboral (Ministerio del Trabajo y SENA) y emprendimiento.", plazoMeses: null, eje: "social" },
        { ancla: "24", art: "Art. 24", tema: "2 de abril", d: "Los ministerios de Salud y de Educación realizarán actividades cada 2 de abril.", plazoMeses: null, eje: "social" }
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

  /* Glosario: "re" es el patrón que activa el tooltip en el texto; "url", un enlace verificable. */
  glosario: [
    { id:"tea", t:"TEA (trastorno del espectro autista)", re:"\\bTEA\\b", d:"Trastorno del neurodesarrollo con dificultades persistentes en la comunicación y la interacción social y patrones de conducta, intereses o actividades restringidos y repetitivos (DSM-5-TR).", url:"https://www.who.int/es/news-room/fact-sheets/detail/autism-spectrum-disorders", fuente:"OMS" },
    { id:"f84", t:"F84", re:"\\bF84\\b", d:"Código de la CIE-10 para los trastornos generalizados del desarrollo, que incluye el autismo. La app cuenta personas con F84 como diagnóstico principal de la atención.", url:"https://icd.who.int/browse10/2019/en", fuente:"OMS, CIE-10" },
    { id:"rips", t:"RIPS", re:"\\bRIPS\\b", d:"Registro Individual de Prestación de Servicios de Salud: el reporte de cada atención que los prestadores envían al sistema. Se consulta en los cubos de SISPRO.", url:"https://www.sispro.gov.co/", fuente:"SISPRO" },
    { id:"fevrips", t:"FEV-RIPS", re:"FEV-RIPS|factura electrónica", d:"Desde 2025 el RIPS se reporta como soporte de la factura electrónica de venta (Resolución 2275 de 2023). El cambio alteró la cobertura del registro y rompe la comparabilidad de la serie.", url:"https://normograma.supersalud.gov.co/compilacion/docs/resolucion_minsaludps_2275_2023.htm", fuente:"Resolución 2275 de 2023" },
    { id:"reps", t:"REPS", re:"\\bREPS\\b", d:"Registro Especial de Prestadores de Servicios de Salud: lista las sedes y los servicios que cada prestador tiene habilitados. Aquí: sedes con el servicio 388 (neuropediatría).", url:"https://prestadores.minsalud.gov.co/habilitacion/", fuente:"MinSalud" },
    { id:"sispro", t:"SISPRO", re:"\\bSISPRO\\b", d:"Sistema Integrado de Información de la Protección Social del Ministerio de Salud; publica cubos de consulta con datos agregados del RIPS.", url:"https://www.sispro.gov.co/", fuente:"MinSalud" },
    { id:"prevtratada", t:"Prevalencia tratada", re:"prevalencia tratada", d:"Personas con al menos una atención registrada con el diagnóstico en el año. No es la prevalencia del trastorno: excluye a quienes no consultan o se registran con otro diagnóstico." },
    { id:"tasa", t:"Tasa por 100.000 habitantes", re:"por 100\\.000 habitantes", d:"Personas atendidas dividido por la población del departamento (DANE 2024), multiplicado por 100.000. Permite comparar territorios de distinto tamaño." },
    { id:"atpp", t:"Atenciones por persona", re:"atenciones por persona", d:"Atenciones registradas dividido por personas atendidas. Mide la intensidad de uso de servicios, no la cobertura." },
    { id:"sede", t:"Sede con neuropediatría", re:"sedes? (con|de) neuropediatría", d:"Sede de un prestador con el servicio 388 habilitado en el REPS. Indica habilitación, no capacidad, número de especialistas ni tiempos de espera." },
    { id:"ipm", t:"IPM (Índice de Pobreza Multidimensional)", re:"\\bIPM\\b", d:"Porcentaje de personas en hogares con privaciones en al menos el 33 % de 15 indicadores de educación, niñez y juventud, trabajo, salud y vivienda y servicios (DANE).", url:"https://www.dane.gov.co/index.php/estadisticas-por-tema/pobreza-y-condiciones-de-vida/pobreza-multidimensional", fuente:"DANE" },
    { id:"mchat", t:"M-CHAT-R/F", re:"M-CHAT(-R/F)?", d:"Lista de chequeo modificada para autismo en niños pequeños (revisada, con entrevista de seguimiento). En Colombia se aplica entre los 18 y 30 meses según la Resolución 3280 de 2018.", url:"https://mchatscreen.com/", fuente:"M-CHAT" },
    { id:"sextil", t:"Sextil", re:"sextil(es)?", d:"Cada uno de los seis grupos con igual número de departamentos en que se divide un indicador ordenado de menor a mayor. Se usa para colorear los mapas." },
    { id:"razon", t:"Razón máximo/mínimo y P90/P10", re:"razón (máximo/mínimo|percentil 90)", d:"Cuántas veces es mayor el valor más alto que el más bajo (o el percentil 90 que el 10). Fácil de leer, pero sensible a los extremos." },
    { id:"lorenz", t:"Curva de Lorenz", re:"curvas? de Lorenz", d:"Ordena los departamentos de menor a mayor tasa y grafica el % acumulado de población frente al % acumulado del indicador. Si todos tuvieran la misma tasa, la curva sería la diagonal." },
    { id:"gini", t:"Índice de Gini", re:"\\bGini\\b", d:"Área entre la curva de Lorenz y la diagonal, en escala de 0 (todos los departamentos con la misma tasa) a 1 (todo concentrado en uno). Ponderado por población." },
    { id:"theil", t:"Theil T", re:"\\bTheil\\b", d:"Medida de desigualdad basada en entropía (0 = igualdad). Se descompone en una parte entre grupos (regiones) y otra dentro de ellos." },
    { id:"mld", t:"MLD (desviación logarítmica media)", re:"\\bMLD\\b", d:"Medida de desigualdad más sensible a los departamentos con tasas bajas. No se define si algún departamento tiene valor cero." },
    { id:"ci", t:"Índice de concentración (Wagstaff)", re:"índices? de concentración", d:"Como el Gini, pero ordena los departamentos de más a menos pobres (IPM). Va de −1 a 1: positivo, el indicador se concentra en los menos pobres; negativo, en los más pobres.", url:"https://doi.org/10.1016/0277-9536(91)90212-U", fuente:"Wagstaff et al., 1991" },
    { id:"sii", t:"SII y RII", re:"\\b(SII|RII)\\b|índices de pendiente", d:"Índice de pendiente (diferencia absoluta estimada entre el extremo más pobre y el menos pobre) e índice relativo (su razón), ambos ponderados por población.", url:"https://doi.org/10.1016/S0277-9536(96)00073-1", fuente:"Mackenbach y Kunst, 1997" },
    { id:"disim", t:"Índice de disimilitud", re:"disimilitud", d:"Proporción de personas (o de sedes) que habría que redistribuir entre departamentos para que dos distribuciones fueran iguales. 0,233 significa cerca de 1 de cada 4." },
    { id:"rho", t:"Correlación de Spearman (ρ)", re:"Spearman", d:"Correlación entre los rangos de dos indicadores, de −1 a 1. Aquí: |ρ| ≥ 0,6 fuerte; 0,4 a 0,6 moderada; 0,2 a 0,4 débil; menor, prácticamente nula." },
    { id:"rr", t:"RR y regresión cuasi-Poisson", re:"cuasi-Poisson|\\bRR\\b", d:"Modelo para conteos (personas atendidas) con la población como denominador y que admite más variabilidad que Poisson. El RR (razón de tasas) indica cuántas veces cambia la tasa por unidad de la variable." },
    { id:"ic", t:"IC95 % y bootstrap", re:"IC95 ?%|bootstrap", d:"Intervalo de confianza del 95 %. Para los índices se estimó remuestreando los 33 departamentos 4.000 veces (bootstrap); intervalos anchos indican incertidumbre." },
    { id:"ecologico", t:"Estudio ecológico", re:"ecológic[oa]s?", d:"Análisis con unidades agregadas (departamentos). Sus asociaciones no se pueden atribuir a las personas (falacia ecológica) ni demuestran causalidad.", url:"https://doi.org/10.1093/oxfordjournals.aje.a117069", fuente:"Greenland y Robins, 1994" },
    { id:"prisma", t:"PRISMA 2020", re:"PRISMA", d:"Guía para reportar revisiones sistemáticas, incluido el diagrama de flujo de la selección de estudios.", url:"https://doi.org/10.1136/bmj.n71", fuente:"Page et al., 2021" },
    { id:"pcc", t:"PCC", re:"\\bPCC\\b", d:"Formato de pregunta Población, Concepto y Contexto, recomendado por JBI cuando el interés no es el efecto de una intervención.", url:"https://doi.org/10.46658/JBIMES-24-01", fuente:"Manual JBI" },
    { id:"swim", t:"SWiM", re:"\\bSWiM\\b", d:"Guía para reportar síntesis sin metaanálisis.", url:"https://doi.org/10.1136/bmj.l6890", fuente:"Campbell et al., 2020" },
    { id:"record", t:"RECORD", re:"\\bRECORD\\b", d:"Guía para reportar estudios con datos de salud recolectados de forma rutinaria (como el RIPS).", url:"https://doi.org/10.1371/journal.pmed.1001885", fuente:"Benchimol et al., 2015" },
    { id:"certificado", t:"Certificado Único de Trastorno del Neurodesarrollo", re:"Certificado Único de Trastorno del Neurodesarrollo", d:"Certificado creado por la Ley 2628 de 2026 (art. 7): voluntario, se expide en dos meses desde que la EPS recibe el diagnóstico y no puede usarse como barrera de acceso.", url:"https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_2628_2026.htm#7", fuente:"Ley 2628 de 2026, art. 7" },
    { id:"linea106", t:"Línea 106", re:"Línea 106", d:"Línea de orientación, apoyo en crisis y gestión del riesgo en salud mental del Ministerio de Salud.", url:"https://www.minsalud.gov.co/salud/publica/salud-mental", fuente:"MinSalud" },
    { id:"uninavarra", t:"UNINAVARRA", re:"\\bUNINAVARRA\\b", d:"Fundación Universitaria Navarra, con sede en Neiva (Huila). El proyecto pertenece a su Especialización en Medicina Familiar.", url:"https://www.uninavarra.edu.co/", fuente:"UNINAVARRA" }
  ],

  /* Normas que se enlazan automáticamente cuando aparecen en el texto */
  normas: [
    { re:"Ley 2628 de 2026", url:"https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_2628_2026.htm" },
    { re:"Resolución 3280 de 2018", url:"https://www.minsalud.gov.co/Normatividad_Nuevo/Resoluci%C3%B3n%20No.%203280%20de%2020183280.pdf" },
    { re:"Resolución 2275 de 2023", url:"https://normograma.supersalud.gov.co/compilacion/docs/resolucion_minsaludps_2275_2023.htm" },
    { re:"Resolución 8430 de 1993", url:"https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/DE/DIJ/RESOLUCION-8430-DE-1993.PDF" },
    { re:"Ley 1618 de 2013", url:"https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=52081" },
    { re:"Política Nacional de Salud Mental( 2024-2033)?", url:"https://www.colpsic.org.co/wp-content/uploads/2025/09/Politica-Nacional-de-Salud-Mental-2024-2033-MinSalud-Colombia-v1.pdf" }
  ],

  /* Referencias (Vancouver) con enlace verificable (DOI o sitio oficial) */
  referencias: [
    { c:"American Psychiatric Association. Diagnostic and Statistical Manual of Mental Disorders. 5th ed., text revision (DSM-5-TR). Washington, DC: APA Publishing; 2022.", url:"https://doi.org/10.1176/appi.books.9780890425787" },
    { c:"Organización Mundial de la Salud. Autismo [nota descriptiva]. Ginebra: OMS.", url:"https://www.who.int/es/news-room/fact-sheets/detail/autism-spectrum-disorders" },
    { c:"Zeidan J, Fombonne E, Scorah J, Ibrahim A, Durkin MS, Saxena S, et al. Global prevalence of autism: a systematic review update. Autism Res. 2022;15(5):778-90.", url:"https://doi.org/10.1002/aur.2696" },
    { c:"García-Zambrano S, Pinto-Ocampo RH. How many autistic children are there in Colombia? A nationwide examination of autism through health system data. J Autism Dev Disord. 2024.", url:"https://doi.org/10.1007/s10803-024-06534-9" },
    { c:"Pierce K, Gazestani VH, Bacon E, Barnes CC, Cha D, Nalabolu S, et al. Evaluation of the diagnostic stability of the early autism spectrum disorder phenotype in the general population starting at 12 months. JAMA Pediatr. 2019;173(6):578-87.", url:"https://doi.org/10.1001/jamapediatrics.2019.0624" },
    { c:"Shaw KA, Williams S, Patrick ME, Valencia-Prado M, Durkin MS, Howerton EM, et al. Prevalence and early identification of autism spectrum disorder among children aged 4 and 8 years. ADDM Network, 16 sites, United States, 2022. MMWR Surveill Summ. 2025;74(2):1-22.", url:"https://doi.org/10.15585/mmwr.ss7402a1" },
    { c:"Daniels AM, Mandell DS. Explaining differences in age at autism spectrum disorder diagnosis: a critical review. Autism. 2014;18(5):583-97.", url:"https://doi.org/10.1177/1362361313480277" },
    { c:"Wieckowski AT, Hamner T, Nanovic S, Porto KS, Coulter KL, Eldeeb SY, et al. Early and repeated screening detects autism spectrum disorder. J Pediatr. 2021;234:227-35.", url:"https://doi.org/10.1016/j.jpeds.2021.03.009" },
    { c:"Hyman SL, Levy SE, Myers SM; AAP Council on Children with Disabilities. Identification, evaluation, and management of children with autism spectrum disorder. Pediatrics. 2020;145(1):e20193447.", url:"https://doi.org/10.1542/peds.2019-3447" },
    { c:"Dawson G, Rogers S, Munson J, Smith M, Winter J, Greenson J, et al. Randomized, controlled trial of an intervention for toddlers with autism: the Early Start Denver Model. Pediatrics. 2010;125(1):e17-23.", url:"https://doi.org/10.1542/peds.2009-0958" },
    { c:"Paula CS, Cukier S, Cunha GR, Irarrázaval M, Montiel-Nava C, Garcia R, et al. Challenges, priorities, barriers to care, and stigma in families of people with autism: six Latin American countries. Autism. 2020;24(8):2228-42.", url:"https://doi.org/10.1177/1362361320940073" },
    { c:"Smith-Young J, Pike A, Swab M, Chafe R. Parents and guardians experiences of barriers and facilitators in accessing autism spectrum disorder diagnostic services for their children: a qualitative systematic review. JBI Evid Synth. 2025;23(1):6-68.", url:"https://doi.org/10.11124/JBIES-23-00332" },
    { c:"Wagstaff A, Paci P, van Doorslaer E. On the measurement of inequalities in health. Soc Sci Med. 1991;33(5):545-57.", url:"https://doi.org/10.1016/0277-9536(91)90212-U" },
    { c:"Kakwani N, Wagstaff A, van Doorslaer E. Socioeconomic inequalities in health: measurement, computation, and statistical inference. J Econom. 1997;77(1):87-103.", url:"https://doi.org/10.1016/S0304-4076(96)01807-6" },
    { c:"Mackenbach JP, Kunst AE. Measuring the magnitude of socio-economic inequalities in health: an overview of available measures. Soc Sci Med. 1997;44(6):757-71.", url:"https://doi.org/10.1016/S0277-9536(96)00073-1" },
    { c:"Greenland S, Robins J. Invited commentary: ecologic studies: biases, misconceptions, and counterexamples. Am J Epidemiol. 1994;139(8):747-60.", url:"https://doi.org/10.1093/oxfordjournals.aje.a117069" },
    { c:"Page MJ, McKenzie JE, Bossuyt PM, Boutron I, Hoffmann TC, Mulrow CD, et al. The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ. 2021;372:n71.", url:"https://doi.org/10.1136/bmj.n71" },
    { c:"Aromataris E, Lockwood C, Porritt K, Pilla B, Jordan Z, editores. JBI Manual for Evidence Synthesis. JBI; 2024.", url:"https://doi.org/10.46658/JBIMES-24-01" },
    { c:"Campbell M, McKenzie JE, Sowden A, Katikireddi SV, Brennan SE, Ellis S, et al. Synthesis without meta-analysis (SWiM) in systematic reviews: reporting guideline. BMJ. 2020;368:l6890.", url:"https://doi.org/10.1136/bmj.l6890" },
    { c:"Benchimol EI, Smeeth L, Guttmann A, Harron K, Moher D, Petersen I, et al. The REporting of studies Conducted using Observational Routinely-collected health Data (RECORD) statement. PLoS Med. 2015;12(10):e1001885.", url:"https://doi.org/10.1371/journal.pmed.1001885" },
    { c:"Congreso de la República de Colombia. Ley 2628 de 2026 (26 de agosto), por medio de la cual se establecen medidas, servicios y mecanismos de atención integral para la protección e inclusión de las personas con TEA. Diario Oficial No. 53.604 [texto compilado, normograma MinTIC].", url:"https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_2628_2026.htm" },
    { c:"Presidencia de la República. Ley 2628 del 26 de agosto de 2026 [PDF oficial].", url:"https://dapre.presidencia.gov.co/normativa/normativa/LEY%20No.%202628%20DEL%2026%20DE%20AGOSTO%20DE%202026.pdf" },
    { c:"Ministerio de Salud y Protección Social. Política Nacional de Salud Mental 2024-2033. Bogotá: MinSalud; 2024 [copia alojada por el Colegio Colombiano de Psicólogos].", url:"https://www.colpsic.org.co/wp-content/uploads/2025/09/Politica-Nacional-de-Salud-Mental-2024-2033-MinSalud-Colombia-v1.pdf" },
    { c:"Ministerio de Salud y Protección Social. Salud mental [portal institucional].", url:"https://www.minsalud.gov.co/salud/publica/salud-mental" },
    { c:"Ministerio de Salud y Protección Social. Resolución 3280 de 2018: lineamientos de la Ruta Integral de Atención para la Promoción y Mantenimiento de la Salud.", url:"https://www.minsalud.gov.co/Normatividad_Nuevo/Resoluci%C3%B3n%20No.%203280%20de%2020183280.pdf" },
    { c:"Ministerio de Salud y Protección Social. Resolución 2275 de 2023: resolución única del RIPS como soporte de la factura electrónica de venta en salud.", url:"https://normograma.supersalud.gov.co/compilacion/docs/resolucion_minsaludps_2275_2023.htm" },
    { c:"Ministerio de Salud. Resolución 8430 de 1993: normas científicas, técnicas y administrativas para la investigación en salud.", url:"https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/DE/DIJ/RESOLUCION-8430-DE-1993.PDF" },
    { c:"Congreso de la República. Ley 1618 de 2013: garantía del pleno ejercicio de los derechos de las personas con discapacidad.", url:"https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=52081" }
  ],

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
        { grupo: "Otras apps del autor", items: [
      { label: "HealthFactAnalytics: apps abiertas", url: "https://sites.google.com/view/healtyanalytics/inicio" }
    ]}
  ]
};
