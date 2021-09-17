var map = L.map('map');

let variable = "Precipitación"
let url = "data/CFS/2030/prec_masc.tif"

let url1 = 'https://c.tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png';
let url2 = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';


var layer_OSMStandard_0 = L.tileLayer(url1, {
    opacity: 1,
});

var layer_GoogleTerrain_1 = L.tileLayer(url2, {
    opacity: .55,
});

layer_OSMStandard_0.addTo(map);
map.addLayer(layer_GoogleTerrain_1);

L.Control.geocoder({
    position: 'topleft'
}).addTo(map);

L.control.scale({
    metric: true,
    imperial: false,
    maxWidth: 300
}).addTo(map);

var colours = ['#00429d', '#2e59a8', '#4771b2', '#5d8abd', '#73a2c6',
'#8abccf', '#a5d5d8', '#c5eddf', '#ffffe0', '#ffdec7', '#ffbcaf',
'#ff9895', '#f4777f', '#e4576b', '#cf3759', '#b41648', '#93003a']

var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'julio', 
'julio', 'agosto', 'septembre', 'octubre', 'noviembre','diciembre']

function style_Region() {
    return {
        opacity: 1,
        color: 'red',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fillOpacity: 0,
        interactive: true,
    }
}

function style_Comuna() {
    return {
        opacity: .8,
        color: 'gray',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: .6, 
        fillOpacity: 0,
        interactive: true,
    }
}


var pComunas = L.geoJSON(comunas,{
    style: style_Comuna
});

var pRegiones = L.geoJSON(regiones,{
    style: style_Region
})

var overlayMaps = {
    "Regiones": pRegiones,
    "Comunas": pComunas
};


d3.request(url).responseType('arraybuffer').get(
    function (error, tiffData) {
        let scalarFields = L.ScalarField.multipleFromGeoTIFF(tiffData.response);
        let legend = {};
        let bounds = {};
        let range;
        let scale;

        scalarFields.forEach(function (sf, index) {
            range = sf.range;
            scale = chroma.scale('BrBG').domain(range).classes(35);

            let layerSf = L.canvasLayer.scalarField(sf, {
                color: scale,
                opacity: 0.8,
                interpolate: true,
                inFilter: (v) => v !== 0
            });

            if (index == 0) {layerSf.addTo(map)}

            layerSf.on('click', function (e) {
                if (e.value !== null) {
                    let v = e.value.toFixed(0);
                    let html = ('<span class="popupText">'+ variable + ' de ' + meses[index] + ': ' + v + '</span>');
                    L.popup()
                        .setLatLng(e.latlng)
                        .setContent(html)
                        .openOn(map);
                }
            });

            legend["Mes de " + meses[index]] = layerSf;

            bounds = layerSf.getBounds();
        });

        // Layers control
        L.control.layers(legend, overlayMaps, {
            position: 'topright',
            collapsed: false
        }).addTo(map);

        var bar = L.control.colorBar(scale, range, {
            title: 'Currents surface velocity (m/s)',
            units: 'm/s',
            steps: 100,
            decimals: 0,
            width: 350,
            height: 20,
            position: 'bottomleft',
            background: '#000',
            textColor: 'white',
            textLabels: ['low', 'mid', 'high'],
            labels: [range[0], (range[0]+range[1])/2, range[1]],
            labelFontSize: 9
        }).addTo(map);



        map.fitBounds(bounds);
        map.setZoom(7)

    });

pComunas.addTo(map);
pRegiones.addTo(map);