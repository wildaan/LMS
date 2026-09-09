# LMS — Learning Management System

Fullstack take-home test project yang mengimplementasikan module **Authentication** dan **Content Management**.

## Tech Stack

### Backend
- **Laravel 13** (PHP 8.3)
- **JWT Authentication** — [tymon/jwt-auth](https://github.com/tymondesigns/jwt-auth)
- **PostgreSQL** — dengan multi-schema (`system` untuk user/activity, `public` untuk content)

### Frontend
- **Next.js 16** (React 19, TypeScript)
- **Reactstrap** (Bootstrap 5)
- **react-data-table-component** — untuk tabel data dengan sorting & pagination

## Struktur Folder

```
LMS/
├── BACKEND/       → Laravel API (REST)
│   └── README.md  → Instruksi instalasi & menjalankan backend
└── FRONTEND/      → Next.js Client
    └── README.md  → Instruksi instalasi & menjalankan frontend
```

## Fitur

- **Login** — autentikasi user dengan JWT token
- **Register** — registrasi user baru
- **Content Management** — CRUD content dengan search dan pagination
- **User Activity Logging** — pencatatan aktivitas user (login, register, CRUD)

## Instalasi

Lihat instruksi instalasi masing-masing di:

- [BACKEND/README.md](./BACKEND/README.md) — setup & jalankan backend
- [FRONTEND/README.md](./FRONTEND/README.md) — setup & jalankan frontend
