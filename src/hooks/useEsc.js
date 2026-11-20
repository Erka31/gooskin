import { useEffect } from "react";

// Escape товч дарахад onClose дуудна. enabled=false үед сонсохгүй.
export default function useEsc(onClose, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const f = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [onClose, enabled]);
}
