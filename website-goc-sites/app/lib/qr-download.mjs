// Paint the generated QR's unit cells directly. This avoids SVG image decoding
// and keeps every QR module square, with the original heart and white margin.
export async function qrPNG(svg){
 const view=svg?.getAttribute('viewBox')?.trim().split(/\s+/).map(Number);
 if(!view||view.length!==4||view[0]!==0||view[1]!==0||!view.slice(2).every(n=>Number.isInteger(n)&&n>0&&n<=256))throw Error('Mã QR chưa sẵn sàng. Hãy mở lại bảng QR.');
 const scale=16,canvas=document.createElement('canvas');canvas.width=view[2]*scale;canvas.height=view[3]*scale;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Trình duyệt chưa hỗ trợ tạo ảnh QR.');
 ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#b51b59';let count=0;
 for(const path of svg.querySelectorAll('[data-heart-decoration],[data-qr-matrix]'))for(const cell of path.getAttribute('d').matchAll(/M(\d+) (\d+)h1v1h-1z/g)){
  const x=Number(cell[1]),y=Number(cell[2]);if(x>=view[2]||y>=view[3])throw Error('Hình mã QR không hợp lệ.');
  ctx.fillRect(x*scale,y*scale,scale,scale);count++;
 }
 if(!count)throw Error('Mã QR chưa sẵn sàng. Hãy mở lại bảng QR.');
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?.type==='image/png'?resolve(blob):reject(Error('Chưa tạo được ảnh PNG. Hãy mở lại bảng QR.')),'image/png'));
}
