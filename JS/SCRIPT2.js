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

var colours = ['#00429d', '#2e59a8', '#4771b2', '#5d8abd', '#73a2c6',
'#8abccf', '#a5d5d8', '#c5eddf', '#ffffe0', '#ffdec7', '#ffbcaf',
'#ff9895', '#f4777f', '#e4576b', '#cf3759', '#b41648', '#93003a']

d3.request("data/bioc_06.tif").responseType('arraybuffer').get(
    function (error, tiffData){
        let bio = L.ScalarField.fromGeoTIFF(tiffData.response);


        let layer = L.canvasLayer.scalarField(bio, {
            color: chroma.scale(colours).domain(bio.range),
            opacity: 0.65,
            interpolate: true,
            inFilter: (v) => v !== 0
        }).addTo(map);

        layer.on('click', function (e) {
            if (e.value !== null) {
                let v = e.value.toFixed(2);
                let html = (`<span class="popupText">bio1 ${v}</span>`);

                let popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent(html)
                    .openOn(map);
            }
        });
        



        map.fitBounds(layer.getBounds());
});
        