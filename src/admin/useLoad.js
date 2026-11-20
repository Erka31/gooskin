import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

// Админ табуудын өгөгдөл татах hook: [data, error, reload]

export default function useLoad(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(
    () =>
      api(path)
        .then((d) => {
          setData(d);
          setError("");
        })
        .catch((e) => setError(e?.message || "Өгөгдөл татахад алдаа гарлаа")),
    [path],
  );
  useEffect(() => {
    load();
  }, [load]);
  return [data, error, load];
}
