# Kiểm tra bản đóng gói

- Bản gốc: phiên bản 12, commit `e8f6ec1c97e66f622c75d1c163e6fbd1080da7b5`, đã triển khai thành công tại URL trong DOC-TRUOC.md.
- Thay đổi trên website gốc của lượt này: favicon AN xanh, kèm ICO/PNG/apple-touch và JPG gốc. Không đổi nội dung/hiệu ứng/giao diện còn lại.
- Bản Vercel: `npm test` đạt **25/25**. Gồm 22 kiểm tra tương thích hiện có và 3 kiểm tra riêng cho chuyển nền tảng.
- Adapter PostgreSQL được chạy bằng PGlite thực (PostgreSQL trong tiến trình), kiểm tra schema, tạo/đọc/sửa/xóa, quyền chủ sở hữu, revision, rollback transaction, liên kết tệp và đăng ký ticket.
- Kiểm tra request Vercel bỏ header giả mạo danh tính và chỉ chèn ID đã xác minh.
- Kiểm tra đường upload nhạc 12 MB đi thẳng tới Storage URL; API Vercel chỉ nhận metadata nhỏ, hủy upload không đăng ký tệp.
- `npm run build` Next.js production và TypeScript đạt. Có route trang chính, xem quà, Auth login, API quà/tệp/ticket và proxy refresh session.
- Bản gốc Vinext build thành công trước khi xuất bản favicon.
- 25 file UI/font/logo/QR/tài nguyên của hai bản được đối chiếu byte-identical; SHA-256 trong DOI-CHIEU-PHIEN-BAN.json.
- Mã nguồn gốc lấy từ Git archive, không lấy build cache hoặc trạng thái đang sửa. ZIP không kèm node_modules, .next hoặc các file bí mật.

## Giới hạn xác minh

Chưa kiểm tra trình duyệt thật trong môi trường này. Chưa deploy vào tài khoản Vercel/Supabase của người dùng hoặc thử kết nối Auth/Storage thật của tài khoản đó. Không khẳng định đã kiểm tra luồng dịch vụ thật sau khi người dùng cấu hình. Phải thực hiện checklist sau triển khai trong HUONG-DAN-GITHUB-VERCEL.md.

Các kiểm tra DOM/PGlite/mocked transport xác minh logic và hợp đồng adapter, không bảo đảm tài khoản bên ngoài đã được cấp đúng khóa, quota, quyền hoặc cookie/domain. Không xuất dữ liệu lưu trong tài khoản hay trình duyệt của người dùng vào ZIP.
