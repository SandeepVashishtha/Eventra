package com.eventra.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectDTO {
    
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    @NotBlank(message = "Author is required")
    @Size(max = 100, message = "Author name must not exceed 100 characters")
    private String author;
    
    private List<String> contributors;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotEmpty(message = "At least one technology must be specified")
    private List<String> techStack;
    
    @Size(max = 512, message = "GitHub URL must not exceed 512 characters")
    private String githubUrl;
    
    @Size(max = 512, message = "Live demo URL must not exceed 512 characters")
    private String liveDemo;
    
    @Size(max = 512, message = "Image URL must not exceed 512 characters")
    private String image;
    
    @NotBlank(message = "Difficulty is required")
    private String difficulty;
    
    @Builder.Default
    private Integer stars = 0;
    
    @Builder.Default
    private Integer forks = 0;
    
    @Builder.Default
    private Integer openIssues = 0;
    
    @Builder.Default
    private Integer pullRequests = 0;
}
