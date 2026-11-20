# Gooskin — серверт байршуулах заавар

Энэ заавар Ubuntu 22.04/24.04 VPS (жишээ нь DigitalOcean, Hetzner, Mongolia-д байрлах VPS) дээр
`gooskin.mn` домэйнтэйгээр сайтаа ажиллуулах алхмуудыг тайлбарлана.

> **Яагаад VPS?** Database (SQLite) болон барааны зураг сервер дээрх диск дээр хадгалагддаг.
> Vercel, Netlify зэрэг "serverless" үйлчилгээ файлыг хадгалдаггүй тул тохирохгүй.
> Хамгийн бага: 1 CPU, 1GB RAM, 20GB диск.

---

## 1. Бэлтгэл (нэг удаа)

| Юу | Хаана |
| --- | --- |
| Домэйн нэр (`gooskin.mn`) | .mn домэйн бүртгэгч (Datacom, ...) |
| VPS сервер | Hetzner, DigitalOcean, эсвэл дотоодын үйлчилгээ |
| Домэйны `A` бичлэгийг серверийн IP руу заах | Домэйн бүртгэгчийн DNS тохиргоо |
| Telegram бот (захиалгын мэдэгдэл) | Telegram → `@BotFather` → `/newbot` |
| SMTP имэйл (нууц үг сэргээх) | Gmail "App password", Zoho, Mailgun ... |
| QPay merchant гэрээ | QPay ХХК — `QPAY_USERNAME/PASSWORD/INVOICE_CODE` өгнө |

## 2. Сервер бэлдэх

```bash
# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2

# Код татах (Git дээр байршуулсны дараа)
sudo mkdir -p /srv/gooskin && sudo chown $USER /srv/gooskin
git clone <таны-repo-url> /srv/gooskin
cd /srv/gooskin
npm ci
```

> Git ашиглахгүй бол `node_modules`, `dist`, `backups`-ээс бусад файлыг `scp`/`rsync`-ээр хуулна.

## 3. Тохиргоо (.env)

```bash
cp .env.example .env
nano .env
```

Заавал бөглөх:

```ini
NODE_ENV=production
PUBLIC_URL=https://gooskin.mn
JWT_SECRET=   # доорх командаар үүсгэнэ
```

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Telegram, SMTP, QPay-г бэлэн болсон үед нь нэмээд `pm2 restart gooskin` хийнэ.

## 4. Одоогийн өгөгдлөө шилжүүлэх

Компьютер дээрээ backup хийгээд серверт хуулна:

```bash
# Компьютер дээр (minii-site хавтсанд)
npm run backup                         # backups/<огноо>/ үүснэ
scp -r backups/<огноо> user@SERVER:/srv/gooskin/restore

# Сервер дээр
cd /srv/gooskin
cp restore/shop.db server/shop.db
cp -r restore/uploads server/uploads
```

## 5. Админы нууц үг

Сервер `admin123` нууц үгтэй админтай **production горимд асахгүй**. Солих:

```bash
npm run admin:password -- admin@goo.mn "Маш-Хүчтэй-Нууц-Үг-2026"
```

Шинэ имэйлтэй админ үүсгэж болно (хуучныг нь ч солино):

```bash
npm run admin:password -- admin@gooskin.mn "Маш-Хүчтэй-Нууц-Үг-2026"
```

## 6. Build хийж асаах (pm2)

```bash
npm run build
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup          # гарч ирсэн командыг хуулж ажиллуулна (сервер restart хийхэд автоматаар асна)
pm2 logs gooskin     # лог харах
```

Асахдаа тохиргоо дутуу бол сервер юу дутууг бичээд зогсоно — зааврын дагуу засна.

## 7. nginx + HTTPS

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/gooskin
sudo nano /etc/nginx/sites-available/gooskin    # gooskin.mn-г өөрийн домэйноор солино
sudo ln -s /etc/nginx/sites-available/gooskin /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Үнэгүй SSL сертификат
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d gooskin.mn -d www.gooskin.mn
```

Шалгах: `https://gooskin.mn/api/health` → `{"ok":true,...}`

Админ → **⚙️ Тохиргоо** хэсэгт бүх мөр ногоон ✓ болсон байх ёстой.

## 8. Шинэчлэл гаргах

```bash
cd /srv/gooskin
git pull
npm ci
npm run build
pm2 restart gooskin
```

## 9. Backup ба сэргээх

* Сервер `BACKUP_INTERVAL_HOURS` (default 24) цаг тутам `backups/` хавтсанд автоматаар хуулбар хийж,
  сүүлийн `BACKUP_KEEP` (14)-ийг хадгална. Админ → Тохиргоо → "Одоо backup хийх" товчоор гараар хийж болно.
* **Серверээс гадна хадгална!** Диск эвдэрвэл backup ч алга болно. Жишээ нь өдөр бүр компьютер руугаа татах:

  ```bash
  rsync -az user@SERVER:/srv/gooskin/backups/ ~/gooskin-backups/
  ```

* Сэргээх:

  ```bash
  pm2 stop gooskin
  cp backups/<огноо>/shop.db server/shop.db
  rm -rf server/uploads && cp -r backups/<огноо>/uploads server/uploads
  pm2 start gooskin
  ```

## 10. Хяналт

* `https://gooskin.mn/api/health`-г [UptimeRobot](https://uptimerobot.com) (үнэгүй)-д нэмбэл сайт унахад имэйл/SMS ирнэ.
* Лог: `pm2 logs gooskin` эсвэл `logs/` хавтас.

## 11. Google, Facebook

* Google Search Console-д `https://gooskin.mn/sitemap.xml`-г нэмнэ.
* Барааны холбоос (`/product/12-...`)-ыг Facebook-т хуваалцахад нэр, үнэ, зураг нь автоматаар гарна.

---

## Таны өөрөө шийдэх зүйлс

* **И-баримт (НӨАТ):** борлуулалт бүрт и-баримт гаргах үүрэгтэй эсэхийг нягтлан бодогчоосоо тодруулна.
  Энэ систем PosAPI-тэй холбогдоогүй — одоогоор и-баримтыг ebarimt.mn-ээр гараар гаргана.
* **Хуулийн текст:** `src/pages/content.jsx` дахь Үйлчилгээний нөхцөл, Нууцлалын бодлого нь жишээ.
* **Жишээ мэдээлэл:** дансны дугаар, хаяг (`src/constants.js`), салбарууд (`src/pages/content.jsx`),
  "Brand A" гэх мэт жишээ бараа (Админ → Бүтээгдэхүүн).
