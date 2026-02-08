# 📚 API Documentation

Complete reference for all Bug Tracker API endpoints.

---

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except auth) require JWT token in header:
```
Authorization: Bearer {token}
```

---

## 🔐 Authentication Endpoints

### POST /auth/signup
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "Signup successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "developer",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "token": "jwt_token_here"
}
```

**Errors:**
- 400: Invalid email or weak password
- 400: User already exists

---

### POST /auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "developer"
  },
  "token": "jwt_token_here"
}
```

**Errors:**
- 401: Invalid credentials
- 400: Missing email or password

---

### POST /auth/logout
Logout current user.

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### GET /auth/me
Get current authenticated user.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "role": "developer",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- 401: No token provided
- 401: Invalid or expired token

---

## 📁 Project Endpoints

### GET /projects
List all projects for current user.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Bug Tracker",
    "description": "Internal bug tracking system",
    "key": "BT",
    "owner_id": "uuid",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "project_members": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "role": "admin",
        "joined_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
]
```

---

### GET /projects/:id
Get single project details.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Bug Tracker",
  "description": "Internal bug tracking system",
  "key": "BT",
  "owner_id": "uuid",
  "owner": {
    "id": "uuid",
    "email": "admin@example.com",
    "full_name": "Admin User"
  },
  "status": "active",
  "project_members": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "role": "admin",
      "users": {
        "id": "uuid",
        "email": "member@example.com",
        "full_name": "Member Name",
        "avatar_url": "https://..."
      }
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- 404: Project not found
- 403: Access denied

---

### POST /projects
Create a new project.

**Request Body:**
```json
{
  "name": "Bug Tracker",
  "description": "Internal bug tracking system",
  "key": "BT"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Bug Tracker",
  "description": "Internal bug tracking system",
  "key": "BT",
  "owner_id": "uuid",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- 400: Missing required fields
- 400: Project key already exists

---

### PUT /projects/:id
Update project details.

**Request Body:**
```json
{
  "name": "Bug Tracker v2",
  "description": "Updated description",
  "status": "active"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Bug Tracker v2",
  "description": "Updated description",
  "status": "active",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- 403: Only owner can update
- 404: Project not found

---

### DELETE /projects/:id
Delete a project.

**Response (200):**
```json
{
  "message": "Project deleted"
}
```

**Errors:**
- 403: Only owner can delete
- 404: Project not found

---

### POST /projects/:id/members
Add member to project.

**Request Body:**
```json
{
  "userId": "uuid",
  "role": "developer"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "user_id": "uuid",
  "role": "developer",
  "joined_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- 403: Only admins can add members
- 400: User already a member

---

## 🐛 Issue Endpoints

### GET /issues/project/:projectId
Get all issues in a project with filters.

**Query Parameters:**
```
?status=in_progress
?priority=high
?assigneeId=uuid
?search=bug title
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "project_id": "uuid",
    "title": "Login button not working",
    "description": "The login button is unresponsive...",
    "issue_type": "bug",
    "status": "in_progress",
    "priority": "high",
    "reporter_id": "uuid",
    "reporter": {
      "id": "uuid",
      "email": "reporter@example.com",
      "full_name": "Reporter Name",
      "avatar_url": "https://..."
    },
    "assignee_id": "uuid",
    "assignee": {
      "id": "uuid",
      "email": "dev@example.com",
      "full_name": "Developer Name",
      "avatar_url": "https://..."
    },
    "due_date": "2024-01-15",
    "estimated_hours": 4,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET /issues/:id
Get single issue with comments and attachments.

**Response (200):**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "title": "Login button not working",
  "description": "The login button is unresponsive...",
  "issue_type": "bug",
  "status": "in_progress",
  "priority": "high",
  "reporter": { /* user object */ },
  "assignee": { /* user object */ },
  "comments": [
    {
      "id": "uuid",
      "content": "I'm working on this",
      "author": { /* user object */ },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "attachments": [
    {
      "id": "uuid",
      "file_name": "screenshot.png",
      "file_url": "/uploads/screenshot.png",
      "uploaded_by": { /* user object */ },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### POST /issues
Create a new issue.

**Request Body:**
```json
{
  "projectId": "uuid",
  "title": "Login button not working",
  "description": "The login button is unresponsive when clicked",
  "issueType": "bug",
  "priority": "high",
  "assigneeId": "uuid",
  "dueDate": "2024-01-15"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "title": "Login button not working",
  "description": "The login button is unresponsive when clicked",
  "issue_type": "bug",
  "status": "todo",
  "priority": "high",
  "reporter_id": "uuid",
  "assignee_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- 400: Missing required fields
- 400: Invalid issue type or priority

---

### PUT /issues/:id
Update issue details.

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "medium",
  "assigneeId": "uuid",
  "dueDate": "2024-01-20",
  "estimatedHours": 6
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "medium",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### PUT /issues/:id/status
Update only the status (for Kanban board).

**Request Body:**
```json
{
  "status": "done"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "done",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Allowed Statuses:**
- `todo`
- `in_progress`
- `in_review`
- `done`

---

### DELETE /issues/:id
Delete an issue.

**Response (200):**
```json
{
  "message": "Issue deleted"
}
```

---

## 💬 Comment Endpoints

### GET /comments/:issueId
Get all comments for an issue.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "issue_id": "uuid",
    "content": "I'm working on this issue",
    "author": {
      "id": "uuid",
      "email": "dev@example.com",
      "full_name": "Developer Name",
      "avatar_url": "https://..."
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "replies": []
  }
]
```

---

### POST /comments
Add a comment to an issue.

**Request Body:**
```json
{
  "issueId": "uuid",
  "content": "I'm working on this issue",
  "parentCommentId": "uuid" // optional, for replies
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "issue_id": "uuid",
  "author_id": "uuid",
  "content": "I'm working on this issue",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### PUT /comments/:id
Edit a comment.

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "content": "Updated comment text",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### DELETE /comments/:id
Delete a comment.

**Response (200):**
```json
{
  "message": "Comment deleted"
}
```

---

## 📎 Attachment Endpoints

### GET /attachments/:issueId
Get all attachments for an issue.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "issue_id": "uuid",
    "file_name": "screenshot.png",
    "file_size": 245000,
    "file_type": "image/png",
    "file_url": "/uploads/screenshot.png",
    "uploaded_by": { /* user object */ },
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### POST /attachments
Upload a file attachment.

**Request (multipart/form-data):**
```
issueId: uuid
file: [file object]
```

**Response (201):**
```json
{
  "id": "uuid",
  "issue_id": "uuid",
  "file_name": "screenshot.png",
  "file_size": 245000,
  "file_type": "image/png",
  "file_url": "/uploads/screenshot.png",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- 400: No file uploaded
- 400: File type not allowed
- 400: File size exceeds limit

---

### DELETE /attachments/:id
Delete an attachment.

**Response (200):**
```json
{
  "message": "Attachment deleted"
}
```

---

## 📊 Activity Endpoints

### GET /activity/:issueId
Get activity log for an issue.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "issue_id": "uuid",
    "user_id": "uuid",
    "user": { /* user object */ },
    "action": "status_changed",
    "field_changed": "status",
    "previous_value": "todo",
    "new_value": "in_progress",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET /activity/project/:projectId
Get recent activity for a project.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "issue_id": "uuid",
    "issue": {
      "id": "uuid",
      "title": "Issue title"
    },
    "user": { /* user object */ },
    "action": "created",
    "new_value": "Issue title",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

## 👤 User Endpoints

### GET /users
Search and list users.

**Query Parameters:**
```
?search=john
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "email": "john@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://..."
  }
]
```

---

### GET /users/:id
Get user profile.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "john@example.com",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "role": "developer",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### PUT /users/profile
Update current user profile.

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "john@example.com",
  "full_name": "John Doe Updated",
  "avatar_url": "https://example.com/avatar.jpg",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (permission denied)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Data Types & Validations

### Issue Status
- `todo` - Not started
- `in_progress` - Currently being worked on
- `in_review` - Under review
- `done` - Completed

### Issue Type
- `bug` - Bug report
- `feature` - Feature request
- `task` - Task
- `improvement` - Improvement

### Priority
- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority
- `critical` - Critical priority

### User Role
- `admin` - Full access
- `manager` - Can manage projects
- `developer` - Can work on issues
- `viewer` - Read-only access

---

## 🔄 Request/Response Examples

### Create Issue and Get URL
```javascript
// Create issue
POST /api/issues
{
  "projectId": "proj-123",
  "title": "Login broken",
  "description": "Users can't login",
  "issueType": "bug",
  "priority": "critical"
}

// Response
{
  "id": "issue-456",
  ...
}

// Direct link: /projects/proj-123/issues/issue-456
```

### Complete Workflow
```javascript
// 1. Sign up
POST /api/auth/signup

// 2. Get projects
GET /api/projects

// 3. Get issues
GET /api/issues/project/proj-123

// 4. Update status
PUT /api/issues/issue-456/status
{
  "status": "done"
}

// 5. Add comment
POST /api/comments
{
  "issueId": "issue-456",
  "content": "Fixed in v1.2"
}
```

---

**API Version**: 1.0.0
**Last Updated**: February 6, 2026
