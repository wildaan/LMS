# LMS API Documentation - Authentication & Content Management

Dokumentasi ini mencakup endpoint Authentication (Auth) dan Content Management (CRUD) yang diimplementasikan pada Backend Laravel 13 dengan database PostgreSQL.

> **Catatan:** Semua tabel (`users`, `user_activity`, `content`) beserta sequence-nya berada di schema `public` (default PostgreSQL).

---

## Base URL
```
http://localhost:8000/api
```

Format standar response JSON:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null
}
```

---

# BAGIAN 1: AUTHENTICATION

## 1. Register User

Mendaftarkan pengguna baru ke dalam tabel `users`. Status pengguna otomatis aktif (`users_status: 1`), `users_uuid` di-generate via UUID v4, dan ID diambil dari sequence `users_id_seq`. Aktivitas dicatat ke audit log dengan action `REGISTER`.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Auth:** Public (tanpa token)
- **Headers:** `Content-Type: application/json`, `Accept: application/json`
- **Activity Log Action:** `REGISTER`

### Request Body:
```json
{
  "users_email": "user@example.com",
  "users_user_name": "John Doe",
  "users_password": "password123",
  "users_password_confirmation": "password123"
}
```
*(Catatan: Controller juga fleksibel menerima `email`, `name`, `password`, `password_confirmation`)*

### Response Sukses (201 Created):
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "users_id": 1,
    "users_uuid": "c9a4bb38-4e89-4d6c-b39b-e7b4588e3647",
    "users_email": "user@example.com",
    "users_user_name": "John Doe",
    "users_status": 1,
    "users_create_date": "2026-09-09T09:15:00.000000Z"
  }
}
```

### Response Error Validasi (422 Unprocessable Content):
```json
{
  "success": false,
  "message": "Validasi gagal",
  "data": {
    "users_email": ["Email sudah terdaftar."],
    "users_password": ["Konfirmasi password tidak cocok."]
  }
}
```

---

## 2. Login User

Melakukan otentikasi email dan password, memeriksa status aktif (`users_status === 1`), dan menghasilkan JWT Bearer Token.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth:** Public
- **Headers:** `Content-Type: application/json`, `Accept: application/json`
- **Activity Log Action:** `LOGIN` / `LOGIN_FAILED`

### Request Body:
```json
{
  "users_email": "user@example.com",
  "users_password": "password123"
}
```

### Response Sukses (200 OK):
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "users_id": 1,
      "users_uuid": "c9a4bb38-4e89-4d6c-b39b-e7b4588e3647",
      "users_email": "user@example.com",
      "users_user_name": "John Doe",
      "users_status": 1
    }
  }
}
```

### Response Gagal - Kredensial Salah (401 Unauthorized):
```json
{
  "success": false,
  "message": "Email atau password salah",
  "data": null
}
```

---

## 3. Get Current User Profile (Me)

Mengambil data identitas pengguna yang sedang login berdasarkan JWT Bearer token.

- **URL:** `/auth/me`
- **Method:** `GET`
- **Headers:** 
  - `Authorization: Bearer <access_token>`
  - `Accept: application/json`

### Response Sukses (200 OK):
```json
{
  "success": true,
  "message": "Data profil berhasil diambil",
  "data": {
    "users_id": 1,
    "users_uuid": "c9a4bb38-4e89-4d6c-b39b-e7b4588e3647",
    "users_email": "user@example.com",
    "users_user_name": "John Doe",
    "users_status": 1,
    "users_create_date": "2026-09-09T09:15:00.000000Z"
  }
}
```

---

## 4. Logout User

Melakukan invalidasi token JWT.

- **URL:** `/auth/logout`
- **Method:** `POST`
- **Headers:** 
  - `Authorization: Bearer <access_token>`
  - `Accept: application/json`
- **Activity Log Action:** `LOGOUT`

### Response Sukses (200 OK):
```json
{
  "success": true,
  "message": "Logout berhasil",
  "data": null
}
```

---

# BAGIAN 2: CONTENT MANAGEMENT

Semua endpoint Content Management di bawah ini berada di bawah prefix `/content` dan diproteksi dengan JWT middleware (`auth:api`).

Headers Wajib:
- `Authorization: Bearer <access_token>`
- `Accept: application/json`

---

## 1. List Contents (Search & Pagination)

Mengambil daftar konten aktif (`content_status = 1`) dengan fitur pencarian teks (ILIKE pada `content_title` dan `content_description`) serta paginasi server-side.

- **URL:** `/content`
- **Method:** `GET`
- **Query Parameters:**
  - `search` (string, optional): Kata kunci pencarian judul atau deskripsi konten
  - `page` (integer, optional, default: `1`): Nomor halaman
  - `per_page` (integer, optional, default: `10`, max: `100`): Jumlah data per halaman

### Contoh Request URL:
```
GET /api/content?search=laravel&page=1&per_page=10
```

### Response Sukses (200 OK):
```json
{
  "success": true,
  "message": "Daftar konten berhasil diambil",
  "data": {
    "items": [
      {
        "content_id": 1,
        "content_uuid": "39e65167-47de-4dad-88d3-85528f161425",
        "content_title": "Tutorial Laravel 13 & PostgreSQL",
        "content_description": "Panduan lengkap pembuatan REST API dengan modul otentikasi JWT dan multi-schema PostgreSQL.",
        "content_category": "Teknologi",
        "content_status": 1,
        "content_create_date": "2026-09-09T13:20:00.000000Z",
        "content_create_by": "c9a4bb38-4e89-4d6c-b39b-e7b4588e3647",
        "content_update_date": null,
        "content_update_by": null
      }
    ],
    "total": 1,
    "current_page": 1,
    "per_page": 10,
    "last_page": 1
  }
}
```

---

## 2. Create Content

Menambahkan data konten baru ke tabel `content`.
- `content_id` di-generate via sequence `content_id_seq`
- `content_uuid` di-generate via UUID v4
- `content_status` otomatis bernilai `1` (aktif)
- `content_create_by` otomatis diisi dengan `users_uuid` dari user yang sedang login

- **URL:** `/content`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

### Request Body:
```json
{
  "content_title": "Dasar-Dasar React & Next.js",
  "content_description": "Memahami konsep Server Components dan Client Components.",
  "content_category": "Pemrograman"
}
```

### Response Sukses (201 Created):
```json
{
  "success": true,
  "message": "Konten berhasil dibuat",
  "data": {
    "content_id": 2,
    "content_uuid": "8b51d3cb-b09e-4c75-8025-0ee72e44d5ff",
    "content_title": "Dasar-Dasar React & Next.js",
    "content_description": "Memahami konsep Server Components dan Client Components.",
    "content_category": "Pemrograman",
    "content_status": 1,
    "content_create_date": "2026-09-09T13:25:00.000000Z",
    "content_create_by": "c9a4bb38-4e89-4d6c-b39b-e7b4588e3647",
    "content_update_date": null,
    "content_update_by": null
  }
}
```

### Response Error Validasi (422 Unprocessable Content):
```json
{
  "success": false,
  "message": "Validasi gagal",
  "data": {
    "content_title": ["Judul konten wajib diisi."]
  }
}
```

---

## 3. Detail Content

Mengambil data satu konten aktif berdasarkan `content_id`.

- **URL:** `/content/{id}`
- **Method:** `GET`

### Response Sukses (200 OK):
```json
{
  "success": true,
  "message": "Detail konten berhasil diambil",
  "data": {
    "content_id": 1,
    "content_uuid": "39e65167-47de-4dad-88d3-85528f161425",
    "content_title": "Tutorial Laravel 13 & PostgreSQL",
    "content_description": "Panduan lengkap pembuatan REST API...",
    "content_category": "Teknologi",
    "content_status": 1,
    "content_create_date": "2026-09-09T13:20:00.000000Z",
    "content_create_by": "c9a4bb38-4e89-4d6c-b39b-e7b4588e3647",
    "content_update_date": null,
    "content_update_by": null
  }
}
```

### Response Tidak Ditemukan (404 Not Found):
```json
{
  "success": false,
  "message": "Konten tidak ditemukan",
  "data": null
}
```

---

## 4. Update Content

Memperbarui data konten. Kolom `content_update_date` dan `content_update_by` otomatis diperbarui sesuai identitas user yang sedang login.

- **URL:** `/content/{id}`
- **Method:** `PUT`
- **Headers:** `Content-Type: application/json`

### Request Body:
```json
{
  "content_title": "Tutorial Laravel 13 & PostgreSQL (Revisi 2026)",
  "content_description": "Deskripsi yang telah diperbarui.",
  "content_category": "Teknologi & Backend"
}
```

### Response Sukses (200 OK):
```json
{
  "success": true,
  "message": "Konten berhasil diperbarui",
  "data": {
    "content_id": 1,
    "content_uuid": "39e65167-47de-4dad-88d3-85528f161425",
    "content_title": "Tutorial Laravel 13 & PostgreSQL (Revisi 2026)",
    "content_description": "Deskripsi yang telah diperbarui.",
    "content_category": "Teknologi & Backend",
    "content_status": 1,
    "content_create_date": "2026-09-09T13:20:00.000000Z",
    "content_create_by": "c9a4bb38-4e89-4d6c-b39b-e7b4588e3647",
    "content_update_date": "2026-09-09T13:30:00.000000Z",
    "content_update_by": "c9a4bb38-4e89-4d6c-b39b-e7b4588e3647"
  }
}
```

---

## 5. Delete Content (Soft Delete)

Menghapus konten secara soft-delete dengan mengubah `content_status = 0`. Data row tidak dihapus secara fisik dari database.

- **URL:** `/content/{id}`
- **Method:** `DELETE`

### Response Sukses (200 OK):
```json
{
  "success": true,
  "message": "Konten berhasil dihapus",
  "data": null
}
```

### Response Tidak Ditemukan (404 Not Found):
```json
{
  "success": false,
  "message": "Konten tidak ditemukan",
  "data": null
}
```

---

## Ringkasan Audit Log Action di `user_activity`

| Action | Kapan Dipicu | Deskripsi Contoh |
| :--- | :--- | :--- |
| `REGISTER` | Saat user berhasil registrasi via `/auth/register` | `User successfully registered with email: user@example.com` |
| `LOGIN` | Saat user berhasil login via `/auth/login` | `User successfully logged in` |
| `LOGIN_FAILED` | Saat kredensial salah / user tidak ditemukan | `Invalid credentials for email: user@example.com` |
| `LOGIN_FAILED` | Saat user terdaftar tapi `users_status != 1` | `Account is inactive for email: user@example.com (status: 0)` |
| `LOGOUT` | Saat user melakukan logout via `/auth/logout` | `User logged out` |
