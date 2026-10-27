/** 写实全景浏览：固定观察点环顾，与可移动的三维模型分别标识。 */
'use strict';
{
  const T=window.MemoryThree;
  /** 全景中故事物件的方向来自该组素材，三个年代共享同一拍摄位置。 */
  const DIRECTIONS={radio:{u:.12,v:.53},photo:{u:.495,v:.405},desk:{u:.83,v:.55}};
  /** 将全景图片坐标换算为室内视线方向；水平中心朝向房间后墙。 */
  function direction(id) {
    const point=DIRECTIONS[id];return {yaw:(point.u-.5)*Math.PI*2,pitch:(.5-point.v)*Math.PI};
  }
  /** 投影锚点与相机同高，旋转时保持标签贴在全景物件上。 */
  function anchors() {
    return Object.fromEntries(Object.keys(DIRECTIONS).map(id=>{const p=direction(id),r=20;return [id,new T.Vector3(Math.sin(p.yaw)*Math.cos(p.pitch)*r,1.57+Math.sin(p.pitch)*r,-Math.cos(p.yaw)*Math.cos(p.pitch)*r)];}));
  }
  /** 图片按年代缓存，旧请求不覆盖新年代；onStatus(message,phase) 的 phase 为 loading、ready 或 error。 */
  function create(scene,onStatus) {
    const maps=new Map(),root=new T.Mesh(new T.SphereGeometry(50,96,64),new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}));
    root.geometry.scale(-1,1,1);root.rotation.y=-Math.PI/2;root.position.y=1.57;root.visible=false;scene.add(root);
    let disposed=false;
    const tour={root,anchors:anchors(),ready:false,era:null,
      setEra(year){
        tour.ready=false;tour.era=year;onStatus('正在打开 '+year+' 年代的全景…','loading');
        if(maps.has(year)){const cached=maps.get(year);if(cached.image){root.material.map=cached;root.material.needsUpdate=true;tour.ready=true;onStatus('','ready');}return;}
        const image=new Image(),map=new T.Texture();map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
        maps.set(year,map);
        image.onload=()=>{
          if(disposed){map.dispose();return;}
          map.image=image;map.needsUpdate=true;
          if(tour.era!==year)return;root.material.map=map;root.material.needsUpdate=true;tour.ready=true;onStatus('','ready');
        };
        image.onerror=()=>{maps.delete(year);map.dispose();if(!disposed&&tour.era===year){onStatus('全景素材未能加载，可以重试或切换到“屋子全貌”。','error');console.warn('记忆全景素材加载失败，年代：'+year);}};
        image.src=window.MemoryRoomImages[year];
      },
      dispose(){disposed=true;maps.forEach(map=>map.dispose());root.geometry.dispose();root.material.dispose();scene.remove(root);}
    };
    return tour;
  }
  window.MemoryRoomTour={create,direction};
}
