# Library Management System (LMS)

School library web app: books, students, borrowing, returns, and reports. Supports **MySQL** or **MongoDB**.

## Project layout

```
lms/
├── frontend/          # React + Vite (port 5828)
├── backend-mysql/     # Express + MySQL (port 5827)
└── backend-mongodb/   # Express + MongoDB (port 5827)
```

Run **one** backend at a time on port 5827.

## Installation

```bash
cd backend-mysql && npm install
cd ../backend-mongodb && npm install
cd ../frontend && npm install
```

## Database setup (MySQL)

```bash
cd backend-mysql
cp .env.example .env
npm run db:init
```

Database name: **LMS**

## Run development

**MySQL API:**

```bash
cd backend-mysql && npm run dev
```

**MongoDB API** (default URI: `mongodb://127.0.0.1:27017/lms`):

```bash
cd backend-mongodb && npm run dev
```

**Frontend:**

```bash
cd frontend && npm run dev
```

Open **[http://localhost:5828](http://localhost:5828)** — API at **[http://localhost:5827](http://localhost:5827)**.

On startup each backend seeds demo users (and sample students/books on an empty database).

## Demo logins

| Role      | Username    | Password       |
| --------- | ----------- | -------------- |
| Admin     | `admin`     | `admin123`     |
| Librarian | `librarian` | `librarian123` |

- **Admin** — manage students and books, all features  
- **Librarian** — borrow, return, search, reports

## Environment variables

### backend-mysql

| Variable        | Description        |
| --------------- | ------------------ |
| PORT            | API port (5827)    |
| DB_HOST         | MySQL host         |
| DB_USER         | MySQL user         |
| DB_PASSWORD     | MySQL password     |
| DB_NAME         | Database (LMS)     |
| SESSION_SECRET  | Session signing    |
| FRONTEND_URL    | CORS origin        |

### backend-mongodb

| Variable        | Description        |
| --------------- | ------------------ |
| PORT            | API port (5827)    |
| MONGO_URI       | MongoDB connection |
| SESSION_SECRET  | Session signing    |
| FRONTEND_URL    | CORS origin        |
