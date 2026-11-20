# TEA en Colombia

Explorador interactivo sobre el trastorno del espectro autista (TEA) en Colombia: personas atendidas, oferta de neuropediatría e inequidad territorial con datos públicos de SISPRO (RIPS), REPS y DANE, junto con el marco de la Ley 2628 de 2026 y la Política Nacional de Salud Mental 2024-2033.

**Trabajo en construcción** con la Fundación Universitaria Navarra (UNINAVARRA), Neiva, dentro del proyecto *Barreras para el diagnóstico oportuno del Trastorno del Espectro Autista (TEA) en Colombia: una revisión sistemática de la literatura* (Especialización en Medicina Familiar). Las cifras son resultados preliminares y pueden cambiar.

**Autor:** Fabián Dávila Ramírez, MD, MBA, PhD ([ORCID](https://orcid.org/0000-0002-1678-7288))

## Qué contiene

| Sección | Gráficos interactivos |
| --- | --- |
| Panorama nacional | Edad y sexo, régimen 2024 vs. 2025 (ruptura de serie) |
| Mapa por departamento | Mapa coroplético con 7 indicadores, ficha por departamento, ranking filtrable, tabla ordenable y CSV |
| Tendencia 2019-2025 | Tasa por departamento con resaltado, Gini/Theil/índice de concentración por año |
| Oferta y acceso | Dispersión sedes vs. tasa (color IPM), destino de las atenciones, saldo neto receptor/emisor |
| Medidas de inequidad | Curvas de Lorenz, índices con IC95 % bootstrap, Theil por región, modelos cuasi-Poisson, Spearman |
| Lectura para el Huila | Huila frente al país y destino de sus atenciones |
| Marco normativo | Ruta tamizaje → inclusión, línea de tiempo de plazos de la Ley 2628, ejes de la PNSM 2024-2033 |
| Revisión sistemática | Pregunta PCC, diagrama PRISMA preliminar, motivos de exclusión |

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

Textos y gráficos: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.es). Los datos de origen pertenecen a sus fuentes oficiales.
