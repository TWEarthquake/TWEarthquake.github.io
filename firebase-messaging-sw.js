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
  const url = payload.data.click_action;

  const notification = new Notification(msgTitle, {
    body: payload.data.body,
    icon: "/Web/f256x256.png"
  });

  notification.onclick = function(e) {
    e.preventDefault();
    window.open(url, "_blank");
  };
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  const url = event.notification.data.url || "/";

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
  self.registration.showNotification(payload.data.title, {
    body: payload.data.body,
    icon: "/Web/f256x256.png",
    data: {
      url: "/"
    }
  });
});