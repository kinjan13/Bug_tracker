// src/services/api.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authApi = {
  signup: (email, password, fullName) => 
    api.post("/auth/signup", { email, password, fullName }),
  login: (email, password) => 
    api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me")
};

// Project APIs
export const projectApi = {
  getAll: () => api.get("/projects"),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (projectId, userId, role) => 
    api.post(`/projects/${projectId}/members`, { userId, role })
};

// Issue/Ticket APIs
export const issueApi = {
  getByProject: (projectId, filters = {}) => 
    api.get(`/issues/project/${projectId}`, { params: filters }),
  getById: (id) => api.get(`/issues/${id}`),
  create: (data) => api.post("/issues", data),
  update: (id, data) => api.put(`/issues/${id}`, data),
  updateStatus: (id, status) => api.put(`/issues/${id}/status`, { status }),
  delete: (id) => api.delete(`/issues/${id}`)
};

// Comment APIs
export const commentApi = {
  getByIssue: (issueId) => api.get(`/comments/${issueId}`),
  create: (data) => api.post("/comments", data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`)
};

// Attachment APIs
export const attachmentApi = {
  getByIssue: (issueId) => api.get(`/attachments/${issueId}`),
  upload: (issueId, file) => {
    const formData = new FormData();
    formData.append("issueId", issueId);
    formData.append("file", file);
    return api.post("/attachments", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
  delete: (id) => api.delete(`/attachments/${id}`)
};

// Activity APIs
export const activityApi = {
  getByIssue: (issueId) => api.get(`/activity/${issueId}`),
  getByProject: (projectId) => api.get(`/activity/project/${projectId}`)
};

// User APIs
export const userApi = {
  getAll: (search = "") => api.get("/users", { params: { search } }),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put("/users/profile", data)
};

export default api;
