import { create } from "zustand";
import { supabase } from "../lib/supabase";

export const useAuthStore = create((set) => ({
  user: null,

  loadUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    set({ user });
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
