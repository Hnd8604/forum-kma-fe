# Cấu trúc dự án - Feature-Based Architecture

## 📁 Tổng quan cấu trúc

```
src/
├── features/              # Các tính năng chính của ứng dụng
│   ├── auth/             # Authentication feature
│   │   ├── components/   # Components liên quan đến xác thực
│   │   │   └── LoginPage.tsx
│   │   └── index.ts      # Export chính của feature
│   │
│   ├── forum/            # Forum feature
│   │   ├── components/   # Components liên quan đến forum
│   │   │   ├── MainForum.tsx
│   │   │   ├── ForumFeed.tsx
│   │   │   ├── CreatePost.tsx
│   │   │   ├── PostCard.tsx
│   │   │   └── Sidebar.tsx
│   │   └── index.ts      # Export chính của feature
│   │
│   └── chat/             # Chat/Messenger feature
│       ├── components/   # Components liên quan đến chat
│       │   └── ChatMessenger.tsx
│       └── index.ts      # Export chính của feature
│
├── shared/               # Shared resources (dùng chung)
│   ├── components/       # Shared components
│   │   ├── ui/          # UI components từ shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ... (các UI components khác)
│   │   └── figma/       # Components từ Figma
│   │       └── ImageWithFallback.tsx
│   └── index.ts         # Export các shared resources
│
├── store/               # State management (Zustand)
│   └── useStore.ts
│
├── routes/              # Routing configuration
│   └── AppRouter.tsx
│
├── locales/             # Internationalization
│   ├── en.json
│   └── vi.json
│
├── guidelines/          # Documentation
│   └── Guidelines.md
│
└── styles/             # Global styles
    ├── globals.css
    └── tailwind.css
```

## 🎯 Nguyên tắc tổ chức

### 1. **Feature-based organization**
- Mỗi feature (tính năng) là một module độc lập
- Chứa tất cả components, logic liên quan đến feature đó
- Dễ dàng mở rộng và bảo trì

### 2. **Shared resources**
- UI components dùng chung nằm trong `shared/components/ui/`
- Utilities và helpers dùng chung nằm trong `shared/`
- Tránh duplicate code

### 3. **Import paths**
Ví dụ import từ các feature:
```typescript
// Từ feature khác import feature
import { LoginPage } from '../features/auth';
import { MainForum } from '../features/forum';

// Import shared components
import { Button } from '../shared/components/ui/button';
import { Card } from '../shared/components/ui/card';
```

## 🔄 Mở rộng dự án

### Thêm feature mới:
1. Tạo thư mục trong `src/features/tên-feature/`
2. Tạo `components/` cho các React components
3. Tạo `index.ts` để export các components chính
4. Có thể thêm: `hooks/`, `utils/`, `types/`, `api/` nếu cần

### Thêm shared component:
1. Thêm vào `src/shared/components/`
2. Export trong `src/shared/index.ts` nếu cần dùng nhiều nơi

## 📦 Features hiện tại

### Auth Feature
- **LoginPage**: Trang đăng nhập/đăng ký với tab UI

### Forum Feature
- **MainForum**: Layout chính của forum với header và navigation
- **ForumFeed**: Feed hiển thị các bài viết
- **CreatePost**: Form tạo bài viết mới
- **PostCard**: Card hiển thị từng bài viết
- **Sidebar**: Sidebar với danh sách groups/categories

### Chat Feature
- **ChatMessenger**: Popup messenger để chat với người dùng

## 🛠️ Benefits

✅ **Scalability**: Dễ dàng thêm features mới không ảnh hưởng code cũ  
✅ **Maintainability**: Code được tổ chức rõ ràng theo tính năng  
✅ **Reusability**: Shared components có thể dùng lại ở nhiều nơi  
✅ **Team collaboration**: Nhiều người có thể làm việc trên các features khác nhau  
✅ **Testing**: Dễ dàng test từng feature độc lập  

## 🚀 Next Steps

- Thêm `types/` folder cho TypeScript interfaces/types
- Thêm `api/` folder cho API calls
- Thêm `hooks/` folder cho custom hooks
- Thêm `utils/` folder cho helper functions
- Thêm `constants/` folder cho các hằng số
