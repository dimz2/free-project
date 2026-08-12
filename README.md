# Variant Gallery (auto-persist)

Versi ini nyimpen data di Redis (Upstash) lewat API route Next.js. Create/edit/hapus
character langsung ke-save ke server buat semua orang yang buka situsnya — gak perlu
export file + commit-push manual lagi.

## Setup

1. `npm install`
2. Buat Redis database gratis di https://console.upstash.com → tab **REST API** → copy
   `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN`
3. Copy `.env.local.example` → `.env.local`, isi:
   - `ADMIN_PASSWORD` — password admin lo (ganti dari default)
   - `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` dari step 2
4. `npm run dev` → buka http://localhost:3000

## Deploy ke Vercel

1. Push folder ini ke repo GitHub
2. Import repo di https://vercel.com/new
3. Di Vercel Project Settings → **Environment Variables**, tambahin 3 variable yang sama
   kayak `.env.local` (`ADMIN_PASSWORD`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
4. Deploy

Data 4 character awal otomatis ke-seed ke Redis pas pertama kali situsnya diakses
(kalau Redis-nya masih kosong).

## Kenapa ini lebih aman dari versi HTML statis

`ADMIN_PASSWORD` cuma ada di environment variable server — gak pernah dikirim ke
browser sama sekali (beda sama versi sebelumnya yang ngirim hash password ke semua
visitor). Tiap create/edit/hapus, browser kirim password ke `/api/data`, server yang
ngecek. Kalau salah, ditolak (401), gak ada yang ke-save.

## Struktur

- `app/page.js` — UI gallery + admin panel (React, client-side)
- `app/api/data/route.js` — GET (baca data, publik) & POST (simpan data, butuh password)
- `app/api/auth/route.js` — cek password buat gate admin
- `lib/redis.js` — koneksi ke Upstash Redis
