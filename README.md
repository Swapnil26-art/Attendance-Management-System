# Attendance Management System

A full-stack **Mini Attendance Management System** that lets administrators manage employees and track daily attendance. Built as a Technical Assessment project with a production-ready, **deployable-to-Vercel** architecture.

## ✨ Features

- **Authentication** — JWT based login (`admin` / `admin123`), protected routes, role-based access (Admin).
- **Employee Management** — Add, Edit, Delete, View, **Search**, filter by department/status, **sort**, and **paginate** employees.
- **Attendance Management** — Mark attendance (Present / Absent / Half-Day / Late), view records with filters, **attendance summary**, employee-wise history, and **CSV export**.
- **Dashboard** — Total / Active employees, Present / Absent today, department-wise charts, last-7-day attendance trend, recent attendance.
- **Swagger / OpenAPI** interactive documentation.
- **Responsive UI** — Tailwind CSS, mobile-friendly layout.

## 🛠 Tech Stack

| Layer     | Technology                                             |
|-----------|--------------------------------------------------------|
| Frontend  | React 18 + Vite, Tailwind CSS, Recharts, React Router, Axios |
| Backend   | Node.js + Express, JWT (jsonwebtoken + bcryptjs)        |
| Database  | MySQL 8 (MySQL-compatible — works with TiDB Cloud free serverless) |
| API Docs  | swagger-jsdoc + swagger-ui-express                      |
| Deploy    | Vercel (frontend static + backend serverless function)  |

> **Why MySQL?** The task allows MySQL or PostgreSQL. This repo uses MySQL via the `mysql2` driver. For a fully **free online** database you can use **TiDB Cloud Serverless** (MySQL-compatible, free tier, no credit card).

## 🗂 Project Structure

```
attendance-management-system/
├── api/index.js              # Vercel serverless entry (mounts Express app)
├── vercel.json               # Single-project Vercel config (frontend + API)
├── package.json              # Root: backend deps + convenience scripts
├── .env.example              # Environment template
├── backend/                  # Express REST API (code only; deps live in root)
│   ├── app.js                # Express app (exported, no listen)
│   ├── server.js             # Local dev server (listen) — run via npm run dev:server
│   ├── config/db.js          # MySQL connection pool
│   ├── middleware/           # JWT auth + role guard + error handler
│   ├── controllers/          # auth, employee, attendance, dashboard, department
│   ├── routes/               # Express routers + Swagger annotations
│   ├── database/schema.sql   # Database schema (tables + seed)
│   ├── database/seed.js      # Creates DB/tables + seeds admin & departments
│   ├── utils/swagger.js      # Swagger spec
│   └── .env.example
└── frontend/                 # React (Vite) frontend
    ├── vite.config.js        # Vite + Tailwind + dev proxy (/api → :5000)
    └── src/
        ├── api/              # Axios instance + service modules
        ├── context/          # AuthContext
        ├── components/       # Layout, Sidebar, Topbar, Pagination, Modal, StatCard…
        └── pages/            # Login, Dashboard, Employees, EmployeeForm,
                              # EmployeeDetail, Attendance, MarkAttendance
```

## 🚀 Local Setup

### 1. Prerequisites
- Node.js **18+**
- MySQL **8.x** (local XAMPP/WAMP/MySQL) **or** a TiDB Cloud serverless database

### 2. Database & Backend

```bash
# install all dependencies (root Node deps + frontend)
npm run install:all

# configure backend environment
cp backend/.env.example backend/.env
# edit backend/.env — for local MySQL use:
#   DB_HOST=127.0.0.1  DB_PORT=3306  DB_USER=root  DB_PASSWORD=  DB_NAME=attendance_db  DB_SSL=false

# create tables + seed (admin user + departments)
npm run seed

# start the API on http://localhost:5000
npm run dev:server
```

- API docs (Swagger): http://localhost:5000/api-docs
- Health check: http://localhost:5000/api/health

### 3. Frontend

```bash
# in frontend/ — or leave VITE_API_URL empty (dev uses the Vite proxy)
npm --prefix frontend run dev
# open http://localhost:5173
```

> Login with **`admin` / `admin123`**.

| Env var | Purpose |
|---------|---------|
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL connection |
| `DB_SSL` | `true` for cloud MySQL (TiDB/RDS), `false` for local |
| `JWT_SECRET` | Secret used to sign tokens (use a long random string) |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `24h` |
| `VITE_API_URL` | Frontend API base. Empty → uses relative `/api` |

## 🔌 API Endpoints

All endpoints except `POST /api/auth/login` require a `Authorization: Bearer <token>` header.

| Method | Endpoint                      | Description                                  |
|--------|-------------------------------|----------------------------------------------|
| POST   | `/api/auth/login`             | Login (username, password)                   |
| GET    | `/api/auth/me`                | Get current user                             |
| GET    | `/api/departments`            | List departments (for dropdowns)             |
| GET    | `/api/employees`              | List employees (search, department, status, sort, page, limit) |
| GET    | `/api/employees/:id`          | Get one employee                             |
| POST   | `/api/employees`              | Create employee                              |
| PUT    | `/api/employees/:id`          | Update employee                              |
| DELETE | `/api/employees/:id`          | Delete employee                              |
| GET    | `/api/attendance`             | List attendance (date, employee_id, status, from, to, page, limit) |
| POST   | `/api/attendance`             | Mark attendance (upsert per employee+date)   |
| GET    | `/api/attendance/summary`     | Attendance counts (from/to)                  |
| GET    | `/api/attendance/employee/:id`| Attendance history + summary for one employee|
| GET    | `/api/attendance/export`      | Export attendance as **CSV**                 |
| GET    | `/api/dashboard/stats`        | Dashboard statistics                         |

Interactive docs: **`/api-docs`**.

## ☁️ Deployment to Vercel (Live)

The repo is pre-configured as a **single Vercel project** that serves both the React frontend *and* the Express backend (as a serverless function).

### Step 1 — Free online database (TiDB Cloud)
1. Create a free account at https://tidbcloud.com and create a **Serverless** cluster.
2. Create a database named `attendance_db` via the web console (or run the seed below).
3. Copy the connection details (host, user, password, port **4000**). Enable TLS.

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "Attendance Management System"
git remote add origin https://github.com/<you>/attendance-management-system.git
git push -u origin main
```
> Upload `backend/database/schema.sql` (or run `npm run seed` before deleting the local `.env`).

### Step 3 — Import into Vercel
1. Go to https://vercel.com/new and **Import** your GitHub repository.
2. **Important:** choose the **single-project** option — keep **Root Directory** `./` and do **NOT** use the "Services" multi-app preset. (This repo has only one `package.json` per app and routes the API through the root `api/` serverless function, so it deploys as one project using the root `vercel.json`.)
3. Under **Settings → Environment Variables** add:
   - `DB_HOST` (e.g. `<cluster>.aws.tidbcloud.com`)
   - `DB_PORT` = `4000`
   - `DB_USER`, `DB_PASSWORD`
   - `DB_NAME` = `attendance_db`
   - `DB_SSL` = `true`
   - `JWT_SECRET` = `<a long random string>`
   - `JWT_EXPIRES_IN` = `24h`
4. **Deploy.** Your live app will be at `https://<project>.vercel.app` — the API is available at `https://<project>.vercel.app/api`, and Swagger docs at `/api-docs`.

> Optional: If the database is empty, run the schema + seed once (via TiDB web SQL editor with `schema.sql`, or a one-off `npm run seed` pointed at the cloud DB).

### How the Vercel routing works (`vercel.json`)
- `/api/*` → `api/index.js` (Express serverless function)
- everything else → static Vite build (`frontend/dist`), with SPA fallback to `index.html`.

## ✅ Bonus Features Covered
JWT authentication · Pagination · Search & filtering · Sorting · Responsive UI · Role-based access · Swagger/OpenAPI docs · CSV export · Vercel (cloud) deployment · Normalized schema with FKs/constraints/audit fields.

## 📷 Screenshots


---
Built for assessment with React + Express + MySQL, deployable to Vercel on the free tier.