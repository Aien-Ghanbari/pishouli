export default {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (request.method === "GET" && path === "/api/health") {
        return json({ ok: true, service: "pishouli-backend" }, 200, corsHeaders);
      }

      if (request.method === "GET" && path === "/") {
        return json({
          ok: true,
          service: "pishouli-backend",
          message: "Worker is running. Use /api/health for quick check.",
          endpoints: [
            "/api/health",
            "/api/bootstrap",
            "/api/letters",
            "/api/settings",
            "/api/events/click",
            "/api/visits/start",
            "/api/visits/end",
            "/api/admin/logs"
          ]
        }, 200, corsHeaders);
      }

      if (request.method === "GET" && path === "/api") {
        return json({
          ok: true,
          service: "pishouli-backend",
          health: "/api/health"
        }, 200, corsHeaders);
      }

      if (request.method === "POST" && path === "/api/setup-room") {
        return await setupRoom(request, env, corsHeaders);
      }

      if (request.method === "GET" && path === "/api/bootstrap") {
        return await bootstrapRoom(request, env, corsHeaders);
      }

      if (request.method === "GET" && path === "/api/letters") {
        return await getLetters(request, env, corsHeaders);
      }

      if (request.method === "POST" && path === "/api/letters") {
        return await createLetter(request, env, corsHeaders);
      }

      if (request.method === "PUT" && path === "/api/letters/sync") {
        return await syncLetters(request, env, corsHeaders);
      }

      if (request.method === "PUT" && path.startsWith("/api/letters/")) {
        return await updateLetter(request, env, corsHeaders);
      }

      if (request.method === "DELETE" && path.startsWith("/api/letters/")) {
        return await deleteLetter(request, env, corsHeaders);
      }

      if (request.method === "GET" && path === "/api/settings") {
        return await getSettings(request, env, corsHeaders);
      }

      if (request.method === "PUT" && path === "/api/settings") {
        return await updateSettings(request, env, corsHeaders);
      }

      if (request.method === "POST" && path === "/api/events/click") {
        return await logVaultClick(request, env, corsHeaders);
      }

      if (request.method === "POST" && path === "/api/visits/start") {
        return await visitStart(request, env, corsHeaders);
      }

      if (request.method === "POST" && path === "/api/visits/end") {
        return await visitEnd(request, env, corsHeaders);
      }

      if (request.method === "GET" && path === "/api/admin/logs") {
        return await getAdminLogs(request, env, corsHeaders);
      }

      return json({ error: "Not found" }, 404, corsHeaders);
    } catch (error) {
      return json({ error: "Server error", details: String(error?.message || error) }, 500, corsHeaders);
    }
  }
};

function buildCorsHeaders(request, env) {
  const origin = request.headers.get("origin") || "*";
  const allowed = parseAllowedOrigins(env.ALLOWED_ORIGINS || "*");
  const allowOrigin = allowed.includes("*") ? "*" : (allowed.includes(origin) ? origin : allowed[0] || "*");

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Room-Id, X-Room-Key, X-Admin-Key, X-Bootstrap-Key",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8"
  };
}

function parseAllowedOrigins(raw) {
  return String(raw)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), { status, headers });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function sanitizeRoomId(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, 64);
}

function sanitizeMood(raw) {
  const allowed = ["laugh", "sad", "hopeless", "period", "naughty"];
  const value = String(raw || "").trim().toLowerCase();
  return allowed.includes(value) ? value : "";
}

function ensureString(value, maxLen = 5000) {
  return String(value || "").trim().slice(0, maxLen);
}

function randomId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function getRoom(env, roomId) {
  const result = await env.DB.prepare(
    "SELECT room_id, room_key_hash, admin_key_hash FROM rooms WHERE room_id = ?1"
  ).bind(roomId).first();

  return result || null;
}

async function requireRoomAuth(request, env) {
  const roomId = sanitizeRoomId(request.headers.get("x-room-id"));
  const roomKey = ensureString(request.headers.get("x-room-key"), 200);

  if (!roomId || !roomKey) {
    return { ok: false, status: 401, error: "Missing room auth headers." };
  }

  const room = await getRoom(env, roomId);
  if (!room) {
    return { ok: false, status: 404, error: "Room not found." };
  }

  const roomKeyHash = await sha256Hex(roomKey);
  if (roomKeyHash !== room.room_key_hash) {
    return { ok: false, status: 403, error: "Invalid room key." };
  }

  return { ok: true, roomId, room };
}

async function requireAdminAuth(request, env) {
  const roomAuth = await requireRoomAuth(request, env);
  if (!roomAuth.ok) {
    return roomAuth;
  }

  const adminKey = ensureString(request.headers.get("x-admin-key"), 200);
  if (!adminKey) {
    return { ok: false, status: 401, error: "Missing admin key." };
  }

  const adminKeyHash = await sha256Hex(adminKey);
  if (adminKeyHash !== roomAuth.room.admin_key_hash) {
    return { ok: false, status: 403, error: "Invalid admin key." };
  }

  return roomAuth;
}

async function setupRoom(request, env, corsHeaders) {
  const bootstrapKey = ensureString(request.headers.get("x-bootstrap-key"), 200);
  const expectedBootstrap = ensureString(env.BOOTSTRAP_KEY, 200);

  if (!expectedBootstrap || bootstrapKey !== expectedBootstrap) {
    return json({ error: "Setup disabled or invalid bootstrap key." }, 403, corsHeaders);
  }

  const body = await readJson(request);
  const roomId = sanitizeRoomId(body?.roomId);
  const roomKey = ensureString(body?.roomKey, 200);
  const adminKey = ensureString(body?.adminKey, 200);

  if (!roomId || !roomKey || !adminKey) {
    return json({ error: "roomId, roomKey and adminKey are required." }, 400, corsHeaders);
  }

  const exists = await getRoom(env, roomId);
  if (exists) {
    return json({ error: "Room already exists." }, 409, corsHeaders);
  }

  await env.DB.prepare(
    "INSERT INTO rooms (room_id, room_key_hash, admin_key_hash, created_at) VALUES (?1, ?2, ?3, ?4)"
  ).bind(roomId, await sha256Hex(roomKey), await sha256Hex(adminKey), nowIso()).run();

  await env.DB.prepare(
    "INSERT INTO settings (room_id, single_read_mode, updated_at) VALUES (?1, 0, ?2)"
  ).bind(roomId, nowIso()).run();

  return json({ ok: true, roomId }, 201, corsHeaders);
}

async function bootstrapRoom(request, env, corsHeaders) {
  const auth = await requireRoomAuth(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status, corsHeaders);
  }

  const [lettersRes, settings] = await Promise.all([
    env.DB.prepare(
      "SELECT id, mood, title_fa, body_fa, title_en, body_en, created_at, updated_at FROM letters WHERE room_id = ?1 AND deleted = 0 ORDER BY created_at ASC"
    ).bind(auth.roomId).all(),
    env.DB.prepare(
      "SELECT single_read_mode FROM settings WHERE room_id = ?1"
    ).bind(auth.roomId).first()
  ]);

  return json({
    roomId: auth.roomId,
    settings: {
      singleReadMode: !!(settings && settings.single_read_mode)
    },
    letters: lettersRes.results || []
  }, 200, corsHeaders);
}

async function getLetters(request, env, corsHeaders) {
  const auth = await requireRoomAuth(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status, corsHeaders);
  }

  const rows = await env.DB.prepare(
    "SELECT id, mood, title_fa, body_fa, title_en, body_en, created_at, updated_at FROM letters WHERE room_id = ?1 AND deleted = 0 ORDER BY created_at ASC"
  ).bind(auth.roomId).all();

  return json({ letters: rows.results || [] }, 200, corsHeaders);
}

async function createLetter(request, env, corsHeaders) {
  const auth = await requireAdminAuth(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status, corsHeaders);
  }

  const body = await readJson(request);
  const mood = sanitizeMood(body?.mood);
  const titleFa = ensureString(body?.titleFa, 200);
  const bodyFa = ensureString(body?.bodyFa, 5000);
  const titleEn = ensureString(body?.titleEn, 200);
  const bodyEn = ensureString(body?.bodyEn, 5000);

  if (!mood || !titleFa || !bodyFa || !titleEn || !bodyEn) {
    return json({ error: "mood, titleFa, bodyFa, titleEn, bodyEn are required." }, 400, corsHeaders);
  }

  const id = randomId(mood);
  const now = nowIso();

  await env.DB.prepare(
    "INSERT INTO letters (id, room_id, mood, title_fa, body_fa, title_en, body_en, created_at, updated_at, deleted) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 0)"
  ).bind(id, auth.roomId, mood, titleFa, bodyFa, titleEn, bodyEn, now, now).run();

  return json({ ok: true, id }, 201, corsHeaders);
}

async function syncLetters(request, env, corsHeaders) {
  const auth = await requireAdminAuth(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status, corsHeaders);
  }

  const body = await readJson(request);
  const letters = Array.isArray(body?.letters) ? body.letters : null;
  if (!letters) {
    return json({ error: "letters array is required." }, 400, corsHeaders);
  }

  const normalized = [];
  for (const item of letters) {
    const mood = sanitizeMood(item?.mood);
    const id = ensureString(item?.id, 100);
    const titleFa = ensureString(item?.titleFa, 200);
    const bodyFa = ensureString(item?.bodyFa, 5000);
    const titleEn = ensureString(item?.titleEn, 200);
    const bodyEn = ensureString(item?.bodyEn, 5000);

    if (!mood || !id || !titleFa || !bodyFa || !titleEn || !bodyEn) {
      continue;
    }

    normalized.push({ id, mood, titleFa, bodyFa, titleEn, bodyEn });
  }

  const now = nowIso();

  await env.DB.prepare(
    "UPDATE letters SET deleted = 1, updated_at = ?1 WHERE room_id = ?2"
  ).bind(now, auth.roomId).run();

  for (const letter of normalized) {
    await env.DB.prepare(
      "INSERT INTO letters (id, room_id, mood, title_fa, body_fa, title_en, body_en, created_at, updated_at, deleted) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 0) ON CONFLICT(id) DO UPDATE SET room_id=excluded.room_id, mood=excluded.mood, title_fa=excluded.title_fa, body_fa=excluded.body_fa, title_en=excluded.title_en, body_en=excluded.body_en, updated_at=excluded.updated_at, deleted=0"
    ).bind(
      letter.id,
      auth.roomId,
      letter.mood,
      letter.titleFa,
      letter.bodyFa,
      letter.titleEn,
      letter.bodyEn,
      now,
      now
    ).run();
  }

  return json({ ok: true, count: normalized.length }, 200, corsHeaders);
}

async function updateLetter(request, env, corsHeaders) {
  const auth = await requireAdminAuth(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status, corsHeaders);
  }

  const url = new URL(request.url);
  const id = ensureString(url.pathname.split("/").pop(), 100);
  if (!id) {
    return json({ error: "Letter id is required." }, 400, corsHeaders);
  }

  const body = await readJson(request);
  const mood = sanitizeMood(body?.mood);
  const titleFa = ensureString(body?.titleFa, 200);
  const bodyFa = ensureString(body?.bodyFa, 5000);
  const titleEn = ensureString(body?.titleEn, 200);
  const bodyEn = ensureString(body?.bodyEn, 5000);

  if (!mood || !titleFa || !bodyFa || !titleEn || !bodyEn) {
    return json({ error: "mood, titleFa, bodyFa, titleEn, bodyEn are required." }, 400, corsHeaders);
  }

  const result = await env.DB.prepare(
    "UPDATE letters SET mood = ?1, title_fa = ?2, body_fa = ?3, title_en = ?4, body_en = ?5, updated_at = ?6 WHERE id = ?7 AND room_id = ?8 AND deleted = 0"
  ).bind(mood, titleFa, bodyFa, titleEn, bodyEn, nowIso(), id, auth.roomId).run();

  if (!result.success || (result.meta && result.meta.changes === 0)) {
    return json({ error: "Letter not found." }, 404, corsHeaders);
  }

  return json({ ok: true }, 200, corsHeaders);
}

async function deleteLetter(request, env, corsHeaders) {
  const auth = await requireAdminAuth(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status, corsHeaders);
  }

  const url = new URL(request.url);
  const id = ensureString(url.pathname.split("/").pop(), 100);
  if (!id) {
    return json({ error: "Letter id is required." }, 400, corsHeaders);
  }

  const result = await env.DB.prepare(
    "UPDATE letters SET deleted = 1, updated_at = ?1 WHERE id = ?2 AND room_id = ?3 AND deleted = 0"
  ).bind(nowIso(), id, auth.roomId).run();

  if (!result.success || (result.meta && result.meta.changes === 0)) {
    return json({ error: "Letter not found." }, 404, corsHeaders);
  }

  return json({ ok: true }, 200, corsHeaders);
}

async function getSettings(request, env, corsHeaders) {
  const auth = await requireRoomAuth(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status, corsHeaders);
  }

  const row = await env.DB.prepare(
    "SELECT single_read_mode FROM settings WHERE room_id = ?1"
  ).bind(auth.roomId).first();

  return json({ singleReadMode: !!(row && row.single_read_mode) }, 200, corsHeaders);
}

async function updateSettings(request, env, corsHeaders) {
  const auth = await requireAdminAuth(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status, corsHeaders);
  }

  const body = await readJson(request);
  const singleReadMode = !!body?.singleReadMode;

  await env.DB.prepare(
    "INSERT INTO settings (room_id, single_read_mode, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(room_id) DO UPDATE SET single_read_mode = excluded.single_read_mode, updated_at = excluded.updated_at"
  ).bind(auth.roomId, singleReadMode ? 1 : 0, nowIso()).run();

  return json({ ok: true, singleReadMode }, 200, corsHeaders);
}

async function logVaultClick(request, env, corsHeaders) {
  const auth = await requireRoomAuth(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status, corsHeaders);
  }

  const body = await readJson(request);
  const vault = sanitizeMood(body?.vault);
  const visitorId = ensureString(body?.visitorId, 100) || "anon";
  const at = ensureString(body?.at, 40) || nowIso();

  if (!vault) {
    return json({ error: "vault is required." }, 400, corsHeaders);
  }

  await env.DB.prepare(
    "INSERT INTO events (room_id, event_type, vault, visitor_id, at, meta_json) VALUES (?1, 'vault_click', ?2, ?3, ?4, ?5)"
  ).bind(auth.roomId, vault, visitorId, at, "{}").run();

  return json({ ok: true }, 201, corsHeaders);
}

async function visitStart(request, env, corsHeaders) {
  const auth = await requireRoomAuth(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status, corsHeaders);
  }

  const body = await readJson(request);
  const visitorId = ensureString(body?.visitorId, 100) || "anon";
  const enteredAt = ensureString(body?.enteredAt, 40) || nowIso();
  const visitId = randomId("visit");

  await env.DB.prepare(
    "INSERT INTO visits (id, room_id, visitor_id, entered_at, exited_at, vaults_json) VALUES (?1, ?2, ?3, ?4, NULL, '[]')"
  ).bind(visitId, auth.roomId, visitorId, enteredAt).run();

  return json({ ok: true, visitId }, 201, corsHeaders);
}

async function visitEnd(request, env, corsHeaders) {
  const auth = await requireRoomAuth(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status, corsHeaders);
  }

  const body = await readJson(request);
  const visitId = ensureString(body?.visitId, 100);
  const exitedAt = ensureString(body?.exitedAt, 40) || nowIso();
  const vaults = Array.isArray(body?.vaults)
    ? body.vaults.map((item) => sanitizeMood(item)).filter(Boolean)
    : [];

  if (!visitId) {
    return json({ error: "visitId is required." }, 400, corsHeaders);
  }

  const result = await env.DB.prepare(
    "UPDATE visits SET exited_at = ?1, vaults_json = ?2 WHERE id = ?3 AND room_id = ?4"
  ).bind(exitedAt, JSON.stringify(vaults), visitId, auth.roomId).run();

  if (!result.success || (result.meta && result.meta.changes === 0)) {
    return json({ error: "Visit not found." }, 404, corsHeaders);
  }

  return json({ ok: true }, 200, corsHeaders);
}

async function getAdminLogs(request, env, corsHeaders) {
  const auth = await requireAdminAuth(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status, corsHeaders);
  }

  const [eventsRes, visitsRes] = await Promise.all([
    env.DB.prepare(
      "SELECT id, vault, visitor_id, at FROM events WHERE room_id = ?1 AND event_type = 'vault_click' ORDER BY at DESC LIMIT 100"
    ).bind(auth.roomId).all(),
    env.DB.prepare(
      "SELECT id, visitor_id, entered_at, exited_at, vaults_json FROM visits WHERE room_id = ?1 ORDER BY entered_at DESC LIMIT 5"
    ).bind(auth.roomId).all()
  ]);

  const visits = (visitsRes.results || []).map((item) => ({
    ...item,
    vaults: safeJsonParseArray(item.vaults_json)
  }));

  return json({
    clickLogs: eventsRes.results || [],
    lastVisits: visits
  }, 200, corsHeaders);
}

function safeJsonParseArray(raw) {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
