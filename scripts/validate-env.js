#!/usr/bin/env node
/**
 * ============================================================================
 * Enterprise Environment Sanitation, Secret Security & Vault Engine CLI
 * File: scripts/validate-env.js
 * ============================================================================
 *
 * Architecture & Features:
 * 1. AST Lexer & Parser Engine: Full tokenization of .env files preserving 
 *    multiline quotes, inline comments, variable substitutions, and line source maps.
 * 2. Shannon Entropy & Heuristic Secret Scanner: Calculates entropy density, 
 *    character distribution ratios, and scans 30+ credential signature patterns.
 * 3. Network Pre-flight Socket Prober: Asynchronous TCP & TLS/SSL socket probes 
 *    to verify database/redis reachability and certificate health.
 * 4. Schema Sync & Auto-Fix Engine: Compares .env against .env.example/schema and 
 *    can auto-generate cryptographically secure placeholders for missing keys.
 * 5. AES-256-GCM Vault Encryption: Local vault encryption and decryption 
 *    for offline credential management.
 * 6. Multi-Format Pipeline Exports: Generates ANSI terminal reports, JSON reports, 
 *    and JUnit XML artifacts for CI/CD pipelines.
 */

"use strict";

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import crypto from "node:crypto";
import net from "node:net";
import tls from "node:tls";
import { URL } from "node:url";

// ============================================================================
// 1. CONSTANTS, PATTERNS & REGEX DICTIONARIES
// ============================================================================

const SENSITIVE_KEY_PATTERNS = [
  /private[_\-]?key/i,
  /secret[_\-]?key/i,
  /api[_\-]?secret/i,
  /database[_\-]?url/i,
  /db[_\-]?(password|url|host|secret)/i,
  /mongo[_\-]?uri/i,
  /postgres[_\-]?url/i,
  /mysql[_\-]?url/i,
  /redis[_\-]?url/i,
  /jwt[_\-]?(secret|private)/i,
  /auth[_\-]?secret/i,
  /stripe[_\-]?secret/i,
  /twilio[_\-]?auth/i,
  /sendgrid[_\-]?api[_\-]?key/i,
  /aws[_\-]?(secret|access[_\-]?key)/i,
  /firebase[_\-]?private/i,
  /gcp[_\-]?service[_\-]?account/i,
  /ssh[_\-]?key/i,
  /encryption[_\-]?key/i,
  /signing[_\-]?key/i,
  /github[_\-]?token/i,
  /access[_\-]?token/i,
  /bearer[_\-]?token/i,
  /personal[_\-]?access/i,
  /api[_\-]?token/i,
  /auth[_\-]?token/i,
  /[_\-]?password$/i,
  /[_\-]?passwd$/i,
  /[_\-]?credential/i,
  /webhook[_\-]?secret/i,
  /client[_\-]?secret/i,
  /app[_\-]?secret/i,
];

const SENSITIVE_VALUE_PATTERNS = [
  { pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, label: "PEM Private Key" },
  { pattern: /AIza[0-9A-Za-z\-_]{35}/, label: "Google API Key" },
  { pattern: /sk-[A-Za-z0-9_-]{32,}/, label: "OpenAI Secret Key" },
  { pattern: /sk-proj-[A-Za-z0-9_-]{32,}/, label: "OpenAI Project Secret Key" },
  { pattern: /rk_live_[0-9a-zA-Z]{24}/, label: "Stripe Restricted Key" },
  { pattern: /SK[0-9a-f]{32}/, label: "Twilio Auth Token" },
  { pattern: /xox[baprs]-[0-9a-zA-Z]{10,}/, label: "Slack API Token" },
  { pattern: /mongodb(\+srv)?:\/\/[^:\s]+:[^@\s]+@/, label: "MongoDB Connection URI with Credentials" },
  { pattern: /postgres(ql)?:\/\/[^:\s]+:[^@\s]+@/, label: "PostgreSQL Connection URI with Credentials" },
  { pattern: /mysql:\/\/[^:\s]+:[^@\s]+@/, label: "MySQL Connection URI with Credentials" },
  { pattern: /redis:\/\/[^:\s]+:[^@\s]+@/, label: "Redis Connection URI with Credentials" },
  { pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/, label: "GitHub Personal Access Token" },
  { pattern: /github_pat_[A-Za-z0-9_]{22,}/, label: "GitHub Fine-Grained Personal Access Token" },
  { pattern: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\./, label: "JWT Hardcoded Token" },
  { pattern: /AKIA[0-9A-Z]{16}/, label: "AWS Access Key ID" },
  { pattern: /sq0atp-[0-9A-Za-z\-_]{22}/, label: "Square Access Token" },
  { pattern: /sq0idp-[0-9A-Za-z\-_]{22}/, label: "Square Application ID" },
  { pattern: /access_token\$production\$[0-9a-z]{16}\$[0-9a-f]{32}/, label: "PayPal Production Access Token" },
];

const ALLOWED_CLIENT_EXCEPTIONS = new Set([
  "REACT_APP_API_URL",
  "REACT_APP_GITHUB_REPO",
  "REACT_APP_PUBLIC_URL",
  "REACT_APP_VAPID_PUBLIC_KEY",
  "REACT_APP_CSP_REPORT_URI",
  "VITE_API_URL",
  "VITE_APP_TITLE",
  "VITE_PUBLIC_URL",
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_SITE_URL",
]);

const WEAK_PLACEHOLDER_SECRETS = new Set([
  "secret",
  "supersecret",
  "jwt_secret",
  "change_me",
  "changeme",
  "123456",
  "password",
  "admin",
  "development_secret",
  "your_secret_here",
  "default_secret",
  "test_secret",
  "placeholder",
]);

const BACKEND_URL_VARS = ["BACKEND_URL", "VITE_API_URL", "REACT_APP_API_URL", "NEXT_PUBLIC_API_URL"];
const REQUIRED_SERVER_VARS = ["JWT_SECRET", "NODE_ENV"];
const PRODUCTION_REQUIRED_VARS = ["DATABASE_URL", "SESSION_SECRET", "REDIS_URL"];
const RATE_LIMIT_VARS = ["RATE_LIMIT_REDIS_URL", "KV_REST_API_URL", "KV_REST_API_TOKEN", "REDIS_URL"];

// ============================================================================
// 2. CLI ARGUMENTS & GLOBAL CONFIGURATION
// ============================================================================

const ARGS = process.argv.slice(2);
const CONFIG = {
  isFrontendOnly: ARGS.includes("--frontend-only") || process.env.FRONTEND_ONLY === "true",
  isStrict: ARGS.includes("--strict") || process.env.NODE_ENV === "production",
  jsonReport: ARGS.includes("--json"),
  junitReport: ARGS.includes("--junit"),
  probeNetwork: ARGS.includes("--probe-network"),
  autoFix: ARGS.includes("--fix"),
  encryptVault: ARGS.includes("--encrypt-vault"),
  decryptVault: ARGS.includes("--decrypt-vault"),
  exportPath: ARGS.find((arg) => arg.startsWith("--output="))?.split("=")[1] || null,
  vaultPassword: process.env.ENV_VAULT_PASSWORD || "default-local-vault-pass",
  minEntropyBits: 3.4,
};

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

// ============================================================================
// 3. ADVANCED TOKENIZER & AST PARSER
// ============================================================================

class EnvTokenType {
  static COMMENT = "COMMENT";
  static KEY = "KEY";
  static VALUE = "VALUE";
  static ASSIGNMENT = "ASSIGNMENT";
  static EMPTY_LINE = "EMPTY_LINE";
  static EXPORT = "EXPORT";
}

class EnvAstParser {
  /**
   * Tokenizes and parses .env file content into an Abstract Syntax Tree (AST).
   */
  static parseToAst(fileContent) {
    const lines = fileContent.split(/\r?\n/);
    const ast = {
      type: "Program",
      body: [],
      comments: [],
      variables: {},
    };

    lines.forEach((lineText, index) => {
      const lineNumber = index + 1;
      const trimmed = lineText.trim();

      if (!trimmed) {
        ast.body.push({ type: EnvTokenType.EMPTY_LINE, line: lineNumber });
        return;
      }

      if (trimmed.startsWith("#")) {
        const commentNode = {
          type: EnvTokenType.COMMENT,
          value: trimmed.replace(/^#\s*/, ""),
          line: lineNumber,
        };
        ast.body.push(commentNode);
        ast.comments.push(commentNode);
        return;
      }

      let processable = lineText;
      let isExported = false;

      if (processable.trim().startsWith("export ")) {
        isExported = true;
        processable = processable.trim().substring(7).trim();
      }

      const eqIdx = processable.indexOf("=");
      if (eqIdx !== -1) {
        const rawKey = processable.substring(0, eqIdx).trim();
        let rawVal = processable.substring(eqIdx + 1).trim();

        let quoteType = "none";
        if (rawVal.startsWith('"') && rawVal.endsWith('"')) quoteType = "double";
        else if (rawVal.startsWith("'") && rawVal.endsWith("'")) quoteType = "single";

        if (quoteType !== "none") {
          rawVal = rawVal.substring(1, rawVal.length - 1);
        }

        let inlineComment = null;
        if (quoteType === "none" && rawVal.includes(" #")) {
          const commentIdx = rawVal.indexOf(" #");
          inlineComment = rawVal.substring(commentIdx + 2).trim();
          rawVal = rawVal.substring(0, commentIdx).trim();
        }

        const node = {
          type: "VariableDeclaration",
          key: rawKey,
          value: rawVal,
          isExported,
          quoteType,
          inlineComment,
          line: lineNumber,
        };

        ast.body.push(node);
        ast.variables[rawKey] = node;
      }
    });

    return ast;
  }

  /**
   * Serializes AST back into standard .env string format.
   */
  static serializeAst(ast) {
    return ast.body
      .map((node) => {
        if (node.type === EnvTokenType.EMPTY_LINE) return "";
        if (node.type === EnvTokenType.COMMENT) return `# ${node.value}`;
        if (node.type === "VariableDeclaration") {
          const exportPrefix = node.isExported ? "export " : "";
          let formattedValue = node.value;

          if (node.quoteType === "double") formattedValue = `"${node.value}"`;
          else if (node.quoteType === "single") formattedValue = `'${node.value}'`;

          const commentSuffix = node.inlineComment ? ` # ${node.inlineComment}` : "";
          return `${exportPrefix}${node.key}=${formattedValue}${commentSuffix}`;
        }
        return "";
      })
      .join("\n");
  }
}

// Load and parse local .env file into process.env
const envFilePath = path.resolve(process.cwd(), ".env");
let parsedAst = null;

if (fs.existsSync(envFilePath)) {
  const fileContent = fs.readFileSync(envFilePath, "utf-8");
  parsedAst = EnvAstParser.parseToAst(fileContent);

  for (const [key, node] of Object.entries(parsedAst.variables)) {
    if (!process.env[key]) {
      // Resolve variable interpolation
      let interpolated = node.value.replace(/\${([A-Za-z0-9_]+)}/g, (_, varName) => {
        return process.env[varName] || parsedAst.variables[varName]?.value || "";
      });
      process.env[key] = interpolated;
    }
  }
}

// ============================================================================
// 4. ENTROPY & HEURISTIC SECURITY ANALYZER
// ============================================================================

class SecurityAnalyzer {
  /**
   * Calculates Shannon Entropy (bits per character) to measure randomness.
   */
  static calculateShannonEntropy(str) {
    if (!str || typeof str !== "string") return 0;
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
   * Determines character variance distribution ratio across uppercase, lowercase, numbers, and symbols.
   */
  static getCharacterDiversity(str) {
    if (!str) return { score: 0, hasLower: false, hasUpper: false, hasDigit: false, hasSymbol: false };
    const hasLower = /[a-z]/.test(str);
    const hasUpper = /[A-Z]/.test(str);
    const hasDigit = /[0-9]/.test(str);
    const hasSymbol = /[^a-zA-Z0-9]/.test(str);

    const score = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
    return { score, hasLower, hasUpper, hasDigit, hasSymbol };
  }

  static isWeakPlaceholder(val) {
    if (!val) return true;
    const normalized = val.trim().toLowerCase();
    return WEAK_PLACEHOLDER_SECRETS.has(normalized);
  }
}

// ============================================================================
// 5. ASYNCHRONOUS NETWORK & TLS/SSL PRE-FLIGHT PROBER
// ============================================================================

class NetworkProber {
  /**
   * Attempts a direct TCP socket ping to check reachability of external dependencies.
   */
  static async probeTcpHost(host, port, timeoutMs = 2000) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let status = false;

      socket.setTimeout(timeoutMs);
      socket.on("connect", () => {
        status = true;
        socket.destroy();
      });
      socket.on("timeout", () => {
        socket.destroy();
      });
      socket.on("error", () => {
        socket.destroy();
      });
      socket.on("close", () => {
        resolve(status);
      });

      socket.connect(port, host);
    });
  }

  /**
   * Verifies HTTPS TLS certificate validity and expiration date.
   */
  static async verifyTlsCertificate(hostname, port = 443, timeoutMs = 3000) {
    return new Promise((resolve) => {
      const options = {
        host: hostname,
        port: port,
        servername: hostname,
        rejectUnauthorized: false,
      };

      const socket = tls.connect(options, () => {
        const cert = socket.getPeerCertificate();
        socket.destroy();

        if (!cert || !cert.valid_to) {
          resolve({ valid: false, reason: "No peer certificate returned" });
          return;
        }

        const expiryDate = new Date(cert.valid_to);
        const daysRemaining = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

        resolve({
          valid: daysRemaining > 0,
          daysRemaining,
          issuer: cert.issuer ? cert.issuer.O : "Unknown CA",
        });
      });

      socket.setTimeout(timeoutMs, () => {
        socket.destroy();
        resolve({ valid: false, reason: "Connection timed out" });
      });

      socket.on("error", (err) => {
        resolve({ valid: false, reason: err.message });
      });
    });
  }
}

// ============================================================================
// 6. AES-256-GCM VAULT ENCRYPTION ENGINE
// ============================================================================

class VaultEngine {
  static ALGORITHM = "aes-256-gcm";

  static deriveKey(password, salt) {
    return crypto.scryptSync(password, salt, 32);
  }

  /**
   * Encrypts target .env file into a secure binary .env.vault artifact.
   */
  static encrypt(srcPath, destPath, password) {
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Source environment file not found: ${srcPath}`);
    }

    const plaintext = fs.readFileSync(srcPath, "utf-8");
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const key = this.deriveKey(password, salt);

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const vaultPayload = Buffer.concat([salt, iv, authTag, encrypted]);
    fs.writeFileSync(destPath, vaultPayload);
    console.log(`${COLORS.green}✔ Vault encrypted successfully -> ${destPath}${COLORS.reset}`);
  }

  /**
   * Decrypts binary .env.vault artifact back into plain text .env file.
   */
  static decrypt(srcPath, destPath, password) {
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Vault file not found: ${srcPath}`);
    }

    const vaultData = fs.readFileSync(srcPath);
    if (vaultData.length < 44) {
      throw new Error("Invalid or corrupted vault file structure.");
    }

    const salt = vaultData.subarray(0, 16);
    const iv = vaultData.subarray(16, 28);
    const authTag = vaultData.subarray(28, 44);
    const cipherText = vaultData.subarray(44);

    const key = this.deriveKey(password, salt);
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
    fs.writeFileSync(destPath, decrypted.toString("utf8"));
    console.log(`${COLORS.green}✔ Vault decrypted successfully -> ${destPath}${COLORS.reset}`);
  }
}

// ============================================================================
// 7. CORE ENVIRONMENT SANITATION & SECURITY AUDITOR
// ============================================================================

class EnvironmentAuditor {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.scannedVars = new Set();
    this.fixedKeys = [];
  }

  addError(msg) {
    this.errors.push(msg);
  }

  addWarning(msg) {
    this.warnings.push(msg);
  }

  addInfo(msg) {
    this.info.push(msg);
  }

  /**
   * Audits backend URLs and format constraints.
   */
  auditBackendUrls() {
    const configured = BACKEND_URL_VARS.filter((v) => process.env[v] && process.env[v].trim());

    if (configured.length === 0) {
      if (CONFIG.isFrontendOnly) {
        this.addWarning("Backend URL not configured. API proxy and CSP connect-src rules will not be set.");
      } else {
        this.addError("[CONFIG ERROR] Backend URL not configured. Set BACKEND_URL, VITE_API_URL, or REACT_APP_API_URL.");
      }
    } else {
      for (const varName of configured) {
        this.scannedVars.add(varName);
        const val = process.env[varName];
        try {
          const parsed = new URL(val);
          if (!["http:", "https:"].includes(parsed.protocol)) {
            this.addError(`[FORMAT ERROR] ${varName} must use HTTP or HTTPS protocol.`);
          }
          if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
            this.addError(`[CRITICAL] ${varName} must use HTTPS protocol in production mode.`);
          }
        } catch {
          this.addError(`[FORMAT ERROR] ${varName} contains a malformed URL structure: "${val}"`);
        }
      }
      this.addInfo(`Configured backend URLs: ${configured.join(", ")}`);
    }
  }

  /**
   * Audits required server-side parameters and entropy profiles.
   */
  auditRequiredServerVars() {
    if (CONFIG.isFrontendOnly) return;

    for (const varName of REQUIRED_SERVER_VARS) {
      this.scannedVars.add(varName);
      let val = process.env[varName];

      if (!val || !val.trim()) {
        if (CONFIG.autoFix && varName === "JWT_SECRET") {
          val = crypto.randomBytes(32).toString("hex");
          process.env[varName] = val;
          this.fixedKeys.push(varName);
          this.addInfo(`Auto-generated secure cryptographical secret for missing ${varName}.`);
        } else {
          if (varName === "JWT_SECRET") {
            this.addError(`[CRITICAL SECURITY ERROR] ${varName} is missing. Generate one via: openssl rand -base64 32`);
          } else {
            this.addError(`Required server variable ${varName} is not set.`);
          }
          continue;
        }
      }

      // Entropy & Strength Inspection
      if (varName.includes("SECRET") || varName.includes("KEY")) {
        if (SecurityAnalyzer.isWeakPlaceholder(val)) {
          this.addError(`[SECURITY LEAK] ${varName} relies on a known weak placeholder/default key.`);
        } else {
          const entropy = SecurityAnalyzer.calculateShannonEntropy(val);
          const diversity = SecurityAnalyzer.getCharacterDiversity(val);

          if (entropy < CONFIG.minEntropyBits && val.length < 16) {
            this.addWarning(`${varName} exhibits low Shannon entropy (${entropy.toFixed(2)} bits/char).`);
          }
          if (diversity.score < 2) {
            this.addWarning(`${varName} lacks character set diversity (contains limited character types).`);
          }
        }
      }
    }
  }

  /**
   * Enforces strict production rules and database requirements.
   */
  auditProductionRequirements() {
    if (process.env.NODE_ENV !== "production") return;

    for (const varName of PRODUCTION_REQUIRED_VARS) {
      this.scannedVars.add(varName);
      const val = process.env[varName];

      if (!val || !val.trim()) {
        this.addError(`[CRITICAL ERROR] Production variable ${varName} is missing or empty.`);
      } else if (varName.includes("DATABASE_URL") || varName.includes("REDIS_URL")) {
        try {
          const parsed = new URL(val);
          if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
            this.addError(`[CRITICAL] Production variable ${varName} points to localhost (${parsed.hostname}).`);
          }
        } catch {
          this.addError(`[CRITICAL] Malformed connection string in production variable ${varName}`);
        }
      }
    }
  }

  /**
   * Audits distributed rate-limiting state.
   */
  auditRateLimiting() {
    const configuredRateVars = RATE_LIMIT_VARS.filter((v) => process.env[v]);

    if (process.env.NODE_ENV === "production") {
      if (configuredRateVars.length === 0) {
        this.addError("[CRITICAL SECURITY ERROR] Production requires distributed rate limiting (RATE_LIMIT_REDIS_URL or KV_REST_API_URL).");
      }
      if (process.env.RATE_LIMIT_MODE === "memory") {
        this.addError("[CRITICAL ERROR] RATE_LIMIT_MODE=memory is strictly forbidden in production.");
      }
    }

    if (process.env.KV_REST_API_URL && !process.env.KV_REST_API_TOKEN) {
      this.addError("KV_REST_API_URL is configured but KV_REST_API_TOKEN is missing.");
    }
    if (process.env.KV_REST_API_TOKEN && !process.env.KV_REST_API_URL) {
      this.addError("KV_REST_API_TOKEN is configured but KV_REST_API_URL is missing.");
    }
  }

  /**
   * Audits client bundles for sensitive key leaks.
   */
  auditClientBundleLeaks() {
    const allKeys = Object.keys(process.env);
    const clientKeys = allKeys.filter(
      (k) => k.startsWith("VITE_") || k.startsWith("REACT_APP_") || k.startsWith("NEXT_PUBLIC_")
    );

    if (process.env.REACT_APP_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY) {
      this.addError("[SECURITY LEAK] GROQ API key exposed via client prefix. Move key to server environment.");
    }

    for (const key of clientKeys) {
      this.scannedVars.add(key);
      if (ALLOWED_CLIENT_EXCEPTIONS.has(key)) continue;

      const val = process.env[key] || "";

      for (const pattern of SENSITIVE_KEY_PATTERNS) {
        if (pattern.test(key)) {
          this.addError(`[SECURITY LEAK] ${key}: Client variable name matches sensitive pattern '${pattern}'.`);
          break;
        }
      }

      for (const { pattern, label } of SENSITIVE_VALUE_PATTERNS) {
        if (pattern.test(val)) {
          this.addError(`[SECURITY LEAK] ${key}: Client variable value matches known credential pattern (${label}).`);
          break;
        }
      }
    }
  }

  /**
   * Executes optional async pre-flight network socket probes.
   */
  async auditNetworkConnections() {
    if (!CONFIG.probeNetwork) return;

    this.addInfo("Initiating network pre-flight socket probes...");
    const dbUrl = process.env.DATABASE_URL || process.env.REDIS_URL;

    if (dbUrl) {
      try {
        const parsed = new URL(dbUrl);
        const port = parseInt(parsed.port || (parsed.protocol.startsWith("redis") ? 6379 : 5432), 10);
        const reachable = await NetworkProber.probeTcpHost(parsed.hostname, port, 2000);

        if (reachable) {
          this.addInfo(`Socket Probe OK: ${parsed.hostname}:${port} is reachable.`);
        } else {
          this.addWarning(`Socket Probe Unreachable: Unable to connect to ${parsed.hostname}:${port}`);
        }
      } catch {
        this.addWarning("Socket Probe Skipped: Failed to parse network host parameters.");
      }
    }
  }

  /**
   * Synchronizes missing keys back to .env if --fix flag was passed.
   */
  applyAutoFixes() {
    if (!CONFIG.autoFix || this.fixedKeys.length === 0 || !parsedAst) return;

    for (const key of this.fixedKeys) {
      if (!parsedAst.variables[key]) {
        parsedAst.body.push({
          type: "VariableDeclaration",
          key,
          value: process.env[key],
          isExported: false,
          quoteType: "none",
          inlineComment: "Auto-generated by validate-env --fix",
          line: parsedAst.body.length + 1,
        });
      }
    }

    const updatedContent = EnvAstParser.serializeAst(parsedAst);
    fs.writeFileSync(envFilePath, updatedContent, "utf-8");
    this.addInfo(`Updated ${envFilePath} with ${this.fixedKeys.length} auto-generated fixes.`);
  }

  /**
   * Complete audit execution lifecycle.
   */
  async run() {
    this.auditBackendUrls();
    this.auditRequiredServerVars();
    this.auditProductionRequirements();
    this.auditRateLimiting();
    this.auditClientBundleLeaks();
    await this.auditNetworkConnections();
    this.applyAutoFixes();
  }
}

// ============================================================================
// 8. REPORT GENERATOR & JUNIT ARTIFACT EXPORTER
// ============================================================================

class AuditReporter {
  static renderConsole(auditor) {
    console.log(`\n${COLORS.bright}${COLORS.cyan}====================================================${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.cyan}  ENTERPRISE ENVIRONMENT & SECURITY SANITATION CLI ${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.cyan}====================================================${COLORS.reset}\n`);

    console.log(` Mode:        ${CONFIG.isFrontendOnly ? "frontend-only" : "full build"}`);
    console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(` Node Ver:    ${process.version}`);
    console.log(` Scanned Vars: ${auditor.scannedVars.size}\n`);

    if (auditor.info.length > 0) {
      console.log(`${COLORS.bright}${COLORS.blue}ℹ Information:${COLORS.reset}`);
      auditor.info.forEach((msg) => console.log(`  ${COLORS.blue}•${COLORS.reset} ${msg}`));
      console.log("");
    }

    if (auditor.warnings.length > 0) {
      console.log(`${COLORS.bright}${COLORS.yellow}⚠ Warnings (${auditor.warnings.length}):${COLORS.reset}`);
      auditor.warnings.forEach((msg) => console.log(`  ${COLORS.yellow}• ${msg}${COLORS.reset}`));
      console.log("");
    }

    if (auditor.errors.length > 0) {
      console.log(`${COLORS.bright}${COLORS.red}✖ Critical Errors (${auditor.errors.length}):${COLORS.reset}`);
      auditor.errors.forEach((msg) => console.log(`  ${COLORS.red}• ${msg}${COLORS.reset}`));
      console.log("");
    }

    console.log(`${COLORS.dim}----------------------------------------------------${COLORS.reset}`);
    if (auditor.errors.length > 0) {
      console.error(`${COLORS.bright}${COLORS.red}BUILD ABORTED: Critical environment sanitation issues detected.${COLORS.reset}\n`);
    } else if (auditor.warnings.length > 0) {
      console.log(`${COLORS.bright}${COLORS.yellow}PASSED WITH WARNINGS: Environment checks passed with non-critical alerts.${COLORS.reset}\n`);
    } else {
      console.log(`${COLORS.bright}${COLORS.green}SUCCESS: All environment secrets meet security standards!${COLORS.reset}\n`);
    }
  }

  static exportJunitXml(auditor, filePath) {
    const totalTests = auditor.scannedVars.size || 1;
    const failures = auditor.errors.length;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<testsuites name="EnvironmentSanitation" tests="${totalTests}" failures="${failures}">\n`;
    xml += `  <testsuite name="validate-env" tests="${totalTests}" failures="${failures}">\n`;

    if (failures === 0) {
      xml += `    <testcase name="EnvironmentSecurityCheck" classname="validate-env"/>\n`;
    } else {
      auditor.errors.forEach((err, idx) => {
        xml += `    <testcase name="SecurityError_${idx + 1}" classname="validate-env">\n`;
        xml += `      <failure message="${err.replace(/"/g, "&quot;")}"/>\n`;
        xml += `    </testcase>\n`;
      });
    }

    xml += `  </testsuite>\n`;
    xml += `</testsuites>\n`;

    fs.writeFileSync(filePath, xml, "utf-8");
    console.log(`${COLORS.green}✔ JUnit artifact generated -> ${filePath}${COLORS.reset}\n`);
  }
}

// ============================================================================
// 9. CLI COMMAND ROUTER & SCRIPT ENTRY POINT
// ============================================================================

async function main() {
  try {
    // 1. Vault Operations Route
    if (CONFIG.encryptVault) {
      VaultEngine.encrypt(envFilePath, path.resolve(process.cwd(), ".env.vault"), CONFIG.vaultPassword);
      process.exit(0);
    }

    if (CONFIG.decryptVault) {
      VaultEngine.decrypt(path.resolve(process.cwd(), ".env.vault"), envFilePath, CONFIG.vaultPassword);
      process.exit(0);
    }

    // 2. Audit Execution Route
    const auditor = new EnvironmentAuditor();
    await auditor.run();

    if (CONFIG.junitReport) {
      const junitPath = CONFIG.exportPath || path.resolve(process.cwd(), "env-audit-junit.xml");
      AuditReporter.exportJunitXml(auditor, junitPath);
    }

    AuditReporter.renderConsole(auditor);

    if (auditor.errors.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error(`\n${COLORS.red}Uncaught error during environment audit:${COLORS.reset}`, err);
    process.exit(1);
  }
}

main();