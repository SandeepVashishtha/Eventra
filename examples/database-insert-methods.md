# Direct Database Insert Methods

## Method 1: Using H2 Console (Development)

When running locally, access the H2 console at: http://localhost:8080/h2-console

**Connection Details:**
- JDBC URL: `jdbc:h2:mem:testdb`
- User: `sa`
- Password: (leave empty)

**Insert SQL:**
```sql
INSERT INTO projects (
    title, description, author, category, tech_stack, 
    github_url, live_demo, image, difficulty, 
    open_issues, pull_requests, stars, forks, 
    status, created_at, last_updated
) VALUES (
    'AI Chat Application',
    'A real-time chat application powered by AI with natural language processing capabilities',
    'AI Developer',
    'Machine Learning',
    'Python,Flask,OpenAI,WebSocket',
    'https://github.com/aidev/chat-app',
    'https://ai-chat-demo.herokuapp.com',
    'https://example.com/ai-chat.jpg',
    'Advanced',
    3, 1, 75, 12,
    'APPROVED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
```

## Method 2: Using Java Service (Programmatically)

You can create a simple REST endpoint for admin use:

```java
@PostMapping("/admin/projects/direct")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Project> createProjectDirect(@RequestBody Project project) {
    project.setStatus(ProjectStatus.APPROVED); // Direct approval
    project.setCreatedAt(LocalDateTime.now());
    project.setLastUpdated(LocalDateTime.now());
    
    Project savedProject = projectRepository.save(project);
    return ResponseEntity.ok(savedProject);
}
```

## Method 3: Using Spring Boot DataSeeder

Add to the existing DataSeeder.java:

```java
private void seedAdditionalProjects() {
    if (projectRepository.count() < 10) { // Add more if less than 10
        List<Project> additionalProjects = Arrays.asList(
            Project.builder()
                .title("Mobile Banking App")
                .description("Secure mobile banking application with biometric authentication")
                .author("FinTech Solutions")
                .category("Mobile Development")
                .techStack(Arrays.asList("React Native", "Node.js", "MongoDB", "JWT"))
                .githubUrl("https://github.com/fintech/banking-app")
                .difficulty("Advanced")
                .status(ProjectStatus.APPROVED)
                .stars(250)
                .forks(45)
                .build(),
            
            Project.builder()
                .title("Weather Dashboard")
                .description("Beautiful weather dashboard with location-based forecasts")
                .author("Weather Dev")
                .category("Web Development")
                .techStack(Arrays.asList("Vue.js", "Express", "Weather API"))
                .githubUrl("https://github.com/weatherdev/dashboard")
                .liveDemo("https://weather-dash.netlify.app")
                .difficulty("Intermediate")
                .status(ProjectStatus.APPROVED)
                .stars(120)
                .forks(30)
                .build()
        );
        
        projectRepository.saveAll(additionalProjects);
        logger.info("Additional projects seeded successfully");
    }
}
```

## Method 4: Using cURL for Admin Endpoint

```bash
# First login as admin to get token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@eventra.com", "password": "admin123"}'

# Use the returned token to create project directly
curl -X POST http://localhost:8080/api/admin/projects/direct \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Blockchain Voting System",
    "description": "Decentralized voting system using blockchain technology",
    "author": "Blockchain Dev",
    "category": "Blockchain",
    "techStack": ["Solidity", "Web3.js", "React", "Ethereum"],
    "githubUrl": "https://github.com/blockchaindev/voting-system",
    "difficulty": "Advanced",
    "status": "APPROVED",
    "stars": 300,
    "forks": 55
  }'
```

## Tips for Adding Projects

1. **For Testing**: Use the H2 console or DataSeeder
2. **For User Submissions**: Use the frontend form or `/api/projects/submit` endpoint
3. **For Admin Override**: Create an admin endpoint with direct approval
4. **For Bulk Import**: Create a CSV import feature or use DataSeeder

## Project Status Workflow

- `PENDING`: Newly submitted projects awaiting review
- `APPROVED`: Projects approved and visible to public
- `ACTIVE`: Currently active/maintained projects
- `MAINTENANCE`: Projects in maintenance mode
- `ARCHIVED`: Older projects no longer maintained
- `COMPLETED`: Finished projects
- `REJECTED`: Projects that didn't meet criteria
