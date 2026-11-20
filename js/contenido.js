/* Contenido editorial y tablas resumen de la app "TEA en Colombia".
   Cada cifra proviene del libro de cálculo del proyecto (Inequidad_TEA_Departamentos_v13112026)
   o del documento del proyecto (versión del 18/11/2026). Las cifras por departamento están en
   js/datos.js, generado por scripts/build_data.py. */
window.TEA_CONTENIDO = {
  meta: {
    titulo: "Trastorno del espectro autista (TEA) en Colombia",
    subtitulo: "Atención, oferta de servicios e inequidad territorial con datos públicos",
    corte: "Datos a noviembre de 2026",
    autor: "Fabian Antonio Dávila Ramírez",
    autorCred: "Médico, epidemiólogo y economista de la salud; máster en Bioestadística y Econometría; doctor en Modelado y Gestión de Políticas Públicas",
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
    { nombre: "Fabian Antonio Dávila Ramírez", rol: "docente de investigación; análisis de datos y app", cred: "Médico, epidemiólogo y economista de la salud; máster en Bioestadística y Econometría; doctor en Modelado y Gestión de Políticas Públicas" }
  ],

  ipmDef: "El Índice de Pobreza Multidimensional (IPM) del DANE mide el porcentaje de personas que viven en hogares con privaciones simultáneas en cinco dimensiones: condiciones educativas del hogar, condiciones de la niñez y la juventud, trabajo, salud, y acceso a servicios públicos y condiciones de la vivienda (15 indicadores). Un hogar se considera pobre si tiene privaciones en al menos el 33 % de los indicadores ponderados. Un IPM de 70 % (Vichada) significa que 7 de cada 10 personas del departamento viven en hogares pobres; uno de 5 % (Bogotá), que lo es 1 de cada 20.",

  stats: [
    { value: "51.474", label: "Personas atendidas con F84 en 2024", detail: "RIPS, diagnóstico principal, 33 territorios" },
    { value: "1.214", label: "Atenciones por cada 100 personas atendidas", detail: "Tasa de atención 2024: 625.010 atenciones ÷ 51.474 personas × 100" },
    { value: "97,8", label: "Personas atendidas por 100.000 habitantes", detail: "Prevalencia atendida 2024 (denominador: población DANE)" },
    { value: "20 veces", label: "Brecha de prevalencia atendida entre departamentos", detail: "De 12,0 (Guainía) a 240,1 (Atlántico) por 100.000 hab." },
    { value: "19,9 %", label: "Vive en municipios sin neuropediatría", detail: "10.245 de 51.474 personas atendidas" },
    { value: "590", label: "Sedes con neuropediatría", detail: "REPS 13/11/2026; 4 departamentos sin ninguna" },
    { value: "≈ 12 %", label: "De las personas con autismo esperadas fueron atendidas", detail: "51.474 de ≈ 414.000 si 1 de cada 127 tuviera autismo (OMS); ≈ 25 % con el registro de 2025" }
  ],

  panorama: {
    intro: [
      "El TEA es un trastorno del neurodesarrollo con dificultades persistentes en la comunicación y la interacción social y patrones de conducta, intereses o actividades restringidos y repetitivos. La OMS estima que 1 de cada 127 personas tiene autismo y una revisión de 71 estudios situó la mediana mundial de prevalencia en 100 por 10.000.",
      "El diagnóstico puede hacerse de forma estable desde el segundo año de vida, pero en la vigilancia de los CDC de Estados Unidos la mediana de edad al primer diagnóstico fue de 47 meses (2022). En Colombia, la Ley 2628 de 2026 pide propender por la detección temprana en las evaluaciones pediátricas, pero no fija qué instrumento usar ni a qué edades.",
      "Esta app muestra lo que dicen los registros públicos del sistema de salud colombiano: cuántas personas se atienden con diagnóstico de TEA (grupo F84 de la CIE-10, que reúne ocho códigos), dónde viven, dónde se atienden, con qué oferta de neuropediatría cuenta cada departamento y qué tan desigual es esa distribución."
    ],
    lectura: "La app usa dos medidas distintas. La prevalencia atendida es el número de personas con al menos una atención con F84 como diagnóstico principal dividido por la población del departamento (DANE) y multiplicado por 100.000: dice a cuántas personas llega el sistema. La tasa de atención es el número de atenciones a personas con F84 dividido por las personas atendidas con F84 y multiplicado por 100: dice cuánta atención recibe cada persona atendida. Ninguna de las dos mide la frecuencia real del TEA, porque no cuentan a quienes no consultan o se registran con otro diagnóstico.",
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
    regimenNota: "Registros persona-régimen, sin deduplicar entre regímenes. En 2025 el número de personas casi se duplica (102.066; 194,0 por 100.000) y el aumento se concentra en el régimen contributivo; coincide con el cambio de reporte al RIPS como soporte de la factura electrónica (Resolución 2275 de 2023). No es un aumento de casos: según la hipótesis del equipo, es una medición más completa.",
    hipotesis: [
      { t: "El registro anterior subestimaba", quien: "Hipótesis principal del equipo", d: "Antes de 2025 muchas atenciones a personas con TEA se registraban sin F84 como diagnóstico principal (por ejemplo, terapias reportadas con el diagnóstico de una comorbilidad o con un código inespecífico). Con la factura electrónica cada servicio cobrado debe llevar su RIPS con diagnóstico, y las cifras de 2025 se acercarían más a la realidad. Como se cuenta una vez a cada persona con diagnóstico confirmado, el valor más alto (2025) es el más cercano al número real de personas atendidas." },
      { t: "La forma de pago cambia lo que se reporta", quien: "Hipótesis por verificar", d: "Si en el contributivo predomina el pago por evento, cada atención facturada exige un RIPS completo desde 2025. Si en el subsidiado pesan más los pagos globales (capitación o pago global prospectivo), la nueva exigencia cambia menos lo que se reporta. Así se explicaría que solo uno de los dos regímenes salte." },
      { t: "El subsidiado ya reportaba de forma más completa o tiene facturas por radicar", quien: "Hipótesis por verificar", d: "Otra posibilidad es que en el subsidiado el registro ya fuera más completo antes de 2025, o que parte de sus facturas de 2025 aún no esté radicada en SISPRO al momento de la consulta, lo que haría subir su cifra en cortes posteriores." }
    ],
    hipotesisNota: "Para contrastarlas haría falta el detalle por modalidad de pago, por EPS y por fecha de radicación, que no está en los cubos públicos usados aquí."
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
    { t: "El sistema llega a 20 veces más personas en unos departamentos que en otros", d: "La prevalencia atendida va de 12,0 por 100.000 habitantes en Guainía a 240,1 en Atlántico (nacional 97,8). Las tasas más bajas están en la Amazonía-Orinoquía y la región Pacífica.", sec: "territorio" },
    { t: "La tasa de atención es aún más desigual que la cobertura", d: "Va de 360 atenciones por cada 100 personas atendidas en Antioquia a 2.640 en Atlántico; las atenciones están más concentradas entre departamentos (Gini 0,486) que las personas atendidas (0,240).", sec: "intensidad" },
    { t: "La oferta sigue a la demanda; lo que se aparta depende más de la región que de la riqueza", d: "Donde se esperan más casos hay más sedes de neuropediatría (ρ = 0,80). Lo que sobra o falta frente a esa demanda casi no se relaciona con la pobreza (ρ = 0,15) y sí con la región: el Caribe tiene más sedes de las esperadas y Cundinamarca, Cauca, Chocó y la Amazonía-Orinoquía, menos.", sec: "oferta" },
    { t: "Más oferta, más atención; más pobreza, menos atención", d: "La prevalencia atendida aumenta 1,32 veces por cada sede adicional por 100.000 habitantes y es 0,71 veces la de referencia por cada 10 puntos más de IPM, aun a igual oferta: tener sedes es necesario, pero no suficiente.", sec: "pobreza" },
    { t: "Uno de cada cinco vive donde no hay neuropediatría", d: "El 19,9 % de las personas atendidas vive en municipios sin sede; en Guainía el 100 % de las atenciones se presta fuera del departamento y Bogotá recibe 20.703 atenciones netas de otros territorios.", sec: "movilidad" },
    { t: "La desigualdad está más dentro de las regiones que entre ellas", d: "El 62,6 % de la desigualdad (Theil) ocurre entre departamentos de una misma región; un análisis solo regional ocultaría la mayor parte.", sec: "desigualdad" }
  ],
  hallazgosNota: "Lectura del equipo del proyecto a partir de datos ecológicos: son hipótesis para orientar la revisión sistemática, no conclusiones causales.",

  huila: {
    texto: [
      "UNINAVARRA tiene sede en Neiva, por eso el proyecto incluye una lectura para el Huila.",
      "En 2024 el Huila registró 944 personas atendidas con F84, una prevalencia atendida de 79,0 por 100.000 habitantes, por debajo de la nacional (97,8). Contaba con 9 sedes con neuropediatría (0,75 por 100.000), el 18,8 % de las personas atendidas vivía en municipios sin sede y el 15,8 % de las atenciones de sus residentes se prestó fuera del departamento.",
      "Casi la mitad de esas atenciones fuera del Huila (832 de 1.695) se prestaron en Bogotá D.C. El número de personas atendidas pasó de 333 en 2019 a 944 en 2024."
    ]
  },

  normativa: {
    ley2628: {
      nombre: "Ley 2628 del 26 de agosto de 2026",
      fecha: "26 de agosto de 2026 · Diario Oficial No. 53.604",
      objeto: "Establece medidas de atención integral, inclusión y protección para las personas con trastorno del espectro autista (TEA), otros trastornos del neurodesarrollo (como el TDAH y los trastornos del aprendizaje) y condiciones similares, en salud, educación, trabajo y vida en comunidad, y busca un diagnóstico pronto y eficaz.",
      alcance: "No es solo una ley de autismo: cubre también otros trastornos del neurodesarrollo. Esta app usa solo datos de TEA (F84), así que muestra una parte de la población a la que se dirige la ley.",
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
      { k: "RIPS (SISPRO)", d: "Personas y atenciones con diagnóstico principal en el grupo F84 de la CIE-10 (F84.0 a F84.9) por departamento y municipio de residencia y por departamento de la IPS, 2019-2025. Cada persona se cuenta una vez por año con diagnóstico confirmado. Año de referencia: 2024." },
      { k: "REPS", d: "Sedes con el servicio 388 (neuropediatría) habilitado, con telemedicina y de naturaleza pública; corte del 13/11/2026." },
      { k: "DANE", d: "Proyección de población 2024 por departamento e Índice de Pobreza Multidimensional (IPM) 2024." }
    ],
    unidad: "Estudio ecológico transversal: 33 territorios (32 departamentos y Bogotá D.C.). Los registros con residencia desconocida se excluyen de las tasas (en 2024, 2.893 personas y 37.271 atenciones).",
    definiciones: [
      { k: "Prevalencia atendida", f: "personas atendidas con F84 ÷ población del departamento (DANE 2024) × 100.000", d: "A cuántas personas llega el sistema. Nacional 2024: 97,8 por 100.000 habitantes." },
      { k: "Tasa de atención", f: "atenciones a personas con F84 ÷ personas atendidas con F84 × 100", d: "Cuánta atención recibe cada persona atendida. Nacional 2024: 1.214 atenciones por cada 100 personas atendidas." },
      { k: "Sedes por 100.000 habitantes", f: "sedes con neuropediatría (REPS) ÷ población × 100.000", d: "Disponibilidad del servicio. Nacional: 1,12." },
      { k: "Casos esperados", f: "población × 1/127 (OMS)", d: "Demanda potencial si el autismo fuera igual de frecuente en todo el país; solo para comparar territorios." }
    ],
    codigos: "El grupo F84 reúne ocho códigos: F84.0 autismo en la niñez, F84.1 autismo atípico, F84.2 síndrome de Rett, F84.3 otro trastorno desintegrativo de la niñez, F84.4 trastorno hiperactivo asociado con retraso mental y movimientos estereotipados, F84.5 síndrome de Asperger, F84.8 otros trastornos generalizados del desarrollo y F84.9 no especificado. Es más amplio que el TEA del DSM-5 (incluye Rett y F84.4) y los cubos públicos no permiten separar los códigos; en la CIE-11 el autismo pasa a un solo código (6A02).",
    medidas: "Gini, Theil T y desviación logarítmica media ponderados por población, con descomposición entre y dentro de regiones; índice de concentración según IPM; índices de pendiente (SII/RII); disimilitud; correlaciones de Spearman y regresión cuasi-Poisson con offset de población; IC por bootstrap (4.000 réplicas) y jackknife.",
    limitaciones: [
      "El análisis es ecológico: las asociaciones entre departamentos no se pueden atribuir a las personas ni demuestran causalidad.",
      "El RIPS registra atenciones facturadas con F84 como diagnóstico principal; la prevalencia atendida no es la frecuencia del TEA ni su carga de enfermedad.",
      "F84 incluye diagnósticos que hoy no se consideran autismo (síndrome de Rett, F84.4) y no se puede desagregar por código.",
      "La transición al RIPS como soporte de la factura electrónica (2025) rompe la comparabilidad de la serie; según la hipótesis del equipo, 2025 se acerca más al número real y los años anteriores lo subestiman.",
      "Las sedes REPS indican habilitación, no capacidad, tiempos de espera ni disponibilidad real, y su corte (2026) difiere del año de las atenciones (2024).",
      "La población 2024 se tomó de una fuente secundaria que reproduce las proyecciones del DANE; junto con el IPM está pendiente de verificación contra la tabla oficial.",
      "Con 33 unidades los intervalos son amplios y los índices son sensibles a valores atípicos como Atlántico.",
      "No se calcularon tasas por régimen por falta de denominadores de afiliados verificados."
    ]
  },

  /* Glosario: "re" es el patrón que activa el tooltip en el texto; "url", un enlace verificable. */
  glosario: [
    { id:"tea", t:"TEA (trastorno del espectro autista)", re:"\\bTEA\\b", d:"Trastorno del neurodesarrollo que se manifiesta desde la primera infancia con dificultades persistentes en la comunicación y la interacción social, y con patrones de conducta, intereses o actividades restringidos y repetitivos. Se habla de espectro porque la intensidad y las necesidades de apoyo varían mucho entre personas; puede o no acompañarse de discapacidad intelectual. La OMS estima que 1 de cada 127 personas tiene autismo.", fuente:"American Psychiatric Association, DSM-5-TR (2022); OMS, nota descriptiva", url:"https://doi.org/10.1176/appi.books.9780890425787" },
    { id:"f84", t:"F84", re:"\\bF84\\b", d:"Grupo de la Clasificación Internacional de Enfermedades (CIE-10) para los trastornos generalizados del desarrollo. Reúne ocho códigos: F84.0 autismo en la niñez, F84.1 autismo atípico, F84.2 síndrome de Rett, F84.3 otro trastorno desintegrativo de la niñez, F84.4 trastorno hiperactivo asociado con retraso mental y movimientos estereotipados, F84.5 síndrome de Asperger, F84.8 otros trastornos generalizados del desarrollo y F84.9 trastorno generalizado del desarrollo no especificado. No coincide exactamente con el TEA del DSM-5: incluye el síndrome de Rett y el F84.4, que hoy no se consideran autismo. Esta app cuenta a las personas con al menos una atención con cualquiera de esos códigos como diagnóstico principal; los cubos públicos no permiten separarlos.", fuente:"OMS, CIE-10 (versión 2019)", url:"https://icd.who.int/browse10/2019/en" },
    { id:"rips", t:"RIPS", re:"\\bRIPS\\b", d:"Registro Individual de Prestación de Servicios de Salud: el conjunto de datos que cada prestador reporta por cada atención (quién fue atendido, dónde, cuándo, con qué diagnóstico y qué servicio recibió). El Ministerio de Salud lo consolida y lo publica de forma agregada en los cubos de SISPRO, que son la fuente de las personas y atenciones de esta app.", fuente:"Ministerio de Salud, Resolución 2275 de 2023", url:"https://normograma.supersalud.gov.co/compilacion/docs/resolucion_minsaludps_2275_2023.htm" },
    { id:"fevrips", t:"FEV-RIPS", re:"FEV-RIPS|factura electrónica", d:"Desde 2025 el RIPS se reporta como soporte obligatorio de la factura electrónica de venta (FEV) en salud: sin RIPS no se paga la factura. El cambio amplió la cobertura del registro y las personas atendidas casi se duplican en 2025, sobre todo en el régimen contributivo. Según la hipótesis del equipo, 2025 se acerca más al número real de personas atendidas porque antes muchas atenciones quedaban sin el diagnóstico F84. Como la serie 2019-2025 no es comparable, 2024 sigue siendo el año de referencia y 2025 se muestra como análisis de sensibilidad.", fuente:"Ministerio de Salud, Resolución 2275 de 2023", url:"https://normograma.supersalud.gov.co/compilacion/docs/resolucion_minsaludps_2275_2023.htm" },
    { id:"reps", t:"REPS", re:"\\bREPS\\b", d:"Registro Especial de Prestadores de Servicios de Salud: base oficial de las sedes y los servicios que cada prestador tiene habilitados para funcionar. Aquí se usaron las sedes con el servicio 388 (neuropediatría) habilitado al 13/11/2026, con la modalidad de telemedicina y la naturaleza jurídica (pública o privada).", fuente:"Ministerio de Salud, REPS", url:"https://prestadores.minsalud.gov.co/habilitacion/" },
    { id:"sispro", t:"SISPRO", re:"\\bSISPRO\\b", d:"Sistema Integrado de Información de la Protección Social del Ministerio de Salud. Reúne registros del sistema de salud (RIPS, afiliación, prestadores, estadísticas vitales) y los publica como cubos de consulta con datos agregados, sin identificar a las personas.", fuente:"Ministerio de Salud, SISPRO", url:"https://www.sispro.gov.co/" },
    { id:"prevtratada", t:"Prevalencia atendida (prevalencia tratada)", re:"prevalencia (atendida|tratada)", p:"De cada 100.000 habitantes del departamento, cuántos fueron atendidos con diagnóstico de TEA en el año.", d:"Número de personas que tuvieron al menos una atención registrada con F84 como diagnóstico principal en el año, dividido por la población del departamento (DANE 2024) y multiplicado por 100.000. Sirve para comparar departamentos de distinto tamaño y para estimar la brecha frente a los casos esperados: 97,8 por 100.000 frente a unos 787 por 100.000 si 1 de cada 127 personas tuviera autismo. Es distinta de la prevalencia del trastorno: no cuenta a quienes no consultan, no tienen diagnóstico o se registran con otro código, y aumenta cuando mejora el diagnóstico o el registro aunque no haya más casos. Por eso se lee como acceso a la atención más que como frecuencia del TEA.", fuente:"Definición operativa del proyecto; uso similar en García-Zambrano y Pinto-Ocampo (2024)", url:"https://doi.org/10.1007/s10803-024-06534-9" },
    { id:"tasa", t:"Tasa por 100.000 habitantes", re:"por 100\\.000 habitantes", d:"Número de casos dividido por la población del territorio y multiplicado por 100.000. En esta app el numerador son las personas atendidas con F84 y el denominador, toda la población del departamento (no la población con TEA). Permite comparar departamentos de tamaños muy distintos: Bogotá atendió 8.719 personas y Atlántico 6.812, pero por habitante Atlántico atiende más del doble (240,1 frente a 110,1 por 100.000). La población usada es la proyección DANE 2024.", fuente:"OPS, Indicadores de salud: aspectos conceptuales y operativos", url:"https://www.paho.org/es/documentos/indicadores-salud-aspectos-conceptuales-operativos" },
    { id:"atpp", t:"Tasa de atención (atenciones por 100 personas atendidas)", re:"tasa de atención|atenciones por (cada )?100 personas atendidas|atenciones por persona", p:"Cuántas atenciones recibieron, en promedio, cada 100 personas atendidas con TEA.", d:"Número de atenciones (consultas, terapias, procedimientos) a personas con F84 como diagnóstico principal, dividido por el número de personas atendidas con F84 y multiplicado por 100. El denominador son las personas con TEA atendidas, no la población del departamento. Mide la intensidad del uso de servicios, no la cobertura: Atlántico registró 2.640 atenciones por cada 100 personas atendidas (26,4 por persona) y Antioquia 360 (3,6 por persona). Valores altos pueden reflejar terapias frecuentes, pero también diferencias en la forma de facturar y reportar.", fuente:"Definición operativa del proyecto con datos del RIPS (SISPRO)", url:"https://www.sispro.gov.co/" },
    { id:"sede", t:"Sede con neuropediatría", re:"sedes? (con|de) neuropediatría", d:"Sede de un prestador que tiene habilitado el servicio de neuropediatría (código 388) en el REPS. Es un indicador de habilitación: no dice cuántos neuropediatras hay, cuántas horas atienden, ni cuánto se espera por una cita. Una sede que solo ofrece telemedicina también cuenta.", fuente:"Ministerio de Salud, REPS", url:"https://prestadores.minsalud.gov.co/habilitacion/" },
    { id:"ipm", t:"IPM (Índice de Pobreza Multidimensional)", re:"\\bIPM\\b", d:"Porcentaje de personas que viven en hogares con privaciones en al menos el 33 % de 15 indicadores agrupados en cinco dimensiones: condiciones educativas del hogar, niñez y juventud, trabajo, salud, y servicios públicos y vivienda. A diferencia de la pobreza monetaria, no mide ingresos sino carencias. Un IPM de 70 % (Vichada) significa que 7 de cada 10 personas viven en hogares pobres; uno de 5 % (Bogotá), 1 de cada 20.", fuente:"DANE, Pobreza multidimensional", url:"https://www.dane.gov.co/index.php/estadisticas-por-tema/pobreza-y-condiciones-de-vida/pobreza-multidimensional" },
    { id:"mchat", t:"M-CHAT-R/F", re:"M-CHAT(-R/F)?", d:"Lista de chequeo modificada para autismo en niños pequeños, revisada y con entrevista de seguimiento. Los padres o cuidadores responden 20 preguntas sobre conductas del niño; un resultado alterado no es un diagnóstico, sino una señal para remitir a evaluación especializada. Está validado entre los 16 y 30 meses; repetir el tamizaje mejora su sensibilidad.", fuente:"M-CHAT (sitio oficial); Wieckowski et al., 2021", url:"https://mchatscreen.com/" },
    { id:"sextil", t:"Sextil", re:"sextil(es)?", d:"Cada uno de los seis grupos con el mismo número de departamentos (5 o 6) en que se divide un indicador ordenado de menor a mayor. Se usa para colorear los mapas porque garantiza que todos los colores aparezcan; su desventaja es que dos departamentos con valores muy parecidos pueden quedar en grupos distintos, por eso la leyenda muestra el rango de cada grupo.", fuente:"Brewer y Pickle, 2002", url:"https://doi.org/10.1111/1467-8306.00310" },
    { id:"razon", p:"Cuántas veces atiende más el departamento que más atiende que el que menos atiende.", t:"Razón máximo/mínimo y P90/P10", re:"razón (máximo/mínimo|percentil 90)", d:"Cuántas veces es mayor el valor más alto que el más bajo. La razón máximo/mínimo de la tasa es 20,0 (Atlántico frente a Guainía). Como depende solo de dos departamentos, también se usa la razón entre el percentil 90 y el 10 (4,77), que ignora los extremos. Son fáciles de comunicar, pero no usan la información de todos los territorios ni su población.", fuente:"OMS, Handbook on health inequality monitoring (2013)", url:"https://www.who.int/publications/i/item/9789241548632" },
    { id:"lorenz", p:"Una curva que muestra qué parte del total recibe cada parte de la población; si todo estuviera repartido de forma pareja, sería una línea recta diagonal.", t:"Curva de Lorenz", re:"curvas? de Lorenz", d:"Gráfico que ordena los departamentos de menor a mayor tasa y muestra, en el eje horizontal, el porcentaje acumulado de la población y, en el vertical, el porcentaje acumulado del indicador (personas atendidas, atenciones o sedes). Si todos tuvieran la misma tasa, la curva coincidiría con la diagonal; cuanto más se curva hacia abajo, más concentrado está el indicador en pocos territorios.", fuente:"Lorenz, 1905; O'Donnell et al., Banco Mundial, 2008", url:"https://doi.org/10.1080/15225437.1905.10503443" },
    { id:"gini", p:"Un número de 0 a 1 que dice qué tan disparejo está repartido algo entre departamentos: 0 es perfectamente parejo y 1 es todo en un solo lugar.", t:"Índice de Gini", re:"\\bGini\\b", d:"Resume la curva de Lorenz en un número: es el área entre la curva y la diagonal, dividida por el área total bajo la diagonal. Va de 0 (todos los departamentos con la misma tasa) a 1 (todo el indicador concentrado en un solo territorio). Aquí se pondera por población: el Gini de las personas atendidas es 0,240 y el de las atenciones 0,486, es decir, las atenciones están más concentradas.", fuente:"O'Donnell et al., Analyzing Health Equity Using Household Survey Data, Banco Mundial, 2008", url:"https://openknowledge.worldbank.org/handle/10986/6896" },
    { id:"theil", p:"Otra medida de qué tan disparejo es el reparto (0 = parejo) que permite separar cuánto se debe a diferencias entre regiones y cuánto a diferencias dentro de cada región.", t:"Theil T", re:"\\bTheil\\b", d:"Índice de desigualdad basado en la idea de entropía. Compara la tasa de cada departamento con la tasa nacional y suma esas diferencias ponderadas por el peso de cada departamento: los que están por encima de la media aportan más. Vale 0 cuando todos tienen la misma tasa y no tiene un máximo fijo. Su gran ventaja es que se descompone exactamente en desigualdad entre grupos (regiones) y dentro de ellos: aquí el Theil de personas atendidas es 0,100 y solo el 37,4 % corresponde a diferencias entre regiones.", fuente:"OMS, Health Equity Assessment Toolkit (HEAT), notas técnicas; Handbook on health inequality monitoring (2013)", url:"https://www.who.int/data/inequality-monitor/assessment_toolkit" },
    { id:"mld", p:"Una medida de desigualdad que se fija sobre todo en los departamentos que menos reciben.", t:"MLD (desviación logarítmica media)", re:"\\bMLD\\b", d:"Otro índice de la familia de Theil (a veces llamado Theil L). Promedia, ponderando por población, el logaritmo de la razón entre la tasa nacional y la de cada departamento, por lo que da más peso a los territorios con tasas bajas. Vale 0 si no hay desigualdad y no se puede calcular si algún departamento tiene valor cero (como las sedes en Amazonas, Guainía, Vaupés y Vichada).", fuente:"OMS, Health Equity Assessment Toolkit (HEAT), notas técnicas", url:"https://www.who.int/data/inequality-monitor/assessment_toolkit" },
    { id:"ci", p:"Dice si algo se reparte más hacia los departamentos pobres (valor negativo) o hacia los menos pobres (valor positivo); 0 es sin inclinación.", t:"Índice de concentración (Wagstaff)", re:"índices? de concentración", d:"Mide si un indicador se concentra en los territorios más pobres o en los menos pobres. Se calcula como un Gini, pero ordenando los departamentos por su pobreza (IPM) en lugar de por su tasa. Va de −1 a 1: 0 indica que no hay relación con la pobreza; un valor positivo, que el indicador se concentra en los menos pobres; uno negativo, en los más pobres. Aquí es +0,044 para las personas atendidas y −0,190 para las sedes.", fuente:"Wagstaff, Paci y van Doorslaer, 1991; O'Donnell et al., 2008", url:"https://doi.org/10.1016/0277-9536(91)90212-U" },
    { id:"sii", p:"Comparan, con una recta, al extremo más pobre del país con el menos pobre: el sii da la diferencia y el rii cuántas veces es mayor uno que otro.", t:"SII y RII", re:"\\b(SII|RII)\\b|índices de pendiente", d:"Índices de pendiente de la desigualdad. Se ordenan los departamentos de más pobre (0) a menos pobre (1) según la población acumulada y se ajusta una recta entre ese rango y la tasa: el SII es la diferencia absoluta estimada entre el extremo menos pobre y el más pobre (en unidades del indicador) y el RII es la razón entre ambos. RII mayor que 1 indica más en los menos pobres; menor que 1, más en los más pobres. Para las personas atendidas el RII es 1,30 (IC95 % 0,73 a 2,31, incluye el 1); para las sedes es 0,31: en el extremo menos pobre la oferta estimada es cerca de un tercio de la del más pobre, coherente con su índice de concentración negativo.", fuente:"Mackenbach y Kunst, 1997", url:"https://doi.org/10.1016/S0277-9536(96)00073-1" },
    { id:"disim", p:"Qué proporción habría que mover de un departamento a otro para que dos repartos quedaran iguales.", t:"Índice de disimilitud", re:"disimilitud", d:"Proporción de personas (o de sedes) que habría que trasladar de un departamento a otro para que dos distribuciones fueran idénticas. Se calcula como la mitad de la suma de las diferencias absolutas entre las proporciones de cada departamento. Va de 0 (distribuciones iguales) a 1. Un valor de 0,233 entre personas atendidas y sedes significa que cerca de 1 de cada 4 tendría que cambiar de departamento para que ambas coincidieran.", fuente:"Duncan y Duncan, 1955", url:"https://doi.org/10.2307/2088328" },
    { id:"rho", p:"Dice si dos cosas suben y bajan juntas entre departamentos, de −1 (una sube cuando la otra baja) a 1 (suben juntas); cerca de 0, no hay relación.", t:"Correlación de Spearman (ρ)", re:"Spearman", d:"Mide si dos indicadores suben o bajan juntos usando el orden (rango) de los departamentos en lugar de sus valores, por lo que es poco sensible a valores extremos como Atlántico. Va de −1 (orden inverso perfecto) a 1 (mismo orden). En esta app: |ρ| ≥ 0,6 fuerte; 0,4 a 0,6 moderada; 0,2 a 0,4 débil; menor, prácticamente nula. Con pocos departamentos (al filtrar por región) el valor es muy inestable.", fuente:"Spearman, 1904", url:"https://doi.org/10.2307/1412159" },
    { id:"rr", p:"Dice cuántas veces más (o menos) se atiende cuando cambia un factor; 1 significa sin cambio.", t:"RR y regresión cuasi-Poisson", re:"cuasi-Poisson|\\bRR\\b", d:"Modelo para conteos (personas atendidas por departamento) que usa la población como denominador y admite más variabilidad entre territorios que el modelo de Poisson. Su resultado es la razón de tasas (RR): cuántas veces cambia la tasa por cada unidad de la variable. RR = 1,32 para las sedes significa una tasa 32 % mayor por cada sede adicional por 100.000 habitantes; RR = 0,71 para el IPM, una tasa 29 % menor por cada 10 puntos más de pobreza.", fuente:"Wedderburn, 1974", url:"https://doi.org/10.1093/biomet/61.3.439" },
    { id:"ic", p:"El margen de error de una cifra: el valor real probablemente está dentro de ese rango.", t:"IC95 % y bootstrap", re:"IC95 ?%|bootstrap", d:"El intervalo de confianza del 95 % indica el rango de valores compatibles con los datos. Para los índices de desigualdad se estimó con bootstrap: se generaron 4.000 muestras de 33 departamentos elegidos al azar con reemplazo, se recalculó el índice en cada una y se tomaron los percentiles 2,5 y 97,5. Intervalos anchos, como los de esta app, reflejan que hay pocas unidades y algunos valores extremos.", fuente:"Efron, 1979", url:"https://doi.org/10.1214/aos/1176344552" },
    { id:"ecologico", p:"Un análisis que compara territorios, no personas; lo que vale para un departamento no necesariamente vale para cada persona que vive en él.", t:"Estudio ecológico", re:"ecológic[oa]s?", d:"Análisis en el que la unidad son grupos (aquí, departamentos) y no personas. Sirve para describir territorios y plantear hipótesis, pero sus asociaciones no se pueden trasladar a las personas (falacia ecológica): que los departamentos más pobres tengan menor tasa de atención no prueba que las familias pobres consulten menos, ni que la pobreza sea la causa.", fuente:"Greenland y Robins, 1994", url:"https://doi.org/10.1093/oxfordjournals.aje.a117069" },
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
    { c:"Robins DL, Casagrande K, Barton M, Chen CMA, Dumont-Mathieu T, Fein D. Validation of the Modified Checklist for Autism in Toddlers, Revised With Follow-up (M-CHAT-R/F). Pediatrics. 2014;133(1):37-45.", url:"https://doi.org/10.1542/peds.2013-1813" },
    { c:"Berument SK, Rutter M, Lord C, Pickles A, Bailey A. Autism screening questionnaire: diagnostic validity. Br J Psychiatry. 1999;175:444-51.", url:"https://doi.org/10.1192/bjp.175.5.444" },
    { c:"Scott FJ, Baron-Cohen S, Bolton P, Brayne C. The CAST (Childhood Asperger Syndrome Test): preliminary development of a UK screen for mainstream primary-school-age children. Autism. 2002;6(1):9-31.", url:"https://doi.org/10.1177/1362361302006001003" },
    { c:"Auyeung B, Baron-Cohen S, Wheelwright S, Allison C. The Autism Spectrum Quotient: Children's Version (AQ-Child). J Autism Dev Disord. 2008;38(7):1230-40.", url:"https://doi.org/10.1007/s10803-007-0504-z" },
    { c:"Baron-Cohen S, Hoekstra RA, Knickmeyer R, Wheelwright S. The Autism-Spectrum Quotient (AQ), Adolescent Version. J Autism Dev Disord. 2006;36(3):343-50.", url:"https://doi.org/10.1007/s10803-006-0073-6" },
    { c:"Baron-Cohen S, Wheelwright S, Skinner R, Martin J, Clubley E. The Autism-Spectrum Quotient (AQ): evidence from Asperger syndrome/high-functioning autism, males and females, scientists and mathematicians. J Autism Dev Disord. 2001;31(1):5-17.", url:"https://doi.org/10.1023/A:1005653411471" },
    { c:"Allison C, Auyeung B, Baron-Cohen S. Toward brief red flags for autism screening: the Short Autism Spectrum Quotient and the Short Quantitative Checklist in 1,000 cases and 3,000 controls. J Am Acad Child Adolesc Psychiatry. 2012;51(2):202-12.", url:"https://doi.org/10.1016/j.jaac.2011.11.003" },
    { c:"Ritvo RA, Ritvo ER, Guthrie D, Ritvo MJ, Hufnagel DH, McMahon W, et al. The Ritvo Autism Asperger Diagnostic Scale-Revised (RAADS-R): a scale to assist the diagnosis of autism spectrum disorder in adults. J Autism Dev Disord. 2011;41(8):1076-89.", url:"https://doi.org/10.1007/s10803-010-1133-5" },
    { c:"Lord C, Risi S, Lambrecht L, Cook EH, Leventhal BL, DiLavore PC, et al. The Autism Diagnostic Observation Schedule-Generic: a standard measure of social and communication deficits associated with the spectrum of autism. J Autism Dev Disord. 2000;30(3):205-23.", url:"https://doi.org/10.1023/A:1005592401947" },
    { c:"Lord C, Rutter M, Le Couteur A. Autism Diagnostic Interview-Revised: a revised version of a diagnostic interview for caregivers of individuals with possible pervasive developmental disorders. J Autism Dev Disord. 1994;24(5):659-85.", url:"https://doi.org/10.1007/BF02172145" },
    { c:"National Institute for Health and Care Excellence. Autism spectrum disorder in under 19s: recognition, referral and diagnosis (CG128). Londres: NICE.", url:"https://www.nice.org.uk/guidance/cg128" },
    { c:"National Institute for Health and Care Excellence. Autism spectrum disorder in adults: diagnosis and management (CG142). Londres: NICE.", url:"https://www.nice.org.uk/guidance/cg142" },
    { c:"Ministerio de Salud y Protección Social. Protocolo clínico para el diagnóstico, tratamiento y ruta de atención integral de niños y niñas con trastornos del espectro autista. Bogotá: MinSalud; 2016.", url:"https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/DE/CA/protocolo-clinico-diagnostico-ninos-trans-espectro-autista.pdf" },
    { c:"Page MJ, McKenzie JE, Bossuyt PM, Boutron I, Hoffmann TC, Mulrow CD, et al. The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ. 2021;372:n71.", url:"https://doi.org/10.1136/bmj.n71" },
    { c:"Aromataris E, Lockwood C, Porritt K, Pilla B, Jordan Z, editores. JBI Manual for Evidence Synthesis. JBI; 2024.", url:"https://doi.org/10.46658/JBIMES-24-01" },
    { c:"Campbell M, McKenzie JE, Sowden A, Katikireddi SV, Brennan SE, Ellis S, et al. Synthesis without meta-analysis (SWiM) in systematic reviews: reporting guideline. BMJ. 2020;368:l6890.", url:"https://doi.org/10.1136/bmj.l6890" },
    { c:"Benchimol EI, Smeeth L, Guttmann A, Harron K, Moher D, Petersen I, et al. The REporting of studies Conducted using Observational Routinely-collected health Data (RECORD) statement. PLoS Med. 2015;12(10):e1001885.", url:"https://doi.org/10.1371/journal.pmed.1001885" },
    { c:"Congreso de la República de Colombia. Ley 2628 de 2026 (26 de agosto), por medio de la cual se establecen medidas, servicios y mecanismos de atención integral para la protección e inclusión de las personas con TEA. Diario Oficial No. 53.604 [texto compilado, normograma MinTIC].", url:"https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_2628_2026.htm" },
    { c:"Presidencia de la República. Ley 2628 del 26 de agosto de 2026 [PDF oficial].", url:"https://dapre.presidencia.gov.co/normativa/normativa/LEY%20No.%202628%20DEL%2026%20DE%20AGOSTO%20DE%202026.pdf" },
    { c:"Ministerio de Salud y Protección Social. Política Nacional de Salud Mental 2024-2033. Bogotá: MinSalud; 2024 [copia alojada por el Colegio Colombiano de Psicólogos].", url:"https://www.colpsic.org.co/wp-content/uploads/2025/09/Politica-Nacional-de-Salud-Mental-2024-2033-MinSalud-Colombia-v1.pdf" },
    { c:"Ministerio de Salud y Protección Social. Salud mental [portal institucional].", url:"https://www.minsalud.gov.co/salud/publica/salud-mental" },
    { c:"Organización Mundial de la Salud. Clasificación Internacional de Enfermedades, 10.ª revisión (CIE-10), versión 2019: F84 Trastornos generalizados del desarrollo.", url:"https://icd.who.int/browse10/2019/en#/F84" },
    { c:"Ministerio de Salud y Protección Social. Resolución 2275 de 2023: resolución única del RIPS como soporte de la factura electrónica de venta en salud.", url:"https://normograma.supersalud.gov.co/compilacion/docs/resolucion_minsaludps_2275_2023.htm" },
    { c:"Ministerio de Salud. Resolución 8430 de 1993: normas científicas, técnicas y administrativas para la investigación en salud.", url:"https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/DE/DIJ/RESOLUCION-8430-DE-1993.PDF" },
    { c:"Congreso de la República. Ley 1618 de 2013: garantía del pleno ejercicio de los derechos de las personas con discapacidad.", url:"https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=52081" }
  ],

  /* Instrumentos por etapa del ciclo vital (edades según los artículos de validación) */
  instrumentos: {
    intro: "El M-CHAT-R/F, el cuestionario de tamizaje más usado en el mundo, solo sirve para niños pequeños (16 a 30 meses). Pero el 83 % de las personas atendidas en 2024 tenía 6 años o más y el 12,6 % era adulta. El autismo se puede detectar y diagnosticar en cualquier etapa de la vida, con herramientas distintas según la edad. Un tamizaje positivo no es un diagnóstico: indica que la persona debe ser evaluada por un equipo especializado.",
    nota: "Muchos de estos instrumentos (SCQ, ADOS-2, ADI-R) requieren licencia y entrenamiento, y conviene usar versiones en español validadas. Esta lista orienta; no reemplaza las guías clínicas.",
    items: [
      { id:"signos", nombre:"Signos de alarma del desarrollo", tipo:"Vigilancia", desde:0.5, hasta:5, quien:"Cuidadores, docentes y personal de salud", d:"Lista de conductas esperadas por edad (6, 12, 18 meses, 2 años y más). Su ausencia o la pérdida de habilidades ya adquiridas es motivo de consulta y de tamizaje.", ref:"MinSalud, Protocolo clínico para niños y niñas con TEA (2016)", url:"https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/DE/CA/protocolo-clinico-diagnostico-ninos-trans-espectro-autista.pdf" },
      { id:"mchat", nombre:"M-CHAT-R/F", tipo:"Tamizaje", desde:1.33, hasta:2.5, quien:"Padres o cuidadores, con entrevista de seguimiento", d:"20 preguntas sobre conductas del niño; si el resultado es de riesgo, una entrevista de seguimiento reduce los falsos positivos. Gratuito y validado en español.", ref:"Robins et al., Pediatrics 2014", url:"https://doi.org/10.1542/peds.2013-1813" },
      { id:"scq", nombre:"SCQ (Cuestionario de Comunicación Social)", tipo:"Tamizaje", desde:4, hasta:65, quien:"Padres o cuidadores", d:"40 preguntas de sí o no sobre comunicación, interacción social y conductas repetitivas. Se usa desde los 4 años (edad mental de al menos 2) hasta la adultez. Requiere licencia.", ref:"Berument et al., Br J Psychiatry 1999", url:"https://doi.org/10.1192/bjp.175.5.444" },
      { id:"cast", nombre:"CAST (Childhood Autism Spectrum Test)", tipo:"Tamizaje", desde:4, hasta:11, quien:"Padres o cuidadores", d:"Cuestionario para niños en edad escolar, pensado para detectar casos en la población general, incluidos niños sin discapacidad intelectual que suelen diagnosticarse tarde.", ref:"Scott et al., Autism 2002", url:"https://doi.org/10.1177/1362361302006001003" },
      { id:"aqc", nombre:"AQ-Child", tipo:"Tamizaje", desde:4, hasta:11, quien:"Padres o cuidadores", d:"Versión infantil del Cociente del Espectro Autista: mide rasgos autistas en niños de 4 a 11 años.", ref:"Auyeung et al., J Autism Dev Disord 2008", url:"https://doi.org/10.1007/s10803-007-0504-z" },
      { id:"aqa", nombre:"AQ-Adolescente", tipo:"Tamizaje", desde:12, hasta:15, quien:"Padres o cuidadores", d:"Versión para adolescentes de 12 a 15 años del Cociente del Espectro Autista.", ref:"Baron-Cohen et al., J Autism Dev Disord 2006", url:"https://doi.org/10.1007/s10803-006-0073-6" },
      { id:"aq", nombre:"AQ y AQ-10 (adultos)", tipo:"Tamizaje", desde:16, hasta:65, quien:"La propia persona (autoaplicado)", d:"El AQ tiene 50 preguntas; su versión breve AQ-10, de 10 preguntas, es la que recomienda la guía NICE para decidir si se remite a un adulto a evaluación diagnóstica.", ref:"Baron-Cohen et al., 2001; Allison et al., 2012", url:"https://doi.org/10.1016/j.jaac.2011.11.003" },
      { id:"raads", nombre:"RAADS-R", tipo:"Apoyo al diagnóstico", desde:18, hasta:65, quien:"La persona, con apoyo del clínico", d:"80 preguntas sobre experiencias actuales y de la infancia. Ayuda a reconocer el autismo en adultos sin discapacidad intelectual que nunca fueron diagnosticados.", ref:"Ritvo et al., J Autism Dev Disord 2011", url:"https://doi.org/10.1007/s10803-010-1133-5" },
      { id:"ados", nombre:"ADOS-2", tipo:"Diagnóstico", desde:1, hasta:65, quien:"Profesional entrenado (observación directa)", d:"Observación estandarizada del juego, la comunicación y la interacción. Tiene módulos según la edad y el nivel de lenguaje, desde los 12 meses hasta la adultez. Requiere licencia y entrenamiento.", ref:"Lord et al., J Autism Dev Disord 2000", url:"https://doi.org/10.1023/A:1005592401947" },
      { id:"adir", nombre:"ADI-R", tipo:"Diagnóstico", desde:2, hasta:65, quien:"Profesional entrenado (entrevista a cuidadores)", d:"Entrevista detallada a los cuidadores sobre el desarrollo temprano y la conducta actual. Útil también en adultos si hay un informante que conozca su infancia.", ref:"Lord et al., J Autism Dev Disord 1994", url:"https://doi.org/10.1007/BF02172145" }
    ],
    guias: [
      { label:"NICE CG128: autismo en menores de 19 años (reconocimiento, remisión y diagnóstico)", url:"https://www.nice.org.uk/guidance/cg128" },
      { label:"NICE CG142: autismo en adultos (diagnóstico y manejo)", url:"https://www.nice.org.uk/guidance/cg142" },
      { label:"MinSalud: Protocolo clínico para el diagnóstico, tratamiento y ruta de atención integral de niños y niñas con TEA", url:"https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/DE/CA/protocolo-clinico-diagnostico-ninos-trans-espectro-autista.pdf" }
    ]
  },

  /* Vacíos de implementación de la Ley 2628 de 2026 (lectura del equipo, para seguimiento) */
  vacios: [
    { t:"La reglamentación tiene hitos definidos", d:"La ley fija cuatro plazos: 6 meses para reglamentar el Comité Nacional de Inclusión (hacia febrero de 2027) y 12 meses para la política pública, la ruta de atención y el programa de capacitación (hacia agosto de 2027). A la fecha de esta app ninguno ha vencido; esta app no revisó el estado de los borradores.", dato:"Hitos de seguimiento: febrero y agosto de 2027.", art:"4" },
    { t:"Un cronograma facilitaría el seguimiento de los demás mandatos", d:"La actualización del protocolo clínico (arts. 6 y 9), el conteo estadístico (art. 8), la detección temprana (art. 12) y la ruta educativa (arts. 15 a 18) no tienen fecha límite en la ley; definir un cronograma ayudaría a darles seguimiento.", dato:"8 de los 13 grupos de artículos resumidos no tienen plazo (algunos, como las actividades del 2 de abril, no lo necesitan).", art:"6" },
    { t:"La actualización del protocolo puede incluir a los adultos", d:"El protocolo clínico vigente (MinSalud, 2016) está dirigido a niños y niñas, y la ley ordena actualizarlo para niños, niñas y adolescentes (art. 9). La actualización es una oportunidad para incluir orientaciones de diagnóstico en adultos, que con frecuencia lo reciben más tarde.", dato:"El 12,6 % de las personas atendidas en 2024 tenía 18 años o más.", art:"9" },
    { t:"La detección temprana puede acompañarse de metas e indicadores", d:"El artículo 12 orienta la detección temprana mediante la remisión en las evaluaciones pediátricas periódicas. La reglamentación puede precisar instrumentos, edades, metas e indicadores, que no están definidos en las normas revisadas aquí.", dato:"Solo el 16,7 % de las personas atendidas tenía 5 años o menos.", art:"12" },
    { t:"El certificado requiere capacidad en todos los territorios", d:"La certificación debe hacerse en dos meses en centros especializados ubicados en territorios con red de alta complejidad (art. 7). Cuatro departamentos no tienen sedes de neuropediatría y una de cada cinco personas atendidas vive en un municipio sin sede: la telemedicina y las redes entre departamentos pueden ayudar a cumplir el plazo en esos territorios.", dato:"4 departamentos sin sede; 19,9 % de personas en municipios sin sede; 15,9 % de sedes con telemedicina.", art:"7" },
    { t:"La capacitación del primer nivel puede fijar cobertura y contenidos", d:"El artículo 14 ordena capacitar al personal de atención primaria que atiende a personas con TEA, con registro en el RETHUS. La reglamentación puede definir la cobertura, los contenidos mínimos y la forma de evaluarla.", dato:"El primer contacto (medicina familiar y general) es quien aplica el tamizaje y remite.", art:"14" },
    { t:"La oportunidad del diagnóstico necesita un indicador", d:"El artículo 8 pide un conteo estadístico. Los registros actuales (RIPS) cuentan personas atendidas, pero no la edad al diagnóstico ni el tiempo entre la sospecha y la confirmación; incluirlos permitiría medir lo que la ley busca mejorar.", dato:"El nuevo registro FEV-RIPS (2025) es una buena base para construirlo.", art:"8" },
    { t:"La ley y la Política de Salud Mental pueden articularse", d:"La ley ordena una política pública específica para el TEA (art. 4) y está vigente la Política Nacional de Salud Mental 2024-2033, que aborda los trastornos del neurodesarrollo de forma general. Definir cómo se articulan, quién coordina y con qué recursos facilitaría la implementación de ambas.", dato:"La PNSM se refiere al autismo dentro de los trastornos del neurodesarrollo (p. 16).", art:"10" }
  ],
  vaciosNota: "Lectura técnica del equipo del proyecto con base en el texto de la ley, la PNSM y los datos de esta app. Son aportes para la reglamentación y el seguimiento.",

  /* Paralelo Ley 2628 de 2026 ↔ Política Nacional de Salud Mental 2024-2033 */
  paralelo: [
    { ley:"Detección temprana (art. 12)", pnsm:"Eje 2. Prevención: identificación temprana de trastornos del neurodesarrollo (pp. 60 y 65)", rel:"coincide", d:"Ambas buscan detectar a tiempo. La PNSM aborda el neurodesarrollo en general y la ley orienta la remisión temprana: la reglamentación puede precisar cómo detectar el autismo en cada edad." },
    { ley:"Protocolo clínico y diagnóstico (arts. 6 y 9)", pnsm:"Eje 3. Atención integral de los problemas y trastornos mentales", rel:"vacio", d:"La ley ordena actualizar el protocolo para niños, niñas y adolescentes y el eje 3 de la PNSM ofrece el marco de atención integral. Articularlos permitiría incluir también orientaciones para adultos." },
    { ley:"Certificado Único (art. 7)", pnsm:"Sin equivalente en la PNSM", rel:"solo-ley", d:"Es un mecanismo nuevo y propio de la ley; la PNSM no lo contempla." },
    { ley:"Ruta de atención clara y pública (arts. 7 y 13)", pnsm:"Eje 5. Lineamiento de modelo de atención con frecuencias de uso de servicios, incluido el neurodesarrollo (p. 74)", rel:"coincide", d:"Las dos prometen definir cómo y con qué frecuencia se atiende. Si se articulan, la ruta del TEA podría fijar la intensidad de terapias, que hoy varía entre 360 y 2.640 atenciones por cada 100 personas atendidas según el departamento." },
    { ley:"Capacitación del personal de salud (art. 14)", pnsm:"Estrategia transversal 5. Fortalecimiento del talento humano (p. 76)", rel:"coincide", d:"Ambas reconocen el talento humano como una prioridad; la reglamentación puede fijar metas de formación en autismo para el primer nivel." },
    { ley:"Estadísticas y seguimiento (art. 8)", pnsm:"Estrategia transversal 4. Observatorio de Salud Mental (p. 75)", rel:"coincide", d:"El observatorio existente podría alojar el conteo que pide la ley, siempre que incluya indicadores de oportunidad diagnóstica." },
    { ley:"Inclusión educativa, laboral y apoyo a cuidadores (arts. 15 a 23)", pnsm:"Eje 4. Rehabilitación integral e inclusión social, con modelos comunitarios para el neurodesarrollo (pp. 68-70)", rel:"coincide", d:"Es donde más se parecen: ambas buscan inclusión, reducir el estigma y apoyar a las familias." },
    { ley:"Política pública TEA y Comité Nacional de Inclusión (arts. 4 y 10)", pnsm:"Eje 5. Gestión, articulación y coordinación sectorial y transectorial", rel:"vacio", d:"La ley crea su propio comité y su propia política; la PNSM tiene sus instancias. Un mecanismo de articulación aprovecharía lo que ya existe y evitaría duplicar esfuerzos." }
  ],

  /* Diagrama causal: ¿qué explica el número de atenciones? (modelo conceptual) */
  causal: {
    nodos: [
      { id:"pobreza", col:0, row:0, t:"Pobreza y condiciones sociales", m:"si", sec:"pobreza", d:"Medido con el IPM. Los departamentos más pobres atienden a menos personas aun con la misma oferta (RR 0,71 por cada 10 puntos de IPM)." },
      { id:"geo", col:0, row:1, t:"Distancia y geografía", m:"parcial", sec:"movilidad", d:"Aproximado con el % de atenciones fuera del departamento y el % de personas en municipios sin sede." },
      { id:"aseg", col:0, row:2, t:"Aseguramiento y autorizaciones (EPS, régimen)", m:"parcial", sec:"nacional", d:"Solo se conoce el número de personas por régimen; los datos públicos no incluyen autorizaciones ni tiempos de espera." },
      { id:"estigma", col:0, row:3, t:"Conocimiento y estigma en familias y comunidad", m:"no", d:"No medido. La literatura lo describe como causa de consulta tardía." },
      { id:"aps", col:0, row:4, t:"Formación del primer nivel", m:"no", d:"No medido. La Ley 2628 (art. 14) ordena capacitar al personal de atención primaria." },
      { id:"prev", col:1, row:0, t:"Frecuencia real del autismo", m:"no", d:"No medida en Colombia. La OMS estima 1 de cada 127 personas; se supone parecida entre departamentos." },
      { id:"tamizaje", col:1, row:1, t:"Detección y tamizaje", m:"no", d:"No hay datos de cuántas personas se tamizan ni con qué herramienta, en ninguna edad." },
      { id:"oferta", col:1, row:2, t:"Oferta de servicios (sedes, especialistas, telemedicina)", m:"si", sec:"oferta", d:"Medido con las sedes de neuropediatría del REPS. Sigue en buena parte a la demanda esperada (ρ = 0,80); lo que se aparta depende más de la región que de la pobreza. No incluye psiquiatría infantil, psicología, fonoaudiología ni terapia ocupacional." },
      { id:"interdis", col:1, row:3, t:"Equipos interdisciplinarios", m:"no", d:"No medido. Un diagnóstico y un plan de terapias completos requieren varias disciplinas; su presencia aumenta las atenciones por persona." },
      { id:"oport", col:2, row:0, t:"Oportunidad del diagnóstico (edad al diagnóstico)", m:"no", d:"No medida: los registros no traen la edad al diagnóstico. Un diagnóstico temprano permite intervención temprana, que suele ser más intensiva." },
      { id:"pacientes", col:2, row:1, t:"Personas atendidas (pacientes)", m:"si", sec:"territorio", d:"Medido: 51.474 personas en 2024, una prevalencia atendida de 97,8 por 100.000 habitantes (102.066 con el registro de 2025)." },
      { id:"sever", col:2, row:2, t:"Severidad, nivel de apoyo y comorbilidades", m:"no", d:"No medido. Mayor necesidad de apoyo, discapacidad intelectual o epilepsia suelen implicar más atenciones." },
      { id:"edad", col:2, row:3, t:"Edad de la persona", m:"parcial", sec:"nacional", d:"Solo la distribución nacional por edad. Las terapias se concentran en la edad escolar." },
      { id:"intens", col:3, row:1, t:"Tasa de atención (atenciones por 100 atendidos)", m:"si", sec:"intensidad", d:"Medido: de 360 (Antioquia) a 2.640 (Atlántico) atenciones por cada 100 personas atendidas; 1.214 en el país." },
      { id:"registro", col:3, row:3, t:"Registro y facturación (FEV-RIPS, código F84)", m:"parcial", sec:"nacional", d:"El cambio de reporte de 2025 casi duplicó las personas atendidas. Según la hipótesis del equipo corrige un subregistro previo: antes muchas atenciones quedaban sin F84 como diagnóstico principal. Un mismo servicio puede registrarse como una o varias atenciones según el prestador." },
      { id:"atenciones", col:4, row:2, t:"Número de atenciones", m:"si", sec:"intensidad", d:"Medido: 625.010 atenciones en 2024. Es igual a las personas atendidas por la tasa de atención dividida por 100, más el efecto del registro." }
    ],
    aristas: [
      { de:"pobreza", a:"pacientes", s:"−", d:"Más pobreza, menos personas atendidas (RR 0,71 por 10 puntos de IPM, a igual oferta)." },
      { de:"pobreza", a:"tamizaje", s:"−", d:"Hipótesis: menos controles de crecimiento y desarrollo y menos tamizaje." },
      { de:"geo", a:"pacientes", s:"−", d:"Donde la gente debe salir del departamento se atiende a menos personas (ρ = −0,50)." },
      { de:"aseg", a:"pacientes", s:"±", d:"Hipótesis: las autorizaciones y el régimen condicionan el acceso." },
      { de:"aseg", a:"intens", s:"±", d:"Hipótesis: las EPS autorizan un número de sesiones que limita o amplía la intensidad." },
      { de:"estigma", a:"tamizaje", s:"−", d:"Hipótesis: el estigma retrasa la consulta." },
      { de:"aps", a:"tamizaje", s:"+", d:"Un primer nivel formado detecta y remite antes." },
      { de:"prev", a:"pacientes", s:"+", d:"Más casos reales, más personas que podrían atenderse." },
      { de:"prev", a:"oferta", s:"+", d:"La oferta tiende a ubicarse donde hay más demanda: las sedes crecen casi en proporción a los casos esperados (ρ = 0,80)." },
      { de:"tamizaje", a:"oport", s:"+", d:"Tamizar antes adelanta el diagnóstico (Wieckowski et al., 2021)." },
      { de:"tamizaje", a:"pacientes", s:"+", d:"Más detección, más personas diagnosticadas y atendidas." },
      { de:"oferta", a:"pacientes", s:"+", d:"Más sedes, más personas atendidas (RR 1,32; ρ = 0,65)." },
      { de:"oferta", a:"intens", s:"+", d:"Más sedes, mayor tasa de atención (ρ = 0,55)." },
      { de:"oferta", a:"oport", s:"+", d:"Hipótesis: con oferta cercana el diagnóstico se confirma antes." },
      { de:"interdis", a:"intens", s:"+", d:"Hipótesis: equipos completos ofrecen más tipos de terapia." },
      { de:"interdis", a:"oport", s:"+", d:"Hipótesis: un equipo completo confirma el diagnóstico en menos visitas." },
      { de:"oport", a:"intens", s:"+", d:"Hipótesis: la intervención temprana suele ser más intensiva." },
      { de:"sever", a:"intens", s:"+", d:"Hipótesis: más necesidad de apoyo, más atenciones." },
      { de:"edad", a:"intens", s:"±", d:"La intensidad cambia con la edad (edad escolar)." },
      { de:"pacientes", a:"atenciones", s:"+", d:"Más personas, más atenciones." },
      { de:"intens", a:"atenciones", s:"+", d:"Mayor tasa de atención, más atenciones en total." },
      { de:"registro", a:"atenciones", s:"+", d:"El modo de registrar y facturar cambia el conteo sin cambiar la atención real." }
    ],
    nota: "Modelo conceptual del equipo del proyecto: resume hipótesis y hallazgos de esta app para orientar la revisión sistemática. Las flechas con datos citan resultados del análisis ecológico; las demás son hipótesis por verificar."
  },

  fuentes: [
    { grupo: "Normativa y política pública", items: [
      { label: "Ley 2628 de 2026 (Presidencia de la República)", url: "https://dapre.presidencia.gov.co/normativa/normativa/LEY%20No.%202628%20DEL%2026%20DE%20AGOSTO%20DE%202026.pdf" },
      { label: "Ley 2628 de 2026, texto compilado (normograma MinTIC)", url: "https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_2628_2026.htm" },
      { label: "Política Nacional de Salud Mental 2024-2033 (MinSalud)", url: "https://www.colpsic.org.co/wp-content/uploads/2025/09/Politica-Nacional-de-Salud-Mental-2024-2033-MinSalud-Colombia-v1.pdf" },
      { label: "Salud mental, Ministerio de Salud y Protección Social", url: "https://www.minsalud.gov.co/salud/publica/salud-mental" },
      { label: "Resolución 2275 de 2023 (RIPS como soporte de la factura electrónica)", url: "https://normograma.supersalud.gov.co/compilacion/docs/resolucion_minsaludps_2275_2023.htm" }
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
