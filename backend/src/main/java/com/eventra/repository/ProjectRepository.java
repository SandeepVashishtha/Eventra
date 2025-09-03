package com.eventra.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eventra.entity.Project;
import com.eventra.entity.ProjectStatus;
import com.eventra.entity.User;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

	// Existing methods
	List<Project> findByStatus(ProjectStatus status);
	List<Project> findByCategoryAndStatus(String category, ProjectStatus status);
	List<Project> findBySubmittedBy(User submittedBy);
	
	// New methods for frontend functionality
	Page<Project> findByStatus(ProjectStatus status, Pageable pageable);
	
	List<Project> findByCategory(String category);
	Page<Project> findByCategory(String category, Pageable pageable);
	
	List<Project> findByStatusIn(List<ProjectStatus> statuses);
	Page<Project> findByStatusIn(List<ProjectStatus> statuses, Pageable pageable);
	
	List<Project> findByCategoryAndStatusIn(String category, List<ProjectStatus> statuses);
	Page<Project> findByCategoryAndStatusIn(String category, List<ProjectStatus> statuses, Pageable pageable);
	
	@Query("SELECT p FROM Project p WHERE " +
	       "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
	       "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
	       "LOWER(p.author) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
	       "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
	       "p.status IN :statuses")
	Page<Project> searchProjectsByQuery(@Param("query") String query, 
	                                   @Param("statuses") List<ProjectStatus> statuses, 
	                                   Pageable pageable);
	
	@Query("SELECT p FROM Project p WHERE " +
	       "p.category = :category AND " +
	       "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
	       "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
	       "LOWER(p.author) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
	       "p.status IN :statuses")
	Page<Project> searchProjectsByCategoryAndQuery(@Param("category") String category,
	                                              @Param("query") String query,
	                                              @Param("statuses") List<ProjectStatus> statuses,
	                                              Pageable pageable);
	
	@Query("SELECT DISTINCT p.category FROM Project p WHERE p.status IN :statuses")
	List<String> findDistinctCategoriesByStatus(@Param("statuses") List<ProjectStatus> statuses);
	
	@Query("SELECT p FROM Project p WHERE p.status IN :statuses ORDER BY p.stars DESC")
	List<Project> findTopProjectsByStars(@Param("statuses") List<ProjectStatus> statuses, Pageable pageable);
	
	@Query("SELECT p FROM Project p WHERE p.status IN :statuses ORDER BY p.lastUpdated DESC")
	List<Project> findRecentProjects(@Param("statuses") List<ProjectStatus> statuses, Pageable pageable);
}
