# Project Management System - Database Integration

## Overview

The Eventra platform now includes a comprehensive project management system that stores and manages project data in the backend database instead of using mock data.

## Features Implemented

### Backend Implementation

1. **Enhanced Project Entity** (`Project.java`)
   - Complete project information including contributors, tech stack, GitHub stats
   - Project status management (PENDING, APPROVED, ACTIVE, MAINTENANCE, etc.)
   - Automatic timestamps for creation and updates
   - Full JPA relationships and validations

2. **Advanced Repository Layer** (`ProjectRepository.java`)
   - Pagination and sorting support
   - Advanced search and filtering capabilities
   - Category-based queries
   - Status-based filtering for public vs admin views

3. **Comprehensive Service Layer** (`ProjectService.java`)
   - DTO conversion for clean API responses
   - Public project filtering (only shows ACTIVE, COMPLETED, MAINTENANCE, APPROVED)
   - Advanced search with pagination
   - Project statistics and categorization

4. **RESTful API Endpoints** (`ProjectController.java`)
   - `GET /api/projects/public` - Get all public projects
   - `GET /api/projects/public/paginated` - Paginated projects with filtering
   - `GET /api/projects/public/{id}` - Get specific project details
   - `GET /api/projects/categories` - Get all available categories
   - `GET /api/projects/public/top` - Get top projects by stars
   - `GET /api/projects/public/recent` - Get recently updated projects

### Frontend Integration

1. **API Integration** (`ProjectsPage.js`)
   - Replaced mock data with real API calls
   - Error handling and loading states
   - Real-time search and filtering
   - Dynamic category loading

2. **Enhanced User Experience**
   - Loading skeletons during data fetch
   - Error states with retry functionality
   - Real-time filtering without page reload
   - Responsive design for all screen sizes

## API Usage Examples

### Get All Public Projects
```bash
GET /api/projects/public
```

### Get Projects with Pagination and Filtering
```bash
GET /api/projects/public/paginated?page=0&size=12&sortBy=stars&sortDirection=desc&category=AI/ML&search=machine
```

### Get Project Categories
```bash
GET /api/projects/categories
```

## Database Schema

### Projects Table
- `id` (Primary Key)
- `title` (VARCHAR, Required)
- `description` (TEXT)
- `author` (VARCHAR, Required)
- `category` (VARCHAR, Required)
- `github_url` (VARCHAR)
- `live_demo` (VARCHAR)
- `image` (VARCHAR)
- `difficulty` (VARCHAR)
- `stars`, `forks`, `open_issues`, `pull_requests` (INTEGER)
- `status` (ENUM: PENDING, APPROVED, ACTIVE, MAINTENANCE, ARCHIVED, COMPLETED)
- `created_at`, `last_updated` (TIMESTAMP)
- `submitted_by_user_id` (Foreign Key to Users)

### Related Tables
- `project_contributors` - Many-to-many relationship for contributors
- `project_tech_stack` - Collection table for technology stack

## Data Seeding

The system includes automatic data seeding (`DataSeeder.java`) that populates the database with sample projects on first startup:
- 5 diverse sample projects across different categories
- Realistic data including GitHub statistics
- Different difficulty levels and project statuses

## Testing the Integration

1. **Start the Backend**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm start
   ```

3. **Navigate to Projects Section**:
   - Visit `http://localhost:3000` 
   - Go to the Projects section
   - Projects should now load from the database

4. **Test API Endpoints**:
   - Visit `http://localhost:8080/swagger-ui.html`
   - Test the new project endpoints

## Project Status Workflow

1. **PENDING** - Newly submitted projects awaiting admin approval
2. **APPROVED** - Admin-approved projects (visible to public)
3. **ACTIVE** - Currently maintained and active projects
4. **MAINTENANCE** - Projects in maintenance mode
5. **COMPLETED** - Finished projects
6. **ARCHIVED** - Archived projects
7. **REJECTED** - Rejected submissions (not visible to public)

## Security Features

- Public endpoints don't require authentication
- Project submission requires authentication
- Admin-only endpoints for project management
- Input validation and sanitization
- CORS configuration for frontend integration

## Performance Optimizations

- Pagination for large datasets
- Efficient JPA queries with proper indexing
- DTO pattern to avoid over-fetching
- Eager/lazy loading optimization
- Database connection pooling

## Future Enhancements

1. **GitHub Integration** - Auto-sync project stats from GitHub
2. **User Voting** - Allow users to star/favorite projects
3. **Advanced Search** - Full-text search capabilities
4. **Project Analytics** - View counts and interaction tracking
5. **Collaboration Features** - Project team management
6. **Image Upload** - Direct image upload instead of URLs
7. **Project Templates** - Predefined project templates
