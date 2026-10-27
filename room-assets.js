/** 离线三维家具加载与实例化；模型几何和完整 PBR 材质共用于两种三维视图。 */
'use strict';
{
  const T=window.MemoryThree;
  /** 将资产变换烘入顶点，统一底面和中心，避免不同作者的坐标约定影响摆放。 */
  function normalize(scene,id) {
    scene.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(scene),center=bounds.getCenter(new T.Vector3());
    const root=new T.Group();root.name=id;const original=new Set();
    scene.traverse(object=>{
      if(!object.isMesh)return;
      const geometry=object.geometry.clone();geometry.applyMatrix4(object.matrixWorld);geometry.translate(-center.x,-bounds.min.y,-center.z);
      geometry.userData.roomAsset=true;const mesh=new T.Mesh(geometry,object.material);mesh.name=object.name;mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);original.add(object.geometry);
      const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];materials.forEach(material=>{
        material.envMapIntensity=.7;if(material.aoMap)material.aoMapIntensity=.85;
        Object.values(material).forEach(value=>{if(value?.isTexture)value.anisotropy=8;});
      });
    });
    original.forEach(geometry=>geometry.dispose());return root;
  }
  /** 保留扶手宽度，仅延展坐垫中央，把同系列单椅做成双人沙发。 */
  function sofaFromChair(chair) {
    const root=chair.clone(true),bounds=new T.Box3().setFromObject(root),width=bounds.getSize(new T.Vector3()).x,split=width*.23,extra=width*1.35;
    root.name='modern_sofa';root.traverse(mesh=>{
      if(!mesh.isMesh)return;
      mesh.geometry=mesh.geometry.clone();const points=mesh.geometry.attributes.position;
      for(let n=0;n<points.count;n++){const x=points.getX(n);points.setX(n,Math.abs(x)>split?x+Math.sign(x)*extra/2:x*(1+extra/(split*2)));}
      points.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
    });return root;
  }
  /** 将深色皮垫的反照率提亮为暖灰，保留皱褶、接缝和法线细节。 */
  function softenUpholstery(root) {
    root.traverse(mesh=>{
      if(!mesh.isMesh || !mesh.material.name.includes('pillow'))return;
      const material=mesh.material.clone(),image=material.map.image,canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
      const c=canvas.getContext('2d');c.drawImage(image,0,0);const pixels=c.getImageData(0,0,canvas.width,canvas.height);
      for(let n=0;n<pixels.data.length;n+=4){const luminance=pixels.data[n]*.21+pixels.data[n+1]*.72+pixels.data[n+2]*.07,value=105+Math.sqrt(luminance/255)*125;pixels.data[n]=value;pixels.data[n+1]=value*.975;pixels.data[n+2]=value*.92;}
      c.putImageData(pixels,0,0);material.map=new T.CanvasTexture(canvas);material.map.colorSpace=T.SRGBColorSpace;material.roughnessMap=null;material.roughness=.93;material.normalScale.set(.65,.65);material.metalness=0;mesh.material=material;
    });
  }
  /** 贴图使用明确色彩空间，法线和粗糙度保持线性数据。 */
  async function surfaces() {
    const loader=new T.TextureLoader(),output={};
    for(const key of ['floor','wall']){
      const source=window.MemoryRoomSurfaceData[key];output[key]={};
      await Promise.all(Object.entries(source).map(async([kind,uri])=>{
        const map=await loader.loadAsync(uri);if(kind==='diffuse')map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=8;
        if(key==='wall'&&kind==='diffuse'){
          const image=map.image,canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const c=canvas.getContext('2d');c.drawImage(image,0,0);
          const pixels=c.getImageData(0,0,canvas.width,canvas.height);
          for(let n=0;n<pixels.data.length;n+=4){const value=218+(pixels.data[n]+pixels.data[n+1]+pixels.data[n+2])/3*.12;pixels.data[n]=value;pixels.data[n+1]=value*.99;pixels.data[n+2]=value*.97;}
          c.putImageData(pixels,0,0);map.image=canvas;map.needsUpdate=true;
        }
        map.repeat.set(key==='floor'?1.4:2,key==='floor'?2:2);output[key][kind]=map;
      }));
    }
    const bytes=Uint8Array.from(atob(window.MemoryRoomSurfaceData.hdr.split(',')[1]),character=>character.charCodeAt(0));
    const hdr=new T.HDRLoader().parse(bytes.buffer);output.environment=new T.DataTexture(hdr.data,hdr.width,hdr.height,T.RGBAFormat,hdr.type);
    output.environment.mapping=T.EquirectangularReflectionMapping;output.environment.minFilter=T.LinearFilter;output.environment.magFilter=T.LinearFilter;output.environment.flipY=true;output.environment.colorSpace=T.LinearSRGBColorSpace;output.environment.needsUpdate=true;return output;
  }
  /** 加载仅解析内嵌数据；任一真实模型缺失时直接说明失败，不展示旧方块家具。 */
  async function load() {
    const loader=new T.GLTFLoader(),models={};
    await Promise.all(Object.entries(window.MemoryRoomModelData).map(async([id,data])=>{
      const gltf=await loader.parseAsync(JSON.stringify(data),'');models[id]=normalize(gltf.scene,id);
    }));
    softenUpholstery(models.modern_arm_chair_01);models.modern_sofa=sofaFromChair(models.modern_arm_chair_01);
    const maps=await surfaces(),geometry=new Set(),materials=new Set(),textures=new Set();
    Object.values(models).forEach(root=>root.traverse(mesh=>{if(!mesh.isMesh)return;geometry.add(mesh.geometry);const list=Array.isArray(mesh.material)?mesh.material:[mesh.material];list.forEach(material=>{materials.add(material);Object.values(material).forEach(value=>{if(value?.isTexture)textures.add(value);});});}));
    Object.values(maps).forEach(map=>{if(map.isTexture)textures.add(map);else Object.values(map).forEach(value=>textures.add(value));});
    return {models,maps,geometry,materials,
      dispose(){geometry.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());}
    };
  }
  /** 精确给定外接尺寸与底面位置，模型与碰撞范围使用同一个米制坐标。 */
  function place(assets,id,parent,size,position,angle=0) {
    const source=assets.models[id];if(!source)throw new Error('三维家具缺失：'+id);
    const group=new T.Group(),object=source.clone(true),dimensions=new T.Box3().setFromObject(source).getSize(new T.Vector3());
    object.scale.set(size[0]/dimensions.x,size[1]/dimensions.y,size[2]/dimensions.z);group.add(object);group.position.set(...position);group.rotation.y=angle;group.userData.asset=id;parent.add(group);return group;
  }
  window.MemoryRoomAssets={load,place};
}
