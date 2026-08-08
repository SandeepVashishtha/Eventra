import assert from "node:assert/strict";
import {
  buildDemoResumeProfile,
  buildProfileFromResumeText,
  extractTextFromPdfBytes,
  isPdfSignature,
  parseResumePDF,
  validateResumePdf,
  MAX_RESUME_BYTES,
} from "../src/utils/aiProfileParser.js";

function buildMinimalPdf(textChunks) {
  const content = textChunks
    .map((chunk) => `BT /F1 12 Tf 50 700 Td (${chunk.replace(/[()\\]/g, "")}) Tj ET`)
    .join("\n");
  const stream = `stream\n${content}\nendstream`;
  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>endobj",
    `4 0 obj<< /Length ${content.length} >>${stream}endobj`,
  ];
  return `%PDF-1.4\n${objects.join("\n")}\ntrailer<< /Root 1 0 R >>\n%%EOF`;
}

function pdfFile(name, pdfString, type = "application/pdf") {
  const bytes = new TextEncoder().encode(pdfString);
  return new File([bytes], name, { type });
}

// --- signature ---
{
  const good = new TextEncoder().encode("%PDF-1.4 rest");
  assert.equal(isPdfSignature(good), true);
  assert.equal(isPdfSignature(new Uint8Array([0x00, 0x01])), false);
  assert.equal(isPdfSignature(new Uint8Array()), false);
}

// --- text extraction from uncompressed PDF literals ---
{
  const pdf = buildMinimalPdf([
    "Jane Developer",
    "Summary: Backend engineer focused on APIs and reliability.",
    "Skills include Python Django PostgreSQL Docker and AWS.",
    "https://github.com/janedev",
    "https://linkedin.com/in/janedev",
    "https://janedev.dev",
  ]);
  const text = extractTextFromPdfBytes(new TextEncoder().encode(pdf));
  assert.match(text, /Jane Developer/);
  assert.match(text, /Python/);
  assert.match(text, /github\.com\/janedev/i);
}

// --- profile builder never invents fields ---
{
  const empty = buildProfileFromResumeText("");
  assert.equal(empty.extractionStatus, "empty");
  assert.deepEqual(empty.skills, []);
  assert.equal(empty.bio, "");
  assert.equal(empty.linkedin, "");
  assert.equal(empty.portfolio, "");
  assert.equal(empty.github, "");
}

{
  const profile = buildProfileFromResumeText(
    "Jane Developer Summary: Results focused engineer building APIs. Skills: Python Django PostgreSQL Docker. https://github.com/janedev https://linkedin.com/in/janedev https://janedev.dev Experience at Acme"
  );
  assert.ok(profile.skills.includes("Python"));
  assert.ok(profile.skills.includes("Django"));
  assert.ok(profile.skills.includes("PostgreSQL"));
  assert.equal(profile.github, "https://github.com/janedev");
  assert.equal(profile.linkedin, "https://linkedin.com/in/janedev");
  assert.equal(profile.portfolio, "https://janedev.dev");
  assert.match(profile.bio, /Results focused engineer/i);
  assert.equal(profile.extractionStatus, "partial");
  // No invented default URLs
  assert.notEqual(profile.linkedin, "https://linkedin.com/in/extracted-profile");
  assert.notEqual(profile.portfolio, "https://my-portfolio.com");
}

// --- same-length filenames must not change extracted content ---
{
  const sharedBody = buildMinimalPdf([
    "Alex Rivera",
    "Summary: Frontend developer passionate about accessibility.",
    "React TypeScript CSS Git",
    "https://github.com/alexr",
  ]);
  const fileA = pdfFile("resume_aaaa.pdf", sharedBody);
  const fileB = pdfFile("resume_bbbb.pdf", sharedBody);
  assert.equal(fileA.name.length, fileB.name.length);

  const { promise: promiseA } = parseResumePDF(fileA);
  const { promise: promiseB } = parseResumePDF(fileB);
  const [a, b] = await Promise.all([promiseA, promiseB]);

  assert.deepEqual(a.skills, b.skills);
  assert.equal(a.bio, b.bio);
  assert.equal(a.github, b.github);
  assert.equal(a.linkedin, b.linkedin);
  assert.equal(a.portfolio, b.portfolio);
  assert.ok(a.skills.includes("React"));
  assert.ok(a.skills.includes("TypeScript"));
}

// --- renamed identical files still produce the same extraction ---
{
  const body = buildMinimalPdf([
    "Sam Patel Skills JavaScript Node.js Express MongoDB https://github.com/samp",
  ]);
  const original = pdfFile("original-resume.pdf", body);
  const renamed = pdfFile("totally-different-name.pdf", body);

  const [{ promise: p1 }, { promise: p2 }] = [parseResumePDF(original), parseResumePDF(renamed)];
  const [r1, r2] = await Promise.all([p1, p2]);
  assert.deepEqual(r1.skills, r2.skills);
  assert.equal(r1.github, r2.github);
  assert.notEqual(original.name.length, renamed.name.length);
}

// --- malformed / non-PDF rejected ---
{
  const fake = new File([new TextEncoder().encode("not a pdf")], "resume.pdf", {
    type: "application/pdf",
  });
  await assert.rejects(
    () => validateResumePdf(fake),
    /not a valid PDF/i
  );
  const { promise } = parseResumePDF(fake);
  await assert.rejects(() => promise, /not a valid PDF/i);
}

// --- wrong MIME rejected ---
{
  const pdf = buildMinimalPdf(["Hello"]);
  const wrongType = pdfFile("resume.pdf", pdf, "text/plain");
  await assert.rejects(() => validateResumePdf(wrongType), /valid PDF/i);
}

// --- oversized rejected ---
{
  const big = new File([new Uint8Array(MAX_RESUME_BYTES + 1)], "huge.pdf", {
    type: "application/pdf",
  });
  // Force PDF magic so size check is what fails first
  Object.defineProperty(big, "slice", {
    value: () => ({
      arrayBuffer: async () => new TextEncoder().encode("%PDF-").buffer,
    }),
  });
  await assert.rejects(() => validateResumePdf(big), /5MB/i);
}

// --- empty PDF text leaves fields blank (no filename-derived fixtures) ---
{
  const emptyish = pdfFile("Python-Django-AWS-Expert.pdf", buildMinimalPdf(["   "]));
  const { promise } = parseResumePDF(emptyish);
  const result = await promise;
  assert.deepEqual(result.skills, []);
  assert.equal(result.bio, "");
  assert.equal(result.linkedin, "");
  assert.equal(result.portfolio, "");
  assert.ok(!/Python Django Aws Expert/i.test(result.fullName || ""));
}

// --- demo mode is explicit and labelled ---
{
  const file = pdfFile("anything.pdf", buildMinimalPdf(["ignored"]));
  const demo = buildDemoResumeProfile(file);
  assert.equal(demo.extractionStatus, "demo");
  assert.match(demo.extractionMessage, /Demo mode/i);

  const { promise } = parseResumePDF(file, { demoMode: true });
  const result = await promise;
  assert.equal(result.extractionStatus, "demo");
  assert.match(result.extractionMessage, /not parsed from document/i);
}

// --- cleanup aborts in-flight parse ---
{
  const body = buildMinimalPdf(["Cancel Me React"]);
  const file = pdfFile("cancel.pdf", body);
  const { promise, cleanup } = parseResumePDF(file);
  cleanup();
  // May resolve if it finished before abort, or reject — either way must not invent data
  try {
    const result = await promise;
    assert.notEqual(result.linkedin, "https://linkedin.com/in/extracted-profile");
  } catch (err) {
    assert.match(String(err.message || err), /cancel/i);
  }
}

console.log("aiProfileParser resume extraction tests passed");
