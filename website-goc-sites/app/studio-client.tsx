'use client';
import { useEffect, useRef } from 'react';
import { startEditor } from './lib/editor.mjs';
import { startViewer } from './lib/viewer.mjs';
import { giftStyles } from './lib/gift-style.mjs';
export default function StudioClient({canSave=false,giftId,signinPath}:{canSave?:boolean;giftId?:string;signinPath?:string}) {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!ref.current)return;return giftId?startViewer(ref.current,giftId):startEditor(ref.current,{canSave,signinPath});},[canSave,giftId,signinPath]);
 return <><style>{giftStyles}</style><div ref={ref}><div className={giftId?'st-viewer-loading':'st-initial'}><span>♡</span><p>Đang chuẩn bị một chút dịu dàng…</p></div></div></>;
}
