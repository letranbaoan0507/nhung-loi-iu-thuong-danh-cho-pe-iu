# Lời Thương · Studio

Website tạo lời chúc hoạt cảnh bằng form, lấy cảm hứng từ video robot đôi mắt phát sáng và luồng nhập/lưu/chia sẻ của Galaxy. Không dùng API tạo ảnh hoặc mô hình AI tính phí.

## Sử dụng

1. Nhập tên người nhận/người gửi/dịp; sửa các đoạn lời chúc. Có thể thêm, xóa, sắp xếp, đổi cảnh, biểu cảm, thời lượng và chọn ảnh riêng cho mỗi đoạn.
2. Tải album ảnh, ảnh nhân vật và nền riêng. PNG giữ nền trong suốt; GIF giữ chuyển động. Cảnh ảnh/trái tim dùng album; cảnh hoa có hình vector được vẽ bằng mã khi chưa chọn hình trang trí riêng.
3. Tải nhạc, đổi âm lượng, bảng màu, màu mắt/điểm nhấn, font, tốc độ, chữ ký và chế độ lặp. Các nội dung người nhận nhìn thấy được lấy từ cấu hình form, gồm cả lời mở đầu và kết thúc.
4. Xem trước trực tiếp ở hai khung máy tính/điện thoại hoặc mở bản xem của người nhận.
5. Tạo link & QR khi đăng nhập. Chữ, ảnh và nhạc được lưu bền vững bằng D1/R2, không phụ thuộc bản nháp trình duyệt. Mở Quà đã lưu → Sửa để cập nhật cùng link, hoặc lưu thành một món quà mới. Có xóa món quà và tệp đi kèm.
6. Tải HTML tự chứa ảnh/nhạc/hoạt cảnh để gửi trực tiếp; không cần máy chủ để xem file. Tải JSON làm bản sao lưu. Có thể nhập lại HTML hoặc JSON do ứng dụng này xuất để sửa tiếp, chỉ đọc gói dữ liệu JSON, không chạy mã trong file nhập.

Các biến `{ten}`, `{nguoi_gui}`, `{dip}` trong lời chúc tự thay bằng thông tin form. Câu ngắn giúp hoạt cảnh cân đối hơn. Nhạc chỉ phát sau khi người nhận chạm mở, theo quy định tự phát của trình duyệt. Có tạm dừng, chuyển cảnh, xem lại, bật/tắt nhạc, toàn màn hình và tôn trọng thiết lập giảm chuyển động.

## Lưu trữ và quyền truy cập

- D1 (`DB`) lưu cấu hình, phiên bản, chủ sở hữu và metadata. R2 (`BUCKET`) lưu tệp thật. Migrations do Drizzle tạo trong `drizzle/`, Sites áp dụng trước khi triển khai Worker.
- Quyền danh sách/tạo/sửa/xóa dựa trên ID đăng nhập do Sites cấp. Không dùng ID gửi từ form làm danh tính. API kiểm tra cùng nguồn cho các yêu cầu ghi.
- Mỗi món quà có UUID và đường dẫn `/g/<id>`. Đọc món quà/asset đã gắn được thực hiện khi có đường dẫn, đồng thời tuân theo quyền truy cập của Site. Không thay audience khi xuất bản. Site mới mặc định riêng tư; để người nhận ngoài Site xem có thể gửi HTML hoặc chủ Site tự chọn quyền chia sẻ phù hợp.
- Không có bộ sưu tập công khai liệt kê tất cả món quà. API danh sách chỉ trả quà của người đăng nhập. Ảnh chưa gắn với món quà chỉ chủ sở hữu đọc/xóa được. API không nhận SVG/HTML làm ảnh.
- Cập nhật có kiểm tra revision chống ghi đè dữ liệu mới từ tab/thiết bị khác. Cấu hình và liên kết tệp được cập nhật trong cùng transaction D1. Tệp cũ được xóa sau khi commit; tệp mới chưa dùng được dọn nếu client gặp lỗi lưu. Thao tác D1/R2 không phải một transaction liên dịch vụ; nếu xóa R2 lỗi sau commit có thể còn object không được tham chiếu cần dọn ở tầng vận hành.
- Bản nháp tự lưu IndexedDB trên trình duyệt hiện tại, gồm Blob ảnh/nhạc, không đồng bộ và **không mã hóa**. Mật khẩu không lưu trong bản nháp. Đổi máy, xóa dữ liệu trang hoặc dùng chế độ ẩn danh có thể không còn bản nháp; nên tải HTML/JSON sao lưu.

## Mật khẩu tùy chọn

Mã hóa phía trình duyệt bằng AES-GCM 256, IV ngẫu nhiên 12 byte; khóa từ PBKDF2 SHA-256 210.000 vòng với salt ngẫu nhiên 16 byte. Mật khẩu không gửi lên API. Link bảo vệ mã hóa cả cấu hình lẫn từng tệp; file HTML/JSON bảo vệ mã hóa toàn bộ gói dữ liệu. Không có khôi phục mật khẩu. Tên quản lý món quà lưu dạng rõ để chủ sở hữu nhận diện trong danh sách, không được trả trong API đọc quà công khai.

Không có mật khẩu thì ai có link và quyền truy cập website đều xem được nội dung. Link/mật khẩu là hai thứ riêng; không đưa mật khẩu vào URL hoặc QR.

## Dung lượng

Không thu phí theo lượt trong ứng dụng, không gọi API AI trả phí. Thiết bị và dịch vụ lưu trữ vẫn có quota/hạn mức thực tế, không phải tài nguyên vô hạn.

- Tối đa 40 đoạn, mỗi dòng chính/phụ tối đa 300 ký tự, 3–25 giây/đoạn.
- Album tối đa 12 ảnh; có thêm một hình nhân vật, một nền, một bản nhạc.
- Ảnh đầu vào tối đa 8 MB; khi có thể dùng canvas để thu gọn ảnh giữ tỷ lệ, không dùng AI vẽ lại. PNG/WebP chuyển PNG khi thu gọn để giữ alpha; GIF giữ nguyên.
- Nhạc tối đa 12 MB; tổng tệp tối đa 28 MB. Mỗi upload API chặn quá kích thước bằng stream trước khi lưu. JSON cấu hình API tối đa 250 KB; nhập HTML/JSON tối đa 42 MB.
- File HTML có nhạc/ảnh lớn có thể mở chậm. Xem trước HTML trong ứng dụng nhắn tin có thể không chạy JavaScript; tải xuống rồi mở bằng trình duyệt.

## Phát triển / triển khai

Node >=22.13, pnpm theo `packageManager`. Dùng starter Vinext + Sites build integration đã kèm; không thay lớp hosting/auth bằng OAuth tự tạo. `npm run build` tạo Worker và static assets; `npm run db:generate` tạo migration khi đổi schema. Sử dụng workflow Sites để đồng bộ Git, đóng gói, lưu phiên bản và triển khai.

Ứng dụng server cần Cloudflare D1/R2; không phải gói static Vercel có thể chạy backend nguyên trạng. File HTML đã xuất thì độc lập với backend và hosting.

Không có khóa API/mật khẩu/token trong mã nguồn. Endpoint `/api/health` chỉ trả trạng thái sẵn sàng và phiên bản, không trả dữ liệu người dùng.

## Kiểm tra

`node --test tests/*.test.mjs` kiểm tra cấu hình, mật khẩu, bản HTML tự chứa, QR, API phân quyền, CAS/transaction và tương tác DOM (form → ảnh → mã hóa → link/QR → HTML → mở lại). Test SQL dùng `node:sqlite`; DOM dùng Happy DOM/fake-indexeddb. Các mô phỏng DOM không thay thế kiểm thử bố cục và thao tác trên trình duyệt thực.

## Thư viện và tài nguyên

- Vinext/React/Drizzle và dependencies giữ theo license trong package.
- `public/qr.js`: qrcode-generator 1.4.4, MIT, Kazuhiko Arase. Copyright/license header giữ nguyên. QR tạo tại trình duyệt, không gửi link tới API tạo QR bên ngoài.
- Robot, hoa, nền, logo, biểu tượng được vẽ bằng CSS/SVG/canvas trong mã nguồn. Không lấy ảnh nhân vật/anime hoặc watermark TikTok từ video mẫu. Người dùng tự tải ảnh/nhạc muốn dùng qua form.
