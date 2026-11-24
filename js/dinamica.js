/* Modelo conceptual de dinámica de sistemas: oportunidad del diagnóstico de TEA.
   El diagrama es cualitativo; js/simulacion.js simula la parte con datos (mismos ids). Cada relación declara su signo, si tiene demora,
   su forma (no lineal) y de dónde sale: dato de este análisis, literatura, norma o hipótesis del equipo. */
window.TEA_DINAMICA = {
  refs: {
    sy: { t: "Smith-Young et al., 2025", u: "https://doi.org/10.11124/JBIES-23-00332" },
    pa: { t: "Paula et al., 2020", u: "https://doi.org/10.1177/1362361320940073" },
    dm: { t: "Daniels y Mandell, 2014", u: "https://doi.org/10.1177/1362361313480277" },
    wi: { t: "Wieckowski et al., 2021", u: "https://doi.org/10.1016/j.jpeds.2021.03.009" },
    r3: { t: "Resolución 3280 de 2018", u: "https://normograma.supersalud.gov.co/compilacion/docs/resolucion_minsaludps_3280_2018.htm" },
    ley: { t: "Ley 2628 de 2026", u: "https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_2628_2026.htm" },
    r2275: { t: "Resolución 2275 de 2023", u: "https://normograma.supersalud.gov.co/compilacion/docs/resolucion_minsaludps_2275_2023.htm" }
  },
  evid: { dato: "Dato de este análisis", lit: "Literatura", norma: "Norma", hip: "Hipótesis del equipo" },
  formas: {
    s: { t: "Curva en S", d: "Al comienzo cambia poco, después se acelera y al final se estabiliza." },
    sat: { t: "Saturación", d: "Las primeras mejoras rinden mucho; después, cada esfuerzo adicional rinde menos." },
    cong: { t: "Congestión", d: "Crece despacio y se dispara cuando la espera se acerca al límite de la capacidad." },
    dec: { t: "Caída que se frena", d: "Baja rápido al comienzo y cada vez menos después." },
    umb: { t: "Umbral", d: "Casi no cambia hasta cierto punto; superado ese punto, cambia de golpe." },
    esc: { t: "Escalones", d: "Cambia por saltos: una sede o un equipo se abre o no se abre." },
    min: { t: "Factor limitante", d: "Manda el más escaso: sin capacidad no sirve que haya más personas en espera, y al revés." },
    prop: { t: "Casi proporcional", d: "Sube o baja en la misma proporción." }
  },
  nodos: [
    { id: "s1", k: "nivel", x: 190, y: 545, w: 176, h: 88, t: "Personas con TEA sin diagnóstico", d: "Nivel (acumulación) que no se observa en los registros. Si 1 de cada 127 personas tuviera autismo (OMS) se esperarían 414.282 en el país.", ev: "hip" },
    { id: "v1", k: "flujo", x: 338, y: 545, t: "Detección y remisión", d: "Flujo: personas que pasan de no tener diagnóstico a estar en evaluación, por tamizaje, sospecha de la familia o remisión.", ev: "norma" },
    { id: "s2", k: "nivel", x: 492, y: 545, w: 176, h: 88, t: "Personas en espera de evaluación", d: "Nivel que no se observa en los registros públicos. Crece cuando entran más personas de las que se confirman.", ev: "hip" },
    { id: "v2", k: "flujo", up: 1, x: 648, y: 545, t: "Confirmación del diagnóstico", d: "Flujo: personas evaluadas por un equipo que salen con el diagnóstico confirmado.", ev: "hip" },
    { id: "c", k: "centro", x: 852, y: 545, w: 256, h: 124, t: "Pacientes con diagnóstico de TEA", d: "Nivel central. Se aproxima con las personas atendidas con F84: 54.367 en 2024 y 109.135 con el registro de 2025.", ev: "dato", sec: "territorio" },
    { id: "conc", k: "var", x: 880, y: 178, w: 196, t: "Reconocimiento social del TEA", d: "Qué tanto familias, docentes y comunidad reconocen el TEA y saben a dónde acudir.", ev: "hip" },
    { id: "estig", k: "var", x: 600, y: 112, w: 130, t: "Estigma", d: "En una encuesta a 2.942 cuidadores de seis países de América Latina, un tercio se sintió discriminado (Paula et al., 2020). No incluyó a Colombia.", ev: "lit", ref: "pa" },
    { id: "busq", k: "var", x: 338, y: 250, w: 190, t: "Sospecha y búsqueda de atención", d: "Una mayor preocupación de los padres por los primeros signos se asocia con un diagnóstico más temprano (Daniels y Mandell, 2014).", ev: "lit", ref: "dm" },
    { id: "exp", k: "var", x: 610, y: 336, w: 190, t: "Experiencia del primer nivel", d: "Capacidad de medicina general, familiar, enfermería y pediatría para reconocer signos, tamizar y remitir.", ev: "lit", ref: "sy" },
    { id: "brecha", k: "var", x: 1126, y: 262, w: 186, t: "Brecha diagnóstica percibida", d: "Distancia entre las personas esperadas y las diagnosticadas, tal como la muestran los registros: cerca del 12 % de lo esperado con 2024 y del 25 % con 2025.", ev: "dato", sec: "territorio" },
    { id: "prio", k: "var", x: 1306, y: 470, w: 168, t: "Prioridad y recursos asignados", d: "Atención que recibe el tema en la planeación y los recursos que se le asignan.", ev: "hip" },
    { id: "dem", k: "var", x: 1092, y: 545, w: 158, t: "Demanda registrada", d: "Personas y atenciones que quedan en los registros. La forma de registrar cambió en 2025 (FEV-RIPS).", ev: "dato", sec: "nacional" },
    { id: "ofe", k: "var", x: 1150, y: 786, w: 190, t: "Oferta de equipos de diagnóstico", d: "Se aproxima con 590 sedes de neuropediatría. No incluye psiquiatría infantil, psicología, fonoaudiología ni terapia ocupacional.", ev: "dato", sec: "oferta" },
    { id: "aten", k: "var", x: 934, y: 722, w: 170, t: "Atenciones a pacientes", d: "1.214 atenciones por cada 100 personas atendidas en 2024; de 359 a 2.642 entre departamentos.", ev: "dato", sec: "intensidad" },
    { id: "cap", k: "var", x: 752, y: 826, w: 186, t: "Capacidad libre para diagnosticar", d: "Tiempo de los equipos que queda para evaluar a personas nuevas después de atender a quienes ya tienen diagnóstico.", ev: "hip" },
    { id: "tie", k: "var", x: 512, y: 752, w: 150, t: "Tiempo de espera", d: "Las listas de espera fueron la barrera más frecuente (50,2 %) en la encuesta latinoamericana (Paula et al., 2020). Los registros usados aquí no lo miden.", ev: "lit", ref: "pa" },
    { id: "opor", k: "clave", x: 345, y: 914, w: 206, t: "Oportunidad del diagnóstico", d: "Qué tan pronto llega el diagnóstico después de los primeros signos. La edad media al diagnóstico fue de 38 a 120 meses en 42 estudios internacionales (Daniels y Mandell, 2014). Los registros usados aquí no traen la edad al diagnóstico.", ev: "lit", ref: "dm" },
    { id: "conf", k: "var", x: 172, y: 772, w: 186, t: "Confianza y recursos de la familia", d: "Disposición y posibilidad de seguir en el proceso. Las esperas largas traen frustración y carga económica; sentirse escuchado da apoyo (Smith-Young et al., 2025).", ev: "lit", ref: "sy" }
  ],
  tuberias: [["s1","v1"],["v1","s2"],["s2","v2"],["v2","c"]],
  /* b: curvatura de la flecha; dm: demora importante */
  aristas: [
    { de: "c", a: "conc", s: "+", b: 30, dm: 1, f: "s", ev: "hip", d: "Más personas con diagnóstico hacen más visible el TEA en familias, escuelas y redes de apoyo." },
    { de: "conc", a: "estig", s: "−", b: 26, f: "dec", ev: "hip", d: "Reconocer el TEA tiende a reducir el estigma." },
    { de: "estig", a: "busq", s: "−", b: 30, f: "umb", ev: "hip", d: "El estigma frena o retrasa la consulta." },
    { de: "busq", a: "v1", s: "+", b: -14, f: "sat", ev: "lit", ref: "dm", d: "Más preocupación y búsqueda de las familias se asocian con un diagnóstico más temprano." },
    { de: "c", a: "exp", s: "+", b: 26, dm: 1, f: "s", ev: "hip", d: "Atender a más personas con TEA da experiencia al primer nivel para reconocer nuevos casos." },
    { de: "exp", a: "v1", s: "+", b: 34, f: "sat", ev: "lit", ref: "sy", d: "La falta de conocimiento especializado de algunos profesionales es una barrera; la experiencia facilita detectar y remitir." },
    { de: "c", a: "dem", s: "+", b: 0, f: "esc", ev: "dato", d: "Las personas atendidas quedan en los registros. En 2025, con FEV-RIPS, casi se duplicaron las personas registradas." },
    { de: "dem", a: "ofe", s: "+", b: -26, dm: 1, f: "esc", ev: "dato", d: "Donde hay más demanda hay más sedes de neuropediatría (ρ = 0,80 con los casos esperados). Es una asociación, no prueba causa." },
    { de: "ofe", a: "cap", s: "+", b: -40, f: "sat", ev: "hip", d: "Más equipos dejan más tiempo para evaluar a personas nuevas." },
    { de: "cap", a: "v2", s: "+", b: 26, f: "min", ev: "dato", d: "Donde hay más sedes por habitante se atiende a más personas (ρ = 0,65; RR 1,32 por cada sede adicional por 100.000 habitantes)." },
    { de: "c", a: "aten", s: "+", b: -18, f: "prop", ev: "dato", d: "Cada persona diagnosticada necesita controles y terapias durante años." },
    { de: "aten", a: "cap", s: "−", b: -24, f: "cong", ev: "hip", d: "Los mismos equipos atienden y diagnostican: las atenciones ocupan tiempo que podría ser para evaluar." },
    { de: "c", a: "brecha", s: "−", b: -34, f: "prop", ev: "dato", d: "Cada diagnóstico acerca a lo esperado y reduce la brecha que se percibe." },
    { de: "brecha", a: "prio", s: "+", b: -34, dm: 1, f: "umb", ev: "hip", d: "Una brecha visible aumenta la prioridad del tema." },
    { de: "prio", a: "ofe", s: "+", b: -40, dm: 1, f: "esc", ev: "hip", d: "Más prioridad y recursos amplían la oferta, con tiempo para contratar y habilitar." },
    { de: "s2", a: "tie", s: "+", b: 26, f: "cong", ev: "hip", d: "Más personas en espera alargan el tiempo hasta la evaluación." },
    { de: "cap", a: "tie", s: "−", b: -30, f: "cong", mx: 1, ev: "hip", d: "Con más capacidad libre la espera se acorta." },
    { de: "tie", a: "opor", s: "−", b: -22, f: "dec", ev: "lit", ref: "dm", d: "Cuanto más larga la espera, más tarde llega el diagnóstico." },
    { de: "opor", a: "conf", s: "+", b: -34, f: "s", ev: "lit", ref: "sy", d: "Un diagnóstico oportuno evita la frustración y la carga económica de la espera." },
    { de: "conf", a: "v1", s: "+", b: -30, f: "umb", ev: "hip", d: "Las familias con confianza y recursos consultan y completan el proceso." }
  ],
  /* Facilitadores y barreras: factores externos que empujan o frenan una variable */
  factores: [
    { id: "f1", k: "f", x: 150, y: 402, t: "Tamizaje: EAD-3 y m-Chat", a: "v1", ev: "norma", ref: "r3", d: "La Resolución 3280 de 2018 ordena la EAD-3 en cada consulta de primera infancia y el m-Chat entre los 18 y los 30 meses. Repetir el tamizaje mejora su sensibilidad (Wieckowski et al., 2021)." },
    { id: "f2", k: "f", x: 718, y: 240, t: "Capacitación", a: "exp", ev: "norma", ref: "ley", d: "La Ley 2628 (art. 14) ordena capacitar al personal de atención primaria que atiende a personas con TEA." },
    { id: "f3", k: "f", x: 1150, y: 84, t: "Campañas y redes de familias", a: "conc", ev: "norma", ref: "ley", d: "La Ley 2628 (arts. 19 a 24) promueve campañas de sensibilización y actividades cada 2 de abril." },
    { id: "f4", k: "f", x: 134, y: 650, t: "Profesionales que escuchan", a: "conf", ev: "lit", ref: "sy", d: "Encontrar profesionales que escuchan y atienden las preocupaciones da apoyo y validación a las familias." },
    { id: "f5", k: "f", x: 602, y: 664, t: "Ruta de atención pública", a: "tie", ev: "norma", ref: "ley", d: "La Ley 2628 (arts. 7 y 13) ordena una ruta clara y pública. Puede acortar los pasos entre la sospecha y la confirmación." },
    { id: "f6", k: "f", x: 880, y: 950, t: "Telemedicina (15,9 % de las sedes)", a: "cap", ev: "dato", d: "94 de 590 sedes de neuropediatría ofrecen telemedicina, que puede acercar la evaluación donde no hay sede." },
    { id: "f7", k: "f", x: 1290, y: 150, t: "Mejor registro (FEV-RIPS)", a: "brecha", ev: "norma", ref: "r2275", d: "Un registro más completo acerca la brecha percibida a la real. La Ley 2628 (art. 8) pide un conteo estadístico." },
    { id: "f8", k: "f", x: 1226, y: 934, t: "Equipos interdisciplinarios", a: "ofe", ev: "norma", ref: "ley", d: "La Ley 2628 (art. 9) incluye equipos interdisciplinarios en la política pública." },
    { id: "b1", k: "b", x: 126, y: 196, t: "Pobreza multidimensional", a: "busq", ev: "dato", d: "Por cada 10 puntos más de IPM, la prevalencia atendida es 0,71 veces la de referencia, a igual oferta. Un mayor nivel socioeconómico se asocia con un diagnóstico más temprano (Daniels y Mandell, 2014)." },
    { id: "b2", k: "b", x: 538, y: 240, t: "Conocimiento limitado", a: "exp", ev: "lit", ref: "sy", d: "Algunos profesionales sin conocimiento especializado sobre el TEA dan información inexacta y generan confusión." },
    { id: "b3", k: "b", x: 606, y: 958, t: "Municipios sin sede (19,9 %)", a: "cap", ev: "dato", d: "El 19,9 % de las personas atendidas vive en municipios sin sede de neuropediatría y el 11,4 % de las atenciones se presta fuera del departamento o sin prestador registrado." },
    { id: "b4", k: "b", x: 1296, y: 858, t: "Especialistas concentrados", a: "ofe", ev: "dato", d: "Cuatro departamentos no tienen sedes y el Gini de las sedes es 0,381. La falta de servicios especializados fue una barrera para el 26,1 % de los cuidadores (Paula et al., 2020)." },
    { id: "b5", k: "b", x: 128, y: 900, t: "Costos para la familia", a: "conf", ev: "lit", ref: "pa", d: "El costo del tratamiento fue una barrera para el 35,2 % de los cuidadores y el 48,8 % declaró problemas económicos (Paula et al., 2020)." },
    { id: "b6", k: "b", x: 568, y: 886, t: "Trámites y autorizaciones", a: "tie", ev: "hip", d: "Los pasos administrativos alargan la espera. Los registros públicos usados aquí no los miden." },
    { id: "b7", k: "b", x: 330, y: 108, t: "Signos menos evidentes", a: "busq", ev: "lit", ref: "dm", d: "Una mayor severidad de los síntomas se asocia con un diagnóstico más temprano: los casos menos evidentes pueden tardar más en sospecharse." }
  ],
  bucles: [
    { id: "R1", tipo: "R", x: 806, y: 290, t: "Reconocimiento social", v: ["c","conc","estig","busq","v1","s2","v2"], d: "Cada diagnóstico hace más visible el TEA, reduce el estigma y lleva a más familias a consultar.", p: "Campañas, redes de familias y escuela." },
    { id: "R2", tipo: "R", x: 504, y: 418, t: "Aprendizaje del primer nivel", v: ["c","exp","v1","s2","v2"], d: "Atender a más personas con TEA da experiencia para detectar y remitir mejor a las siguientes.", p: "Formación continua y retroalimentación del especialista al primer nivel." },
    { id: "R3", tipo: "R", x: 1064, y: 630, t: "Oferta que responde", v: ["c","dem","ofe","cap","v2"], d: "La demanda registrada impulsa más oferta, y con más oferta se confirman más diagnósticos. La respuesta tarda.", p: "Registro completo y planeación de la oferta con la demanda esperada." },
    { id: "R4", tipo: "R", x: 298, y: 672, t: "Círculo de la oportunidad", v: ["c","dem","ofe","cap","tie","opor","conf","v1","s2","v2"], d: "Con más capacidad la espera baja, el diagnóstico llega a tiempo, las familias confían y más personas completan el proceso.", p: "Medir la oportunidad: edad al diagnóstico y tiempo entre sospecha y confirmación." },
    { id: "B1", tipo: "B", x: 392, y: 790, t: "Desgaste por la espera", v: ["s2","tie","opor","conf","v1"], d: "Si la espera crece, el diagnóstico se retrasa, las familias se desgastan y algunas dejan el proceso. La fila se acorta, pero porque hay quienes ya no están en ella.", p: "Acompañamiento durante la espera y gestión activa de la fila." },
    { id: "B2", tipo: "B", x: 806, y: 690, t: "Capacidad compartida", v: ["c","aten","cap","v2"], d: "Los mismos equipos diagnostican y atienden: a más pacientes, menos tiempo para confirmar nuevos diagnósticos.", p: "Distribuir tareas entre disciplinas y reservar tiempo para evaluaciones nuevas." },
    { id: "B3", tipo: "B", x: 1206, y: 370, t: "Cierre de la brecha", v: ["c","brecha","prio","ofe","cap","v2"], d: "La brecha entre lo esperado y lo diagnosticado mueve recursos; al cerrarse, la presión disminuye. Si la brecha no se ve, el bucle no se activa.", p: "Una meta explícita y un registro que muestre la brecha real." }
  ],
  lectura: [
    "El diagnóstico oportuno no depende de un solo factor, sino de bucles que se alimentan entre sí. Cuatro bucles de refuerzo (R) hacen crecer el número de pacientes diagnosticados y tres de balance (B) lo frenan o lo regulan.",
    "La forma del sistema es la de un crecimiento con límites. El reconocimiento, la experiencia y la oferta lo impulsan; la espera y la capacidad compartida lo contienen. Si crece la detección y no crece la capacidad para confirmar, aumenta la fila y se pierde oportunidad: conviene que ambas crezcan a la vez.",
    "Las relaciones no son lineales. La espera, por ejemplo, crece despacio y se dispara cerca del límite de la capacidad; la formación y la oferta tardan en rendir. Por eso un mismo esfuerzo puede tener efectos muy distintos según el momento y el territorio."
  ],
  nota: "Modelo conceptual cualitativo del equipo del proyecto, con notación de dinámica de sistemas (Sterman, 2006; Homer y Hirsch, 2006). Orienta preguntas e hipótesis y no estima efectos; la simulación de más abajo explora una parte, con supuestos y rangos a la vista. Se verificó por programa que cada bucle cierra y que su signo es correcto; el modelo contiene nueve bucles y aquí se nombran los siete principales. Los estudios citados son internacionales, salvo los datos de este análisis."
};
