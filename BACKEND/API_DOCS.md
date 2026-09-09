# LMS API Documentation - Authentication & Audit Logging

Dokumentasi ini mencakup endpoint authentication (Auth) yang telah diimplementasikan pada Backend Laravel 13 dengan database PostgreSQL (`system` schema).

> **PENTING: Audit Activity Logging**
> Setiap aktivitas auth secara otomatis dicatat ke tabel `"system"."user_activity"` dengan kolom:
> - `user_activity_id` (int8 dari sequence `system.user_activity_id_seq`)
> - `user_activity_user_uuid` (UUID pengguna)
> - `user_activity_action` (`REGISTER`, `LOGIN`, `LOGIN_FAILED`, `LOGOUT`)
> - `user_activity_description` (Keterangan status / error)
> - `user_activity_ip_address` (IP client / requester)
> - `user_activity_create_date` (Timestamp aktivitas)

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

## 1. Register User

Mendaftarkan pengguna baru ke dalam tabel `"system"."users"`. Status pengguna otomatis aktif (`users_status: 1`), `users_uuid` di-generate via UUID v4, dan ID diambil dari `system.users_id_seq`.

- **URL:** `/auth/register`
- **Method:** `POST`
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

Melakukan otentikasi email dan password, memeriksa apakah status user aktif (`users_status === 1`), dan menghasilkan JSON Web Token (JWT).

- **URL:** `/auth/login`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`, `Accept: application/json`
- **Activity Log Action:** 
  - `LOGIN` (jika kredensial valid dan user aktif)
  - `LOGIN_FAILED` (jika password salah, email tidak ditemukan, atau user non-aktif)

### Request Body:
```json
{
  "users_email": "user@example.com",
  "users_password": "password123"
}
```
*(Catatan: Menerima juga field `email` dan `password`)*

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
*(Tercatat di user_activity sebagai `LOGIN_FAILED`)*
```json
{
  "success": false,
  "message": "Email atau password salah",
  "data": null
}
```

### Response Gagal - Akun Non-Aktif (403 Forbidden):
*(Tercatat di user_activity sebagai `LOGIN_FAILED`)*
```json
{
  "success": false,
  "message": "Akun tidak aktif, silakan hubungi administrator",
  "data": null
}
```

---

## 3. Get Current User Profile (Me)

Mengambil data identitas pengguna yang sedang terotentikasi berdasarkan JWT Bearer token yang dikirim.

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

### Response Gagal - Token Tidak Ada / Expired (401 Unauthorized):
```json
{
  "message": "Unauthenticated."
}
```

---

## 4. Logout User

Melakukan invalidasi token JWT sehingga tidak dapat digunakan kembali untuk request berikutnya.

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

## 5. Ringkasan Audit Log Action di `system.user_activity`

| Action | Kapan Dipicu | Deskripsi Contoh |
| :--- | :--- | :--- |
| `REGISTER` | Saat user berhasil registrasi via `/auth/register` | `User successfully registered with email: user@example.com` |
| `LOGIN` | Saat user berhasil login via `/auth/login` | `User successfully logged in` |
| `LOGIN_FAILED` | Saat kredensial salah / user tidak ditemukan | `Invalid credentials for email: user@example.com` |
| `LOGIN_FAILED` | Saat user terdaftar tapi `users_status != 1` | `Account is inactive for email: user@example.com (status: 0)` |
| `LOGOUT` | Saat user melakukan logout via `/auth/logout` | `User logged out` |
