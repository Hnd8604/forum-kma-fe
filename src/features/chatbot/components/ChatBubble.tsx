import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import ChatbotDialog from './ChatbotDialog';

interface ChatBubbleProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export default function ChatBubble({ isOpen: externalIsOpen, onOpenChange }: ChatBubbleProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <div className="fixed bottom-[100px] right-6 z-50 group">
        <Button
          onClick={() => handleOpenChange(!isOpen)}
          className="h-16 w-16 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 hover:from-purple-600 hover:via-blue-600 hover:to-purple-700 hover:scale-110 border-2 border-white/20"
          style={{ animation: isOpen ? 'none' : 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
          size="icon"
        >
          {isOpen ? (
            <X className="h-7 w-7 text-white transition-transform group-hover:rotate-90 duration-300" />
          ) : (
            <MessageCircle className="h-7 w-7 text-white transition-transform group-hover:scale-110 duration-300" />
          )}
        </Button>
        
        {/* Notification Badge */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs text-white font-bold shadow-lg border-2 border-white"
            style={{ animation: 'bounce 2s infinite' }}>
            AI
          </span>
        )}
        
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10" />
      </div>

      {/* Chatbot Dialog */}
      <ChatbotDialog isOpen={isOpen} onClose={() => handleOpenChange(false)} />
    </>
  );
}
