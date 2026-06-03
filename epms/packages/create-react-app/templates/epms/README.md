# Employee Payroll Management System (EPMS)

National Practical Exam template — Software Development (TSS).

## ERD

| Entity | Primary Key | Attributes |
|--------|-------------|------------|
| **Department** | `departmentCode` | departmentName |
| **Employee** | `employeeNumber` | firstName, lastName, address, position, telephone, gender, hiredDate, departmentCode (FK) |
| **Salary** | `salary_id` | grossSalary, totalDeduction, netSalary, monthOfPayment, employeeNumber (FK) |

Relationships:
- Department (1) — (M) Employee
- Employee (1) — (M) Salary

## Exam rules implemented

| Form | Insert | Update / Delete / List |
|------|--------|-------------------------|
| Employee | Yes | List only |
| Department | Yes | List only |
| Salary | Yes | Full CRUD |

- Menu: **Employee**, **Department**, **Salary**, **Reports**, **Logout**
- Auth: username + password (JWT)
- Reports: daily (date picker), weekly (start/end date), monthly (month picker)
- Stack: React + Tailwind + Axios + Express + MySQL or MongoDB

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

Database name: **EPMS**

## Run development server

MySQL API (port 5555):

```bash
cd backend-mysql && npm run dev
```

MongoDB API (port 5555 — run one backend at a time):

```bash
cd backend-mongodb && npm run dev
```

Frontend (port 5173):

```bash
cd frontend && npm run dev
```

Default login: `admin` / `admin123`

## Environment variables

### backend-mysql

| Variable | Description |
|----------|-------------|
| PORT | API port (5555) |
| JWT_SECRET | JWT secret |
| DB_HOST | MySQL host |
| DB_USER | MySQL user |
| DB_PASSWORD | MySQL password |
| DB_NAME | EPMS |
| DB_PORT | MySQL port |

### backend-mongodb

| Variable | Description |
|----------|-------------|
| PORT | API port (5555) |
| JWT_SECRET | JWT secret |
| MONGO_URI | MongoDB URI (database: EPMS) |

## API endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET/POST /api/departments
- GET/POST /api/employees
- GET/POST/PUT/DELETE /api/salaries
- GET /api/reports?period=daily&date=YYYY-MM-DD
- GET /api/reports?period=weekly&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
- GET /api/reports?period=monthly&month=YYYY-MM

## Folder structure

```
epms/
├── README.md
├── frontend/
├── backend-mysql/
└── backend-mongodb/
```

Save your exam folder as: `FirstName_LastName_National_Practical_Exam_2026`
