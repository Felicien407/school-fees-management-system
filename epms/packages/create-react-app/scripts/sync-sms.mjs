#!/usr/bin/env node
/**
 * Refreshes templates/sms from ../../../../smartshop(sms) (sibling of epms).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SMS_ROOT = path.join(__dirname, "..", "..", "..", "..", "smartshop(sms)");
const DEST = path.join(__dirname, "..", "templates", "sms");

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

for (const dir of ["backend-mysql", "backend-mongodb", "frontend"]) {
  const from = path.join(SMS_ROOT, dir);
  const to = path.join(DEST, dir);
  if (fs.existsSync(to)) fs.rmSync(to, { recursive: true, force: true });
  console.log("Syncing smartshop(sms)/" + dir, "-> templates/sms/" + dir);
  copyTree(from, to);
}

for (const legacy of ["backend"]) {
  const legacyPath = path.join(DEST, legacy);
  if (fs.existsSync(legacyPath)) {
    fs.rmSync(legacyPath, { recursive: true, force: true });
    console.log("Removed legacy templates/sms/" + legacy);
  }
}

const readme = path.join(SMS_ROOT, "README.md");
if (fs.existsSync(readme)) {
  fs.copyFileSync(readme, path.join(DEST, "README.md"));
  console.log("Synced smartshop(sms) README.md");
}

for (const backendDir of ["backend-mysql", "backend-mongodb"]) {
  const envExample = path.join(SMS_ROOT, backendDir, ".env.example");
  const env = path.join(SMS_ROOT, backendDir, ".env");
  const envExampleDest = path.join(DEST, backendDir, ".env.example");
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envExampleDest);
    console.log(`Synced ${backendDir} .env.example`);
  } else if (fs.existsSync(env)) {
    fs.copyFileSync(env, envExampleDest);
    console.log(`Created ${backendDir} .env.example from ${backendDir} .env`);
  }
}

console.log("Done:", DEST);
