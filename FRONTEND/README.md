# Frontend — Next.js Client

## Requirement

- Node.js >= 22
- npm (atau bun)

## Instalasi

### 1. Masuk folder & install dependencies

```bash
cd FRONTEND
npm install
```

### 2. Konfigurasi environment

Copy file `.env.example` atau buat file `.env.local` secara manual:

```bash
cp .env.example .env.local
```

Isi variabel berikut, arahkan ke URL backend yang sudah berjalan:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Jalankan development server

```bash
npm run dev
```

Buka di browser: `http://localhost:3000` (default).

## Halaman yang Tersedia

| Route | Keterangan |
|---|---|
| `/login` | Halaman login |
| `/register` | Halaman registrasi |
| `/dashboard` | Dashboard utama (perlu login) |
| `/content` | Manajemen content — CRUD, search, pagination (perlu login) |
