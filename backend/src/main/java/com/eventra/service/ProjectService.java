package com.eventra.service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.eventra.dto.CreateProjectDTO;
import com.eventra.dto.ProjectDTO;
import com.eventra.dto.ProjectSubmission;
import com.eventra.entity.Project;
import com.eventra.entity.ProjectStatus;
import com.eventra.entity.User;
import com.eventra.repository.ProjectRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {
	
	private final ProjectRepository projectRepository;
	
	// Convert Project entity to DTO
    private ProjectDTO convertToDTO(Project project) {
        return ProjectDTO.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .author(project.getAuthor())
                .contributors(project.getContributors())
                .stars(project.getStars())
                .forks(project.getForks())
                .category(project.getCategory())
                .techStack(project.getTechStack())
                .githubUrl(project.getGithubUrl())
                .liveDemo(project.getLiveDemo())
                .image(project.getImage())
                .createdAt(project.getCreatedAt())
                .lastUpdated(project.getLastUpdated())
                .status(project.getStatus())
                .difficulty(project.getDifficulty())
                .openIssues(project.getOpenIssues())
                .pullRequests(project.getPullRequests())
                .build();
    }
	
	// Existing methods
	public List<Project> getApprovedProjects(){
		return projectRepository.findByStatus(ProjectStatus.APPROVED);
	}
	
	public List<Project> getApprovedProjectsByCategory(String category){
		return projectRepository.findByCategoryAndStatus(category, ProjectStatus.APPROVED);
	}
	
	// New method: Get all public projects for frontend
    public List<ProjectDTO> getAllPublicProjects() {
        List<ProjectStatus> publicStatuses = Arrays.asList(
            ProjectStatus.ACTIVE, 
            ProjectStatus.COMPLETED, 
            ProjectStatus.MAINTENANCE,
            ProjectStatus.APPROVED // Include approved projects
        );
        List<Project> projects = projectRepository.findByStatusIn(publicStatuses);
        return projects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get projects with pagination, filtering, and sorting
    public Page<ProjectDTO> getProjectsWithPagination(int page, int size, String sortBy, String sortDirection, 
                                                     String category, String search) {
        // Determine sort direction
        Sort sort = sortDirection.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        List<ProjectStatus> publicStatuses = Arrays.asList(
            ProjectStatus.ACTIVE, 
            ProjectStatus.COMPLETED, 
            ProjectStatus.MAINTENANCE,
            ProjectStatus.APPROVED
        );
        
        Page<Project> projectPage;
        
        if (search != null && !search.trim().isEmpty()) {
            if (category != null && !category.equals("all")) {
                projectPage = projectRepository.searchProjectsByCategoryAndQuery(category, search, publicStatuses, pageable);
            } else {
                projectPage = projectRepository.searchProjectsByQuery(search, publicStatuses, pageable);
            }
        } else {
            if (category != null && !category.equals("all")) {
                projectPage = projectRepository.findByCategoryAndStatusIn(category, publicStatuses, pageable);
            } else {
                projectPage = projectRepository.findByStatusIn(publicStatuses, pageable);
            }
        }
        
        return projectPage.map(this::convertToDTO);
    }

    // Get project by ID
    public Optional<ProjectDTO> getProjectById(Long id) {
        return projectRepository.findById(id)
                .map(this::convertToDTO);
    }

    // Get distinct categories
    public List<String> getCategories() {
        List<ProjectStatus> publicStatuses = Arrays.asList(
            ProjectStatus.ACTIVE, 
            ProjectStatus.COMPLETED, 
            ProjectStatus.MAINTENANCE,
            ProjectStatus.APPROVED
        );
        return projectRepository.findDistinctCategoriesByStatus(publicStatuses);
    }

    // Get top projects by stars
    public List<ProjectDTO> getTopProjectsByStars(int limit) {
        List<ProjectStatus> publicStatuses = Arrays.asList(
            ProjectStatus.ACTIVE, 
            ProjectStatus.COMPLETED, 
            ProjectStatus.MAINTENANCE,
            ProjectStatus.APPROVED
        );
        Pageable pageable = PageRequest.of(0, limit);
        List<Project> projects = projectRepository.findTopProjectsByStars(publicStatuses, pageable);
        return projects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get recent projects
    public List<ProjectDTO> getRecentProjects(int limit) {
        List<ProjectStatus> publicStatuses = Arrays.asList(
            ProjectStatus.ACTIVE, 
            ProjectStatus.COMPLETED, 
            ProjectStatus.MAINTENANCE,
            ProjectStatus.APPROVED
        );
        Pageable pageable = PageRequest.of(0, limit);
        List<Project> projects = projectRepository.findRecentProjects(publicStatuses, pageable);
        return projects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
	
	@Transactional
	public Project submitProject(ProjectSubmission submission, User submittingUser) {
		// Create a new Project entity and map data from the DTO
		Project newProject = Project.builder()
			.title(submission.getTitle())
			.description(submission.getDescription())
			.author(submission.getAuthor())
			.category(submission.getCategory())
			.techStack(submission.getTechStack())
			.githubUrl(submission.getGithubUrl())
			.liveDemo(submission.getLiveDemo())
			.image(submission.getImage())
			.difficulty(submission.getDifficulty())
			.openIssues(submission.getOpenIssues())
			.pullRequests(submission.getPullRequests())
			.stars(submission.getStars())
			.forks(submission.getForks())
			.submittedBy(submittingUser)
			.status(ProjectStatus.PENDING) // Set the default status
			.build();

		Project savedProject = projectRepository.save(newProject);
		log.info("Project '{}' submitted by user {} with status PENDING", newProject.getTitle(), submittingUser.getEmail());
		return savedProject;
	}
	
	@Transactional
	public Optional<Project> updateProjectStatus(Long projectId, ProjectStatus newStatus){
		return projectRepository.findById(projectId).map(project->{
			project.setStatus(newStatus);
			Project updatedProject = projectRepository.save(project);
			log.info("Project '{}' status updated to {}", project.getTitle(), newStatus);
			return updatedProject;
		});
	}
}