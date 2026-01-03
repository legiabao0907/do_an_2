
# Product Requirements Document (PRD)
## Web Bản Đồ 
### 1. Product Overview

**Product Name:** Web Bản Đồ

**Version:** 1.0.0

**Product Type**: PERN stack

Web Bản Đồ là một dịch vụ  chuyên xử lý dữ liệu bản đồ, POI (Point of Interest), marker, và cung cấp API cho frontend hoặc bên thứ ba. Hệ thống hỗ trợ upload ảnh POI (Cloudinary), lọc và tìm kiếm vị trí theo bán kính, cũng như xác thực người dùng bằng JWT.

### 2. Target Users

Admin: Quản lý toàn bộ dữ liệu bản đồ, thêm/sửa/xóa POI, duyệt ảnh.

User: Tìm kiếm và xem bản đồ, xem POI, đánh dấu địa điểm yêu thích.

### 3. Core Features
### 3.1 User Authentication & Authorization

Đăng ký/Đăng nhập bằng email

JWT Authentication + Refresh Token

Xác minh email (email verification)

Quên mật khẩu + reset token

Role-based Access Control: admin, user

### 3.2 Map & POI Management

POI CRUD: Tạo, đọc, cập nhật, xóa POI

Marker Support: Gắn marker để hiển thị POI

Ảnh POI: Upload ảnh POI lên Cloudinary, lưu URL

Geospatial Query: Lọc POI theo bán kính (PostGIS)

POI Categories: Phân loại POI (quán ăn, trường học, bệnh viện...)

(Optional) : real time POI 

### 3.3 Search & Filter

Tìm kiếm POI theo tên

Lọc theo loại (category)

Lọc theo khoảng cách từ vị trí hiện tại

### 3.4 User Interaction

Thêm POI yêu thích (bookmark)

Đánh giá (rating) POI

Gửi request tạo POI mới (admin duyệt)

### 3.5 System Health

Endpoint health check để monitor trạng thái API

### 4. Technical Specifications
### 4.1 API Endpoints Structure

#### Auth Routes (/api/v1/auth/)

`POST /register` - Đăng ký

`POST /login` - Đăng nhập

`POST /logout` - Đăng xuất

`GET /current-user` - Lấy thông tin user

`POST /refresh-token` - Lấy token mới

#### POI Routes (/api/v1/poi/)

`GET/` - Lấy tất cả POI (có filter & pagination)

`POST/` - Tạo POI (admin)

`GET /:id` - Lấy thông tin POI theo id

`PUT /:id`- Cập nhật POI (admin)

`DELETE /:id` - Xóa POI (admin)

`GET /nearby?lat=&lng=&radius=` - Lấy POI gần theo bán kính

#### Category Routes (/api/v1/categories/)

`GET /` - Lấy danh sách categories

`POST /` - Tạo category (admin)

#### Favorite Routes (/api/v1/favorites/)

`POST /:poiId` - Thêm POI vào favorites

`GET /` - Lấy danh sách favorites của user

`DELETE /:poiId` - Bỏ favorites

#### System Routes (/api/v1/healthcheck/)

`GET /` - Kiểm tra tình trạng hệ thống

### 4.2 Permission Matrix

| Feature               | Admin | User |
|----------------------|:-----:|:----:|
| CRUD POI             | ✓     | ✗    |
| CRUD Categories      | ✓     | ✗    |
| Tìm kiếm POI         | ✓     | ✓    |
| Filter theo bán kính | ✓     | ✓    |
| Thêm favorites       | ✗     | ✓    |
| Xóa favorites        | ✗     | ✓    |

*Ghi chú:*  
✓ = được phép thực hiện  
✗ = không được phép thực hiện

POI:

id

name

description

category_id

location (geometry)

image_url

created_by

created_at, updated_at

Category:

id

name

Favorite:

user_id

poi_id

### 5. Security Features

JWT Authentication + Refresh Token

Role-based Authorization

Input Validation (Zod hoặc Yup)

CORS Config

Rate Limiting với 3rd party API

### 6. File Management

Upload ảnh POI với Cloudinary

Lưu link ảnh trong DB


### 7. Success Criteria

Có thể tạo, tìm kiếm, lọc, và xóa POI

Ảnh POI được upload và hiển thị đúng

Xác thực user an toàn với JWT

Có role-based access control rõ ràng

Geospatial query chạy nhanh trên PostGIS

API có healthcheck và dễ mở rộng