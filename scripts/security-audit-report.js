import fs from "fs";

const reportPath = "audit-report.json";

if (!fs.existsSync(reportPath)) {
  console.log("No audit report found.");
  process.exit(0);
}

const auditData = JSON.parse(
  fs.readFileSync(reportPath, "utf8")
);

const vulnerabilities =
  auditData.metadata?.vulnerabilities || {};

const output = `# Dependency Security Report

## Vulnerability Summary

| Severity | Count |
|----------|--------|
| Critical | ${vulnerabilities.critical || 0} |
| High | ${vulnerabilities.high || 0} |
| Moderate | ${vulnerabilities.moderate || 0} |
| Low | ${vulnerabilities.low || 0} |

Generated automatically by GitHub Actions.
`;

fs.writeFileSync(
  "dependency-security-report.md",
  output
);

console.log(
  "Dependency security report generated."
);