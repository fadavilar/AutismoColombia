# Panorama del TEA en Colombia

Resumen del marco normativo (Ley 2628 de 2026 y Política Nacional de Salud Mental 2024-2033) y de los datos públicos de SISPRO (RIPS), REPS y DANE, como análisis preliminar del panorama del trastorno del espectro autista (TEA) en Colombia.

**Análisis preliminar de datos públicos y del marco normativo**, en construcción con la [Fundación Universitaria Navarra (UNINAVARRA)](https://www.uninavarra.edu.co/), Neiva, dentro del proyecto *Barreras para el diagnóstico oportuno del Trastorno del Espectro Autista (TEA) en Colombia: una revisión sistemática de la literatura* (Especialización en Medicina Familiar). Las cifras son resultados preliminares y pueden cambiar.

**Equipo:** Leydi Hernández y Wilmer Esquivel (estudiantes, Especialización en Medicina Familiar), Jhonatan Andrés Portes (tutor del proyecto) y Fabian Antonio Dávila Ramírez, médico, epidemiólogo y economista de la salud, máster en Bioestadística y Econometría y doctor en Modelado y Gestión de Políticas Públicas (docente de investigación; análisis de datos y elaboración; [ORCID](https://orcid.org/0000-0002-1678-7288)).

## Qué contiene

Abre con un resumen estructurado (introducción, métodos, resultados y conclusiones) y el resto queda colapsado en preguntas, organizadas en tres partes: primero el marco (qué explica la atención y qué ordenan las normas), después los datos y al final cómo se hizo. Cada gráfico tiene un párrafo de lectura que se recalcula al filtrar; los términos técnicos muestran su definición al pasar el cursor y las normas enlazan a su texto. Cada sección abre con su idea clave en una frase y termina con botones para ir a la pregunta anterior o a la siguiente. La página se adapta a móviles (los gráficos anchos se desplazan hacia los lados) y tiene modo claro u oscuro y cuatro tamaños de texto (botón «Aa» o teclas + y −).

| # | Pregunta | Gráficos interactivos |
| --- | --- | --- |
| 01 | Resumen | Introducción, métodos (con los ocho códigos CIE-10), resultados, conclusiones y los resultados paso a paso con un gráfico que cambia al desplazarse |
| **Primera parte** | **El marco: qué explica la atención y qué ordenan las normas** | |
| 02 | ¿Qué explica el número de atenciones de un departamento? | Diagrama causal con factores medidos, medidos en parte y sin dato |
| 03 | ¿Qué ordena la Ley 2628 de 2026 y qué queda por reglamentar? | Ruta del tamizaje a la inclusión, primera infancia (Resolución 3280 de 2018: EAD-3 y m-Chat), plazos, artículos, retos de implementación |
| 04 | ¿Cómo se relaciona la ley con la Política Nacional de Salud Mental? | Resumen comparativo, paralelo punto por punto, la política en detalle |
| 05 | ¿Con qué herramientas se detecta y diagnostica el autismo en cada etapa de la vida? | Línea de edades con 11 herramientas |
| **Segunda parte** | **Los datos: qué muestran los registros públicos** | |
| 06 | ¿Cuántas personas se atienden, cuántas por habitante y cuántas se esperarían? | Prevalencia absoluta, relativa y esperada juntas, en el país y por departamento; mapa, serie, evolución, tabla y CSV |
| 07 | ¿Qué cobertura reciben: cuánta atención y qué tan cerca de su residencia? | Frecuencia (atenciones por 100 atendidos), cercanía (atención en el propio departamento y municipios con sede), flujos, receptores y emisores |
| 08 | ¿Quiénes son las personas atendidas y qué cambió en el registro de 2025? | Edad, sexo, régimen (personas, atenciones y tasa) e hipótesis de la ruptura de 2025 |
| 09 | ¿Dónde está la oferta de neuropediatría y sigue a la demanda? | Mapa, sedes vs. casos esperados, sedes observadas vs. esperadas, telemedicina |
| 10 | ¿Se atiende a más personas donde hay más oferta? | Burbujas con ejes estandarizados (tamaño = atenciones), oferta vs. cercanía |
| 11 | ¿Se atiende menos donde hay más pobreza? | IPM, dispersión IPM vs. 4 indicadores, modelo cuasi-Poisson |
| 12 | ¿Qué tan desigual es la distribución y cómo ha cambiado? | Lorenz, IC95 %, Theil por región, tendencia, resumen de cruces |
| 13 | ¿Cómo está el Huila frente al país? | Comparación con el país y destino de sus atenciones |
| **Tercera parte** | **¿Cómo se hizo?** | |
| 14 | ¿Qué sigue? La revisión sistemática en curso | Pregunta PCC, PRISMA preliminar |
| 15-17 | Métodos y equipo, glosario, referencias | Códigos F84, fórmulas de cada medida, enlaces verificables |

## Medidas

- **Prevalencia absoluta** = personas atendidas (54.367 en 2024; 51.474 con departamento de residencia conocido).
- **Prevalencia relativa** = personas atendidas con residencia conocida ÷ población del departamento (DANE 2024) × 100.000.
- **Prevalencia esperada** = población × 1/127 (OMS). Supone igual frecuencia en todo el país.
- **Cobertura, frecuencia** (tasa de atención) = atenciones a personas con F84 ÷ personas atendidas con F84 × 100.
- **Cobertura, cercanía** = % de atenciones en el departamento de residencia y % de personas atendidas en municipios con sede de neuropediatría.
- **Códigos CIE-10** (diagnóstico principal): F84.0, F84.1, F84.2, F84.3, F84.4, F84.5, F84.8 y F84.9, consultados en conjunto.

## Estructura

```
index.html            página
css/style.css         sistema de diseño del explorador
css/tea.css           estilos de los gráficos
js/datos.js           datos por departamento, flujos y mapa (generado, no editar)
js/contenido.js       textos, tablas resumen y fuentes
js/app.js             motor de la página y gráficos SVG (sin dependencias)
scripts/build_data.py genera js/datos.js
data/                 insumos: libro de cálculo exportado a Markdown y dptos.geojson (DANE, MGN)
```

No hay paso de compilación ni dependencias: se sirve tal cual (GitHub Pages desde `main`, carpeta raíz).

## Regenerar los datos

```bash
python scripts/build_data.py data/Inequidad_TEA_Departamentos_v13112026.md data/dptos.geojson js/datos.js
```

Para verla localmente:

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
