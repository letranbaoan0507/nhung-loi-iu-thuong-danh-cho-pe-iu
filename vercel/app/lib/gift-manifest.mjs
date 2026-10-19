export function giftManifest(id){
 if(!/^[a-f0-9-]{36}$/i.test(id))throw Error('Mã món quà không hợp lệ.');
 return {id:'/g/'+id,name:'Lời Thương · Món quà',short_name:'Lời Thương',start_url:'/g/'+id,scope:'/',display:'standalone',background_color:'#0b0d17',theme_color:'#0b0d17',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/logo-an-original.jpg',sizes:'512x512',type:'image/jpeg'}]};
}
