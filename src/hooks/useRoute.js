import { useState, useEffect } from "react";
import { PAGES } from "../pages/content";
import { onRouteChange } from "../lib/router";

// URL-аас одоогийн хуудсыг тодорхойлох
//   /admin            → админ
//   /p/<slug>         → мэдээллийн хуудас
//   /product/<id>-... → дэлгүүр + барааны цонх
//   /reset-password   → нууц үг сэргээх
//   бусад             → дэлгүүр
export const parseRoute = () => {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/admin") return { name: "admin" };
  if (path === "/reset-password") {
    return {
      name: "reset",
      token: new URLSearchParams(window.location.search).get("token") || "",
    };
  }
  const page = path.match(/^\/p\/([\w-]+)$/);
  if (page && PAGES[page[1]]) return { name: "page", slug: page[1] };
  const prod = path.match(/^\/product\/(\d+)/);
  if (prod) return { name: "shop", productId: Number(prod[1]) };
  return { name: "shop" };
};

// Хуучин #admin, #/p/faq холбоосыг шинэ URL руу шилжүүлэх
const migrateHash = () => {
  const h = window.location.hash;
  const to =
    h === "#admin" ? "/admin" : h.startsWith("#/p/") ? h.slice(1) : null;
  if (to) window.history.replaceState(null, "", to);
};

const titleOf = (route) =>
  route.name === "page"
    ? `${PAGES[route.slug].title} · Gooskin`
    : route.name === "admin"
      ? "Админ · Gooskin"
      : route.name === "reset"
        ? "Нууц үг сэргээх · Gooskin"
        : "Gooskin · Арьс арчилгааны онлайн дэлгүүр";

export default function useRoute() {
  const [route, setRoute] = useState(() => {
    migrateHash();
    return parseRoute();
  });

  useEffect(
    () =>
      onRouteChange((scroll) => {
        const r = parseRoute();
        setRoute(r);
        if (!scroll) return;
        // /#products → тэр хэсэг рүү, бусад хуудас → дээд тал руу
        const id = window.location.hash.slice(1);
        requestAnimationFrame(() => {
          const el = id && document.getElementById(id);
          if (el) el.scrollIntoView();
          else if (!r.productId) window.scrollTo(0, 0);
        });
      }),
    [],
  );

  useEffect(() => {
    // Барааны гарчгийг ProductModal өөрөө тавина
    if (!route.productId) document.title = titleOf(route);
  }, [route]);

  // Анх ачаалахад /#products гэх мэт бол гүйлгэх
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView(), 300);
  }, []);

  return route;
}
