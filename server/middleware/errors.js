// 404 болон алдааны handler-ууд

export const notFound = (req, res) => {
  res.status(404).json({ error: "Зам олдсонгүй" });
};

// Express алдааны handler 4 параметртэй байх ёстой
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Сервер дээр алдаа гарлаа" });
};
