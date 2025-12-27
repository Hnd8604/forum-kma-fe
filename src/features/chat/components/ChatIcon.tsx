import { MessageCircle, X } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import ChatMessenger from './ChatMessenger';

interface ChatIconProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  unreadCount?: number;
}

export default function ChatIcon({ isOpen = false, onOpenChange, unreadCount = 3 }: ChatIconProps) {
  const handleClick = () => {
    if (onOpenChange) {
      onOpenChange(!isOpen);
    }
  };

  return (
    <>
      {/* Chat Messenger Dialog */}
      {isOpen && <ChatMessenger isOpen={isOpen} onOpenChange={(open) => onOpenChange?.(open)} />}
      
      {/* Chat Icon Button - Render sau để luôn ở trên cùng */}
      <div className="fixed bottom-[120px] right-6 z-[60] group">
        <Button
          onClick={handleClick}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-pink-500 to-red-600 hover:from-red-600 hover:via-pink-600 hover:to-red-700 shadow-2xl hover:shadow-red-400/50 hover:scale-110 transition-all duration-300 relative border-2 border-white/30"
          style={{ animation: isOpen ? 'none' : 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
          size="icon"
        >
          {isOpen ? (
            <X className="w-7 h-7 text-white transition-transform group-hover:rotate-90 duration-300" />
          ) : (
            <MessageCircle className="w-7 h-7 text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
          )}
          {!isOpen && unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center p-0 bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-2 border-white animate-bounce shadow-lg font-bold">
              {unreadCount}
            </Badge>
          )}
        </Button>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-pink-500 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-300 -z-10" />
      </div>
    </>
  );
}
