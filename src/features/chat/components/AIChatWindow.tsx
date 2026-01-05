import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, RotateCw, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatbotService } from '../../chatbot/services/chatbot.service';
import type { ChatBotMessage } from '@/interfaces/chatbot.types';
import AIAvatar from './AIAvatar';
import { useAuthStore } from '@/store/useStore';

interface AIChatWindowProps {
  onBack?: () => void;
}

export default function AIChatWindow({ onBack: _onBack }: AIChatWindowProps) {
  const user = useAuthStore((s) => s.user);
  const [senderId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState<ChatBotMessage[]>([
    {
      id: '1',
      text: 'Chào bạn, mình là Trợ lý AI của KMA! 🎓\n\nMình có thể giúp bạn giải đáp các vấn đề về học tập tại KMA như:\n• Lịch học, lịch thi\n• Điểm số và kết quả học tập\n• Quy định đào tạo\n• Hoạt động sinh viên\n\nBạn cần hỗ trợ gì nhé?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleReset = useCallback(() => {
    setMessages([
      {
        id: '1',
        text: 'Chào bạn, mình là Trợ lý AI của KMA! 🎓\n\nMình có thể giúp bạn giải đáp các vấn đề về học tập tại KMA như:\n• Lịch học, lịch thi\n• Điểm số và kết quả học tập\n• Quy định đào tạo\n• Hoạt động sinh viên\n\nBạn cần hỗ trợ gì nhé?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
    setInputValue('');
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatBotMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage({
        sender: senderId,
        message: currentInput,
      });

      if (response && response.length > 0) {
        response.forEach((item, index) => {
          const botResponse: ChatBotMessage = {
            id: `${Date.now()}_${index}`,
            text: item.text,
            sender: 'bot',
            timestamp: new Date(),
            buttons: item.buttons,
          };
          setMessages((prev) => [...prev, botResponse]);
        });
      }
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      const botResponse: ChatBotMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, hiện tại hệ thống đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ với phòng Đào tạo để được hỗ trợ.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col border-0 rounded-none bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50">
        <AIAvatar size="md" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900">Trợ lý AI KMA</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI
            </span>
          </div>
          <p className="text-xs text-slate-500">Hỗ trợ 24/7 về học tập tại KMA</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="rounded-xl hover:bg-purple-100 text-purple-600"
          title="Làm mới cuộc trò chuyện"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-slate-50 to-white overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <AIAvatar size="sm" />
              )}
              <div className={`flex flex-col gap-2 ${message.sender === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : 'bg-white text-slate-800 border border-slate-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                </div>
                {message.buttons && message.buttons.length > 0 && (
                  <div className="flex flex-col gap-2 w-full">
                    {message.buttons.map((button, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left hover:bg-purple-50 border-purple-200 text-purple-600 hover:text-purple-700 rounded-xl"
                        onClick={() => {
                          if (button.type === 'web_url' && button.payload) {
                            window.open(button.payload, '_blank');
                          }
                        }}
                      >
                        {button.title}
                      </Button>
                    ))}
                  </div>
                )}
                <span className="text-xs text-slate-400 px-1">
                  {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-xs shadow-sm overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    user?.firstName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 justify-start items-start">
              <AIAvatar size="sm" />
              <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-3">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Hỏi về học tập tại KMA..."
            className="flex-1 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="h-11 px-5 gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/25 transition-all"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Đang gửi...' : 'Gửi'}
          </Button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">
          Thông tin do AI cung cấp, vui lòng tham khảo thêm từ giảng viên
        </p>
      </div>
    </Card>
  );
}
