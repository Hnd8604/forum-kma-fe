import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/components/LoginPage';
import SettingsPage from '../features/auth/components/SettingsPage';
import ProfilePage from '../features/forum/components/ProfilePage';
import MainForum from '../features/forum/components/MainForum';
import ChatMessenger from '../features/chat/components/ChatMessenger';
import Notifications from '../features/notifications/Notifications';
import { ChatBubble } from '../features/chatbot';
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
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const handleChatOpen = () => {
        setIsChatOpen(true);
        setIsChatbotOpen(false);
        setIsNotificationsOpen(false);
    };

    const handleChatbotOpen = () => {
        setIsChatbotOpen(true);
        setIsChatOpen(false);
        setIsNotificationsOpen(false);
    };

    const handleNotificationsOpen = () => {
        setIsNotificationsOpen(true);
        setIsChatOpen(false);
        setIsChatbotOpen(false);
    };

    if (!isLoggedIn) return <Navigate to="/" replace />;

    return (
        <>
            <MainForum onLogout={logout} onOpenNotifications={handleNotificationsOpen}>
                {children}
            </MainForum>

            <ChatMessenger
                isOpen={isChatOpen}
                onOpenChange={(open) => {
                    setIsChatOpen(open);
                    if (open) {
                        setIsChatbotOpen(false);
                        setIsNotificationsOpen(false);
                    }
                }}
            />

            <Notifications
                isOpen={isNotificationsOpen}
                onOpenChange={(open) => {
                    setIsNotificationsOpen(open);
                    if (open) {
                        setIsChatOpen(false);
                        setIsChatbotOpen(false);
                    }
                }}
            />

            {!isChatOpen && !isNotificationsOpen && (
                <ChatBubble
                    isOpen={isChatbotOpen}
                    onOpenChange={(open) => {
                        setIsChatbotOpen(open);
                        if (open) {
                            setIsChatOpen(false);
                            setIsNotificationsOpen(false);
                        }
                    }}
                />
            )}
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
