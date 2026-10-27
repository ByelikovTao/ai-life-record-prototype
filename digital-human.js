/** 家人对话原型：二维人物片段、亲属问候和连续文字交流；无三维、麦克风或实时视频服务。 */
'use strict';
{
  const P=window.App,{icon:i,button:b,escape:e}=P;
  let replyTimer=null,callClock=null,callActor=null,callPerson=null;
  /** 页面状态表达二维模板动作与文字反馈，不声称真人在线或逐字声画同步。 */
  function settings() {
    if(!P.state.digitalHuman)P.state.digitalHuman={phase:'idle',status:'二维人物待机 · 眨眼与轻点头',callState:'active',elapsed:0,greeted:false};
    return P.state.digitalHuman;
  }
  /** 未发送输入归属于当前账号与状态，旧页面或重置前的表单不能串入新账号。 */
  function captureDraft() {
    const form=document.getElementById('chat-form');
    if(form?.draftState===P.state && form.draftActor===P.state.actor)P.state.chatDrafts[P.state.actor]=form.elements.message.value;
  }
  /** 推荐话题不清空输入，只有真正发送输入框内容时才清空个人草稿。 */
  function clearDraft() {P.state.chatDrafts[P.state.actor]='';const input=document.getElementById('chat-input');if(input)input.value='';}
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
  /** 统一文字、演示计时与二维片段状态，不修改已保存的回答。 */
  function refresh() {
    const s=settings(),status=document.getElementById('avatar-status'),feedback=document.querySelector('.avatar-live-status');
    P.PortraitMotion.sync(s.phase,s.callState);
    if(status)status.textContent=P.PortraitMotion.status() || s.status;if(feedback)feedback.dataset.phase=s.phase;
    const clock=document.getElementById('avatar-call-duration');if(clock)clock.textContent=P.duration(s.elapsed);
  }
  /** 停止回应反馈不影响当前模拟画面的计时，暂停画面时仍可用文字交流。 */
  function stopFeedback() {clearTimeout(replyTimer);const s=settings();s.phase='idle';s.status=s.callState==='paused'?'模拟画面已暂停 · 仍可文字交流':'二维人物待机 · 眨眼与轻点头';refresh();}
  /** 离页或切换账号时结束所有本页计时，不在后台累计演示时长。 */
  function stop() {clearInterval(callClock);stopFeedback();}
  /** 演示时长只计算当前账号停留且未暂停的时间，不代表真实通话或会员扣费。 */
  function startClock() {
    clearInterval(callClock);const state=P.state,actor=state.actor;if(settings().callState!=='active')return;
    callClock=setInterval(()=>{if(P.state!==state || state.actor!==actor || state.route!=='chat'){clearInterval(callClock);return;}settings().elapsed++;refresh();},1000);
  }
  /** 回应时播放二维说话片段，长度随文字适度调整；这不是按音素生成的口型。 */
  function respond(text) {
    clearTimeout(replyTimer);const state=P.state,actor=state.actor,s=settings();s.phase='replying';s.status=s.callState==='paused'?'画面已暂停 · 正在回应你…':'说话口型演示 · 正在回应你…';refresh();
    replyTimer=setTimeout(()=>{if(P.state===state && state.actor===actor && state.route==='chat')stopFeedback();},Math.min(12000,Math.max(2600,text.length*55)));
  }
  /** 问候和历史回答共用字幕式气泡区；每条来源、纠正和留问仍由原有消息组件管理。 */
  function conversation(hello,messages) {
    return `<div class="avatar-dialogue"><div class="avatar-conversation" aria-label="与家人的对话记录" aria-live="polite"><div class="avatar-greeting"><span>${e(hello.speaker)}<small>想和你说</small></span><p>${e(hello.text)}</p></div>${messages.map(P.chatMessageView).join('')}</div></div>`;
  }
  /** 会面画面只叠加人物与对话，额度提示放在画面下方，避免遮挡面部。 */
  function view() {
    const s=settings(),messages=P.state.chatMessages,hello=greeting(),context=Boolean(P.state.chatContext),owner=P.PEOPLE[P.state.chatTarget||'father'];
    return `<section class="page avatar-page"><div class="avatar-body">
      <div class="avatar-stage" data-call-state="${s.callState}"><img class="avatar-portrait" src="assets/avatar/father-portrait-v4.png" alt="温暖客厅里的父亲，二维人物动画的静态封面">${P.PortraitMotion.view()}<div class="avatar-image-shade" aria-hidden="true"></div>
      <div class="avatar-page-heading"><div><p class="avatar-eyebrow">视频对话演示 <span id="avatar-call-duration">${P.duration(s.elapsed)}</span></p><h1>${e(hello.viewer==='本人'?'和自己聊聊':'和'+hello.speaker+'坐一会儿')}</h1><p>${e(owner.name)} · ${e(hello.viewer==='本人'?'那些想留给家人的话':'你们的故事，慢慢聊')}</p></div>${b(i('source'),'avatar-about','avatar-about-button','aria-label="了解示例形象与对话"')}</div>
      <span class="avatar-preview-label">二维人物演示</span>${conversation(hello,messages)}</div>
      <div class="avatar-live-status" data-phase="${s.phase}"><span aria-hidden="true"></span><p id="avatar-status" role="status">${e(s.status)}</p></div>
      ${P.BillingViews.chatQuota(P.state.chatTarget)}
      </div><div class="avatar-footer">${P.ContentChat.contextView()}<div class="avatar-quick-actions" aria-label="可以从这些话题开始">${b(i('chat')+' '+(context?'继续聊这段内容':'聊聊过去'),'avatar-sample','avatar-topic')}${b(context?'还有哪些细节':'说说你的建议','avatar-prompt','avatar-topic',`data-question="${context?'还有哪些已经记录的细节？':'给我一些生活建议。'}"`)}</div>
      <form id="chat-form" class="chat-form"><label class="sr-only" for="chat-input">想和家人聊些什么</label><input id="chat-input" name="message" value="${e(P.state.chatDrafts[P.state.actor] || '')}" placeholder="想说什么，慢慢告诉我…" autocomplete="off" required><button type="submit" aria-label="发送消息">${i('send')}</button></form>
      <div class="avatar-call-controls">${b(i(s.callState==='paused'?'play':'pause')+' '+(s.callState==='paused'?'继续画面':'暂停画面'),'avatar-call-pause','avatar-call-action',`aria-pressed="${s.callState==='paused'}"`)}${b(i('close')+' 结束对话','avatar-call-end','avatar-call-action end','aria-label="结束视频对话演示"')}</div><p class="avatar-service-note">AI 画面与交流模拟 · 不采集摄像头或麦克风</p></div></section>`;
  }
  /** 本页接管演示控制和话题，媒体失败重试交给播放器；会话沿用原资料语境。 */
  function handleAction(action,element) {
    if(P.PortraitMotion.handleAction(action))return true;
    if(action==='avatar-call-pause'){const s=settings();s.callState=s.callState==='paused'?'active':'paused';s.status=s.callState==='paused'?'人物画面已暂停 · 仍可文字交流':s.phase==='replying'?'说话口型演示 · 正在回应你…':'二维人物待机 · 眨眼与轻点头';refresh();document.querySelector('.avatar-stage').dataset.callState=s.callState;element.innerHTML=i(s.callState==='paused'?'play':'pause')+' '+(s.callState==='paused'?'继续画面':'暂停画面');element.setAttribute('aria-pressed',String(s.callState==='paused'));startClock();return true;}
    if(action==='avatar-call-end'){settings().callState='ended';stop();P.navigate('home');return true;}
    if(action==='avatar-prompt'){P.sendChatMessage(element.dataset.question);return true;}
    if(action==='avatar-sample'){P.sendChatMessage(P.state.chatContext?'讲讲这段内容。':'第一次创业时最担心什么？');return true;}
    if(action==='avatar-about'){P.modal('关于这个形象','<p>人物来自现有父亲参考图。待机片段包含间隔眨眼和轻点头，回复时上半身前倾并播放二维说话口型，回应结束后缓缓回正；没有三维人物模型。</p><p>当前使用无声的预生成表情动画，不是本人实时视频，也不是与每句话逐字同步的语音口型。文字问答、来源和纠正继续使用原型规则。</p><p>暂停会停住实际人物视频，结束会释放播放器；本页不采集摄像头、麦克风或声音，也没有部署 OpenTalking 实时生成服务。</p>');return true;}
    return false;
  }
  /** 挂载本地片段并在首次进入时演示关系问候，不初始化摄像头或三维渲染器。 */
  function mount() {P.PortraitMotion.mount();startClock();const s=settings();if(!s.greeted){s.greeted=true;respond(greeting().text);}else refresh();}
  /** 换账号或结束后再进入时，在生成页面前开始新演示；离页释放全部计时。 */
  function prepare(keep) {
    if(!keep){P.PortraitMotion.unmount();stop();return;}
    const s=settings();if(callActor!==P.state.actor || callPerson!==P.state.chatTarget || s.callState==='ended'){s.callState='active';s.elapsed=0;s.greeted=false;stopFeedback();}callActor=P.state.actor;callPerson=P.state.chatTarget;
  }
  P.DigitalHuman={settings,captureDraft,clearDraft,greeting,view,refresh,respond,stop,handleAction,prepare,mount};
}
