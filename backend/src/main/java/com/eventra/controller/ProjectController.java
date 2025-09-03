package com.eventra.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eventra.dto.MessageResponse;
import com.eventra.dto.ProjectSubmission;
import com.eventra.entity.Project;
import com.eventra.entity.ProjectStatus;
import com.eventra.entity.User;
import com.eventra.repository.ProjectRepository;
import com.eventra.service.CustomUserDetailsService;
import com.eventra.service.ProjectService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Slf4j
public class ProjectController {

    private final ProjectService projectService;
    private final CustomUserDetailsService userService;
    private final ProjectRepository projectRepository;

    // Helper method to convert Project entity to simple Map
    private Map<String, Object> toSimpleMap(Project p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("title", p.getTitle());
        map.put("description", p.getDescription());
        map.put("author", p.getAuthor());
        map.put("category", p.getCategory());
        map.put("techStack", p.getTechStack());
        map.put("githubUrl", p.getGithubUrl());
        map.put("liveDemo", p.getLiveDemo());
        map.put("image", p.getImage());
        map.put("difficulty", p.getDifficulty());
        map.put("openIssues", p.getOpenIssues());
        map.put("pullRequests", p.getPullRequests());
        map.put("stars", p.getStars());
        map.put("forks", p.getForks());
        map.put("submittedByUserEmail", p.getSubmittedBy() != null ? p.getSubmittedBy().getEmail() : null);
        map.put("status", p.getStatus());
        return map;
    }

    // Public API: List all approved projects (with optional category filter)
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getProjects(
            @RequestParam(name = "category", required = false) String category) {
        List<Project> projects = (category == null || category.isEmpty())
                ? projectService.getApprovedProjects()
                : projectService.getApprovedProjectsByCategory(category);

        List<Map<String, Object>> result = projects.stream()
                .map(this::toSimpleMap)
                .toList();

        return ResponseEntity.ok(result);
    }

    // Authenticated users submit new projects; status set PENDING
    @PostMapping("/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> submitProject(
            @Valid @RequestBody ProjectSubmission submission, Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Project savedProject = projectService.submitProject(submission, user);
        MessageResponse response = new MessageResponse("Project submitted successfully and pending approval", savedProject);
        return ResponseEntity.ok(response);
    }

    // Authenticated users get only their own submitted projects
    @GetMapping("/mine")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getMyProjects(Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Project> projects = projectRepository.findBySubmittedBy(user);

        List<Map<String, Object>> result = projects.stream()
                .map(this::toSimpleMap)
                .toList();

        return ResponseEntity.ok(result);
    }

    // Update project details by submitter or admin
    @PutMapping("/{projectId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> updateProject(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectSubmission updatedData,
            Authentication authentication) {

        String userEmail = authentication.getName();
        User user = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        Optional<Project> existingOpt = projectRepository.findById(projectId);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Project existing = existingOpt.get();

        // Check ownership or admin role
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!existing.getSubmittedBy().equals(user) && !isAdmin) {
            return ResponseEntity.status(403).body(new MessageResponse("Not authorized to edit this project"));
        }

        // Update allowed fields
        existing.setTitle(updatedData.getTitle());
        existing.setDescription(updatedData.getDescription());
        existing.setCategory(updatedData.getCategory());
        existing.setTechStack(updatedData.getTechStack());
        existing.setGithubUrl(updatedData.getGithubUrl());
        existing.setLiveDemo(updatedData.getLiveDemo());
        existing.setImage(updatedData.getImage());
        existing.setDifficulty(updatedData.getDifficulty());
        existing.setOpenIssues(updatedData.getOpenIssues());
        existing.setPullRequests(updatedData.getPullRequests());
        existing.setStars(updatedData.getStars());
        existing.setForks(updatedData.getForks());

        projectRepository.save(existing);

        return ResponseEntity.ok(new MessageResponse("Project updated successfully", existing));
    }
    
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllProjectsForAdmin() {
        List<Project> projects = projectRepository.findAll(); // all projects, any status
        List<Map<String, Object>> result = projects.stream()
            .map(this::toSimpleMap)
            .toList();
        return ResponseEntity.ok(result);
    }


    // Admin endpoint to approve or reject projects
    @PutMapping("/{projectId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> updateProjectStatus(
            @PathVariable Long projectId,
            @RequestParam ProjectStatus status) {

        Optional<Project> updatedProjectOpt = projectService.updateProjectStatus(projectId, status);
        if (updatedProjectOpt.isPresent()) {
            return ResponseEntity.ok(new MessageResponse("Project status updated to " + status));
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    // Optional: Delete project by submitter or admin
    @DeleteMapping("/{projectId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> deleteProject(
            @PathVariable Long projectId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userService.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Project project = projectOpt.get();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!project.getSubmittedBy().equals(user) && !isAdmin) {
            return ResponseEntity.status(403).body(new MessageResponse("Not authorized to delete this project"));
        }
        projectRepository.delete(project);
        return ResponseEntity.ok(new MessageResponse("Project deleted successfully"));
    }

    // ================= NEW ENDPOINTS FOR FRONTEND PROJECT GALLERY =================
    
    /**
     * Get all public projects with enhanced DTO response
     */
    @GetMapping("/public")
    public ResponseEntity<List<com.eventra.dto.ProjectDTO>> getAllPublicProjects() {
        try {
            List<com.eventra.dto.ProjectDTO> projects = projectService.getAllPublicProjects();
            log.info("Retrieved {} public projects for frontend", projects.size());
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            log.error("Error retrieving public projects: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get projects with pagination, filtering, and sorting for frontend
     */
    @GetMapping("/public/paginated")
    public ResponseEntity<org.springframework.data.domain.Page<com.eventra.dto.ProjectDTO>> getProjectsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "lastUpdated") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        
        try {
            org.springframework.data.domain.Page<com.eventra.dto.ProjectDTO> projects = projectService.getProjectsWithPagination(
                page, size, sortBy, sortDirection, category, search);
            
            log.info("Retrieved {} projects from page {} with category: {} and search: {}", 
                    projects.getContent().size(), page, category, search);
            
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            log.error("Error retrieving paginated projects: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get project by ID with enhanced DTO response
     */
    @GetMapping("/public/{id}")
    public ResponseEntity<com.eventra.dto.ProjectDTO> getPublicProjectById(@PathVariable Long id) {
        try {
            return projectService.getProjectById(id)
                    .map(project -> {
                        log.info("Retrieved public project: {}", project.getTitle());
                        return ResponseEntity.ok(project);
                    })
                    .orElseGet(() -> {
                        log.warn("Public project not found with id: {}", id);
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            log.error("Error retrieving public project with id {}: ", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get all available categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        try {
            List<String> categories = projectService.getCategories();
            log.info("Retrieved {} categories", categories.size());
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Error retrieving categories: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get top projects by stars
     */
    @GetMapping("/public/top")
    public ResponseEntity<List<com.eventra.dto.ProjectDTO>> getTopProjects(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<com.eventra.dto.ProjectDTO> projects = projectService.getTopProjectsByStars(limit);
            log.info("Retrieved {} top projects", projects.size());
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            log.error("Error retrieving top projects: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get recent projects
     */
    @GetMapping("/public/recent")
    public ResponseEntity<List<com.eventra.dto.ProjectDTO>> getRecentProjects(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<com.eventra.dto.ProjectDTO> projects = projectService.getRecentProjects(limit);
            log.info("Retrieved {} recent projects", projects.size());
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            log.error("Error retrieving recent projects: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    

}
