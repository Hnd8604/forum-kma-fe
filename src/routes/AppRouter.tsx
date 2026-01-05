import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from '@/features/auth/components/LoginPage';
import RegisterPage from '@/features/auth/components/RegisterPage';
import SettingsPage from '@/features/auth/components/SettingsPage';
import ProfilePage from '@/features/forum/components/ProfilePage';
import MainForum from '@/features/forum/components/MainForum';
import ForumHeader from '@/features/forum/components/ForumHeader';
import GroupPage from '@/features/forum/components/GroupPage';
import Notifications from '@/features/notifications/Notifications';
import { ChatPage, ChatContainer } from '@/features/chat';
import WebSocketManager from '@/components/websocket/WebSocketManager';
import { Toaster } from '@/components/ui/toaster';
import { FriendsPage } from '@/features/friends';
import { GroupsPage } from '@/features/groups';
import { useAuthStore } from '@/store/useStore';
import { MainAppLayout } from '@/layouts';

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
        onSwitchToLogin={() => navigate('/login')}
    />;
}

function ForumWrapper({ children }: { children?: React.ReactNode }) {
    const logout = useAuthStore((s) => s.logout);
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [showFriendsList, setShowFriendsList] = useState(false);

    const handleNotificationsOpen = () => {
        setIsNotificationsOpen((prev) => !prev);
    };

    const handleFriendsListToggle = () => {
        setShowFriendsList(!showFriendsList);
    };

    if (!isLoggedIn) return <Navigate to="/" replace />;

    return (
        <>
            {/* WebSocket Manager - Auto-connects when logged in */}
            <WebSocketManager />

            <MainForum
                onLogout={logout}
                onOpenNotifications={handleNotificationsOpen}
                onOpenFriendsList={handleFriendsListToggle}
            >
                {children}
            </MainForum>

            <Notifications
                isOpen={isNotificationsOpen}
                onOpenChange={setIsNotificationsOpen}
            />

            {/* Chat Container - Manages all chat windows and friends list */}
            <ChatContainer showFriendsList={showFriendsList} />

            {/* Toast Notifications */}
            <Toaster />
        </>
    );
}

function SimplePageWrapper({ children }: { children: React.ReactNode }) {
    const logout = useAuthStore((s) => s.logout);
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [showFriendsList, setShowFriendsList] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleNotificationsOpen = () => {
        setIsNotificationsOpen((prev) => !prev);
    };

    const handleFriendsListToggle = () => {
        setShowFriendsList(!showFriendsList);
    };

    if (!isLoggedIn) return <Navigate to="/" replace />;

    return (
        <>
            {/* WebSocket Manager - Auto-connects when logged in */}
            <WebSocketManager />

            <MainAppLayout
                header={
                    <ForumHeader
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onLogout={logout}
                        onOpenNotifications={handleNotificationsOpen}
                        onOpenFriendsList={handleFriendsListToggle}
                    />
                }
            >
                {children}
            </MainAppLayout>

            <Notifications
                isOpen={isNotificationsOpen}
                onOpenChange={setIsNotificationsOpen}
            />

            {/* Chat Container - Manages all chat windows and friends list */}
            <ChatContainer showFriendsList={showFriendsList} />

            {/* Toast Notifications */}
            <Toaster />
        </>
    );
}

function ChatWrapper() {
    const logout = useAuthStore((s) => s.logout);
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [showFriendsList, setShowFriendsList] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleNotificationsOpen = () => {
        setIsNotificationsOpen((prev) => !prev);
    };

    const handleFriendsListToggle = () => {
        setShowFriendsList(!showFriendsList);
    };

    if (!isLoggedIn) return <Navigate to="/" replace />;

    return (
        <>
            {/* WebSocket Manager - Auto-connects when logged in */}
            <WebSocketManager />

            <MainAppLayout
                header={
                    <ForumHeader
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onLogout={logout}
                        onOpenNotifications={handleNotificationsOpen}
                        onOpenFriendsList={handleFriendsListToggle}
                    />
                }
            >
                <ChatPage />
            </MainAppLayout>

            <Notifications
                isOpen={isNotificationsOpen}
                onOpenChange={setIsNotificationsOpen}
            />

            {/* Chat Container - Manages all chat windows and friends list */}
            <ChatContainer showFriendsList={showFriendsList} />

            {/* Toast Notifications */}
            <Toaster />
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
            { path: '/', element: <Navigate to="/login" replace /> },
            { path: '/login', element: <LoginWrapper /> },
            { path: '/register', element: <RegisterWrapper /> },
            { path: '/forum', element: <ForumWrapper /> },
            { path: '/forum/group/:groupId', element: <ForumWrapper><GroupPage /></ForumWrapper> },
            { path: '/forum/post/:postId', element: <ForumWrapper /> },
            { path: '/settings', element: <SimplePageWrapper><SettingsPage /></SimplePageWrapper> },
            { path: '/profile', element: <SimplePageWrapper><ProfilePage /></SimplePageWrapper> },
            { path: '/profile/:userId', element: <SimplePageWrapper><ProfilePage /></SimplePageWrapper> },
            { path: '/friends', element: <SimplePageWrapper><FriendsPage /></SimplePageWrapper> },
            { path: '/groups', element: <ForumWrapper><GroupsPage /></ForumWrapper> },
            { path: '/chat', element: <ChatWrapper /> },
            { path: '/chat/:conversationId', element: <ChatWrapper /> },
            { path: '*', element: <Navigate to="/login" replace /> },
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
