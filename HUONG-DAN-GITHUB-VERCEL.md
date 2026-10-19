# Đưa Lời Thương Studio lên GitHub và Vercel miễn phí

## 1. Giải nén và chọn đúng bản

Giải nén ZIP. Bạn sẽ thấy thư mục `loi-thuong-studio`, bên trong có `vercel` và `website-goc-sites`.

Dùng **`vercel`** để chạy trên Vercel. `website-goc-sites` là bản gốc đầy đủ để lưu giữ, không dùng làm Root Directory Vercel vì nó cần hạ tầng Sites.

## 2. Tạo Supabase Free

1. Vào https://supabase.com → đăng nhập → tạo organization **Free** → New project.
2. Đặt tên, tạo mật khẩu database riêng, lưu mật khẩu an toàn. Chọn khu vực gần Việt Nam, ví dụ Singapore nếu có.
3. Chờ project sẵn sàng. Không chọn Pro hay gói dùng thử trả phí.
4. Trong project, mở **SQL Editor → New query**.
5. Mở file `vercel/supabase/setup.sql`, sao chép toàn bộ nội dung, dán vào SQL Editor → **Run**.
6. Vào Storage kiểm tra có bucket **loi-thuong** và bucket đang **private**. Không chuyển public, không thêm policy public.

SQL tạo schema riêng `loithuong`, bảng quà/tệp/ticket và bucket. Không cần tự sửa từng tên bảng. Không chạy các migration SQLite trong `drizzle/` vào Supabase; chúng được giữ cho test tương thích.

## 3. Tạo tài khoản đăng nhập website của bạn

1. Mở **Authentication → Users → Add user → Create new user**.
2. Điền email, mật khẩu tài khoản và bật xác nhận email tự động nếu giao diện cung cấp tùy chọn đó.
3. Lưu email/mật khẩu ở nơi riêng. Không ghi vào GitHub.
4. Trong cấu hình Auth, tắt cho người dùng mới tự đăng ký nếu chỉ bạn dùng kho của mình. Website không mở form đăng ký công khai; bạn có thể tạo thêm tài khoản được phép bằng trang Users.

Mật khẩu này dùng đăng nhập tại `/login`. Mật khẩu mở một món quà vẫn là tùy chọn riêng trong form Lời Thương, mã hóa trên trình duyệt, không thể khôi phục khi quên.

## 4. Lấy bốn giá trị cấu hình

Trong Supabase, mở **Connect** hoặc **Project Settings → API / API Keys** và ghi nhận:

| Biến trên Vercel | Lấy ở đâu |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL, dạng `https://....supabase.co`. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key; dự án cũ có thể dùng anon key thay thế. Đây là khóa dùng được ở trình duyệt, không phải service role. |
| `SUPABASE_SERVICE_ROLE_KEY` | Khóa service_role phía server trong API Keys / Legacy API Keys của project. Giữ bí mật. |
| `DATABASE_URL` | Connect → Transaction pooler → URI, cổng **6543**. Thay placeholder mật khẩu bằng mật khẩu database của bạn. |

URI pooler thường có user dạng `postgres.<project-reference>`. Sao chép nguyên hostname từ Connect, không tự đoán theo ví dụ trong `.env.example`. Mật khẩu có ký tự `@`, `#`, `%`, `/`, `:`... cần URL encode phần mật khẩu. Không thêm dấu ngoặc quanh giá trị môi trường.

Không đặt hai giá trị bí mật cuối vào biến bắt đầu bằng `NEXT_PUBLIC_`. Không gửi bí mật vào chat, không tải `.env.local` lên GitHub. File `.env.example` chỉ là mẫu với placeholder.

## 5. Đưa mã lên GitHub

1. Vào https://github.com/new → tạo repository trong tài khoản cá nhân. Có thể đặt Private.
2. Sau khi tạo, chọn **Add file → Upload files** nếu repository đã có file, hoặc đường dẫn upload trên trang repository mới.
3. Tải các thư mục/file **bên trong** `loi-thuong-studio` lên repository, giữ thư mục `vercel` nguyên tên. Không tải mỗi file ZIP lên: Vercel cần đọc mã đã giải nén.
4. Commit changes.

Nếu muốn repository gọn chỉ chứa website Vercel, bạn có thể tải **nội dung bên trong `vercel/`** lên thẳng gốc repository. Khi đó ở bước tiếp theo Root Directory để mặc định thay vì `vercel`. Bản ZIP vẫn giữ bản gốc riêng cho bạn.

Không tải `node_modules`, `.next`, `.env.local`. GitHub web không dùng được cho file quá lớn; gói này đã bỏ cache/dependencies nên các file mã nguồn nhỏ. Có thể dùng GitHub Desktop nếu thao tác kéo thư mục trên web không tiện.

## 6. Import vào Vercel Hobby

1. Vào https://vercel.com → dùng tài khoản cá nhân gói **Hobby**.
2. **Add New → Project** → chọn repository GitHub vừa tạo → Import.
3. Framework Preset: **Next.js**.
4. Root Directory: **`vercel`** nếu repository giữ cấu trúc toàn gói ở bước 5. Nếu bên ngoài còn lồng thêm một thư mục `loi-thuong-studio`, chọn chính xác `loi-thuong-studio/vercel`; tốt hơn là bỏ lớp thư mục thừa khi upload.
5. Build command: `npm run build`. Install command: `npm ci`. Node.js: **22.x**.
6. Trong Environment Variables, thêm đủ bốn biến ở bước 4. Áp dụng cho Production, và Preview nếu muốn thử preview. Không cần tự tạo biến `NEXT_PUBLIC_STORAGE_TRANSPORT`; cấu hình Next đã cấp sẵn.
7. Deploy. Khi build xong, mở tên miền `*.vercel.app` được cấp.
8. Nếu bạn bổ sung/sửa biến sau khi đã Deploy, **Redeploy** để các biến public có trong bản build.

Không có tài khoản dịch vụ được tạo hoặc gói trả phí được kích hoạt tự động bởi mã nguồn. Đừng chọn Pro/trial hay bật tích hợp thanh toán. Vercel Hobby chỉ dành cho mục đích cá nhân, phi thương mại.

## 7. Kiểm tra website sau triển khai

1. Mở trang chính. Kiểm tra favicon AN, font tiếng Việt và bố cục cũ.
2. Viết thử lời nhắn, tải 12 ảnh, một hình nhân vật, một nền, một bản nhạc. Kiểm tra preview giữ tỷ lệ, album chạy đủ ảnh, đĩa nhạc và nháy mắt robot.
3. Bấm **Sao lưu dự án JSON**: kiểm tra file thực sự tải về máy và nhập lại được.
4. Bấm **Lưu vào kho**: kiểm tra mở/sửa/xóa trong Quà đã lưu. Kho này ở trình duyệt hiện tại.
5. Bấm tạo link → đăng nhập bằng tài khoản đã tạo tại Supabase. Bản nháp trên cùng tên miền được giữ khi chuyển trang đăng nhập.
6. Bật mật khẩu món quà nếu muốn → tạo link/QR. Thử link ở cửa sổ ẩn danh hoặc thiết bị khác; khi khóa phải nhập đúng mật khẩu mới xem được.
7. Cập nhật cùng quà, kiểm tra link không đổi và nội dung mới hiện đúng. Mỗi lần lưu có revision; nếu tab khác đã sửa, mở bản mới trước khi lưu.
8. Thử bấm **×/Esc** lúc tải tệp: modal đóng, tải dừng, nội dung form còn nguyên và bạn có thể thử lại.
9. Có thể mở `/api/health`: `{"ready":true}` nghĩa là kết nối database đã sẵn sàng. Không có token hay thông tin cá nhân ở endpoint này. Vẫn phải thử tạo/mở quà để kiểm tra cả Storage và Auth.
10. Muốn đăng xuất: mở `/login` → Đăng xuất tài khoản hiện tại.

Nếu Vercel đang bật Deployment Protection yêu cầu người nhận đăng nhập Vercel thì cần điều chỉnh quyền truy cập production trong tài khoản bạn để người nhận xem được. Mật khẩu quà không thay thế cài đặt bảo vệ deployment.

## 8. Chuyển quà từ website cũ

Ở website cũ: mở món quà → Sao lưu dự án JSON. Ở website mới: Nhập dự án JSON → chọn file → nhập mật khẩu nếu đã khóa → kiểm tra → tạo link/QR mới. Làm lần lượt cho những món quà muốn chuyển.

Các link cũ, tài khoản ChatGPT và kho IndexedDB tên miền cũ không tự di chuyển. Không xóa trang cũ/bản JSON khi chưa kiểm tra bản mới mở đúng.

## 9. Giữ miễn phí và sao lưu

- Vercel Hobby miễn phí trong quota cho dự án cá nhân, phi thương mại. Quá quota có thể phải chờ tính năng được mở lại, không phải tài nguyên vô hạn.
- Supabase Free hiện có 500 MB database và 1 GB Storage, kèm giới hạn băng thông/Auth. Nhiều quà có nhạc sẽ dùng Storage khá nhanh. Theo dõi Usage trong dashboard; bớt media không dùng và giữ JSON riêng.
- Free project Supabase có thể pause khi ít hoạt động trong 7 ngày. Khi gặp thông báo pause, vào dashboard để khôi phục; không cần tự nâng cấp Pro chỉ để xử lý việc này. Khôi phục còn phụ thuộc thời hạn giữ dự án của nhà cung cấp.
- Ứng dụng không có bộ đếm thu phí, không gọi AI trả phí, không mua tên miền hay đăng ký gói dịch vụ thay bạn.
- Để dùng miễn phí, giữ cả hai tài khoản ở gói miễn phí và không bật add-on/trial trả phí. Chính sách có thể thay đổi; kiểm tra dashboard trước khi đồng ý bất kỳ nâng cấp nào.
- Giữ JSON định kỳ. Xóa dữ liệu trình duyệt sẽ mất bản nháp/kho trên thiết bị. Code ZIP không khôi phục được dữ liệu đã xóa hoặc mật khẩu quà đã quên.

## Xử lý lỗi thường gặp

| Lỗi | Cách kiểm tra |
| --- | --- |
| Vercel không nhận Next.js | Chọn đúng Root Directory có `package.json` của bản `vercel`, không chọn `website-goc-sites`. |
| Báo thiếu kết nối/kho lưu trữ | Đủ bốn biến, chạy SQL setup, project Supabase không pause, URI đúng Transaction pooler và mật khẩu đúng/đã encode. Sau khi đổi biến hãy redeploy. |
| Đăng nhập không được | Tạo user trong Authentication → Users và xác nhận email; dùng mật khẩu tài khoản, không dùng mật khẩu database hay mật khẩu món quà. |
| Tạo link báo lỗi tệp | Kiểm tra bucket `loi-thuong` private đã tạo bằng SQL, service_role key đúng project. Không lấy publishable key thay service_role. |
| Mở quà trên máy khác trống kho | Kho thiết bị không đồng bộ; gửi **link quà đã tạo**, không chỉ gửi trang chủ. Hoặc nhập JSON vào thiết bị đó. |
| Favicon còn cũ | Tải lại mạnh, đóng/mở tab. Nếu vừa thay logo về sau, đổi phiên bản query trong `app/layout.tsx` để tránh cache. |
| SQL relation does not exist | Chạy đúng `supabase/setup.sql` của bản Vercel trong đúng project. Không dùng SQL SQLite từ bản gốc. |
| Đã đăng nhập nhưng token hết hạn | Tải lại trang, thử đăng xuất rồi đăng nhập lại. Kiểm tra các biến public đúng cùng project; proxy đã kèm để refresh session. |

## Nguồn chính thức (đối chiếu khi đóng gói 19/10/2026 giờ Việt Nam)

- Vercel Hobby: https://vercel.com/docs/plans/hobby
- Giới hạn Function (lý do media dùng upload trực tiếp): https://vercel.com/docs/functions/limitations
- Supabase Free: https://supabase.com/pricing
- Supabase Free pausing: https://supabase.com/docs/guides/platform/free-project-pausing
- Supabase Next.js SSR: https://supabase.com/docs/guides/auth/server-side/nextjs
- Pooler: https://supabase.com/docs/guides/database/connecting-to-postgres
