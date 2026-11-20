export const money = (n) => Number(n ?? 0).toLocaleString("en-US") + "₮";

// Нэвтрэлтийг зөвхөн HttpOnly cookie-д хадгална (JavaScript уншиж чадахгүй тул XSS-ээс хамгаалагдана).
// Хуучин хувилбарын localStorage дахь token-ийг цэвэрлэх:
try {
  localStorage.removeItem("goo_jwt_token");
} catch {
  /* ignore */
}

export async function api(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch("/api" + path, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Алдаа гарлаа");
    err.status = res.status;
    throw err;
  }
  return data;
}

// Зургийн файлыг (Blob) сервер рүү илгээж URL буцаана
export async function uploadImage(blob) {
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": blob.type || "application/octet-stream" },
    body: blob,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Зураг илгээхэд алдаа гарлаа");
  return data.url;
}
