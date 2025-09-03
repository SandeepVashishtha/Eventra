package com.eventra.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	@NotBlank(message="Title is required")
	@Size(max=255)
	private String title;
	
	@Column(columnDefinition = "TEXT")
	private String description;
	
	@NotBlank(message="Author is required")
	private String author;
	
	// Contributors list
	@ElementCollection(fetch=FetchType.EAGER)
	@CollectionTable(name="project_contributors", joinColumns=@JoinColumn(name="project_id"))
	@Column(name="contributor")
	private List<String> contributors;
	
	//User who submitted the project
	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="submitted_by_user_id")
	private User submittedBy;
	
	@Builder.Default
	@Enumerated(EnumType.STRING)
	@Column(length=20,nullable=false)
	private ProjectStatus status=ProjectStatus.PENDING;
	
	@NotBlank
	private String category;
	
	@ElementCollection(fetch=FetchType.EAGER)
	@CollectionTable(name="project_tech_stack",joinColumns=@JoinColumn(name="project_id"))
	@Column(name="tech")
	private List<String> techStack;
	
	@Size(max=512)
	private String githubUrl;
	
	@Size(max=512)
	private String liveDemo;
	
	@Size(max=512)
	private String image;
	
	@CreationTimestamp
	private LocalDateTime createdAt;
	
	@UpdateTimestamp
	private LocalDateTime lastUpdated;
	
	@Size(max=50)
	private String difficulty;
	
	@Builder.Default
	private Integer openIssues = 0;
	
	@Builder.Default
	private Integer pullRequests = 0;
	
	@Builder.Default
	private Integer stars = 0;
	
	@Builder.Default
	private Integer forks = 0;
}
