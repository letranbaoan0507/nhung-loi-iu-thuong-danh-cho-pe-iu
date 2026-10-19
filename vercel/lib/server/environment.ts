import 'server-only';
import postgres from 'postgres';
import {database} from './database.mjs';
import {bucket} from './storage';
let sql:ReturnType<typeof postgres>|undefined;
export function environment(){if(!process.env.DATABASE_URL)throw Error('Chưa cấu hình DATABASE_URL');sql??=postgres(process.env.DATABASE_URL,{prepare:false,max:1,idle_timeout:20,connect_timeout:10,ssl:'require',types:{bigint:{to:20,from:[20],serialize:String,parse:Number}}});return {DB:database(sql),BUCKET:bucket()};}
