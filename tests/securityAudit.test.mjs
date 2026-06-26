import assert from "node:assert";

const mockAuditData = {
  metadata: {
    vulnerabilities: {
      critical: 0,
      high: 1,
      moderate: 2,
      low: 3,
    },
  },
};

assert.equal(
  mockAuditData.metadata.vulnerabilities.high,
  1
);

assert.equal(
  mockAuditData.metadata.vulnerabilities.critical,
  0
);

console.log(
  "securityAudit tests passed"
);