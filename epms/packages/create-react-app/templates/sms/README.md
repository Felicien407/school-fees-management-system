# SMS - Sales Management System

This project now supports **dual backends**:

- `backend-mysql/` (MySQL)
- `backend-mongodb/` (MongoDB)
- `frontend/` (React + Vite)

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
