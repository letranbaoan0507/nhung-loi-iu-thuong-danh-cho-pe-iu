import {sceneTiming} from './scene-timing.mjs';
/* Intentionally self-contained: serialized verbatim for offline HTML export. */
export function mountGift(root,initial,settings={}){
 let cfg=initial,index=0,elapsed=0,last=0,frame=0,playing=!!settings.autoStart,started=!!settings.autoStart,ended=false,ending=false,disposed=false,muted=settings.muted!==false,typed='',particles=[],width=800,height=500,audioSrc='',currentImage='',lastScene='',lastLine='',memoryOrigin=null,layoutKey='';
 const reduced=!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const $=s=>root.querySelector(s),sub=t=>String(t||'').replace(/\{ten\}/g,cfg.to||'').replace(/\{nguoi_gui\}/g,cfg.from||'').replace(/\{dip\}/g,cfg.occasion||'');
 const svgFlower='<svg viewBox="0 0 310 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="#8ba79a" stroke-width="1.8"><path d="M146 342c13-65 12-133 4-219M151 273c-44-18-55-51-61-80 38 9 55 28 61 54M154 249c45-32 68-64 70-100-41 16-59 43-67 75M138 344c-23-71-51-125-80-171M162 342c35-47 64-82 90-112"/></g><g fill="#edb3c8" opacity=".9"><ellipse cx="150" cy="89" rx="16" ry="32"/><ellipse cx="150" cy="89" rx="16" ry="32" transform="rotate(60 150 114)"/><ellipse cx="150" cy="89" rx="16" ry="32" transform="rotate(120 150 114)"/><ellipse cx="150" cy="89" rx="16" ry="32" transform="rotate(180 150 114)"/><ellipse cx="150" cy="89" rx="16" ry="32" transform="rotate(240 150 114)"/><ellipse cx="150" cy="89" rx="16" ry="32" transform="rotate(300 150 114)"/></g><circle cx="150" cy="114" r="13" fill="#ffe0ae"/><g fill="#dbc6ed"><ellipse cx="57" cy="150" rx="11" ry="22"/><ellipse cx="57" cy="150" rx="11" ry="22" transform="rotate(72 57 169)"/><ellipse cx="57" cy="150" rx="11" ry="22" transform="rotate(144 57 169)"/><ellipse cx="57" cy="150" rx="11" ry="22" transform="rotate(216 57 169)"/><ellipse cx="57" cy="150" rx="11" ry="22" transform="rotate(288 57 169)"/></g><circle cx="57" cy="169" r="8" fill="#ffe0ae"/><g fill="#f2c3d3"><ellipse cx="249" cy="207" rx="9" ry="18"/><ellipse cx="249" cy="207" rx="9" ry="18" transform="rotate(72 249 223)"/><ellipse cx="249" cy="207" rx="9" ry="18" transform="rotate(144 249 223)"/><ellipse cx="249" cy="207" rx="9" ry="18" transform="rotate(216 249 223)"/><ellipse cx="249" cy="207" rx="9" ry="18" transform="rotate(288 249 223)"/></g><circle cx="249" cy="223" r="6" fill="#ffe0ae"/></svg>';
 root.classList.add('gift-root');root.innerHTML='<canvas class="gf-particles" aria-hidden="true"></canvas><div class="gf-bg"></div><div class="gf-halo"></div><div class="gf-orbit gf-orbit-one"></div><div class="gf-orbit gf-orbit-two"></div><div class="gf-tiny-stars" aria-hidden="true">✦<i>✧</i><b>✧</b></div><div class="gf-heading"><div class="gf-occasion"></div><div class="gf-mainline" aria-live="off"></div></div><div class="gf-robot" aria-hidden="true"><div class="gf-eyes"><i class="gf-eye"></i><i class="gf-eye"></i></div><div class="gf-cheek left"></div><div class="gf-cheek right"></div><div class="gf-mouth"></div><div class="gf-wink-hearts" aria-hidden="true"></div></div><div class="gf-night-sky" aria-hidden="true"><span class="gf-dream-star">✦</span></div><div class="gf-heart" aria-hidden="true">♡</div><div class="gf-meadow" aria-hidden="true"></div><div class="gf-art">'+svgFlower+'</div><figure class="gf-photo"><img alt=""><figcaption></figcaption></figure><img class="gf-sticker" alt="Hình ảnh trang trí do người tạo chọn"><div class="gf-subline"></div><div class="gf-signature"></div><button class="gf-vinyl" data-gf="disc" aria-label="Tạm dừng nhạc và hoạt cảnh" hidden><span class="gf-vinyl-record"><i></i><b></b></span></button><div class="gf-controls"><button data-gf="prev" aria-label="Cảnh trước">‹</button><span class="gf-scene-number"></span><button data-gf="next" aria-label="Cảnh tiếp">›</button><button class="gf-play-toggle" data-gf="toggle" aria-label="Tạm dừng">❚❚</button><button data-gf="fullscreen" aria-label="Toàn màn hình" aria-pressed="false">⛶</button></div><div class="gf-progress"><i></i></div><div class="gf-intro"><div class="gf-envelope" aria-hidden="true">♡</div><span class="gf-intro-for"></span><h2></h2><button data-gf="start"></button><p class="gf-intro-note"></p></div><div class="gf-outro" hidden><span>♡</span><p></p><button data-gf="restart"></button></div><div class="gf-sr" role="status" aria-live="polite"></div>';
 // The header, media and message occupy separate responsive grid rows.
 const layout=document.createElement('div'),visuals=document.createElement('div'),copy=document.createElement('div');layout.className='gf-layout';visuals.className='gf-visuals';copy.className='gf-copy';
 visuals.append($('.gf-robot'),$('.gf-photo'),$('.gf-sticker'),$('.gf-art'));copy.append($('.gf-subline'),$('.gf-signature'));layout.append($('.gf-heading'),visuals,copy);root.append(layout);
 let fullscreenHost=null,fullscreenMarker=null,fullscreenPending=false,fullscreenTimer=null,bodyOverflow='',returnFocus=null;
 const nativeFullscreen=()=>document.fullscreenElement||document.webkitFullscreenElement;
 function updateFullscreen(){if(nativeFullscreen()===root)clearTimeout(fullscreenTimer);const active=nativeFullscreen()===root||!!fullscreenHost,b=$('[data-gf="fullscreen"]');if(!b)return;b.setAttribute('aria-pressed',String(active));b.setAttribute('aria-label',active?'Thoát toàn màn hình':'Toàn màn hình');b.title=active?'Thoát toàn màn hình':'Toàn màn hình';b.textContent=active?'⤢':'⛶';resize();}
 function closeExpanded(){
  if(!fullscreenHost)return;const host=fullscreenHost;fullscreenHost=null;
  if(fullscreenMarker?.parentNode)fullscreenMarker.replaceWith(root);fullscreenMarker=null;
  document.body.style.overflow=bodyOverflow;host.remove();
  if(!disposed){updateFullscreen();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
 }
 function openExpanded(){
  if(disposed||fullscreenHost)return;
  returnFocus=document.activeElement;bodyOverflow=document.body.style.overflow;
  fullscreenMarker=document.createComment('gift-fullscreen');root.before(fullscreenMarker);
  fullscreenHost=document.createElement('dialog');fullscreenHost.className='gf-fullscreen-shell';fullscreenHost.setAttribute('aria-label','Món quà toàn màn hình');
  fullscreenHost.addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();closeExpanded();});
  fullscreenHost.addEventListener('close',()=>{if(fullscreenHost)closeExpanded();});
  document.body.append(fullscreenHost);fullscreenHost.append(root);
  document.body.style.overflow='hidden';fullscreenHost.showModal();updateFullscreen();$('[data-gf="fullscreen"]').focus({preventScroll:true});
  text($('.gf-sr'),'Đang mở rộng hết khung trình duyệt. Bấm lại nút toàn màn hình để thu nhỏ.');
 }
 async function toggleFullscreen(){
  if(fullscreenHost){closeExpanded();return;}if(fullscreenPending)return;
  if(nativeFullscreen()===root){clearTimeout(fullscreenTimer);const exit=document.exitFullscreen||document.webkitExitFullscreen;try{await exit?.call(document);updateFullscreen();}catch{text($('.gf-sr'),'Hãy dùng nút thoát toàn màn hình của trình duyệt.');}return;}
  const request=root.requestFullscreen||root.webkitRequestFullscreen;
  if(!request){openExpanded();return;}
  fullscreenPending=true;
  try{
   const result=request.call(root);
   if(result?.then){await result;if(!disposed&&nativeFullscreen()!==root)openExpanded();}
   else if(nativeFullscreen()!==root)fullscreenTimer=setTimeout(()=>{if(!disposed&&nativeFullscreen()!==root)openExpanded();},700);
   if(!disposed)updateFullscreen();
  }catch{if(!disposed)openExpanded();}finally{fullscreenPending=false;}
 }
 function fullscreenKey(e){if(e.key==='Escape'&&fullscreenHost){e.preventDefault();e.stopPropagation();closeExpanded();}}
 let motion=null;
 const matched=effect=>['match','match-left','match-right','match-zoom'].includes(effect);
 const effectFor=step=>['match','match-left','match-right','match-zoom','fade','slide-left','slide-right','zoom','none'].includes(step?.transition)?step.transition:'match';
 function clearMotion(){
  motion?.ghost?.remove();motion=null;layout.style.animation='none';root.removeAttribute('data-motion-progress');
  for(const prop of ['transform','transform-origin','opacity','filter','will-change'])layout.style.removeProperty(prop);
 }
 function captureScene(){
  const ghost=document.createElement('div');ghost.className='gf-transition-out';ghost.setAttribute('aria-hidden','true');ghost.setAttribute('inert','');
  const clone=layout.cloneNode(true),sources=[layout,...layout.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
  // Freeze the outgoing pixels' layout, expression and photo. The live scene is
  // free to change without making the outgoing robot adopt the incoming eyes.
  for(let i=0;i<sources.length;i++){
   const style=window.getComputedStyle(sources[i]),copy=copies[i];copy.removeAttribute('id');copy.removeAttribute('aria-live');copy.removeAttribute('data-gf');
   for(let j=0;j<style.length;j++){const name=style[j];copy.style.setProperty(name,style.getPropertyValue(name),'important');}
   copy.style.setProperty('animation','none','important');copy.style.setProperty('transition','none','important');copy.style.setProperty('pointer-events','none','important');
  }
  clone.style.setProperty('transform','none','important');clone.style.setProperty('opacity','1','important');clone.style.setProperty('filter','none','important');
  ghost.append(clone);
  return {ghost,layer:clone,robot:$('.gf-robot').getBoundingClientRect(),stage:root.getBoundingClientRect()};
 }
 function beginMotion(snapshot,effect){
  const after=$('.gf-robot').getBoundingClientRect(),old=snapshot.robot,stage=snapshot.stage;
  const from={x:old.left+old.width/2-stage.left,y:old.top+old.height/2-stage.top,w:Math.max(1,old.width),h:Math.max(1,old.height)};
  const to={x:after.left+after.width/2-stage.left,y:after.top+after.height/2-stage.top,w:Math.max(1,after.width),h:Math.max(1,after.height)};
  root.append(snapshot.ghost);motion={...snapshot,from,to,effect,time:0,duration:.86};
  layout.style.animation='none';layout.style.willChange='transform,opacity,filter';
  layout.style.transformOrigin=`${to.x}px ${to.y}px`;snapshot.layer.style.setProperty('transform-origin',`${from.x}px ${from.y}px`,'important');
  paintMotion();
 }
 function paintMotion(){
  if(!motion)return;const {from,to,effect,layer}=motion,p=Math.min(1,motion.time/motion.duration),ease=p*p*(3-2*p),pulse=Math.sin(Math.PI*p),zoom=1+pulse*(effect==='match-zoom'?.16:.045);
  const direction=effect==='match-left'?-1:effect==='match-right'?1:0,travel=direction*width*.24;
  // Both robot centers and sizes follow exactly the same interpolated path.
  // The matched subject stays continuous while the two complete scenes blend.
  const dx=to.x-from.x,dy=to.y-from.y;
  const incoming=`translate(${-dx*(1-ease)+travel*pulse}px,${-dy*(1-ease)}px) scale(${(from.w/to.w+(1-from.w/to.w)*ease)*zoom},${(from.h/to.h+(1-from.h/to.h)*ease)*zoom})`;
  const outgoing=`translate(${dx*ease+travel*pulse}px,${dy*ease}px) scale(${(1+(to.w/from.w-1)*ease)*zoom},${(1+(to.h/from.h-1)*ease)*zoom})`;
  layout.style.transform=incoming;layout.style.opacity=String(ease);layout.style.filter=`blur(${pulse*2}px)`;
  layer.style.setProperty('transform',outgoing,'important');layer.style.setProperty('opacity',String(1-ease),'important');layer.style.setProperty('filter',`blur(${pulse*2}px)`,'important');
  root.dataset.motionProgress=String(p);
  if(p>=1)clearMotion();
 }
 function transitionScene(){
  const effect=effectFor(cfg.steps[index]);
  layout.style.animation='none';root.dataset.transition=effect;
  if(!started||reduced||effect==='none')return;
  if(matched(effect))return;
  void layout.offsetWidth;layout.style.animation=`gf-scene-${effect} .7s cubic-bezier(.22,.61,.36,1) both`;
  layout.style.animationPlayState=playing?'running':'paused';
 }
 // Stable decorative elements: no timers or randomness during scene changes.
 for(let i=0;i<5;i++){const heart=document.createElement('i');heart.textContent='♥';heart.style.cssText=`--heart-x:${20+i*12}px;--heart-y:${-35-i*18}px;animation-delay:${i*.45}s`;$('.gf-wink-hearts').append(heart);}
 for(let i=0;i<38;i++){const star=document.createElement('i');star.style.cssText=`left:${3+(i*37)%94}%;top:${3+(i*23)%91}%;--star-size:${1+i%3}px;animation-delay:${-i*.17}s`;$('.gf-night-sky').append(star);}
 const audio=document.createElement('audio');audio.preload='none';audio.loop=true;root.append(audio);const canvas=$('.gf-particles'),ctx=canvas.getContext?.('2d');
 for(let i=0;i<28;i++){const grass=document.createElement('i');grass.style.cssText=`left:${i*3.8}%;height:${22+(i*19)%78}%;animation-delay:${i*.13}s;--stem:${i%3===0?'#f2bbd7':i%3===1?'#a5bfa3':'#d6c1e9'}`;$('.gf-meadow').append(grass);}
 function resize(){clearMotion();memoryOrigin=null;const r=root.getBoundingClientRect();width=Math.max(1,r.width||800);height=Math.max(1,r.height||500);const dpr=Math.min(window.devicePixelRatio||1,1.8);canvas.width=width*dpr;canvas.height=height*dpr;if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:settings.preview?42:65},(_,i)=>({x:Math.random()*width,y:Math.random()*height,r:.4+Math.random()*1.8,v:.05+Math.random()*.13,phase:Math.random()*6.28,heart:i%9===0}));}
 const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;ro?.observe(root);window.addEventListener('resize',resize);resize();
 function text(el,value){if(el.textContent!==value)el.textContent=value;}
 function syncAudio(){const src=cfg.audioSrc||'';if(src!==audioSrc){audio.pause();audioSrc=src;if(src)audio.src=src;else audio.removeAttribute('src');}audio.volume=Math.max(0,Math.min(1,Number(cfg.volume)||0));audio.muted=muted;if(playing&&started&&!ended&&!muted&&src)audio.play().catch(()=>{muted=true;audio.muted=true;text($('.gf-sr'),'Nhấn tiếp tục để bắt đầu phát nhạc.');updateControls();});else audio.pause();}
 function updateControls(){const b=$('[data-gf="toggle"]');b.textContent=playing?'❚❚':'▶';b.setAttribute('aria-label',playing?'Tạm dừng':'Tiếp tục');$('.gf-vinyl').setAttribute('aria-label',playing?'Tạm dừng nhạc và hoạt cảnh':'Tiếp tục nhạc và hoạt cảnh');layout.style.animationPlayState=playing?'running':'paused';root.classList.toggle('gf-paused',!playing);root.classList.toggle('gf-music-on',!muted&&playing&&!!cfg.audioSrc);}
 function apply(){root.style.setProperty('--gf-eye',cfg.eyeColor||'#67f3e5');root.style.setProperty('--gf-accent',cfg.accent||'#f2a6c8');root.dataset.theme=cfg.theme||'midnight';$('.gf-vinyl').hidden=!cfg.audioSrc;root.dataset.font=cfg.font==='serif'?'serif':'sans';const bg=$('.gf-bg');bg.style.backgroundImage='';if(cfg.backgroundSrc)bg.style.backgroundImage='url('+JSON.stringify(cfg.backgroundSrc)+')';const sticker=$('.gf-sticker');sticker.hidden=!cfg.stickerSrc;if(cfg.stickerSrc&&sticker.getAttribute('src')!==cfg.stickerSrc)sticker.src=cfg.stickerSrc;$('.gf-art').style.display=cfg.stickerSrc?'none':'';text($('.gf-occasion'),cfg.occasion||'');text($('.gf-signature'),cfg.showSignature&&cfg.from?'Gửi từ '+cfg.from+' ♡':'');const intro=$('.gf-intro');intro.hidden=started;text($('.gf-intro-for'),cfg.to?'Gửi '+cfg.to:'');text(intro.querySelector('h2'),sub(cfg.introTitle));text($('[data-gf="start"]'),cfg.introButton||'Mở');text($('.gf-intro-note'),cfg.audioSrc?'Chạm để bắt đầu lời chúc và nhạc.':'Một món quà nhỏ đang chờ cậu.');text($('.gf-outro p'),sub(cfg.outro));text($('[data-gf="restart"]'),cfg.replayText||'Xem lại');syncAudio();updateControls();renderScene(true);}
 function renderScene(force=false){const s=cfg.steps[index];if(!s)return;root.dataset.scene=s.scene;root.dataset.emotion=s.emotion;const main=sub(s.line),duration=Math.max(1,s.seconds),fraction=Math.min(1,elapsed/Math.min(3,duration*.57));typed=reduced||!playing?main:Array.from(main).slice(0,Math.ceil(Array.from(main).length*fraction)).join('');text($('.gf-mainline'),typed);text($('.gf-subline'),sub(s.subline));text($('.gf-scene-number'),`${index+1} / ${cfg.steps.length}`);const photos=cfg.photos||[],timing=sceneTiming(cfg,s),cycle=Math.min(Math.max(0,photos.length-1),Math.floor(elapsed/timing.interval)),photoIndex=photos.length?(timing.start+cycle)%photos.length:0,photo=photos[photoIndex];
 const src=photo?.src||'',figure=$('.gf-photo'),showSticker=!!cfg.stickerSrc&&timing.decoration,showArt=!showSticker&&(!src||!timing.album)&&timing.decoration&&['flowers','photo'].includes(s.scene)&&s.emotion!=='closed-stars';
 figure.dataset.photoIndex=String(photoIndex);figure.hidden=!src||!timing.album;$('.gf-sticker').hidden=!showSticker;
 const memory=timing.memory&&!figure.hidden;
 root.dataset.memory=String(memory);visuals.dataset.memory=String(memory);
 visuals.dataset.items=String(1+Number(!figure.hidden&&!memory)+Number(showSticker)+Number(showArt));visuals.dataset.album=String(!figure.hidden&&!memory);visuals.dataset.art=String(showArt);
 const nextLayout=[memory,showSticker,showArt,figure.hidden,index].join(':');if(nextLayout!==layoutKey){memoryOrigin=null;layoutKey=nextLayout;}
 if(src&&src!==currentImage){$('.gf-photo img').src=src;currentImage=src;}
 if(photo){$('.gf-photo img').alt=photo.caption||'Ảnh kỷ niệm';text($('.gf-photo figcaption'),photo.caption||'');}
 if(memory){
  if(!memoryOrigin){const v=visuals.getBoundingClientRect(),r=$('.gf-robot').getBoundingClientRect();memoryOrigin={x:r.left-v.left+r.width/2,y:r.top-v.top+r.height/2,w:v.width,h:v.height};}
  const o=memoryOrigin,phase=Math.min(1,Math.max(0,(elapsed-cycle*timing.interval)/timing.interval)),direction=cycle%3-1,ease=1-Math.pow(1-phase,2),travelX=Math.max(0,Math.min(o.x,o.w-o.x)-o.w*.22),travelY=Math.max(0,Math.min(o.h*.15,o.y-o.h*.35));
  figure.dataset.direction=['left','center','right'][cycle%3];
  figure.style.setProperty('--memory-x',o.x+'px');figure.style.setProperty('--memory-y',o.y+'px');
  figure.style.setProperty('--memory-transform',`translate(-50%,-50%) translate(${reduced?0:direction*travelX*ease}px,${reduced?0:-travelY*ease}px) scale(${reduced?1:.12+.88*Math.min(1,phase/.4)}) rotate(${reduced?0:direction*phase*5}deg)`);
  figure.style.opacity=String(Math.max(0,Math.min(1,phase/.13,(.96-phase)/.3))*.88);
 }else{figure.style.opacity='';}
 const position=cfg.steps.slice(0,index).reduce((n,v)=>n+sceneTiming(cfg,v).duration,0)+elapsed,total=cfg.steps.reduce((n,v)=>n+sceneTiming(cfg,v).duration,0)||1;$('.gf-progress i').style.width=Math.min(100,position/total*100)+'%';if(lastScene!==s.id||lastLine!==main||force){if(lastScene!==s.id){transitionScene();settings.onStep?.(index);text($('.gf-sr'),main+' '+sub(s.subline));}lastScene=s.id;lastLine=main;}}
 function choose(i,pause=false){const target=Math.max(0,Math.min(cfg.steps.length-1,i)),effect=effectFor(cfg.steps[target]);clearMotion();const snapshot=started&&!reduced&&matched(effect)?captureScene():null;lastScene='';index=target;elapsed=0;ended=false;ending=false;$('.gf-outro').hidden=true;if(pause)playing=false;renderScene(true);if(snapshot)beginMotion(snapshot,effect);syncAudio();updateControls();}
 function start(){const wasStarted=started;started=true;playing=true;ended=false;ending=false;muted=settings.preview?true:!cfg.audioSrc;$('.gf-intro').hidden=true;$('.gf-outro').hidden=true;syncAudio();updateControls();if(!wasStarted)transitionScene();}
 function restart(){clearMotion();index=0;elapsed=0;lastScene='';audio.currentTime=0;start();renderScene(true);}
 function toggle(){if(!started){start();return;}if(ended){restart();return;}playing=!playing;if(playing&&!settings.preview&&cfg.audioSrc)muted=false;syncAudio();updateControls();}
 function tick(time){if(disposed)return;const delta=last?Math.min((time-last)/1000,.12):0;last=time;if(playing&&motion){motion.time+=delta;paintMotion();}if(playing&&!ended){elapsed+=delta*(Number(cfg.speed)||1);if(ending){if(elapsed>=6)choose(0);}else{if(elapsed>=sceneTiming(cfg,cfg.steps[index]).duration){if(index<cfg.steps.length-1)choose(index+1);else{ending=true;elapsed=0;$('.gf-outro').hidden=false;$('.gf-progress i').style.width='100%';}}if(!ending)renderScene();}}
 if(ctx){ctx.clearRect(0,0,width,height);if(cfg.particles&&!reduced){for(const p of particles){if(playing){p.y-=p.v*delta*60;p.x+=Math.sin(time*.0002+p.phase)*.09;if(p.y<-10)p.y=height+8;}const a=.2+.5*(.5+.5*Math.sin(time*.0006+p.phase));ctx.globalAlpha=a;ctx.fillStyle=p.heart?'#f0b6cf':'#e8e1fb';if(p.heart){ctx.font=`${p.r*5+5}px serif`;ctx.fillText('♡',p.x,p.y);}else{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}}ctx.globalAlpha=1;}}
 frame=requestAnimationFrame(tick);}
 function click(e){const b=e.target.closest('[data-gf]');if(!b)return;switch(b.dataset.gf){case 'start':start();break;case 'restart':restart();break;case 'toggle':case 'disc':toggle();break;case 'prev':started=true;$('.gf-intro').hidden=true;choose(index-1);break;case 'next':started=true;$('.gf-intro').hidden=true;choose(index+1);break;case 'sound':muted=!muted;syncAudio();updateControls();break;case 'fullscreen':void toggleFullscreen();break;}}
 function move(e){if(reduced)return;const r=root.getBoundingClientRect();root.style.setProperty('--gf-look-x',((e.clientX-r.left)/Math.max(1,r.width)-.5)*9+'px');root.style.setProperty('--gf-look-y',((e.clientY-r.top)/Math.max(1,r.height)-.5)*6+'px');}
 function visibility(){if(document.hidden){playing=false;syncAudio();updateControls();}}
 document.addEventListener('fullscreenchange',updateFullscreen);document.addEventListener('webkitfullscreenchange',updateFullscreen);document.addEventListener('keydown',fullscreenKey,true);root.addEventListener('click',click);root.addEventListener('pointermove',move);document.addEventListener('visibilitychange',visibility);audio.addEventListener('error',()=>{if(audioSrc)text($('.gf-sr'),'Trình duyệt không phát được tệp nhạc này.');});apply();frame=requestAnimationFrame(tick);
 return {setConfig(next){clearMotion();cfg=next;index=Math.min(index,cfg.steps.length-1);elapsed=Math.min(elapsed,sceneTiming(cfg,cfg.steps[index]).duration);apply();},goTo(i){started=true;$('.gf-intro').hidden=true;choose(i,true);},toggle,restart,getState(){return {index,playing,started,ended};},destroy(){disposed=true;clearMotion();clearTimeout(fullscreenTimer);closeExpanded();if(nativeFullscreen()===root){try{Promise.resolve((document.exitFullscreen||document.webkitExitFullscreen)?.call(document)).catch(()=>{});}catch{}}document.removeEventListener('fullscreenchange',updateFullscreen);document.removeEventListener('webkitfullscreenchange',updateFullscreen);document.removeEventListener('keydown',fullscreenKey,true);cancelAnimationFrame(frame);ro?.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);root.removeEventListener('click',click);root.removeEventListener('pointermove',move);audio.pause();audio.removeAttribute('src');root.innerHTML='';}};
}
