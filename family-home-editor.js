/** 首页编辑与确认：本人草稿、家庭家训建议和正式内容分别维护，提交时重验身份与版本。 */
'use strict';
{
  const P=window.App,{escape:e,button:b,link:l}=P,F=P.FamilyHome;
  const EDIT_ROUTES={preface:'home-preface-edit',motto:'home-motto-edit'};
  const LABELS={origin:'家族来源',preface:'建谱致谢',motto:'家庭家训',featured:'首页个人事迹',suggestion:'家训整理建议'};
  const ORIGIN_TRACE_FIELDS=[
    {name:'earliest',label:'最早可追溯记录',placeholder:'例如先辈姓名、年代与已知事迹'},
    {name:'ancestralHome',label:'祖籍与支系',placeholder:'填写家中资料记载的祖籍或支系'},
    {name:'migration',label:'迁徙线索',placeholder:'例如迁出地、迁入地或大致年代'}
  ];
  /** 家庭指定本人负责家训，其他成员只能提交建议，不能直接发布。 */
  function allowed(kind,person) {return kind==='suggestion'?F.member():Object.hasOwn(LABELS,kind)&&F.editable(kind,person);}
  /** 草稿按账号、人物及段落隔离；多人查看共用家训但不共用未提交文字。 */
  function key(kind,person) {return [P.state.actor,person,kind].join(':');}
  /** 精选单独记录修订号，旧表单无法覆盖已经确认的新版本。 */
  function revision(kind,person) {return kind==='featured'?(F.profile(person).featuredRevision||0):(F.document(kind,person)?.revision||0);}
  /** 日期遵循本任务的上海时区，不受浏览器或执行主机时区影响。 */
  function today() {return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
  /** 首次打开从当前正式内容起草，尚无内容时保留空白。 */
  function draft(kind,person) {
    const home=F.ensure(),id=key(kind,person);if(home.drafts[id])return home.drafts[id];
    const doc=kind==='featured'||kind==='suggestion'?null:F.document(kind,person);
    return home.drafts[id]={text:doc?.text||'',source:doc?.source||'',kind:doc?.kind||'new',date:doc?.date||today(),surname:F.profile(person).surname,ids:[...F.profile(person).featured],revision:revision(kind,person),...(kind==='origin'?{trace:{...doc?.trace}}:{})};
  }
  /** 核对弹层打开时冻结页面输入，只读取当前可操作区域内绑定到当前账号的表单。 */
  function activeForm() {
    const root=document.querySelector('#modal[open]')||document.getElementById('app-content');
    const form=root?.querySelector('[data-home-form]');
    if(!form||form.featureState!==P.state||form.dataset.actor!==P.state.actor)return null;
    return allowed(form.dataset.kind,form.dataset.person)?form:null;
  }
  function capture() {
    const form=activeForm();
    if(!form)return;
    const {kind,person}=form.dataset;
    const data=new FormData(form),value=draft(kind,person);
    if(kind==='featured')value.ids=data.getAll('stories');
    else {
      value.text=String(data.get('text')||'');value.source=String(data.get('source')||'');value.kind=String(data.get('kind')||'new');value.date=String(data.get('date')||today());
      if(kind==='origin'){
        value.surname=String(data.get('surname')||'').trim();
        value.trace=Object.fromEntries(ORIGIN_TRACE_FIELDS.map(({name})=>[name,String(data.get(name)||'').trim()]));
      }
    }
  }
  /** 未知线索可以留空，和家族记载、来源一起由档案本人核对发布。 */
  function traceFields(trace) {
    return `<fieldset class="heritage-trace-fields"><legend>家族溯源（选填）</legend>
      ${ORIGIN_TRACE_FIELDS.map(({name,label,placeholder})=>`<label for="heritage-trace-${name}">${label}</label><input id="heritage-trace-${name}" name="${name}" maxlength="180" placeholder="${placeholder}" value="${e(trace?.[name]||'')}">`).join('')}
    </fieldset>`;
  }
  /** 旧记载只保留正文与来源，缺少的溯源字段等待本人补录。 */
  function originTrace(trace,source) {
    return `<dl class="heritage-origin-trace">
      ${ORIGIN_TRACE_FIELDS.map(({name,label})=>`<div><dt>${label}</dt><dd>${e(trace?.[name]||'待补录')}</dd></div>`).join('')}
      <div class="heritage-origin-trace-source"><dt>家庭资料来源</dt><dd>${e(source||'待补录')}</dd></div>
    </dl>`;
  }
  /** 文本输入均有可见标签；长文本保持原段落，来源和立训时间独立填写。 */
  function textFields(kind,value,page=false) {
    const surname=kind==='origin'?`<label for="heritage-surname">姓氏（可填写复姓）</label><input id="heritage-surname" name="surname" maxlength="8" value="${e(value.surname)}" required>`:'';
    const prompt=kind==='preface'?'写下想感谢的人，以及为什么想留下这些家事。':'写下想和家人一起记住的话。';
    const label=page?(kind==='preface'?'致谢正文':'家训正文'):LABELS[kind];
    const text=`<label for="heritage-text">${label}</label><textarea id="heritage-text" name="text" rows="7" maxlength="1800"${page?` placeholder="${e(prompt)}"`:''} required>${e(value.text)}</textarea>`;
    const source=['origin','motto','suggestion'].includes(kind)?`<label for="heritage-source">${kind==='motto'?'传承来源或立训缘由':'资料来源或讲述者'}</label><input id="heritage-source" name="source" maxlength="180" value="${e(value.source)}" ${kind==='origin'?'required':''}>`:'';
    const motto=kind==='motto'?`<label for="heritage-kind">家训来源</label><select id="heritage-kind" name="kind"><option value="new" ${value.kind==='new'?'selected':''}>由本人新立</option><option value="inherited" ${value.kind==='inherited'?'selected':''}>沿用家族传承</option></select><label for="heritage-date">立训或整理确认日期</label><input id="heritage-date" name="date" type="date" value="${e(value.date)}" required>`:'';
    return page?text+motto+source:surname+motto+text+source+(kind==='origin'?traceFields(value.trace):'');
  }
  /** 选材只提供当前本人可见的已确认经历，保存顺序不影响按年份阅读。 */
  function storyFields(person,value) {
    const items=F.candidates(person);
    return `<p class="heritage-caption">勾选想精选的经历，首页按年份预览前${P.FamilyHomeViews.previewLimit}条。家人只看到向其开放的经历，完整人生仍保留其他记录。</p>${items.length?items.map(item=>`<label class="heritage-select-story"><input type="checkbox" name="stories" value="${e(item.id)}" ${value.ids.includes(item.id)?'checked':''}><span><strong>${e(item.year)} · ${e(item.title)}</strong><small>${e(item.source)}${item.scope==='private'?' · 仅自己可见':item.scope==='selected'?' · 指定家人':' · 家庭可见'}</small></span></label>`).join(''):'<p class="heritage-empty">尚无可挑选的已确认经历。可以从“资料与核对”记录一刻。</p>'}`;
  }
  function editorForm(kind,person,value,page=false) {
    const fields=kind==='featured'?storyFields(person,value):textFields(kind,value,page);
    return `<form class="heritage-editor" id="heritage-form" data-home-form data-feature-form data-actor="${e(P.state.actor)}" data-kind="${kind}" data-person="${e(person)}">
      ${fields}
      <p class="heritage-form-error" role="alert"></p>
      <div class="heritage-editor-actions">${b('保存草稿','heritage-save','btn secondary')}<button type="submit" class="btn">核对${kind==='suggestion'?'建议':'内容'}</button></div>
    </form>`;
  }
  /** 路由明确记录编辑对象。只有进入该页时才更新草稿基准，字号重绘不会跳过版本检查。 */
  function enterPage(route,id) {
    const kind=Object.keys(EDIT_ROUTES).find(item=>EDIT_ROUTES[item]===route);
    if(!kind)return;
    const person=id||P.FamilyContext.current();
    if(P.state.route===route&&P.state.homeEditPerson===person)return;
    P.state.homeEditPerson=person;
    if(!P.state.members.includes(person)||!allowed(kind,person))return;
    const value=draft(kind,person),current=revision(kind,person);
    if(value.revision!==current){
      value.revision=current;
      value.rebased=true;
    }
  }
  function editPage(kind) {
    const person=P.state.homeEditPerson;
    if(!P.state.members.includes(person)||!allowed(kind,person)){
      return `<div class="page empty"><h2>这项内容由对应的档案本人编辑</h2>${l('返回首页内容','home-manage','btn')}</div>`;
    }
    const value=draft(kind,person);
    const intro=kind==='motto'?'全家共用一份家训。沿用家族传承时，请写明来源。':'写下感谢的人和建谱的缘由。确认后，获授权的家人可在归家阅读。';
    const notice=value.rebased?'<p class="notice section">正式内容已有更新，已保留你的草稿，请对照首页重新核对。</p>':'';
    return `<div class="page heritage-edit-page"><p class="page-subtitle">${intro}</p>${notice}${editorForm(kind,person,value,true)}</div>`;
  }
  /** 建谱致谢和家训使用独立页，其余整理动作沿用原弹层。 */
  function open(kind,person=P.FamilyContext.current()) {
    if(!allowed(kind,person))return P.toast('这项内容由对应的档案本人确认。');
    if(Object.hasOwn(EDIT_ROUTES,kind)){
      if(P.state.route===EDIT_ROUTES[kind]&&P.state.homeEditPerson===person){
        P.closeModal();
        return;
      }
      P.navigate(EDIT_ROUTES[kind]+'/'+person);
      return;
    }
    const value=draft(kind,person),stale=value.revision!==revision(kind,person);
    // 重新打开时保留输入并明确提示正式版本已变，避免草稿永久卡在旧修订号。
    if(stale)value.revision=revision(kind,person);
    const notice=stale?'正式内容已有更新，已保留你的草稿，请对照首页重新核对。':kind==='suggestion'?'建议交给家庭指定的档案本人核对，提交后不会直接替换家训。':'先保存草稿，核对后再展示给获授权的家人。';
    const title=kind==='suggestion'?'协助整理家训':(kind==='featured'?'挑选':'整理')+LABELS[kind];
    P.modal(title,`<p class="heritage-caption">${notice}</p>${editorForm(kind,person,value)}`);
  }
  /** 核对页冻结本次输入；返回修改或关闭都保留草稿，不擅自发布。 */
  function review(form) {
    const {kind,person}=form.dataset,value=draft(kind,person),items=F.candidates(person);
    if(kind!=='featured'&&!value.text.trim())return '请先填写内容。';
    if(kind==='origin'&&(!value.surname||!value.source.trim()))return '请填写姓氏与家族资料来源。';
    if(kind==='motto'&&(!['new','inherited'].includes(value.kind)||!/^\d{4}-\d{2}-\d{2}$/.test(value.date)))return '请检查家训来源与日期。';
    if(kind==='motto'&&value.kind==='inherited'&&!value.source.trim())return '请填写传承家训的来源。';
    if(value.revision!==revision(kind,person))return Object.hasOwn(EDIT_ROUTES,kind)?'正式内容已经更新，请返回首页内容后重新打开编辑页。':'正式内容已经更新，请关闭弹层后重新整理。';
    const id=P.nextId('home-review');F.ensure().review={id,key:key(kind,person),actor:P.state.actor,person,kind,value:structuredClone(value)};
    const copy=kind==='featured'?(items.filter(item=>value.ids.includes(item.id)).map(item=>item.year+' · '+item.title).join('\n')||'暂不在首页精选经历；完整人生档案继续保留。'):value.text;
    const metadata=kind==='motto'?`<p class="heritage-caption">${value.kind==='new'?'本人新立':'家族传承'} · ${e(value.date)}</p>`:kind==='origin'?`<p class="heritage-caption">姓氏：${e(value.surname)}</p>`:'';
    const sources=kind==='origin'?originTrace(value.trace,value.source.trim()):value.source?`<p class="heritage-caption">来源或缘由：${e(value.source)}</p>`:'';
    P.modal('确认'+LABELS[kind],`<div class="heritage-review-copy">${e(copy)}</div>${metadata}${sources}<p class="heritage-caption">${kind==='motto'?'由你确认后，本家庭统一使用这份家训。':kind==='suggestion'?'提交给家庭指定本人，等待核对。':'确认后展示给有权阅读这份档案的家人。'}</p><div class="heritage-editor-actions">${b('返回修改','heritage-edit','btn secondary',`data-kind="${kind}" data-person="${e(person)}"`)}${b(kind==='suggestion'?'提交建议':'确认并展示','heritage-publish','btn',`data-review="${id}"`)}</div>`);
    return '';
  }
  /** 发布前重验账号、确认权和修订号，完成后返回首页查看结果。 */
  function publish(id) {
    const home=F.ensure(),entry=home.review;
    if(!entry||entry.id!==id||entry.actor!==P.state.actor||!allowed(entry.kind,entry.person))return P.toast('确认已失效，请重新打开对应内容。');
    const {kind,person,value}=entry;if(value.revision!==revision(kind,person))return P.toast('内容已更新，请重新核对。');
    const doc={text:value.text.trim(),source:value.source.trim(),date:value.date,confirmedBy:P.state.actor,revision:value.revision+1};
    if(kind==='motto'){home.family.motto={...doc,kind:value.kind};if(value.suggestionId){const suggestion=home.family.suggestions.find(item=>item.id===value.suggestionId);if(suggestion)suggestion.status='accepted';}}
    else if(kind==='suggestion')home.family.suggestions.push({id:P.nextId('motto-suggestion'),author:P.state.actor,text:doc.text,source:doc.source,status:'pending'});
    else if(kind==='featured'){F.profile(person).featured=F.candidates(person).filter(item=>value.ids.includes(item.id)).map(item=>item.id);F.profile(person).featuredRevision=doc.revision;}
    else {
      const profile=F.profile(person);
      if(kind==='origin'){
        doc.trace=value.trace;
        profile.surname=value.surname;
      }
      profile[kind]=doc;
    }
    // 核对弹层下方的旧页面表单还在，先解除绑定，避免导航时把已发布的内容重新写为草稿。
    const pageForm=document.querySelector('#app-content [data-home-form]');
    if(pageForm?.dataset.kind===kind&&pageForm.dataset.person===person)pageForm.featureState=null;
    delete home.drafts[entry.key];home.review=null;P.closeModal();P.navigate('home');P.toast(kind==='suggestion'?'建议已提交，等待指定的档案本人确认。':'已确认，首页内容已更新。');
  }
  /** 家庭线索来自已发布记载；公开出处仅用于了解姓氏文化。 */
  function readOrigin(person) {
    if(!F.readable(person))return `<div class="page empty"><h2>家族源流暂未开放</h2>${l('返回归家','home','btn section')}</div>`;
    const doc=F.document('origin',person),surname=F.profile(person).surname;
    const culture=Object.hasOwn(F.culture,surname)?F.culture[surname]:null;
    const citation=culture?`<p class="heritage-reader-citation">公开出处 <a href="${e(culture.url)}" target="_blank" rel="noopener noreferrer">${e(culture.source)}</a></p>`:'';
    return `<div class="page heritage-reader">
      <section class="heritage-reader-trace" aria-labelledby="heritage-reader-trace-title">
        <h2 id="heritage-reader-trace-title">家族溯源</h2>
        ${originTrace(doc?.trace,doc?.source)}
      </section>
      <section aria-labelledby="heritage-reader-record-title">
        <h2 id="heritage-reader-record-title">这个家的记载</h2>
        <p class="heritage-reader-text">${doc?e(doc.text):'本人尚未补充确认。'}</p>
      </section>
      <section aria-labelledby="heritage-reader-culture-title">
        <h2 id="heritage-reader-culture-title">姓氏文化</h2>
        <p>${culture?e(culture.text):'姓氏文化资料尚未整理。'}</p>
        ${citation}
      </section>
      ${P.FamilyHomeViews.kinship(person,true)}
    </div>`;
  }
  /** 家人的建议保留讲述者，只有指定本人可取用到待确认草稿。 */
  function suggestions() {
    if(!F.editable('motto',''))return;
    P.modal('家人整理的建议',F.ensure().family.suggestions.filter(item=>item.status==='pending').map(item=>`<div class="heritage-suggestion"><strong>${e(P.PEOPLE[item.author]?.name||'家人')}的建议</strong><p>${e(item.text)}</p>${b('取用并核对','heritage-use-suggestion','btn secondary',`data-id="${e(item.id)}"`)}</div>`).join('')||'<p>暂无待核对建议。</p>');
  }
  /** 所有新增动作统一进入原型原有事件代理，重复渲染不增加监听器。 */
  function handleAction(action,element) {
    if(!action.startsWith('heritage-'))return false;
    const person=element.dataset.person||P.FamilyContext.current();
    if(action==='heritage-edit')open(element.dataset.kind,person);
    else if(action==='heritage-save'){
      const form=activeForm();
      if(!form)return true;
      capture();
      if(Object.hasOwn(EDIT_ROUTES,form.dataset.kind))P.back();
      else P.closeModal();
      P.toast('草稿已保留在本次演示中，仅自己可见。');
    }
    else if(action==='heritage-publish')publish(element.dataset.review);
    else if(action==='heritage-origin'){
      if(!F.readable(person))P.toast('这位家人的档案尚未向你开放。');
      else P.navigate('home-origin/'+person);
    }
    else if(action==='heritage-suggest')open('suggestion',person);
    else if(action==='heritage-suggestions')suggestions();
    else if(action==='heritage-use-suggestion'&&F.editable('motto',person)){
      const item=F.ensure().family.suggestions.find(value=>value.id===element.dataset.id&&value.status==='pending');
      if(item){const value=draft('motto',person);Object.assign(value,{text:item.text,source:item.source||P.PEOPLE[item.author]?.name+'整理建议',suggestionId:item.id});open('motto',person);}
    }
    return true;
  }
  /** 表单由当前状态绑定，越权或陈旧表单不写入草稿及正式内容。 */
  function submit(form) {
    if(!form.matches('[data-home-form]'))return false;
    if(form!==activeForm())return true;
    capture();const error=review(form);if(error)form.querySelector('[role="alert"]').textContent=error;return true;
  }
  Object.assign(P.views,{
    'home-origin':()=>readOrigin(P.state.homeOriginPerson||P.FamilyContext.current()),
    [EDIT_ROUTES.preface]:()=>editPage('preface'),
    [EDIT_ROUTES.motto]:()=>editPage('motto')
  });
  P.FamilyHomeEditor={capture,enterPage,handleAction,submit};
}
