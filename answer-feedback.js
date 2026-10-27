/** 数字人回答纠正：冻结原回答与来源，反馈由本人核对，修订答复不静默改写原始资料。 */
'use strict';
{
  const P=window.App,{escape:e,button:b,link:l,badge:t}=P;
  const REASONS={fact:'事实不对',style:'表达不像本人',addition:'需要补充'};
  /** 来源取自这条历史回答，不跟随后来切换的资料或人物改变。 */
  function reference(message) {return P.ContentChat.reference(message.contentSource || (message.source||message.storyId?{kind:'story',storyId:message.source||message.storyId}:null));}
  /** 原资料撤回时停用相关反馈正文及修订答复，不因处理反馈扩大原权限。 */
  function available(item) {return !item.ref || Boolean(P.ContentChat.resolve(item.ref));}
  /** 反馈只在提交者与数字人本人之间流转，第三位家人没有查看权。 */
  function entries() {return P.state.answerFeedback.filter(item=>item.from===P.state.actor||item.owner===P.state.actor);}
  /** 每条历史回复使用稳定编号，避免旧按钮按消息位置指向另一条回答。 */
  function tools(message) {
    if(message.type==='user')return '';
    if(message.type==='corrected'&&!readable(message))return '';
    if(!P.state.chatMessages.includes(message))return '';
    if(!message.feedbackKey)message.feedbackKey=P.nextId('answer');
    const items=entries().filter(item=>item.answerKey===message.feedbackKey&&item.from===P.state.actor),latest=items.at(-1);
    const notice=latest?`<p class="caption">${latest.status==='pending'?'纠正已提交，等待本人核对':latest.status==='accepted'?'本人已确认修订答复':'本人已说明处理意见'}</p>${l('查看处理结果','corrections','text-link')}`:'';
    return `<div class="answer-feedback-tools">${notice}${b('纠正或补充这条回答','answer-feedback','text-link',`data-feature-action data-key="${message.feedbackKey}" data-actor="${P.state.actor}"`)}</div>`;
  }
  /** 尚未提交的建议属于当前账号，重绘与字号变化不会清空；重置后的旧表单失效。 */
  function capture() {
    const form=document.getElementById('answer-feedback-form');
    if(form?.featureState===P.state&&form.dataset.actor===P.state.actor){const r=P.state.feedbackDrafts[P.state.actor];if(r){const data=new FormData(form);r.reason=String(data.get('reason')||'fact');r.suggestion=String(data.get('suggestion')||'');}}
    const review=document.getElementById('answer-review-form');
    if(review?.featureState===P.state&&review.dataset.actor===P.state.actor){const data=new FormData(review);P.state.feedbackReviewDrafts[review.dataset.id]={text:String(data.get('text')||''),note:String(data.get('note')||'')};}
  }
  /** 建立反馈草稿时记录当时的问题、回答、人物和来源，之后不再从实时话题推断。 */
  function open(el,discard=false) {
    if(el.featureState!==P.state||el.dataset.actor!==P.state.actor)return;
    const message=P.state.chatMessages.find(item=>item.feedbackKey===el.dataset.key);
    if(!message||!P.ContentChat.messageReadable(message))return P.toast('这条回答已不可用，请重新打开相关资料。');
    const current=P.state.feedbackDrafts[P.state.actor];
    if(current?.answerKey===message.feedbackKey){P.navigate('correction-edit');return;}
    if(current?.suggestion.trim()&&!discard){P.modal('已有一份未提交的纠正',`<p>先前关于“${e(current.question)}”的建议仍在草稿中。</p>${l('继续原纠正','correction-edit','btn full')}${b('放弃原草稿并纠正这条回答','answer-replace-draft','btn secondary full section',`data-key="${message.feedbackKey}" data-actor="${P.state.actor}"`)}`);document.querySelector('[data-action="answer-replace-draft"]').featureState=P.state;return;}
    const index=P.state.chatMessages.indexOf(message),question=P.state.chatMessages.slice(0,index).findLast(item=>item.type==='user')?.text||message.question||'这条回答';
    P.state.feedbackDrafts[P.state.actor]={answerKey:message.feedbackKey,question,original:message.text,ref:reference(message),owner:P.state.chatTarget,reason:'fact',suggestion:''};P.navigate('correction-edit');
  }
  /** 新反馈明确展示接收人和原回答，不将用户建议直接应用到本人档案。 */
  function edit() {
    const r=P.state.feedbackDrafts[P.state.actor];
    if(!r)return `<div class="page empty"><h2>先选择一条需要纠正的回答</h2>${l('回到数字人','chat','btn')}</div>`;
    if(r.ref&&!P.ContentChat.resolve(r.ref))return `<div class="page empty"><h2>原资料暂未向你开放</h2>${l('查看我的纠正','corrections','btn')}</div>`;
    return `<div class="page feature-page"><h1 class="page-title">纠正数字人回答</h1><p class="page-subtitle">提交给 ${e(P.PEOPLE[r.owner].name)}本人核对。提交不会直接修改原始资料。</p><div class="note section"><strong>当时的问题</strong><p>${e(r.question)}</p><strong>原回答</strong><p class="feature-prose">${e(r.original)}</p></div><form id="answer-feedback-form" data-feature-form data-actor="${P.state.actor}" class="section"><div class="form-field"><label for="answer-field-reason">哪里需要调整？</label><select id="answer-field-reason" name="reason">${Object.entries(REASONS).map(([id,label])=>`<option value="${id}" ${r.reason===id?'selected':''}>${label}</option>`).join('')}</select></div><div class="form-field"><label for="answer-field-suggestion">你的更正或补充建议</label><textarea id="answer-field-suggestion" name="suggestion" maxlength="2000" required placeholder="请说明正确情况、你记得的细节，或表达哪里不像本人。">${e(r.suggestion)}</textarea></div><p class="caption">原问题、原回答和建议仅发送给本人；原资料仍按自己的授权范围查看。本人可确认、修改或暂不采纳。</p><button type="submit" class="btn full">提交本人核对</button></form></div>`;
  }
  /** 列表不向第三位家人显示反馈数量、原回答或处理结论。 */
  function view() {
    const items=entries();
    return `<div class="page feature-page"><h1 class="page-title">回答纠正与处理</h1><p class="page-subtitle">原回答保留，修订经过本人确认；只有你与相关本人可查看。</p><div class="section stack">${items.length?[...items].reverse().map(card).join(''):'<div class="empty"><h2>暂时没有纠正</h2><p>在数字人的回答旁选择“纠正或补充”。</p>'+l('去看看数字人','chat','btn')+'</div>'}</div></div>`;
  }
  /** 处理前重新校验原资料权限；失效资料不从快照中泄露正文。 */
  function card(item) {
    if(!available(item))return `<article class="card"><p>相关资料当前未向你开放，这条纠正暂时不能查看或处理。</p></article>`;
    const owner=item.owner===P.state.actor,status=item.status==='pending'?'等待本人核对':item.status==='accepted'?'本人已确认修订':'本人暂不采纳';
    return `<article class="card"><div class="tags">${t(REASONS[item.reason],'gray')}${t(status,item.status==='pending'?'warm':'')}</div><h2 class="section">${e(item.question)}</h2><p class="caption">${e(P.PEOPLE[item.from].name)}提交给 ${e(P.PEOPLE[item.owner].name)}</p><details class="section"><summary>回看原回答</summary><p class="feature-prose">${e(item.original)}</p></details><p class="feature-prose section"><strong>建议：</strong>${e(item.suggestion)}</p>${item.status!=='pending'?`<div class="note section"><strong>${item.status==='accepted'?'本人确认的修订答复':'处理意见'}</strong><p class="feature-prose">${e(item.approved||item.note)}</p>${item.note&&item.approved?`<p>${e(item.note)}</p>`:''}</div>${owner&&item.status==='accepted'?b('另存为我的记录草稿','answer-to-record','text-link',`data-id="${item.id}"`):''}`:owner?b('核对并处理','answer-inspect','btn secondary section',`data-id="${item.id}"`):''}</article>`;
  }
  /** 本人可以修改修订文本，说明采纳或退回原因，不替其他作者改动原材料。 */
  function inspect(id) {
    const item=P.state.answerFeedback.find(value=>value.id===id&&value.owner===P.state.actor&&value.status==='pending');
    if(!item||!available(item))return P.toast('当前不能处理这条纠正。');
    P.state.feedbackReviewId=id;P.navigate('correction-review');
  }
  /** 处理表单使用本人当前保留的文字，不因切页或字号变化丢失修改。 */
  function review() {
    const item=P.state.answerFeedback.find(value=>value.id===P.state.feedbackReviewId&&value.owner===P.state.actor&&value.status==='pending');
    if(!item||!available(item))return `<div class="page empty"><h2>当前没有可处理的纠正</h2>${l('返回纠正列表','corrections','btn')}</div>`;
    const r=P.state.feedbackReviewDrafts[item.id]||{text:item.suggestion,note:''};
    return `<div class="page feature-page"><h1 class="page-title">本人核对答复</h1><h2>${e(item.question)}</h2><div class="note section"><strong>原回答</strong><p class="feature-prose">${e(item.original)}</p><strong>家人的建议</strong><p class="feature-prose">${e(item.suggestion)}</p></div><form id="answer-review-form" data-feature-form data-actor="${P.state.actor}" data-id="${item.id}" class="section"><div class="form-field"><label for="answer-field-text">我确认的正确答复</label><textarea id="answer-field-text" name="text" maxlength="2000">${e(r.text)}</textarea></div><div class="form-field"><label for="answer-field-note">处理说明（暂不采纳时必填）</label><textarea id="answer-field-note" name="note" maxlength="1000">${e(r.note)}</textarea></div><p class="caption">确认后的修订用于你与提问者围绕相同资料、相同问题的演示答复；不扩散给其他家人，也不覆盖原始资料。</p><div class="feature-actions"><button type="submit" name="decision" value="accept" class="btn">确认修订答复</button><button type="submit" name="decision" value="decline" class="btn secondary">暂不采纳</button></div></form></div>`;
  }
  /** 仅本人确认且当前仍获授权的纠正可影响再次提问，相同问题不能跨资料误套用。 */
  function apply(reply) {
    const question=P.state.chatMessages.findLast(item=>item.type==='user')?.text?.trim(),ref=reference(reply),key=P.ContentChat.key(ref);
    const item=P.state.answerFeedback.findLast(value=>value.status==='accepted'&&value.owner===P.state.chatTarget&&(value.from===P.state.actor||value.owner===P.state.actor)&&value.question.trim()===question&&P.ContentChat.key(value.ref)===key&&available(value));
    return item?{...reply,type:'corrected',text:item.approved,correctionId:item.id,sourceLabel:'本人确认的修订答复'}:reply;
  }
  /** 修订正文保留私有反馈的读取约束，不能被复制到第三人的会话中。 */
  function readable(message) {const item=P.state.answerFeedback.find(value=>value.id===message.correctionId);return Boolean(item&&item.status==='accepted'&&(item.from===P.state.actor||item.owner===P.state.actor)&&available(item));}
  /** 反馈列表、核对与另存入口仅修改本模块拥有的数据和显式新建的记录草稿。 */
  function handleAction(action,el) {
    if(action==='answer-feedback'){open(el);return true;}
    if(action==='answer-replace-draft'){open(el,true);return true;}
    if(action==='answer-inspect'){inspect(el.dataset.id);return true;}
    if(action==='answer-to-record'){
      const item=P.state.answerFeedback.find(value=>value.id===el.dataset.id&&value.owner===P.state.actor&&value.status==='accepted');
      if(!item||!available(item))return true;
      P.captureRecord();if(P.state.record.text.trim()){P.toast('请先保存或完成原记录草稿，避免覆盖。');return true;}
      P.state.record={...P.emptyRecord(),title:'本人答复补充：'+item.question,text:item.approved,kind:'own'};P.navigate('record');return true;
    }
    return false;
  }
  /** 每次处理重新检查接收人、状态和来源，重复提交不能覆盖已经确认的结论。 */
  function submit(form,event) {
    if(!['answer-feedback-form','answer-review-form'].includes(form.id))return false;
    if(form.featureState!==P.state||form.dataset.actor!==P.state.actor)return true;
    capture();
    if(form.id==='answer-feedback-form'){
      const r=P.state.feedbackDrafts[P.state.actor];if(!r||!r.suggestion.trim()||!Object.hasOwn(REASONS,r.reason))return true;
      if(r.ref&&!P.ContentChat.resolve(r.ref)){P.toast('原资料已不可用，请重新核对。');return true;}
      P.state.answerFeedback.push({...structuredClone(r),id:P.nextId('correction'),from:P.state.actor,status:'pending',approved:'',note:''});
      form.featureState=null;delete P.state.feedbackDrafts[P.state.actor];P.navigate('corrections');P.toast('已提交本人核对，原回答和档案未被改写。');return true;
    }
    const item=P.state.answerFeedback.find(value=>value.id===form.dataset.id&&value.owner===P.state.actor&&value.status==='pending');
    if(!item||!available(item))return true;
    const r=P.state.feedbackReviewDrafts[item.id],decision=event.submitter?.value;
    if(decision==='accept'&&!r.text.trim() || decision==='decline'&&!r.note.trim()){P.toast('请填写修订答复，或说明暂不采纳的原因。');return true;}
    if(!['accept','decline'].includes(decision))return true;
    item.status=decision==='accept'?'accepted':'declined';item.approved=decision==='accept'?r.text.trim():'';item.note=r.note.trim();P.navigate('corrections');P.toast('处理结果已保存，原始资料保持原文。');return true;
  }
  /** 待处理数属于数字人本人，原资料失效时仍保留待核对状态而不显示正文。 */
  function pendingCount() {return P.state.answerFeedback.filter(item=>item.owner===P.state.actor&&item.status==='pending').length;}
  P.AnswerFeedback={tools,capture,apply,readable,handleAction,submit,pendingCount};
  Object.assign(P.views,{corrections:view,'correction-edit':edit,'correction-review':review});
}
