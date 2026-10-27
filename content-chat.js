/** 内容追问：只携带资料引用与位置，读取、回答和回看时重新检查当前账号权限。 */
'use strict';
{
  const P=window.App,{escape:e,button:b,icon:i}=P;
  const LABELS={photo:'照片',film:'视频',clip:'视频',work:'个人作品',document:'事件资料',biography:'传记章节',story:'人生故事'};
  /** 引用不复制正文；视频秒数及档案、事件返回位置只用于导航，不授予读取权。 */
  function reference(value) {
    if(!value || typeof value!=='object')return null;
    if(value.kind==='story' && typeof value.storyId==='string')return {kind:'story',storyId:value.storyId};
    if(value.kind==='biography' && typeof value.personId==='string' && typeof value.chapterId==='string')return {kind:'biography',personId:value.personId,chapterId:value.chapterId};
    if(value.kind!=='asset' || typeof value.assetId!=='string')return null;
    const ref={kind:'asset',assetId:value.assetId};
    if(Number.isFinite(value.position))ref.position=Math.max(0,value.position);
    if(P.state.members.includes(value.origin?.person) && ['overview','video','photo','work','biography','place'].includes(value.origin.tab)){ref.origin={person:value.origin.person,tab:value.origin.tab};if(typeof value.origin.storyId==='string')ref.origin.storyId=value.origin.storyId;if(value.origin.tab==='video'&&['all','film','self','family'].includes(value.origin.videoFilter))ref.origin.videoFilter=value.origin.videoFilter;}
    return ref;
  }
  /** 资料只有一个事实来源，相关故事另行授权，不用媒体的权限替代故事的权限。 */
  function resolve(value) {
    const ref=reference(value);if(!ref)return null;
    if(ref.kind==='story'){
      const story=P.visibleStories().find(item=>item.id===ref.storyId);
      return story?{ref,person:story.commonWith||story.subject,title:story.title,label:LABELS.story,text:story.text.join('\n\n'),story}:null;
    }
    if(ref.kind==='biography'){
      const profile=P.PersonArchive.biography(ref.personId),chapter=P.PersonArchive.chapter(ref.personId,ref.chapterId);
      return chapter?{ref,person:ref.personId,title:chapter.title,label:LABELS.biography,date:chapter.years,text:chapter.body.join('\n\n'),sourceLabel:profile.sourceLabel,supportingStories:chapter.stories}:null;
    }
    const asset=P.PersonArchive.getItem(ref.assetId);if(!asset)return null;
    const story=P.visibleStories().find(item=>item.id===asset.relatedStoryId && item.subject===asset.subject&&P.FamilyContext.usable(item,asset.subject));
    return {ref,person:asset.subject,title:asset.title,label:LABELS[asset.kind],date:asset.date,text:asset.body?.join('\n\n') || asset.description,sourceLabel:asset.sourceLabel,asset,story};
  }
  /** 尚未建立数字人的人物保持原有开通状态，不能借另一位家人的形象冒名回答。 */
  function available(person) {return Boolean(P.FamilyContext.allowed(person,'digital') && P.state.accounts[person]?.hasDigital);}
  /** 同一资料的标识不含视频秒数，避免同一问题在相邻画面重复留存。 */
  function key(value) {const ref=reference(value);return ref?.kind==='asset'?'asset:'+ref.assetId:ref?.kind==='biography'?'biography:'+ref.personId+':'+ref.chapterId:ref?.kind==='story'?'story:'+ref.storyId:'';}
  /** 回看按钮只编码引用，历史回复各自固定来源，不能读取后来切换的实时话题。 */
  function sourceButton(value,label='回看原内容') {
    const ref=reference(value);if(!resolve(ref))return '';
    return b(label,'content-chat-source','text-link',`data-context="${e(JSON.stringify(ref))}"`);
  }
  /** 每份媒体或章节给出直接入口，人物未开通时显示原因而不跳到父亲的对话。 */
  function entry(value) {
    const item=resolve(value);if(!item)return '';
    const allowed=available(item.person),video=item.asset && ['film','clip'].includes(item.asset.kind);
    const label=item.ref.kind==='biography'?'围绕这一章继续聊':video?'围绕这段视频继续聊':item.asset?.kind==='photo'?'围绕这张照片继续聊':'围绕这份内容继续聊';
    return `<aside class="content-chat-entry"><strong>${i('chat')} 看完了，还想了解什么？</strong><p>${allowed?(video?'带上当前播放位置，向数字人继续追问。':'带着当前内容，与'+e(P.PEOPLE[item.person].name)+'的数字人继续聊。'):'这位家人尚未建立或开放数字人，可以先阅读已分享的资料。'}</p>${b(label,'content-chat-start','btn secondary full',`data-context="${e(JSON.stringify(item.ref))}" ${allowed?'':'disabled'}`)}</aside>`;
  }
  /** 入口问题围绕所见资料，后续用户仍可自由输入，不要求先选择聊天模式。 */
  function prompts(item) {
    if(item.ref.kind==='story')return ['讲讲这段经历。'];
    if(item.ref.kind==='biography')return ['讲讲这一章的经历。','这一章有哪些已经记录的细节？','这一章还有哪些事情没有记录？'];
    if(item.asset?.kind==='photo')return ['讲讲这张照片相关的经历。','这张照片有哪些已记录的说明？','这张照片还有哪些事情没有记录？'];
    return ['讲讲这段内容。','这里有哪些已经记录的细节？','还有哪些事情没有记录？'];
  }
  /** 对话中的来源卡显示人物、资料类型与位置，资料撤回后不保留其标题或缩略图。 */
  function contextView() {
    const ref=P.state.chatContext;if(!ref)return '';
    const item=resolve(ref);
    if(!item)return `<aside class="content-chat-context avatar-context"><p>当前资料暂未向你开放，不能继续引用其中内容。</p>${b('结束追问','clear-chat-context','text-link')}</aside>`;
    const position=item.asset && ['film','clip'].includes(item.asset.kind)?` · 追问位置 ${P.duration(item.ref.position || 0)}`:'';
    return `<aside class="content-chat-context avatar-context"><div class="content-chat-heading"><span>${e(P.PEOPLE[item.person].name)} · ${item.label}${position}</span>${b('结束追问','clear-chat-context','text-link')}</div><strong>围绕《${e(item.title)}》继续聊</strong><div class="content-chat-links">${sourceButton(item.ref,item.ref.kind==='biography'?'回看这一章':'回看原内容')}</div><div class="content-chat-prompts">${prompts(item).map(text=>b(e(text),'content-chat-prompt','content-chat-chip',`data-question="${e(text)}"`)).join('')}</div></aside>`;
  }
  /** 进入时冻结实际播放秒数，导航会暂停原生媒体；切换人物时清除上一位的对话。 */
  function start(value) {
    const item=resolve(value);if(!item)return P.toast('这份资料暂未向当前账号开放。');
    if(!available(item.person))return P.toast('这位家人尚未建立或开放数字人。');
    const ref=item.ref;
    if(ref.kind==='asset'){
      const video=document.querySelector('[data-archive-video]');
      if(video?.dataset.archiveVideo===ref.assetId)ref.position=Math.min(item.asset.duration || 0,Number.isFinite(video.currentTime)?Math.max(0,video.currentTime):0);
      const original=P.state.archiveReturn;
      ref.origin=original?.itemId===ref.assetId?{person:original.person,tab:original.tab,storyId:original.storyId,videoFilter:original.videoFilter}:{person:item.person,tab:item.asset.kind==='photo'?'photo':item.asset.kind==='work'?'work':item.asset.kind==='document'?'biography':'video',videoFilter:'all'};
    }
    P.DigitalHuman.captureDraft();P.DigitalHuman.stop();
    if(P.state.chatTarget!==item.person)P.state.chatMessages=[];
    const state=P.state,actor=state.actor;state.chatTarget=item.person;state.chatContext=ref;P.navigate('chat');
    setTimeout(()=>{if(P.state===state && state.actor===actor && state.route==='chat' && state.chatContext===ref)P.sendChatMessage(prompts(item)[0]);},0);
  }
  /** 回看恢复原资料分区、视频追问位置或传记章节，不自动开始播放。 */
  function returnTo(value) {
    const item=resolve(value);if(!item)return P.toast('这份资料暂未向当前账号开放。');
    const ref=item.ref;
    if(ref.kind==='story')return P.navigate('story/'+ref.storyId);
    if(ref.kind==='biography'){P.state.archivePerson=ref.personId;P.state.lifeTab='biography';P.state.biographyMode='read';P.state.archiveChapterId=ref.chapterId;return P.navigate('life/'+ref.personId);}
    if(item.asset.duration && Number.isFinite(ref.position)){const progress=P.state.archivePlayback[P.state.actor] ||= {};progress[ref.assetId]=Math.min(ref.position,item.asset.duration);}
    const origin=ref.origin || {person:item.person,tab:item.asset.kind==='photo'?'photo':item.asset.kind==='work'?'work':item.asset.kind==='document'?'biography':'video',videoFilter:'all'};
    P.PersonArchive.open(ref.assetId,origin.person,origin.tab,origin.storyId,origin.videoFilter);
  }
  /** 文字原型只整理当前说明、章节、演示字幕及已获授权的关联故事，不分析图片画面。 */
  function reply(text) {
    const ref=reference(P.state.chatContext);if(!ref || ref.kind==='story')return null;
    const item=resolve(ref),unknown={type:'unknown',question:text,storyId:item?.story?.id || '',contentSource:ref,text:'当前资料没有记录这个细节。可以把问题留给本人补充，不根据画面或片段猜测。'};
    if(!item)return {...unknown,text:'这份资料目前暂未向你开放，不能引用其中的内容。'};
    if(item.asset&&!P.FamilyContext.answerable(item))return {...unknown,text:'本人尚未授权数字人引用这份家人资料。'};
    if(item.ref.kind==='biography'&&item.supportingStories?.some(story=>!P.FamilyContext.usable(story,item.person)))return {...unknown,text:'这一章含有未获问答授权的家人经历，请选择本人已授权的原始记录。'};
    if(!item.text.trim())return {...unknown,text:'这一章暂无向你开放的事件正文，可以换一段已分享的经历继续聊。'};
    if(!available(item.person))return {...unknown,text:'这位家人的数字人尚未建立或开放，当前不能代替本人回应。'};
    if(/没有记录|没记录|未记录|不知道|还有哪些/.test(text))return unknown;
    if(/建议|怎么做|陪|想你/.test(text))return {type:'inference',contentSource:ref,text:'结合已有经历作一个 AI 推演：可以先把最在意的一件事说清楚，再与家人一起商量。这个回答不是本人现在的意见。'};
    if(!/讲讲|说说|介绍|细节|说明|内容|发生了什么|继续聊|继续讲|然后呢|后来呢|这一章|这个章节/.test(text))return unknown;
    const parts=[`当前${item.label}《${item.title}》${item.date?'（'+item.date+'）':''}中已有的记录：`,item.text];
    if(item.asset?.duration){
      const position=Math.min(ref.position || 0,item.asset.duration),cues=P.ARCHIVE_DATA.captions[item.asset.src] || [];
      const cue=cues.find(cue=>position>=cue.start && position<cue.end) || (position===item.asset.duration?cues.at(-1):null);
      parts.push(`你从 ${P.duration(position)} 处继续提问。${cue?'这一处的演示字幕是：“'+cue.text+'”':'该位置没有逐段内容记录。'}这里只读取已有说明和字幕，不推断视频画面。`);
    }
    if(item.story)parts.push('与这份资料关联、且已向你开放的故事中还记录了：',item.story.text.join('\n\n'));
    return {type:'memory',text:parts.join('\n\n'),contentSource:ref,source:item.story?.id,supportingStoryIds:item.supportingStories?.map(story=>story.id),sourceLabel:ref.kind==='biography'?'据示例传记章节整理':'据示例资料'+(item.story?'及已授权关联故事':'说明')+'整理'};
  }
  /** 历史正文逐条检查入口资料及实际引用的事件，撤回任一依据都不继续展示旧答案。 */
  function messageReadable(message) {if(message.type==='memory'&&message.contentSource){const item=resolve(message.contentSource);if(item?.asset?.author!==item?.person&&!item?.asset?.aiAllowed&&item?.asset)return false;}return !message.contentSource || Boolean(resolve(message.contentSource) && (!message.source || P.visibleStories().some(item=>item.id===message.source)) && (message.supportingStoryIds || []).every(id=>P.visibleStories().some(item=>item.id===id&&P.FamilyContext.usable(item,P.state.chatTarget))));}
  /** 只接管内容追问动作，解析失败明确反馈，避免失效按钮制造空白对话。 */
  function handleAction(action,element) {
    if(action==='content-chat-prompt'){P.sendChatMessage(element.dataset.question || '');return true;}
    if(action!=='content-chat-start' && action!=='content-chat-source')return false;
    let ref;try{ref=reference(JSON.parse(element.dataset.context || 'null'));}catch{P.toast('这份内容入口已失效，请重新打开原资料。');return true;}
    if(action==='content-chat-start')start(ref);else returnTo(ref);return true;
  }
  P.ContentChat={reference,resolve,key,available,sourceButton,entry,contextView,start,returnTo,reply,messageReadable,handleAction};
}
