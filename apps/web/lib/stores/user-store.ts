"use client";

import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
