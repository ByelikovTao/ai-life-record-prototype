/** 故人共忆状态所有者：本人发邀请、朋友确认回执、本人逐条收录，均不改写原档案。 */
'use strict';
{
  const P=window.App;
  /** 邀请和回执仅保存在本次原型内存，重置后不回灌旧内容。 */
  function state() {return P.state.reunion ||= {drafts:{},invitations:[],replies:[],current:''};}
  /** 草稿按账号隔离，字号切换和同页导航保留当前输入。 */
  function draft() {return state().drafts[P.state.actor] ||= {assetId:'',question:'还记得那时候的我们吗？想听听你记得的那一面。',confirmed:false};}
  /** 使用原资料库的本人可分享素材，不复制第二份授权判断。 */
  function candidates() {return P.MemoryShare.candidates();}
  /** 相册必须归属于当前登录本人，切换账号后不沿用选择。 */
  function current() {return state().invitations.find(row=>row.ref===state().current&&row.owner===P.state.actor);}
  /** 只有资料本人可以发布；发出的内容仅是所选素材和一段问候。 */
  function create() {
    const value=draft(),item=candidates().find(row=>row.id===value.assetId);
    if(!item||!value.question.trim()||!value.confirmed)return P.toast('请选择素材，写一句邀请，并确认愿意发给老朋友。');
    const snapshot={v:1,ref:ReunionContract.nextId('reunion'),owner:P.state.actor,name:P.PEOPLE[P.state.actor].name,kind:item.kind==='photo'?'photo':'video',title:item.title,caption:value.question.trim(),poster:item.poster,src:item.src||item.poster,year:item.year};
    const url=new URL('reunion.html',location.href);url.searchParams.set('s',MemoryShareCodec.encode(snapshot));
    state().invitations.push({...snapshot,url:url.href});state().current=snapshot.ref;value.confirmed=false;P.navigate('reunion-album');
  }
  /** 回执需与当前本人的邀请匹配；重复导入不重复新增，朋友补充不会自动公开。 */
  function receive(value) {
    if(!ReunionContract.valid(value))return {ok:false,message:'回忆回执格式不正确，或尚未由朋友确认。'};
    const invitation=state().invitations.find(row=>row.ref===value.invite&&row.owner===P.state.actor&&row.owner===value.owner);
    if(!invitation)return {ok:false,message:'这份回执不属于当前账号的邀请，请切回发出邀请的本人。'};
    if(state().replies.some(row=>row.id===value.id))return {ok:false,message:'这份回忆已经收到，不会重复添加。'};
    state().replies.push({...value,status:'pending'});return {ok:true,message:'收到一段故人的回忆，等待你决定是否收录。'};
  }
  /** 收录权属于邀请本人；拒绝或尚待核对的内容都不进入共忆相册。 */
  function review(id,decision) {
    const invitation=current(),row=state().replies.find(item=>item.id===id&&item.invite===invitation?.ref&&item.owner===P.state.actor);
    if(!row||row.status!=='pending'||!['accepted','declined'].includes(decision))return;
    row.status=decision;P.render();
  }
  /** 原型通过同源标签页同步，不接收陌生邀请；跨设备可由本人手动导入确认回执。 */
  const channel='BroadcastChannel'in window?new BroadcastChannel('chuanjia-reunion-v1'):null;
  if(channel)channel.onmessage=event=>{
    if(event.data?.type!=='reunion-reply')return;
    const result=receive(event.data.reply);
    if(result.ok){if(['reunion-album','reunion-albums'].includes(P.state.route))P.render();P.toast(result.message);}
  };
  /** 分享动作由本人主动触发，不能自动向通讯录或社交软件发出消息。 */
  async function share() {
    const value=current();if(!value)return;
    try {
      if(navigator.share&&location.protocol==='https:')await navigator.share({title:'故人共忆',text:value.caption,url:value.url});
      else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value.url);P.toast('邀请链接已复制，可以自己选择发给哪位朋友。');}
      else P.toast('请复制页面上的邀请链接，发给朋友。');
    }catch(error){if(error.name!=='AbortError')P.toast('未能分享，邀请链接仍在页面中，可以复制。');}
  }
  document.addEventListener('click',event=>{
    const el=event.target.closest('[data-reunion]');if(!el)return;
    event.preventDefault();const action=el.dataset.reunion;
    if(action==='new'){if(el.dataset.asset)draft().assetId=el.dataset.asset;draft().confirmed=false;P.navigate('reunion-new');}
    if(action==='create')create();
    if(action==='open'){state().current=el.dataset.id;P.navigate('reunion-album');}
    if(action==='review')review(el.dataset.id,el.dataset.decision);
    if(action==='share')share();
    if(action==='owner-demo'){P.changeActor('father');P.navigate('reunion-new');}
  });
  document.addEventListener('input',event=>{
    const el=event.target;if(!el.closest('#reunion-compose')||!['asset','question'].includes(el.name))return;
    const value=draft();if(el.name==='asset')value.assetId=el.value;if(el.name==='question')value.question=el.value.slice(0,180);value.confirmed=false;document.getElementById('reunion-confirm').checked=false;
  });
  document.addEventListener('change',async event=>{
    const el=event.target;if(el.id==='reunion-confirm'){draft().confirmed=el.checked;return;}
    if(el.id!=='reunion-import'||!el.files[0])return;
    const file=el.files[0],session=P.state,actor=session.actor;
    if(file.size>ReunionContract.MAX_REPLY)return P.toast('回执过大，请导入3MB以内的JSON回执。');
    try {
      const raw=await file.text();if(P.state!==session||P.state.actor!==actor)return P.toast('账号已改变，本次导入取消。');
      const result=receive(ReunionContract.parse(raw));P.toast(result.message);if(result.ok)P.render();
    }catch{P.toast('回执读取失败，请重新选择文件。');}
    el.value='';
  });
  P.Reunion={state,draft,candidates,current,create,receive,review};
}
