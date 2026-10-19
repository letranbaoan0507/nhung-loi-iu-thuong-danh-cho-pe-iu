// File bytes travel straight to Storage, outside Vercel's function body limit.
export async function uploadDirect(bytes,mime,signal){
 let ticket,registered=false;
 const checked=async response=>{if(!response.ok){let message;try{message=(await response.json()).error;}catch{}throw Error(message||'Chưa tải được tệp lên kho.');}return response;};
 try{
  signal?.throwIfAborted();
  // Complete the tiny ticket request even if cancelled, so its ID can be cleaned.
  ticket=await (await checked(await fetch('/api/uploads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mime,size:bytes.byteLength})}))).json();
  signal?.throwIfAborted();
  await checked(await fetch(ticket.signedUrl,{method:'PUT',headers:{'Content-Type':mime,'x-upsert':'false'},body:bytes,signal}));
  signal?.throwIfAborted();
  // Complete registration without aborting its response: cancellation below can
  // then clean a known asset ID, including when the server has already committed.
  const response=await checked(await fetch('/api/uploads/'+ticket.id,{method:'POST'}));registered=true;
  signal?.throwIfAborted();return response;
 }finally{
  if(ticket&&(!registered||signal?.aborted)){
   await Promise.allSettled([
    fetch('/api/uploads/'+ticket.id,{method:'DELETE',signal:AbortSignal.timeout(10000)}),
    ...(registered?[fetch('/api/assets/'+ticket.id,{method:'DELETE',signal:AbortSignal.timeout(10000)})]:[])
   ]);
  }
 }
}
