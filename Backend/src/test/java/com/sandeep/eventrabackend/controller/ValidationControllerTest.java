package com.sandeep.eventrabackend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for {@link ValidationController}.
 *
 * Run with: ./mvnw test -Dtest=ValidationControllerTest
 */
@SpringBootTest
@AutoConfigureMockMvc
class ValidationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // -------------------------------------------------------------------------
    // Test 1: Valid payload + XSS sanitization sweep
    // -------------------------------------------------------------------------
    @Test
    void shouldValidateAndSanitizeValidForm() throws Exception {
        String payload = """
                {
                  "schema": {
                    "$schema": "https://json-schema.org/draft/2020-12/schema",
                    "type": "object",
                    "required": ["teamName", "githubHandle", "teamSize"],
                    "properties": {
                      "teamName":    { "type": "string", "minLength": 3 },
                      "githubHandle":{ "type": "string", "pattern": "^[a-zA-Z0-9-]+$" },
                      "teamSize":    { "type": "integer", "minimum": 1, "maximum": 4 }
                    }
                  },
                  "formData": {
                    "teamName": "CodeBuilders <script>alert(1)</script>",
                    "githubHandle": "rajatsingh535",
                    "teamSize": 3
                  }
                }
                """;

        mockMvc.perform(post("/api/v1/forms/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                // XSS tag must be stripped; safe text retained
                .andExpect(jsonPath("$.sanitizedData.teamName").value("CodeBuilders"))
                .andExpect(jsonPath("$.sanitizedData.githubHandle").value("rajatsingh535"))
                .andExpect(jsonPath("$.sanitizedData.teamSize").value(3));
    }

    // -------------------------------------------------------------------------
    // Test 2: Missing required field + invalid regex pattern
    // -------------------------------------------------------------------------
    @Test
    void shouldReturnFieldErrorsForInvalidPayload() throws Exception {
        String payload = """
                {
                  "schema": {
                    "$schema": "https://json-schema.org/draft/2020-12/schema",
                    "type": "object",
                    "required": ["teamName", "githubHandle"],
                    "properties": {
                      "teamName":    { "type": "string", "minLength": 3 },
                      "githubHandle":{ "type": "string", "pattern": "^[a-zA-Z0-9-]+$" }
                    }
                  },
                  "formData": {
                    "githubHandle": "invalid_handle@123"
                  }
                }
                """;

        mockMvc.perform(post("/api/v1/forms/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.errors.teamName").exists())
                .andExpect(jsonPath("$.errors.githubHandle").exists());
    }

    // -------------------------------------------------------------------------
    // Test 3: Email format + XSS in email value
    // -------------------------------------------------------------------------
    @Test
    void shouldSanitizeEmailAndValidateFormat() throws Exception {
        String payload = """
                {
                  "schema": {
                    "type": "object",
                    "required": ["email"],
                    "properties": {
                      "email": {
                        "type": "string",
                        "pattern": "^[^@]+@[^@]+\\\\.[^@]+$"
                      }
                    }
                  },
                  "formData": {
                    "email": "dev@eventra.io<script>evil()</script>"
                  }
                }
                """;

        mockMvc.perform(post("/api/v1/forms/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.sanitizedData.email").value("dev@eventra.io"));
    }

    // -------------------------------------------------------------------------
    // Test 4: Phone number pattern validation
    // -------------------------------------------------------------------------
    @Test
    void shouldReturnFieldErrorWhenRegexFails() throws Exception {
        String payload = """
                {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "phone": { "type": "string", "pattern": "^[0-9]{10}$" }
                    }
                  },
                  "formData": {
                    "phone": "123-abc"
                  }
                }
                """;

        mockMvc.perform(post("/api/v1/forms/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.errors.phone").exists());
    }

    // -------------------------------------------------------------------------
    // Test 5: Missing schema/formData → 400 Bad Request
    // -------------------------------------------------------------------------
    @Test
    void shouldReturn400WhenSchemaOrFormDataMissing() throws Exception {
        String payload = """
                {
                  "schema": { "type": "object" }
                }
                """;

        mockMvc.perform(post("/api/v1/forms/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.valid").value(false));
    }

    // -------------------------------------------------------------------------
    // Test 6: Integer range validation
    // -------------------------------------------------------------------------
    @Test
    void shouldRejectTeamSizeOutOfRange() throws Exception {
        String payload = """
                {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "teamSize": { "type": "integer", "minimum": 1, "maximum": 4 }
                    }
                  },
                  "formData": { "teamSize": 10 }
                }
                """;

        mockMvc.perform(post("/api/v1/forms/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.errors.teamSize").exists());
    }
}
