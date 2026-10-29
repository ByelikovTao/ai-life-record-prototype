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
    return `<div class="page"><h1 class="page-title">一家人的故事</h1><p class="page-subtitle">知道彼此从哪里来，也一起留下新的回忆。</p>${pending?`<div class="notice row"><span class="grow">${pending} 条补充或查看申请等待你核对</span>${b('查看','pending','text-link')}</div>`:''}<div class="feature-entry">${l(i('book')+' 我们的共同回忆','common-memories','btn secondary')}</div><div class="family-summary"><div class="avatar-stack">${a('father')}${a('mother')}${a('xia')}</div><span>${s.members.length} 位家人 · 共同守护</span></div><div class="tabs">${b(i('list')+' 家人列表','family-tab',s.familyTab==='列表'?'active':'', 'data-value="列表"')}${b(i('tree')+' 关系树','family-tab',s.familyTab==='关系树'?'active':'','data-value="关系树"')}</div>${s.familyTab==='关系树'?tree:`<div class="member-list">${s.members.map(memberRow).join('')}</div>`}<div class="family-actions">${b(i('plus')+(s.actor==='father'?' 邀请家人':' 请管理人邀请家人'),'invite','btn full')}<p class="caption">加入家庭后，按本人设置的范围查看和参与。</p></div><div class="section">${l(i('chat')+' '+P.QuestionInbox.title()+' '+i('arrow'),'questions','btn secondary full')}<p class="caption">看看家人想了解什么，也可以继续补充相关经历。</p></div>${additionStatus}${invitations}<div class="section"><div class="section-heading"><h2>我们共同经历的事</h2></div>${l(`<img src="assets/family.png" alt="家庭共同生活，示意图"><span><strong>今年春节，全家又坐在一起</strong><small>3 位家人的共同回忆</small></span>${i('arrow')}`,'story/spring','memory-entry')}</div></div>`;
  }
  /** 分享名单由当前真实成员生成，同一字段可传递多个指定家人。 */
  function shareViewerOptions(selected=[]) {
    const members=P.state.members.filter(id=>id!==P.state.actor && P.PEOPLE[id]);
    return `<fieldset class="share-viewers"><legend>指定家人时，请勾选可查看的人</legend>${members.map(id=>`<label class="check-row"><input type="checkbox" name="viewers" value="${e(id)}" ${selected.includes(id)?'checked':''}><span>${e(P.PEOPLE[id].name)}<small>${e(relation(id))}</small></span></label>`).join('')}<p class="caption">仅在分享范围为“指定家人”时使用这份名单；可以选择多位家人。</p></fieldset>`;
  }
  /** 录制与文字共用原文确认入口；草稿和 AI 整理为辅助操作，整理扣次单独说明。 */
  function record() {
    const r=P.state.record;
    const context=P.visibleStories().find(story=>story.id===r.storyId);
    const related=r.storyId?`<div class="record-context"><span>关联故事</span><strong>${e(context?.title || '当前未获授权的故事')}</strong>${context?l('回看原故事','story/'+context.id):''}</div>`:'';
    return `<div class="page"><p class="eyebrow">一句话，也值得被记住</p><h1 class="page-title">今天，<br>想讲点什么？</h1><p class="page-subtitle">可以从一张照片、一件小事，或家人的一个问题开始。</p><div class="recording-card"><div class="record-orbit ${r.recording&&!r.paused?'recording':''}">${i('mic')}</div><p id="record-time" class="record-time">${P.duration(r.seconds)}</p><p id="record-status" class="caption">${r.recording?(r.paused?'已暂停 · 录音演示':'正在录制 · 录音演示'):'点击开始，试着讲一段回忆'}</p><div class="record-controls">${b(i(r.recording?(r.paused?'play':'pause'):'mic')+(r.recording?(r.paused?' 继续':' 暂停'):' 开始录音'),'record-toggle','btn')}${r.recording?b(i('stop')+' 结束','record-stop','btn outline'):''}</div><p class="caption demo-note">原型录音为状态演示，可直接在下方输入文字。</p></div><form id="record-form"><input type="hidden" name="storyId" value="${e(r.storyId || '')}">${related}<div class="form-field"><label for="record-kind">这次想记录谁的经历？</label><select id="record-kind" name="kind"><option value="own" ${r.kind!=='contribution'?'selected':''}>记录我自己的人生</option><option value="contribution" ${r.kind==='contribution'?'selected':''}>补充陈远山的经历，提交本人核对</option></select><p class="caption">自己的记录由你确认；补充他人的经历，会保留你的讲述者身份。</p></div><div class="form-field"><label for="record-title">给这段回忆起个名字</label><input id="record-title" name="title" maxlength="48" placeholder="例如：第一次离开家去工作" value="${e(r.title)}"></div><div class="form-field"><label for="record-year">这件事大约发生在哪一年？</label><input id="record-year" name="eventYear" type="number" inputmode="numeric" min="1000" max="${new Date().getFullYear()}" step="1" value="${e(r.eventYear)}" required><p class="caption">人生时间线按这年归档，今天的记录日期会另行保留。</p></div><div class="form-field"><label for="record-text">想留下的话</label><textarea id="record-text" name="text" placeholder="慢慢说，也可以直接写下来…">${e(r.text)}</textarea></div><div class="record-form-buttons"><button class="btn" type="submit" name="intent" value="review">查看原文并确认</button><button class="btn secondary" type="submit" name="intent" value="draft">保存草稿</button><button class="btn outline" type="submit" name="intent" value="organize" aria-describedby="record-organize-note">AI 文字整理</button></div><p id="record-organize-note" class="caption record-organize-note">AI 文字整理会扣除家庭共享次数。</p></form></div>`;
  }
  /** 内容确认将生成方式、提供者和分享范围分别显示。 */
  function review() {
    const r=P.state.record,contribution=r.kind==='contribution' && P.state.actor!=='father';
    if(!r.text.trim())return `<div class="page empty">${i('book')}<h2>还没有可以确认的记录</h2><p>先写下想留下的话，再核对内容与分享范围。</p>${l('开始记录','record','btn')}</div>`;
    return `<div class="page"><p class="eyebrow">在留下之前，再看一遍</p><h1 class="page-title">确认这段记录</h1><div class="tags">${t(r.aiOrganized?'AI 整理示例':'原文记录')}${t(contribution?'提交本人核对':'由我确认','warm')}</div><div class="review-story card section"><h2 class="serif">${e(r.title || '今天的一段回忆')}</h2><p class="caption">事情发生于 ${e(r.eventYear)} 年 · 记录于今天</p><p>${e(r.text || '今天和家人一起翻看旧照片，想起了许多平时没有讲完的事。这段经历，我想慢慢留下来。')}</p></div>${l(i('edit')+' 回去更正内容','record')}<form id="publish-form" class="section"><div class="form-field"><label for="share-scope">确认后，这段故事想分享给谁？</label><select id="share-scope" name="scope"><option value="private" ${r.scope==='private'?'selected':''}>仅自己保存</option><option value="selected" ${r.scope==='selected'?'selected':''}>指定家人，在下方选择</option><option value="family" ${r.scope==='family'?'selected':''}>当前家庭中的家人</option></select><p class="caption">新加入的成员不会自动获得本次分享权限。</p></div>${shareViewerOptions(r.viewers || [])}<label class="check-row"><input name="confirmed" type="checkbox" required><span>我已核对内容，并确认上述分享范围。${contribution?'本次补充内容将提交陈远山本人查看和核对。':''}</span></label><button class="btn full" type="submit">${contribution?'提交陈远山核对':'确认并保存自己的记录'}</button></form><p class="caption section">${contribution?'本人确认后，补充才会进入人生档案，保留你的讲述者身份，并按所选范围保存。':'这段记录由你自己确认和决定分享范围，不需要家庭管理人代为审批。'}</p></div>`;
  }
  /** 我的保留四项入口；无纪念书资格的家人直接进入收藏列表，已建档本人保留纪念分组。 */
  function profile() {
    const s=P.state,person=P.PEOPLE[s.actor],pending=P.MaterialLibrary.reviewCount();
    return `<div class="page profile-page"><div class="profile-heading">${a(s.actor,'large')}<div><h1>${e(person.name)}</h1><p class="caption">${s.actor==='father'?'档案本人':'受邀家人'}</p></div>${l(i('settings'),'settings','icon-button')}</div>${P.BillingViews.profileSummary()}<div class="profile-menu profile-main-menu">${profileMenu('check','资料与核对'+(pending?' · '+pending+'待核对':''),'profile-materials')}${profileMenu('family','我的家庭','profile-family')}${P.KeepsakeBooks.canStart(s.actor)?profileMenu('star','纪念与收藏','profile-keepsakes'):profileMenu('star','我的收藏','saved')}${profileMenu('book','服务与订单','profile-services')}</div>${s.draftSaved?`<div class="notice section">有一份还没写完的回忆。${l('查看草稿','materials')}</div>`:''}</div>`;
  }
  /** 资料与核对承接记录入口；本人和家人的原稿、草稿去向保持各自归属。 */
  function recordPrompt() {
    const hasDraft=Boolean(P.state.draftSaved || P.state.record.text.trim());
    if(P.state.actor!=='father')return `<section class="record-prompt" data-record-entry><div>${i('edit')}<p>${hasDraft?'继续你的草稿':'留下我们的共同回忆'}<small>${e(P.PEOPLE[P.state.actor].name)} · ${hasDraft?'草稿仅自己可见':'先保存原稿，再请对方确认'}</small></p></div>${hasDraft?l('继续草稿 '+i('plus'),'record','text-link'):b('记下一刻 '+i('plus'),'family-common-new','text-link')}</section>`;
    return `<section class="record-prompt" data-record-entry><div>${i('edit')}<p>${hasDraft?'继续你的草稿':'为自己记录一刻'}<small>${e(P.PEOPLE[P.state.actor].name)} · 确认后进入本人人生印记${hasDraft?'，草稿仅自己可见。':'。'}</small></p></div>${l((hasDraft?'继续草稿 ':'记录一刻 ')+i('plus'),'record','text-link')}</section>`;
  }
  /** 资料页集中记录、提交与核对，问题和回答反馈从聊天页进入。 */
  function profileMaterials() {
    return `<div class="page"><h1 class="page-title">资料与核对</h1><p class="page-subtitle">查看资料提交进度，核对家人补充的内容。</p><div class="profile-menu">${profileMenu('check','待我核对 · '+P.MaterialLibrary.reviewCount(),'material-inbox')}${profileMenu('plus','我提交的资料','materials')}</div>${recordPrompt()}${l('返回我的','profile','text-link full section')}</div>`;
  }
  /** 首页整理、家庭关系、授权和共同内容集中在我的家庭，沿用各自权限。 */
  function profileFamily() {
    return `<div class="page"><h1 class="page-title">我的家庭</h1><p class="page-subtitle">看看家人的连接，管理分享与共同记忆。</p><div class="profile-menu">${profileMenu('book','首页内容','home-manage')}${profileMenu('family','家人关系与邀请','family')}${profileMenu('lock','人生空间授权与共同经历确认','family-permissions')}${profileMenu('family','我们的共同回忆','common-memories')}</div>${l('返回我的','profile','text-link full section')}</div>`;
  }
  /** 纪念书入口沿用本人视频建档准入条件；所有账号均保留收藏入口。 */
  function profileKeepsakes() {
    const count=P.visibleStories().filter(story=>P.state.saved.includes(story.id)).length;
    return `<div class="page"><h1 class="page-title">纪念与收藏</h1><p class="page-subtitle">把想珍藏的故事，留在手边。</p><div class="profile-menu">${P.KeepsakeBooks.canStart(P.state.actor)?profileMenu('book','我的纪念书','books'):''}${profileMenu('star','我的收藏 · '+count,'saved')}</div>${l('返回我的','profile','text-link full section')}</div>`;
  }
  /** 会员、奖励和订单是低频服务操作；开通自己的空间仍遵循原拍摄条件。 */
  function profileServices() {
    return `<div class="page"><h1 class="page-title">服务与订单</h1><p class="page-subtitle">查看共享服务、收到的心意和付款记录。</p><div class="profile-menu">${profileMenu('book','共享额度与到期权益','membership')}${profileMenu('share','收到的心意','share-gifts')}${profileMenu('book','服务订单与抵扣','service-orders')}${profileMenu('book','收费方案','billing-plan')}${!P.account().videoDelivered?b(i('person')+' 开通我的完整人生空间','video-service','menu-row'):''}</div>${l('返回我的','profile','text-link full section')}</div>`;
  }
  Object.assign(P.views,{'profile-materials':profileMaterials,'profile-family':profileFamily,'profile-keepsakes':profileKeepsakes,'profile-services':profileServices});
  /** 主菜单以图标、标题、说明还原参考卡片；次级菜单保持同一导航与点击区域。 */
  function profileMenu(icon, text, route) {
    const descriptions={'profile-materials':'查看与核对我的个人资料','profile-family':'查看我的家庭成员','profile-keepsakes':'珍藏家人的故事与回忆',saved:'查看我收藏的内容','profile-services':'查看已购服务与订单',family:'管理家庭成员与邀请，连接家人的故事','family-permissions':'设置家人查看范围，一起确认共同经历','common-memories':'查看和整理我们一起经历的回忆','home-manage':'整理来源、建谱致谢、家训与个人事迹',books:'把重要的人和事，整理成一本书','material-inbox':'查看家人提交的补充，核对后归入档案',materials:'查看提交的资料，了解当前记录进度'};
    const copy=descriptions[route]?`<div class="profile-menu-copy"><span>${text}</span><small>${descriptions[route]}</small></div>`:`<span>${text}</span>`;
    return `<button class="menu-row" type="button" data-nav="${route}">${i(icon)}${copy}${i('arrow')}</button>`;
  }
  /** 全部账号进入同一人物共享服务，不再出售家人个人会员。 */
  function membership() {return P.BillingViews.membership();}
  /** 邀请接收者分别核对家庭加入、人物认领和关系声明。 */
  function invitation() {
    const item=P.state.invitations[P.state.inviteIndex || 0];
    if (!item) return `<div class="page empty"><h2>暂无需要核对的邀请</h2>${l('回到家庭','family','btn')}</div>`;
    if (item.status!=='pending') return `<div class="page empty">${i('check')}<h2>${item.status==='accepted'?'已加入'+e(P.HOME_NAME):'这份邀请已撤回'}</h2><p>人物与关系状态已更新，资料仍按授权范围分享。</p>${l('看看家里的故事','home','btn')}</div>`;
    if(item.correctionNote)return `<div class="page empty">${i('edit')}<h2>邀请信息等待更正</h2><p>${e(item.correctionNote)}</p><p class="caption">更正前不会加入家庭、认领人物或确认关系。</p>${P.state.actor==='father'?b('以邀请人身份更正信息','edit-invite','btn',`data-id="${item.id}"`):''}${l('回到家庭查看进度','family','text-link full')}</div>`;
    return `<div class="page"><div class="invite-hero">${a('father','large')}<p class="caption">陈远山邀请你</p><h1 class="page-title">加入${e(P.HOME_NAME)}</h1><p>一起听故事，也留下你的那一份。</p></div><div class="card section"><p class="caption">这份邀请对应的人物</p><h2 class="card-title">${e(item.name)}</h2><p class="small muted">邀请人填写的关系：你是陈远山的${e(item.relation)}</p>${t('待本人核对','warm')}</div><form id="accept-invite-form" class="section"><input type="hidden" name="inviteId" value="${e(item.id)}"><label class="check-row"><input type="checkbox" name="join" required><span>我愿意加入“${e(P.HOME_NAME)}”。</span></label><label class="check-row"><input type="checkbox" name="claim" required><span>族谱中的“${e(item.name)}”是我。</span></label><label class="check-row"><input type="checkbox" name="relation" required><span>我确认上述亲属关系。</span></label><button type="submit" class="btn full" style="margin-top:14px">确认加入</button></form>${b('信息有误，需要更正','correct-invite','text-link full')}<p class="caption section">加入后仅能查看已向你开放的内容，不代表授权分享你的全部资料。</p></div>`;
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
  /** 首次进入明确视频客户与受邀家人两条路径。 */
  function welcome() {
    return `<div class="welcome-page"><header class="welcome-brand"><strong>传家记</strong><p>陈远山的人生记录</p><h1>一段影像，<br>连起三代的家。</h1><p>视频服务客户开通家庭，<br>家人通过邀请参与。</p></header><div class="page"><h2 class="section-heading">请选择你的身份</h2><p class="page-subtitle">受邀家人无需重复购买视频，按本人授权查看。</p><div class="welcome-identities section">${b(`${a('father','large')}<span><strong>我是档案本人</strong><small>我开通家庭，管理我的人生记录。</small></span>${i('arrow')}`,'enter-owner','welcome-identity')}${b(`${a('xia','large')}<span><strong>我是受邀家人</strong><small>通过家人的邀请，按授权查看和补充。</small></span>${i('arrow')}`,'enter-family','welcome-identity')}</div>${b('了解视频服务与开通条件','video-service','text-link full section')}<p class="caption section">当前使用已交付订单与已受邀账号的示例，不进行真实注册或验证。</p></div></div>`;
  }
  Object.assign(P.views,{family,record,review,profile,membership,invitation,settings,saved,welcome});
  P.relation=relation;
  P.shareViewerOptions=shareViewerOptions;
}


