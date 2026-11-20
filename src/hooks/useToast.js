import { useState, useEffect } from "react";

// Түр харагдах мэдэгдэл: [текст, харуулах функц]
export default function useToast(duration = 1800) {
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), duration);
    return () => clearTimeout(t);
  }, [toast, duration]);

  return [toast, setToast];
}
