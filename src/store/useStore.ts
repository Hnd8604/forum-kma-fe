import { create } from 'zustand';
import { Post, CreatePostData } from '../features/forum/types/post.types';

// Auth Store
type AuthState = {
    isLoggedIn: boolean;
    user: {
        name: string;
        avatar: string;
        group: string;
    } | null;
    login: () => void;
    logout: () => void;
    setUser: (user: { name: string; avatar: string; group: string }) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false,
    user: null,
    login: () => set({ 
        isLoggedIn: true,
        user: {
            name: 'Bạn',
            avatar: 'B',
            group: 'Khoa học Máy tính'
        }
    }),
    logout: () => set({ isLoggedIn: false, user: null }),
    setUser: (user) => set({ user }),
}));

// Posts Store
type PostsState = {
    posts: Post[];
    addPost: (postData: CreatePostData) => void;
    updatePost: (id: number, post: Partial<Post>) => void;
    deletePost: (id: number) => void;
    toggleUpvote: (id: number) => void;
};

const mockPosts: Post[] = [
    {
        id: 1,
        author: {
            name: 'Nguyễn Văn An',
            avatar: 'NA',
            group: 'Khoa học Máy tính',
        },
        timeAgo: '2 giờ trước',
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
        title: 'Làm thế nào để học hiệu quả thuật toán?',
        content: 'Mình đang gặp khó khăn với môn Cấu trúc dữ liệu và Giải thuật. Các bạn có thể chia sẻ kinh nghiệm học tập không? Mình nên bắt đầu từ đâu và tài liệu nào phù hợp cho người mới bắt đầu?',
        upvotes: 45,
        comments: 12,
        hasUpvoted: false,
    },
    {
        id: 2,
        author: {
            name: 'Trần Thị Bình',
            avatar: 'TB',
            group: 'Kinh tế & Quản trị',
        },
        timeAgo: '4 giờ trước',
        timestamp: Date.now() - 4 * 60 * 60 * 1000,
        title: 'Cơ hội thực tập tại các công ty lớn',
        content: 'Vừa nhận được offer thực tập từ 3 công ty. Các bạn có lời khuyên nào để chọn nơi thực tập phù hợp không? Nên ưu tiên môi trường học hỏi hay lương thực tập?',
        upvotes: 78,
        comments: 23,
        hasUpvoted: true,
    },
    {
        id: 3,
        author: {
            name: 'Lê Minh Cường',
            avatar: 'LC',
            group: 'Nghệ thuật & Thiết kế',
        },
        timeAgo: '6 giờ trước',
        timestamp: Date.now() - 6 * 60 * 60 * 1000,
        title: 'Share những tài liệu học UI/UX miễn phí',
        content: 'Mình tổng hợp một số tài liệu học UI/UX design miễn phí và chất lượng. Hy vọng sẽ hữu ích cho các bạn đang muốn tìm hiểu về lĩnh vực này!',
        image: true,
        upvotes: 156,
        comments: 34,
        hasUpvoted: false,
    },
    {
        id: 4,
        author: {
            name: 'Phạm Thu Hà',
            avatar: 'PH',
            group: 'Ngôn ngữ',
        },
        timeAgo: '8 giờ trước',
        timestamp: Date.now() - 8 * 60 * 60 * 1000,
        title: 'Tips luyện IELTS hiệu quả trong 3 tháng',
        content: 'Mình vừa đạt 7.5 IELTS sau 3 tháng tự học. Muốn chia sẻ một số phương pháp và lộ trình học mà mình đã áp dụng. Hi vọng sẽ giúp ích cho các bạn!',
        upvotes: 203,
        comments: 45,
        hasUpvoted: true,
    },
    {
        id: 5,
        author: {
            name: 'Hoàng Đức Duy',
            avatar: 'HD',
            group: 'Thể thao & Sức khỏe',
        },
        timeAgo: '10 giờ trước',
        timestamp: Date.now() - 10 * 60 * 60 * 1000,
        title: 'Lịch tập gym cho sinh viên bận rộn',
        content: 'Các bạn sinh viên vừa học vừa làm thêm có thể tham khảo lịch tập này. 3 buổi/tuần, mỗi buổi 45 phút, tập trung vào các bài tập compound movements.',
        upvotes: 92,
        comments: 18,
        hasUpvoted: false,
    },
];

export const usePostsStore = create<PostsState>((set, get) => ({
    posts: mockPosts,
    addPost: (postData: CreatePostData) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const newPost: Post = {
            id: Date.now(),
            author: {
                name: user.name,
                avatar: user.avatar,
                group: postData.group || user.group,
            },
            timeAgo: 'Vừa xong',
            timestamp: Date.now(),
            title: postData.title,
            content: postData.content,
            image: !!postData.image,
            upvotes: 0,
            comments: 0,
            hasUpvoted: false,
        };

        set((state) => ({
            posts: [newPost, ...state.posts],
        }));
    },
    updatePost: (id: number, updatedPost: Partial<Post>) => {
        set((state) => ({
            posts: state.posts.map((post) =>
                post.id === id ? { ...post, ...updatedPost } : post
            ),
        }));
    },
    deletePost: (id: number) => {
        set((state) => ({
            posts: state.posts.filter((post) => post.id !== id),
        }));
    },
    toggleUpvote: (id: number) => {
        set((state) => ({
            posts: state.posts.map((post) => {
                if (post.id === id) {
                    return {
                        ...post,
                        hasUpvoted: !post.hasUpvoted,
                        upvotes: post.hasUpvoted ? post.upvotes - 1 : post.upvotes + 1,
                    };
                }
                return post;
            }),
        }));
    },
}));
