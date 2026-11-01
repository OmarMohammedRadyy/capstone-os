const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const targetDir = path.join(__dirname, "..", "src", "generated", "prisma");
const targetFile = path.join(targetDir, "index.ts");

// 1. Clean the target directory so Prisma never fails with "not empty"
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}

// 2. Run prisma generate
console.log("Generating Prisma Client...");
execSync("npx prisma generate", { stdio: "inherit" });

// 3. Ensure index.ts exists for Next.js / Turbopack bundler resolution
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}
fs.writeFileSync(targetFile, 'export * from "./client";\n', "utf-8");
console.log("✔ Ensured src/generated/prisma/index.ts exists");
