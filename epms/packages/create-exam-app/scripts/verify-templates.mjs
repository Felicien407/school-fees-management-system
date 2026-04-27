#!/usr/bin/env node
/**
 * Fails the build if templates/projects.json references missing directories.
 * Run before npm pack / npm publish (e.g. via prepack).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = path.join(__dirname, "..", "templates");
const MANIFEST = path.join(TEMPLATES, "projects.json");

const m = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const missing = [];
for (const p of m.projects) {
  const d = path.join(TEMPLATES, p.templateDir);
  if (!fs.existsSync(d)) missing.push(p.templateDir);
}
if (missing.length) {
  console.error("Missing template folder(s) under templates/:");
  for (const t of missing) console.error("  -", t);
  console.error("\nRun: npm run sync-all\nThen retry.");
  process.exit(1);
}
console.log("create-exam-app: all templates in projects.json present.");
process.exit(0);
