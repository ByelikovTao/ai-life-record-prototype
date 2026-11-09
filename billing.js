/** 人物年度服务：唯一维护共享额度、保管期限与服务订单；所有状态仅用于内存演示。 */
'use strict';
{
  const P=window.App;
  const RULES=Object.freeze({annual:399,setup:2000,qa:1200,organize:24,textLimit:5000,memberGB:20,basicGB:10,basicYears:5,graceDays:90});
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
  /** 基础保管、已购旧保管和年度服务取最晚到期日，90天迁出窗口从该日开始。 */
  function retention(person) {const s=service(person);if(!s)return {until:'',grace:'',online:true};const until=[s.baseUntil,s.custodyUntil,...s.periods.map(item=>item.end)].filter(Boolean).sort().at(-1);return {until,grace:shift(until,0,0,RULES.graceDays),online:today()<shift(until,0,0,RULES.graceDays)};}
  /** 保管停止后仍保留内存原稿供明确导出迁出，不静默删除或产生新授权。 */
  function online(person) {return retention(person).online;}
  /** 当前可上传容量回落至基础额度；迁出窗口仅允许查看和导出。 */
  function capacity(person) {const s=service(person);if(!s)return RULES.basicGB;if(period(person))return RULES.memberGB;return today()<[s.baseUntil,s.custodyUntil].sort().at(-1)?RULES.basicGB:0;}
  /** 已归档材料按原文件大小计入人物容量，更正同一条资料时扣除原版本。 */
  function storage(person,excluding='') {return (service(person)?.baseBytes||0)+(P.state.archiveAssets||[]).filter(item=>item.subject===person&&item.id!==excluding).reduce((sum,item)=>sum+(item.storageBytes||0),0);}
  /** 存储上限只阻止新增归档，不因超额自动删除旧资料。 */
  function uploadAllowed(person,bytes=0,excluding='') {return !service(person)||storage(person,excluding)+bytes<=capacity(person)*1024**3;}
  /** 容量回落按最近年度到期日算超额窗口。保管全部到期后使用最终迁出期限。 */
  function overflowDeadline(person) {
    const s=service(person),limit=capacity(person);
    if(!s||period(person)||storage(person)<=limit*1024**3)return '';
    const archive=retention(person);
    if(!archive.online)return '';
    if(!limit)return archive.grace;
    const lastAnnualEnd=s.periods.filter(item=>item.end<=today()).map(item=>item.end).sort().at(-1);
    return shift(lastAnnualEnd||archive.until,0,0,RULES.graceDays);
  }
  /** AI使用权限仍取原有授权；付款和共享余额均不替代本人授权。 */
  function canUse(person,kind='qa') {const p=period(person);return Boolean(p&&P.state.accounts[person]?.hasDigital&&P.FamilyContext.allowed(person,'digital')&&p[kind+'Used']<RULES[kind]);}
  /** 成功结果按请求编号计一次；失败、手动回复和确认后的修订回看不扣。 */
  function consume(person,kind,id) {
    if(P.state.usageReceipts.includes(id))return true;
    if(!canUse(person,kind))return false;
    const p=period(person);p[kind+'Used']++;P.state.usageReceipts.push(id);return true;
  }
  /** 仅允许为已授权且确有独立建档需要的人物选购，建档已包含或已预约时不重复收费。 */
  function canOrderSetup(person) {
    const account=P.state.accounts[person];
    return Boolean(account&&P.FamilyContext.authorized(person,'archive')&&!account.hasDigital&&!account.setupIncluded&&!account.setupOrdered);
  }
  /** 年度服务统一包含AI和档案保管，只有主动选择时才计入独立数字人建档。 */
  function quote(person,kind,bookId='',includeSetup=false) {
    const s=service(person);if(!s||!P.FamilyContext.authorized(person,'archive'))return null;
    if(includeSetup===true&&(kind!=='annual'||!canOrderSetup(person)))return null;
    const setup=includeSetup===true?RULES.setup:0;
    let price,start,end;
    if(kind==='annual'){
      start=[today(),...s.periods.map(item=>item.end)].sort().at(-1);end=shift(start,1);price=RULES.annual;
    }else if(kind==='book'){
      const book=P.state.keepsakeBooks.find(item=>item.id===bookId&&item.subject===person&&item.creator===P.state.actor&&item.phase==='quote');
      if(!book||!P.KeepsakeBooks.ready(book))return null;
      price=P.KeepsakeBooks.FEES.editing;
    }else return null;
    return {person,kind,price,setup,start,end,cash:price+setup,bookId};
  }
  /** 结算重新核验金额、付款账号和服务对象，防止重复支付或续费。 */
  function pay(request) {
    if(request.state!==P.state||request.actor!==P.state.actor||request.paid)return null;
    const q=quote(request.person,request.kind,request.bookId,request.includeSetup);
    if(!q||JSON.stringify(q)!==request.fingerprint)return null;
    const order={...q,id:P.nextId('service-order'),actor:P.state.actor,date:today(),refunded:false};
    if(q.kind==='annual'){service(q.person).periods.push({start:q.start,end:q.end,qaUsed:0,organizeUsed:0});if(q.setup)P.state.accounts[q.person].setupOrdered=true;}
    if(q.kind==='book'){const book=P.state.keepsakeBooks.find(item=>item.id===q.bookId);book.paid.editing=true;book.billingOrderId=order.id;book.phase='editing';}
    request.paid=true;P.state.billingOrders.push(order);return order;
  }
  /** 撤销入口只提供给最后一段未开始且未使用的年度，避免留下断开的后续订单。 */
  function refundable(order) {const s=service(order.person),p=s?.periods.find(item=>item.start===order.start&&item.end===order.end);return Boolean(order.actor===P.state.actor&&!order.refunded&&order.kind==='annual'&&order.start>today()&&p&&!p.qaUsed&&!p.organizeUsed&&!s.periods.some(item=>item.start>=order.end));}
  /** 仅未开始的年度可在本演示撤销；已使用服务或制作退款由既有售后流程核算。 */
  function refund(id) {
    const order=P.state.billingOrders.find(item=>item.id===id);if(!order||!refundable(order))return false;
    const s=service(order.person);s.periods=s.periods.filter(item=>item.start!==order.start||item.end!==order.end);order.refunded=true;
    if(order.setup&&!P.state.accounts[order.person].hasDigital&&!P.state.billingOrders.some(item=>item.person===order.person&&item.setup&&!item.refunded))P.state.accounts[order.person].setupOrdered=false;
    return true;
  }
  P.Billing={RULES,shift,today,service,period,retention,online,capacity,storage,uploadAllowed,overflowDeadline,canUse,consume,canOrderSetup,quote,pay,refundable,refund};
}
