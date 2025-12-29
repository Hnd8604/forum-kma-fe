import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from '../features/auth/components/LoginPage';
import RegisterPage from '../features/auth/components/RegisterPage';
import SettingsPage from '../features/auth/components/SettingsPage';
import ProfilePage from '../features/forum/components/ProfilePage';
import MainForum from '../features/forum/components/MainForum';
import Notifications from '../features/notifications/Notifications';
import { AIChatButton } from '../features/chatbot';
import { ChatPage, MiniChatWindow } from '../features/chat';
import type { Conversation } from '../features/chat';
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

interface OpenChat {
    conversation: Conversation;
    id: string;
}

function ForumWrapper({ children }: { children?: React.ReactNode }) {
    const logout = useAuthStore((s) => s.logout);
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [openChats, setOpenChats] = useState<OpenChat[]>([]);

    const handleAIChatToggle = () => {
        setIsAIChatOpen(!isAIChatOpen);
    };

    const handleNotificationsOpen = () => {
        setIsNotificationsOpen((prev) => !prev);
    };

    const handleOpenMiniChat = (conversation: Conversation) => {
        // Check if already open
        const exists = openChats.find(
            (chat) => chat.conversation.conversationId === conversation.conversationId
        );

        if (exists) {
            // Bring to front by moving to end
            setOpenChats((prev) =>
                prev.filter((c) => c.id !== exists.id).concat(exists)
            );
            return;
        }

        // Limit to 3 open chats
        setOpenChats((prev) => {
            const newChat: OpenChat = {
                conversation,
                id: conversation.conversationId,
            };

            if (prev.length >= 3) {
                return [...prev.slice(1), newChat];
            }

            return [...prev, newChat];
        });
    };

    const handleCloseChat = (id: string) => {
        setOpenChats((prev) => prev.filter((chat) => chat.id !== id));
    };

    if (!isLoggedIn) return <Navigate to="/" replace />;

    return (
        <>
            <MainForum 
                onLogout={logout} 
                onOpenNotifications={handleNotificationsOpen}
                onOpenMiniChat={handleOpenMiniChat}
            >
                {children}
            </MainForum>

            <Notifications
                isOpen={isNotificationsOpen}
                onOpenChange={setIsNotificationsOpen}
            />

            {/* AI Chat */}
            <AIChatButton isOpen={isAIChatOpen} onToggle={handleAIChatToggle} />

            {/* Mini Chat Windows */}
            {openChats.map((chat, index) => (
                <MiniChatWindow
                    key={chat.id}
                    conversation={chat.conversation}
                    onClose={() => handleCloseChat(chat.id)}
                    position={index}
                />
            ))}
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
            { path: '/chat', element: <ForumWrapper><ChatPage /></ForumWrapper> },
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
