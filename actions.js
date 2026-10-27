/** 演示交互：只更新内存状态，不发送邀请、不录制麦克风、不发起支付。 */
'use strict';
{
  const P=window.App;
  const {icon:i,button:b,link:l,badge:t,avatar:a,escape:e}=P;
  const SETUP_PRICE=2000;
  /** 展开来源，始终先检查当前角色是否有权读取对应材料。 */
  function source(id='first-order') {
    const item=P.visibleStories().find(x=>x.id===id);
    if (!item) return P.toast('这段原始记录暂未向当前账号开放。');
    P.modal('查看原始记录',`<div class="tags">${t(item.source)}${t('示例材料','gray')}</div><p class="caption">记录人：${e(P.PEOPLE[item.author]?.name || '家人')}<br>记录日期：${e(item.recorded)}</p><div class="source-transcript">${e(item.text.join('\n\n'))}</div><p class="caption">原型展示文字记录，不代表已接入真实录音。</p>${b('朗读这段示例文字','read-transcript','btn secondary full',`data-id="${id}"`)}`);
  }
  /** 系统朗读仅用于辅助演示，明确不会模拟本人原声。 */
  function readTranscript(id) {
    const item=P.visibleStories().find(x=>x.id===id);
    if (!item) return;
    if (!('speechSynthesis' in window)) return P.toast('当前浏览器不支持系统朗读，可以继续查看文字记录。');
    speechSynthesis.cancel();
    const speech=new SpeechSynthesisUtterance(item.text[0]);
    speech.lang='zh-CN';speech.rate=.86;
    speechSynthesis.speak(speech);
    P.toast('正在用系统声音朗读示例文字，并非本人原声。');
  }
  /** 文字回答统一更新会话与无声动作，不让资料追问另外维护第二套消息流。 */
  function completeReply(reply) {
    // 仅在本人已确认、资料仍获授权且问题相同的情况下使用修订答复。
    reply=P.AnswerFeedback.apply(reply);P.state.chatMessages.push(reply);P.render();P.DigitalHuman?.respond(reply.text);
    setTimeout(()=>{const history=document.querySelector('.avatar-conversation');if(history)history.scrollTop=history.scrollHeight;},20);
  }
  /** 当前媒体或章节优先作为话题；显式新记录和故事入口仍可切换到对应故事。 */
  function sendMessage(text,storyId='') {
    const value=text.trim();
    if (!value) return;
    P.state.chatMessages.push({type:'user',text:value});
    if(!storyId && !/刚写|新记录/.test(value)){const contextual=P.ContentChat.reply(value);if(contextual)return completeReply(contextual);}
    const visible=P.visibleStories().filter(item=>item.subject===P.state.chatTarget);
    const wantsLatest=/刚写|新记录/.test(value),latest=wantsLatest?visible.findLast(item=>item.id.startsWith('record-')):null;
    const topic=/创业|订单|最难/.test(value)?'first-order':/书桌|老家|收音机|家书/.test(value)?'old-home':/全家福|春节/.test(value)?'spring':'';
    const id=storyId || (wantsLatest?latest?.id || '':topic || P.state.chatContext?.storyId);
    if(wantsLatest && !storyId)P.state.chatContext=latest?{kind:'story',storyId:latest.id}:null;
    const source=visible.find(item=>item.id===id);
    let reply={type:'unknown',question:value,text:'现有已确认且向你开放的记录尚未覆盖这个问题。可以留给本人慢慢补充。'};
    if(!storyId && !wantsLatest && /困难|建议|怎么做|陪|想你/.test(value))reply={type:'inference',text:'如果眼前有很多事情，不妨先把最重要的一件做扎实。也可以把你的想法讲给家里人听，不必一个人撑着。'};
    else if(source){
      P.state.chatContext={kind:'story',storyId:source.id};
      if(/收音机/.test(value) && !source.text.join('').includes('收音机'))reply.text='已确认的老宅记录讲到了书桌和家书，收音机的具体经历还需要本人补充。';
      else {
        const relation=P.relation('mother'),familyName=P.state.actor==='father'?'林慧':relation==='我'?'你':relation==='家人'?'家人':'你'+relation;
        const text=source.text.join('\n\n').replaceAll('你妈妈',familyName);
        reply={type:'memory',text:source.author===P.state.chatTarget?text:`${P.PEOPLE[source.author].name}的记录提到：${text}`,source:source.id};
      }
    }
    // 历史问题固定当时的资料来源，稍后留问不能跟随后续话题改变。
    if(reply.type==='unknown')reply.storyId=source?.id || '';
    if(reply.type==='memory')reply.sourceLabel=visible.find(item=>item.id===reply.source)?.author===P.state.chatTarget?'据本人记录整理':'据已确认的家庭记录';
    completeReply(reply);
  }
  /** 延迟问答绑定本次来源，切换资料、账号、重置或离页后旧入口不再抢回话题。 */
  function openQuestion(text,storyId='') {
    const s=P.state,actor=s.actor;
    const source=P.visibleStories().find(item=>item.id===storyId),target=source?.subject || 'father';
    if(s.chatTarget!==target)s.chatMessages=[];
    s.chatTarget=target;s.chatContext=storyId?{kind:'story',storyId}:null;P.navigate('chat');
    const context=s.chatContext;
    setTimeout(()=>{if(P.state===s && s.actor===actor && s.route==='chat' && s.chatTarget===target && s.chatContext===context)sendMessage(text,storyId);},0);
  }
  /** 从故事补充入口携带关联来源；已有草稿先留在当前账号，避免被新入口覆盖。 */
  function contribute(storyId) {
    const source=P.visibleStories().find(item=>item.id===storyId);
    if(!source || source.subject!=='father')return P.toast('请从陈远山当前可查看的故事开始补充。');
    captureRecord();
    if(P.state.record.text.trim())return P.modal('你还有一份未完成的记录',`<p>先保存或完成当前草稿，再补充《${e(source.title)}》。</p>${l('继续当前记录','record','btn full')}`);
    P.state.record={...P.emptyRecord(),kind:'contribution',storyId,title:'补充：'+source.title};P.navigate('record');
  }
  /** 录入页和确认页均保存当前输入，回去更正时不丢分享范围或名单。 */
  function captureRecord() {
    const form=document.getElementById('record-form');
    const r=P.state.record;
    if(form?.recordDraft===r){
      const data=new FormData(form);r.title=String(data.get('title') || '');r.text=String(data.get('text') || '');r.eventYear=String(data.get('eventYear') || '');
      r.kind=String(data.get('kind') || 'own');r.storyId=String(data.get('storyId') || '');
    }
    const review=document.getElementById('publish-form');
    if(review?.recordDraft===r){const data=new FormData(review);r.scope=String(data.get('scope'));r.viewers=data.getAll('viewers').filter(id=>P.state.members.includes(id) && id!==P.state.actor);}
  }
  /** 模拟录音状态切换，文字记录始终可用。 */
  function toggleRecord() {
    captureRecord();
    const r=P.state.record;
    if (!r.recording) {r.recording=true;r.paused=false;}
    else r.paused=!r.paused;
    P.render();
  }
  /** 结束录音只形成可编辑草稿，不直接分享。 */
  function stopRecord() {
    captureRecord();
    const r=P.state.record;r.recording=false;r.paused=false;
    if (!r.text.trim()) r.text='今天和家人一起翻看旧照片，又想起老家窗边的那张书桌。很多平时没有讲完的话，我想慢慢留下来。';
    P.render();P.toast('录音演示已结束。请检查下方的示例文字，再保存或更正。');
  }
  /** 将表单草稿留在当前账号内存，或进入整理确认页面。 */
  function saveRecord(event) {
    captureRecord();
    const r=P.state.record;r.recording=false;r.paused=false;
    if (!r.text.trim()) return P.toast('先写下想记录的话，再保存或整理。');
    if(!/^\d{4}$/.test(r.eventYear) || Number(r.eventYear)>new Date().getFullYear() || Number(r.eventYear)<1000)return P.toast('请填写有效的事情发生年份，不晚于今年。');
    if (!r.title.trim()) r.title='今天的一段回忆';
    if (event.submitter?.value==='draft') {P.state.draftSaved=true;P.navigate('profile');P.toast('草稿已保存，仅自己可见。刷新原型会还原。');}
    else {
      if (P.state.failNextRecord) {P.state.failNextRecord=false;P.toast('本次整理未完成，原文字已保留。可以保存草稿或再次尝试。');return;}
      const submit=event.submitter,s=P.state,actor=s.actor;if(submit){submit.disabled=true;submit.textContent='正在整理，请稍候…';}
      setTimeout(()=>{if(P.state!==s || s.actor!==actor || s.record!==r || s.route!=='record')return;r.reviewed=true;P.navigate('review');},450);
    }
  }
  /** 本人记录可直接确认，家人补充共享经历则进入待确认列表。 */
  function publishRecord(form) {
    const data=new FormData(form),r=P.state.record;
    if (!data.get('confirmed')) return;
    if (!r.text.trim()) return P.toast('先记录想留下的话，再确认保存。');
    const scope=String(data.get('scope')),actor=P.state.actor,contribution=r.kind==='contribution' && actor!=='father';
    if(contribution && r.pendingId && !P.state.pending.some(entry=>entry.id===r.pendingId && entry.author===actor && entry.status==='returned'))return P.toast('原补充的状态已经变化，请回到家庭页重新核对。');
    if(!['private','selected','family'].includes(scope))return P.toast('请选择有效的分享范围。');
    const viewers=scope==='family'?[...P.state.members]:scope==='selected'?data.getAll('viewers').filter(id=>P.state.members.includes(id) && id!==actor):[];
    if(scope==='selected' && !viewers.length)return P.toast('请选择至少一位家人，或改为仅自己保存。');
    if(contribution && (scope==='private' || !viewers.includes('father')))return P.toast('补充陈远山的经历需要向本人开放核对；也可以先保存为草稿。');
    const now=new Date(),recorded=`${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;
    if(!/^\d{4}$/.test(r.eventYear) || Number(r.eventYear)>now.getFullYear() || Number(r.eventYear)<1000)return P.toast('请先核对事情发生的年份。');
    const item={id:contribution&&r.pendingId?r.pendingId:P.nextId('record'),title:r.title || '今天的一段回忆',year:r.eventYear,date:`${r.eventYear}年（具体日期未填写）`,recorded,category:contribution?'家人补充':'个人记录',image:'family',author:actor,subject:contribution?'father':actor,scope,text:[r.text],quote:r.text.slice(0,52),source:P.PEOPLE[actor].name+'的记录',duration:r.seconds?P.duration(r.seconds):'文字记录',viewers,storyId:r.storyId,confirmedBy:contribution?null:actor};
    if(contribution){
      P.state.pending=P.state.pending.filter(entry=>entry.id!==r.pendingId);P.state.pending.push({...item,status:'pending',feedback:''});
      P.navigate('family');P.state.record=P.emptyRecord();P.state.draftSaved=false;P.toast('已提交给陈远山核对，确认后才进入他的人生档案。');
    } else {
      P.state.stories.push(item);P.navigate('story/'+item.id);P.state.record=P.emptyRecord();P.state.draftSaved=false;P.toast('记录已确认，并按你选择的范围保存。');
    }
  }
  /** 管理人可协助组织成员，普通成员看到邀请规则。 */
  function invite(personId='',invitationId='') {
    if (P.state.actor!=='father') return P.modal('邀请家人',`<p>当前由家庭管理人陈远山处理邀请。你可以请他为想加入的家人准备邀请卡。</p><div class="note">邀请加入、认领人物、确认关系分别核对；不会自动开放个人私密资料。</div>`);
    const editing=invitationId?P.state.invitations.find(item=>item.id===invitationId && item.status==='pending'):null;
    if(invitationId && !editing)return P.toast('这份邀请已处理，不能继续更正。');
    personId=editing?.personId || personId;
    const available=P.state.members.filter(id=>!P.state.accounts[id] && id!=='grandpa');
    P.modal(editing?'更正待确认邀请':'邀请一位家人',`<form id="invite-form"><input type="hidden" name="inviteId" value="${e(editing?.id || '')}"><div class="form-field"><label for="invite-person">为谁准备邀请？</label><select id="invite-person" name="personId"><option value="">新增一位家人</option>${available.map(id=>`<option value="${id}" ${id===personId?'selected':''}>认领已有人物：${e(P.PEOPLE[id].name)}</option>`).join('')}</select><p class="caption">已在关系图中的家人直接认领原人物，不会重复创建。</p></div><div class="form-field"><label for="invite-name">家人的姓名</label><input id="invite-name" name="name" placeholder="例如：陈晨" maxlength="20" required></div><div class="form-field"><label for="invite-relation">对方是我的……</label><select id="invite-relation" name="relation">${['侄女','儿子','女儿','孙女','孙子','妻子','丈夫','父亲','母亲','兄弟姐妹','其他家人'].map(value=>`<option>${value}</option>`).join('')}</select></div><p class="caption">生成后可预览受邀人需要核对的页面。本原型不会实际发送消息。</p><button class="btn full" type="submit">${editing?'保存更正，重新等待核对':'生成邀请卡'}</button></form>`);
    fillInvitePerson();
    if(editing && !available.includes(editing.personId)){const form=document.getElementById('invite-form');form.elements.name.value=editing.name;form.elements.relation.value=editing.relation;}
  }
  /** 认领既有人物沿用已记录姓名和关系；新增模式允许自由填写。 */
  function fillInvitePerson() {
    const form=document.getElementById('invite-form');if(!form)return;
    const id=form.elements.personId.value,person=P.PEOPLE[id],name=form.elements.name,relation=form.elements.relation;
    name.value=person?.name || '';name.readOnly=Boolean(person);relation.disabled=Boolean(person);
    relation.value=person?P.relation(id,'father'):'侄女';
  }
  /** 创建一个待确认邀请，保留发起人身份。 */
  function createInvite(form) {
    if (P.state.actor!=='father') return;
    const data=new FormData(form),personId=String(data.get('personId') || '');
    const inviteId=String(data.get('inviteId') || ''),editing=P.state.invitations.find(item=>item.id===inviteId && item.status==='pending');
    if(inviteId && !editing)return P.toast('这份邀请已处理，不能保存旧的更正。');
    if(personId && (!P.state.members.includes(personId) || P.state.accounts[personId] || personId==='grandpa'))return P.toast('这位人物当前不需要或不能通过该邀请认领。');
    if(personId && P.state.invitations.some(item=>item.personId===personId && item.status==='pending' && item.id!==inviteId))return P.toast('这位家人已有待核对的认领邀请。');
    const name=personId?P.PEOPLE[personId].name:String(data.get('name') || '').trim();
    if (!name) return;
    const id=editing?.id || P.nextId('invite'),target=personId || (editing && !P.PEOPLE[editing.personId]?editing.personId:P.nextId('guest'));
    const values={id,personId:target,name,relation:personId?P.relation(personId,'father'):String(data.get('relation')),status:'pending',correctionNote:''};
    if(editing)Object.assign(editing,values);else P.state.invitations.push(values);
    P.state.inviteIndex=P.state.invitations.findIndex(item=>item.id===id);P.closeModal();P.navigate('family');
    P.toast(editing?'邀请信息已更正，受邀人需要重新核对三项内容。':'邀请卡已生成，等待受邀人分别确认身份与关系。');
  }
  /** 只接受当前表单指向的邀请，旧表单不能因预览切换而认领另一个人物。 */
  function acceptInvite(form) {
    const data=new FormData(form),item=P.state.invitations.find(entry=>entry.id===String(data.get('inviteId') || ''));
    if (!item || item.status!=='pending' || item.correctionNote || !['join','claim','relation'].every(x=>data.get(x))) return;
    const id=item.personId;if(P.state.accounts[id])return P.toast('这位人物已经认领账号，请直接切换到该账号。');
    item.status='accepted';
    if(!P.PEOPLE[id])P.PEOPLE[id]={name:item.name,short:item.name.slice(0,1),relation:item.relation,born:'',color:'sand'};
    P.state.accounts[id]=P.newAccount();
    if(!P.state.members.includes(id))P.state.members.push(id);P.state.inviteIndex=null;P.changeActor(id);P.navigate('home');
    P.toast('受邀人已核对并加入。当前正在预览该家人的账号。');
  }
  /** 人物详情不会将亲属关系视为私人资料访问许可。 */
  function person(id) {
    const p=P.PEOPLE[id];
    if (!p) return;
    P.modal(p.name,`<div class="person-modal-top">${a(id,'large')}<div><h3>${e(p.name)}</h3><p class="caption">${e(P.relation(id))}${p.born?' · '+p.born+'年生':''}</p>${t(id==='grandpa'?'家人记载':'关系已确认',id==='grandpa'?'gray':'')}</div></div><p>${id==='father'?'可以查看已分享的人生记录，也可以与已授权的数字人交流。':id==='grandpa'?'历史人物资料由家人整理，保留记录者身份。这里没有默认建立逝者数字人。':'你们可以一起补充共同经历。本人尚未建立或向你开放数字人服务。'}</p>${l('查看'+e(p.name)+'的完整档案','life/'+id,'btn full')}${id==='father'?l('与他的数字人聊聊','chat','text-link full'):''}${P.state.actor==='father' && !P.state.accounts[id] && id!=='grandpa'?b('邀请本人认领已有人物','invite-claim','btn secondary full',`data-id="${id}"`):''}<p class="caption section">管理身份和亲属称呼不代表可以查看全部个人资料。</p>`);
  }
  /** 选择会员前清楚列出当前权益、差价和一次性建档范围。 */
  function checkout(planId) {
    const ac=P.account(),plan=P.PLANS[planId];
    if (ac.plan===planId) return;
    if (ac.plan==='legacy') return P.modal('下一年度的会员安排','<p>当前年度的传承会员继续有效。正式产品会在续费时确认下一年度方案，本原型不进行降级扣款。</p>');
    const current=P.PLANS[ac.plan];
    const price=Math.max(0,plan.price-current.price);
    const setup=planId==='legacy'&&!ac.hasDigital&&!ac.setupIncluded?SETUP_PRICE:0;
    P.state.checkout={actor:P.state.actor,planId,price,setup};
    P.modal('核对这次开通',`<p>服务账号：<strong>${e(P.PEOPLE[P.state.actor].name)}</strong></p><div class="checkout-price"><span>${plan.name}${ac.plan==='personal'?'升级差额':''}</span><span>¥${price.toLocaleString()}</span></div><div class="checkout-price"><span>首次数字人基础建档</span><span>${setup?'¥'+setup.toLocaleString():ac.setupIncluded?'订单已含，不重复收费':'本次不收取'}</span></div><div class="checkout-price total"><span>本次合计</span><span>¥${(price+setup).toLocaleString()}</span></div><p class="caption">演示有效期至 2027年10月26日。已付费升级按完整年度差额模拟；正式按剩余服务期限核算。价格与权益待验证。</p><form id="checkout-form"><label class="check-row"><input type="checkbox" name="agree" required><span>我已核对账号、服务范围和一次性费用，了解本次为演示开通。</span></label><button class="btn full" type="submit">确认演示开通</button></form>`);
  }
  /** 演示开通只改变当前账号的会员状态，不执行真实付款。 */
  function completeCheckout(form) {
    if (!new FormData(form).get('agree') || P.state.checkout?.actor!==P.state.actor) return;
    const ac=P.account(),order=P.state.checkout;
    ac.plan=order.planId;
    if (order.setup) ac.setupOrdered=true;
    P.state.checkout=null;P.closeModal();P.render();P.toast('演示会员已开通。未发生真实扣款；数字人建档需另行确认资料。');
  }
  /** 仅允许资料本人更改其已有故事的可见范围。 */
  function share(id) {
    const item=P.state.stories.find(x=>x.id===id && x.author===P.state.actor);
    if (!item) return P.toast('这段资料的分享范围由本人决定。');
    P.state.shareStoryId=id;
    P.modal('这段故事分享给谁',`<p>${e(item.title)}</p><form id="share-form"><div class="privacy-options">${[['private','仅自己'],['selected','指定家人，按下方名单选择'],['family','当前家庭的家人']].map(([key,name])=>`<label><input type="radio" name="scope" value="${key}" ${item.scope===key?'checked':''}>${name}</label>`).join('')}</div>${P.shareViewerOptions(item.viewers)}<p class="caption">仅“指定家人”使用下方勾选名单；“当前家庭”以保存时成员范围为准，不自动授予未来加入的家人。</p><button class="btn full" type="submit">确认分享范围</button></form>`);
  }
  /** 对当前家庭的分享固定到本次成员名单，新增成员不会悄悄扩大访问。 */
  function applyShare(form) {
    const item=P.state.stories.find(x=>x.id===P.state.shareStoryId && x.author===P.state.actor);
    if (!item) return;
    const data=new FormData(form),scope=String(data.get('scope'));
    if(!['private','selected','family'].includes(scope))return;
    const viewers=scope==='family'?[...P.state.members]:scope==='selected'?data.getAll('viewers').filter(id=>P.state.members.includes(id) && id!==P.state.actor):[];
    if(scope==='selected' && !viewers.length)return P.toast('请选择至少一位家人，或改为仅自己。');
    item.scope=scope;item.viewers=viewers;
    P.closeModal();P.render();P.toast('分享范围已更新，不影响其他家人的独立记录。');
  }
  /** 待处理数量按当前本人或内容提供者计算，不把全部申请只交给家庭管理人。 */
  function pendingCount() {
    const s=P.state;
    return s.pending.filter(item=>item.status==='pending' && item.subject===s.actor).length+s.accessRequests.filter(request=>request.status==='pending' && s.stories.some(item=>item.id===request.storyId && item.author===s.actor)).length;
  }
  /** 本人可确认家人补充；查看申请始终交给该内容的分享控制人。 */
  function pending() {
    const additions=P.state.pending.filter(item=>item.status==='pending' && item.subject===P.state.actor).map(x=>`<div class="pending-item"><strong>${e(x.title)}</strong><p>${e(P.PEOPLE[x.author]?.name || '家人')}补充：${e(x.text[0])}</p><p class="caption">分享：${x.scope==='family'?'提交时的家庭成员':x.viewers.map(id=>e(P.PEOPLE[id].name)).join('、')}</p>${b('核对并加入档案','approve-pending','btn compact',`data-id="${x.id}"`)} ${b('退回更正','return-pending','text-link',`data-id="${x.id}"`)}</div>`).join('');
    const requests=P.state.accessRequests.filter(x=>x.status==='pending' && P.state.stories.some(item=>item.id===x.storyId && item.author===P.state.actor)).map(x=>`<div class="pending-item"><strong>查看申请</strong><p>${e(P.PEOPLE[x.actor].name)}希望查看《${e(P.state.stories.find(item=>item.id===x.storyId).title)}》。</p>${b('仅向这位家人开放','approve-access','btn compact',`data-id="${x.id}"`)} ${b('暂不开放','deny-access','text-link',`data-id="${x.id}"`)}</div>`).join('');
    P.modal('家人的补充与申请',additions+requests || '<p>暂时没有需要确认的内容。</p>');
  }
  /** 确认后进入档案并标明确认者；退回会保留原稿给提供者继续更正。 */
  function reviewPending(id,approve) {
    const item=P.state.pending.find(entry=>entry.id===id && entry.subject===P.state.actor && entry.status==='pending');
    if(!item)return;
    if(approve){P.state.pending=P.state.pending.filter(entry=>entry.id!==id);const {status,feedback,...story}=item;P.state.stories.push({...story,confirmedBy:P.state.actor});}
    else {item.status='returned';item.feedback='请再核对这段经历的时间、人物与经过，修改后重新提交。';}
    P.closeModal();P.render();P.toast(approve?'已确认补充，保留提供者与原分享范围。':'已退回提供者更正，原稿没有丢失。');
  }
  /** 提供者只能更正自己被退回的补充，避免覆盖仍在核对中的材料。 */
  function editPending(id) {
    const item=P.state.pending.find(entry=>entry.id===id && entry.author===P.state.actor && entry.status==='returned');
    if(!item)return;
    captureRecord();if(P.state.record.text.trim())return P.toast('请先保存或完成当前草稿，再更正退回的补充。');
    P.state.record={...P.emptyRecord(),title:item.title,text:item.text.join('\n\n'),eventYear:item.year,scope:item.scope,viewers:[...item.viewers],kind:'contribution',storyId:item.storyId,pendingId:item.id};P.navigate('record');
  }
  /** 重复查看申请不会不断堆积；不存在或已获授权的内容不创建申请。 */
  function requestAccess() {
    const s=P.state;
    if(!s.stories.some(item=>item.id===s.storyId) || P.visibleStories().some(item=>item.id===s.storyId))return P.toast('当前不需要申请这段内容。');
    if(!s.accessRequests.some(item=>item.actor===s.actor && item.storyId===s.storyId && item.status==='pending'))s.accessRequests.push({id:P.nextId('access'),actor:s.actor,storyId:s.storyId,status:'pending'});
    P.render();P.toast('申请已提交给内容提供者，授权前仍无法查看。');
  }
  /** 授权只增加申请人；拒绝申请不会扩大原有可见范围。 */
  function decideAccess(id,approve) {
    const request=P.state.accessRequests.find(entry=>entry.id===id && entry.status==='pending');
    const item=P.state.stories.find(story=>story.id===request?.storyId && story.author===P.state.actor);
    if(!request || !item)return;
    request.status=approve?'accepted':'declined';
    if(approve){item.scope='selected';item.viewers=[...new Set([...item.viewers,request.actor])];}
    P.closeModal();P.render();P.toast(approve?'已仅向申请人开放。':'本次暂不开放，原有分享范围保持不变。');
  }
  /** 将获准导出的本人记录作为本地示例 JSON 下载。 */
  function exportRecords() {
    const items=P.state.stories.filter(x=>x.author===P.state.actor);
    const blob=new Blob([JSON.stringify({notice:'示例人物与材料，静态原型导出',person:P.PEOPLE[P.state.actor].name,records:items},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),anchor=document.createElement('a');
    anchor.href=url;anchor.download='人生记录-原型示例导出.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    P.toast('已导出当前账号的示例记录。');
  }
  /** 统一派发按钮动作；新增动作应保持与其界面文案一致。 */
  function act(action,el) {
    const s=P.state;
    if(P.KeepsakeBooks.handleAction(action,el))return;
    if(P.MaterialLibrary.handleAction(action,el)||P.AnswerFeedback.handleAction(action,el)||P.RelationshipChapters.handleAction(action,el))return;
    if(P.ContentChat.handleAction(action,el))return;
    if(P.PersonArchive?.handleAction(action,el))return;
    if(P.MemorySpace?.handleAction(action,el))return;
    if(P.QuestionInbox?.handleAction(action,el))return;
    if(P.DigitalHuman?.handleAction(action,el))return;
    const simple={invite,pending,'record-toggle':toggleRecord,'record-stop':stopRecord,'request-access':requestAccess,export:exportRecords};
    if (simple[action]) return simple[action]();
    if (action==='source' || action==='listen') return source(el.dataset.id || 'first-order');
    if (action==='read-transcript') return readTranscript(el.dataset.id);
    if (action==='invite-claim') return invite(el.dataset.id);
    if (action==='invite-person-change') return fillInvitePerson();
    if (action==='edit-invite') return invite('',el.dataset.id);
    if (action==='revoke-invite') {const item=s.invitations.find(entry=>entry.id===el.dataset.id && entry.status==='pending');if(s.actor==='father' && item){item.status='revoked';P.render();P.toast('邀请已撤回，不会新增账号或成员。');}return;}
    // 首页图谱直接打开现有关系树，不另存成员或改变资料授权。
    if (action==='home-family-tree') {s.familyTab='关系树';return P.navigate('family');}
    if (action==='family-tab') {s.familyTab=el.dataset.value;return P.render();}
    if (action==='tree-zoom') {s.treeZoom=Math.min(1.5,Math.max(.75,(s.treeZoom || 1)+Number(el.dataset.value)*.15));return P.render();}
    if (action==='tree-center') {s.treeZoom=1;P.render();const tree=document.querySelector('.family-tree');if(tree)tree.scrollLeft=0;return;}
    if (action==='person') return person(el.dataset.id);
    if (action==='enter-owner') {P.changeActor('father');return P.navigate('home');}
    if (action==='enter-family') {P.changeActor('xia');return P.navigate('home');}
    if (action==='video-service') return P.modal('视频服务与开通条件','<p>当前方案以约 ¥15,000 的视频服务作为 APP 开通入口；这是视频服务收费，不是制作成本。</p><p>完成交付后可开通家庭空间，家人受邀加入。APP 会员与定制增购另行报价，已在订单中包含的权益不重复购买。</p><p class="caption">本页为产品规则示例，具体报价与交付范围由实际订单确认。</p>');
    if (action==='choose-plan') return checkout(el.dataset.plan);
    if (action==='share-owned') return share(el.dataset.id);
    if (action==='share-story') return share(s.storyId);
    if (action==='save-story') {if(!P.visibleStories().some(item=>item.id===s.storyId))return P.toast('这段故事暂未开放，不能收藏。');s.saved=s.saved.includes(s.storyId)?s.saved.filter(x=>x!==s.storyId):[...s.saved,s.storyId];P.render();return P.toast(s.saved.includes(s.storyId)?'已收藏这段故事。':'已取消收藏。');}
    if (action==='ask-order' || action==='ask-advice') return openQuestion(action==='ask-order'?'第一次创业时最担心什么？':'遇到困难时，你会怎么做？',action==='ask-order'?'first-order':'');
    if (action==='ask-story') {const item=P.visibleStories().find(story=>story.id===s.storyId && story.subject==='father');if(item)return openQuestion(`讲讲《${item.title}》这段经历。`,item.id);return P.toast('这段经历尚未作为该数字人的获授权资料。');}
    if (action==='ask-space') {const id=el.dataset.id || s.hotspot,item=P.MemorySpace.items()[id];if(item)return openQuestion(`讲讲${id==='radio'?'老家的收音机':item.title}。`,item.source);return;}
    if (action==='contribute-story') return contribute(el.dataset.id);
    if (action==='focus-chat') return document.getElementById('chat-input')?.focus();
    if (action==='preview-invite') {s.inviteIndex=Number(el.dataset.index);return P.navigate('invitation');}
    if (action==='correct-invite') {const item=s.invitations[s.inviteIndex || 0];if(item?.status==='pending'){item.correctionNote='姓名、人物或关系需要更正，邀请人修改后请重新核对。';P.render();P.toast('更正请求已保存在当前演示，尚未加入家庭。');}return;}
    if (action==='approve-pending' || action==='return-pending') return reviewPending(el.dataset.id,action==='approve-pending');
    if (action==='edit-pending') return editPending(el.dataset.id);
    if (action==='approve-access' || action==='deny-access') return decideAccess(el.dataset.id,action==='approve-access');
    if (action==='toggle-font') return P.toggleFont();
    if (action==='clear-chat-context') {s.chatContext=null;return P.render();}
    // 首页自由聊天结束旧资料话题；跨人物时清空旧对话，输入草稿仍由数字人模块按账号保存。
    if (action==='home-chat') {if(s.chatTarget!=='father')s.chatMessages=[];s.chatTarget='father';s.chatContext=null;return P.navigate('chat');}
    if (action==='home-ask-story') {const item=P.visibleStories().find(story=>story.id===el.dataset.id && story.subject==='father');if(item)return openQuestion(`讲讲《${item.title}》这段经历。`,item.id);return P.toast('这段经历暂未向你开放。');}
    if (action==='choose-person') return P.modal('选择交流的人物',`<div class="family-selector"><button data-action="close-modal">${a('father')}<span>爸爸的数字人<small>陈远山 · 已获授权</small></span>${i('check')}</button><button data-action="unavailable-person">${a('mother')}<span>妈妈 · 林慧<small>尚未建立或开放数字人</small></span>${i('lock')}</button></div>`);
    if (action==='unavailable-person') return P.toast('这位家人尚未建立或向你开放数字人服务。');
    if (action==='close-modal') return P.closeModal();
  }
  /** 表单只提交到本地演示动作。 */
  function submit(event) {
    event.preventDefault();
    const form=event.target;
    if(P.KeepsakeBooks.submit(form))return;
    if(P.MaterialLibrary.submit(form,event)||P.AnswerFeedback.submit(form,event)||P.RelationshipChapters.submit(form,event))return;
    if(P.QuestionInbox?.submit(form))return;
    if (form.id==='chat-form') {const text=String(new FormData(form).get('message') || '');if(text.trim()){P.DigitalHuman.clearDraft();return sendMessage(text);}return;}
    if (form.id==='record-form') return saveRecord(event);
    if (form.id==='publish-form') return publishRecord(form);
    if (form.id==='invite-form') return createInvite(form);
    if (form.id==='accept-invite-form') return acceptInvite(form);
    if (form.id==='checkout-form') return completeCheckout(form);
    if (form.id==='share-form') return applyShare(form);
  }
  P.act=act;P.submit=submit;P.captureRecord=captureRecord;P.sendChatMessage=sendMessage;P.pendingCount=pendingCount;
}


