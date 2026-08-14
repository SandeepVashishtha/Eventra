import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

// ============================================================================
// 1. ENVIRONMENT & PATH RESOLUTION
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(process.cwd());

const DEFAULT_ENV_PATH = path.join(ROOT_DIR, ".env");
const DEFAULT_EXAMPLE_PATH = path.join(ROOT_DIR, ".env.example");
const DEFAULT_VAULT_PATH = path.join(ROOT_DIR, ".env.vault");

// ============================================================================
// 2. TERMINAL FORMATTING & ANSI HELPERS
// ============================================================================

const STYLES = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  
  // Foreground Colors
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // Background Colors
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
};

const supportsColor = process.stdout.isTTY;

function colorize(style, text) {
  if (!supportsColor) return text;
  return `${STYLES[style] || ""}${text}${STYLES.reset}`;
}

const fmt = {
  bold: (t) => colorize("bold", t),
  dim: (t) => colorize("dim", t),
  red: (t) => colorize("red", t),
  green: (t) => colorize("green", t),
  yellow: (t) => colorize("yellow", t),
  blue: (t) => colorize("blue", t),
  cyan: (t) => colorize("cyan", t),
  magenta: (t) => colorize("magenta", t),
  gray: (t) => colorize("gray", t),
  badge: (bg, text) => colorize(bg, colorize("bold", ` ${text} `)),
};

// ============================================================================
// 3. SEVERITY & SECURITY RATING ENUMS
// ============================================================================

const SEVERITY = {
  CRITICAL: { name: "CRITICAL", score: 25, color: "bgRed" },
  HIGH: { name: "HIGH", score: 18, color: "red" },
  MEDIUM: { name: "MEDIUM", score: 10, color: "yellow" },
  LOW: { name: "LOW", score: 5, color: "blue" },
  INFO: { name: "INFO", score: 0, color: "gray" },
};

// Known default/weak secrets to detect across frameworks
const WEAK_PLACEHOLDERS = new Set([
  "eventra-local-development-jwt-secret",
  "dev-secret",
  "super_secret_key",
  "secret",
  "secretkey",
  "changeme",
  "password",
  "123456",
  "admin",
  "default_secret",
  "jwt_secret_key",
  "your_jwt_secret_here",
  "replace_this_with_a_secure_secret",
  "development",
]);

// ============================================================================
// 4. ENTROPY & CRYPTO ANALYSIS ENGINE
// ============================================================================

class CryptoEntropyEngine {
  /**
   * Calculates Shannon Entropy of a given string (bits per character).
   */
  static calculateShannonEntropy(str) {
    if (!str) return 0;
    const len = str.length;
    const frequencies = {};

    for (let i = 0; i < len; i++) {
      const char = str[i];
      frequencies[char] = (frequencies[char] || 0) + 1;
    }

    let entropy = 0;
    for (const char in frequencies) {
      const p = frequencies[char] / len;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  /**
   * Evaluates total cryptographic strength of a secret key string.
   */
  static evaluateSecretStrength(secret) {
    if (!secret) {
      return { score: 0, status: "EMPTY", entropy: 0, issues: ["Secret is completely empty"] };
    }

    const issues = [];
    const normalized = secret.trim().replace(/['"]/g, "").toLowerCase();

    // Check placeholder list
    for (const placeholder of WEAK_PLACEHOLDERS) {
      if (normalized === placeholder || normalized.includes(placeholder)) {
        issues.push(`Matches known weak placeholder pattern '${placeholder}'`);
      }
    }

    // Check length
    if (secret.length < 16) {
      issues.push(`Length is too short (${secret.length} chars). Minimum recommended is 32.`);
    }

    // Check Shannon entropy
    const entropy = this.calculateShannonEntropy(secret);
    if (entropy < 3.2 && secret.length < 32) {
      issues.push(`Low information entropy (${entropy.toFixed(2)} bits/char). Looks repetitive or predictable.`);
    }

    let status = "STRONG";
    let score = 100;

    if (issues.length > 0) {
      if (issues.some((i) => i.includes("placeholder") || i.includes("empty"))) {
        status = "WEAK";
        score = 10;
      } else {
        status = "MODERATE";
        score = 50;
      }
    }

    return { score, status, entropy, issues };
  }

  /**
   * Generates secure random strings tailored to secret types.
   */
  static generateSecret(type = "hex", length = 32) {
    switch (type.toLowerCase()) {
      case "base64":
        return crypto.randomBytes(length).toString("base64");
      case "base64url":
        return crypto.randomBytes(length).toString("base64url");
      case "alphanumeric": {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const bytes = crypto.randomBytes(length);
        let result = "";
        for (let i = 0; i < length; i++) {
          result += chars[bytes[i] % chars.length];
        }
        return result;
      }
      case "password": {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
        const bytes = crypto.randomBytes(length);
        let result = "";
        for (let i = 0; i < length; i++) {
          result += chars[bytes[i] % chars.length];
        }
        return result;
      }
      case "hex":
      default:
        return crypto.randomBytes(length).toString("hex");
    }
  }
}

// ============================================================================
// 5. DOTENV AST PARSER & GENERATOR
// ============================================================================

class EnvAstParser {
  /**
   * Parses a .env file buffer into a structured AST preserving comments and whitespace.
   */
  static parse(content) {
    const lines = content.split(/\r?\n/);
    const ast = [];
    const keyMap = new Map();

    lines.forEach((rawLine, index) => {
      const trimmed = rawLine.trim();

      if (!trimmed) {
        ast.push({ type: "EMPTY", line: index + 1, raw: rawLine });
      } else if (trimmed.startsWith("#")) {
        ast.push({ type: "COMMENT", line: index + 1, raw: rawLine, comment: trimmed.substring(1).trim() });
      } else if (trimmed.includes("=")) {
        const eqIdx = trimmed.indexOf("=");
        const key = trimmed.substring(0, eqIdx).trim();
        let value = trimmed.substring(eqIdx + 1).trim();

        // Strip quotes if present
        let quoteChar = null;
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          quoteChar = value[0];
          value = value.substring(1, value.length - 1);
        }

        const node = {
          type: "KEY_VALUE",
          line: index + 1,
          raw: rawLine,
          key,
          value,
          quoteChar,
        };

        ast.push(node);
        keyMap.set(key, node);
      } else {
        ast.push({ type: "UNKNOWN", line: index + 1, raw: rawLine });
      }
    });

    return { ast, keyMap };
  }

  /**
   * Serializes an AST back into a .env string format.
   */
  static stringify(ast) {
    return ast
      .map((node) => {
        if (node.type === "KEY_VALUE") {
          const q = node.quoteChar || "";
          return `${node.key}=${q}${node.value}${q}`;
        }
        return node.raw;
      })
      .join("\n");
  }
}

// ============================================================================
// 6. VAULT ENCRYPTION & DECRYPTION (AES-256-GCM)
// ============================================================================

class EnvVault {
  static encrypt(envContent, masterPassword) {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, "sha256");
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    let encrypted = cipher.update(envContent, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      version: "1.0",
      salt: salt.toString("hex"),
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
      data: encrypted,
    }, null, 2);
  }

  static decrypt(vaultJsonStr, masterPassword) {
    const payload = JSON.parse(vaultJsonStr);
    const salt = Buffer.from(payload.salt, "hex");
    const iv = Buffer.from(payload.iv, "hex");
    const authTag = Buffer.from(payload.authTag, "hex");

    const key = crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, "sha256");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(payload.data, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}

// ============================================================================
// 7. CLI ARGUMENT PARSER & CONFIG
// ============================================================================

function printHelp() {
  console.log(`
${fmt.bold("Enterprise Environment & Secret Audit Engine CLI")}

${fmt.bold("USAGE:")}
  $ node setup-env.js [OPTIONS]

${fmt.bold("OPTIONS:")}
  -e, --env <path>          Path to target .env file (default: .env)
  -x, --example <path>      Path to reference .env.example file (default: .env.example)
  --rotate-all              Force rotation of ALL weak, placeholder, or empty secrets
  --rotate <keys>           Comma-separated list of key names to explicitly rotate
  --sync-example            Synchronize missing keys from .env.example into .env
  --check-only              Perform security scan without modifying any files
  --format <type>           Export format: cli | json | html (default: cli)
  -o, --output <path>       File path to write report output
  --encrypt <password>      Encrypt current .env into .env.vault file using master password
  --decrypt <password>      Decrypt .env.vault back into .env file using master password
  -h, --help                Display this help documentation
  -v, --version             Display CLI version
`);
}

function parseArguments(args) {
  const flags = {
    envPath: DEFAULT_ENV_PATH,
    examplePath: DEFAULT_EXAMPLE_PATH,
    vaultPath: DEFAULT_VAULT_PATH,
    rotateAll: false,
    keysToRotate: [],
    syncExample: true,
    checkOnly: false,
    format: "cli",
    outputPath: null,
    encryptPassword: null,
    decryptPassword: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    } else if (arg === "-v" || arg === "--version") {
      console.log("v2.0.0");
      process.exit(0);
    } else if (arg === "-e" || arg === "--env") {
      flags.envPath = path.resolve(args[++i]);
    } else if (arg === "-x" || arg === "--example") {
      flags.examplePath = path.resolve(args[++i]);
    } else if (arg === "--rotate-all") {
      flags.rotateAll = true;
    } else if (arg === "--rotate") {
      flags.keysToRotate = (args[++i] || "").split(",").map((k) => k.trim());
    } else if (arg === "--sync-example") {
      flags.syncExample = true;
    } else if (arg === "--check-only") {
      flags.checkOnly = true;
    } else if (arg === "--format") {
      flags.format = (args[++i] || "cli").toLowerCase();
    } else if (arg === "-o" || arg === "--output") {
      flags.outputPath = path.resolve(args[++i]);
    } else if (arg === "--encrypt") {
      flags.encryptPassword = args[++i];
    } else if (arg === "--decrypt") {
      flags.decryptPassword = args[++i];
    }
  }

  return flags;
}

// ============================================================================
// 8. AUDIT & REPAIR ENGINE
// ============================================================================

class EnvAuditEngine {
  constructor(options) {
    this.options = options;
    this.auditFindings = [];
    this.rotatedKeys = [];
    this.addedKeys = [];
  }

  run() {
    console.log(`\n🔍 [Environment Setup] Auditing configuration: ${fmt.blue(this.options.envPath)}\n`);

    // 1. Vault Operations
    if (this.options.encryptPassword) {
      return this.handleEncryption();
    }
    if (this.options.decryptPassword) {
      return this.handleDecryption();
    }

    // 2. Ensure .env existence
    let envContent = "";
    let envExists = fs.existsSync(this.options.envPath);

    if (!envExists) {
      console.log(`[Env Setup] ${fmt.yellow(".env file not found.")} Attempting copy from .env.example...`);
      if (fs.existsSync(this.options.examplePath)) {
        envContent = fs.readFileSync(this.options.examplePath, "utf-8");
        if (!this.options.checkOnly) {
          fs.writeFileSync(this.options.envPath, envContent, "utf-8");
          console.log(`[Env Setup] ${fmt.green("Created .env from .env.example file successfully.")}`);
        }
      } else {
        console.log(`[Env Setup] ${fmt.gray(".env.example not found either. Starting with empty AST.")}`);
        envContent = "";
      }
    } else {
      envContent = fs.readFileSync(this.options.envPath, "utf-8");
    }

    const { ast, keyMap } = EnvAstParser.parse(envContent);

    // 3. Schema Drift Analysis against .env.example
    if (fs.existsSync(this.options.examplePath)) {
      const exampleContent = fs.readFileSync(this.options.examplePath, "utf-8");
      const { keyMap: exampleMap } = EnvAstParser.parse(exampleContent);

      for (const [key, node] of exampleMap.entries()) {
        if (!keyMap.has(key)) {
          this.auditFindings.push({
            key,
            severity: SEVERITY.HIGH,
            issue: "Key present in .env.example but missing in active .env file",
            remediation: "Synchronize key into .env file.",
          });

          if (this.options.syncExample && !this.options.checkOnly) {
            const newSecret = CryptoEntropyEngine.generateSecret("hex", 32);
            ast.push({
              type: "KEY_VALUE",
              line: ast.length + 1,
              raw: `${key}=${newSecret}`,
              key,
              value: newSecret,
              quoteChar: null,
            });
            keyMap.set(key, ast[ast.length - 1]);
            this.addedKeys.push(key);
          }
        }
      }
    }

    // 4. Secret Strength Audit & Rotation
    for (const [key, node] of keyMap.entries()) {
      const isSecretKey = /SECRET|KEY|PASSWORD|TOKEN|AUTH|PRIVATE|SALT/i.test(key);
      const evalResult = CryptoEntropyEngine.evaluateSecretStrength(node.value);

      if (isSecretKey || evalResult.status !== "STRONG") {
        if (evalResult.status !== "STRONG") {
          this.auditFindings.push({
            key,
            severity: evalResult.status === "WEAK" ? SEVERITY.CRITICAL : SEVERITY.MEDIUM,
            issue: `Suboptimal secret detected (${evalResult.status}): ${evalResult.issues.join(", ")}`,
            remediation: "Rotate value with cryptographically secure random string.",
          });
        }

        const forceRotate = this.options.rotateAll || this.options.keysToRotate.includes(key);
        const autoFix = evalResult.status === "WEAK" || forceRotate;

        if (autoFix && !this.options.checkOnly) {
          const genType = key.includes("PASSWORD") ? "password" : key.includes("TOKEN") ? "base64url" : "hex";
          const freshSecret = CryptoEntropyEngine.generateSecret(genType, 32);

          node.value = freshSecret;
          node.raw = `${key}=${freshSecret}`;
          this.rotatedKeys.push(key);
        }
      }
    }

    // 5. Save changes
    if (!this.options.checkOnly && (this.rotatedKeys.length > 0 || this.addedKeys.length > 0)) {
      const updatedContent = EnvAstParser.stringify(ast);
      fs.writeFileSync(this.options.envPath, updatedContent, "utf-8");
      console.log(`\n💾 ${fmt.green("Successfully saved updated secrets to .env file.")}`);
    }

    // 6. Generate Reports
    this.renderReport();
  }

  handleEncryption() {
    if (!fs.existsSync(this.options.envPath)) {
      console.error(fmt.red(`❌ Cannot encrypt: ${this.options.envPath} does not exist.`));
      process.exit(1);
    }
    const envContent = fs.readFileSync(this.options.envPath, "utf-8");
    const encryptedVault = EnvVault.encrypt(envContent, this.options.encryptPassword);
    fs.writeFileSync(this.options.vaultPath, encryptedVault, "utf-8");
    console.log(`🔒 ${fmt.green(`Encrypted vault written to ${this.options.vaultPath}`)}`);
  }

  handleDecryption() {
    if (!fs.existsSync(this.options.vaultPath)) {
      console.error(fmt.red(`❌ Cannot decrypt: ${this.options.vaultPath} does not exist.`));
      process.exit(1);
    }
    try {
      const vaultContent = fs.readFileSync(this.options.vaultPath, "utf-8");
      const decryptedEnv = EnvVault.decrypt(vaultContent, this.options.decryptPassword);
      fs.writeFileSync(this.options.envPath, decryptedEnv, "utf-8");
      console.log(`🔓 ${fmt.green(`Decrypted vault restored to ${this.options.envPath}`)}`);
    } catch (err) {
      console.error(fmt.red(`❌ Decryption failed: ${err.message}`));
      process.exit(1);
    }
  }

  renderReport() {
    if (this.options.format === "json") {
      const output = JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          findings: this.auditFindings,
          rotatedKeys: this.rotatedKeys,
          addedKeys: this.addedKeys,
        },
        null,
        2
      );
      if (this.options.outputPath) fs.writeFileSync(this.options.outputPath, output, "utf-8");
      else console.log(output);
      return;
    }

    // Terminal Format
    console.log(`=================================================================`);
    console.log(`${fmt.bold(fmt.cyan("🔑 ENVIRONMENT & SECRET AUDIT SUMMARY"))}`);
    console.log(`=================================================================\n`);

    if (this.addedKeys.length > 0) {
      console.log(`➕ ${fmt.bold("Keys Synchronized from Schema:")}`);
      this.addedKeys.forEach((k) => console.log(`   - ${fmt.green(k)}`));
      console.log("");
    }

    if (this.rotatedKeys.length > 0) {
      console.log(`🔄 ${fmt.bold("Keys Rotated with Fresh Cryptographic Secrets:")}`);
      this.rotatedKeys.forEach((k) => console.log(`   - ${fmt.yellow(k)}`));
      console.log("");
    }

    if (this.auditFindings.length > 0) {
      console.log(`⚠️  ${fmt.bold("Identified Configuration Issues:")}`);
      this.auditFindings.forEach((f, idx) => {
        const badge = fmt.badge(f.severity.color, f.severity.name);
        console.log(`   ${idx + 1}. [${badge}] ${fmt.bold(f.key)}`);
        console.log(`      ${fmt.gray(f.issue)}`);
        console.log(`      💡 ${fmt.gray(f.remediation)}`);
      });
    } else {
      console.log(`🎉 ${fmt.green("All environment secrets meet cryptographic security standards!")}`);
    }

    console.log(`\n-----------------------------------------------------------------\n`);
  }
}

// ============================================================================
// 9. MAIN CONTROLLER EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const options = parseArguments(args);
  const engine = new EnvAuditEngine(options);
  engine.run();
}

main().catch((err) => {
  console.error(fmt.red(`❌ Fatal Unhandled Execution Error: ${err.message}`));
  process.exit(1);
});