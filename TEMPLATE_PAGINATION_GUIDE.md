# 📄 Template Pagination Guide

## Tổng Quan

Tab Template giờ đã có **phân trang (pagination)** thực sự thay vì hiển thị tất cả cùng lúc.

## ⚙️ Cấu Hình

### Số Lượng Mỗi Trang
```typescript
const [templatesPerPage] = useState(5); // Mỗi trang 5 templates
```

**Có thể thay đổi:**
- Muốn 10 templates/trang → Đổi `5` thành `10`
- Muốn 3 templates/trang → Đổi `5` thành `3`

## 🎯 Cách Hoạt Động

### 1. Hiển Thị
- **Trang 1:** Hiển thị templates từ 1-5
- **Trang 2:** Hiển thị templates từ 6-10
- **Trang 3:** Hiển thị templates từ 11-15
- **Trang 4:** Hiển thị templates từ 16-20
- **Trang 5:** Hiển thị templates từ 21-21 (template cuối)

### 2. Navigation
- Nút **"Trước":** Về trang trước
  - Disabled khi đang ở trang 1
- Nút **"Sau":** Sang trang sau
  - Disabled khi đang ở trang cuối

### 3. Thông Tin Pagination
```
Trang 2 / 5  (21 templates)
```
- Trang hiện tại: 2
- Tổng số trang: 5
- Tổng số templates: 21

## 🔄 Tính Năng

### 1. Auto Reset Về Trang 1
Khi **search** hoặc **filter** thay đổi, tự động reset về trang 1:

```typescript
useEffect(() => {
  setTemplateCurrentPage(1); // Reset to page 1
  fetchTemplates();
}, [templateSearchQuery, templateTypeFilter]);
```

**Ví dụ:**
1. Đang ở **Trang 3**
2. Gõ search "chào mừng"
3. Tự động về **Trang 1** với kết quả search

### 2. Tính Toán Pagination
```typescript
// Slice array để chỉ lấy templates của trang hiện tại
templates.slice(
  (templateCurrentPage - 1) * templatesPerPage,  // Start index
  templateCurrentPage * templatesPerPage          // End index
)
```

**Ví dụ với 5 templates/trang:**
- Trang 1: `slice(0, 5)` → Index 0-4
- Trang 2: `slice(5, 10)` → Index 5-9
- Trang 3: `slice(10, 15)` → Index 10-14

### 3. Điều Kiện Hiển Thị
Pagination chỉ hiển thị khi:
```typescript
templates.length > templatesPerPage
```

**Nghĩa là:**
- Có 21 templates, mỗi trang 5 → Hiển thị pagination
- Có 3 templates, mỗi trang 5 → KHÔNG hiển thị pagination

## 📊 Use Cases

### Ví Dụ 1: 21 Templates, 5/Trang
- **Tổng trang:** 5 (21 ÷ 5 = 4.2 → làm tròn lên 5)
- **Trang 1:** 5 templates
- **Trang 2:** 5 templates
- **Trang 3:** 5 templates
- **Trang 4:** 5 templates
- **Trang 5:** 1 template

### Ví Dụ 2: Search "chào mừng"
1. **Ban đầu:** 21 templates → 5 trang
2. **Search:** Chỉ tìm thấy 2 templates
3. **Kết quả:** 
   - Tự động về Trang 1
   - Hiển thị 2 templates
   - KHÔNG hiển thị pagination (vì 2 < 5)

### Ví Dụ 3: Filter "System"
1. **Ban đầu:** 21 templates → 5 trang
2. **Filter "System":** Chỉ còn 7 templates
3. **Kết quả:**
   - Tự động về Trang 1
   - Trang 1: 5 templates
   - Trang 2: 2 templates
   - Hiển thị pagination (vì 7 > 5)

## 🎨 UI Components

### Pagination Bar
```
┌─────────────────────────────────────────┐
│ Trang 2 / 5 (21 templates)   [Trước] [Sau] │
└─────────────────────────────────────────┘
```

### States
- **Disabled buttons:** Màu xám, không click được
- **Active buttons:** Màu xanh, hover effect
- **Current page:** Bold, highlighted

## 🔧 Tùy Chỉnh

### Thay Đổi Số Lượng/Trang

**File:** `src/app/(admin)/admin/content/page.tsx`

```typescript
// Tìm dòng này:
const [templatesPerPage] = useState(5);

// Đổi thành số bạn muốn:
const [templatesPerPage] = useState(10); // 10 templates/trang
```

### Thay Đổi Style Pagination

Tìm phần Pagination trong code (dòng ~1806-1834):

```typescript
<div className="flex items-center justify-between pt-4 border-t">
  {/* Customize styles here */}
</div>
```

## 📝 Testing Checklist

- [ ] Trang 1 hiển thị 5 templates đầu
- [ ] Click "Sau" → Chuyển sang trang 2
- [ ] Click "Trước" → Về lại trang 1
- [ ] Nút "Trước" disabled ở trang 1
- [ ] Nút "Sau" disabled ở trang cuối
- [ ] Search → Tự động về trang 1
- [ ] Filter → Tự động về trang 1
- [ ] Hiển thị đúng tổng số trang
- [ ] Pagination ẩn khi < 5 templates

## 🐛 Troubleshooting

### Lỗi: "Cannot read property 'slice' of undefined"
**Nguyên nhân:** `templates` array chưa được khởi tạo

**Giải pháp:** Đảm bảo có:
```typescript
const [templates, setTemplates] = useState<TemplateItem[]>([]);
```

### Lỗi: Pagination không reset khi search
**Nguyên nhân:** Thiếu logic reset trong useEffect

**Giải pháp:** Đảm bảo có:
```typescript
useEffect(() => {
  setTemplateCurrentPage(1);
  fetchTemplates();
}, [templateSearchQuery, templateTypeFilter]);
```

### Lỗi: Hiển thị sai số trang
**Nguyên nhân:** Tính toán totalPages sai

**Giải pháp:**
```typescript
Math.ceil(templates.length / templatesPerPage)
```

## 📚 Tài Liệu Liên Quan

- `API_TRANSFORM_SUMMARY.md` - Cách transform API response
- `ID_FIELD_FIX.md` - Sửa lỗi React key prop
- `TEMPLATES_SEED_GUIDE.md` - Hướng dẫn seed templates

