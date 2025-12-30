import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import type { ReactionType } from '../types/post.types';

interface ReactionPickerProps {
  currentReaction?: ReactionType | null;
  reactionCount: number;
  onReact: (type: ReactionType) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

// Facebook-style emoji reactions
const REACTIONS: { type: ReactionType; emoji: string; label: string; color: string; hoverBg: string }[] = [
  { type: 'LIKE', emoji: '👍', label: 'Thích', color: 'text-blue-600', hoverBg: 'hover:bg-blue-50' },
  { type: 'LOVE', emoji: '❤️', label: 'Yêu thích', color: 'text-red-500', hoverBg: 'hover:bg-red-50' },
  { type: 'HAHA', emoji: '😆', label: 'Haha', color: 'text-amber-500', hoverBg: 'hover:bg-amber-50' },
  { type: 'WOW', emoji: '😮', label: 'Wow', color: 'text-amber-500', hoverBg: 'hover:bg-amber-50' },
  { type: 'SAD', emoji: '😢', label: 'Buồn', color: 'text-amber-500', hoverBg: 'hover:bg-amber-50' },
  { type: 'ANGRY', emoji: '😠', label: 'Phẫn nộ', color: 'text-orange-500', hoverBg: 'hover:bg-orange-50' },
];

export default function ReactionPicker({
  currentReaction,
  reactionCount,
  onReact,
  disabled = false,
  size = 'md',
}: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const currentReactionData = currentReaction
    ? REACTIONS.find((r) => r.type === currentReaction)
    : null;

  const emojiSize = size === 'sm' ? 'text-base' : 'text-lg';
  const buttonPadding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="relative">
      {/* Main Button - Shows current reaction or default */}
      <button
        onMouseEnter={() => setShowPicker(true)}
        onMouseLeave={() => setShowPicker(false)}
        onClick={() => onReact(currentReaction || 'LIKE')}
        disabled={disabled}
        className={`flex items-center gap-1.5 ${buttonPadding} rounded-full transition-all duration-200 ${
          currentReaction
            ? `${currentReactionData?.hoverBg} ${currentReactionData?.color}`
            : 'text-slate-500 hover:bg-slate-100'
        } disabled:opacity-50`}
      >
        {currentReactionData ? (
          <>
            <span className={emojiSize}>{currentReactionData.emoji}</span>
            <span className={`font-medium ${textSize}`}>{currentReactionData.label}</span>
          </>
        ) : (
          <>
            <ThumbsUp className="w-4 h-4" />
            <span className={`font-medium ${textSize}`}>Thích</span>
          </>
        )}
        {reactionCount > 0 && (
          <span className={`${textSize} font-semibold text-slate-600 ml-0.5`}>
            {reactionCount}
          </span>
        )}
      </button>

      {/* Reaction Picker Popup - Facebook style */}
      {showPicker && (
        <div
          onMouseEnter={() => setShowPicker(true)}
          onMouseLeave={() => setShowPicker(false)}
          className="absolute bottom-full left-0 mb-2 z-50"
        >
          <div className="bg-white rounded-full shadow-2xl border border-slate-100 px-2 py-1.5 flex items-center gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {REACTIONS.map((reaction, index) => {
              const isActive = currentReaction === reaction.type;
              return (
                <button
                  key={reaction.type}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReact(reaction.type);
                    setShowPicker(false);
                  }}
                  disabled={disabled}
                  title={reaction.label}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className={`p-1.5 rounded-full transition-all duration-200 hover:scale-150 hover:-translate-y-2 ${
                    isActive ? 'scale-125 -translate-y-1' : ''
                  } disabled:opacity-50 animate-in zoom-in-50`}
                >
                  <span className="text-2xl block">{reaction.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
