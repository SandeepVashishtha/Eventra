#!/usr/bin/env node

/**
 * ============================================================================
 * Enterprise Git Setup & Merge Driver Provisioning Engine
 * File: scripts/setup-git-config.js
 * ============================================================================
 *
 * Responsibilities:
 * 1. Registers `ours-then-install` Git merge driver for `package-lock.json`.
 * 2. Provides cross-platform atomic execution (Windows CMD/PowerShell, macOS, Linux, WSL).
 * 3. Ensures automatic lockfile reconciliation via `npm install` post-merge.
 * 4. Audit-checks and auto-injects required attributes into `.gitattributes`.
 * 5. Supports CLI flags: --check-only, --uninstall, --force, --verbose, --dry-run.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const DRIVER_NAME = "ours-then-install";
const DRIVER_TITLE = "Accept incoming lockfile, then run package manager reconciliation";
const GIT_ATTRIBUTES_FILE = ".gitattributes";
const REQUIRED_ATTRIBUTE_ENTRY = "package-lock.json merge=ours-then-install";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");

// System Environment Bypasses (CI/CD Platforms)
const IS_CI_ENVIRONMENT = Boolean(
  process.env.CI ||
  process.env.VERCEL ||
  process.env.NETLIFY ||
  process.env.GITHUB_ACTIONS ||
  process.env.GITLAB_CI ||
  process.env.HEROKU_TEST_RUN
);

// CLI Flags State
const ARGS = process.argv.slice(2);
const FLAGS = {
  checkOnly: ARGS.includes("--check-only"),
  uninstall: ARGS.includes("--uninstall"),
  force: ARGS.includes("--force"),
  verbose: ARGS.includes("--verbose") || process.env.NODE_ENV === "development",
  dryRun: ARGS.includes("--dry-run"),
  skipInstall: ARGS.includes("--skip-install"),
};

// Terminal Colors (ANSI Escapes)
const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

class Logger {
  static info(message) {
    console.log(`${COLORS.blue}ℹ${COLORS.reset} ${message}`);
  }

  static success(message) {
    console.log(`${COLORS.green}✔${COLORS.reset} ${message}`);
  }

  static warn(message) {
    console.warn(`${COLORS.yellow}⚠${COLORS.reset} ${message}`);
  }

  static error(message) {
    console.error(`${COLORS.red}✖ ${message}${COLORS.reset}`);
  }

  static verbose(message) {
    if (FLAGS.verbose) {
      console.log(`${COLORS.dim}🔍 [DEBUG] ${message}${COLORS.reset}`);
    }
  }

  static step(stepNumber, title) {
    console.log(`\n${COLORS.bright}${COLORS.cyan}[Step ${stepNumber}] ${title}${COLORS.reset}`);
  }
}

// ============================================================================
// GIT & SYSTEM DIAGNOSTICS
// ============================================================================

class GitDiagnostics {
  /**
   * Verifies if Git is installed and accessible in the system PATH.
   */
  static isGitAvailable() {
    try {
      execSync("git --version", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates whether the current working directory is inside a Git repository.
   */
  static isInsideGitRepository() {
    try {
      const output = execSync("git rev-parse --is-inside-work-tree", {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      return output.trim() === "true";
    } catch {
      return false;
    }
  }

  /**
   * Fetches an existing Git configuration setting value.
   */
  static getConfig(key) {
    try {
      const output = execSync(`git config --get ${key}`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      return output.trim();
    } catch {
      return null;
    }
  }

  /**
   * Executes a git config command with optional dry-run wrapper.
   */
  static setConfig(key, value) {
    const command = `git config ${key} "${value.replace(/"/g, '\\"')}"`;
    Logger.verbose(`Executing: ${command}`);

    if (FLAGS.dryRun) {
      Logger.info(`[DRY-RUN] Would run: ${command}`);
      return;
    }

    execSync(command, { stdio: "inherit" });
  }

  /**
   * Unsets a Git configuration key.
   */
  static unsetConfig(key) {
    const command = `git config --unset-all ${key}`;
    Logger.verbose(`Executing: ${command}`);

    if (FLAGS.dryRun) {
      Logger.info(`[DRY-RUN] Would run: ${command}`);
      return;
    }

    try {
      execSync(command, { stdio: "ignore" });
    } catch {
      Logger.verbose(`Key ${key} was not present to unset.`);
    }
  }
}

// ============================================================================
// DRIVER COMMAND BUILDER
// ============================================================================

class MergeDriverBuilder {
  /**
   * Constructs a fully cross-platform driver command execution string.
   * Node inline script replaces file %B (theirs) into %A (ours), then triggers install.
   */
  static buildDriverCommand() {
    // 1. Cross-platform file replacement using Node's standard `fs` library
    const copyCommand = `node -e "require('fs').copyFileSync('%B', '%A')"`;

    // 2. Reconciliation step: determine install command variant
    const reconcileCommand = FLAGS.skipInstall
      ? "npm i --package-lock-only"
      : "npm install";

    // Combine steps with safe boolean shell chaining
    return `${copyCommand} && ${reconcileCommand}`;
  }
}

// ============================================================================
// ATTRIBUTES FILE AUDITOR & MANAGER
// ============================================================================

class AttributesManager {
  static getAttributesFilePath() {
    return path.join(PROJECT_ROOT, GIT_ATTRIBUTES_FILE);
  }

  /**
   * Checks if .gitattributes includes the required merge driver mapping.
   */
  static isConfigured() {
    const filePath = this.getAttributesFilePath();
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const content = fs.readFileSync(filePath, "utf8");
    return content.split("\n").some((line) => line.trim() === REQUIRED_ATTRIBUTE_ENTRY);
  }

  /**
   * Ensures package-lock.json merge entry exists in .gitattributes.
   */
  static ensureConfigured() {
    const filePath = this.getAttributesFilePath();
    Logger.verbose(`Auditing attributes file at: ${filePath}`);

    if (this.isConfigured()) {
      Logger.success(`.gitattributes is already properly configured.`);
      return;
    }

    if (FLAGS.dryRun) {
      Logger.info(`[DRY-RUN] Would append "${REQUIRED_ATTRIBUTE_ENTRY}" to ${GIT_ATTRIBUTES_FILE}`);
      return;
    }

    let existingContent = "";
    if (fs.existsSync(filePath)) {
      existingContent = fs.readFileSync(filePath, "utf8");
    }

    const prefix = existingContent && !existingContent.endsWith("\n") ? "\n" : "";
    const newEntry = `${prefix}# Auto-generated lockfile conflict resolution driver\n${REQUIRED_ATTRIBUTE_ENTRY}\n`;

    fs.appendFileSync(filePath, newEntry, "utf8");
    Logger.success(`Appended merge driver directive to ${GIT_ATTRIBUTES_FILE}`);
  }

  /**
   * Removes merge driver directives from .gitattributes on uninstallation.
   */
  static removeConfigured() {
    const filePath = this.getAttributesFilePath();
    if (!fs.existsSync(filePath)) return;

    if (FLAGS.dryRun) {
      Logger.info(`[DRY-RUN] Would scrub "${REQUIRED_ATTRIBUTE_ENTRY}" from ${GIT_ATTRIBUTES_FILE}`);
      return;
    }

    const content = fs.readFileSync(filePath, "utf8");
    const filteredLines = content
      .split("\n")
      .filter((line) => line.trim() !== REQUIRED_ATTRIBUTE_ENTRY && !line.includes("Auto-generated lockfile conflict resolution driver"));

    fs.writeFileSync(filePath, filteredLines.join("\n"), "utf8");
    Logger.success(`Removed merge driver directives from ${GIT_ATTRIBUTES_FILE}`);
  }
}

// ============================================================================
// UNINSTALLATION ORCHESTRATOR
// ============================================================================

class Uninstaller {
  static run() {
    Logger.step(1, "Uninstalling Package Lock Merge Driver");

    Logger.info("Unsetting Git global/local driver settings...");
    GitDiagnostics.unsetConfig(`merge.${DRIVER_NAME}.name`);
    GitDiagnostics.unsetConfig(`merge.${DRIVER_NAME}.driver`);

    Logger.info("Cleaning project .gitattributes file...");
    AttributesManager.removeConfigured();

    Logger.success("Uninstallation complete. Default Git merge behavior restored.");
  }
}

// ============================================================================
// AUDIT & CHECK-ONLY ORCHESTRATOR
// ============================================================================

class AuditRunner {
  static run() {
    Logger.step(1, "Performing Merge Driver Audit Check");

    const driverName = GitDiagnostics.getConfig(`merge.${DRIVER_NAME}.name`);
    const driverCommand = GitDiagnostics.getConfig(`merge.${DRIVER_NAME}.driver`);
    const attributesConfigured = AttributesManager.isConfigured();

    const isFullyConfigured = Boolean(driverName && driverCommand && attributesConfigured);

    console.log("\nAudit Findings:");
    console.log(` - Driver Name Configured:    ${driverName ? "✅ YES" : "❌ NO"}`);
    console.log(` - Driver Command Configured: ${driverCommand ? "✅ YES" : "❌ NO"}`);
    console.log(` - Attributes File Mapping:  ${attributesConfigured ? "✅ YES" : "❌ NO"}`);

    if (isFullyConfigured) {
      Logger.success("\nAudit Passed: Driver is fully active and operational.");
      process.exit(0);
    } else {
      Logger.warn("\nAudit Failed: Driver configuration is missing or incomplete.");
      process.exit(1);
    }
  }
}

// ============================================================================
// MAIN SETUP ORCHESTRATOR
// ============================================================================

class SetupOrchestrator {
  static execute() {
    // 1. Guard against executing in CI environments
    if (IS_CI_ENVIRONMENT && !FLAGS.force) {
      Logger.verbose("CI/CD Environment detected. Skipping local Git configuration setup.");
      process.exit(0);
    }

    // 2. System environment pre-checks
    if (!GitDiagnostics.isGitAvailable()) {
      Logger.error("Git binary is not available on system PATH. Aborting execution.");
      process.exit(1);
    }

    if (!GitDiagnostics.isInsideGitRepository()) {
      Logger.warn("Not inside a valid Git repository workspace. Skipping merge driver setup.");
      process.exit(0);
    }

    // 3. Handle explicit CLI flags
    if (FLAGS.uninstall) {
      Uninstaller.run();
      return;
    }

    if (FLAGS.checkOnly) {
      AuditRunner.run();
      return;
    }

    // 4. Register Merge Driver
    Logger.step(1, "Registering package-lock.json Git Merge Driver");

    const driverCommand = MergeDriverBuilder.buildDriverCommand();

    Logger.verbose(`Target Name Config: "merge.${DRIVER_NAME}.name"`);
    Logger.verbose(`Target Driver Command Config: "merge.${DRIVER_NAME}.driver"`);

    GitDiagnostics.setConfig(`merge.${DRIVER_NAME}.name`, DRIVER_TITLE);
    GitDiagnostics.setConfig(`merge.${DRIVER_NAME}.driver`, driverCommand);

    // 5. Sync .gitattributes configuration
    Logger.step(2, "Verifying Repository Attributes Rules");
    AttributesManager.ensureConfigured();

    // 6. Final Status Summary
    Logger.step(3, "Setup Status Verification");
    Logger.success(`Git configuration updated successfully.`);
    Logger.info(`Driver registered: '${DRIVER_NAME}'`);
    Logger.info(`Automatic resolution enabled for 'package-lock.json'.`);
  }
}

// ============================================================================
// SCRIPT ENTRY POINT
// ============================================================================

try {
  SetupOrchestrator.execute();
} catch (error) {
  Logger.error(`Failed to register Git merge driver: ${error.message}`);
  if (FLAGS.verbose && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
}