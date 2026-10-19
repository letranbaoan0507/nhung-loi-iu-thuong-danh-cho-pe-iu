# Lời Thương Studio — bản Vercel

Giao diện, CSS, hoạt cảnh, robot, album 12 ảnh, font tiếng Việt, đĩa nhạc góc trái, form, mật khẩu món quà, kho quà trên thiết bị, nhập/xuất JSON và nút hủy tải được giữ từ bản website hiện tại. Favicon là logo AN xanh do bạn cung cấp, gồm ICO/PNG và logo JPG gốc.

Bản này chuyển riêng lớp hosting/auth/lưu trữ sang Next.js + Supabase để chạy trên Vercel. Đăng nhập tài khoản bằng email/mật khẩu Supabase thay cho đăng nhập ChatGPT. Mật khẩu tài khoản không phải mật khẩu mở quà. Không cần API AI, API nhạc hoặc dịch vụ font trả phí.

**Làm theo `../HUONG-DAN-GITHUB-VERCEL.md`. Root Directory trên Vercel là `vercel` nếu bạn đưa toàn bộ gói lên GitHub.** Nếu chỉ đưa các file bên trong thư mục này lên repository thì Root Directory để mặc định.

## Chạy trên máy

Cài Node.js 22.13 trở lên và npm. Mở terminal trong thư mục này:

```sh
npm ci
npm run dev
```

Mở http://localhost:3000. Không có cấu hình vẫn soạn quà, xem trước, lưu kho cục bộ và tải JSON được. Tạo link/QR và mở link đã lưu cần cấu hình Supabase theo hướng dẫn. `npm run build` / `npm start` dùng cho bản production. Không đưa `node_modules`, `.next` hay `.env.local` lên GitHub.

## Kiến trúc

- `app/lib` giữ toàn bộ model/form/render/crypto/JSON/QR của website gốc. File `offline.mjs` vẫn có để đọc các bản HTML cũ; giao diện không thêm lại nút tải HTML đã bỏ.
- `lib/server/database.mjs` đổi cú pháp tham số D1 sang PostgreSQL, giữ transaction và revision chống ghi đè. SQL không lấy từ form.
- `lib/supabase` và `proxy.ts` dùng thư viện Supabase SSR chính thức. Server xác minh user; bỏ mọi header danh tính do client tự gửi.
- Schema riêng `loithuong` không mở qua Data API; RLS bật, không có policy đọc công khai. Bucket Storage private. `DATABASE_URL` và service role key chỉ ở server.
- Ảnh/nhạc được tải trực tiếp tới signed upload URL do server cấp, sau đó server kiểm tra dung lượng và chữ ký định dạng rồi đăng ký asset. Vercel không nhận toàn bộ tệp nhạc trong body của Function. GET asset kiểm tra quyền và chuyển sang URL có hạn 10 phút để tải byte.
- Trong lúc tải tệp, ×/Esc hủy và giữ nguyên nội dung. Khi server đã bắt đầu ghi món quà nguyên tử, đợi bước hoàn tất ngắn để không bỏ mất kết quả cập nhật link cũ. Không xóa link đã có khi hủy lần cập nhật đang tải.
- Phiên tải hủy được giữ đến hết hạn để dọn cả tệp tới trễ. Tạo upload mới sẽ dọn tối đa 20 ticket hết hạn của chính chủ đó. Khi cần, chạy script dọn thủ công: `node --env-file=.env.local scripts/cleanup-storage.mjs --apply`. Script chỉ dọn ticket hết hạn và asset chưa gắn quà quá 24 giờ; không dùng cron trả phí.

## Dữ liệu và giới hạn

- ZIP là mã nguồn + tài nguyên trong mã nguồn, không phải bản trích dữ liệu tài khoản đang chạy. Không chứa mật khẩu, token triển khai, dữ liệu Supabase/D1/R2 hoặc IndexedDB của trình duyệt bạn.
- Để chuyển quà: tải JSON ở website cũ, mở bản Vercel → nhập JSON → kiểm tra → tạo link mới. Có mật khẩu thì nhập đúng mật khẩu để mở JSON.
- Link cũ vẫn thuộc máy chủ cũ, không tự đổi thành link Vercel. Bản nháp và kho cục bộ của hai tên miền cũng tách riêng. Không hứa tự chuyển link hay đồng bộ kho cục bộ giữa thiết bị.
- Không giới hạn số lần dùng bằng bộ đếm trả phí. Tài nguyên miễn phí có quota thực tế. Album 12 ảnh, tối đa 40 đoạn; bản ảnh dùng trên web tự thu gọn tối đa khoảng 1 MB/ảnh. Không chặn MB/kích thước ảnh đầu vào ở ứng dụng, nhưng thiết bị phải giải mã được ảnh. Nhạc tối đa 12 MB, tổng media 28 MB/quà; đây là giới hạn hiện có được giữ nguyên.
- Mật khẩu quà dùng AES-GCM/PBKDF2 ở trình duyệt, không gửi server; không thể khôi phục khi quên. Bản nháp chưa mã hóa; bản JSON/kho có thể mã hóa khi bật khóa. Nội dung không khóa thì người có link có thể xem.

## Miễn phí

Vercel Hobby cho dự án cá nhân, phi thương mại; Supabase Free cho database/auth/storage. Dùng tên miền `*.vercel.app` miễn phí. Không bắt buộc mua tên miền, dùng Pro/trial hoặc tích hợp thanh toán. Dịch vụ có thể tạm dừng/chặn khi hết quota; Supabase Free có thể pause sau 7 ngày ít hoạt động. Chủ tài khoản cần theo dõi hạn mức và giữ JSON riêng. Chi tiết hiện hành tại:

- https://vercel.com/docs/plans/hobby
- https://supabase.com/pricing
- https://supabase.com/docs/guides/platform/free-project-pausing

## Kiểm tra

`npm test`: bộ kiểm tra form/ảnh/robot/album/JSON/crypto/QR/API và hủy; thêm PostgreSQL thực chạy bằng PGlite để kiểm tra adapter, revision, rollback, quyền sở hữu, ticket; kiểm tra chống giả danh và đường tải trực tiếp 12 MB. `npm run build` chạy build production + kiểm tra TypeScript.

Các test mô phỏng không thay cho kiểm tra trình duyệt thật và kết nối với project Supabase/Vercel của bạn. Cần thực hiện checklist sau triển khai trong hướng dẫn.

## Giấy phép

Font DejaVu và QR giữ license trong `public/fonts/LICENSE-DejaVu.txt`, header `public/qr.js`. Thư viện npm theo license của từng gói; cài đúng phiên bản qua `package-lock.json`. Logo AN do bạn cung cấp. Không kèm nhạc/ảnh cá nhân không có trong mã nguồn.
