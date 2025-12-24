# Vấn đề Cookies trong Production (Cross-Origin)

## Mô tả vấn đề

Khi deploy lên production, các API calls trả về **401 Unauthorized** trong trình duyệt ẩn danh (incognito mode), nhưng hoạt động bình thường trong trình duyệt thường.

**Triệu chứng:**
- Login thành công nhưng các request tiếp theo vẫn bị 401
- Refresh token cũng trả về 401
- Logout cũng trả về 401
- Chỉ xảy ra trong trình duyệt ẩn danh

## Nguyên nhân

1. **Cross-Origin Request**: Frontend và Backend ở domain khác nhau
   - Frontend: `https://your-frontend-domain.com`
   - Backend: `https://hana-api.onrender.com`

2. **Cookie SameSite Policy**: Trình duyệt ẩn danh có chính sách bảo mật nghiêm ngặt hơn
   - Cookies từ third-party domains bị chặn nếu không có `SameSite=None; Secure`
   - Trình duyệt thường có thể lưu cookies từ các sessions trước đó

3. **Backend Configuration**: Backend cần set cookies với đúng attributes:
   ```javascript
   // ❌ SAI - Cookies sẽ không được gửi trong cross-origin
   res.cookie('accessToken', token, { httpOnly: true, secure: true });

   // ✅ ĐÚNG - Cookies sẽ được gửi trong cross-origin
   res.cookie('accessToken', token, {
     httpOnly: true,
     secure: true,
     sameSite: 'none',  // Quan trọng cho cross-origin
     domain: '.onrender.com',  // Hoặc không set domain
   });
   ```

## Giải pháp

### 1. Backend (BE_Hanabi) - ✅ ĐÃ ĐƯỢC CẬP NHẬT

Backend đã được cập nhật với helper functions tự động detect production/HTTPS và set cookies đúng cách:

**File mới:** `BE_Hanabi/src/utils/cookie-helper.ts`
- Tự động detect production environment
- Tự động detect HTTPS requests (qua X-Forwarded-Proto header)
- Tự động set `SameSite=None; Secure` khi cần thiết

**Các thay đổi:**
1. ✅ Tạo helper functions: `setAccessTokenCookie()`, `setRefreshTokenCookie()`, `clearAuthCookies()`
2. ✅ Cập nhật `auth.controller.ts` để sử dụng helper functions
3. ✅ Thêm `app.set('trust proxy', 1)` trong `index.ts` để detect HTTPS từ proxy headers
4. ✅ Thêm logging để debug cookie issues

**Cách sử dụng (đã được áp dụng):**
```typescript
// Thay vì:
res.cookie('token', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  // ...
});

// Bây giờ dùng:
import { setAccessTokenCookie, setRefreshTokenCookie } from "../utils/cookie-helper";
setAccessTokenCookie(res, accessToken, req);
setRefreshTokenCookie(res, refreshToken, req);
```

**Lợi ích:**
- Tự động detect production/HTTPS, không cần phụ thuộc vào `NODE_ENV`
- Hoạt động đúng với Render, Vercel, và các hosting platforms khác
- Logging chi tiết để debug

### 2. CORS Configuration (Backend) - ✅ ĐÃ ĐÚNG

Backend đã có CORS config đúng với `credentials: true`:

```typescript
// BE_Hanabi/src/index.ts
const corsOptions = {
  origin: (origin, callback) => {
    // Cho phép frontend origin
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://hanabi-hub.vercel.app",
    ];
    // ...
  },
  credentials: true, // ✅ Đã có
  // ...
};
app.use(cors(corsOptions));
```

### 3. Frontend (FE_Hanabi) - Đã đúng

Frontend đã có `credentials: "include"` trong tất cả API calls, điều này là đúng.

```typescript
// Đã có trong code
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include", // ✅ Đúng rồi
});
```

## Kiểm tra và Debug

### 1. Kiểm tra Cookies trong Browser DevTools

1. Mở DevTools (F12)
2. Vào tab **Application** (Chrome) hoặc **Storage** (Firefox)
3. Xem **Cookies** → `https://hana-api.onrender.com`
4. Kiểm tra:
   - Cookies có được set không?
   - `SameSite` có phải `None` không?
   - `Secure` có được bật không?

### 2. Kiểm tra Network Requests

1. Mở DevTools → **Network** tab
2. Thực hiện login
3. Xem request `/api/v1/login`:
   - Response Headers có `Set-Cookie` không?
   - Cookies có `SameSite=None; Secure` không?
4. Xem request tiếp theo (ví dụ `/api/v1/user/profile`):
   - Request Headers có `Cookie` không?

### 3. Console Logs

Frontend đã được cập nhật để log thông tin về cookies khi có lỗi 401:
- Số lượng cookies
- Cross-origin status
- Incognito mode detection

## Testing

### Test trong trình duyệt thường:
```bash
# Should work - cookies được lưu từ session trước
```

### Test trong trình duyệt ẩn danh:
```bash
# Should work nếu backend config đúng
# Will fail nếu backend không set SameSite=None
```

## Checklist để fix

- [x] Backend set cookies với `sameSite: 'none'` (✅ tự động detect)
- [x] Backend set cookies với `secure: true` (✅ tự động detect HTTPS)
- [x] Backend CORS cho phép `credentials: true` (✅ đã có)
- [x] Backend CORS cho phép frontend origin (✅ đã có)
- [x] Frontend có `credentials: "include"` (✅ đã có)
- [x] Backend trust proxy để detect HTTPS (✅ đã thêm)
- [ ] **CẦN KIỂM TRA:** `NODE_ENV=production` trên Render
- [ ] **CẦN KIỂM TRA:** Deploy backend mới và test trong trình duyệt ẩn danh

## Bước tiếp theo

1. **Deploy backend mới** lên Render với các thay đổi trên
2. **Kiểm tra environment variables trên Render:**
   - `NODE_ENV=production` (nên set để đảm bảo)
   - `FRONTEND_URL=https://hanabi-hub.vercel.app` (hoặc domain frontend của bạn)
3. **Test lại trong trình duyệt ẩn danh:**
   - Clear cookies cũ (nếu có)
   - Login lại
   - Kiểm tra cookies có được set với `SameSite=None; Secure` không
   - Kiểm tra các API calls có hoạt động không

## Lưu ý

1. **SameSite=None yêu cầu Secure**: Cookies với `SameSite=None` PHẢI có `Secure=true` (chỉ gửi qua HTTPS)

2. **Domain attribute**: Không nên set `domain` attribute nếu frontend và backend ở domain khác nhau hoàn toàn

3. **Trình duyệt ẩn danh**: Một số trình duyệt có thể chặn cookies third-party ngay cả khi config đúng. Đây là tính năng bảo mật của trình duyệt.

4. **Alternative Solution**: Nếu không thể fix cookies, có thể dùng Authorization header với access token thay vì cookies (nhưng kém bảo mật hơn vì token có thể bị XSS)

## Tài liệu tham khảo

- [MDN: SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [MDN: CORS with credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials)
- [Chrome: Cookies SameSite](https://www.chromium.org/updates/same-site)

