#!/usr/bin/env node
/**
 * create-exam-app — scaffold exam projects (EPMS first; more templates later).
 * Usage: npx create-exam-app [folder-name]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.join(__dirname, "..");
const TEMPLATES = path.join(PKG_ROOT, "templates");
const MANIFEST = path.join(TEMPLATES, "projects.json");

function question(rl, prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
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
  const backend = path.join(projectRoot, "backend");
  const example = path.join(backend, ".env.example");
  const envFile = path.join(backend, ".env");
  const rootEnv = path.join(projectRoot, ".env");
  if (fs.existsSync(example) && !fs.existsSync(envFile)) {
    fs.copyFileSync(example, envFile);
  }
  // Root .env (same as backend) for IDEs / quick access
  if (fs.existsSync(envFile) && !fs.existsSync(rootEnv)) {
    fs.copyFileSync(envFile, rootEnv);
  } else if (fs.existsSync(example) && !fs.existsSync(rootEnv)) {
    fs.copyFileSync(example, rootEnv);
  }
}

async function main() {
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

  const defFolder = selected.defaultFolderName || "my-exam-app";
  // Optional first arg: output folder. Otherwise the template's default.
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
