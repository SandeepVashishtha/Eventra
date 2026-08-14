/**
 * Utility functions for AI-Powered Profile Auto-Generation.
 * Handles GitHub REST API fetching and local Resume PDF text extraction.
 */

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

/** Common tech keywords matched against extracted resume text (case-insensitive). */
export const KNOWN_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin",
  "React", "Next.js", "Vue", "Angular", "Svelte", "Node.js", "Express", "Django", "Flask", "Spring", "Rails",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "GraphQL", "REST",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "CI/CD", "Linux",
  "HTML", "HTML5", "CSS", "CSS3", "Tailwind", "Sass",
  "Machine Learning", "TensorFlow", "PyTorch", "NLP",
  "React Native", "Flutter", "Android", "iOS",
];

/**
 * Extracts a GitHub username from various formats of GitHub URLs.
 * @param {string} url - The provided GitHub URL.
 * @returns {string|null} - The extracted username or null.
 */
export function extractUsername(url) {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    if (/github\.com/i.test(trimmed) || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      let formattedUrl = trimmed;
      if (!/^https?:\/\//i.test(trimmed)) {
        formattedUrl = "https://" + trimmed;
      }
      const parsed = new URL(formattedUrl);
      if (!/github\.com$/i.test(parsed.hostname)) {
        return null;
      }
      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      if (pathSegments.length === 0) {
        return null;
      }
      const username = pathSegments[0];
      if (/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username)) {
        const reserved = [
          "features",
          "enterprise",
          "copilot",
          "security",
          "pricing",
          "team",
          "trending",
          "explore",
          "about",
          "contact",
          "careers",
          "sponsors",
        ];
        if (reserved.includes(username.toLowerCase())) {
          return null;
        }
        return username;
      }
      return null;
    }

    if (/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(trimmed)) {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parses a GitHub profile and returns structured developer data.
 * @param {string} githubUrl - The user's GitHub profile URL.
 * @returns {Promise<Object>} - The structured profile data.
 */
export async function parseGithubProfile(githubUrl) {
  const username = extractUsername(githubUrl);
  if (!username) {
    throw new Error("Invalid GitHub URL provided.");
  }

  try {
    // Fetch basic user profile
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) {
      throw new Error("GitHub profile not found.");
    }
    const userData = await userRes.json();

    // Fetch repositories to infer skills based on languages/topics
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=updated`);
    let skills = [];
    if (reposRes.ok) {
      const reposData = await reposRes.json();
      const techCounts = {};
      
      reposData.forEach(repo => {
        // Track primary languages
        if (repo.language) {
          techCounts[repo.language] = (techCounts[repo.language] || 0) + 2; // Weight language higher
        }
        // Track topics
        if (repo.topics && Array.isArray(repo.topics)) {
          repo.topics.forEach(topic => {
            // Capitalize topic for nicer display
            const niceTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
            techCounts[niceTopic] = (techCounts[niceTopic] || 0) + 1;
          });
        }
      });

      // Sort by count and take top 8
      skills = Object.entries(techCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([tech]) => tech);
    }

    return {
      fullName: userData.name || "",
      username: username,
      bio: userData.bio || "Passionate developer building open-source projects.",
      github: userData.html_url || githubUrl,
      portfolio: userData.blog ? (userData.blog.startsWith("http") ? userData.blog : `https://${userData.blog}`) : "",
      skills: skills,
      avatarBase64: userData.avatar_url, // We'll pass the URL, the UI can handle image fetch
    };
  } catch (error) {
    throw new Error(error.message || "Failed to parse GitHub profile.");
  }
}

/**
 * Returns true when the leading bytes match a PDF file signature.
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
export function isPdfSignature(bytes) {
  if (!bytes || bytes.length < PDF_MAGIC.length) return false;
  return PDF_MAGIC.every((byte, index) => bytes[index] === byte);
}

/**
 * Decodes a PDF literal string (handles common escape sequences).
 * @param {string} value
 * @returns {string}
 */
function decodePdfLiteralString(value) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

/**
 * Extracts readable text literals from raw PDF bytes.
 * Works for uncompressed text objects; compressed streams may yield little text.
 * Uses a linear character-by-character parser to avoid regex backtracking.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function extractTextFromPdfBytes(bytes) {
  if (!bytes || bytes.length === 0) return "";

  const raw = new TextDecoder("latin1").decode(bytes);
  const chunks = [];
  const MAX_INPUT = 2 * 1024 * 1024;
  const input = raw.length > MAX_INPUT ? raw.slice(0, MAX_INPUT) : raw;
  const len = input.length;

  let i = 0;
  while (i < len) {
    if (input[i] === "(") {
      i++;
      let str = "";
      let depth = 1;
      while (i < len && depth > 0) {
        const ch = input[i];
        if (ch === "\\" && i + 1 < len) {
          const next = input[i + 1];
          if (next === "(" || next === ")" || next === "\\") {
            str += next;
            i += 2;
          } else if (next === "n") { str += "\n"; i += 2; }
          else if (next === "r") { str += "\r"; i += 2; }
          else if (next === "t") { str += "\t"; i += 2; }
          else if (next >= "0" && next <= "7") {
            let oct = "";
            let j = i + 1;
            while (j < len && j < i + 4 && input[j] >= "0" && input[j] <= "7") {
              oct += input[j];
              j++;
            }
            str += String.fromCharCode(parseInt(oct, 8));
            i = j;
          } else {
            str += next;
            i += 2;
          }
        } else if (ch === "(") {
          depth++;
          str += ch;
          i++;
        } else if (ch === ")") {
          depth--;
          if (depth > 0) str += ch;
          i++;
        } else {
          str += ch;
          i++;
        }
      }
      const cleaned = str.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
      if (cleaned.length >= 2) {
        chunks.push(cleaned);
      }
    } else {
      i++;
    }
  }

  const hexRegex = /<([0-9A-Fa-f\s]+)>/g;
  let match;
  while ((match = hexRegex.exec(input)) !== null) {
    const hex = match[1].replace(/\s/g, "");
    if (hex.length < 4 || hex.length % 2 !== 0) continue;

    let text = "";
    let valid = true;
    for (let j = 0; j < hex.length; j += 2) {
      const code = parseInt(hex.slice(j, j + 2), 16);
      if (code >= 32 && code <= 126) {
        text += String.fromCharCode(code);
      } else if (code === 9 || code === 10 || code === 13) {
        text += " ";
      } else {
        valid = false;
        break;
      }
    }
    if (valid) {
      const cleaned = text.replace(/\s+/g, " ").trim();
      if (cleaned.length >= 2) chunks.push(cleaned);
    }
  }

  return chunks.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Validates resume PDF type, size, extension, and file signature.
 * @param {File} file
 * @returns {Promise<void>}
 */
export async function validateResumePdf(file) {
  if (!file) {
    throw new Error("Please upload a valid PDF resume.");
  }

  if (file.size === 0) {
    throw new Error("The uploaded file is empty.");
  }

  if (file.size > MAX_RESUME_BYTES) {
    throw new Error("Resume PDF must be 5MB or smaller.");
  }

  const name = typeof file.name === "string" ? file.name : "";
  const extension = name.includes(".") ? `.${name.split(".").pop().toLowerCase()}` : "";
  if (extension && extension !== ".pdf") {
    throw new Error("Please upload a valid PDF resume.");
  }

  const mime = file.type || "";
  if (mime && mime !== "application/pdf") {
    throw new Error("Please upload a valid PDF resume.");
  }

  const headerBuffer = await file.slice(0, 5).arrayBuffer();
  const headerBytes = new Uint8Array(headerBuffer);
  if (!isPdfSignature(headerBytes)) {
    throw new Error("File content is not a valid PDF.");
  }
}

/**
 * Builds profile fields only from extracted resume text. Never invents URLs or skills.
 * @param {string} text
 * @returns {{ fullName: string, bio: string, skills: string[], github: string, linkedin: string, portfolio: string, extractionStatus: string, extractionMessage: string, extractedTextLength: number }}
 */
export function buildProfileFromResumeText(text) {
  const normalized = (text || "").replace(/\s+/g, " ").trim();
  const extractedTextLength = normalized.length;

  if (!normalized) {
    return {
      fullName: "",
      bio: "",
      skills: [],
      github: "",
      linkedin: "",
      portfolio: "",
      extractionStatus: "empty",
      extractionMessage: "No readable text was found in this PDF. Fields were left blank — fill them in manually or try a text-based PDF.",
      extractedTextLength: 0,
    };
  }

  const skills = [];
  for (const skill of KNOWN_SKILLS) {
    const needle = skill.toLowerCase();
    // Word-boundary-ish match so "Go" does not match inside "Google"
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?:^|[^A-Za-z0-9+.#/])${escaped}(?=$|[^A-Za-z0-9+.#/])`, "i");
    if (pattern.test(normalized) && !skills.some((s) => s.toLowerCase() === needle)) {
      skills.push(skill);
    }
  }

  const githubMatch = normalized.match(/https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9_-]+\/?/i);
  const linkedinMatch = normalized.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?/i);
  const allUrls = normalized.match(/https?:\/\/[^\s<>()"']+/gi) || [];
  const portfolio = allUrls.find((url) => {
    const u = url.toLowerCase();
    return !u.includes("github.com") && !u.includes("linkedin.com");
  }) || "";

  // Prefer an explicit summary/objective block when present; otherwise leave blank.
  let bio = "";
  const summaryMatch = normalized.match(
    /(?:summary|objective|profile|about me)\s*[:\-–]?\s*(.{40,320}?)(?=(?:experience|education|skills|projects|work history)\b|$)/i
  );
  if (summaryMatch) {
    bio = summaryMatch[1].replace(/\s+/g, " ").trim();
  }

  // Heuristic name: first line-like token sequence of 2–4 capitalized words near the start.
  let fullName = "";
  const nameMatch = normalized.slice(0, 200).match(
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/
  );
  if (nameMatch) {
    fullName = nameMatch[1];
  }

  const hasAnyField = Boolean(fullName || bio || skills.length || githubMatch || linkedinMatch || portfolio);

  return {
    fullName,
    bio,
    skills: skills.slice(0, 12),
    github: githubMatch ? githubMatch[0].replace(/\/$/, "") : "",
    linkedin: linkedinMatch ? linkedinMatch[0].replace(/\/$/, "") : "",
    portfolio: portfolio.replace(/[.,);]+$/, ""),
    extractionStatus: hasAnyField ? "partial" : "empty",
    extractionMessage: hasAnyField
      ? "Extracted only values found in the document. Missing fields were left blank."
      : "Text was found but no profile fields could be identified. Fields were left blank.",
    extractedTextLength,
  };
}

/**
 * Demo-only fixture path. Must be opted into explicitly and is labelled as sample data.
 * @param {File} file
 * @returns {Object}
 */
export function buildDemoResumeProfile(file) {
  const label = file?.name ? ` (${file.name})` : "";
  return {
    fullName: "Demo User",
    bio: "Sample resume data for demo mode only. Not extracted from the uploaded file.",
    skills: ["JavaScript", "React", "Node.js"],
    github: "",
    linkedin: "",
    portfolio: "",
    extractionStatus: "demo",
    extractionMessage: `Demo mode sample data${label}. Not parsed from document contents.`,
    extractedTextLength: 0,
  };
}

/**
 * Parses a Resume PDF by validating the file and extracting text locally.
 * Does not invent skills, bios, or URLs from the filename.
 * @param {File} file - The uploaded PDF file.
 * @param {{ demoMode?: boolean }} [options]
 * @returns {{ promise: Promise<Object>, cleanup: () => void }}
 */
export function parseResumePDF(file, options = {}) {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  let aborted = false;

  const cleanup = () => {
    aborted = true;
    controller?.abort();
  };

  const promise = (async () => {
    if (options.demoMode === true) {
      return buildDemoResumeProfile(file);
    }

    await validateResumePdf(file);
    if (aborted || controller?.signal.aborted) {
      throw new Error("Resume parsing was cancelled.");
    }

    const buffer = await file.arrayBuffer();
    if (aborted || controller?.signal.aborted) {
      throw new Error("Resume parsing was cancelled.");
    }

    const bytes = new Uint8Array(buffer);
    if (!isPdfSignature(bytes)) {
      throw new Error("File content is not a valid PDF.");
    }

    const text = extractTextFromPdfBytes(bytes);
    return buildProfileFromResumeText(text);
  })();

  return { promise, cleanup };
}
