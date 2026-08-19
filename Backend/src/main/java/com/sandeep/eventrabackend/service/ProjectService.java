package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.ProjectCreateRequest;
import com.sandeep.eventrabackend.dto.response.ProjectResponse;
import com.sandeep.eventrabackend.exception.ProjectNotFoundException;
import com.sandeep.eventrabackend.model.Project;
import com.sandeep.eventrabackend.repository.ProjectRepository;
import com.sandeep.eventrabackend.model.ProjectUpvote;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.ProjectUpvoteRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.sandeep.eventrabackend.exception.RegistrationConflictException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectUpvoteRepository projectUpvoteRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectUpvoteRepository projectUpvoteRepository,
                          UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.projectUpvoteRepository = projectUpvoteRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .thumbnailUrl(request.getThumbnailUrl())
                .githubUrl(request.getGithubUrl())
                .ownerId(user.getId())
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
    public ProjectResponse upvoteProject(Long id, String userEmail) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        if (project.getOwnerId() != null && project.getOwnerId().equals(user.getId())) {
            throw new RegistrationConflictException("You cannot upvote your own project.");
        }

        if (projectUpvoteRepository.existsByProject_IdAndUser_Id(id, user.getId())) {
            throw new RegistrationConflictException("You have already upvoted this project.");
        }

        ProjectUpvote upvote = ProjectUpvote.builder()
                .project(project)
                .user(user)
                .build();

        // Two concurrent requests from the same user can both pass the
        // existsBy guard before either insert commits; the second insert
        // then violates the (project_id, user_id) unique constraint.
        // Surface that as a friendly conflict instead of a 500 (#11776).
        try {
            projectUpvoteRepository.saveAndFlush(upvote);
        } catch (DataIntegrityViolationException ex) {
            throw new RegistrationConflictException("You have already upvoted this project.");
        }

        // The bulk UPDATE below is marked clearAutomatically so the subsequent
        // read reflects the post-increment count rather than the stale entity
        // loaded before the increment (#11776).
        projectRepository.incrementUpvotes(id);
        return getProjectById(id);
    }

    @Transactional
    public ProjectResponse forkProject(Long id, String userEmail) {
        Project source = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        Project fork = Project.builder()
                .title(source.getTitle())
                .description(source.getDescription())
                .category(source.getCategory())
                .thumbnailUrl(source.getThumbnailUrl())
                .githubUrl(source.getGithubUrl())
                .ownerId(user.getId())
                .build();

        return toProjectResponse(projectRepository.save(fork));
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
