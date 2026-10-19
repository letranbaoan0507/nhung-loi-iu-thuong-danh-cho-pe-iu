'use client';
import { useEffect, useRef } from 'react';
import {giftEntryHTML} from './lib/gift-entry.mjs';
import { giftStyles } from './lib/gift-style.mjs';
export default function StudioClient({canSave=false,giftId,signinPath}:{canSave?:boolean;giftId?:string;signinPath?:string}) {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let cancelled=false,dispose:(()=>void)|undefined;
  async function mount(){
   if(giftId){const {startViewer}=await import('./lib/viewer.mjs');if(!cancelled&&ref.current)dispose=startViewer(ref.current,giftId);}
   else{const {startEditor}=await import('./lib/editor.mjs');if(!cancelled&&ref.current)dispose=startEditor(ref.current,{canSave,signinPath});}
  }
  mount().catch(()=>{if(!cancelled&&ref.current){const note=ref.current.querySelector('[role="status"]');if(note)note.textContent='Chưa kết nối được. Hãy tải lại trang để thử lại.';}});
  return ()=>{cancelled=true;dispose?.();};
 },[canSave,giftId,signinPath]);
 return <><style>{giftStyles}</style>{giftId?<div ref={ref} dangerouslySetInnerHTML={{__html:giftEntryHTML()}}/>:<div ref={ref}><div className="st-initial"><span>♡</span><p>Đang chuẩn bị một chút dịu dàng…</p></div></div>}</>;
}

