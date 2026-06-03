#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.join(__dirname, "..");
const REPO = path.join(__dirname, "..", "..", "..", "..");

const projects = [
  { id: "stockhub-sms", source: "stockhub-sms" },
  { id: "srms", source: "srms" },
  { id: "scms", source: "scms" },
  { id: "epms", source: "epms" },
  { id: "hrms", source: "hrms" },
];

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
    if (name.isDirectory()) copyTree(s, d);
    else fs.copyFileSync(s, d);
  }
}

for (const { id, source } of projects) {
  const root = path.join(REPO, source);
  const dest = path.join(PKG, "templates", id);
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });

  for (const dir of ["frontend", "backend-mysql", "backend-mongodb"]) {
    console.log(`Syncing ${source}/${dir} -> templates/${id}/${dir}`);
    copyTree(path.join(root, dir), path.join(dest, dir));
  }

  const readme = path.join(root, "README.md");
  if (fs.existsSync(readme)) fs.copyFileSync(readme, path.join(dest, "README.md"));

  for (const backend of ["backend-mysql", "backend-mongodb"]) {
    const envExample = path.join(root, backend, ".env.example");
    if (fs.existsSync(envExample)) {
      fs.copyFileSync(envExample, path.join(dest, backend, ".env.example"));
    }
  }

  console.log("Done:", dest);
}
