/** 首页、人生、故事、对话与记忆空间视图。内容均为虚构演示材料。 */
'use strict';
{
  const P=window.App;
  const {icon:i,button:b,link:l,badge:t,avatar:a,escape:e}=P;
  /** 称呼随访问账号改变，本人和未知关系均不沿用固定“爸爸”。 */
  function archiveLabel() {
    const relation=P.relation('father');
    return relation==='我'?'我的':relation==='家人'?P.PEOPLE.father.name+'的':relation+'的';
  }
  /** 人生档案只聚合档案本人的经历，家人的个人记录留在各自账号。 */
  function archiveStories() {
    return P.visibleStories().filter(story=>story.subject==='father').sort((a,b)=>Number.parseInt(b.year,10)-Number.parseInt(a.year,10));
  }
  /** 首页影片直接进入其人物资料库中的可播放视频。 */
  function filmCard() {return P.PersonArchive.filmCard('father');}
  /** 三种首页都保留人物资料库的显著入口。 */
  function archiveEntry() {return P.PersonArchive.entryCard('father');}
  /** 展示关联地点与场景复原标记。 */
  function spaceCard() {
    return l(`<img src="assets/room.png" alt="老家的客厅，示意复原"><span><strong>进入老家的三维空间</strong><small>1986年 · 依据回忆复原</small><em>那张书桌，那台收音机，<br>还有窗外的树。</em></span>${i('arrow')}`,'space','memory-entry');
  }
  /** 家人的提问可直接打开带上下文的数字人对话。 */
  function familyQuestion() {
    return `<div class="section"><div class="section-heading"><h2>家人的提问</h2>${l('看看家人 '+i('arrow'),'family')}</div>${b(`${a('xia')}<span>爸爸，第一次创业时，你最担心什么？</span>${i('arrow')}`,'ask-order','question-row')}<p class="caption">陈知夏的预置提问示例，点击体验围绕记录交流。</p></div>`;
  }
  /** 最近故事按记录时间排列，与按事件年份排列的人生时间线分别表达。 */
  function recentStories() {
    const recent=archiveStories().sort((a,b)=>String(b.recorded).localeCompare(String(a.recorded),'zh-CN',{numeric:true})).slice(0,2);
    return `<div class="section"><div class="section-heading"><h2>最近故事</h2>${b('全部 '+i('arrow'),'archive-events','text-link','data-person="father"')}</div>${recent.length?recent.map(timelineEntry).join(''):'<div class="empty"><p>暂时没有向你开放的故事。可以先留下自己的记录。</p></div>'}</div>`;
  }
  /** 三种首页保持同一视觉系统，只比较内容组织方式。 */
  function home() {
    const s=P.state;
    const pendingCount=P.pendingCount();
    const pending=pendingCount?`<div class="notice row">${i('mail')}<span class="grow">${pendingCount} 条补充与申请等待你确认</span>${b('查看','pending','text-link')}</div>`:'';
    const questions=P.QuestionInbox?.summary() || '';
    if (s.variant==='B') return `<div class="page home-family">${pending}${questions}<p class="eyebrow">一家人的故事，还在继续</p><h1 class="page-title">今天，也想听你说。</h1><p class="page-subtitle">从家人的一个问题，开始一段新的回忆。</p><div class="family-orbit">${a('father','large')}<span class="orbit-line"></span>${a('mother')}<span class="orbit-line"></span>${a('xia')}</div>${archiveEntry()}${familyQuestion()}<div class="section"><div class="section-heading"><h2>一起看过的时光</h2>${l('人生档案','life')}</div>${filmCard()}</div>${recentStories()}<div class="section">${spaceCard()}</div>${recordPrompt()}</div>`;
    if (s.variant==='C') return `<div class="page home-timeline">${pending}${questions}<p class="eyebrow">陈远山 · 人生片段</p><h1 class="page-title">把一生，<br>慢慢讲给家人。</h1><div class="year-feature"><span>1963</span><i></i><span>2026</span></div>${archiveEntry()}${recentStories()}<div class="section"><div class="section-heading"><h2>一部影片，回看走过的路</h2></div>${filmCard()}</div>${familyQuestion()}<div class="section">${spaceCard()}</div>${recordPrompt()}</div>`;
    return `<div class="page home-story">${pending}${questions}<h1 class="page-title">把日子，留成故事。</h1><p class="home-tagline">让爱与时光，都有迹可循。</p><div class="hero-film">${filmCard()}</div>${archiveEntry()}${recentStories()}${familyQuestion()}<div class="section"><div class="section-heading"><h2>走进回忆中的家</h2></div>${spaceCard()}</div>${recordPrompt()}</div>`;
  }
  /** 记录提示以具体行动为入口，不把首页变成功能九宫格。 */
  function recordPrompt() {
    const hasDraft=Boolean(P.state.draftSaved || P.state.record.text.trim());
    return `<div class="record-prompt"><div>${i('mic')}<p>${hasDraft?'继续写上次的回忆？':'今天，想留下一件什么事？'}<small>${hasDraft?'尚未提交的文字仍保留在当前账号。':'一句话，也值得被记住。'}</small></p></div>${l((hasDraft?'继续记录 ':'记录一刻 ')+i('plus'),'record','text-link')}</div>`;
  }
  /** 时间线条目通过事件组织媒体，私密内容仅在获授权时进入列表。 */
  function timelineEntry(story) {
    return `<article class="timeline-entry"><div class="timeline-year">${e(story.year)}</div><div class="timeline-card">${l(`<img src="assets/${story.image}.png" alt="${e(story.title)}，示意图片"><div class="timeline-copy"><div class="tags">${t(story.category,'gray')}${story.scope==='private'?t('仅自己','warm'):''}</div><h2>${e(story.title)}</h2><p>${e(story.quote || story.text[0])}</p><div class="caption">${P.PEOPLE[story.author]?.name || '家人'} · ${e(story.duration || '文字记录')}</div></div>`,'story/'+story.id,'timeline-button')}</div></article>`;
  }
  /** 人物档案统一展示资料，人生事件在传记内部按另一种方式浏览。 */
  function life() {return P.PersonArchive.view();}
  /** 故事详情保留事件时间、记录时间、来源与分享对象。 */
  function story() {
    const s=P.state;
    const item=P.visibleStories().find(x=>x.id===s.storyId);
    if (!item) {
      const exists=s.stories.some(story=>story.id===s.storyId);
      if (!exists) return `<div class="page"><div class="empty">${i('book')}<h2>没有找到这段记录</h2><p>这条记录不存在或已从当前演示中移除。可以返回人生档案继续查看。</p>${l('返回人生档案','life','btn')}</div></div>`;
      const waiting=(s.accessRequests || []).some(request=>request.actor===s.actor && request.storyId===s.storyId && request.status==='pending');
      return `<div class="page"><div class="empty">${i('lock')}<h2>这段内容暂未向你开放</h2><p>${waiting?'查看申请已提交，等待记录本人决定。确认前不会展示这段内容。':'你可以向记录本人申请查看，也可以返回已分享的故事。'}</p>${b(waiting?'等待本人授权':'申请查看','request-access','btn',waiting?'disabled':'')}${l('返回人生档案','life','text-link full')}</div></div>`;
    }
    const saved=s.saved.includes(item.id);
    return `<article class="story-detail"><img class="story-cover" src="assets/${item.image}.png" alt="${e(item.title)}，示意图"><div class="page">${b(i('back')+' 返回人生传记 · 按事件浏览','archive-events','text-link',`data-person="${item.subject}"`)}<p class="story-year section">${e(item.date)}</p><h1 class="page-title">${e(item.title)}</h1><div class="row story-author">${a(item.author,'small')}<span class="caption">${P.PEOPLE[item.author]?.name || '家人'} · 记录于 ${e(item.recorded)}</span></div><div class="tags">${t(item.pending?'待本人确认':'本人已确认')}${t(item.scope==='private'?'仅自己':item.scope==='selected'?'指定家人':'家庭可见','gray')}</div><blockquote>${e(item.quote || item.text[0])}</blockquote>${item.text.map(p=>`<p class="story-paragraph">${e(p)}</p>`).join('')}<div class="source-block"><p>${i('source')} ${e(item.source)}</p><p class="caption">事件发生于 ${e(item.date)}，回忆记录于 ${e(item.recorded)}。</p>${b('查看原始记录 '+i('arrow'),'source','text-link',`data-id="${item.id}"`)}</div><div class="story-tools">${b(i('volume')+' 听示例朗读','read-transcript','btn secondary',`data-id="${item.id}"`)}${b(i('star')+(saved?' 已收藏':' 收藏'),'save-story','btn outline',`aria-pressed="${saved}"`)}</div><p class="caption">朗读使用系统声音，不是本人原始录音。</p>${item.subject==='father'?b('围绕'+e(archiveLabel())+'这段经历继续问 '+i('chat'),'ask-story','btn full'):''}${P.PersonArchive.storyMaterials(item)}${familyPerspective(item)}${item.author===s.actor?b(i('share')+' 调整这段故事的分享范围','share-story','text-link full'):''}</div></article>`;
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
    if(!P.ContentChat.messageReadable(msg))return '<div class="message assistant"><p>这条回答引用的资料暂未向你开放。</p></div>';
    const kind=msg.type==='inference'?'AI 推演':msg.type==='unknown'?'记录尚未覆盖':msg.sourceLabel || '据本人记录整理';
    const source=msg.contentSource?P.ContentChat.sourceButton(msg.contentSource,'回看这条回答的原内容'):'';
    const original=msg.type==='memory' && msg.source?b('查看原始记录 '+i('arrow'),'source','text-link',`data-id="${msg.source}"`):'';
    return `<div class="message assistant ${msg.type==='inference'?'inference':''}"><span class="message-label">${i(msg.type==='inference'?'spark':'source')}${e(kind)}</span><p>${e(msg.text)}</p>${msg.type==='inference'?'<small>结合已有经历生成，不代表本人此刻的真实想法。</small>':''}<div class="content-chat-links">${source}${original}</div>${msg.type==='unknown'?b('把这个问题留给本人','leave-question','text-link',`data-question="${e(msg.question || '')}" data-story-id="${e(msg.storyId || '')}" ${msg.contentSource?'data-content-context="'+e(JSON.stringify(msg.contentSource))+'"':''}`):''}</div>`;
  }
  /** 三维人物、无声动作与文字问答由数字人体验页统一呈现。 */
  function chat() { return P.DigitalHuman.view(); }
  /** 三维记忆空间由专用模块负责模型、相机和物件故事。 */
  function space() { return P.MemorySpace.view(); }
  /** 将核心视图注册给静态原型路由。 */
  Object.assign(P.views,{home,life,story,chat,space});
  P.chatMessageView=messageView;
}


