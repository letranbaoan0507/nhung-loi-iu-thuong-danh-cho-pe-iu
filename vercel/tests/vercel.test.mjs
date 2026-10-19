import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {database,translate} from '../lib/server/database.mjs';
import {trustedHeaders} from '../lib/server/trusted-request.mjs';
import {service} from '../app/lib/service.mjs';
import {defaults} from '../app/lib/model.mjs';
import {uploadDirect} from '../app/lib/upload-direct.mjs';

test('PostgreSQL adapter preserves create/read/update ownership, CAS, transactions, assets and tickets',async()=>{
 const pg=new PGlite(),files=new Map();
 try{
  await pg.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text primary key,name text,public boolean,file_size_limit integer);');
  await pg.exec(readFileSync(new URL('../supabase/setup.sql',import.meta.url),'utf8'));
  const sql={async unsafe(query,params){const result=await pg.query(query,params);return Object.assign(result.rows,{count:result.affectedRows??result.rows.length});},async begin(fn){await pg.exec('BEGIN');try{const out=await fn(sql);await pg.exec('COMMIT');return out;}catch(e){await pg.exec('ROLLBACK');throw e;}}};
  const DB=database(sql),env={DB,BUCKET:{async put(key,bytes){files.set(key,bytes);},async get(key){return files.has(key)?{body:files.get(key)}:null;},async delete(key){files.delete(key);}}};
  const request=(path,method='GET',body,user='owner-A',mime='application/json')=>{const headers=new Headers({'content-type':mime});if(user)headers.set('oai-authenticated-user-id',user);if(method!=='GET')headers.set('origin','https://gift.test');return new Request('https://gift.test'+path,{method,headers,...(body?{body:typeof body==='object'&&!(body instanceof Uint8Array)?JSON.stringify(body):body}:{})});};
  let response=await service(request('/api/assets','POST',new Uint8Array([255,216,255,1]),'owner-A','image/jpeg'),env);assert.equal(response.status,201);const asset=await response.json();
  const c=defaults();c.photos=[{id:crypto.randomUUID(),caption:'Kỷ niệm'}];const payload={title:'Quà gốc',envelope:{v:1,encrypted:false,data:{config:c,manifest:{[c.photos[0].id]:{assetId:asset.id,mime:'image/jpeg',name:'anh.jpg',kind:'photo',iv:''}}}},assetIds:[asset.id]};
  response=await service(request('/api/gifts','POST',payload),env);assert.equal(response.status,201);const gift=await response.json();
  response=await service(request('/api/gifts/'+gift.id,'GET',null,null),env);assert.equal(response.status,200);assert.equal((await response.json()).envelope.data.config.to,c.to);
  response=await service(request('/api/gifts','POST',{...payload,id:gift.id,revision:1,title:'Quà cập nhật'}),env);assert.equal(response.status,200);assert.equal((await response.json()).revision,2);
  response=await service(request('/api/gifts','POST',{...payload,id:gift.id,revision:1}),env);assert.equal(response.status,409);
  response=await service(request('/api/gifts/'+gift.id,'DELETE',null,'owner-B'),env);assert.equal(response.status,403);
  response=await service(request('/api/gifts','GET'),env);const list=await response.json();assert.equal(Number(list.total),1);assert.equal(list.gifts[0].title,'Quà cập nhật');
  await assert.rejects(DB.batch([DB.prepare('UPDATE gifts SET title=? WHERE id=?').bind('Không được ghi',gift.id),DB.prepare('INSERT INTO gifts (id) VALUES (?)').bind(gift.id)]));assert.equal((await DB.prepare('SELECT title FROM gifts WHERE id=?').bind(gift.id).first()).title,'Quà cập nhật');
  const ticket=crypto.randomUUID(),stamp=new Date().toISOString();await DB.prepare('INSERT INTO upload_tickets (id,owner_id,storage_key,mime,bytes,expires_at) VALUES (?,?,?,?,?,?)').bind(ticket,'owner-A','gifts/'+ticket,'image/jpeg',4,'2099-01-01T00:00:00.000Z').run();
  const registered=await DB.batch([DB.prepare('INSERT INTO assets (id,owner_id,gift_id,storage_key,mime,bytes,created_at) SELECT id,owner_id,NULL,storage_key,mime,bytes,? FROM upload_tickets WHERE id=? AND owner_id=? AND cancelled=0 AND expires_at>?').bind(stamp,ticket,'owner-A',stamp),DB.prepare('DELETE FROM upload_tickets WHERE id=? AND owner_id=? AND cancelled=0').bind(ticket,'owner-A')]);assert.equal(registered[0].meta.changes,1);
  response=await service(request('/api/gifts/'+gift.id,'DELETE'),env);assert.equal(response.status,200);assert.equal(files.size,0);
  assert.equal(translate('SELECT id FROM gifts WHERE owner_id=? LIMIT ?'),'SELECT id FROM loithuong.gifts WHERE owner_id=$1 LIMIT $2');
 }finally{await pg.close();}
});

test('Vercel ignores spoofed upstream identity and only inserts a verified account',()=>{
 const request=new Request('https://gift.test/api/gifts',{headers:{'oai-authenticated-user-id':'attacker','oai-authenticated-user-email':'fake@test.com','content-type':'application/json'}});
 assert.equal(trustedHeaders(request,null).get('oai-authenticated-user-id'),null);const safe=trustedHeaders(request,'real-account');assert.equal(safe.get('oai-authenticated-user-id'),'real-account');assert.equal(safe.get('oai-authenticated-user-email'),null);assert.equal(safe.get('content-type'),'application/json');
});

test('12 MB direct upload bypasses Vercel body size, registers once and cleans cancellation',async()=>{
 const realFetch=globalThis.fetch,calls=[],controller=new AbortController(),bytes=new Uint8Array(12*1024*1024);let cancel=false;
 try{
  globalThis.fetch=async(url,init)=>{calls.push({url,init});if(url==='/api/uploads')return Response.json({id:'ticket-id',signedUrl:'https://storage.test/upload?token=scoped'});if(String(url).startsWith('https://storage.test/')){if(cancel){controller.abort();throw new DOMException('Cancelled','AbortError');}return Response.json({Key:'file'});}if(init.method==='DELETE')return Response.json({ok:true});return Response.json({id:'ticket-id',bytes:bytes.length});};
  const result=await uploadDirect(bytes,'audio/mpeg',controller.signal);assert.equal((await result.json()).bytes,bytes.length);assert.equal(calls.find(c=>c.url.startsWith('https://')).init.body.byteLength,12*1024*1024);assert.ok(calls.filter(c=>c.url.startsWith('/api')).every(c=>!c.init.body||c.init.body.length<1000));
  calls.length=0;cancel=true;await assert.rejects(uploadDirect(bytes,'audio/mpeg',controller.signal),{name:'AbortError'});assert.ok(calls.some(c=>c.url==='/api/uploads/ticket-id'&&c.init.method==='DELETE'));assert.equal(calls.filter(c=>c.url==='/api/uploads/ticket-id'&&c.init.method==='POST').length,0);
 }finally{globalThis.fetch=realFetch;}
});
