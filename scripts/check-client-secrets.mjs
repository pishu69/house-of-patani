import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = ["src", "public", "index.html", "dist"];
const forbiddenNames = [
  "RAZORPAY_KEY_SECRET",
  "MSG91_AUTH_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const findings = [];

async function scan(targetPath) {
  let targetStat;

  try {
    targetStat = await stat(targetPath);
  } catch {
    return;
  }

  if (targetStat.isDirectory()) {
    const entries = await readdir(targetPath);
    await Promise.all(entries.map((entry) => scan(path.join(targetPath, entry))));
    return;
  }

  const content = await readFile(targetPath, "utf8");
  forbiddenNames.forEach((name) => {
    if (content.includes(name)) {
      findings.push(`${path.relative(projectRoot, targetPath)} contains ${name}`);
    }
  });
}

await Promise.all(targets.map((target) => scan(path.join(projectRoot, target))));

if (findings.length > 0) {
  throw new Error(`Frontend secret scan failed:\n${findings.join("\n")}`);
}

console.log("Frontend secret scan passed.");
