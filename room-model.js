/** 细化的三维老宅：共享建筑、可替换的年代家具和稳定的故事物件。 */
'use strict';
{
  const T=window.MemoryThree,F=window.MemoryRoomParts;
  /** 年代陈设与可行走区域由模型统一定义，避免镜头落进新家具。 */
  const ERAS={
    '1986':{title:'木椅、收音机与手写信',detail:'绿布木扶手椅 · 老式收音机 · 手写书桌',wall:0xe7e1d2,floor:0xc5a076,trim:0x3d5548,obstacles:[[-2.13,-.97,-1.99,-1.31],[.63,2.23,-1.78,-.92],[1.08,1.78,-.77,-.05],[-1.86,-1.02,-.29,.61],[-.62,.22,-.34,.57],[-1.42,-.18,.82,1.54],[1.14,2.02,-2.91,-2.41],[-1.1,.9,-2.8,-2.1]]},
    '2000':{title:'家里有了电视和电脑',detail:'布艺沙发 · 显像管电视 · 台式电脑',wall:0xf1eadb,floor:0xb98d69,trim:0x475e4e,obstacles:[[-2.13,-.97,-1.99,-1.31],[.63,2.23,-1.9,-.9],[1.08,1.78,-.77,-.05],[-2.12,.03,-.49,.53],[-1.42,-.18,.82,1.54],[1.14,2.02,-2.91,-2.41],[-2.2,-1.2,1.55,2.25]]},
    '现在':{title:'翻新后的家，留下熟悉的物件',detail:'浅色布艺沙发 · 平板电视 · 轻薄笔记本',wall:0xf8f5ed,floor:0xe4cfaa,trim:0x53695b,obstacles:[[-2.13,-.97,-1.99,-1.31],[.63,2.23,-1.78,-.92],[1.08,1.78,-.77,-.05],[-2.12,.03,-.49,.53],[-1.42,-.18,.82,1.54],[1.14,2.02,-2.91,-2.41],[.43,1.2,.05,.85],[-2.2,-1.1,2.16,2.65]]}
  };
  ERAS['1986'].modelDetail='雕花木扶手椅 · 经典皮沙发 · 旧木书桌';
  ERAS['2000'].modelDetail='绗缝皮沙发 · 显像管电视 · 台式电脑';
  ERAS['现在'].modelDetail='浅色软包座椅 · 圆茶桌 · 平板电视与笔记本';
  /** 窗帘采用褶皱曲面，模型从不同角度看都有厚度与层次。 */
  function curtain(parent,m,z) {
    const geometry=new T.PlaneGeometry(.72,1.94,24,14),positions=geometry.attributes.position;
    for(let n=0;n<positions.count;n++){const x=positions.getX(n),y=positions.getY(n);positions.setZ(n,Math.sin((x+.36)*48)*.035+(y<-.5?.025:0));}
    geometry.computeVertexNormals();const mesh=new T.Mesh(geometry,m.linen);mesh.rotation.y=-Math.PI/2;mesh.position.set(2.23,1.57,z);mesh.castShadow=true;parent.add(mesh);
  }
  /** 低矮护墙板、踢脚线与压条以真实木作比例组织。 */
  function wallDetails(group,m,name,pos) {
    const left=name==='left',width=left?6:4.85;
    F.box(group,left?[.025,.68,width]:[width,.68,.025],left?[-2.32,.36,0]:[0,.36,pos[2]*.978],m.green,.003);
    [.08,.72,2.78].forEach(y=>F.box(group,left?[.045,.045,width]:[width,.045,.045],left?[-2.3,y,0]:[0,y,pos[2]*.974],y>2?m.cream:m.green,.008));
    for(let n=0;n<Math.floor(width/.42);n++)F.box(group,left?[.017,.59,.012]:[.012,.59,.017],left?[-2.295,.37,-2.8+n*.42]:[-2.2+n*.42,.37,pos[2]*.971],m.green,.002);
  }
  /** 保留切墙模型与完整室内两种观察方式。 */
  function architecture(root,m) {
    const walls=[];F.box(root,[4.96,.16,6.16],[0,-.12,0],m.darkWood,.025);
    const floor=F.box(root,[4.8,.07,6],[0,-.015,0],m.floor,0);floor.userData.floor=true;
    const specs=[['back',[0,0,-1],[4.96,2.9,.13],[0,1.45,-3]],['left',[-1,0,0],[.13,2.9,6],[-2.4,1.45,0]],['front',[0,0,1],[4.96,2.9,.13],[0,1.45,3]]];
    specs.forEach(([name,normal,size,pos])=>{const group=new T.Group();root.add(group);F.box(group,size,pos,m.plaster,0);wallDetails(group,m,name,pos);walls.push({name,normal:new T.Vector3(...normal),group});});
    const right=new T.Group();root.add(right);
    F.box(right,[.13,.88,6],[2.4,.44,0],m.plaster,0);F.box(right,[.13,.48,6],[2.4,2.66,0],m.plaster,0);
    F.box(right,[.13,1.55,1.15],[2.4,1.65,-2.43],m.plaster,0);F.box(right,[.13,1.55,1.55],[2.4,1.65,2.23],m.plaster,0);
    F.box(right,[.025,.69,5.95],[2.32,.37,0],m.green,.003);F.box(right,[.045,.045,6],[2.3,.72,0],m.green,.008);
    [.9,2.38].forEach(y=>F.box(right,[.16,.065,3.4],[2.3,y,-.25],m.green,.01));
    [-1.94,-.82,.3,1.44].forEach(z=>F.box(right,[.13,1.53,.055],[2.32,1.65,z],m.green,.009));
    F.box(right,[.13,.045,3.4],[2.32,1.65,-.25],m.green,.008);F.box(right,[.25,.055,3.6],[2.26,.87,-.25],m.cream,.012);
    F.box(right,[.005,1.4,3.26],[2.36,1.65,-.25],m.glass,0).castShadow=false;
    const rod=F.cylinder(right,.012,.012,4.03,[2.18,2.52,-.25],m.brass);rod.rotation.x=Math.PI/2;
    curtain(right,m,-1.82);curtain(right,m,1.32);
    const outside=new T.Group();right.add(outside);F.box(outside,[.1,2.3,4],[3.9,1.4,-.25],m.modern,0);
    [-1.6,-.3,1].forEach(z=>{const plant=F.plant(outside,m,3.45,z);plant.scale.setScalar(1.8);plant.position.y=.1;});
    walls.push({name:'right',normal:new T.Vector3(1,0,0),group:right});
    const front=walls.find(w=>w.name==='front').group;
    F.box(front,[.98,2.21,.065],[.75,1.1,2.91],m.darkWood,.02);F.box(front,[.86,2.1,.03],[.75,1.1,2.86],m.wood,.012);
    [.52,1.42].forEach(y=>F.box(front,[.69,.66,.018],[.75,y,2.838],m.darkWood,.012));F.cylinder(front,.027,.027,.065,[.41,1.06,2.81],m.brass).rotation.x=Math.PI/2;
    const ceiling=F.box(root,[4.8,.08,6],[0,2.95,0],m.plaster,0);ceiling.visible=false;
    return {walls,ceiling,floor};
  }
  /** 老照片与相框作为稳定的家庭锚点，三个年代均保留。 */
  function photo(parent,m) {
    const g=new T.Group();g.position.set(-.35,1.97,-2.89);parent.add(g);
    F.box(g,[1.17,.83,.055],[0,0,0],m.darkWood,.018);F.box(g,[1.09,.75,.012],[0,0,.035],m.brass,.006);
    F.box(g,[1.045,.705,.012],[0,0,.045],m.paper,.003);F.box(g,[.95,.57,.006],[0,0,.054],m.photo,.001);return g;
  }
  /** 年代切换替换整组陈设，保留可对照的书桌、收音机和照片。 */
  function furnishings(root,m,year,objects) {
    m.era=year;
    const group=new T.Group();root.add(group);
    objects.desk=F.desk(group,m,year);objects.radio=F.radio(group,m);
    F.bookcase(group,m);F.plant(group,m,.65,-2.5);F.teaTable(group,m,year==='现在');F.box(group,[2.6,.018,2.5],[-.75,.028,.92],m.rug,.008);
    if(year==='1986'){
      F.armchair(group,m,-1.45,.15,.1);F.armchair(group,m,-.2,.1,-.1);
      const backSofa=new T.Group();group.add(backSofa);backSofa.position.set(.7,0,-2.3);backSofa.scale.set(.86,1,.85);F.sofa(backSofa,m,false);
    }else{F.sofa(group,m,year==='现在');if(year==='现在')F.armchair(group,m,.79,.43,-.3);}
    F.electronics(group,m,year);
    F.cylinder(group,.008,.008,.36,[0,2.73,.4],m.brass);F.vessel(group,[[.05,0],[.18,.04],[.23,.16],[.16,.24]],[0,2.31,.4],year==='现在'?m.modern:m.cream);
    if(year==='现在'){F.plant(group,m,1.94,1.71);F.box(group,[.23,.015,.31],[-.68,.51,1.16],m.book,.006,.15);}
    return group;
  }
  /** 家具离场仅释放几何，共用材质由场景卸载时释放。 */
  function disposeFurniture(group) {group.parent.remove(group);group.traverse(object=>{if(object.geometry&&!object.geometry.userData.roomAsset)object.geometry.dispose();});}
  /** 模型唯一入口；年代信息也供页面文案与碰撞检测使用。 */
  function build(assets) {
    const m=window.MemoryRoomMaterials.create(assets),root=new T.Group(),shell=architecture(root,m);
    const objects={photo:photo(shell.walls.find(w=>w.name==='back').group,m)};
    const anchors={desk:new T.Vector3(1.43,1.55,-1.35),radio:new T.Vector3(-1.55,1.4,-1.65),photo:new T.Vector3(-.35,2.45,-2.83)};
    let furniture=null;
    const world={root,...shell,objects,anchors,obstacles:[],environment:m.environment,assets,materials:[...Object.values(m).filter(value=>value.isMaterial),...assets.materials],era:null,
      setEra(year){
        const era=ERAS[year];if(!era)throw new Error('未知年代：'+year);
        if(furniture)disposeFurniture(furniture);furniture=furnishings(root,m,year,objects);
        m.plaster.color.set(era.wall);m.floor.color.set(year==='现在'?0xf0e1c8:year==='2000'?0xd8bfa6:0xbfb1a2);m.green.color.set(era.trim);
        world.obstacles=era.obstacles;world.era=year;root.userData.era=year;
        Object.entries(objects).forEach(([id,object])=>object.traverse(child=>{if(child.isMesh)child.userData.hotspot=id;}));
      }
    };
    world.setEra('1986');return world;
  }
  window.MemoryRoomModel={build,ERAS};
}
