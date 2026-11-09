/** 家文化首页以致谢、家训、家族来处与日常事迹展开，人物资料仍由原模块维护。 */
'use strict';
{
  const P=window.App,{escape:e,button:b,link:l,icon:i}=P;
  /** 首页按年代呈现四段人生回望，更多经历保留在完整档案。 */
  const STORY_PREVIEW_LIMIT=4;
  /** 四项内容保留各自语义标题，不因共用封面而合并资料归属。 */
  function heading(title) {return `<div class="heritage-section-head"><h2>${title}</h2></div>`;}
  /** 家谱节点复用人物详情动作，姓名与称呼均以当前档案人为参照。 */
  function kinNode(id,person,position='') {
    const focus=id===person,label=focus?'档案人':P.relation(id,person);
    return b(`${P.avatar(id)}<span><strong>${e(P.PEOPLE[id].name)}</strong><small>${e(label)}</small></span>`,'person',`heritage-pedigree-node ${focus?'is-focus':''}`,`data-id="${e(id)}" data-pedigree-person="${e(id)}" aria-label="${e(P.PEOPLE[id].name)}，${e(label)}" ${position}`);
  }
  /** 标准字号沿用原坐标，线段连接已有的人物卡边缘。 */
  function compactPedigree(person,groups,partners) {
    const width=Math.max(280,Math.max(groups.parents.length,groups.children.length)*120,(partners.length+1)*160),focusX=partners.length?width*.3:width/2;
    const positions=ids=>ids.length===1?[focusX]:ids.map((id,index)=>56+index*(width-112)/(ids.length-1));
    const parentX=positions(groups.parents),childX=positions(groups.children),mateX=partners.map((id,index)=>focusX+(index+1)*(width-focusX-56)/partners.length);
    const node=(id,x,y)=>kinNode(id,person,`style="left:${x/width*100}%;top:${y}px"`);
    const nodes=groups.parents.map((id,index)=>node(id,parentX[index],4)).join('')+node(person,focusX,100)+partners.map((id,index)=>node(id,mateX[index],100)).join('')+groups.children.map((id,index)=>node(id,childX[index],196)).join('');
    const parentLines=parentX.map(x=>`<path d="M${x} 68V84H${focusX}V100"/>`).join('');
    const childLines=childX.map(x=>`<path d="M${focusX} 164V180H${x}V196"/>`).join('');
    const coupleLines=mateX.map(x=>`<path class="is-couple" d="M${focusX+56} 130H${x-56}M${focusX+56} 134H${x-56}"/>`).join('');
    return `<div class="heritage-pedigree-canvas" style="--pedigree-width:${width}px"><svg viewBox="0 0 ${width} 264" preserveAspectRatio="none" aria-hidden="true"><g>${parentLines}${childLines}${coupleLines}</g></svg>${nodes}</div>`;
  }
  /** 每列用两单位标注中点。支线只连到首列的档案人，避免把子女连到未确认的另一位家长。 */
  function pedigreeBranches(members,columns,kind) {
    const fromParents=kind==='parents',rootEdge=fromParents?24:0,branchEdge=fromParents?0:24;
    const branches=members.map((_,index)=>`M${index*2+1} 12V${branchEdge}`).join('');
    return `<svg class="heritage-pedigree-branches" data-pedigree-links="${kind}" viewBox="0 0 ${columns*2} 24" preserveAspectRatio="none" aria-hidden="true"><path d="M1 ${rootEdge}V12H${members.length*2-1}${branches}"/></svg>`;
  }
  /** 大字号人物卡随姓名自然增高。每位配偶单独与档案人相连。 */
  function readablePedigree(person,{parents,children},partners) {
    const columns=Math.max(parents.length,children.length,partners.length?2:1);
    const renderNodes=members=>members.map(id=>kinNode(id,person)).join('');
    const row=(members,label)=>`<div class="heritage-pedigree-row" role="group" aria-label="${label}">${renderNodes(members)}</div>`;
    return `<div class="heritage-pedigree-canvas heritage-pedigree-readable" style="--pedigree-columns:${columns}">
      ${parents.length?row(parents,'父母')+pedigreeBranches(parents,columns,'parents'):''}
      <div class="heritage-pedigree-row" role="group" aria-label="${partners.length?'档案人与配偶':'档案人'}">${kinNode(person,person)}${partners.length?`<div class="heritage-pedigree-partners" role="group" aria-label="配偶">${renderNodes(partners)}</div>`:''}</div>
      ${children.length?pedigreeBranches(children,columns,'children')+row(children,'子女'):''}
    </div>`;
  }
  /** 谱牒题签与姓氏印章只作装饰；仅展示已知直系与配偶，其他支系留在完整族谱。 */
  function kinship(person,withLink=false) {
    const groups=P.FamilyHome.relatives(person),partners=groups.couple.filter(id=>id!==person);
    const name=e(P.PEOPLE[person]?.name||'家人');
    const diagram=P.state.fontLarge?readablePedigree(person,groups,partners):compactPedigree(person,groups,partners);
    const title=withLink?'<h2>家族世系</h2>':'<h3>家族世系</h3>';
    return `<div class="heritage-kinship"><div class="heritage-pedigree-heading"><span class="heritage-pedigree-seal" aria-hidden="true">${e(P.FamilyHome.profile(person).surname||'家')}<br>氏</span><div>${title}<p>以${name}为中心</p></div><span class="heritage-pedigree-inscription" aria-hidden="true">一脉相承</span></div><div class="heritage-pedigree-viewport" role="group" aria-label="${name}的已知亲缘关系">${diagram}</div><p class="heritage-pedigree-legend">单线为亲子，双线为配偶 · 点击人物查看</p>${withLink?b('查看完整族谱 '+i('arrow'),'home-family-tree','heritage-text-button'):''}</div>`;
  }
  /** 顶部背景单独淡出以衔接下方山水，竖排题签、致谢与家训保留独立实色文字。 */
  function banner(person) {
    return `<header class="heritage-banner"><span class="heritage-banner-backdrop" aria-hidden="true"></span><div class="heritage-banner-copy"><h1>${e(P.HOME_NAME)}</h1><span class="heritage-banner-seal" aria-hidden="true">家<br>谱</span></div>${cover(person)}</header>`;
  }
  /** 致谢与家训嵌入顶部图片，不再重复生成下方笺框或拱门插画。 */
  function cover(person) {
    const switcher=P.state.actor!=='father'&&P.FamilyContext.selectable().length>1?b('切换 '+i('down'),'family-select','heritage-text-button'):'';
    return `<div class="heritage-cover" aria-label="${e(P.HOME_NAME)}，家庭传承封面">${switcher?`<div class="heritage-intro"><div class="heritage-viewing">${switcher}</div></div>`:''}${preface(person)}${motto(person)}</div>`;
  }
  /** 首页复用已授权原视频及播放进度；未提供时不借用其他人物影像或用示意照片顶替。 */
  function familyVideo(person) {
    if(!P.FamilyHome.readable(person))return '<p class="heritage-empty">家庭视频暂未向你开放。</p>';
    const videos=P.PersonArchive.videos(person),item=videos.find(value=>value.kind==='film'&&value.subject===person)||videos.find(value=>value.subject===person);
    if(!item)return '<p class="heritage-empty">暂无向你开放的家庭视频。</p>';
    return `<figure class="heritage-family-photo heritage-family-video" data-home-video="${e(item.id)}">
      ${P.PersonArchive.videoPlayer(item)}
      <figcaption>
        <strong>${e(item.title)}</strong>
        ${b('查看影片详情 '+i('arrow'),'archive-open','heritage-text-button',`data-id="${e(item.id)}" data-person="${e(person)}" data-tab="video" data-video-filter="${item.kind==='film'?'film':'all'}"`)}
      </figcaption>
      <span id="archive-video-status" class="caption" role="status"></span>
    </figure>`;
  }
  /** 家庭影像后直接展示族谱；姓氏资料仅在完整源流阅读中提供，仍复用原授权。 */
  function origin(person) {
    const readerLabel=`<span class="heritage-origin-entry-mark">${i('book')}</span>
      <span class="heritage-origin-entry-copy">
        <span class="heritage-origin-entry-title" id="heritage-origin-entry-title">阅读源流与族谱</span>
        <span class="heritage-origin-entry-note" id="heritage-origin-entry-note">了解姓氏来历与家族记载</span>
      </span>${i('arrow','heritage-origin-entry-arrow')}`;
    const reader=b(readerLabel,'heritage-origin','heritage-origin-entry',`data-person="${e(person)}" aria-labelledby="heritage-origin-entry-title" aria-describedby="heritage-origin-entry-note"`);
    return `<section class="heritage-origin" data-home-section="origin"><div class="heritage-origin-opening"><p class="heritage-chapter-note">留影 · 慢慢回看</p>${heading('家中影像')}${familyVideo(person)}</div>${kinship(person)}${reader}</section>`;
  }
  /** 建谱致谢仅呈现感谢与传承的全文，不另列建档人署名或折叠入口。 */
  function preface(person) {
    const doc=P.FamilyHome.document('preface',person);
    return `<section class="heritage-preface" data-home-section="preface">${heading('建谱致谢')}${doc?`<p class="heritage-preface-copy">${e(doc.text)}</p>`:'<p class="heritage-empty">建谱致谢尚待本人补充。</p>'}</section>`;
  }
  /** 家训保留正文与确认人；管理、来源和家人建议在首页内容页处理。 */
  function motto(person) {
    const home=P.FamilyHome.ensure(),doc=P.FamilyHome.document('motto',person),owner=home.family.mottoOwner;
    return `<section class="heritage-motto" data-home-section="motto">${heading('家训')}${doc?`<p class="heritage-motto-text">${e(doc.text)}</p><p class="heritage-caption">${doc.kind==='new'?'新立家训':'家族传承'} · <strong class="heritage-owner-name">${e(P.PEOPLE[owner]?.name||'家庭指定本人')}</strong>${doc.kind==='new'?'立':'整理确认'}</p>`:'<p class="heritage-empty">家训尚未建立，等待指定的档案本人确认。</p>'}</section>`;
  }
  /** 卡片仅呈现年份、经历摘要与已关联的照片，口述经历无需补造封面。 */
  function eventCard(story,person) {
    const photo=P.FamilyHome.photo(story,person);
    const content=`<div class="heritage-event-copy"><span class="heritage-event-stage">${e(story.category)}</span><h3>${e(story.title)}</h3><p>${e(story.quote||story.text[0])}</p>${!photo?'<small>口述与文字</small>':'<small>示意照片</small>'}</div>${photo?`<img loading="lazy" src="${e(photo.poster)}" alt="${e(photo.title)}，${e(photo.sourceLabel)}">`:''}`;
    return `<article class="heritage-event" data-featured-story="${e(story.id)}"><div class="heritage-event-year">${e(story.year)}<span>年</span></div><button type="button" class="heritage-event-button" data-nav="story/${e(story.id)}" aria-label="阅读${e(story.title)}">${content}</button></article>`;
  }
  /** 首页预览青年至当下的四条精选；影片、交流、场景和记录分别沿用已有栏目入口。 */
  function stories(person) {
    const items=P.FamilyHome.featured(person).slice(0,STORY_PREVIEW_LIMIT);
    return `<section class="heritage-stories" data-home-section="stories"><p class="heritage-chapter-note">回望 · 岁月有声</p>${heading('个人事迹')}<p class="heritage-stories-note">从青春到如今，几张照片，记下值得珍藏的时光。</p><div class="heritage-timeline">${items.length?items.map(item=>eventCard(item,person)).join(''):'<p class="heritage-empty">重要经历尚待本人挑选。</p>'}</div>${P.FamilyHome.readable(person)?b('查看全部个人事迹 '+i('arrow'),'archive-events','heritage-complete',`data-person="${e(person)}"`):'<p class="heritage-caption">人生档案尚未向你开放。</p>'}</section>`;
  }
  /** 管理入口复用既有编辑动作与确认规则，不在首页复制另一套操作。 */
  function managementRow(kind,person,title,note) {
    return P.FamilyHome.editable(kind,person)?b(`${i('edit')}<span><strong>${title}</strong><small>${e(note)}</small></span>${i('arrow')}`,'heritage-edit','menu-row',`data-kind="${kind}" data-person="${e(person)}"`):'';
  }
  /** 首页管理归属我的家庭，家人仅能提交建议，不能发布他人的序言或家训。 */
  function manage() {
    const person=P.FamilyContext.current();if(!person||!P.FamilyHome.member())return '<div class="page empty"><h2>暂无可整理的家庭内容</h2></div>';
    const home=P.FamilyHome.ensure(),mottoDoc=P.FamilyHome.document('motto',person),pending=home.family.suggestions.filter(item=>item.status==='pending').length;
    const personal=managementRow('origin',person,'家族来源','补充姓氏、祖籍及资料来源')+managementRow('preface',person,'建谱致谢','感谢家人，并说明由我创建家庭电子族谱的缘由')+managementRow('featured',person,'首页个人事迹','首页按年份预览前'+STORY_PREVIEW_LIMIT+'条精选经历');
    const family=managementRow('motto',person,mottoDoc?'编辑家庭家训':'建立家庭家训','全家共用，由指定的档案本人确认');
    const suggestions=P.FamilyHome.editable('motto',person)?(pending?b(`${i('family')}<span>家人建议 ${pending}</span>${i('arrow')}`,'heritage-suggestions','menu-row'):''):b(`${i('family')}<span>协助整理家训</span>${i('arrow')}`,'heritage-suggest','menu-row');
    return `<div class="page heritage-manage"><h1 class="page-title">首页内容</h1><p class="page-subtitle">${e(P.PEOPLE[person]?.name||'家人')}的家庭电子族谱</p>${!personal?'<p class="note section">建谱致谢与个人事迹由档案本人整理，你可以协助提交家训建议。</p>':''}<div class="profile-menu section">${personal}${family}${suggestions}</div>${mottoDoc?`<div class="note section"><strong>当前家庭家训</strong><p class="heritage-review-copy">${e(mottoDoc.text)}</p><p>${e(mottoDoc.source)}</p><p class="caption">${e(P.PEOPLE[home.family.mottoOwner]?.name||'指定本人')}确认 · ${e(mottoDoc.date)}</p></div>`:''}${l('返回我的家庭','profile-family','text-link full section')}</div>`;
  }
  /** 封面与正文画卷分层，交界留白随封面高度移动；未开放的私人正文不输出。 */
  function render() {
    const person=P.FamilyContext.current();
    if(!person||!P.FamilyHome.member())return '<div class="page empty"><h2>还没有可查看的家庭电子族谱</h2><p>受邀并完成档案开放后，可以在这里阅读家人的故事。</p></div>';
    return `<div class="page home-family heritage-home">${banner(person)}<div class="heritage-body">${origin(person)}${stories(person)}${P.MemoryShareViews.entry()}</div></div>`;
  }
  P.FamilyHomeViews={render,kinship,previewLimit:STORY_PREVIEW_LIMIT};P.views['home-manage']=manage;
}
