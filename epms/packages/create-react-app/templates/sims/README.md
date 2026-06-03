# SIMS - Stock Inventory Management System

This project now supports **dual backends** like other exam projects:

- `backend-mysql/` (MySQL)
- `backend-mongodb/` (MongoDB)
- `frontend/` (React + Vite)

The frontend API URL remains `http://localhost:5001/api`.

## Run (MySQL)

```bash
cd backend-mysql
cp .env.example .env
npm install
npm run db:init
npm run dev
```

## Run (MongoDB)

```bash
cd backend-mongodb
cp .env.example .env
npm install
npm run dev
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Default login: `admin` / `admin123`
