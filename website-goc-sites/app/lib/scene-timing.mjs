// Also serialized into legacy offline gifts; keep this function self-contained.
export function sceneTiming(config,step){
 const photos=config.photos||[],closed=step.emotion==='closed-stars';
 const media=['none','decoration','album','both'].includes(step.media)?step.media:(closed?'album':['photo','heart'].includes(step.scene)?'both':'decoration');
 const album=['album','both'].includes(media)&&photos.length>0;
 const chosen=photos.findIndex(p=>p.id===step.photoId);
 const interval=closed?3.6:1.1,hold=2;
 return {media,album,memory:closed&&album,decoration:['decoration','both'].includes(media),interval,hold,start:Math.max(0,chosen),duration:Math.max(3,Number(step.seconds)||3,album?photos.length*interval+hold:0)};
}
