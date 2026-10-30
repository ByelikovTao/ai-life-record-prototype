/** 故人分享演示唯一状态所有者；真实预约、跨设备撤回和AI修复需服务端接入。 */
'use strict';
{
  const P=window.App;
  /** 草稿绑定登录账号，切换账号不会继承他人的待发布内容。 */
  function state() {return P.state.memoryShare ||= {drafts:{},published:[],gifts:[],effect:null};}
  function draft() {return state().drafts[P.state.actor] ||= {assetId:'',caption:'',confirmed:false,url:'',variant:'original'};}
  /** 分享仅由资料归属本人确认，资料自身和人物档案须同时可读。 */
  function candidates() {return [...P.PersonArchive.assets(P.state.actor,'photo'),...P.PersonArchive.videos(P.state.actor)].filter(item=>item.subject===P.state.actor&&['photo','film','clip'].includes(item.kind)&&/^assets\//.test(item.poster));}
  function selected() {return candidates().find(item=>item.id===draft().assetId);}
  /** 预览与访客快照共用同一效果目录，原档案照片不被改写。 */
  function poster(item) {return item.kind==='photo'?P.MemoryImageEffects.presentation(item).src:item.poster;}
  /** 确认后只生成一份共忆链接；朋友可只观看或自愿补充，不再另走邀请流程。 */
  function publish() {
    const value=draft(),item=selected();
    if(!item||!value.confirmed)return P.toast('请核对选中的内容，并确认愿意分享给朋友。');
    const media=P.MemoryImageEffects.presentation(item);
    const snapshot={v:1,ref:ReunionContract.nextId('reunion'),owner:P.state.actor,name:P.PEOPLE[P.state.actor].name,kind:item.kind==='photo'?'photo':'video',title:media.title,caption:value.caption,poster:item.kind==='photo'?media.src:item.poster,src:media.src,year:media.year};
    const url=P.Reunion.create(snapshot);if(!url)return;
    value.url=url;state().published.push({actor:P.state.actor,ref:snapshot.ref,url:value.url,title:item.title});P.render();
  }
  /** 原生分享由本人触发；不支持时提供可复制链接，不自动向任何联系人发送。 */
  async function deliver() {
    const value=draft();if(!value.url||!selected())return P.toast('内容已变化，请重新核对生成链接。');
    try {
      if(navigator.share&&location.protocol==='https:')await navigator.share({title:'故人共忆',text:value.caption,url:value.url});
      else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value.url);P.toast('链接已复制，可以自己选择发给哪位朋友。');}
      else P.toast('请选中下方链接复制，再发给朋友。');
    }catch(error){if(error.name!=='AbortError')P.toast('未能完成分享，链接仍在下方，可以复制。');}
  }
  /** 只有演示的已确认预约在完成拍摄后产生双向服务礼，不记现金与积分。 */
  function advanceGift() {
    const rows=state().gifts,actor=P.state.actor;
    let row=rows.find(item=>item.actor===actor);
    if(!row){rows.push({actor,phase:'预约沟通',ref:state().published.find(item=>item.actor===actor)?.ref||'演示来源',mine:false,friend:false});}
    else if(row.phase==='预约沟通')row.phase='拍摄已完成';
    else {row.mine=true;row.friend=true;row.phase='心意已送达';}
    P.render();
  }
  /** 所有新动作独立命名，避免和原档案、订单及全局表单动作混用。 */
  document.addEventListener('click',event=>{
    const el=event.target.closest('[data-memory]');if(!el)return;
    event.preventDefault();const action=el.dataset.memory;
    if(action==='open'){if(el.dataset.id)draft().assetId=el.dataset.id;draft().variant='original';draft().url='';draft().confirmed=false;P.navigate('share-memory');}
    if(action==='preview'){if(!selected())return P.toast('先选一张照片或一段影片。');P.navigate('share-preview');}
    if(action==='publish')publish();
    if(action==='deliver')deliver();
    if(action==='restore')P.MemoryImageEffects.open('restore',el.dataset.id);
    if(action==='effect-open')P.MemoryImageEffects.open(el.dataset.kind);
    if(action==='effect-result')P.MemoryImageEffects.result();
    if(action==='effect-use')P.MemoryImageEffects.use();
    if(action==='effect-original'){draft().variant='original';draft().confirmed=false;draft().url='';P.render();}
    if(action==='gift-demo')advanceGift();
    if(action==='owner-demo'){P.changeActor('father');P.navigate('share-memory');}
  });
  /** 输入即时保留，字号切换不丢文案；修改素材后旧链接不再作为当前结果。 */
  document.addEventListener('input',event=>{
    const el=event.target;
    if(!el.closest('#memory-compose'))return;
    const value=draft();
    if(el.name==='asset'){value.assetId=el.value;value.variant='original';value.confirmed=false;value.url='';}
    if(el.name==='caption'){value.caption=el.value.slice(0,180);value.confirmed=false;value.url='';}
  });
  document.addEventListener('change',event=>{if(event.target.id==='memory-confirm')draft().confirmed=event.target.checked;});
  P.MemoryShare={state,draft,candidates,selected,poster};
}
