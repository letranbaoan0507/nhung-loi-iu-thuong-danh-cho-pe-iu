# Kho quà và sao lưu

Kho quà trên thiết bị tiếp tục sử dụng IndexedDB **LoiThuongStudio**, phiên bản **2**, các bảng **drafts** và **projects** cũ. Định dạng `.loithuong.json` và cách mã hóa bằng mật khẩu được giữ nguyên.

- Quà trên thiết bị có ảnh bìa lấy từ ảnh đầu tiên, hình trang trí hoặc ảnh nền. Bản có mật khẩu giữ bìa biểu tượng để không tiết lộ ảnh đã mã hóa.
- **Quà đã tạo link trên tài khoản** hiện thành các thẻ riêng: mở/sửa, xem link, Link & QR và tải JSON đủ ảnh/nhạc. Không bị ẩn trong mục phiên bản trước nữa.
- Tải JSON của quà trên tài khoản chỉ đọc dữ liệu. Nếu đã khóa, cần nhập mật khẩu; bản sao vẫn được mã hóa.
- **Đưa link cũ vào kho** nhận link `/g/:id` của website hiện tại, đọc đủ chữ/ảnh/nhạc và thêm một bản mới vào kho. Quà có mật khẩu được sao lưu dưới dạng mã hóa sau khi nhập đúng mật khẩu. Link gốc và bản nháp đang sửa được giữ nguyên.
- **Xóa link** trong khu vực quà đã tạo link yêu cầu xác nhận. Khi xác nhận, API chỉ cho chủ sở hữu xóa quà và các tệp gắn với link đó; link/QR ngừng hoạt động. Các bản sao trên thiết bị được giữ đủ nội dung, chỉ bỏ thông tin link đã xóa. Các link khác được giữ nguyên.
- Xóa khỏi kho thiết bị vẫn chỉ xóa bản trên thiết bị.

Việc triển khai không tự sửa hoặc xóa dữ liệu đã tạo, không đổi bảng SQL, Supabase, chính sách truy cập hay ID quà. Nút xóa link sử dụng API xóa đã có, chỉ thực hiện sau khi chủ sở hữu xác nhận. Không cần chạy migration hay script dọn dữ liệu khi triển khai.

Kiểm tra: `npm test`, `npm run build`. Bài kiểm tra kho mới xác nhận dữ liệu IndexedDB cũ không bị sửa khi xem kho hoặc tải JSON, bản có mật khẩu không lộ ảnh, và sao lưu từ tài khoản giữ đủ byte ảnh.
