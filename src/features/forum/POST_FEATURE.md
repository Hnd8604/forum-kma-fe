# Hướng dẫn sử dụng chức năng đăng bài

## 🎯 Tổng quan

Chức năng đăng bài cho phép người dùng tạo và chia sẻ bài viết với cộng đồng Forum Sinh Viên.

## ✨ Tính năng chính

### 1. **Tạo bài viết**
- **Tiêu đề**: Bắt buộc - Tóm tắt ngắn gọn nội dung bài viết
- **Nhóm**: Tùy chọn - Chọn nhóm/chuyên ngành phù hợp
- **Nội dung**: Bắt buộc - Nội dung chi tiết của bài viết
- **Đính kèm**: Hình ảnh, link, emoji (UI ready)

### 2. **Quản lý bài viết**
- Hiển thị ngay lập tức sau khi đăng
- Lưu trữ trong global state (Zustand)
- Tự động cập nhật thời gian tương đối
- Upvote/downvote bài viết

### 3. **Sắp xếp bài viết**
- **Nổi bật (Hot)**: Thuật toán dựa trên upvotes và thời gian
- **Mới nhất (New)**: Sắp xếp theo thời gian đăng
- **Top**: Sắp xếp theo số lượng upvotes

## 🏗️ Kiến trúc

### State Management (Zustand)

```typescript
// Store: src/store/useStore.ts

// Auth Store - Quản lý thông tin người dùng
export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  login: () => set({ isLoggedIn: true, user: {...} }),
  logout: () => set({ isLoggedIn: false, user: null }),
}));

// Posts Store - Quản lý bài viết
export const usePostsStore = create<PostsState>((set) => ({
  posts: [...],
  addPost: (postData) => {...},    // Thêm bài viết mới
  toggleUpvote: (id) => {...},      // Toggle upvote
  updatePost: (id, data) => {...},  // Cập nhật bài viết
  deletePost: (id) => {...},        // Xóa bài viết
}));
```

### Components

#### CreatePost
```typescript
// src/features/forum/components/CreatePost.tsx
// Component để tạo bài viết mới

- Collapsed state: Hiển thị input placeholder
- Expanded state: Form đầy đủ với title, group, content
- Validation: Yêu cầu title và content không rỗng
- Auto-close sau khi đăng thành công
```

#### ForumFeed
```typescript
// src/features/forum/components/ForumFeed.tsx
// Component hiển thị danh sách bài viết

- Lấy posts từ store
- Sắp xếp theo tab (Hot/New/Top)
- Render CreatePost và danh sách PostCard
- Empty state khi chưa có bài viết
```

#### PostCard
```typescript
// src/features/forum/components/PostCard.tsx
// Component hiển thị từng bài viết

- Thông tin tác giả (avatar, tên, nhóm)
- Thời gian đăng (relative time)
- Tiêu đề và nội dung
- Actions: Upvote, Comment, Share, Bookmark
```

### Types
```typescript
// src/features/forum/types/post.types.ts

export interface Post {
  id: number;
  author: { name: string; avatar: string; group: string };
  timeAgo: string;
  timestamp: number;  // Unix timestamp
  title: string;
  content: string;
  image?: boolean;
  upvotes: number;
  comments: number;
  hasUpvoted: boolean;
}

export interface CreatePostData {
  title: string;
  content: string;
  group?: string;
  image?: string;
}
```

## 📝 Flow đăng bài

```
1. User click vào input placeholder
   ↓
2. Form mở rộng (expanded state)
   ↓
3. User nhập:
   - Tiêu đề (bắt buộc)
   - Chọn nhóm (tùy chọn)
   - Nội dung (bắt buộc)
   ↓
4. Click "Đăng bài"
   ↓
5. Validation: Check title && content
   ↓
6. addPost() được gọi từ store
   ↓
7. Post mới được thêm vào đầu mảng posts
   ↓
8. UI tự động re-render
   ↓
9. Form reset và collapse
```

## 🎨 UI/UX Features

### Responsive Design
- Form collapse/expand animation
- Smooth transitions
- Hover effects
- Focus states với red theme

### Validation
- Button "Đăng bài" disabled khi thiếu thông tin
- Visual feedback khi focus input
- Clear form sau khi submit

### Real-time Updates
- Bài viết xuất hiện ngay lập tức
- Thời gian tự động cập nhật
- Upvote counter real-time

## 🔄 Hot Algorithm

Thuật toán sắp xếp "Nổi bật":

```typescript
score = upvotes / (hours_since_post + 2)^1.5
```

- Bài mới với nhiều upvotes được ưu tiên
- Bài cũ dần giảm ranking
- Tránh bài viết zero-hour có score vô hạn

## 📊 Mock Data

Có sẵn 5 bài viết mẫu để test:
- Khoa học Máy tính
- Kinh tế & Quản trị
- Nghệ thuật & Thiết kế
- Ngôn ngữ
- Thể thao & Sức khỏe

## 🚀 Cách sử dụng

### 1. Import Store
```typescript
import { usePostsStore, useAuthStore } from '@/store/useStore';
```

### 2. Tạo bài viết
```typescript
const addPost = usePostsStore(state => state.addPost);

addPost({
  title: 'Tiêu đề bài viết',
  content: 'Nội dung chi tiết...',
  group: 'Khoa học Máy tính',  // optional
});
```

### 3. Hiển thị bài viết
```typescript
const posts = usePostsStore(state => state.posts);

posts.map(post => (
  <PostCard key={post.id} post={post} />
))
```

### 4. Toggle upvote
```typescript
const toggleUpvote = usePostsStore(state => state.toggleUpvote);

toggleUpvote(postId);
```

## 🎯 Tính năng mở rộng (TODO)

- [ ] Upload ảnh thực sự
- [ ] Thêm link/video
- [ ] Rich text editor
- [ ] Emoji picker
- [ ] Draft auto-save
- [ ] Edit/Delete bài viết
- [ ] Hashtags
- [ ] Mentions (@user)
- [ ] Post analytics
- [ ] Report/Flag post
- [ ] Pin post
- [ ] Featured posts
- [ ] Post scheduling

## 🛠️ Technical Details

### Performance
- useMemo cho sorted posts
- Zustand state management (minimal re-renders)
- Lazy loading images (if needed)

### Accessibility
- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader support

### Security (TODO)
- Input sanitization
- XSS prevention
- Rate limiting
- Content moderation

## 📚 Related Files

```
src/
├── features/forum/
│   ├── components/
│   │   ├── CreatePost.tsx      # Form tạo bài
│   │   ├── ForumFeed.tsx       # List bài viết
│   │   └── PostCard.tsx        # Card từng bài
│   └── types/
│       └── post.types.ts       # TypeScript types
├── store/
│   └── useStore.ts             # Zustand stores
└── shared/
    └── hooks/
        └── useTime.ts          # Time formatting hooks
```

## 🐛 Debugging

### Không thấy bài viết mới?
- Check store: `usePostsStore.getState().posts`
- Verify user logged in: `useAuthStore.getState().isLoggedIn`
- Check console errors

### Form không submit?
- Kiểm tra title và content không rỗng
- Check validation logic
- Verify store connection

### Thời gian hiển thị sai?
- Check timestamp generation
- Verify useRelativeTime hook
- Test với different timestamps
