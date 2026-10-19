import {configured} from '@/lib/supabase/server';
import {environment} from '@/lib/server/environment';
export const dynamic='force-dynamic';
export async function GET(){try{if(!configured())throw Error();await environment().DB.prepare('SELECT id FROM gifts LIMIT 1').first();return Response.json({ready:true},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({ready:false},{status:503,headers:{'Cache-Control':'no-store'}});}}
