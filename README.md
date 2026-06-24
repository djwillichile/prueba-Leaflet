# prueba-Leaflet — Visualización de datos climáticos de Chile

Visor web basado en [Leaflet](https://leafletjs.com/) que renderiza rásters
**GeoTIFF** de variables climáticas sobre el territorio de Chile, usando el
plugin [`leaflet.canvaslayer.field`](https://github.com/IHCantabria/Leaflet.CanvasLayer.Field)
para interpolar y colorear campos escalares directamente en un `<canvas>`.

## Páginas

| Archivo | Descripción |
|---|---|
| **`explorer.html`** | 🌎 **Explorador climático interactivo** — cambia variable y periodo en vivo. |
| `index.html` | Visor original de precipitación mensual (2030) con regiones/comunas. |
| `Multiple.html` | Ejemplo mínimo de GeoTIFF multibanda sobre basemap oscuro. |

## Explorador climático (`explorer.html`)

El explorador convierte el visor estático en una herramienta para comparar
escenarios. Desde un único panel se puede:

- **Elegir variable**: Precipitación, Temp. máxima, Temp. mínima, Bioclimático.
- **Elegir periodo**: `2000`, `2030`, `2050`, `2070`, `2090` — para visualizar
  la evolución proyectada del clima.
- **Recorrer las bandas** (meses o variables bioclimáticas) con un deslizador,
  reutilizando el GeoTIFF ya descargado sin volver a pedirlo a la red.
- **Consultar valores** haciendo clic en cualquier punto del mapa.

Cada variable tiene su propia escala de color, unidades y barra de leyenda
dinámica. Los archivos se resuelven automáticamente como
`data/CFS/<periodo>/<variable>_masc.tif`.

## Datos

Los rásters viven en `data/CFS/<periodo>/`. Cada `.tif` es multibanda
(p. ej. precipitación = 12 bandas mensuales). Los sufijos `_masc` corresponden
a las versiones enmascaradas al contorno de Chile. Los límites administrativos
(regiones, provincias, comunas) están en `data/SHP/` como GeoJSON.

## Ejecutar localmente

Por las peticiones de archivos GeoTIFF se necesita un servidor HTTP:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000/explorer.html
```

## Dependencias (vía CDN)

Leaflet 1.2 · D3 v4 · geotiff.js 0.3.6 · chroma.js 2.1 ·
`leaflet.canvaslayer.field` (incluido en `dist/`).
