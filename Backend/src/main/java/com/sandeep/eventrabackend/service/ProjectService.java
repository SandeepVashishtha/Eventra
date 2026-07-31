package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.ProjectCreateRequest;
import com.sandeep.eventrabackend.dto.response.ProjectResponse;
import com.sandeep.eventrabackend.exception.ProjectNotFoundException;
import com.sandeep.eventrabackend.model.Project;
import com.sandeep.eventrabackend.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request) {
        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .thumbnailUrl(request.getThumbnailUrl())
                .githubUrl(request.getGithubUrl())
                .build();

        Project savedProject = projectRepository.save(project);
        return toProjectResponse(savedProject);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::toProjectResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        return projectRepository.findById(id)
                .map(this::toProjectResponse)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + id));
    }

    @Transactional
    public ProjectResponse upvoteProject(Long id) {
        if (projectRepository.incrementUpvotes(id) == 0) {
            throw new ProjectNotFoundException("Project not found with id: " + id);
        }
        return getProjectById(id);
    }

    private ProjectResponse toProjectResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .category(project.getCategory())
                .thumbnailUrl(project.getThumbnailUrl())
                .githubUrl(project.getGithubUrl())
                .upvotes(project.getUpvotes())
                .build();
    }
}
