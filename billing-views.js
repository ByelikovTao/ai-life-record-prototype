/** 收费方案界面：人物共享服务、明确到期权益、服务订单和模拟结算。 */
'use strict';
{
  const P=window.App,{escape:e,button:b,link:l}=P,B=P.Billing,R=B.RULES;
  const ANNUAL_TITLE='年度 AI 与档案保管';
  /** 档案授权已经包含影片交付建档校验，代付沿用同一准入规则。 */
  function people() {return P.state.members.filter(id=>P.FamilyContext.authorized(id,'archive'));}
  /** 会员页选择独立于账号身份，默认跟随正在了解的家人。 */
  function person() {const ids=people(),current=P.state.billingPeople[P.state.actor]||P.FamilyContext.current();return ids.includes(current)?current:ids[0]||'';}
  /** 个人中心用单个紧凑入口展示共享状态，完整额度与方案留在会员页。 */
  function profileSummary() {
    const id=person(),status=id?e(P.PEOPLE[id].name)+' · '+(B.period(id)?'年度服务有效，含 AI 与档案保管':'年度服务未生效'):'受邀家人免费参与';
    return l(`<span><strong>家庭共享服务</strong><small>${status}</small><em>共享额度与到期权益</em></span>${P.icon('arrow')}`,'membership','profile-service-summary');
  }
  /** 对话页用共享答复次数说明额度，不能再用未接入的语音分钟数收费。 */
  function chatQuota(id) {const p=B.period(id);return `<div class="notice billing-chat-quota"><span>${p?'全家剩余 '+Math.max(0,R.qa-p.qaUsed)+' 次有效答复／本年度':'年度AI服务已到期，可看历史资料并留问本人'}${p&&p.qaUsed/R.qa>=.8?' · 已使用 '+Math.floor(p.qaUsed/R.qa*100)+'%':''}</span>${l('共享权益','membership')}</div>`;}
  /** 公共权益说明不展示其他家庭成员的私聊内容。 */
  function quota(person) {
    const p=B.period(person),qa=p?R.qa-p.qaUsed:0,organize=p?R.organize-p.organizeUsed:0,used=p?Math.floor(p.qaUsed/R.qa*100):0;
    return `<div class="quota-grid"><div><strong>${qa}<small> 次</small></strong><span>全家剩余有效答复／年 ${R.qa}</span></div><div><strong>${organize}<small> 次</small></strong><span>全家剩余文字整理／年 ${R.organize}</span></div></div><p class="caption">每次整理最多 ${R.textLimit} 字；失败、重复请求、本人手动回复、纠正及修订回看不扣次数。年度次数到期清零，提前续费不清当前额度。</p>${used>=80?`<div class="notice section">答复额度已使用 ${used}%${used>=100?'，AI服务暂停，基础参与继续可用':used>=95?'，即将用尽':'，请留意全家共享用量'}。加量包尚未定价，不自动扣费。</div>`:''}`;
  }
  /** 年费与基础期共用保管规则；已买的历史保管按原期限显示。 */
  function expiry(person) {
    const s=B.service(person),p=B.period(person),r=B.retention(person),gb=B.storage(person)/1024**3,capacity=B.capacity(person);
    const overflow=B.overflowDeadline(person);
    const legacy=s.custodyUntil&&B.today()<s.custodyUntil?`<p>此前已购买的保管权益有效至 ${e(s.custodyUntil)}。</p>`:'';
    return `<section class="note section">
      <h2>到期后，资料怎么保留</h2>
      <p>人生故事片含 ${R.basicYears} 年、${R.basicGB} GB 基础保管，有效至 ${e(s.baseUntil)}。年度服务有效时，全家共享 ${R.memberGB} GB 总容量。</p>
      <p>${p?'年度服务有效':'年度服务已到期或未开通'}。${capacity?'可上传总容量 '+capacity+' GB':r.online?'当前可查看和导出':'当前可导出迁出清单'}。已用约 ${gb.toFixed(2)} GB（演示数据）。</p>
      ${gb>capacity&&overflow?`<p class="notice">已超当前上传容量，暂停新增归档。请在 ${e(overflow)} 前整理、导出或续费，本原型不执行删除。</p>`:''}
      ${legacy}
      <p>最后保管日 ${e(r.until)}，迁出窗口至 ${e(r.grace)}。${r.online?'保管期和迁出窗口内均可查看、导出。':'线上保管已结束，原型保留内存原稿供导出迁出。'}</p>
      <p>年费到期后暂停 AI 服务，基础保管期内仍可查看、导出和手动维护。最后保管期结束后，留 ${R.graceDays} 天查看和导出，也可开通年度服务继续保管。</p>
      <p>连续续费从原到期日顺延。中断后从重新开通日计一年。付款不扩大访问权。</p>
      ${b('导出我的资料迁出清单','billing-export','text-link',`data-person="${person}"`)}
    </section>`;
  }
  /** 年度服务由本人或获授权家属开通，互动数字人建档在结算时按需选。 */
  function membership() {
    const id=person(),ids=people();
    if(!id)return `<div class="page"><h1 class="page-title">家人免费参与</h1><p>年度服务仅向已完成人生故事片交付建档的人物开放。受邀查看、手动补充、留言、回答纠正和共同章节均免费。建立自己的完整人生空间，可选 ¥15,000 人生故事片试点服务。</p>${l('查看完整收费方案','billing-plan','btn full section')}${b('了解人生故事片','video-service','text-link')}</div>`;
    const p=B.period(id),ac=P.state.accounts[id];
    const setupNote=ac.setupIncluded?'本次人生故事片已含互动数字人建档。':ac.hasDigital||ac.setupOrdered?'该人物的互动数字人已建档或已预约制作。':'如需单独制作互动数字人，可另选建档 ¥'+R.setup+'。';
    return `<div class="page membership-page ${p?'':'membership-expired'}">
      <h1 class="page-title">${p?'一家人，一起留下故事':'年度服务已到期或未开通'}</h1>
      <label for="billing-person" class="caption">选择已建档人物</label>
      <select id="billing-person">${ids.map(value=>`<option value="${value}" ${value===id?'selected':''}>${e(P.PEOPLE[value].name)}${value===P.state.actor?' · 本人':' · 家人可代付'}</option>`).join('')}</select>
      <p class="page-subtitle section">年费按已建档人物收取。本人或家属可代付，获授权家人共享这位人物的权益。受邀家人可免费看片、看家谱和补充回忆。</p>
      ${!p?expiry(id):''}
      <div class="plan-card featured">
        <h2>${ANNUAL_TITLE}</h2>
        <div class="plan-price"><strong>¥${R.annual}</strong><span>／位已建档人物／年</span></div>
        <p>${e(P.PEOPLE[id].name)} · ${p?'有效至 '+p.end:'当前未在服务期内'}</p>
        <ul>
          <li>${R.qa.toLocaleString('zh-CN')} 次有效文字答复和 ${R.organize} 次 AI 文字整理，全家共享。</li>
          <li>${R.memberGB} GB 档案保管总容量。</li>
          <li>AI 能力以功能开通和本人授权为准。</li>
        </ul>
        ${p?quota(id):''}
        <p class="caption">${setupNote}</p>
        ${b(p?'续费下一年':'开通年度服务','billing-checkout','btn full section',`data-person="${id}" data-kind="annual"`)}
      </div>
      ${p?expiry(id):''}
      ${l('收到的心意','share-gifts','btn secondary full section')}
      ${l('服务订单','service-orders','text-link full section')}
      ${l('查看完整收费方案','billing-plan','text-link full section')}
      <p class="caption section">当前仅演示收费、容量和扣次规则，刷新还原。</p>
      ${demoTools(id)}
    </div>`;
  }
  /** 原型边界工具独立标注，不能被理解为客户可更改真实订阅。 */
  function demoTools(id) {return `<details class="section billing-demo"><summary>原型演示工具（不修改真实订单）</summary><p class="caption">演示日期 ${B.today()}。完整还原请用预览工具栏“重置演示”。</p>${[['quota80','额度80%'],['quota95','额度95%'],['quotaEnd','额度用完'],['expired','会员到期'],['overflow','到期且超10 GB'],['baseEnd','基础保管结束'],['graceEnd','迁出窗口结束']].map(([value,label])=>b(label,'billing-scenario','btn secondary compact',`data-value="${value}" data-person="${id}"`)).join('')}</details>`;}
  /** 订单列表只向付款账号展示金额，不提供其他成员私聊用量详情。 */
  function orders() {
    const items=P.state.billingOrders.filter(item=>item.actor===P.state.actor);
    return `<div class="page"><h1 class="page-title">服务订单</h1><p class="caption">内存演示，无真实扣款。代付不改变被记录人物的授权。</p><div class="stack section">${items.length?[...items].reverse().map(item=>`<article class="card"><h2>${e(P.PEOPLE[item.person].name)} · ${item.kind==='annual'?ANNUAL_TITLE:item.kind==='custody'?'历史保管订单':'纪念书编辑'}</h2><p>实付 ¥${item.cash}${item.setup?'（含建档 ¥'+item.setup+'）':''}</p><p>${item.start||item.date} ${item.end?'至 '+item.end:''}${item.refunded?' · 已取消':''}</p>${B.refundable(item)?b('撤销未开始的续费（演示）','billing-refund','text-link',`data-id="${item.id}"`):''}</article>`).join(''):'<p>暂无订单。</p>'}</div>${l('返回会员服务','membership','btn full')}</div>`;
  }
  /** 另选建档时重新报价，年费默认只包含 AI 与档案保管。 */
  function checkout(person,kind,bookId='',includeSetup=false) {
    const q=B.quote(person,kind,bookId,includeSetup);
    if(!q)return P.toast('当前不能购买这项服务，请核对交付、授权和服务状态。');
    const request={state:P.state,actor:P.state.actor,person,kind,bookId,includeSetup,fingerprint:JSON.stringify(q),paid:false};
    const setupOption=kind==='annual'&&B.canOrderSetup(person)?`<label class="check-row section"><input id="billing-include-setup" type="checkbox" ${includeSetup?'checked':''}>另选互动数字人建档（¥${R.setup.toLocaleString('zh-CN')}）</label>`:'';
    const details=kind==='annual'
      ? `${ANNUAL_TITLE} · ${q.start} 至 ${q.end}。本次为这位已建档人物开通或续费一年。`
      : '纪念书编辑服务。';
    P.modal('确认这次服务',`
      <div class="checkout-people">
        <div>${P.avatar(person)}<span>${kind==='annual'?'已建档人物':'服务人物'}：${e(P.PEOPLE[person].name)}</span></div>
        <div>${P.avatar(P.state.actor)}<span>付款账号：${e(P.PEOPLE[P.state.actor].name)}</span></div>
      </div>
      <p>服务 ¥${q.price}${q.setup?' ＋ 建档 ¥'+q.setup:''}</p>
      <h2 class="section">本次实付 ¥${q.cash}</h2>
      <p class="caption">${details}</p>
      ${setupOption}
      <form id="billing-pay-form" class="section">
        <label class="check-row section"><input name="agree" type="checkbox" required><span>我确认服务范围及演示实付金额。付款不扩大资料权限。</span></label>
        <button type="submit" class="btn full section">确认演示支付</button>
      </form>`,'sheet');
    for(const id of ['billing-pay-form','billing-include-setup']){
      const element=document.getElementById(id);
      if(element)element.billingRequest=request;
    }
  }
  /** 主套餐先列交付和付款节点，再列统一年费及可选制作费用。 */
  function plan() {
    const filmPrice=15000,firstYear=filmPrice+R.annual;
    return `<div class="page pricing-page">
      <h1 class="page-title">AI传家记收费详情</h1>
      <p class="page-subtitle">本人或家属可代付。受邀家人免费看片、看家谱和补充回忆。</p>
      <div class="section stack">
        <section class="pricing-item">
          <h2>人生故事片</h2><strong>¥${filmPrice.toLocaleString('zh-CN')}</strong>
          <p>试点价／位，一次性收费。上门采集口述和老照片，再用 AI 制作人生故事片。</p>
        </section>
        <section class="note">
          <h2>主套餐包含什么</h2>
          <p><b>上门采集</b> 1 位主角、1 次同城上门。顾问采访录音、整理老照片，和本人选定要讲的经历。</p>
          <p><b>人生故事片</b> 约 5 分钟的 1080p 横版正片，带中文字幕。保留本人原声和老照片，关键场景用 AI 重现。</p>
          <p><b>竖版精选</b> 1 条 30–60 秒短片，分享范围由本人确认。</p>
          <p><b>审看与修改</b> 先核对故事和小样，初片含 2 轮集中修改。制作方造成的事实、字幕或导出错误单独修正。</p>
          <p><b>家庭交付</b> 顾问协助开通家庭空间，交付可保存的影片文件，含 ${R.basicYears} 年、${R.basicGB} GB 基础保管。</p>
        </section>
        <section class="note">
          <h2>分三次付款</h2>
          <p>签约预付 ¥4,500。提交可完整观看的初版收 ¥6,000。定稿验收收 ¥4,500。</p>
          <p>第二位主角、异地上门、完整竖版和纪念书按实际范围另行报价。</p>
        </section>
        <section class="pricing-item">
          <h2>${ANNUAL_TITLE}</h2><strong>¥${R.annual}</strong>
          <p>试点实付，每位已建档人物／年，可选。本人或家属可在影片交付建档后开通，获授权家人共享这位人物的 ${R.qa.toLocaleString('zh-CN')} 次有效文字答复、${R.organize} 次 AI 文字整理和 ${R.memberGB} GB 档案保管总容量。</p>
          <p>AI 能力以功能开通和本人授权为准。每次文字整理最多 ${R.textLimit.toLocaleString('zh-CN')} 字。</p>
        </section>
        <section class="note">
          <h2>互动数字人建档与首年合计</h2>
          <p>确需单独制作互动数字人时，可另选建档 ¥${R.setup.toLocaleString('zh-CN')}／次。片内 AI 制作包含在主套餐里。</p>
          <p>影片和基础档案 ¥${filmPrice.toLocaleString('zh-CN')}。加一年年度服务共 ¥${firstYear.toLocaleString('zh-CN')}。同时选购独立建档时，首年共 ¥${(firstYear+R.setup).toLocaleString('zh-CN')}。</p>
        </section>
        <section class="note">
          <h2>档案保管与到期</h2>
          <p>年度服务到期后，基础保管期内仍可看片、导出和手动维护。基础保管与年度服务均结束时，提供 ${R.graceDays} 天查看和导出窗口。开通年度服务即可继续保管。</p>
        </section>
      </div>
      <a class="btn full section" href="commercial-plan.html" target="_blank" rel="noopener">打开完整收费方案</a>
      ${l('查看实际权益与共享余额','membership','btn secondary full section')}
      <p class="caption section">试点交付和报价以确认的订单为准。原型仅演示收费与权益。</p>
    </div>`;
  }
  /** 场景工具只改当前演示状态，边界页面不清除原始材料。 */
  function scenario(value,id) {
    const s=B.service(id),p=B.period(id);if(!s)return;
    if(value.startsWith('quota')){if(!p)return P.toast('当前年度已到期，请先还原演示。');p.qaUsed=value==='quota80'?960:value==='quota95'?1140:R.qa;}
    if(value==='expired'||value==='overflow'){P.state.billingToday=s.periods.map(item=>item.end).sort().at(-1)||B.today();if(value==='overflow')s.baseBytes=12*1024**3;}
    if(value==='baseEnd')P.state.billingToday=[s.baseUntil,...s.periods.map(item=>item.end)].sort().at(-1);
    if(value==='graceEnd')P.state.billingToday=B.shift(B.retention(id).grace,0,0,1);
    P.render();
  }
  /** 导出仅包含当前账号有权持有的资料，保管到期也不替第三方公开原稿。 */
  function exportOwn() {
    const actor=P.state.actor,items=[...P.state.stories,...(P.state.archiveAssets||[])].filter(item=>item.author===actor||item.subject===actor&&item.scope!=='private'&&item.viewers?.includes(actor)&&(!item.approvedViewers||item.approvedViewers.includes(actor)));
    const blob=new Blob([JSON.stringify({notice:'原型内存资料导出，包含本账号原稿及本人档案；媒体路径不等于云端原文件备份。',person:P.PEOPLE[actor].name,items},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='我的资料迁出清单.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  /** 处理服务结算、撤销和迁出等收费页面动作。 */
  function handleAction(action,el) {
    if(action==='billing-checkout'){checkout(el.dataset.person,el.dataset.kind);return true;}
    if(action==='billing-scenario'){scenario(el.dataset.value,el.dataset.person);return true;}
    if(action==='billing-refund'){B.refund(el.dataset.id);P.render();return true;}
    if(action==='billing-export'){exportOwn();return true;}
    return false;
  }
  /** 表单绑定账号和状态，重置或切换账号后旧订单表单失效。 */
  function submit(form) {
    if(form.id!=='billing-pay-form')return false;
    if(!new FormData(form).get('agree'))return true;
    const order=B.pay(form.billingRequest||{});if(!order)return P.toast('订单状态或金额已改变，请重新核对。'),true;
    P.closeModal();P.render();P.toast('演示服务已确认，未发生真实扣款。');return true;
  }
  document.addEventListener('change',event=>{
    const option=event.target;
    if(option.id==='billing-person'){
      P.state.billingPeople[P.state.actor]=option.value;
      P.render();
      return;
    }
    if(option.id!=='billing-include-setup')return;
    const r=option.billingRequest;
    if(r?.state!==P.state||r.actor!==P.state.actor||r.paid)return;
    checkout(r.person,r.kind,r.bookId,option.checked);
  });
  P.BillingViews={membership,profileSummary,chatQuota,quota,checkout,handleAction,submit};
  Object.assign(P.views,{'billing-plan':plan,'service-orders':orders});
}
