// Оролтын шалгалтын туслахууд

export const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Утасны дугаар: дор хаяж 8 цифр
export const phoneOk = (p) => String(p).replace(/\D/g, "").length >= 8;

// Текстийг trim хийгээд уртыг хязгаарлах
export const str = (v, max = 1000) => String(v ?? "").trim().slice(0, max);
