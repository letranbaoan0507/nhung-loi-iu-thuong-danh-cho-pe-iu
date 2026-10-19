import StudioClient from '../../studio-client';
export const dynamic='force-dynamic';
export const viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#0b0d17'};
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;return {title:'Một món quà dành cho bạn · Lời Thương',robots:{index:false,follow:false},manifest:'/g/'+encodeURIComponent(id)+'/manifest.webmanifest',appleWebApp:{capable:true,title:'Lời Thương',statusBarStyle:'black-translucent'}};}
export default async function GiftPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <StudioClient giftId={id}/>;}

