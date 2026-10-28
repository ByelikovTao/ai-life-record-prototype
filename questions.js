/** 家庭问题收件箱：问题只在提问者与档案本人之间显示，回复由本人输入而非 AI 编造。 */
'use strict';
{
  const P=window.App,{escape:e,button:b,link:l,badge:t}=P;
  const QUESTION_LIMIT=240,ANSWER_LIMIT=2000;
  /** 根据正在查看的人物判断收件箱视角，不按固定示例账号区分本人和家人。 */
  function viewingSelf(){return P.state.actor===(P.state.chatTarget||P.FamilyContext.current());}
  /** 聊天入口、页标题与路由标题共用同一称呼。 */
  function title(){return viewingSelf()?'家人问我的':'留给本人的问题';}
  /** 待本人回复和提问者尚未查看的本人答复分别提醒，收件视角由当前聊天人物决定。 */
  function hasNotice() {
    const actor=P.state.actor,target=P.state.chatTarget||P.FamilyContext.current();
    return P.state.questions.some(item=>viewingSelf()?item.owner===actor&&item.from!==actor&&item.status==='pending':item.from===actor&&item.owner===target&&item.status==='answered'&&item.replyRead===false);
  }
  /** 新问题和本人回答的未提交文字按账号隔离，刷新演示或重置后清除。 */
  function drafts() {
    const actor=P.state.actor;
    if(!P.state.questionDrafts[actor])P.state.questionDrafts[actor]={question:'',answers:{}};
    return P.state.questionDrafts[actor];
  }
  /** 重绘前保存当前账号的有效表单，已回复或重置前的旧表单不再回写。 */
  function captureDrafts() {
    document.querySelectorAll('#question-form,[data-question-answer]').forEach(form=>{
      if(form.draftState!==P.state || form.draftActor!==P.state.actor)return;
      if(form.id==='question-form')drafts().question=form.elements.question.value;
      else if(P.state.questions.some(item=>item.id===form.dataset.questionAnswer && item.owner===P.state.actor && item.status==='pending'))drafts().answers[form.dataset.questionAnswer]=form.elements.answer.value;
    });
  }
  /** 当前账号只能看到自己提出或需要自己回答的问题。 */
  function entries() {return P.state.questions.filter(item=>item.from===P.state.actor || item.owner===P.state.actor);}
  /** 首页数字只统计当前账号的真实问题，互斥分组，不把示例话题或累计回复冒充未读。 */
  function homeCounts() {
    const actor=P.state.actor,items=entries(),counts={total:items.length,pending:0,waiting:0,answered:0,replied:0};
    for(const item of items){
      if(item.status==='pending'){if(item.owner===actor)counts.pending++;else counts.waiting++;}
      else if(item.status==='answered'){if(item.from===actor)counts.answered++;else counts.replied++;}
    }
    return counts;
  }
  /** 原问题固定当时的媒体、章节或故事引用，私聊不会自动进入共同档案。 */
  function leave(text,storyId='',contentContext=null) {
    const ref=P.ContentChat.reference(contentContext),source=ref?P.ContentChat.resolve(ref):null;
    if(contentContext && !source)return P.toast('原资料暂未向你开放，请从可查看的内容重新留下问题。');
    const value=String(text).trim(),owner=source?.person || P.state.chatTarget || P.FamilyContext.current();
    if(!P.PEOPLE[owner]){P.toast('请先选择要了解的家人。');return;}
    if(owner===P.state.actor){P.toast('这是你本人的收件箱，可以查看和回复家人的问题。');return;}
    if(!value || value.length>QUESTION_LIMIT){P.toast(`请填写 1—${QUESTION_LIMIT} 字的问题。`);return;}
    if(!P.state.questions.some(item=>item.from===P.state.actor && item.owner===owner && item.text===value && item.status==='pending' && P.ContentChat.key(item.contentContext)===P.ContentChat.key(ref))){
      P.state.questions.push({id:P.nextId('question'),from:P.state.actor,owner,text:value,storyId:P.visibleStories().some(item=>item.id===storyId)?storyId:'',contentContext:ref,status:'pending',answer:'',replyRead:false,created:new Date().toLocaleDateString('zh-CN')});
    }
    P.render();P.toast('问题已保存，本人可在“家人问我的”中查看并回复。');
  }
  /** 回答表单只提供给问题的接收者，保留明确的本人回复标记。 */
  function card(item) {
    const canAnswer=item.owner===P.state.actor && item.status==='pending';
    const source=P.visibleStories().find(story=>story.id===item.storyId);
    const original=P.ContentChat.resolve(item.contentContext);
    const content=original?P.ContentChat.sourceButton(item.contentContext,'关联'+original.label+'：'+original.title):'';
    return `<article class="card question-card"><div class="row between"><strong>${e(P.PEOPLE[item.from].name)}的问题</strong>${t(item.status==='answered'?'本人已回复':'等待本人回复',item.status==='answered'?'':'warm')}</div><p class="story-paragraph">${e(item.text)}</p><p class="caption">${e(item.created)} · 留给 ${e(P.PEOPLE[item.owner].name)}</p>${content}${source?l('关联故事：'+e(source.title),'story/'+source.id):''}${item.status==='answered'?`<div class="note section"><strong>${e(P.PEOPLE[item.owner].name)} · 本人回复</strong><p style="white-space:pre-wrap">${e(item.answer)}</p><small>由本人手动填写，非数字人生成。</small></div>`:canAnswer?`<form class="section" id="question-answer-${e(item.id)}" data-question-answer="${e(item.id)}"><div class="form-field"><label for="answer-${e(item.id)}">补充你的回答</label><textarea id="answer-${e(item.id)}" name="answer" maxlength="${ANSWER_LIMIT}" required placeholder="慢慢写下你记得的经过…">${e(drafts().answers[item.id] || '')}</textarea></div><button class="btn" type="submit">回复这位家人</button></form>`:''}</article>`;
  }
  /** 本人只查看并回复收到的问题；访问家人时只展示留给当前人物的问题与提问表单。 */
  function view() {
    const self=viewingSelf(),actor=P.state.actor,target=P.state.chatTarget||P.FamilyContext.current();
    const items=entries().filter(item=>self?item.owner===actor&&item.from!==actor:item.from===actor&&item.owner===target);
    // 仅进入实际问答列表才标记当前提问者的已回复内容，消息总览不清除提醒。
    items.forEach(item=>{if(item.from===actor&&item.status==='answered')item.replyRead=true;});
    const form=self?'':`<form id="question-form" data-question-owner="${e(target)}" class="card section"><div class="form-field"><label for="new-question">你还想了解${e(P.PEOPLE[target]?.name||'这位家人')}的什么经历？</label><textarea id="new-question" name="question" maxlength="${QUESTION_LIMIT}" required>${e(drafts().question)}</textarea></div><button class="btn" type="submit">保存问题</button></form>`;
    return `<div class="page"><p class="eyebrow">当前账号 · ${e(P.PEOPLE[actor].name)}</p><h1 class="page-title">${title()}</h1><p class="page-subtitle">${self?'看看家人想了解什么，写下你的亲自回复。':'把没讲完的经历留下，等本人亲自回答。'}</p><div class="section stack">${items.length?[...items].reverse().map(card).join(''):`<div class="empty">${P.icon('chat')}<h2>暂时没有问题</h2><p>${self?'家人留下问题后，会在这里等你回答。':'可以从一段故事追问，也可以在下方写下新问题。'}</p></div>`}</div>${form}</div>`;
  }
  /** 事件路由仅在匹配收件箱动作或表单时接管。 */
  function handleAction(action,element) {
    if(action!=='leave-question')return false;
    const text=element.dataset.question || P.state.chatMessages.findLast(item=>item.type==='user')?.text || '';
    let context=null;
    try{if(element.dataset.contentContext)context=JSON.parse(element.dataset.contentContext);}catch{P.toast('这条问题的资料入口已失效，请重新打开原资料。');return true;}
    leave(text,element.dataset.storyId || '',context);return true;
  }
  /** 本人回复后立即成为可回看的回答；其它账号不能代写或覆盖。 */
  function submit(form) {
    if(form.id==='question-form'){
      if(form.draftState!==P.state||form.draftActor!==P.state.actor||form.dataset.questionOwner!==(P.state.chatTarget||P.FamilyContext.current())||viewingSelf())return true;
      captureDrafts();const text=String(new FormData(form).get('question') || '');
      if(text.trim() && text.trim().length<=QUESTION_LIMIT)form.elements.question.value='';
      leave(text);return true;
    }
    if(!form.dataset.questionAnswer)return false;
    captureDrafts();
    const item=P.state.questions.find(entry=>entry.id===form.dataset.questionAnswer && entry.owner===P.state.actor && entry.status==='pending');
    const answer=String(new FormData(form).get('answer') || '').trim();
    if(!item){P.toast('这条问题不属于当前账号的待回答内容。');return true;}
    if(!answer || answer.length>ANSWER_LIMIT){P.toast(`请填写 1—${ANSWER_LIMIT} 字的回答。`);return true;}
    item.answer=answer;item.status='answered';item.replyRead=false;delete drafts().answers[item.id];P.render();P.toast('本人回复已保存，提问家人可以查看。');return true;
  }
  P.QuestionInbox={homeCounts,view,leave,handleAction,submit,captureDrafts,viewingSelf,title,hasNotice};P.views.questions=view;
}
