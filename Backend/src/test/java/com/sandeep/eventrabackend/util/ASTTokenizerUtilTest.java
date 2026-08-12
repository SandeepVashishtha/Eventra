package com.sandeep.eventrabackend.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ASTTokenizerUtilTest {

    @Test
    @DisplayName("Empty code produces no tokens and a 0.0 similarity score (#15288)")
    void emptyCodeScoresZero() {
        assertTrue(ASTTokenizerUtil.tokenizeCode("").isEmpty());
        assertEquals(0.0, ASTTokenizerUtil.calculateSimilarityScore("", ""));
    }

    @Test
    @DisplayName("Comment-only code produces no tokens and a 0.0 similarity score (#15288)")
    void commentOnlyCodeScoresZero() {
        String commentOnly = "// just a comment\n/* block comment */";
        assertTrue(ASTTokenizerUtil.tokenizeCode(commentOnly).isEmpty());
        assertEquals(0.0, ASTTokenizerUtil.calculateSimilarityScore(commentOnly, ""));
    }

    @Test
    @DisplayName("Keywords remain distinct KW_ tokens instead of collapsing into IDENT (#15288)")
    void keywordsStayDistinct() {
        List<String> tokens = ASTTokenizerUtil.tokenizeCode("return if else for while public");
        assertEquals(List.of("KW_return", "KW_if", "KW_else", "KW_for", "KW_while", "KW_public"), tokens);
    }

    @Test
    @DisplayName("Identifiers normalize to IDENT while keywords are preserved (#15288)")
    void identifiersNormalizeButKeywordsSurvive() {
        List<String> tokens = ASTTokenizerUtil.tokenizeCode("function computeSum(a, b) { let total = a + b; return total; }");
        assertTrue(tokens.contains("KW_function"));
        assertTrue(tokens.contains("KW_return"));
        assertTrue(tokens.stream().noneMatch(t -> t.equals("computeSum") || t.equals("total") || t.equals("a") || t.equals("b")));
        assertEquals(tokens, ASTTokenizerUtil.tokenizeCode("function computeProduct(x, y) { let result = x + y; return result; }"));
    }

    @Test
    @DisplayName("Identical code scores 100.0 (#15288)")
    void identicalCodeScoresFull() {
        String code = "function computeSum(a, b) { return a + b; }";
        assertEquals(100.0, ASTTokenizerUtil.calculateSimilarityScore(code, code));
    }

    @Test
    @DisplayName("Code with only identifiers renamed is structurally identical and scores 100.0 (#15288)")
    void renamedVariablesRemainStructurallyIdentical() {
        String original = "function computeSum(a, b) { let total = a + b; return total; }";
        String renamed = "function add(x, y) { let result = x + y; return result; }";
        assertEquals(100.0, ASTTokenizerUtil.calculateSimilarityScore(original, renamed));
    }

    @Test
    @DisplayName("Structurally similar code with control-flow differences scores high but below 100.0 (#15288)")
    void similarButNotIdenticalCodeScoresHighButNotFull() {
        String flat = "if (x > 0) { x = x - 1; }";
        String nested = "if (x > 0) { if (x > 5) { x = x - 1; } }";
        double score = ASTTokenizerUtil.calculateSimilarityScore(flat, nested);
        assertTrue(score > 40.0 && score < 100.0, "expected a high-but-not-perfect score, got " + score);
    }

    @Test
    @DisplayName("String and number literal markers survive identifier normalization (#15288)")
    void literalMarkersSurvive() {
        List<String> tokens = ASTTokenizerUtil.tokenizeCode("let msg = \"hello\"; let n = 42;");
        assertTrue(tokens.stream().anyMatch(t -> t.startsWith("STR_LITERAL")));
        assertTrue(tokens.stream().anyMatch(t -> t.startsWith("NUM_LITERAL")));
        assertTrue(tokens.stream().noneMatch(t -> t.equals("hello") || t.equals("42")));
    }

    @Test
    @DisplayName("Different programs score low (#15288)")
    void differentProgramsScoreLow() {
        String forLoop = "for (let i = 0; i < n; i++) { total += i; }";
        String ioCode = "import fs from 'fs'; fs.readFileSync('x.txt');";
        assertTrue(ASTTokenizerUtil.calculateSimilarityScore(forLoop, ioCode) < 40.0);
    }
}
