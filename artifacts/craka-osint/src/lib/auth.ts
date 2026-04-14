import { create } from "zustand";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
}

const TOKEN_KEY = "craka_admin_token";

const initialToken = localStorage.getItem(TOKEN_KEY);

if (initialToken) {
  setAuthTokenGetter(() => initialToken);
}

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  setToken: (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      setAuthTokenGetter(() => token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setAuthTokenGetter(null);
    }
    set({ token });
  },
}));
