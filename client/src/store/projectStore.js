// src/store/projectStore.js
import { create } from "zustand";
import { projectApi, issueApi } from "../services/api";

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  issues: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await projectApi.getAll();
      set({ projects: response.data, loading: false });
      return { success: true };
    } catch (error) {
      const err = error.response?.data?.error || "Failed to fetch projects";
      set({ error: err, loading: false });
      return { success: false, error: err };
    }
  },

  fetchProjectById: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const response = await projectApi.getById(projectId);
      set({ currentProject: response.data, loading: false });
      return { success: true };
    } catch (error) {
      const err = error.response?.data?.error || "Failed to fetch project";
      set({ error: err, loading: false });
      return { success: false, error: err };
    }
  },

  createProject: async (projectData) => {
    set({ loading: true, error: null });
    try {
      const response = await projectApi.create(projectData);
      set(state => ({
        projects: [...state.projects, response.data],
        loading: false
      }));
      return { success: true, data: response.data };
    } catch (error) {
      const err = error.response?.data?.error || "Failed to create project";
      set({ error: err, loading: false });
      return { success: false, error: err };
    }
  },

  updateProject: async (projectId, projectData) => {
    set({ loading: true, error: null });
    try {
      const response = await projectApi.update(projectId, projectData);
      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? response.data : p),
        currentProject: state.currentProject?.id === projectId ? response.data : state.currentProject,
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const err = error.response?.data?.error || "Failed to update project";
      set({ error: err, loading: false });
      return { success: false, error: err };
    }
  },

  deleteProject: async (projectId) => {
    set({ loading: true, error: null });
    try {
      await projectApi.delete(projectId);
      set(state => ({
        projects: state.projects.filter(p => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const err = error.response?.data?.error || "Failed to delete project";
      set({ error: err, loading: false });
      return { success: false, error: err };
    }
  },

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

  clearError: () => set({ error: null })
}));
