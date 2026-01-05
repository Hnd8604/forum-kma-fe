import { Link } from 'react-router-dom';
import { Image as ImageIcon, FileText } from 'lucide-react';
import type { PostType } from '@/interfaces/post.types';

interface PostHeaderProps {
    authorId: string;
    authorName: string;
    authorAvatarUrl: string | null;
    groupId?: string;
    groupName: string;
    timeAgo: string;
    postType: PostType;
}

export default function PostHeader({
    authorId,
    authorName,
    authorAvatarUrl,
    groupId,
    groupName,
    timeAgo,
    postType,
}: PostHeaderProps) {
    return (
        <div className="flex items-center text-sm text-slate-500 mb-3">
            <Link to={`/profile/${authorId}`} className="flex items-center group">
                {authorAvatarUrl ? (
                    <img
                        src={authorAvatarUrl}
                        alt={authorName || 'avatar'}
                        className="w-8 h-8 rounded-full object-cover mr-2.5 shadow-md group-hover:ring-2 group-hover:ring-blue-300 transition-all"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-2.5 shadow-md shadow-blue-500/20 group-hover:ring-2 group-hover:ring-blue-300 transition-all">
                        <span className="text-white text-xs font-bold">
                            {authorName?.[0]?.toUpperCase() || 'U'}
                        </span>
                    </div>
                )}
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {authorName || 'loading...'}
                        </span>
                        {groupName && groupId && (
                            <>
                                <span className="text-slate-400">•</span>
                                <Link
                                    to={`/forum/group/${groupId}`}
                                    className="text-slate-600 hover:text-blue-600 hover:underline transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {groupName}
                                </Link>
                            </>
                        )}
                    </div>
                    <span className="text-xs text-slate-400">{timeAgo}</span>
                </div>
            </Link>
            {postType !== 'TEXT' && (
                <span className="ml-auto flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-500">
                    {postType === 'IMAGE' ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {postType === 'IMAGE' ? 'Hình ảnh' : 'Tài liệu'}
                </span>
            )}
        </div>
    );
}
