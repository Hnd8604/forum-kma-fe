# 🎓 AutoLux - Frontend

Ứng dụng Frontend cho hệ thống **Diễn đàn Sinh viên KMA** (Học viện Kỹ thuật Mật mã), được xây dựng bằng **React**, **TypeScript** và **Vite**. Hỗ trợ đa nền tảng: Web, Desktop (Tauri) và Mobile (Android).

---

## 🚀 Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| **Framework** | React 18.3.1 |
| **Language** | TypeScript 5.3.2 |
| **Build Tool** | Vite 6.3.5 |
| **Desktop/Mobile** | Tauri 2.x |
| **Styling** | TailwindCSS 3.4.7 |
| **State Management** | Zustand 5.0.8, Redux Toolkit |
| **HTTP Client** | Axios 1.13.2 |
| **Routing** | React Router DOM 6.14.1 |
| **UI Components** | Shadcn/ui (Radix UI) |
| **Icons** | Lucide React |
| **Charts** | Recharts 2.15.2 |
| **Form Handling** | React Hook Form 7.55.0 |
| **Internationalization** | i18next |

---

## 📁 Cấu trúc thư mục

```
autolux-fe/
├── src/
│   ├── api/                    # Cấu hình API
│   │   ├── api.service.ts      # Service xử lý API chung
│   │   ├── axios.ts            # Cấu hình Axios instance
│   │   └── endpoints.ts        # Định nghĩa API endpoints
│   │
│   ├── components/             # Components dùng chung
│   │   └── ui/                 # Shadcn/ui components (50+ components)
│   │
│   ├── features/               # Các tính năng (Feature-based architecture)
│   │   ├── admin/              # Quản trị viên
│   │   │   ├── components/     # Dashboard, User/Post/Group/Role Management
│   │   │   └── services/       # Admin API services
│   │   │
│   │   ├── auth/               # Xác thực người dùng
│   │   │   ├── components/     # Login, Register, Settings, 2FA
│   │   │   └── services/       # Auth API services
│   │   │
│   │   ├── posts/              # Bài viết
│   │   │   ├── components/     # PostCard, CreatePostDialog, PostDetail
│   │   │   ├── hooks/          # Custom hooks cho posts
│   │   │   └── services/       # Post API services
│   │   │
│   │   ├── comments/           # Bình luận
│   │   │   ├── components/     # CommentSection, CommentItem
│   │   │   └── services/       # Comment API services
│   │   │
│   │   ├── reactions/          # Reactions (Like, Love, Haha, Wow, Sad, Angry)
│   │   │   ├── components/     # ReactionButton, ReactionPicker
│   │   │   └── services/       # Reaction API services
│   │   │
│   │   ├── groups/             # Danh mục bài viết
│   │   │   ├── components/     # GroupsPage, GroupPage, CreateGroupDialog
│   │   │   └── services/       # Group API services
│   │   │
│   │   ├── chat/               # Nhắn tin
│   │   │   ├── components/     # ChatPage, ChatWindow, ChatContainer
│   │   │   └── services/       # Chat API services
│   │   │
│   │   ├── friends/            # Quản lý bạn bè
│   │   │   ├── components/     # FriendsPage, FriendsList, FriendButton
│   │   │   └── services/       # Friendship API services
│   │   │
│   │   ├── notifications/      # Thông báo real-time
│   │   │   ├── components/     # Notifications dropdown
│   │   │   └── services/       # Notification API services
│   │   │
│   │   ├── profile/            # Trang cá nhân
│   │   │   └── components/     # ProfilePage
│   │   │
│   │   └── chatbot/            # Tích hợp Chatbot (Rasa)
│   │
│   ├── layouts/                # Layout components
│   │   ├── forum/              # Layout cho diễn đàn
│   │   │   ├── MainForum.tsx   # Layout chính
│   │   │   ├── ForumHeader.tsx # Header với search, notifications
│   │   │   ├── Sidebar.tsx     # Sidebar navigation
│   │   │   └── SearchDropdown.tsx
│   │   │
│   │   ├── AdminLayout.tsx     # Layout cho trang admin
│   │   ├── AppLayout.tsx       # Layout wrapper
│   │   └── MainAppLayout.tsx   # Layout ứng dụng chính
│   │
│   ├── interfaces/             # TypeScript type definitions
│   │
│   ├── store/                  # Zustand state management
│   │   └── useStore.ts         # Auth store & global state
│   │
│   ├── routes/                 # Cấu hình routing
│   │   └── AppRouter.tsx
│   │
│   ├── locales/                # File ngôn ngữ (i18n)
│   │   ├── en/                 # English
│   │   └── vi/                 # Tiếng Việt
│   │
│   ├── lib/                    # Thư viện tiện ích
│   ├── styles/                 # Global styles
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── i18n.ts                 # Cấu hình i18next
│
├── src-tauri/                  # Tauri configuration (Desktop/Mobile)
├── assets/                     # Tài nguyên tĩnh
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tailwind.config.cjs         # TailwindCSS configuration
└── package.json
```

---

## 🔧 Cài đặt và Chạy

### Yêu cầu hệ thống

- **Node.js** >= 18.x
- **npm** hoặc **yarn**
- **Rust** (cho Tauri desktop/mobile build)

### Cài đặt dependencies

```bash
npm install
```

### Cấu hình môi trường

Tạo file `.env` với nội dung:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Chatbot Configuration (Optional)
VITE_CHAT_BOT_URL=http://localhost:5005/webhooks/rest/webhook
```

### Các lệnh chạy

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy web development server |
| `npm run dev:tauri` | Chạy desktop app (Tauri) |
| `npm run dev:android` | Chạy mobile app (Android) |
| `npm run build` | Build web production |
| `npm run build:tauri` | Build desktop app |
| `npm run build:android:apk` | Build Android APK |
| `npm run preview` | Preview production build |

Ứng dụng web sẽ chạy tại: `http://localhost:5173`

---

## 📱 Các tính năng chính

### 1. 🔐 Xác thực người dùng
- Đăng nhập / Đăng ký
- Xác thực hai yếu tố (2FA)
- Quản lý profile & cài đặt tài khoản
- Đăng xuất (với session management)

### 2. 📝 Diễn đàn
- Xem danh sách bài viết
- Tạo bài viết mới (với hình ảnh/video)
- Bình luận và phản hồi đa cấp
- Reactions: 👍 Like, ❤️ Love, 😂 Haha, 😮 Wow, 😢 Sad, 😠 Angry
- Sắp xếp: Tất cả, Mới nhất, Phổ biến

### 3. 📂 Danh mục bài viết (Groups)
- Xem danh sách danh mục
- Tham gia / Rời danh mục
- Đăng bài trong danh mục

### 4. 💬 Nhắn tin (Chat)
- Chat 1-1
- Chat nhóm
- Gửi hình ảnh / video / file
- Thông báo tin nhắn mới (WebSocket real-time)

### 5. 👥 Bạn bè
- Tìm kiếm người dùng
- Gửi / Chấp nhận / Từ chối lời mời kết bạn
- Danh sách bạn bè

### 6. 🔔 Thông báo
- Thông báo real-time qua WebSocket
- Thông báo: bình luận, reactions, lời mời kết bạn, tin nhắn mới

### 7. 🛡️ Quản trị (Admin)
- Dashboard thống kê
- Quản lý người dùng
- Quản lý bài viết
- Quản lý danh mục
- Quản lý vai trò (roles)
- Xử lý báo cáo (reports)

### 8. 🤖 Chatbot (Tùy chọn)
- Tích hợp Rasa chatbot
- Hỗ trợ trả lời tự động

---

## 🛣️ Routes

### Public Routes (Không cần đăng nhập)

| Route | Mô tả |
|-------|-------|
| `/login` | Trang đăng nhập |
| `/register` | Trang đăng ký |

### Protected Routes (Yêu cầu đăng nhập)

| Route | Mô tả |
|-------|-------|
| `/forum` | Trang chính diễn đàn |
| `/forum/group/:groupId` | Trang danh mục |
| `/profile` | Trang cá nhân |
| `/profile/:userId` | Xem profile người khác |
| `/settings` | Cài đặt tài khoản |
| `/friends` | Quản lý bạn bè |
| `/groups` | Danh sách danh mục |
| `/chat` | Trang nhắn tin |

### Admin Routes (Yêu cầu quyền Admin)

| Route | Mô tả |
|-------|-------|
| `/admin` | Dashboard quản trị |
| `/admin/users` | Quản lý người dùng |
| `/admin/posts` | Quản lý bài viết |
| `/admin/groups` | Quản lý danh mục |
| `/admin/roles` | Quản lý vai trò |
| `/admin/reports` | Quản lý báo cáo |

---

## 🎨 UI Components

Dự án sử dụng **Shadcn/ui** - bộ UI components được xây dựng trên Radix UI:

- **Layout:** Accordion, Card, Carousel, Collapsible, Separator, Sheet, Tabs
- **Form:** Button, Checkbox, Input, Label, Radio Group, Select, Slider, Switch, Textarea
- **Feedback:** Alert, Dialog, Popover, Progress, Skeleton, Toast, Tooltip
- **Display:** Avatar, Badge, Calendar, Table
- **Navigation:** Dropdown Menu, Menubar, Navigation Menu, Context Menu

---

## 🔌 Tích hợp Backend

Frontend kết nối với **Backend Microservices** thông qua:

### 1. REST API
- Axios với interceptors cho authentication
- Tự động refresh token

### 2. WebSocket
- Real-time notifications
- Real-time chat messages

### API Gateway Endpoints

| Endpoint | Mô tả |
|----------|-------|
| `/api/v1/auth` | Xác thực (Auth Service) |
| `/api/v1/users` | Quản lý người dùng |
| `/api/v1/posts` | Bài viết (Post Service) |
| `/api/v1/comments` | Bình luận |
| `/api/v1/groups` | Danh mục |
| `/api/v1/friendships` | Bạn bè |
| `/api/v1/chat` | Nhắn tin (Chat Service) |
| `/api/v1/notifications` | Thông báo (Notification Service) |
| `/api/v1/files` | Upload files (File Service) |

---

## 🏗️ Backend Architecture

Frontend kết nối với hệ thống **Microservices Reactive** bao gồm:

| Service | Port | Mô tả |
|---------|------|-------|
| API Gateway | 8080 | Định tuyến & xác thực JWT |
| Eureka Server | 8761 | Service Discovery |
| Auth Service | 8081 | Quản lý user, RBAC, token |
| ACL Service | 8181 | Quản lý quyền chi tiết |
| Post Service | 8085 | Bài viết, bình luận, reactions |
| Chat Service | 8095 | Nhắn tin |
| Notification Service | 8090 | Thông báo |
| File Service | 8100 | Upload/download files |
| Chatbot Service | 8105 | Rasa chatbot |

---

## � Multi-platform Builds

### Web
```bash
npm run build
```

### Desktop (Windows/macOS/Linux)
```bash
npm run build:tauri
# hoặc cho Windows cụ thể:
npm run build:tauri:windows
```

### Mobile (Android)
```bash
npm run build:android:apk
```

---

## 🌐 Đa ngôn ngữ (i18n)

Ứng dụng hỗ trợ đa ngôn ngữ:
- 🇻🇳 **Tiếng Việt** (mặc định)
- 🇺🇸 **English**

Các file ngôn ngữ nằm trong thư mục `src/locales/`.

---

## �📄 License

Dự án này được phát triển cho mục đích học tập tại **Học viện Kỹ thuật Mật mã (KMA)**.

---

## 👥 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

---

## 📞 Liên hệ

- **Trường:** Học viện Kỹ thuật Mật mã (KMA)
- **Website:** [https://actvn.edu.vn](https://actvn.edu.vn)# autolux-fe
