// QR codes always carry a recipient page, never an asset or a backup download.
export function recipientURL(item,origin){
 if(!/^[a-f0-9-]{36}$/i.test(item?.id||''))throw Error('Món quà chưa có link hợp lệ. Hãy tạo link trước khi lấy QR.');
 return new URL('/g/'+item.id,origin).href;
}
