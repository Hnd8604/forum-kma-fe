import { useState } from 'react';
import LoginPage from './features/auth/components/LoginPage';
import MainForum from './features/forum/components/MainForum';
import Notifications from './features/notifications/Notifications';
import { AIChatButton } from './features/chatbot';
import { ChatContainer } from './features/chat';
import WebSocketManager from './shared/components/websocket/WebSocketManager';
import { Toaster } from './shared/components/ui/toaster';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
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

  const handleAIChatToggle = () => {
    setIsAIChatOpen(!isAIChatOpen);
    if (!isAIChatOpen) {
      // Đóng friends list khi mở AI chat
      setShowFriendsList(false);
    }
  };

  const handleFriendsListToggle = () => {
    setShowFriendsList(!showFriendsList);
    if (!showFriendsList) {
      // Đóng AI chat khi mở friends list
      setIsAIChatOpen(false);
    }
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

      {/* AI Chat */}
      <AIChatButton isOpen={isAIChatOpen} onToggle={handleAIChatToggle} />

      {/* Chat Container - Manages all chat windows and friends list */}
      <ChatContainer showFriendsList={showFriendsList} />

      {/* Toast Notifications */}
      <Toaster />
    </>
  );
}
