// Compatibility name retained so the original editor and home page stay intact.
import {verifiedUser} from '@/lib/supabase/server';
export async function getChatGPTUser(){const user=await verifiedUser();return user?{userId:user.id,email:user.email||'',displayName:user.email||''}:null;}
export function chatGPTSignInPath(_returnTo:string){return '/login';}
