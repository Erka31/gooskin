import { useRef, useState } from "react";
import { uploadImage } from "../../lib/api";
import { compressImage } from "../../lib/images";

export const MAX_IMAGES = 6;

// Олон зураг оруулах: сонгох / чирж тавих, эрэмбэлэх, үндсэн болгох, устгах
export default function ImageUploader({ images, onChange, onAdd }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(0); // одоо upload хийгдэж буй тоо
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");

  const addFiles = async (fileList) => {
    setError("");
    const room = MAX_IMAGES - images.length - busy;
    const files = [...fileList].filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      setError("Зургийн файл сонгоно уу (JPG, PNG, WEBP)");
      return;
    }
    if (room <= 0) {
      setError(`Хамгийн ихдээ ${MAX_IMAGES} зураг оруулна`);
      return;
    }
    const take = files.slice(0, room);
    if (files.length > room) {
      setError(`Зөвхөн ${room} зураг нэмэгдлээ (дээд хязгаар ${MAX_IMAGES})`);
    }

    setBusy((n) => n + take.length);
    for (const f of take) {
      try {
        const blob = await compressImage(f);
        const url = await uploadImage(blob);
        onAdd(url);
      } catch (e) {
        setError(`${f.name}: ${e.message}`);
      } finally {
        setBusy((n) => n - 1);
      }
    }
  };

  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const makeMain = (i) =>
    onChange([images[i], ...images.filter((_, k) => k !== i)]);
  const remove = (i) => onChange(images.filter((_, k) => k !== i));

  return (
    <div className="uploader">
      <div className="up-grid">
        {images.map((src, i) => (
          <div key={src} className={"up-item" + (i === 0 ? " main" : "")}>
            <img src={src} alt={`Зураг ${i + 1}`} />
            {i === 0 && <span className="up-badge">Үндсэн</span>}
            <div className="up-actions">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                title="Зүүн тийш"
              >
                ←
              </button>
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => makeMain(i)}
                  title="Үндсэн зураг болгох"
                >
                  ★
                </button>
              )}
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === images.length - 1}
                title="Баруун тийш"
              >
                →
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => remove(i)}
                title="Устгах"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: busy }, (_, i) => (
          <div key={"b" + i} className="up-item loading">
            <span className="spinner" />
            <small>Илгээж байна...</small>
          </div>
        ))}

        {images.length + busy < MAX_IMAGES && (
          <button
            type="button"
            className={"up-drop" + (drag ? " drag" : "")}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            <span className="up-plus">＋</span>
            <b>Зураг нэмэх</b>
            <small>Дарж сонгох эсвэл чирж тавих</small>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="up-hint">
        Эхний зураг нь дэлгүүрт үндсэн зураг болж харагдана. Хамгийн ихдээ{" "}
        {MAX_IMAGES} зураг, том зургийг автоматаар багасгана. Зураггүй бол emoji
        харагдана.
      </p>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
