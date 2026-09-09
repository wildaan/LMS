# Backend — Laravel API

## Requirement

- PHP >= 8.3
- Composer
- PostgreSQL

## Instalasi

### 1. Masuk folder & install dependencies

```bash
cd BACKEND
composer install
```

### 2. Konfigurasi environment

```bash
cp .env.example .env
```

Buka file `.env`, isi konfigurasi database:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=adhivasindo
DB_USERNAME=postgres
DB_PASSWORD=
```

Pastikan database sudah dibuat sebelum menjalankan migration. Migration akan otomatis membuat semua tabel (`users`, `user_activity`, `content`) di schema `public` (default PostgreSQL).

### 3. Generate key & JWT secret

```bash
php artisan key:generate
php artisan jwt:secret
```

### 4. Jalankan migration

```bash
php artisan migrate
```

Migration akan membuat tabel `users`, `user_activity`, dan `content` beserta sequence-nya menggunakan raw SQL.

### 5. Jalankan server

```bash
php artisan serve
```

Server berjalan di `http://localhost:8000` (default).

## Catatan

Dokumentasi endpoint API lengkap tersedia di file [API_DOCS.md](./API_DOCS.md).
