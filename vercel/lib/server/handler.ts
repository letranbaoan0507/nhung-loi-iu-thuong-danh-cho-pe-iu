import {trustedHeaders} from './trusted-request.mjs';
import {service} from '@/app/lib/service.mjs';
import {environment} from './environment';
import {configured,verifiedUser} from '@/lib/supabase/server';
import {storage} from './storage';
export async function handle(request:Request){
 if(!configured())return Response.json({error:'Chưa cấu hình kho Supabase. Bạn vẫn có thể lưu trên thiết bị và tải JSON.'},{status:503});
 try{
  const user=await verifiedUser(),headers=trustedHeaders(request,user?.id);
  const env=environment(),url=new URL(request.url),id=url.pathname.match(/^\/api\/assets\/([a-f0-9-]{36})$/i)?.[1];
  // Redirect downloads to Storage to preserve the 12 MB music allowance on Vercel.
  if(request.method==='GET'&&id){const asset=await env.DB.prepare('SELECT storage_key,gift_id,owner_id FROM assets WHERE id=?').bind(id).first();if(!asset||(!asset.gift_id&&asset.owner_id!==user?.id))return Response.json({error:'Không tìm thấy tệp.'},{status:404});const {data,error}=await storage().createSignedUrl(asset.storage_key,600);if(error)throw error;return new Response(null,{status:307,headers:{Location:data.signedUrl,'Cache-Control':'private, no-store'}});}
  return await service(new Request(request,{headers}),env);
 }catch{return Response.json({error:'Chưa kết nối được kho lưu trữ. Kiểm tra cấu hình Supabase rồi thử lại.'},{status:503});}
}
