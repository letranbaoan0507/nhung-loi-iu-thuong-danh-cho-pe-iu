// Also serialized into legacy offline gifts; keep this function self-contained.
export function sceneTiming(config,step){
 const photos=config.photos||[],album=step.emotion!=='closed-stars'&&['photo','heart'].includes(step.scene)&&photos.length>0,interval=1.1,hold=2;
 const chosen=photos.findIndex(p=>p.id===step.photoId);
 return {album,interval,hold,start:Math.max(0,chosen),duration:Math.max(Number(step.seconds)||3,album?photos.length*interval+hold:0)};
}
