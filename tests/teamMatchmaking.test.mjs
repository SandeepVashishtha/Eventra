import { describe, it } from "node:test";
import assert from "node:assert/strict";

function computeComplementarityScore(teamSkills, applicantSkills) {
  let totalGapFilled = 0.0;
  let count = 0;

  for (const [skill, applicantProficiency] of Object.entries(applicantSkills)) {
    const currentTeamProficiency = teamSkills[skill] || 0;
    const gap = Math.max(0, 100 - currentTeamProficiency);
    totalGapFilled += (gap / 100.0) * applicantProficiency;
    count++;
  }

  return count > 0 ? Math.min(99, Math.max(20, Math.round(totalGapFilled / count))) : 50;
}

describe("AI Team Matchmaking & Skill Complementarity Tests", () => {
  it("should return high compatibility score for applicant filling major team skill gaps", () => {
    const teamSkills = { frontend: 90, backend: 80, uiux: 10, ai: 0 };
    const applicantSkills = { uiux: 95, ai: 90 };

    const score = computeComplementarityScore(teamSkills, applicantSkills);
    assert.ok(score >= 80, "Applicant with strong UI/UX and AI should have high compatibility score");
  });
});
