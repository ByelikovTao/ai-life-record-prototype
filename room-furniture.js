/** 家具主体使用完整三维资产，灯具、茶具和年代电器独立摆放，单位为米。 */
'use strict';
{
  const T=window.MemoryThree;
  /** 圆角边缘捕捉高光；大型墙面可指定零圆角减少几何开销。 */
  function box(parent,size,position,material,radius=.018,rotation=0) {
    const geometry=radius?new T.RoundedBoxGeometry(...size,3,Math.min(radius,Math.min(...size)/3)):new T.BoxGeometry(...size);
    const mesh=new T.Mesh(geometry,material);mesh.position.set(...position);mesh.rotation.y=rotation;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  /** 使用圆滑截面制作桌腿、旋钮与灯座。 */
  function cylinder(parent,top,bottom,height,position,material,segments=32) {
    const mesh=new T.Mesh(new T.CylinderGeometry(top,bottom,height,segments),material);mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  /** 旋转体让陶瓷和花盆拥有连续曲面，不再像堆叠积木。 */
  function vessel(parent,profile,position,material) {
    const mesh=new T.Mesh(new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),40),material);mesh.position.set(...position);mesh.castShadow=true;parent.add(mesh);return mesh;
  }
  /** 圆环用于杯柄与金属提手。 */
  function ring(parent,radius,tube,position,material) {
    const mesh=new T.Mesh(new T.TorusGeometry(radius,tube,8,32),material);mesh.position.set(...position);parent.add(mesh);return mesh;
  }
  /** 分组的家具共享坐标，年代变化不会改变故事对象的空间身份。 */
  function groupAt(parent,x,z) {const group=new T.Group();group.position.set(x,0,z);parent.add(group);return group;}
  /** 书桌主体使用带雕刻、包浆和 PBR 贴图的真实模型，保留可交互台灯和信件。 */
  function desk(root,m,year) {
    const g=groupAt(root,1.43,-1.35),modern=year==='现在';
    window.MemoryRoomAssets.place(m.assets,'chinese_console_table',g,[1.48,.83,.77],[0,0,0]);
    box(g,[.4,.009,.28],[-.19,.872,.03],m.paper,.002,.15);
    for(let n=0;n<7;n++)box(g,[.29,.001,.0015],[-.2,.878,.13-n*.03],m.bookTan,0,.15);
    const pen=cylinder(g,.004,.004,.2,[.12,.884,.08],m.dark,12);pen.rotation.z=Math.PI/2;pen.rotation.y=.2;
    cylinder(g,.115,.14,.025,[.47,.88,-.19],m.green);cylinder(g,.009,.015,.36,[.47,1.07,-.19],m.brass);
    const shade=vessel(g,[[.04,0],[.12,.02],[.19,.12],[.19,.13]], [.47,1.2,-.19],m.green);shade.rotation.z=.13;
    cylinder(g,.14,.14,.006,[.47,1.217,-.19],m.light);
    window.MemoryRoomAssets.place(m.assets,modern?'modern_arm_chair_01':'chinese_armchair',g,[.57,.94,.59],[0,0,.92],Math.PI);
    return g;
  }
  /** 经典收音机保留至今，柜体与旁边的电视随年代改变。 */
  function radio(root,m) {
    const g=groupAt(root,-1.55,-1.65);
    window.MemoryRoomAssets.place(m.assets,'vintage_cabinet_01',g,[1.1,.74,.59],[0,0,0]);
    box(g,[.88,.43,.29],[0,.955,0],m.darkWood,.055);box(g,[.55,.33,.018],[-.115,.955,.151],m.radio,.018);
    for(let n=0;n<16;n++)box(g,[.002,.29,.004],[-.367+n*.034,.957,.164],m.bookTan,0);
    box(g,[.19,.052,.012],[.29,1.06,.16],m.paper,.005);box(g,[.003,.04,.004],[.31,1.06,.17],m.red,0);
    [.875,.977].forEach(y=>{cylinder(g,.034,.034,.026,[.29,y,.172],m.brass).rotation.x=Math.PI/2;});
    return g;
  }
  /** 扶手椅替换为完整三维资产，旧年代保留雕花木作，现在采用软包坐垫。 */
  function armchair(root,m,x,z,angle) {
    const g=window.MemoryRoomAssets.place(m.assets,m.era==='现在'?'modern_arm_chair_01':'chinese_armchair',root,[.75,1.03,.73],[x,0,z],angle);
    return g;
  }
  /** 双人沙发使用完整资产的皱褶、绗缝和扶手，年代改变轮廓而非只换颜色。 */
  function sofa(root,m,modern) {
    return window.MemoryRoomAssets.place(m.assets,modern?'modern_sofa':'sofa_02',root,[1.96,modern?.91:1.04,.88],[-1.05,0,.04]);
  }
  /** 茶桌圆润边缘、车木桌腿与曲面茶具呈现真实落地尺度。 */
  function teaTable(root,m,modern) {
    const g=groupAt(root,-.8,1.18);
    window.MemoryRoomAssets.place(m.assets,modern?'round_wooden_table_01':'chinese_tea_table',g,[1.18,.49,.65],[0,0,0]);
    vessel(g,[[.04,0],[.09,.015],[.105,.07],[.075,.12],[.058,.125]],[-.08,.5,0],m.ceramic);
    cylinder(g,.065,.07,.014,[-.08,.634,0],m.ceramic);cylinder(g,.015,.017,.02,[-.08,.651,0],m.darkWood);
    const handle=ring(g,.066,.011,[-.165,.57,0],m.ceramic);handle.rotation.y=Math.PI/2;
    const spout=cylinder(g,.016,.034,.13,[.03,.585,0],m.ceramic);spout.rotation.z=-.9;
    [-.32,.25].forEach(x=>{cylinder(g,.065,.065,.008,[x,.505,.12],m.ceramic);vessel(g,[[.024,0],[.03,.008],[.039,.052],[.035,.057]],[x,.51,.12],m.ceramic);ring(g,.019,.004,[x+.041,.54,.12],m.ceramic);});
  }
  /** 书架用实际磨损纹理和木作模型，书籍仍作为独立生活陈设摆放。 */
  function bookcase(root,m) {
    const g=groupAt(root,1.58,-2.66);
    window.MemoryRoomAssets.place(m.assets,'wooden_bookshelf_worn',g,[.92,1.95,.4],[0,0,0]);
    for(let n=0;n<24;n++){
      const row=Math.floor(n/6),x=-.31+(n%6)*.108,height=.25+n%3*.031,mat=[m.book,m.bookTan,m.bookRed][n%3];
      const book=box(g,[.065,height,.23],[x,.12+row*.47+height/2,.02],mat,.005);if(n%6===5)book.rotation.z=.13;
      box(g,[.048,.012,.003],[x,.23+row*.47,.138],m.paper,.001);
    }
  }
  /** 盆栽采用带真实叶缘和透空材质的三维资产。 */
  function plant(root,m,x,z) {
    return window.MemoryRoomAssets.place(m.assets,'potted_plant_01',root,[.55,.96,.55],[x,0,z]);
  }
  /** 电器的外形和使用场景随年代替换，而非只改变颜色。 */
  function electronics(root,m,year) {
    if(year==='1986'){
      [0,1,2].forEach(n=>box(root,[.3,.035,.21],[1.03,.9+n*.036,-1.54],n===1?m.book:m.paper,.006));return;
    }
    if(year==='2000'){
      const crt=groupAt(root,1.4,-1.53);box(crt,[.46,.38,.37],[0,1.08,0],m.cream,.045);box(crt,[.37,.27,.02],[0,1.09,.192],m.screen,.025);
      box(crt,[.16,.055,.18],[0,.88,.03],m.cream,.015);box(crt,[.49,.026,.17],[0,.88,.37],m.cream,.012);
      for(let n=0;n<30;n++)box(crt,[.029,.007,.025],[-.205+n%10*.045,.9,.32+Math.floor(n/10)*.037],m.white,.003);
      const tv=groupAt(root,-1.73,1.92);box(tv,[.86,.55,.44],[0,.65,0],m.dark,.06);box(tv,[.66,.43,.018],[0,.66,.235],m.screen,.045);
      box(tv,[1,.06,.55],[0,.34,0],m.darkWood,.025);[-.4,.4].forEach(x=>cylinder(tv,.025,.022,.32,[x,.17,0],m.darkWood));tv.rotation.y=Math.PI;return;
    }
    box(root,[.47,.018,.31],[1.32,.88,-1.36],m.dark,.015);
    const lid=box(root,[.47,.3,.015],[1.32,1.026,-1.51],m.dark,.014);lid.rotation.x=-.18;
    const screen=box(root,[.425,.25,.004],[1.32,1.028,-1.496],m.screen,.01);screen.rotation.x=-.18;
    const tv=groupAt(root,-1.65,2.39);box(tv,[1.24,.73,.04],[0,1.12,0],m.dark,.018);box(tv,[1.19,.68,.008],[0,1.12,.026],m.screen,.01);
    [-.4,.4].forEach(x=>{const foot=box(tv,[.018,.22,.025],[x,.7,0],m.dark,.005);foot.rotation.z=x<0?.35:-.35;});tv.rotation.y=Math.PI;
    box(root,[1.45,.25,.37],[-1.65,.39,2.39],m.lightWood,.025);
  }
  window.MemoryRoomParts={box,cylinder,vessel,ring,groupAt,desk,radio,armchair,sofa,teaTable,bookcase,plant,electronics};
}
