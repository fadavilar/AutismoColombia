# -*- coding: utf-8 -*-
"""
build_data.py - Genera js/datos.js a partir de las salidas del proyecto
"Barreras para el diagnóstico oportuno del TEA en Colombia" (componente complementario).

Entradas
  1) Libro de cálculo exportado a Markdown: Inequidad_TEA_Departamentos_v13112026.md
     (hojas Datos, Flujos_2024 y Serie; generado por 03_libro_calculo.py y convertido con MarkItDown)
  2) dptos.geojson (división político-administrativa del DANE, MGN)

Salida
  js/datos.js  -> window.TEA_DATOS = { deptos, serie, flujos, mapa }

Uso
  python scripts/build_data.py <ruta_md> <ruta_geojson> <ruta_salida_js>

Las cifras se copian de las tablas del libro tal cual (no se recalculan aquí), para que la página
muestre exactamente los mismos valores que el informe. Solo el mapa se transforma
(proyección equirectangular y simplificación Douglas-Peucker) para dibujarlo en SVG.
"""
import sys, json, math, re

md_path, geo_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
text = open(md_path, encoding='utf-8').read()


def section(name):
    m = re.search(r'^## ' + re.escape(name) + r'\s*$(.*?)(?=^## |\Z)', text, re.S | re.M)
    if not m:
        raise SystemExit('No se encontró la hoja ' + name)
    return m.group(1)


def rows(block):
    out = []
    for line in block.splitlines():
        line = line.strip()
        if not line.startswith('|'):
            continue
        cells = [c.strip() for c in line.strip('|').split('|')]
        out.append(cells)
    return out


def num(s):
    s = s.replace(',', '').strip()
    if s == '':
        return None
    try:
        v = float(s)
        return int(v) if v.is_integer() and '.' not in s else v
    except ValueError:
        return None


CODE = re.compile(r'^\d{2}$')

# ---------------------------------------------------------------- Datos
COLS = ['cod', 'nombre', 'region', 'pob', 'ipm', 'pers24', 'aten24', 'pers25', 'aten25',
        'sedes', 'sedesTele', 'sedesPub', 'atenLocal', 'tasa24', 'tasa25', 'atenPorPersona',
        'sedes100k', 'personasPorSede', 'pctTele', 'pctPub', 'pctFuera', 'pctSinSede']
deptos = []
for r in rows(section('Datos')):
    if CODE.match(r[0]) and len(r) >= len(COLS):
        d = {}
        for k, v in zip(COLS, r):
            d[k] = v if k in ('cod', 'nombre', 'region') else num(v)
        deptos.append(d)
assert len(deptos) == 33, len(deptos)

# ---------------------------------------------------------------- Serie
serie = {}
for r in rows(section('Serie')):
    if CODE.match(r[0]):
        serie[r[0]] = [num(x) for x in r[2:9]]
assert len(serie) == 33
for d in deptos:
    d['serie'] = serie[d['cod']]   # personas 2019..2025

# ---------------------------------------------------------------- Flujos 2024
fl = rows(section('Flujos_2024'))
head = next(r for r in fl if r[0].startswith('Cód'))
ips_cols = head[2:-1]               # '-1', '05', ... '99'
flujos = {}
for r in fl:
    if CODE.match(r[0]) or r[0] == '-1':
        vals = [num(x) or 0 for x in r[2:-1]]
        flujos[r[0]] = {c: v for c, v in zip(ips_cols, vals) if v}
assert len(flujos) == 34

# ---------------------------------------------------------------- Mapa
geo = json.load(open(geo_path, encoding='utf-8'))


def rings_of(geom):
    if geom['type'] == 'Polygon':
        return [geom['coordinates'][0]]
    if geom['type'] == 'MultiPolygon':
        return [p[0] for p in geom['coordinates']]
    return []


def dp(points, eps):
    """Douglas-Peucker iterativo."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = points[a]; bx, by = points[b]
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy) or 1e-12
        best, idx = -1, None
        for i in range(a + 1, b):
            px, py = points[i]
            dist = abs(dy * px - dx * py + bx * ay - by * ax) / L
            if dist > best:
                best, idx = dist, i
        if best > eps and idx is not None:
            keep[idx] = True
            stack.append((a, idx)); stack.append((idx, b))
    return [p for p, k in zip(points, keep) if k]


LAT0 = math.cos(math.radians(4.5))
feats = {f['properties']['DPTO_CCDGO']: f for f in geo['features']}
mainland = [c for c in feats if c != '88']
xs, ys = [], []
for c in mainland:
    for ring in rings_of(feats[c]['geometry']):
        for lon, lat in ring:
            xs.append(lon * LAT0); ys.append(-lat)
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
W = 560.0
S = W / (maxx - minx)
H = (maxy - miny) * S
PAD = 10


def proj(lon, lat):
    return ((lon * LAT0 - minx) * S + PAD, (-lat - miny) * S + PAD)


def path_for(code, transform=None, eps=0.6, min_area=4.0):
    parts = []
    for ring in rings_of(feats[code]['geometry']):
        pts = [proj(lon, lat) for lon, lat in ring]
        if transform:
            pts = [transform(x, y) for x, y in pts]
        # descartar islotes diminutos
        area = 0.5 * abs(sum(pts[i][0] * pts[i - 1][1] - pts[i - 1][0] * pts[i][1] for i in range(len(pts))))
        if area < min_area and code != '88':
            continue
        # anillo cerrado: se parte en el punto más lejano al inicial para que Douglas-Peucker
        # no colapse (el primer y el último punto coinciden)
        if len(pts) > 3 and pts[0] == pts[-1]:
            pts = pts[:-1]
        far = max(range(len(pts)), key=lambda i: (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2)
        s = dp(pts[:far + 1], eps)[:-1] + dp(pts[far:] + [pts[0]], eps)[:-1]
        if len(s) < 3:
            continue
        parts.append('M' + 'L'.join('%.1f,%.1f' % p for p in s) + 'Z')
    return ''.join(parts)


paths = {c: path_for(c) for c in mainland}

# San Andrés y Providencia: recuadro ampliado en la esquina superior izquierda
sa_pts = [proj(lon, lat) for ring in rings_of(feats['88']['geometry']) for lon, lat in ring]
sx0, sy0 = min(p[0] for p in sa_pts), min(p[1] for p in sa_pts)
sx1, sy1 = max(p[0] for p in sa_pts), max(p[1] for p in sa_pts)
k = 70.0 / max(sx1 - sx0, sy1 - sy0)
paths['88'] = path_for('88', lambda x, y: (PAD + 12 + (x - sx0) * k, PAD + 18 + (y - sy0) * k), eps=0.3)
inset = {'x': PAD + 2, 'y': PAD + 4, 'w': 70 + 22, 'h': (sy1 - sy0) * k + 26}

mapa = {'w': round(W + 2 * PAD), 'h': round(H + 2 * PAD), 'paths': paths, 'inset': inset}

out = {'deptos': deptos, 'flujos': flujos, 'mapa': mapa}
js = ('/* Generado por scripts/build_data.py: no editar a mano. */\n'
      'window.TEA_DATOS = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(out_path, 'w', encoding='utf-8').write(js)
print('deptos', len(deptos), '| flujos', len(flujos), '| mapa', mapa['w'], 'x', mapa['h'],
      '| bytes', len(js.encode('utf-8')))
