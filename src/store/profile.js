import { create } from "zustand";
import { supabase } from "../lib/supabase";

export const useProfileStore = create((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  // Fetch user profile
  fetchProfile: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      set({ profile: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Update user profile
  updateProfile: async (userId, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      set({ profile: data, loading: false });
      return { success: true, data };
    } catch (error) {
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Update platform handles specifically
  updatePlatformHandles: async (userId, handles) => {
    const updates = {
      codeforces_handle: handles.codeforces || null,
      leetcode_username: handles.leetcode || null,
      codechef_handle: handles.codechef || null,
    };
    return await get().updateProfile(userId, updates);
  },

  // Clear profile data
  clearProfile: () => {
    set({ profile: null, error: null });
  },
}));
