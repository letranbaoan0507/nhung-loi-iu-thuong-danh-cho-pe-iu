import {configured,verifiedUser} from '@/lib/supabase/server';
import {environment} from './environment';
import {storage} from './storage';
import {LIMITS,imageTypes,audioTypes} from '@/app/lib/model.mjs';
import {signatureOK} from '@/app/lib/service.mjs';
const ID=/^[a-f0-9-]{36}$/i;
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function uploads(request:Request){
 if(!configured())return json({error:'Chưa cấu hình Supabase.'},503);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Yêu cầu không cùng nguồn.'},403);
 try{
  const user=await verifiedUser();if(!user)return json({error:'Đăng nhập để lưu món quà.'},401);
  const env=environment(),id=new URL(request.url).pathname.split('/')[3];
  if(id&&!ID.test(id))return json({error:'Mã tệp không hợp lệ.'},400);
  if(request.method==='POST'&&!id){
   if(Number(request.headers.get('content-length')||0)>4096)return json({error:'Yêu cầu quá lớn.'},413);
   const body=await request.json();if(![...imageTypes,...audioTypes,'application/octet-stream'].includes(body.mime)||!Number.isInteger(body.size)||body.size<1||body.size>LIMITS.asset+32)return json({error:'Định dạng hoặc dung lượng tệp không hợp lệ.'},400);
   // Remove expired staging objects for this owner; never touch linked gifts.
   const stale=(await env.DB.prepare('SELECT id,storage_key FROM upload_tickets WHERE owner_id=? AND expires_at<? LIMIT 20').bind(user.id,new Date().toISOString()).all()).results;
   for(const item of stale){const {error}=await storage().remove([item.storage_key]);if(!error)await env.DB.prepare('DELETE FROM upload_tickets WHERE id=? AND owner_id=?').bind(item.id,user.id).run();}
   const aid=crypto.randomUUID(),key='gifts/'+aid;
   await env.DB.prepare('INSERT INTO upload_tickets (id,owner_id,storage_key,mime,bytes,expires_at) VALUES (?,?,?,?,?,?)').bind(aid,user.id,key,body.mime,body.size,new Date(Date.now()+3*60*60*1000).toISOString()).run();
   const {data,error}=await storage().createSignedUploadUrl(key,{upsert:false});if(error){await env.DB.prepare('DELETE FROM upload_tickets WHERE id=? AND owner_id=?').bind(aid,user.id).run();throw error;}
   return json({id:aid,signedUrl:data.signedUrl},201);
  }
  if(!id)return json({error:'Không hỗ trợ thao tác này.'},405);
  const ticket=await env.DB.prepare('SELECT * FROM upload_tickets WHERE id=? AND owner_id=?').bind(id,user.id).first();
  if(!ticket)return json({error:'Phiên tải tệp không còn tồn tại.'},404);
  if(request.method==='DELETE'){
   // Keep cancelled ticket until expiry so a late in-flight upload is swept too.
   await env.DB.prepare('UPDATE upload_tickets SET cancelled=1 WHERE id=? AND owner_id=?').bind(id,user.id).run();
   await storage().remove([ticket.storage_key]);return json({ok:true});
  }
  if(request.method==='POST'){
   if(ticket.cancelled||ticket.expires_at<new Date().toISOString())return json({error:'Phiên tải tệp đã hủy hoặc hết hạn.'},409);
   const {data,error}=await storage().download(ticket.storage_key);if(error)throw error;
   if(data.size!==ticket.bytes||data.size>LIMITS.asset+32)return json({error:'Dung lượng tệp tải lên không khớp.'},400);
   const bytes=new Uint8Array(await data.arrayBuffer());if(!signatureOK(bytes,ticket.mime))return json({error:'Tệp không khớp định dạng đã chọn.'},415);
   const stamp=new Date().toISOString();
   const result=await env.DB.batch([
    env.DB.prepare('INSERT INTO assets (id,owner_id,gift_id,storage_key,mime,bytes,created_at) SELECT id,owner_id,NULL,storage_key,mime,bytes,? FROM upload_tickets WHERE id=? AND owner_id=? AND cancelled=0 AND expires_at>?').bind(stamp,id,user.id,stamp),
    env.DB.prepare('DELETE FROM upload_tickets WHERE id=? AND owner_id=? AND cancelled=0').bind(id,user.id)
   ]);
   if(result[0].meta.changes!==1)return json({error:'Phiên tải tệp đã hủy.'},409);
   return json({id,bytes:bytes.length},201);
  }
  return json({error:'Không hỗ trợ thao tác này.'},405);
 }catch{return json({error:'Chưa tải được tệp. Kiểm tra kết nối và cấu hình kho rồi thử lại.'},503);}
}
