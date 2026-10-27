/** 两种三维视图共用的接触阴影与色彩输出，增强家具落地感和凹槽层次。 */
'use strict';
{
  const T=window.MemoryThree;
  /** 全景模式直接输出图片；几何模式额外计算屏幕空间环境遮蔽。 */
  function create(renderer,scene,camera) {
    const target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,samples:4});
    const composer=new T.EffectComposer(renderer,target),beauty=new T.RenderPass(scene,camera),ao=new T.GTAOPass(scene,camera,1,1),output=new T.OutputPass();
    ao.output=T.GTAOPass.OUTPUT.Default;ao.blendIntensity=.9;ao.updateGtaoMaterial({radius:.33,distanceExponent:1.6,thickness:.3,samples:8});
    composer.addPass(beauty);composer.addPass(ao);composer.addPass(output);
    return {
      resize(width,height){composer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));composer.setSize(width,height);},
      render(mode){if(mode==='tour')renderer.render(scene,camera);else composer.render();},
      dispose(){ao.dispose();output.dispose();composer.dispose();}
    };
  }
  window.MemoryRoomRenderer={create};
}
