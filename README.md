# Gooskin — арьс арчилгааны онлайн дэлгүүр

React (Vite) frontend + Express + SQLite (`node:sqlite`) backend. **Node.js 22.13+** шаардлагатай.

## Ажиллуулах

```bash
npm install

# Хөгжүүлэлт (frontend :5173 + API :3001)
npm run dev:all

# Production (build хийгээд нэг сервер дээр frontend + API, :3001)
npm run prod
```

Серверт байршуулах бүрэн заавар: **[DEPLOY.md](DEPLOY.md)**

## Командууд

| Команд | Юу хийх |
| --- | --- |
| `npm run dev:all` | Хөгжүүлэлтийн сервер (frontend + API) |
| `npm run build` | Frontend build (`dist/`) |
| `npm start` | Production сервер (`NODE_ENV=production`) |
| `npm run backup` | Database + зургийн нөөц хуулбар (`backups/`) |
| `npm run admin:password -- <имэйл> "<нууц үг>"` | Админы нууц үг солих / шинэ админ үүсгэх |
| `npm run lint` | Кодын шалгалт |

## Тохиргоо

Бүх тохиргоо `.env` файлд (`cp .env.example .env`). Хувьсагч бүрийн тайлбар **[.env.example](.env.example)**-д бий.
Production горимд `JWT_SECRET`, `PUBLIC_URL` тохируулаагүй эсвэл админы нууц үг `admin123` хэвээр бол сервер асахгүй.

Админ → **⚙️ Тохиргоо** хэсэгт юу тохируулагдсан, юу дутуу байгааг харуулна.

## Боломжууд

**Дэлгүүр**
- 20 ангилал, хайлт, эрэмбэлэлт; бараа бүр өөрийн холбоостой (`/product/12-...`) — Facebook-т хуваалцахад зураг, үнэ гарна
- Сагс → хүргэлтийн мэдээлэл → төлбөр (QPay QR, данс, бэлэн, карт) → баталгаажуулалт
- QPay: QR код, банкны апп-ын холбоос, төлбөр орсныг автоматаар таньж захиалгыг баталгаажуулна
- Бүртгэл, нэвтрэх, нууц үг сэргээх (имэйлээр), профайл, захиалгын түүх, захиалга цуцлах
- Мэдээллийн хуудсууд, холбоо барих форм, хямдралын мэдээ авах

**Админ** (`/admin`)
- Самбар, захиалга (төлөв, төлбөр), бүтээгдэхүүн (олон зураг, нөөц, хуулбар), ангилал
- Хэрэглэгчид (түр нууц үг өгөх), мессеж, мэдээ авагчид
- Тохиргоо: бэлэн байдлын шалгалт, backup, мэдэгдэл турших, нууц үг солих

**Ажиллагаа**
- Шинэ захиалга, төлбөр, мессежийн мэдэгдэл: Telegram + имэйл
- Автомат backup (24 цаг тутам, сүүлийн 14-ийг хадгална)
- `/api/health`, `/sitemap.xml`, `/robots.txt`, хүсэлтийн лог

**Аюулгүй байдал**
- Нэвтрэлт зөвхөн HttpOnly + Secure + SameSite=Strict cookie-д (JavaScript-ээс хүрэхгүй)
- Нууц үг солигдоход бусад бүх нэвтрэлт хүчингүй болно
- CSP, HSTS, X-Frame-Options зэрэг header; nginx-ийн ард жинхэнэ IP (`TRUST_PROXY`)
- Нэвтрэх, бүртгүүлэх, захиалга, мессеж, нууц үг сэргээхэд rate limit
- Зураг upload: файлын агуулгаар төрлийг шалгана, зөвхөн админ

## Фолдерын бүтэц

```
src/
├── App.jsx                   # Дэлгүүрийн гол төлөв, хэсгүүдийг угсрах
├── constants.js              # Брэнд, төлбөр, дэлгүүрийн холбоо барих мэдээлэл
├── lib/                      # api.js, router.js (URL), products.js, categories.js, images.js
├── hooks/                    # useRoute, useCart, useToast, useEsc, useCategories
├── components/
│   ├── common/               # Modal, Icon, Link, ProductImage
│   ├── layout/               # Header, Footer
│   ├── home/                 # Banner, Features, CategoryTiles, Brands
│   ├── products/             # ProductGrid, ProductCard, ProductModal, CategoryStrip
│   ├── cart/                 # CartDrawer, Checkout, PaymentOptions, OrderSuccess ...
│   ├── auth/AuthModal.jsx    # нэвтрэх, бүртгүүлэх, нууц үг мартсан
│   └── account/              # MyOrders, ProfileModal
├── pages/                    # InfoPage, ContactForm, ResetPassword, content
├── admin/                    # Admin, AdminLogin, products/, tabs/ (Settings ...)
└── styles/                   # App.css, admin.css

server/
├── index.js                  # эхлэл: тохиргоо шалгах → seed → listen → backup
├── app.js                    # express app, route-ууд, SEO, dist serve
├── config.js                 # .env унших, бүх тохиргоо
├── db/                       # SQLite холболт, migration, seed
├── lib/                      # jwt, password, validate, slug
├── middleware/               # auth, rateLimit, security, errors
├── services/                 # qpay, payments, notify, mail, backup, images, stock
├── scripts/                  # backup.js, set-admin-password.js
└── routes/                   # auth, account, shop, seo, admin/*

deploy/                       # pm2, nginx, systemd тохиргоо
```

## Анхаарах

* Дансны дугаар, и-мэйл, хаяг нь **жишээ** — `src/constants.js` доторх `SHOP_INFO`.
  Хуулийн текстүүд `src/pages/content.jsx`-д. Онлайн дэлгүүр тул биет хаяг, салбар байхгүй.
* И-баримт (НӨАТ) системтэй холбогдоогүй.
