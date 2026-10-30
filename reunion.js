/** 故人共忆状态所有者：本人发邀请、朋友确认回执、本人逐条收录，均不改写原档案。 */
'use strict';
{
  const P=window.App;
  /** 邀请和回执仅保存在本次原型内存，重置后不回灌旧内容。 */
  function state() {return P.state.reunion ||= {invitations:[],replies:[],current:''};}
  /** 相册必须归属于当前登录本人，切换账号后不沿用选择。 */
  function current() {return state().invitations.find(row=>row.ref===state().current&&row.owner===P.state.actor);}
  /** 复用分享页已确认的快照创建相册，不再维护第二份素材选择和邀请草稿。 */
  function create(snapshot) {
    const item=P.MemoryShare.selected(),draft=P.MemoryShare.draft();
    if(!item||!draft.confirmed||!MemoryShareCodec.valid(snapshot)||snapshot.owner!==P.state.actor||!snapshot.ref.startsWith('reunion-'))return '';
    const media=P.MemoryImageEffects.presentation(item);if(snapshot.src!==media.src)return '';
    const url=new URL('reunion.html',location.href);url.searchParams.set('s',MemoryShareCodec.encode(snapshot));
    state().invitations.push({...snapshot,url:url.href});state().current=snapshot.ref;return url.href;
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
    if(action==='open'){state().current=el.dataset.id;P.navigate('reunion-album');}
    if(action==='review')review(el.dataset.id,el.dataset.decision);
    if(action==='share')share();
  });
  document.addEventListener('change',async event=>{
    const el=event.target;
    if(el.id!=='reunion-import'||!el.files[0])return;
    const file=el.files[0],session=P.state,actor=session.actor;
    if(file.size>ReunionContract.MAX_REPLY)return P.toast('回执过大，请导入3MB以内的JSON回执。');
    try {
      const raw=await file.text();if(P.state!==session||P.state.actor!==actor)return P.toast('账号已改变，本次导入取消。');
      const result=receive(ReunionContract.parse(raw));P.toast(result.message);if(result.ok)P.render();
    }catch{P.toast('回执读取失败，请重新选择文件。');}
    el.value='';
  });
  P.Reunion={state,current,create,receive,review};
}
