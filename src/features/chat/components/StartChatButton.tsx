import { useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { startChatWithUser } from '../utils/chatActions';
import { AuthService } from '../../auth/services/auth.service';

interface StartChatButtonProps {
    userId: string;
    userName?: string;
    userAvatar?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showIcon?: boolean;
    children?: React.ReactNode;
}

export default function StartChatButton({
    userId,
    userName,
    userAvatar,
    variant = 'default',
    size = 'default',
    className = '',
    showIcon = true,
    children,
}: StartChatButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleStartChat = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent parent click handlers
        console.log('🔵 StartChatButton clicked for userId:', userId);

        try {
            setLoading(true);

            // Get user info if not provided
            let displayName = userName;
            let avatar = userAvatar;

            if (!displayName) {
                console.log('📥 Fetching user info for:', userId);
                try {
                    const user = await AuthService.getUserById(userId);
                    displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
                    avatar = user.avatarUrl;
                    console.log('✅ User info fetched:', { displayName, avatar });
                } catch (error) {
                    console.error('Failed to fetch user info:', error);
                    displayName = 'Người dùng';
                }
            }

            // Trigger chat window to open
            console.log('🚀 Calling startChatWithUser:', { userId, displayName, avatar });
            startChatWithUser(userId, displayName || 'Người dùng', avatar);
        } catch (err) {
            console.error('Failed to start chat:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleStartChat}
            disabled={loading}
            className={className}
        >
            {showIcon && <MessageCircle className="w-4 h-4 mr-2" />}
            {children || (loading ? 'Đang mở...' : 'Nhắn tin')}
        </Button>
    );
}
