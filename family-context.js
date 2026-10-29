/** 家人访问上下文：人物切换、分项授权与双向分享，所有规则只作用于当前演示内存。 */
'use strict';
{
  const P=window.App,{escape:e,button:b,link:l,icon:i}=P;
  /** 本人端固定原有对象；家人端记住各账号正在了解的人物。 */
  function current() {if(P.state.actor==='father')return 'father';const id=P.state.familyFocus[P.state.actor];return established(id)&&invited(id)?id:selectable()[0]||'';}
  /** 家人内容入口只列已完成拍摄建档且有明确邀请的人物；族谱关系和免费账号不作为建档凭据。 */
  function established(person) {return Boolean(P.state.accounts[person]?.videoDelivered);}
  /** 首页、档案与交流共用拍摄准入名单，分项授权仍由各内容页重新核验。 */
  function selectable() {return (P.state.familyInvitations[P.state.actor]||[]).filter(person=>established(person)&&(authorized(person,'archive')||authorized(person,'digital')));}
  /** 受邀对象独立于亲属关系，未受邀的家人不能因进入图谱获得权限。 */
  function invited(person) {return person===P.state.actor || Boolean(P.state.familyInvitations[P.state.actor]?.includes(person));}
  /** 档案、数字人和回忆场景分别授权，本人读取自己的内容始终允许。 */
  function allowed(person,kind='archive') {return (kind!=='archive'||P.Billing.online(person))&&authorized(person,kind);}
  /** 原授权独立于保管时效，允许有权者在迁出期后续费，但不恢复未付款时的在线读取。 */
  function authorized(person,kind='archive') {return established(person)&&(person===P.state.actor||Boolean(invited(person)&&P.state.familyAccess[person]?.[kind]?.includes(P.state.actor)));}
  /** 提供者保留原稿；家人补充进入他人档案后，分享名单取双方确认范围的交集。 */
  function readable(item) {
    if(!item||!P.Billing.online(item.subject||item.author))return false;
    const actor=P.state.actor;if(item.author===actor)return true;
    if(item.inArchive===false||item.scope==='private'||!item.viewers.includes(actor))return false;
    if(item.commonWith){const consent=item.inclusions?.[item.commonWith];return Boolean(consent?.active&&consent.viewers.includes(actor)&&allowed(item.commonWith));}
    const subject=item.subject||item.author;
    return (!P.state.familyAccess[subject]||allowed(subject))&&(!item.approvedViewers||item.approvedViewers.includes(actor));
  }
  /** 共同回忆按引用纳入对方传记，不复制正文；移出档案不会删除提供者原稿。 */
  function inArchive(item,person) {return item.commonWith===person?Boolean(item.scope!=='private'&&item.viewers.includes(person)&&item.inclusions?.[person]?.active):item.subject===person&&item.inArchive!==false;}
  /** 数字人只能使用已确认、仍获授权且明确允许用于问答的共同资料。 */
  function usable(item,person) {
    return readable(item)&&inArchive(item,person)&&Boolean(item.commonWith?item.inclusions?.[person]?.ai:item.author===person||item.aiAllowed&&item.scope!=='private'&&item.viewers.includes(person));
  }
  /** 回答纠正也遵守问答授权，不能借已确认的修订答复绕过后续撤回。 */
  function answerable(item) {return Boolean(item&&allowed(item.person,'digital')&&(!item.story||usable(item.story,item.person))&&(!item.asset||item.asset.author===item.person||item.asset.aiAllowed&&item.asset.scope!=='private'&&item.asset.viewers.includes(item.person))&&(item.supportingStories||[]).every(story=>usable(story,item.person)));}
  /** 人物切换同时重置话题与场景，保留各账号自己的草稿和收藏。 */
  function select(person) {
    if(!selectable().includes(person))return P.toast('只能选择已完成拍摄建档并向你开放的人生空间。');
    P.captureRecord();P.DigitalHuman.captureDraft();P.DigitalHuman.prepare(false);
    P.state.familyFocus[P.state.actor]=person;P.state.archivePerson=person;P.state.chatTarget=person;
    P.state.chatContext=null;P.state.chatMessages=[];P.state.spaceStoryOpen=false;P.state.lifeTab='overview';
    P.closeModal();P.navigate(['home','life','chat','space'].includes(P.state.route)?P.state.route:'home');
  }
  /** 同一选择器在三个主要内容页和首页复用；自己的记录始终从我的进入。 */
  function picker() {
    if(P.state.actor==='father')return '';
    return `<div class="card family-focus"><p class="caption">正在了解 · ${e(P.relation(current()))}</p>${b(e(P.PEOPLE[current()]?.name||'暂无邀请')+' '+i('down'),'family-select','text-link full')}<small>人生印记、交流与回忆场景随人物切换</small></div>`;
  }
  /** 页面级拒绝不输出场景或人物媒体，不能靠地址栏绕过授权。 */
  function locked(kind,person=current()) {
    if(!established(person))return `<div class="page empty"><h2>这位家人尚未完成拍摄建档</h2><p>仅加入家庭或出现在族谱中，不能开通完整人生空间；可继续保留个人记录和共同回忆。</p>${l('返回首页','home','btn')}</div>`;
    // 档案已开放但交流未开放时，提供仍可访问的档案入口，不借另一人的形象代替。
    if(kind==='digital'&&allowed(person,'archive'))return `<div class="page person-unavailable"><div class="empty">${P.avatar(person,'large')}<h3>${e(P.PEOPLE[person].name)} · ${e(P.relation(person))}</h3><h2>这位家人暂未开放数字人</h2><p>可以继续查看已向你开放的人生档案。</p>${l('查看已开放的档案','life/'+person,'btn full')}${l('返回首页','home','btn outline full section')}${b('申请开放交流','family-request','text-link full section',`data-person="${e(person)}" data-kind="digital"`)}</div></div>`;
    const labels={archive:'人生档案',digital:'数字人交流',space:'回忆场景'};
    return `<div class="page"><div class="empty">${i('lock')}<h2>${e(labels[kind])}暂未开放</h2><p>${e(P.PEOPLE[person]?.name||'这位家人')}尚未向你开放这项内容。会员不会扩大查看权限。</p>${b('申请开放','family-request','btn',`data-person="${e(person)}" data-kind="${kind}"`)}${l('返回首页','home','text-link full')}</div></div>`;
  }
  /** 独立名单配合人物头像核对身份；勾选只修改对应权限，不把付费当作授权。 */
  function permissions() {
    const actor=P.state.actor,access=P.state.familyAccess[actor];
    const requests=P.state.familyRequests.filter(item=>item.person===actor&&item.status==='pending');
    P.PersonArchive.assets(actor,'photo');
    const shared=[...P.state.stories,...P.state.archiveAssets.filter(item=>item.materialManaged)].filter(item=>item.commonWith===actor&&item.scope!=='private'&&item.viewers.includes(actor)||item.subject===actor&&item.author!==actor);
    return `<div class="page"><h1 class="page-title">人生空间的授权</h1><p>查看档案、交流和进入场景分别决定；每份资料还遵循原分享范围。</p>${requests.map(item=>`<div class="card section"><p>${e(P.PEOPLE[item.actor].name)}申请开放${{archive:'档案',digital:'交流',space:'场景'}[item.kind]}</p>${b('仅向这位家人开放','family-request-approve','btn',`data-id="${item.id}"`)}${b('暂不开放','family-request-deny','text-link',`data-id="${item.id}"`)}</div>`).join('')}${access?`<form data-feature-form data-actor="${actor}" id="family-permissions-form" class="section">${Object.entries({archive:'人生档案',digital:'数字人交流',space:'回忆场景'}).map(([kind,label])=>`<fieldset><legend>${label}</legend>${P.state.members.filter(id=>id!==actor&&P.state.familyInvitations[id]?.includes(actor)).map(id=>`<label class="check-row"><input type="checkbox" name="${kind}" value="${id}" ${access[kind].includes(id)?'checked':''}>${P.avatar(id)}<span>${e(P.PEOPLE[id].name)}</span></label>`).join('')}</fieldset>`).join('')}<button type="submit" class="btn full">保存授权名单</button></form>`:'<p class="note section">尚未完成拍摄及空间开通。可以免费参与家人分享的内容，开通自己的完整人生空间需先完成视频服务。</p>'}<h2 class="section">家人提供的经历</h2>${shared.map(item=>`<div class="card section"><h3>${e(item.title)}</h3><p>${e(P.PEOPLE[item.author].name)}讲述 · ${inArchive(item,actor)?'已纳入':'尚未纳入／已移出'}</p>${b('核对纳入与问答范围','family-consent','text-link',`data-id="${item.id}"`)}</div>`).join('')||'<p>暂无家人提交的共同经历。</p>'}${l('我的共同回忆与提交进度','common-memories','text-link full')}</div>`;
  }
  /** 双向确认可缩小范围；数字人使用默认为关闭，需要本人明确勾选。 */
  function consent(id) {
    const item=[...P.state.stories,...(P.state.archiveAssets||[])].find(value=>value.id===id&&(value.commonWith===P.state.actor&&value.scope!=='private'&&value.viewers.includes(P.state.actor)||value.subject===P.state.actor&&value.author!==P.state.actor));if(!item)return;
    const old=item.commonWith?item.inclusions?.[P.state.actor]:{active:item.inArchive!==false,viewers:item.approvedViewers||item.viewers,ai:item.aiAllowed};
    P.modal('核对共同经历',`<h3>${e(item.title)}</h3><p>${e(P.PEOPLE[item.author].name)}讲述：</p><p>${e((item.text||item.body||[item.description||'']).join('\n'))}</p><form data-feature-form data-actor="${P.state.actor}" id="family-consent-form" data-id="${item.id}"><label class="check-row"><input type="checkbox" name="active" ${old?.active?'checked':''}>纳入我的人生档案</label><p class="caption">仅能从提供者允许的名单中选择，后续扩大分享需要重新确认。</p>${item.viewers.map(person=>`<label class="check-row"><input type="checkbox" name="viewers" value="${person}" ${old?.viewers.includes(person)?'checked':''}>${e(P.PEOPLE[person].name)}</label>`).join('')}<label class="check-row"><input type="checkbox" name="ai" ${old?.ai?'checked':''}>允许我的数字人引用这份已确认经历</label><p class="caption">取消纳入会停用其问答引用；提供者仍保留原稿。</p><button type="submit" class="btn full">确认范围</button></form>`);
  }
  /** 授权入口和角色切换共用一份状态，重复申请不会重复累计。 */
  function handleAction(action,el) {
    const s=P.state;
    if(action==='family-person-chat'){if(!established(el.dataset.person)||!allowed(el.dataset.person,'digital')){P.toast('这位家人尚未完成拍摄建档或开放数字人。');return true;}if(el.dataset.person===s.actor){s.chatTarget=s.actor;s.chatContext=null;s.chatMessages=[];}else select(el.dataset.person);P.navigate('chat');return true;}
    if(action==='choose-person'&&s.actor!=='father')action='family-select';
    if(action==='family-select'){P.modal('想了解哪位家人',`${selectable().map(person=>b(`${P.avatar(person)}<span><strong>${e(P.PEOPLE[person].name)} · ${e(P.relation(person))}</strong><small>已完成拍摄建档</small></span><span class="selection-dot" aria-hidden="true"></span>`,'family-focus','family-person-choice section',`data-person="${person}" aria-pressed="${person===current()}"`)).join('')}<p class="caption">仅显示已完成拍摄建档且向你开放的人物。自己的日常记录仍在“我的”中查看。</p>`,'sheet');return true;}
    if(action==='family-focus'){select(el.dataset.person);return true;}
    if(action==='family-consent'){consent(el.dataset.id);return true;}
    if(action==='family-request'){
      const {person,kind}=el.dataset;if(!invited(person)||!['archive','digital','space'].includes(kind))return true;
      if(!s.familyRequests.some(item=>item.person===person&&item.kind===kind&&item.actor===s.actor&&item.status==='pending'))s.familyRequests.push({id:P.nextId('permission'),person,kind,actor:s.actor,status:'pending'});
      P.toast('申请已提交，可在“我们的共同回忆”查看进度；尚未开放。');return true;
    }
    if(action==='family-request-approve'||action==='family-request-deny'){
      const request=s.familyRequests.find(item=>item.id===el.dataset.id&&item.person===s.actor&&item.status==='pending');
      if(request){request.status=action.endsWith('approve')?'accepted':'declined';if(request.status==='accepted')s.familyAccess[s.actor][request.kind]=[...new Set([...s.familyAccess[s.actor][request.kind],request.actor])];P.render();}return true;
    }
    return false;
  }
  /** 每次提交重新检查所有者，并对分享范围取交集，防止旧表单扩大权限。 */
  function submit(form) {
    if(!['family-permissions-form','family-consent-form'].includes(form.id))return false;
    if(form.featureState!==P.state||form.dataset.actor!==P.state.actor)return true;
    const s=P.state,data=new FormData(form);
    if(form.id==='family-permissions-form'){
      const access=s.familyAccess[s.actor];if(access)for(const kind of ['archive','digital','space'])access[kind]=data.getAll(kind).filter(id=>s.familyInvitations[id]?.includes(s.actor));P.render();P.toast('分项授权已保存，私聊不会向家人公开。');return true;
    }
    if(form.id!=='family-consent-form')return false;
    const item=[...s.stories,...(s.archiveAssets||[])].find(value=>value.id===form.dataset.id&&(value.commonWith===s.actor&&value.scope!=='private'&&value.viewers.includes(s.actor)||value.subject===s.actor&&value.author!==s.actor));if(!item)return true;
    const decision={reviewed:true,active:Boolean(data.get('active')),viewers:data.getAll('viewers').filter(id=>item.viewers.includes(id)),ai:Boolean(data.get('ai'))};
    if(item.commonWith){item.inclusions ||= {};item.inclusions[s.actor]=decision;}else {item.inArchive=decision.active;item.approvedViewers=decision.viewers;item.aiAllowed=decision.active&&decision.ai;}
    for(const request of s.accessRequests.filter(value=>value.storyId===item.id&&value.status==='pending-owner'))request.status=decision.active&&decision.viewers.includes(request.actor)?'accepted':'declined';
    P.closeModal();P.render();P.toast('已更新纳入与问答范围，提供者原稿保留。');return true;
  }
  P.FamilyContext={current,established,selectable,invited,allowed,authorized,readable,inArchive,usable,answerable,select,picker,locked,permissions,handleAction,submit};
  P.views['family-permissions']=permissions;
}
