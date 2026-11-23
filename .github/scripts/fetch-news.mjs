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
// عدد المنشورات: يُضبط من متغيّرات GitHub (Variables) بدون تعديل الكود
const PER_FEED = Math.max(1, +(process.env.NEWS_PER_FEED || 3)); // أحدث كم خبر من كل مصدر
const PER_DAY  = Math.max(1, +(process.env.NEWS_PER_DAY  || 6)); // إجمالي المنشورات باليوم

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

// 2) نوزّعهم بالتناوب بين المصادر (مزيج عادل) ثم نقص على العدد المطلوب لليوم
const mixed = [];
for (let i = 0; mixed.length < PER_DAY; i++) {
  let any = false;
  for (const arr of perFeed) { if (arr[i]) { mixed.push(arr[i]); any = true; if (mixed.length >= PER_DAY) break; } }
  if (!any) break;
}
console.log(`➜ المطلوب نشره اليوم: ${mixed.length} خبر (الحد: ${PER_DAY})`);

// 3) نترجم المختارين فقط (توفير للوقت والطلبات)
const items = [];
for (const c of mixed) {
  const en = c.f.lang === "en";
  const title = en ? await translate(c.rawTitle) : c.rawTitle;
  const excerpt = en ? await translate(c.rawDesc.slice(0, 400)) : c.rawDesc.slice(0, 400);
  const bodyTxt = en ? await translate(c.rawDesc.slice(0, 1200)) : c.rawDesc.slice(0, 1200);
  items.push({
    title, excerpt, body: bodyTxt || excerpt,
    image: c.image, source: c.f.source, sourceUrl: c.sourceUrl,
    category: guessCat(c.rawTitle, c.f.cat),
  });
}

if (!items.length) { console.log("ماكو أخبار"); process.exit(0); }
const res = await fetch(`${SITE}/api/admin/news/ingest`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-admin-key": KEY },
  body: JSON.stringify({ items, autoPublish: true }),
});
console.log("نتيجة النشر:", res.status, await res.text());
