// src/store/issueStore.js
import { create } from "zustand";
import { issueApi, commentApi, attachmentApi } from "../services/api";

export const useIssueStore = create((set, get) => ({
  issues: [],
  currentIssue: null,
  comments: [],
  attachments: [],
  loading: false,
  error: null,

  fetchIssues: async (projectId, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await issueApi.getByProject(projectId, filters);
      set({ issues: response.data, loading: false });
      return { success: true };
    } catch (error) {
      const err = error.response?.data?.error || "Failed to fetch issues";
      set({ error: err, loading: false });
      return { success: false, error: err };
    }
  },

  fetchIssueById: async (issueId) => {
    set({ loading: true, error: null });
    try {
      const response = await issueApi.getById(issueId);
      const { comments, attachments, ...issue } = response.data;
      set({ 
        currentIssue: issue, 
        comments: comments || [],
        attachments: attachments || [],
        loading: false 
      });
      return { success: true };
    } catch (error) {
      const err = error.response?.data?.error || "Failed to fetch issue";
      set({ error: err, loading: false });
      return { success: false, error: err };
    }
  },

  createIssue: async (issueData) => {
    set({ loading: true, error: null });
    try {
      const response = await issueApi.create(issueData);
      set(state => ({
        issues: [response.data, ...state.issues],
        loading: false
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const err = error.response?.data?.error || "Failed to create issue";
      set({ error: err, loading: false });
      return { success: false, error: err };
    }
  },

  updateIssue: async (issueId, issueData) => {
    set({ loading: true, error: null });
    try {
      const response = await issueApi.update(issueId, issueData);
      set(state => ({
        issues: state.issues.map(i => i.id === issueId ? response.data : i),
        currentIssue: state.currentIssue?.id === issueId ? response.data : state.currentIssue,
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const err = error.response?.data?.error || "Failed to update issue";
      set({ error: err, loading: false });
      return { success: false, error: err };
    }
  },

  updateIssueStatus: async (issueId, status) => {
    try {
      const response = await issueApi.updateStatus(issueId, status);
      set(state => ({
        issues: state.issues.map(i => i.id === issueId ? response.data : i),
        currentIssue: state.currentIssue?.id === issueId ? response.data : state.currentIssue
      }));
      return { success: true };
    } catch (error) {
      const err = error.response?.data?.error || "Failed to update status";
      return { success: false, error: err };
    }
  },

  deleteIssue: async (issueId) => {
    set({ loading: true, error: null });
    try {
      await issueApi.delete(issueId);
      set(state => ({
        issues: state.issues.filter(i => i.id !== issueId),
        currentIssue: state.currentIssue?.id === issueId ? null : state.currentIssue,
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const err = error.response?.data?.error || "Failed to delete issue";
      set({ error: err, loading: false });
      return { success: false, error: err };
    }
  },

  addComment: async (issueId, content) => {
    try {
      const response = await commentApi.create({ issueId, content });
      set(state => ({
        comments: [...state.comments, response.data]
      }));
      return { success: true };
    } catch (error) {
      const err = error.response?.data?.error || "Failed to add comment";
      return { success: false, error: err };
    }
  },

  uploadAttachment: async (issueId, file) => {
    try {
      const response = await attachmentApi.upload(issueId, file);
      set(state => ({
        attachments: [...state.attachments, response.data]
      }));
      return { success: true };
    } catch (error) {
      const err = error.response?.data?.error || "Failed to upload attachment";
      return { success: false, error: err };
    }
  },

  clearError: () => set({ error: null })
}));
