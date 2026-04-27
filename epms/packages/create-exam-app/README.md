# create-exam-app

Scaffolds a project: `backend/`, `frontend/`, `README.md`, `.env` and `backend/.env` (from `backend/.env.example` when needed).

## Users

```bash
npx create-exam-app
# optional: folder name (default is epms-app / sims-app for the template you pick)
npx create-exam-app my-folder
```

- Prints a **short numbered list** (`[1]`, `[2]`, …).
- If there is more than one template, type a number and Enter at `Pick (1–N):` (or Enter for `1`). One template = no question.
- Output: **`Done: <path>`** — then `npm i` and `npm run dev` in `backend` and `frontend` (ports are in that project’s `README`).

## Templates (manifest)

| Order | ID   | Name  | When to use |
|------:|------|-------|-------------|
| 1     | epms | EPMS  | Payroll, departments, employees, salary CRUD, monthly report |
| 2     | sims | SIMS  | Spare parts, stock in, stock out (out CRUD), daily stock reports |
| 3     | sfms | SFMS  | School fees: auth, students, payments, date-range reports |

The live list in the CLI is driven by `templates/projects.json` — add a `projects[]` entry and a matching `templates/<templateDir>/` folder to ship another exam.

## Maintainer: sync templates (required before pack/publish)

Package path: `exams-p/epms/packages/create-exam-app` (or your clone’s equivalent).

```bash
cd epms/packages/create-exam-app
npm run sync-all
npm run verify
```

- `sync-epms` — copies from `epms/backend` and `epms/frontend` into `templates/epms/`
- `sync-sims` — copies from `sims/backend` and `sims/frontend` into `templates/sims/` (expects `sims` next to `exams-p/epms` in the repo layout)
- `sync-sfms` — copies from `sfms/backend` and `sfms/frontend` into `templates/sfms/` (expects `sfms` next to `exams-p/epms` in the repo layout)

`prepack` runs `verify` so `npm pack` and `npm publish` **fail** if any `projects.json` entry has no `templates/<templateDir>` folder. Always run `sync-all` when sources change, then ship.

## Publish to npm (checklist)

1. `npm run sync-all` and `npm run verify`
2. Bump `version` in this folder’s `package.json` (semver)
3. `npm pack` and inspect the tarball, or `npm publish --dry-run`
4. `npm login` (scope registry if you use a scope)
5. `npm publish --access public`  
   (Use `--access public` for an unscoped name like `create-exam-app` so it is installable without scope.)

If publish fails in `prepack`, run `sync-all` and confirm `templates/epms`, `templates/sims`, and `templates/sfms` each exist with `backend/` and `frontend/`.

## License

MIT
