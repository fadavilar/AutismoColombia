/* Contenido editorial y tablas resumen de la app "TEA en Colombia".
   Cada cifra proviene del libro de cálculo del proyecto (Inequidad_TEA_Departamentos_v13112026)
   o del documento del proyecto (versión del 18/11/2026). Las cifras por departamento están en
   js/datos.js, generado por scripts/build_data.py. */
window.TEA_CONTENIDO = {
  meta: {
    titulo: "Trastorno del espectro autista (TEA) en Colombia",
    subtitulo: "Atención, oferta de servicios e inequidad territorial con datos públicos",
    corte: "Datos a noviembre de 2026",
    autor: "Fabian Antonio Dávila Ramírez, MD, MBA, PhD",
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
    { nombre: "Fabian Antonio Dávila Ramírez", rol: "docente de investigación; análisis de datos y app" }
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
    edadNota: "Tabla de edad y sexo del cubo RIPS 2024 (n = 53.685; excluye personas sin sexo registrado). La edad es la de la atención, no la edad al diagnóstico. La tabla de origen no trae el porcentaje de 12 a 17 años: se obtuvo restando los otros tres grupos del 100 % (por eso su barra tiene un tono más claro).",
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
    { id:"tea", t:"TEA (trastorno del espectro autista)", re:"\\bTEA\\b", d:"Trastorno del neurodesarrollo que se manifiesta desde la primera infancia con dificultades persistentes en la comunicación y la interacción social, y con patrones de conducta, intereses o actividades restringidos y repetitivos. Se habla de espectro porque la intensidad y las necesidades de apoyo varían mucho entre personas; puede o no acompañarse de discapacidad intelectual. La OMS estima que 1 de cada 127 personas tiene autismo.", fuente:"American Psychiatric Association, DSM-5-TR (2022); OMS, nota descriptiva", url:"https://doi.org/10.1176/appi.books.9780890425787" },
    { id:"f84", t:"F84", re:"\\bF84\\b", d:"Código de la Clasificación Internacional de Enfermedades (CIE-10) para los trastornos generalizados del desarrollo, que agrupa el autismo infantil, el autismo atípico, el síndrome de Asperger y otros. Esta app cuenta a las personas que tuvieron al menos una atención con un código F84 como diagnóstico principal; no incluye las atenciones en que F84 figura solo como diagnóstico relacionado.", fuente:"OMS, CIE-10 (versión 2019)", url:"https://icd.who.int/browse10/2019/en" },
    { id:"rips", t:"RIPS", re:"\\bRIPS\\b", d:"Registro Individual de Prestación de Servicios de Salud: el conjunto de datos que cada prestador reporta por cada atención (quién fue atendido, dónde, cuándo, con qué diagnóstico y qué servicio recibió). El Ministerio de Salud lo consolida y lo publica de forma agregada en los cubos de SISPRO, que son la fuente de las personas y atenciones de esta app.", fuente:"Ministerio de Salud, Resolución 2275 de 2023", url:"https://normograma.supersalud.gov.co/compilacion/docs/resolucion_minsaludps_2275_2023.htm" },
    { id:"fevrips", t:"FEV-RIPS", re:"FEV-RIPS|factura electrónica", d:"Desde 2025 el RIPS se reporta como soporte obligatorio de la factura electrónica de venta (FEV) en salud. El cambio amplió y modificó la cobertura del registro: por eso las personas atendidas casi se duplican en 2025 (sobre todo en el régimen contributivo) y la serie 2019-2025 no es estrictamente comparable. En esta app 2024 es el año de referencia y 2025 se muestra como análisis de sensibilidad.", fuente:"Ministerio de Salud, Resolución 2275 de 2023", url:"https://normograma.supersalud.gov.co/compilacion/docs/resolucion_minsaludps_2275_2023.htm" },
    { id:"reps", t:"REPS", re:"\\bREPS\\b", d:"Registro Especial de Prestadores de Servicios de Salud: base oficial de las sedes y los servicios que cada prestador tiene habilitados para funcionar. Aquí se usaron las sedes con el servicio 388 (neuropediatría) habilitado al 13/11/2026, con la modalidad de telemedicina y la naturaleza jurídica (pública o privada).", fuente:"Ministerio de Salud, REPS", url:"https://prestadores.minsalud.gov.co/habilitacion/" },
    { id:"sispro", t:"SISPRO", re:"\\bSISPRO\\b", d:"Sistema Integrado de Información de la Protección Social del Ministerio de Salud. Reúne registros del sistema de salud (RIPS, afiliación, prestadores, estadísticas vitales) y los publica como cubos de consulta con datos agregados, sin identificar a las personas.", fuente:"Ministerio de Salud, SISPRO", url:"https://www.sispro.gov.co/" },
    { id:"prevtratada", t:"Prevalencia tratada", re:"prevalencia tratada", d:"Número de personas que tuvieron al menos una atención registrada con el diagnóstico en el año, dividido por la población. Es distinta de la prevalencia del trastorno: no cuenta a quienes no consultan, no tienen diagnóstico o se registran con otro código, y aumenta cuando mejora el diagnóstico o el registro aunque no haya más casos. Por eso se lee como acceso a la atención más que como frecuencia del TEA.", fuente:"Definición operativa del proyecto; uso similar en García-Zambrano y Pinto-Ocampo (2024)", url:"https://doi.org/10.1007/s10803-024-06534-9" },
    { id:"tasa", t:"Tasa por 100.000 habitantes", re:"por 100\\.000 habitantes", d:"Número de casos dividido por la población del territorio y multiplicado por 100.000. Permite comparar departamentos de tamaños muy distintos: Bogotá atendió 8.719 personas y Atlántico 6.812, pero por habitante Atlántico atiende más del doble (240,1 frente a 110,1 por 100.000). La población usada es la proyección DANE 2024.", fuente:"OPS, Indicadores de salud: aspectos conceptuales y operativos", url:"https://www.paho.org/es/documentos/indicadores-salud-aspectos-conceptuales-operativos" },
    { id:"atpp", t:"Atenciones por persona", re:"atenciones por persona", d:"Total de atenciones registradas (consultas, terapias, procedimientos) dividido por el número de personas atendidas. Mide la intensidad del uso de servicios, no la cobertura: Atlántico registró 26,4 atenciones por persona y Antioquia 3,6. Valores altos pueden reflejar terapias frecuentes, pero también diferencias en la forma de facturar y reportar.", fuente:"Definición operativa del proyecto con datos del RIPS (SISPRO)", url:"https://www.sispro.gov.co/" },
    { id:"sede", t:"Sede con neuropediatría", re:"sedes? (con|de) neuropediatría", d:"Sede de un prestador que tiene habilitado el servicio de neuropediatría (código 388) en el REPS. Es un indicador de habilitación: no dice cuántos neuropediatras hay, cuántas horas atienden, ni cuánto se espera por una cita. Una sede que solo ofrece telemedicina también cuenta.", fuente:"Ministerio de Salud, REPS", url:"https://prestadores.minsalud.gov.co/habilitacion/" },
    { id:"ipm", t:"IPM (Índice de Pobreza Multidimensional)", re:"\\bIPM\\b", d:"Porcentaje de personas que viven en hogares con privaciones en al menos el 33 % de 15 indicadores agrupados en cinco dimensiones: condiciones educativas del hogar, niñez y juventud, trabajo, salud, y servicios públicos y vivienda. A diferencia de la pobreza monetaria, no mide ingresos sino carencias. Un IPM de 70 % (Vichada) significa que 7 de cada 10 personas viven en hogares pobres; uno de 5 % (Bogotá), 1 de cada 20.", fuente:"DANE, Pobreza multidimensional", url:"https://www.dane.gov.co/index.php/estadisticas-por-tema/pobreza-y-condiciones-de-vida/pobreza-multidimensional" },
    { id:"mchat", t:"M-CHAT-R/F", re:"M-CHAT(-R/F)?", d:"Lista de chequeo modificada para autismo en niños pequeños, revisada y con entrevista de seguimiento. Los padres o cuidadores responden 20 preguntas sobre conductas del niño; un resultado alterado no es un diagnóstico, sino una señal para remitir a evaluación especializada. En Colombia se aplica entre los 18 y 30 meses (Resolución 3280 de 2018); repetir el tamizaje mejora su sensibilidad.", fuente:"M-CHAT (sitio oficial); Wieckowski et al., 2021", url:"https://mchatscreen.com/" },
    { id:"sextil", t:"Sextil", re:"sextil(es)?", d:"Cada uno de los seis grupos con el mismo número de departamentos (5 o 6) en que se divide un indicador ordenado de menor a mayor. Se usa para colorear los mapas porque garantiza que todos los colores aparezcan; su desventaja es que dos departamentos con valores muy parecidos pueden quedar en grupos distintos, por eso la leyenda muestra el rango de cada grupo.", fuente:"Brewer y Pickle, 2002", url:"https://doi.org/10.1111/1467-8306.00310" },
    { id:"razon", t:"Razón máximo/mínimo y P90/P10", re:"razón (máximo/mínimo|percentil 90)", d:"Cuántas veces es mayor el valor más alto que el más bajo. La razón máximo/mínimo de la tasa es 20,0 (Atlántico frente a Guainía). Como depende solo de dos departamentos, también se usa la razón entre el percentil 90 y el 10 (4,77), que ignora los extremos. Son fáciles de comunicar, pero no usan la información de todos los territorios ni su población.", fuente:"OMS, Handbook on health inequality monitoring (2013)", url:"https://www.who.int/publications/i/item/9789241548632" },
    { id:"lorenz", t:"Curva de Lorenz", re:"curvas? de Lorenz", d:"Gráfico que ordena los departamentos de menor a mayor tasa y muestra, en el eje horizontal, el porcentaje acumulado de la población y, en el vertical, el porcentaje acumulado del indicador (personas atendidas, atenciones o sedes). Si todos tuvieran la misma tasa, la curva coincidiría con la diagonal; cuanto más se curva hacia abajo, más concentrado está el indicador en pocos territorios.", fuente:"Lorenz, 1905; O'Donnell et al., Banco Mundial, 2008", url:"https://doi.org/10.1080/15225437.1905.10503443" },
    { id:"gini", t:"Índice de Gini", re:"\\bGini\\b", d:"Resume la curva de Lorenz en un número: es el área entre la curva y la diagonal, dividida por el área total bajo la diagonal. Va de 0 (todos los departamentos con la misma tasa) a 1 (todo el indicador concentrado en un solo territorio). Aquí se pondera por población: el Gini de las personas atendidas es 0,240 y el de las atenciones 0,486, es decir, las atenciones están más concentradas.", fuente:"O'Donnell et al., Analyzing Health Equity Using Household Survey Data, Banco Mundial, 2008", url:"https://openknowledge.worldbank.org/handle/10986/6896" },
    { id:"theil", t:"Theil T", re:"\\bTheil\\b", d:"Índice de desigualdad basado en la idea de entropía. Compara la tasa de cada departamento con la tasa nacional y suma esas diferencias ponderadas por el peso de cada departamento: los que están por encima de la media aportan más. Vale 0 cuando todos tienen la misma tasa y no tiene un máximo fijo. Su gran ventaja es que se descompone exactamente en desigualdad entre grupos (regiones) y dentro de ellos: aquí el Theil de personas atendidas es 0,100 y solo el 37,4 % corresponde a diferencias entre regiones.", fuente:"OMS, Health Equity Assessment Toolkit (HEAT), notas técnicas; Handbook on health inequality monitoring (2013)", url:"https://www.who.int/data/inequality-monitor/assessment_toolkit" },
    { id:"mld", t:"MLD (desviación logarítmica media)", re:"\\bMLD\\b", d:"Otro índice de la familia de Theil (a veces llamado Theil L). Promedia, ponderando por población, el logaritmo de la razón entre la tasa nacional y la de cada departamento, por lo que da más peso a los territorios con tasas bajas. Vale 0 si no hay desigualdad y no se puede calcular si algún departamento tiene valor cero (como las sedes en Amazonas, Guainía, Vaupés y Vichada).", fuente:"OMS, Health Equity Assessment Toolkit (HEAT), notas técnicas", url:"https://www.who.int/data/inequality-monitor/assessment_toolkit" },
    { id:"ci", t:"Índice de concentración (Wagstaff)", re:"índices? de concentración", d:"Mide si un indicador se concentra en los territorios más pobres o en los menos pobres. Se calcula como un Gini, pero ordenando los departamentos por su pobreza (IPM) en lugar de por su tasa. Va de −1 a 1: 0 indica que no hay relación con la pobreza; un valor positivo, que el indicador se concentra en los menos pobres; uno negativo, en los más pobres. Aquí es +0,044 para las personas atendidas y −0,190 para las sedes.", fuente:"Wagstaff, Paci y van Doorslaer, 1991; O'Donnell et al., 2008", url:"https://doi.org/10.1016/0277-9536(91)90212-U" },
    { id:"sii", t:"SII y RII", re:"\\b(SII|RII)\\b|índices de pendiente", d:"Índices de pendiente de la desigualdad. Se ordenan los departamentos de más pobre (0) a menos pobre (1) según la población acumulada y se ajusta una recta entre ese rango y la tasa: el SII es la diferencia absoluta estimada entre el extremo menos pobre y el más pobre (en unidades del indicador) y el RII es la razón entre ambos. RII mayor que 1 indica más en los menos pobres; menor que 1, más en los más pobres. Para las personas atendidas el RII es 1,30 (IC95 % 0,73 a 2,31, incluye el 1); para las sedes es 0,31: en el extremo menos pobre la oferta estimada es cerca de un tercio de la del más pobre, coherente con su índice de concentración negativo.", fuente:"Mackenbach y Kunst, 1997", url:"https://doi.org/10.1016/S0277-9536(96)00073-1" },
    { id:"disim", t:"Índice de disimilitud", re:"disimilitud", d:"Proporción de personas (o de sedes) que habría que trasladar de un departamento a otro para que dos distribuciones fueran idénticas. Se calcula como la mitad de la suma de las diferencias absolutas entre las proporciones de cada departamento. Va de 0 (distribuciones iguales) a 1. Un valor de 0,233 entre personas atendidas y sedes significa que cerca de 1 de cada 4 tendría que cambiar de departamento para que ambas coincidieran.", fuente:"Duncan y Duncan, 1955", url:"https://doi.org/10.2307/2088328" },
    { id:"rho", t:"Correlación de Spearman (ρ)", re:"Spearman", d:"Mide si dos indicadores suben o bajan juntos usando el orden (rango) de los departamentos en lugar de sus valores, por lo que es poco sensible a valores extremos como Atlántico. Va de −1 (orden inverso perfecto) a 1 (mismo orden). En esta app: |ρ| ≥ 0,6 fuerte; 0,4 a 0,6 moderada; 0,2 a 0,4 débil; menor, prácticamente nula. Con pocos departamentos (al filtrar por región) el valor es muy inestable.", fuente:"Spearman, 1904", url:"https://doi.org/10.2307/1412159" },
    { id:"rr", t:"RR y regresión cuasi-Poisson", re:"cuasi-Poisson|\\bRR\\b", d:"Modelo para conteos (personas atendidas por departamento) que usa la población como denominador y admite más variabilidad entre territorios que el modelo de Poisson. Su resultado es la razón de tasas (RR): cuántas veces cambia la tasa por cada unidad de la variable. RR = 1,32 para las sedes significa una tasa 32 % mayor por cada sede adicional por 100.000 habitantes; RR = 0,71 para el IPM, una tasa 29 % menor por cada 10 puntos más de pobreza.", fuente:"Wedderburn, 1974", url:"https://doi.org/10.1093/biomet/61.3.439" },
    { id:"ic", t:"IC95 % y bootstrap", re:"IC95 ?%|bootstrap", d:"El intervalo de confianza del 95 % indica el rango de valores compatibles con los datos. Para los índices de desigualdad se estimó con bootstrap: se generaron 4.000 muestras de 33 departamentos elegidos al azar con reemplazo, se recalculó el índice en cada una y se tomaron los percentiles 2,5 y 97,5. Intervalos anchos, como los de esta app, reflejan que hay pocas unidades y algunos valores extremos.", fuente:"Efron, 1979", url:"https://doi.org/10.1214/aos/1176344552" },
    { id:"ecologico", t:"Estudio ecológico", re:"ecológic[oa]s?", d:"Análisis en el que la unidad son grupos (aquí, departamentos) y no personas. Sirve para describir territorios y plantear hipótesis, pero sus asociaciones no se pueden trasladar a las personas (falacia ecológica): que los departamentos más pobres tengan menor tasa de atención no prueba que las familias pobres consulten menos, ni que la pobreza sea la causa.", fuente:"Greenland y Robins, 1994", url:"https://doi.org/10.1093/oxfordjournals.aje.a117069" },
    { id:"prisma", t:"PRISMA 2020", re:"PRISMA", d:"Guía internacional para reportar revisiones sistemáticas. Incluye una lista de 27 ítems y un diagrama de flujo que muestra cuántos registros se identificaron, cuántos se descartaron en cada etapa y por qué, de modo que otros puedan reproducir la selección.", fuente:"Page et al., 2021", url:"https://doi.org/10.1136/bmj.n71" },
    { id:"pcc", t:"PCC", re:"\\bPCC\\b", d:"Formato para plantear la pregunta de una revisión: Población (quiénes), Concepto (qué fenómeno) y Contexto (dónde y en qué sistema). Lo recomienda JBI cuando el interés no es el efecto de una intervención, como aquí, donde se estudian las barreras para el diagnóstico.", fuente:"Aromataris et al., Manual JBI, 2024", url:"https://doi.org/10.46658/JBIMES-24-01" },
    { id:"swim", t:"SWiM", re:"\\bSWiM\\b", d:"Guía para reportar síntesis sin metaanálisis (Synthesis Without Meta-analysis): explica cómo agrupar estudios, qué medida común usar y cómo presentar los resultados cuando no es posible combinarlos estadísticamente.", fuente:"Campbell et al., 2020", url:"https://doi.org/10.1136/bmj.l6890" },
    { id:"record", t:"RECORD", re:"\\bRECORD\\b", d:"Guía para reportar estudios hechos con datos de salud recolectados de forma rutinaria (registros administrativos como el RIPS): pide describir la fuente, los códigos usados, la calidad de los datos y el flujo de registros analizados.", fuente:"Benchimol et al., 2015", url:"https://doi.org/10.1371/journal.pmed.1001885" },
    { id:"certificado", t:"Certificado Único de Trastorno del Neurodesarrollo", re:"Certificado Único de Trastorno del Neurodesarrollo", d:"Documento creado por la Ley 2628 de 2026 (art. 7). Lo expiden centros especializados en un plazo de dos meses desde que la EPS recibe el diagnóstico. Su trámite es voluntario y la ley prohíbe usarlo como requisito o barrera para acceder a servicios de salud.", fuente:"Ley 2628 de 2026, art. 7", url:"https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_2628_2026.htm#7" },
    { id:"linea106", t:"Línea 106", re:"Línea 106", d:"Línea gratuita del Ministerio de Salud para orientación, apoyo en crisis y gestión del riesgo en salud mental.", fuente:"Ministerio de Salud, portal de salud mental", url:"https://www.minsalud.gov.co/salud/publica/salud-mental" },
    { id:"uninavarra", t:"UNINAVARRA", re:"\\bUNINAVARRA\\b", d:"Fundación Universitaria Navarra, institución de educación superior con sede en Neiva (Huila). El proyecto del que proviene esta app pertenece a su Especialización en Medicina Familiar.", fuente:"UNINAVARRA", url:"https://www.uninavarra.edu.co/" }
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
    { c:"Lorenz MO. Methods of measuring the concentration of wealth. Publ Am Stat Assoc. 1905;9(70):209-19.", url:"https://doi.org/10.1080/15225437.1905.10503443" },
    { c:"O'Donnell O, van Doorslaer E, Wagstaff A, Lindelow M. Analyzing health equity using household survey data: a guide to techniques and their implementation. Washington, DC: Banco Mundial; 2008.", url:"https://openknowledge.worldbank.org/handle/10986/6896" },
    { c:"Organización Mundial de la Salud. Handbook on health inequality monitoring: with a special focus on low- and middle-income countries. Ginebra: OMS; 2013.", url:"https://www.who.int/publications/i/item/9789241548632" },
    { c:"Organización Mundial de la Salud. Health Equity Assessment Toolkit (HEAT).", url:"https://www.who.int/data/inequality-monitor/assessment_toolkit" },
    { c:"Organización Panamericana de la Salud. Indicadores de salud: aspectos conceptuales y operativos. Washington, DC: OPS; 2018.", url:"https://www.paho.org/es/documentos/indicadores-salud-aspectos-conceptuales-operativos" },
    { c:"Duncan OD, Duncan B. A methodological analysis of segregation indexes. Am Sociol Rev. 1955;20(2):210-7.", url:"https://doi.org/10.2307/2088328" },
    { c:"Spearman C. The proof and measurement of association between two things. Am J Psychol. 1904;15(1):72-101.", url:"https://doi.org/10.2307/1412159" },
    { c:"Wedderburn RWM. Quasi-likelihood functions, generalized linear models, and the Gauss-Newton method. Biometrika. 1974;61(3):439-47.", url:"https://doi.org/10.1093/biomet/61.3.439" },
    { c:"Efron B. Bootstrap methods: another look at the jackknife. Ann Stat. 1979;7(1):1-26.", url:"https://doi.org/10.1214/aos/1176344552" },
    { c:"Brewer CA, Pickle L. Evaluation of methods for classifying epidemiological data on choropleth maps in series. Ann Assoc Am Geogr. 2002;92(4):662-81.", url:"https://doi.org/10.1111/1467-8306.00310" },
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
