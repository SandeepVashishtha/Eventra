package com.sandeep.eventrabackend.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TeamMatchmakingServiceTest {

    private final TeamMatchmakingService service = new TeamMatchmakingService(new SkillVectorComparator());

    @Test
    @DisplayName("primaryComplementarySkill is the skill that fills the largest team gap (#15295)")
    void primarySkillFillsLargestGap() {
        Map<String, Integer> team = new LinkedHashMap<>();
        team.put("backend", 80);
        team.put("devops", 60);
        Map<String, Integer> applicant = new LinkedHashMap<>();
        applicant.put("backend", 70);
        applicant.put("devops", 90);

        Map<String, Object> result = service.proposeSmartTeamMatch(team, applicant);

        assertEquals("devops", result.get("primaryComplementarySkill"));
    }

    @Test
    @DisplayName("empty team vector: applicant skill with highest proficiency wins (#15295)")
    void emptyTeamVectorUsesApplicantStrengths() {
        Map<String, Integer> team = new LinkedHashMap<>();
        Map<String, Integer> applicant = new LinkedHashMap<>();
        applicant.put("backend", 90);
        applicant.put("uiux", 40);

        Map<String, Object> result = service.proposeSmartTeamMatch(team, applicant);

        assertEquals("backend", result.get("primaryComplementarySkill"));
    }

    @Test
    @DisplayName("applicant strong in a skill the team lacks entirely is the primary skill (#15295)")
    void applicantStrongInMissingSkill() {
        Map<String, Integer> team = new LinkedHashMap<>();
        team.put("backend", 90);
        Map<String, Integer> applicant = new LinkedHashMap<>();
        applicant.put("backend", 60);
        applicant.put("ai-ml", 85);

        Map<String, Object> result = service.proposeSmartTeamMatch(team, applicant);

        assertEquals("ai-ml", result.get("primaryComplementarySkill"));
    }

    @Test
    @DisplayName("equal gap fills tie-break to the first encountered skill (#15295)")
    void tieBreaksToFirstEncounteredSkill() {
        Map<String, Integer> team = new LinkedHashMap<>();
        team.put("backend", 0);
        team.put("devops", 0);
        Map<String, Integer> applicant = new LinkedHashMap<>();
        applicant.put("backend", 50);
        applicant.put("devops", 50);

        Map<String, Object> result = service.proposeSmartTeamMatch(team, applicant);

        assertEquals("backend", result.get("primaryComplementarySkill"));
    }

    @Test
    @DisplayName("empty applicant skills yield N/A and no recommendation (#15295)")
    void emptyApplicantSkillsYieldNA() {
        Map<String, Integer> team = new LinkedHashMap<>();
        team.put("backend", 50);

        Map<String, Object> result = service.proposeSmartTeamMatch(team, new LinkedHashMap<>());

        assertEquals("N/A", result.get("primaryComplementarySkill"));
    }

    @Test
    @DisplayName("compatibility and complementarity are reported as distinct metrics (#15295)")
    void metricsAreNotConflated() {
        Map<String, Integer> team = new LinkedHashMap<>();
        team.put("backend", 0);
        team.put("uiux", 90);
        Map<String, Integer> applicant = new LinkedHashMap<>();
        applicant.put("backend", 90);
        applicant.put("uiux", 90);

        Map<String, Object> result = service.proposeSmartTeamMatch(team, applicant);

        assertTrue(result.containsKey("compatibilityPercentage"));
        assertTrue(result.containsKey("complementarityScore"));
        assertFalse(result.containsKey("primaryComplementarySkill") && result.get("primaryComplementarySkill").equals("UI/UX & AI"));
    }

    @Test
    @DisplayName("recommendedMatch reflects both gap-filling and compatibility (#15295)")
    void recommendedMatchRequiresBothMetrics() {
        Map<String, Integer> team = new LinkedHashMap<>();
        team.put("backend", 0);
        team.put("ai", 100);
        team.put("uiux", 100);
        Map<String, Integer> applicant = new LinkedHashMap<>();
        applicant.put("backend", 90);

        Map<String, Object> result = service.proposeSmartTeamMatch(team, applicant);

        // High gap-fill (90) but zero overlap with the team's skill set -> low compatibility.
        assertEquals(90L, result.get("complementarityScore"));
        assertEquals(0L, result.get("compatibilityPercentage"));
        assertEquals(Boolean.FALSE, result.get("recommendedMatch"));
    }
}
