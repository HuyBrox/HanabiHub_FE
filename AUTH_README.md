# Authentication System Setup

## 📋 Tổng quan

Hệ thống authentication được triển khai với RTK Query và RTK Toolkit, bao gồm:

- ✅ Login/Logout với cookie-based authentication
- ✅ Auto refresh token khi expired
- ✅ Route protection cho các trang yêu cầu đăng nhập
- ✅ Guest route protection (chỉ cho user chưa login)
- ✅ Auth state management với Redux
- ✅ Auth status component cho navigation

## 🚀 Cách sử dụng

### 1. Login/Logout

```tsx
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const { login, logout, isLoading, error, isAuthenticated, user } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      email: 'user@example.com',
      password: 'password123'
    });

    if (result.success) {
      console.log('Login thành công:', result.user);
    } else {
      console.log('Login thất bại:', result.error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Xin chào, {user?.fullname}!</p>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      ) : (
        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### 2. Bảo vệ Route - Protected Routes

```tsx
import { ProtectedRoute, withAuth } from '@/components/auth';

// Cách 1: Sử dụng component wrapper
function ProfilePage() {
  return (
    <ProtectedRoute>
      <div>Trang profile chỉ dành cho user đã đăng nhập</div>
    </ProtectedRoute>
  );
}

// Cách 2: Sử dụng HOC (Higher Order Component)
function DashboardPage() {
  return <div>Dashboard content</div>;
}

export default withAuth(DashboardPage);

// Cách 3: Custom redirect
function SettingsPage() {
  return (
    <ProtectedRoute
      redirectTo="/login"
      fallback={<div>Đang kiểm tra đăng nhập...</div>}
    >
      <div>Settings page</div>
    </ProtectedRoute>
  );
}
```

### 3. Guest Routes (chỉ cho user chưa login)

```tsx
import { GuestRoute } from '@/components/auth';

function LoginPage() {
  return (
    <GuestRoute redirectTo="/dashboard">
      <div>Form đăng nhập</div>
    </GuestRoute>
  );
}
```

### 4. Auth Status Component

```tsx
import { AuthStatus } from '@/components/auth';

function Navbar() {
  return (
    <nav>
      <div>Logo</div>
      <AuthStatus /> {/* Hiển thị login button hoặc user menu */}
    </nav>
  );
}
```

## 🔧 API Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

**Lưu ý:** Sử dụng `NEXT_PUBLIC_` prefix để environment variable có thể truy cập được từ client-side trong Next.js.

### API Endpoints

- `POST /login` - Đăng nhập
- `POST /logout` - Đăng xuất
- `POST /refresh-token` - Làm mới token

### Request/Response Format

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username",
      "fullname": "Full Name"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🏗️ Kiến trúc

### Store Structure

```
src/store/
├── index.ts                 # Store configuration
├── slices/
│   └── authSlice.ts        # Auth state management
├── services/
│   └── authApi.ts          # RTK Query API
└── middleware/
    └── authMiddleware.ts   # Auto refresh token logic
```

### Component Structure

```
src/components/auth/
├── AuthForm.tsx            # Login/Register form
├── AuthModal.tsx           # Modal version
├── AuthStatus.tsx          # Navbar auth component
├── ProtectedRoute.tsx      # Route protection
└── index.ts               # Exports
```

### Hooks

```
src/hooks/
├── useAuth.ts             # Main auth hook
└── useAuthInit.ts         # Initialize auth state
```

## 🔐 Security Features

1. **HttpOnly Cookies**: Access token và refresh token được lưu trong httpOnly cookies
2. **Auto Refresh**: Tự động làm mới token khi expired
3. **CSRF Protection**: SameSite cookie configuration
4. **Route Protection**: Client-side route guards
5. **Error Handling**: Centralized error handling và logout on auth failure

## 🚨 Lưu ý quan trọng

1. **Backend Integration**: Đảm bảo backend đã implement đúng cookie-based auth
2. **CORS Configuration**: Backend cần config CORS cho credentials
3. **HTTPS**: Sử dụng HTTPS trong production cho security
4. **Token Expiry**: Access token 15 phút, refresh token 30 ngày

## 📝 Example Pages

- `/login` - Trang đăng nhập (GuestRoute)
- `/register` - Trang đăng ký (GuestRoute)
- `/profile` - Trang profile (ProtectedRoute)
- `/dashboard` - Dashboard (ProtectedRoute với HOC)

Hệ thống đã sẵn sàng sử dụng! 🎉