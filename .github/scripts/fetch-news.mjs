// IBRA STORE — جلب أخبار تقنية وترجمتها للعربية ونشرها
// كل الإعدادات (المصادر/العدد/الفاصل/النافذة) تُدار من لوحة الإدارة.
// هذا السكربت يسأل الموقع "هل أنشر الآن وكم؟" وينفّذ فقط.
// يشتغل من GitHub Actions. يحتاج: SITE, ADMIN_KEY
import Parser from "rss-parser";

const SITE = process.env.SITE || "https://ibraprogram.netlify.app";
const KEY = process.env.ADMIN_KEY;
if (!KEY) { console.error("ADMIN_KEY مفقود"); process.exit(1); }
const H = { "content-type": "application/json", "x-admin-key": KEY };

// 0) نسأل الموقع عن خطة النشر (يقررها المستخدم من اللوحة)
let plan;
try {
  const r = await fetch(`${SITE}/api/admin/news/plan`, { headers: H });
  plan = await r.json();
} catch (e) { console.error("تعذّر الوصول للموقع:", e.message); process.exit(1); }

if (!plan || !plan.run) { console.log("لا نشر الآن:", plan?.reason || "—"); process.exit(0); }

const FEEDS = Array.isArray(plan.feeds) ? plan.feeds : [];
const PER_FEED = Math.max(1, +plan.perFeed || 3);
const PER_DAY = Math.max(1, +plan.count || 2);
const AUTO_PUBLISH = plan.autoPublish !== false;
if (!FEEDS.length) { console.log("ماكو مصادر مفعّلة باللوحة"); process.exit(0); }

const parser = new Parser({ timeout: 20000, headers: { "User-Agent": "Mozilla/5.0 IBRA-STORE-bot" } });
const strip = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
const firstImg = (it) => it.enclosure?.url || (String(it["content:encoded"] || it.content || "").match(/<img[^>]+src=["']([^"']+)["']/) || [])[1] || "";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let xStats = { ok: 0, fail: 0 };

async function gtx(t) {
  const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(t)}`, { headers: { "User-Agent": UA, accept: "application/json" } });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const j = await r.json();
  return (j[0] || []).map((x) => x[0]).join("");
}
async function clients5(t) {
  const r = await fetch(`https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=ar&q=${encodeURIComponent(t)}`, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const j = await r.json();
  if (Array.isArray(j)) {
    if (typeof j[0] === "string") return j.join(" ");
    if (Array.isArray(j[0])) return j.map((s) => (Array.isArray(s) ? s[0] : s)).join(" ");
  }
  return "";
}
// ترجمة مع إعادة محاولة + مصدر احتياطي حتى لا ينزل الخبر إنكليزي
async function translate(text) {
  if (!text) return "";
  const t = text.slice(0, 1400);
  for (let i = 0; i < 3; i++) {
    try { const out = await gtx(t); if (out && out.trim()) { xStats.ok++; return out; } } catch {}
    await sleep(500 * (i + 1));
  }
  try { const out = await clients5(t); if (out && out.trim()) { xStats.ok++; return out; } } catch {}
  xStats.fail++; console.log("⚠ فشلت الترجمة لمقطع، نُزل كما هو");
  return text;
}
function guessCat(title, def) {
  const t = title.toLowerCase();
  if (/(\bai\b|artificial intelligence|chatgpt|openai|gemini|ذكاء اصطناعي|نموذج)/.test(t)) return "الذكاء الاصطناعي";
  if (/(iphone|android|samsung|pixel|هاتف|هواتف|موبايل)/.test(t)) return "الهواتف";
  if (/(security|hack|breach|malware|ransomware|اختراق|أمن|برمجية خبيثة|ثغرة)/.test(t)) return "الأمن السيبراني";
  if (/(game|gaming|playstation|xbox|nintendo|لعبة|ألعاب)/.test(t)) return "الألعاب";
  if (/(app|software|update|windows| تطبيق|برنامج|تحديث|ويندوز)/.test(t)) return "البرامج والتطبيقات";
  if (/(laptop|chip|gpu|cpu|intel|amd|nvidia|حاسوب|معالج|شريحة)/.test(t)) return "الحواسيب والأجهزة";
  return def;
}

// 1) نجمع المرشحين الخام من كل مصدر (بدون ترجمة بعد)
const perFeed = [];
for (const f of FEEDS) {
  try {
    const feed = await parser.parseURL(f.url);
    const arr = [];
    for (const it of (feed.items || []).slice(0, PER_FEED)) {
      const rawTitle = strip(it.title);
      if (!rawTitle) continue;
      const rawDesc = strip(it.contentSnippet || it.content || it.summary || it["content:encoded"] || "");
      arr.push({ f, rawTitle, rawDesc, image: firstImg(it), sourceUrl: it.link || "" });
    }
    perFeed.push(arr);
    console.log(`✔ ${f.source}: ${arr.length} عنصر`);
  } catch (e) { console.log(`✘ ${f.source}: ${e.message}`); perFeed.push([]); }
}

// 2) نوزّعهم بالتناوب بين المصادر (مزيج عادل) ثم نقص على العدد المطلوب
const mixed = [];
for (let i = 0; mixed.length < PER_DAY; i++) {
  let any = false;
  for (const arr of perFeed) { if (arr[i]) { mixed.push(arr[i]); any = true; if (mixed.length >= PER_DAY) break; } }
  if (!any) break;
}
console.log(`➜ المطلوب نشره: ${mixed.length} خبر`);

// 3) نترجم المختارين فقط — مكالمتان لكل خبر (عنوان + نص) مع فاصل بسيط ضد الحظر
const items = [];
for (const c of mixed) {
  const en = c.f.lang === "en";
  const title = en ? await translate(c.rawTitle) : c.rawTitle;
  const bodyTxt = en ? await translate(c.rawDesc.slice(0, 1200)) : c.rawDesc.slice(0, 1200);
  const excerpt = (bodyTxt || "").slice(0, 300);
  items.push({
    title, excerpt, body: bodyTxt || excerpt,
    image: c.image, source: c.f.source, sourceUrl: c.sourceUrl,
    category: guessCat(c.rawTitle, c.f.category || "عام تقني"),
  });
  if (en) await sleep(350); // فاصل بين الأخبار حتى لا يُحظر
}
console.log(`📊 الترجمة: ${xStats.ok} نجحت، ${xStats.fail} فشلت`);

if (!items.length) { console.log("ماكو أخبار"); process.exit(0); }
const res = await fetch(`${SITE}/api/admin/news/ingest`, {
  method: "POST", headers: H,
  body: JSON.stringify({ items, autoPublish: AUTO_PUBLISH }),
});
console.log("نتيجة النشر:", res.status, await res.text());
