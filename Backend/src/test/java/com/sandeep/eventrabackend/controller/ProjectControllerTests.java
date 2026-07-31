package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.dto.request.ProjectCreateRequest;
import com.sandeep.eventrabackend.model.Project;
import com.sandeep.eventrabackend.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ProjectControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        projectRepository.deleteAll();
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void testCreateProject_Success_Returns201() throws Exception {
        ProjectCreateRequest request = ProjectCreateRequest.builder()
                .title("New Project")
                .description("New Description")
                .category("Web Development")
                .thumbnailUrl("http://example.com/new.png")
                .githubUrl("http://github.com/new/repo")
                .build();

        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Project"))
                .andExpect(jsonPath("$.description").value("New Description"))
                .andExpect(jsonPath("$.category").value("Web Development"))
                .andExpect(jsonPath("$.thumbnailUrl").value("http://example.com/new.png"))
                .andExpect(jsonPath("$.githubUrl").value("http://github.com/new/repo"))
                .andExpect(jsonPath("$.upvotes").value(0));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void testCreateProject_ValidationFailure_Returns400() throws Exception {
        ProjectCreateRequest request = ProjectCreateRequest.builder()
                .title("") // Blank title
                .description("New Description")
                .category("Web Development")
                .build();

        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCreateProject_Unauthenticated_Returns401() throws Exception {
        ProjectCreateRequest request = ProjectCreateRequest.builder()
                .title("New Project")
                .description("New Description")
                .category("Web Development")
                .build();

        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "CLIENT")
    void testCreateProject_ForbiddenRole_Returns403() throws Exception {
        ProjectCreateRequest request = ProjectCreateRequest.builder()
                .title("New Project")
                .description("New Description")
                .category("Web Development")
                .build();

        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetAllProjects_EmptyList_Returns200() throws Exception {
        mockMvc.perform(get("/api/projects")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void testGetAllProjects_PublicAccess_ReturnsProjects() throws Exception {
        Project project = Project.builder()
                .title("Test Project")
                .description("Test Description")
                .category("Web Development")
                .thumbnailUrl("http://example.com/thumb.png")
                .githubUrl("http://github.com/test/repo")
                .upvotes(10)
                .build();
        projectRepository.save(project);

        mockMvc.perform(get("/api/projects")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Test Project"))
                .andExpect(jsonPath("$[0].description").value("Test Description"))
                .andExpect(jsonPath("$[0].category").value("Web Development"))
                .andExpect(jsonPath("$[0].thumbnailUrl").value("http://example.com/thumb.png"))
                .andExpect(jsonPath("$[0].githubUrl").value("http://github.com/test/repo"))
                .andExpect(jsonPath("$[0].upvotes").value(10));
    }

    @Test
    void testGetCategories_PublicAccess_Returns200() throws Exception {
        mockMvc.perform(get("/api/projects/categories")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(8)))
                .andExpect(jsonPath("$", hasItems(
                        "Mobile Development",
                        "Web Development",
                        "Developer Tools",
                        "Machine Learning",
                        "DevOps",
                        "Design",
                        "IoT",
                        "Blockchain"
                )));
    }

    @Test
    void testGetProjectById_Exists_ReturnsProject() throws Exception {
        Project project = Project.builder()
                .title("Single Project")
                .description("Detail Description")
                .category("Mobile Development")
                .thumbnailUrl("http://example.com/single.png")
                .githubUrl("http://github.com/test/single")
                .upvotes(5)
                .build();
        project = projectRepository.save(project);

        mockMvc.perform(get("/api/projects/" + project.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(project.getId()))
                .andExpect(jsonPath("$.title").value("Single Project"))
                .andExpect(jsonPath("$.description").value("Detail Description"))
                .andExpect(jsonPath("$.category").value("Mobile Development"))
                .andExpect(jsonPath("$.thumbnailUrl").value("http://example.com/single.png"))
                .andExpect(jsonPath("$.githubUrl").value("http://github.com/test/single"))
                .andExpect(jsonPath("$.upvotes").value(5));
    }

    @Test
    void testGetProjectById_NotFound_Returns404() throws Exception {
        mockMvc.perform(get("/api/projects/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Project not found with id: 999"))
                .andExpect(jsonPath("$.path").value("/api/projects/999"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @WithMockUser(authorities = "CLIENT")
    void testUpvoteProject_Success_Returns200() throws Exception {
        Project project = Project.builder()
                .title("Upvote Project")
                .description("Description")
                .category("DevOps")
                .upvotes(5)
                .build();
        project = projectRepository.save(project);

        mockMvc.perform(post("/api/projects/" + project.getId() + "/upvote")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(project.getId()))
                .andExpect(jsonPath("$.upvotes").value(6));
    }

    @Test
    void testUpvoteProject_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(post("/api/projects/1/upvote")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "CLIENT")
    void testUpvoteProject_NotFound_Returns404() throws Exception {
        mockMvc.perform(post("/api/projects/999/upvote")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Project not found with id: 999"));
    }
}
