import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/components/LoginPage';
import SettingsPage from '../features/auth/components/SettingsPage';
import ProfilePage from '../features/forum/components/ProfilePage';
import MainForum from '../features/forum/components/MainForum';
import Notifications from '../features/notifications/Notifications';
import { AIChatButton } from '../features/chatbot';
import { UserChatButton } from '../features/chat';
import { useAuthStore } from '../store/useStore';

function LoginWrapper() {
    const login = useAuthStore((s) => s.login);
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    if (isLoggedIn) return <Navigate to="/forum" replace />;
    return <LoginPage onLogin={login} />;
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
    const router = createBrowserRouter(
        [
            { path: '/', element: <LoginWrapper /> },
            { path: '/forum', element: <ForumWrapper /> },
            { path: '/settings', element: <ForumWrapper><SettingsPage /></ForumWrapper> },
            { path: '/profile', element: <ForumWrapper><ProfilePage /></ForumWrapper> },
            { path: '*', element: <Navigate to="/" replace /> },
        ],
        {
            // Opt-in to upcoming v7 behaviors to remove runtime warnings
            future: {
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            },
        }
    );

    return <RouterProvider router={router} />;
}
