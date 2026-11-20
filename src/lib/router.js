// Жижиг router: жинхэнэ URL (/product/12, /p/faq, /admin) — History API ашиглана.
const EVENT = "routechange";

// Шинэ хуудас руу шилжих. "/#products" гэвэл нүүр хуудасны тэр хэсэг рүү гүйлгэнэ.
export function navigate(to, { replace = false, scroll = true } = {}) {
  const url = new URL(to, window.location.origin);
  const same = url.pathname + url.search + url.hash === currentUrl();
  if (!same) {
    window.history[replace ? "replaceState" : "pushState"]({ scroll }, "", url);
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { scroll } }));
}

export const currentUrl = () =>
  window.location.pathname + window.location.search + window.location.hash;

export const onRouteChange = (fn) => {
  const handler = (e) => fn(e.detail?.scroll ?? true);
  const pop = () => fn(true);
  window.addEventListener(EVENT, handler);
  window.addEventListener("popstate", pop);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("popstate", pop);
  };
};

// <a>-ийн дарагдсан click-ийг router руу шилжүүлэх (шинэ таб, ctrl+click хэвээр ажиллана)
export function linkClick(e, to, opts) {
  if (
    e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey ||
    e.currentTarget.target === "_blank"
  ) {
    return;
  }
  e.preventDefault();
  navigate(to, opts);
}

// ---------- Барааны URL ----------
const MAP = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "u", п: "p",
  р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "kh", ц: "ts", ч: "ch",
  ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};
const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .split("")
    .map((c) => MAP[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export const productPath = (p) => {
  const s = slugify(p.name);
  return `/product/${s ? `${p.id}-${s}` : p.id}`;
};
