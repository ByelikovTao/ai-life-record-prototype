/** 首页编辑与确认：本人草稿、家庭家训建议和正式内容分别维护，提交时重验身份与版本。 */
'use strict';
{
  const P=window.App,{escape:e,button:b}=P,F=P.FamilyHome;
  const LABELS={origin:'家族来源',preface:'建谱致谢',motto:'家庭家训',featured:'首页个人事迹',suggestion:'家训整理建议'};
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
    return home.drafts[id]={text:doc?.text||'',source:doc?.source||'',kind:doc?.kind||'new',date:doc?.date||today(),surname:F.profile(person).surname,ids:[...F.profile(person).featured],revision:revision(kind,person)};
  }
  /** 表单只捕获仍属于当前账号与当前演示状态的输入；旧弹层和重置前表单无效。 */
  function capture() {
    const form=document.querySelector('#modal[open] [data-home-form]');
    if(!form||form.featureState!==P.state||form.dataset.actor!==P.state.actor)return;
    const {kind,person}=form.dataset;if(!allowed(kind,person))return;
    const data=new FormData(form),value=draft(kind,person);
    if(kind==='featured')value.ids=data.getAll('stories');
    else {value.text=String(data.get('text')||'');value.source=String(data.get('source')||'');value.kind=String(data.get('kind')||'new');value.date=String(data.get('date')||today());if(kind==='origin')value.surname=String(data.get('surname')||'').trim();}
  }
  /** 文本输入均有可见标签；长文本保持原段落，来源和立训时间独立填写。 */
  function textFields(kind,value) {
    const surname=kind==='origin'?`<label for="heritage-surname">姓氏（可填写复姓）</label><input id="heritage-surname" name="surname" maxlength="8" value="${e(value.surname)}" required>`:'';
    const text=`<label for="heritage-text">${LABELS[kind]}</label><textarea id="heritage-text" name="text" rows="7" maxlength="1800" required>${e(value.text)}</textarea>`;
    const source=['origin','motto','suggestion'].includes(kind)?`<label for="heritage-source">${kind==='motto'?'传承来源或立训缘由':'资料来源或讲述者'}</label><input id="heritage-source" name="source" maxlength="180" value="${e(value.source)}" ${kind==='origin'?'required':''}>`:'';
    const motto=kind==='motto'?`<label for="heritage-kind">家训来源</label><select id="heritage-kind" name="kind"><option value="new" ${value.kind==='new'?'selected':''}>由本人新立</option><option value="inherited" ${value.kind==='inherited'?'selected':''}>沿用家族传承</option></select><label for="heritage-date">立训或整理确认日期</label><input id="heritage-date" name="date" type="date" value="${e(value.date)}" required>`:'';
    return surname+motto+text+source;
  }
  /** 选材只提供当前本人可见的已确认经历，保存顺序不影响按年份阅读。 */
  function storyFields(person,value) {
    const items=F.candidates(person);
    return `<p class="heritage-caption">勾选想精选的经历，首页按年份预览前${P.FamilyHomeViews.previewLimit}条。家人只看到向其开放的经历，完整人生仍保留其他记录。</p>${items.length?items.map(item=>`<label class="heritage-select-story"><input type="checkbox" name="stories" value="${e(item.id)}" ${value.ids.includes(item.id)?'checked':''}><span><strong>${e(item.year)} · ${e(item.title)}</strong><small>${e(item.source)}${item.scope==='private'?' · 仅自己可见':item.scope==='selected'?' · 指定家人':' · 家庭可见'}</small></span></label>`).join(''):'<p class="heritage-empty">尚无可挑选的已确认经历。可以从“资料与核对”记录一刻。</p>'}`;
  }
  /** 编辑在原生弹层中进行，关闭或切换身份保存为私有草稿，公开内容等待再次确认。 */
  function open(kind,person=P.FamilyContext.current()) {
    if(!allowed(kind,person))return P.toast('这项内容由对应的档案本人确认。');
    const value=draft(kind,person),stale=value.revision!==revision(kind,person);
    // 重新打开时保留输入并明确提示正式版本已变，避免草稿永久卡在旧修订号。
    if(stale)value.revision=revision(kind,person);
    const notice=stale?'正式内容已有更新，已保留你的草稿，请对照首页重新核对。':kind==='suggestion'?'建议交给家庭指定的档案本人核对，提交后不会直接替换家训。':kind==='motto'?'本家庭共用一份家训。由你确认后，其他家庭成员查看同一份内容。':'先保存草稿，核对后再展示给获授权的家人。';
    const title=kind==='suggestion'?'协助整理家训':(kind==='featured'?'挑选':'整理')+LABELS[kind];
    P.modal(title,`<p class="heritage-caption">${notice}</p><form class="heritage-editor" id="heritage-form" data-home-form data-feature-form data-actor="${e(P.state.actor)}" data-kind="${kind}" data-person="${e(person)}">${kind==='featured'?storyFields(person,value):textFields(kind,value)}<p class="heritage-form-error" role="alert"></p><div class="heritage-editor-actions">${b('保存草稿','heritage-save','btn secondary')}<button type="submit" class="btn">核对${kind==='suggestion'?'建议':'内容'}</button></div></form>`);
  }
  /** 核对页冻结本次输入；返回修改或关闭都保留草稿，不擅自发布。 */
  function review(form) {
    const {kind,person}=form.dataset,value=draft(kind,person),items=F.candidates(person);
    if(kind!=='featured'&&!value.text.trim())return '请先填写内容。';
    if(kind==='origin'&&(!value.surname||!value.source.trim()))return '请填写姓氏与家族资料来源。';
    if(kind==='motto'&&(!['new','inherited'].includes(value.kind)||!/^\d{4}-\d{2}-\d{2}$/.test(value.date)))return '请检查家训来源与日期。';
    if(kind==='motto'&&value.kind==='inherited'&&!value.source.trim())return '请填写传承家训的来源。';
    if(value.revision!==revision(kind,person))return '正式内容已经更新，请关闭弹层后重新整理。';
    const id=P.nextId('home-review');F.ensure().review={id,key:key(kind,person),actor:P.state.actor,person,kind,value:structuredClone(value)};
    const copy=kind==='featured'?(items.filter(item=>value.ids.includes(item.id)).map(item=>item.year+' · '+item.title).join('\n')||'暂不在首页精选经历；完整人生档案继续保留。'):value.text;
    const metadata=kind==='motto'?`<p class="heritage-caption">${value.kind==='new'?'本人新立':'家族传承'} · ${e(value.date)}</p>`:kind==='origin'?`<p class="heritage-caption">姓氏：${e(value.surname)}</p>`:'';
    P.modal('确认'+LABELS[kind],`<div class="heritage-review-copy">${e(copy)}</div>${metadata}${value.source?`<p class="heritage-caption">来源或缘由：${e(value.source)}</p>`:''}<p class="heritage-caption">${kind==='motto'?'由你确认后，本家庭统一使用这份家训。':kind==='suggestion'?'提交给家庭指定本人，等待核对。':'确认后展示给有权阅读这份档案的家人。'}</p><div class="heritage-editor-actions">${b('返回修改','heritage-edit','btn secondary',`data-kind="${kind}" data-person="${e(person)}"`)}${b(kind==='suggestion'?'提交建议':'确认并展示','heritage-publish','btn',`data-review="${id}"`)}</div>`);
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
    else {F.profile(person)[kind]=doc;if(kind==='origin')F.profile(person).surname=value.surname;}
    delete home.drafts[entry.key];home.review=null;P.closeModal();P.navigate('home');P.toast(kind==='suggestion'?'建议已提交，等待指定的档案本人确认。':'已确认，首页内容已更新。');
  }
  /** 公共文化来源在独立阅读弹层中展示，链接只在用户主动点击时打开。 */
  function readOrigin(person) {
    if(!F.readable(person))return P.toast('这位家人的档案尚未向你开放。');
    const doc=F.document('origin',person),culture=F.culture[F.profile(person).surname];
    const background=`<h3>姓氏文化</h3><p>${culture?e(culture.text):'姓氏文化资料尚未整理。'}</p>${culture?`<p class="heritage-caption">出处：<a href="${culture.url}" target="_blank" rel="noopener noreferrer">${e(culture.source)}</a></p>`:''}<h3>这个家的记载</h3>`;
    P.modal('家族源流与族谱',`<div class="heritage-reader">${background}<p>${doc?e(doc.text):'本人尚未补充确认。'}</p>${doc?.source?`<p class="heritage-caption">${e(doc.source)}</p>`:''}${P.FamilyHomeViews.kinship(person,true)}</div>`);
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
    else if(action==='heritage-save'){capture();P.closeModal();P.toast('草稿已保留在本次演示中，仅自己可见。');}
    else if(action==='heritage-publish')publish(element.dataset.review);
    else if(action==='heritage-origin')readOrigin(person);
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
    if(form.featureState!==P.state||form.dataset.actor!==P.state.actor||!allowed(form.dataset.kind,form.dataset.person))return true;
    capture();const error=review(form);if(error)form.querySelector('[role="alert"]').textContent=error;return true;
  }
  P.FamilyHomeEditor={capture,handleAction,submit};
}
