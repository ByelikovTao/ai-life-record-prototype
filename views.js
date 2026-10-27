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
  /** 人生档案只聚合档案本人的经历，家人的个人记录留在各自账号。 */
  function archiveStories() {
    return P.visibleStories().filter(story=>P.FamilyContext.inArchive(story,P.FamilyContext.current())).sort((a,b)=>Number.parseInt(b.year,10)-Number.parseInt(a.year,10));
  }
  /** 首页影片直接进入其人物资料库中的可播放视频。 */
  function filmCard() {return P.PersonArchive.filmCard(P.FamilyContext.current());}
  /** 首页展示具体空间精选，记录未向当前账号分享时不推荐相关地点与物件。 */
  function spaceCard() {
    if(!P.FamilyContext.allowed(P.FamilyContext.current(),'space')||!archiveStories().some(story=>story.id==='old-home'))return '';
    return `<section class="section" data-home-section="space"><h2 class="home-section-title">回忆里的家</h2>${l(`<img src="assets/room.png" alt="老家的客厅，示意复原"><span><strong>老家的客厅</strong><small>1986年 · 记忆复原示例</small><em>从窗边书桌，了解离家前后的经历。</em></span>${i('arrow')}`,'space','memory-entry')}</section>`;
  }
  /** 影片是具体内容精选，只保留封面播放入口，不复制档案分类或未开放的影片提示。 */
  function filmSection() {
    return P.PersonArchive.videos(P.FamilyContext.current(),'film').length?`<section class="section hero-film" data-home-section="film"><h2 class="home-section-title">人生影片精选</h2>${filmCard()}</section>`:'';
  }
  /** 推荐问题与真实收件箱分开，问题只关联当前可查看的事件，自由聊天显式结束旧话题。 */
  function chatPrompt() {
    if(!P.ContentChat.available(P.FamilyContext.current()))return '';
    const stories=archiveStories(),topic=stories.find(story=>story.id==='first-order') || stories[0];
    const prompt=topic?b(i('chat')+' '+e(topic.id==='first-order'?'第一次创业时，你最担心什么？':'讲讲《'+topic.title+'》这段经历。'),topic.id==='first-order'?'ask-order':'home-ask-story','question-row',`data-id="${topic.id}"`):'';
    return `<section class="section home-chat-prompt" data-home-section="chat"><h2 class="home-section-title">和数字人聊聊</h2><p class="caption">${topic?'推荐话题，依据已向你分享的记录。':'可以先聊聊近况，资料未覆盖的往事需要本人补充。'}</p>${prompt}${b('聊聊近况 '+i('arrow'),'home-chat','text-link')}</section>`;
  }
  /** 真实待办与问题状态只汇总一次；已回复为累计状态，不声称存在未读通知。 */
  function homeInbox() {
    const pending=P.pendingCount(),counts=P.QuestionInbox.homeCounts();if(!pending && !counts.total)return '';
    const labels=[counts.pending?'待我回答 '+counts.pending:'',counts.waiting?'等待本人回复 '+counts.waiting:'',counts.answered?'我的提问已回复 '+counts.answered:'',counts.replied?'我已回答 '+counts.replied:''].filter(Boolean);
    return `<section class="section home-inbox" data-home-section="updates"><h2 class="home-section-title">我的待办与回复</h2>${pending?`<div class="home-inbox-row"><p>${pending} 条补充与查看申请待我核对</p>${b('核对内容','pending','text-link')}</div>`:''}${counts.total?`<div class="home-inbox-row"><p>${e(labels.join(' · '))}</p>${l('查看问题与回复','questions')}</div>`:''}</section>`;
  }
  /** 新材料与回答纠正有各自的处理入口，不混进旧补充弹层造成有数字却找不到任务。 */
  function featureInbox() {
    const materials=P.MaterialLibrary.pendingCount(),answers=P.AnswerFeedback.pendingCount();
    if(!materials&&!answers)return '';
    return `<section class="section home-inbox"><h2 class="home-section-title">新的核对事项</h2>${materials?l(`${materials} 份资料等待你核对`,'materials','text-link full'):''}${answers?l(`${answers} 条回答纠正等待你处理`,'corrections','text-link full'):''}</section>`;
  }
  /** 图谱以当前成员数量提示家庭连接，点击复用既有关系树；管理仍可从我的进入。 */
  function homeFamilyCard() {
    return `<section class="home-family-card" data-home-section="family">${b(`<span class="home-family-symbol">${i('tree')}</span><span class="home-family-copy"><strong>家庭图谱</strong><small>看看我们一家人，和彼此的连接</small><em>${P.state.members.length} 位家人 · 从关系树认识彼此</em></span>${i('arrow')}`,'home-family-tree','home-family-link')}</section>`;
  }
  /** 首页只预览两条人生事件，“全部”进入档案中的传记事件视图，不再泛称独立故事栏目。 */
  function eventPreview(byYear=false) {
    const stories=archiveStories();
    if(!byYear)stories.sort((left,right)=>String(right.recorded).localeCompare(String(left.recorded),'zh-CN',{numeric:true}));
    const items=stories.slice(0,2);
    return `<section class="section" data-home-section="events"><div class="section-heading"><h2>${byYear?'人生事件预览':'最近人生事件'}</h2>${b('查看全部事件 '+i('arrow'),'archive-events','text-link',`data-person="${P.FamilyContext.current()}"`)}</div><p class="caption">${byYear?'按事件发生年份排列。':'按记录更新时间排列。'} · ${e(P.PEOPLE[P.FamilyContext.current()]?.name||'家人')}的人生记录</p>${items.length?items.map(timelineEntry).join(''):'<p class="caption">暂无向你开放的人生事件，可以先留下共同回忆。</p>'}</section>`;
  }
  /** 首页始终先展示人生影片；方案仅调整影片之后的内容顺序，不再以交流或事件开场。 */
  function home() {
    const s=P.state;
    const heading=`<header class="home-intro"><p class="eyebrow">${e(P.PEOPLE[P.FamilyContext.current()]?.name||'家人')}的人生记录${s.actor==='father'?'':b('切换家人','family-select','text-link')}</p><h1 class="page-title">${s.actor==='father'?'把今天，也留成故事。':'今天，再了解家人一点。'}</h1><p class="home-tagline">当前账号：${e(P.PEOPLE[s.actor].name)} · 看一段，问一句，记下一刻。</p></header>`;
    const blocks={film:filmSection(),events:eventPreview(s.variant==='C'),chat:chatPrompt(),space:spaceCard(),record:recordPrompt()};
    const order=s.variant==='B'?['film','chat','events','space','record']:['film','events','chat','space','record'];
    const className=s.variant==='B'?'home-family':s.variant==='C'?'home-timeline':'home-story';
    return `<div class="page ${className}">${heading}${homeInbox()}${featureInbox()}${homeFamilyCard()}${order.map(id=>blocks[id]).join('')}</div>`;
  }
  /** 保留原记录提示样式，家人新建共同回忆；已有草稿继续原去向，不覆盖自己的记录。 */
  function recordPrompt() {
    const hasDraft=Boolean(P.state.draftSaved || P.state.record.text.trim());
    if(P.state.actor!=='father')return `<section class="record-prompt" data-home-section="record"><div>${i('edit')}<p>${hasDraft?'继续你的草稿':'留下我们的共同回忆'}<small>${e(P.PEOPLE[P.state.actor].name)} · ${hasDraft?'草稿仅自己可见':'先保存原稿，再请对方确认'}</small></p></div>${hasDraft?l('继续草稿 '+i('plus'),'record','text-link'):b('记下一刻 '+i('plus'),'family-common-new','text-link')}</section>`;
    return `<section class="record-prompt" data-home-section="record"><div>${i('edit')}<p>${hasDraft?'继续你的草稿':'为自己记录一刻'}<small>${e(P.PEOPLE[P.state.actor].name)} · 保存到我的记录${hasDraft?'，草稿仅自己可见。':'。'}</small></p></div>${l((hasDraft?'继续草稿 ':'记录一刻 ')+i('plus'),'record','text-link')}</section>`;
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
      const waiting=(s.accessRequests || []).some(request=>request.actor===s.actor && request.storyId===s.storyId && ['pending','pending-owner'].includes(request.status));
      return `<div class="page"><div class="empty">${i('lock')}<h2>这段内容暂未向你开放</h2><p>${waiting?'查看申请已提交，等待记录本人决定。确认前不会展示这段内容。':'你可以向记录本人申请查看，也可以返回已分享的故事。'}</p>${b(waiting?'等待本人授权':'申请查看','request-access','btn',waiting?'disabled':'')}${l('返回人生档案','life','text-link full')}</div></div>`;
    }
    const saved=s.saved.includes(item.id);
    return `<article class="story-detail"><img class="story-cover" src="assets/${item.image}.png" alt="${e(item.title)}，示意图"><div class="page">${b(i('back')+' 返回人生传记 · 按事件浏览','archive-events','text-link',`data-person="${item.commonWith||item.subject}"`)}<p class="story-year section">${e(item.date)}</p><h1 class="page-title">${e(item.title)}</h1><div class="row story-author">${a(item.author,'small')}<span class="caption">${P.PEOPLE[item.author]?.name || '家人'} · 记录于 ${e(item.recorded)}</span></div><div class="tags">${t(item.commonWith?(item.scope==='private'?'讲述者原稿':P.FamilyContext.inArchive(item,item.commonWith)?'对方已确认纳入':'讲述者记录 · 待对方确认'):item.pending?'待本人确认':'本人已确认')}${t(item.scope==='private'?'仅自己':item.scope==='selected'?'指定家人':'家庭可见','gray')}</div><blockquote>${e(item.quote || item.text[0])}</blockquote>${item.text.map(p=>`<p class="story-paragraph">${e(p)}</p>`).join('')}<div class="source-block"><p>${i('source')} ${e(item.source)}</p><p class="caption">事件发生于 ${e(item.date)}，回忆记录于 ${e(item.recorded)}。</p>${b('查看原始记录 '+i('arrow'),'source','text-link',`data-id="${item.id}"`)}</div><div class="story-tools">${b(i('volume')+' 听示例朗读','read-transcript','btn secondary',`data-id="${item.id}"`)}${b(i('star')+(saved?' 已收藏':' 收藏'),'save-story','btn outline',`aria-pressed="${saved}"`)}</div><p class="caption">朗读使用系统声音，不是本人原始录音。</p>${P.FamilyContext.allowed(item.commonWith||item.subject,'digital')?b('围绕'+e(archiveLabel())+'这段经历继续问 '+i('chat'),'ask-story','btn full'):''}${P.PersonArchive.storyMaterials(item)}${familyPerspective(item)}${item.author===s.actor?b(i('share')+' 调整这段故事的分享范围','share-story','text-link full'):''}</div></article>`;
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
    return `<div class="message assistant ${msg.type==='inference'?'inference':''}"><span class="message-label">${i(msg.type==='inference'?'spark':'source')}${e(kind)}</span><p>${e(msg.text)}</p>${msg.type==='inference'?'<small>结合已有经历生成，不代表本人此刻的真实想法。</small>':''}<div class="content-chat-links">${source}${original}</div>${P.AnswerFeedback.tools(msg)}${msg.type==='unknown'?b('把这个问题留给本人','leave-question','text-link',`data-question="${e(msg.question || '')}" data-story-id="${e(msg.storyId || '')}" ${msg.contentSource?'data-content-context="'+e(JSON.stringify(msg.contentSource))+'"':''}`):''}</div>`;
  }
  /** 三维人物、无声动作与文字问答由数字人体验页统一呈现。 */
  function chat() {return P.ContentChat.available(P.state.chatTarget)?P.DigitalHuman.view():P.FamilyContext.locked('digital',P.state.chatTarget);}
  /** 三维记忆空间由专用模块负责模型、相机和物件故事。 */
  function space() { return P.MemorySpace.view(); }
  /** 将核心视图注册给静态原型路由。 */
  Object.assign(P.views,{home,life,story,chat,space});
  P.chatMessageView=messageView;
}


