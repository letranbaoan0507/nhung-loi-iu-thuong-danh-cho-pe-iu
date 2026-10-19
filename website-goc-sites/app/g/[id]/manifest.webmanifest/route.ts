import {giftManifest} from '../../../lib/gift-manifest.mjs';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 try{return Response.json(giftManifest(id),{headers:{'Content-Type':'application/manifest+json','Cache-Control':'public, max-age=3600'}});}
 catch{return new Response('Not found',{status:404});}
}
