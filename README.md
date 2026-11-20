# TEA en Colombia

Explorador interactivo sobre el trastorno del espectro autista (TEA) en Colombia: personas atendidas, oferta de neuropediatría e inequidad territorial con datos públicos de SISPRO (RIPS), REPS y DANE, junto con el marco de la Ley 2628 de 2026 y la Política Nacional de Salud Mental 2024-2033.

**Análisis preliminar de datos públicos y del marco normativo**, en construcción con la [Fundación Universitaria Navarra (UNINAVARRA)](https://www.uninavarra.edu.co/), Neiva, dentro del proyecto *Barreras para el diagnóstico oportuno del Trastorno del Espectro Autista (TEA) en Colombia: una revisión sistemática de la literatura* (Especialización en Medicina Familiar). Las cifras son resultados preliminares y pueden cambiar.

**Equipo:** Leydi Hernández y Wilmer Esquivel (estudiantes, Especialización en Medicina Familiar), Jhonatan Andrés Portes (tutor del proyecto) y Fabian Antonio Dávila Ramírez, MD, MBA, PhD (docente de investigación; análisis de datos y app; [ORCID](https://orcid.org/0000-0002-1678-7288)).

## Qué contiene

La app abre con un resumen y el resto queda colapsado en preguntas que van de lo descriptivo a los cruces. Cada gráfico tiene un párrafo de lectura que se recalcula al filtrar; los términos técnicos muestran su definición al pasar el cursor y las normas enlazan a su texto.

| # | Pregunta | Gráficos interactivos |
| --- | --- | --- |
| 01 | Resumen: ¿qué muestran los datos? | Seis hallazgos con enlace a su análisis |
| 02 | ¿Cuántas personas se atienden y quiénes son? | Serie 2019-2025, edad y sexo, régimen 2024 vs. 2025 |
| 03 | ¿Dónde viven las personas atendidas? | Mapa, ranking por región, evolución por departamento, tabla y CSV |
| 04 | ¿Cuánta atención recibe cada persona atendida? | Ranking de atenciones por persona, cobertura vs. intensidad |
| 05 | ¿Dónde está la oferta de neuropediatría? | Mapa y ranking de sedes, telemedicina y sedes públicas |
| 06 | ¿Se atiende más donde hay más oferta? | Dispersión con cuadrantes (color IPM) |
| 07 | ¿Se atiende menos donde hay más pobreza? | Qué es el IPM, mapa, dispersión IPM vs. 4 indicadores, modelo cuasi-Poisson |
| 08 | ¿Cuánto se desplazan las personas para atenderse? | Mapa de movilidad, destino de las atenciones, receptores y emisores, oferta vs. movilidad |
| 09 | ¿Qué tan desigual es la distribución y cómo ha cambiado? | Glosario de índices, Lorenz, IC95 %, Theil por región, tendencia, resumen de cruces |
| 10 | ¿Cómo está el Huila frente al país? | Comparación con el país y destino de sus atenciones |
| 11 | ¿Qué dice el marco normativo? | Ruta tamizaje → inclusión, plazos de la Ley 2628 con enlace por artículo, PNSM 2024-2033 |
| 12 | ¿Qué sigue? La revisión sistemática en curso | Pregunta PCC, PRISMA preliminar |
| 13-15 | Métodos y equipo, glosario, referencias | Enlaces verificables (DOI o sitio oficial) |

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

- RIPS (SISPRO): personas y atenciones con F84 como diagnóstico principal, 2019-2025 (2024 = año de referencia; 2025 cambia por la transición a FEV-RIPS).
- REPS: sedes con servicio 388 (neuropediatría), corte 13/11/2026.
- DANE: población 2024 e IPM 2024 (pendientes de verificación contra la tabla oficial).
- Análisis ecológico: las tasas son prevalencia tratada, no prevalencia del trastorno, y las asociaciones entre departamentos no se aplican a las personas.

## Licencia

[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/deed.es) (ver `LICENSE`). Los datos de origen pertenecen a sus fuentes oficiales (SISPRO, REPS, DANE).

Sitio publicado: https://fadavilar.github.io/AutismoColombia/
