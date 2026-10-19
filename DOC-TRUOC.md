# Lời Thương Studio — gói mã nguồn đầy đủ

**Muốn đăng GitHub và Vercel: dùng thư mục `vercel` và làm theo `HUONG-DAN-GITHUB-VERCEL.md`.**

## Trong ZIP có gì?

| Thành phần | Nội dung |
| --- | --- |
| `vercel/` | Website Next.js chạy trên Vercel, giữ giao diện/hoạt cảnh hiện tại, kèm backend Supabase Free và hướng dẫn. |
| `website-goc-sites/` | Toàn bộ 151 file mã nguồn được theo dõi của phiên bản 12 đang chạy, lấy nguyên từ Git, gồm code cũ cần tương thích, migrations, tài nguyên, test và lockfile. |
| `ban-build-sites.tar.gz` | Bản build thật đã dùng cập nhật website hiện tại với favicon AN; dành cho lưu giữ/đối chiếu, không đưa trực tiếp vào Vercel. |
| `DOI-CHIEU-PHIEN-BAN.json` | Commit gốc và SHA-256 của những file giao diện/tài nguyên giữ nguyên giữa hai bản. |
| `KIEM-TRA.md` | Các kiểm tra đã làm và những bước bạn cần kiểm tra sau khi cấu hình tài khoản. |
| `SHA256SUMS.txt` | Mã kiểm tra từng file trong gói, trừ chính danh sách này. |

Website hiện tại: https://loi-thuong-studio.bett-yrobinsonw870.chatgpt.site

Favicon đã đổi trên website hiện tại và trong cả hai thư mục mã nguồn. Logo AN xanh gốc nằm tại `public/logo-an-original.jpg`, cùng `favicon.ico`, `icon-192.png` và `apple-touch-icon.png`. Không thay logo trong header, màu giao diện hay bố cục đã duyệt.

## Giữ nguyên và phần phải chuyển nền tảng

Giao diện, bố cục, robot, biểu cảm mắt, album, đĩa nhạc, font, nội dung form, xem trước, mã hóa quà, kho cục bộ, JSON và hủy tải được giữ nguyên. Đối chiếu 25 file UI/tài nguyên bằng byte trong báo cáo kèm theo.

Bản gốc dùng hạ tầng đăng nhập và D1/R2 của Sites. Hạ tầng đó không chạy nguyên trạng trên Vercel. Vì vậy ZIP giữ nguyên bản gốc và kèm một bản chuyển riêng phần nền tảng: Next.js trên Vercel; email/mật khẩu Supabase cho tài khoản; PostgreSQL + Storage private của Supabase cho link/QR. Không thể hứa đăng nhập/hạ tầng giống hệt giữa hai dịch vụ khác nhau; không âm thầm bỏ tính năng lưu link để làm một bản static.

## Miễn phí trong hạn mức

Chọn Vercel **Hobby** cho mục đích cá nhân/phi thương mại và Supabase **Free**. Không cần tên miền trả phí; có tên miền `vercel.app`. Không có API AI, thanh toán hoặc bộ đếm thu phí trong mã nguồn. Không chọn Pro/trial/add-on trả phí. Dịch vụ miễn phí vẫn có quota, có thể tạm dừng khi quá hạn mức hoặc ít hoạt động. Xem các nguồn chính thức được dẫn trong hướng dẫn; điều kiện có thể thay đổi.

## Mã nguồn khác dữ liệu cá nhân

ZIP không chứa database đang chạy, tệp quà đang lưu trên máy chủ, kho quà/bản nháp trong trình duyệt bạn, mật khẩu hoặc token. Đó không phải các file nằm trong mã nguồn có thể xuất tự động ở đây. Muốn chuyển một món quà, tải JSON ở website cũ rồi nhập JSON vào website mới và tạo link mới. Link cũ không tự đổi sang tên miền mới. Giữ bản gốc và bản sao lưu JSON trước khi chuyển.

Không kèm `node_modules` và build cache vì được tạo lại bằng lockfile. Toàn bộ code cần để cài, build, chạy và cấu hình bản Vercel có trong `vercel/`.
