/** 二维人物视频播放器：待机、说话与回正片段切换、暂停、故障重试和离页释放；无三维模型。 */
'use strict';
{
  const P=window.App;
  const CLIPS={idle:'assets/avatar/motion-v1/idle-v3.mp4',speaking:'assets/avatar/motion-v1/speaking-v3.mp4',settling:'assets/avatar/motion-v1/settling-v3.mp4'};
  let active=null;
  /** 页面只声明插槽，媒体节点在挂载时创建，同页重绘复用已解码的片段。 */
  function view() {
    return '<div id="portrait-motion" class="portrait-motion" data-mode="idle"><div class="portrait-clips"></div><button type="button" class="portrait-motion-retry" data-action="portrait-motion-play" hidden>播放人物动作</button></div>';
  }
  /** 回应完成后先播放回正动作，再恢复待机，避免身体突然退回原位。 */
  function targetMode(ctx) {
    if(ctx.wanted==='speaking')return 'speaking';
    if(!ctx.settled && (ctx.shown==='speaking' || ctx.shown==='settling'))return 'settling';
    return 'idle';
  }
  /** 更新原生播放结果后的可见按钮，加载失败不会默默伪装成仍在动的人物。 */
  function paint(ctx) {
    if(active!==ctx)return;
    ctx.host.dataset.mode=ctx.shown;
    const button=ctx.host.querySelector('[data-action="portrait-motion-play"]');
    button.hidden=ctx.paused || !(ctx.failed[ctx.target] || ctx.blocked[ctx.target]);
    button.textContent=ctx.failed[ctx.target]?'重新载入人物动作':'播放人物动作';
  }
  /** 每次播放尝试绑定当前实例，离页或换账号后晚到的 Promise 不回写新页面。 */
  function play(ctx,kind,manual=false) {
    const video=ctx.videos[kind];
    if(active!==ctx || ctx.paused || ctx.pending[kind] || (!manual && (ctx.failed[kind] || ctx.blocked[kind])))return;
    if(ctx.shown!==kind){ctx.videos[ctx.shown].pause();if(kind==='speaking'){video.currentTime=0;ctx.settled=false;}if(kind==='settling')video.currentTime=0;ctx.shown=kind;}
    paint(ctx);if(!video.paused)return;
    ctx.pending[kind]=true;
    try{
      Promise.resolve(video.play()).then(()=>{
        if(active!==ctx)return;ctx.pending[kind]=false;ctx.blocked[kind]=false;paint(ctx);
      }).catch(error=>{
        if(active!==ctx)return;ctx.pending[kind]=false;
        if(error.name==='NotAllowedError')ctx.blocked[kind]=true;
        else if(error.name!=='AbortError'){ctx.failed[kind]=true;console.warn('二维人物片段未能播放',kind,error);}
        paint(ctx);P.DigitalHuman.refresh();
      });
    }catch(error){ctx.pending[kind]=false;ctx.failed[kind]=true;console.warn('二维人物播放调用失败',kind,error);paint(ctx);}
  }
  /** 待机和说话循环，回正只播一次；三者都是无声的本地二维 MP4。 */
  function createVideo(ctx,kind) {
    const video=document.createElement('video');video.src=CLIPS[kind];video.poster='assets/avatar/father-portrait-v4.png';
    video.muted=true;video.defaultMuted=true;video.loop=kind!=='settling';video.playsInline=true;video.preload='auto';
    video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('aria-hidden','true');video.dataset.kind=kind;
    video.addEventListener('loadeddata',()=>{if(active!==ctx)return;ctx.ready[kind]=true;ctx.failed[kind]=false;P.DigitalHuman.refresh();});
    video.addEventListener('ended',()=>{if(active!==ctx || kind!=='settling')return;ctx.settled=true;P.DigitalHuman.refresh();});
    video.addEventListener('error',()=>{if(active!==ctx)return;ctx.failed[kind]=true;paint(ctx);P.DigitalHuman.refresh();});
    return video;
  }
  /** 同页消息更新保留播放位置；账号或对话人物改变时创建独立播放器实例。 */
  function mount() {
    const host=document.getElementById('portrait-motion');if(!host)return;
    const key=P.state.actor+':'+P.state.chatTarget;
    if(active && (active.state!==P.state || active.key!==key))unmount();
    if(!active){
      const ctx={host,key,state:P.state,videos:{},ready:{},failed:{},blocked:{},pending:{},shown:'idle',wanted:'idle',target:'idle',settled:false,paused:false};active=ctx;
      for(const kind of Object.keys(CLIPS))ctx.videos[kind]=createVideo(ctx,kind);
    }
    active.host=host;host.querySelector('.portrait-clips').replaceChildren(...Object.values(active.videos));paint(active);
    sync(P.DigitalHuman.settings().phase,P.DigitalHuman.settings().callState);
  }
  /** 暂停保留当前帧；回应期间切到说话，回应结束先回正，再回到待机眨眼和轻点头。 */
  function sync(phase,callState) {
    const ctx=active;if(!ctx)return;
    ctx.paused=callState!=='active' || P.state.route!=='chat';ctx.wanted=phase==='replying'?'speaking':'idle';
    if(ctx.paused){for(const video of Object.values(ctx.videos))if(!video.paused)video.pause();paint(ctx);return;}
    ctx.target=targetMode(ctx);const video=ctx.videos[ctx.target];
    if(ctx.failed[ctx.target])ctx.videos[ctx.shown].pause();
    else if(ctx.ready[ctx.target] || video.readyState>=2)play(ctx,ctx.target);
    paint(ctx);
  }
  /** 状态仅反映片段是否可播，不将模板口型描述成逐字生成或本人实时视频。 */
  function status() {
    const ctx=active;if(!ctx || ctx.paused)return '';
    if(ctx.failed[ctx.target])return '人物动画加载失败，可重试；仍可文字交流';
    if(ctx.blocked[ctx.target])return '点击“播放人物动作”开始二维动画';
    if(!ctx.ready[ctx.target] && ctx.videos[ctx.target].readyState<2)return '正在载入人物动作…';
    return '';
  }
  /** 明确的用户点击可恢复自动播放被阻止的媒体，重试不会擅自继续已暂停画面。 */
  function handleAction(action) {
    if(action!=='portrait-motion-play')return false;
    const ctx=active;if(!ctx || ctx.paused)return true;
    const kind=ctx.target;ctx.blocked[kind]=false;
    if(ctx.failed[kind]){ctx.failed[kind]=false;ctx.ready[kind]=false;ctx.videos[kind].load();}
    play(ctx,kind,true);return true;
  }
  /** 离页暂停并清空媒体源，释放解码器；旧事件只会命中已失效的实例。 */
  function unmount() {
    const ctx=active;if(!ctx)return;active=null;
    for(const video of Object.values(ctx.videos)){video.pause();video.removeAttribute('src');video.load();}
  }
  P.PortraitMotion={view,mount,sync,status,handleAction,unmount};
}
