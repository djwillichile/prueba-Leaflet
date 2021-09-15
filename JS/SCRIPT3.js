var map = L.map('map');

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

var colours = ['#00429d', '#2e59a8', '#4771b2', '#5d8abd', '#73a2c6',
'#8abccf', '#a5d5d8', '#c5eddf', '#ffffe0', '#ffdec7', '#ffbcaf',
'#ff9895', '#f4777f', '#e4576b', '#cf3759', '#b41648', '#93003a']

var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'julio', 
'julio', 'agosto', 'septembre', 'octubre', 'noviembre','diciembre']

d3.request("data/CFS/2030/prec_masc.tif").responseType('arraybuffer').get(
    function (error, tiffData) {
        let scalarFields = L.ScalarField.multipleFromGeoTIFF(tiffData.response);
        let legend = {};
        let bounds = {};

        scalarFields.forEach(function (sf, index) {
            let layerSf = L.canvasLayer.scalarField(sf, {
                color: chroma.scale('BrBG').domain(sf.range),
                opacity: 0.65,
                interpolate: true,
            }).addTo(map);
            
            layerSf.on('click', function (e) {
                if (e.value !== null) {
                    let v = e.value.toFixed(0);
                    let html = ('<span class="popupText">Value: ' + v + '</span>');
                    L.popup()
                        .setLatLng(e.latlng)
                        .setContent(html)
                        .openOn(map);
                }
            });
            legend["Mes de " + meses[index]] = layerSf;

            bounds = layerSf.getBounds();
        });

        console.log(legend)

        // Layers control
        L.control.layers(legend, {}, {
            position: 'topright',
            collapsed: false
        }).addTo(map);

        map.fitBounds(bounds);

    });

function style_Region() {
            return {
                opacity: 1,
                color: 'rgba(255,1,1,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fillOpacity: 0,
                interactive: true,
            }
        }

var pRegiones = L.geoJSON(regiones,{
    style: style_Region
}).addTo(map);
