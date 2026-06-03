# HRMS — MySQL Backend

MySQL backend for the Human Resource Management System.

Database name: **HRMS**

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
  DEPARTMENTS ||--o{ EMPLOYEES : has
  POSITIONS ||--o{ EMPLOYEES : assigns
  EMPLOYEES ||--o| USERS : "has account"

  DEPARTMENTS {
    int department_id PK
    varchar depart_name UK
  }

  POSITIONS {
    int position_id PK
    varchar pos_name UK
    varchar required_qualification
  }

  EMPLOYEES {
    int employee_id PK
    varchar emp_first_name
    varchar emp_last_name
    enum emp_gender
    date emp_date_of_birth
    varchar emp_email UK
    varchar emp_telephone
    varchar emp_address
    date emp_hire_date
    enum emp_status
    int department_id FK
    int position_id FK
  }

  USERS {
    int user_id PK
    varchar user_name UK
    varchar password
    int employee_id FK UK
  }
```

`emp_status`: On Leave, Left, Blacklisted, Deceased, On Mission

### Relationships

| Rule | Cardinality | Implementation |
|------|-------------|----------------|
| Employee belongs to one Department | N:1 | `employees.department_id` → `departments.department_id` |
| Department has many Employees | 1:N | FK on employees |
| Employee holds one Position | N:1 | `employees.position_id` → `positions.position_id` |
| Position assigned to many Employees | 1:N | FK on employees |
| User linked to one Employee | 1:1 | `users.employee_id` UNIQUE FK |
| Employee may have one User account | 1:1 | UNIQUE constraint on `employee_id` |

### Field mapping

| Attribute | Database column |
|-----------|-----------------|
| EmpFirstName | `emp_first_name` |
| EmpLastName | `emp_last_name` |
| EmpGender | `emp_gender` |
| EmpDateOfBirth | `emp_date_of_birth` |
| EmpEmail | `emp_email` |
| EmpTelephone | `emp_telephone` |
| EmpAddress | `emp_address` |
| EmpHireDate | `emp_hire_date` |
| EmpStatus | `emp_status` |
| DepartName | `depart_name` |
| PosName | `pos_name` |
| RequiredQualification | `required_qualification` |
| UserName | `user_name` |
| Password | `password` (bcrypt hash) |

## Level 0 DFD (Context Diagram)

See the main [HRMS README](../README.md#level-0-dfd--context-diagram) for the full context diagram and data-flow table.

## Authentication

- **Session**: `express-session` cookie `hrms.sid` after login (exam requirement).
- Middleware accepts either mechanism.

## Setup

```bash
npm install
cp .env.example .env
npm run db:init
npm run dev
```

Create user accounts via the `users` table or the User Accounts page after seeding an initial admin in `schema.sql`.
