var map = L.map('map').setView([-35.31, -72.11], 7);

L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
    opacity: 1.0,
}).addTo(map);

L.marker([-35.31, -72.11]).addTo(map)
    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    .openPopup();
        