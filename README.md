# 🌸 Hanabi - Ứng dụng học tiếng Nhật

Hanabi là một ứng dụng web hiện đại được xây dựng bằng Next.js, giúp người dùng học tiếng Nhật thông qua các tính năng tương tác như flashcards, video call, chat và cộng đồng học tập.

## 🚀 Cài đặt và Chạy ứng dụng

### Yêu cầu hệ thống
- **Node.js**: >= 22.0.0
- **npm** hoặc **yarn** hoặc **pnpm**
- **Git**

### Các bước cài đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/HuyBrox/Hanabi_test.git
   cd Hanabi
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   # hoặc
   yarn install
   # hoặc
   pnpm install
   ```

3. **Khởi chạy development server**
   ```bash
   npm run dev
   # hoặc
   yarn dev
   # hoặc
   pnpm dev
   ```

4. **Mở trình duyệt và truy cập**
   ```
   http://localhost:3000
   ```

### Các lệnh khác

- **Build production**: `npm run build`
- **Start production server**: `npm run start`
- **Lint code**: `npm run lint`

## 📁 Cấu trúc thư mục

```
Hanabi/
├── public/                 # Tài nguyên tĩnh
│   ├── assets/
│   │   ├── audio/         # File âm thanh
│   │   ├── fonts/         # Font chữ
│   │   └── videos/        # File video
│   └── images/            # Hình ảnh
│       ├── avatars/       # Avatar người dùng
│       ├── backgrounds/   # Hình nền
│       ├── japanese/      # Hình ảnh tiếng Nhật
│       ├── logos/         # Logo
│       └── placeholders/  # Hình placeholder
│
├── src/                   # Mã nguồn
│   ├── app/              # App Router Next.js
│   │   ├── (auth)/       # Nhóm auth (login, register)
│   │   ├── @auth/        # Modal auth
│   │   ├── call/         # Video call
│   │   ├── community/    # Cộng đồng
│   │   ├── courses/      # Khóa học
│   │   ├── flashcards/   # Flashcard
│   │   ├── messages/     # Chat/Tin nhắn
│   │   └── profile/      # Trang cá nhân
│   │
│   ├── components/       # React Components
│   │   ├── ui/          # UI Components (shadcn/ui)
│   │   └── video-call/  # Components video call
│   │
│   ├── api/             # API setup
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utils & configs
│   ├── store/           # Redux store
│   └── styles/          # CSS files
│
├── components.json      # shadcn/ui config
├── eslint.config.js    # ESLint config
├── next.config.mjs     # Next.js config
├── package.json        # Dependencies
├── postcss.config.mjs  # PostCSS config
├── tailwind.config.ts  # Tailwind config
└── tsconfig.json       # TypeScript config
```

## 🛠️ Công nghệ sử dụng

### Frontend Framework
- **Next.js 15.5.2** - React framework với App Router
- **React 19** - Library UI
- **TypeScript 5** - Superset của JavaScript

### UI/UX
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **shadcn/ui** - Bộ component UI đẹp và accessible
- **Radix UI** - Primitives cho component UI
- **Lucide React** - Icon library
- **next-themes** - Dark/Light mode

### State Management
- **Redux Toolkit** - State management
- **React Redux** - React bindings cho Redux

### Form & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **@hookform/resolvers** - Resolvers cho validation

### HTTP Client
- **Axios** - HTTP client cho API calls

### Styling & Animation
- **tailwindcss-animate** - Animation utilities
- **class-variance-authority** - Variant-based styling
- **clsx** & **tailwind-merge** - Conditional class names

### Other Libraries
- **date-fns** - Date manipulation
- **recharts** - Charts library
- **sonner** - Toast notifications
- **cmdk** - Command palette
- **embla-carousel-react** - Carousel component

## 📱 Tính năng chính

- **🔐 Xác thực**: Đăng nhập/Đăng ký với modal và page
- **📚 Học từ vựng**: Flashcards tương tác
- **🎓 Khóa học**: Các khóa học tiếng Nhật có cấu trúc
- **👥 Cộng đồng**: Tương tác với cộng đồng học viên
- **💬 Chat**: Tin nhắn real-time
- **📞 Video Call**: Gọi video để luyện nói
- **📱 Responsive**: Tối ưu cho mobile và desktop
- **🌙 Dark Mode**: Hỗ trợ chế độ tối/sáng
- **🌐 Đa ngôn ngữ**: Chuyển đổi giữa tiếng Việt và tiếng Nhật

## 🔧 Cấu hình

Các file cấu hình quan trọng:
- `next.config.mjs` - Cấu hình Next.js
- `tailwind.config.ts` - Cấu hình Tailwind CSS
- `tsconfig.json` - Cấu hình TypeScript
- `eslint.config.js` - Cấu hình ESLint
- `components.json` - Cấu hình shadcn/ui

## 🚀 Deployment

Ứng dụng có thể được deploy lên:
- **Vercel** (khuyến nghị cho Next.js)
- **Netlify**
- **AWS Amplify**
- **Railway**

Lệnh build production:
```bash
npm run build && npm run start
```

## 📝 Đóng góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Tạo Pull Request

## 📄 License

Dự án này được phát hành dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 👨‍💻 Tác giả

**HuyBrox** - [GitHub](https://github.com/HuyBrox)

## 🙏 Lời cảm ơn

- **shadcn/ui** cho bộ component UI tuyệt vời
- **Vercel** cho Next.js framework
- **Tailwind CSS** cho utility CSS
- Cộng đồng open source đã đóng góp các thư viện
