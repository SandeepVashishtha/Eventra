package com.eventra.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.eventra.entity.ProjectStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    private Long id;
    private String title;
    private String description;
    private String author;
    private List<String> contributors;
    private Integer stars;
    private Integer forks;
    private String category;
    private List<String> techStack;
    private String githubUrl;
    private String liveDemo;
    private String image;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
    private ProjectStatus status;
    private String difficulty;
    private Integer openIssues;
    private Integer pullRequests;
}
