#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.join(__dirname, "..");
const TEMPLATES = path.join(PKG_ROOT, "templates");
const MANIFEST = path.join(TEMPLATES, "projects.json");
const ACCESS_PASSWORD =
  process.env.CREATE_TEST_APPS_PASSWORD ||
  process.env.CREATE_REACT_APP_PASSWORD ||
  "icyizamine";
const MAX_PASSWORD_ATTEMPTS = 3;

function question(rl, prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function verifyAccess() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (let attempt = 1; attempt <= MAX_PASSWORD_ATTEMPTS; attempt += 1) {
      const input = await question(rl, "Enter access password: ");
      if (input === ACCESS_PASSWORD) {
        return true;
      }
      console.error("Incorrect password.");
    }
    return false;
  } finally {
    rl.close();
  }
}

function copyTree(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, name.name);
    const d = path.join(dest, name.name);
    if (name.isDirectory()) {
      if (name.name === "node_modules" || name.name === "dist" || name.name === ".git") continue;
      copyTree(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function ensureEnvFromExample(projectRoot) {
  const candidates = ["backend-mysql", "backend-mongodb", "backend-project", "backend"];
  for (const name of candidates) {
    const backend = path.join(projectRoot, name);
    if (!fs.existsSync(backend)) continue;
    const example = path.join(backend, ".env.example");
    const envFile = path.join(backend, ".env");
    if (fs.existsSync(example) && !fs.existsSync(envFile)) {
      fs.copyFileSync(example, envFile);
    }
  }
  const mysqlEnv = path.join(projectRoot, "backend-mysql", ".env");
  const rootEnv = path.join(projectRoot, ".env");
  if (fs.existsSync(mysqlEnv) && !fs.existsSync(rootEnv)) {
    fs.copyFileSync(mysqlEnv, rootEnv);
  }
}

async function main() {
  const accessGranted = await verifyAccess();
  if (!accessGranted) {
    console.error("Access denied.");
    process.exit(1);
  }

  const args = process.argv.slice(2).filter((a) => a !== "--");
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const projects = manifest.projects;

  if (!projects.length) {
    console.error("No project templates in manifest.");
    process.exit(1);
  }

  for (let i = 0; i < projects.length; i += 1) {
    const p = projects[i];
    console.log(`[${i + 1}] ${p.name} — ${p.title}`);
  }

  let choice = 1;
  if (projects.length > 1) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ans = (await question(rl, "\nPick (1–" + projects.length + "): ")).trim();
    rl.close();
    if (ans) {
      const n = parseInt(ans, 10);
      if (Number.isFinite(n) && n >= 1 && n <= projects.length) choice = n;
    }
  }

  const selected = projects[choice - 1];
  const templatePath = path.join(TEMPLATES, selected.templateDir);
  if (!fs.existsSync(templatePath)) {
    console.error("Template not found: " + templatePath);
    process.exit(1);
  }

  const defFolder = selected.defaultFolderName || "my-app";
  const folderName = args[0]?.trim() || defFolder;

  const target = path.resolve(process.cwd(), folderName);
  if (fs.existsSync(target)) {
    const contents = fs.readdirSync(target);
    if (contents.length > 0) {
      console.error(`\n  Folder is not empty: ${target}\n  Choose another name or remove the folder.\n`);
      process.exit(1);
    }
  } else {
    fs.mkdirSync(target, { recursive: true });
  }

  copyTree(templatePath, target);
  ensureEnvFromExample(target);

  console.log("Done: " + target);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
