import { useState } from 'react';
import LoginPage from './features/auth/components/LoginPage';
import MainForum from './features/forum/components/MainForum';
import { ChatBubble } from './features/chatbot';
import ChatMessenger from './features/chat/components/ChatMessenger';
import Notifications from './features/notifications/Notifications';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

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

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <MainForum onLogout={handleLogout} onOpenNotifications={handleNotificationsOpen} />
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
