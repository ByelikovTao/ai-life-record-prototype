/** 演示数据与共用视图工具；所有变更只保留在当前页面内存中。 */
'use strict';
{
  const ICONS = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    book: '<path d="M4 3h13a2 2 0 0 1 2 2v16H6a3 3 0 0 1-3-3V4a1 1 0 0 1 1-1Z"/><path d="M3 17h16M8 7h7M8 11h5"/>',
    chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2v-9A9 9 0 1 1 21 11.5Z"/><path d="M7 11h.01M12 11h.01M17 11h.01"/>',
    family: '<circle cx="9" cy="7" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2ZM16 4a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v2"/>',
    person: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2Z"/>',
    arrow: '<path d="m9 5 7 7-7 7"/>',
    back: '<path d="m15 5-7 7 7 7"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    play: '<path d="m9 5 11 7-11 7Z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    mic: '<rect x="8" y="2" width="8" height="13" rx="4"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',
    keyboard: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/>',
    check: '<path d="m5 12 4 4L20 5"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m9 10 6-4M9 14l6 4"/>',
    spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    source: '<path d="M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h6"/>',
    photo: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
    star: '<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
    edit: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14z"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3ZM9 3v15M15 6v15"/>',
    settings: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2m8 8 2 2M6 18l2-2m8-8 2-2"/><circle cx="12" cy="12" r="5"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    volume: '<path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    send: '<path d="m22 2-7 20-4-9-9-4ZM11 13 22 2"/>',
    tree: '<path d="M12 3v7M4 15v-5h16v5M12 10v5"/><rect x="8" y="1" width="8" height="4" rx="1"/><rect x="1" y="16" width="6" height="6" rx="1"/><rect x="9" y="16" width="6" height="6" rx="1"/><rect x="17" y="16" width="6" height="6" rx="1"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>'
  };
  const PEOPLE = {
    father: {name:'陈远山', relation:'爸爸', born:'1963', short:'远山', photo:'father'},
    xia: {name:'陈知夏', relation:'女儿', born:'1992', short:'知夏', photo:'daughter'},
    nian: {name:'陈念念', relation:'孙女', born:'2016', short:'念念', color:'rose'},
    mother: {name:'林慧', relation:'妈妈', born:'1965', short:'林', color:'rose'},
    grandpa: {name:'陈明德', relation:'爷爷', born:'1938', short:'陈', color:'sand'}
  };
  /** 固定的演示人物种子仅用于重置；运行时仍由 PEOPLE 同一个对象提供人物事实。 */
  const PERSON_SEEDS=structuredClone(PEOPLE);
  const STORIES = [
    {id:'first-order', title:'第一笔订单来的那天', year:'1998', date:'1998年秋', recorded:'2026年10月12日', category:'创业', image:'family', author:'father', scope:'family', text:['那时候，办公室只有一张桌子和一部电话。第一笔订单来的时候，我反复看了好几遍，才敢告诉你妈妈。','晚上回到家，我们没有去饭店。你妈妈煮了一碗面，我们坐在饭桌旁，把接下来要做的事写在纸上。','今天再回头看，我记住的不是订单上的数字，而是有人愿意相信我，还有家人始终陪着我。'], quote:'我记住的不是订单上的数字，而是有人愿意相信我。', source:'创业经历访谈 · 片段 03', duration:'03:26'},
    {id:'old-home', title:'那张一直没换的书桌', year:'1986', date:'1986年夏', recorded:'2026年10月14日', category:'童年与家', image:'room', author:'father', scope:'family', text:['老家的窗边一直放着一张书桌。桌面不大，靠窗的一角晒得发白。','后来离开家工作，我写给家里的第一封信，也是在这张桌子上起的稿。每次回去，总会在那里坐一会儿。'], quote:'很多故事，就从这扇窗边开始。', source:'老宅口述记录 · 片段 02', duration:'01:28'},
    {id:'spring', title:'今年春节，全家又坐在一起', year:'2026', date:'2026年春节', recorded:'2026年2月20日', category:'家庭日常', image:'family', author:'xia', scope:'family', text:['爸爸说，团圆并不需要安排很多事。一家人围着桌子吃饭，就已经很好。','我这次才知道，那道每年都会做的菜，最早是奶奶教给妈妈的。下次，我也想学会。'], quote:'一家人围着桌子吃饭，就已经很好。', source:'陈知夏的家庭记录', duration:'02:15'},
    {id:'private', title:'留给自己的几句话', year:'2026', date:'2026年10月', recorded:'2026年10月18日', category:'个人记录', image:'room', author:'father', scope:'private', text:['有些话，我想先留给自己。等准备好了，再慢慢讲给家人听。'], quote:'有些话，想先留给自己。', source:'本人文字记录', duration:'01:00'}
  ];
  const PLANS = {
    basic:{name:'基础账号', price:0, minutes:0, space:0, records:0},
    personal:{name:'个人会员', price:999, minutes:600, space:10, records:60},
    legacy:{name:'个人传承会员', price:2999, minutes:2400, space:50, records:120}
  };
  /** 录入、切账号和提交后重置使用同一份草稿结构；补充与本人记录分别处理。 */
  function emptyRecord() {
    return {text:'',title:'',eventYear:String(new Date().getFullYear()),scope:'private',viewers:[],kind:'own',storyId:'',pendingId:null,seconds:0,recording:false,paused:false,reviewed:false};
  }
  /** 每个基础账号独立获得体验额度，不会因其他家人使用而扣减。 */
  function newAccount(plan='basic') {
    return {plan,used:0,trialRemaining:120,hasDigital:false,setupIncluded:false};
  }
  /** 创建隔离的演示初始状态，刷新或重置后不继承历史数据。 */
  function initialState() {
    const members=['father','mother','xia','grandpa','nian'];
    const stories=structuredClone(STORIES).map(story=>({...story,subject:'father',confirmedBy:'father',viewers:story.scope==='family'?[...members]:[]}));
    return {keepsakeBooks:[],keepsakeBookId:'',actor:'xia',route:'home',variant:new URLSearchParams(location.search).get('variant') || 'A',lifeTab:'overview',videoFilter:'all',archivePerson:'father',archiveAssets:null,archiveProfiles:null,archiveItemId:'',archiveChapterId:'',biographyMode:'read',archiveReturn:null,archivePlayback:{},familyTab:'列表',year:'1986',hotspot:'desk',guide:false,chatTarget:'father',chatContext:null,chatMessages:[],chatDrafts:{},questionDrafts:{},storyId:'first-order',saved:[],stories,members,invitations:[],pending:[],questions:[],accessRequests:[],idSequence:0,materialDrafts:{},materialSubmissions:[],answerFeedback:[],feedbackDrafts:{},feedbackReviewDrafts:{},feedbackReviewId:null,relationshipChapters:null,chapterDrafts:{},chapterNoteDrafts:{},chapterId:null,accounts:{father:{...newAccount('legacy'),used:126,hasDigital:true,setupIncluded:true},xia:newAccount(),nian:newAccount()},record:emptyRecord(),fontLarge:false,modal:null,notice:''};
  }
  /** 两个还原入口同时清除动态人物与业务状态，保留头像等消费者持有的对象引用。 */
  function resetDemoState() {
    Object.keys(PEOPLE).forEach(id=>delete PEOPLE[id]);Object.assign(PEOPLE,structuredClone(PERSON_SEEDS));
    return initialState();
  }
  /** 输出统一线性图标，图标的可访问名称由外层按钮提供。 */
  function icon(name, cls='') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.book}</svg>`; }
  /** 转义示例表单输入，避免用户文字改变原型页面结构。 */
  function escape(value='') { return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  /** 生成动作按钮，动作统一由事件代理执行。 */
  function button(label, action, cls='btn', extra='') { return `<button type="button" class="${cls}" data-action="${action}" ${extra}>${label}</button>`; }
  /** 生成站内导航按钮，保持静态文件也可进行页面切换。 */
  function link(label, route, cls='text-link') { return `<button type="button" class="${cls}" data-nav="${route}">${label}</button>`; }
  /** 显示示例人物头像，缺少照片的人物使用清楚的姓名缩写。 */
  function avatar(id, size='') {
    const p=PEOPLE[id];
    if (!p) return `<span class="avatar ${size}">家</span>`;
    return p.photo ? `<span class="avatar ${size} ${p.photo}"><img src="assets/family.png" alt="${p.name}，示例人物"></span>` : `<span class="avatar ${size} ${p.color || ''}">${p.short}</span>`;
  }
  /** 内容标记同时使用文字，避免仅靠颜色传达意义。 */
  function badge(label, cls='') { return `<span class="badge ${cls}">${label}</span>`; }
  /** 获取当前账号对应的会员权益。 */
  function account() { return App.state.accounts[App.state.actor]; }
  /** 仅向当前访问者提供获授权的故事。 */
  function visibleStories() { return App.state.stories.filter(story=>story.author===App.state.actor || (story.scope!=='private' && story.viewers.includes(App.state.actor))); }
  /** 当前账号的剩余额度只读取该账号，付费会员与体验额度互不叠加扣费。 */
  function remainingMinutes() {const ac=account();return Math.max(0,ac.plan==='basic'?ac.trialRemaining:PLANS[ac.plan].minutes-ac.used);}
  /** 内存递增编号避免连续提交落在同一毫秒时覆盖记录或问题。 */
  function nextId(prefix) {App.state.idSequence++;return `${prefix}-${App.state.idSequence}`;}
  /** 按秒转换为录制时间显示。 */
  function duration(seconds) { return `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`; }
  window.App={state:initialState(),initialState,resetDemoState,emptyRecord,newAccount,nextId,PEOPLE,PLANS,icon,escape,button,link,avatar,badge,account,visibleStories,remainingMinutes,duration,views:{}};
}


