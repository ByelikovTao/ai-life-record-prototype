/** 个人纪念书原型：选材、本人定稿与印刷订单只保存在本次演示的内存中。 */
'use strict';
{
  const P=window.App;
  const FEES={editing:1200,sample:200,printing:360};
  const PHASES={draft:['选材草稿','尚未下单'],authorization:['选材待本人确认','等待授权'],quote:['选材已确认','待确认报价'],editing:['编辑审校中','制作中'],proof:['排版校样待确认','等待本人定稿'],sample:['已定稿','样书制作'],sampleReview:['已定稿','样书待确认'],printPayment:['已定稿','待付印制费'],printing:['已定稿','印制中'],shipped:['已定稿','已发货'],delivered:['已定稿','已交付'],cancelRequested:['制作已暂停','取消核算中'],cancelled:['已取消','已取消'],aftercare:['已定稿','售后处理中']};
  /** 书稿只向制作发起人和记录本人开放，其他亲属不继承阅读权。 */
  function readable(book) {return Boolean(book&&[book.creator,book.subject].includes(P.state.actor));}
  /** 路由中的编号必须命中当前账号可见的纪念书。 */
  function current() {return P.state.keepsakeBooks.find(book=>book.id===P.state.keepsakeBookId&&readable(book));}
  /** 选材复用章节和资料，章节内其他提供者的事件也需单独入书授权。 */
  function sources(person) {
    const profile=P.PersonArchive.biography(person);
    const chapters=(profile?.sections||[]).map(section=>P.ContentChat.resolve({kind:'biography',personId:person,chapterId:section.id}));
    P.PersonArchive.assets(person,'photo');
    const assets=P.state.archiveAssets.filter(item=>item.subject===person&&['photo','document','work'].includes(item.kind)).map(item=>P.ContentChat.resolve({kind:'asset',assetId:item.id}));
    return [...chapters,...assets].filter(Boolean).map(item=>({...item,key:P.ContentChat.key(item.ref),author:item.asset?.author||profile.author,eligible:(item.asset?.author||profile.author)===person&&(item.supportingStories||[]).every(story=>story.author===person)}));
  }
  /** 已选择但失去访问权的材料不会被静默删除，也不能继续送印。 */
  function selected(book) {return sources(book.subject).filter(item=>item.eligible&&book.keys.includes(item.key));}
  /** 选材及本人授权都针对当前清单；修改清单后必须重新确认。 */
  function ready(book) {
    const snapshot=book.snapshots.find(item=>item.version===book.version);
    return book.keys.length>0&&selected(book).length===book.keys.length&&book.keys.every(key=>book.approvedKeys.includes(key))&&(!snapshot||snapshot.sources.every(ref=>P.ContentChat.resolve(ref)));
  }
  /** 切页、字号变化或切换账号前保留本人的表单，不回写旧演示状态。 */
  function capture() {
    const form=document.getElementById('keepsake-form'),book=current();
    if(!form||form.featureState!==P.state||form.dataset.actor!==P.state.actor||!book||book.phase!=='draft'||book.creator!==P.state.actor)return;
    const data=new FormData(form),keys=data.getAll('sources');
    if(JSON.stringify(keys)!==JSON.stringify(book.keys))book.approvedKeys=[];
    book.title=String(data.get('title')||'').trim();book.dedication=String(data.get('dedication')||'').trim();book.keys=keys;
  }
  /** 从同一人物继续未完成选材，避免反复点击入口生成重复订单。 */
  function start(person) {
    if(!P.state.accounts[person]||!P.PersonArchive.biography(person))return P.toast('需要本人认领账号并开放传记，才能开始制作。');
    let book=P.state.keepsakeBooks.find(item=>item.creator===P.state.actor&&item.subject===person&&item.phase==='draft');
    if(!book){book={id:P.nextId('book'),subject:person,creator:P.state.actor,title:P.PEOPLE[person].name+' · 走过的路',dedication:'把走过的路，慢慢讲给家人。',keys:sources(person).filter(item=>item.eligible).slice(0,3).map(item=>item.key),approvedKeys:[],phase:'draft',version:1,snapshots:[],paid:{editing:false,sample:false,printing:false},notes:[],serviceNote:''};P.state.keepsakeBooks.push(book);}
    P.state.keepsakeBookId=book.id;P.navigate('book-edit/'+book.id);
  }
  /** 最终书稿是一次经确认的输出版本，原档案仍是经历与授权的唯一来源。 */
  function freeze(book) {
    const items=selected(book);
    book.snapshots.push({version:book.version,title:book.title,dedication:book.dedication,sources:items.flatMap(item=>[item.ref,...(item.supportingStories||[]).map(story=>({kind:'story',storyId:story.id}))]),sections:items.map(item=>({key:item.key,title:item.title,text:item.text||'',image:item.asset?.kind==='photo'?item.asset.poster:''}))});
    book.phase='sample';
  }
  /** 已定稿预览固定为对应版本；资料撤回时不借快照绕过当前访问权限。 */
  function preview(book) {
    if(!ready(book))return null;
    const snapshot=book.snapshots.find(item=>item.version===book.version);
    return snapshot||{version:book.version,title:book.title,dedication:book.dedication,sections:selected(book).map(item=>({key:item.key,title:item.title,text:item.text||'',image:item.asset?.kind==='photo'?item.asset.poster:''}))};
  }
  /** 同一项演示服务最多记一次付款，不触发支付或重复建档收费。 */
  function paidTotal(book) {return Object.entries(book.paid).reduce((sum,[key,paid])=>sum+(paid?FEES[key]:0),0);}
  /** 印制前取消按实际完成项目核算；发货后进入售后，不承诺自动全额退款。 */
  function requestService(book,kind) {
    const cancelling=kind==='cancel';
    P.modal(cancelling?'申请取消制作':'申请更正或售后',`<p>${cancelling?'后续制作将暂停。未发生的服务费用退还，已完成项目由顾问列明后与你核对。':'请说明错字、漏页、装订或其他问题。已印成的纸书不会被在线修改覆盖，按问题安排更正、补发或协商退款。'}</p><form id="book-service-form" data-id="${book.id}" data-kind="${kind}"><label>具体说明<textarea name="reason" required maxlength="500" placeholder="写下希望调整或处理的内容"></textarea></label><button class="btn full section" type="submit">提交申请</button></form>`);
    const form=document.getElementById('book-service-form');form.bookState=P.state;form.dataset.actor=P.state.actor;
  }
  /** 退回意见绑定这一版校样或样书；修改后必须再次由本人确认。 */
  function revise(book) {
    P.modal('提出修改意见',`<p>编辑会依据本次意见修改为下一版，重新交你确认；超出原报价的新增内容先另行沟通。</p><form id="book-revision-form" data-id="${book.id}"><label>哪里需要修改？<textarea name="reason" required maxlength="500" placeholder="例如：第二章年份需要核对，封面照片换一张"></textarea></label><button class="btn full section" type="submit">交给编辑修改</button></form>`);
    const form=document.getElementById('book-revision-form');form.bookState=P.state;form.dataset.actor=P.state.actor;
  }
  /** 制作主入口随人物变化，服务管理始终回到同一份纪念书。 */
  function entry(person) {
    const book=P.state.keepsakeBooks.find(item=>item.subject===person&&readable(item)&&!['cancelled','delivered'].includes(item.phase));
    return `<aside class="keepsake-entry"><div><p class="eyebrow">把人生，留成一本书</p><h3>制作${person===P.state.actor?'我的':P.escape(P.PEOPLE[person].name)+'的'}纪念书</h3><p>从已有传记和照片开始，由编辑陪你完成。</p></div>${book?P.link('继续制作 / 查看进度','book-order/'+book.id,'btn full'):P.button('开始制作纪念书','book-start','btn full',`data-person="${person}"`)}</aside>`;
  }
  /** 进度推进仅由原型工具区模拟编辑与印厂，不将内部操作放进客户页面。 */
  function demo() {
    const host=document.getElementById('book-demo-controls');if(!host)return;
    const book=current(),active=['book-edit','book-preview','book-order','books'].includes(P.state.route);
    host.hidden=!active;host.innerHTML=active?'<strong>纪念书流程演示</strong><p>仅改变本页状态，不联系编辑或印厂。</p>':'';
    if(!active||!book||!ready(book)){host.hidden=true;return;}
    const next=book.phase==='editing'?['校样已整理完成','proof']:book.phase==='sample'&&book.paid.sample?['样书已送达','sampleReview']:book.phase==='printing'?['印制完成并发货','shipped']:null;
    host.hidden=!next;
    if(next)host.innerHTML+=P.button('模拟：'+next[0],'book-demo-next','btn secondary full',`data-phase="${next[1]}"`);
  }
  /** 客户动作同时验证角色、材料和当前阶段，隐藏按钮不作为唯一限制。 */
  function handleAction(action,el) {
    if(!action.startsWith('book-'))return false;
    capture();
    if(action==='book-start'){start(el.dataset.person);return true;}
    const book=current();if(!book)return true;
    const owner=book.subject===P.state.actor,payer=book.creator===P.state.actor;
    if(action==='book-authorize'&&owner&&book.phase==='authorization'){
      if(!book.keys.length||selected(book).length!==book.keys.length){P.toast('所选资料权限有变化，请重新核对选材。');return true;}
      book.approvedKeys=[...book.keys];book.phase='quote';
    }
    if(action==='book-edit-payment'&&payer&&book.phase==='quote'&&ready(book)){book.paid.editing=true;book.phase='editing';}
    if(action==='book-finalize'&&owner&&book.phase==='proof'&&ready(book)){
      P.modal('确认这一版可以制作样书',`<p>确认《${P.escape(book.title)}》V${book.version} 的封面、全文、图片与署名。确认后固定这一版，原档案后续更新不会自动改书。</p>${P.button('我已核对完整校样，确认定稿','book-lock','btn full section')}`);return true;
    }
    if(action==='book-lock'&&owner&&book.phase==='proof'&&ready(book)){freeze(book);P.closeModal();}
    if(action==='book-sample-payment'&&payer&&book.phase==='sample'&&ready(book))book.paid.sample=true;
    if(action==='book-sample-approve'&&owner&&book.phase==='sampleReview'&&ready(book))book.phase='printPayment';
    if(action==='book-print-payment'&&payer&&book.phase==='printPayment'&&ready(book)){book.paid.printing=true;book.phase='printing';}
    if(action==='book-received'&&payer&&book.phase==='shipped')book.phase='delivered';
    if(action==='book-revise'&&owner&&['proof','sampleReview'].includes(book.phase)){revise(book);return true;}
    if(action==='book-cancel'&&payer&&!['printing','shipped','delivered','aftercare','cancelled','cancelRequested'].includes(book.phase)){
      if(paidTotal(book)){requestService(book,'cancel');return true;}book.phase='cancelled';
    }
    if(action==='book-aftercare'&&payer&&['printing','shipped','delivered','aftercare'].includes(book.phase)){requestService(book,'aftercare');return true;}
    if(action==='book-files'&&book.phase==='delivered'){P.modal('纪念书交付清单','<div class="stack"><p>电子阅读 PDF · V'+book.version+'</p><p>印刷定稿文件 · V'+book.version+'</p><p>实体纪念书 · 3 册</p></div><p class="caption section">原型展示交付项目；正式文件由编辑完成后提供下载。</p>');return true;}
    if(action==='book-demo-next'&&ready(book)){
      const transitions={editing:'proof',sample:book.paid.sample?'sampleReview':null,printing:'shipped'};
      if(transitions[book.phase]===el.dataset.phase)book.phase=el.dataset.phase;
    }
    P.render();return true;
  }
  /** 表单提交保存具体修改意见，过期页面和其他账号无法提交旧书稿。 */
  function submit(form) {
    if(!['keepsake-form','book-revision-form','book-service-form'].includes(form.id))return false;
    const book=current();if(!book)return true;
    if(form.id==='keepsake-form'){
      if(form.featureState!==P.state||form.dataset.actor!==P.state.actor||book.creator!==P.state.actor||book.phase!=='draft')return true;
      capture();if(!book.title||!book.keys.length||selected(book).length!==book.keys.length||!new FormData(form).get('consent')){P.toast('请填写书名、选择可用的本人资料并确认入书范围。');return true;}
      book.phase=book.subject===P.state.actor?'quote':'authorization';book.approvedKeys=book.subject===P.state.actor?[...book.keys]:[];
      P.navigate('book-order/'+book.id);return true;
    }
    if(form.bookState!==P.state||form.dataset.actor!==P.state.actor||form.dataset.id!==book.id)return true;
    const reason=String(new FormData(form).get('reason')||'').trim();if(!reason)return true;
    if(form.id==='book-revision-form'&&book.subject===P.state.actor&&['proof','sampleReview'].includes(book.phase)){book.notes.push({version:book.version,text:reason});book.version++;book.phase='editing';}
    if(form.id==='book-service-form'&&book.creator===P.state.actor){
      const cancelling=form.dataset.kind==='cancel';
      if(cancelling&&['printing','shipped','delivered','aftercare','cancelled','cancelRequested'].includes(book.phase))return true;
      if(!cancelling&&!['printing','shipped','delivered','aftercare'].includes(book.phase))return true;
      book.serviceNote=reason;book.phase=cancelling?'cancelRequested':'aftercare';
    }
    P.closeModal();P.render();return true;
  }
  P.KeepsakeBooks={FEES,PHASES,readable,current,sources,selected,ready,capture,preview,paidTotal,entry,demo,handleAction,submit};
}
