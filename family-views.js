/** 家庭关系、记录、个人中心与会员页面；收费和授权仅作演示。 */
'use strict';
{
  const P=window.App;
  const {icon:i,button:b,link:l,badge:t,avatar:a,escape:e}=P;
  /** 称呼只来自已知示例关系，viewer 是称呼的观察者；关系不明时使用中性称呼。 */
  function relation(id,viewer=P.state.actor) {
    if(id===viewer)return '我';
    const known={father:{xia:'女儿',mother:'妻子',grandpa:'父亲',nian:'孙女'},mother:{father:'丈夫',xia:'女儿',grandpa:'公公',nian:'孙女'},grandpa:{father:'儿子',mother:'儿媳',xia:'孙女',nian:'曾孙女'},xia:{father:'爸爸',mother:'妈妈',grandpa:'爷爷',nian:'侄女'},nian:{father:'爷爷',mother:'奶奶',grandpa:'曾祖父',xia:'姑姑'}};
    if(known[viewer]?.[id])return known[viewer][id];
    if(viewer==='father')return P.PEOPLE[id]?.relation || '家人';
    if(id==='father')return {儿子:'爸爸',女儿:'爸爸',孙子:'爷爷',孙女:'爷爷',妻子:'丈夫'}[P.PEOPLE[viewer]?.relation] || '家人';
    return '家人';
  }
  /** 家人列表只显示基本身份，不根据关系开放私人资料。 */
  function memberRow(id) {
    const person=P.PEOPLE[id];
    const recorded=id==='grandpa';
    const claimed=Boolean(P.state.accounts[id]);
    return b(`${a(id)}<span class="grow"><strong>${e(person.name)} <small>${e(relation(id))}</small></strong><em>${recorded?'历史人物 · 家人记载':id==='father'?'人生记录与数字人已建立':claimed?'独立账号 · 参与家庭记录':'关系已记录 · 等待本人认领'}</em></span>${t(recorded?'家人记载':claimed?'已认领':'待认领',recorded||!claimed?'gray':'')}${i('arrow')}`,'person','member-row',`data-id="${id}"`);
  }
  /** 关系树和列表共用同一组成员，复杂关系保留列表入口。 */
  function family() {
    const s=P.state;
    const tree=s.familyTab==='关系树'?P.FamilyTree.view():'';
    const pending=P.pendingCount();
    const ownAdditions=s.pending.filter(item=>item.author===s.actor);
    const additionStatus=ownAdditions.length?`<div class="section stack"><div class="section-heading"><h2>我提交的补充</h2></div>${ownAdditions.map(item=>`<div class="card"><h3 class="card-title">${e(item.title)}</h3><p class="caption">${item.status==='returned'?'本人建议更正':'等待本人核对'}</p>${item.feedback?`<p>${e(item.feedback)}</p>`:''}${item.status==='returned'?b('更正后再次提交','edit-pending','btn secondary compact',`data-id="${e(item.id)}"`):'<p class="caption">尚未进入已确认的人生档案。</p>'}</div>`).join('')}</div>`:'';
    const invitations=s.invitations.length?`<div class="section"><div class="section-heading"><h2>家庭邀请</h2></div>${s.invitations.map((x,index)=>`<div class="invitation-row"><div class="grow"><strong>${e(x.name)}</strong><p class="caption">${e(x.relation)} · ${x.status==='accepted'?'已确认加入':x.status==='revoked'?'邀请已撤回':'等待本人核对'}</p>${x.correctionNote?`<p class="caption">${e(x.correctionNote)}</p>`:''}</div>${x.status==='pending'?b('查看邀请','preview-invite','text-link',`data-index="${index}"`)+(s.actor==='father'?b('更正信息','edit-invite','text-link',`data-id="${x.id}"`)+b('撤回','revoke-invite','text-link',`data-id="${x.id}"`):''):t(x.status==='accepted'?'已加入':'已撤回','gray')}</div>`).join('')}</div>`:'';
    return `<div class="page"><h1 class="page-title">一家人的故事</h1><p class="page-subtitle">知道彼此从哪里来，也一起留下新的回忆。</p>${pending?`<div class="notice row"><span class="grow">${pending} 条补充或查看申请等待你核对</span>${b('查看','pending','text-link')}</div>`:''}<div class="family-summary"><div class="avatar-stack">${a('father')}${a('mother')}${a('xia')}</div><span>${s.members.length} 位家人 · 共同守护</span></div><div class="tabs">${b(i('list')+' 家人列表','family-tab',s.familyTab==='列表'?'active':'', 'data-value="列表"')}${b(i('tree')+' 关系树','family-tab',s.familyTab==='关系树'?'active':'','data-value="关系树"')}</div>${s.familyTab==='关系树'?tree:`<div class="member-list">${s.members.map(memberRow).join('')}</div>`}<div class="family-actions">${b(i('plus')+(s.actor==='father'?' 邀请家人':' 请管理人邀请家人'),'invite','btn full')}<p class="caption">加入家庭后，按本人设置的范围查看和参与。</p></div><div class="section">${l(i('chat')+' 家人的问题 '+i('arrow'),'questions','btn secondary full')}<p class="caption">看看家人想了解什么，也可以继续补充相关经历。</p></div>${additionStatus}${invitations}<div class="section"><div class="section-heading"><h2>我们共同经历的事</h2></div>${l(`<img src="assets/family.png" alt="家庭共同生活，示意图"><span><strong>今年春节，全家又坐在一起</strong><small>3 位家人的共同回忆</small></span>${i('arrow')}`,'story/spring','memory-entry')}</div></div>`;
  }
  /** 分享名单由当前真实成员生成，同一字段可传递多个指定家人。 */
  function shareViewerOptions(selected=[]) {
    const members=P.state.members.filter(id=>id!==P.state.actor && P.PEOPLE[id]);
    return `<fieldset class="share-viewers"><legend>指定家人时，请勾选可查看的人</legend>${members.map(id=>`<label class="check-row"><input type="checkbox" name="viewers" value="${e(id)}" ${selected.includes(id)?'checked':''}><span>${e(P.PEOPLE[id].name)}<small>${e(relation(id))}</small></span></label>`).join('')}<p class="caption">仅在分享范围为“指定家人”时使用这份名单；可以选择多位家人。</p></fieldset>`;
  }
  /** 录制支持状态模拟和真实文字输入，结束录制不会直接向家人发布。 */
  function record() {
    const r=P.state.record;
    const context=P.visibleStories().find(story=>story.id===r.storyId);
    const related=r.storyId?`<div class="record-context"><span>关联故事</span><strong>${e(context?.title || '当前未获授权的故事')}</strong>${context?l('回看原故事','story/'+context.id):''}</div>`:'';
    return `<div class="page"><p class="eyebrow">一句话，也值得被记住</p><h1 class="page-title">今天，想讲点什么？</h1><p class="page-subtitle">可以从一张照片、一件小事，或家人的一个问题开始。</p><div class="recording-card"><div class="record-orbit ${r.recording&&!r.paused?'recording':''}">${i('mic')}</div><p id="record-time" class="record-time">${P.duration(r.seconds)}</p><p id="record-status" class="caption">${r.recording?(r.paused?'已暂停 · 录音演示':'正在录制 · 录音演示'):'点击开始，试着讲一段回忆'}</p><div class="record-controls">${b(i(r.recording?(r.paused?'play':'pause'):'mic')+(r.recording?(r.paused?' 继续':' 暂停'):' 开始录音'),'record-toggle','btn')}${r.recording?b(i('stop')+' 结束','record-stop','btn outline'):''}</div><p class="caption demo-note">原型录音为状态演示，可直接在下方输入文字。</p></div><form id="record-form"><input type="hidden" name="storyId" value="${e(r.storyId || '')}">${related}<div class="form-field"><label for="record-kind">这次想记录谁的经历？</label><select id="record-kind" name="kind"><option value="own" ${r.kind!=='contribution'?'selected':''}>记录我自己的人生</option><option value="contribution" ${r.kind==='contribution'?'selected':''}>补充陈远山的经历，提交本人核对</option></select><p class="caption">自己的记录由你确认；补充他人的经历，会保留你的讲述者身份。</p></div><div class="form-field"><label for="record-title">给这段回忆起个名字</label><input id="record-title" name="title" maxlength="48" placeholder="例如：第一次离开家去工作" value="${e(r.title)}"></div><div class="form-field"><label for="record-year">这件事大约发生在哪一年？</label><input id="record-year" name="eventYear" type="number" inputmode="numeric" min="1000" max="${new Date().getFullYear()}" step="1" value="${e(r.eventYear)}" required><p class="caption">人生时间线按这年归档，今天的记录日期会另行保留。</p></div><div class="form-field"><label for="record-text">想留下的话</label><textarea id="record-text" name="text" placeholder="慢慢说，也可以直接写下来…">${e(r.text)}</textarea></div><div class="record-form-buttons"><button class="btn secondary" type="submit" name="intent" value="draft">保存草稿</button><button class="btn" type="submit" name="intent" value="review">${P.account().plan==='basic'?'查看并确认':'整理并查看'}</button></div></form></div>`;
  }
  /** 内容确认将生成方式、提供者和分享范围分别显示。 */
  function review() {
    const r=P.state.record,contribution=r.kind==='contribution' && P.state.actor!=='father';
    if(!r.text.trim())return `<div class="page empty">${i('book')}<h2>还没有可以确认的记录</h2><p>先写下想留下的话，再核对内容与分享范围。</p>${l('开始记录','record','btn')}</div>`;
    return `<div class="page"><p class="eyebrow">在留下之前，再看一遍</p><h1 class="page-title">确认这段记录</h1><div class="tags">${t(P.account().plan==='basic'?'原文记录':'AI 整理示例')}${t(contribution?'提交本人核对':'由我确认','warm')}</div><div class="review-story card section"><h2 class="serif">${e(r.title || '今天的一段回忆')}</h2><p class="caption">事情发生于 ${e(r.eventYear)} 年 · 记录于今天</p><p>${e(r.text || '今天和家人一起翻看旧照片，想起了许多平时没有讲完的事。这段经历，我想慢慢留下来。')}</p></div>${l(i('edit')+' 回去更正内容','record')}<form id="publish-form" class="section"><div class="form-field"><label for="share-scope">确认后，这段故事想分享给谁？</label><select id="share-scope" name="scope"><option value="private" ${r.scope==='private'?'selected':''}>仅自己，先保存在我的记录</option><option value="selected" ${r.scope==='selected'?'selected':''}>指定家人，在下方选择</option><option value="family" ${r.scope==='family'?'selected':''}>当前家庭中的家人</option></select><p class="caption">新加入的成员不会自动获得本次分享权限。</p></div>${shareViewerOptions(r.viewers || [])}<label class="check-row"><input name="confirmed" type="checkbox" required><span>我已核对内容，并确认上述分享范围。${contribution?'本次补充内容将提交陈远山本人查看和核对。':''}</span></label><button class="btn full" type="submit">${contribution?'提交陈远山核对':'确认并保存自己的记录'}</button></form><p class="caption section">${contribution?'本人确认后，补充才会进入人生档案，保留你的讲述者身份，并按所选范围保存。':'这段记录由你自己确认和决定分享范围，不需要家庭管理人代为审批。'}</p></div>`;
  }
  /** 个人中心区分账号会员、人物数字人及家庭成员身份。 */
  function profile() {
    const s=P.state, account=P.account(), plan=P.PLANS[account.plan], person=P.PEOPLE[s.actor];
    const remaining=P.remainingMinutes(),savedCount=P.visibleStories().filter(story=>s.saved.includes(story.id)).length;
    return `<div class="page"><div class="profile-heading">${a(s.actor,'large')}<div><h1>${e(person.name)}</h1><p class="caption">${s.actor==='father'?'家庭管理人 · 本人记录':'受邀家人 · 独立账号'}</p></div>${l(i('settings'),'settings','icon-button')}</div><div class="membership-summary"><div class="row between"><div><p class="caption">当前账号</p><h2>${plan.name}</h2></div>${i('book')}</div><p>${account.plan==='basic'?'家人已经把故事分享给你。':'记录新的故事，也继续与家人交流。'}</p>${l(account.plan==='basic'?'了解会员权益 '+i('arrow'):'查看我的权益 '+i('arrow'),'membership','btn light compact')}</div><div class="quota-grid"><div><strong>${Math.max(0,remaining)}<small> 分钟</small></strong><span>${account.plan==='basic'?'个人体验余额':'个人语音余额'}</span></div><div><strong>${plan.space || '—'}<small> GB</small></strong><span>账号会员空间</span></div></div><div class="profile-menu">${profileMenu('person','我的人物档案','life/'+s.actor)}${profileMenu('book','我的记录','my-records')}${profileMenu('star',`我的收藏 · ${savedCount}`,'saved')}${profileMenu('family','家庭与关系','family')}${profileMenu('share','分享与可见范围','settings')}${profileMenu('download','导出我的记录','export')}</div>${s.draftSaved?`<div class="notice section">有一份还没写完的回忆。${l('继续编辑','record')}</div>`:''}<div class="note section"><strong>数字人服务</strong><p>${account.hasDigital?'本人数字人的年度服务已开通。内容与分享仍由本人确认。':account.setupOrdered?'首次数字人建档服务已预约，待本人确认素材与表达。当前可以继续记录自己的生活。':'你的账号尚未建立自己的数字人。查看和交流家人的数字人仍需相应授权。'}</p></div></div>`;
  }
  /** 个人中心的菜单保持统一的图标和文字触达区域。 */
  function profileMenu(icon, text, route) {
    const action=route==='export'?'data-action="export"':`data-nav="${route}"`;
    return `<button class="menu-row" type="button" ${action}>${i(icon)}<span>${text}</span>${i('arrow')}</button>`;
  }
  /** 会员页面展示试报价，包含服务和一次性费用分别说明。 */
  function membership() {
    const account=P.account();
    const planCard=(id,title,subtitle,features)=>`<div class="plan-card ${id==='legacy'?'featured':''}"><div class="row between"><h2>${title}</h2>${account.plan===id?t('当前会员'):id==='legacy'?t('拥有自己的数字人','warm'):''}</div><p class="caption">${subtitle}</p><div class="plan-price"><strong>¥${P.PLANS[id].price.toLocaleString()}</strong><span>／账号／年</span></div><ul>${features.map(x=>`<li>${i('check')}<span>${x}</span></li>`).join('')}</ul>${b(account.plan===id?'已开通':account.plan==='legacy'?'下一年度可变更':`选择${title}`,'choose-plan','btn full '+(id==='legacy'?'':'outline'),`data-plan="${id}" ${account.plan===id?'disabled':''}`)}</div>`;
    return `<div class="page membership-page"><p class="eyebrow">给故事一个继续生长的地方</p><h1 class="page-title">属于你的，<br>人生记录。</h1><p class="page-subtitle">会员绑定个人账号。加入多个家庭，也只订阅一份。</p><div class="current-entitlement"><span>${i('check')} 已有权益</span><p>家庭邀请、获授权作品的查看及基础关系功能。${account.setupIncluded?'当前视频订单已含本人基础建档，无须重复购买。':''}</p></div>${planCard('personal','个人会员','记录自己的生活，与获授权的家人数字人交流。',['每年 60 段口述整理，单段至多 10 分钟','600 分钟个人语音交流额度','10 GB 个人资料空间'])}${planCard('legacy','个人传承会员','在记录与交流之外，保留自己的声音与经历。',['1 位本人数字人的年度服务与资料更新','每年 120 段口述整理，单段至多 10 分钟','2,400 分钟个人语音额度、50 GB 空间','1 份标准模板年度电子家庭回忆册'])}<div class="note"><strong>首次建档，一次说明清楚</strong><p>首次数字人基础建档试价 ¥2,000／人物；已在视频项目中包含的工作不再收费。亲属关系与付费本身不扩大内容访问权限。</p></div><p class="caption section">价格、额度与权益均为待验证的候选方案。此原型不进行真实支付，也不会自动续费。</p></div>`;
  }
  /** 邀请接收者分别核对家庭加入、人物认领和关系声明。 */
  function invitation() {
    const item=P.state.invitations[P.state.inviteIndex || 0];
    if (!item) return `<div class="page empty"><h2>暂无需要核对的邀请</h2>${l('回到家庭','family','btn')}</div>`;
    if (item.status!=='pending') return `<div class="page empty">${i('check')}<h2>${item.status==='accepted'?'已加入陈家的回忆':'这份邀请已撤回'}</h2><p>人物与关系状态已更新，资料仍按授权范围分享。</p>${l('看看家里的故事','home','btn')}</div>`;
    if(item.correctionNote)return `<div class="page empty">${i('edit')}<h2>邀请信息等待更正</h2><p>${e(item.correctionNote)}</p><p class="caption">更正前不会加入家庭、认领人物或确认关系。</p>${P.state.actor==='father'?b('以邀请人身份更正信息','edit-invite','btn',`data-id="${item.id}"`):''}${l('回到家庭查看进度','family','text-link full')}</div>`;
    return `<div class="page"><div class="invite-hero">${a('father','large')}<p class="caption">陈远山邀请你</p><h1 class="page-title">加入陈家的回忆</h1><p>一起听故事，也留下你的那一份。</p></div><div class="card section"><p class="caption">这份邀请对应的人物</p><h2 class="card-title">${e(item.name)}</h2><p class="small muted">邀请人填写的关系：你是陈远山的${e(item.relation)}</p>${t('待本人核对','warm')}</div><form id="accept-invite-form" class="section"><input type="hidden" name="inviteId" value="${e(item.id)}"><label class="check-row"><input type="checkbox" name="join" required><span>我愿意加入“陈家的回忆”。</span></label><label class="check-row"><input type="checkbox" name="claim" required><span>族谱中的“${e(item.name)}”是我。</span></label><label class="check-row"><input type="checkbox" name="relation" required><span>我确认上述亲属关系。</span></label><button type="submit" class="btn full" style="margin-top:14px">确认加入</button></form>${b('信息有误，需要更正','correct-invite','text-link full')}<p class="caption section">加入后仅能查看已向你开放的内容，不代表授权分享你的全部资料。</p></div>`;
  }
  /** 设置页面只列出本人可控制的分享内容。 */
  function settings() {
    const owned=P.state.stories.filter(x=>x.author===P.state.actor);
    const count=P.pendingCount();
    return `<div class="page"><h1 class="page-title">分享，由你决定。</h1><p class="page-subtitle">亲属关系帮助我们认识彼此。每一段故事的分享范围，仍由本人选择。</p>${count?`<div class="notice row"><span class="grow">${count} 条内容等待你核对</span>${b('查看补充与申请','pending','text-link')}</div>`:''}<div class="section stack">${owned.length?owned.map(x=>`<div class="card"><h2 class="card-title">${e(x.title)}</h2><div class="row between" style="margin-top:12px">${t(x.scope==='private'?'仅自己':x.scope==='selected'?'指定家人':'当前家庭','gray')}${b('调整范围','share-owned','text-link',`data-id="${x.id}"`)}</div></div>`).join(''):`<div class="empty">${i('book')}<p>你还没有创建自己的记录。</p>${l('记录一刻','record','btn')}</div>`}</div><div class="section"><div class="section-heading"><h2>阅读偏好</h2></div>${b(i('book')+(P.state.fontLarge?' 使用标准字号':' 使用大字号'),'toggle-font','btn secondary full')}</div><div class="note section">你的私聊不因亲属绑定而向其他家人公开。管理人只能在获授权的范围内协助。</div></div>`;
  }
  /** 收藏页只读取仍然获授权的内容。 */
  function saved() {
    const entries=P.visibleStories().filter(x=>P.state.saved.includes(x.id));
    return `<div class="page"><h1 class="page-title">想再听一次的故事</h1><p class="page-subtitle">把打动你的片段，留在这里。</p><div class="section">${entries.length?entries.map(x=>l(`<img src="assets/${x.image}.png" alt="故事示意图"><span><strong>${e(x.title)}</strong><small>${x.year}年 · ${e(x.category)}</small></span>${i('arrow')}`,'story/'+x.id,'memory-entry saved-entry')).join(''):`<div class="empty">${i('star')}<h2>还没有收藏</h2><p>打开一段故事，点一下“收藏”，下次就容易找到了。</p>${l('去看看人生故事','life','btn')}</div>`}</div></div>`;
  }
  /** 当前账号自己的记录与父亲的人生档案使用独立标题和入口。 */
  function ownRecords() {
    const items=P.state.stories.filter(x=>x.author===P.state.actor);
    return `<div class="page"><p class="eyebrow">当前账号 · ${e(P.PEOPLE[P.state.actor].name)}</p><h1 class="page-title">我留下的故事</h1><p class="page-subtitle">这些记录由你提供，可逐条决定分享给谁。</p><div class="section stack">${items.length?items.map(x=>`<div class="card">${l(`<strong>${e(x.title)}</strong>${i('arrow')}`,'story/'+x.id,'text-link full between')}<p class="caption">${e(x.recorded)} · ${x.scope==='private'?'仅自己':x.scope==='selected'?'指定家人':'家庭可见'}</p></div>`).join(''):`<div class="empty">${i('book')}<h2>从今天的一件小事开始</h2><p>你自己的生活，也值得留给家人。</p></div>`}</div><div class="section">${l(i('plus')+' 记录一刻','record','btn full')}</div></div>`;
  }
  /** 首次进入明确视频客户与受邀家人两条路径。 */
  function welcome() {
    return `<div class="welcome-page"><img src="assets/family.png" alt="一家人的日常，示例影像"><div class="page"><p class="eyebrow">AI 人生记录</p><h1 class="page-title">把人生，<br>慢慢讲给家人。</h1><p class="page-subtitle">故事、声音，以及生活过的地方。<br>让家人持续了解你。</p><div class="card section"><h2 class="card-title">已经完成视频服务</h2><p class="caption">关联已交付的人生影片，开通家庭空间。</p>${b('进入我的人生档案','enter-owner','btn full')}</div><div class="card section"><h2 class="card-title">收到家人的邀请</h2><p class="caption">核对身份和关系，免费加入家庭。</p>${b('以受邀家人身份进入','enter-family','btn secondary full')}</div>${b('了解视频服务与开通条件','video-service','text-link full')}<p class="caption section">当前开通页使用已交付订单与已受邀账号的示例，不进行真实注册或验证。</p></div></div>`;
  }
  Object.assign(P.views,{family,record,review,profile,membership,invitation,settings,saved,welcome,'my-records':ownRecords});
  P.relation=relation;
  P.shareViewerOptions=shareViewerOptions;
}


