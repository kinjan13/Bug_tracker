# 🎨 Frontend Implementation Guide

This guide shows what React components to create and how to structure them.

---

## 📦 Recommended Component Structure

```
client/src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── SignupForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── projects/
│   │   ├── ProjectList.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── ProjectForm.jsx
│   │   ├── ProjectDetail.jsx
│   │   └── ProjectSettings.jsx
│   ├── issues/
│   │   ├── IssueBoard.jsx (Kanban)
│   │   ├── IssueCard.jsx
│   │   ├── IssueForm.jsx
│   │   ├── IssueDetail.jsx
│   │   ├── IssueFilter.jsx
│   │   ├── IssueSearch.jsx
│   │   └── IssueModal.jsx
│   ├── comments/
│   │   ├── CommentList.jsx
│   │   ├── CommentItem.jsx
│   │   └── CommentForm.jsx
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorAlert.jsx
│   │   ├── ConfirmDialog.jsx
│   │   └── Modal.jsx
│   └── dashboard/
│       └── Dashboard.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── ProjectsPage.jsx
│   ├── ProjectDetailPage.jsx
│   ├── NotFoundPage.jsx
│   └── ProfilePage.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useProject.js
│   └── useIssue.js
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
├── styles/
│   ├── globals.css
│   ├── tailwind.config.js
│   └── variables.css
├── App.jsx
└── index.js
```

---

## 🔑 Key Components To Create

### 1. Authentication Components

#### LoginForm.jsx
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/projects');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-md w-full space-y-4 bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold">Login</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

#### ProtectedRoute.jsx
```jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute({ children }) {
  const { user, token } = useAuthStore();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
```

---

### 2. Project Components

#### ProjectList.jsx
```jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { ProjectCard } from './ProjectCard';

export function ProjectList() {
  const { projects, fetchProjects, loading } = useProjectStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) return <div>Loading projects...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button
          onClick={() => navigate('/projects/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

#### ProjectCard.jsx
```jsx
import { useNavigate } from 'react-router-dom';

export function ProjectCard({ project }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
    >
      <h3 className="text-lg font-bold mb-2">{project.name}</h3>
      <p className="text-gray-600 text-sm mb-4">{project.description}</p>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Key: {project.key}</span>
        <span>{project.project_members?.length || 0} members</span>
      </div>
    </div>
  );
}
```

---

### 3. Issue/Kanban Components

#### IssueBoard.jsx (Kanban)
```jsx
import { useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useIssueStore } from '../store/issueStore';
import { IssueCard } from './IssueCard';

const STATUSES = ['todo', 'in_progress', 'in_review', 'done'];

export function IssueBoard({ projectId }) {
  const { issues, fetchIssues, updateIssueStatus } = useIssueStore();

  useEffect(() => {
    fetchIssues(projectId);
  }, [projectId]);

  const handleDragEnd = async (result) => {
    const { draggableId, destination } = result;
    
    if (!destination) return;

    const newStatus = destination.droppableId;
    await updateIssueStatus(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto p-6">
        {STATUSES.map(status => (
          <Droppable key={status} droppableId={status}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex-shrink-0 w-72 bg-gray-100 rounded-lg p-4"
              >
                <h3 className="font-bold mb-4 capitalize">{status.replace('_', ' ')}</h3>
                
                {issues
                  .filter(issue => issue.status === status)
                  .map((issue, index) => (
                    <Draggable key={issue.id} draggableId={issue.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-3"
                        >
                          <IssueCard issue={issue} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
```

#### IssueCard.jsx
```jsx
import { useNavigate } from 'react-router-dom';

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

export function IssueCard({ issue }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/issues/${issue.id}`)}
      className="bg-white p-4 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
    >
      <h4 className="font-semibold mb-2 line-clamp-2">{issue.title}</h4>
      
      <div className="flex justify-between items-center mb-2">
        <span className={`text-xs px-2 py-1 rounded ${PRIORITY_COLORS[issue.priority]}`}>
          {issue.priority}
        </span>
        <span className="text-xs text-gray-500">{issue.issue_type}</span>
      </div>

      {issue.assignee && (
        <div className="flex items-center text-xs text-gray-600">
          <img
            src={issue.assignee.avatar_url || 'https://via.placeholder.com/24'}
            alt={issue.assignee.full_name}
            className="w-6 h-6 rounded-full"
          />
          <span className="ml-2">{issue.assignee.full_name}</span>
        </div>
      )}
    </div>
  );
}
```

---

### 4. Comment Components

#### CommentList.jsx
```jsx
import { useEffect } from 'react';
import { useIssueStore } from '../store/issueStore';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';

export function CommentList({ issueId }) {
  const { comments, fetchIssueById } = useIssueStore();

  useEffect(() => {
    fetchIssueById(issueId);
  }, [issueId]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Comments ({comments.length})</h3>
      
      <CommentForm issueId={issueId} />
      
      <div className="space-y-3">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} issueId={issueId} />
        ))}
      </div>
    </div>
  );
}
```

#### CommentForm.jsx
```jsx
import { useState } from 'react';
import { useIssueStore } from '../store/issueStore';

export function CommentForm({ issueId }) {
  const [content, setContent] = useState('');
  const { addComment } = useIssueStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim()) {
      await addComment(issueId, content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="3"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 h-fit"
      >
        Comment
      </button>
    </form>
  );
}
```

---

### 5. Common Components

#### Header.jsx
```jsx
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">🐛 Bug Tracker</h1>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.full_name || user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
```

#### LoadingSpinner.jsx
```jsx
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

#### ErrorAlert.jsx
```jsx
export function ErrorAlert({ message, onClose }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <span className="block sm:inline">{message}</span>
      <button
        onClick={onClose}
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
      >
        ×
      </button>
    </div>
  );
}
```

---

## 🎯 Routing Setup (App.jsx)

```jsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 🎣 Custom Hooks

#### useAuth.js
```javascript
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, token, login, logout, signup, error, loading } = useAuthStore();
  
  return {
    isAuthenticated: !!token && !!user,
    user,
    token,
    login,
    logout,
    signup,
    error,
    loading
  };
}
```

#### useProject.js
```javascript
import { useProjectStore } from '../store/projectStore';

export function useProject() {
  const store = useProjectStore();
  return {
    projects: store.projects,
    currentProject: store.currentProject,
    issues: store.issues,
    loading: store.loading,
    error: store.error,
    ...store
  };
}
```

---

## 📋 Utility Files

#### constants.js
```javascript
export const ISSUE_STATUSES = ['todo', 'in_progress', 'in_review', 'done'];
export const ISSUE_TYPES = ['bug', 'feature', 'task', 'improvement'];
export const PRIORITIES = ['low', 'medium', 'high', 'critical'];
export const USER_ROLES = ['admin', 'manager', 'developer', 'viewer'];

export const STATUS_COLORS = {
  todo: '#E5E7EB',
  in_progress: '#DBEAFE',
  in_review: '#FEF3C7',
  done: '#DCFCE7'
};

export const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};
```

#### helpers.js
```javascript
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function getInitials(fullName) {
  return fullName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
```

---

## 🚀 Getting Started

1. **Create all component files** based on the structure above
2. **Setup routing** in App.jsx
3. **Create custom hooks** for reusable logic
4. **Style with Tailwind** CSS classes
5. **Test authentication flow** first
6. **Build project management** features
7. **Implement Kanban board** with drag-and-drop
8. **Add filtering and search** functionality
9. **Implement comments** and collaboration features
10. **Add file uploads** for attachments

---

## 💡 Best Practices

✅ Keep components small and focused
✅ Use custom hooks to share logic
✅ Implement error handling
✅ Add loading states
✅ Use Tailwind for consistent styling
✅ Follow naming conventions
✅ Keep API calls in store/services
✅ Protect routes with authentication
✅ Test each feature thoroughly

---

**Start building! The foundation is ready! 🚀**
