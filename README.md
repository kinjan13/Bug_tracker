# 🐛 Bug Tracker - Issue Tracking Application

## 📋 Overview

A full-stack Jira-like bug tracking application built with:
- **Frontend**: React.js, Tailwind CSS, React Beautiful DnD
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ and npm
- Supabase account
- Git

### Setup
1. **Create Supabase project** and run migrations from `SUPABASE_SCHEMA.md`
2. **Configure environment variables:**
   - Server: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `PORT=5000`
   - Client: `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, `REACT_APP_API_BASE_URL=http://localhost:5000/api`
3. **Install & run:**
   ```bash
   cd server && npm install && npm run dev
   cd client && npm install && npm start
   ```

---

## 📊 Database

**Tables**: users, projects, project_members, issues, comments, attachments, activity_logs
- Row-Level Security (RLS) enabled
- Foreign key relationships
- Automatic timestamps

---

## 🗂️ Project Structure

```
server/
├── middleware/    (auth, error handling, validation)
├── routes/        (auth, projects, issues, comments, attachments, activity, users)
└── utils/         (supabase, JWT, file upload)

client/
├── src/
│   ├── services/  (API calls)
│   ├── store/     (auth, project, issue state)
│   └── components/
└── public/
```

---

## 🔌 Key API Endpoints

**Auth**: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`

**Projects**: `GET|POST /api/projects`, `PUT|DELETE /api/projects/:id`

**Issues**: `GET|POST /api/issues`, `PUT /api/issues/:id/status`, `DELETE /api/issues/:id`

**Comments**: `GET|POST /api/comments`, `PUT|DELETE /api/comments/:id`

**Attachments**: `POST /api/attachments`, `DELETE /api/attachments/:id`

---

## ✅ Features

- User authentication with JWT
- Project & team member management
- Issue creation & assignment
- Kanban board with drag & drop
- Comments & activity timeline
- File attachments
- Role-based permissions
- Row-level security

---

## 📦 Tech Stack

**Frontend**: React, Tailwind CSS, Zustand, Axios, React Beautiful DnD  
**Backend**: Express, Supabase, JWT, Multer  
**Database**: PostgreSQL (Supabase)
