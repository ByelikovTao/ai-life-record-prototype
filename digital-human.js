/** 数字人形象原型：三维人物、无声口型、表情和文字示例；不接入麦克风或语音服务。 */
'use strict';
{
  const P=window.App,{icon:i,button:b,escape:e,badge:t}=P;
  let demoTimer=null,onPage=false;
  /** 通用示例形象与人物档案分别标注，不能冒充已经完成的本人数字孪生。 */
  function settings() {
    if(!P.state.digitalHuman)P.state.digitalHuman={phase:'loading',status:'正在载入三维示例人物…',modelReady:false,error:'',emotion:'warm',silentDemo:false,animationStarted:0};
    return P.state.digitalHuman;
  }
  /** 未发送输入归属于当前账号与状态，旧页面或重置前的表单不能写入新账号。 */
  function captureDraft() {
    const form=document.getElementById('chat-form');
    if(form?.draftState===P.state && form.draftActor===P.state.actor)P.state.chatDrafts[P.state.actor]=form.elements.message.value;
  }
  /** 仅发送输入框内容时清空草稿，示例讲述不会抹掉用户尚未发送的话。 */
  function clearDraft() {
    P.state.chatDrafts[P.state.actor]='';const input=document.getElementById('chat-input');if(input)input.value='';
  }
  /** 根据当前账号和档案本人的双向关系开场，不用固定“爸爸”称呼所有访问者。 */
  function greeting() {
    const owner=P.state.chatTarget||'father',actor=P.state.actor,person=P.PEOPLE[actor],target=P.PEOPLE[owner];
    const name=person?.short?.length>1?person.short:person?.name||'家人';
    if(owner===actor)return {title:'我的数字分身',speaker:target.name,viewer:'本人',text:`${name}，今天想给家人留下一段什么故事？`};
    const role=P.relation(owner,actor),viewer=P.relation(actor,owner);
    const title=role==='家人'?`${target.name}的数字人`:`${role}的数字人`;
    let text;
    if(viewer==='孙女')text=`${name}，我的小孙女，今天有什么开心的事，想和爷爷分享吗？`;
    else if(viewer==='孙子')text=`${name}，我的小孙子，今天过得怎么样？来和爷爷聊聊吧。`;
    else if(role==='爸爸'||role==='妈妈')text=`${name}，今天过得怎么样？有什么想和${role}说的吗？`;
    else if(role==='爷爷'||role==='奶奶')text=`${name}，最近过得好吗？有什么想和${role}分享的吗？`;
    else text=`${name}，很高兴见到你，今天想聊些什么？`;
    return {title,speaker:role==='家人'?target.name:role,viewer,text};
  }
  /** 动作事件只更新控件，不反复重建三维场景。 */
  function refresh() {
    const s=settings(),status=document.getElementById('avatar-status');if(status)status.textContent=s.status;
    const host=document.getElementById('avatar-stage');if(host)host.dataset.phase=s.phase;
    const loading=document.getElementById('avatar-loading');if(loading){loading.hidden=s.modelReady;loading.textContent=s.error||'正在载入三维示例人物…';}
    const retry=document.getElementById('avatar-retry');if(retry)retry.hidden=!s.error;
    document.querySelectorAll('[data-action="avatar-silent"],[data-action="avatar-sample"]').forEach(button=>{button.disabled=!s.modelReady;});
    const interrupt=document.querySelector('[data-action="avatar-interrupt"]');if(interrupt)interrupt.disabled=!s.silentDemo;
    P.updatePreview?.();
  }
  /** 所有可见状态均说明是无声演示。 */
  function phase(value,status) {const s=settings();s.phase=value;s.status=status;refresh();}
  /** 停止后立即闭口，不触发音频、麦克风权限或后台请求。 */
  function stop() {clearTimeout(demoTimer);const s=settings();s.silentDemo=false;if(s.modelReady)phase('idle','拖动看看，或点击“讲述示例”');}
  /** 回复只驱动数秒口型动画，文字内容仍由原有示例规则生成。 */
  function respond(text) {
    stop();const s=settings();if(!s.modelReady)return;
    s.silentDemo=true;s.animationStarted=performance.now();phase('demo','无声讲述演示 · 口型与表情动画');
    demoTimer=setTimeout(stop,Math.min(10000,Math.max(4000,text.length*95)));
  }
  /** 单页同时展示三维人物、按关系生成的开场气泡和文字输入，不再设置展示模式。 */
  function view() {
    const s=settings(),messages=P.state.chatMessages,hello=greeting();
    return `<section class="page avatar-page"><div class="avatar-body">
      <div class="avatar-page-heading"><div><h1>${e(hello.title)}</h1><p>当前账号：${e(P.PEOPLE[P.state.actor].name)} · ${e(hello.viewer)}</p></div>${b(i('source'),'avatar-about','icon-button soft','aria-label="了解示例数字人"')}</div>
      ${P.ContentChat.contextView()}
      ${P.remainingMinutes()===0?`<div class="notice"><span>当前账号语音服务的演示额度已用完，无声形象与文字示例仍可查看。</span>${P.link('查看会员权益','membership')}</div>`:''}
      <div id="avatar-stage" class="avatar-stage" data-phase="${s.phase}"><div id="avatar-viewport" class="avatar-viewport"></div><p id="avatar-loading" class="avatar-loading" ${s.modelReady?'hidden':''}>${e(s.error||'正在载入三维示例人物…')}</p>
        ${b('重新载入人物','avatar-retry','btn secondary avatar-retry',`id="avatar-retry" ${s.error?'':'hidden'}`)}
        <div class="avatar-stage-badges">${t('授权示例形象','gray')}${t('无声演示','gray')}</div>
        <div class="avatar-stage-tools">${b(i('person'),'avatar-reset','avatar-tool','aria-label="人物回正" title="人物回正"')}${b(s.emotion==='warm'?'微笑':'认真','avatar-emotion','avatar-tool','aria-label="切换示例表情"')}</div>
        <div class="avatar-live-status"><span></span><p id="avatar-status" role="status">${e(s.status)}</p></div>
      </div>
      <div class="avatar-record-source">通用示例形象 · 档案本人：${e(P.PEOPLE[P.state.chatTarget||'father'].name)}</div>
      <div class="avatar-conversation" aria-live="polite"><div class="avatar-greeting"><span>${e(hello.speaker)}</span><p>${e(hello.text)}</p></div>${messages.map(P.chatMessageView).join('')}</div>
      </div><div class="avatar-footer"><div class="avatar-quick-actions">${b(i('play')+' 讲述示例','avatar-sample','btn secondary compact',s.modelReady?'':'disabled')}${b('口型演示','avatar-silent','text-link',s.modelReady?'':'disabled')}${b(i('stop'),'avatar-interrupt','icon-button soft',`aria-label="停止口型演示" ${s.silentDemo?'':'disabled'}`)}</div>
      <form id="chat-form" class="chat-form"><label class="sr-only" for="chat-input">输入示例问题</label><input id="chat-input" name="message" value="${e(P.state.chatDrafts[P.state.actor] || '')}" placeholder="输入问题，看看数字人如何回应…" autocomplete="off" required><button type="submit" aria-label="发送消息">${i('send')}</button></form>
      <p class="avatar-service-note">仅展示三维形象、动作与预置问答。不采集声音，不接入真实 AI。</p></div></section>`;
  }
  /** 每个动作由按钮触发，页面不会自动播放声音或请求硬件权限。 */
  function handleAction(action,element) {
    if(action==='avatar-retry'){P.AvatarModel.unmount();const s=settings();s.error='';s.modelReady=false;phase('loading','正在重新载入三维人物…');P.AvatarModel.mount();return true;}
    if(action==='avatar-reset'){P.AvatarModel.reset();return true;}
    if(action==='avatar-emotion'){const s=settings();s.emotion=s.emotion==='warm'?'listening':'warm';element.textContent=s.emotion==='warm'?'微笑':'认真';return true;}
    if(action==='avatar-sample'){P.sendChatMessage('第一次创业时最担心什么？');return true;}
    if(action==='avatar-silent'){respond('这是一段只展示口型与表情的无声讲述示例。');return true;}
    if(action==='avatar-interrupt'){stop();return true;}
    if(action==='avatar-about'){P.modal('当前数字人形象','<p>当前使用公开授权的三维示例人物，并非陈远山本人。你可以转动查看、切换表情、播放无声口型和体验文字问答。</p><p>本轮不接入麦克风、语音识别或真实 AI。本人形象、本人声音与实时对话服务留待后续正式接入。</p>');return true;}
    return false;
  }
  /** 离开页面释放动画与 GPU 资源；同页消息更新继续复用人物。 */
  function prepare(keep) {if(keep){onPage=true;return;}if(!onPage)return;onPage=false;stop();P.AvatarModel?.unmount();const s=settings();s.modelReady=false;s.error='';s.phase='loading';s.status='正在载入三维示例人物…';}
  P.DigitalHuman={settings,captureDraft,clearDraft,greeting,view,refresh,phase,respond,stop,handleAction,prepare,mount:()=>P.AvatarModel.mount(),modelReady(){const s=settings();s.modelReady=true;s.error='';if(s.phase==='loading')phase('idle','拖动看看，或点击“讲述示例”');else refresh();},modelError(message){const s=settings();s.error=message;s.modelReady=false;phase('unavailable','示例人物暂时无法载入，请重新打开原型。');}};
}
