import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Lời Thương Studio · Gửi một chút dịu dàng',description:'Tự tạo món quà hoạt cảnh từ form: lời chúc, robot phát sáng, ảnh và nhạc. Xem trước, tạo link/QR và tải file HTML.',icons:{icon:[{url:'/favicon.ico?v=an-20261019',sizes:'any'},{url:'/icon-192.png',type:'image/png',sizes:'192x192'}],shortcut:'/favicon.ico?v=an-20261019',apple:'/apple-touch-icon.png'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="vi"><body>{children}</body></html>;}
