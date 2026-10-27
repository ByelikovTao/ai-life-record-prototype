/** 授权示例人物的三维渲染、面部形变与自然待机；保留骨骼绑定，不用照片模拟模型。 */
'use strict';
{
  const P=window.App,T=window.MemoryThree;
  const VISEMES=['viseme_aa','viseme_E','viseme_O','viseme_U','viseme_PP'];
  const PORTRAIT_YAW=-.08;
  let active=null;
  /** 各网格有独立的形变索引，眼眉、牙齿与面部必须分别更新。 */
  function morph(ctx,name,value) {
    ctx.faces.forEach(mesh=>{const index=mesh.morphTargetDictionary[name];if(index!==undefined)mesh.morphTargetInfluences[index]=value;});
  }
  /** 口型在相邻音素间平滑过渡，并保留停顿，避免机械地大幅张嘴。 */
  function speech(ctx,elapsed) {
    VISEMES.forEach(name=>morph(ctx,name,0));
    if(elapsed===null)return;
    const position=elapsed*3.2,index=Math.floor(position),fraction=position-index;
    const blend=fraction*fraction*(3-2*fraction);
    const pause=Math.max(0,Math.sin(elapsed*Math.PI*.8));
    const strength=(.12+.12*Math.sin(elapsed*Math.PI*3)**2)*pause;
    morph(ctx,VISEMES[index%VISEMES.length],strength*(1-blend));
    morph(ctx,VISEMES[(index+1)%VISEMES.length],strength*blend);
  }
  /** 待机眨眼、呼吸和轻微头部动作；不连接任何音频输入或输出。 */
  function animate(ctx,time) {
    const s=P.DigitalHuman.settings(),seconds=time/1000,blink=seconds%4.3;
    const blinking=blink>4.12?Math.sin((blink-4.12)/.18*Math.PI):0;
    morph(ctx,'eyeBlinkLeft',blinking);morph(ctx,'eyeBlinkRight',blinking);
    const warm=s.emotion==='warm';
    morph(ctx,'mouthSmile',warm?.8:.025);morph(ctx,'browInnerUp',warm?.02:.06);
    morph(ctx,'eyeSquintLeft',warm?.26:0);morph(ctx,'eyeSquintRight',warm?.26:0);morph(ctx,'jawOpen',warm?.09:0);morph(ctx,'mouthUpperUp',warm?.15:0);
    speech(ctx,s.silentDemo?(time-s.animationStarted)/1000:null);
    if(ctx.head){ctx.head.rotation.copy(ctx.headRest);if(!ctx.reduceMotion){ctx.head.rotation.y+=Math.sin(seconds*.65)*.018;ctx.head.rotation.x+=Math.sin(seconds*.9)*.009;}}
    if(ctx.root){ctx.root.rotation.y=ctx.yaw;ctx.root.position.y=ctx.baseY+(ctx.reduceMotion?0:Math.sin(seconds*1.5)*.002);}
    ctx.renderer.render(ctx.scene,ctx.camera);
    ctx.frame=requestAnimationFrame(next=>{if(active===ctx)animate(ctx,next);});
  }
  /** 模型文件经 gzip 内嵌，直接打开 HTML 也不需要跨源文件请求。 */
  async function modelData() {
    if(!window.DecompressionStream)throw new Error('当前浏览器不支持模型解压，请使用新版 Chrome 或 Edge。');
    const bytes=Uint8Array.from(atob(window.MemoryAvatarData.gzip),character=>character.charCodeAt(0));
    return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  /** 将导出的 A 姿态手臂自然放低，保留蒙皮绑定和服装随动。 */
  function relaxArms(root) {
    for(const [name,side] of [['LeftArm',1],['RightArm',-1]]){
      const arm=root.getObjectByName(name);if(!arm)continue;
      root.updateMatrixWorld(true);
      const world=arm.getWorldQuaternion(new T.Quaternion()),parent=arm.parent.getWorldQuaternion(new T.Quaternion());
      const current=new T.Vector3(0,1,0).applyQuaternion(world),desired=new T.Vector3(side*.12,-1,.04).normalize();
      const delta=new T.Quaternion().setFromUnitVectors(current,desired);
      arm.quaternion.copy(parent.invert().multiply(delta).multiply(world));
    }
  }
  /** 参考照片采用黑灰短发与浅蓝衬衫；皮肤保留纹理，避免橙色和塑料高光。 */
  function portraitMaterial(material) {
    material.envMapIntensity=.35;
    if(material.name==='Skin'){material.roughness=.72;material.metalness=0;material.color.setRGB(.95,1.05,1.12);}
    if(material.name==='Hair')material.roughness=.72;
    Object.values(material).forEach(value=>{if(value?.isTexture)value.anisotropy=4;});
  }
  /** 以头顶和胸口定位肖像镜头，避免全身默认视角把脸缩成小点。 */
  function fit(ctx,root) {
    relaxArms(root);
    root.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(root),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
    const scale=1.7/size.y;root.scale.multiplyScalar(scale);root.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);root.updateMatrixWorld(true);
    ctx.head=root.getObjectByName('Head');ctx.headRest=ctx.head?.rotation.clone();ctx.baseY=root.position.y;
    const focus=1.7-.7*.46,distance=.7/(2*Math.tan(T.MathUtils.degToRad(ctx.camera.fov/2)));
    ctx.camera.position.set(0,focus+.025,distance);ctx.camera.lookAt(0,focus,0);
    root.traverse(object=>{
      if(!object.isMesh)return;
      object.frustumCulled=false;
      if(object.morphTargetDictionary)ctx.faces.push(object);
      const list=Array.isArray(object.material)?object.material:[object.material];
      list.forEach(portraitMaterial);
    });ctx.scene.add(root);ctx.root=root;
  }
  /** 容器随屏幕和字号改变尺寸，相机保持相同的人物焦点。 */
  function resize(ctx) {
    const box=ctx.host.getBoundingClientRect(),width=Math.max(1,box.width),height=Math.max(1,box.height);
    ctx.renderer.setSize(width,height,false);ctx.camera.aspect=width/height;ctx.camera.updateProjectionMatrix();
  }
  /** 拖动真实模型，允许从左右角度观察；回正按钮恢复正面。 */
  function bind(ctx) {
    let previous=null;
    ctx.canvas.addEventListener('pointerdown',event=>{previous=event.clientX;ctx.canvas.setPointerCapture(event.pointerId);},{signal:ctx.abort.signal});
    ctx.canvas.addEventListener('pointermove',event=>{if(previous===null)return;ctx.yaw=T.MathUtils.clamp(ctx.yaw+(event.clientX-previous)*.008,-.55,.55);previous=event.clientX;},{signal:ctx.abort.signal});
    ctx.canvas.addEventListener('pointerup',()=>{previous=null;},{signal:ctx.abort.signal});
    ctx.canvas.addEventListener('pointercancel',()=>{previous=null;},{signal:ctx.abort.signal});
  }
  /** 同页消息更新复用渲染器，避免每条回复重新加载人物或丢失正在播放的口型。 */
  async function mount() {
    const host=document.getElementById('avatar-viewport');if(!host)return;
    if(active){active.observer.disconnect();active.host=host;host.replaceChildren(active.canvas);host.dataset.ready=String(Boolean(active.root));active.observer.observe(host);resize(active);return;}
    const ctx={host,abort:new AbortController(),faces:[],yaw:PORTRAIT_YAW,frame:0,root:null,head:null,reduceMotion:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches};
    active=ctx;
    try{
      const renderer=new T.WebGLRenderer({antialias:true,alpha:true});ctx.renderer=renderer;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
      ctx.scene=new T.Scene();ctx.scene.add(new T.HemisphereLight(0xfffaf1,0xb2a497,.8));
      const key=new T.DirectionalLight(0xfff3e3,2);key.position.set(-2,2.5,4);ctx.scene.add(key);
      const fill=new T.DirectionalLight(0xe8eef2,.5);fill.position.set(3,1.5,2);ctx.scene.add(fill);
      const rim=new T.DirectionalLight(0xffe2b8,.35);rim.position.set(1,2,-2);ctx.scene.add(rim);
      ctx.camera=new T.PerspectiveCamera(36,1,.01,20);ctx.canvas=renderer.domElement;ctx.canvas.setAttribute('role','img');ctx.canvas.setAttribute('aria-label','可转动的东亚男性长辈三维示例人物，具有口型和表情动画');host.replaceChildren(ctx.canvas);
      ctx.observer=new ResizeObserver(()=>resize(ctx));ctx.observer.observe(host);bind(ctx);resize(ctx);
      const data=await modelData(),gltf=await new T.GLTFLoader().parseAsync(data,'');
      if(active!==ctx){disposeObject(gltf.scene);return;}
      fit(ctx,gltf.scene);host.dataset.ready='true';P.DigitalHuman.modelReady();animate(ctx,performance.now());
    }catch(error){if(active!==ctx)return;unmount();P.DigitalHuman.modelError(error.message);console.error('示例数字人加载失败',error);}
  }
  /** 场景中共享的纹理与材质只释放一次。 */
  function disposeObject(root) {
    const geometry=new Set(),materials=new Set(),textures=new Set();
    root.traverse(object=>{if(object.geometry)geometry.add(object.geometry);if(object.material){const list=Array.isArray(object.material)?object.material:[object.material];list.forEach(material=>{materials.add(material);Object.values(material).forEach(value=>{if(value?.isTexture)textures.add(value);});});}});
    geometry.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());
  }
  /** 离开数字人页面时停止动画并释放 GPU 资源；不保留离线后台动画。 */
  function unmount() {
    if(!active)return;const ctx=active;active=null;cancelAnimationFrame(ctx.frame);ctx.abort.abort();ctx.observer?.disconnect();
    if(ctx.scene)disposeObject(ctx.scene);ctx.renderer?.dispose();ctx.renderer?.forceContextLoss();
  }
  window.App.AvatarModel={mount,unmount,reset(){if(active)active.yaw=PORTRAIT_YAW;}};
}
