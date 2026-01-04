/**
 * Constants cho Forum feature
 */

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    COMMENT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
} as const;

// Time intervals (in milliseconds)
export const TIME_INTERVALS = {
    FIVE_MINUTES: 5 * 60 * 1000,
    ONE_HOUR: 60 * 60 * 1000,
    ONE_DAY: 24 * 60 * 60 * 1000,
    ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
    ONE_YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

// Post types
export const POST_TYPES = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    DOC: 'DOC',
} as const;

// Post status
export const POST_STATUS = {
    ACTIVE: 'ACTIVE',
    HIDDEN: 'HIDDEN',
    DELETED: 'DELETED',
} as const;

// Reaction types với mapping
export const REACTION_CONFIG = {
    LIKE: { emoji: '👍', label: 'Thích', color: 'text-blue-600', hoverBg: 'hover:bg-blue-50' },
    LOVE: { emoji: '❤️', label: 'Yêu thích', color: 'text-red-500', hoverBg: 'hover:bg-red-50' },
    HAHA: { emoji: '😂', label: 'Haha', color: 'text-yellow-500', hoverBg: 'hover:bg-yellow-50' },
    WOW: { emoji: '😮', label: 'Wow', color: 'text-yellow-500', hoverBg: 'hover:bg-yellow-50' },
    SAD: { emoji: '😢', label: 'Buồn', color: 'text-yellow-500', hoverBg: 'hover:bg-yellow-50' },
    ANGRY: { emoji: '😡', label: 'Phẫn nộ', color: 'text-orange-500', hoverBg: 'hover:bg-orange-50' },
} as const;

// Sort options
export const SORT_OPTIONS = {
    ALL: { value: 'all', label: 'Tất cả', param: 'createdAt,DESC' },
    NEW: { value: 'new', label: 'Mới', param: 'createdAt,DESC' },
    POPULAR: { value: 'popular', label: 'Phổ biến', param: 'reactionCount,DESC' },
} as const;

// Group privacy
export const GROUP_PRIVACY = {
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
} as const;

// Member roles
export const MEMBER_ROLES = {
    ADMIN: 'ADMIN',
    MODERATOR: 'MODERATOR',
    MEMBER: 'MEMBER',
} as const;

// UI Constants
export const UI = {
    MAX_CONTENT_PREVIEW_LINES: 3,
    MAX_IMAGE_HEIGHT: 500,
    AVATAR_SIZE_SMALL: 32,
    AVATAR_SIZE_MEDIUM: 40,
    AVATAR_SIZE_LARGE: 64,
} as const;

// File types
export const FILE_TYPES = {
    IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    DOCUMENT_EXTENSIONS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
} as const;
