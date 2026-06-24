/*
 * Explorador climático interactivo de Chile
 * -------------------------------------------------
 * Permite recorrer dinámicamente las variables climáticas (precipitación,
 * temperatura máxima/mínima, bioclimático) y los periodos disponibles
 * (2000 → 2090) sobre los rásters GeoTIFF del proyecto, en lugar de cargar
 * un único archivo fijo. Cada variable tiene su propia escala de color,
 * unidades y descripción.
 */

// ---- Configuración de variables -------------------------------------------
var VARIABLES = {
    prec: {
        label: 'Precipitación',
        file: 'prec_masc.tif',
        scale: 'YlGnBu',
        units: 'mm',
        bandLabel: function (i) { return MESES[i] || ('Banda ' + i); },
        title: 'Precipitación mensual'
    },
    tmax: {
        label: 'Temp. máxima',
        file: 'tmax_masc.tif',
        scale: 'YlOrRd',
        units: '°C',
        bandLabel: function (i) { return MESES[i] || ('Banda ' + i); },
        title: 'Temperatura máxima'
    },
    tmin: {
        label: 'Temp. mínima',
        file: 'tmin_masc.tif',
        scale: 'Blues',
        units: '°C',
        bandLabel: function (i) { return MESES[i] || ('Banda ' + i); },
        title: 'Temperatura mínima'
    },
    bioc: {
        label: 'Bioclimático',
        file: 'bioc_masc.tif',
        scale: 'Spectral',
        units: '',
        bandLabel: function (i) { return 'Variable bio' + (i + 1); },
        title: 'Variable bioclimática'
    }
};

var PERIODOS = ['2000', '2030', '2050', '2070', '2090'];

var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// ---- Estado ----------------------------------------------------------------
var state = {
    variable: 'prec',
    periodo: '2030',
    banda: 0
};

// ---- Mapa base -------------------------------------------------------------
var map = L.map('map', { zoomControl: true });

var baseOSM = L.tileLayer('https://c.tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png', {
    opacity: 1,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
    opacity: 0.45
}).addTo(map);

map.setView([-35.5, -71.5], 5);

L.control.scale({ metric: true, imperial: false, maxWidth: 300 }).addTo(map);

// Límites administrativos (se cargan si los .js globales están disponibles)
try {
    if (typeof regiones !== 'undefined') {
        L.geoJSON(regiones, {
            style: { color: 'red', weight: 1, fillOpacity: 0, interactive: false }
        }).addTo(map);
    }
} catch (e) { /* sin capa de regiones */ }

// ---- Capas activas (para limpiar al recargar) ------------------------------
var current = {
    layers: [],
    colorBar: null,
    fields: []
};

function clearCurrent() {
    current.layers.forEach(function (l) { map.removeLayer(l); });
    current.layers = [];
    if (current.colorBar) {
        map.removeControl(current.colorBar);
        current.colorBar = null;
    }
}

// ---- Carga y render --------------------------------------------------------
function showLoader(show) {
    var el = document.getElementById('load_container');
    if (!el) return;
    el.style.visibility = show ? 'visible' : 'hidden';
    el.style.opacity = show ? '1' : '0';
}

function render() {
    var cfg = VARIABLES[state.variable];
    var url = 'data/CFS/' + state.periodo + '/' + cfg.file;

    showLoader(true);

    d3.request(url).responseType('arraybuffer').get(function (error, tiffData) {
        if (error || !tiffData) {
            showLoader(false);
            setStatus('No se pudo cargar ' + url);
            return;
        }

        clearCurrent();

        var scalarFields = L.ScalarField.multipleFromGeoTIFF(tiffData.response);
        current.fields = scalarFields;

        // Asegurar banda válida
        if (state.banda >= scalarFields.length) state.banda = 0;
        rebuildBandSelector(scalarFields.length, cfg);

        var sf = scalarFields[state.banda];
        var range = sf.range;
        var scale = chroma.scale(cfg.scale).domain(range).classes(35);

        var layer = L.canvasLayer.scalarField(sf, {
            color: scale,
            opacity: 0.8,
            interpolate: true,
            inFilter: function (v) { return v !== 0; }
        }).addTo(map);

        layer.on('click', function (e) {
            if (e.value !== null) {
                var v = e.value.toFixed(1);
                var html = '<span class="popupText">' + cfg.label + ' (' +
                    cfg.bandLabel(state.banda) + '): <b>' + v + '</b> ' + cfg.units + '</span>';
                L.popup().setLatLng(e.latlng).setContent(html).openOn(map);
            }
        });

        current.layers.push(layer);

        // Barra de color
        current.colorBar = L.control.colorBar(scale, range, {
            title: cfg.title + ' — ' + state.periodo,
            units: cfg.units,
            steps: 100,
            decimals: cfg.units === 'mm' ? 0 : 1,
            width: 320,
            height: 18,
            position: 'bottomleft',
            background: '#000',
            textColor: 'white',
            labels: [range[0], (range[0] + range[1]) / 2, range[1]],
            labelFontSize: 10
        }).addTo(map);

        if (current.layers.length === 1) {
            try { map.fitBounds(layer.getBounds()); } catch (e) { /* noop */ }
        }

        setStatus(cfg.label + ' · ' + state.periodo + ' · ' + cfg.bandLabel(state.banda));
        showLoader(false);
    });
}

// ---- Panel de control ------------------------------------------------------
function setStatus(text) {
    var el = document.getElementById('status');
    if (el) el.textContent = text;
}

function buildPanel() {
    var panel = L.control({ position: 'topright' });
    panel.onAdd = function () {
        var div = L.DomUtil.create('div', 'explorer-panel');
        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.disableScrollPropagation(div);

        var varButtons = Object.keys(VARIABLES).map(function (k) {
            return '<button class="ex-btn ex-var" data-var="' + k + '">' +
                VARIABLES[k].label + '</button>';
        }).join('');

        var periodButtons = PERIODOS.map(function (p) {
            return '<button class="ex-btn ex-per" data-per="' + p + '">' + p + '</button>';
        }).join('');

        div.innerHTML =
            '<div class="ex-title">🌎 Explorador climático de Chile</div>' +
            '<div class="ex-group"><div class="ex-label">Variable</div>' +
            '<div class="ex-row">' + varButtons + '</div></div>' +
            '<div class="ex-group"><div class="ex-label">Periodo</div>' +
            '<div class="ex-row">' + periodButtons + '</div></div>' +
            '<div class="ex-group" id="band-group"><div class="ex-label" id="band-label">Mes</div>' +
            '<input type="range" id="band-slider" min="0" max="11" value="0" class="ex-slider"></div>' +
            '<div class="ex-status" id="status">Cargando…</div>';

        return div;
    };
    panel.addTo(map);

    // Listeners (delegados tras insertar el panel)
    document.querySelectorAll('.ex-var').forEach(function (b) {
        b.addEventListener('click', function () {
            state.variable = b.getAttribute('data-var');
            state.banda = 0;
            syncActive();
            render();
        });
    });
    document.querySelectorAll('.ex-per').forEach(function (b) {
        b.addEventListener('click', function () {
            state.periodo = b.getAttribute('data-per');
            syncActive();
            render();
        });
    });
    var slider = document.getElementById('band-slider');
    slider.addEventListener('input', function () {
        state.banda = parseInt(slider.value, 10);
        // re-render solo la banda seleccionada usando los campos ya cargados
        rerenderBand();
    });

    syncActive();
}

function rebuildBandSelector(nBands, cfg) {
    var slider = document.getElementById('band-slider');
    var group = document.getElementById('band-group');
    if (!slider) return;
    if (nBands <= 1) {
        group.style.display = 'none';
        return;
    }
    group.style.display = '';
    slider.max = nBands - 1;
    if (state.banda > nBands - 1) state.banda = 0;
    slider.value = state.banda;
    document.getElementById('band-label').textContent =
        (cfg.units === '' ? 'Variable' : 'Mes') + ': ' + cfg.bandLabel(state.banda);
}

// Recarga ligera al mover el slider (sin volver a descargar el GeoTIFF)
function rerenderBand() {
    if (!current.fields.length) return;
    var cfg = VARIABLES[state.variable];
    clearCurrent();

    var sf = current.fields[state.banda];
    var range = sf.range;
    var scale = chroma.scale(cfg.scale).domain(range).classes(35);

    var layer = L.canvasLayer.scalarField(sf, {
        color: scale, opacity: 0.8, interpolate: true,
        inFilter: function (v) { return v !== 0; }
    }).addTo(map);

    layer.on('click', function (e) {
        if (e.value !== null) {
            var v = e.value.toFixed(1);
            var html = '<span class="popupText">' + cfg.label + ' (' +
                cfg.bandLabel(state.banda) + '): <b>' + v + '</b> ' + cfg.units + '</span>';
            L.popup().setLatLng(e.latlng).setContent(html).openOn(map);
        }
    });
    current.layers.push(layer);

    current.colorBar = L.control.colorBar(scale, range, {
        title: cfg.title + ' — ' + state.periodo, units: cfg.units,
        steps: 100, decimals: cfg.units === 'mm' ? 0 : 1,
        width: 320, height: 18, position: 'bottomleft',
        background: '#000', textColor: 'white',
        labels: [range[0], (range[0] + range[1]) / 2, range[1]], labelFontSize: 10
    }).addTo(map);

    document.getElementById('band-label').textContent =
        (cfg.units === '' ? 'Variable' : 'Mes') + ': ' + cfg.bandLabel(state.banda);
    setStatus(cfg.label + ' · ' + state.periodo + ' · ' + cfg.bandLabel(state.banda));
}

function syncActive() {
    document.querySelectorAll('.ex-var').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-var') === state.variable);
    });
    document.querySelectorAll('.ex-per').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-per') === state.periodo);
    });
}

// ---- Init ------------------------------------------------------------------
buildPanel();
render();
