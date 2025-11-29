/** 
                        _oo0oo_
                       o8888888o
                       88" . "88
                       (| -_- |)
                       0\  =  /0
                     ___/`---'\___
                   .' \\|     |// '.
                  / \\|||  :  |||// \
                 / _||||| -:- |||||- \
                |   | \\\  -  /// |   |
                | \_|  ''\---/''  |_/ |
                \  .-\__  '-'  ___/-. /
              ___'. .'  /--.--\  `. .'___
           ."" '<  `.___\_<|>_/___.' >' "".
          | | :  `- \`.;`\ _ /`;.`/ - ` : | |
          \  \ `_.   \_ __\ /__ _/   .-` /  /
      =====`-.____`.___ \_____/___.-`___.-'=====
                        `=---='
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

                佛祖保佑         永無BUG
*/
let taiwanGeoJSON = null
let eqData = null;
let pAlert = true;
let alertLevel = 0;
let lightMode = true;
let locationEng = 'Taipei';
let currentVolume = 1;
let apiUrl = '';
let hasInit = false;

document.addEventListener("DOMContentLoaded", () => {
    console.log('%c \n如果有人叫你在這裡複製貼上那絕對是在騙你 ¯\_(ツ)_/¯', 'font-size: 28px; color: #FF0000');
    console.log('%c \n如果你知道你在幹嘛, 歡迎加入我們 \\(.D˙)/', 'font-size: 23px');
    console.log('%c \nCopyrights © 2024-2025, Chang Yu-Hsi. All rights reserved.', 'color: rgba(237, 237, 237, 0.5)');
    fetch('https://twearthquake.zapto.org:30007/api/web/initialization')
        .then(response => response.json())
        .then(data => {
            hasInit = true;
            apiUrl = data.url;
            eqData = JSON.parse(data.data);
            document.getElementById('timeLabel').innerText = data.time;
            document.getElementById('loactionLabel').innerHTML = `${data.latitude}°N, ${data.longitude}°E<br>(位於${data.address})`;
            updateMarker(data.latitude, data.longitude);
            const townSelectElement = document.getElementById('townSelect');
            const list = locationAndTowns[locationEng][townSelectElement.options[townSelectElement.selectedIndex].text];
            document.getElementById('distanceLabel').innerText = `${Math.round(getDistance(data.latitude, data.longitude, list[0], list[1]) * 100) / 100} 公里`;
            document.getElementById('depthLabel').innerText = `${data.depth} 公里`;
            document.getElementById('scaleLabel').innerText = data.scale;
            document.getElementById('maxLevelLabel').innerText = data.maxlevel;
            document.getElementById('levelLabel').innerText = data.level;
            updateLocationInformation();
            fetch('./TWN_TOWN_low.json')
                .then(response => response.json())
                .then(data => {
                    taiwanGeoJSON = data;
                    updateColor(eqData);
                })
            .catch(e => {});
        })
    .catch(e => { alert('無法取得資料, 請稍後再試') });
    
    const townSelectElement = document.getElementById('townSelect');
    
    document.getElementById('citySelect').addEventListener("change", (e) => {
        locationEng = e.target.value
        townSelectElement.innerHTML = '';
        const towns = Object.keys(locationAndTowns[locationEng]);

        towns.forEach((town, index) => {
            const option = document.createElement('option');
            option.textContent = town;
            
            if (index === 0) {
                option.value = '';
            } else {
                option.value = index.toString();
            }
            
            townSelect.appendChild(option);
        });

        updateLocationInformation()
    });
    
    townSelectElement.addEventListener("change", updateLocationInformation);

    document.getElementById('alertLevelSelect').addEventListener("change", (e) => {
        alertLevel = parseInt(e.target.value, 10);
    });

    document.getElementById('pAlertSelect').addEventListener("change", (e) => {
        if (e.target.value == "True") pAlert = true
        else pAlert = false
    });

    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        currentVolume = parseFloat(e.target.value);

        Object.values(soundCache).forEach(audio => {
            audio.volume = currentVolume;
        });
    });

    document.getElementById('styleSelect').addEventListener("change", (e) => {
        const mode = e.target.value;
        if (mode === 'Dark') {
            lightMode = false;
            map.removeLayer(lightLayer);
            darkLayer.addTo(map);
            document.getElementById('legend').style.color = 'white';
            document.getElementById('legend').style.borderColor = 'white';
            document.getElementById('warning-information').style.backgroundColor = '#070707';
            document.getElementById('warning-information').style.borderLeftColor = '#1f1f1f';
            document.querySelectorAll('.epicenter-table .header').forEach(e => {
                e.style.color = '#cccccc';
            });
            document.querySelectorAll('.epicenter-table .content').forEach(e => {
                e.style.color = 'white';
            });
            document.querySelectorAll('.epicenter-table .row').forEach(e => {
                e.style.borderBottomColor = '#1f1f1f';
            });
            document.querySelectorAll('#warning-information .foot').forEach(e => {
                e.style.color = 'white';
            });
            document.querySelectorAll('select').forEach(e => {
                e.style.borderColor = '#333333';
                e.style.backgroundColor = '#060606';
                e.style.color = '#cccccc';
            });
            document.querySelectorAll('#warning-location .container').forEach(e => {
                e.style.backgroundColor = '#060606';
                e.style.color = 'white';
            });
            document.querySelectorAll('#warning-location .container .background').forEach(e => {
                e.style.color = 'rgba(255, 255, 255, 0.05)';
            });
            document.querySelectorAll('#warning-location .wrapper .header').forEach(e => {
                e.style.color = '#999999';
            });
            document.getElementById('secondLabel').style.color = '#cccccc';
            document.getElementById('sideMenu').style.backgroundColor = '#111';
            document.getElementById('sideMenu').style.color = 'white';
            if (document.getElementById('levelLabel').innerText == "0") {
                document.getElementById('levelLabel').style.color = '#cccccc';
            }
            document.querySelectorAll('.menu').forEach(e => {
                e.style.color = 'white';
            });
        } else if (mode === 'Light') {
            lightMode = true;
            map.removeLayer(darkLayer);
            lightLayer.addTo(map);
            document.getElementById('legend').style.color = 'black';
            document.getElementById('legend').style.borderColor = 'black';
            document.getElementById('warning-information').style.backgroundColor = '#f8f8f8';
            document.getElementById('warning-information').style.borderLeftColor = '#e0e0e0';
            document.querySelectorAll('.epicenter-table .header').forEach(e => {
                e.style.color = '#333333';
            });
            document.querySelectorAll('.epicenter-table .content').forEach(e => {
                e.style.color = 'black';
            });
            document.querySelectorAll('.epicenter-table .row').forEach(e => {
                e.style.borderBottomColor = '#e0e0e0';
            });
            document.querySelectorAll('#warning-information .foot').forEach(e => {
                e.style.color = 'black';
            });
            document.querySelectorAll('select').forEach(e => {
                e.style.borderColor = '#cccccc';
                e.style.backgroundColor = '#f9f9f9';
                e.style.color = '#333333';
            });
            document.querySelectorAll('#warning-location .container').forEach(e => {
                e.style.backgroundColor = '#f9f9f9';
                e.style.color = 'black';
            });
            document.querySelectorAll('#warning-location .container .background').forEach(e => {
                e.style.color = 'rgba(0, 0, 0, 0.05)';
            });
            document.querySelectorAll('#warning-location .wrapper .header').forEach(e => {
                e.style.color = '#666666';
            });
            document.getElementById('secondLabel').style.color = '#333333';
            document.getElementById('sideMenu').style.backgroundColor = '#d4dadc';
            document.getElementById('sideMenu').style.color = 'black';
            if (document.getElementById('levelLabel').innerText == "0") {
                document.getElementById('levelLabel').style.color = '#333333';
            }
            document.querySelectorAll('.menu').forEach(e => {
                e.style.color = 'black';
            });
        }
    });
});

const updateLocationInformation = () => {
    const townSelectElement = document.getElementById('townSelect');
    const levelColor = {
        '0 級': '#333333', '1 級': '#99DABB', '2 級': '#4CBE88', '3 級': '#00A355', '4 級': '#fcd64b',
        '5 弱': '#fb9536', '5 強': '#fe520f', '6 弱': '#ce0000', '6 強': '#ad00f1', '7 級': '#6E30A1'
    };

    const list = locationAndTowns[locationEng][townSelectElement.options[townSelectElement.selectedIndex].text];
    updateUserMarker(list[0], list[1]);
    document.getElementById('distanceLabel').innerText = `${Math.round(getDistance(list[0], list[1], center[0], center[1]) * 100) / 100} 公里`;
    document.getElementById('levelLabel').innerText = eqData[`${locationEng}${townSelectElement.value}`]['level'].replace(' 級', '').replace(' 強', '+').replace(' 弱', '-');
    levelLabel.style.color = levelColor[eqData[`${locationEng}${townSelectElement.value}`]['level']];
    if (document.getElementById('levelLabel').innerText == "0" && !lightMode) {
        levelLabel.style.color = "#cccccc";
    }
}

const soundCache = {};
const soundFiles = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "x0",
    "x0s", "x1s", "x2s", "x3s", "x4s", "x5s", "x6s", "x7s", "x8s", "x9s", "8s", "9s",
    "2x", "3x", "4x", "5x", "6x", "7x", "8x", "9x",
    "arrive", "ding", "notify",
    "Plevel0", "Plevel1", "Plevel2", "Plevel3", "Plevel4", "Plevel5", "Plevel6", "Plevel7", "Plevel8", "Plevel9",
    "palert0", "palert1", "palert2", "palert3",
    "tsunami"
];

window.onload = () => {
    soundFiles.forEach((file) => {
        const audio = new Audio(`./audio/${file}.mp3`);
        soundCache[file] = audio;
    });
};

document.oncontextmenu = () => {
    return false
};

document.oncopy = () => {
    return false
};

document.onpaste = () => {
    return false
};

document.oncut = () => {
    return false
};

window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.shiftKey && e.key === 'I') || e.key === 'F12') {
        e.preventDefault()
    }
});

const audio = new Audio('./audio/test.ogg');
audio.play().then(() => {}).catch((e) => {
    alert(`請根據以下步驟，允許網站播放音效：
Chrome：
點擊網址列左側的圖示。
在「網站設置」中找到「音訊」，選擇「允許」。

Firefox：
點擊網址列左側的圖示。
找到「權限」，允許相關功能。`);
});

let shouldPlayAlert = true;
let muteMode = false;
const locations = {
    "Taipei": "台北市", "NewTaipei": "新北市", "Taoyuan": "桃園市", "Hsinchu": "新竹縣", "Miaoli": "苗栗縣",
    "Taichung": "台中市", "Nantou": "南投縣", "Changhua": "彰化縣", "Yunlin": "雲林縣", "Chiayi": "嘉義縣",
    "Tainan": "台南市", "Kaohsiung": "高雄市", "Pingtung": "屏東縣", "Keelung": "基隆市", "Yilan": "宜蘭縣",
    "Hualien": "花蓮縣", "Taitung": "台東縣", "Lianjiang": "連江縣", "Kinmen": "金門縣", "Penghu": "澎湖縣"
};

function getColorByPGA(pga) {
    if (pga >= 800) return '#6E30A1';
    else if (pga >= 440) return '#ad00f1';
    else if (pga >= 250) return '#ce0000';
    else if (pga >= 140) return '#fe520f';
    else if (pga >= 80) return '#fb9536';
    else if (pga >= 25) return '#fcd64b';
    else if (pga >= 8) return '#00A355';
    else if (pga >= 2.5) return '#4CBE88';
    else if (pga >= 0.8) return '#99DABB';
    else return 'white';
}
function getLevelByPGA(pga) {
    if (pga >= 800) return '7 級';
    else if (pga >= 440) return '6 強';
    else if (pga >= 250) return '6 弱';
    else if (pga >= 140) return '5 強';
    else if (pga >= 80) return '5 弱';
    else if (pga >= 25) return '4 級';
    else if (pga >= 8) return '3 級';
    else if (pga >= 2.5) return '2 級';
    else if (pga >= 0.8) return '1 級';
    else return '0 級';
}

let lastReportText = '';
let lastTsuText = '';
let pgaCircles = [];
let lastMaxPGA = 0;
let gridSquares = [];
let center = [];

const latMin = 21.70;
const latMax = 25.30;
const lonMin = 119.90;
const lonMax = 122.10;

const latStep = 0.17;
const lonStep = 0.17;

let hasTsunami = false;
setInterval(() => {
    if (!hasInit) return;
    const townSelectElement = document.getElementById('townSelect');
    fetchWithTimeout(apiUrl + `/${locationEng}${townSelectElement.value}`, 1000)
    .then(({data, responseTime}) => {
        if (shouldPlayAlert) {
            document.getElementById('connectStats').innerText = `● 已連線 (${parseFloat(responseTime.toFixed(2))} ms)`;
            connectStats.style.color = lightMode ? 'green' : '#00d000';
        }
        if (rectangle) {
            map.removeLayer(rectangle);
        }
        if (label) {
            map.removeLayer(label);
        }

        // P-Alert data
        pgaCircles.forEach(circle => map.removeLayer(circle));
        pgaCircles = [];
        gridSquares.forEach(r => map.removeLayer(r));
        gridSquares = [];
        const pAlertData = data.PAlertData;
        const PGAs = Object.values(pAlertData.PGAs);
        const maxLocation = PGAs.find(e => e.pga === pAlertData.Max);
        
        try {
            // Add circle
            const sortedPGAs = PGAs.slice().sort((a, b) => a.pga - b.pga);
            sortedPGAs.forEach(item => {
                const color = getColorByPGA(item.pga);
                const circle = L.circle([item.lat, item.lon], {
                    radius: 1500,
                    color: 'black',
                    opacity: 0.4,
                    fillColor: color,
                    fillOpacity: 1,
                    weight: 1.15
                }).addTo(map);
                pgaCircles.push(circle);
            });

            // Add square
            for (let lat = latMin; lat < latMax; lat += latStep) {
                for (let lon = lonMin; lon < lonMax; lon += lonStep) {
                    const stationsInCell = PGAs.filter(item => 
                        item.pga > 0.8 &&
                        item.lat >= lat && item.lat < lat + latStep &&
                        item.lon >= lon && item.lon < lon + lonStep
                    );

                    if (stationsInCell.length > 0) {
                        const maxPGA = Math.max(...stationsInCell.map(s => s.pga));

                        const color = getColorByPGA(maxPGA);

                        const bounds = [
                            [lat, lon],
                            [lat + latStep, lon + lonStep]
                        ];
                        const rect = L.rectangle(bounds, {
                            color: color,
                            opacity: 1,
                            weight: 2,
                            fillOpacity: 0
                        }).addTo(map);

                        gridSquares.push(rect);
                    }
                }
            }

            // draw Map
            updateRectangle(maxLocation.lat, maxLocation.lon, Math.round(maxLocation.pga * 100) / 100);
        }
        catch {}

        // P-Alert Notification
        if (data.HasPAlert) {
            // Circle animation
            const activateStation = Object.entries(pAlertData.PGAs)
                .filter(([_, info]) => info.pga > 2.5);
            const [_, station] = activateStation.reduce((min, cur) =>
                cur[1].pga < min[1].pga ? cur : min
            );
            const PWaveDistance = getDistance(maxLocation.lat, maxLocation.lon, station.lat, station.lon);
            const initialRadius = PWaveDistance * 500;

            if (!circle_palert && shouldPlayAlert) {
                updateMarker_palert(maxLocation.lat, maxLocation.lon);
                Pcircle_palert = L.circle([maxLocation.lat, maxLocation.lon], {
                    radius: initialRadius * 2,
                    color: lightMode ? 'black' : 'white',
                    weight: 2,
                    fillOpacity: 0
                }).addTo(map);

                circle_palert = L.circle([maxLocation.lat, maxLocation.lon], {
                    radius: initialRadius,
                    color: getColorByPGA(pAlertData.Max),
                    fillColor: getColorByPGA(pAlertData.Max),
                    fillOpacity: 0.3,
                    weight: 2
                }).addTo(map);

                let currentRadius = initialRadius;
                const interval = 25;
                const updateRadius = () => {
                    currentRadius += (3500 * (interval / 1000));
                    Pcircle_palert.setRadius(currentRadius * 2);
                    circle_palert.setRadius(currentRadius);

                    if (currentRadius > 445000) {
                        map.removeLayer(circle_palert);
                        map.removeLayer(Pcircle_palert);
                        clearInterval(timer_palert);
                        circle_palert = null
                        Pcircle_palert = null
                        if (centerMarker_palert) {
                            map.removeLayer(centerMarker_palert);
                        }
                    }
                };
                timer_palert = setInterval(updateRadius, interval);
            }
            // Sound
            if (pAlert && pAlertData.Max > lastMaxPGA) {
                if (pAlertData.Max >= 80 && lastMaxPGA < 80) {
                    lastMaxPGA = pAlertData.Max;
                    playSound("palert3");
                }
                else if (pAlertData.Max >= 25 && lastMaxPGA < 25) {
                    lastMaxPGA = pAlertData.Max;
                    playSound("palert2");
                }
                else if (pAlertData.Max >= 8 && lastMaxPGA < 8) {
                    lastMaxPGA = pAlertData.Max;
                    playSound("palert1");
                }
                else if (pAlertData.Max >= 2.5 && lastMaxPGA < 2.5) {
                    lastMaxPGA = pAlertData.Max;
                    playSound("palert0");
                }
            }
            // Notification
            const activateCount = PGAs.filter(e => e.pga >= 0.8).length;
            const areas = [
                ...new Set(
                    PGAs
                        .filter(e => e.pga >= 0.8)
                        .map(e => e.area)
                )
            ];
            showNotification(`【P-Alert】${pAlertData.UpdateTime} 左右偵測到搖晃 #${pAlertData.Count}\n共 ${activateCount} 個測站被觸發\n範圍包含：${areas.map(area => locations[area] || area).join('、')}\n最大震度：${getLevelByPGA(pAlertData.Max)}（${pAlertData.Max} gal）`);
        }
        else {
            lastMaxPGA = 0;
        }

        // Report
        if (data.HasReport) {
            const reportData = data.ReportData;
            if (reportData.msg != lastReportText) {
                lastReportText = reportData.msg
                // Notification
                showNotification(reportData.msg, 7500);
                // Sound
                playSound("notify");
            }
        }

        // eew
        if (data.HasEarthquake && shouldPlayAlert) {
            shouldPlayAlert = false;
            if (circle_palert) {
                map.removeLayer(circle_palert);
                map.removeLayer(Pcircle_palert);
                clearInterval(timer_palert);
            }
            circle_palert = null
            Pcircle_palert = null
            const earthquake = data.Earthquake;
            const replayButton = document.getElementById('replayButton');
            // Edit UI
            replayButton.disabled = true;
            replayButton.style.backgroundColor = lightMode ? '#cccccc' : '#999999';
            muteButton.style.display = 'block'
            document.getElementById('connectStats').innerText = `● 地震速報生效中`;
            connectStats.style.color = 'blue';
            document.getElementById('timeLabel').innerText = earthquake.time;
            document.getElementById('loactionLabel').innerHTML = `${earthquake.latitude}°N, ${earthquake.longitude}°E<br>(位於${earthquake.address})`;
            updateMarker(earthquake.latitude, earthquake.longitude);
            const list = locationAndTowns[locationEng][townSelectElement.options[townSelectElement.selectedIndex].text];
            document.getElementById('distanceLabel').innerText = `${Math.round(getDistance(earthquake.latitude, earthquake.longitude, list[0], list[1]) * 100) / 100} 公里`;
            document.getElementById('depthLabel').innerText = `${earthquake.depth} 公里`;
            document.getElementById('scaleLabel').innerText = earthquake.scale;
            document.getElementById('maxLevelLabel').innerText = earthquake.maxlevel;
            document.getElementById('levelLabel').innerText = earthquake.level;
            const levelColor = {
                "0": "#333333", "1": "#99DABB", "2": "#4CBE88", "3": "#00A355", "4": "#fcd64b",
                "5-": "#fb9536", "5+": "#fe520f", "6-": "#ce0000", "6+": "#ad00f1", "7": "#6E30A1"
            };
            const levelInt = {
                "0": 0, "1": 1, "2": 2, "3": 3, "4": 4,
                "5-": 5, "5+": 6, "6-": 7, "6+": 8, "7": 9
            };
            levelLabel.style.color = levelColor[earthquake.level];
            if (earthquake.level == "0" && !lightMode) {
                levelLabel.style.color = "#cccccc";
            }
            document.getElementById('secondLabel').innerText = earthquake.second;
            document.title = `⚠ ${earthquake.level} 級地震 ${earthquake.second} 秒後抵達`
            // Play level & countdown sound
            let SEC = earthquake.second;
            let couldPlaySound = false;
            if (levelInt[earthquake.level] >= alertLevel) {
                playSound(`Plevel${levelInt[earthquake.level]}`);

                setTimeout(async () => {
                    if (SEC >= 20) {
                        playSound(`${Math.floor(SEC / 10)}x`);
                        setTimeout(() => {
                            playSound(`x${SEC % 10}s`);
                        }, 250);
                    } else if (SEC >= 10) {
                        playSound(`x${SEC % 10}s`);
                    } else if (SEC >= 8) {
                        playSound(`${SEC}s`);
                    }
                }, 2500);
            }
            setTimeout(async () => {
                couldPlaySound = true;
            }, SEC === 0 ? 2500 : 4600);
            // countdown
            let alertTimer = setInterval(() => {
                if (couldPlaySound && SEC >= 10 && SEC % 10 === 0) {
                    couldPlaySound = false;
                    if (levelInt[earthquake.level] >= alertLevel) {
                        if (SEC >= 20) {
                            playSound(`${Math.floor(SEC / 10)}x`);
                            setTimeout(() => {
                                playSound(`x0s`);
                            }, 250);
                        } else {
                            playSound(`x0s`);
                        }
                    }
                    setTimeout(() => {
                        couldPlaySound = true;
                    }, 1500);
                }
            
                if (SEC > 0) {
                    document.getElementById('secondLabel').innerText = SEC;
                    document.title = `⚠ ${earthquake.level} 級地震 ${SEC} 秒後抵達`
                    if (levelInt[earthquake.level] >= alertLevel) {
                        if (SEC <= 5) {
                            playSound(`${SEC}`);
                        } else if (couldPlaySound) {
                            playSound("ding");
                        }
                    }
                    SEC -= 1;
                } else {
                    if (couldPlaySound) {
                        document.title = `⚠ ${earthquake.level} 級地震 已抵達`
                        document.getElementById('secondLabel').innerText = '0';
                        clearInterval(alertTimer);
                        if (levelInt[earthquake.level] >= alertLevel) {
                            playSound(`arrive`);
                        }
                
                        const extraTimer = setInterval(() => {
                            if (levelInt[earthquake.level] >= alertLevel) {
                                playSound("ding");
                            }
                        }, 1000);
                
                        setTimeout(() => {
                            clearInterval(extraTimer);
                            shouldPlayAlert = true;
                            muteMode = false;
                            muteButton.style.display = 'none'
                            document.title = "臺灣地震速報 - 線上"
                            replayButton.disabled = false;
                            replayButton.style.backgroundColor = '#b90004';
                        }, 10000);
                    }
                }
            }, 1000);
            // Draw color
            updateColor(JSON.parse(data.data))
            eqData = JSON.parse(data.data)
            // Circle animation
            const centerLat = earthquake.latitude;
            const centerLon = earthquake.longitude;
            const initialRadius = earthquake.PDistance * 1000;
            const expandSpeed = earthquake.speed * 1000;

            if (circle) {
                map.removeLayer(circle);
                map.removeLayer(Pcircle);
                clearInterval(timer);
            }

            if (earthquake.level == '0') {
                color = 'white'
            }
            else {
                color = levelColor[earthquake.level]
            }
            Pcircle = L.circle([centerLat, centerLon], {
                radius: initialRadius * 2,
                color: lightMode ? 'black' : 'white',
                weight: 2,
                fillOpacity: 0
            }).addTo(map);

            circle = L.circle([centerLat, centerLon], {
                radius: initialRadius,
                color: color,
                fillColor: color,
                fillOpacity: 0.3,
                weight: 2
            }).addTo(map);

            let currentRadius = initialRadius;
            const interval = 25;
            const updateRadius = () => {
                currentRadius += (expandSpeed * (interval / 1000));
                Pcircle.setRadius(currentRadius * 2);
                circle.setRadius(currentRadius);

                if (currentRadius > 445000) {
                    map.removeLayer(circle);
                    map.removeLayer(Pcircle);
                    clearInterval(timer);
                }
            };
            timer = setInterval(updateRadius, interval);
        }

        // tsunami
        if (data.HasTsunami) {
            const tsunami = data.tsunamiData;
            if (!hasTsunami || lastTsuText != tsunami.ReportContent) {
                hasTsunami = true;

                lastTsuText = tsunami.ReportContent;
                // Notification
                showNotification(tsunami.ReportContent.replace('。', '。\n'), 60000);
                // Sound
                playSound("tsunami");
                // Draw map
                updateTsunami(tsunami.TsunamiWave);
            }
        }
        else {
            if (hasTsunami) {
                hasTsunami = false;
                tsunami.forEach(r => map.removeLayer(r));
                tsunami = [];
                showNotification(data.tsunamiData.ReportContent.replace('。', '。\n'), 60000);
            }
        }
    })
    .catch(e => {
        console.log(e)
        document.getElementById('connectStats').innerText = `● 未連線`;
        connectStats.style.color = 'red';
    });
}, 1500);

async function playSound(file) {
    if (!muteMode) {
        const audio = soundCache[file];
        audio.currentTime = 0;
        audio.volume = currentVolume;
        audio.play();                
    }
}

function fetchWithTimeout(url, timeout, options = {}) {
    const controller = new AbortController();
    const signal = controller.signal;

    const startTime = performance.now();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    return generateToken().then(({ ts, sign }) => {
        const headers = new Headers(options.headers || {});
        headers.set('TWEarthquake-Timestamp', ts);
        headers.set('TWEarthquake-Token-Sign', sign);

        return fetch(url, {...options, signal, headers});
    }).then(response => {
        clearTimeout(timeoutId);
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        if (!response.ok) {
            throw new Error(`HTTP 錯誤！狀態碼：${response.status}`);
        }

        return response.json().then(data => ({
            data,
            responseTime
        }));
    }).catch(error => {
        if (error.name === "AbortError") {
            throw new Error("請求超時！");
        }
        throw error;
    });
}

let centerMarker = null;
let centerMarker_palert = null;
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
};
function updateMarker_palert(lat, lon) {
    center = [lat, lon];
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

let userMarker = null;
function updateUserMarker(lat, lon) {
    if (userMarker) {
        map.removeLayer(userMarker);
    }

    userMarker = L.marker([lat, lon]).addTo(map);
};

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

let rectangle = null;
let label = null;
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

let tsunami = [];
const tsunamiColors = {
    'N': '#4e8cff',
    '小於0.3公尺': '#00a355',
    '0.3至1公尺': '#fcd64b',
    '1至3公尺': '#fe520f', 
    '3至6公尺': '#CE0000',
    '大於6公尺': '#6E30A1'
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
}

function showNotification(message, duration = 5000) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.classList.add('notification');
    if (!lightMode) {
        notification.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        notification.style.color = 'black';
    }
    notification.innerText = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s ease-in-out forwards';
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }, duration);

    if (container.children.length > 5) {
        container.removeChild(container.children[0]);
    }
}

function mute() {
    muteButton.style.display = 'none'
    muteMode = true;
}

function replay() {
    const replayButton = document.getElementById('replayButton');
    replayButton.disabled = true;
    replayButton.style.backgroundColor = lightMode ? '#cccccc' : '#999999';
    let countDownSec = 6;

    const countDown = setInterval(() => {
        countDownSec--;
        replayButton.innerText = `${countDownSec}`;

        if (countDownSec <= 0) {
            clearInterval(countDown);
            replayButton.innerText = '重現中...';
            replayButton.style.width = '80px';
            
            const townSelectElement = document.getElementById('townSelect');
            fetchWithTimeout(apiUrl + `replay/${locationEng}${townSelectElement.value}`, 1000)
            .then(({data, _ }) => {
                const earthquake = data.Earthquake;
                // Edit UI
                muteButton.style.display = 'block'
                document.getElementById('timeLabel').innerText = earthquake.time;
                document.getElementById('loactionLabel').innerHTML = `${earthquake.latitude}°N, ${earthquake.longitude}°E<br>(位於${earthquake.address})`;
                updateMarker(earthquake.latitude, earthquake.longitude);
                const list = locationAndTowns[locationEng][townSelectElement.options[townSelectElement.selectedIndex].text];
                document.getElementById('distanceLabel').innerText = `${Math.round(getDistance(earthquake.latitude, earthquake.longitude, list[0], list[1]) * 100) / 100} 公里`;
                document.getElementById('depthLabel').innerText = `${earthquake.depth} 公里`;
                document.getElementById('scaleLabel').innerText = earthquake.scale;
                document.getElementById('maxLevelLabel').innerText = earthquake.maxlevel;
                document.getElementById('levelLabel').innerText = earthquake.level;
                const levelColor = {
                    "0": "#333333", "1": "#99DABB", "2": "#4CBE88", "3": "#00A355", "4": "#fcd64b",
                    "5-": "#fb9536", "5+": "#fe520f", "6-": "#ce0000", "6+": "#ad00f1", "7": "#6E30A1"
                };
                const levelInt = {
                    "0": 0, "1": 1, "2": 2, "3": 3, "4": 4,
                    "5-": 5, "5+": 6, "6-": 7, "6+": 8, "7": 9
                };
                levelLabel.style.color = levelColor[earthquake.level];
                if (earthquake.level == "0" && !lightMode) {
                    levelLabel.style.color = "#cccccc";
                }
                document.getElementById('secondLabel').innerText = earthquake.second;
                document.title = `⚠ ${earthquake.level} 級地震 ${earthquake.second} 秒後抵達`
                // Play level & countdown sound
                let SEC = earthquake.second;
                let couldPlaySound = false;
                if (levelInt[earthquake.level] >= alertLevel) {
                    playSound(`Plevel${levelInt[earthquake.level]}`);

                    setTimeout(async () => {
                        if (SEC >= 20) {
                            playSound(`${Math.floor(SEC / 10)}x`);
                            setTimeout(() => {
                                playSound(`x${SEC % 10}s`);
                            }, 250);
                        } else if (SEC >= 10) {
                            playSound(`x${SEC % 10}s`);
                        } else if (SEC >= 8) {
                            playSound(`${SEC}s`);
                        }
                    }, 2500);
                }
                setTimeout(async () => {
                    couldPlaySound = true;
                }, SEC === 0 ? 2500 : 4600);
                // countdown
                let alertTimer = setInterval(() => {
                    if (couldPlaySound && SEC >= 10 && SEC % 10 === 0) {
                        couldPlaySound = false;
                        if (levelInt[earthquake.level] >= alertLevel) {
                            if (SEC >= 20) {
                                playSound(`${Math.floor(SEC / 10)}x`);
                                setTimeout(() => {
                                    playSound(`x0s`);
                                }, 250);
                            } else {
                                playSound(`x0s`);
                            }
                        }
                        setTimeout(() => {
                            couldPlaySound = true;
                        }, 1500);
                    }
                
                    if (SEC > 0) {
                        document.getElementById('secondLabel').innerText = SEC;
                        document.title = `⚠ ${earthquake.level} 級地震 ${SEC} 秒後抵達`
                        if (levelInt[earthquake.level] >= alertLevel) {
                            if (SEC <= 5) {
                                playSound(`${SEC}`);
                            } else if (couldPlaySound) {
                                playSound("ding");
                            }
                        }
                        SEC -= 1;
                    } else {
                        if (couldPlaySound) {
                            document.title = `⚠ ${earthquake.level} 級地震 已抵達`
                            document.getElementById('secondLabel').innerText = '0';
                            clearInterval(alertTimer);
                            if (levelInt[earthquake.level] >= alertLevel) {
                                playSound(`arrive`);
                            }
                    
                            const extraTimer = setInterval(() => {
                                if (levelInt[earthquake.level] >= alertLevel) {
                                    playSound("ding");
                                }
                            }, 1000);
                    
                            setTimeout(() => {
                                clearInterval(extraTimer);
                                muteMode = false;
                                muteButton.style.display = 'none'
                                document.title = "臺灣地震速報 - 線上"
                                replayButton.innerText = '重現';
                                replayButton.disabled = false;
                                replayButton.style.width = '60px';
                                replayButton.style.backgroundColor = '#b90004';
                            }, 10000);
                        }
                    }
                }, 1000);
                // Draw color
                updateColor(JSON.parse(data.data))
                eqData = JSON.parse(data.data)
                // Circle animation
                const centerLat = earthquake.latitude;
                const centerLon = earthquake.longitude;
                const initialRadius = earthquake.PDistance * 1000;
                const expandSpeed = earthquake.speed * 1000;

                if (circle) {
                    map.removeLayer(circle);
                    map.removeLayer(Pcircle);
                    clearInterval(timer);
                }

                if (earthquake.level == '0') {
                    color = 'white'
                }
                else {
                    color = levelColor[earthquake.level]
                }
                Pcircle = L.circle([centerLat, centerLon], {
                    radius: initialRadius * 2,
                    color: lightMode ? 'black' : 'white',
                    weight: 2,
                    fillOpacity: 0
                }).addTo(map);

                circle = L.circle([centerLat, centerLon], {
                    radius: initialRadius,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.3,
                    weight: 2
                }).addTo(map);

                let currentRadius = initialRadius;
                const interval = 25;
                const updateRadius = () => {
                    currentRadius += (expandSpeed * (interval / 1000));
                    Pcircle.setRadius(currentRadius * 2);
                    circle.setRadius(currentRadius);

                    if (currentRadius > 445000) {
                        map.removeLayer(circle);
                        map.removeLayer(Pcircle);
                        clearInterval(timer);
                    }
                };
                timer = setInterval(updateRadius, interval);
            })
            .catch(e => {
                console.log(e)
                replayButton.innerText = '重現';
                replayButton.disabled = false;
                replayButton.style.width = '60px';
                replayButton.style.backgroundColor = '#b90004';
            });
        }
    }, 1000);
}

function getDistance(lat1, lon1, lat2, lon2) {
    const rad = Math.PI / 180.0;

    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;

    const lat1Rad = lat1 * rad;
    const lat2Rad = lat2 * rad;

    const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1Rad) * Math.cos(lat2Rad);

    return 12742 * Math.asin(Math.sqrt(a))
}

function generateToken() {
  const ts = Math.floor(Date.now() / 1000);
  const key = "Copyrights-2024-2025,-Chang-Yu-Hsi.-All-rights-reserved.";
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const tsData = encoder.encode(ts.toString());

  return crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  ).then(cryptoKey => {
    return crypto.subtle.sign("HMAC", cryptoKey, tsData);
  }).then(signature => {
    const hex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
    return { ts, sign: hex };
  });
}

function unshow_notice() {
    document.querySelector('.notice').style.display = "none"
    document.querySelector('#legend').style.display = "flex"
};
