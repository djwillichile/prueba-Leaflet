let map = L.map('map').setView([-35.31, -72.11], 7);

map.createPane('pane_GoogleTerrain_0');
map.getPane('pane_GoogleTerrain_0').style.zIndex = 400;
let url = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';

var layer_GoogleTerrain_0 = L.tileLayer(url, {
    pane: 'pane_GoogleTerrain_0',
    opacity: .7,
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 20
}).addTo(map);

layer_GoogleTerrain_0;


map.createPane('pane_OSMStandard_1');
map.getPane('pane_OSMStandard_1').style.zIndex = 401;
let url = 'http://tile.openstreetmap.org/{z}/{x}/{y}.png';

var layer_OSMStandard_1 = L.tileLayer(url, {
    pane: 'pane_GoogleTerrain_0',
    opacity: .6,
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 20
});


map.addLayer(layer_OSMStandard_1);
        