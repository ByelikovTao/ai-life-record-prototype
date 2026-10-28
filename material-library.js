/** 资料补充与整理：本地文件与文字草稿、提供者核对、本人审核和统一档案归档。 */
'use strict';
{
  const P=window.App,{escape:e,button:b,link:l,badge:t}=P;
  const MAX_FILE_BYTES=20*1024*1024;
  const KINDS={photo:'照片',clip:'生活视频',document:'书信与文字资料',work:'个人作品'};
  /** 每份草稿只属于当前账号；原始文件内容只留在内存，不上传、不自动保存。 */
  function draft() {
    const s=P.state;
    return s.materialDrafts[s.actor] ||= {id:'',title:'',kind:'photo',subject:s.archivePerson||s.actor,date:'',description:'',body:'',storyId:'',scope:'private',viewers:[],file:null,loading:false,error:''};
  }
  /** 渲染前捕获有效表单，账号切换或重置后的旧元素不能回写新草稿。 */
  function capture() {
    const form=document.getElementById('material-form');
    if(!form || form.featureState!==P.state || form.dataset.actor!==P.state.actor)return;
    const data=new FormData(form),r=draft();
    for(const key of ['title','kind','subject','date','description','body','storyId','scope'])r[key]=String(data.get(key)||'');
    r.viewers=data.getAll('viewers').filter(id=>P.state.members.includes(id)&&id!==P.state.actor);
  }
  /** 已归档资料由档案模块持有，管理页不另外复制一套内容库。 */
  function archiveItems() {P.PersonArchive.assets(P.state.actor,'photo');return P.state.archiveAssets;}
  /** 分享遵循现有成员快照，不把未来加入的家人自动放进资料名单。 */
  function viewers(r) {return r.scope==='family'?[...P.state.members]:r.scope==='selected'?[...r.viewers]:[];}
  /** 归档字段与现有照片、视频、作品和事件资料共用同一契约。 */
  function asset(r,author,id=P.nextId('material')) {
    return {id,subject:r.subject,author,kind:r.kind,title:r.title.trim(),date:r.date.trim()||'时间待补充',year:'',description:r.description.trim(),body:r.body.trim()?[r.body.trim()]:[],scope:r.scope,viewers:viewers(r),relatedStoryId:r.storyId||'',poster:r.kind==='photo'?r.file?.data:'assets/family.png',src:r.file?.data||'',duration:Number(r.duration)||0,sourceLabel:P.PEOPLE[author].name+'提供 · 本地补充资料',materialManaged:true,storageBytes:r.file?.size||new TextEncoder().encode(r.body||'').length,confirmedBy:null};
  }
  /** 任何实际发布都重新校验当前人物、关联事件与文件，草稿允许保留不完整信息。 */
  function validate(r) {
    if(!Object.hasOwn(KINDS,r.kind)||!P.state.members.includes(r.subject))return '请选择有效的资料类型和归档人物。';
    if(P.state.actor!=='father'&&!P.FamilyContext.invited(r.subject))return '请只向邀请你的人物提交资料，已有内容和草稿可在“我提交的资料”查看。';
    if(r.id&&!archiveItems().some(item=>item.id===r.id&&item.author===P.state.actor&&item.subject===r.subject))return '这份资料不能由当前账号更改归属，请返回核对。';
    if(!P.Billing.uploadAllowed(r.subject,r.file?.size||new TextEncoder().encode(r.body||'').length,r.id))return '当前人物已超容量或保管到期，请先整理、导出或续费；原资料不会被删除。';
    if(!r.title.trim())return '请给资料起一个名字。';
    if(r.loading)return '文件正在读入，请稍候再核对。';
    if(['photo','clip'].includes(r.kind)&&!r.file)return '请选择一份本地照片或视频。';
    if(r.kind==='photo'&&!r.file.type.startsWith('image/') || r.kind==='clip'&&!r.file.type.startsWith('video/'))return '文件类型与资料类型不一致，请重新选择。';
    if(['document','work'].includes(r.kind)&&!r.body.trim())return '请填写要保存的文字正文。';
    if(!['private','family','selected'].includes(r.scope))return '请选择分享范围。';
    if(r.scope==='selected'&&!r.viewers.length)return '请选择指定家人，或先设为仅自己。';
    if(r.storyId&&!P.visibleStories().some(item=>item.id===r.storyId&&item.subject===r.subject))return '关联事件已不可用，请重新选择。';
    if(r.kind==='document'&&!r.storyId)return '书信与文字资料需要关联一段人生事件。';
    if(r.subject!==P.state.actor&&!P.state.accounts[r.subject])return '这位家人尚未认领账号，可以先保存草稿，待本人加入后提交核对。';
    return '';
  }
  /** 资料预览使用本地读入内容，视频和照片不自动播放或请求外部服务。 */
  function preview(r) {
    if(r.kind==='photo'&&r.file)return `<img class="feature-media" src="${e(r.file.data)}" alt="${e(r.title||'待整理照片')}">`;
    if(r.kind==='clip'&&r.file)return `<video class="feature-media" controls playsinline preload="metadata" src="${e(r.file.data)}"></video>`;
    return `<p class="feature-prose">${e(r.body||r.description)}</p>`;
  }
  const STAGES={drafts:'草稿',pending:'待核对',archived:'已归档'};
  /** 未提交表单包含文字、文件读取和时间说明，不因只填了部分字段而丢失。 */
  function hasDraft(r){return Boolean(r&&(r.title||r.body||r.file||r.description||r.date||r.loading));}
  /** 共同回忆未提交或未纳入时保留原稿状态，不能误显示为已经归档。 */
  function experienceStage(item) {
    if(item.status==='pending')return 'pending';
    if(item.status==='returned')return 'drafts';
    if(item.commonWith&&!P.FamilyContext.inArchive(item,item.commonWith))return item.scope==='private'||item.inclusions?.[item.commonWith]?.reviewed?'drafts':'pending';
    return 'archived';
  }
  /** 已归档资料只读取档案唯一实例，已完成的提交快照不再重复列出。 */
  function archivedCard(item) {
    return `<article class="card"><h3>${e(item.title)}</h3><p class="caption">${e(P.PEOPLE[item.subject].name)} · ${item.inArchive===false?'原稿保留，已移出档案':'已归档'}</p>${b('查看资料','archive-open','text-link',`data-id="${item.id}" data-person="${item.subject}"`)} ${b('更正资料','material-edit-existing','text-link',`data-id="${item.id}"`)} ${b('撤回分享','material-withdraw','text-link',`data-id="${item.id}"`)}</article>`;
  }
  /** 三组互斥分类，退回任务正在编辑时只展示当前草稿，已归档快照不与资料重复。 */
  function collections() {
    const s=P.state,r=draft(),groups={drafts:[],pending:[],archived:[]};
    if(hasDraft(r))groups.drafts.push(`<article class="card"><h3>${e(r.title||r.file?.name||'未命名资料')}</h3><p class="caption">${r.submissionId?'已退回，正在更正':'资料草稿 · 尚未提交'}</p>${l('继续整理','material-edit')}</article>`);
    const record=s.record,recordDraft=Boolean(record.title||record.text||record.recording||s.draftSaved);
    if(recordDraft)groups.drafts.push(`<article class="card"><h3>${e(record.title||'未命名的记录草稿')}</h3><p class="caption">${record.pendingId?'已退回，正在更正':'记录草稿 · 尚未提交'}</p>${l('继续填写','record')}</article>`);
    for(const item of s.materialSubmissions.filter(item=>item.author===s.actor)){
      if(item.status==='pending')groups.pending.push(submissionCard(item));
      if(item.status==='returned'&&!(hasDraft(r)&&r.submissionId===item.id))groups.drafts.push(submissionCard(item));
    }
    for(const item of s.pending.filter(item=>item.author===s.actor))if(!(recordDraft&&record.pendingId===item.id))groups[experienceStage(item)].push(experienceCard(item,false));
    for(const item of s.stories.filter(item=>item.author===s.actor))groups[experienceStage(item)].push(experienceCard(item,false));
    for(const item of archiveItems().filter(item=>item.author===s.actor&&item.materialManaged))groups[item.inArchive===false?'drafts':'archived'].push(archivedCard(item));
    return groups;
  }
  /** 只展示当前分组；初次进入优先草稿，再看待核对，无待办时展示已归档。 */
  function view() {
    const s=P.state,groups=collections(),stage=s.materialTabs[s.actor]||(groups.drafts.length?'drafts':groups.pending.length?'pending':'archived');
    s.materialTabs[s.actor]=stage;
    const descriptions={drafts:'尚未提交的内容和退回更正的原稿，可以继续完善。',pending:'已提交给本人，确认后会进入对应档案。',archived:'已确认保存的资料与人生经历，沿用原分享范围。'};
    const empty={drafts:'没有未完成的草稿。',pending:'没有等待本人核对的资料。',archived:'还没有已归档的内容。'};
    const tabs=Object.entries(STAGES).map(([key,label])=>b(`<span>${label}</span><small>${groups[key].length}</small>`,'material-stage',key===stage?'active':'',`data-stage="${key}" role="tab" id="material-tab-${key}" aria-controls="material-stage-panel" aria-selected="${key===stage}"`)).join('');
    return `<div class="page feature-page"><h1 class="page-title">我提交的资料</h1><p class="page-subtitle">草稿、核对进度和归档结果，分开查看。</p><div class="material-stage-tabs" role="tablist" aria-label="提交进度">${tabs}</div><section id="material-stage-panel" class="material-stage-panel" role="tabpanel" aria-labelledby="material-tab-${stage}"><p class="caption">${descriptions[stage]}</p><div class="section stack">${groups[stage].join('')||`<div class="empty"><p>${empty[stage]}</p></div>`}</div></section>${l('去人生印记添加资料','life','text-link full section')}<p class="caption section">演示内容只保存在当前页面，刷新或重置会还原。</p></div>`;
  }
  /** 保存或提交后直接显示对应阶段；切换选择只属于当前账号。 */
  function open(stage){if(!Object.hasOwn(STAGES,stage))return;P.state.materialTabs[P.state.actor]=stage;P.navigate('materials');}
  /** 待我核对独立按归档本人过滤，视频照片作品与人生经历复用各自原审核动作。 */
  function inbox() {
    const s=P.state,materials=s.materialSubmissions.filter(item=>item.subject===s.actor&&item.status==='pending');
    const experiences=s.pending.filter(item=>item.subject===s.actor&&item.status==='pending');
    return `<div class="page feature-page"><h1 class="page-title">待我核对</h1><p class="page-subtitle">家人提交给你的资料和人生经历，确认后才进入你的档案。</p><div class="section stack">${materials.map(submissionCard).join('')+experiences.map(item=>experienceCard(item,true)).join('')||'<p class="caption">暂时没有需要你核对的资料。</p>'}</div>${l('返回我的','profile','text-link full')}</div>`;
  }
  /** 引用原记录并区分共同回忆是否已纳入，退回更正仍走原补充流程。 */
  function experienceCard(item,reviewing) {
    const target=item.commonWith||item.subject;
    let status='已归档';
    if(item.status==='pending')status='等待本人核对';
    else if(item.status==='returned')status='已退回更正';
    else if(item.commonWith&&!P.FamilyContext.inArchive(item,target))status=item.scope==='private'?'仅自己保存':item.inclusions?.[target]?.reviewed?'未纳入对方传记':'等待对方确认';
    const actions=reviewing?b('确认并归档','approve-pending','btn secondary',`data-id="${item.id}"`)+b('退回更正','return-pending','text-link',`data-id="${item.id}"`):item.status==='returned'?b('按意见更正','edit-pending','text-link',`data-id="${item.id}"`):!item.status?l('查看人生经历','story/'+item.id,'text-link'):'';
    return `<article class="card"><h3>${e(item.title)}</h3><p class="caption">${item.commonWith?'共同回忆':'人生经历'} · ${e(P.PEOPLE[target].name)} · ${status} · ${item.scope==='private'?'仅自己':item.scope==='selected'?'指定家人':'家庭可见'}</p><p class="feature-prose">${e(item.text.join('\n\n'))}</p>${item.feedback?`<p>${e(item.feedback)}</p>`:''}${actions}</article>`;
  }
  /** 分类入口携带归档对象和类型；已有草稿先提示，放弃时仍保留本次入口上下文。 */
  function begin(el,discard=false) {
    const s=P.state,person=el.dataset.person,kind=el.dataset.kind;
    if(!['photo','clip','work','biography'].includes(kind)||!P.FamilyContext.allowed(person)){P.toast('请从当前获授权人物的资料分类添加。');return;}
    if(kind==='biography'){
      P.captureRecord();if(s.record.text.trim()){P.modal('还有一份未完成的记录',`<p>请先完成或保存现有草稿。</p>${l('继续草稿','record','btn full')}`);return;}
      s.record={...P.emptyRecord(),kind:person===s.actor?'own':'contribution',subject:person,archiveAddition:true};P.navigate('record');return;
    }
    const r=s.materialDrafts[s.actor];
    if(!discard&&hasDraft(r)){P.modal('已有一份未完成的资料',`<p>《${e(r.title||r.file?.name||'未命名资料')}》仍在当前账号草稿中。</p>${l('继续这份草稿','material-edit','btn full')}${b('放弃这份草稿并新建','material-discard-draft','btn secondary full section',`data-person="${person}" data-kind="${kind}"`)}`);return;}
    const form=document.getElementById('material-form');if(form)form.featureState=null;
    s.materialDrafts[s.actor]=null;Object.assign(draft(),{subject:person,kind,fromArchive:true});P.navigate('material-edit');
  }
  /** 待本人审核的材料仅向提供者与归档本人展示，不提前进入家人的资料列表。 */
  function submissionCard(item) {
    const canReview=item.subject===P.state.actor&&item.status==='pending';
    return `<article class="card"><h3>${e(item.title)}</h3><p>${t(item.status==='pending'?'等待本人核对':item.status==='returned'?'已退回更正':'已归档',item.status==='pending'?'warm':'gray')}</p><p class="caption">${e(P.PEOPLE[item.author].name)}提供 → ${e(P.PEOPLE[item.subject].name)}</p>${item.feedback?`<p>${e(item.feedback)}</p>`:''}${canReview?b('核对这份资料','material-inspect','btn secondary compact',`data-id="${item.id}"`):item.status==='returned'&&item.author===P.state.actor?b('按意见更正','material-revise','text-link',`data-id="${item.id}"`):''}</article>`;
  }
  /** 分类添加固定入口人物与类型；编辑原资料仍保留既有归属，时间可暂不确定。 */
  function edit() {
    const s=P.state,r=draft(),stories=P.visibleStories().filter(item=>item.subject===r.subject);
    return `<div class="page feature-page"><h1 class="page-title">${r.id?'更正资料':r.kind==='clip'?'添加视频':r.kind==='photo'?'添加照片':r.kind==='work'?'添加作品':'整理资料'}</h1><form id="material-form" data-feature-form data-actor="${s.actor}"><div class="form-field"><label for="material-field-kind">资料类型</label><select id="material-field-kind" name="kind" ${r.fromArchive?'disabled':''}>${Object.entries(KINDS).map(([id,label])=>`<option value="${id}" ${r.kind===id?'selected':''}>${label}</option>`).join('')}</select>${r.fromArchive?`<input type="hidden" name="kind" value="${r.kind}">`:''}</div><div class="form-field"><label for="material-field-subject">归档到谁的人生</label><select id="material-field-subject" name="subject" ${r.id||r.fromArchive?'disabled':''}>${(s.actor==='father'?s.members:[...new Set([s.actor,...(s.familyInvitations[s.actor]||[])])]).map(id=>`<option value="${id}" ${r.subject===id?'selected':''}>${e(P.PEOPLE[id].name)}</option>`).join('')}</select>${r.id||r.fromArchive?`<input type="hidden" name="subject" value="${r.subject}">`:''}</div><div class="form-field"><label for="material-field-title">资料名称</label><input id="material-field-title" name="title" maxlength="80" value="${e(r.title)}" placeholder="例如：第一次带女儿回老家"></div><div class="form-field"><label for="material-field-date">时间或人生阶段（可以暂不确定）</label><input id="material-field-date" name="date" maxlength="80" value="${e(r.date)}" placeholder="例如：约1990年代、读小学时、待家人核对"></div>${['photo','clip'].includes(r.kind)?`<div class="form-field"><label for="material-file">选择本地${r.kind==='photo'?'照片':'视频'}（单份最多20 MB）</label><input id="material-file" type="file" accept="${r.kind==='photo'?'image/*':'video/*'}"><p class="caption">${e(r.loading?'正在读入文件…':r.file?.name||'文件仅在本次演示中可用。')}</p>${r.error?`<p class="feature-error" role="alert">${e(r.error)}</p>`:''}</div>`:`<div class="form-field"><label for="material-field-body">${r.kind==='work'?'作品正文':'书信或文字正文'}</label><textarea id="material-field-body" name="body" maxlength="10000">${e(r.body)}</textarea></div>`}<div class="form-field"><label for="material-field-description">这份资料背后的故事</label><textarea id="material-field-description" name="description" maxlength="2000" placeholder="谁在画面里？当时发生了什么？">${e(r.description)}</textarea></div><div class="form-field"><label for="material-field-storyId">关联人生事件</label><select id="material-field-storyId" name="storyId"><option value="">暂不关联</option>${stories.map(item=>`<option value="${item.id}" ${r.storyId===item.id?'selected':''}>${e(item.title)}</option>`).join('')}</select><p class="caption">书信资料归入关联事件；选择人物后会更新可关联的事件。</p></div><div class="form-field"><label for="material-field-scope">核对后分享给谁</label><select id="material-field-scope" name="scope">${[['private','仅自己'],['selected','指定家人'],['family','当前家庭成员']].map(([id,label])=>`<option value="${id}" ${r.scope===id?'selected':''}>${label}</option>`).join('')}</select></div>${r.scope==='selected'?P.shareViewerOptions(r.viewers):''}<div class="feature-actions"><button class="btn secondary" type="submit" name="intent" value="draft">保存草稿</button><button class="btn" type="submit" name="intent" value="review">查看整理预览</button></div></form></div>`;
  }
  /** 确认页不把提供者的核对误称为另一个人物的本人认证。 */
  function review() {
    const r=draft(),other=r.subject!==P.state.actor;
    return `<div class="page feature-page"><h1 class="page-title">核对资料与分享</h1><h2>${e(r.title||'未命名资料')}</h2><p class="caption">归档人物：${e(P.PEOPLE[r.subject]?.name||'待选择')} · 提供者：${e(P.PEOPLE[P.state.actor].name)}</p><p>${e(r.date||'时间待补充')}</p><div class="section">${preview(r)}</div><p class="feature-prose section">${e(r.description)}</p><div class="note section">核对后可见：${r.scope==='private'?'仅提供者自己':viewers(r).map(id=>e(P.PEOPLE[id].name)).join('、')}。${other?'资料将交给归档本人核对；审核时本人可查看本次提交，未确认前不进入公开档案。':'由你核对后进入自己的档案。'}分享不会自动扩展到新成员。</div><form id="material-confirm-form" data-feature-form data-actor="${P.state.actor}" class="section"><label class="check-row"><input name="confirmed" type="checkbox" required><span>我已核对资料及分享对象，了解这是本地演示。</span></label><button class="btn full" type="submit">${other?'提交本人核对':'确认并归档'}</button></form>${l('回去更正','material-edit','text-link full')}</div>`;
  }
  /** 归档只变更既有材料的内容，不改变归档人物或拍摄归属。 */
  function store(item) {
    if(!P.Billing.uploadAllowed(item.subject,item.asset.storageBytes||0,item.assetId)){P.toast('归档容量或保管状态已改变，材料保留待核对。');return false;}
    const items=archiveItems(),existing=items.find(value=>value.id===item.assetId);
    const saved={...item.asset,confirmedBy:item.subject,approvedViewers:[...item.asset.viewers],aiAllowed:item.author===item.subject,inArchive:true};
    if(existing){if(existing.author!==item.author||existing.subject!==item.subject)return false;Object.assign(existing,saved,{id:existing.id});}
    else items.push(saved);
    item.status='accepted';return true;
  }
  /** 提供者可以立即撤回原分享；正文更正交由本人重新核对，保留旧已核对版本。 */
  function handleAction(action,el) {
    const s=P.state;
    if(action==='material-stage'){if(Object.hasOwn(STAGES,el.dataset.stage)){s.materialTabs[s.actor]=el.dataset.stage;P.render();}return true;}
    if(action==='material-new'||action==='material-discard-draft'){begin(el,action==='material-discard-draft');return true;}
    if(action==='material-edit-existing'){
      const item=archiveItems().find(value=>value.id===el.dataset.id&&value.author===s.actor&&value.materialManaged);if(!item)return true;
      const current=s.materialDrafts[s.actor];if(current&&(current.title||current.body||current.file)){if(current.id===item.id)P.navigate('material-edit');else P.toast('请先完成或放弃当前资料草稿，再更正另一份资料。');return true;}
      s.materialDrafts[s.actor]={id:item.id,title:item.title,kind:item.kind,subject:item.subject,date:item.date,description:item.description,body:item.body.join('\n\n'),storyId:item.relatedStoryId,scope:item.scope,viewers:[...item.viewers],duration:item.duration,loading:false,error:'',file:item.src?{data:item.src,name:'原已归档文件',type:item.kind==='photo'?'image/*':'video/*'}:null};P.navigate('material-edit');return true;
    }
    if(action==='material-withdraw'){const item=archiveItems().find(value=>value.id===el.dataset.id&&value.author===s.actor);if(item){item.scope='private';item.viewers=[];for(const pending of s.materialSubmissions.filter(value=>value.assetId===item.id&&value.author===s.actor&&value.status==='pending')){pending.asset.scope='private';pending.asset.viewers=[];pending.draft.scope='private';pending.draft.viewers=[];}P.render();P.toast('已撤回分享，待核对的更正也不会恢复旧分享名单。');}return true;}
    if(action==='material-revise'){const item=s.materialSubmissions.find(value=>value.id===el.dataset.id&&value.author===s.actor&&value.status==='returned');if(item){s.materialDrafts[s.actor]={...structuredClone(item.draft),submissionId:item.id};P.navigate('material-edit');}return true;}
    if(action==='material-inspect'){
      const item=s.materialSubmissions.find(value=>value.id===el.dataset.id&&value.subject===s.actor&&value.status==='pending');if(!item)return true;
      P.modal('核对家人提供的资料',`<h3>${e(item.title)}</h3><p>${e(item.draft.date||'时间待补充')} · ${e(P.PEOPLE[item.author].name)}提供</p>${preview(item.draft)}<p>${e(item.draft.description)}</p><p class="caption">确认后分享给：${item.asset.scope==='private'?'仅提供者自己':item.asset.viewers.map(id=>e(P.PEOPLE[id].name)).join('、')}。</p>${b('确认并归档','material-approve','btn full',`data-id="${item.id}"`)}<form id="material-return-form" data-id="${item.id}" class="section"><label>需要更正什么？<textarea name="feedback" maxlength="1000" required></textarea></label><button type="submit" class="btn secondary full">退回更正</button></form>`);const form=document.getElementById('material-return-form');form.featureState=s;form.dataset.actor=s.actor;return true;
    }
    if(action==='material-approve'){const item=s.materialSubmissions.find(value=>value.id===el.dataset.id&&value.subject===s.actor&&value.status==='pending');if(item&&store(item)){P.closeModal();P.render();P.toast('已核对并归档；问答引用仍需本人单独授权。');}return true;}
    return false;
  }
  /** 提交时再次验证身份与内容，失败仍保留可继续修改的原草稿。 */
  function submit(form,event) {
    if(form.id==='material-return-form'){if(form.featureState!==P.state||form.dataset.actor!==P.state.actor)return true;const item=P.state.materialSubmissions.find(value=>value.id===form.dataset.id&&value.subject===P.state.actor&&value.status==='pending'),feedback=String(new FormData(form).get('feedback')||'').trim();if(item&&feedback){item.status='returned';item.feedback=feedback;P.closeModal();P.render();}return true;}
    if(!['material-form','material-confirm-form'].includes(form.id))return false;
    if(form.featureState!==P.state||form.dataset.actor!==P.state.actor)return true;
    capture();const r=draft();
    if(form.id==='material-form'&&event.submitter?.value==='draft'){open('drafts');P.toast('资料草稿已保留在当前账号。');return true;}
    const error=validate(r);if(error){P.toast(error);return true;}
    if(form.id==='material-form'){P.navigate('material-review');return true;}
    if(!new FormData(form).get('confirmed'))return true;
    const item={id:P.nextId('submission'),assetId:r.id,title:r.title,subject:r.subject,author:P.state.actor,status:'pending',draft:structuredClone(r),asset:asset(r,P.state.actor,r.id||P.nextId('material'))};
    if(item.subject===item.author)store(item);
    const returned=P.state.materialSubmissions.find(value=>value.id===r.submissionId&&value.author===P.state.actor&&value.status==='returned');
    if(returned)Object.assign(returned,item,{id:returned.id});else P.state.materialSubmissions.push(item);
    form.featureState=null;P.state.materialDrafts[P.state.actor]=null;open(item.status==='accepted'?'archived':'pending');P.toast(item.status==='accepted'?'资料已进入对应人物档案。':'已提交本人核对，尚未向其他家人开放。');return true;
  }
  /** 文件读取结果绑定原状态、账号和草稿；切换或重置后不写入另一份资料。 */
  function readFile(input) {
    capture();const s=P.state,actor=s.actor,r=draft(),file=input.files?.[0];if(!file)return;
    const token={};r.readToken=token;r.loading=false;
    if(file.size>MAX_FILE_BYTES || !/^(image|video)\//.test(file.type)){r.file=null;r.error='请选择20 MB以内的照片或视频。';P.render();return;}
    const reader=new FileReader();r.loading=true;r.error='';
    reader.onload=()=>{if(P.state!==s||s.materialDrafts[actor]!==r||r.readToken!==token)return;r.loading=false;r.duration=0;r.file={name:file.name,type:file.type,size:file.size,data:String(reader.result)};if(!r.title)r.title=file.name;if(s.actor===actor&&s.route==='material-edit')P.render();};
    reader.onerror=()=>{if(P.state!==s||s.materialDrafts[actor]!==r||r.readToken!==token)return;r.loading=false;r.error='文件未能读入，请重新选择。';if(s.actor===actor)P.render();};reader.readAsDataURL(file);P.render();
  }
  /** 类型、人物和分享切换先保存现有文字，再更新对应的表单字段。 */
  document.addEventListener('change',event=>{
    if(event.target.id==='material-file')return readFile(event.target);
    if(event.target.closest('#material-form')&&['kind','subject','scope'].includes(event.target.name)){capture();P.render();}
  });
  /** 只统计交给当前本人处理的资料，不向其他家人显示私有提交数量。 */
  function pendingCount() {return P.state.materialSubmissions.filter(item=>item.subject===P.state.actor&&item.status==='pending').length;}
  /** 个人中心的核对数量与核对页使用同一组本人资料和经历。 */
  function reviewCount(){return pendingCount()+P.state.pending.filter(item=>item.subject===P.state.actor&&item.status==='pending').length;}
  P.MaterialLibrary={view,edit,review,capture,handleAction,submit,pendingCount,reviewCount,open};
  Object.assign(P.views,{materials:view,'material-inbox':inbox,'material-edit':edit,'material-review':review});
}
