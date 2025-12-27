import { useState } from 'react';
import LoginPage from './features/auth/components/LoginPage';
import MainForum from './features/forum/components/MainForum';
import Notifications from './features/notifications/Notifications';
import { AIChatButton } from './features/chatbot';
import { UserChatButton } from './features/chat';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isUserChatOpen, setIsUserChatOpen] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleNotificationsOpen = () => {
    setIsNotificationsOpen(true);
  };

  const handleAIChatToggle = () => {
    setIsAIChatOpen(!isAIChatOpen);
    if (!isAIChatOpen) {
      // Đóng chat người khi mở AI chat
      setIsUserChatOpen(false);
    }
  };

  const handleUserChatToggle = () => {
    setIsUserChatOpen(!isUserChatOpen);
    if (!isUserChatOpen) {
      // Đóng AI chat khi mở chat người
      setIsAIChatOpen(false);
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <MainForum onLogout={handleLogout} onOpenNotifications={handleNotificationsOpen} />

      {/* Notifications */}
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
