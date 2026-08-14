#!/usr/bin/env node

/**
 * Enterprise Security Headers & Compliance Inspector CLI
 * Zero external dependencies — built using standard Node.js APIs.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const tls = require("tls");
const { URL } = require("url");

// ============================================================================
// 1. TERMINAL FORMATTING & ANSI HELPERS
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
// 2. SEVERITY & RATING ENUMS
// ============================================================================

const SEVERITY = {
  CRITICAL: { name: "CRITICAL", score: 25, color: "bgRed" },
  HIGH: { name: "HIGH", score: 18, color: "red" },
  MEDIUM: { name: "MEDIUM", score: 10, color: "yellow" },
  LOW: { name: "LOW", score: 5, color: "blue" },
  INFO: { name: "INFO", score: 0, color: "gray" },
};

// ============================================================================
// 3. CLI ARGUMENT PARSER & CONFIG LOADER
// ============================================================================

function printHelp() {
  console.log(`
${fmt.bold("Enterprise Security Headers & Compliance Inspector CLI")}

${fmt.bold("USAGE:")}
  $ node security-audit.js [OPTIONS] [TARGET_URL]

${fmt.bold("OPTIONS:")}
  -u, --url <url>           Target URL to scan (or pass as positional arg)
  -f, --file <file>         File containing list of URLs to scan (one per line)
  -c, --config <file>       Path to JSON configuration file
  -d, --depth <num>         Crawl depth for link discovery (default: 0)
  -m, --max-pages <num>     Max pages to scan when crawling (default: 10)
  -o, --output <path>       File path to export scan results
  --format <type>           Export format: cli | json | html | junit | csv (default: cli)
  --min-score <grade>       Minimum required grade (A+, A, B, C, D, F) for zero exit code
  --no-tls                  Skip TLS/SSL handshake verification
  --user-agent <string>     Custom HTTP User-Agent
  --header <Key:Value>      Add custom HTTP request header (can be repeated)
  --timeout <ms>            HTTP request timeout in milliseconds (default: 10000)
  --follow-redirects        Follow HTTP redirects (default: true)
  -h, --help                Show this help banner
  -v, --version             Display version information
`);
}

function parseArguments(args) {
  const flags = {
    targetUrl: process.env.SECURITY_HEADERS_URL || "http://localhost:3000",
    urlsFile: null,
    configFile: null,
    crawlDepth: 0,
    maxPages: 10,
    outputPath: null,
    format: "cli",
    minGrade: null,
    checkTls: true,
    userAgent: "SecurityComplianceInspector/2.0 (Node.js)",
    customHeaders: {},
    timeout: 10000,
    followRedirects: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    } else if (arg === "-v" || arg === "--version") {
      console.log("v2.0.0");
      process.exit(0);
    } else if (arg === "-u" || arg === "--url") {
      flags.targetUrl = args[++i];
    } else if (arg === "-f" || arg === "--file") {
      flags.urlsFile = args[++i];
    } else if (arg === "-c" || arg === "--config") {
      flags.configFile = args[++i];
    } else if (arg === "-d" || arg === "--depth") {
      flags.crawlDepth = parseInt(args[++i], 10) || 0;
    } else if (arg === "-m" || arg === "--max-pages") {
      flags.maxPages = parseInt(args[++i], 10) || 10;
    } else if (arg === "-o" || arg === "--output") {
      flags.outputPath = args[++i];
    } else if (arg === "--format") {
      flags.format = (args[++i] || "cli").toLowerCase();
    } else if (arg === "--min-score") {
      flags.minGrade = (args[++i] || "B").toUpperCase();
    } else if (arg === "--no-tls") {
      flags.checkTls = false;
    } else if (arg === "--user-agent") {
      flags.userAgent = args[++i];
    } else if (arg === "--header") {
      const parts = args[++i].split(":");
      if (parts.length >= 2) {
        flags.customHeaders[parts[0].trim()] = parts.slice(1).join(":").trim();
      }
    } else if (arg === "--timeout") {
      flags.timeout = parseInt(args[++i], 10) || 10000;
    } else if (!arg.startsWith("-")) {
      flags.targetUrl = arg;
    }
  }

  // Load JSON config if provided
  if (flags.configFile && fs.existsSync(flags.configFile)) {
    try {
      const parsedConfig = JSON.parse(fs.readFileSync(flags.configFile, "utf-8"));
      Object.assign(flags, parsedConfig);
    } catch (err) {
      console.error(fmt.red(`❌ Failed to parse config file: ${err.message}`));
      process.exit(1);
    }
  }

  return flags;
}

// ============================================================================
// 4. DEEP HEADER EVALUATION RULES & PARSERS
// ============================================================================

class ContentSecurityPolicyParser {
  static parse(cspString) {
    if (!cspString) return null;
    const directives = {};
    const tokens = cspString.split(";");

    for (let token of tokens) {
      token = token.trim();
      if (!token) continue;

      const parts = token.split(/\s+/);
      const name = parts[0].toLowerCase();
      const values = parts.slice(1);
      directives[name] = values;
    }

    return directives;
  }

  static analyze(directives) {
    const findings = [];
    if (!directives) {
      return [{
        id: "CSP_MISSING",
        severity: SEVERITY.HIGH,
        message: "Content-Security-Policy header is missing completely.",
        remediation: "Add a strict CSP policy to defend against Cross-Site Scripting (XSS) and data injection."
      }];
    }

    // Directive checks
    if (!directives["default-src"] && !directives["script-src"]) {
      findings.push({
        id: "CSP_NO_FALLBACK",
        severity: SEVERITY.HIGH,
        message: "CSP lacks both 'default-src' and 'script-src' fallback directives.",
        remediation: "Specify at least default-src 'self' or a script-src directive."
      });
    }

    const scriptSrc = directives["script-src"] || directives["default-src"] || [];
    if (scriptSrc.includes("'unsafe-inline'")) {
      findings.push({
        id: "CSP_UNSAFE_INLINE",
        severity: SEVERITY.HIGH,
        message: "CSP script-src allows 'unsafe-inline' execution.",
        remediation: "Remove 'unsafe-inline' and use cryptographic nonces or hashes."
      });
    }

    if (scriptSrc.includes("'unsafe-eval'")) {
      findings.push({
        id: "CSP_UNSAFE_EVAL",
        severity: SEVERITY.MEDIUM,
        message: "CSP script-src allows 'unsafe-eval' execution (eval, setTimeout strings).",
        remediation: "Avoid string-to-code execution in JavaScript and remove 'unsafe-eval'."
      });
    }

    if (scriptSrc.includes("*")) {
      findings.push({
        id: "CSP_WILDCARD",
        severity: SEVERITY.CRITICAL,
        message: "CSP script-src contains wildcard '*' source.",
        remediation: "Restrict allowed script origins to explicitly trusted domains."
      });
    }

    if (!directives["frame-ancestors"]) {
      findings.push({
        id: "CSP_NO_FRAME_ANCESTORS",
        severity: SEVERITY.LOW,
        message: "CSP does not specify 'frame-ancestors' to protect against clickjacking.",
        remediation: "Add 'frame-ancestors 'none'' or 'frame-ancestors 'self''."
      });
    }

    return findings;
  }
}

class HstsEvaluator {
  static analyze(hstsHeader, isHttps) {
    const findings = [];
    if (!isHttps) {
      return [{
        id: "HSTS_NOT_HTTPS",
        severity: SEVERITY.INFO,
        message: "HSTS header is evaluated over plain HTTP connection.",
        remediation: "Ensure HTTP requests redirect to HTTPS."
      }];
    }

    if (!hstsHeader) {
      return [{
        id: "HSTS_MISSING",
        severity: SEVERITY.HIGH,
        message: "Strict-Transport-Security (HSTS) header is missing.",
        remediation: "Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload"
      }];
    }

    const maxAgeMatch = hstsHeader.match(/max-age=(\d+)/i);
    if (maxAgeMatch) {
      const maxAge = parseInt(maxAgeMatch[1], 10);
      if (maxAge < 15768000) { // Less than 6 months
        findings.push({
          id: "HSTS_SHORT_MAX_AGE",
          severity: SEVERITY.MEDIUM,
          message: `HSTS max-age is set to ${maxAge} seconds (recommended >= 31536000).`,
          remediation: "Increase HSTS max-age to 31536000 (1 year) or higher."
        });
      }
    } else {
      findings.push({
        id: "HSTS_INVALID_MAX_AGE",
        severity: SEVERITY.HIGH,
        message: "HSTS header does not contain a valid max-age directive.",
        remediation: "Ensure max-age parameter is present and specified in seconds."
      });
    }

    if (!/includeSubDomains/i.test(hstsHeader)) {
      findings.push({
        id: "HSTS_NO_SUBDOMAINS",
        severity: SEVERITY.LOW,
        message: "HSTS header does not enforce protection across subdomains.",
        remediation: "Append 'includeSubDomains' directive to HSTS header."
      });
    }

    if (!/preload/i.test(hstsHeader)) {
      findings.push({
        id: "HSTS_NO_PRELOAD",
        severity: SEVERITY.INFO,
        message: "HSTS header does not opt-in to browser preload lists.",
        remediation: "Append 'preload' directive and submit domain to hstspreload.org."
      });
    }

    return findings;
  }
}

class CookieSecurityEvaluator {
  static analyze(setCookieHeaders) {
    const findings = [];
    if (!setCookieHeaders) return findings;

    const cookies = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];

    cookies.forEach((cookieStr, idx) => {
      const name = cookieStr.split("=")[0].trim();

      if (!/;\s*Secure/i.test(cookieStr)) {
        findings.push({
          id: "COOKIE_NOT_SECURE",
          severity: SEVERITY.HIGH,
          message: `Cookie '${name}' is missing the 'Secure' attribute.`,
          remediation: "Mark all session and persistent cookies with the 'Secure' flag."
        });
      }

      if (!/;\s*HttpOnly/i.test(cookieStr)) {
        findings.push({
          id: "COOKIE_NOT_HTTPONLY",
          severity: SEVERITY.MEDIUM,
          message: `Cookie '${name}' is missing the 'HttpOnly' attribute.`,
          remediation: "Mark cookies as 'HttpOnly' unless client-side JavaScript specifically requires read access."
        });
      }

      if (!/;\s*SameSite=(Strict|Lax|None)/i.test(cookieStr)) {
        findings.push({
          id: "COOKIE_NO_SAMESITE",
          severity: SEVERITY.LOW,
          message: `Cookie '${name}' does not specify an explicit 'SameSite' attribute.`,
          remediation: "Set SameSite=Lax or SameSite=Strict to defend against CSRF attacks."
        });
      }
    });

    return findings;
  }
}

// Master Rules Engine
const SECURITY_HEADER_RULES = [
  {
    key: "content-security-policy",
    label: "Content-Security-Policy",
    importance: SEVERITY.HIGH,
    evaluator: (val) => ContentSecurityPolicyParser.analyze(ContentSecurityPolicyParser.parse(val))
  },
  {
    key: "strict-transport-security",
    label: "Strict-Transport-Security",
    importance: SEVERITY.HIGH,
    evaluator: (val, ctx) => HstsEvaluator.analyze(val, ctx.isHttps)
  },
  {
    key: "x-content-type-options",
    label: "X-Content-Type-Options",
    importance: SEVERITY.HIGH,
    evaluator: (val) => {
      if (!val) {
        return [{ id: "XCTO_MISSING", severity: SEVERITY.HIGH, message: "X-Content-Type-Options header is missing.", remediation: "Set X-Content-Type-Options: nosniff" }];
      }
      if (val.toLowerCase().trim() !== "nosniff") {
        return [{ id: "XCTO_INVALID", severity: SEVERITY.MEDIUM, message: `Invalid X-Content-Type-Options value '${val}'.`, remediation: "Value should strictly be 'nosniff'." }];
      }
      return [];
    }
  },
  {
    key: "x-frame-options",
    label: "X-Frame-Options",
    importance: SEVERITY.MEDIUM,
    evaluator: (val, ctx) => {
      if (!val && !ctx.headers["content-security-policy"]?.includes("frame-ancestors")) {
        return [{ id: "XFO_MISSING", severity: SEVERITY.MEDIUM, message: "X-Frame-Options header is missing and no CSP frame-ancestors found.", remediation: "Set X-Frame-Options: DENY or SAMEORIGIN." }];
      }
      if (val && !["deny", "sameorigin"].includes(val.toLowerCase().trim())) {
        return [{ id: "XFO_WEAK", severity: SEVERITY.LOW, message: `Legacy or weak X-Frame-Options directive '${val}'.`, remediation: "Use DENY or SAMEORIGIN." }];
      }
      return [];
    }
  },
  {
    key: "referrer-policy",
    label: "Referrer-Policy",
    importance: SEVERITY.MEDIUM,
    evaluator: (val) => {
      if (!val) {
        return [{ id: "RP_MISSING", severity: SEVERITY.MEDIUM, message: "Referrer-Policy header is missing.", remediation: "Set Referrer-Policy: strict-origin-when-cross-origin or no-referrer." }];
      }
      const unsafeValues = ["unsafe-url", "no-referrer-when-downgrade"];
      if (unsafeValues.includes(val.toLowerCase().trim())) {
        return [{ id: "RP_UNSAFE", severity: SEVERITY.LOW, message: `Referrer-Policy is set to broad value '${val}'.`, remediation: "Consider restrictive policies like strict-origin-when-cross-origin." }];
      }
      return [];
    }
  },
  {
    key: "permissions-policy",
    label: "Permissions-Policy",
    importance: SEVERITY.LOW,
    evaluator: (val) => {
      if (!val) {
        return [{ id: "PP_MISSING", severity: SEVERITY.LOW, message: "Permissions-Policy header is missing.", remediation: "Restrict browser features e.g. Permissions-Policy: camera=(), microphone=(), geolocation=()" }];
      }
      return [];
    }
  },
  {
    key: "x-xss-protection",
    label: "X-XSS-Protection (Legacy)",
    importance: SEVERITY.INFO,
    evaluator: (val) => {
      if (val && val.includes("1")) {
        return [{ id: "XXSS_ENABLED", severity: SEVERITY.INFO, message: "Legacy X-XSS-Protection header is enabled (can introduce vulnerabilities in older browsers).", remediation: "Set X-XSS-Protection: 0 and rely on a strong CSP instead." }];
      }
      return [];
    }
  },
  {
    key: "server",
    label: "Server Leakage Check",
    importance: SEVERITY.LOW,
    evaluator: (val) => {
      if (val && (/\d+\.\d+/.test(val) || /nginx|apache|iis|express/i.test(val))) {
        return [{ id: "SERVER_LEAK", severity: SEVERITY.LOW, message: `Server header exposes soft/hardware software details: '${val}'.`, remediation: "Obfuscate or strip the Server header in reverse proxy settings." }];
      }
      return [];
    }
  },
  {
    key: "x-powered-by",
    label: "X-Powered-By Leakage Check",
    importance: SEVERITY.LOW,
    evaluator: (val) => {
      if (val) {
        return [{ id: "POWERED_BY_LEAK", severity: SEVERITY.LOW, message: `X-Powered-By header reveals tech stack: '${val}'.`, remediation: "Disable X-Powered-By in framework configuration." }];
      }
      return [];
    }
  }
];

// ============================================================================
// 5. TLS / SSL CERTIFICATE ANALYZER
// ============================================================================

function inspectTlsCertificate(hostname, port = 443, timeout = 5000) {
  return new Promise((resolve) => {
    if (!hostname) return resolve(null);

    const options = {
      host: hostname,
      port: port,
      method: "GET",
      rejectUnauthorized: false,
      servername: hostname,
      timeout: timeout,
    };

    let resolved = false;

    const req = tls.connect(options, () => {
      if (resolved) return;
      resolved = true;

      const cert = req.getPeerCertificate();
      const cipher = req.getCipher();
      const protocol = req.getProtocol();

      req.end();

      if (!cert || Object.keys(cert).length === 0) {
        return resolve({ valid: false, error: "No certificate presented" });
      }

      const validTo = new Date(cert.valid_to);
      const now = new Date();
      const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));

      resolve({
        valid: req.authorized,
        error: req.authorizationError || null,
        subject: cert.subject ? cert.subject.CN : "Unknown",
        issuer: cert.issuer ? cert.issuer.O : "Unknown",
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        daysRemaining: daysRemaining,
        fingerprint: cert.fingerprint,
        protocol: protocol,
        cipher: cipher ? cipher.name : "Unknown",
      });
    });

    req.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        resolve({ valid: false, error: err.message });
      }
    });

    req.on("timeout", () => {
      if (!resolved) {
        resolved = true;
        req.destroy();
        resolve({ valid: false, error: "TLS connection handshake timeout" });
      }
    });
  });
}

// ============================================================================
// 6. HTTP SCANNER ENGINE & LINK CRAWLER
// ============================================================================

class SecurityScannerEngine {
  constructor(options) {
    this.options = options;
    this.visitedUrls = new Set();
    this.results = [];
  }

  async scanSingleUrl(targetUrl) {
    const parsedUrl = new URL(targetUrl);
    const isHttps = parsedUrl.protocol === "https:";

    const requestHeaders = {
      "User-Agent": this.options.userAgent,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      ...this.options.customHeaders,
    };

    const httpModule = isHttps ? https : http;

    return new Promise((resolve) => {
      const reqOpts = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: "GET",
        headers: requestHeaders,
        timeout: this.options.timeout,
      };

      const startTime = Date.now();

      const req = httpModule.request(reqOpts, async (res) => {
        const responseTimeMs = Date.now() - startTime;
        let bodyBuffer = "";

        res.on("data", (chunk) => {
          if (bodyBuffer.length < 500000) { // Limit buffer size to 500KB
            bodyBuffer += chunk.toString("utf8");
          }
        });

        res.on("end", async () => {
          // Perform TLS inspection if applicable
          let tlsInfo = null;
          if (isHttps && this.options.checkTls) {
            tlsInfo = await inspectTlsCertificate(parsedUrl.hostname, parsedUrl.port || 443, this.options.timeout);
          }

          // Evaluate headers against rules engine
          const ruleFindings = [];
          const headerValues = {};

          for (const rule of SECURITY_HEADER_RULES) {
            const rawVal = res.headers[rule.key];
            headerValues[rule.key] = rawVal || null;

            const ctx = { isHttps, headers: res.headers, url: targetUrl };
            const findings = rule.evaluator(rawVal, ctx);
            ruleFindings.push(...findings);
          }

          // Cookie evaluation
          const cookieFindings = CookieSecurityEvaluator.analyze(res.headers["set-cookie"]);
          ruleFindings.push(...cookieFindings);

          // Extract links if crawling is enabled
          const discoveredLinks = this.extractLinks(bodyBuffer, parsedUrl);

          const pageAudit = {
            url: targetUrl,
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            responseTimeMs: responseTimeMs,
            headers: res.headers,
            headerValues: headerValues,
            findings: ruleFindings,
            tls: tlsInfo,
            discoveredLinks: discoveredLinks,
            scoreDetails: this.calculateGrade(ruleFindings, tlsInfo),
          };

          resolve(pageAudit);
        });
      });

      req.on("error", (err) => {
        resolve({
          url: targetUrl,
          error: err.message,
          statusCode: 0,
          findings: [{ id: "NETWORK_ERROR", severity: SEVERITY.CRITICAL, message: `Failed to connect: ${err.message}`, remediation: "Check network connectivity and server status." }],
          scoreDetails: { score: 0, grade: "F" }
        });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({
          url: targetUrl,
          error: "Request timed out",
          statusCode: 0,
          findings: [{ id: "TIMEOUT", severity: SEVERITY.HIGH, message: "HTTP request timed out.", remediation: "Check backend response latency." }],
          scoreDetails: { score: 0, grade: "F" }
        });
      });

      req.end();
    });
  }

  extractLinks(htmlBody, baseUrl) {
    if (!htmlBody) return [];
    const links = new Set();
    const hrefRegex = /href=["']([^"']+)["']/gi;
    let match;

    while ((match = hrefRegex.exec(htmlBody)) !== null) {
      try {
        const resolved = new URL(match[1], baseUrl.href);
        if (resolved.hostname === baseUrl.hostname && ["http:", "https:"].includes(resolved.protocol)) {
          links.add(resolved.href.split("#")[0]);
        }
      } catch (_) {
        // Ignore invalid URLs
      }
    }

    return Array.from(links);
  }

  calculateGrade(findings, tlsInfo) {
    let penaltyScore = 0;

    for (const f of findings) {
      penaltyScore += f.severity.score;
    }

    if (tlsInfo && !tlsInfo.valid) {
      penaltyScore += 30;
    }

    const finalScore = Math.max(0, 100 - penaltyScore);

    let grade = "F";
    if (finalScore >= 95) grade = "A+";
    else if (finalScore >= 85) grade = "A";
    else if (finalScore >= 75) grade = "B";
    else if (finalScore >= 65) grade = "C";
    else if (finalScore >= 50) grade = "D";

    return { score: finalScore, grade: grade };
  }

  async runScanQueue(initialUrls) {
    const queue = [...initialUrls];
    
    while (queue.length > 0 && this.visitedUrls.size < this.options.maxPages) {
      const currentUrl = queue.shift();
      if (this.visitedUrls.has(currentUrl)) continue;

      this.visitedUrls.add(currentUrl);
      const auditResult = await this.scanSingleUrl(currentUrl);
      this.results.push(auditResult);

      if (this.options.crawlDepth > 0 && auditResult.discoveredLinks) {
        for (const link of auditResult.discoveredLinks) {
          if (!this.visitedUrls.has(link) && queue.length < this.options.maxPages) {
            queue.push(link);
          }
        }
      }
    }

    return this.results;
  }
}

// ============================================================================
// 7. EXPORT REPORTERS (CLI, JSON, HTML, JUNIT XML, CSV)
// ============================================================================

class ReportRenderers {
  static renderTerminal(results) {
    console.log(`\n=================================================================`);
    console.log(`${fmt.bold(fmt.cyan("🔍 SECURITY COMPLIANCE & HEADER AUDIT REPORT"))}`);
    console.log(`=================================================================\n`);

    for (const audit of results) {
      console.log(`📌 ${fmt.bold("Target URL:")} ${fmt.blue(audit.url)}`);
      
      if (audit.error) {
        console.log(`   ❌ ${fmt.red(`Status: Connection Failed (${audit.error})`)}\n`);
        continue;
      }

      const statusColor = audit.statusCode < 400 ? fmt.green : fmt.red;
      console.log(`   ${fmt.bold("HTTP Status:")} ${statusColor(`${audit.statusCode} ${audit.statusMessage}`)} (${audit.responseTimeMs}ms)`);

      // Grade Display
      const grade = audit.scoreDetails.grade;
      let gradeColor = fmt.green;
      if (["C", "D"].includes(grade)) gradeColor = fmt.yellow;
      if (grade === "F") gradeColor = fmt.red;

      console.log(`   ${fmt.bold("Compliance Score:")} ${audit.scoreDetails.score}/100 [ ${gradeColor(fmt.bold(grade))} ]\n`);

      // TLS Info
      if (audit.tls) {
        console.log(`   ${fmt.bold("🔒 TLS/SSL Verification:")}`);
        if (audit.tls.valid) {
          console.log(`      ✅ Valid Certificate (${audit.tls.protocol} / ${audit.tls.cipher})`);
          console.log(`      📅 Issuer: ${audit.tls.issuer} | Days Remaining: ${audit.tls.daysRemaining} days`);
        } else {
          console.log(`      ❌ ${fmt.red(`Invalid TLS Cert: ${audit.tls.error}`)}`);
        }
        console.log("");
      }

      // Security Headers Summary
      console.log(`   ${fmt.bold("🛡️  Security Headers Evaluation:")}`);
      for (const rule of SECURITY_HEADER_RULES) {
        const val = audit.headerValues[rule.key];
        if (val) {
          console.log(`      ✅ ${fmt.bold(rule.label)}: ${fmt.gray(val)}`);
        } else {
          console.log(`      ❌ ${fmt.bold(rule.label)}: ${fmt.red("Missing")}`);
        }
      }

      // Detailed Findings
      if (audit.findings.length > 0) {
        console.log(`\n   ${fmt.bold("⚠️  Identified Security Issues & Findings:")}`);
        audit.findings.forEach((f, idx) => {
          const badge = fmt.badge(f.severity.color, f.severity.name);
          console.log(`      ${idx + 1}. [${badge}] ${fmt.bold(f.message)}`);
          console.log(`         💡 ${fmt.gray(`Remediation: ${f.remediation}`)}`);
        });
      } else {
        console.log(`\n   🎉 ${fmt.green("No security findings! All recommended headers present and secure.")}`);
      }

      console.log(`\n-----------------------------------------------------------------\n`);
    }
  }

  static renderJson(results) {
    return JSON.stringify({
      generator: "Enterprise Security Inspector v2.0.0",
      timestamp: new Date().toISOString(),
      scannedPagesCount: results.length,
      results: results,
    }, null, 2);
  }

  static renderCsv(results) {
    const rows = [
      ["URL", "Status Code", "Score", "Grade", "Rule ID", "Severity", "Message", "Remediation"].join(",")
    ];

    for (const audit of results) {
      if (!audit.findings || audit.findings.length === 0) {
        rows.push([
          `"${audit.url}"`,
          audit.statusCode || 0,
          audit.scoreDetails?.score || 0,
          `"${audit.scoreDetails?.grade || 'F'}"`,
          "NONE", "PASSED", "All checks passed successfully", "None"
        ].join(","));
      } else {
        for (const f of audit.findings) {
          rows.push([
            `"${audit.url}"`,
            audit.statusCode || 0,
            audit.scoreDetails?.score || 0,
            `"${audit.scoreDetails?.grade || 'F'}"`,
            `"${f.id}"`,
            `"${f.severity.name}"`,
            `"${f.message.replace(/"/g, '""')}"`,
            `"${f.remediation.replace(/"/g, '""')}"`
          ].join(","));
        }
      }
    }

    return rows.join("\n");
  }

  static renderJUnitXml(results) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    let totalTests = 0;
    let totalFailures = 0;

    results.forEach((r) => {
      totalTests += SECURITY_HEADER_RULES.length;
      totalFailures += (r.findings ? r.findings.length : 0);
    });

    xml += `<testsuites name="SecurityHeaderAudit" tests="${totalTests}" failures="${totalFailures}">\n`;

    for (const audit of results) {
      xml += `  <testsuite name="${audit.url.replace(/&/g, '&amp;')}" tests="${SECURITY_HEADER_RULES.length}" failures="${audit.findings ? audit.findings.length : 0}">\n`;
      
      for (const rule of SECURITY_HEADER_RULES) {
        const ruleFinding = audit.findings?.find(f => f.id.includes(rule.key.toUpperCase()) || f.message.toLowerCase().includes(rule.key));
        
        xml += `    <testcase name="Header Check: ${rule.label}" classname="SecurityHeaders">\n`;
        if (ruleFinding) {
          xml += `      <failure message="${ruleFinding.message.replace(/"/g, '&quot;')}" type="${ruleFinding.severity.name}">\n`;
          xml += `        Remediation: ${ruleFinding.remediation.replace(/</g, '&lt;').replace(/>/g, '&gt;')}\n`;
          xml += `      </failure>\n`;
        }
        xml += `    </testcase>\n`;
      }

      xml += `  </testsuite>\n`;
    }

    xml += `</testsuites>`;
    return xml;
  }

  static renderHtml(results) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Security Headers Audit Dashboard</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; }
    .container { max-width: 1100px; margin: 0 auto; }
    .header { border-bottom: 1px solid #334155; padding-bottom: 1rem; margin-bottom: 2rem; }
    .card { background: #1e293b; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid #334155; }
    .grade { font-size: 2.5rem; font-weight: bold; padding: 0.2rem 1rem; border-radius: 6px; display: inline-block; }
    .grade-A { background: #15803d; color: #fff; }
    .grade-B { background: #0369a1; color: #fff; }
    .grade-C { background: #b45309; color: #fff; }
    .grade-F { background: #b91c1c; color: #fff; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; font-size: 0.75rem; text-transform: uppercase; }
    .badge-CRITICAL { background: #991b1b; color: #fecaca; }
    .badge-HIGH { background: #c2410c; color: #ffedd5; }
    .badge-MEDIUM { background: #a16207; color: #fef9c3; }
    .badge-LOW { background: #1d4ed8; color: #dbeafe; }
    .badge-INFO { background: #475569; color: #f1f5f9; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #334155; }
    th { color: #94a3b8; }
    code { font-family: monospace; background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 4px; color: #38bdf8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ Security Headers Compliance Audit</h1>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </div>

    ${results.map(audit => `
      <div class="card">
        <h2>Target: ${audit.url}</h2>
        <p><strong>Status:</strong> ${audit.statusCode} | <strong>Response Time:</strong> ${audit.responseTimeMs}ms</p>
        <div>
          <span>Score: ${audit.scoreDetails?.score}/100</span>
          <span class="grade grade-${(audit.scoreDetails?.grade || 'F')[0]}">${audit.scoreDetails?.grade}</span>
        </div>

        <h3>Header Check Summary</h3>
        <table>
          <thead>
            <tr><th>Header Directives</th><th>Status</th><th>Evaluated Value</th></tr>
          </thead>
          <tbody>
            ${SECURITY_HEADER_RULES.map(r => `
              <tr>
                <td><code>${r.label}</code></td>
                <td>${audit.headerValues[r.key] ? '✅ Present' : '❌ Missing'}</td>
                <td><code>${audit.headerValues[r.key] || 'N/A'}</code></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${audit.findings?.length > 0 ? `
          <h3>Security Findings</h3>
          <ul>
            ${audit.findings.map(f => `
              <li style="margin-bottom: 0.75rem;">
                <span class="badge badge-${f.severity.name}">${f.severity.name}</span>
                <strong>${f.message}</strong>
                <br><small style="color: #94a3b8;">Remediation: ${f.remediation}</small>
              </li>
            `).join('')}
          </ul>
        ` : '<p style="color: #4ade80;">🎉 Zero security findings for this host.</p>'}
      </div>
    `).join('')}
  </div>
</body>
</html>`;
  }
}

// ============================================================================
// 8. MAIN CLI CONTROLLER & EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const options = parseArguments(args);

  let targetUrls = [];

  if (options.urlsFile) {
    if (!fs.existsSync(options.urlsFile)) {
      console.error(fmt.red(`❌ Target URLs file not found: ${options.urlsFile}`));
      process.exit(1);
    }
    const fileContent = fs.readFileSync(options.urlsFile, "utf-8");
    targetUrls = fileContent.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
  } else if (options.targetUrl) {
    targetUrls = [options.targetUrl];
  }

  if (targetUrls.length === 0) {
    console.error(fmt.red("❌ No target URL(s) provided. Specify via positional arg, --url, or --file."));
    printHelp();
    process.exit(1);
  }

  const scanner = new SecurityScannerEngine(options);
  
  if (options.format === "cli") {
    console.log(fmt.gray(`🚀 Initializing scan across ${targetUrls.length} origin target(s)...`));
  }

  const results = await scanner.runScanQueue(targetUrls);

  // Render format output
  let outputData = "";
  switch (options.format) {
    case "json":
      outputData = ReportRenderers.renderJson(results);
      break;
    case "csv":
      outputData = ReportRenderers.renderCsv(results);
      break;
    case "junit":
      outputData = ReportRenderers.renderJUnitXml(results);
      break;
    case "html":
      outputData = ReportRenderers.renderHtml(results);
      break;
    case "cli":
    default:
      ReportRenderers.renderTerminal(results);
      break;
  }

  // Save to file if output option specified
  if (options.outputPath && options.format !== "cli") {
    try {
      fs.writeFileSync(options.outputPath, outputData, "utf-8");
      console.log(fmt.green(`\n💾 Scan export written successfully to: ${options.outputPath}\n`));
    } catch (err) {
      console.error(fmt.red(`❌ Failed to write export file: ${err.message}`));
    }
  } else if (options.format !== "cli") {
    console.log(outputData);
  }

  // CI/CD Minimum Grade Enforcement
  if (options.minGrade) {
    const gradeScale = { "A+": 6, "A": 5, "B": 4, "C": 3, "D": 2, "F": 1 };
    const requiredRank = gradeScale[options.minGrade] || 4;

    const failedTargets = results.filter(r => (gradeScale[r.scoreDetails?.grade] || 1) < requiredRank);

    if (failedTargets.length > 0) {
      if (options.format === "cli") {
        console.error(fmt.red(`\n⛔ Build Gate Failed: ${failedTargets.length} scan target(s) scored below minimum required grade '${options.minGrade}'.\n`));
      }
      process.exit(1);
    }
  }

  const hasCritical = results.some(r => r.findings?.some(f => f.severity.name === "CRITICAL" || f.severity.name === "HIGH"));
  if (hasCritical) {
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(fmt.red(`❌ Fatal Unhandled Error: ${err.message}`));
  process.exit(1);
});