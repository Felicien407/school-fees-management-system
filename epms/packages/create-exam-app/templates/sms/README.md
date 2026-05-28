# SmartShop (SMS)

SmartShop (SMS) is a full-stack sales management system:
- Backend: Express + MySQL
- Frontend: React + Vite

This project is prepared to run with `npx`.

## 1) Publish to npm

From this folder (`smartshop(sms)`):

```bash
npm login
npm publish --access public
```

If `smartshop-sms` is already taken on npm, change the `name` in `package.json` first, then publish.

## 2) Run with npx

After publishing:

```bash
npx smartshop-sms setup
npx smartshop-sms dev
```

## 3) Available npx commands

```bash
npx smartshop-sms setup
npx smartshop-sms dev
npx smartshop-sms backend
npx smartshop-sms frontend
npx smartshop-sms build
npx smartshop-sms start
```

## 4) Backend environment

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=student
DB_PASSWORD=
DB_NAME=smartshop_db
JWT_SECRET=smartshop_student_project_secret
```

## 5) Local development without npx (optional)

```bash
npm run setup
npm run dev
```
