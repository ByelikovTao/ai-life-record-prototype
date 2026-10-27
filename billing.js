/** 人物年度服务：唯一维护共享额度、保管期限、订单与推荐服务金；所有状态仅用于内存演示。 */
'use strict';
{
  const P=window.App;
  const RULES=Object.freeze({annual:699,setup:2000,custody:199,qa:1200,organize:24,textLimit:5000,memberGB:20,basicGB:10,basicYears:5,graceDays:90,reward:600,rewardMonths:48,renewCredit:200,productionRate:.2,productionCredit:600});
  /** 日期按日历年、月顺延，闰日和月末落到目标月份的最后一天。 */
  function shift(date,years=0,months=0,days=0) {const d=new Date(date+'T12:00:00Z'),day=d.getUTCDate();d.setUTCDate(1);d.setUTCFullYear(d.getUTCFullYear()+years);d.setUTCMonth(d.getUTCMonth()+months);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last)+days);return d.toISOString().slice(0,10);}
  /** 演示时钟可在评审工具中推进，不修改电脑时间或客户真实订阅。 */
  function today() {return P.state.billingToday;}
  /** 人物服务与账号分离，家人加入不会生成第二份订阅或新增额度。 */
  function service(person) {
    const s=P.state;if(!s.accounts[person]?.videoDelivered)return null;
    return s.personServices[person] ||= {person,baseUntil:shift(s.billingSeedDate,RULES.basicYears),custodyUntil:'',baseBytes:6*1024**3,periods:person==='father'?[{start:s.billingSeedDate,end:shift(s.billingSeedDate,1),qaUsed:126,organizeUsed:2}]:[]};
  }
  /** 到期日为下一周期起点；提前续费只添加未来年度，不重置当前用量。 */
  function period(person) {return service(person)?.periods.find(item=>item.start<=today()&&today()<item.end)||null;}
  /** 会员、基础保管和纯保管分别算到期日，90天迁出窗口从最后保管日开始。 */
  function retention(person) {const s=service(person);if(!s)return {until:'',grace:'',online:true};const until=[s.baseUntil,s.custodyUntil,...s.periods.map(item=>item.end)].filter(Boolean).sort().at(-1);return {until,grace:shift(until,0,0,RULES.graceDays),online:today()<shift(until,0,0,RULES.graceDays)};}
  /** 保管停止后仍保留内存原稿供明确导出迁出，不静默删除或产生新授权。 */
  function online(person) {return retention(person).online;}
  /** 当前可上传容量回落至基础额度；迁出窗口仅允许查看和导出。 */
  function capacity(person) {const s=service(person);if(!s)return RULES.basicGB;if(period(person))return RULES.memberGB;return today()<[s.baseUntil,s.custodyUntil].sort().at(-1)?RULES.basicGB:0;}
  /** 已归档材料按原文件大小计入人物容量，更正同一条资料时扣除原版本。 */
  function storage(person,excluding='') {return (service(person)?.baseBytes||0)+(P.state.archiveAssets||[]).filter(item=>item.subject===person&&item.id!==excluding).reduce((sum,item)=>sum+(item.storageBytes||0),0);}
  /** 存储上限只阻止新增归档，不因超额自动删除旧资料。 */
  function uploadAllowed(person,bytes=0,excluding='') {return !service(person)||storage(person,excluding)+bytes<=capacity(person)*1024**3;}
  /** 超容量的处理窗口从会员或保管到期日起算，后续明确清理前不静默删除。 */
  function overflowDeadline(person) {const s=service(person);if(!s||period(person)||storage(person)<=capacity(person)*1024**3)return '';const last=s.periods.filter(item=>item.end<=today()).map(item=>item.end).sort().at(-1)||retention(person).until;return shift(last,0,0,RULES.graceDays);}
  /** AI使用权限仍取原有授权；付款和共享余额均不替代本人授权。 */
  function canUse(person,kind='qa') {const p=period(person);return Boolean(p&&P.state.accounts[person]?.hasDigital&&P.FamilyContext.allowed(person,'digital')&&p[kind+'Used']<RULES[kind]);}
  /** 成功结果按请求编号计一次；失败、手动回复和确认后的修订回看不扣。 */
  function consume(person,kind,id) {
    if(P.state.usageReceipts.includes(id))return true;
    if(!canUse(person,kind))return false;
    const p=period(person);p[kind+'Used']++;P.state.usageReceipts.push(id);return true;
  }
  /** 余额只属于当前奖励持有人，过期部分不能用于新订单。 */
  function wallet(actor=P.state.actor) {return P.state.rewardLedger.filter(item=>item.actor===actor&&item.expires>today()&&item.left>0);}
  /** 服务金不提现，不通过查看其他成员余额泄露推荐活动。 */
  function balance(actor=P.state.actor) {return wallet(actor).reduce((sum,item)=>sum+item.left,0);}
  /** 一笔推荐项目需完成付款、验收和售后核算，且无退款，才能产生一次奖励。 */
  function grant(referral) {
    if(referral.actor!==P.state.actor||!referral.paid||!referral.delivered||!referral.settled||referral.refunded||referral.rewarded)return false;
    referral.rewarded=true;P.state.rewardLedger.push({id:P.nextId('reward'),actor:referral.actor,source:referral.id,amount:RULES.reward,left:RULES.reward,issued:today(),expires:shift(today(),0,RULES.rewardMonths)});return true;
  }
  /** 按先到期先使用记账，退款沿原有效期退回，不把服务金变成现金。 */
  function spend(amount) {const entries=[];for(const item of wallet().sort((a,b)=>a.expires.localeCompare(b.expires))){const used=Math.min(amount,item.left);item.left-=used;amount-=used;if(used)entries.push({id:item.id,amount:used,expires:item.expires});if(!amount)break;}return entries;}
  /** 只对已完成本人拍摄的人物开单；受邀家人可代付，不建立其自己的数字人。 */
  function quote(person,kind,useCredit=false,bookId='') {
    const s=service(person);if(!s||!P.FamilyContext.authorized(person,'archive'))return null;
    let price,setup=0,start,end,cap=0;
    if(kind==='annual'){
      start=[today(),...s.periods.map(item=>item.end)].sort().at(-1);end=shift(start,1);price=RULES.annual;
      setup=!P.state.accounts[person].hasDigital&&!P.state.accounts[person].setupIncluded&&!P.state.accounts[person].setupOrdered?RULES.setup:0;
      const remaining=RULES.renewCredit-P.state.billingOrders.filter(item=>!item.refunded&&item.person===person&&item.kind==='annual'&&item.start===start).reduce((sum,item)=>sum+item.credit,0);cap=Math.max(0,remaining);
    }else if(kind==='custody'){
      if(period(person)||today()<[s.baseUntil,s.custodyUntil].sort().at(-1))return null;
      start=today();end=shift(start,1);price=RULES.custody;
    }else if(kind==='book'){
      const book=P.state.keepsakeBooks.find(item=>item.id===bookId&&item.subject===person&&item.creator===P.state.actor&&item.phase==='quote');
      if(!book||!P.KeepsakeBooks.ready(book))return null;
      price=P.KeepsakeBooks.FEES.editing;cap=Math.min(Math.floor(price*RULES.productionRate),RULES.productionCredit);
    }else return null;
    const credit=useCredit?Math.min(balance(),cap):0;
    return {person,kind,price,setup,start,end,credit,cash:price+setup-credit,bookId};
  }
  /** 结算重新核验价格、额度、账号和对象；重复表单不能重复扣余额或续费。 */
  function pay(request) {
    if(request.state!==P.state||request.actor!==P.state.actor||request.paid)return null;
    const q=quote(request.person,request.kind,request.useCredit,request.bookId);
    if(!q||JSON.stringify(q)!==request.fingerprint)return null;
    const order={...q,id:P.nextId('service-order'),actor:P.state.actor,date:today(),credits:spend(q.credit),refunded:false};
    if(q.kind==='annual'){service(q.person).periods.push({start:q.start,end:q.end,qaUsed:0,organizeUsed:0});if(q.setup)P.state.accounts[q.person].setupOrdered=true;}
    if(q.kind==='custody')service(q.person).custodyUntil=q.end;
    if(q.kind==='book'){const book=P.state.keepsakeBooks.find(item=>item.id===q.bookId);book.paid.editing=true;book.billingOrderId=order.id;book.phase='editing';}
    request.paid=true;P.state.billingOrders.push(order);return order;
  }
  /** 撤销入口只提供给最后一段未开始且未使用的年度，避免留下断开的后续订单。 */
  function refundable(order) {const s=service(order.person),p=s?.periods.find(item=>item.start===order.start&&item.end===order.end);return Boolean(order.actor===P.state.actor&&!order.refunded&&order.kind==='annual'&&order.start>today()&&p&&!p.qaUsed&&!p.organizeUsed&&!s.periods.some(item=>item.start>=order.end));}
  /** 仅未开始的年度可在本演示撤销；已使用服务或制作退款由既有售后流程核算。 */
  function refund(id) {
    const order=P.state.billingOrders.find(item=>item.id===id);if(!order||!refundable(order))return false;
    const s=service(order.person);s.periods=s.periods.filter(item=>item.start!==order.start||item.end!==order.end);order.refunded=true;
    for(const used of order.credits){const entry=P.state.rewardLedger.find(item=>item.id===used.id);if(entry)entry.left+=used.amount;}
    if(order.setup&&!P.state.accounts[order.person].hasDigital&&!P.state.billingOrders.some(item=>item.person===order.person&&item.setup&&!item.refunded))P.state.accounts[order.person].setupOrdered=false;
    return true;
  }
  P.Billing={RULES,shift,today,service,period,retention,online,capacity,storage,uploadAllowed,overflowDeadline,canUse,consume,wallet,balance,grant,quote,pay,refundable,refund};
}
