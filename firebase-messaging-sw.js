importScripts("/db.js");
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

messaging.onMessage(function(payload) {
  const msgTitle = payload.data.title;
  const url = payload.data.click_action || "/pwa";

  const notification = new Notification(msgTitle, {
    body: payload.data.body,
    icon: "./f256x256.png"
  });

  notification.onclick = function(e) {
    e.preventDefault();
    window.open(url, "_blank");
  };
});

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

	if (data.type === "eew") {
		try {
			const settings = await SettingsDB.getSettings();

            const location = settings.location;
            const alertLevel = settings.alertLevel;

			const response = await fetch(`https://twearthquake.zapto.org:30007/api/web/location/${location}`)
			if (response.ok) {
                const result = await response.json();
				if (Number.isFinite(level) && alertLevel > result.level) { return; }

				body = `〚${numToLevel[result.level]}〛地震，〚${result.second}秒〛後抵達`
			}
		}
		catch (error) { }
	}
	await self.registration.showNotification(title, {
        body: body,
        icon: "/Web/f256x256.png",
        data: {
            url: "/pwa"
        }
    });
}
