let map = L.map('map').setView([51.505, -0.09], 13);

map.createPane('pane_GoogleTerrain_0');
map.getPane('pane_GoogleTerrain_0').style.zIndex = 400;
let url = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';

var layer_GoogleTerrain_0 = L.tileLayer(url, {
    pane: 'pane_GoogleTerrain_0',
    opacity: 1.0,
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 20
})

layer_GoogleTerrain_0.addTo(map);
        