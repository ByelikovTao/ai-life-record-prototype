/** 纪念书客户页面：视频建档本人从自己的档案发起制作，在我的纪念书中处理校样和订单。 */
'use strict';
{
  const P=window.App,K=P.KeepsakeBooks,{escape:e,button:b,link:l,badge:t,icon:i}=P;
  /** 未授权的直达地址展示空态，不输出其他人的书名或材料。 */
  function empty() {return `<div class="page"><div class="empty">${i('book')}<h2>暂无可查看的纪念书</h2><p>仅可查看自己制作的纪念书；开始制作前需完成视频拍摄建档。</p></div>${l('返回我的纪念书','books','btn secondary full')}</div>`;}
  /** 两种状态分开展示，完成定稿不等于已经付款或发货。 */
  function statuses(book) {const labels=K.PHASES[book.phase];return `<div class="tags">${t('书稿 · '+labels[0])}${t('订单 · '+labels[1],'warm')}</div>`;}
  /** 封面书名和人物始终取当前书稿，右侧照片仅用于对应的陈远山示例。 */
  function bookDisplay(book) {return `<div class="book-display" data-book-person="${e(book.subject)}"><h2>${e(book.title)}</h2><p>${e(P.PEOPLE[book.subject].name)} · 家庭私藏</p></div><p class="caption">档案主人：${e(P.PEOPLE[book.subject].name)}（本人）</p>`;}
  /** 我的页面保留已有书稿；新制作只引导已完成视频建档的本人进入自己的档案。 */
  function list() {
    const books=P.state.keepsakeBooks.filter(K.readable),canStart=K.canStart(P.state.actor);
    return `<div class="page keepsake-page"><p class="eyebrow">留给家人的一本书</p><h1 class="page-title">我的纪念书</h1><p class="page-subtitle">把走过的岁月，留给最爱的人。</p><div class="section stack">${books.length?books.map(book=>`<article class="book-list-item">${bookDisplay(book)}<div class="card section">${statuses(book)}${l('查看书稿与制作进度','book-order/'+book.id,'btn outline full section')}</div></article>`).join(''):`<div class="empty">${i('book')}<h2>第一本纪念书，从已有故事开始</h2><p>${canStart?'进入自己的人物档案，选择想留给家人的内容。':'纪念书由已完成视频拍摄建档的本人发起制作。'}</p></div>`}</div>${canStart?l('去我的人生印记制作','life/'+P.state.actor,'btn full section'):''}<p class="caption section">专业编辑、样书和印制单独报价，已有的档案整理不重复收费。</p></div>`;
  }
  /** 选材展示已授权资料缩略图并保留提供者；未经入书授权的他人素材明确禁选。 */
  function sourceRow(item,book) {
    const story=item.supportingStories?.[0],photo=item.asset?.kind==='photo'?item.asset.poster:story?P.FamilyHome.photo(story,book.subject)?.poster:'';
    return `<label class="book-source ${item.eligible?'':'unavailable'}">${photo?`<img src="${e(photo)}" alt="${e(item.title)}的已关联资料缩略图">`:''}<input type="checkbox" name="sources" value="${e(item.key)}" ${book.keys.includes(item.key)?'checked':''} ${item.eligible?'':'disabled'}><span><strong>${e(item.title)}</strong><small>${e(item.label)} · ${e(P.PEOPLE[item.author]?.name||'资料提供者')}</small><em>${item.eligible?'本人的资料 · 提交时确认入书':'待资料提供者同意入书，当前不可选'}</em></span></label>`;
  }
  /** 选材仅供已完成视频建档的本人编辑，直达地址同样校验准入条件。 */
  function edit() {
    const book=K.current();if(!book)return empty();
    if(book.creator!==P.state.actor||book.phase!=='draft')return order();
    if(!K.canStart(book.subject))return empty();
    return `<div class="page keepsake-page"><p class="eyebrow">01 / 整理想留下的内容</p><h1 class="page-title">制作纪念书</h1><p class="page-subtitle">关于${e(P.PEOPLE[book.subject].name)}的一生，先选出你最想留下的部分。</p><form id="keepsake-form" data-feature-form data-actor="${P.state.actor}" class="section stack"><label>纪念书名称<input name="title" maxlength="60" value="${e(book.title)}" required></label><label>写在扉页的话<textarea name="dedication" maxlength="300">${e(book.dedication)}</textarea></label><fieldset class="book-fieldset"><legend>选择入书资料</legend><p class="caption">先选传记章节和照片，编辑会联系你补齐细节。不会自动收入私聊或 AI 推演。</p>${K.sources(book.subject).map(item=>sourceRow(item,book)).join('')}</fieldset><label class="book-consent"><input type="checkbox" name="consent" required><span>我确认所选资料可用于本书编辑、排版及交付，并由我核对最终内容。</span></label><button type="submit" class="btn full">确认选材，查看服务报价</button></form><p class="caption section">选择保留在当前演示中，刷新或重置后清除。</p></div>`;
  }
  /** 预览使用可追溯资料，定稿以后显示对应版本而不是实时覆盖成品。 */
  function preview() {
    const book=K.current();if(!book)return empty();const content=K.preview(book);
    if(!content)return `<div class="page"><div class="empty"><h2>请先完成选材授权</h2><p>本人确认后才生成完整书稿预览；资料权限变化时需重新核对。</p></div>${l('返回制作进度','book-order/'+book.id,'btn full')}</div>`;
    return `<div class="page keepsake-page"><div class="row between"><span class="caption">书稿预览 · V${content.version}</span>${l('制作进度','book-order/'+book.id,'text-link')}</div><section class="book-cover section"><span>PERSONAL MEMOIR</span><h1>${e(content.title)}</h1><p>${e(content.dedication)}</p><small>${e(P.PEOPLE[book.subject].name)} · 个人纪念书</small></section><p class="caption section">当前为内容与排版方向预览。正式印刷页码、图片清晰度与装订效果由编辑和样书核对。</p><div class="section stack">${content.sections.map((section,index)=>`<article class="book-page"><p class="eyebrow">${String(index+1).padStart(2,'0')} / 留下的故事</p><h2>${e(section.title)}</h2>${section.image?`<img src="${e(section.image)}" alt="${e(section.title)}">`:''}${section.text.split('\n').filter(Boolean).map(text=>`<p>${e(text)}</p>`).join('')}<small>资料来源保留在人物档案中</small></article>`).join('')}</div>${l('返回确认与订单','book-order/'+book.id,'btn full section')}</div>`;
  }
  /** 报价明确拆分服务，示例金额不会被包装成已生效的正式套餐。 */
  function fees(book) {
    const rows=[['editing','编辑与排版','确认报价后开始'],['sample','一册实物样书','本人定稿后支付'],['printing','小批量印制与寄送','样书确认后支付']];
    return `<section class="card section"><h2>分阶段确认费用</h2><p class="caption">演示报价，实际服务范围与价格待确认。示例交付共 3 册，含样书。</p><dl class="book-fees">${rows.map(([key,label,note])=>`<div><dt>${label}<small>${note}</small></dt><dd>¥${K.FEES[key]}<small>${book.paid[key]?'演示已支付':'待支付'}</small></dd></div>`).join('')}</dl><p class="caption">已付演示现金 ¥${K.paidTotal(book)}，服务金 ¥${P.state.billingOrders.find(item=>item.id===book.billingOrderId)?.credit||0}。不重复收取既有档案整理费用。</p></section>`;
  }
  /** 当前阶段只显示客户能够执行的下一步，本人定稿与发起人付款分别处理。 */
  function next(book) {
    const owner=book.subject===P.state.actor,payer=book.creator===P.state.actor;
    const map={draft:[payer,'继续选材','edit'],quote:[payer,'确认示例报价，模拟支付编辑费','edit-payment'],proof:[owner,'已看完整校样，确认定稿','finalize'],sample:[payer&&!book.paid.sample,'模拟支付样书费','sample-payment'],sampleReview:[owner,'样书已核对，确认印制','sample-approve'],printPayment:[payer,'模拟支付印制费','print-payment'],shipped:[payer,'确认收到纪念书','received'],delivered:[true,'查看交付清单','files']};
    const item=map[book.phase];
    if(!item||!item[0])return `<p class="caption section">${book.phase==='editing'?'编辑正在整理校样，完成后交本人核对。':book.phase==='sample'?'等待样书制作与寄送。':book.phase==='printing'?'印厂按已确认版本制作。':book.phase==='cancelRequested'?'后续制作已暂停，顾问核算已完成项目与未发生费用后联系你。':book.phase==='aftercare'?'顾问会核对问题、交付版本和处理方案。':book.phase==='cancelled'?'此项制作已取消。':'等待'+e(P.PEOPLE[book.phase==='proof'||book.phase==='sampleReview'?book.subject:book.creator].name)+'处理当前确认事项。'}</p>`;
    if(item[2]==='edit')return l(item[1],'book-edit/'+book.id,'btn full section');
    return b(item[1],'book-'+item[2],'btn full section');
  }
  /** 进度不冒充真实印厂回传，演示发货单号明确标示为示例。 */
  function progress(book) {
    const steps=[['选材与报价',['draft','quote']],['编辑与定稿',['editing','proof']],['样书核对',['sample','sampleReview','printPayment']],['印制与交付',['printing','shipped','delivered','aftercare']]];
    const at=steps.findIndex(([,phases])=>phases.includes(book.phase));
    return `<ol class="book-progress section">${steps.map(([label],index)=>`<li class="${index===at?'active':index<at?'complete':''}"><span>${index+1}</span>${label}</li>`).join('')}</ol>`;
  }
  /** 修改、取消和售后入口随阶段变化，不以笼统“不可退款”掩盖问题处理。 */
  function support(book) {
    const revise=book.subject===P.state.actor&&['proof','sampleReview'].includes(book.phase),payer=book.creator===P.state.actor;
    const cancel=payer&&!['printing','shipped','delivered','aftercare','cancelled','cancelRequested'].includes(book.phase);
    const aftercare=payer&&['printing','shipped','delivered','aftercare'].includes(book.phase);
    return `<section class="section"><h2>修改与服务说明</h2><ul class="book-rules"><li>校样、样书都可以提出具体修改意见，修改后重新确认版本。</li><li>新增章节、照片精修等超出约定的服务，先确认范围和费用。</li><li>开工前可取消；开工后暂停并核算已完成项目，未发生费用退还。</li><li>印制后不自动取消，错漏与质量问题可申请更正、补发或协商退款。</li></ul><div class="stack">${revise?b('提出修改意见','book-revise','btn secondary full'):''}${cancel?b(K.paidTotal(book)?'申请取消并核算退款':'取消本次制作','book-cancel','text-link'):''}${aftercare?b('申请更正或售后','book-aftercare','btn secondary full'):''}</div></section>`;
  }
  /** 订单页同时承载本人待办、付款节点、书稿版本和交付信息。 */
  function order() {
    const book=K.current();if(!book)return empty();
    const blocked=!['draft','cancelled','cancelRequested'].includes(book.phase)&&!K.ready(book);
    const showcase=K.ready(book)&&['proof','sampleReview','shipped','delivered','aftercare'].includes(book.phase)?`<section class="card section order-book-preview">${bookDisplay(book)}${l('查看完整书稿 · V'+book.version,'book-preview/'+book.id,'btn outline full section')}</section>`:'';
    return `<div class="page keepsake-page"><p class="eyebrow">${e(P.PEOPLE[book.subject].name)} · 家庭私藏纪念书</p><h1 class="page-title">${e(book.title)}</h1>${statuses(book)}${progress(book)}${showcase}<section class="card section"><h2>这一步，慢慢确认</h2><p class="caption">内容由${e(P.PEOPLE[book.subject].name)}本人定稿，费用由发起人${e(P.PEOPLE[book.creator].name)}确认。付费不代替内容授权。</p>${blocked?'<p class="notice section">资料权限有变化，已暂停后续操作，请联系本人和提供者重新核对。</p>':next(book)}${K.ready(book)?l('查看完整书稿 · V'+book.version,'book-preview/'+book.id,'btn outline full section'):''}</section><section class="section"><div class="section-heading"><h2>本书选材</h2><span class="caption">${book.keys.length} 项</span></div>${K.selected(book).map(item=>`<p class="book-source-summary">${i(item.asset?.kind==='photo'?'photo':'book')}${e(item.title)}</p>`).join('')}${K.selected(book).length!==book.keys.length?'<p class="caption">部分资料当前不可查看，不能继续定稿与送印。</p>':''}</section>${fees(book)}${['shipped','delivered','aftercare'].includes(book.phase)?'<div class="note section"><strong>交付与寄送</strong><p>电子阅读 PDF、印刷文件及实体书 3 册。</p><p>示例物流：纪念书寄送 · DEMO-001</p><p class="caption">演示地址：由服务顾问在寄送前与你核对。</p></div>':''}${book.notes.length?`<section class="note section"><strong>最近的修改意见</strong><p>V${book.notes.at(-1).version} · ${e(book.notes.at(-1).text)}</p></section>`:''}${book.serviceNote?`<div class="note section"><strong>服务申请</strong><p>${e(book.serviceNote)}</p></div>`:''}${support(book)}${l('返回我的纪念书','books','text-link full section')}</div>`;
  }
  Object.assign(P.views,{books:list,'book-edit':edit,'book-preview':preview,'book-order':order});
}
