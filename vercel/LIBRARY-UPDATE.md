# Kho quà và sao lưu

Kho quà trên thiết bị tiếp tục sử dụng IndexedDB **LoiThuongStudio**, phiên bản **2**, các bảng **drafts** và **projects** cũ. Định dạng `.loithuong.json` và cách mã hóa bằng mật khẩu được giữ nguyên.

- Quà trên thiết bị có ảnh bìa lấy từ ảnh đầu tiên, hình trang trí hoặc ảnh nền. Bản có mật khẩu giữ bìa biểu tượng để không tiết lộ ảnh đã mã hóa.
- **Quà đã tạo link trên tài khoản** hiện thành các thẻ riêng: mở/sửa, xem link, Link & QR và tải JSON đủ ảnh/nhạc. Không bị ẩn trong mục phiên bản trước nữa.
- Tải JSON của quà trên tài khoản chỉ đọc dữ liệu. Nếu đã khóa, cần nhập mật khẩu; bản sao vẫn được mã hóa.
- Xóa khỏi kho thiết bị vẫn chỉ xóa bản trên thiết bị. Bản cập nhật không bổ sung thao tác xóa dữ liệu máy chủ.

Không thay đổi bảng SQL, API lưu trữ, Supabase, chính sách truy cập, ID quà, liên kết `/g/:id`, hoặc dữ liệu đã tạo. Không cần chạy migration hay script dọn dữ liệu khi triển khai.

Kiểm tra: `npm test`, `npm run build`. Bài kiểm tra kho mới xác nhận dữ liệu IndexedDB cũ không bị sửa khi xem kho hoặc tải JSON, bản có mật khẩu không lộ ảnh, và sao lưu từ tài khoản giữ đủ byte ảnh.
