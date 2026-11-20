# TEA en Colombia

Explorador interactivo sobre el trastorno del espectro autista (TEA) en Colombia: personas atendidas, oferta de neuropediatría e inequidad territorial con datos públicos de SISPRO (RIPS), REPS y DANE, junto con el marco de la Ley 2628 de 2026 y la Política Nacional de Salud Mental 2024-2033.

**Análisis preliminar de datos públicos y del marco normativo**, en construcción con la [Fundación Universitaria Navarra (UNINAVARRA)](https://www.uninavarra.edu.co/), Neiva, dentro del proyecto *Barreras para el diagnóstico oportuno del Trastorno del Espectro Autista (TEA) en Colombia: una revisión sistemática de la literatura* (Especialización en Medicina Familiar). Las cifras son resultados preliminares y pueden cambiar.

**Equipo:** Leydi Hernández y Wilmer Esquivel (estudiantes, Especialización en Medicina Familiar), Jhonatan Andrés Portes (tutor del proyecto) y Fabian Antonio Dávila Ramírez, médico, epidemiólogo y economista de la salud, máster en Bioestadística y Econometría y doctor en Modelado y Gestión de Políticas Públicas (docente de investigación; análisis de datos y app; [ORCID](https://orcid.org/0000-0002-1678-7288)).

## Qué contiene

La app abre con un resumen y el resto queda colapsado en preguntas, organizadas en tres partes: primero el marco (qué explica la atención y qué ordenan las normas), después los datos y al final cómo se hizo. Cada gráfico tiene un párrafo de lectura que se recalcula al filtrar; los términos técnicos muestran su definición al pasar el cursor y las normas enlazan a su texto. Al final de cada sección hay botones para ir a la pregunta anterior o a la siguiente.

| # | Pregunta | Gráficos interactivos |
| --- | --- | --- |
| 01 | Resumen: ¿qué muestran los datos? | Seis hallazgos y el recorrido de la app |
| **Primera parte** | **El marco: qué debería pasar** | |
| 02 | ¿Qué explica el número de atenciones de un departamento? | Diagrama causal con factores medidos, medidos en parte y sin dato |
| 03 | ¿Qué ordena la Ley 2628 de 2026 y qué le falta? | Ruta del tamizaje a la inclusión, plazos, artículos, vacíos de implementación |
| 04 | ¿Cómo se relaciona la ley con la Política Nacional de Salud Mental? | Resumen comparativo, paralelo punto por punto, la política en detalle |
| 05 | ¿Con qué herramientas se detecta y diagnostica el autismo en cada etapa de la vida? | Línea de edades con 10 herramientas |
| **Segunda parte** | **Los datos: qué está pasando** | |
| 06 | ¿Cuántas personas se atienden y quiénes son? | Serie 2019-2025, edad y sexo, régimen e hipótesis de la ruptura de 2025 |
| 07 | ¿A cuántas personas llega el sistema en cada departamento? | Mapa, ranking y evolución de la prevalencia atendida, tabla y CSV |
| 08 | ¿Cuánta atención recibe cada persona atendida? | Tasa de atención (atenciones por 100 atendidos), cobertura vs. intensidad |
| 09 | ¿Dónde está la oferta de neuropediatría y sigue a la demanda? | Mapa, sedes vs. casos esperados, sedes observadas vs. esperadas, telemedicina |
| 10 | ¿Se atiende a más personas donde hay más oferta? | Burbujas con ejes estandarizados (tamaño = atenciones), posible necesidad no atendida |
| 11 | ¿Se atiende menos donde hay más pobreza? | IPM, dispersión IPM vs. 4 indicadores, modelo cuasi-Poisson |
| 12 | ¿Cuánto se desplazan las personas para atenderse? | Mapa, destino de las atenciones, receptores y emisores, oferta vs. movilidad |
| 13 | ¿Qué tan desigual es la distribución y cómo ha cambiado? | Lorenz, IC95 %, Theil por región, tendencia, resumen de cruces |
| 14 | ¿Cómo está el Huila frente al país? | Comparación con el país y destino de sus atenciones |
| **Tercera parte** | **Cómo se hizo** | |
| 15 | ¿Qué sigue? La revisión sistemática en curso | Pregunta PCC, PRISMA preliminar |
| 16-18 | Métodos y equipo, glosario, referencias | Códigos F84, fórmulas de cada medida, enlaces verificables |

## Medidas

- **Prevalencia atendida** = personas atendidas con F84 ÷ población del departamento (DANE 2024) × 100.000. Dice a cuántas personas llega el sistema y permite estimar la brecha frente a los casos esperados (OMS, 1 de cada 127).
- **Tasa de atención** = atenciones a personas con F84 ÷ personas atendidas con F84 × 100. Dice cuánta atención recibe cada persona atendida.
- **F84** reúne ocho códigos de la CIE-10 (F84.0 a F84.9, incluido el síndrome de Rett); los cubos públicos no permiten separarlos.

## Estructura

```
index.html            página
css/style.css         sistema de diseño del explorador
css/tea.css           estilos de los gráficos
js/datos.js           datos por departamento, flujos y mapa (generado, no editar)
js/contenido.js       textos, tablas resumen y fuentes
js/app.js             motor de la app y gráficos SVG (sin dependencias)
scripts/build_data.py genera js/datos.js
data/                 insumos: libro de cálculo exportado a Markdown y dptos.geojson (DANE, MGN)
```

No hay paso de compilación ni dependencias: se sirve tal cual (GitHub Pages desde `main`, carpeta raíz).

## Regenerar los datos

```bash
python scripts/build_data.py data/Inequidad_TEA_Departamentos_v13112026.md data/dptos.geojson js/datos.js
```

Para ver la app localmente:

```bash
python -m http.server 8765
```

## Fuentes y advertencias

- RIPS (SISPRO): personas y atenciones con F84 como diagnóstico principal, 2019-2025 (2024 = año de referencia; 2025 cambia por la transición a FEV-RIPS y, según la hipótesis del equipo, se acerca más al número real).
- REPS: sedes con servicio 388 (neuropediatría), corte 13/11/2026.
- DANE: población 2024 e IPM 2024 (pendientes de verificación contra la tabla oficial).
- Análisis ecológico: la prevalencia atendida no es la frecuencia del trastorno, y las asociaciones entre departamentos no se aplican a las personas.

## Licencia

[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/deed.es) (ver `LICENSE`). Los datos de origen pertenecen a sus fuentes oficiales (SISPRO, REPS, DANE).

Sitio publicado: https://fadavilar.github.io/AutismoColombia/
