/** 三维记忆空间：模型全览、室内视角和故事物件交互。 */
'use strict';
{
  const P=window.App,T=window.MemoryThree;
  const {icon:i,button:b,escape:e}=P;
  const ITEMS={desk:{label:'旧书桌',title:'那张一直没换的书桌',text:'很多故事，就从这扇窗边开始。',source:'old-home'},radio:{label:'收音机',title:'晚饭后的收音机',text:'关于这台收音机、晚饭后听过什么节目，现有记录还没有讲清楚。可以先看看同一老宅的相关资料，或把问题留给本人补充。',source:'old-home',sourceLabel:'查看老宅相关记录'},photo:{label:'全家福',title:'墙上的那张全家福',text:'走向不同的城市之后，这个家仍把我们连在一起。',source:'spring'}};
  const STOPS={entry:{x:0,z:2.12,yaw:0,pitch:-.06},desk:{x:.65,z:-.18},radio:{x:-.75,z:-.65},photo:{x:-.3,z:-1.52}};
  /** 观察方式用日常用语呈现，内部模式与相机操作保持原有契约。 */
  const MODE_NAMES={tour:'看看老家',model:'屋子全貌',walk:'四处走走'};
  let active=null;
  let mountRequest=0;
  const CAMERA_ACTIONS=['space-focus','space-step','space-zoom','space-reset'];
  /** 空间与数字人共用当前账号的亲属称呼，本人查看时使用中性操作文案。 */
  function familyLabels() {
    const role=P.relation('father'),name=role==='家人'?P.PEOPLE.father.name:role;
    return P.state.actor==='father'?{guide:'跟着回忆逛一逛',ask:'围绕这段经历提问'}:{guide:`跟着${name}逛一逛`,ask:`问问${name}`};
  }
  /** 全景素材失败时仍可读故事，旋转和定位需等该观察方式恢复。 */
  function cameraReady(host=active?.host) {return Boolean(active&&active.host===host&&!(settings().mode==='tour'&&host.dataset.panoramaState==='error'));}
  /** 相机状态保存在原型内存，界面更新不会意外重置观察方向。 */
  function settings() {
    if(!P.state.spaceCamera)P.state.spaceCamera={mode:'tour',dockCollapsed:true,tour:{yaw:.18,pitch:-.04,zoom:1},model:{yaw:-.43,pitch:.68,zoom:1},walk:{...STOPS.entry,zoom:1}};
    return P.state.spaceCamera;
  }
  /** 每次从其他页面进入先看场景，同页字号和重试重绘不覆盖用户刚展开的状态。 */
  function enter() {settings().dockCollapsed=true;}
  /** 物件名称和模型可展示；故事正文与来源入口按当前账号对关联记录的权限即时核对。 */
  function storyContent() {
    const era=window.MemoryRoomModel.ERAS[P.state.year],detail=settings().mode==='tour'?era.detail:era.modelDetail,labels=familyLabels();
    if(!P.state.spaceStoryOpen)return `<div class="memory-welcome"><div><span class="memory-kicker">${P.state.year} · 同一个家的不同年代</span><h2>${era.title}</h2><p>${detail}</p></div>${b(i('play')+' '+e(labels.guide),'scene-guide','btn full')}<span class="memory-demo-note">AI 全景与三维模型示例 · 依据回忆复原</span></div>`;
    const id=ITEMS[P.state.hotspot]?P.state.hotspot:'desk',item=ITEMS[id],readable=P.visibleStories().some(story=>story.id===item.source);
    const source=readable?b(i('source')+' '+e(item.sourceLabel || '查看原始记录'),'listen','btn secondary compact',`data-id="${item.source}"`):P.link('申请查看相关故事','story/'+item.source,'btn secondary compact');
    return `<div class="scene-sheet"><div class="memory-sheet-heading"><div><p class="memory-kicker">${P.state.year} · ${P.state.guide?'跟随讲述':'物件里的故事'}</p><h2>${readable?item.title:item.label}</h2></div>${b(i('close'),'space-close-story','icon-button','aria-label="收起故事面板"')}</div><p>${readable?item.text:'关联故事暂未向当前账号开放。可以向记录本人申请查看。'}</p><div class="memory-story-actions">${source}${b('查看物件','space-focus','btn outline compact',`data-value="${id}" ${cameraReady()?'':'disabled'}`)}${P.state.guide?b('下一处 '+i('arrow'),'space-next','text-link'):''}</div>${b(i('chat')+' '+e(labels.ask),'ask-space','btn full',`data-id="${id}"`)}<span class="memory-demo-note">AI 全景与三维模型示例，不代表真实老宅扫描</span></div>`;
  }
  /** 说明可收成单行入口，为全景与模型留出画面，故事内容按原权限在展开时生成。 */
  function storyDock() {
    const collapsed=settings().dockCollapsed;
    return `${b(`<span>${collapsed?'展开说明与故事':'收起说明，看完整场景'}</span>${i('down')}`,'space-toggle-dock','memory-dock-toggle',`aria-expanded="${!collapsed}" aria-controls="memory-story-content"`)}<div id="memory-story-content" ${collapsed?'hidden':''}>${collapsed?'':storyContent()}</div>`;
  }
  /** 面板变高或变矮时同步相机工具位置；只更新叠层，不重建或重置三维视角。 */
  function updateDock(host=active?.host || document.querySelector('.memory-3d')) {
    if(!host)return;
    const dock=host.querySelector('#memory-story-dock');dock.innerHTML=storyDock();
    host.style.setProperty('--memory-dock-height',dock.offsetHeight+'px');
  }
  /** 三维画面和可读的物件入口共存，保留非手势操作。 */
  function view() {
    if(!P.FamilyContext.allowed(P.FamilyContext.current(),'space'))return P.FamilyContext.locked('space');
    if(P.FamilyContext.current()!=='father')return '<div class="page empty"><h2>这位家人尚未建立回忆场景</h2><p>不会使用其他人的老家代替。</p></div>';
    const s=settings();
    return `<section class="memory-scene memory-3d" data-mode="${s.mode}" data-render-state="loading" aria-label="回忆里的家，老家的三维场景">
      <div id="memory-viewport" class="memory-viewport"><p class="memory-loading">正在打开这间有故事的老屋…</p></div>
      <div class="memory-top"><div class="scene-title"><h1>回忆里的家</h1><p>老家的客厅 · <span id="memory-year">${P.state.year}</span> · 记忆复原示例</p></div>
        <div class="memory-mode-picker" aria-label="空间观察方式">${Object.entries(MODE_NAMES).map(([id,label])=>b(label,'space-mode',s.mode===id?'active':'',`data-value="${id}"`)).join('')}</div>
        <div class="memory-toolbar"><div class="era-picker" aria-label="年代示意">${['1986','2000','现在'].map(y=>b(y,'scene-year',P.state.year===y?'active':'',`data-value="${y}"`)).join('')}</div>${b('⤢','space-fullscreen','memory-icon-button','aria-label="全屏查看三维空间" title="全屏查看"')}</div></div>
      <div class="memory-hotspots">${Object.entries(ITEMS).map(([id,item])=>b(`<span></span>${item.label}`,'hotspot','hotspot '+id,`data-value="${id}" aria-pressed="${P.state.hotspot===id}"`)).join('')}</div>
      <div class="memory-bottom-tools"><div class="memory-compass" aria-hidden="true"><span id="memory-compass-needle">↑</span><small>北</small></div><div class="memory-camera-tools">${b('−','space-zoom','memory-icon-button','data-value="1" aria-label="拉远视角"')}${b('+','space-zoom','memory-icon-button','data-value="-1" aria-label="拉近视角"')}${b('↑','space-step','memory-icon-button','aria-label="向前走一步"')}${b(i('home'),'space-reset','memory-icon-button','aria-label="回到入口视角"')}${b('物件','space-objects','memory-icon-button memory-objects','aria-label="选择有故事的物件"')}</div></div>
      <div id="memory-story-dock" class="memory-story-dock">${storyDock()}</div>
      <div id="memory-asset-status" class="memory-asset-status" role="status"></div>
    </section>`;
  }
  /** 创建平衡的日光和柔和阴影，强调家具的体积关系。 */
  function lighting(scene) {
    scene.add(new T.HemisphereLight(0xfff9e9,0x9d927d,.6));scene.add(new T.AmbientLight(0xfff7e7,.12));
    const sun=new T.DirectionalLight(0xffe7bc,3.8);sun.position.set(6,4,.3);sun.target.position.set(0,.8,-.5);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:20});sun.shadow.normalBias=.018;sun.shadow.bias=-.0001;sun.shadow.radius=3;scene.add(sun,sun.target);
    const fill=new T.DirectionalLight(0xddeae2,.5);fill.position.set(-4,4,6);scene.add(fill);
  }
  /** 模型全览隐藏近侧墙，进入房间后还原四面空间。 */
  function updateWalls(ctx) {
    const s=ctx.settings;
    ctx.world.root.visible=s.mode!=='tour';ctx.base.visible=s.mode!=='tour';ctx.tour.root.visible=s.mode==='tour' && ctx.tour.ready;
    ctx.world.walls.forEach(w=>{w.group.visible=s.mode==='walk' || w.normal.dot(ctx.camera.position)<0;});
    ctx.world.ceiling.visible=s.mode==='walk';
  }
  /** 使用真实透视相机，移动或旋转时产生可观察的视差。 */
  function updateCamera(ctx,snap=false) {
    const s=ctx.settings,p=s[s.mode],aspect=ctx.width/ctx.height;
    const target=new T.Vector3(),position=new T.Vector3();
    if(s.mode==='model'){
      ctx.camera.fov=43;const radius=7.4/(2*Math.tan(T.MathUtils.degToRad(43)/2)*aspect)*p.zoom;
      target.set(0,.95,0);position.set(Math.sin(p.yaw)*Math.cos(p.pitch)*radius,Math.sin(p.pitch)*radius+.95,Math.cos(p.yaw)*Math.cos(p.pitch)*radius);
    }else if(s.mode==='walk'){
      ctx.camera.fov=T.MathUtils.clamp(84*p.zoom,55,100);position.set(p.x,1.57,p.z);
      target.copy(position).add(new T.Vector3(Math.sin(p.yaw)*Math.cos(p.pitch),Math.sin(p.pitch),-Math.cos(p.yaw)*Math.cos(p.pitch)));
    }else{
      ctx.camera.fov=T.MathUtils.clamp(88*p.zoom,48,105);position.set(0,1.57,0);
      target.copy(position).add(new T.Vector3(Math.sin(p.yaw)*Math.cos(p.pitch),Math.sin(p.pitch),-Math.cos(p.yaw)*Math.cos(p.pitch)));
    }
    ctx.camera.aspect=aspect;ctx.camera.updateProjectionMatrix();
    const factor=snap || matchMedia('(prefers-reduced-motion: reduce)').matches?1:.18;
    ctx.camera.position.lerp(position,factor);
    const look=new T.Matrix4().lookAt(ctx.camera.position,target,new T.Vector3(0,1,0));
    ctx.camera.quaternion.slerp(new T.Quaternion().setFromRotationMatrix(look),factor);
    updateWalls(ctx);
  }
  /** 遮挡或背向相机的物件不显示悬浮标记。 */
  function visible(object) {for(let node=object;node;node=node.parent)if(!node.visible)return false;return true;}
  /** 标签跟随三维物件投影，并按标签自身宽高留边，防止窄屏和大字号时裁掉操作。 */
  function projectHotspots(ctx) {
    const anchors=ctx.settings.mode==='tour'?ctx.tour.anchors:ctx.world.anchors;
    for(const [id,point]of Object.entries(anchors)){
      const label=ctx.host.querySelector(`.hotspot[data-value="${id}"]`),projected=point.clone().project(ctx.camera);
      const inside=(ctx.settings.mode==='tour'?ctx.tour.ready:visible(ctx.world.objects[id])) && projected.z>-1 && projected.z<1 && Math.abs(projected.x)<.83 && Math.abs(projected.y)<.92;
      label.hidden=!inside;
      if(inside){const halfWidth=label.offsetWidth/2+8,halfHeight=label.offsetHeight/2+8;label.style.left=T.MathUtils.clamp((projected.x+1)*ctx.width/2,halfWidth,ctx.width-halfWidth)+'px';label.style.top=T.MathUtils.clamp((1-projected.y)*ctx.height/2,halfHeight,ctx.height-halfHeight)+'px';}
    }
    const needle=ctx.host.querySelector('#memory-compass-needle');
    needle.style.transform=`rotate(${-T.MathUtils.radToDeg(ctx.settings[ctx.settings.mode].yaw)}deg)`;
  }
  /** 将当前相机和面板状态同步到原型工具区。 */
  function report() {P.updatePreview?.();}
  /** 只更新三维叠层，选中故事时不销毁 GPU 场景。 */
  function select(id) {
    const host=active?.host || document.querySelector('.memory-3d');
    if(!ITEMS[id] || !host)return;
    P.state.hotspot=id;P.state.spaceStoryOpen=true;settings().dockCollapsed=false;
    updateDock(host);
    host.querySelectorAll('.hotspot').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.value===id)));
    report();
  }
  /** 模式、年代和控件状态在加载失败时保持一致；不叠加操作提示，错误由各自状态面板说明。 */
  function syncControls() {
    const host=active?.host || document.querySelector('.memory-3d');if(!host)return;
    const s=settings(),ready=cameraReady(host);
    host.querySelectorAll('[data-action="space-mode"]').forEach(el=>el.classList.toggle('active',el.dataset.value===s.mode));
    host.querySelectorAll('[data-action="scene-year"]').forEach(el=>el.classList.toggle('active',el.dataset.value===P.state.year));
    host.querySelectorAll(CAMERA_ACTIONS.map(action=>`[data-action="${action}"]`).join(',')).forEach(el=>{el.disabled=!ready;});
    host.querySelector('#memory-year').textContent=P.state.year;host.dataset.mode=s.mode;
    host.querySelector('[data-action="space-step"]').hidden=s.mode==='tour';
    report();
  }
  /** 视角保持用于年代对照；若新增家具占据当前位置，仅重置三维漫游落脚点。 */
  function changeEra(year) {
    if(!window.MemoryRoomModel.ERAS[year])return;
    P.state.year=year;
    if(active){
      active.world.setEra(year);active.tour.setEra(year);
      const p=active.settings.walk;
      if(active.world.obstacles.some(([left,right,back,front])=>p.x>left-.1&&p.x<right+.1&&p.z>back-.1&&p.z<front+.1)){
        Object.assign(p,STOPS.entry);if(active.settings.mode==='walk')P.toast('这一年代的家具位置有变化，已回到入口。');
      }
    }
    const host=active?.host || document.querySelector('.memory-3d');if(host)updateDock(host);
    syncControls();
  }
  /** 进入物件附近的固定落脚点，避免把相机放进家具内部。 */
  function focus(id) {
    if(!active)return;
    if(active.settings.mode==='tour'){Object.assign(active.settings.tour,ITEMS[id]?window.MemoryRoomTour.direction(id):{yaw:.18,pitch:-.04});active.settings.tour.zoom=1;syncControls();return;}
    const stop=STOPS[id] || STOPS.entry,p=active.settings.walk;
    Object.assign(p,stop);p.zoom=1;
    if(ITEMS[id]){const point=active.world.anchors[id];p.yaw=Math.atan2(point.x-p.x,-(point.z-p.z));p.pitch=Math.atan2(point.y-1.57,Math.hypot(point.x-p.x,point.z-p.z));}
    active.settings.mode='walk';syncControls();
  }
  /** 相机缩放保持在可读范围，室内模式改动视野角度。 */
  function zoom(amount) {
    if(!active)return;
    const pose=active.settings[active.settings.mode];pose.zoom=T.MathUtils.clamp(pose.zoom+amount,.58,1.48);report();
  }
  /** 仅在空地落脚，避免观察相机进入家具或墙体。 */
  function moveTo(ctx,x,z) {
    const nextX=T.MathUtils.clamp(x,-2.12,2.12),nextZ=T.MathUtils.clamp(z,-2.72,2.72);
    const blocked=ctx.world.obstacles.some(([left,right,back,front])=>nextX>left-.1&&nextX<right+.1&&nextZ>back-.1&&nextZ<front+.1);
    if(blocked){P.toast('前面有家具，可以转动视角，或点击空地移动。');return;}
    Object.assign(ctx.settings.walk,{x:nextX,z:nextZ});report();
  }
  /** 前进和侧移沿着当前观察方向，保持人眼高度。 */
  function step(forward,side=0) {
    if(!active)return;
    if(active.settings.mode!=='walk'){focus('entry');return;}
    const p=active.settings.walk;
    moveTo(active,p.x+Math.sin(p.yaw)*forward+Math.cos(p.yaw)*side,p.z-Math.cos(p.yaw)*forward+Math.sin(p.yaw)*side);
  }
  /** 点击模型实体也能打开其故事，而非只能点悬浮按钮。 */
  function pick(ctx,x,y) {
    if(ctx.settings.mode==='tour')return;
    const rect=ctx.canvas.getBoundingClientRect();
    const pointer=new T.Vector2((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);
    ctx.raycaster.setFromCamera(pointer,ctx.camera);
    const hit=ctx.raycaster.intersectObject(ctx.world.root,true).find(item=>visible(item.object));
    if(hit?.object.userData.hotspot)select(hit.object.userData.hotspot);
    else if(hit?.object.userData.floor && ctx.settings.mode==='walk')moveTo(ctx,hit.point.x,hit.point.z);
  }
  /** 鼠标与触屏共享观察控制；两指操作用于缩放。 */
  function bindPointer(ctx) {
    const points=new Map();let start=null,lastPinch=0;
    ctx.canvas.addEventListener('pointerdown',event=>{
      ctx.canvas.focus({preventScroll:true});ctx.canvas.setPointerCapture(event.pointerId);points.set(event.pointerId,{x:event.clientX,y:event.clientY});
      start={x:event.clientX,y:event.clientY,moved:false};
      if(points.size===2){const p=[...points.values()];lastPinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}
    },{signal:ctx.abort.signal});
    ctx.canvas.addEventListener('pointermove',event=>{
      if(!points.has(event.pointerId))return;
      const previous=points.get(event.pointerId),dx=event.clientX-previous.x,dy=event.clientY-previous.y;
      points.set(event.pointerId,{x:event.clientX,y:event.clientY});
      if(Math.hypot(event.clientX-start.x,event.clientY-start.y)>5)start.moved=true;
      if(points.size===2){const p=[...points.values()],distance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);zoom((lastPinch-distance)*.002);lastPinch=distance;return;}
      const pose=ctx.settings[ctx.settings.mode];pose.yaw-=dx*.008;pose.pitch=T.MathUtils.clamp(pose.pitch+(ctx.settings.mode==='model'?dy:-dy)*.006,ctx.settings.mode==='model'?.2:-.8,ctx.settings.mode==='model'?1.22:.8);report();
    },{signal:ctx.abort.signal});
    ctx.canvas.addEventListener('pointerup',event=>{if(start&&!start.moved&&points.size===1)pick(ctx,event.clientX,event.clientY);points.delete(event.pointerId);lastPinch=0;},{signal:ctx.abort.signal});
    ctx.canvas.addEventListener('pointercancel',event=>{points.delete(event.pointerId);lastPinch=0;},{signal:ctx.abort.signal});
    ctx.canvas.addEventListener('wheel',event=>{event.preventDefault();zoom(Math.sign(event.deltaY)*.07);},{signal:ctx.abort.signal,passive:false});
    ctx.canvas.addEventListener('keydown',event=>{
      const pose=ctx.settings[ctx.settings.mode];
      if(event.key==='ArrowLeft')pose.yaw+=.12;else if(event.key==='ArrowRight')pose.yaw-=.12;
      else if(event.key==='ArrowUp')pose.pitch=T.MathUtils.clamp(pose.pitch+.08,ctx.settings.mode==='model'?.2:-.8,1.15);
      else if(event.key==='ArrowDown')pose.pitch=T.MathUtils.clamp(pose.pitch-.08,ctx.settings.mode==='model'?.2:-.8,1.15);
      else if(ctx.settings.mode==='tour')return;
      else if(event.key.toLowerCase()==='w')step(.35);else if(event.key.toLowerCase()==='s')step(-.35);
      else if(event.key.toLowerCase()==='a')step(0,-.35);else if(event.key.toLowerCase()==='d')step(0,.35);else return;
      event.preventDefault();report();
    },{signal:ctx.abort.signal});
  }
  /** 容器变化时重新计算透视比例，支持手机画板和全屏。 */
  function resize(ctx) {
    const rect=ctx.viewport.getBoundingClientRect();ctx.width=Math.max(1,rect.width);ctx.height=Math.max(1,rect.height);
    ctx.renderer.setSize(ctx.width,ctx.height,false);ctx.pipeline.resize(ctx.width,ctx.height);updateCamera(ctx,true);
  }
  /** 加载完整家具后渲染；异步加载期间离开页面会取消这一轮挂载。 */
  async function mount() {
    if(!P.FamilyContext.allowed(P.FamilyContext.current(),'space'))return;
    const host=document.querySelector('.memory-3d');if(!host)return;
    const viewport=host.querySelector('#memory-viewport'),request=++mountRequest;let assets,renderer,scene,world,environment,tour,pipeline,ctx;
    host.dataset.renderState='loading';const retry=host.querySelector('[data-action="space-retry"]');if(retry)retry.disabled=true;syncControls();
    try{
      assets=await window.MemoryRoomAssets.load();
      if(request!==mountRequest || !host.isConnected){assets.dispose();return;}
      renderer=new T.WebGLRenderer({antialias:true,alpha:false});
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
      renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
      scene=new T.Scene();scene.background=new T.Color(0xece8dd);lighting(scene);
      world=window.MemoryRoomModel.build(assets);if(world.era!==P.state.year)world.setEra(P.state.year);scene.add(world.root);
      const pmrem=new T.PMREMGenerator(renderer);try{environment=pmrem.fromEquirectangular(world.environment);}finally{pmrem.dispose();}scene.environment=environment.texture;scene.environmentIntensity=.95;
      const base=new T.Mesh(new T.PlaneGeometry(200,200),new T.MeshStandardMaterial({color:0xe4e0d4,roughness:1}));base.rotation.x=-Math.PI/2;base.position.y=-.23;base.receiveShadow=true;scene.add(base);
      const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','三维记忆房间，可以拖动或用方向键查看，滚轮缩放。');viewport.replaceChildren(canvas);
      tour=window.MemoryRoomTour.create(scene,(message,phase)=>{
        if(request!==mountRequest || !host.isConnected)return;
        host.dataset.panoramaState=phase;const status=host.querySelector('#memory-asset-status');status.dataset.phase=phase;
        status.innerHTML=phase==='error'?`<p>${e(message)}</p>${b('重试全景','space-retry-tour','btn secondary compact')}`:e(message);syncControls();
      });tour.setEra(P.state.year);
      const camera=new T.PerspectiveCamera(43,1,.04,150);pipeline=window.MemoryRoomRenderer.create(renderer,scene,camera);
      ctx={host,viewport,canvas,renderer,scene,world,tour,base,environment,camera,pipeline,raycaster:new T.Raycaster(),settings:settings(),abort:new AbortController(),frame:0,width:1,height:1,assets};
      active=ctx;resize(ctx);bindPointer(ctx);ctx.observer=new ResizeObserver(()=>resize(ctx));ctx.observer.observe(viewport);
      ctx.dockObserver=new ResizeObserver(()=>host.style.setProperty('--memory-dock-height',host.querySelector('#memory-story-dock').offsetHeight+'px'));ctx.dockObserver.observe(host.querySelector('#memory-story-dock'));
      const frame=()=>{if(active!==ctx)return;updateCamera(ctx);pipeline.render(ctx.settings.mode);projectHotspots(ctx);ctx.frame=requestAnimationFrame(frame);};frame();
      document.addEventListener('fullscreenchange',()=>{if(active===ctx){host.querySelector('[data-action="space-fullscreen"]').textContent=document.fullscreenElement?'⤡':'⤢';resize(ctx);}},{signal:ctx.abort.signal});
      host.dataset.renderState='ready';syncControls();
    }catch(error){
      const current=request===mountRequest&&host.isConnected;if(active===ctx)active=null;
      disposeResources(ctx || {assets,renderer,scene,world,environment,tour,pipeline});
      if(!current)return;
      // 失败只展示标明示意的静态老屋和重试入口，物件阅读仍走既有授权链路。
      host.dataset.renderState='error';viewport.innerHTML=`<div class="memory-error"><h2>三维空间暂时无法打开</h2><p>物件故事仍可阅读、查看来源和提问。相机控件暂不可用，可以重试加载，或使用支持 WebGL 的 Chrome／Edge。</p>${b('重新载入空间','space-retry','btn full')}${b('阅读老家的故事','space-objects','btn secondary full section')}<small>示意复原，并非客户实景</small></div>`;
      syncControls();console.error('三维记忆空间初始化失败',error);
    }
  }
  /** 成功挂载和半途失败共享资源释放路径，已离开的异步请求不能留下图形上下文。 */
  function disposeResources(ctx) {
    cancelAnimationFrame(ctx.frame || 0);ctx.abort?.abort();ctx.observer?.disconnect();ctx.dockObserver?.disconnect();
    ctx.tour?.dispose();ctx.pipeline?.dispose();ctx.environment?.dispose();
    const assets=ctx.assets || ctx.world?.assets,textures=new Set(),materials=new Set([...(ctx.world?.materials || []),...(assets?.materials || [])]),geometry=new Set(assets?.geometry || []);
    if(ctx.world?.environment)textures.add(ctx.world.environment);
    Object.values(assets?.maps || {}).forEach(value=>{if(value.isTexture)textures.add(value);else Object.values(value).forEach(map=>textures.add(map));});
    ctx.scene?.traverse(object=>{if(object.geometry)geometry.add(object.geometry);if(object.material){const list=Array.isArray(object.material)?object.material:[object.material];list.forEach(mat=>{materials.add(mat);Object.values(mat).forEach(value=>{if(value?.isTexture)textures.add(value);});});}});
    materials.forEach(mat=>Object.values(mat).forEach(value=>{if(value?.isTexture)textures.add(value);}));
    geometry.forEach(x=>x.dispose());textures.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());ctx.renderer?.dispose();ctx.renderer?.forceContextLoss();
  }
  /** 离开页面先使请求失效，再释放资源；返回空间会创建独立的新场景。 */
  function unmount() {
    mountRequest++;if(!active)return;const ctx=active;active=null;disposeResources(ctx);
  }
  /** 不支持或被拒绝的全屏操作提供可见反馈，不把无响应当成成功。 */
  async function toggleFullscreen(host) {
    const target=document.fullscreenElement?document:host,method=document.fullscreenElement?'exitFullscreen':'requestFullscreen';
    if(typeof target[method]!=='function'){P.toast('当前浏览器不支持全屏，可以继续在页面中查看。');return;}
    try{await target[method]();}catch(error){P.toast('当前窗口不能全屏，可在独立原型页面中打开。');console.info('记忆空间全屏未开启',error);}
  }
  /** 可视按钮与模型操作使用同一组相机状态。 */
  function handleAction(action,el) {
    if(!document.querySelector('.memory-3d'))return false;
    if(action==='space-toggle-dock'){settings().dockCollapsed=!settings().dockCollapsed;updateDock();report();return true;}
    if(action==='space-mode'){if(!MODE_NAMES[el.dataset.value])return true;settings().mode=el.dataset.value;settings().dockCollapsed=true;updateDock();syncControls();if(active)updateCamera(active,true);return true;}
    if(action==='hotspot'){select(el.dataset.value);return true;}
    if(action==='space-focus'){focus(el.dataset.value);return true;}
    if(action==='space-close-story'){P.state.spaceStoryOpen=false;P.state.guide=false;settings().dockCollapsed=true;updateDock();report();return true;}
    if(action==='space-step'){step(.4);return true;}
    if(action==='space-zoom'){zoom(Number(el.dataset.value)*.12);return true;}
    if(action==='space-reset'){if(active){const s=active.settings;s.model={yaw:-.43,pitch:.68,zoom:1};s.walk={...STOPS.entry,zoom:1};s.tour={yaw:.18,pitch:-.04,zoom:1};syncControls();}return true;}
    if(action==='scene-year'){changeEra(el.dataset.value);return true;}
    if(action==='scene-guide' || action==='space-next'){const order=['radio','photo','desk'];if(action==='scene-guide'&&P.state.guide){P.state.guide=false;updateDock();return true;}P.state.guide=true;const id=action==='space-next'?order[(order.indexOf(P.state.hotspot)+1)%order.length]:'radio';select(id);focus(id);return true;}
    if(action==='space-fullscreen'){toggleFullscreen(document.querySelector('.memory-3d'));return true;}
    if(action==='space-retry'){unmount();mount();return true;}
    if(action==='space-retry-tour'){if(active)active.tour.setEra(P.state.year);return true;}
    if(action==='space-objects'){P.modal('这间屋里的故事',`<div class="memory-object-list">${Object.entries(ITEMS).map(([id,item])=>b(`<strong>${item.label}</strong><span>${item.title}</span>`,'space-object-select','',`data-value="${id}"`)).join('')}</div>`);return true;}
    if(action==='space-object-select'){P.closeModal();select(el.dataset.value);focus(el.dataset.value);return true;}
    return false;
  }
  /** 物件来源由空间模块统一定义，追问消费者无需维护另一份故事映射。 */
  P.MemorySpace={view,enter,mount,unmount,handleAction,select,focus,items(){return ITEMS;}};
}

