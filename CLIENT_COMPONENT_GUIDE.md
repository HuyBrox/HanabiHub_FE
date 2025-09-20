# Client Component Best Practices

## 🎯 Nguyên tắc sử dụng "use client"

### ❌ TRÁNH làm toàn bộ page thành client component:
```tsx
// ❌ BAD - Toàn bộ page thành client
"use client";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  return (
    <div>
      {/* Large page content */}
      {!isAuthenticated && <button>Login</button>}
    </div>
  );
}
```

### ✅ TỐT - Tách component nhỏ sử dụng hooks:
```tsx
// ✅ GOOD - Page vẫn là server component
export default function HomePage() {
  return (
    <div>
      {/* Large page content */}
      <HeroCTA /> {/* Chỉ component này cần client */}
    </div>
  );
}

// Component con riêng biệt
"use client";
function HeroCTA() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return null;
  return <button>Login</button>;
}
```

## 📝 Ví dụ trong dự án

### `HeroCTA` Component
- **Vị trí**: `src/components/common/HeroCTA.tsx`
- **Mục đích**: Ẩn nút "Start Learning Now" khi đã đăng nhập
- **Tại sao tách riêng**: Chỉ component này cần `useAuth` hook

### Lợi ích:
1. **Performance**: Phần lớn page được render server-side
2. **SEO**: Content chính vẫn được index tốt
3. **Hydration**: Chỉ hydrate phần cần thiết
4. **Bundle size**: Giảm JS gửi về client

## 🔄 Quy trình áp dụng:

1. **Identify**: Tìm phần nào cần hooks/state
2. **Extract**: Tách thành component riêng
3. **Mark**: Thêm "use client" vào component con
4. **Import**: Import vào parent (server component)

Luôn ưu tiên **server components** trừ khi thực sự cần client-side features!