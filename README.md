# exams-p

Workspace for exam / practice projects.

## Projects in this repo


| Folder         | Name     | What                                                |
| -------------- | -------- | --------------------------------------------------- |
| [epms/](epms/) | **EPMS** | Employee payroll (MongoDB, Express, React)          |
| [sims/](sims/) | **SIMS** | Stock inventory, spare parts, stock in/out, reports |
| [sfms/](sfms/) | **SFMS** | School fee management (students, payments, reports) |


## `create-exam-app` (npm)

The CLI is in `**epms/packages/create-exam-app`**. One published package can scaffold **EPMS**, **SIMS**, or **SFMS** (user picks from a list).

- How to run, **which template to choose**, and publish: **[epms/packages/create-exam-app/README.md](epms/packages/create-exam-app/README.md)**
- Before publish, refresh all templates and verify: `cd epms/packages/create-exam-app && npm run sync-all && npm run verify`

```bash
npx create-exam-app
# choose [1] EPMS, [2] SIMS, or [3] SFMS, then your folder name
```

### Per-project docs

- [epms/README.md](epms/README.md) — payroll (EPMS)
- [sims/README.md](sims/README.md) — stock inventory (SIMS)
- [sfms/README.md](sfms/README.md) — school fees (SFMS)

