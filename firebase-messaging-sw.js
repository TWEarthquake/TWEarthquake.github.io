importScripts("/db.js");
importScripts("/location.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAAY4KSVU8YkXFvXOSqxIGep6U5zv-P38M",
  authDomain: "earthquakeweb-a0353.firebaseapp.com",
  projectId: "earthquakeweb-a0353",
  storageBucket: "earthquakeweb-a0353.firebasestorage.app",
  messagingSenderId: "288541522957",
  appId: "1:288541522957:web:8e41b718c686f3c2b02944",
  measurementId: "G-D8T63Q32KV"
});

const messaging = firebase.messaging();

self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  const url = event.notification.data.url || "/pwa";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(function(clientList) {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});

messaging.onBackgroundMessage(function(payload) {
	const data = payload.data || {};

    return handleBackgroundMessage(data);
});

async function handleBackgroundMessage(data) {
    let title = data.title || "";
    let body = data.body || "";
	const numToLevel = {
		0: "0 級", 1: "1 級", 2: "2 級", 3: "3 級", 4: "4 級",
		5: "5 弱", 6: "5 強", 7: "6 弱", 8: "6 強", 9: "7 級"
	};
	const levelToNum = {
		'0 級': 0, '1 級': 1, '2 級': 2, '3 級': 3, '4 級': 4,
        '5 弱': 5, '5 強': 6, '6 弱': 7, '6 強': 8, '7 級': 9
	};

	if (data.type === "eew") {
		try {
			const settings = await SettingsDB.getSettings();
            const location = settings.location;
            const alertLevel = settings.alertLevel;

			if (alertLevel > levelToNum[data.maxLevel]) { return; }

			const [latitude, longitude, dPGA] = getLocationInfo(location);
			const distance = getDistance(latitude, longitude, Number(data.lat), Number(data.lon))
			const localLevel = getLocationLevel(distance, dPGA, Number(data.de), Number(data.ma))

			if (alertLevel > levelToNum[localLevel]) { return; }

			const arriveTime = getTimeTo(distance, Number(data.pd))

			body = `〚${localLevel}〛地震，〚${arriveTime}秒〛後抵達\n慎防強烈搖晃，就近避難「趴下、掩護、穩住」。Beware of strong shaking, seek cover nearby "DROP, COVER, HOLD ON"`
		}
		catch (e) { }
	}
	await self.registration.showNotification(title, {
        body: body,
        icon: "/f256x256.png",
        data: {
            url: "/pwa"
        }
    });
}

function getLocationInfo(location) {
    const match = location.match(/^(.+?)(\d+)?$/);

    if (!match) { return null; }

    const city = match[1];
    const index = match[2] ? parseInt(match[2], 10) : 0;

    if (!locationAndTowns[city]) { return null; }

    const towns = Object.values(locationAndTowns[city]);

    if (index < 0 || index >= towns.length) { return null; }

    return towns[index];
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

function getLocationLevel(distance, dPGA, deep, mag) {
    const point = Math.hypot(deep, distance);
    const PGA = 1.657 * Math.exp(1.533 * mag) * point ** -1.607 * dPGA;

    const levels = [
        [800, "7 級"],
        [440, "6 強"],
        [250, "6 弱"],
        [140, "5 強"],
        [80,  "5 弱"],
        [25,  "4 級"],
        [8,   "3 級"],
        [2.5, "2 級"],
        [0.8, "1 級"],
        [0,   "0 級"]
    ];

    return levels.find(([threshold]) => PGA >= threshold)[1];
}

const getTimeTo = (distance, pd) => distance <= pd ? 0 : Math.min(Math.floor((distance - pd) / 3.5), 99);
