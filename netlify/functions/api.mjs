// IBRA STORE — API (Netlify Function v2 + Netlify Blobs)
// كل البيانات محفوظة داخل Netlify نفسه (بدون قاعدة بيانات خارجية)
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export const config = { path: "/api/*" };

/* ---------- التخزين ---------- */
const store = (name) =>
  globalThis.__IBRA_TEST_STORE__
    ? globalThis.__IBRA_TEST_STORE__(name)
    : getStore({ name, consistency: "strong" });

const getJSON = async (s, key, def) => {
  const v = await store(s).get(key, { type: "json" });
  return v ?? def;
};
const setJSON = (s, key, val) => store(s).setJSON(key, val);

/* ---------- أدوات ---------- */
const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });
const err = (msg, status = 400) => json({ error: msg }, status);
const uid = (n = 10) => crypto.randomBytes(n).toString("base64url").slice(0, n);
const clean = (s, max = 5000) => String(s ?? "").trim().slice(0, max);
const now = () => new Date().toISOString();

const hashPass = (pass, salt = crypto.randomBytes(16).toString("hex")) =>
  salt + ":" + crypto.scryptSync(pass, salt, 32).toString("hex");
const checkPass = (pass, stored) => {
  const [salt, h] = String(stored).split(":");
  if (!salt || !h) return false;
  const test = crypto.scryptSync(pass, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(test));
};
const safeEq = (a, b) => {
  const A = Buffer.from(String(a)), B = Buffer.from(String(b));
  return A.length === B.length && crypto.timingSafeEqual(A, B);
};

const PLATFORMS = ["windows", "android", "ios", "mac", "linux", "web", "tv"];

const DEFAULT_SETTINGS = {
  siteName: "IBRA STORE",
  siteSubtitle: "برامج وتطبيقات ابراهيم الخزرجي",
  heroTitle: "برامجي وتطبيقاتي بمكان واحد",
  heroText: "حمّل برامجي المجانية لكل الأجهزة — ويندوز، أندرويد، آيفون وغيرها. روابط متعددة لكل برنامج حتى توصله من أي مكان.",
  developerName: "ابراهيم الخزرجي",
  developerBio: "مطوّر برامج وألعاب عراقي، أصمم وأبرمج أدوات عملية بستايل فخم وواجهات عربية سهلة. كل البرامج هنا مجانية ومن تطويري.",
  telegram: "https://t.me/ibraprogram",
  tiktok: "https://www.tiktok.com/@ibraprogram",
  instagram: "",
  facebook: "",
  phone: "",
  notice: "",
  theme: "gold",
  view: "grid",
  layout: "classic",
};

/* ---------- صلاحيات ---------- */
function isAdmin(req) {
  const pass = process.env.ADMIN_PASSWORD || globalThis.__IBRA_TEST_ADMIN__;
  if (!pass) return false;
  const key = req.headers.get("x-admin-key") || "";
  return key && safeEq(key, pass);
}
async function getUser(req) {
  const tok = req.headers.get("x-user-token");
  if (!tok) return null;
  const sess = await getJSON("users", "session:" + tok, null);
  if (!sess) return null;
  const u = await getJSON("users", "user:" + sess.u, null);
  return u ? { username: u.username, name: u.name } : null;
}

/* ---------- البيانات ---------- */
const loadApps = () => getJSON("data", "apps", []);
const saveApps = (a) => setJSON("data", "apps", a);
const loadReqs = () => getJSON("data", "requests", []);
const saveReqs = (r) => setJSON("data", "requests", r);
const loadReports = () => getJSON("data", "reports", []);
const saveReports = (r) => setJSON("data", "reports", r);
const loadSettings = async () => ({ ...DEFAULT_SETTINGS, ...(await getJSON("data", "settings", {})) });

const slugify = (s) =>
  clean(s, 80).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || uid(6);

function normalizeApp(input, old = {}) {
  const platforms = {};
  for (const p of PLATFORMS) {
    const list = Array.isArray(input.platforms?.[p]) ? input.platforms[p] : [];
    const links = list
      .map((l) => ({
        id: clean(l.id, 20) || uid(8),
        host: clean(l.host, 40),
        label: clean(l.label, 60),
        url: clean(l.url, 2000),
        note: clean(l.note, 120),
      }))
      .filter((l) => /^https?:\/\//i.test(l.url));
    if (links.length) platforms[p] = links;
  }
  const oldClicks = old.clicks || {};
  const platformNotes = {};
  for (const p of PLATFORMS) {
    const n = clean(input.platformNotes?.[p], 400);
    if (n && platforms[p]) platformNotes[p] = n;
  }
  return {
    id: old.id || uid(10),
    slug: slugify(input.slug || input.name || old.slug),
    name: clean(input.name, 120),
    tagline: clean(input.tagline, 200),
    description: clean(input.description, 20000),
    features: (Array.isArray(input.features) ? input.features : []).map((f) => clean(f, 200)).filter(Boolean).slice(0, 40),
    category: clean(input.category, 60),
    version: clean(input.version, 40),
    size: clean(input.size, 40),
    language: clean(input.language, 60),
    requirements: clean(input.requirements, 600),
    changelog: clean(input.changelog, 6000),
    icon: clean(input.icon, 600),
    cover: clean(input.cover, 600),
    screenshots: (Array.isArray(input.screenshots) ? input.screenshots : []).map((s) => clean(s, 600)).filter(Boolean).slice(0, 30),
    video: clean(input.video, 1000),
    keywords: (Array.isArray(input.keywords) ? input.keywords : String(input.keywords || "").split(/[,،\n]/))
      .map((k) => clean(k, 50).replace(/^#/, ""))
      .filter(Boolean)
      .slice(0, 40),
    platforms,
    platformNotes,
    featured: !!input.featured,
    published: input.published !== false,
    createdAt: old.createdAt || now(),
    updatedAt: now(),
    downloads: old.downloads || 0,
    views: old.views || 0,
    clicks: oldClicks,
  };
}

const publicApp = (a) => {
  const { clicks, mirrorLog, ...rest } = a;
  return rest;
};

/* ---------- الطلبات (طلبات التطبيقات) ---------- */
const publicReq = (r, viewer, appsById) => ({
  id: r.id,
  title: r.title,
  details: r.details,
  platform: r.platform,
  author: r.author,
  registered: !!r.username,
  status: r.status,
  reply: r.reply,
  votes: r.votes?.length || 0,
  voted: viewer ? (r.votes || []).includes(viewer) : false,
  createdAt: r.createdAt,
  mine: viewer && r.username ? r.username === viewer.replace(/^u:/, "") : false,
  app: r.appId && appsById && appsById[r.appId]
    ? { slug: appsById[r.appId].slug, name: appsById[r.appId].name, icon: appsById[r.appId].icon || "" }
    : null,
});

/* ---------- الراوتر ---------- */
export default async (req, context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, "").replace(/\/+$/, "") || "/";
  const m = req.method;
  let body = {};
  if (m === "POST" || m === "PUT" || m === "PATCH") {
    try { body = await req.json(); } catch { body = {}; }
  }
  const ip = (context?.ip || req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "0").split(",")[0].trim();

  try {
    /* ===== عام ===== */
    if (path === "/settings" && m === "GET") return json(await loadSettings());

    if (path === "/apps" && m === "GET") {
      const apps = (await loadApps()).filter((a) => a.published).map(publicApp);
      apps.sort((a, b) => (b.featured - a.featured) || b.updatedAt.localeCompare(a.updatedAt));
      return json(apps);
    }

    let mm;
    if ((mm = path.match(/^\/apps\/([^/]+)$/)) && m === "GET") {
      const key = decodeURIComponent(mm[1]);
      const apps = await loadApps();
      const a = apps.find((x) => (x.slug === key || x.id === key) && x.published);
      if (!a) return err("التطبيق غير موجود", 404);
      if (url.searchParams.get("view") === "1") {
        a.views = (a.views || 0) + 1;
        await saveApps(apps);
      }
      return json(publicApp(a));
    }

    // عدّاد التحميل + تحويل للرابط
    if ((mm = path.match(/^\/go\/([^/]+)\/([^/]+)$/)) && m === "GET") {
      const apps = await loadApps();
      const a = apps.find((x) => x.id === mm[1]);
      if (!a) return err("غير موجود", 404);
      let link = null;
      for (const p of Object.keys(a.platforms || {})) {
        const f = a.platforms[p].find((l) => l.id === mm[2]);
        if (f) { link = f; break; }
      }
      if (!link) return err("الرابط غير موجود", 404);
      a.downloads = (a.downloads || 0) + 1;
      a.clicks = a.clicks || {};
      a.clicks[link.id] = (a.clicks[link.id] || 0) + 1;
      await saveApps(apps);
      return new Response(null, { status: 302, headers: { location: link.url, "cache-control": "no-store" } });
    }

    // الصور المرفوعة
    if ((mm = path.match(/^\/media\/([A-Za-z0-9_-]+)$/)) && m === "GET") {
      const res = await store("media").getWithMetadata(mm[1], { type: "arrayBuffer" });
      if (!res) return err("غير موجود", 404);
      return new Response(res.data, {
        headers: {
          "content-type": res.metadata?.type || "image/webp",
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    }

    /* ===== المستخدمين (اختياري) ===== */
    if (path === "/register" && m === "POST") {
      const username = clean(body.username, 30).toLowerCase();
      const name = clean(body.name, 50);
      const pass = String(body.password || "");
      if (!/^[a-z0-9_.]{3,30}$/.test(username)) return err("اسم المستخدم لازم يكون إنكليزي (3 أحرف أو أكثر) بدون مسافات");
      if (name.length < 2) return err("اكتب اسمك");
      if (pass.length < 6) return err("كلمة السر لازم 6 أحرف أو أكثر");
      if (await getJSON("users", "user:" + username, null)) return err("اسم المستخدم محجوز، اختار غيره");
      await setJSON("users", "user:" + username, { username, name, pass: hashPass(pass), createdAt: now() });
      const token = uid(32);
      await setJSON("users", "session:" + token, { u: username, t: now() });
      return json({ token, user: { username, name } });
    }
    if (path === "/login" && m === "POST") {
      const username = clean(body.username, 30).toLowerCase();
      const u = await getJSON("users", "user:" + username, null);
      if (!u || !checkPass(String(body.password || ""), u.pass)) return err("اسم المستخدم أو كلمة السر غلط", 401);
      const token = uid(32);
      await setJSON("users", "session:" + token, { u: username, t: now() });
      return json({ token, user: { username, name: u.name } });
    }
    if (path === "/me" && m === "GET") {
      const u = await getUser(req);
      return u ? json({ user: u }) : err("غير مسجل", 401);
    }
    if (path === "/logout" && m === "POST") {
      const tok = req.headers.get("x-user-token");
      if (tok) await store("users").delete("session:" + tok);
      return json({ ok: true });
    }

    /* ===== طلبات التطبيقات ===== */
    if (path === "/requests" && m === "GET") {
      const u = await getUser(req);
      const viewer = u ? "u:" + u.username : "ip:" + crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
      const reqs = (await loadReqs()).filter((r) => !r.hidden);
      reqs.sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0) || b.createdAt.localeCompare(a.createdAt));
      const appsById = Object.fromEntries((await loadApps()).filter((a) => a.published).map((a) => [a.id, a]));
      return json(reqs.map((r) => publicReq(r, viewer, appsById)));
    }
    if (path === "/requests" && m === "POST") {
      if (body.website) return json({ ok: true }); // فخ للسبام
      const u = await getUser(req);
      const title = clean(body.title, 120);
      const details = clean(body.details, 3000);
      if (title.length < 3) return err("اكتب عنوان الطلب");
      const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
      const reqs = await loadReqs();
      const recent = reqs.filter((r) => r.ipHash === ipHash && Date.now() - Date.parse(r.createdAt) < 60_000);
      if (recent.length >= 3) return err("انتظر دقيقة قبل إرسال طلب جديد", 429);
      const r = {
        id: uid(10),
        title,
        details,
        platform: clean(body.platform, 30),
        author: u ? u.name : clean(body.name, 50) || "زائر",
        username: u ? u.username : null,
        contact: clean(body.contact, 120),
        status: "new",
        reply: "",
        votes: [u ? "u:" + u.username : "ip:" + ipHash],
        ipHash,
        createdAt: now(),
      };
      reqs.push(r);
      await saveReqs(reqs);
      return json(publicReq(r, r.votes[0]));
    }
    if ((mm = path.match(/^\/requests\/([^/]+)\/vote$/)) && m === "POST") {
      const u = await getUser(req);
      const viewer = u ? "u:" + u.username : "ip:" + crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
      const reqs = await loadReqs();
      const r = reqs.find((x) => x.id === mm[1]);
      if (!r) return err("غير موجود", 404);
      r.votes = r.votes || [];
      const i = r.votes.indexOf(viewer);
      if (i >= 0) r.votes.splice(i, 1); else r.votes.push(viewer);
      await saveReqs(reqs);
      return json(publicReq(r, viewer));
    }

    /* ===== الإبلاغ عن رابط معطّل ===== */
    if (path === "/report" && m === "POST") {
      const apps = await loadApps();
      const a = apps.find((x) => x.id === body.appId && x.published);
      if (!a) return err("التطبيق غير موجود", 404);
      let link = null, plat = "";
      for (const p of Object.keys(a.platforms || {})) {
        const f = (a.platforms[p] || []).find((l) => l.id === body.linkId);
        if (f) { link = f; plat = p; break; }
      }
      if (!link) return err("الرابط غير موجود", 404);
      const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
      const reports = await loadReports();
      // منع التكرار: نفس الشخص لنفس الرابط خلال ساعة
      const dup = reports.find((r) => r.linkId === body.linkId && r.ipHash === ipHash && Date.now() - Date.parse(r.at) < 3600_000);
      if (dup) return json({ ok: true, already: true });
      // حد ضد السبام
      const recent = reports.filter((r) => r.ipHash === ipHash && Date.now() - Date.parse(r.at) < 60_000);
      if (recent.length >= 6) return err("انتظر دقيقة", 429);
      reports.unshift({
        id: uid(10), appId: a.id, appName: a.name, appSlug: a.slug,
        platform: plat, linkId: link.id, host: link.host, label: link.label || "", url: link.url,
        note: clean(body.note, 300), ipHash, at: now(), status: "open",
      });
      await saveReports(reports.slice(0, 500));
      return json({ ok: true });
    }

    /* ===== الإدارة ===== */
    if (path.startsWith("/admin")) {
      // حماية من التخمين: 5 محاولات غلط = قفل 15 دقيقة لنفس الـ IP
      const lockKey = "lock:" + crypto.createHash("sha256").update(ip).digest("hex").slice(0, 20);
      const lock = await getJSON("security", lockKey, { fails: 0, until: 0 });
      if (lock.until > Date.now()) {
        const mins = Math.ceil((lock.until - Date.now()) / 60000);
        return err(`محاولات كثيرة غلط — انقفل الدخول ${mins} دقيقة`, 429);
      }
      if (!isAdmin(req)) {
        lock.fails = (lock.fails || 0) + 1;
        if (lock.fails >= 5) { lock.until = Date.now() + 15 * 60_000; lock.fails = 0; }
        await setJSON("security", lockKey, lock);
        return err("كلمة سر الإدارة غلط", 401);
      }
      if (lock.fails) await store("security").delete(lockKey);

      if (path === "/admin/check") return json({ ok: true });

      if (path === "/admin/apps" && m === "GET") return json(await loadApps());

      if (path === "/admin/apps" && m === "POST") {
        const apps = await loadApps();
        if (!clean(body.name)) return err("اكتب اسم التطبيق");
        const a = normalizeApp(body);
        while (apps.some((x) => x.slug === a.slug)) a.slug += "-" + uid(3).toLowerCase();
        apps.push(a);
        await saveApps(apps);
        return json(a);
      }
      if ((mm = path.match(/^\/admin\/apps\/([^/]+)$/))) {
        const apps = await loadApps();
        const i = apps.findIndex((x) => x.id === mm[1]);
        if (i < 0) return err("غير موجود", 404);
        if (m === "PUT") {
          if (!clean(body.name)) return err("اكتب اسم التطبيق");
          const a = normalizeApp(body, apps[i]);
          while (apps.some((x, j) => j !== i && x.slug === a.slug)) a.slug += "-" + uid(3).toLowerCase();
          apps[i] = a;
          await saveApps(apps);
          return json(a);
        }
        if (m === "DELETE") {
          apps.splice(i, 1);
          await saveApps(apps);
          return json({ ok: true });
        }
      }

      // إضافة روابط لتطبيق (يستخدمها نظام الرفع التلقائي من GitHub)
      if ((mm = path.match(/^\/admin\/apps\/([^/]+)\/links$/)) && m === "POST") {
        const apps = await loadApps();
        const a = apps.find((x) => x.id === mm[1]);
        if (!a) return err("غير موجود", 404);
        const p = PLATFORMS.includes(body.platform) ? body.platform : "windows";
        const incoming = (Array.isArray(body.links) ? body.links : [])
          .map((l) => ({ id: uid(8), host: clean(l.host, 40), label: clean(l.label, 60), url: clean(l.url, 2000), note: clean(l.note, 120) }))
          .filter((l) => /^https?:\/\//i.test(l.url));
        a.platforms = a.platforms || {};
        a.platforms[p] = a.platforms[p] || [];
        for (const l of incoming) {
          const same = a.platforms[p].findIndex((x) => x.host === l.host);
          if (same >= 0 && body.replace !== false) a.platforms[p][same] = { ...l, id: a.platforms[p][same].id };
          else a.platforms[p].push(l);
        }
        if (body.size) a.size = clean(body.size, 40);
        a.mirrorLog = [{ at: now(), platform: p, ok: incoming.length, errors: clean(body.errors, 1000) }, ...(a.mirrorLog || [])].slice(0, 10);
        a.updatedAt = now();
        await saveApps(apps);
        return json({ ok: true, added: incoming.length });
      }

      // تشغيل الرفع من رابط GitHub عبر GitHub Actions
      if (path === "/admin/mirror" && m === "POST") {
        const token = process.env.GITHUB_TOKEN;
        const repo = process.env.GITHUB_REPO; // مثال: ibrata2/ibra-store
        if (!token || !repo) return err("لازم تضيف GITHUB_TOKEN و GITHUB_REPO بإعدادات Netlify (شوف ملف الشرح)");
        const fileUrl = clean(body.url, 2000);
        if (!/^https:\/\//.test(fileUrl)) return err("الرابط غير صحيح");
        const apps = await loadApps();
        const a = apps.find((x) => x.id === body.appId);
        if (!a) return err("احفظ التطبيق أولاً");
        const hosts = (Array.isArray(body.hosts) ? body.hosts : []).filter((h) => ["gdrive", "gofile", "catbox", "pixeldrain", "buzzheavier"].includes(h));
        if (!hosts.length) return err("اختار موقع رفع واحد على الأقل");
        const site = clean(body.siteUrl, 300) || url.origin;
        const r = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/mirror.yml/dispatches`, {
          method: "POST",
          headers: { authorization: "Bearer " + token, accept: "application/vnd.github+json", "user-agent": "ibra-store", "content-type": "application/json" },
          body: JSON.stringify({
            ref: process.env.GITHUB_BRANCH || "main",
            inputs: { file_url: fileUrl, app_id: a.id, platform: PLATFORMS.includes(body.platform) ? body.platform : "windows", hosts: hosts.join(","), site_url: site, file_name: clean(body.fileName, 200) },
          }),
        });
        if (r.status !== 204) return err("GitHub رفض الطلب: " + r.status + " " + (await r.text()).slice(0, 300), 502);
        return json({ ok: true, actions: `https://github.com/${repo}/actions/workflows/mirror.yml` });
      }

      if (path === "/admin/upload" && m === "POST") {
        // صورة مضغوطة من المتصفح كـ dataURL
        const mt = String(body.data || "").match(/^data:(image\/(?:webp|png|jpeg|gif|svg\+xml));base64,(.+)$/);
        if (!mt) return err("صيغة الصورة غير مدعومة");
        const buf = Buffer.from(mt[2], "base64");
        if (buf.length > 4.5 * 1024 * 1024) return err("الصورة كبيرة جداً");
        const key = uid(14);
        await store("media").set(key, buf, { metadata: { type: mt[1], name: clean(body.name, 120), at: now() } });
        return json({ url: "/api/media/" + key, key });
      }

      if (path === "/admin/requests" && m === "GET") return json(await loadReqs());
      if ((mm = path.match(/^\/admin\/requests\/([^/]+)$/))) {
        const reqs = await loadReqs();
        const i = reqs.findIndex((x) => x.id === mm[1]);
        if (i < 0) return err("غير موجود", 404);
        if (m === "PUT") {
          if (body.status !== undefined) reqs[i].status = clean(body.status, 20);
          if (body.reply !== undefined) reqs[i].reply = clean(body.reply, 2000);
          if (body.hidden !== undefined) reqs[i].hidden = !!body.hidden;
          if (body.appId !== undefined) {
            reqs[i].appId = clean(body.appId, 20) || null;
            if (reqs[i].appId && reqs[i].status === "new") reqs[i].status = "done"; // ربط تطبيق = تم التنفيذ
          }
          await saveReqs(reqs);
          return json(reqs[i]);
        }
        if (m === "DELETE") {
          reqs.splice(i, 1);
          await saveReqs(reqs);
          return json({ ok: true });
        }
      }

      // بلاغات الروابط
      if (path === "/admin/reports" && m === "GET") return json(await loadReports());
      if (path === "/admin/reports/clear" && m === "POST") {
        // حذف كل بلاغات رابط معيّن (بعد الإصلاح)
        const reports = (await loadReports()).filter((r) => r.linkId !== clean(body.linkId, 20));
        await saveReports(reports);
        return json({ ok: true });
      }
      if ((mm = path.match(/^\/admin\/reports\/([^/]+)$/)) && m === "DELETE") {
        const reports = (await loadReports()).filter((r) => r.id !== mm[1]);
        await saveReports(reports);
        return json({ ok: true });
      }

      if (path === "/admin/settings" && m === "PUT") {
        const cur = await loadSettings();
        const next = { ...cur };
        for (const k of Object.keys(DEFAULT_SETTINGS)) if (body[k] !== undefined) next[k] = clean(body[k], 4000);
        await setJSON("data", "settings", next);
        return json(next);
      }

      if (path === "/admin/backup" && m === "GET") {
        return json({ apps: await loadApps(), requests: await loadReqs(), reports: await loadReports(), settings: await loadSettings(), at: now() });
      }
      if (path === "/admin/restore" && m === "POST") {
        if (Array.isArray(body.apps)) await saveApps(body.apps);
        if (Array.isArray(body.requests)) await saveReqs(body.requests);
        if (Array.isArray(body.reports)) await saveReports(body.reports);
        if (body.settings) await setJSON("data", "settings", body.settings);
        return json({ ok: true });
      }
    }

    return err("المسار غير موجود", 404);
  } catch (e) {
    console.error(e);
    return err("خطأ بالخادم: " + (e?.message || e), 500);
  }
};
