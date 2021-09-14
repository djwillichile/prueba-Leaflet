var map = L.map('map').setView([-35.31, -72.11], 7);

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

d3.request("data/ndvi_201702_LZW.tif").responseType('arraybuffer').get(
            function (error, tiffData) {
                let ndvi = L.ScalarField.fromGeoTIFF(tiffData.response);

                let layer = L.canvasLayer.scalarField(ndvi, {
                    color: chroma.scale('YlGn').domain(ndvi.range),
                    inFilter: (v) => v !== 0
                }).addTo(map);

                layer.on('click', function (e) {
                    if (e.value !== null) {
                        let v = e.value.toFixed(2);
                        let html = (`<span class="popupText">NDVI ${v}</span>`);
                        let popup = L.popup()
                            .setLatLng(e.latlng)
                            .setContent(html)
                            .openOn(map);
                    }
                });
                map.fitBounds(layer.getBounds());

            });

L.marker([-35.31, -72.11]).addTo(map)
    .bindPopup('HOLIS.<br> Easily customizable.')
    .openPopup();
        