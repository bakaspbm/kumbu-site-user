import { rmSync, existsSync } from "node:fs";

for (const dir of [".next", "node_modules/.cache"]) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
    console.log(`Removido: ${dir}`);
  }
}
