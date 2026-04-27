# Employee Payroll Management System (EPMS)

Simple full-stack web app for managing employee payroll using MongoDB.

## Create a new project from npm (recommended)

This repo includes the **`create-exam-app`** package. After you publish it, anyone can run:

```bash
npx create-exam-app
# or: npx create-exam-app my-folder-name
```

They get a **list of all exam templates** (EPMS is the first), pick one, then a new folder with:

- **`backend/`** — Express + MongoDB  
- **`frontend/`** — React + Vite + Tailwind  
- **`README.md`**  
- **`.env`** at project root and **`backend/.env`** (same values; created from `backend/.env.example` if needed)

### Where the npm package lives

- Code: `epms/packages/create-exam-app/`
- **User guide (full list, what to pick, ports, publish checklist):** [packages/create-exam-app/README.md](packages/create-exam-app/README.md)
- Publish: `cd epms/packages/create-exam-app` → `npm run sync-all` → `npm run verify` → `npm publish --access public` (see that README for details)

## Repository layout (for maintainers)

| Path | Role |
|------|------|
| `epms/backend/`, `epms/frontend/` | Live EPMS app (develop here) |
| `epms/packages/create-exam-app/` | npm CLI + `templates/epms/` snapshot |

### Refresh the templates before publishing

From `epms/packages/create-exam-app`:

```bash
npm run sync-all
```

- `npm run sync-epms` — updates `templates/epms` from this `epms` folder  
- `npm run sync-sims` — updates `templates/sims` from `../../sims` (sibling folder)

Or manually (EPMS only):

```bash
cd epms
rsync -a --delete --exclude=node_modules --exclude=dist --exclude=.env \
  backend/ packages/create-exam-app/templates/epms/backend/
rsync -a --delete --exclude=node_modules --exclude=dist --exclude=.env \
  frontend/ packages/create-exam-app/templates/epms/frontend/
cp README.md packages/create-exam-app/templates/epms/README.md
```

### Add another exam project later

1. Add a new folder under `epms/packages/create-exam-app/templates/<id>/` (same layout: `backend/`, `frontend/`, `README.md`, `backend/.env.example`).
2. Add an entry in `templates/projects.json` (`id`, `templateDir`, `name`, `title`, `description`).
3. Bump version and `npm publish`.

## Project Structure (EPMS in this folder)

- `backend`: Node.js + Express + MongoDB (Mongoose) + session authentication
- `frontend`: React + React Router + Axios + Tailwind CSS

## Main Features

- User authentication (register, login, logout, reset password)
- Department form (save and list departments)
- Employee form (save and list employees)
- Salary form (save, list, update, delete salary records)
- Monthly payroll report (First Name, Last Name, Position, Department, Net Salary)

## Database (MongoDB)

Collections used:

- `users`
- `departments`
- `employees`
- `salaries`
- `sessions`

## Run the Project

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

## Exam Note

- ERD (Entity Relationship Diagram): **I will draw it manually on paper**.
- Backend uses MongoDB as required by the exam checklist.
- Forms include simple input validation.

## Simple ERD Guide (for drawing on paper)

Use this section when drawing your ERD manually.

### 1) `User` table

Fields:

- `userId` (PK)
- `username`
- `passwordHash`

Note:

- Keep `User` as a standalone table in ERD (no relationship line to other tables).

### 2) `Department` table

Fields:

- `departmentId` (PK)
- `departmentCode`
- `departmentName`
- `grossSalary`
- `totalDeduction`

### 3) `Employee` table

Fields:

- `employeeId` (PK)
- `employeeNumber`
- `firstName`
- `lastName`
- `position`
- `address`
- `telephone`
- `gender`
- `hiredDate`
- `departmentId` (FK -> `Department.departmentId`)

### 4) `Salary` table

Fields:

- `salaryId` (PK)
- `employeeId` (FK -> `Employee.employeeId`)
- `departmentId` (FK -> `Department.departmentId`)
- `grossSalary`
- `totalDeduction`
- `netSalary`
- `month`

## Relationships (Cardinality)

- One `Department` has many `Employees` -> **1 : N**
- One `Employee` has many `Salary` records -> **1 : N**
- One `Department` has many `Salary` records -> **1 : N**

## How to draw quickly

1. Draw 4 entity boxes: `User`, `Department`, `Employee`, `Salary`.
2. Write PK at the top of each box.
3. Put FK fields in `Employee` and `Salary`.
4. Connect:
   - `Department.departmentId` -> `Employee.departmentId`
   - `Department.departmentId` -> `Salary.departmentId`
   - `Employee.employeeId` -> `Salary.employeeId`
5. Leave `User` without relationship lines.
6. Mark each connection with `1` on parent side and `N` on child side.
