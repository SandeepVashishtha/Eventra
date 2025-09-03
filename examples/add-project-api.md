# Adding Projects via REST API

## Method 1: Submit Project as Authenticated User

### Endpoint
```
POST /api/projects/submit
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

### Request Body Example
```json
{
  "title": "React Task Manager",
  "description": "A modern task management application built with React, featuring real-time updates, drag-and-drop functionality, and collaborative workspaces.",
  "author": "John Doe",
  "category": "Web Development",
  "techStack": ["React", "Node.js", "MongoDB", "Socket.io"],
  "githubUrl": "https://github.com/johndoe/react-task-manager",
  "liveDemo": "https://react-task-manager.vercel.app",
  "image": "https://example.com/project-image.jpg",
  "difficulty": "Intermediate",
  "openIssues": 5,
  "pullRequests": 2,
  "stars": 150,
  "forks": 25
}
```

### Response
```json
{
  "message": "Project submitted successfully and pending approval",
  "data": {
    "id": 6,
    "title": "React Task Manager",
    "status": "PENDING"
  }
}
```

## Method 2: Using cURL Command

```bash
curl -X POST http://localhost:8080/api/projects/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Vue.js E-commerce Platform",
    "description": "A full-featured e-commerce platform built with Vue.js and Laravel backend",
    "author": "Jane Smith",
    "category": "E-commerce",
    "techStack": ["Vue.js", "Laravel", "MySQL", "Stripe"],
    "githubUrl": "https://github.com/janesmith/vue-ecommerce",
    "liveDemo": "https://vue-ecommerce-demo.com",
    "difficulty": "Advanced",
    "stars": 200,
    "forks": 40
  }'
```

## Method 3: Using PowerShell

```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
}

$body = @{
    title = "Python Data Analysis Tool"
    description = "A comprehensive data analysis tool built with Python and Pandas"
    author = "Data Scientist"
    category = "Data Science"
    techStack = @("Python", "Pandas", "Matplotlib", "Jupyter")
    githubUrl = "https://github.com/user/python-data-tool"
    difficulty = "Intermediate"
    stars = 85
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/projects/submit" -Method POST -Headers $headers -Body $body
```

## Required Fields
- `title` (required, max 255 chars)
- `author` (required)
- `category` (required)

## Optional Fields
- `description`
- `techStack` (array of strings)
- `githubUrl` (max 512 chars)
- `liveDemo` (max 512 chars)
- `image` (max 512 chars)
- `difficulty` (max 50 chars)
- `openIssues`, `pullRequests`, `stars`, `forks` (integers)

## Notes
- Projects submitted by users have status "PENDING" and need admin approval
- Only authenticated users can submit projects
- Users can view their own submitted projects at `/api/projects/mine`
