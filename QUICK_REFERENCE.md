# 🚀 Bug Tracker - Quick Reference Guide

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Complete setup guide, tech stack overview, and quick start |
| **SUPABASE_SCHEMA.md** | Database schema with all SQL queries and RLS policies |
| **FRONTEND_GUIDE.md** | React components guide with implementation examples |
| **DEPLOYMENT_GUIDE.md** | Deployment checklist and production setup |
| **PROJECT_SUMMARY.md** | Complete file structure and implementation status |
| **QUICK_REFERENCE.md** | This file - quick commands and snippets |

---

## ⚡ Quick Commands

### Setup Server
```bash
cd server
npm install
cp .env.example .env
# Edit .env with Supabase credentials
npm run dev
```

### Setup Client
```bash
cd client
npm install
cp .env.example .env
# Edit .env with Supabase credentials
npm start
```

### Create Supabase Tables
1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste SQL from SUPABASE_SCHEMA.md
3. Execute each query in order

---

## 🔑 Environment Variables

### Server (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_random_secret_key
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
```

### Client (.env)
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

---

## 📋 Database Tables

```
users → project_members → projects
             ↓
           issues → comments
             ↓
        attachments
             ↓
        activity_logs
```

---

## 🔌 API Endpoints Summary

### Auth
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Projects
```
GET    /api/projects
GET    /api/projects/:id
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/members
```

### Issues
```
GET    /api/issues/project/:projectId
GET    /api/issues/:id
POST   /api/issues
PUT    /api/issues/:id
PUT    /api/issues/:id/status
DELETE /api/issues/:id
```

### Comments
```
GET    /api/comments/:issueId
POST   /api/comments
PUT    /api/comments/:id
DELETE /api/comments/:id
```

### Other
```
GET    /api/attachments/:issueId
POST   /api/attachments
GET    /api/activity/:issueId
GET    /api/users
PUT    /api/users/profile
```

---

## 🛠️ Tech Stack Summary

| Layer | Technologies |
|-------|--------------|
| **Database** | Supabase (PostgreSQL) |
| **Backend** | Node.js, Express.js |
| **Frontend** | React.js, Tailwind CSS |
| **State** | Zustand |
| **Routing** | React Router v6 |
| **HTTP** | Axios |
| **Auth** | JWT + Supabase |
| **DnD** | react-beautiful-dnd |
| **Forms** | HTML + React |
| **Icons** | react-icons |

---

## 📁 Project Structure

```
Bug_tracker/
├── server/              (Node.js + Express)
│   ├── middleware/      (JWT, validation, errors)
│   ├── routes/          (API endpoints - 6 files)
│   ├── utils/           (Supabase, JWT, uploads)
│   ├── index.js         (Main server)
│   └── package.json
│
├── client/              (React + Tailwind)
│   ├── src/
│   │   ├── services/    (API calls)
│   │   ├── store/       (Zustand stores)
│   │   ├── components/  (To be created)
│   │   └── supabase.js
│   └── package.json
│
└── Documentation Files
    ├── README.md
    ├── SUPABASE_SCHEMA.md
    ├── FRONTEND_GUIDE.md
    ├── DEPLOYMENT_GUIDE.md
    ├── PROJECT_SUMMARY.md
    └── QUICK_REFERENCE.md (this file)
```

---

## 🎯 Getting Started Path

```
1. Setup Supabase Account
   ↓
2. Create .env files in server/ and client/
   ↓
3. Install dependencies (npm install in both)
   ↓
4. Create database tables from SUPABASE_SCHEMA.md
   ↓
5. Start Backend: npm run dev (in server/)
   ↓
6. Start Frontend: npm start (in client/)
   ↓
7. Test Auth endpoints with Postman
   ↓
8. Build React components (see FRONTEND_GUIDE.md)
   ↓
9. Connect frontend to backend
   ↓
10. Deploy!
```

---

## 🏗️ Component Creation Checklist

### Essential Components
- [ ] LoginForm
- [ ] SignupForm
- [ ] ProjectList
- [ ] IssueBoard (Kanban)
- [ ] CommentList
- [ ] Header

### Important Components
- [ ] ProjectForm
- [ ] IssueForm
- [ ] IssueFilter
- [ ] IssueSearch
- [ ] Sidebar

### Helper Components
- [ ] LoadingSpinner
- [ ] ErrorAlert
- [ ] Modal
- [ ] ConfirmDialog

See detailed examples in **FRONTEND_GUIDE.md**

---

## 🔒 Security Checklist

- ✅ JWT authentication on protected routes
- ✅ Row-Level Security (RLS) in Supabase
- ✅ Password validation (8+ chars, uppercase, number)
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation
- ✅ Error handling (no sensitive data exposed)
- ✅ File upload validation
- ✅ Role-based access control

---

## 🚀 Deployment Quick Links

### Frontend (Choose One)
- **Vercel**: [vercel.com](https://vercel.com) - Recommended
- **Netlify**: [netlify.com](https://netlify.com)
- **GitHub Pages**: Free but limited features

### Backend (Choose One)
- **Render**: [render.com](https://render.com) - Free tier
- **Railway**: [railway.app](https://railway.app)
- **Heroku**: [heroku.com](https://www.heroku.com)
- **AWS**: [aws.amazon.com](https://aws.amazon.com)

### Database
- **Supabase**: Already using it!

---

## 🐛 Troubleshooting

### Common Errors

**"Cannot find module"**
```bash
npm install
npm install missing-package
```

**"Unauthorized" 401**
- Check token in localStorage
- Verify JWT_SECRET matches server
- Check token not expired

**CORS error**
- Verify CORS_ORIGINS in .env
- Check frontend URL

**Supabase connection failed**
- Verify SUPABASE_URL
- Check API key
- Verify network connectivity

**Database tables missing**
- Run SQL from SUPABASE_SCHEMA.md
- Check Supabase dashboard
- Verify project selected

---

## 📊 API Request Examples

### Login
```javascript
const response = await api.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password'
});
```

### Create Issue
```javascript
const response = await api.post('/api/issues', {
  projectId: 'project-id',
  title: 'Bug title',
  description: 'Description',
  issueType: 'bug',
  priority: 'high'
});
```

### Update Issue Status
```javascript
const response = await api.put(`/api/issues/${issueId}/status`, {
  status: 'in_progress'
});
```

### Add Comment
```javascript
const response = await api.post('/api/comments', {
  issueId: 'issue-id',
  content: 'Comment text'
});
```

---

## 🎮 Testing with Postman

1. Import API endpoints
2. Set Authorization header: `Bearer {token}`
3. Test each endpoint
4. Verify responses
5. Check error handling

---

## 📞 Getting Help

1. Read the relevant documentation file
2. Check FRONTEND_GUIDE.md for component examples
3. Review API structure in server routes
4. Check Supabase docs: https://supabase.com/docs
5. Check React docs: https://react.dev

---

## 🎓 Learning Resources

- **Supabase**: https://supabase.com/docs
- **React**: https://react.dev
- **Express**: https://expressjs.com
- **Tailwind**: https://tailwindcss.com
- **React Router**: https://reactrouter.com
- **Zustand**: https://github.com/pmndrs/zustand

---

## ✅ Pre-Launch Checklist

- [ ] All database tables created
- [ ] Environment variables set
- [ ] Backend tests pass
- [ ] Frontend components working
- [ ] Authentication working
- [ ] Kanban board working
- [ ] Comments working
- [ ] Search/filter working
- [ ] Responsive design tested
- [ ] Error handling tested
- [ ] Security review done
- [ ] Performance acceptable

---

## 🎉 Ready to Code!

All backend infrastructure is ready. Start building React components and connecting them to the API!

**Reference**: See **FRONTEND_GUIDE.md** for detailed component examples.

---

**Last Updated**: February 6, 2026
**Status**: Foundation Complete ✅
