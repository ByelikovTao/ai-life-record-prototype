/** 分享页只携带本人确认的一份素材快照，不携带家庭档案、联系方式或其他素材列表。 */
'use strict';
{
  const text=(value,max)=>typeof value==='string'&&value.length<=max;
  const path=value=>text(value,180)&&/^assets\/[a-zA-Z0-9_./-]+$/.test(value)&&!value.includes('..');
  /** 当前演示契约严格拒绝未知字段、越界文案和外站资源。链接持有人可转发该公开片段。 */
  function valid(item) {
    const keys=['v','ref','owner','name','kind','title','caption','poster','src','year'];
    return item&&Object.keys(item).length===keys.length&&Object.keys(item).every(key=>keys.includes(key))&&item.v===1&&/^[a-zA-Z0-9-]{1,80}$/.test(item.ref)&&/^[a-zA-Z0-9-]{1,40}$/.test(item.owner)&&text(item.name,20)&&['photo','video'].includes(item.kind)&&text(item.title,100)&&text(item.caption,180)&&path(item.poster)&&path(item.src)&&text(item.year,30);
  }
  /** UTF-8 编码保证中文可跨设备打开；仅确认之后调用，不包含表单联系资料。 */
  function encode(item) {
    if(!valid(item))throw new Error('分享内容不符合当前格式');
    return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(item)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  }
  /** 损坏或旧格式链接显示空态，不降级读取其他档案。 */
  function decode(value) {
    try {
      if(!value||value.length>6000)return null;
      const bytes=Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
      const item=JSON.parse(new TextDecoder().decode(bytes));return valid(item)?item:null;
    }catch{return null;}
  }
  window.MemoryShareCodec={valid,encode,decode};
}
