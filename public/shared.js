// IBRA STORE — أدوات مشتركة بين الموقع ولوحة الإدارة
const IB = (() => {
  const ico = (d, extra = "") =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;

  const icons = {
    windows: ico('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
    android: ico('<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>'),
    ios: ico('<rect x="5.5" y="2.5" width="13" height="19" rx="3"/><path d="M10 5h4"/><circle cx="12" cy="18.3" r=".9"/>'),
    mac: ico('<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M2 19h20l-2-4H4z"/>'),
    linux: ico('<path d="M4 17l6-6-6-6M12 19h8"/>'),
    web: ico('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
    tv: ico('<rect x="2.5" y="5" width="19" height="13" rx="2"/><path d="M8 21h8M8.5 2.5 12 5l3.5-2.5"/>'),
    download: ico('<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>'),
    search: ico('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    star: ico('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
    eye: ico('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    up: ico('<path d="m6 15 6-6 6 6"/>'),
    send: ico('<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>'),
    user: ico('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    tag: ico('<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.3"/>'),
    link: ico('<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'),
    copy: ico('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
    share: ico('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>'),
    plus: ico('<path d="M12 5v14M5 12h14"/>'),
    edit: ico('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
    trash: ico('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    x: ico('<path d="M6 6l12 12M18 6 6 18"/>'),
    menu: ico('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    play: ico('<path d="M7 4v16l13-8z" fill="currentColor"/>'),
    cloud: ico('<path d="M7 18a5 5 0 0 1-.6-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/><path d="M12 11v6M9.5 13.5 12 11l2.5 2.5"/>'),
    image: ico('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'),
    chat: ico('<path d="M4 5h16v11H9l-5 4z"/>'),
    gear: ico('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>'),
    grid: ico('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    check: ico('<path d="m5 12 5 5L20 7"/>'),
    telegram: ico('<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 8-6"/>'),
    tiktok: ico('<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 3 2.5 5 5.5 5"/>'),
    palette: ico('<circle cx="13.5" cy="6.5" r="1.2" fill="currentColor"/><circle cx="17.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="8.5" cy="7.5" r="1.2" fill="currentColor"/><circle cx="6.5" cy="12.5" r="1.2" fill="currentColor"/><path d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 2-2 2 2 0 0 1 2-2h1a4 4 0 0 0 4-4 9 9 0 0 0-9-8z"/>'),
    info: ico('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    warn: ico('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
    folder: ico('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    shield: ico('<path d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6z"/>'),
    gamepad: ico('<rect x="2.5" y="8" width="19" height="9" rx="4"/><path d="M8 11.5v3M6.5 13h3M15.5 12.5h.01M18 14h.01"/>'),
    clock: ico('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    fire: ico('<path d="M12 3c1 3-1 4-1 6a3 3 0 0 0 5 1c1 3-1 7-4 7a5 5 0 0 1-5-5c0-3 3-4 5-9z"/>'),
    medal: ico('<circle cx="12" cy="14" r="6"/><path d="M8.5 9 7 3h10l-1.5 6M12 11.5l1 2 2 .2-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 13.7l2-.2z"/>'),
    rows: ico('<rect x="3" y="4" width="18" height="5" rx="1.5"/><rect x="3" y="12" width="18" height="5" rx="1.5"/>'),
    layout: ico('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16M3 10h12"/>'),
  };

  // أيقونة القسم حسب اسمه
  function catIcon(cat) {
    const c = String(cat || "").toLowerCase();
    if (/(لعب|العاب|ألعاب|game)/.test(c)) return icons.gamepad;
    if (/(أدوات|ادوات|اداة|tool|system|نظام)/.test(c)) return icons.gear;
    if (/(تصميم|design|جراف|graphic|صور|photo)/.test(c)) return icons.image;
    if (/(وسائط|ميديا|media|فيديو|صوت|مشغل|player)/.test(c)) return icons.play;
    if (/(انترنت|إنترنت|internet|متصفح|browser|شبك|network)/.test(c)) return icons.web;
    if (/(حماية|أمن|امن|secur|antivir|protect)/.test(c)) return icons.shield;
    if (/(مكتب|office|انتاج|إنتاج|product)/.test(c)) return icons.grid;
    return icons.folder;
  }

  const THEMES = {
    gold: ["الأصلي — ذهبي أسود", "sw-gold"],
    "red-dark": ["أحمر زجاجي أسود", "sw-red-dark"],
    "red-light": ["أحمر زجاجي أبيض", "sw-red-light"],
    dark: ["دارك", "sw-dark"],
    light: ["لايت", "sw-light"],
  };
  const applyTheme = (t) => { if (t && t !== "gold") document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme"); };
  const savedTheme = (key = "ib_theme") => { try { return localStorage.getItem(key); } catch { return null; } };
  const setTheme = (t, key = "ib_theme") => { applyTheme(t); try { (t && t !== "gold") ? localStorage.setItem(key, t) : localStorage.removeItem(key); } catch {} };
  // يبني زر الثيم + القائمة ويربطهم. storageKey يفصل تفضيل اللوحة عن الموقع
  function mountThemePicker(btnEl, menuEl, { current, onPick, storageKey = "ib_theme", label } = {}) {
    btnEl.innerHTML = icons.palette + (label ? ` <span>${label}</span>` : "");
    const cur = () => document.documentElement.getAttribute("data-theme") || "gold";
    const draw = () => {
      menuEl.innerHTML = `<div style="padding:6px 10px;color:var(--dim);font-size:.78rem">اختر الثيم</div>` +
        Object.entries(THEMES).map(([k, [name, sw]]) => `<button data-th="${k}" class="${cur() === k ? "on" : ""}"><span class="sw ${sw}"></span>${name}${cur() === k ? " ✔" : ""}</button>`).join("");
    };
    if (current) applyTheme(current);
    draw();
    btnEl.onclick = (e) => { e.stopPropagation(); menuEl.classList.toggle("open"); draw(); };
    menuEl.onclick = (e) => { const b = e.target.closest("[data-th]"); if (!b) return; setTheme(b.dataset.th, storageKey); draw(); menuEl.classList.remove("open"); onPick && onPick(b.dataset.th); };
    document.addEventListener("click", (e) => { if (!menuEl.contains(e.target) && e.target !== btnEl) menuEl.classList.remove("open"); });
  }

  const PLATFORMS = {
    windows: { name: "ويندوز", short: "Windows" },
    android: { name: "أندرويد", short: "Android" },
    ios: { name: "آيفون / آيباد", short: "iOS" },
    mac: { name: "ماك", short: "macOS" },
    linux: { name: "لينكس", short: "Linux" },
    web: { name: "أونلاين (ويب)", short: "Web" },
    tv: { name: "تلفزيون / TV Box", short: "TV" },
  };

  const HOSTS = {
    gdrive: { name: "Google Drive", color: "#4f8df7", upload: "https://drive.google.com/drive/my-drive" },
    gofile: { name: "Gofile", color: "#68c1ff", upload: "https://gofile.io/uploadFiles", direct: true },
    mediafire: { name: "MediaFire", color: "#2f7bf5", upload: "https://app.mediafire.com/" },
    mega: { name: "MEGA", color: "#e94b4b", upload: "https://mega.nz/fm" },
    catbox: { name: "Catbox", color: "#c9a3ff", upload: "https://catbox.moe/" },
    pixeldrain: { name: "Pixeldrain", color: "#61d39b", upload: "https://pixeldrain.com/" },
    buzzheavier: { name: "BuzzHeavier", color: "#f4c95d", upload: "https://buzzheavier.com/" },
    dropbox: { name: "Dropbox", color: "#3d8bff", upload: "https://www.dropbox.com/home" },
    onedrive: { name: "OneDrive", color: "#3fa2ff", upload: "https://onedrive.live.com/" },
    terabox: { name: "TeraBox", color: "#5aa0ff", upload: "https://www.terabox.com/" },
    telegram: { name: "Telegram", color: "#4fb3e8", upload: "https://web.telegram.org/" },
    playstore: { name: "Google Play", color: "#5fd19a" },
    appstore: { name: "App Store", color: "#9ec5ff" },
    direct: { name: "رابط مباشر", color: "#d4af37" },
    other: { name: "رابط آخر", color: "#a39e92" },
  };

  // يعرف نوع الموقع من الرابط
  function detectHost(url) {
    const u = String(url).toLowerCase();
    if (u.includes("drive.google") || u.includes("docs.google")) return "gdrive";
    if (u.includes("gofile.io")) return "gofile";
    if (u.includes("mediafire")) return "mediafire";
    if (u.includes("mega.nz") || u.includes("mega.io")) return "mega";
    if (u.includes("catbox.moe")) return "catbox";
    if (u.includes("pixeldrain")) return "pixeldrain";
    if (u.includes("buzzheavier")) return "buzzheavier";
    if (u.includes("dropbox")) return "dropbox";
    if (u.includes("1drv.ms") || u.includes("onedrive") || u.includes("sharepoint")) return "onedrive";
    if (u.includes("terabox") || u.includes("1024tera")) return "terabox";
    if (u.includes("t.me/") || u.includes("telegram")) return "telegram";
    if (u.includes("play.google")) return "playstore";
    if (u.includes("apps.apple")) return "appstore";
    return "direct";
  }

  // تحويل روابط المشاركة لروابط تحميل مباشر
  function toDirect(url) {
    let m;
    if ((m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*id=)([\w-]{10,})/)))
      return `https://drive.google.com/uc?export=download&id=${m[1]}`;
    if (/dropbox\.com/.test(url)) return url.replace(/([?&])dl=0/, "$1dl=1").replace(/^(?!.*[?&]dl=)(.*)$/, (s) => s + (s.includes("?") ? "&" : "?") + "dl=1");
    return url;
  }

  // يحول رابط فيديو يوتيوب/تيك توك/ملف لعنصر عرض
  function videoEmbed(url) {
    if (!url) return "";
    let m;
    if ((m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)))
      return `<iframe src="https://www.youtube-nocookie.com/embed/${m[1]}?rel=0" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`;
    if ((m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/)))
      return `<iframe src="https://drive.google.com/file/d/${m[1]}/preview" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>`;
    if ((m = url.match(/tiktok\.com\/.*video\/(\d+)/)))
      return `<iframe src="https://www.tiktok.com/embed/v2/${m[1]}" allowfullscreen loading="lazy" style="aspect-ratio:9/16;max-height:640px"></iframe>`;
    return `<video src="${esc(url)}" controls preload="metadata" playsinline></video>`;
  }

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  async function api(path, opts = {}) {
    const headers = { "content-type": "application/json", ...(opts.headers || {}) };
    const adminKey = sessionStorage.getItem("ib_admin");
    if (adminKey && path.startsWith("/admin")) headers["x-admin-key"] = adminKey;
    try { const t = localStorage.getItem("ib_token"); if (t) headers["x-user-token"] = t; } catch {}
    const res = await fetch("/api" + path, {
      method: opts.method || "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) throw new Error(data?.error || "خطأ " + res.status);
    return data;
  }

  let toastT;
  function toast(msg, bad = false) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = bad ? "bad show" : "show";
    clearTimeout(toastT);
    toastT = setTimeout(() => (t.className = t.className.replace("show", "")), 3000);
  }

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString("ar-IQ", { year: "numeric", month: "long", day: "numeric" }); } catch { return ""; }
  };
  const fmtNum = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K" : String(n || 0));

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    toast("تم النسخ ✔");
  }

  // وقت نسبي: منذ ٣ ساعات / أمس / منذ ٥ أيام
  function fmtAgo(iso) {
    try {
      const d = (Date.now() - Date.parse(iso)) / 1000;
      if (d < 60) return "الآن";
      if (d < 3600) return "منذ " + Math.floor(d / 60) + " دقيقة";
      if (d < 86400) return "منذ " + Math.floor(d / 3600) + " ساعة";
      if (d < 172800) return "أمس";
      if (d < 2592000) return "منذ " + Math.floor(d / 86400) + " يوم";
      return fmtDate(iso);
    } catch { return ""; }
  }

  return { icons, PLATFORMS, HOSTS, THEMES, catIcon, detectHost, toDirect, videoEmbed, esc, api, toast, fmtDate, fmtAgo, fmtNum, copy, applyTheme, savedTheme, setTheme, mountThemePicker };
})();
