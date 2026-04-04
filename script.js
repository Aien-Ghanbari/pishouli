const translations = {
    fa: {
        pageTitle: "پیشولی",
        introCaption: "داستان کوچولوی ما شروع می‌شه...",
        enterNow: "ورود",
        vaultTitle: "صندوقچه بهاری ما",
        vaultSubtitle: "نامه های حال خوب اینجاست...",
        vaultSubtitleSingle: "هر نامه فقط یک بار خوانده می شود...",
        vaultSubtitleReplay: "فعلا می توانی نامه ها را چند بار بخوانی.",
        catLaugh: "وقتی نیاز داری بخندی",
        catSad: "وقتی غمگین هستی",
        catHopeless: "وقتی ناامید هستی",
        catPeriod: "وقتی پریود هستی",
        catNaughty: "وقتی شیطون میشی",
        themeAuto: "خودکار",
        themeMorning: "صبح",
        themeEvening: "شب",
        themeHintAuto: "تم خودکار",
        themeHintMorning: "تم صبحگاهی",
        themeHintEvening: "تم شبانه",
        soundOn: "صدا روشن",
        soundOff: "بی صدا",
        soundHintOn: "صدا روشن است",
        soundHintOff: "صدا خاموش است",
        emptyTitle: "صندوقچه خالی است",
        emptyBody: "این جیب فعلا در حال استراحت است. بعدا دوباره سر بزن.",
        emptyBodyLaugh: "این گوشه خنده فعلا در حال استراحت است.",
        emptyBodySad: "این گوشه غم فعلا آرام گرفته است.",
        emptyBodyHopeless: "این گوشه امید فعلا آرام نفس می کشد.",
        emptyBodyPeriod: "این گوشه مراقبت فعلا در حال استراحت است.",
        emptyBodyNaughty: "این گوشه بازیگوشی فعلا آرام شده است."
    },
    en: {
        pageTitle: "Pishouli",
        introCaption: "Our tiny story is about to begin...",
        enterNow: "Enter",
        vaultTitle: "Our Spring Vault",
        vaultSubtitle: "Your mood letters live here...",
        vaultSubtitleSingle: "Each letter can be read only once...",
        vaultSubtitleReplay: "For now, you can reread letters anytime.",
        catLaugh: "When you need a laugh",
        catSad: "When you feel sad",
        catHopeless: "When you feel hopeless",
        catPeriod: "When you are on your period",
        catNaughty: "When you get naughty",
        themeAuto: "Auto",
        themeMorning: "Morning",
        themeEvening: "Evening",
        themeHintAuto: "Automatic theme",
        themeHintMorning: "Morning theme",
        themeHintEvening: "Evening theme",
        soundOn: "Sound On",
        soundOff: "Muted",
        soundHintOn: "Sound is on",
        soundHintOff: "Sound is muted",
        emptyTitle: "Vault is empty",
        emptyBody: "This pocket is resting for now. Come back later for a new note.",
        emptyBodyLaugh: "This laughter pocket is resting for now.",
        emptyBodySad: "This rainy pocket is resting for now.",
        emptyBodyHopeless: "This hope pocket is quietly resting for now.",
        emptyBodyPeriod: "This comfort pocket is resting for now.",
        emptyBodyNaughty: "This playful pocket is resting for now."
    }
};

const DEFAULT_MESSAGES = {
    fa: {
        laugh: [
            { id: "laugh_1", title: "خنده اول", body: "این اولین جوکیه که برات نوشتم..." },
            { id: "laugh_2", title: "خنده دوم", body: "یادت میاد اون روز چقدر خندیدیم؟..." }
        ],
        sad: [
            { id: "sad_1", title: "وقتی غمگینی (۱)", body: "نامه اول برای روزهای سخت..." }
        ],
        hopeless: [
            { id: "hope_1", title: "امیدواری (۱)", body: "ما از پسش برمیایم..." }
        ],
        period: [
            { id: "period_1", title: "روز اول", body: "چای نبات یادت نره..." }
        ],
        naughty: [
            { id: "naughty_1", title: "نامه شیطنت اول", body: "متن شما..." }
        ]
    },
    en: {
        laugh: [
            { id: "laugh_1", title: "First Laugh", body: "Here is the first joke I wrote for you..." },
            { id: "laugh_2", title: "Second Laugh", body: "Remember that day we laughed so much?..." }
        ],
        sad: [
            { id: "sad_1", title: "For Sad Days (1)", body: "The first letter for hard days..." }
        ],
        hopeless: [
            { id: "hope_1", title: "Hope Note (1)", body: "We will get through this together..." }
        ],
        period: [
            { id: "period_1", title: "Day One", body: "Do not forget warm tea and rest..." }
        ],
        naughty: [
            { id: "naughty_1", title: "Naughty Letter One", body: "Your text goes here..." }
        ]
    }
};

let currentLang = "fa";
let introFinished = false;
let isOpeningLetter = false;
let themeMode = "auto";
let themeRefreshTimer = null;
let soundEnabled = true;
let singleReadMode = false;
let messages = JSON.parse(JSON.stringify(DEFAULT_MESSAGES));
let isAdminMode = false;
let audioContext = null;
let swRegistration = null;
let waitingServiceWorker = null;
let currentBuildVersion = null;
let updateCheckTimer = null;
let meowTimer = null;
let swListenersBound = false;
let meowAudioPool = [];
const BUILD_VERSION_ENDPOINT = "./build-version.json";
const LETTERS_STORAGE_KEY = "lettersData";
const READ_MODE_STORAGE_KEY = "singleReadMode";
const ACTIVITY_LOGS_STORAGE_KEY = "activityLogs";
const SEEN_LETTERS_STORAGE_KEY = "seenLetters";
const READ_LETTERS_STORAGE_KEY = "readLetters";
const LETTER_VISIBILITY_STORAGE_KEY = "letterVisibility";
const VISIT_LOGS_STORAGE_KEY = "visitLogs";
const ACTIVE_VISIT_ID_KEY = "activeVisitId";
const REMOTE_VISIT_ID_KEY = "remoteVisitId";
const VISITOR_ID_KEY = "visitorId";
const REMOTE_SYNC_CONFIG_KEY = "remoteSyncConfig";
// Keep this private between you two. Admin mode opens only when URL has admin=1 and this key.
const ADMIN_ACCESS_TOKEN = "spring-cat-2026";
const MEOW_SOUND_FILES = [
    "./assets/sounds/meow1.mp3",
    "./assets/sounds/meow2.mp3",
    "./assets/sounds/meow3.mp3",
    "./assets/sounds/meow4.mp3",
    "./assets/sounds/meow5.mp3"
];

const remoteSync = {
    connected: false,
    workerUrl: "",
    roomId: "",
    roomKey: "",
    adminKey: "",
    applyingRemote: false,
    pollTimer: null,
    clickLogs: [],
    lastVisits: []
};

const catSpriteConfig = {
    cols: 6,
    rows: 6,
    totalFrames: 31,
    spriteSources: [
        "cat-sprite.png",
        "CatSprite.png",
        "PerfectCatSpriteSheet.png",
        "PerfectCatSpriteSheet(1).png"
    ],
    states: {
        idle: { start: 0, end: 5, fps: 5 },
        walk: { start: 6, end: 13, fps: 8 },
        run: { start: 14, end: 21, fps: 12 },
        jump: { start: 22, end: 30, fps: 10 }
    }
};

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function normalizeMessagesShape(payload) {
    const normalized = deepClone(DEFAULT_MESSAGES);
    if (!payload || typeof payload !== "object") {
        return normalized;
    }

    ["fa", "en"].forEach((lang) => {
        if (!payload[lang] || typeof payload[lang] !== "object") {
            return;
        }

        Object.keys(normalized[lang]).forEach((category) => {
            const bucket = payload[lang][category];
            if (!Array.isArray(bucket)) {
                return;
            }

            normalized[lang][category] = bucket
                .filter((item) => item && typeof item === "object")
                .map((item) => ({
                    id: String(item.id || `${category}_${Date.now()}_${Math.floor(Math.random() * 1000)}`),
                    title: String(item.title || ""),
                    body: String(item.body || "")
                }))
                .filter((item) => item.title.trim().length > 0 && item.body.trim().length > 0);
        });
    });

    return normalized;
}

function sanitizeRoomId(rawValue) {
    return String(rawValue || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .slice(0, 64);
}

function sanitizeMood(rawValue) {
    const allowed = ["laugh", "sad", "hopeless", "period", "naughty"];
    const mood = String(rawValue || "").trim().toLowerCase();
    return allowed.includes(mood) ? mood : "";
}

function getRemoteSyncConfig() {
    const saved = localStorage.getItem(REMOTE_SYNC_CONFIG_KEY);
    if (!saved) {
        return null;
    }

    try {
        const parsed = JSON.parse(saved);
        if (!parsed || typeof parsed !== "object") {
            return null;
        }

        const roomId = sanitizeRoomId(parsed.roomId);
        if (!roomId) {
            return null;
        }

        return {
            workerUrl: normalizeWorkerUrl(parsed.workerUrl || ""),
            roomId,
            roomKey: String(parsed.roomKey || "").trim(),
            adminKey: String(parsed.adminKey || "").trim()
        };
    } catch (error) {
        return null;
    }
}

function getSyncConfigFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const roomId = sanitizeRoomId(params.get("syncRoom") || "");
    const workerUrl = normalizeWorkerUrl(params.get("syncWorker") || "");
    const roomKey = (params.get("syncKey") || "").trim();
    const adminKey = (params.get("syncAdmin") || "").trim();

    if (!roomId || !workerUrl || !roomKey) {
        return null;
    }

    return {
        roomId,
        workerUrl,
        roomKey,
        adminKey
    };
}

function normalizeWorkerUrl(rawUrl) {
    const value = String(rawUrl || "").trim();
    if (!value) {
        return "";
    }

    try {
        const normalized = new URL(value);
        return `${normalized.origin}`;
    } catch (error) {
        return "";
    }
}

function saveRemoteSyncConfig(config) {
    localStorage.setItem(REMOTE_SYNC_CONFIG_KEY, JSON.stringify(config));
}

function clearRemoteSyncConfig() {
    localStorage.removeItem(REMOTE_SYNC_CONFIG_KEY);
}

function updateSyncStatus(message, isError = false) {
    const status = document.getElementById("sync-status");
    if (!status) {
        return;
    }

    status.textContent = message;
    status.classList.toggle("error", !!isError);
}

async function pingWorkerHealth(workerUrl) {
    const response = await fetch(`${workerUrl}/api/health`, {
        method: "GET",
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Worker health check failed.");
    }

    const payload = await response.json();
    if (!payload || payload.ok !== true) {
        throw new Error("Worker returned an unexpected health response.");
    }
}

function getSyncHeaders(requireAdmin = false) {
    const headers = {
        "Content-Type": "application/json",
        "X-Room-Id": remoteSync.roomId,
        "X-Room-Key": remoteSync.roomKey
    };

    if (requireAdmin && remoteSync.adminKey) {
        headers["X-Admin-Key"] = remoteSync.adminKey;
    }

    return headers;
}

async function syncApi(path, method = "GET", payload = null, requireAdmin = false) {
    if (!remoteSync.connected || !remoteSync.workerUrl) {
        return null;
    }

    const options = {
        method,
        headers: getSyncHeaders(requireAdmin)
    };

    if (payload !== null) {
        options.body = JSON.stringify(payload);
    }

    const response = await fetch(`${remoteSync.workerUrl}${path}`, options);
    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }

    if (!response.ok) {
        const message = data && data.error ? data.error : `HTTP ${response.status}`;
        throw new Error(message);
    }

    return data;
}

function disconnectRemoteSync(options = { clearConfig: false }) {
    if (remoteSync.pollTimer) {
        clearInterval(remoteSync.pollTimer);
    }

    remoteSync.connected = false;
    remoteSync.workerUrl = "";
    remoteSync.roomId = "";
    remoteSync.roomKey = "";
    remoteSync.adminKey = "";
    remoteSync.pollTimer = null;
    remoteSync.clickLogs = [];
    remoteSync.lastVisits = [];

    if (options.clearConfig) {
        clearRemoteSyncConfig();
    }

    updateSyncStatus("Disconnected. Enter Worker URL and keys to connect.");
}

function convertBackendLettersToMessages(rows) {
    const normalized = deepClone(DEFAULT_MESSAGES);
    const visibility = {};
    if (!Array.isArray(rows)) {
        saveLetterVisibilityMap(visibility);
        return normalized;
    }

    Object.keys(normalized.fa).forEach((category) => {
        normalized.fa[category] = [];
        normalized.en[category] = [];
    });

    rows.forEach((row) => {
        const mood = sanitizeMood(row.mood);
        if (!mood) {
            return;
        }

        const id = String(row.id || `${mood}_${Date.now()}_${Math.floor(Math.random() * 1000)}`);
        if (row.is_visible === 0 || row.is_visible === false) {
            visibility[id] = false;
        }
        normalized.fa[mood].push({
            id,
            title: String(row.title_fa || ""),
            body: String(row.body_fa || "")
        });
        normalized.en[mood].push({
            id,
            title: String(row.title_en || ""),
            body: String(row.body_en || "")
        });
    });

    saveLetterVisibilityMap(visibility);

    return normalized;
}

function convertMessagesToBackendLetters(payload) {
    const categories = ["laugh", "sad", "hopeless", "period", "naughty"];
    const pairs = [];

    categories.forEach((category) => {
        const faBucket = (payload.fa && Array.isArray(payload.fa[category])) ? payload.fa[category] : [];
        const enBucket = (payload.en && Array.isArray(payload.en[category])) ? payload.en[category] : [];
        const map = new Map();

        faBucket.forEach((item) => {
            map.set(item.id, {
                id: item.id,
                mood: category,
                titleFa: item.title || "",
                bodyFa: item.body || "",
                titleEn: "",
                bodyEn: "",
                isVisible: isLetterVisible(item.id)
            });
        });

        enBucket.forEach((item) => {
            const existing = map.get(item.id) || {
                id: item.id,
                mood: category,
                titleFa: "",
                bodyFa: "",
                titleEn: "",
                bodyEn: "",
                isVisible: isLetterVisible(item.id)
            };
            existing.titleEn = item.title || "";
            existing.bodyEn = item.body || "";
            map.set(item.id, existing);
        });

        map.forEach((record) => {
            if (!record.titleFa || !record.bodyFa || !record.titleEn || !record.bodyEn) {
                return;
            }
            pairs.push(record);
        });
    });

    return pairs;
}

async function pullRemoteSnapshot() {
    const snapshot = await syncApi("/api/bootstrap", "GET", null, false);
    if (!snapshot) {
        return;
    }

    remoteSync.applyingRemote = true;
    messages = convertBackendLettersToMessages(snapshot.letters || []);
    saveLettersData(false);

    if (snapshot.settings && typeof snapshot.settings.singleReadMode !== "undefined") {
        saveReadModeSetting(!!snapshot.settings.singleReadMode, false);
    }

    remoteSync.applyingRemote = false;
    applyTranslations();
}

async function pullRemoteAdminLogs() {
    if (!remoteSync.adminKey) {
        throw new Error("Missing Admin Key for admin logs.");
    }

    const payload = await syncApi("/api/admin/logs", "GET", null, true);
    remoteSync.clickLogs = Array.isArray(payload?.clickLogs) ? payload.clickLogs : [];
    remoteSync.lastVisits = Array.isArray(payload?.lastVisits) ? payload.lastVisits : [];
}

async function pushLettersSnapshot() {
    if (!remoteSync.connected || remoteSync.applyingRemote || !remoteSync.adminKey) {
        return;
    }

    try {
        await syncApi("/api/letters/sync", "PUT", {
            letters: convertMessagesToBackendLetters(messages)
        }, true);
        updateSyncStatus(`Connected to ${remoteSync.roomId} (read/write).`);
    } catch (error) {
        console.warn("Failed to sync letters:", error);
        updateSyncStatus(`Save failed: ${error.message}. Check Admin Key and reconnect.`, true);
    }
}

async function pushReadMode() {
    if (!remoteSync.connected || remoteSync.applyingRemote || !remoteSync.adminKey) {
        return;
    }

    try {
        await syncApi("/api/settings", "PUT", { singleReadMode }, true);
        updateSyncStatus(`Connected to ${remoteSync.roomId} (read/write).`);
    } catch (error) {
        console.warn("Failed to sync read mode:", error);
        updateSyncStatus(`Read mode sync failed: ${error.message}.`, true);
    }
}

function writeRemote(path, payload) {
    if (!remoteSync.connected || remoteSync.applyingRemote) {
        return;
    }

    if (path === "letters") {
        pushLettersSnapshot();
        return;
    }

    if (path === "singleReadMode") {
        pushReadMode();
        return;
    }

    // These are kept locally for now. Server logs/visits use dedicated endpoints.
    void payload;
}

async function connectRemoteSync(config, persistConfig = true) {
    const roomId = sanitizeRoomId(config.roomId);
    const workerUrl = normalizeWorkerUrl(config.workerUrl || "");
    const roomKey = String(config.roomKey || "").trim();
    const adminKey = String(config.adminKey || "").trim();

    if (!roomId) {
        updateSyncStatus("Room Code is required.", true);
        return false;
    }

    if (!workerUrl || !roomKey) {
        updateSyncStatus("Worker URL and Room Key are required.", true);
        return false;
    }

    if (isAdminMode && !adminKey) {
        updateSyncStatus("Admin Key is required in admin mode.", true);
        return false;
    }

    disconnectRemoteSync();

    updateSyncStatus("Checking Worker health...");

    try {
        await pingWorkerHealth(workerUrl);
    } catch (error) {
        updateSyncStatus(`Worker check failed: ${error.message}`, true);
        return false;
    }

    remoteSync.workerUrl = workerUrl;
    remoteSync.roomId = roomId;
    remoteSync.roomKey = roomKey;
    remoteSync.adminKey = adminKey;
    remoteSync.connected = true;

    if (persistConfig) {
        saveRemoteSyncConfig({
            workerUrl,
            roomId,
            roomKey,
            adminKey
        });
    }

    updateSyncStatus("Connecting to backend room...");

    try {
        await pullRemoteSnapshot();
        if (isAdminMode) {
            // Validate admin key early so add/edit/delete won't silently fail.
            await pullRemoteAdminLogs();
        }
    } catch (error) {
        disconnectRemoteSync();
        updateSyncStatus(`Connection failed: ${error.message}`, true);
        return false;
    }

    remoteSync.pollTimer = setInterval(async () => {
        if (!remoteSync.connected || remoteSync.applyingRemote) {
            return;
        }

        try {
            await pullRemoteSnapshot();
            if (isAdminMode) {
                await pullRemoteAdminLogs();
                refreshAdminView();
            }
        } catch (error) {
            // keep polling; transient failures are expected on mobile networks
        }
    }, 15000);

    const modeText = isAdminMode ? "read/write" : "read-only";
    updateSyncStatus(`Connected to ${roomId} (${modeText}).`);
    return true;
}

function loadLettersData() {
    const saved = localStorage.getItem(LETTERS_STORAGE_KEY);
    if (!saved) {
        messages = deepClone(DEFAULT_MESSAGES);
        return;
    }

    try {
        messages = normalizeMessagesShape(JSON.parse(saved));
        if (!hasAnyLetters(messages)) {
            messages = deepClone(DEFAULT_MESSAGES);
        }
    } catch (error) {
        messages = deepClone(DEFAULT_MESSAGES);
    }
}

function hasAnyLetters(payload) {
    if (!payload || typeof payload !== "object") {
        return false;
    }

    return ["fa", "en"].some((lang) =>
        Object.keys((payload[lang] || {})).some((category) => {
            const bucket = payload[lang][category];
            return Array.isArray(bucket) && bucket.length > 0;
        })
    );
}

function getAdminAccessKeyFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("key") || "").trim();
}

function canOpenAdminMode() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") !== "1") {
        return false;
    }

    return getAdminAccessKeyFromUrl() === ADMIN_ACCESS_TOKEN;
}

function saveLettersData() {
    localStorage.setItem(LETTERS_STORAGE_KEY, JSON.stringify(messages));
    writeRemote("letters", messages);
}

function loadReadModeSetting() {
    const saved = localStorage.getItem(READ_MODE_STORAGE_KEY);
    singleReadMode = saved === "1";
}

function saveReadModeSetting(value, shouldSync = true) {
    singleReadMode = !!value;
    localStorage.setItem(READ_MODE_STORAGE_KEY, singleReadMode ? "1" : "0");
    if (shouldSync) {
        writeRemote("singleReadMode", singleReadMode);
    }
}

function getSeenLetters() {
    const saved = localStorage.getItem(SEEN_LETTERS_STORAGE_KEY);
    if (!saved) {
        return [];
    }

    try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function markAsSeen(id) {
    const seen = getSeenLetters();
    if (!seen.includes(id)) {
        seen.push(id);
        localStorage.setItem(SEEN_LETTERS_STORAGE_KEY, JSON.stringify(seen));
        writeRemote("seenLetters", seen);
    }
}

function getActivityLogs() {
    const saved = localStorage.getItem(ACTIVITY_LOGS_STORAGE_KEY);
    if (!saved) {
        return [];
    }

    try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function appendActivityLog(entry) {
    const logs = getActivityLogs();
    logs.push({
        id: `${Date.now()}_${Math.floor(Math.random() * 100000)}`,
        at: new Date().toISOString(),
        ...entry
    });

    const trimmed = logs.slice(-500);
    localStorage.setItem(ACTIVITY_LOGS_STORAGE_KEY, JSON.stringify(trimmed));
    writeRemote("activityLogs", trimmed);

    if (remoteSync.connected && entry && entry.type === "vault-click") {
        syncApi("/api/events/click", "POST", {
            vault: entry.category,
            visitorId: getVisitorId(),
            at: new Date().toISOString()
        }, false).catch(() => {
            // Keep local log even if network fails.
        });
    }
}

function getVisitLogs() {
    const saved = localStorage.getItem(VISIT_LOGS_STORAGE_KEY);
    if (!saved) {
        return [];
    }

    try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function saveVisitLogs(logs) {
    const trimmed = logs.slice(-100);
    localStorage.setItem(VISIT_LOGS_STORAGE_KEY, JSON.stringify(trimmed));
    writeRemote("visitLogs", trimmed);
}

function getActiveVisitId() {
    return sessionStorage.getItem(ACTIVE_VISIT_ID_KEY);
}

function getRemoteVisitId() {
    return sessionStorage.getItem(REMOTE_VISIT_ID_KEY);
}

function setRemoteVisitId(value) {
    if (!value) {
        sessionStorage.removeItem(REMOTE_VISIT_ID_KEY);
        return;
    }

    sessionStorage.setItem(REMOTE_VISIT_ID_KEY, value);
}

function getVisitorId() {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
        visitorId = `visitor_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
}

function setActiveVisitId(value) {
    if (!value) {
        sessionStorage.removeItem(ACTIVE_VISIT_ID_KEY);
        return;
    }

    sessionStorage.setItem(ACTIVE_VISIT_ID_KEY, value);
}

function beginVisitSession() {
    if (isAdminMode) {
        return;
    }

    let visitId = getActiveVisitId();
    const logs = getVisitLogs();

    if (!visitId) {
        visitId = `visit_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        logs.push({
            id: visitId,
            enteredAt: new Date().toISOString(),
            exitedAt: null,
            vaults: []
        });
        saveVisitLogs(logs);
        setActiveVisitId(visitId);

        if (remoteSync.connected) {
            syncApi("/api/visits/start", "POST", {
                visitorId: getVisitorId(),
                enteredAt: new Date().toISOString()
            }, false)
                .then((result) => {
                    if (result && result.visitId) {
                        setRemoteVisitId(result.visitId);
                    }
                })
                .catch(() => {
                    // local fallback already exists
                });
        }

        return;
    }

    const existing = logs.find((item) => item && item.id === visitId);
    if (!existing) {
        logs.push({
            id: visitId,
            enteredAt: new Date().toISOString(),
            exitedAt: null,
            vaults: []
        });
        saveVisitLogs(logs);
    }
}

function touchVisitVault(category) {
    if (isAdminMode) {
        return;
    }

    const visitId = getActiveVisitId();
    if (!visitId) {
        return;
    }

    const logs = getVisitLogs();
    const active = logs.find((item) => item && item.id === visitId);
    if (!active) {
        return;
    }

    if (!Array.isArray(active.vaults)) {
        active.vaults = [];
    }

    if (!active.vaults.includes(category)) {
        active.vaults.push(category);
        saveVisitLogs(logs);
    }
}

function endVisitSession() {
    if (isAdminMode) {
        return;
    }

    const visitId = getActiveVisitId();
    if (!visitId) {
        return;
    }

    const logs = getVisitLogs();
    const active = logs.find((item) => item && item.id === visitId);
    if (!active) {
        setActiveVisitId("");
        return;
    }

    active.exitedAt = new Date().toISOString();
    saveVisitLogs(logs);

    const remoteVisitId = getRemoteVisitId();
    if (remoteSync.connected && remoteVisitId) {
        syncApi("/api/visits/end", "POST", {
            visitId: remoteVisitId,
            exitedAt: active.exitedAt,
            vaults: Array.isArray(active.vaults) ? active.vaults : []
        }, false).catch(() => {
            // local fallback already exists
        });
    }

    setRemoteVisitId("");
}

function getTranslation(key) {
    return translations[currentLang][key] || "";
}

function applyTranslations() {
    const title = getTranslation("pageTitle");
    document.title = title;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.getAttribute("data-i18n");
        element.textContent = getTranslation(key);
    });

    const subtitleElement = document.querySelector('[data-i18n="vaultSubtitle"]');
    if (subtitleElement) {
        const subtitleKey = singleReadMode ? "vaultSubtitleSingle" : "vaultSubtitleReplay";
        subtitleElement.textContent = getTranslation(subtitleKey);
    }

    const updateBtn = document.getElementById("update-btn");
    if (updateBtn) {
        updateBtn.setAttribute("aria-label", currentLang === "fa" ? "به روزرسانی" : "Update");
        updateBtn.title = currentLang === "fa" ? "به روزرسانی" : "Update";
    }

    updateThemeButtonLabel();
    updateSoundButtonLabel();
}

function getMoodEmptyKey(category) {
    const moodKeyMap = {
        laugh: "emptyBodyLaugh",
        sad: "emptyBodySad",
        hopeless: "emptyBodyHopeless",
        period: "emptyBodyPeriod",
        naughty: "emptyBodyNaughty"
    };

    return moodKeyMap[category] || "emptyBody";
}

function getAutoThemeByTime() {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 17 ? "morning" : "evening";
}

function applyTheme(mode) {
    const resolvedTheme = mode === "auto" ? getAutoThemeByTime() : mode;
    document.body.classList.remove("theme-morning", "theme-evening");
    document.body.classList.add(`theme-${resolvedTheme}`);
}

function updateThemeButtonLabel() {
    const themeBtn = document.getElementById("theme-btn");
    if (!themeBtn) {
        return;
    }

    const themeLabelMap = {
        auto: getTranslation("themeAuto"),
        morning: getTranslation("themeMorning"),
        evening: getTranslation("themeEvening")
    };

    const themeHintMap = {
        auto: getTranslation("themeHintAuto"),
        morning: getTranslation("themeHintMorning"),
        evening: getTranslation("themeHintEvening")
    };

    themeBtn.textContent = themeLabelMap[themeMode] || themeLabelMap.auto;
    const hintText = themeHintMap[themeMode] || themeHintMap.auto;
    themeBtn.title = hintText;
    themeBtn.setAttribute("aria-label", hintText);
}

function updateSoundButtonLabel() {
    const soundBtn = document.getElementById("sound-btn");
    if (!soundBtn) {
        return;
    }

    const labelKey = soundEnabled ? "soundOn" : "soundOff";
    const hintKey = soundEnabled ? "soundHintOn" : "soundHintOff";
    const icon = soundEnabled ? "🔊" : "🔇";
    soundBtn.textContent = `${icon} ${getTranslation(labelKey)}`;
    soundBtn.title = getTranslation(hintKey);
    soundBtn.setAttribute("aria-label", getTranslation(hintKey));
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem("soundEnabled", soundEnabled ? "1" : "0");
    updateSoundButtonLabel();

    if (soundEnabled) {
        scheduleNextMeow();
    } else {
        clearScheduledMeow();
    }
}

function ensureAudioContext() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            return null;
        }
        audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    return audioContext;
}

function scheduleTone(ctx, opts) {
    const now = ctx.currentTime;
    const start = now + (opts.offset || 0);
    const duration = opts.duration || 0.2;
    const attack = opts.attack || 0.01;
    const release = opts.release || 0.12;
    const gainValue = opts.gain || 0.05;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = opts.type || "sine";
    oscillator.frequency.setValueAtTime(opts.frequency || 440, start);
    if (opts.endFrequency) {
        oscillator.frequency.linearRampToValueAtTime(opts.endFrequency, start + duration);
    }

    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.linearRampToValueAtTime(gainValue, start + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration + release);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(start);
    oscillator.stop(start + duration + release + 0.02);
}

function playMoodSound(category) {
    if (!soundEnabled) {
        return;
    }

    const ctx = ensureAudioContext();
    if (!ctx) {
        return;
    }

    if (category === "laugh") {
        scheduleTone(ctx, { type: "triangle", frequency: 830, duration: 0.08, gain: 0.045 });
        scheduleTone(ctx, { type: "triangle", frequency: 1040, duration: 0.11, gain: 0.04, offset: 0.09 });
        return;
    }

    if (category === "sad") {
        scheduleTone(ctx, { type: "sine", frequency: 760, endFrequency: 430, duration: 0.22, gain: 0.035, attack: 0.005, release: 0.18 });
        return;
    }

    if (category === "period") {
        scheduleTone(ctx, { type: "sine", frequency: 142, duration: 0.12, gain: 0.055, release: 0.16 });
        scheduleTone(ctx, { type: "sine", frequency: 118, duration: 0.13, gain: 0.05, offset: 0.16, release: 0.17 });
        return;
    }

    if (category === "naughty") {
        scheduleTone(ctx, { type: "square", frequency: 540, duration: 0.07, gain: 0.04, release: 0.08 });
        scheduleTone(ctx, { type: "square", frequency: 680, duration: 0.07, gain: 0.038, offset: 0.07, release: 0.08 });
        scheduleTone(ctx, { type: "square", frequency: 620, duration: 0.09, gain: 0.036, offset: 0.14, release: 0.1 });
        return;
    }

    // hopeless
    scheduleTone(ctx, { type: "sine", frequency: 330, duration: 0.16, gain: 0.038, release: 0.14 });
    scheduleTone(ctx, { type: "sine", frequency: 415, duration: 0.2, gain: 0.033, offset: 0.11, release: 0.16 });
}

function playCatMeow() {
    if (!soundEnabled || !introFinished) {
        return;
    }

    if (playRandomMeowFromFiles()) {
        return;
    }

    playSynthMeow();
}

function playSynthMeow() {
    if (!soundEnabled || !introFinished) {
        return;
    }

    const ctx = ensureAudioContext();
    if (!ctx) {
        return;
    }

    // A gentle two-syllable meow using slightly sliding frequencies.
    scheduleTone(ctx, { type: "triangle", frequency: 620, endFrequency: 500, duration: 0.12, gain: 0.04, attack: 0.01, release: 0.12 });
    scheduleTone(ctx, { type: "triangle", frequency: 540, endFrequency: 700, duration: 0.18, gain: 0.034, attack: 0.01, release: 0.15, offset: 0.13 });
}

function initMeowAudioPool() {
    if (!Array.isArray(MEOW_SOUND_FILES) || MEOW_SOUND_FILES.length === 0) {
        meowAudioPool = [];
        return;
    }

    meowAudioPool = MEOW_SOUND_FILES.map((src) => {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.volume = 0.35;
        return audio;
    });
}

function playRandomMeowFromFiles() {
    if (!meowAudioPool.length) {
        return false;
    }

    const candidates = meowAudioPool.slice();
    while (candidates.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const template = candidates.splice(randomIndex, 1)[0];
        try {
            const clip = template.cloneNode();
            clip.currentTime = 0;
            clip.volume = 0.35;
            const playPromise = clip.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {
                    // If browser blocks playback, synthetic meow remains as fallback next time.
                });
            }
            return true;
        } catch (error) {
            // Try another clip if this one fails.
        }
    }

    return false;
}

function clearScheduledMeow() {
    if (meowTimer) {
        clearTimeout(meowTimer);
        meowTimer = null;
    }
}

function scheduleNextMeow() {
    clearScheduledMeow();

    if (!soundEnabled || !introFinished) {
        return;
    }

    const delay = 18000 + Math.random() * 32000;
    meowTimer = setTimeout(() => {
        playCatMeow();
        scheduleNextMeow();
    }, delay);
}

function setThemeMode(mode) {
    if (!["auto", "morning", "evening"].includes(mode)) {
        return;
    }

    themeMode = mode;
    localStorage.setItem("themeMode", mode);
    applyTheme(mode);
    updateThemeButtonLabel();
}

function cycleThemeMode() {
    const order = ["auto", "morning", "evening"];
    const currentIndex = order.indexOf(themeMode);
    const nextMode = order[(currentIndex + 1) % order.length];
    setThemeMode(nextMode);
}

function setLanguage(lang) {
    if (!translations[lang]) {
        return;
    }

    currentLang = lang;
    localStorage.setItem("appLanguage", lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.body.classList.remove("lang-fa", "lang-en");
    document.body.classList.add(lang === "fa" ? "lang-fa" : "lang-en");

    applyTranslations();
}

// --- Memory Logic ---
function getReadLetters() {
    const saved = localStorage.getItem(READ_LETTERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

function markAsRead(id) {
    const readLetters = getReadLetters();
    if (!readLetters.includes(id)) {
        readLetters.push(id);
        localStorage.setItem(READ_LETTERS_STORAGE_KEY, JSON.stringify(readLetters));
        writeRemote("readLetters", readLetters);
    }
}

function getLetterVisibilityMap() {
    const saved = localStorage.getItem(LETTER_VISIBILITY_STORAGE_KEY);
    if (!saved) {
        return {};
    }

    try {
        const parsed = JSON.parse(saved);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
        return {};
    }
}

function saveLetterVisibilityMap(map) {
    localStorage.setItem(LETTER_VISIBILITY_STORAGE_KEY, JSON.stringify(map));
}

function isLetterVisible(id) {
    const visibility = getLetterVisibilityMap();
    return visibility[id] !== false;
}

function setLetterVisibility(id, isVisible) {
    const visibility = getLetterVisibilityMap();
    if (isVisible) {
        delete visibility[id];
    } else {
        visibility[id] = false;
    }
    saveLetterVisibilityMap(visibility);
    writeRemote("letters", messages);
}

function clearLetterVisibility(id) {
    const visibility = getLetterVisibilityMap();
    if (Object.prototype.hasOwnProperty.call(visibility, id)) {
        delete visibility[id];
        saveLetterVisibilityMap(visibility);
        writeRemote("letters", messages);
    }
}

function showLetterModal(category) {
    const modal = document.getElementById("modal");
    const modalContent = modal.querySelector(".modal-content");
    const title = document.getElementById("letter-title");
    const body = document.getElementById("letter-body");
    const emptyIllustration = document.getElementById("empty-illustration");

    const readLetters = getReadLetters();
    const allCategoryLetters = messages[currentLang][category] || [];
    const visibleLetters = allCategoryLetters.filter((letter) => isLetterVisible(letter.id));
    const unreadLetters = visibleLetters.filter((letter) => !readLetters.includes(letter.id));
    let currentLetter = null;
    let isEmpty = false;

    const moodTheme = category === "hopeless" ? "hope" : category;

    if (singleReadMode) {
        if (unreadLetters.length > 0) {
            currentLetter = unreadLetters[0];
            markAsRead(currentLetter.id);
        } else {
            isEmpty = true;
        }
    } else if (visibleLetters.length > 0) {
        const randomIndex = Math.floor(Math.random() * visibleLetters.length);
        currentLetter = visibleLetters[randomIndex];
    } else {
        isEmpty = true;
    }

    if (currentLetter) {
        markAsSeen(currentLetter.id);
        appendActivityLog({
            type: "letter-opened",
            category,
            letterId: currentLetter.id,
            language: currentLang
        });
        title.innerText = currentLetter.title;
        body.innerText = currentLetter.body;
        body.classList.add("has-letter");
        body.classList.remove("is-empty-copy");

        if (singleReadMode) {
            setLetterVisibility(currentLetter.id, false);
        }
    } else {
        title.innerText = getTranslation("emptyTitle");
        body.innerText = getTranslation(getMoodEmptyKey(category));
        body.classList.remove("has-letter");
        body.classList.add("is-empty-copy");
    }

    modalContent.classList.remove("theme-laugh", "theme-sad", "theme-hope", "theme-period", "theme-naughty", "theme-empty", "is-empty");
    modalContent.classList.add(`theme-${moodTheme}`);
    modalContent.setAttribute("data-mood", moodTheme);

    if (isEmpty) {
        modalContent.classList.add("is-empty");
        if (emptyIllustration) {
            emptyIllustration.classList.remove("is-hidden");
        }
    } else if (emptyIllustration) {
        emptyIllustration.classList.add("is-hidden");
    }

    playMoodSound(category);
    modal.classList.remove("hidden");
}

function openLetter(category, envelopeElement) {
    if (isOpeningLetter) {
        return;
    }

    appendActivityLog({
        type: "vault-click",
        category,
        language: currentLang
    });
    touchVisitVault(category);

    isOpeningLetter = true;

    if (envelopeElement) {
        envelopeElement.classList.add("is-opening");
        setTimeout(() => {
            envelopeElement.classList.remove("is-opening");
            showLetterModal(category);
            isOpeningLetter = false;
        }, 360);
        return;
    }

    showLetterModal(category);
    isOpeningLetter = false;
}

function closeLetter() {
    const modal = document.getElementById("modal");
    const modalContent = modal.querySelector(".modal-content");
    const body = document.getElementById("letter-body");
    const emptyIllustration = document.getElementById("empty-illustration");
    modal.classList.add("hidden");
    modalContent.classList.remove("theme-laugh", "theme-sad", "theme-hope", "theme-period", "theme-naughty", "theme-empty", "is-empty");
    modalContent.removeAttribute("data-mood");
    body.classList.remove("has-letter", "is-empty-copy");
    if (emptyIllustration) {
        emptyIllustration.classList.add("is-hidden");
    }
}

function initModalControls() {
    const modal = document.getElementById("modal");
    const modalContent = modal ? modal.querySelector(".modal-content") : null;
    const closeBtn = document.getElementById("close-letter-btn");

    if (closeBtn) {
        closeBtn.addEventListener("click", closeLetter);
    }

    if (modal) {
        modal.addEventListener("click", (event) => {
            // Close only when clicking the dark backdrop, not the content panel.
            if (event.target === modal) {
                closeLetter();
            }
        });
    }

    if (modalContent) {
        modalContent.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal && !modal.classList.contains("hidden")) {
            closeLetter();
        }
    });
}

function reloadApp() {
    if (waitingServiceWorker) {
        waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
        return;
    }

    window.location.reload();
}

function showUpdateButton() {
    const banner = document.getElementById("update-banner");
    if (banner) {
        banner.classList.remove("hidden");
    }
}

function hideUpdateButton() {
    const banner = document.getElementById("update-banner");
    if (banner) {
        banner.classList.add("hidden");
    }
}

function bindWaitingWorker(registration) {
    if (!registration || !registration.waiting) {
        return;
    }

    waitingServiceWorker = registration.waiting;
    showUpdateButton();
}

async function fetchBuildVersion() {
    try {
        const response = await fetch(`${BUILD_VERSION_ENDPOINT}?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) {
            return null;
        }

        const payload = await response.json();
        if (!payload || typeof payload.version !== "string") {
            return null;
        }

        return payload.version;
    } catch (error) {
        console.warn("Build version check failed:", error);
        return null;
    }
}

async function registerServiceWorkerWithVersion(version) {
    if (!("serviceWorker" in navigator)) {
        return;
    }

    const swUrl = version
        ? `./service-worker.js?v=${encodeURIComponent(version)}`
        : "./service-worker.js";

    try {
        const registration = await navigator.serviceWorker.register(swUrl);
        swRegistration = registration;

        bindWaitingWorker(registration);

        registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) {
                return;
            }

            newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    waitingServiceWorker = newWorker;
                    showUpdateButton();
                }
            });
        });

        if (!swListenersBound) {
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                waitingServiceWorker = null;
                hideUpdateButton();
                window.location.reload();
            });

            swListenersBound = true;
        }
    } catch (error) {
        console.error("Service Worker registration failed:", error);
    }
}

async function checkForBuildUpdates() {
    const latestVersion = await fetchBuildVersion();
    if (!latestVersion || latestVersion === currentBuildVersion) {
        if (swRegistration) {
            swRegistration.update();
        }
        return;
    }

    currentBuildVersion = latestVersion;
    await registerServiceWorkerWithVersion(latestVersion);
    if (swRegistration) {
        swRegistration.update();
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getMoodLabel(category) {
    const labels = {
        laugh: "Laugh",
        sad: "Sad",
        hopeless: "Hopeless",
        period: "Period",
        naughty: "Naughty"
    };
    return labels[category] || category;
}

function formatLogTime(isoDate) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
        return isoDate;
    }
    return date.toLocaleString();
}

function getAllLettersFlat() {
    const list = [];
    ["fa", "en"].forEach((lang) => {
        Object.keys(messages[lang] || {}).forEach((category) => {
            (messages[lang][category] || []).forEach((letter) => {
                list.push({ lang, category, ...letter });
            });
        });
    });
    return list;
}

function getLetterRecordsByCategory() {
    const categories = ["laugh", "sad", "hopeless", "period", "naughty"];
    const recordsByCategory = {};

    categories.forEach((category) => {
        const bucketMap = new Map();
        const faBucket = (messages.fa && Array.isArray(messages.fa[category])) ? messages.fa[category] : [];
        const enBucket = (messages.en && Array.isArray(messages.en[category])) ? messages.en[category] : [];

        faBucket.forEach((letter) => {
            const existing = bucketMap.get(letter.id) || { id: letter.id, category, fa: null, en: null };
            existing.fa = letter;
            bucketMap.set(letter.id, existing);
        });

        enBucket.forEach((letter) => {
            const existing = bucketMap.get(letter.id) || { id: letter.id, category, fa: null, en: null };
            existing.en = letter;
            bucketMap.set(letter.id, existing);
        });

        recordsByCategory[category] = Array.from(bucketMap.values()).sort((a, b) => a.id.localeCompare(b.id));
    });

    return recordsByCategory;
}

function getLettersByCategoryForLang(lang) {
    const result = {};
    ["laugh", "sad", "hopeless", "period", "naughty"].forEach((category) => {
        result[category] = (messages[lang] && Array.isArray(messages[lang][category]))
            ? messages[lang][category]
            : [];
    });
    return result;
}

function findLetterPairById(id, category) {
    const faBucket = (messages.fa && messages.fa[category]) || [];
    const enBucket = (messages.en && messages.en[category]) || [];
    return {
        fa: faBucket.find((item) => item.id === id) || null,
        en: enBucket.find((item) => item.id === id) || null
    };
}

function renderAdminLetters() {
    const container = document.getElementById("letters-admin-list");
    if (!container) {
        return;
    }

    const displayLangSelect = document.getElementById("admin-display-lang");
    const displayLang = displayLangSelect ? displayLangSelect.value : "fa";
    const seenSet = new Set(getSeenLetters());
    const groups = getLetterRecordsByCategory();
    const total = Object.values(groups).reduce((acc, list) => acc + list.length, 0);
    if (total === 0) {
        container.innerHTML = '<p class="admin-empty">No letters yet.</p>';
        return;
    }

    const sections = ["laugh", "sad", "hopeless", "period", "naughty"].map((category) => {
        const bucket = groups[category] || [];
        if (!bucket.length) {
            return `
                <section class="admin-mood-group">
                    <h4>${escapeHtml(getMoodLabel(category))}</h4>
                    <p class="admin-empty">No letters in this vault yet.</p>
                </section>
            `;
        }

        const rows = bucket.map((record) => {
            const read = seenSet.has(record.id);
            const visible = isLetterVisible(record.id);
            const flagClass = read ? "read" : "not-read";
            const flagText = read ? "read" : "not read";
            const visibilityClass = visible ? "visible" : "hidden";
            const visibilityText = visible ? "visible" : "hidden";
            const visibilityIcon = visible ? "👁" : "🚫";
            const visibilityTitle = visible ? "Hide letter" : "Show letter";
            const title = displayLang === "fa"
                ? ((record.fa && record.fa.title) || (record.en && record.en.title) || "بدون عنوان")
                : ((record.en && record.en.title) || (record.fa && record.fa.title) || "Untitled");

            return `
                <div class="admin-item">
                    <div class="admin-item-main">
                        <small class="admin-read-flag ${flagClass}">${flagText}</small>
                        <small class="admin-visibility-flag ${visibilityClass}">${visibilityText}</small>
                        <strong>${escapeHtml(title)}</strong>
                        <small>ID: ${escapeHtml(record.id)}</small>
                    </div>
                    <div class="admin-actions-inline">
                        <button type="button" class="icon-btn visibility-btn ${visible ? "" : "is-hidden"}" title="${visibilityTitle}" data-action="toggle-visibility" data-category="${category}" data-id="${escapeHtml(record.id)}">${visibilityIcon}</button>
                        <button type="button" class="icon-btn" title="Edit" data-action="edit" data-category="${category}" data-id="${escapeHtml(record.id)}">✏</button>
                        <button type="button" class="icon-btn danger" title="Delete" data-action="delete" data-category="${category}" data-id="${escapeHtml(record.id)}">🗑</button>
                    </div>
                </div>
            `;
        }).join("");

        return `
            <section class="admin-mood-group">
                <h4>${escapeHtml(getMoodLabel(category))}</h4>
                <div class="admin-list">${rows}</div>
            </section>
        `;
    }).join("");

    container.innerHTML = sections;
}

function renderAdminLogs() {
    const container = document.getElementById("vault-logs");
    if (!container) {
        return;
    }

    const remoteLogs = remoteSync.connected && Array.isArray(remoteSync.clickLogs) ? remoteSync.clickLogs : null;
    const logs = remoteLogs || getActivityLogs().slice().reverse();
    if (!logs || logs.length === 0) {
        container.innerHTML = '<p class="admin-empty">No activity yet.</p>';
        return;
    }

    container.innerHTML = logs.map((log) => {
        const isRemote = typeof log.event_type === "string";
        const action = isRemote ? "Vault click" : (log.type === "vault-click" ? "Vault click" : "Letter opened");
        const details = [
            (log.category || log.vault) ? `Mood: ${getMoodLabel(log.category || log.vault)}` : "",
            log.letterId ? `Letter: ${log.letterId}` : "",
            log.language ? `Lang: ${String(log.language).toUpperCase()}` : ""
        ].filter(Boolean).join(" | ");

        return `<div class="admin-log-item"><strong>${action}</strong><small>${escapeHtml(details)}</small><small>${escapeHtml(formatLogTime(log.at || log.entered_at || ""))}</small></div>`;
    }).join("");
}

function renderRecentVisits() {
    const container = document.getElementById("recent-visits");
    if (!container) {
        return;
    }

    const remoteVisits = remoteSync.connected && Array.isArray(remoteSync.lastVisits)
        ? remoteSync.lastVisits.slice(0, 5).map((visit) => ({
            enteredAt: visit.entered_at,
            exitedAt: visit.exited_at,
            vaults: Array.isArray(visit.vaults) ? visit.vaults : []
        }))
        : null;
    const visits = remoteVisits || getVisitLogs().slice().reverse().slice(0, 5);
    if (!visits.length) {
        container.innerHTML = '<p class="admin-empty">No visits yet.</p>';
        return;
    }

    container.innerHTML = visits.map((visit) => {
        const entered = new Date(visit.enteredAt || "");
        const exited = new Date(visit.exitedAt || "");
        const dateText = Number.isNaN(entered.getTime()) ? "-" : entered.toLocaleDateString();
        const visitTime = Number.isNaN(entered.getTime()) ? "-" : entered.toLocaleTimeString();
        const exitTime = Number.isNaN(exited.getTime()) ? "still open" : exited.toLocaleTimeString();
        const vaultNames = Array.isArray(visit.vaults) && visit.vaults.length
            ? visit.vaults.map((mood) => getMoodLabel(mood)).join(", ")
            : "none";

        return `<div class="admin-log-item"><strong>${escapeHtml(dateText)}</strong><small>Visit time: ${escapeHtml(visitTime)}</small><small>Exit time: ${escapeHtml(exitTime)}</small><small>Vaults: ${escapeHtml(vaultNames)}</small></div>`;
    }).join("");
}

function buildShareSetupLink(config) {
    const base = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams({
        syncWorker: config.workerUrl,
        syncRoom: config.roomId,
        syncKey: config.roomKey
    });

    return `${base}?${params.toString()}`;
}

async function shareSetupLink(link) {
    if (navigator.share) {
        try {
            await navigator.share({
                title: "Pishouli setup",
                text: "Open this link once on partner phone to connect backend sync.",
                url: link
            });
            return;
        } catch (error) {
            // fall through to copy prompt
        }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        alert("Partner setup link copied.");
        return;
    }

    window.prompt("Copy this setup link:", link);
}

function refreshAdminView() {
    const readToggle = document.getElementById("single-read-toggle");
    if (readToggle) {
        readToggle.checked = singleReadMode;
    }

    if (remoteSync.connected) {
        const modeText = isAdminMode ? "read/write" : "read-only";
        updateSyncStatus(`Connected to ${remoteSync.roomId} (${modeText}).`);
    }

    renderAdminLetters();
    renderAdminLogs();
    renderRecentVisits();
}

function resetLetterForm() {
    const form = document.getElementById("letter-form");
    const editId = document.getElementById("letter-edit-id");
    if (form) {
        form.reset();
    }
    if (editId) {
        editId.value = "";
    }

    const saveBtn = document.getElementById("save-letter-btn");
    if (saveBtn) {
        saveBtn.textContent = "Save Letter";
    }
}

function initAdminMode() {
    const adminPanel = document.getElementById("admin-panel");
    if (!adminPanel) {
        return;
    }

    const splash = document.getElementById("splash-screen");
    const vault = document.getElementById("vault");
    const modal = document.getElementById("modal");
    const cat = document.getElementById("pixel-cat");
    const controls = document.querySelector(".top-center-controls");

    if (splash) {
        splash.style.display = "none";
    }
    if (vault) {
        vault.style.display = "none";
    }
    if (modal) {
        modal.style.display = "none";
    }
    if (cat) {
        cat.style.display = "none";
    }
    if (controls) {
        controls.style.display = "none";
    }

    adminPanel.classList.remove("hidden");
    document.body.classList.add("admin-mode");

    const readToggle = document.getElementById("single-read-toggle");
    const letterForm = document.getElementById("letter-form");
    const lettersList = document.getElementById("letters-admin-list");
    const clearLogsBtn = document.getElementById("clear-logs-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    const syncForm = document.getElementById("sync-form");
    const disconnectSyncBtn = document.getElementById("disconnect-sync-btn");
    const shareSetupBtn = document.getElementById("share-setup-btn");
    const displayLangSelect = document.getElementById("admin-display-lang");

    if (displayLangSelect) {
        displayLangSelect.value = currentLang;
        displayLangSelect.addEventListener("change", renderAdminLetters);
    }

    if (readToggle) {
        readToggle.checked = singleReadMode;
        readToggle.addEventListener("change", () => {
            saveReadModeSetting(readToggle.checked);
            applyTranslations();
            refreshAdminView();
        });
    }

    if (letterForm) {
        letterForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const editIdInput = document.getElementById("letter-edit-id");
            const categoryInput = document.getElementById("letter-category");
            const titleFaInput = document.getElementById("letter-title-fa-input");
            const bodyFaInput = document.getElementById("letter-body-fa-input");
            const titleEnInput = document.getElementById("letter-title-en-input");
            const bodyEnInput = document.getElementById("letter-body-en-input");

            const category = categoryInput.value;
            const titleFa = titleFaInput.value.trim();
            const bodyFa = bodyFaInput.value.trim();
            const titleEn = titleEnInput.value.trim();
            const bodyEn = bodyEnInput.value.trim();

            if (!titleFa || !bodyFa || !titleEn || !bodyEn) {
                return;
            }

            if (!messages.fa || !messages.en || !Array.isArray(messages.fa[category]) || !Array.isArray(messages.en[category])) {
                return;
            }

            const editingId = (editIdInput.value || "").trim();
            const letterId = editingId || `${category}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

            ["fa", "en"].forEach((code) => {
                Object.keys(messages[code]).forEach((mood) => {
                    messages[code][mood] = messages[code][mood].filter((item) => item.id !== letterId);
                });
            });

            messages.fa[category].push({ id: letterId, title: titleFa, body: bodyFa });
            messages.en[category].push({ id: letterId, title: titleEn, body: bodyEn });

            setLetterVisibility(letterId, true);

            saveLettersData();
            resetLetterForm();
            refreshAdminView();
        });
    }

    if (lettersList) {
        lettersList.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            const action = target.dataset.action;
            const category = target.dataset.category;
            const id = target.dataset.id;
            if (!action || !category || !id) {
                return;
            }

            if (action === "delete") {
                const confirmed = window.confirm("Delete this letter in both languages?");
                if (!confirmed) {
                    return;
                }

                ["fa", "en"].forEach((code) => {
                    Object.keys(messages[code]).forEach((mood) => {
                        messages[code][mood] = messages[code][mood].filter((item) => item.id !== id);
                    });
                });

                clearLetterVisibility(id);

                saveLettersData();
                refreshAdminView();
                return;
            }

            if (action === "toggle-visibility") {
                setLetterVisibility(id, !isLetterVisible(id));
                refreshAdminView();
                return;
            }

            if (action === "edit") {
                const pair = findLetterPairById(id, category);
                if (!pair.fa && !pair.en) {
                    return;
                }

                document.getElementById("letter-edit-id").value = id;
                document.getElementById("letter-category").value = category;
                document.getElementById("letter-title-fa-input").value = pair.fa ? pair.fa.title : "";
                document.getElementById("letter-body-fa-input").value = pair.fa ? pair.fa.body : "";
                document.getElementById("letter-title-en-input").value = pair.en ? pair.en.title : "";
                document.getElementById("letter-body-en-input").value = pair.en ? pair.en.body : "";
                const saveBtn = document.getElementById("save-letter-btn");
                if (saveBtn) {
                    saveBtn.textContent = "Update Letter";
                }
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", () => {
            resetLetterForm();
        });
    }

    if (clearLogsBtn) {
        clearLogsBtn.addEventListener("click", () => {
            localStorage.setItem(ACTIVITY_LOGS_STORAGE_KEY, JSON.stringify([]));
            writeRemote("activityLogs", []);
            refreshAdminView();
        });
    }

    if (shareSetupBtn) {
        shareSetupBtn.addEventListener("click", async () => {
            const config = getRemoteSyncConfig();
            if (!config) {
                alert("Connect backend first, then share partner setup link.");
                return;
            }

            const link = buildShareSetupLink(config);
            await shareSetupLink(link);
        });
    }

    const savedSyncConfig = getRemoteSyncConfig();
    if (savedSyncConfig) {
        const roomInput = document.getElementById("sync-room");
        const workerInput = document.getElementById("sync-worker-url");
        const roomKeyInput = document.getElementById("sync-room-key");
        const adminKeyInput = document.getElementById("sync-admin-key");

        if (roomInput) roomInput.value = savedSyncConfig.roomId;
        if (workerInput) workerInput.value = savedSyncConfig.workerUrl;
        if (roomKeyInput) roomKeyInput.value = savedSyncConfig.roomKey;
        if (adminKeyInput) adminKeyInput.value = savedSyncConfig.adminKey || "";
    }

    if (syncForm) {
        syncForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const connectBtn = document.getElementById("connect-sync-btn");
            if (connectBtn) {
                connectBtn.disabled = true;
                connectBtn.textContent = "Connecting...";
            }

            const config = {
                workerUrl: document.getElementById("sync-worker-url").value.trim(),
                roomId: document.getElementById("sync-room").value,
                roomKey: document.getElementById("sync-room-key").value.trim(),
                adminKey: document.getElementById("sync-admin-key").value.trim()
            };

            const connected = await connectRemoteSync(config, true);
            if (connected) {
                refreshAdminView();
            }

            if (connectBtn) {
                connectBtn.disabled = false;
                connectBtn.textContent = "Connect Backend";
            }
        });
    }

    if (disconnectSyncBtn) {
        disconnectSyncBtn.addEventListener("click", () => {
            disconnectRemoteSync({ clearConfig: true });
            refreshAdminView();
        });
    }

    refreshAdminView();
}

// --- Cat AI Logic ---
function startCatAI() {
    const cat = document.getElementById("pixel-cat");
    let currentX = window.innerWidth * 0.1; // Start near the left
    let currentY = window.innerHeight - 80; // Start near the bottom

    let frameWidth = 32;
    let frameHeight = 32;
    let activeState = "idle";
    let stateTimer = null;
    let currentFrame = catSpriteConfig.states.idle.start;
    const behaviorStates = ["idle", "walk", "run", "jump"];
    const movementSpeeds = {
        walk: 55,
        run: 95,
        jump: 80
    };

    cat.style.display = "block";

    function applyFrame(frameIndex) {
        const clampedFrame = Math.max(0, Math.min(frameIndex, catSpriteConfig.totalFrames - 1));
        const column = clampedFrame % catSpriteConfig.cols;
        const row = Math.floor(clampedFrame / catSpriteConfig.cols);
        cat.style.backgroundPosition = `${-column * frameWidth}px ${-row * frameHeight}px`;
    }

    function playState(stateName) {
        const state = catSpriteConfig.states[stateName];
        if (!state) {
            return;
        }

        if (stateTimer) {
            clearInterval(stateTimer);
            stateTimer = null;
        }

        activeState = stateName;
        currentFrame = state.start;
        applyFrame(currentFrame);

        const interval = 1000 / state.fps;
        stateTimer = setInterval(() => {
            currentFrame += 1;
            if (currentFrame > state.end) {
                currentFrame = state.start;
            }
            applyFrame(currentFrame);
        }, interval);
    }

    function initSpriteMetrics(image) {
        if (image.naturalWidth >= catSpriteConfig.cols && image.naturalHeight >= catSpriteConfig.rows) {
            frameWidth = Math.floor(image.naturalWidth / catSpriteConfig.cols);
            frameHeight = Math.floor(image.naturalHeight / catSpriteConfig.rows);
        }

        cat.style.width = `${frameWidth}px`;
        cat.style.height = `${frameHeight}px`;
        cat.style.backgroundSize = `${frameWidth * catSpriteConfig.cols}px ${frameHeight * catSpriteConfig.rows}px`;
    }

    function trySpriteSource(index) {
        if (index >= catSpriteConfig.spriteSources.length) {
            cat.classList.add("cat-fallback");
            moveCat();
            return;
        }

        const spriteProbe = new Image();
        const source = catSpriteConfig.spriteSources[index];

        spriteProbe.onload = () => {
            cat.classList.remove("cat-fallback");
            cat.style.backgroundImage = `url('${source}')`;
            initSpriteMetrics(spriteProbe);
            playState("idle");
            moveCat();
        };

        spriteProbe.onerror = () => {
            trySpriteSource(index + 1);
        };

        spriteProbe.src = source;
    }

    trySpriteSource(0);

    function moveCat() {
        // 1. Pick the next behavior with equal probability.
        const nextState = behaviorStates[Math.floor(Math.random() * behaviorStates.length)];

        // If idle is selected, stay put for a short random pause.
        if (nextState === "idle") {
            if (!cat.classList.contains("cat-fallback")) {
                playState("idle");
            }

            const idleTime = (Math.random() * 3000) + 1500;
            setTimeout(moveCat, idleTime);
            return;
        }

        // 2. Pick a random destination
        const targetX = Math.random() * Math.max(120, window.innerWidth - frameWidth - 20);
        const targetY = (Math.random() * (window.innerHeight / 2)) + (window.innerHeight / 2) - frameHeight; // Keep it in the lower half of the screen

        // 3. Determine direction to flip the sprite (ScaleX: 1 is normal, -1 is flipped)
        const direction = targetX > currentX ? 1 : -1;
        cat.style.transform = `scaleX(${direction})`;

        // 4. Calculate distance and speed
        const distance = Math.hypot(targetX - currentX, targetY - currentY);
        const speed = movementSpeeds[nextState] || movementSpeeds.walk; // Pixels per second
        const duration = distance / speed;

        // 5. Animate the movement
        cat.style.transition = `left ${duration}s linear, top ${duration}s linear`;
        cat.style.left = `${targetX}px`;
        cat.style.top = `${targetY}px`;

        if (!cat.classList.contains("cat-fallback")) {
            playState(nextState);
        }

        // 6. When it reaches the destination, stop and wait
        setTimeout(() => {
            currentX = targetX;
            currentY = targetY;

            if (!cat.classList.contains("cat-fallback")) {
                playState("idle");
            }
            
            // Wait a random amount of time before choosing the next state.
            const idleTime = (Math.random() * 4000) + 2000;
            setTimeout(moveCat, idleTime);
            
        }, duration * 1000);
    }
}

function finishIntro() {
    if (introFinished) {
        return;
    }

    introFinished = true;

    const splashScreen = document.getElementById("splash-screen");
    const vault = document.getElementById("vault");

    splashScreen.classList.add("fade-out");

    setTimeout(() => {
        splashScreen.style.display = "none";
        vault.classList.remove("hidden");
        startCatAI();
        scheduleNextMeow();
    }, 850);
}

function skipIntro() {
    finishIntro();
}

// --- Intro + app start ---
window.addEventListener("load", () => {
    loadLettersData();
    loadReadModeSetting();

    const savedLang = localStorage.getItem("appLanguage");
    const browserLang = (navigator.language || "fa").toLowerCase();
    const initialLang = savedLang || (browserLang.startsWith("fa") ? "fa" : "en");
    isAdminMode = canOpenAdminMode();

    const savedThemeMode = localStorage.getItem("themeMode");
    const savedSound = localStorage.getItem("soundEnabled");
    themeMode = ["auto", "morning", "evening"].includes(savedThemeMode) ? savedThemeMode : "auto";
    soundEnabled = savedSound === null ? true : savedSound === "1";
    applyTheme(themeMode);
    initMeowAudioPool();

    if (themeRefreshTimer) {
        clearInterval(themeRefreshTimer);
    }

    themeRefreshTimer = setInterval(() => {
        if (themeMode === "auto") {
            applyTheme("auto");
        }
    }, 60000);

    setLanguage(initialLang);
    updateSoundButtonLabel();

    const syncConfigFromUrl = getSyncConfigFromUrl();
    if (syncConfigFromUrl) {
        saveRemoteSyncConfig(syncConfigFromUrl);
    }

    const savedSyncConfig = syncConfigFromUrl || getRemoteSyncConfig();
    if (savedSyncConfig) {
        connectRemoteSync(savedSyncConfig, !syncConfigFromUrl);
    }

    const soundBtn = document.getElementById("sound-btn");
    if (soundBtn) {
        soundBtn.addEventListener("click", toggleSound);
    }

    initModalControls();

    if (isAdminMode) {
        introFinished = true;
        initAdminMode();
    } else {
        const params = new URLSearchParams(window.location.search);
        if (params.get("admin") === "1") {
            // Hide failed admin attempt by dropping query params.
            window.history.replaceState({}, "", window.location.pathname);
        }
        beginVisitSession();
    }

    fetchBuildVersion()
        .then((version) => {
            currentBuildVersion = version;
            return registerServiceWorkerWithVersion(version);
        })
        .then(() => {
            if (updateCheckTimer) {
                clearInterval(updateCheckTimer);
            }

            updateCheckTimer = setInterval(() => {
                checkForBuildUpdates();
            }, 60000);
        });
});

window.addEventListener("beforeunload", () => {
    endVisitSession();
});

// (Keep your existing Service Worker / Update Button logic here)