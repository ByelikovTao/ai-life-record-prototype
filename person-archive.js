/** 人物资料库：统一人物归属、拍摄者、可见范围，以及影片、相册和传记的查看入口。 */
'use strict';
{
  const P=window.App,{escape:e,button:b,link:l,icon:i,badge:t,avatar:a}=P;
  const TABS={overview:'档案总览',video:'视频',photo:'照片',biography:'人生传记',work:'个人作品',place:'地点'};
  const VIDEO_FILTERS={all:'全部视频',film:'人生影片',self:'本人拍摄',family:'家人拍摄'};
  const TYPES={film:'人生影片',photo:'照片',clip:'生活影像',work:'个人作品',document:'书信与原始资料'};
  /** 模板只负责种子数据，当前演示的资料实例由本模块唯一初始化，重置后重新创建。 */
  function ensure() {
    const s=P.state;
    if(s.archiveAssets===null)s.archiveAssets=structuredClone(P.ARCHIVE_DATA.assets);
    if(s.archiveProfiles===null)s.archiveProfiles=structuredClone(P.ARCHIVE_DATA.people);
    return s;
  }
  /** 选择谁的档案不会改变登录账号，资料仍检查当前访问者的授权。 */
  function readable(item) {return Boolean(item)&&(item.author===P.state.actor || (item.scope!=='private' && item.viewers.includes(P.state.actor)));}
  /** 追问与来源回看只取得当前获授权的单份资料，不暴露私密条目的正文或媒体路径。 */
  function getItem(id) {const item=ensure().archiveAssets.find(asset=>asset.id===id);return assetReadable(item)?item:null;}
  /** 事件资料同时服从自身和所属事件的权限，直接打开家书地址也不能绕过事件授权。 */
  function assetReadable(item) {return readable(item) && (item.kind!=='document' || P.visibleStories().some(story=>story.id===item.relatedStoryId && story.subject===item.subject));}
  /** 视频合并归档人物与本人拍摄的范围；其他资料按归档人物查询，不生成重复视频条目。 */
  function assets(person,tab) {
    if(!['video','photo','work'].includes(tab))return [];
    return ensure().archiveAssets.filter(item=>assetReadable(item)&&(tab==='video'?(item.kind==='film'&&item.subject===person || item.kind==='clip'&&(item.subject===person || item.author===person)):item.subject===person&&item.kind===tab));
  }
  /** 人生影片优先作为成片类型；生活影像按当前查看人物与拍摄者的关系互斥分类。 */
  function videoType(item,person) {return item.kind==='film'?'film':item.author===person?'self':'family';}
  /** 筛选只改变同一资料集合的查看方式，数量与列表采用相同授权及分类规则。 */
  function videos(person,filter='all') {return Object.hasOwn(VIDEO_FILTERS,filter)?assets(person,'video').filter(item=>filter==='all' || videoType(item,person)===filter):[];}
  /** 一个视频入口内呈现全部及三个互斥类型，包含当前可见数量和准确的空态。 */
  function videoView(person) {
    const filter=P.state.videoFilter,items=videos(person,filter);
    const controls=Object.entries(VIDEO_FILTERS).map(([value,label])=>b(`${label} <span>${videos(person,value).length}</span>`,'video-filter',filter===value?'active':'',`data-value="${value}" aria-pressed="${filter===value}"`)).join('');
    return `<div class="section-heading"><h2>视频 <small>${videos(person).length}</small></h2></div><p class="caption">关于${e(P.PEOPLE[person].name)}的影片，以及这位家人拍下的片段，集中保存在这里。拍摄类型以当前查看人物为准。</p><div class="video-type-filters" role="group" aria-label="视频类型">${controls}</div>${items.length?`<div class="archive-grid section">${items.map(item=>card(item,person)).join('')}</div>`:`<div class="empty">${i('play')}<h2>暂无向你开放的${VIDEO_FILTERS[filter]}</h2><p>可以切换其他视频类型，或等待资料分享。</p></div>`}`;
  }
  /** 传记正文整份授权，缺失或未开放时不从其他素材猜测生平。 */
  function biography(person) {const profile=ensure().archiveProfiles[person];return readable(profile)?profile:null;}
  /** 完整阅读和事件浏览均从当前事件实例取正文，不在传记模板另存一份经历。 */
  function events(person) {return P.visibleStories().filter(item=>item.subject===person).sort((left,right)=>Number(right.year)-Number(left.year));}
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
    const items=[['video','play',videos(person).length+' 段','人生影片、本人及家人拍摄'],['photo','photo',assets(person,'photo').length+' 张','按照片查看与翻页'],['biography','book',profile?profile.sections.length+' 章':'待开放','完整阅读与按事件浏览'],['work','book',assets(person,'work').length+' 件','著作、文章与书画']];
    return `<div class="archive-shortcuts">${items.map(([id,icon,count,note])=>b(`${i(icon)}<strong>${TABS[id]}</strong><span>${count}</span><small>${note}</small>`,'archive-tab',`archive-shortcut ${P.state.lifeTab===id?'active':''}`,`data-value="${id}"`)).join('')}</div>`;
  }
  /** 首页提供直达资料库的总入口，清楚列出能在里面看到什么。 */
  function entryCard(person='father') {
    ensure();return l(`${i('book')}<span><strong>${e(P.PEOPLE[person].name)}的人物档案</strong><small>视频 · 照片 · 人生传记 · 个人作品</small></span>${i('arrow')}`,'life/'+person,'archive-home-entry');
  }
  /** 首页主影片直接进入真实视频控件，封面时长与离线示例片一致。 */
  function filmCard(person='father') {
    const item=videos(person,'film')[0];
    if(!item)return `<div class="note"><strong>人生影片暂未开放</strong><p>进入人物档案查看已向你分享的其他资料。</p>${l('查看人物档案','life/'+person)}</div>`;
    return `<button class="film-cover" type="button" data-action="archive-open" data-id="${item.id}" data-person="${person}" data-tab="video" data-video-filter="film" aria-label="播放${e(item.title)}"><img src="${item.poster}" alt="${e(item.title)}，示例封面"><span class="film-play">${i('play')}<span>${P.duration(item.duration)} · 演示片段</span></span><span class="film-shade"></span></button><div class="film-caption"><div><h2 class="serif">${e(item.title)}</h2><p class="caption">归档于 ${e(P.PEOPLE[person].name)} · 人生影片</p></div>${b(i('play'),'archive-open','mini-play',`data-id="${item.id}" data-person="${person}" data-tab="video" data-video-filter="film" aria-label="播放人生影片"`)}</div>`;
  }
  /** 卡片同时标明类型与人物，视频归档人和拍摄者不混为一谈。 */
  function card(item,person,storyId='') {
    const label=['film','clip'].includes(item.kind)?VIDEO_FILTERS[videoType(item,person)]:TYPES[item.kind];
    return b(`<span class="archive-cover"><img src="${item.poster}" alt="${e(item.title)}，示例封面">${['film','clip'].includes(item.kind)?`<span>${i('play')}${P.duration(item.duration)}</span>`:''}</span><span class="archive-card-copy"><span class="tags">${t(label,'gray')}${item.scope==='private'?t('仅自己','warm'):''}</span><strong>${e(item.title)}</strong><small>${e(item.date)}</small>${item.kind==='clip'?`<em>归档人物：${e(P.PEOPLE[item.subject]?.name || '家人')}</em><em>拍摄者：${e(P.PEOPLE[item.author]?.name || '家人')}</em>`:''}</span>`,'archive-open','archive-media-card',`data-id="${item.id}" data-person="${person}" data-story-id="${storyId}"`);
  }
  /** 分类无资料时提供明确空态，不用不相干人物的内容填满页面。 */
  function listing(person,tab) {
    const items=assets(person,tab);
    const note=tab==='photo'?'与这位家人关联的照片，点击后可以前后翻看。':'著作、文章、书画等本人创作成果。家书请到对应人生事件的资料中查看。';
    return `<div class="section-heading"><h2>${TABS[tab]} <small>${items.length}</small></h2></div><p class="caption">${note}</p>${items.length?`<div class="archive-grid section">${items.map(item=>card(item,person)).join('')}</div>`:`<div class="empty">${i(tab==='photo'?'photo':'book')}<h2>暂无向你开放的${TABS[tab]}</h2><p>这里只展示这位家人的已授权资料。</p></div>`}`;
  }
  /** 一个传记入口提供完整阅读和事件浏览，事件列表不再占用外层独立分类。 */
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
  /** 总览显示实际内容预览，四类资料从首页进入后即可识别。 */
  function overview(person) {
    const videoItems=videos(person),photos=assets(person,'photo'),profile=biography(person);
    return `<div class="section-heading"><h2>已存档的影像</h2>${b('查看全部','archive-tab','text-link','data-value="video"')}</div>${videoItems.length?`<div class="archive-grid">${videoItems.slice(0,2).map(item=>card(item,person)).join('')}</div>`:'<p class="caption">还没有向你开放的视频。</p>'}<div class="section"><div class="section-heading"><h2>相片里的时光</h2>${b('全部照片','archive-tab','text-link','data-value="photo"')}</div>${photos.length?`<div class="archive-photo-strip">${photos.slice(0,3).map(item=>card(item,person)).join('')}</div>`:'<p class="caption">相册等待本人分享。</p>'}</div><div class="archive-bio-preview section"><p class="eyebrow">人生传记</p><h2>${e(profile?.tagline || '人生的来路，也值得慢慢读。')}</h2><p>${e(profile?.bioIntro || '本人分享后，可以在这里阅读他的生平与章节。')}</p>${b('阅读人生传记 '+i('arrow'),'archive-tab','btn secondary','data-value="biography"')}</div>`;
  }
  /** 人物选择与登录账号分离，每位家庭成员都有自己的资料视图。 */
  function view() {
    const s=ensure(),person=s.archivePerson;
    if(!s.members.includes(person) || !P.PEOPLE[person])return `<div class="page empty"><h2>没有找到这位人物的档案</h2>${l('返回家庭','family','btn')}</div>`;
    const profile=biography(person),tab=s.lifeTab;
    let body=tab==='overview'?overview(person):tab==='video'?videoView(person):tab==='biography'?biographyView(person):tab==='place'?(person==='father'?`${l('进入老家的三维记忆空间','space','btn full')}<p class="caption section">老宅关联人物：陈远山</p>${l('第一间办公室 · 1998年','story/first-order','btn secondary full')}`:'<div class="empty"><h2>尚未整理这位家人的地点</h2></div>'):listing(person,tab);
    return `<div class="page person-archive-page"><div class="form-field archive-person-picker"><label for="archive-person-select">当前查看的人物档案</label><select id="archive-person-select">${s.members.map(id=>`<option value="${id}" ${person===id?'selected':''}>${e(P.PEOPLE[id].name)} · ${e(P.relation(id))}</option>`).join('')}</select></div><div class="person-heading">${a(person,'large')}<div><p class="caption">${e(P.relation(person))}${P.PEOPLE[person].born?' · '+e(P.PEOPLE[person].born)+' 年生':''}</p><h1 class="page-title">${e(P.PEOPLE[person].name)}的人物档案</h1></div></div><p class="page-subtitle">${e(profile?.tagline || '影片、相片、传记与拍摄作品，在这里集中留存。')}</p>${shortcuts(person)}<div class="archive-secondary-tabs">${['overview','place'].map(id=>b(TABS[id],'archive-tab',tab===id?'active':'',`data-value="${id}"`)).join('')}</div><section class="archive-content" data-archive-tab="${tab}">${body}</section><p class="archive-demo-note">人物与资料均为原型示例。演示视频由图片编排，不代表客户成片或本人实拍。</p></div>`;
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
  /** 媒体详情先校验授权，再输出媒体、正文与带当前资料的追问入口。 */
  function detail() {
    const s=ensure(),item=s.archiveAssets.find(asset=>asset.id===s.archiveItemId);
    if(!item)return `<div class="page empty"><h2>没有找到这份档案资料</h2>${l('返回人物档案','life','btn')}</div>`;
    if(!assetReadable(item))return `<div class="page empty">${i('lock')}<h2>这份资料暂未向你开放</h2><p>查看人物档案不代表可以读取其全部私密资料。</p>${l('返回人物档案','life/'+item.subject,'btn')}</div>`;
    const context=origin(item),video=['film','clip'].includes(item.kind),photos=assets(context.person,'photo'),index=photos.findIndex(asset=>asset.id===item.id);
    const media=video?`<video data-archive-video="${item.id}" controls playsinline preload="metadata" poster="${item.poster}" src="${item.src}">当前浏览器不支持视频播放。</video><p id="archive-video-status" class="caption" role="status">${P.duration(item.duration)} · 无声演示片段，可播放、暂停或拖动进度。</p>`:item.kind==='photo'?`<figure class="archive-photo-detail"><img src="${item.src || item.poster}" alt="${e(item.title)}"><figcaption>${e(item.description)}</figcaption></figure><div class="archive-photo-controls">${b('上一张','archive-photo-step','btn secondary compact',`data-step="-1" ${index<=0?'disabled':''}`)}<span>${index+1} / ${photos.length}</span>${b('下一张','archive-photo-step','btn secondary compact',`data-step="1" ${index<0 || index>=photos.length-1?'disabled':''}`)}</div>`:`<article>${(item.body || []).map(text=>`<p class="story-paragraph">${e(text)}</p>`).join('')}</article>`;
    return `<div class="page archive-detail">${b(i('back')+' 返回'+e(P.PEOPLE[context.person]?.name || '人物')+(context.storyId?'的人生事件':'的档案'),'archive-return','text-link',`data-id="${item.id}"`)}<p class="eyebrow section">${TYPES[item.kind]} · 示例档案</p><h1 class="page-title">${e(item.title)}</h1><p class="caption">${e(item.date)}</p><div class="archive-player section">${media}</div>${video?captionsView(item):''}${P.ContentChat.entry({kind:'asset',assetId:item.id})}<dl class="archive-meta"><div><dt>归档人物</dt><dd>${e(P.PEOPLE[item.subject].name)}</dd></div><div><dt>${item.kind==='clip'?'拍摄者（分类示例）':'提供者'}</dt><dd>${e(P.PEOPLE[item.author].name)}</dd></div><div><dt>分享范围</dt><dd>${item.scope==='private'?'仅自己':item.scope==='selected'?'指定家人':'已授权家庭成员'}</dd></div></dl><p class="story-paragraph">${e(item.description)}</p><div class="note"><strong>资料来源</strong><p>${e(item.sourceLabel)}</p></div>${item.relatedStoryId && P.visibleStories().some(story=>story.id===item.relatedStoryId)?l('查看关联的人生故事','story/'+item.relatedStoryId,'btn secondary full section'):''}</div>`;
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
  /** 回看定位原章节；媒体事件只更新当前元素，重复进入不累积播放且保留片尾位置。 */
  function mount() {
    if(P.state.route==='life' && P.state.lifeTab==='biography' && P.state.biographyMode==='read' && P.state.archiveChapterId){const target=[...document.querySelectorAll('[data-archive-chapter]')].find(item=>item.dataset.archiveChapter===P.state.archiveChapterId);target?.scrollIntoView?.({block:'start'});}
    const video=document.querySelector('[data-archive-video]');if(!video)return;
    video.playbackState=P.state;video.playbackActor=P.state.actor;
    const item=ensure().archiveAssets.find(asset=>asset.id===video.dataset.archiveVideo),cues=P.ARCHIVE_DATA.captions[item?.src] || [];
    if(cues.length && typeof window.VTTCue==='function' && !video.textTracks.length){const track=video.addTextTrack('subtitles','示例字幕','zh');cues.forEach(cue=>track.addCue(new window.VTTCue(cue.start,cue.end,cue.text)));track.mode='showing';}
    video.addEventListener('loadedmetadata',()=>{if(!video.isConnected || video.playbackState!==P.state || video.playbackActor!==P.state.actor)return;const time=P.state.archivePlayback[P.state.actor]?.[video.dataset.archiveVideo] || 0;if(Number.isFinite(video.duration)&&time<=video.duration)video.currentTime=time;},{once:true});
    video.addEventListener('error',()=>{const status=document.getElementById('archive-video-status');if(video.isConnected && status)status.textContent='这段视频暂时无法播放，请确认已保留完整的本地素材文件。';});
  }
  /** 新档案页只接受明确分类与人物，不保留旧的泛作品分类查找路径。 */
  function handleAction(action,element) {
    if(action==='video-filter'){if(Object.hasOwn(VIDEO_FILTERS,element.dataset.value)){P.state.videoFilter=element.dataset.value;P.render();}return true;}
    if(action==='biography-mode'){if(['read','events'].includes(element.dataset.value)){P.state.biographyMode=element.dataset.value;P.state.archiveChapterId='';P.render();}return true;}
    if(action==='archive-events'){const person=element.dataset.person;if(P.state.members.includes(person)){P.state.archivePerson=person;P.state.lifeTab='biography';P.state.biographyMode='events';P.state.archiveChapterId='';P.navigate('life/'+person);}return true;}
    if(action==='archive-tab'){if(Object.hasOwn(TABS,element.dataset.value)){P.state.lifeTab=element.dataset.value;if(element.dataset.value==='video')P.state.videoFilter='all';P.render();}return true;}
    if(action==='archive-person'){const person=element.dataset.id || element.value;if(P.state.members.includes(person)){P.state.lifeTab='overview';P.state.videoFilter='all';P.state.biographyMode='read';P.state.archiveChapterId='';P.navigate('life/'+person);}return true;}
    if(action==='archive-open'){open(element.dataset.id,element.dataset.person || P.state.archivePerson,element.dataset.tab || P.state.lifeTab,element.dataset.storyId || '',element.dataset.videoFilter || P.state.videoFilter);return true;}
    if(action==='archive-return'){const item=ensure().archiveAssets.find(asset=>asset.id===element.dataset.id);if(item){const context=origin(item);if(context.storyId)return P.navigate('story/'+context.storyId);P.state.archivePerson=context.person;P.state.lifeTab=context.tab;if(context.tab==='video')P.state.videoFilter=context.videoFilter || 'all';P.navigate('life/'+context.person);}return true;}
    if(action==='archive-photo-step'){const item=ensure().archiveAssets.find(asset=>asset.id===P.state.archiveItemId);if(item){const context=origin(item),photos=assets(context.person,'photo'),index=photos.findIndex(asset=>asset.id===item.id),next=photos[index+Number(element.dataset.step)];if(next)open(next.id,context.person,'photo');}return true;}
    return false;
  }
  P.PersonArchive={view,detail,entryCard,filmCard,assets,videos,videoType,getItem,biography,chapter,events,storyMaterials,open,handleAction,mount,stopPlayback};P.views['archive-item']=detail;
}

