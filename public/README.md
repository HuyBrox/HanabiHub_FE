# Public Assets Structure

Thư mục này chứa tất cả các tài nguyên tĩnh của ứng dụng Hanabi.

## Cấu trúc thư mục:

### 📁 `/images`
Chứa tất cả các file hình ảnh được chia theo loại:

#### 📁 `/images/avatars`
- Chứa các hình đại diện của người dùng
- Format: PNG, JPG
- Ví dụ: anime-style-avatar-boy.png, anime-style-avatar-girl.png

#### 📁 `/images/logos`
- Chứa logo của ứng dụng và các thương hiệu
- Format: PNG, SVG (ưu tiên SVG cho khả năng scale)
- Ví dụ: placeholder-logo.png, placeholder-logo.svg

#### 📁 `/images/placeholders`
- Chứa các hình ảnh placeholder/mặc định
- Format: PNG, JPG, SVG
- Ví dụ: placeholder.jpg, placeholder-user.jpg

#### 📁 `/images/backgrounds`
- Chứa các hình nền cho ứng dụng
- Format: JPG, PNG
- Ví dụ: japan-1.jpg

#### 📁 `/images/japanese`
- Chứa các hình ảnh liên quan đến tiếng Nhật
- Bao gồm: Hiragana, Katakana, Kanji
- Format: PNG, JPG

### 📁 `/icons`
- Chứa các icon của ứng dụng
- Format: SVG, PNG, ICO
- Bao gồm: favicon, app icons, UI icons

### 📁 `/assets`
Chứa các tài nguyên khác:

#### 📁 `/assets/fonts`
- Chứa các font tùy chỉnh
- Format: TTF, OTF, WOFF, WOFF2

#### 📁 `/assets/videos`
- Chứa các file video
- Format: MP4, WEBM

#### 📁 `/assets/audio`
- Chứa các file âm thanh
- Format: MP3, WAV, OGG

## Quy tắc đặt tên file:
- Sử dụng kebab-case (ví dụ: my-awesome-image.png)
- Tên file phải mô tả rõ nội dung
- Thêm kích thước vào tên nếu cần (ví dụ: logo-32x32.png)

## Hướng dẫn sử dụng:
- Để sử dụng ảnh trong code: `/images/avatars/anime-style-avatar-boy.png`
- Để sử dụng icon: `/icons/star.svg`
- Để sử dụng font: `/assets/fonts/custom-font.woff2`

## Tối ưu hóa:
- Nén ảnh trước khi upload
- Sử dụng WebP cho ảnh web khi có thể
- Sử dụng SVG cho icons và logos
- Lazy loading cho ảnh lớn
