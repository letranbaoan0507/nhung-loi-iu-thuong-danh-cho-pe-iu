import type {NextConfig} from "next";
const config:NextConfig={
 env:{NEXT_PUBLIC_STORAGE_TRANSPORT:"supabase"},
 async headers(){return [{source:'/g/:id',headers:[{key:'Content-Disposition',value:'inline'}]}];}
};
export default config;

