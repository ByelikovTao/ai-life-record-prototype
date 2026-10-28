/** 关系专属章节：两位家人的共同经历、已有资料和各自讲述，章节不扩大原材料权限。 */
'use strict';
{
  const P=window.App,{escape:e,button:b,link:l,badge:t,avatar:a}=P;
  /** 演示种子有明确作者和参与者，仅两位家人可见，不自动收录任何私聊。 */
  function ensure() {
    if(P.state.relationshipChapters===null)P.state.relationshipChapters=[{id:'chapter-father-xia',owner:'father',partner:'xia',title:'爸爸和我',intro:'从一起经历过的事情，听见彼此记住的细节。',message:'知夏，这里留着我们一起走过的日子。你记得的那一面，也可以慢慢补上。',refs:[{kind:'story',storyId:'first-order'},{kind:'story',storyId:'spring'}],notes:[],example:true}];
    return P.state.relationshipChapters;
  }
  /** 亲属关系不是读取凭据，当前章节只向创建者与指定家人开放。 */
  function readable(item) {return Boolean(item&&P.state.members.includes(item.owner)&&P.state.members.includes(item.partner)&&[item.owner,item.partner].includes(P.state.actor));}
  /** 每位创建者保留独立草稿；对方只能补充自己的讲述，不能改写本人寄语。 */
  function draft() {return P.state.chapterDrafts[P.state.actor] ||= {id:'',partner:P.state.actor==='father'?'xia':'father',title:'',intro:'',message:'',keys:[]};}
  /** 可选资料通过现有来源解析器检查，不为章节维护第二套故事正文或授权。 */
  function choices(partner) {
    const pair=[P.state.actor,partner];P.PersonArchive.assets(P.state.actor,'photo');
    const refs=[...P.visibleStories().filter(item=>pair.includes(item.subject)).map(item=>({kind:'story',storyId:item.id})),...P.state.archiveAssets.filter(item=>pair.includes(item.subject)||pair.includes(item.author)).map(item=>({kind:'asset',assetId:item.id}))];
    return refs.map(ref=>P.ContentChat.resolve(ref)).filter(Boolean);
  }
  /** 重绘前只保存原状态、原账号绑定的创建表单或本人补充，切换账号不串草稿。 */
  function capture() {
    const form=document.getElementById('chapter-form');
    if(form?.featureState===P.state&&form.dataset.actor===P.state.actor){const data=new FormData(form),r=draft();for(const key of ['partner','title','intro','message'])r[key]=String(data.get(key)||'');r.keys=data.getAll('refs');}
    const note=document.getElementById('chapter-note-form');
    if(note?.featureState===P.state&&note.dataset.actor===P.state.actor)P.state.chapterNoteDrafts[P.state.actor+':'+note.dataset.id]=String(new FormData(note).get('text')||'');
  }
  /** 故事集作为共同回忆页的次级整理方式，保留原两人权限和草稿，不再提供独立列表页。 */
  function overview() {
    const items=ensure().filter(readable),r=P.state.chapterDrafts[P.state.actor];
    const hasDraft=r&&(r.id||r.title||r.intro||r.message||r.keys.length);
    return `<section class="section common-story-collections"><div class="section-heading"><h2>我们的故事集</h2>${b('整理成故事集','chapter-new','text-link')}</div><p class="caption">把已有回忆、照片和寄语整理在一起，仅你与选定的家人可见。</p>${hasDraft?l('继续故事集草稿','chapter-edit','text-link full section'):''}<div class="section stack">${items.length?items.map(item=>{const other=item.owner===P.state.actor?item.partner:item.owner;return `<article class="card"><div class="row">${a(other)}<div><p class="caption">故事集 · 我与${e(P.PEOPLE[other].name)} · 仅我们两人</p><h3>${e(item.title)}</h3></div></div><p class="section">${e(item.intro)}</p>${item.example?t('虚构示例故事集','gray'):''}${l('打开故事集','chapter/'+item.id,'btn secondary full section')}</article>`;}).join(''):'<p class="caption">还没有故事集，可以先留下一段回忆，以后再整理。</p>'}</div><p class="caption section">整理不会扩大原照片和故事的查看权限，也不会收录未主动分享的私聊。</p></section>`;
  }
  /** 编辑可选择已有事件和媒体，未向当前账号开放的条目不生成标题或计数。 */
  function edit() {
    const r=draft(),items=choices(r.partner),partners=P.state.members.filter(id=>id!==P.state.actor&&P.state.accounts[id]);
    return `<div class="page feature-page"><h1 class="page-title">整理我们的故事集</h1><form id="chapter-form" data-feature-form data-actor="${P.state.actor}"><div class="form-field"><label for="relationship-field-partner">与你一起留下故事的家人</label><select id="relationship-field-partner" name="partner" ${r.id?'disabled':''}>${partners.map(id=>`<option value="${id}" ${r.partner===id?'selected':''}>${e(P.PEOPLE[id].name)} · ${e(P.relation(id))}</option>`).join('')}</select>${r.id?`<input type="hidden" name="partner" value="${r.partner}">`:''}</div><div class="form-field"><label for="relationship-field-title">故事集名称</label><input id="relationship-field-title" name="title" maxlength="80" value="${e(r.title)}" placeholder="例如：爸爸和我、一起走过的路" required></div><div class="form-field"><label for="relationship-field-intro">这个故事集想讲什么</label><textarea id="relationship-field-intro" name="intro" maxlength="1000">${e(r.intro)}</textarea></div><div class="form-field"><label for="relationship-field-message">我想亲自对这位家人说的话</label><textarea id="relationship-field-message" name="message" maxlength="2000">${e(r.message)}</textarea></div><fieldset class="feature-choices"><legend>收录已有经历与资料</legend>${items.length?items.map(item=>{const key=P.ContentChat.key(item.ref);return `<label class="check-row"><input type="checkbox" name="refs" value="${e(key)}" ${r.keys.includes(key)?'checked':''}><span>${e(item.title)}<small>${e(item.label)}</small></span></label>`;}).join(''):'<p class="caption">暂时没有可收录的资料，可以先写下寄语。</p>'}</fieldset><div class="note section">故事集仅向你和 ${e(P.PEOPLE[r.partner]?.name||'所选家人')}开放。收录资料仍按原作者的分享范围显示；对方未获授权的资料不会因收录到故事集而开放。</div><div class="feature-actions section"><button type="submit" name="intent" value="draft" formnovalidate class="btn secondary">保存草稿</button><button type="submit" name="intent" value="save" class="btn">确认并分享给这位家人</button></div></form></div>`;
  }
  /** 每次阅读重新解析来源；原材料撤回后，正文、标题和缩略图不从旧快照中残留。 */
  function detail() {
    const item=ensure().find(value=>value.id===P.state.chapterId);
    if(!readable(item))return `<div class="page empty"><h2>这个故事集暂未向你开放</h2>${l('查看我们的共同回忆','common-memories','btn')}</div>`;
    const other=item.owner===P.state.actor?item.partner:item.owner,materials=item.refs.map(ref=>P.ContentChat.resolve(ref)).filter(Boolean);
    const notes=item.notes.filter(note=>!note.withdrawn),key=P.state.actor+':'+item.id;
    return `<div class="page feature-page"><p class="eyebrow">${e(P.PEOPLE[item.owner].name)} 与 ${e(P.PEOPLE[item.partner].name)}</p><h1 class="page-title">${e(item.title)}</h1><div class="tags">${t('仅这两位家人可见','gray')}${item.example?t('虚构示例','warm'):''}</div><p class="section feature-prose">${e(item.intro)}</p>${item.message?`<div class="note section"><strong>${e(P.PEOPLE[item.owner].name)}亲自留下的话</strong><p class="feature-prose">${e(item.message)}</p></div>`:''}${item.owner===P.state.actor?b('编辑故事集','chapter-edit','text-link section',`data-id="${item.id}"`):''}<section class="section stack"><h2>这段关系里的经历与资料</h2>${materials.length?materials.map(source=>`<article class="card"><p class="caption">${e(source.label)}</p><h3>${e(source.title)}</h3><p>${e(source.text.slice(0,180))}</p>${P.ContentChat.sourceButton(source.ref,'回看完整资料')}${P.ContentChat.available(source.person)?b('围绕这段经历继续聊','content-chat-start','text-link',`data-context="${e(JSON.stringify(source.ref))}"`):''}</article>`).join(''):'<p class="caption">尚无向你开放的关联资料，可以请原作者选择分享。</p>'}</section><section class="section stack"><h2>我们各自记得的细节</h2>${notes.length?notes.map(note=>`<article class="card"><strong>${e(P.PEOPLE[note.author].name)}的讲述</strong><p class="feature-prose">${e(note.text)}</p>${note.author===P.state.actor?b('撤回我的这段补充','chapter-note-withdraw','text-link',`data-id="${item.id}" data-note="${note.id}"`):''}</article>`).join(''):'<p class="caption">同一件事，也可以留下不同的感受。</p>'}<form id="chapter-note-form" data-feature-form data-actor="${P.state.actor}" data-id="${item.id}"><div class="form-field"><label for="relationship-field-text">补上我记得的一面</label><textarea id="relationship-field-text" name="text" maxlength="2000" required>${e(P.state.chapterNoteDrafts[key]||'')}</textarea></div><p class="caption">这段补充会向 ${e(P.PEOPLE[other].name)}展示，保留你的讲述者身份，不改写对方的寄语或经历。</p><button type="submit" class="btn full">把我的这段回忆留在这里</button></form></section></div>`;
  }
  /** 创建者控制章节编排，参与者只能撤回自己明确提交的讲述。 */
  function handleAction(action,el) {
    if(action==='chapter-new'){
      const r=P.state.chapterDrafts[P.state.actor];
      if(r&&(r.title||r.intro||r.message||r.keys.length)){P.modal('还有一个故事集没有整理完',`<p>《${e(r.title||'未命名故事集')}》仍在你的草稿中。</p>${l('继续这份故事集草稿','chapter-edit','btn full')}${b('放弃这份草稿并新建','chapter-discard-draft','btn secondary full section')}`);return true;}
      action='chapter-discard-draft';
    }
    if(action==='chapter-discard-draft'){const form=document.getElementById('chapter-form');if(form)form.featureState=null;P.state.chapterDrafts[P.state.actor]=null;P.navigate('chapter-edit');return true;}
    if(action==='chapter-edit'){
      const item=ensure().find(value=>value.id===el.dataset.id&&value.owner===P.state.actor);if(!readable(item))return true;
      const current=P.state.chapterDrafts[P.state.actor];if(current&&(current.title||current.intro||current.message||current.keys.length)){if(current.id===item.id)P.navigate('chapter-edit');else P.toast('请先完成或放弃原章节草稿，再编辑另一章。');return true;}
      P.state.chapterDrafts[P.state.actor]={id:item.id,partner:item.partner,title:item.title,intro:item.intro,message:item.message,keys:item.refs.map(P.ContentChat.key)};P.navigate('chapter-edit');return true;
    }
    if(action==='chapter-note-withdraw'){
      const item=ensure().find(value=>value.id===el.dataset.id);if(!readable(item))return true;
      const note=item.notes.find(value=>value.id===el.dataset.note&&value.author===P.state.actor);if(note){note.withdrawn=true;P.render();P.toast('你的补充已撤回，未改动另一位家人的讲述。');}return true;
    }
    return false;
  }
  /** 保存重新验证参与者与资料；私有章节不会被其他家庭成员或付款人接管。 */
  function submit(form,event) {
    if(!['chapter-form','chapter-note-form'].includes(form.id))return false;
    if(form.featureState!==P.state||form.dataset.actor!==P.state.actor)return true;
    capture();
    if(form.id==='chapter-note-form'){
      const item=ensure().find(value=>value.id===form.dataset.id),key=P.state.actor+':'+form.dataset.id,text=String(P.state.chapterNoteDrafts[key]||'').trim();
      if(!readable(item)||!text||text.length>2000)return true;
      item.notes.push({id:P.nextId('chapter-note'),author:P.state.actor,text,withdrawn:false});form.featureState=null;delete P.state.chapterNoteDrafts[key];P.render();return true;
    }
    const r=draft();
    if(event.submitter?.value==='draft'){P.navigate('common-memories');P.toast('故事集草稿已为你保留，可以稍后继续编排。');return true;}
    if(!r.title.trim()||r.partner===P.state.actor||!P.state.members.includes(r.partner)||!P.state.accounts[r.partner]){P.toast('请填写故事集名称，并选择一位已加入的家人。');return true;}
    const existing=ensure().find(item=>item.id===r.id);
    if(r.id&&(!existing||existing.owner!==P.state.actor||existing.partner!==r.partner))return true;
    const visible=choices(r.partner),selected=visible.filter(item=>r.keys.includes(P.ContentChat.key(item.ref))).map(item=>item.ref);
    const hidden=existing?.refs.filter(ref=>!P.ContentChat.resolve(ref))||[];
    const item={id:r.id||P.nextId('chapter'),owner:P.state.actor,partner:r.partner,title:r.title.trim(),intro:r.intro.trim(),message:r.message.trim(),refs:[...selected,...hidden],notes:existing?.notes||[],example:false};
    if(existing)Object.assign(existing,item);else ensure().push(item);
    form.featureState=null;P.state.chapterDrafts[P.state.actor]=null;P.navigate('common-memories');P.toast('故事集已保存在我们的共同回忆中，仅这两位家人可见。');return true;
  }
  /** 更换家人后清除原选择，已有文字仍保留，避免把上一对关系的资料误带过去。 */
  document.addEventListener('change',event=>{if(event.target.closest('#chapter-form')&&event.target.name==='partner'){capture();draft().keys=[];P.render();}});
  P.RelationshipChapters={capture,handleAction,submit,overview};
  Object.assign(P.views,{'chapter-edit':edit,chapter:detail});
}
