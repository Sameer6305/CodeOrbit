import { create } from "zustand";
import { supabase } from "../lib/supabase";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true, // Add loading state

  loadUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      set({ user, loading: false });
    } catch (error) {
      console.error("Error loading user:", error);
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  loginWithGoogle: async () => {
    return await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
