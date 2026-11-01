const fs = require("fs");
const path = require("path");

const targetDir = path.join(__dirname, "..", "src", "generated", "prisma");
const targetFile = path.join(targetDir, "index.ts");

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFileSync(targetFile, 'export * from "./client";\n', "utf-8");
console.log("✔ Ensured src/generated/prisma/index.ts exists");
