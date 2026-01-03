# Dự Án Bản Đồ Số (Web GIS)

Dự án hiển thị bản đồ raster tile theo thời gian, hỗ trợ so sánh (Swipe Map) giữa các năm dữ liệu.

## Hướng dẫn cài đặt và chạy

### 1. Chuẩn bị dữ liệu
File dữ liệu `*.mbtiles` cần được đặt vào thư mục:
`backend/mbtiles/`

(Lưu ý: Do kích thước file lớn, chúng không được upload lên GitHub. Bạn cần copy thủ công vào thư mục này).

### 2. Chạy Backend (Server API)
Mở terminal tại thư mục `backend` và chạy:
```bash
npm run dev2
```
Server sẽ chạy tại: `http://localhost:3000`

### 3. Chạy Frontend (Giao diện bản đồ)
Mở một terminal **mới** tại thư mục `frontend` và chạy:
```bash
npm run dev
```
Truy cập web tại: `http://localhost:5173` (hoặc port hiển thị trên màn hình).

## Tính năng chính
- **Time Lapse**: Xem bản đồ theo từng năm (2017, 2023, 2025).
- **Swipe Map**: Chế độ so sánh, kéo trượt để xem sự thay đổi giữa 2 năm bất kỳ.
- **Layers**: Hỗ trợ 2 mức độ phân giải (Low/High) tự động chuyển đổi theo mức zoom.
