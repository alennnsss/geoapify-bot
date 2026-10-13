
function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const WINDOW_MS = 10 * 60 * 1000;
const PER_IP = 3;
const TOTAL = 30;
const hits = new Map();
let recent = [];

function tooMany(ip) {
  const now = Date.now();
  recent = recent.filter((time) => now - time < WINDOW_MS);
  const own = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);

  if (own.length >= PER_IP || recent.length >= TOTAL) {
    hits.set(ip, own);
    return true;
  }

  own.push(now);
  recent.push(now);
  hits.set(ip, own);

  if (hits.size > 1000) {
    for (const [key, times] of hits) {
      if (!times.some((time) => now - time < WINDOW_MS)) hits.delete(key);
    }
  }

  return false;
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;

  try {
    const host = new URL(origin).host;
    const allowed = [req.headers.host];
    if (process.env.SITE_URL) allowed.push(new URL(process.env.SITE_URL).host);
    return allowed.includes(host);
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }

  if (!sameOrigin(req)) {
    return res.status(403).json({ ok: false });
  }

  const ip =
    String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (tooMany(ip)) {
    return res.status(429).json({ ok: false });
  }

  const { telegram = "", niche = "", website = "" } = req.body ?? {};

  if (website) {
    return res.status(200).json({ ok: true });
  }

  const username = String(telegram).trim().replace(/^@/, "");

  if (!/^[A-Za-z0-9_]{5,32}$/.test(username)) {
    return res.status(400).json({ ok: false, error: "telegram" });
  }

  const nicheText = String(niche).trim().slice(0, 300);
  const { API_TOKEN, OWNER_ID } = process.env;

  if (!API_TOKEN || !OWNER_ID) {
    console.error("API_TOKEN или OWNER_ID не заданы в Vercel");
    return res.status(500).json({ ok: false });
  }

  const text =
    `Заявка с сайта: @${esc(username)}\n` +
    (nicheText ? `Город / ниша: ${esc(nicheText)}\n` : "") +
    "\nКак только человек напишет боту, придёт заявка с кнопками «Одобрить» / «Отклонить».";

  const response = await fetch(
    `https://api.telegram.org/bot${API_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: OWNER_ID, text, parse_mode: "HTML" }),
    }
  );

  if (!response.ok) {
    console.error("Telegram ответил", response.status);
    return res.status(502).json({ ok: false });
  }

  return res.status(200).json({ ok: true });
}
