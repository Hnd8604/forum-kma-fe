import { create } from 'zustand';
import { User } from '../features/auth/types/auth.types';
import { AuthService } from '../features/auth/services/auth.service';

// Auth Store
type AuthState = {
    isLoggedIn: boolean;
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
    initAuth: () => void;
    _hasHydrated: boolean;
};

export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false,
    user: null,
    _hasHydrated: false,
    login: (user: User) => set({
        isLoggedIn: true,
        user
    }),
    logout: () => {
        AuthService.logout();
        set({ isLoggedIn: false, user: null });
    },
    setUser: (user: User) => set({ user, isLoggedIn: true }),
    initAuth: () => {
        const user = AuthService.getCurrentUser();
        const isAuthenticated = AuthService.isAuthenticated();
        set({ user, isLoggedIn: isAuthenticated, _hasHydrated: true });
    },
}));
