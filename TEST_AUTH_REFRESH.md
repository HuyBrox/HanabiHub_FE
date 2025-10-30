# Test Plan: Auth Refresh Token Fix

## 🎯 Mục tiêu Testing
Đảm bảo hệ thống auth hoạt động đúng khi token hết hạn và refresh token được xử lý đúng cách.

## 🛠️ Setup

### 1. Chuẩn bị môi trường
```bash
# Đảm bảo backend đang chạy
# Đảm bảo frontend đang chạy
npm run dev
```

### 2. Mở DevTools
- Mở Chrome DevTools (F12)
- Vào tab Console để xem logs
- Vào tab Application > Cookies để xem cookies

## 📋 Test Cases

### ✅ Test Case 1: Login thành công
**Mục tiêu**: Kiểm tra login flow cơ bản

**Steps**:
1. Vào trang `/login`
2. Nhập email và password đúng
3. Click "Đăng nhập"

**Expected Results**:
- ✅ Console log: "✅ Login successful"
- ✅ Console log: "✅ Auth state restored from /user/profile"
- ✅ Redirect về trang chủ
- ✅ Hiển thị avatar và username trong sidebar
- ✅ Cookies có `accessToken` và `refreshToken`

---

### ✅ Test Case 2: Token hết hạn - Refresh thành công
**Mục tiêu**: Kiểm tra auto refresh token khi access token hết hạn

**Steps**:
1. Đăng nhập thành công
2. Mở DevTools > Application > Cookies
3. Xóa cookie `accessToken` (giữ lại `refreshToken`)
4. Vào một trang protected (ví dụ: `/profile`)
5. Quan sát Console logs

**Expected Results**:
- ✅ Console log: "🔄 Token expired, attempting refresh..."
- ✅ Console log: "✅ Token refreshed successfully"
- ✅ Console log: "✅ Refresh token successful"
- ✅ Console log: "✅ Get current user successful"
- ✅ KHÔNG bị redirect về trang chủ
- ✅ Vẫn hiển thị đúng user info
- ✅ Cookie `accessToken` được tạo lại

**Timing**:
- Delay 1 giây trước khi check auth (ProtectedRoute)
- Middleware có thời gian refresh token

---

### ✅ Test Case 3: Cả 2 token đều hết hạn
**Mục tiêu**: Kiểm tra logout khi refresh token cũng hết hạn

**Steps**:
1. Đăng nhập thành công
2. Mở DevTools > Application > Cookies
3. Xóa cả `accessToken` và `refreshToken`
4. Vào một trang protected (ví dụ: `/profile`)
5. Quan sát Console logs và UI

**Expected Results**:
- ✅ Console log: "🔄 Token expired, attempting refresh..."
- ✅ Console log: "❌ Refresh token failed, logging out..."
- ✅ Hiển thị notification: "Vui lòng đăng nhập để truy cập trang này"
- ✅ Redirect về trang chủ sau 1 giây
- ✅ Hiển thị trạng thái chưa đăng nhập
- ✅ Sidebar hiển thị nút "Đăng nhập"

---

### ✅ Test Case 4: User quay lại tab sau thời gian dài
**Mục tiêu**: Kiểm tra auto check session khi user quay lại tab

**Steps**:
1. Đăng nhập thành công
2. Vào một trang bất kỳ
3. Chuyển sang tab khác (hoặc minimize browser)
4. Xóa cookie `accessToken` (simulate token expired)
5. Quay lại tab (hoặc maximize browser)
6. Quan sát Console logs

**Expected Results**:
- ✅ Console log: "👁️ User returned to tab, checking session..."
- ✅ Console log: "🔄 Token expired, middleware will handle refresh..."
- ✅ Console log: "✅ Token refreshed successfully"
- ✅ KHÔNG bị logout
- ✅ Vẫn hiển thị đúng user info

**Timing**:
- Delay 500ms trước khi refetch (tránh race condition)

---

### ✅ Test Case 5: Focus vào window
**Mục tiêu**: Kiểm tra auto check session khi user focus vào window

**Steps**:
1. Đăng nhập thành công
2. Click ra ngoài browser (focus vào app khác)
3. Xóa cookie `accessToken`
4. Click vào browser để focus
5. Quan sát Console logs

**Expected Results**:
- ✅ Console log: "🎯 Window focused, checking session..."
- ✅ Console log: "🔄 Token expired, middleware will handle refresh..."
- ✅ Console log: "✅ Token refreshed successfully"
- ✅ KHÔNG bị logout

---

### ✅ Test Case 6: Periodic session check
**Mục tiêu**: Kiểm tra auto check session mỗi 10 phút

**Steps**:
1. Đăng nhập thành công
2. Đợi 10 phút (hoặc thay đổi interval trong code để test nhanh hơn)
3. Quan sát Console logs

**Expected Results**:
- ✅ Console log: "⏰ Periodic session check..."
- ✅ Gọi API `/user/profile`
- ✅ Nếu token hết hạn, tự động refresh

**Note**: Có thể thay đổi interval từ 10 phút xuống 1 phút để test nhanh hơn:
```typescript
// src/hooks/useAuthInit.tsx
const interval = setInterval(() => {
  console.log("⏰ Periodic session check...");
  refetch();
}, 1 * 60 * 1000); // 1 phút thay vì 10 phút
```

---

### ✅ Test Case 7: Multiple API calls cùng lúc
**Mục tiêu**: Kiểm tra không có multiple refresh token calls

**Steps**:
1. Đăng nhập thành công
2. Xóa cookie `accessToken`
3. Vào trang có nhiều API calls (ví dụ: `/courses`)
4. Quan sát Network tab và Console logs

**Expected Results**:
- ✅ Chỉ có 1 refresh token request
- ✅ Console log: "🔄 Token expired, attempting refresh..." (chỉ 1 lần)
- ✅ Các API calls khác đợi refresh token xong rồi mới retry
- ✅ Không có duplicate refresh calls

---

### ✅ Test Case 8: Protected Route delay
**Mục tiêu**: Kiểm tra ProtectedRoute có đủ thời gian cho middleware refresh

**Steps**:
1. Logout
2. Xóa tất cả cookies
3. Vào trang protected (ví dụ: `/profile`)
4. Quan sát timing

**Expected Results**:
- ✅ Hiển thị loading trong 1 giây
- ✅ Sau 1 giây mới check authentication
- ✅ Hiển thị notification và redirect
- ✅ KHÔNG có flash content

---

### ✅ Test Case 9: Refresh token endpoint fail
**Mục tiêu**: Kiểm tra xử lý khi refresh token endpoint trả về lỗi

**Steps**:
1. Đăng nhập thành công
2. Xóa cookie `accessToken`
3. Modify cookie `refreshToken` thành giá trị invalid
4. Vào trang protected
5. Quan sát Console logs

**Expected Results**:
- ✅ Console log: "🔄 Token expired, attempting refresh..."
- ✅ Console log: "❌ Refresh token endpoint failed, logging out..."
- ✅ Logout và redirect về trang chủ
- ✅ Hiển thị notification

---

### ✅ Test Case 10: Network error
**Mục tiêu**: Kiểm tra xử lý khi có network error

**Steps**:
1. Đăng nhập thành công
2. Mở DevTools > Network
3. Set throttling to "Offline"
4. Reload page
5. Quan sát behavior

**Expected Results**:
- ✅ Hiển thị loading state
- ✅ KHÔNG logout ngay (vì không phải lỗi 401/403)
- ✅ Khi online lại, tự động retry

---

## 📊 Test Results Template

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: Login thành công | ⬜ Pass / ⬜ Fail | |
| TC2: Token hết hạn - Refresh thành công | ⬜ Pass / ⬜ Fail | |
| TC3: Cả 2 token đều hết hạn | ⬜ Pass / ⬜ Fail | |
| TC4: User quay lại tab | ⬜ Pass / ⬜ Fail | |
| TC5: Focus vào window | ⬜ Pass / ⬜ Fail | |
| TC6: Periodic session check | ⬜ Pass / ⬜ Fail | |
| TC7: Multiple API calls | ⬜ Pass / ⬜ Fail | |
| TC8: Protected Route delay | ⬜ Pass / ⬜ Fail | |
| TC9: Refresh token fail | ⬜ Pass / ⬜ Fail | |
| TC10: Network error | ⬜ Pass / ⬜ Fail | |

---

## 🐛 Debugging Tips

### Console Logs để theo dõi:
```
✅ Login successful
✅ Auth state restored from /user/profile
🔄 Token expired, attempting refresh...
✅ Token refreshed successfully
✅ Refresh token successful
✅ Get current user successful
👁️ User returned to tab, checking session...
🎯 Window focused, checking session...
⏰ Periodic session check...
❌ Refresh token failed, logging out...
🔓 Access forbidden, logging out...
```

### Network Requests để kiểm tra:
- `POST /login` - Login
- `GET /user/profile` - Get current user
- `POST /refresh-token` - Refresh token
- `POST /logout` - Logout

### Redux State để kiểm tra:
```javascript
// Trong Console
window.__REDUX_DEVTOOLS_EXTENSION__
// Hoặc sử dụng Redux DevTools Extension
```

---

## ✅ Acceptance Criteria

Tất cả test cases phải pass để fix được coi là thành công:
- ✅ Không bị redirect sai khi token hết hạn
- ✅ Refresh token tự động và cập nhật state đúng
- ✅ UI luôn hiển thị đúng trạng thái
- ✅ Không cần F5 để thấy trạng thái đúng
- ✅ Không có multiple refresh calls
- ✅ Xử lý đúng khi refresh token fail

