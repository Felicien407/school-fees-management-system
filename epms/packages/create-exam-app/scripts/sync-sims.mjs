#!/usr/bin/env node
/**
 * Refreshes templates/sims from ../../sims (sibling of epms).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.join(__dirname, "..");
const SIMS_ROOT = path.join(__dirname, "..", "..", "..", "..", "sims");
const DEST = path.join(PKG, "templates", "sims");

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
  const from = path.join(SIMS_ROOT, dir);
  const to = path.join(DEST, dir);
  if (fs.existsSync(to)) fs.rmSync(to, { recursive: true, force: true });
  console.log("Syncing sims/" + dir, "-> templates/sims/" + dir);
  copyTree(from, to);
}

const readme = path.join(SIMS_ROOT, "README.md");
if (fs.existsSync(readme)) {
  fs.copyFileSync(readme, path.join(DEST, "README.md"));
  console.log("Synced sims README.md");
}
console.log("Done:", DEST);
