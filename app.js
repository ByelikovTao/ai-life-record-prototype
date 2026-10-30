/** 静态原型入口：路由、预览工具和模拟时钟。双击 index.html 即可运行。 */
'use strict';
{
  const P=window.App;
  const {icon:i,button:b,link:l,avatar:a}=P;
  /** 主导航以归家、往事、叙话、故里和我的家表达日常家文化；路由与权限沿用原机制。 */
  const MAIN_TABS=[['home','home','归家'],['life','book','往事'],['chat','chat','叙话'],['space','map','故里'],['profile','person','我的家']];
  /** 辅助页面归属对应主栏目，详情、会员与问题页也保留明确的底栏选中项。 */
  const TAB_PARENTS={story:'life','archive-item':'life',family:'profile',invitation:'profile',membership:'profile',settings:'profile',saved:'profile',questions:'chat','chat-messages':'chat',record:'profile',review:'profile',welcome:'home'};
  const ROUTE_NAMES={home:'归家',life:'往事',story:'人生故事',chat:'叙话',space:'故里',family:'家庭关系',record:'记录一刻',review:'内容确认',profile:'我的家',membership:'家庭共享服务',invitation:'邀请核对',settings:'分享与阅读',saved:'我的收藏'};
  const NOTES={home:['看见这个家，读懂这一生','首页依次展示姓氏与家族来源、建谱致谢、家训、个人事迹；整理统一从我的家庭进入。'],life:['像一本继续写的书','同一事件关联影像、原声与物件。事件时间、记录时间与分享对象分别说明。'],story:['让回忆能被追问','内容来源和确认状态分开表达，仍然可以围绕当前故事继续交流。'],chat:['听得熟悉，也能核对','示例回答区分记录整理、AI 推演与资料不足。语音仅演示交互，不调用麦克风。'],space:['走进他生活过的地方','点击物件、切换年代、跟随讲述。所有历史场景和变化均为示意。'],family:['关系不等于权限','加入家庭、认领人物、确认关系分别核对。新成员不会自动获得指定的私人资料。'],record:['一句话也值得留下','支持真实文字输入与录制状态演示。先保存草稿，再决定是否分享。'],review:['确认之后，再留下','家人补充他人的经历进入待确认，本人确认后保留原讲述者。'],profile:['身份与权益分开','当前账号、家庭角色、个人额度与数字人服务各自表达。'],membership:['一位人物，全家共享','699元年度服务、免费基础参与；额度、保管与推荐服务金分别说明，模拟操作不扣款。'],invitation:['模拟受邀人视角','在这一步核对人物与关系，完成后切换到该家人的示例账号。'],settings:['分享，由本人决定','分享范围属于个人内容。与另一个人的亲属关系不会自动改变范围。'],saved:['留住想再听一次的话','收藏只展示当前仍然可以访问的故事。']};
  NOTES.welcome=['从一次交付，走进一家人的故事','视频服务客户开通家庭，家人通过邀请参与；不要求受邀家人各自购买视频。'];
  NOTES.space=['走进同一个家的不同年代','“看看老家”环顾熟悉的角落，可切换年代、缩放视角和查看物件故事。仅保留全景观察；场景均为示例素材。'];
  NOTES.chat=['和熟悉的人，慢慢聊','二维人像待机会眨眼点头，回应时身体前倾并出现演示口型，讲完缓缓回正。资料追问与纠正保留；没有三维、麦克风或实时语音驱动。'];
  ROUTE_NAMES.welcome='首次进入';
  ROUTE_NAMES['chat-messages']='消息';ROUTE_NAMES.questions='留给本人的问题';NOTES.questions=['没讲完的话，可以慢慢回答','问题留给档案本人，手动回复后提问者可再次查看；不把真实回复冒充 AI 生成。'];
  ROUTE_NAMES['archive-item']='档案资料';
  NOTES.life=['资料分类与探索视角分开','视频、照片、人生传记、个人作品只保留一套入口；总览仅作预览，记忆地点标明空间是否开放，事件资料沿用原记录。'];
  NOTES['archive-item']=['每份资料都有自己的查看页','视频可播放，照片可翻页，书信在对应事件中阅读与追问。书信同时检查自身和所属事件的授权。'];
  // 三项新功能沿用档案与我的归属，不增加底部主栏目。
  Object.assign(ROUTE_NAMES,{materials:'我提交的资料','material-inbox':'待我核对','material-edit':'整理资料','material-review':'资料核对',corrections:'纠正TA的回答','correction-edit':'提交纠正','correction-review':'本人核对','chapter-edit':'整理故事集',chapter:'共同回忆故事集'});
  Object.assign(TAB_PARENTS,{materials:'profile','material-inbox':'profile','material-edit':'life','material-review':'life',corrections:'chat','correction-edit':'chat','correction-review':'chat','chapter-edit':'profile',chapter:'profile'});
  NOTES.materials=['每份提交都有进度','从具体分类添加，提交与核对在我的处理；分享遵循原有成员范围。'];
  NOTES['material-inbox']=['确认之后，再归档','只显示交给当前档案本人核对的资料与人生经历。'];
  NOTES.corrections=['原回答保留，修订由本人确认','纠正只影响相同人物、资料和问题的私有演示答复，不直接改写原始资料。'];
  NOTES['common-memories']=['一家人共同留下的回忆','共同经历和两人故事集统一入口；整理引用原记录，不改变分享与确认规则。'];
  ['material-edit','material-review'].forEach(route=>{NOTES[route]=NOTES.materials;});
  ['correction-edit','correction-review'].forEach(route=>{NOTES[route]=NOTES.corrections;});
  ['chapter-edit','chapter'].forEach(route=>{NOTES[route]=NOTES['common-memories'];});
  // 纪念书沿用传记与个人中心入口，书稿和订单共享同一份状态。
  Object.assign(ROUTE_NAMES,{books:'我的纪念书','book-edit':'制作纪念书','book-preview':'书稿预览','book-order':'纪念书制作进度'});
  Object.assign(TAB_PARENTS,{books:'profile','book-edit':'life','book-preview':'life','book-order':'profile'});
  for(const route of ['books','book-edit','book-preview','book-order'])NOTES[route]=['把人生留成一本书','选材授权、本人定稿、实物打样与分阶段收费；编辑和印厂进度仅由原型工具模拟，未生成真实 PDF、支付或物流。'];
  Object.assign(ROUTE_NAMES,{'family-permissions':'人生空间的授权','common-memories':'我们的共同回忆'});
  Object.assign(TAB_PARENTS,{'family-permissions':'profile','common-memories':'profile'});
  Object.assign(ROUTE_NAMES,{'billing-plan':'收费方案',rewards:'推荐服务金','service-orders':'服务订单'});
  Object.assign(TAB_PARENTS,{'billing-plan':'profile',rewards:'profile','service-orders':'profile'});
  // 个人中心只保留分组入口，二级页与其返回路径统一归属我的。
  Object.assign(ROUTE_NAMES,{'profile-materials':'资料与核对','profile-family':'我的家庭','profile-keepsakes':'纪念与收藏','profile-services':'服务与订单'});
  for(const route of ['profile-materials','profile-family','profile-keepsakes','profile-services']){TAB_PARENTS[route]='profile';NOTES[route]=['按需展开，清楚好找','从我的分组进入原有功能；账号、资料、授权和服务规则保持原有机制。'];}
  // 首页内容整理集中归属我的家庭，不增加主导航或首页操作。
  Object.assign(ROUTE_NAMES,{'share-memory':'故人共忆','share-preview':'分享前核对','photo-restore':'AI影像体验','share-gifts':'收到的心意'});
  Object.assign(TAB_PARENTS,{'share-memory':'home','share-preview':'home','photo-restore':'life','share-gifts':'profile'});
  Object.assign(ROUTE_NAMES,{'reunion-album':'故人共忆','reunion-albums':'共忆相册'});
  Object.assign(TAB_PARENTS,{'reunion-album':'home','reunion-albums':'home'});
  ROUTE_NAMES['home-manage']='首页内容';TAB_PARENTS['home-manage']='profile';
  NOTES['home-manage']=['集中整理，安心阅读','本人管理来源、建谱致谢与个人事迹，家庭指定本人确认家训；家人保留协助建议入口。'];
  let toastTimer;
  /** 更新当前页面的内存状态预览，不展示未获授权的记录内容。 */
  function updateStatePreview() {
    const s=P.state;
    const value={当前账号:P.PEOPLE[s.actor].name,当前页面:ROUTE_NAMES[s.route],共享服务人物:P.FamilyContext.current(),共享年度:P.Billing.period(P.FamilyContext.current()),可见记录:P.visibleStories().map(x=>({标题:x.title,分享:x.scope})),收藏数量:P.visibleStories().filter(item=>s.saved.includes(item.id)).length,录制:{录制中:s.record.recording,已暂停:s.record.paused,秒:s.record.seconds,草稿字数:s.record.text.length},数字人:{消息数:s.chatMessages.length},家人人数:s.members.length,本人待处理:P.pendingCount(),我的问题:s.questions.filter(item=>item.from===s.actor || item.owner===s.actor).length,邀请:s.actor==='father'?s.invitations.map(x=>({姓名:x.name,状态:x.status})):[]};
    value.纪念书=s.keepsakeBooks.filter(P.KeepsakeBooks.readable).map(book=>({书名:book.title,版本:book.version,书稿:P.KeepsakeBooks.PHASES[book.phase][0],订单:P.KeepsakeBooks.PHASES[book.phase][1],已付演示金额:P.KeepsakeBooks.paidTotal(book)}));
    document.getElementById('state-preview').textContent=JSON.stringify(value,null,2);
    if(s.spaceCamera){value.记忆空间={模式:s.spaceCamera.mode,相机:s.spaceCamera[s.spaceCamera.mode],物件:s.hotspot,故事展开:Boolean(s.spaceStoryOpen)};document.getElementById('state-preview').textContent=JSON.stringify(value,null,2);}
    if(s.digitalHuman){value.数字人.形象={形象:'二维人物动画片段',称呼:P.DigitalHuman.greeting().title,状态:s.digitalHuman.phase,交流:'预置文字演示'};document.getElementById('state-preview').textContent=JSON.stringify(value,null,2);}
  }
  /** 手机画板尺寸变化后，底部面板仍锚定当前画板，避免窄屏或桌面缩放时越界。 */
  function positionModal() {
    const el=document.getElementById('modal');
    const bounds=document.getElementById('phone').getBoundingClientRect();
    el.style.setProperty('--sheet-left',bounds.left+'px');
    el.style.setProperty('--sheet-bottom',Math.max(0,innerHeight-bounds.bottom)+'px');
    el.style.setProperty('--sheet-width',bounds.width+'px');
    el.style.setProperty('--sheet-height',Math.max(240,bounds.height-32)+'px');
  }
  /** 原生 dialog 提供焦点约束；调用者可明确选择设计稿中的底部面板。 */
  function modal(title,body,presentation='dialog') {
    const el=document.getElementById('modal');el.dataset.presentation=presentation;positionModal();
    document.getElementById('modal-content').innerHTML=`<div class="modal-header"><h2>${P.escape(title)}</h2>${b(i('close'),'close-modal','icon-button','aria-label="关闭弹层"')}</div>${body}`;
    el.querySelectorAll('[data-feature-form]').forEach(form=>{form.featureState=P.state;});
    if (!el.open) el.showModal();
    P.state.modal=title;updateStatePreview();
  }
  /** 关闭弹层先保留首页草稿，再停止媒体朗读，避免声音在页面外继续。 */
  function closeModal() {
    P.FamilyHomeEditor.capture();
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
    // 仅在进入空间路由时收起说明，同页重绘仍保留用户的展开选择。
    if(name==='space'&&P.state.route!=='space')P.MemorySpace.enter();
    P.state.route=P.views[name]?name:'home';
    if (name==='story') P.state.storyId=id || 'first-order';
    if(name==='life'){const person=id || P.FamilyContext.current();if(id&&P.state.actor!=='father'&&id!==P.state.actor&&P.FamilyContext.invited(id)){if(P.state.chatTarget!==id){P.state.chatMessages=[];P.state.chatContext=null;}P.state.familyFocus[P.state.actor]=id;P.state.chatTarget=id;}if(P.state.archivePerson!==person){P.state.lifeTab='overview';P.state.videoFilter='all';P.state.biographyMode='read';P.state.archiveChapterId='';}P.state.archivePerson=person;}
    if(name==='archive-item')P.state.archiveItemId=id || '';
    if(name==='chapter')P.state.chapterId=id || '';
    if(['book-edit','book-preview','book-order'].includes(name))P.state.keepsakeBookId=id || '';
  }
  /** 只保存当前状态和当前账号绑定的未提交输入，重置后的旧表单不会回灌。 */
  function captureInputs() {P.captureRecord();P.DigitalHuman?.captureDraft();P.QuestionInbox?.captureDrafts();captureFeatureInputs();}
  /** 首页、资料、纠正、关系章节及纪念书草稿在切页、换账号与字号变化前保存。 */
  function captureFeatureInputs() {P.FamilyHomeEditor.capture();P.MaterialLibrary.capture();P.AnswerFeedback.capture();P.RelationshipChapters.capture();P.KeepsakeBooks.capture();}
  /** 导航离开录制页时保留输入并暂停录制演示；数字人始终使用无声动作。 */
  function navigate(route) {
    if(!P.EntryFlow.authenticated()){P.EntryFlow.render();return;}
    captureInputs();
    if(P.state.actor!=='father'&&route==='record'&&!P.state.record.subject&&!P.state.record.text.trim()){P.state.record.kind='common';P.state.record.subject=P.FamilyContext.current();}
    if(P.state.actor!=='father'&&route==='life')P.state.archivePerson=P.FamilyContext.current();
    if(route==='home')document.getElementById('app-content').scrollTop=0;
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
    const fallback={'home-manage':'profile-family','profile-materials':'profile','profile-family':'profile','profile-keepsakes':'profile','profile-services':'profile','billing-plan':'profile',rewards:'profile','service-orders':'profile',story:'life',space:'life',review:'record',membership:'profile',settings:'profile',record:'home',family:'profile',invitation:'family',saved:'profile'};
    Object.assign(fallback,{materials:'profile','material-inbox':'profile','material-edit':'materials','material-review':'material-edit','chat-messages':'chat',questions:'chat-messages',corrections:'chat-messages','correction-edit':'corrections','correction-review':'corrections','common-memories':'profile-family','chapter-edit':'common-memories',chapter:'common-memories'});
    Object.assign(fallback,{books:'profile','book-edit':'books','book-preview':'books','book-order':'books'});
    const previous=P.state.history?.pop() || fallback[P.state.route] || 'home';
    captureInputs();if(P.state.record.recording && previous!=='record')P.state.record.paused=true;
    closeModal();location.hash=previous;
  }
  /** 五个主入口共用底栏与侧栏定义，家庭由我的进入并归属我的选中状态。 */
  function renderNavigation() {
    const active=TAB_PARENTS[P.state.route] || P.state.route;
    document.getElementById('bottom-nav').innerHTML=MAIN_TABS.map(([route,icon,label])=>`<button type="button" class="${active===route?'active':''}" data-nav="${route}" ${active===route?'aria-current="page"':''}>${i(icon)}<span>${label}</span></button>`).join('');
    const routes=[...MAIN_TABS,['record','mic','记录一刻'],['membership','book','家庭共享服务'],['welcome','mail','首次进入']];
    document.getElementById('studio-nav').innerHTML=routes.map(([route,icon,label])=>l(i(icon)+label,route,P.state.route===route?'active':'')).join('');
  }
  /** 当前人物与账户身份分别显示；空间页也使用公共标题栏，避免遮盖相机内的年代说明。 */
  function renderHeader() {
    const s=P.state;
    const main=MAIN_TABS.some(([route])=>route===s.route);
    // 次级页按设计稿保留居中标题与返回；“我的”仍由固定底栏进入。
    const my=s.actor!=='father'&&['chat','space'].includes(s.route)?b(P.escape(P.PEOPLE[P.FamilyContext.current()]?.name||'切换家人')+' '+i('down'),'family-select','my-button'):'';
    const messages=s.route==='chat'?l(i('mail')+'<span>消息</span>'+(P.chatHasNotice()?'<span class="chat-task-dot" role="img" aria-label="有新回复或待处理消息"></span>':''),'chat-messages','chat-message-trigger'):'';
    // 分类详情只显示本分类，返回沿用档案模块的总览动作，不退出当前人物。
    if(s.route==='life'&&s.lifeTab!=='overview'){
      const title={video:'视频',photo:'照片',biography:'人生印记',work:'个人作品',place:'记忆地点'}[s.lifeTab]||'人生印记';
      document.getElementById('app-header').innerHTML=b(i('back'),'archive-tab','icon-button','data-value="overview" aria-label="返回人生印记总览"')+'<h1>'+title+'</h1>';return;
    }
    document.getElementById('app-header').innerHTML=s.route==='space'?b(i('back'),'back','icon-button','aria-label="返回上一页"')+'<h1>'+ROUTE_NAMES.space+'</h1>'+(s.actor!=='father'?my:''):main?`<h1>${s.route==='home'?P.HOME_NAME:ROUTE_NAMES[s.route]}</h1>${my}${messages}`:`${b(i('back'),'back','icon-button','aria-label="返回上一页"')}<h1>${ROUTE_NAMES[s.route]}</h1>${s.route==='profile'?'':my}`;
  }
  /** 渲染当前页面，保持状态、预览说明与页面一致。 */
  function render() {
    if(!P.EntryFlow.authenticated()){P.EntryFlow.render();return;}
    document.getElementById('phone').classList.remove('entry-mode');
    const s=P.state;
    // 路由标识仅用于还原各页设计稿的封面和标题栏，不参与业务判断。
    document.getElementById('phone').dataset.route=s.route;
    document.getElementById('phone').dataset.actor=s.actor;
    ROUTE_NAMES.questions=P.QuestionInbox.title();
    P.DigitalHuman?.captureDraft();P.QuestionInbox?.captureDrafts();captureFeatureInputs();
    P.PersonArchive?.stopPlayback();
    const content=document.getElementById('app-content');
    const previousTop=content.scrollTop;
    P.MemorySpace?.unmount();
    P.DigitalHuman?.prepare(s.route==='chat');
    document.getElementById('phone').classList.toggle('space-mode',s.route==='space');
    document.getElementById('phone').classList.toggle('large-type',s.fontLarge);
    document.body.classList.toggle('large-text',s.fontLarge);
    document.documentElement.style.setProperty('--unit',s.fontLarge?'2':'1');
    let page=P.views[s.route]();
    if(s.route==='record'&&(s.actor!=='father'||s.record.archiveAddition))page=P.FamilyMemories.record(page);
    if(s.actor!=='father'&&s.route==='review')page=P.FamilyMemories.review(page);
    content.innerHTML=page;
    const referralForm=content.querySelector('#referral-form');if(referralForm){referralForm.billingState=s;referralForm.dataset.actor=s.actor;}
    content.querySelectorAll('[data-feature-form],[data-feature-action]').forEach(element=>{element.featureState=s;});
    // 表单只属于这一份草稿；重置或提交后到达的 hashchange 不能把旧 DOM 写回新草稿。
    content.querySelectorAll('#record-form,#publish-form').forEach(form=>{form.recordDraft=s.record;});
    content.querySelectorAll('#chat-form,#question-form,[data-question-answer]').forEach(form=>{form.draftState=s;form.draftActor=s.actor;});
    content.scrollTop=previousTop;
    renderHeader();renderNavigation();refreshControls();
    const note=NOTES[s.route] || NOTES.home;
    document.getElementById('review-title').textContent=note[0];
    document.getElementById('review-description').textContent=note[1];
    updateStatePreview();P.KeepsakeBooks.demo();
    if(s.route==='space')P.MemorySpace?.mount();
    if(s.route==='chat'&&P.ContentChat.available(s.chatTarget))P.DigitalHuman?.mount();
    // 首页视频复用档案播放器的字幕、进度与错误提示，离页仍由统一逻辑暂停。
    if(['home','archive-item','life'].includes(s.route))P.PersonArchive?.mount();
  }
  /** 预览角色包含已接受邀请的人物，各账号草稿与收藏互相隔离。 */
  function refreshControls() {
    const actorSelect=document.getElementById('actor-select');
    actorSelect.innerHTML=Object.keys(P.state.accounts).map(id=>`<option value="${id}">${id==='father'?'本人':P.relation(id,'father')} · ${P.escape(P.PEOPLE[id].name)}</option>`).join('');
    actorSelect.value=P.state.actor;
    document.getElementById('font-toggle').setAttribute('aria-pressed',String(P.state.fontLarge));
    document.getElementById('font-toggle').textContent=P.state.fontLarge?'标准字号':'大字号';
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
    s.chatMessages=[];s.chatContext=null;s.chatTarget=P.FamilyContext.current();s.archivePerson=P.FamilyContext.current();s.checkout=null;s.shareStoryId=null;closeModal();render();
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
  window.addEventListener('resize',positionModal);
  /** 所有交互集中注册，反复渲染页面不会叠加监听器。 */
  document.addEventListener('click',event=>{
    const nav=event.target.closest('[data-nav]');
    if(nav){event.preventDefault();if(nav.closest('#bottom-nav')&&nav.dataset.nav==='chat'&&P.state.actor!=='father'){if(P.state.chatTarget!==P.FamilyContext.current())P.state.chatMessages=[];P.state.chatTarget=P.FamilyContext.current();P.state.chatContext=null;}return navigate(nav.dataset.nav);}
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
    if(value==='home-empty'){closeModal();P.FamilyHome.empty();navigate('home');}
    if(value==='private'){changeActor('xia');navigate('story/private');}
    if(value==='empty'){P.state.saved=[];navigate('saved');}
    if(value==='quota'){const p=P.Billing.period(P.FamilyContext.current());if(p)p.qaUsed=P.Billing.RULES.qa;navigate('chat');}
    if(value==='failure'){P.state.failNextRecord=true;navigate('record');toast('下一次整理将模拟失败，输入内容会保留。');}
    if(value==='normal'){closeModal();P.state=P.resetDemoState();navigate('home');}
  });
  // 重置业务数据时一并回到应用市场，完整流程可在同一个窗口反复演示。
  document.getElementById('reset-demo').addEventListener('click',()=>{closeModal();P.state=P.resetDemoState();P.state.history=[];P.EntryFlow.reset();location.hash='home';toast('演示已还原，当前没有保存到本地或云端。');});
  document.getElementById('restart-entry').addEventListener('click',()=>P.EntryFlow.reset());
  document.getElementById('modal').addEventListener('cancel',()=>{P.FamilyHomeEditor.capture();P.state.modal=null;if('speechSynthesis' in window)speechSynthesis.cancel();});
  /** 刷新或历史恢复进入首页时回到顶部，保持家庭开篇处可见。 */
  window.addEventListener('pageshow',()=>{if(P.state.route==='home')document.getElementById('app-content').scrollTop=0;});
  window.addEventListener('hashchange',()=>{captureInputs();if(P.state.record.recording && location.hash!=='#record')P.state.record.paused=true;readRoute();document.getElementById('app-content').scrollTop=0;render();});
  if(new URLSearchParams(location.search).get('embedded')==='1')document.body.classList.add('embedded');
  readRoute();render();setInterval(tick,1000);
}

