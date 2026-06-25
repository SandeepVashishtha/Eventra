import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT_DIR = path.resolve(process.cwd());
const envPath = path.join(ROOT_DIR, ".env");
const envExamplePath = path.join(ROOT_DIR, ".env.example");

console.log("[JWT Setup] Checking local .env configuration...");

let envContent = "";
let envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log("[JWT Setup] .env file not found. Creating from .env.example...");
  if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, "utf-8");
  } else {
    envContent = "";
  }
} else {
  envContent = fs.readFileSync(envPath, "utf-8");
}

const lines = envContent.split(/\r?\n/);
let jwtSecretFound = false;
const newSecret = crypto.randomBytes(32).toString("hex");

const updatedLines = lines.map((line) => {
  const trimmed = line.trim();
  if (trimmed.startsWith("JWT_SECRET=")) {
    jwtSecretFound = true;
    const value = trimmed.substring("JWT_SECRET=".length).trim().replace(/['"]/g, "");
    if (!value || value === "eventra-local-development-jwt-secret" || value.includes("dev-secret") || value.includes("super_secret_key")) {
      console.log("[JWT Setup] Replacing weak/empty/placeholder JWT_SECRET in .env with a secure random secret.");
      return `JWT_SECRET=${newSecret}`;
    }
    return line; // Keep existing strong secret
  }
  return line;
});

if (!jwtSecretFound) {
  console.log("[JWT Setup] Adding JWT_SECRET to .env file.");
  // Ensure we append with a newline if needed
  if (updatedLines.length > 0 && updatedLines[updatedLines.length - 1].trim() !== "") {
    updatedLines.push("");
  }
  updatedLines.push(`JWT_SECRET=${newSecret}`);
}

try {
  fs.writeFileSync(envPath, updatedLines.join("\n"), "utf-8");
  console.log("[JWT Setup] Success! Secure random JWT_SECRET configured in .env.");
} catch (err) {
  console.error("[JWT Setup] Failed to write to .env:", err.message);
  process.exit(1);
}
