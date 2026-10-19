import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
export async function GET(){try{if(!env.DB||!env.BUCKET)return Response.json({ready:false},{status:503,headers:{'Cache-Control':'no-store'}});await env.DB.prepare('SELECT id FROM gifts LIMIT 1').first();return Response.json({ready:true,version:1},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({ready:false},{status:503,headers:{'Cache-Control':'no-store'}});}}
