import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {IDBFactory} from 'fake-indexeddb';
import {defaults} from '../app/lib/model.mjs';
import {portablePacket,openPortable} from '../app/lib/media.mjs';
import {startEditor} from '../app/lib/editor.mjs';
const wait=ms=>new Promise(r=>setTimeout(r,ms));async function until(fn){for(let i=0;i<100;i++){if(fn())return;await wait(15);}throw Error('Library did not finish');}
test('old local packets survive and account gifts have cards, QR and complete JSON backups',async()=>{
 const w=new Window({url:'https://gift.test'}),previous=new Map(),fake=new IDBFactory(),oldFetch=globalThis.fetch,blobs=new Map(),downloads=[],calls=[];let dispose,db;
 const globals={window:w,document:w.document,navigator:w.navigator,location:w.location,indexedDB:fake,requestAnimationFrame:()=>1,cancelAnimationFrame(){},ResizeObserver:w.ResizeObserver,confirm:()=>true};
 for(const[k,v]of Object.entries(globals)){previous.set(k,Object.getOwnPropertyDescriptor(globalThis,k));Object.defineProperty(globalThis,k,{value:v,configurable:true,writable:true});}
 const realCreate=URL.createObjectURL,realRevoke=URL.revokeObjectURL;URL.createObjectURL=b=>{const url='blob:test-'+blobs.size;blobs.set(url,b);return url;};URL.revokeObjectURL=()=>{};
 w.HTMLMediaElement.prototype.play=()=>Promise.resolve();w.HTMLMediaElement.prototype.pause=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>null;w.HTMLAnchorElement.prototype.click=function(){if(this.download)downloads.push({name:this.download,blob:blobs.get(this.href)});};
 try{
  const c=defaults(),photo=crypto.randomUUID(),gift=crypto.randomUUID();c.projectName='Kỷ niệm cũ cần giữ';c.photos=[{id:photo,caption:'Ảnh thật'}];const bytes=new Uint8Array([255,216,255,1,2]),assets=new Map([[photo,{mime:'image/jpeg',kind:'photo',name:'anh.jpg',blob:new Blob([bytes],{type:'image/jpeg'})}]]),plain=await portablePacket(c,assets),locked=await portablePacket(c,assets,'giu-mat-khau');
  db=await new Promise((resolve,reject)=>{const r=fake.open('LoiThuongStudio',2);r.onupgradeneeded=()=>{for(const n of ['drafts','projects'])r.result.createObjectStore(n,{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=reject;});
  const legacy=[{id:'plain-old',title:c.projectName,packet:plain,saved:{id:gift,url:'https://gift.test/g/'+gift},updated:'2026-01-01T00:00:00.000Z'},{id:'locked-old',title:'Bản đã khóa',packet:locked,saved:null,updated:'2026-01-02T00:00:00.000Z'}];
  await new Promise((resolve,reject)=>{const tx=db.transaction('projects','readwrite');for(const item of legacy)tx.objectStore('projects').put(item);tx.oncomplete=resolve;tx.onerror=reject;});
  const before=await new Promise(resolve=>{const r=db.transaction('projects').objectStore('projects').getAll();r.onsuccess=()=>resolve(r.result);});
  globalThis.fetch=async(url,options={})=>{calls.push({url,method:options.method||'GET'});if(String(url).startsWith('/api/gifts?'))return Response.json({gifts:[{id:gift,title:c.projectName,updated_at:'2026-01-01T00:00:00.000Z'}],total:1});if(url==='/api/gifts/'+gift)return Response.json({id:gift,revision:1,envelope:{v:1,encrypted:false,data:{config:c,manifest:{[photo]:{assetId:photo,mime:'image/jpeg',kind:'photo',name:'anh.jpg'}}}}});if(url==='/api/assets/'+photo)return new Response(bytes,{headers:{'content-type':'image/jpeg'}});throw Error('Unexpected request '+url);};
  const root=w.document.createElement('div');w.document.body.append(root);dispose=startEditor(root,{canSave:true});root.querySelector('[data-action="nav-library"]').click();await until(()=>root.querySelector('#onlineGiftLibrary .st-gift-card'));
  assert.equal(root.querySelectorAll('#giftLibrary>.st-library-grid>.st-gift-card').length,2);assert.ok(root.querySelector('.st-gift-cover img').src.startsWith('data:image/jpeg;base64,'));assert.ok(root.querySelector('.st-cover-lock'));assert.ok(root.querySelector('[data-action="share-online"]'));assert.equal(root.querySelectorAll('#onlineGiftLibrary .st-gift-card').length,1,'linked cloud gift also remains visible when already in local collection');
  root.querySelector('[data-action="backup-online"]').click();await until(()=>downloads.length===1);const packet=JSON.parse(await downloads[0].blob.text()),restored=await openPortable(packet);assert.equal(restored.config.projectName,c.projectName);assert.deepEqual(new Uint8Array(await restored.assets.get(photo).blob.arrayBuffer()),bytes);
  const after=await new Promise(resolve=>{const r=db.transaction('projects').objectStore('projects').getAll();r.onsuccess=()=>resolve(r.result);});assert.deepEqual(after,before);assert.ok(calls.every(r=>r.method==='GET'));assert.ok(!JSON.stringify(after.find(x=>x.id==='locked-old')).includes('giu-mat-khau'));
 }finally{dispose?.();db?.close();globalThis.fetch=oldFetch;URL.createObjectURL=realCreate;URL.revokeObjectURL=realRevoke;w.happyDOM.abort();w.close();for(const[k,d]of previous){if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];}}
});
