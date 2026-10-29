/** 首页、人生、故事、对话与记忆空间视图。内容均为虚构演示材料。 */
'use strict';
{
  const P=window.App;
  const {icon:i,button:b,link:l,badge:t,avatar:a,escape:e}=P;
  /** 称呼随访问账号改变，本人和未知关系均不沿用固定“爸爸”。 */
  function archiveLabel() {
    const relation=P.relation(P.FamilyContext.current());
    return relation==='我'?'我的':relation==='家人'?P.PEOPLE.father.name+'的':relation+'的';
  }
  /** 首页仅呈现四段阅读内容，管理与工具从既有栏目进入。 */
  function home() {return P.FamilyHomeViews.render();}
  /** 人物档案统一展示资料，人生事件在传记内部按另一种方式浏览。 */
  function life() {return P.PersonArchive.view();}
  /** 故事详情保留事件时间、记录时间、来源与分享对象。 */
  function story() {
    const s=P.state;
    const item=P.visibleStories().find(x=>x.id===s.storyId);
    if (!item) {
      const exists=s.stories.some(story=>story.id===s.storyId);
      if (!exists) return `<div class="page"><div class="empty">${i('book')}<h2>没有找到这段记录</h2><p>这条记录不存在或已从当前演示中移除。可以返回人生档案继续查看。</p>${l('返回人生档案','life','btn')}</div></div>`;
      const waiting=(s.accessRequests || []).some(request=>request.actor===s.actor && request.storyId===s.storyId && ['pending','pending-owner'].includes(request.status));
      return `<div class="page"><div class="empty">${i('lock')}<h2>这段内容暂未向你开放</h2><p>${waiting?'查看申请已提交，等待记录本人决定。确认前不会展示这段内容。':'你可以向记录本人申请查看，也可以返回已分享的故事。'}</p>${b(waiting?'等待本人授权':'申请查看','request-access','btn',waiting?'disabled':'')}${l('返回人生档案','life','text-link full')}</div></div>`;
    }
    const saved=s.saved.includes(item.id),photo=P.FamilyHome.photo(item,item.subject);
    // 订单故事沿用设计稿场景插画并明确标注AI配图，不冒充档案照片或新增来源证据。
    const illustration=item.id==='first-order'?'<figure class="story-illustration"><img src="assets/zhumen/story-oral-scene.png" alt="老办公室电话，AI生成的口述故事配图"><figcaption>口述故事配图 · AI生成场景示例</figcaption></figure>':'';
    const cover=photo?`<img class="story-cover" src="${e(photo.poster)}" alt="${e(photo.title)}，${e(photo.sourceLabel)}">`:`${illustration}<p class="page caption">口述与文字记录 · ${e(item.source)}</p>`;
    return `<article class="story-detail"><div class="page">${b(i('back')+' 返回人生传记 · 按事件浏览','archive-events','text-link',`data-person="${item.commonWith||item.subject}"`)}<p class="story-year section">${e(item.date)}</p><h1 class="page-title">${e(item.title)}</h1><div class="row story-author">${a(item.author,'small')}<span class="caption">${P.PEOPLE[item.author]?.name || '家人'} · 记录于 ${e(item.recorded)}</span></div><div class="tags">${t(item.commonWith?(item.scope==='private'?'讲述者原稿':P.FamilyContext.inArchive(item,item.commonWith)?'对方已确认纳入':'讲述者记录 · 待对方确认'):item.pending?'待本人确认':'本人已确认')}${t(item.scope==='private'?'仅自己':item.scope==='selected'?'指定家人':'家庭可见','gray')}</div>${cover}<blockquote>${e(item.quote || item.text[0])}</blockquote>${item.text.map(p=>`<p class="story-paragraph">${e(p)}</p>`).join('')}<div class="source-block"><p>${i('source')} ${e(item.source)}</p><p class="caption">事件发生于 ${e(item.date)}，回忆记录于 ${e(item.recorded)}。</p>${b('查看原始记录 '+i('arrow'),'source','text-link',`data-id="${item.id}"`)}</div><div class="story-tools">${b(i('volume')+' 听示例朗读','read-transcript','btn secondary',`data-id="${item.id}"`)}${b(i('star')+(saved?' 已收藏':' 收藏'),'save-story','btn outline',`aria-pressed="${saved}"`)}</div><p class="caption">朗读使用系统声音，不是本人原始录音。</p>${P.FamilyContext.allowed(item.commonWith||item.subject,'digital')?b('围绕'+e(archiveLabel())+'这段经历继续问 '+i('chat'),'ask-story','btn full'):''}${P.PersonArchive.storyMaterials(item)}${familyPerspective(item)}${item.author===s.actor?b(i('share')+' 调整这段故事的分享范围','share-story','text-link full'):''}</div></article>`;
  }
  /** 另一位家人的叙述只关联对应事件，私密记录不附加虚构评论。 */
  function familyPerspective(item) {
    if(item.scope==='private' || item.subject!=='father')return '';
    const text=item.id==='first-order'?'<div class="note"><strong>林慧 · 家人讲述</strong><p>我记得他那天进门的时候，脸上一直带着笑。我们都觉得，日子有了新的盼头。</p></div>':'<p class="caption">同一件事，每个人也许记得不同的细节。</p>';
    return `<div class="section"><div class="section-heading"><h2>家人记得的另一面</h2></div>${text}${b('补充你记得的细节 '+i('plus'),'contribute-story','text-link',`data-id="${item.id}"`)}</div>`;
  }
  /** 来源按钮固定到各条回答；资料或实际引用的故事撤回后不继续展示历史正文。 */
  function messageView(msg) {
    if (msg.type==='user') return `<div class="message user"><p>${e(msg.text)}</p></div>`;
    if((msg.source&&!P.visibleStories().some(item=>item.id===msg.source&&P.FamilyContext.usable(item,P.state.chatTarget)))||!P.ContentChat.messageReadable(msg)||(msg.type==='corrected'&&!P.AnswerFeedback.readable(msg)))return '<div class="message assistant"><p>这条回答引用的资料暂未向你开放。</p></div>';
    const kind=msg.type==='inference'?'AI 推演':msg.type==='unknown'?'记录尚未覆盖':msg.sourceLabel || '据本人记录整理';
    const source=msg.contentSource?P.ContentChat.sourceButton(msg.contentSource,'回看这条回答的原内容'):'';
    const original=msg.type==='memory' && msg.source?b('查看原始记录 '+i('arrow'),'source','text-link',`data-id="${msg.source}"`):'';
    return `<div class="message assistant ${msg.type==='inference'?'inference':''}"><span class="message-label">${i(msg.type==='inference'?'spark':'source')}${e(kind)}</span><p>${e(msg.text)}</p>${msg.type==='inference'?'<small>结合已有经历生成，不代表本人此刻的真实想法。</small>':''}<div class="content-chat-links">${source}${original}</div>${P.AnswerFeedback.tools(msg)}${msg.type==='unknown'&&!P.QuestionInbox.viewingSelf()?b('把这个问题留给本人','leave-question','text-link',`data-question="${e(msg.question || '')}" data-story-id="${e(msg.storyId || '')}" ${msg.contentSource?'data-content-context="'+e(JSON.stringify(msg.contentSource))+'"':''}`):''}</div>`;
  }
  /** 聊天保留完整人物画面，问题和反馈由标题栏的消息入口统一进入。 */
  function chat() {return P.ContentChat.available(P.state.chatTarget)?P.DigitalHuman.view():P.FamilyContext.locked('digital',P.state.chatTarget);}
  /** 消息总览只聚合提醒，不标记结果已读；进入各自列表才清除家人未读状态。 */
  function chatMessages() {
    const questionDot=P.QuestionInbox.hasNotice()?'<span class="chat-task-dot" role="img" aria-label="有待回复问题或未读本人回复"></span>':'';
    const feedbackDot=P.AnswerFeedback.hasNotice()?'<span class="chat-task-dot" role="img" aria-label="有待核对反馈或未读处理结果"></span>':'';
    return `<div class="page"><p class="eyebrow">当前账号 · ${P.escape(P.PEOPLE[P.state.actor].name)}</p><h1 class="page-title">家人的消息，慢慢看</h1><p class="page-subtitle">家人的问题、本人回复与回答反馈，都在这里。</p><div class="chat-message-list">${l(i('chat')+'<span>'+P.QuestionInbox.title()+'</span>'+questionDot+i('arrow'),'questions','menu-row')}${l(i('edit')+'<span>纠正TA的回答</span>'+feedbackDot+i('arrow'),'corrections','menu-row')}</div>${l('返回叙话','chat','text-link full section')}</div>`;
  }
  /** 标题栏汇总各模块的提醒，不另存一份未读或待办状态。 */
  P.chatHasNotice=()=>P.QuestionInbox.hasNotice()||P.AnswerFeedback.hasNotice();
  P.views['chat-messages']=chatMessages;
  /** 三维记忆空间由专用模块负责模型、相机和物件故事。 */
  function space() { return P.MemorySpace.view(); }
  /** 将核心视图注册给静态原型路由。 */
  Object.assign(P.views,{home,life,story,chat,space});
  P.chatMessageView=messageView;
}


