/** 离线房间材质：木纹、织物、墙面和柔和环境反射，不依赖外部贴图服务。 */
'use strict';
{
  const T=window.MemoryThree;
  /** 固定随机序列，让同一材质在三个年代和刷新后保持一致。 */
  function noise(seed) {let value=seed;return ()=>{value=(value*1664525+1013904223)>>>0;return value/4294967296;};}
  /** 绘制细密材质纹理，木板具有色差、接缝、纤维与局部结疤。 */
  function surface(kind) {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
    const c=canvas.getContext('2d'),random=noise(73);
    c.fillStyle=kind==='wood'?'#b29a78':kind==='cloth'?'#d5cdbb':kind==='rug'?'#b6a58b':'#dcd9cf';c.fillRect(0,0,1024,1024);
    if(kind==='wood'){
      for(let plank=0;plank<8;plank++){
        const x=plank*128,shade=125+random()*28;
        c.fillStyle=`rgb(${shade+35},${shade+13},${shade-20})`;c.fillRect(x,0,127,1024);
        for(let grain=0;grain<150;grain++){
          const gx=x+random()*125;c.strokeStyle=`rgba(59,35,16,${.015+random()*.055})`;c.lineWidth=.3+random()*1.4;
          c.beginPath();c.moveTo(gx,0);c.bezierCurveTo(gx+random()*12,330,gx-random()*15,650,gx+random()*5,1024);c.stroke();
        }
        c.fillStyle='#3c2c191c';c.fillRect(x,0,1,1024);c.fillRect(x,plank%2?340:740,128,1.5);
        const knotY=random()*900+60;c.strokeStyle='#4f31161c';
        for(let ring=1;ring<9;ring++){c.beginPath();c.ellipse(x+65,knotY,ring*1.6,ring*9,0,0,Math.PI*2);c.stroke();}
      }
    }else if(kind==='cloth' || kind==='rug'){
      for(let n=0;n<1024;n+=3){c.strokeStyle=n%2?'#ffffff18':'#493b2725';c.lineWidth=1;c.beginPath();c.moveTo(n,0);c.lineTo(n,1024);c.moveTo(0,n);c.lineTo(1024,n);c.stroke();}
      if(kind==='rug'){c.strokeStyle='#5f685058';c.lineWidth=15;c.strokeRect(28,28,968,968);c.lineWidth=3;c.strokeRect(48,48,928,928);}
    }
    const image=c.getImageData(0,0,1024,1024);
    for(let p=0;p<image.data.length;p+=4){const shift=(random()-.5)*(kind==='plaster'?9:15);for(let k=0;k<3;k++)image.data[p+k]+=shift;}
    c.putImageData(image,0,0);
    const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=8;
    return map;
  }
  /** 本地照片以 data URI 加载，双击 HTML 时也不会产生跨源纹理错误。 */
  function picture() {
    const map=new T.Texture(),image=new Image();map.colorSpace=T.SRGBColorSpace;
    image.onload=()=>{map.image=image;map.needsUpdate=true;};image.src=window.MemoryRoomImages.family;return map;
  }
  /** 每次房间构建独占一套材质，地板与墙面使用实际采集的 PBR 贴图。 */
  function create(assets) {
    const wood=surface('wood'),cloth=surface('cloth'),rug=surface('rug');
    const make=(color,options={})=>new T.MeshStandardMaterial({color,roughness:.75,...options});
    return {
      wood:make(0xe0c3a0,{map:wood,bumpMap:wood,bumpScale:.012}),darkWood:make(0x79634d,{map:wood,bumpMap:wood,bumpScale:.006,roughness:.46}),
      lightWood:make(0xd9c8ae,{map:wood,roughness:.5}),plaster:make(0xffffff,{map:assets.maps.wall.diffuse,normalMap:assets.maps.wall.normal,normalScale:new T.Vector2(.08,.08),roughnessMap:assets.maps.wall.arm,roughness:1}),
      floor:make(0xffffff,{map:assets.maps.floor.diffuse,normalMap:assets.maps.floor.normal,normalScale:new T.Vector2(.4,.4),roughnessMap:assets.maps.floor.arm,aoMap:assets.maps.floor.arm,roughness:.8}),
      green:make(0x344f42,{roughness:.48}),
      linen:make(0xede5d7,{map:cloth,bumpMap:cloth,bumpScale:.004,side:T.DoubleSide}),cream:make(0xf4eee0,{roughness:.5}),
      brass:make(0xb6955d,{metalness:.78,roughness:.3}),dark:make(0x272a27,{roughness:.32}),paper:make(0xe8dfc6,{roughness:.95}),
      rug:make(0xf4ead5,{map:rug,bumpMap:rug,bumpScale:.012}),radio:make(0x8f7c5d,{map:cloth,bumpMap:cloth,bumpScale:.009}),
      photo:make(0xffffff,{map:picture(),roughness:.55}),
      glass:new T.MeshPhysicalMaterial({color:0xd7e2d9,transparent:true,opacity:.14,metalness:.06,roughness:.04,side:T.DoubleSide,depthWrite:false}),
      screen:make(0x18252a,{roughness:.12,metalness:.25}),ceramic:make(0xe8ecdf,{roughness:.19,metalness:.04}),
      modern:make(0xe5e0d3,{roughness:.45}),
      red:make(0x785347,{map:cloth,roughness:.9}),book:make(0x657360),bookTan:make(0xab9270),bookRed:make(0x86584a),
      white:make(0xf3f1e7),light:new T.MeshStandardMaterial({color:0xffedc4,emissive:0xffdda1,emissiveIntensity:1.4}),
      environment:assets.maps.environment,assets
    };
  }
  window.MemoryRoomMaterials={create};
}
