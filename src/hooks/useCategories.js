import { createContext, useContext } from "react";

// Серверээс ирсэн ангиллын жагсаалтыг бүх компонентод хүргэх context
export const CategoriesContext = createContext([]);

export const useCategories = () => useContext(CategoriesContext);

// Ангиллын нэрээр өнгө (tone) олох
export function useTone(catName) {
  const cats = useCategories();
  return cats.find((c) => c.name === catName)?.tone || "rose";
}
