/** 收费方案界面：人物共享服务、明确到期权益、模拟结算和推荐服务金，不发起真实交易。 */
'use strict';
{
  const P=window.App,{escape:e,button:b,link:l}=P,B=P.Billing,R=B.RULES;
  /** 只能选择本人或明确邀请并开放档案的人物；代付不改变已有授权。 */
  function people() {return P.state.members.filter(id=>P.state.accounts[id]?.videoDelivered&&P.FamilyContext.authorized(id,'archive'));}
  /** 会员页选择独立于账号身份，默认跟随正在了解的家人。 */
  function person() {const ids=people(),current=P.state.billingPeople[P.state.actor]||P.FamilyContext.current();return ids.includes(current)?current:ids[0]||'';}
  /** 个人中心显示人物共享权益，家人的账号始终是免费参与身份。 */
  function profileSummary() {const id=person();return `<div class="membership-summary"><h2>${P.state.actor===id?'我的家庭共享服务':'家人免费参与'}</h2><p>${id?e(P.PEOPLE[id].name)+' · '+(B.period(id)?'699元年度服务有效，全家共享':'AI年度服务未生效；基础权益按保管期限保留'):'受邀查看、手动参与和留言免费；完整人生空间需先完成拍摄。'}</p>${l('查看共享额度与到期权益','membership','btn light full section')}${l('查看699元方案','billing-plan','text-link full section')}</div>`;}
  /** 对话页用共享答复次数说明额度，不能再用未接入的语音分钟数收费。 */
  function chatQuota(id) {const p=B.period(id);return `<div class="notice billing-chat-quota"><span>${p?'全家剩余 '+Math.max(0,R.qa-p.qaUsed)+' 次有效答复／本年度':'年度AI服务已到期，可看历史资料并留问本人'}${p&&p.qaUsed/R.qa>=.8?' · 已使用 '+Math.floor(p.qaUsed/R.qa*100)+'%':''}</span>${l('共享权益','membership')}</div>`;}
  /** 公共权益说明不展示其他家庭成员的私聊或推荐钱包。 */
  function quota(person) {
    const p=B.period(person),qa=p?R.qa-p.qaUsed:0,organize=p?R.organize-p.organizeUsed:0,used=p?Math.floor(p.qaUsed/R.qa*100):0;
    return `<div class="quota-grid"><div><strong>${qa}<small> 次</small></strong><span>全家剩余有效答复／年 ${R.qa}</span></div><div><strong>${organize}<small> 次</small></strong><span>全家剩余文字整理／年 ${R.organize}</span></div></div><p class="caption">每次整理最多 ${R.textLimit} 字；失败、重复请求、本人手动回复、纠正及修订回看不扣次数。年度次数到期清零，提前续费不清当前额度。</p>${used>=80?`<div class="notice section">答复额度已使用 ${used}%${used>=100?'，AI服务暂停，基础参与继续可用':used>=95?'，即将用尽':'，请留意全家共享用量'}。加量包尚未定价，不自动扣费。</div>`:''}`;
  }
  /** 明确列出人物当前保管期限，超额只暂停新增，不能冒充已删除。 */
  function expiry(person) {
    const s=B.service(person),p=B.period(person),r=B.retention(person),gb=B.storage(person)/1024**3,capacity=B.capacity(person);
    return `<section class="note section"><h2>到期后，资料怎么保留</h2><p>基础保管至 ${e(s.baseUntil)}：拍摄交付含5年／10 GB。会员有效时总容量20 GB，不是每年新增20 GB。</p><p>当前${p?'年度服务有效':'年度AI服务已到期或未开通'}；${capacity?'可上传总容量 '+capacity+' GB':'当前仅能查看和导出'}。已用约 ${gb.toFixed(2)} GB（种子容量为演示值，新增本地材料按原文件大小计）。</p>${gb>capacity?`<p class="notice">已超当前上传容量：暂停新增归档，请在 ${e(B.overflowDeadline(person))} 前整理、导出或续费；超期提示确认迁出清理，本原型不执行删除。</p>`:''}<p>最后保管日：${e(r.until)}；迁出窗口至 ${e(r.grace)}。${B.online(person)?'窗口内可查看、导出。':'线上保管已结束，本原型仍保留内存原稿供导出迁出，不模拟删除。'}</p><p>会员到期只暂停AI；基础期内查看、权限控制和手动参与仍可用。超过10 GB给90天处理窗口。基础保管结束后可选择 ¥199／人物／年纯保管，10 GB、不含AI；会员有效时不用重复购买保管。</p><p>中断后从重新开通日计一年，不补收停用期；连续续费从原到期日顺延。付款不扩大访问权。</p>${b('导出我的资料迁出清单','billing-export','text-link',`data-person="${person}"`)}${!p&&B.today()>=s.baseUntil?b('选择纯保管 ¥199／年','billing-checkout','btn secondary full section',`data-person="${person}" data-kind="custody"`):''}</section>`;
  }
  /** 会员卡只提供一个699方案；家人账号不再单独购买个人会员。 */
  function membership() {
    const id=person(),ids=people();
    if(!id)return `<div class="page"><h1 class="page-title">家人免费参与</h1><p>受邀查看、手动补充、留言、回答纠正和共同章节均免费。建立自己的完整人生空间需要先完成 ¥15,000 拍摄；数字人首次建档如已包含，不重复收费。</p>${l('查看完整收费方案','billing-plan','btn full section')}${b('了解拍摄服务','video-service','text-link')}</div>`;
    const p=B.period(id),ac=P.state.accounts[id];
    return `<div class="page membership-page"><h1 class="page-title">一家人，一起留下故事</h1><label for="billing-person" class="caption">服务归属人物</label><select id="billing-person">${ids.map(value=>`<option value="${value}" ${value===id?'selected':''}>${e(P.PEOPLE[value].name)}${value===P.state.actor?' · 本人':' · 家人可代付'}</option>`).join('')}</select><p class="page-subtitle section">本人或代付者购买，一位人物开通，全家免费参与。账号人数不影响价格和总额度。</p><div class="plan-card featured"><h2>家庭共享年度服务</h2><div class="plan-price"><strong>¥${R.annual}</strong><span>／人物／年</span></div><p>${e(P.PEOPLE[id].name)} · ${p?'有效至 '+p.end:'当前未在会员年度内'}</p><ul><li>1,200次有效文字答复＋24次文字整理，全家共享</li><li>20 GB总容量；基础查看与手动参与免费</li><li>不含人工访谈、代写、精修、编书及新空间制作</li></ul>${quota(id)}<p class="caption">${ac.setupIncluded?'本次拍摄已含建档，不重复收2,000元。':ac.hasDigital||ac.setupOrdered?'该人物建档已完成或已付费预约，不重复收取。':'首次数字人建档另列2,000元，须先完成拍摄与资料校准。'}</p>${b(p?'续费下一年':'开通年度服务','billing-checkout','btn full section',`data-person="${id}" data-kind="annual"`)}</div>${expiry(id)}${l('我的推荐服务金','rewards','btn secondary full section')}${l('订单与抵扣记录','service-orders','text-link full section')}${l('查看完整收费方案','billing-plan','text-link full section')}<p class="caption section">当前仅演示规则和扣次，不接入真实AI、语音、云存储或支付；刷新还原。</p>${demoTools(id)}</div>`;
  }
  /** 原型边界工具独立标注，不能被理解为客户可更改真实订阅或奖励。 */
  function demoTools(id) {return `<details class="section billing-demo"><summary>原型演示工具（不修改真实订单）</summary><p class="caption">演示日期 ${B.today()}。完整还原请用预览工具栏“重置演示”。</p>${[['quota80','额度80%'],['quota95','额度95%'],['quotaEnd','额度用完'],['expired','会员到期'],['overflow','到期且超10 GB'],['baseEnd','基础保管结束'],['graceEnd','迁出窗口结束']].map(([value,label])=>b(label,'billing-scenario','btn secondary compact',`data-value="${value}" data-person="${id}"`)).join('')}</details>`;}
  /** 推荐订单按真实业务节点展示，生成演示订单不会立即赠送600元。 */
  function rewards() {
    const items=P.state.referrals.filter(item=>item.actor===P.state.actor),ledger=P.state.rewardLedger.filter(item=>item.actor===P.state.actor);
    const expiring=B.wallet().filter(item=>item.expires<=B.shift(B.today(),0,0,90));
    return `<div class="page"><h1 class="page-title">把值得留下的故事，推荐给朋友</h1>${expiring.length?'<p class="notice">有服务金将在90天内到期，请查看明细；本原型不发送真实通知。</p>':''}<div class="plan-card"><h2>我的推荐服务金</h2><div class="plan-price"><strong>¥${B.balance()}</strong><span>当前可用</span></div><p>每笔合格新拍摄项目奖励600元；付款、验收和约定售后核算均完成后发放。注册、转发本身不发奖励。</p></div><section class="note section"><h2>怎么抵扣</h2><p>每位人物每个会员年度最多抵200元，699元续费最低实付499元。制作服务费最多抵20%，每单最多600元。印刷、物流和第三方代付费用不参与。</p><p>有效期48个月，不提现、不交易、不设多级推荐；余额可累计，不提高每单上限，与同类促销择优使用。退款时现金与服务金分开退，服务金沿用原有效期。</p><p>699元年费抵200元后实付499元；1,200元编辑费可抵240元；15,000元拍摄服务可抵600元。后两项为规则示例，拍摄订单需线下确认。</p></section><section class="section"><h2>奖励明细</h2>${ledger.length?ledger.map(item=>`<p>发放 ¥${item.amount} · 剩余 ¥${item.left} · ${item.expires} 到期${item.expires<=B.today()?'（已过期）':''}</p>`).join(''):'<p class="caption">暂无已结算奖励。</p>'}</section><section class="section stack"><h2>我推荐的项目</h2>${items.map(item=>`<article class="card"><h3>${e(item.name)}</h3><p>${item.refunded?'已退款，不发奖励':item.rewarded?'已发放600元':item.settled?'已完成核算':item.delivered?'已验收，待核算':item.paid?'已付款，待验收':'待付款'}</p><details><summary>原型订单节点演示</summary>${!item.rewarded&&!item.refunded?[['paid','标记已付款'],['delivered','标记已验收'],['settled','完成售后核算并发放'],['refunded','标记已退款']].map(([stage,label])=>b(label,'referral-stage','btn secondary full section',`data-id="${item.id}" data-stage="${stage}"`)).join(''):''}</details></article>`).join('')}</section><details class="billing-demo section"><summary>原型工具：新增虚构推荐项目</summary><form id="referral-form"><label for="referral-name">项目备注（不填真实联系方式）</label><input id="referral-name" name="name" maxlength="50" value="朋友的人生影片 · 虚构项目" required><button class="btn full section" type="submit">创建演示项目</button></form></details><div class="note section"><h2>分享推广流程</h2><p>交付时邀请家人参与；本人挑选并确认短片／作品卡，再私下分享给朋友。分享页仅展示选中的公开精选和预约入口，不开放整个人生档案、关系树或私聊。</p><p>原型只展示推广与归因规则，不发送邀请、生成可公开访问的私人内容或向第三方传输资料。</p></div>${l('返回家庭共享服务','membership','btn full section')}${l('订单与抵扣记录','service-orders','text-link full section')}</div>`;
  }
  /** 订单列表只向付款账号展示金额，不提供其他成员私聊用量详情。 */
  function orders() {
    const items=P.state.billingOrders.filter(item=>item.actor===P.state.actor);
    return `<div class="page"><h1 class="page-title">服务订单与抵扣</h1><p class="caption">内存演示，无真实扣款。代付不改变被记录人物的授权。</p><div class="stack section">${items.length?[...items].reverse().map(item=>`<article class="card"><h2>${e(P.PEOPLE[item.person].name)} · ${item.kind==='annual'?'年度服务':item.kind==='custody'?'纯保管':'纪念书编辑'}</h2><p>服务 ¥${item.price}＋建档 ¥${item.setup}－服务金 ¥${item.credit}＝实付 ¥${item.cash}</p><p>${item.start||item.date} ${item.end?'至 '+item.end:''}${item.refunded?' · 已取消，现金和服务金分别退回':''}</p>${B.refundable(item)?b('撤销未开始的续费（演示）','billing-refund','text-link',`data-id="${item.id}"`):''}</article>`).join(''):'<p>暂无订单。</p>'}</div>${l('返回会员服务','membership','btn full')}</div>`;
  }
  /** 结算金额由领域报价计算，勾选服务金后重新生成同一订单的确认内容。 */
  function checkout(person,kind,useCredit=false,bookId='') {
    const q=B.quote(person,kind,useCredit,bookId);if(!q)return P.toast('当前不能购买这项服务，请核对拍摄、授权和服务状态。');
    const request={state:P.state,actor:P.state.actor,person,kind,useCredit,bookId,fingerprint:JSON.stringify(q),paid:false};
    P.modal('确认这次服务',`<p>服务人物：${e(P.PEOPLE[person].name)}；付款账号：${e(P.PEOPLE[P.state.actor].name)}</p><p>服务 ¥${q.price}＋首次建档 ¥${q.setup}－服务金 ¥${q.credit}</p><h2 class="section">本次实付 ¥${q.cash}</h2><p class="caption">${q.start?'服务 '+q.start+' 至 '+q.end:'纪念书编辑服务'}；余额 ¥${B.balance()}。纯保管不抵服务金，制作按20%且单笔最多600元。</p><label class="check-row section"><input id="billing-use-credit" type="checkbox" ${useCredit?'checked':''} ${kind==='custody'?'disabled':''}>使用符合条件的推荐服务金</label><form id="billing-pay-form" class="section"><label class="check-row"><input name="agree" type="checkbox" required>我确认服务范围与模拟实付金额，付款不扩大资料权限。</label><button type="submit" class="btn full section">确认演示支付</button></form>`);
    document.getElementById('billing-pay-form').billingRequest=request;document.getElementById('billing-use-credit').billingRequest=request;
  }
  /** 公开方案页呈现已确认的客户权益，不附带内部经营测算文档。 */
  function plan() {return `<div class="page"><h1 class="page-title">家庭共享服务方案</h1><p>699元／人物／年，家人免费参与；拍摄15,000元，已含建档时首年合计15,699元，未包含且确需独立建档时17,699元。</p><p class="section">全家共享1,200次有效答复、24次文字整理（每次5,000字）、20 GB总容量。基础保管5年／10 GB，超额迁出窗口90天；纯保管199元／年。</p><p class="section">合格推荐奖励600元服务金，有效48个月；年费每人物年度最多抵200元，制作最多抵20%且每单最多600元。</p>${l('查看实际权益与共享余额','membership','btn secondary full section')}${l('推荐服务金规则','rewards','text-link full section')}</div>`;}
  /** 场景工具只改当前演示状态，边界页面不清除原始材料。 */
  function scenario(value,id) {
    const s=B.service(id),p=B.period(id);if(!s)return;
    if(value.startsWith('quota')){if(!p)return P.toast('当前年度已到期，请先还原演示。');p.qaUsed=value==='quota80'?960:value==='quota95'?1140:R.qa;}
    if(value==='expired'||value==='overflow'){P.state.billingToday=s.periods.map(item=>item.end).sort().at(-1)||B.today();if(value==='overflow')s.baseBytes=12*1024**3;}
    if(value==='baseEnd')P.state.billingToday=[s.baseUntil,...s.periods.map(item=>item.end)].sort().at(-1);
    if(value==='graceEnd')P.state.billingToday=B.shift(B.retention(id).grace,0,0,1);
    P.render();
  }
  /** 推荐发放必须按付款、验收、售后核算顺序；重复节点不会重复奖励。 */
  function referralStage(el) {
    const item=P.state.referrals.find(value=>value.id===el.dataset.id&&value.actor===P.state.actor);if(!item||item.rewarded||item.refunded)return;
    const stage=el.dataset.stage;
    if(stage==='paid')item.paid=true;
    if(stage==='delivered'&&item.paid)item.delivered=true;
    if(stage==='settled'&&item.delivered){item.settled=true;B.grant(item);}
    if(stage==='refunded')item.refunded=true;
    P.render();
  }
  /** 导出仅包含当前账号有权持有的资料，保管到期也不替第三方公开原稿。 */
  function exportOwn() {
    const actor=P.state.actor,items=[...P.state.stories,...(P.state.archiveAssets||[])].filter(item=>item.author===actor||item.subject===actor&&item.scope!=='private'&&item.viewers?.includes(actor)&&(!item.approvedViewers||item.approvedViewers.includes(actor)));
    const blob=new Blob([JSON.stringify({notice:'原型内存资料导出，包含本账号原稿及本人档案；媒体路径不等于云端原文件备份。',person:P.PEOPLE[actor].name,items},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='我的资料迁出清单.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  /** 结算、奖励、退款只由本模块接管，旧按账号会员动作不再存在。 */
  function handleAction(action,el) {
    if(action==='billing-checkout'){checkout(el.dataset.person,el.dataset.kind);return true;}
    if(action==='billing-scenario'){scenario(el.dataset.value,el.dataset.person);return true;}
    if(action==='billing-refund'){B.refund(el.dataset.id);P.render();return true;}
    if(action==='referral-stage'){referralStage(el);return true;}
    if(action==='billing-export'){exportOwn();return true;}
    return false;
  }
  /** 表单绑定账号和状态，重置、切账号或重复提交不能扣另一人的服务金。 */
  function submit(form) {
    if(form.id==='referral-form'){if(form.billingState!==P.state||form.dataset.actor!==P.state.actor)return true;const name=String(new FormData(form).get('name')||'').trim();if(name){P.state.referrals.push({id:P.nextId('referral'),actor:P.state.actor,name,paid:false,delivered:false,settled:false,refunded:false,rewarded:false});P.render();}return true;}
    if(form.id!=='billing-pay-form')return false;
    if(!new FormData(form).get('agree'))return true;
    const order=B.pay(form.billingRequest||{});if(!order)return P.toast('订单状态或金额已改变，请重新核对。'),true;
    P.closeModal();P.render();P.toast('演示服务已确认，未发生真实扣款。');return true;
  }
  document.addEventListener('change',event=>{if(event.target.id==='billing-person'){P.state.billingPeople[P.state.actor]=event.target.value;P.render();}if(event.target.id==='billing-use-credit'){const r=event.target.billingRequest;if(r?.state===P.state&&r.actor===P.state.actor)checkout(r.person,r.kind,event.target.checked,r.bookId);}});
  P.BillingViews={membership,profileSummary,chatQuota,quota,checkout,handleAction,submit};
  Object.assign(P.views,{'billing-plan':plan,rewards,'service-orders':orders});
}
