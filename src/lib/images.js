// Зургийг браузер дээр багасгаж (max 1400px) WEBP/JPEG болгох.
// Ингэснээр утасны 5-10MB зураг ~200KB болж, сайт хурдан ачаална.
const MAX_SIDE = 1400;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Зургийг уншиж чадсангүй"));
    };
    img.src = url;
  });

const toBlob = (canvas, type, q) =>
  new Promise((r) => canvas.toBlob(r, type, q));

export async function compressImage(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Зөвхөн зургийн файл сонгоно уу");
  }
  // GIF-ийн хөдөлгөөнийг алдахгүйн тулд шууд илгээнэ
  if (file.type === "image/gif") return file;

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

  const webp = await toBlob(canvas, "image/webp", 0.85);
  if (webp && webp.type === "image/webp") return webp;
  return (await toBlob(canvas, "image/jpeg", 0.88)) || file;
}
