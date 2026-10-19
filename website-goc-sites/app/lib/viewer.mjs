import {loadGiftHeader,loadGiftAssets,streamGiftConfig,resolveConfig} from './media.mjs';
import {giftEntryHTML,orientationPromptHTML} from './gift-entry.mjs';
import {mountGift} from './gift-runtime.mjs';
export function startViewer(root,id){
 let player=null,disposed=false,requested=false,current=null;
 const urls=new Map(),preloads=new Set(),controller=new AbortController(),$=s=>root.querySelector(s);
 root.innerHTML=giftEntryHTML();
 const portrait=window.matchMedia?.('(orientation: portrait) and (pointer: coarse)');
 function orientation(){
  const host=$('#receivedGift')||$('.st-viewer-entry')||$('.st-viewer-unlock')||root;
  if(!host.querySelector('.gf-orientation'))host.insertAdjacentHTML('beforeend',orientationPromptHTML());
  player?.setOrientationBlocked(!!portrait?.matches);
 }
 portrait?.addEventListener?.('change',orientation);if(!portrait?.addEventListener)portrait?.addListener?.(orientation);
 window.addEventListener('resize',orientation);orientation();
 function note(message){const el=$('#viewerStatus')||$('.gf-intro-note');if(el)el.textContent=message;}
 function failure(error){if(disposed||controller.signal.aborted)return;note(error.message||'Chưa kết nối được món quà. Hãy thử lại.');if(!$('#viewerRetry')){const b=document.createElement('button');b.id='viewerRetry';b.className='st-viewer-retry';b.textContent='Thử lại';b.addEventListener('click',()=>location.reload());($('.gf-intro')||$('.st-viewer-unlock')||root).append(b);}}
 function preloadPhotos(config){
  let cursor=0;const photos=config.photos||[];
  function next(){if(disposed||cursor>=photos.length)return;const image=document.createElement('img');preloads.add(image);image.onload=image.onerror=()=>{preloads.delete(image);if(!disposed)next();};image.src=photos[cursor++].src;}
  for(let i=0;i<Math.min(3,photos.length);i++)next();
 }
 function install(header){
  if(disposed)return;current=header;
  root.innerHTML='<main class="st-viewer-page"><div id="receivedGift"></div></main>';
  const config=header.key?resolveConfig(header.config,header.assets,urls):streamGiftConfig(header);
  player=mountGift($('#receivedGift'),config,{autoStart:false,muted:false,waitForImages:true});
  orientation();
  document.title=header.config.projectName+' · Lời Thương';
  if(requested)player.start();
  if(header.key){
   loadGiftAssets(header,message=>{if(!disposed&&!player.getState().started)note(message);},{signal:controller.signal,onAsset:()=>{if(!disposed)player.setConfig(resolveConfig(header.config,header.assets,urls));}}).then(()=>{if(!disposed&&!player.getState().started)note('Chạm để bắt đầu lời chúc và nhạc.');}).catch(failure);
  }else preloadPhotos(config);
 }
 function unlock(){
  if(disposed)return;
  root.innerHTML='<main class="st-viewer-page"><section class="st-viewer-unlock"><div class="st-unlock-heart">♡</div><span>MỘT LỜI THƯƠNG RIÊNG</span><h1>Món quà này<br>có một chiếc chìa khóa.</h1><p>Nhập mật khẩu người gửi đã dành riêng cho bạn.</p><form id="giftUnlock"><label class="st-field"><span>Mật khẩu món quà</span><input id="viewerPassword" type="password" autocomplete="current-password" required></label><button class="st-button primary full" type="submit">Mở lời thương →</button><p id="viewerStatus" class="st-form-error" role="status"></p></form></section></main>';
  orientation();$('#giftUnlock').addEventListener('submit',async event=>{
   event.preventDefault();const button=$('#giftUnlock button');button.disabled=true;note('Đang mở khóa lời thương…');
   try{const header=await loadGiftHeader(id,$('#viewerPassword').value,current.record,{signal:controller.signal});requested=false;install(header);}
   catch(error){failure(error);}finally{if(button.isConnected)button.disabled=false;}
  });
 }
 function click(event){if(!event.target.closest('[data-viewer-open]'))return;requested=true;if(current?.locked)unlock();else if(player)player.start();else note('Đang kết nối món quà…');}
 root.addEventListener('click',click);
 loadGiftHeader(id,'',null,{signal:controller.signal}).then(header=>{if(disposed)return;current=header;if(header.locked){if(requested)unlock();else note('Món quà có mật khẩu. Bấm mở để nhập mật khẩu.');}else install(header);}).catch(failure);
 return ()=>{disposed=true;controller.abort();portrait?.removeEventListener?.('change',orientation);if(!portrait?.removeEventListener)portrait?.removeListener?.(orientation);window.removeEventListener('resize',orientation);root.removeEventListener('click',click);player?.destroy();for(const image of preloads){image.onload=image.onerror=null;image.removeAttribute('src');}preloads.clear();for(const url of urls.values())URL.revokeObjectURL(url);};
}
