/** 静态原型入口：路由、预览工具和模拟时钟。双击 index.html 即可运行。 */
'use strict';
{
  const P=window.App;
  const {icon:i,button:b,link:l,avatar:a}=P;
  const MAIN_TABS=[['home','home','首页'],['life','book','档案'],['chat','chat','数字人'],['family','family','家庭']];
  const ROUTE_NAMES={home:'首页',life:'人生档案',story:'人生故事',chat:'数字人',space:'人生记忆空间',family:'家庭关系',record:'记录一刻',review:'内容确认',profile:'我的',membership:'个人会员',invitation:'邀请核对',settings:'分享与阅读',saved:'我的收藏','my-records':'我的记录'};
  const NOTES={home:['从故事开始','三种首页比较故事、家庭互动与时间线的信息层级，保持同一套暖白与墨绿视觉。'],life:['像一本继续写的书','同一事件关联影像、原声与物件。事件时间、记录时间与分享对象分别说明。'],story:['让回忆能被追问','内容来源和确认状态分开表达，仍然可以围绕当前故事继续交流。'],chat:['听得熟悉，也能核对','示例回答区分记录整理、AI 推演与资料不足。语音仅演示交互，不调用麦克风。'],space:['走进他生活过的地方','点击物件、切换年代、跟随讲述。所有历史场景和变化均为示意。'],family:['关系不等于权限','加入家庭、认领人物、确认关系分别核对。新成员不会自动获得指定的私人资料。'],record:['一句话也值得留下','支持真实文字输入与录制状态演示。先保存草稿，再决定是否分享。'],review:['确认之后，再留下','家人补充他人的经历进入待确认，本人确认后保留原讲述者。'],profile:['身份与权益分开','当前账号、家庭角色、个人额度与数字人服务各自表达。'],membership:['按个人账号计费','999／2,999 元均为候选试报价；一次性建档与年度会员分别核算，模拟开通不扣款。'],invitation:['模拟受邀人视角','在这一步核对人物与关系，完成后切换到该家人的示例账号。'],settings:['分享，由本人决定','分享范围属于个人内容。与另一个人的亲属关系不会自动改变范围。'],saved:['留住想再听一次的话','收藏只展示当前仍然可以访问的故事。']};
  NOTES['my-records']=['我留下的故事','这里只显示当前账号自己提供的记录，分享范围由本人决定。'];
  NOTES.welcome=['从一次交付，走进一家人的故事','视频服务客户开通家庭，家人通过邀请参与；不要求受邀家人各自购买视频。'];
  NOTES.space=['走进同一个家的不同年代','全景看房呈现写实复原，房间模型与三维漫游支持空间查看。三个年代有不同家具与电器；均为示例素材。'];
  NOTES.chat=['看得见的三维数字人','授权示例形象具有口型、眨眼和表情。当前只展示形象与动作，不采集声音；文字问答使用预置规则，未接入本人模型、声音或真实 AI。'];
  ROUTE_NAMES.welcome='首次进入';
  ROUTE_NAMES.questions='家人的问题';NOTES.questions=['没讲完的话，可以慢慢回答','问题留给档案本人，手动回复后提问者可再次查看；不把真实回复冒充 AI 生成。'];
  ROUTE_NAMES.life='人物档案';ROUTE_NAMES['archive-item']='档案资料';
  NOTES.life=['资料入口更集中','视频统一入口，内分人生影片、本人拍摄和家人拍摄；传记支持完整阅读和按事件浏览，家书留在事件资料中。'];
  NOTES['archive-item']=['每份资料都有自己的查看页','视频可播放，照片可翻页，书信在对应事件中阅读与追问。书信同时检查自身和所属事件的授权。'];
  let toastTimer;
  /** 更新当前页面的内存状态预览，不展示未获授权的记录内容。 */
  function updateStatePreview() {
    const s=P.state,ac=P.account();
    const value={当前账号:P.PEOPLE[s.actor].name,当前页面:ROUTE_NAMES[s.route],首页方案:s.variant,会员:P.PLANS[ac.plan].name,个人已用分钟:ac.used,个人剩余分钟:P.remainingMinutes(),可见记录:P.visibleStories().map(x=>({标题:x.title,分享:x.scope})),收藏数量:P.visibleStories().filter(item=>s.saved.includes(item.id)).length,录制:{录制中:s.record.recording,已暂停:s.record.paused,秒:s.record.seconds,草稿字数:s.record.text.length},数字人:{消息数:s.chatMessages.length},家人人数:s.members.length,本人待处理:P.pendingCount(),我的问题:s.questions.filter(item=>item.from===s.actor || item.owner===s.actor).length,邀请:s.actor==='father'?s.invitations.map(x=>({姓名:x.name,状态:x.status})):[]};
    document.getElementById('state-preview').textContent=JSON.stringify(value,null,2);
    if(s.spaceCamera){value.记忆空间={模式:s.spaceCamera.mode,相机:s.spaceCamera[s.spaceCamera.mode],物件:s.hotspot,故事展开:Boolean(s.spaceStoryOpen)};document.getElementById('state-preview').textContent=JSON.stringify(value,null,2);}
    if(s.digitalHuman){value.数字人.形象={模型:'授权示例，非本人',称呼:P.DigitalHuman.greeting().title,状态:s.digitalHuman.phase,模型已载入:s.digitalHuman.modelReady,无声口型演示:s.digitalHuman.silentDemo};document.getElementById('state-preview').textContent=JSON.stringify(value,null,2);}
  }
  /** 弹层只使用当前页面的本地动作。原生 dialog 提供焦点约束与 Escape 关闭。 */
  function modal(title,body) {
    const el=document.getElementById('modal');
    document.getElementById('modal-content').innerHTML=`<div class="modal-header"><h2>${P.escape(title)}</h2>${b(i('close'),'close-modal','icon-button','aria-label="关闭弹层"')}</div>${body}`;
    if (!el.open) el.showModal();
    P.state.modal=title;updateStatePreview();
  }
  /** 关闭媒体时也停止系统朗读，避免声音在页面外继续。 */
  function closeModal() {
    document.getElementById('modal').close();P.state.modal=null;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
  /** 短反馈不代替必要的确认页面。 */
  function toast(message) {
    const el=document.getElementById('toast');
    clearTimeout(toastTimer);el.textContent=message;el.classList.add('show');
    toastTimer=setTimeout(()=>el.classList.remove('show'),3500);
    updateStatePreview();
  }
  /** 将哈希路由映射为已知页面；未知内容不会作为 HTML 输出。 */
  function readRoute() {
    const hash=location.hash.slice(1) || 'home';
    const [name,id]=hash.split('/');
    P.state.route=P.views[name]?name:'home';
    if (name==='story') P.state.storyId=id || 'first-order';
    if(name==='life'){const person=id || 'father';if(P.state.archivePerson!==person){P.state.lifeTab='overview';P.state.videoFilter='all';P.state.biographyMode='read';P.state.archiveChapterId='';}P.state.archivePerson=person;}
    if(name==='archive-item')P.state.archiveItemId=id || '';
  }
  /** 只保存当前状态和当前账号绑定的未提交输入，重置后的旧表单不会回灌。 */
  function captureInputs() {P.captureRecord();P.DigitalHuman?.captureDraft();P.QuestionInbox?.captureDrafts();}
  /** 导航离开录制页时保留输入并暂停录制演示；数字人始终使用无声动作。 */
  function navigate(route) {
    captureInputs();
    const current=location.hash.slice(1) || 'home';
    if (P.state.record.recording && route!=='record') P.state.record.paused=true;
    closeModal();
    P.state.history=P.state.history || [];
    if (current!==route) P.state.history.push(current);
    if (location.hash.slice(1)===route) {readRoute();render();}
    else location.hash=route;
  }
  /** 返回当前演示流程中的上一页，不跳出原型。 */
  function back() {
    const fallback={story:'life',space:'life',review:'record',membership:'profile',settings:'profile',record:'home',invitation:'family',saved:'profile'};
    const previous=P.state.history?.pop() || fallback[P.state.route] || 'home';
    captureInputs();if(P.state.record.recording && previous!=='record')P.state.record.paused=true;
    closeModal();location.hash=previous;
  }
  /** 生成四主导航，记忆空间和会员不会挤占独立底部位置。 */
  function renderNavigation() {
    const active=['story','space','archive-item'].includes(P.state.route)?'life':P.state.route;
    document.getElementById('bottom-nav').innerHTML=MAIN_TABS.map(([route,icon,label])=>`<button type="button" class="${active===route?'active':''}" data-nav="${route}" ${active===route?'aria-current="page"':''}>${i(icon)}<span>${label}</span></button>`).join('');
    const routes=[...MAIN_TABS,['space','map','记忆空间'],['record','mic','记录一刻'],['profile','person','我的账号'],['membership','book','个人会员'],['welcome','mail','首次进入']];
    document.getElementById('studio-nav').innerHTML=routes.map(([route,icon,label])=>l(i(icon)+label,route,P.state.route===route?'active':'')).join('');
  }
  /** 当前人物与账户身份分别显示，避免家人浏览时出现“我的人生”误导。 */
  function renderHeader() {
    const s=P.state;
    const main=['home','life','chat','family'].includes(s.route);
    const my=s.route==='invitation'?'':l(`${a(s.actor,'small')}<span>我的</span>`,'profile','my-button');
    document.getElementById('app-header').innerHTML=s.route==='space'?b(i('back'),'back','icon-button','aria-label="返回上一页"'):main?`${s.route==='home'?b('陈家的回忆 '+i('down'),'family-picker','header-family'):`<h1>${ROUTE_NAMES[s.route]}</h1>`}${my}`:`${b(i('back'),'back','icon-button','aria-label="返回上一页"')}<h1>${ROUTE_NAMES[s.route]}</h1>${s.route==='profile'?'':my}`;
  }
  /** 渲染当前页面，保持状态、预览说明与页面一致。 */
  function render() {
    const s=P.state;
    P.DigitalHuman?.captureDraft();P.QuestionInbox?.captureDrafts();
    P.PersonArchive?.stopPlayback();
    const content=document.getElementById('app-content');
    const previousTop=content.scrollTop;
    P.MemorySpace?.unmount();
    P.DigitalHuman?.prepare(s.route==='chat');
    document.getElementById('phone').classList.toggle('space-mode',s.route==='space');
    document.getElementById('phone').classList.toggle('large-type',s.fontLarge);
    document.body.classList.toggle('large-text',s.fontLarge);
    document.documentElement.style.setProperty('--unit',s.fontLarge?'2':'1');
    content.innerHTML=P.views[s.route]();
    // 表单只属于这一份草稿；重置或提交后到达的 hashchange 不能把旧 DOM 写回新草稿。
    content.querySelectorAll('#record-form,#publish-form').forEach(form=>{form.recordDraft=s.record;});
    content.querySelectorAll('#chat-form,#question-form,[data-question-answer]').forEach(form=>{form.draftState=s;form.draftActor=s.actor;});
    content.scrollTop=previousTop;
    renderHeader();renderNavigation();refreshControls();
    const note=NOTES[s.route] || NOTES.home;
    document.getElementById('review-title').textContent=note[0];
    document.getElementById('review-description').textContent=note[1];
    updateStatePreview();
    if(s.route==='space')P.MemorySpace?.mount();
    if(s.route==='chat')P.DigitalHuman?.mount();
    if(s.route==='archive-item' || s.route==='life')P.PersonArchive?.mount();
  }
  /** 预览角色包含已接受邀请的人物，各账号草稿与收藏互相隔离。 */
  function refreshControls() {
    const actorSelect=document.getElementById('actor-select');
    actorSelect.innerHTML=Object.keys(P.state.accounts).map(id=>`<option value="${id}">${id==='father'?'本人':P.relation(id,'father')} · ${P.escape(P.PEOPLE[id].name)}</option>`).join('');
    actorSelect.value=P.state.actor;
    document.getElementById('font-toggle').setAttribute('aria-pressed',String(P.state.fontLarge));
    document.getElementById('font-toggle').textContent=P.state.fontLarge?'标准字号':'大字号';
    const labels={A:'A · 故事优先',B:'B · 家人优先',C:'C · 人生时间线'};
    document.getElementById('variant-label').textContent=labels[P.state.variant] || labels.A;
    document.querySelector('.variant-switcher').hidden=P.state.route!=='home';
  }
  /** 切换模拟账号时不把上一个人的私聊、草稿或收藏带给新角色。 */
  function changeActor(id) {
    const s=P.state;
    if (!s.accounts[id]) return;
    captureInputs();
    P.PersonArchive?.stopPlayback();
    P.DigitalHuman?.stop();
    s.accountDrafts=s.accountDrafts || {};s.savedByActor=s.savedByActor || {};
    s.accountDrafts[s.actor]={record:structuredClone(s.record),saved:Boolean(s.draftSaved)};
    s.savedByActor[s.actor]=[...s.saved];
    s.actor=id;s.record=structuredClone(s.accountDrafts[id]?.record || P.emptyRecord());
    s.record.recording=false;s.record.paused=false;s.draftSaved=s.accountDrafts[id]?.saved || false;s.saved=[...(s.savedByActor[id] || [])];
    s.chatMessages=[];s.chatContext=null;s.chatTarget='father';s.checkout=null;s.shareStoryId=null;closeModal();render();
  }
  /** 首页变体通过查询参数保留，其他页面仍使用统一的产品设计。 */
  function setVariant(direction) {
    const variants=['A','B','C'],index=variants.indexOf(P.state.variant);
    P.state.variant=variants[(index+direction+variants.length)%variants.length];
    const url=new URL(location.href);url.searchParams.set('variant',P.state.variant);history.replaceState(null,'',url);
    if (P.state.route!=='home') navigate('home');else render();
  }
  /** 字号开关只改变阅读尺寸，不清除正在编辑的文字。 */
  function toggleFont() {captureInputs();P.state.fontLarge=!P.state.fontLarge;render();}
  /** 时钟只更新录制演示；视频进度由原生播放器负责，不保留封面计时器。 */
  function tick() {
    const r=P.state.record;
    if(r.recording && !r.paused) {r.seconds++;const label=document.getElementById('record-time');if(label)label.textContent=P.duration(r.seconds);}
    if (r.recording) updateStatePreview();
  }
  Object.assign(P,{modal,closeModal,toast,navigate,render,changeActor,toggleFont,updatePreview:updateStatePreview});
  /** 所有交互集中注册，反复渲染页面不会叠加监听器。 */
  document.addEventListener('click',event=>{
    const nav=event.target.closest('[data-nav]');
    if(nav){event.preventDefault();return navigate(nav.dataset.nav);}
    const action=event.target.closest('[data-action]');
    if(!action || action.disabled)return;
    if(action.dataset.action==='back')return back();
    P.act(action.dataset.action,action);
  });
  document.addEventListener('submit',P.submit);
  document.addEventListener('change',event=>{if(event.target.id==='invite-person')P.act('invite-person-change',event.target);});
  document.addEventListener('change',event=>{if(event.target.id==='archive-person-select')P.act('archive-person',event.target);});
  document.getElementById('actor-select').addEventListener('change',event=>changeActor(event.target.value));
  document.getElementById('width-select').addEventListener('change',event=>document.documentElement.style.setProperty('--phone-width',event.target.value+'px'));
  document.getElementById('font-toggle').addEventListener('click',toggleFont);
  document.getElementById('scenario-select').addEventListener('change',event=>{
    const value=event.target.value;
    if(value==='private'){changeActor('xia');navigate('story/private');}
    if(value==='empty'){P.state.saved=[];navigate('saved');}
    if(value==='quota'){const ac=P.account();if(ac.plan==='basic')ac.trialRemaining=0;else ac.used=P.PLANS[ac.plan].minutes;navigate('chat');}
    if(value==='failure'){P.state.failNextRecord=true;navigate('record');toast('下一次整理将模拟失败，输入内容会保留。');}
    if(value==='normal'){closeModal();P.state=P.resetDemoState();navigate('home');}
  });
  document.getElementById('variant-prev').addEventListener('click',()=>setVariant(-1));
  document.getElementById('variant-next').addEventListener('click',()=>setVariant(1));
  document.getElementById('reset-demo').addEventListener('click',()=>{closeModal();P.state=P.resetDemoState();P.state.history=[];if(location.hash==='#home'){readRoute();render();}else location.hash='home';toast('演示已还原，当前没有保存到本地或云端。');});
  document.getElementById('modal').addEventListener('cancel',()=>{P.state.modal=null;if('speechSynthesis' in window)speechSynthesis.cancel();});
  window.addEventListener('hashchange',()=>{captureInputs();if(P.state.record.recording && location.hash!=='#record')P.state.record.paused=true;readRoute();document.getElementById('app-content').scrollTop=0;render();});
  window.addEventListener('keydown',event=>{if(P.state.route!=='home' || document.getElementById('modal').open || event.target.matches('input,textarea,select,[contenteditable="true"]'))return;if(event.key==='ArrowLeft')setVariant(-1);if(event.key==='ArrowRight')setVariant(1);});
  if(new URLSearchParams(location.search).get('embedded')==='1')document.body.classList.add('embedded');
  if(!['A','B','C'].includes(P.state.variant))P.state.variant='A';
  readRoute();render();setInterval(tick,1000);
}

