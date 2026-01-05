import { useState } from 'react';
import LoginPage from '@/features/auth/components/LoginPage';
import MainForum from '@/features/forum/components/MainForum';
import Notifications from '@/features/notifications/Notifications';
import { ChatContainer } from '@/features/chat';
import WebSocketManager from '@/components/websocket/WebSocketManager';
import { Toaster } from '@/components/ui/toaster';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleNotificationsOpen = () => {
    setIsNotificationsOpen((prev) => !prev);
  };

  const handleFriendsListToggle = () => {
    setShowFriendsList(!showFriendsList);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      {/* WebSocket Manager - Auto-connects when logged in */}
      <WebSocketManager />

      <MainForum
        onLogout={handleLogout}
        onOpenNotifications={handleNotificationsOpen}
        onOpenFriendsList={handleFriendsListToggle}
      />

      {/* Notifications */}
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
