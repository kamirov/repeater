import { spawn } from "node:child_process";

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const child = spawn(command, ["exec", "vercel", "dev"], {
  stdio: "inherit",
  env: process.env,
});

child.on("error", (error) => {
  console.error("Could not start the Vercel development server:", error.message);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
