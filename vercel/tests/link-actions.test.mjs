import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {IDBFactory} from 'fake-indexeddb';
import {defaults} from '../app/lib/model.mjs';
import {saveOnline,portablePacket,openPortable} from '../app/lib/media.mjs';
import {startEditor} from '../app/lib/editor.mjs';
import {service} from '../app/lib/service.mjs';
import {environment} from './support.mjs';
const wait=ms=>new Promise(r=>setTimeout(r,ms));async function until(fn){for(let i=0;i<150;i++){if(await fn())return;await wait(10);}throw Error('Link action did not finish');}
test('old-link import preserves full media and encryption; deletion requires consent and keeps local copies',async()=>{
 const w=new Window({url:'https://gift.test'}),previous=new Map(),fake=new IDBFactory(),env=environment(),calls=[];let db,dispose,confirmChoice=true,allowDelete=false;
 const oldFetch=globalThis.fetch,globals={window:w,document:w.document,navigator:w.navigator,location:w.location,indexedDB:fake,requestAnimationFrame:()=>1,cancelAnimationFrame(){},ResizeObserver:w.ResizeObserver,confirm:()=>confirmChoice};
 for(const[k,v]of Object.entries(globals)){previous.set(k,Object.getOwnPropertyDescriptor(globalThis,k));Object.defineProperty(globalThis,k,{value:v,configurable:true,writable:true});}
 w.HTMLMediaElement.prototype.play=()=>Promise.resolve();w.HTMLMediaElement.prototype.pause=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>null;
 const get=(store,key)=>new Promise(resolve=>{const r=db.transaction(store).objectStore(store)[key===undefined?'getAll':'get'](key);r.onsuccess=()=>resolve(r.result);});
 const put=(store,item)=>new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(item);tx.oncomplete=resolve;tx.onerror=reject;});
 try{
  globalThis.fetch=async(path,options={})=>{const method=options.method||'GET';calls.push({path,method});if(method==='DELETE'&&!allowDelete)return Response.json({error:'Bạn không có quyền xóa món quà này.'},{status:403});const headers=new Headers(options.headers);headers.set('oai-authenticated-user-id','owner-A');if(method!=='GET')headers.set('origin','https://gift.test');return service(new Request('https://gift.test'+path,{...options,headers}),env);};
  const c=defaults(),photo=crypto.randomUUID(),audio=crypto.randomUUID(),photoBytes=new Uint8Array([255,216,255,1,2,3,4,5]),audioBytes=new Uint8Array([73,68,51,4,0,0,0,0,0,0]);c.projectName='Quà cũ cần giữ';c.photos=[{id:photo,caption:'Kỷ niệm'}];c.audio=audio;
  const assets=new Map([[photo,{name:'anh.jpg',mime:'image/jpeg',kind:'photo',blob:new Blob([photoBytes],{type:'image/jpeg'})}],[audio,{name:'nhac.mp3',mime:'audio/mpeg',kind:'audio',blob:new Blob([audioBytes],{type:'audio/mpeg'})}]]);
  const plain=await saveOnline(c,assets),locked=await saveOnline(c,assets,'giu-mat-khau'),other=await saveOnline(defaults(),new Map());calls.length=0;
  const packet=await portablePacket(c,assets),sealed=await portablePacket(c,assets,'giu-mat-khau');
  db=await new Promise((resolve,reject)=>{const r=fake.open('LoiThuongStudio',2);r.onupgradeneeded=()=>{for(const n of ['drafts','projects'])r.result.createObjectStore(n,{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=reject;});
  await put('projects',{id:'existing',title:c.projectName,packet,saved:plain,updated:'2026-01-01T00:00:00.000Z'});await put('projects',{id:'existing-locked',title:'Quà có mật khẩu',packet:sealed,saved:locked,updated:'2026-01-02T00:00:00.000Z'});
  const draft=defaults();draft.projectName='Bản nháp đang sửa';await put('drafts',{id:'current',config:draft,assets:[],saved:plain,localId:null,lock:false});
  const original=await get('projects');const root=w.document.createElement('div');w.document.body.append(root);dispose=startEditor(root,{canSave:true});await until(()=>root.querySelector('[data-field="projectName"]').value===draft.projectName);root.querySelector('[data-action="nav-library"]').click();await until(()=>root.querySelector('#oldGiftImportForm'));
  function submitLink(url){root.querySelector('#oldGiftLink').value=url;root.querySelector('#oldGiftImportForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));}
  const beforeCalls=calls.length;submitLink('https://evil.test/g/'+plain.id);await until(()=>root.querySelector('#stToast').textContent.includes('chính website'));assert.equal(calls.length,beforeCalls);assert.deepEqual(await get('projects'),original);
  submitLink(plain.url);await until(async()=>(await get('projects')).length===3);await until(()=>root.querySelector('#oldGiftImportForm'));
  const imported=(await get('projects')).find(x=>!original.some(old=>old.id===x.id));const restored=await openPortable(imported.packet);assert.equal(imported.saved.id,plain.id);assert.deepEqual(new Uint8Array(await restored.assets.get(photo).blob.arrayBuffer()),photoBytes);assert.deepEqual(new Uint8Array(await restored.assets.get(audio).blob.arrayBuffer()),audioBytes);assert.deepEqual((await get('projects')).find(x=>x.id==='existing'),original.find(x=>x.id==='existing'));
  submitLink(locked.url);await until(()=>root.querySelector('#unlockEditorForm'));const unlock=async pass=>{root.querySelector('#unlockEditorPassword').value=pass;root.querySelector('#unlockEditorForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));};
  await unlock('sai-mat-khau');await until(()=>root.querySelector('#unlockEditorError').textContent.includes('Mật khẩu'));assert.equal((await get('projects')).length,3);
  await unlock('giu-mat-khau');await until(async()=>(await get('projects')).length===4);await until(()=>root.querySelector('#oldGiftImportForm'));
  const importedLocked=(await get('projects')).find(x=>x.id!=='existing-locked'&&x.saved?.id===locked.id);assert.equal(importedLocked.packet.envelope.encrypted,true);assert.ok(!JSON.stringify(importedLocked).includes('giu-mat-khau'));const decoded=await openPortable(importedLocked.packet,'giu-mat-khau');assert.deepEqual(new Uint8Array(await decoded.assets.get(audio).blob.arrayBuffer()),audioBytes);assert.ok(calls.every(x=>x.method==='GET'));assert.equal((await get('drafts','current')).config.projectName,draft.projectName);
  const beforeDelete=await get('projects'),deleteButton=()=>root.querySelector('[data-action="delete-online"][data-id="'+plain.id+'"]');
  confirmChoice=false;deleteButton().click();await wait(20);assert.equal(calls.filter(x=>x.method==='DELETE').length,0);assert.deepEqual(await get('projects'),beforeDelete);
  confirmChoice=true;deleteButton().click();await until(()=>root.querySelector('#stToast').textContent.includes('không có quyền'));assert.deepEqual(await get('projects'),beforeDelete);assert.equal(env.sql.prepare('SELECT COUNT(*) AS n FROM gifts').get().n,3);
  allowDelete=true;deleteButton().click();await until(()=>root.querySelector('#stToast').textContent.includes('Đã xóa link'));const after=await get('projects');assert.equal(after.length,4);for(const item of beforeDelete){const next=after.find(x=>x.id===item.id);assert.deepEqual(next.packet,item.packet);assert.deepEqual(next.saved,item.saved?.id===plain.id?null:item.saved);}const savedDraft=await get('drafts','current');assert.deepEqual(savedDraft.config,draft);assert.equal(savedDraft.saved,null);
  assert.equal(deleteButton(),null);assert.equal(env.sql.prepare('SELECT COUNT(*) AS n FROM gifts').get().n,2);assert.equal((await fetch('/api/gifts/'+plain.id)).status,404);assert.equal((await fetch('/api/gifts/'+locked.id)).status,200);assert.equal((await fetch('/api/gifts/'+other.id)).status,200);
 }finally{dispose?.();db?.close();env.sql.close();globalThis.fetch=oldFetch;w.happyDOM.abort();w.close();for(const[k,d]of previous){if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];}}
});
