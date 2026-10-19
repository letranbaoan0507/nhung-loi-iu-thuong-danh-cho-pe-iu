// Manual cleanup only: never removes any file referenced by an existing gift.
import postgres from 'postgres';
import {createClient} from '@supabase/supabase-js';
if(!process.argv.includes('--apply')){console.log('Chạy node --env-file=.env.local scripts/cleanup-storage.mjs --apply để dọn phiên tải đã hết hạn và tệp chưa gắn quá 24 giờ. Hãy giữ bản sao lưu JSON trước khi dọn.');process.exit(0);}
for(const name of ['DATABASE_URL','NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'])if(!process.env[name])throw Error('Thiếu '+name);
const sql=postgres(process.env.DATABASE_URL,{prepare:false,max:1,ssl:'require'}),storage=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}}).storage.from('loi-thuong');
try{
 const now=new Date().toISOString(),before=new Date(Date.now()-24*60*60*1000).toISOString();let total=0;
 const tickets=await sql`SELECT id,storage_key FROM loithuong.upload_tickets WHERE expires_at<${now}`;
 for(const item of tickets){const {error}=await storage.remove([item.storage_key]);if(!error){await sql`DELETE FROM loithuong.upload_tickets WHERE id=${item.id}`;total++;}}
 const assets=await sql`SELECT id,storage_key FROM loithuong.assets WHERE gift_id IS NULL AND created_at<${before}`;
 for(const item of assets){await sql.begin(async tx=>{const current=await tx`SELECT gift_id FROM loithuong.assets WHERE id=${item.id} FOR UPDATE`;if(current[0]&&current[0].gift_id===null){const {error}=await storage.remove([item.storage_key]);if(!error){await tx`DELETE FROM loithuong.assets WHERE id=${item.id} AND gift_id IS NULL`;total++;}}});}
 console.log('Đã dọn',total,'tệp/phiên tải chưa dùng.');
}finally{await sql.end();}
