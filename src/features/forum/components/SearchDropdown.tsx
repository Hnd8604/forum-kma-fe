import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { PostService } from '../services/post.service';
import { AuthService } from '../../auth/services/auth.service';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/components/ui/avatar';
import type { ApiPost } from '../types/post.types';
import type { User } from '../../auth/types/auth.types';

interface SearchDropdownProps {
    searchQuery: string;
    onClose: () => void;
    isOpen: boolean;
}

export default function SearchDropdown({ searchQuery, onClose, isOpen }: SearchDropdownProps) {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<ApiPost[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Search posts and users when query changes
    useEffect(() => {
        const search = async () => {
            if (!searchQuery.trim()) {
                setPosts([]);
                setUsers([]);
                return;
            }

            setLoading(true);
            try {
                const query = searchQuery.toLowerCase().trim();

                // Search posts
                const postsResponse = await PostService.getFeed({
                    page: 0,
                    limit: 50,
                    search: searchQuery.trim()
                });

                // Filter posts that actually contain the keyword in title or content
                const filteredPosts = postsResponse.content.filter(post => {
                    const title = (post.title || '').toLowerCase();
                    const content = (post.content || '').toLowerCase();
                    return title.includes(query) || content.includes(query);
                });

                setPosts(filteredPosts.slice(0, 10));

                // Search users
                try {
                    const usersResponse = await AuthService.getAllUsers(0, 50);
                    const filteredUsers = usersResponse.content.filter(user => {
                        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
                        const username = (user.username || '').toLowerCase();
                        return fullName.includes(query) || username.includes(query);
                    });
                    setUsers(filteredUsers.slice(0, 5));
                } catch (error) {
                    console.error('User search failed:', error);
                    setUsers([]);
                }
            } catch (error) {
                console.error('Search failed:', error);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handlePostClick = (postId: string) => {
        onClose();
        // Navigate to post detail page with proper URL
        window.history.pushState({}, '', `/forum/post/${postId}`);
        window.dispatchEvent(new CustomEvent('open-post-modal', { detail: { postId } }));
    };

    const handleUserClick = (userId: string) => {
        onClose();
        navigate(`/profile/${userId}`);
    };

    if (!isOpen || !searchQuery.trim()) {
        return null;
    }

    const hasResults = posts.length > 0 || users.length > 0;

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden z-[100]"
        >
            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
            )}

            {/* Results */}
            {!loading && hasResults && (
                <div className="max-h-96 overflow-y-auto">
                    {/* Users Section */}
                    {users.length > 0 && (
                        <div className="py-2">
                            <div className="px-4 py-2">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                    NGƯỜI DÙNG
                                </span>
                            </div>
                            {users.map((user) => {
                                const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Người dùng';
                                return (
                                    <div
                                        key={user.userId}
                                        onClick={() => handleUserClick(user.userId)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/60 cursor-pointer transition-colors"
                                    >
                                        <Avatar className="h-10 w-10 flex-shrink-0">
                                            <AvatarImage src={user.avatarUrl} alt={displayName} />
                                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm">
                                                {displayName.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm line-clamp-1">
                                                {highlightMatch(displayName, searchQuery)}
                                            </p>
                                            {user.username && (
                                                <p className="text-slate-400 text-xs mt-0.5">
                                                    @{user.username}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Posts Section */}
                    {posts.length > 0 && (
                        <div className="py-2 border-t border-slate-700/50">
                            <div className="px-4 py-2">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                    BÀI VIẾT
                                </span>
                            </div>
                            {posts.map((post) => {
                                const postImage = post.resourceUrls && post.resourceUrls.length > 0 && post.type === 'IMAGE'
                                    ? post.resourceUrls[0]
                                    : null;

                                const getSnippet = () => {
                                    const query = searchQuery.toLowerCase().trim();
                                    const content = post.content || '';
                                    const lowerContent = content.toLowerCase();

                                    if (lowerContent.includes(query)) {
                                        const pos = lowerContent.indexOf(query);
                                        const start = Math.max(0, pos - 20);
                                        const end = Math.min(content.length, pos + query.length + 40);
                                        let snippet = content.substring(start, end);
                                        if (start > 0) snippet = '...' + snippet;
                                        if (end < content.length) snippet = snippet + '...';
                                        return snippet;
                                    }
                                    return content.substring(0, 60) + (content.length > 60 ? '...' : '');
                                };

                                return (
                                    <div
                                        key={post.postId}
                                        onClick={() => handlePostClick(post.postId)}
                                        className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/60 cursor-pointer transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden bg-slate-700">
                                            {postImage ? (
                                                <img src={postImage} alt={post.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                                                    <span className="text-white text-lg">📝</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm line-clamp-1">
                                                {highlightMatch(post.title || 'Bài viết', searchQuery)}
                                            </p>
                                            <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">
                                                {highlightMatch(getSnippet(), searchQuery)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* No Results */}
            {!loading && !hasResults && searchQuery.trim() && (
                <div className="flex flex-col items-center justify-center py-8">
                    <Search className="w-8 h-8 text-slate-500 mb-2" />
                    <p className="text-slate-400 text-sm">Không tìm thấy kết quả</p>
                    <p className="text-slate-500 text-xs mt-1">Thử từ khóa khác</p>
                </div>
            )}
        </div>
    );
}

// Helper function to highlight matching text
function highlightMatch(text: string, query: string): React.ReactNode {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
        regex.test(part) ? (
            <span key={index} className="text-blue-400 font-semibold">{part}</span>
        ) : (
            part
        )
    );
}

// Helper to escape special regex characters
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
