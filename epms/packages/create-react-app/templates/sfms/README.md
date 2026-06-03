# SFMS — School Fee Management System

MongoDB or MySQL + Express + React: JWT auth, students, payments, and date-range reports.

## Project layout

```
sfms/
├── frontend/          # React + Vite (port 5173)
├── backend-mysql/     # Express + MySQL (port 5000)
└── backend-mongodb/   # Express + MongoDB (port 5000)
```

Run **one** backend at a time on port 5000.

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

Database name: **SFMS**

## Run development

**MySQL API:**

```bash
cd backend-mysql && npm run dev
```

**MongoDB API** (default URI: `mongodb://127.0.0.1:27017/sfms`):

```bash
cd backend-mongodb && npm run dev
```

**Frontend** (proxies `/api` to backend `PORT` from `.env`):

```bash
cd frontend && npm run dev
```

Open http://localhost:5173

## Environment variables

### backend-mysql

| Variable | Description |
|----------|-------------|
| PORT | API port (5000) |
| DB_HOST, DB_USER, DB_PASSWORD, DB_NAME | MySQL connection |
| JWT_SECRET | JWT signing secret |

### backend-mongodb

| Variable | Description |
|----------|-------------|
| PORT | API port (5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | JWT signing secret |
