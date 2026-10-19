import StudioClient from '../../studio-client';
export const dynamic='force-dynamic';
export const metadata={title:'Một món quà dành cho bạn · Lời Thương',robots:{index:false,follow:false}};
export default async function GiftPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <StudioClient giftId={id}/>;}
