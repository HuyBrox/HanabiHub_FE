# 🔄 Auto Auth Restore - Fix Reload Issue

## ❌ Vấn đề trước khi fix:
- User đăng nhập thành công
- Reload trang → Bị logout, phải đăng nhập lại
- Mặc dù cookie vẫn còn token

## ✅ Giải pháp đã implement:

### 1. **API Integration**
```typescript
// authApi.ts - Thêm endpoint lấy user profile
getCurrentUser: builder.query<UserProfileResponse, void>({
  query: () => ({
    url: "/user/profile",  // Backend API
    method: "GET",
  }),
  providesTags: ["Auth"],
}),
```

### 2. **Auto Auth Restore**
```typescript
// useAuthInit.ts - Hook khôi phục auth state
export const useAuthInit = () => {
  const { data, isSuccess, isError } = useGetCurrentUserQuery();

  useEffect(() => {
    if (isSuccess && data?.success && data.data) {
      // Restore user vào Redux state
      dispatch(loginSuccess(data.data.user));
    }
  }, [isSuccess, isError, data, dispatch]);
};
```

### 3. **Layout Integration**
```tsx
// layout.tsx - Wrap toàn bộ app
<RtkProvider>
  <AuthInitializer>  {/* ← Auto check auth on load */}
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </AuthInitializer>
</RtkProvider>
```

## 🔄 Flow hoạt động:

1. **User login** → Save user to Redux + Backend set cookie
2. **User reload page** → Redux reset về initial state
3. **AuthInitializer runs** → Gọi `/user/profile` với cookie
4. **API success** → Restore user vào Redux state
5. **User authenticated** → UI hiển thị đúng trạng thái

## 🧪 Test Cases:

### ✅ Test 1: Login Success
1. Đăng nhập với email/password đúng
2. Check Redux state có user info
3. Check sidebar hiển thị avatar + username
4. Check nút "Start Learning Now" ẩn đi

### ✅ Test 2: Page Reload
1. Sau khi login, reload trang (F5)
2. Check console log: "Auth state restored from /user/profile"
3. Check UI vẫn hiển thị đúng (không bị logout)
4. Check Redux state vẫn có user info

### ✅ Test 3: Token Expired
1. Đợi token expire hoặc xóa cookie manually
2. Reload trang → Tự động logout (UI hiển thị login button)
3. Check console log: "No valid session found"

### ✅ Test 4: Network Error
1. Disconnect internet, reload trang
2. App vẫn hoạt động bình thường (không crash)
3. Khi có internet lại → Auto restore

## 🛠️ Debug Tools:

### Console Logs:
```bash
# Success case:
"Auth state restored from /user/profile: {user_object}"

# Fail case:
"No valid session found - token may be expired or invalid"

# API URL check:
"API_URL: http://localhost:8080/api/v1"
```

### Redux DevTools:
- Check `state.auth.user` có data sau reload
- Check `state.auth.isAuthenticated` === true
- Track `loginSuccess` action được dispatch

## 🔧 Backend Requirements:

API `/user/profile` cần trả về format:
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@email.com",
      "username": "username",
      "fullname": "Full Name",
      "avatar": "avatar_url" // optional
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Middleware `isAuth` kiểm tra cookie token và return user info nếu valid.

## 🎯 Kết quả:
**Không còn phải đăng nhập lại sau reload!** 🎉