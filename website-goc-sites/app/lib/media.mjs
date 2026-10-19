import {LIMITS,imageTypes,audioTypes,assetRefs,validateConfig} from './model.mjs';
import {base64,unbase64,sealJSON,openJSON,encryptBytes,decryptBytes} from './crypto.mjs';
export function guessMime(file){const byExt={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',mp3:'audio/mpeg',wav:'audio/wav',ogg:'audio/ogg',m4a:'audio/mp4',aac:'audio/aac',webm:'audio/webm'};return [...imageTypes,...audioTypes].includes(file.type)?file.type:byExt[file.name?.split('.').pop().toLowerCase()]||'';}
// Source files have no application-level byte or pixel limit. Only the optimized
// copy is stored/uploaded; decoding still depends on the device's available memory.
async function decodeImage(blob){
 if(typeof createImageBitmap==='function'){try{return await createImageBitmap(blob);}catch{/* Try the browser's image decoder too. */}}
 const url=URL.createObjectURL(blob),image=document.createElement('img');
 try{await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('Không đọc được ảnh. Hãy thử lưu lại ảnh dưới dạng JPG, PNG hoặc WebP.'));image.src=url;});return {width:image.naturalWidth,height:image.naturalHeight,image,close(){}};}finally{URL.revokeObjectURL(url);}
}
export async function prepareImage(file,kind='photo'){
 const mime=guessMime(file);if(!imageTypes.includes(mime))throw Error('Chọn ảnh JPG, PNG, WebP hoặc GIF.');
 const original=file.slice(0,file.size,mime),target=1024*1024;
 // Small animated GIFs can be kept as-is. Larger GIFs are explicitly identified
 // as still-image conversions so optimization never silently discards motion.
 if(mime==='image/gif'&&file.size<=target)return {blob:original,name:String(file.name||'anh').slice(0,150),mime,kind};
 let bitmap;
 try{
  bitmap=await decodeImage(original);if(!(bitmap.width>0&&bitmap.height>0))throw Error('Ảnh không có kích thước hợp lệ.');
  const maxSide=kind==='background'?1920:1600,scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('Trình duyệt chưa hỗ trợ xử lý ảnh.');
  const type=mime==='image/jpeg'?'image/jpeg':'image/webp';let blob;
  const encode=quality=>new Promise((resolve,reject)=>canvas.toBlob(result=>result?resolve(result):reject(Error('Chưa tối ưu được ảnh. Hãy thử lại.')),type,quality));
  // Bound the stored copy, rather than rejecting large input files. Retain alpha
  // for PNG/sticker inputs, and reduce dimensions only if encoding needs it.
  while(true){
   ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap.image||bitmap,0,0,canvas.width,canvas.height);
   blob=await encode(.9);
   if(blob.size>target&&type==='image/jpeg')blob=await encode(.75);
   if(blob.size<=target)break;
   if(canvas.width===1&&canvas.height===1)throw Error('Trình duyệt không tối ưu được ảnh này.');
   canvas.width=Math.max(1,Math.floor(canvas.width*.75));canvas.height=Math.max(1,Math.floor(canvas.height*.75));
  }
  // Preserve original bytes when already smaller and no resize is needed.
  if(scale===1&&canvas.width===bitmap.width&&canvas.height===bitmap.height&&original.size<blob.size)blob=original;
  return {blob,name:String(file.name||'anh').slice(0,150),mime:blob.type,kind,...(mime==='image/gif'?{note:'GIF lớn đã được chuyển thành ảnh tĩnh để tự tối ưu dung lượng.'}:{})};
 }finally{bitmap?.close();}
}
export async function prepareAudio(file){const mime=guessMime(file);if(!audioTypes.includes(mime))throw Error('Chọn tệp nhạc MP3, M4A, WAV, OGG, AAC hoặc WebM.');if(file.size>LIMITS.asset)throw Error('Tệp nhạc cần nhỏ hơn 12 MB.');return {blob:new Blob([await file.arrayBuffer()],{type:mime}),name:String(file.name||'nhac').slice(0,150),mime,kind:'audio'};}
export function sizeOf(assets){return [...assets.values()].reduce((n,a)=>n+a.blob.size,0);}
export function resolveConfig(config,assets,urls){const src=id=>{if(!id)return '';const a=assets.get(id);if(!a)return '';if(!urls.has(id))urls.set(id,URL.createObjectURL(a.blob));return urls.get(id);};return {...config,backgroundSrc:src(config.background),stickerSrc:src(config.sticker),audioSrc:src(config.audio),photos:config.photos.map(p=>({...p,src:src(p.id)}))};}
export async function portablePacket(config,assets,password=''){config=validateConfig(config);const packed=[];for(const ref of assetRefs(config)){const a=assets.get(ref);if(!a)throw Error('Có ảnh/nhạc chưa tải xong hoặc đã bị mất. Hãy chọn lại tệp.');packed.push({ref,name:a.name,mime:a.mime,kind:a.kind,data:base64(await a.blob.arrayBuffer())});}const value={config,assets:packed},envelope=password?(await sealJSON(value,password)).envelope:{v:1,encrypted:false,data:value};return {format:'loi-thuong-studio',version:1,envelope};}
export async function openPortable(packet,password=''){if(packet?.format!=='loi-thuong-studio'||packet.version!==1)throw Error('Đây không phải bản sao lưu Lời Thương Studio.');const {value}=await openJSON(packet.envelope,password),config=validateConfig(value.config);if(!Array.isArray(value.assets)||value.assets.length>15)throw Error('Danh sách tệp trong bản sao lưu không hợp lệ.');const assets=new Map();let size=0;for(const a of value.assets){if(![...imageTypes,...audioTypes].includes(a.mime)||typeof a.ref!=='string'||!assetRefs(config).includes(a.ref))throw Error('Tệp trong bản sao lưu không hợp lệ.');const bytes=unbase64(a.data);if(bytes.length>LIMITS.asset)throw Error('Tệp trong bản sao lưu vượt dung lượng.');size+=bytes.length;if(size>LIMITS.total)throw Error('Bản sao lưu vượt tổng dung lượng 28 MB.');assets.set(a.ref,{blob:new Blob([bytes],{type:a.mime}),name:String(a.name||'tep').slice(0,150),mime:a.mime,kind:a.kind});}if(assetRefs(config).some(ref=>!assets.has(ref)))throw Error('Bản sao lưu thiếu ảnh hoặc nhạc.');return {config,assets};}
async function api(url,init){const r=await fetch(url,init);if(!r.ok){let b;try{b=await r.json();}catch{}throw Object.assign(Error(b?.error||'Không kết nối được kho lưu trữ.'),{status:r.status});}return r;}
export async function saveOnline(config,assets,password='',saved=null,onProgress=()=>{},{signal,onCommit=()=>{}}={}){
 const checkpoint=()=>signal?.throwIfAborted();
 checkpoint();config=validateConfig(config);if(sizeOf(assets)>LIMITS.total)throw Error('Tổng ảnh và nhạc cần nhỏ hơn 28 MB.');
 const refs=assetRefs(config),manifest=Object.create(null),uploaded=[];let key=null,salt=null,committed=false;
 try{
  if(password){const sealed=await sealJSON({},password);checkpoint();key=sealed.key;salt=sealed.envelope.salt;}
  for(let i=0;i<refs.length;i++){
   checkpoint();const ref=refs[i],a=assets.get(ref);if(!a)throw Error('Thiếu ảnh/nhạc. Hãy chọn lại tệp trước khi lưu.');
   onProgress(`Đang lưu tệp ${i+1} / ${refs.length}…`);checkpoint();let bytes=await a.blob.arrayBuffer(),iv='';checkpoint();
   if(key){const enc=await encryptBytes(bytes,key);checkpoint();bytes=enc.data;iv=enc.iv;}
   const response=await api('/api/assets',{method:'POST',headers:{'Content-Type':key?'application/octet-stream':a.mime},body:bytes,signal}),data=await response.json();
   uploaded.push(data.id);checkpoint();manifest[ref]={assetId:data.id,mime:a.mime,name:a.name,kind:a.kind,iv};
  }
  const value={config,manifest};let envelope;
  if(key){const encoded=new TextEncoder().encode(JSON.stringify(value)),enc=await encryptBytes(encoded,key);checkpoint();envelope={v:1,encrypted:true,salt,iv:enc.iv,data:base64(enc.data)};}else envelope={v:1,encrypted:false,data:value};
  onProgress('Đang hoàn tất link món quà…');checkpoint();
  // Once the atomic write starts, finish it and retain its result. Aborting a
  // response here could conceal an already committed update to an existing gift.
  onCommit();
  const response=await api('/api/gifts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:saved?.id,revision:saved?.revision,title:config.projectName,envelope,assetIds:uploaded})});
  const result=await response.json();committed=true;return {...result,url:new URL(result.url,location.origin).href};
 }finally{
  if(!committed)await Promise.allSettled(uploaded.map(id=>fetch('/api/assets/'+id,{method:'DELETE',signal:AbortSignal.timeout(10000)})));
 }
}
export async function loadGiftHeader(id,password='',record=null,{signal}={}){
 if(!/^[a-f0-9-]{36}$/i.test(id))throw Error('Mã món quà không hợp lệ.');
 signal?.throwIfAborted();
 record??=await (await api('/api/gifts/'+id,{signal})).json();
 if(record.envelope.encrypted&&!password)return {locked:true,record};
 const {value,key}=await openJSON(record.envelope,password),config=validateConfig(value.config);
 signal?.throwIfAborted();
 return {locked:false,config,manifest:value.manifest,key,assets:new Map(),record};
}
function manifestAsset(header,ref){
 const a=header.manifest?.[ref];
 if(!a||!/^[a-f0-9-]{36}$/i.test(a.assetId)||![...imageTypes,...audioTypes].includes(a.mime))throw Error('Thông tin ảnh/nhạc không hợp lệ.');
 return a;
}
export function streamGiftConfig(header){
 if(header.key||header.record.envelope.encrypted)throw Error('Quà có mật khẩu cần giải mã tệp trên thiết bị.');
 const src=ref=>ref?'/api/assets/'+manifestAsset(header,ref).assetId:'',c=header.config;
 return {...c,backgroundSrc:src(c.background),stickerSrc:src(c.sticker),audioSrc:src(c.audio),photos:c.photos.map(p=>({...p,src:src(p.id)}))};
}
export async function loadGiftAssets(header,onProgress=()=>{},{signal,onAsset=()=>{},concurrency=3}={}){
 const refs=assetRefs(header.config);for(const ref of refs)manifestAsset(header,ref);
 let cursor=0,done=0,total=0;
 async function worker(){
  while(cursor<refs.length){
   signal?.throwIfAborted();const ref=refs[cursor++],a=manifestAsset(header,ref);
   const result=await api('/api/assets/'+a.assetId,{signal});let bytes=await result.arrayBuffer();
   if(header.key)bytes=await decryptBytes(bytes,header.key,a.iv);signal?.throwIfAborted();
   total+=bytes.byteLength;if(bytes.byteLength>LIMITS.asset||total>LIMITS.total)throw Error('Nội dung vượt dung lượng hỗ trợ.');
   header.assets.set(ref,{blob:new Blob([bytes],{type:a.mime}),name:String(a.name||'tep').slice(0,150),mime:a.mime,kind:a.kind});
   onProgress(`Đang chuẩn bị ảnh và nhạc ${++done} / ${refs.length}…`);onAsset(ref);
  }
 }
 await Promise.all(Array.from({length:Math.min(Math.max(1,concurrency),refs.length)},worker));return header;
}
export async function loadOnline(id,password='',onProgress=()=>{}){
 const result=await loadGiftHeader(id,password);if(result.locked)return result;
 return loadGiftAssets(result,onProgress);
}
export async function listOnline(offset=0){return (await api('/api/gifts?offset='+offset+'&limit=24')).json();}
export async function deleteOnline(id){return (await api('/api/gifts/'+id,{method:'DELETE'})).json();}
