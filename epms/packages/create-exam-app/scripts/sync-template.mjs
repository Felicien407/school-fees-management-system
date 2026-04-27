#!/usr/bin/env node
/**
 * Refreshes templates/epms from the live app (epms/backend, epms/frontend, epms/README.md).
 * Run from package root: npm run sync-template
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.join(__dirname, "..");
// epms/packages/create-exam-app/scripts -> .. -> .. -> .. = epms
const EPMS_ROOT = path.join(__dirname, "..", "..", "..");
const DEST = path.join(PKG, "templates", "epms");

const SKIP = new Set(["node_modules", "dist", ".git"]);

function copyTree(src, dest) {
  if (!fs.existsSync(src)) {
    console.error("Missing:", src);
    process.exit(1);
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(name.name)) continue;
    if (name.isFile() && name.name === ".env") continue;
    const s = path.join(src, name.name);
    const d = path.join(dest, name.name);
    if (name.isDirectory()) {
      copyTree(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

for (const dir of ["backend", "frontend"]) {
  const from = path.join(EPMS_ROOT, dir);
  const to = path.join(DEST, dir);
  if (fs.existsSync(to)) fs.rmSync(to, { recursive: true, force: true });
  console.log("Syncing", path.relative(EPMS_ROOT, from), "-> templates/epms/" + dir);
  copyTree(from, to);
}

const readme = path.join(EPMS_ROOT, "README.md");
if (fs.existsSync(readme)) {
  fs.copyFileSync(readme, path.join(DEST, "README.md"));
  console.log("Synced README.md");
}

console.log("Done. Template at:", DEST);
