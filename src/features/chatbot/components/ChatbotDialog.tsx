import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, X, Maximize2, Minus } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { ScrollArea } from '../../../shared/components/ui/scroll-area';
import { Card } from '../../../shared/components/ui/card';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotDialog({ isOpen, onClose }: ChatbotDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý AI của diễn đàn sinh viên. Tôi có thể giúp gì cho bạn?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto scroll to bottom when new message arrives
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Simple response logic - replace with actual AI integration
    if (input.includes('hello') || input.includes('xin chào') || input.includes('chào')) {
      return 'Xin chào! Rất vui được trò chuyện với bạn. Bạn cần hỗ trợ gì không?';
    } else if (input.includes('help') || input.includes('giúp') || input.includes('trợ giúp')) {
      return 'Tôi có thể giúp bạn về:\n• Cách sử dụng diễn đàn\n• Đăng bài viết mới\n• Tìm kiếm thông tin\n• Quản lý tài khoản\nBạn muốn biết thêm về điều gì?';
    } else if (input.includes('post') || input.includes('đăng bài') || input.includes('viết bài')) {
      return 'Để đăng bài viết mới, bạn có thể:\n1. Nhấn vào nút "+ Tạo bài viết" ở góc trên bên phải\n2. Chọn chủ đề và nhập nội dung\n3. Thêm hình ảnh nếu cần\n4. Nhấn "Đăng" để chia sẻ';
    } else if (input.includes('account') || input.includes('tài khoản') || input.includes('profile')) {
      return 'Để quản lý tài khoản, bạn có thể truy cập vào phần cài đặt ở góc trên cùng. Từ đó bạn có thể cập nhật thông tin cá nhân, đổi mật khẩu, và cài đặt quyền riêng tư.';
    } else {
      return 'Cảm ơn bạn đã hỏi! Đây là câu hỏi thú vị. Hiện tại tôi đang học hỏi thêm để có thể trả lời tốt hơn. Bạn có thể hỏi tôi về cách sử dụng diễn đàn, đăng bài, hoặc quản lý tài khoản nhé!';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <Card className={`fixed ${isExpanded ? 'bottom-6 right-6 w-[900px] h-[650px]' : 'bottom-[180px] right-6 w-96 h-[500px]'} z-50 shadow-2xl flex flex-col overflow-hidden border-2 transition-all duration-300 rounded-2xl`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Trợ lý AI</h3>
            <p className="text-xs text-white/80">Luôn sẵn sàng hỗ trợ bạn</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            {isExpanded ? <Minus className="h-5 w-5" /> : <Maximize2 className="h-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 bg-gray-50 overflow-y-auto">
        <div className="space-y-4 pr-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex gap-2 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user'
                      ? 'bg-blue-500'
                      : 'bg-purple-500'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Bot className="h-5 w-5 text-white" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[80%]">
                <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-500">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="rounded-lg p-3 bg-white border border-gray-200">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
