import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from '../features/auth/components/LoginPage';
import RegisterPage from '../features/auth/components/RegisterPage';
import SettingsPage from '../features/auth/components/SettingsPage';
import ProfilePage from '../features/forum/components/ProfilePage';
import MainForum from '../features/forum/components/MainForum';
import Notifications from '../features/notifications/Notifications';
import { AIChatButton } from '../features/chatbot';
import { UserChatButton } from '../features/chat';
import { useAuthStore } from '../store/useStore';

function LoginWrapper() {
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const navigate = useNavigate();
    
    if (isLoggedIn) return <Navigate to="/forum" replace />;
    
    return <LoginPage 
        onLogin={() => navigate('/forum')} 
        onSwitchToRegister={() => navigate('/register')}
    />;
}

function RegisterWrapper() {
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const navigate = useNavigate();
    
    if (isLoggedIn) return <Navigate to="/forum" replace />;
    
    return <RegisterPage 
        onRegister={() => navigate('/forum')} 
        onSwitchToLogin={() => navigate('/')}
    />;
}

function ForumWrapper({ children }: { children?: React.ReactNode }) {
    const logout = useAuthStore((s) => s.logout);
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [isUserChatOpen, setIsUserChatOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const handleAIChatToggle = () => {
        setIsAIChatOpen(!isAIChatOpen);
        if (!isAIChatOpen) {
            setIsUserChatOpen(false);
        }
    };

    const handleUserChatToggle = () => {
        setIsUserChatOpen(!isUserChatOpen);
        if (!isUserChatOpen) {
            setIsAIChatOpen(false);
        }
    };

    const handleNotificationsOpen = () => {
        setIsNotificationsOpen(true);
    };

    if (!isLoggedIn) return <Navigate to="/" replace />;

    return (
        <>
            <MainForum onLogout={logout} onOpenNotifications={handleNotificationsOpen}>
                {children}
            </MainForum>

            <Notifications
                isOpen={isNotificationsOpen}
                onOpenChange={setIsNotificationsOpen}
            />

            {/* AI Chat */}
            <AIChatButton isOpen={isAIChatOpen} onToggle={handleAIChatToggle} />

            {/* User Chat */}
            <UserChatButton isOpen={isUserChatOpen} onToggle={handleUserChatToggle} unreadCount={3} />
        </>
    );
}

export default function AppRouter() {
    const initAuth = useAuthStore((s) => s.initAuth);
    const hasHydrated = useAuthStore((s) => s._hasHydrated);
    
    // Initialize auth state from localStorage on app start
    useEffect(() => {
        initAuth();
    }, [initAuth]);

    const router = createBrowserRouter(
        [
            { path: '/', element: <LoginWrapper /> },
            { path: '/register', element: <RegisterWrapper /> },
            { path: '/forum', element: <ForumWrapper /> },
            { path: '/settings', element: <ForumWrapper><SettingsPage /></ForumWrapper> },
            { path: '/profile', element: <ForumWrapper><ProfilePage /></ForumWrapper> },
            { path: '*', element: <Navigate to="/" replace /> },
        ],
        {
            future: {
                v7_relativeSplatPath: true,
            },
        }
    );

    // Wait for auth hydration before rendering router
    if (!hasHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return <RouterProvider router={router} />;
}
