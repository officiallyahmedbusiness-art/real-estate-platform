import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
const nextDir = path.join(root, ".next");
const lockPath = path.join(nextDir, "dev", "lock");

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  return result.status === 0;
}

function killNextDev() {
  if (process.platform === "win32") {
    // Best-effort: stop only node processes running "next dev".
    const psCommand =
      "Get-CimInstance Win32_Process | " +
      "Where-Object { $_.CommandLine -match 'next dev' } | " +
      "ForEach-Object { Stop-Process -Id $_.ProcessId -Force }";
    run("powershell", ["-NoProfile", "-Command", psCommand]);
    return;
  }

  run("pkill", ["-f", "next dev"]);
}

function removePath(target) {
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
}

console.log("Stopping any running `next dev` processes (best-effort)...");
killNextDev();

console.log("Cleaning Next.js dev artifacts...");
removePath(lockPath);
removePath(nextDir);

console.log("Clean complete.");
