var map = L.map('map').setView([-35.31, -72.11], 7);

let url = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';

var layer_GoogleTerrain_0 = L.tileLayer(url, {
    opacity: 1.0,
});

layer_GoogleTerrain_0.addTo(map);

let url = 'http://tile.openstreetmap.org/{z}/{x}/{y}.png';

var layer_OSMStandard_1 = L.tileLayer(url, {
    pane: 'pane_GoogleTerrain_0',
    opacity: .6,
});

map.addLayer(layer_OSMStandard_1);

L.marker([-35.31, -72.11]).addTo(map)
    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    .openPopup();
        