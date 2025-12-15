import { useState } from 'react';
import { MessageCircle, X, Minus, Send, Search, MoreHorizontal, Phone, Video, Maximize2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { ScrollArea } from '../../../shared/components/ui/scroll-area';
import { Card } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';

interface Contact {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
  lastMessage?: string;
  unread?: number;
}

const mockContacts: Contact[] = [
  { id: 1, name: 'Nguyễn Văn An', avatar: 'NA', online: true, lastMessage: 'Oke bạn, mình hiểu rồi!', unread: 2 },
  { id: 2, name: 'Trần Thị Bình', avatar: 'TB', online: true, lastMessage: 'Cảm ơn bạn nhiều nhé' },
  { id: 3, name: 'Lê Minh Cường', avatar: 'LC', online: false, lastMessage: 'Hẹn gặp lại' },
  { id: 4, name: 'Phạm Thu Hà', avatar: 'PH', online: true, lastMessage: 'Được rồi' },
];

const mockMessages = [
  { id: 1, sender: 'them', text: 'Chào bạn!', time: '10:30' },
  { id: 2, sender: 'me', text: 'Chào bạn, mình có thể giúp gì không?', time: '10:31' },
  { id: 3, sender: 'them', text: 'Mình muốn hỏi về bài tập nhóm tuần này', time: '10:32' },
  { id: 4, sender: 'me', text: 'Oke bạn, deadline là thứ 6 tuần này nhé', time: '10:33' },
  { id: 5, sender: 'them', text: 'Oke bạn, mình hiểu rồi!', time: '10:34' },
];

interface ChatMessengerProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export default function ChatMessenger({ isOpen: externalIsOpen, onOpenChange }: ChatMessengerProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Contact | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle send message logic
      setMessage('');
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 group">
        <Button
          onClick={() => handleOpenChange(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-pink-500 to-red-600 hover:from-red-600 hover:via-pink-600 hover:to-red-700 shadow-2xl hover:shadow-red-400/50 hover:scale-110 transition-all duration-300 relative border-2 border-white/30 animate-pulse hover:animate-none"
          size="icon"
        >
          <MessageCircle className="w-7 h-7 text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
          <Badge className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center p-0 bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-2 border-white animate-bounce shadow-lg font-bold">
            3
          </Badge>
        </Button>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-pink-500 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-300 -z-10" />
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isExpanded ? 'w-[900px] h-[650px]' : 'w-96 h-[500px]'} transition-all duration-300`}>
      <Card className="h-full flex flex-col shadow-2xl border-2 border-red-100 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg">Chat</span>
              {selectedChat && isExpanded && (
                <p className="text-xs text-white/80">{selectedChat.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white hover:bg-white/20 rounded-xl transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minus className="w-5 h-5" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white hover:bg-white/20 rounded-xl transition-colors"
              onClick={() => {
                handleOpenChange(false);
                setIsExpanded(false);
                setSelectedChat(null);
              }}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden bg-gradient-to-br from-white to-red-50/20">
          {/* Contacts List */}
          <div className={`${isExpanded ? 'w-80' : 'w-full'} ${selectedChat && !isExpanded ? 'hidden' : ''} border-r border-red-100 flex flex-col bg-white`}>
            {/* Search */}
            <div className="p-3 border-b border-red-100">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-0 h-10 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-200"
                />
              </div>
            </div>

            {/* Contacts */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {mockContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedChat(contact)}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-red-50 transition-all group ${
                      selectedChat?.id === contact.id ? 'bg-gradient-to-r from-red-50 to-red-100/50 shadow-sm' : ''
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-yellow-400 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white">
                        <span className="text-white">{contact.avatar}</span>
                      </div>
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate group-hover:text-red-600 transition-colors">{contact.name}</span>
                        {contact.unread && (
                          <Badge className="bg-red-600 text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-full px-1.5">
                            {contact.unread}
                          </Badge>
                        )}
                      </div>
                      {contact.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Window */}
          {selectedChat && (isExpanded || (!isExpanded && selectedChat)) && (
            <div className={`flex-1 flex flex-col bg-white ${!isExpanded ? 'absolute inset-0' : ''}`}>
              {/* Chat Header */}
              <div className="p-4 border-b border-red-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-red-50/50">
                <div className="flex items-center space-x-3">
                  {!isExpanded && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-red-50"
                      onClick={() => setSelectedChat(null)}
                    >
                      <span>←</span>
                    </Button>
                  )}
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-400 via-red-500 to-yellow-400 flex items-center justify-center shadow-md ring-2 ring-white">
                      <span className="text-white">{selectedChat.avatar}</span>
                    </div>
                    {selectedChat.online && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <p>{selectedChat.name}</p>
                    <p className="text-xs text-green-600">{selectedChat.online ? 'Đang hoạt động' : 'Không hoạt động'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-gray-100 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 bg-gradient-to-br from-gray-50/30 to-red-50/20 overflow-y-auto">
                <div className="space-y-4 pr-4">
                  {mockMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                          msg.sender === 'me'
                            ? 'bg-gradient-to-br from-red-600 to-red-500 text-white rounded-br-md'
                            : 'bg-white text-gray-900 rounded-bl-md border border-red-100'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <p
                          className={`text-xs mt-1.5 ${
                            msg.sender === 'me' ? 'text-red-100' : 'text-gray-400'
                          }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-red-100 bg-white">
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200 h-11"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl h-11 px-5 shadow-md hover:shadow-lg transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder when no chat selected in expanded mode */}
          {isExpanded && !selectedChat && (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50/30">
              <div className="text-center text-gray-400">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-red-100 to-yellow-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-12 h-12 text-red-400" />
                </div>
                <p className="text-lg">Chọn một cuộc trò chuyện</p>
                <p className="text-sm mt-1">để bắt đầu nhắn tin</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}