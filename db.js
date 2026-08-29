globalThis.SettingsDB = (() => {
    const DB_NAME = "TWEarthquake";
    const DB_VERSION = 1;
    const STORE_NAME = "settings";
    const SETTINGS_KEY = "userSettings";

    const DEFAULT_SETTINGS = Object.freeze({
        location: "Taipei",
        alertLevel: 0,
        fcmToken: "",
        fid: "",
        updateNoti: true
    });

    let dbPromise = null;

    function init() {
        if (dbPromise) return dbPromise;

        dbPromise = new Promise((resolve, reject) => {
            if (!("indexedDB" in self)) {
                reject(new Error("此環境不支援 IndexedDB"));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = event => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };

            request.onsuccess = event => resolve(event.target.result);
            request.onerror = event => {
                dbPromise = null;
                reject(event.target.error);
            };
        });

        return dbPromise;
    }

    function normalizeSettings(data = {}) {
        let location = typeof data.location === "string"
            ? data.location.trim()
            : DEFAULT_SETTINGS.location;

        if (location && !/^[A-Za-z0-9]+$/.test(location)) {
            location = DEFAULT_SETTINGS.location;
        }

        const alertLevel = Number.isInteger(Number(data.alertLevel)) &&
            Number(data.alertLevel) >= 0 && Number(data.alertLevel) <= 7
            ? Number(data.alertLevel)
            : DEFAULT_SETTINGS.alertLevel;

        const fcmToken = typeof data.fcmToken === "string"
            ? data.fcmToken.trim()
            : DEFAULT_SETTINGS.fcmToken;

        const fid = typeof data.fid === "string"
            ? data.fid.trim()
            : DEFAULT_SETTINGS.fid;

        const updateNoti = typeof data.updateNoti === "boolean"
            ? data.updateNoti
            : DEFAULT_SETTINGS.updateNoti;

        return { location, alertLevel, fcmToken, fid, updateNoti };
    }

    async function readRawSettings() {
        const db = await init();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const request = transaction.objectStore(STORE_NAME).get(SETTINGS_KEY);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function writeSettings(settings) {
        const db = await init();
        const normalized = normalizeSettings(settings);

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            transaction.objectStore(STORE_NAME).put(normalized, SETTINGS_KEY);
            transaction.oncomplete = () => resolve(normalized);
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error || new Error("IndexedDB 交易已中止"));
        });
    }

    async function getSettings() {
        const raw = await readRawSettings();

        if (!raw) {
            return writeSettings(DEFAULT_SETTINGS);
        }

        const normalized = normalizeSettings({
            ...DEFAULT_SETTINGS,
            ...raw
        });

        if (
            raw.location !== normalized.location ||
            raw.alertLevel !== normalized.alertLevel ||
            raw.fcmToken !== normalized.fcmToken ||
            raw.fid !== normalized.fid ||
            raw.updateNoti !== normalized.updateNoti
        ) {
            await writeSettings(normalized);
        }

        return normalized;
    }

    async function updateSettings(updates = {}) {
        const current = await getSettings();
        return writeSettings({
            ...current,
            ...updates
        });
    }

    async function setLocation(location) {
        if (typeof location !== "string") {
            throw new TypeError("location 必須為字串");
        }

        location = location.trim();

        if (location && !/^[A-Za-z0-9]+$/.test(location)) {
            throw new TypeError("location 只能包含英文字母或數字");
        }

        return updateSettings({ location });
    }

    async function setAlertLevel(alertLevel) {
        if (!Number.isInteger(alertLevel) || alertLevel < 0 || alertLevel > 7) {
            throw new TypeError("alertLevel 必須為大於或等於 0 的整數");
        }

        return updateSettings({ alertLevel });
    }

    async function setFCMToken(fcmToken) {
        if (typeof fcmToken !== "string") {
            throw new TypeError("fcmToken 必須為字串");
        }

        return updateSettings({
            fcmToken: fcmToken.trim()
        });
    }

    async function setFID(fid) {
        if (typeof fid !== "string") {
            throw new TypeError("fid 必須為字串");
        }

        return updateSettings({
            fid: fid.trim()
        });
    }

    async function setUpdateNoti(updateNoti) {
        if (typeof updateNoti !== "boolean") {
            throw new TypeError("updateNoti 必須為 boolean");
        }

        return updateSettings({
            updateNoti
        });
    }

    async function resetSettings() {
        return writeSettings(DEFAULT_SETTINGS);
    }

    async function clearSettings() {
        const db = await init();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            transaction.objectStore(STORE_NAME).delete(SETTINGS_KEY);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    return Object.freeze({
        init,
        getSettings,
        updateSettings,
        setLocation,
        setAlertLevel,
        setFCMToken,
        setFID,
        setUpdateNoti,
        resetSettings,
        clearSettings,
        DEFAULT_SETTINGS
    });
})();
