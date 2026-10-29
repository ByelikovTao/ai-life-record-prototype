/** 共同回忆由提供者保存、本人选择纳入；自身记录仍复用原录入流程。 */
'use strict';
{
  const P=window.App,{escape:e,button:b,link:l,badge:t}=P;
  /** 从具体人物开始记录，已有草稿不会被快捷入口覆盖。 */
  function start() {
    P.captureRecord();
    if(P.state.record.text.trim())return P.modal('还有一份未完成的记录',`<p>先完成或保存现有草稿，再创建新的回忆。</p>${l('继续草稿','record','btn full')}`);
    P.state.record={...P.emptyRecord(),kind:'common',subject:P.FamilyContext.current()};P.navigate('record');
  }
  /** 统一共同经历与故事集入口；原稿、纳入状态和两人故事集仍各用原数据与权限。 */
  function list() {
    const s=P.state,items=s.stories.filter(item=>item.commonWith===s.actor&&item.scope!=='private'&&item.viewers.includes(s.actor)||item.author===s.actor&&item.commonWith);
    return `<div class="page"><h1 class="page-title">我们的共同回忆</h1><p class="page-subtitle">一起经历的事，随时记一段；想留成完整故事时，再把已有内容整理成故事集。</p>${s.actor!=='father'?b('记下一段共同回忆','family-common-new','btn full'):''}<h2 class="section">一起经历的事</h2>${items.map(memoryCard).join('')||'<p class="section">还没有共同回忆，可以从最近一起经历的一件小事开始。</p>'}${P.RelationshipChapters.overview()}<details class="section"><summary>我的授权申请</summary>${s.familyRequests.filter(item=>item.actor===s.actor).map(item=>`<p>${e(P.PEOPLE[item.person].name)} · ${{archive:'档案',digital:'交流',space:'场景'}[item.kind]} · ${{pending:'等待开放',accepted:'已同意',declined:'暂未开放'}[item.status]}</p>`).join('')||'<p>暂无申请。</p>'}</details>${l('返回我的','profile','text-link full')}</div>`;
  }
  /** 封面复用原记录的示例影像，确认状态仍由纳入记录判断，不新增分享或确认标记。 */
  function memoryCard(item){
    const included=P.FamilyContext.inArchive(item,item.commonWith),reviewed=item.inclusions?.[item.commonWith]?.reviewed;
    const status=included?'已确认':item.scope==='private'?'仅自己保存':reviewed?'暂未纳入':'待确认';
    const cover=['family','room'].includes(item.image)?`<img class="common-memory-photo" src="assets/${item.image}.png" alt="原记录使用的AI生成家庭场景示例">`:'';
    return `<article class="card section" data-common-memory="${e(item.id)}">${cover}<div class="tags">${t(status,included?'':'warm')}</div><h2>${e(item.title)}</h2><p>${e(P.PEOPLE[item.author].name)}讲述 · 与${e(P.PEOPLE[item.commonWith].name)}共同经历</p><p class="caption">${included?'已纳入对方传记':'尚未纳入对方传记'} · ${item.inclusions?.[item.commonWith]?.ai?'已允许数字人引用':'未用于数字人问答'}</p>${item.author===P.state.actor?l('查看原始回忆','story/'+item.id,'text-link'):b('核对内容与范围','family-consent','btn secondary',`data-id="${item.id}"`)}</article>`;
  }
  /** 记录标题按语义替换完整标题节点，换行排版不影响原有记录去向。 */
  function record(base) {
    const s=P.state,r=s.record,target=r.subject||P.FamilyContext.current();
    const titlePattern=/<h1 class="page-title">[\s\S]*?<\/h1>/;
    // 从传记分类添加时固定当前人物，避免切换记录去向后脱离原分类。
    if(r.archiveAddition)return base.replace(titlePattern,'<h1 class="page-title">补充一段人生经历</h1>').replace(/<select id="record-kind" name="kind">[\s\S]*?<\/select>/,`<select id="record-kind" name="kind"><option value="${r.kind}">${e(P.PEOPLE[target].name)}的人生经历${target===s.actor?'':' · 提交本人核对'}</option></select>`);
    let html=base.replace(titlePattern,`<h1 class="page-title">${r.kind==='common'?'留下我们共同经历的一刻':r.kind==='contribution'?'补充我记得的细节':'记录我自己的生活'}</h1>`);
    const options=r.kind==='own'?'<option value="own">记录我自己的人生</option>':`<option value="common" ${r.kind==='common'?'selected':''}>我们的共同回忆 · ${e(P.PEOPLE[target]?.name||'家人')}</option><option value="contribution" ${r.kind==='contribution'?'selected':''}>补充对方经历，提交本人核对</option>`;
    html=html.replace(/<select id="record-kind" name="kind">[\s\S]*?<\/select>/,`<select id="record-kind" name="kind">${options}</select>`);
    return html.replace('自己的记录由你确认；补充他人的经历，会保留你的讲述者身份。','共同回忆先保存为你的原稿；对方确认后才纳入其传记，数字人引用需另外授权。');
  }
  /** 家人共同回忆先选择分享对象，再保存和发起确认；保存本身无需付费。 */
  function review(base) {
    if(P.state.record.kind!=='common')return base.replaceAll('陈远山',P.PEOPLE[P.state.record.subject||P.FamilyContext.current()]?.name||'对方');
    const r=P.state.record,target=r.subject||P.FamilyContext.current();
    return `<div class="page"><h1 class="page-title">确认这段共同回忆</h1><h2>${e(r.title)}</h2><p>讲述者：${e(P.PEOPLE[P.state.actor].name)} · 共同经历：${e(P.PEOPLE[target].name)}</p><p>${e(r.text)}</p><form data-feature-form data-actor="${P.state.actor}" id="family-common-form"><fieldset><legend>原稿分享范围</legend><label class="check-row"><input type="radio" name="scope" value="private" checked>仅自己，先不提交</label><label class="check-row"><input type="radio" name="scope" value="selected">向下方选择的家人分享，并请对方确认</label>${P.shareViewerOptions([target])}</fieldset><label class="check-row"><input type="checkbox" name="confirmed" required>我已核对自己的讲述与分享范围</label><p class="caption">需勾选共同经历的对方才能提交。其他家人需等对方确认范围后可见；默认不用于数字人回答。</p><button type="submit" class="btn full">保存共同回忆</button></form>${l('回去更正','record','text-link full')}</div>`;
  }
  /** 家人免费参与，代付进入所选人物共享服务，付款不改变授权。 */
  function membership() {return P.BillingViews.membership();}
  /** 共同回忆的确认请求以原记录引用呈现，原稿不会进入待审核副本。 */
  function handleAction(action) {
    if(action==='family-common-new'){start();return true;}
    if(action==='family-common-list'){P.navigate('common-memories');return true;}
    return false;
  }
  /** 保存重新验证邀请关系和分享名单；对方审批前只向提供者提供原稿。 */
  function submit(form) {
    if(form.id!=='family-common-form')return false;
    if(form.featureState!==P.state||form.dataset.actor!==P.state.actor)return true;
    const s=P.state,r=s.record,target=r.subject||P.FamilyContext.current(),data=new FormData(form);
    if(!data.get('confirmed')||!r.text.trim()||!P.FamilyContext.invited(target))return true;
    const scope=String(data.get('scope')),viewers=scope==='selected'?data.getAll('viewers').filter(id=>s.members.includes(id)&&id!==s.actor):[];
    if(scope==='selected'&&!viewers.includes(target)){P.toast('请勾选共同经历的对方，或先仅自己保存。');return true;}
    if(!['private','selected'].includes(scope))return true;
    const now=new Date(),item={id:P.nextId('common'),author:s.actor,subject:s.actor,commonWith:target,inclusions:{},title:r.title,text:[r.text],year:r.eventYear,date:r.eventYear+'年',recorded:now.toLocaleDateString('zh-CN'),scope,viewers,category:'共同回忆',image:'family',source:P.PEOPLE[s.actor].name+'的共同回忆',confirmedBy:s.actor,quote:r.text.slice(0,52)};
    s.stories.push(item);s.record=P.emptyRecord();s.draftSaved=false;P.MaterialLibrary.open(scope==='private'?'drafts':'pending');P.toast(scope==='private'?'原稿已仅自己保存，可稍后调整范围并提交对方。':'已保存原稿并请对方确认；未自动纳入传记或问答。');return true;
  }
  P.FamilyMemories={record,review,membership,handleAction,submit};P.views['common-memories']=list;
}
