# SMS App (SmartShop)

SMS is a full-stack sales management app:

- Backend: Express + MySQL
- Frontend: React + Vite

## 1) Requirements

- Node.js 18+
- MySQL running on your machine

## 2) Configure environment

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=smartshop_db
JWT_SECRET=smartshop_student_project_secret
```

## 3) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 4) Create database tables

From the `backend` folder:

```bash
npm run db:init
```

## 5) Run the app

Start backend:

```bash
cd backend
npm run dev
```

Start frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the frontend URL shown by Vite (usually `http://localhost:5173`).



