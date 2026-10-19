import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export const configured=()=>!!(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY&&process.env.SUPABASE_SERVICE_ROLE_KEY&&process.env.DATABASE_URL);
export async function serverClient(){
 const jar=await cookies();
 return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{
  cookies:{
   getAll:()=>jar.getAll(),
   setAll(values){
    try{for(const {name,value,options}of values)jar.set(name,value,options);}
    catch{/* Proxy refreshes cookies for server components. */}
   }
  }
 });
}
export async function verifiedUser(){if(!configured())return null;const client=await serverClient();const {data,error}=await client.auth.getUser();return error?null:data.user;}
