// src/store/authStore.js
import { create } from "zustand";
import { authApi } from "../services/api";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  // Initialize auth from localStorage
  initAuth: async () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      set({ token, user: JSON.parse(user) });
    }

    // Verify token is still valid
    if (token) {
      try {
        const response = await authApi.getMe();
        set({ user: response.data });
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: null, user: null });
      }
    }
  },

  signup: async (email, password, fullName) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.signup(email, password, fullName);
      const { user, token } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      set({ user, token, loading: false });
      return { success: true };
    } catch (error) {
      const err = error.response?.data?.error || "Signup failed";
      set({ error: err, loading: false });
      return { success: false, error: err };
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      const { user, token } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      set({ user, token, loading: false });
      return { success: true };
    } catch (error) {
      const err = error.response?.data?.error || "Login failed";
      set({ error: err, loading: false });
      return { success: false, error: err };
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  updateProfile: (user) => {
    set({ user });
    localStorage.setItem("user", JSON.stringify(user));
  },

  clearError: () => set({ error: null })
}));
