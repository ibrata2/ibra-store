// IBRA STORE — جلب أخبار تقنية يومياً وترجمتها للعربية ونشرها
// يشتغل من GitHub Actions. يحتاج: SITE, ADMIN_KEY
import Parser from "rss-parser";

const SITE = process.env.SITE || "https://ibraprogram.netlify.app";
const KEY = process.env.ADMIN_KEY;
if (!KEY) { console.error("ADMIN_KEY مفقود"); process.exit(1); }

// المصادر: ar=عربي (بدون ترجمة) | en=إنكليزي (يترجم)
const FEEDS = [
  { url: "https://www.theverge.com/rss/index.xml", lang: "en", source: "The Verge", cat: "عام تقني" },
  { url: "https://techcrunch.com/feed/", lang: "en", source: "TechCrunch", cat: "عام تقني" },
  { url: "https://www.engadget.com/rss.xml", lang: "en", source: "Engadget", cat: "الحواسيب والأجهزة" },
  { url: "https://feeds.arstechnica.com/arstechnica/technology-lab", lang: "en", source: "Ars Technica", cat: "عام تقني" },
  { url: "https://aitnews.com/feed/", lang: "ar", source: "البوابة العربية للأخبار التقنية", cat: "عام تقني" },
  { url: "https://www.tech-wd.com/wd/feed/", lang: "ar", source: "عالم التقنية", cat: "عام تقني" },
];
const PER_FEED = 3; // أحدث كم خبر من كل مصدر

const parser = new Parser({ timeout: 20000, headers: { "User-Agent": "Mozilla/5.0 IBRA-STORE-bot" } });
const strip = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
const firstImg = (it) => it.enclosure?.url || (String(it["content:encoded"] || it.content || "").match(/<img[^>]+src=["']([^"']+)["']/) || [])[1] || "";

async function translate(text) {
  if (!text) return "";
  const t = text.slice(0, 1400);
  try {
    const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(t)}`);
    const j = await r.json();
    return (j[0] || []).map((x) => x[0]).join("");
  } catch { return text; }
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

const items = [];
for (const f of FEEDS) {
  try {
    const feed = await parser.parseURL(f.url);
    for (const it of (feed.items || []).slice(0, PER_FEED)) {
      const rawTitle = strip(it.title);
      const rawDesc = strip(it.contentSnippet || it.content || it.summary || it["content:encoded"] || "");
      if (!rawTitle) continue;
      const title = f.lang === "en" ? await translate(rawTitle) : rawTitle;
      const excerpt = f.lang === "en" ? await translate(rawDesc.slice(0, 400)) : rawDesc.slice(0, 400);
      const bodyTxt = f.lang === "en" ? await translate(rawDesc.slice(0, 1200)) : rawDesc.slice(0, 1200);
      items.push({
        title, excerpt, body: bodyTxt || excerpt,
        image: firstImg(it), source: f.source, sourceUrl: it.link || "",
        category: guessCat(rawTitle, f.cat),
      });
    }
    console.log(`✔ ${f.source}: ${Math.min(PER_FEED, (feed.items || []).length)} عنصر`);
  } catch (e) { console.log(`✘ ${f.source}: ${e.message}`); }
}

if (!items.length) { console.log("ماكو أخبار"); process.exit(0); }
const res = await fetch(`${SITE}/api/admin/news/ingest`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-admin-key": KEY },
  body: JSON.stringify({ items, autoPublish: true }),
});
console.log("نتيجة النشر:", res.status, await res.text());
