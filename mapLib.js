let centerMarker = null;
let centerMarker_report = null;
let centerMarker_palert = null;
let userMarker = null;
let circle = null;
let Pcircle = null;
let timer = null;
let circle_palert = null;
let Pcircle_palert = null;
let timer_palert = null;
let colorLayer = null;
const levelColors = {
    '0 級': '#E2E2E2', '1 級': '#99DABB', '2 級': '#4CBE88', '3 級': '#00A355', '4 級': '#fcd64b',
    '5 弱': '#fb9536', '5 強': '#fe520f', '6 弱': '#ce0000', '6 強': '#ad00f1', '7 級': '#6E30A1'
};
let rectangle = null;
let label = null;
let tsunami = [];
let report = [];
const levelIcons = {
    '0級': '0', '1級': '1', '2級': '2', '3級': '3', '4級': '4',
    '5弱': '5', '5強': '6', '6弱': '7', '6強': '8', '7級': '9'
};
const tsunamiColors = {
    'N': '#4e8cff',
    '小於0.3公尺': '#00a355',
    '0.3至1公尺': '#fcd64b',
    '1至3公尺': '#fe520f', 
    '3至6公尺': '#CE0000',
    '大於6公尺': '#6E30A1'
};

function updateMarker(lat, lon) {
    center = [lat, lon];
    if (centerMarker) {
        map.removeLayer(centerMarker);
    }

    const customIcon = L.icon({
        iconUrl: './cross.png',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    centerMarker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
  
    centerMarker.on("mouseover", (e) => {
        const el = e.target._icon;
        if (el) el.style.opacity = "0.25";
    });

    centerMarker.on("mouseout", (e) => {
        const el = e.target._icon;
        if (el) el.style.opacity = "1";
    });
};

function updateMarker_report(lat, lon) {
    if (centerMarker_report) {
        map.removeLayer(centerMarker_report);
    }

    const customIcon = L.icon({
        iconUrl: './cross_blue.png',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    centerMarker_report = L.marker([lat, lon], { icon: customIcon }).addTo(map);

    centerMarker_report.on("mouseover", (e) => {
        const el = e.target._icon;
        if (el) el.style.opacity = "0.25";
    });

    centerMarker_report.on("mouseout", (e) => {
        const el = e.target._icon;
        if (el) el.style.opacity = "1";
    });
};

function updateMarker_palert(lat, lon) {
    if (centerMarker_palert) {
        map.removeLayer(centerMarker_palert);
    }

    const customIcon = L.icon({
        iconUrl: './pcross.png',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    centerMarker_palert = L.marker([lat, lon], { icon: customIcon }).addTo(map);
};

function updateUserMarker(lat, lon) {
    if (userMarker) {
        map.removeLayer(userMarker);
    }

    userMarker = L.marker([lat, lon]).addTo(map);
    userMarker.on("mouseover", (e) => {
        const el = e.target._icon;
        if (el) el.style.opacity = "0.25";
    });

    userMarker.on("mouseout", (e) => {
        const el = e.target._icon;
        if (el) el.style.opacity = "1";
    });
};

function updateColor(data) {
    if (colorLayer) {
        map.removeLayer(colorLayer);
    }

    colorLayer = L.geoJSON(taiwanGeoJSON, {
        style: feature => {
            const cityName = feature.properties.COUNTYNAME;
            const toneNumber = feature.properties.TOWNNAME;
            const cityData = data[cityName + toneNumber];
            const level = cityData ? cityData.level : "0 級";
            return {
                fillColor: levelColors[level],
                color: "black",
                weight: 0.45,
                fillOpacity: 0.7
            };
        }
    }).addTo(map);
};

function updateRectangle(lat, lon, text = '') {
    const latDelta = 10 / 111;
    const lonDelta = 10 / (111 * Math.cos(lat * (Math.PI / 180)));

    const bounds = [
        [lat - latDelta, lon - lonDelta],
        [lat + latDelta, lon + lonDelta]
    ];
    rectangle = L.rectangle(bounds, {
        color: lightMode ? 'blue' : '#00FFFF',
        weight: 1.5,
        fillOpacity: 0
    }).addTo(map);

    label = L.marker([lat + latDelta, lon], {
        icon: L.divIcon({
            className: 'rectangle-label',
            html: `<div style="color: ${lightMode ? 'blue' : '#00FFFF'}; font-size: 14px; ">${text}</div>`,
            iconSize: [60, 20],
            iconAnchor: [20, 20]
        })
    }).addTo(map);
};

function updateReport(reportDetailData) {
    report.forEach(r => map.removeLayer(r));
    report = [];
    Object.entries(reportDetailData).forEach(([level, stations]) => {
        const icon = L.icon({
            iconUrl: `https://twearthquake.github.io/levels/${levelIcons[level]}.png`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })

        stations.forEach(([name, lat, lon]) => {
            const marker = L.marker([lat, lon], { icon })
                .addTo(map)
                .bindTooltip(name, {
                    permanent: false,
                    direction: "top",
                    offset: [0, -10],
                    opacity: 0.9
                });
            report.push(marker);
        });
    });
};

function updateTsunami(tsunamiData) {
    tsunami.forEach(r => map.removeLayer(r));
    tsunami = [];
    fetch('./tsunami.json')
        .then(response => response.json())
        .then(geojsonData => {
            geojsonData.features.forEach(feature => {
                const name = feature.properties.COUNTYNAME;
                const data = tsunamiData[name];
                if (data) {
                    const coords = feature.geometry.coordinates[0];
                    const latlngs = coords.map(c => [c[1], c[0]]);
                    const color = tsunamiColors[data.WaveHeight] || '#4e8cff';

                    const line = L.polyline(latlngs, {
                        color: color,
                        weight: 8,
                        className: 'blinking-label'
                    }).addTo(map);
                    tsunami.push(line);
                    
                    if (feature.properties.IGNORELABEL == "0") {
                        const midIndex = Math.floor(latlngs.length / 2);
                        const midLatLng = latlngs[midIndex];
                        const label = L.marker(midLatLng, {
                            icon: L.divIcon({
                                html: `<div class="blinking-label">${data.ArrivalTime}</div>`,
                                className: '',
                                iconSize: [80, 20],
                                iconAnchor: [40, 10]
                            })
                        }).addTo(map);
                        tsunami.push(label);
                    }
                }
            });
        });
};
