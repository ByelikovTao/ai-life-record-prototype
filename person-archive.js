/** 人物资料库：统一人物归属、拍摄者、可见范围，以及影片、相册和传记的查看入口。 */
'use strict';
{
  const P=window.App,{escape:e,button:b,link:l,icon:i,badge:t,avatar:a}=P;
  const TABS={overview:'档案总览',video:'视频',photo:'照片',biography:'人生传记',work:'个人作品',place:'记忆地点'};
  const VIDEO_FILTERS={all:'全部视频',film:'人生影片',self:'本人拍摄',family:'家人拍摄'};
  const TYPES={film:'人生影片',photo:'照片',clip:'生活影像',work:'个人作品',document:'书信与原始资料'};
  /** 已有示例资料视为完成本人问答授权；新增家人材料仍须逐份确认，重置时重建。 */
  function ensure() {
    const s=P.state;
    if(s.archiveAssets===null)s.archiveAssets=structuredClone(P.ARCHIVE_DATA.assets).map(item=>({...item,aiAllowed:true}));
    if(s.archiveProfiles===null)s.archiveProfiles=structuredClone(P.ARCHIVE_DATA.people);
    return s;
  }
  /** 选择谁的档案不会改变登录账号，资料仍检查当前访问者的授权。 */
  function readable(item) {return P.FamilyContext.readable(item);}
  /** 追问与来源回看只取得当前获授权的单份资料，不暴露私密条目的正文或媒体路径。 */
  function getItem(id) {const item=ensure().archiveAssets.find(asset=>asset.id===id);return assetReadable(item)?item:null;}
  /** 事件资料同时服从自身和所属事件的权限，直接打开家书地址也不能绕过事件授权。 */
  function assetReadable(item) {return readable(item) && (item.kind!=='document' || P.visibleStories().some(story=>story.id===item.relatedStoryId && story.subject===item.subject));}
  /** 视频合并归档人物与本人拍摄的范围；其他资料按归档人物查询，不生成重复视频条目。 */
  function assets(person,tab) {
    if(!['video','photo','work'].includes(tab))return [];
    return ensure().archiveAssets.filter(item=>assetReadable(item)&&item.inArchive!==false&&(tab==='video'?(item.kind==='film'&&item.subject===person || item.kind==='clip'&&(item.subject===person || item.author===person)):item.subject===person&&item.kind===tab));
  }
  /** 人生影片优先作为成片类型；生活影像按当前查看人物与拍摄者的关系互斥分类。 */
  function videoType(item,person) {return item.kind==='film'?'film':item.author===person?'self':'family';}
  /** 筛选只改变同一资料集合的查看方式，数量与列表采用相同授权及分类规则。 */
  function videos(person,filter='all') {return Object.hasOwn(VIDEO_FILTERS,filter)?assets(person,'video').filter(item=>filter==='all' || videoType(item,person)===filter):[];}
  /** 一个视频入口内呈现全部及三个互斥类型，包含当前可见数量和准确的空态。 */
  function videoView(person) {
    const filter=P.state.videoFilter,items=videos(person,filter);
    const controls=Object.entries(VIDEO_FILTERS).map(([value,label])=>b(`${label} <span>${videos(person,value).length}</span>`,'video-filter',filter===value?'active':'',`data-value="${value}" aria-pressed="${filter===value}"`)).join('');
    return `<div class="section-heading"><h2>视频 <small>${videos(person).length}</small></h2></div><p class="caption">关于${e(P.PEOPLE[person].name)}的影片，以及这位家人拍下的片段，集中保存在这里。拍摄类型以当前查看人物为准。</p><div class="video-type-filters" role="group" aria-label="视频类型">${controls}</div>${items.length?`<div class="archive-grid section">${items.map(item=>card(item,person)).join('')}</div>`:`<div class="empty">${i('play')}<h2>暂无向你开放的${filter==='all'?'视频':VIDEO_FILTERS[filter]}</h2><p>可以切换其他视频类型，或等待资料分享。</p></div>`}`;
  }
  /** 传记正文整份授权，缺失或未开放时不从其他素材猜测生平。 */
  function biography(person) {const profile=ensure().archiveProfiles[person];return readable(profile)?profile:null;}
  /** 完整阅读和事件浏览均从当前事件实例取正文，不在传记模板另存一份经历。 */
  function events(person) {return P.visibleStories().filter(item=>P.FamilyContext.inArchive(item,person)).sort((left,right)=>Number(right.year)-Number(left.year));}
  /** 章节叙述与获授权事件组合为即时阅读内容，不改变原记录或扩大其分享范围。 */
  function chapter(person,id) {
    const section=biography(person)?.sections.find(item=>item.id===id);if(!section)return null;
    const stories=events(person).filter(item=>(section.storyIds || []).includes(item.id));
    return {...section,stories,body:[...section.body,...stories.flatMap(item=>item.text)]};
  }
  /** 家书、照片及影像属于具体事件的材料，查看入口先校验事件再校验每份资料。 */
  function storyMaterials(story) {
    if(!P.visibleStories().some(item=>item.id===story.id))return '';
    const items=ensure().archiveAssets.filter(item=>item.relatedStoryId===story.id && item.subject===story.subject && assetReadable(item));
    return `<section class="section event-materials"><div class="section-heading"><h2>这段经历的资料 <small>${items.length}</small></h2></div><p class="caption">相关照片、影像、书信与原始资料，按各自授权展示。</p>${items.length?`<div class="archive-grid">${items.map(item=>card(item,story.subject,story.id)).join('')}</div>`:'<p class="caption">这段经历暂时没有向你开放的附加资料。</p>'}</section>`;
  }
  /** 视频合并后保留四个明确入口：视频、照片、人生传记及个人作品。 */
  function shortcuts(person) {
    const profile=biography(person);
    const items=[['video','play',videos(person).length+' 段','人生影片、本人及家人拍摄'],['photo','photo',assets(person,'photo').length+' 张','人物、生活与地点照片'],['biography','book',profile?profile.sections.length+' 章':ensure().archiveProfiles[person]?'未开放':'待整理','完整阅读与按事件浏览'],['work','book',assets(person,'work').length+' 件','著作、文章与书画']];
    return `<div class="archive-shortcuts">${items.map(([id,icon,count,note])=>b(`${i(icon)}<strong>${TABS[id]}</strong><span>${count}</span><small>${note}</small>`,'archive-tab',`archive-shortcut ${P.state.lifeTab===id?'active':''}`,`data-value="${id}"`)).join('')}</div>`;
  }
  /** 首页主影片只通过封面进入视频，封面时长与离线示例片一致。 */
  function filmCard(person='father') {
    const item=videos(person,'film')[0];
    if(!item)return '';
    return `<button class="film-cover" type="button" data-action="archive-open" data-id="${item.id}" data-person="${person}" data-tab="video" data-video-filter="film" aria-label="播放${e(item.title)}"><img src="${item.poster}" alt="${e(item.title)}，示例封面"><span class="film-play">${i('play')}<span>${P.duration(item.duration)} · 演示片段</span></span><span class="film-shade"></span></button><div class="film-caption"><div><h2 class="serif">${e(item.title)}</h2><p class="caption">归档于 ${e(P.PEOPLE[person].name)} · 人生影片</p></div></div>`;
  }
  /** 卡片同时标明类型与人物，视频归档人和拍摄者不混为一谈。 */
  function card(item,person,storyId='') {
    const label=['film','clip'].includes(item.kind)?VIDEO_FILTERS[videoType(item,person)]:TYPES[item.kind];
    return b(`<span class="archive-cover"><img src="${item.poster}" alt="${e(item.title)}，示例封面">${['film','clip'].includes(item.kind)?`<span>${i('play')}${P.duration(item.duration)}</span>`:''}</span><span class="archive-card-copy"><span class="tags">${t(label,'gray')}${item.scope==='private'?t('仅自己','warm'):''}</span><strong>${e(item.title)}</strong><small>${e(item.date)}</small>${item.kind==='clip'?`<em>归档人物：${e(P.PEOPLE[item.subject]?.name || '家人')}</em><em>拍摄者：${e(P.PEOPLE[item.author]?.name || '家人')}</em>`:''}</span>`,'archive-open','archive-media-card',`data-id="${item.id}" data-person="${person}" data-story-id="${storyId}"`);
  }
  /** 分类无资料时提供明确空态，不用不相干人物的内容填满页面。 */
  function listing(person,tab) {
    const items=assets(person,tab);
    const note=tab==='photo'?'人物、生活与地点照片。本人创作的文章、书画等请到个人作品查看。':'本人创作的著作、文章、书画等成果。经历记录在人生传记中，家书在对应事件的资料中。';
    return `<div class="section-heading"><h2>${TABS[tab]} <small>${items.length}</small></h2></div><p class="caption">${note}</p>${items.length?`<div class="archive-grid section">${items.map(item=>card(item,person)).join('')}</div>`:`<div class="empty">${i(tab==='photo'?'photo':'book')}<h2>暂无向你开放的${TABS[tab]}</h2><p>这里只展示这位家人的已授权资料。</p></div>`}`;
  }
  /** 传记内提供完整阅读与事件浏览；制作入口由档案页顶部统一提供。 */
  function biographyView(person) {
    const mode=P.state.biographyMode;
    const toggle=`<div class="biography-mode-switch" role="group" aria-label="人生传记查看方式">${[['read','完整阅读'],['events','按事件浏览']].map(([value,label])=>b(label,'biography-mode',mode===value?'active':'',`data-value="${value}" aria-pressed="${mode===value}"`)).join('')}</div>`;
    return `${toggle}${mode==='events'?eventView(person):readingView(person)}`;
  }
  /** 全部章节默认展开以便连贯阅读；正文引用当前事件，章节末尾直达事件及资料。 */
  function chapterView(person,id) {
    const section=chapter(person,id);if(!section)return '';
    const links=section.stories.map(item=>l('查看这段事件及资料：'+e(item.title),'story/'+item.id,'text-link full')).join('');
    return `<details class="archive-chapter" data-archive-chapter="${e(id)}" open><summary><span>${e(section.title)}</span><small>${e(section.years)}</small></summary>${section.body.map(text=>`<p class="story-paragraph">${e(text)}</p>`).join('')}${!section.body.length?'<p class="caption">本章关联的事件暂无向你开放的正文。</p>':''}${links}${P.ContentChat.entry({kind:'biography',personId:person,chapterId:id})}</details>`;
  }
  /** 新增且尚未编排进章节的事件仍在完整阅读出现，避免与事件浏览形成两份内容。 */
  function additionalEvents(person,profile) {
    const assigned=new Set(profile.sections.flatMap(section=>section.storyIds || [])),items=events(person).filter(item=>!assigned.has(item.id));
    return items.length?`<section class="section biography-additions"><h3>继续写下的人生</h3>${items.map(item=>`<article><h4>${e(item.year)} · ${e(item.title)}</h4>${item.text.map(text=>`<p class="story-paragraph">${e(text)}</p>`).join('')}${l('查看这段事件及资料','story/'+item.id,'text-link')}</article>`).join('')}</section>`:'';
  }
  /** 传记编排自身授权，所引用事件仍另行按访问者权限过滤。 */
  function readingView(person) {
    const profile=biography(person);
    if(!profile){const exists=ensure().archiveProfiles[person];return `<div class="empty">${i(exists?'lock':'book')}<h2>${exists?'传记暂未向你开放':'尚未整理这位家人的传记'}</h2><p>本人确认并分享后，可以在这里按章节阅读。</p></div>`;}
    return `<article class="archive-biography"><p class="eyebrow">${e(P.PEOPLE[person].name)} · 人生传记</p><h2 class="serif">${e(profile.tagline)}</h2><p class="story-paragraph">${e(profile.bioIntro)}</p><div class="note"><p>${e(profile.sourceLabel)}</p></div><h3 class="section">完整阅读 · ${profile.sections.length} 章</h3>${profile.sections.map(section=>chapterView(person,section.id)).join('')}${additionalEvents(person,profile)}</article>`;
  }
  /** 事件是传记内部的另一种阅读方式，沿用原事件详情、追问和补充流程。 */
  function eventView(person) {
    const items=events(person);
    return `<div class="section-heading"><h2>按事件浏览 <small>${items.length}</small></h2></div><p class="caption">与完整阅读使用同一份事件记录，点击查看经过、来源及相关资料。</p>${items.length?items.map(item=>l(`<span class="archive-story-year">${e(item.year)}</span><span><strong>${e(item.title)}</strong><small>${e(item.quote || item.text[0])}</small></span>${i('arrow')}`,'story/'+item.id,'archive-story-row')).join(''):`<div class="empty"><h2>暂无向你开放的人生事件</h2><p>这里只展示当前人物的已授权记录。</p></div>`}`;
  }
  /** 总览只展示四类内容预览，完整分类统一使用上方入口，不再复制一套分类按钮。 */
  function overview(person) {
    const videoItems=videos(person),photos=assets(person,'photo'),works=assets(person,'work'),profile=biography(person);
    return `<p class="caption archive-preview-note">下方展示部分资料预览，完整内容请使用上方四个分类。</p><section data-archive-preview="video"><h2>视频预览</h2>${videoItems.length?`<div class="archive-grid section">${videoItems.slice(0,2).map(item=>card(item,person)).join('')}</div>`:'<p class="caption">暂无向你开放的视频。</p>'}</section><section class="section" data-archive-preview="photo"><h2>照片预览</h2>${photos.length?`<div class="archive-photo-strip section">${photos.slice(0,3).map(item=>card(item,person)).join('')}</div>`:'<p class="caption">暂无向你开放的照片。</p>'}</section><section class="archive-bio-preview section" data-archive-preview="biography"><h2>人生传记预览</h2><p>${e(profile?.bioIntro || '本人分享传记后，可以在这里阅读生平与事件。')}</p></section><section class="section" data-archive-preview="work"><h2>个人作品预览</h2>${works.length?`<div class="archive-grid section">${works.slice(0,2).map(item=>card(item,person)).join('')}</div>`:'<p class="caption">暂无向你开放的个人作品。</p>'}</section>`;
  }
  /** 地点沿用获授权事件，场景示例明确非实拍；能进入空间与仅有记录分别标示。 */
  function placeView(person) {
    const stories=events(person),places=P.ARCHIVE_DATA.places.filter(place=>place.subject===person&&place.storyIds.some(id=>stories.some(story=>story.id===id)));
    return `<h2>记忆地点</h2><p class="caption">按生活过的地方探索同一份人生记录；能否进入空间会单独标明。</p>${places.length?`<div class="archive-place-list section">${places.map(place=>`<article class="archive-place-card" data-place-id="${place.id}"><img src="${place.hasSpace?'assets/room-portrait.png':'assets/room.png'}" alt="${e(place.title)}的AI场景示例，不代表历史实拍"><div class="section-heading"><h3>${e(place.title)}</h3>${t(place.hasSpace?'可走进老家':'仅事件记录','gray')}</div><p>${e(place.description)}</p>${place.hasSpace?l('走进回忆里的家','space','btn secondary full'):''}${stories.filter(story=>place.storyIds.includes(story.id)).map(story=>l('查看关联事件：'+e(story.title),'story/'+story.id,'text-link full')).join('')}</article>`).join('')}</div>`:'<div class="empty"><h3>暂无向你开放的记忆地点</h3><p>整理并分享地点相关经历后，可以在这里查看。</p></div>'}`;
  }
  /** 照片翻页遵守进入时的范围，事件资料中的照片不会扩展为整个人物相册。 */
  function photoSequence(person,storyId='') {
    const photos=assets(person,'photo');
    if(!storyId)return photos;
    return P.visibleStories().some(story=>story.id===storyId&&story.subject===person)?photos.filter(item=>item.relatedStoryId===storyId):[];
  }
  /** 范围失效时不给出错误的 0/0 页码；照片本身若仍获授权，可继续单独阅读。 */
  function photoControls(photos,index,storyId) {
    if(index<0)return '<p class="caption">来源事件的照片范围暂未向你开放，可以返回照片分类查看已授权资料。</p>';
    return `<div class="archive-photo-controls">${b('上一张','archive-photo-step','btn secondary compact',`data-step="-1" ${index===0?'disabled':''}`)}<span>${storyId?'事件内照片':'人物照片'} ${index+1} / ${photos.length}</span>${b('下一张','archive-photo-step','btn secondary compact',`data-step="1" ${index>=photos.length-1?'disabled':''}`)}</div>`;
  }
  /** 返回文案沿用真实来源名称，事件资料只保留一个回到原事件的入口。 */
  function returnLabel(context) {
    const story=P.visibleStories().find(item=>item.id===context.storyId);
    if(story)return '返回事件：'+story.title;
    if(context.storyId)return '返回来源事件';
    const filter=context.tab==='video'&&context.videoFilter&&context.videoFilter!=='all'?' · '+VIDEO_FILTERS[context.videoFilter]:'';
    return '返回'+P.PEOPLE[context.person].name+'的'+TABS[context.tab]+filter;
  }
  /** 添加操作放在具体分类，当前人物和资料类型由入口一次带入。 */
  function addEntry(person,tab) {
    const entries={video:['clip','添加视频'],photo:['photo','添加照片'],biography:['biography','补充一段经历'],work:['work','添加作品']};
    const entry=entries[tab];
    return entry?`<div class="feature-entry">${b(i('plus')+' '+entry[1],'material-new','btn secondary',`data-person="${person}" data-kind="${entry[0]}"`)}</div>`:'';
  }
  /** 人物选择与登录账号分离；已完成视频建档的本人在自己的档案顶部进入纪念书。 */
  function view() {
    const retentionPerson=P.state.archivePerson;if(!P.Billing.online(retentionPerson))return `<div class="page empty"><h1>线上保管已结束</h1><p>原稿未在本演示中删除。可导出本人资料或选择保管服务。</p>${P.button('导出我的资料迁出清单','billing-export','btn')}${P.link('查看保管权益','membership','text-link full section')}</div>`;
    const s=ensure(),person=s.archivePerson;
    if(!s.members.includes(person) || !P.PEOPLE[person])return `<div class="page empty"><h2>没有找到这位人物的档案</h2>${l('返回家庭','family','btn')}</div>`;
    if(person!==s.actor&&!P.FamilyContext.allowed(person))return P.FamilyContext.locked('archive',person);
    if(person===s.actor&&s.actor!=='father'&&!P.account().videoDelivered)return `<div class="page empty"><h2>开通我的完整人生空间</h2><p>已有草稿和提交记录可在“我提交的资料”查看；完整人生档案与本人数字人需先完成拍摄服务。</p>${b('了解拍摄与开通条件','video-service','btn')}${l('查看我提交的资料','materials','text-link full')}</div>`;
    const profile=biography(person),tab=s.lifeTab;
    let body=tab==='overview'?overview(person):tab==='video'?videoView(person):tab==='biography'?biographyView(person):tab==='place'?placeView(person):listing(person,tab);
    // 仅陈远山使用其已有二维示例封面，其余人物保留各自头像，避免错配人物。
    return `<div class="page person-archive-page" data-archive-person="${e(person)}"><div class="archive-cover-heading">${s.actor==='father'?`<div class="form-field archive-person-picker"><label for="archive-person-select">当前查看的人物档案</label><select id="archive-person-select">${s.members.map(id=>`<option value="${id}" ${person===id?'selected':''}>${e(P.PEOPLE[id].name)} · ${e(P.relation(id))}</option>`).join('')}</select></div>`:P.FamilyContext.picker()}<div class="person-heading">${a(person,'large')}<div><h1 class="page-title">${e(P.PEOPLE[person].name)}</h1><p class="caption">${e(P.PEOPLE[person].name)}的人物档案</p><p class="caption">${e(P.relation(person))}${P.PEOPLE[person].born?' · '+e(P.PEOPLE[person].born)+' 年生':''}</p></div></div><p class="page-subtitle">${e(profile?.tagline || '影片、相片、传记与拍摄作品，在这里集中留存。')}</p></div>${P.KeepsakeBooks.entry(person)}${shortcuts(person)}<nav class="archive-secondary-tabs" aria-label="档案浏览视角">${['overview','place'].map(id=>b(TABS[id],'archive-tab',tab===id?'active':'',`data-value="${id}"`)).join('')}</nav><section class="archive-content" data-archive-tab="${tab}">${addEntry(person,tab)}${body}</section><p class="archive-demo-note">人物与资料均为原型示例。演示视频由图片编排，不代表客户成片或本人实拍。</p></div>`;
  }
  /** 来源上下文绑定被打开的条目，跨人物拍摄的片段返回时仍保留原资料分区。 */
  function origin(item) {
    if(item.kind==='document')return {person:item.subject,tab:'biography',storyId:item.relatedStoryId};
    const value=P.state.archiveReturn;
    return value?.itemId===item.id?value:{person:item.subject,tab:item.kind==='photo'?'photo':item.kind==='work'?'work':'video',videoFilter:'all'};
  }
  /** 原生字幕之外保留可读文稿，浏览器不支持字幕接口时仍可查看字幕内容。 */
  function captionsView(item) {
    const cues=P.ARCHIVE_DATA.captions[item.src] || [];
    return cues.length?`<details class="archive-captions"><summary>查看示例字幕</summary><ol>${cues.map(cue=>`<li><span>${P.duration(cue.start)}—${P.duration(cue.end)}</span><p>${e(cue.text)}</p></li>`).join('')}</ol></details>`:'';
  }
  /** 媒体详情先校验授权，再输出媒体、作品展示图、正文与带当前资料的追问入口。 */
  function detail() {
    const s=ensure(),item=s.archiveAssets.find(asset=>asset.id===s.archiveItemId);
    if(!item)return `<div class="page empty"><h2>没有找到这份档案资料</h2>${l('返回人物档案','life','btn')}</div>`;
    if(!assetReadable(item))return `<div class="page empty">${i('lock')}<h2>这份资料暂未向你开放</h2><p>查看人物档案不代表可以读取其全部私密资料。</p>${l('返回人物档案','life/'+item.subject,'btn')}</div>`;
    const context=origin(item),video=['film','clip'].includes(item.kind),label=video?VIDEO_FILTERS[videoType(item,context.person)]:TYPES[item.kind],photos=photoSequence(context.person,context.storyId),index=photos.findIndex(asset=>asset.id===item.id);
    const media=video?`<video data-archive-video="${item.id}" controls playsinline preload="metadata" poster="${item.poster}" src="${item.src}">当前浏览器不支持视频播放。</video><p id="archive-video-status" class="caption" role="status">${P.duration(item.duration)} · 无声演示片段，可播放、暂停或拖动进度。</p>`:item.kind==='photo'?`<figure class="archive-photo-detail"><img src="${item.src || item.poster}" alt="${e(item.title)}"><figcaption>${e(item.description)}</figcaption></figure>${photoControls(photos,index,context.storyId)}${P.MemoryShare&&item.subject===s.actor?`<div class="memory-actions"><button type="button" class="btn secondary" data-memory="restore" data-id="${e(item.id)}">修复这张老照片</button><button type="button" class="text-link" data-memory="open" data-id="${e(item.id)}">讲讲背后的故事</button></div>`:''}`:`${item.kind==='work'&&item.poster?`<figure class="archive-photo-detail"><img src="${e(item.poster)}" alt="${e(item.title)}，作品展示示意"><figcaption>作品封面或展示图 · 原型示意</figcaption></figure>`:''}<article>${(item.body || []).map(text=>`<p class="story-paragraph">${e(text)}</p>`).join('')}</article>`;
    return `<div class="page archive-detail">${b(i('back')+' '+e(returnLabel(context)),'archive-return','text-link',`data-id="${item.id}"`)}<p class="eyebrow section">${label} · 示例档案</p><h1 class="page-title">${e(item.title)}</h1><p class="caption">${e(item.date)}</p><div class="archive-player section">${media}</div>${video?captionsView(item):''}${P.ContentChat.entry({kind:'asset',assetId:item.id})}<dl class="archive-meta"><div><dt>归档人物</dt><dd>${e(P.PEOPLE[item.subject].name)}</dd></div><div><dt>${item.kind==='clip'?'拍摄者（分类示例）':'提供者'}</dt><dd>${e(P.PEOPLE[item.author].name)}</dd></div><div><dt>分享范围</dt><dd>${item.scope==='private'?'仅自己':item.scope==='selected'?'指定家人':'已授权家庭成员'}</dd></div></dl>${item.kind==='photo'?'':`<p class="story-paragraph">${e(item.description)}</p>`}<div class="note"><strong>资料来源</strong><p>${e(item.sourceLabel)}</p></div>${item.relatedStoryId && item.relatedStoryId!==context.storyId && P.visibleStories().some(story=>story.id===item.relatedStoryId)?l('查看关联人生事件','story/'+item.relatedStoryId,'btn secondary full section'):''}</div>`;
  }
  /** 进入详情固定原人物、分区及已核验的父事件，回看仍回到实际打开资料的位置。 */
  function open(id,person=P.state.archivePerson,tab=P.state.lifeTab,storyId='',filter=P.state.videoFilter) {
    const item=getItem(id);
    if(!item)return P.toast('这份资料尚未向当前账号开放。');
    const source=P.visibleStories().find(story=>story.id===storyId && story.id===item.relatedStoryId && story.subject===item.subject);
    if(item.kind==='document'){person=item.subject;tab='biography';}
    P.state.archiveReturn={itemId:id,person,tab,storyId:source?.id};if(tab==='video'){P.state.videoFilter=Object.hasOwn(VIDEO_FILTERS,filter)?filter:'all';P.state.archiveReturn.videoFilter=P.state.videoFilter;}P.state.archivePerson=person;P.navigate('archive-item/'+id);
  }
  /** 离开页面暂停原生视频，进度按账号保留；重置前的旧元素不能写回新状态。 */
  function stopPlayback() {
    document.querySelectorAll('[data-archive-video]').forEach(video=>{
      if(video.playbackState===P.state && video.playbackActor===P.state.actor){const progress=P.state.archivePlayback[P.state.actor] ||= {};progress[video.dataset.archiveVideo]=Number.isFinite(video.currentTime)?video.currentTime:0;}
      video.pause();
    });
  }
  /** 回看定位原章节；媒体事件只更新当前元素，首次打开保留设计封面，重复进入恢复实际播放进度且不累积播放。 */
  function mount() {
    if(P.state.route==='life' && P.state.lifeTab==='biography' && P.state.biographyMode==='read' && P.state.archiveChapterId){const target=[...document.querySelectorAll('[data-archive-chapter]')].find(item=>item.dataset.archiveChapter===P.state.archiveChapterId);target?.scrollIntoView?.({block:'start'});}
    const video=document.querySelector('[data-archive-video]');if(!video)return;
    video.playbackState=P.state;video.playbackActor=P.state.actor;
    const item=ensure().archiveAssets.find(asset=>asset.id===video.dataset.archiveVideo),cues=P.ARCHIVE_DATA.captions[item?.src] || [];
    if(cues.length && typeof window.VTTCue==='function' && !video.textTracks.length){const track=video.addTextTrack('subtitles','示例字幕','zh');cues.forEach(cue=>track.addCue(new window.VTTCue(cue.start,cue.end,cue.text)));track.mode='showing';}
    video.addEventListener('loadedmetadata',()=>{if(!video.isConnected || video.playbackState!==P.state || video.playbackActor!==P.state.actor)return;const time=P.state.archivePlayback[P.state.actor]?.[video.dataset.archiveVideo] || 0;if(item?.materialManaged&&Number.isFinite(video.duration))item.duration=video.duration;if(time>0&&Number.isFinite(video.duration)&&time<=video.duration)video.currentTime=time;},{once:true});
    video.addEventListener('error',()=>{const status=document.getElementById('archive-video-status');if(video.isConnected && status)status.textContent='这段视频暂时无法播放，请确认已保留完整的本地素材文件。';});
  }
  /** 新档案页只接受明确分类与人物，不保留旧的泛作品分类查找路径。 */
  function handleAction(action,element) {
    if(action==='video-filter'){if(Object.hasOwn(VIDEO_FILTERS,element.dataset.value)){P.state.videoFilter=element.dataset.value;P.render();}return true;}
    if(action==='biography-mode'){if(['read','events'].includes(element.dataset.value)){P.state.biographyMode=element.dataset.value;P.state.archiveChapterId='';P.render();}return true;}
    if(action==='archive-events'){const person=element.dataset.person;if(P.state.members.includes(person)){P.state.archivePerson=person;P.state.lifeTab='biography';P.state.biographyMode='events';P.state.archiveChapterId='';P.navigate('life/'+person);}return true;}
    if(action==='archive-tab'){if(Object.hasOwn(TABS,element.dataset.value)){P.state.lifeTab=element.dataset.value;if(element.dataset.value==='video')P.state.videoFilter='all';P.render();}return true;}
    if(action==='archive-person'&&P.state.actor!=='father'&&(element.dataset.id||element.value)!==P.state.actor){P.FamilyContext.select(element.dataset.id||element.value);return true;}
    if(action==='archive-person'){const person=element.dataset.id || element.value;if(P.state.members.includes(person)){P.state.lifeTab='overview';P.state.videoFilter='all';P.state.biographyMode='read';P.state.archiveChapterId='';P.navigate('life/'+person);}return true;}
    if(action==='archive-open'){open(element.dataset.id,element.dataset.person || P.state.archivePerson,element.dataset.tab || P.state.lifeTab,element.dataset.storyId || '',element.dataset.videoFilter || P.state.videoFilter);return true;}
    if(action==='archive-return'){const item=ensure().archiveAssets.find(asset=>asset.id===element.dataset.id);if(item){const context=origin(item);if(context.storyId)return P.navigate('story/'+context.storyId);P.state.archivePerson=context.person;P.state.lifeTab=context.tab;if(context.tab==='video')P.state.videoFilter=context.videoFilter || 'all';P.navigate('life/'+context.person);}return true;}
    if(action==='archive-photo-step'){const item=ensure().archiveAssets.find(asset=>asset.id===P.state.archiveItemId);if(item){const context=origin(item),photos=photoSequence(context.person,context.storyId),index=photos.findIndex(asset=>asset.id===item.id),next=photos[index+Number(element.dataset.step)];if(next)open(next.id,context.person,context.tab,context.storyId || '',context.videoFilter);}return true;}
    return false;
  }
  P.PersonArchive={view,detail,filmCard,assets,videos,videoType,getItem,biography,chapter,events,storyMaterials,open,handleAction,mount,stopPlayback};P.views['archive-item']=detail;
}

