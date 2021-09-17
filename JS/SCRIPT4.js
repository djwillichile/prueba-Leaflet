let map = L.map('map');

        /* Dark basemap */
        let url = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}.png';
        L.tileLayer(url, {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd'
        }).addTo(map);

        /* GeoTIFF with n bands */
        d3.request("data/CFS/2030/prec_masc.tif").responseType('arraybuffer').get(
            function (error, tiffData) {
                let scalarFields = L.ScalarField.multipleFromGeoTIFF(tiffData.response);
                let legend = {};
                let bounds = {};

                scalarFields.forEach(function (sf, index) {
                    let layerSf = L.canvasLayer.scalarField(sf, {
                        color: chroma.scale('RdPu').domain(sf.range),
                        opacity: 0.65
                    });

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
                    legend["Band " + index] = layerSf;

                    bounds = layerSf.getBounds();
                });

                // Layers control
                L.control.layers(legend, {}, {
                    position: 'bottomleft',
                    collapsed: false
                }).addTo(map);

                map.fitBounds(bounds);

            });