import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, RotateCw } from 'lucide-react';
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

interface AIChatButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AIChatButton({ isOpen, onToggle }: AIChatButtonProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Chào bạn, mình là Chatbot KMA!\n\nMình có thể giúp bạn giải đáp các vấn đề về học tập tại KMA như:\n• Lịch học, lịch thi\n• Điểm số và kết quả học tập\n• Quy định đào tạo\n• Hoạt động sinh viên\n\nBạn cần hỗ trợ gì nhé?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        text: 'Chào bạn, mình là Chatbot KMA!\n\nMình có thể giúp bạn giải đáp các vấn đề về học tập tại KMA như:\n• Lịch học, lịch thi\n• Điểm số và kết quả học tập\n• Quy định đào tạo\n• Hoạt động sinh viên\n\nBạn cần hỗ trợ gì nhé?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
    setShowIntro(true);
    setInputValue('');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    setShowIntro(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

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
    
    if (input.includes('hello') || input.includes('xin chào') || input.includes('chào')) {
      return 'Xin chào! Mình là Chatbot KMA. Bạn cần hỗ trợ gì về học tập không?';
    } else if (input.includes('lịch học') || input.includes('thời khóa biểu')) {
      return 'Bạn có thể xem lịch học trên hệ thống KMA hoặc ứng dụng KMA Student. Nếu cần hỗ trợ cụ thể, vui lòng liên hệ phòng Đào tạo nhé!';
    } else if (input.includes('điểm') || input.includes('kết quả học tập')) {
      return 'Điểm số và kết quả học tập được cập nhật trên hệ thống KMA. Bạn có thể đăng nhập để kiểm tra. Nếu có thắc mắc, liên hệ giảng viên bộ môn nhé!';
    } else if (input.includes('quy định') || input.includes('quy chế')) {
      return 'Bạn có thể tìm hiểu quy định đào tạo tại website KMA hoặc hỏi phòng Đào tạo. Bạn muốn biết cụ thể về vấn đề gì?';
    } else if (input.includes('help') || input.includes('giúp') || input.includes('trợ giúp')) {
      return 'Tôi có thể giúp bạn về:\n• Lịch học, lịch thi\n• Điểm số và kết quả học tập\n• Quy định đào tạo\n• Hoạt động sinh viên\n• Thông tin chung về KMA\n\nBạn muốn biết thêm về điều gì?';
    } else {
      return 'Cảm ơn bạn đã hỏi! Tôi sẽ cố gắng hỗ trợ bạn về các vấn đề học tập tại KMA. Bạn có thể hỏi cụ thể hơn được không?';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Window - Hiển thị bên phải, ngay cạnh icon */}
      {isOpen && (
        <Card className="fixed bottom-6 right-24 w-[400px] h-[600px] z-40 shadow-2xl flex flex-col overflow-hidden border-0 rounded-3xl bg-gradient-to-b from-pink-50 via-pink-50 to-white">
          {/* Header */}
          <div className="bg-pink-100 text-gray-800 p-4 flex items-center justify-between border-b border-pink-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1">
                  Chatbot KMA 
                  <span className="text-red-500">🎓</span>
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="h-9 w-9 text-gray-600 hover:bg-pink-200 rounded-full"
                title="Làm mới"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-9 w-9 text-gray-600 hover:bg-pink-200 rounded-full"
                title="Đóng"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden bg-white">
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <div className="p-4 space-y-4">
                {/* Intro Banner - chỉ hiển thị khi mới mở */}
                {showIntro && (
                  <div className="flex flex-col items-center py-6 px-4">
                    <div className="w-32 h-32 mb-4 relative">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow-lg">
                        <Bot className="w-16 h-16 text-white" />
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      Chatbot KMA <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">AI</span>
                    </h2>
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-semibold">Chatbot KMA</span> hỗ trợ bạn giải đáp<br />các vấn đề học tập tại KMA
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'bot' && (
                      <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-xs">
                        B
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-2 justify-start items-start">
                    <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Invisible element for auto-scrolling */}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi về học tập tại KMA..."
                className="flex-1 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-400 bg-gray-50"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Thông tin do AI cung cấp, vui lòng tham khảo thêm từ giảng viên
            </p>
          </div>
        </Card>
      )}

      {/* Icon Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onToggle}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-2xl hover:scale-110 transition-all duration-300"
          size="icon"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Bot className="w-6 h-6 text-white" />
          )}
        </Button>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 h-5 w-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-xs text-white font-bold border-2 border-white">
            AI
          </span>
        )}
      </div>
    </>
  );
}
