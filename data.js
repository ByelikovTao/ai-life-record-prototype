/** 演示数据与共用视图工具；所有变更只保留在当前页面内存中。 */
'use strict';
{
  /** 家庭空间以“灯火传家”表达温暖与传承，首页与邀请共用展示名称。 */
  const HOME_NAME='灯火传家';
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
  /** 虚构人生样例覆盖青年至当下；新经历只用文字，不补造历史照片或荣誉。 */
  const STORIES = [
    {"id":"school-days","title":"那年，我也有过发亮的梦想","year":"1979","date":"1979年","recorded":"2026年10月29日","category":"青春求学","image":"room","author":"father","scope":"family","text":["第一次在全班面前读自己的作文，手心都是汗。老师说，远山，你写得有自己的想法。","那本练习册已经找不到了，可老师那句话，我一直记到今天。那时候家里条件普通，我也不知道将来会走多远，只想着把眼前的书读好。","现在回头看，我很想对十六岁的自己说一句：别着急，你后来走过的路，比当时想象的还远。"],"quote":"那个不太敢开口的少年，也有了自己的天地。","source":"陈远山示例口述 · 虚构演示","duration":"02:30"},
    {"id":"wedding-day","title":"日子从两个人的一张饭桌开始","year":"1989","date":"1989年","recorded":"2026年10月29日","category":"相伴成家","image":"room","author":"father","scope":"family","text":["结婚时没有多大的排场。林慧和我把新买的碗放进柜子，又为窗帘的颜色商量了半天。","第一晚我们坐在小饭桌前，菜很简单，却觉得以后什么都能一起慢慢来。那时我就想，往后要让她少操一点心。","这些年我们也有争执，有忙得顾不上说话的时候。如今再坐在一张桌前，还是她最知道我的口味。"],"quote":"后来住过更大的房子，最难忘的还是最初那张饭桌。","source":"陈远山示例口述 · 虚构演示","duration":"02:30"},
    {"id":"daughter-born","title":"第一次抱起女儿，我忽然懂了父亲","year":"1992","date":"1992年","recorded":"2026年10月29日","category":"初为人父","image":"room","author":"father","scope":"family","text":["知夏出生那天，我在走廊来回走了好多趟。护士把她交到我手里时，我僵着胳膊，连呼吸都放轻了。","那么小的一个人，握住了我的一根手指。我忽然明白父亲为什么总把家里的事放在前头。","后来工作再忙，我也尽量赶回去看她一眼。现在她有自己的生活了，我依然记得那只握住我的小手。"],"quote":"那一刻，我不只是自己，也成了一个人的依靠。","source":"陈远山示例口述 · 虚构演示","duration":"02:30"},
    {"id":"old-partner","title":"老伙伴说，跟着你做事，心里踏实","year":"2008","date":"2008年","recorded":"2026年10月29日","category":"守信立业","image":"room","author":"father","scope":"family","text":["那一年交付赶得紧，几位一起打拼的老伙伴陪我熬了不少夜。最后一批货发走，我们就在办公室吃了一顿迟来的晚饭。","有人端着茶说，远山，跟着你做事，心里踏实。我没有说什么，心里却热了很久。","做生意这些年，数字记不全了。可谁在困难的时候搭过手，答应别人的事有没有做到，我一直放在心上。"],"quote":"比起做成多少生意，我更珍惜别人说我这个人靠得住。","source":"陈远山示例口述 · 虚构演示","duration":"02:30"},
    {"id":"journey-together","title":"终于有空，陪她慢慢看一回山水","year":"2018","date":"2018年","recorded":"2026年10月29日","category":"山河同行","image":"room","author":"father","scope":"family","text":["那次出门，我们没有排满行程。走累了就在湖边坐下，林慧给我拍照，我总不知道手该往哪里放。","年轻时总说，等忙完这一阵就去。后来才发现，总有下一阵要忙。那天我们约好，往后每年都给自己留一点时间。","回家后我把其中一张照片洗出来，放在书房。看到它就想起那天的风，也提醒自己，日子可以过得慢一些。"],"quote":"这一路为家奔忙，也该陪身边的人好好看看世界。","source":"陈远山示例口述 · 虚构演示","duration":"02:30"},
    {"id":"new-hobby","title":"六十岁，我又做了一回学生","year":"2023","date":"2023年","recorded":"2026年10月29日","category":"自在新篇","image":"room","author":"father","scope":"family","text":["第一次去书画班，我挑了靠后的位置。老师从握笔教起，我写得歪歪扭扭，却很久没有这样专心过了。","现在每周有两天下午留给自己。和同学聊聊字、喝喝茶，回家再把练过的纸摊开，看看哪一笔比上周稳一点。","过去习惯把时间安排给工作和家人。如今才发现，认真做一件自己喜欢的小事，也让人心里很充实。"],"quote":"现在学喜欢的事，不为赶上谁，只为自己高兴。","source":"陈远山示例口述 · 虚构演示","duration":"02:30"},

    {id:'first-order', title:'第一笔订单来的那天', year:'1998', date:'1998年秋', recorded:'2026年10月12日', category:'事业初成', image:'family', author:'father', scope:'family', text:['那时候，办公室只有一张桌子和一部电话。第一笔订单来的时候，我反复看了好几遍，才敢告诉你妈妈。','晚上回到家，我们没有去饭店。你妈妈煮了一碗面，我们坐在饭桌旁，把接下来要做的事写在纸上。','今天再回头看，我记住的不是订单上的数字，而是有人愿意相信我，还有家人始终陪着我。'], quote:'我记住的不是订单上的数字，而是有人愿意相信我。', source:'创业经历访谈 · 片段 03', duration:'03:26'},
    {id:'old-home', title:'那张一直没换的书桌', year:'1986', date:'1986年夏', recorded:'2026年10月14日', category:'离家起步', image:'room', author:'father', scope:'family', text:['老家的窗边一直放着一张书桌。桌面不大，靠窗的一角晒得发白。','后来离开家工作，我写给家里的第一封信，也是在这张桌子上起的稿。每次回去，总会在那里坐一会儿。'], quote:'很多故事，就从这扇窗边开始。', source:'老宅口述记录 · 片段 02', duration:'01:28'},
    {id:'spring', title:'今年春节，全家又坐在一起', year:'2026', date:'2026年春节', recorded:'2026年2月20日', category:'天伦时光', image:'family', author:'xia', scope:'family', text:['爸爸说，团圆并不需要安排很多事。一家人围着桌子吃饭，就已经很好。','我这次才知道，那道每年都会做的菜，最早是奶奶教给妈妈的。下次，我也想学会。'], quote:'一家人围着桌子吃饭，就已经很好。', source:'陈知夏的家庭记录', duration:'02:15'},
    {id:'private', title:'留给自己的几句话', year:'2026', date:'2026年10月', recorded:'2026年10月18日', category:'个人记录', image:'room', author:'father', scope:'private', text:['有些话，我想先留给自己。等准备好了，再慢慢讲给家人听。'], quote:'有些话，想先留给自己。', source:'本人文字记录', duration:'01:00'}
  ];
  /** 草稿同时记录对象和类型，自己的记录、补充与共同回忆各自保存，不随人物切换改归属。 */
  function emptyRecord() {
    return {text:'',title:'',eventYear:String(new Date().getFullYear()),scope:'private',viewers:[],kind:'own',subject:'',storyId:'',pendingId:null,archiveAddition:false,seconds:0,recording:false,paused:false,reviewed:false};
  }
  /** 账号只维护身份与建档状态，年度权益由人物服务统一维护。 */
  function newAccount() {
    return {videoDelivered:false,hasDigital:false,setupIncluded:false};
  }
  /** 虚构待办用于红点演示；每次刷新或重置重新创建，处理不改写种子数据。 */
  function demoTasks() {
    return {
      questions:[
        {id:'demo-question-xia',from:'xia',owner:'father',text:'【演示】爸，你第一次拿到创业订单时，最想把好消息告诉谁？',storyId:'first-order',contentContext:{kind:'story',storyId:'first-order'},status:'pending',answer:'',replyRead:false,created:'演示数据'},
        {id:'demo-question-nian',from:'nian',owner:'father',text:'【演示】爷爷，小时候老家窗边的书桌，是谁经常在用？',storyId:'old-home',contentContext:{kind:'story',storyId:'old-home'},status:'pending',answer:'',replyRead:false,created:'演示数据'}
      ],
      answerFeedback:[
        {id:'demo-feedback-year',from:'xia',owner:'father',question:'【演示】第一笔订单是什么时候接到的？',original:'我记得是1997年接到的。',suggestion:'档案里记的是1998年，请爸爸核对一下具体年份。',reason:'fact',ref:{kind:'story',storyId:'first-order'},status:'pending',approved:'',note:'',resultRead:false},
        {id:'demo-feedback-style',from:'nian',owner:'father',question:'【演示】爷爷，你想对家人说些什么？',original:'请大家持续优化沟通效率，提升家庭协同水平。',suggestion:'这句话有点像工作报告，爷爷平常会说得更亲切一些，请爷爷改成自己的表达。',reason:'style',ref:{kind:'story',storyId:'old-home'},status:'pending',approved:'',note:'',resultRead:false}
      ]
    };
  }
  /** 共同回忆示例直接使用原稿与本人纳入契约，确认不自动授予数字人引用。 */
  function demoCommonMemories() {
    const samples=[
      ['sea','xia','第一次陪爸爸去看海','2025','那天我们沿着海边慢慢走，爸爸说年轻时总忙着工作，很少停下来看看风景。我想把那一刻的轻松留下来。',false],
      ['dumplings','nian','和爷爷一起包饺子','2026','爷爷教我把饺子边捏紧，还说以前过年一家人都围在桌边帮忙。我包得不好看，爷爷还是笑着夸我。',false],
      ['photos','xia','一起整理老照片','2024','周末陪爸爸整理旧相册，才知道几张老照片背后的故事。爸爸说，照片里的人和当时的心情，都值得记下来。',true],
      ['writing','nian','爷爷教我写名字','2023','爷爷握着我的手，一笔一画地教我写名字。他说写字不用急，做事也一样，先把每一笔写认真。',true]
    ];
    return samples.map(([key,author,title,year,text,confirmed])=>({id:'demo-common-'+key,author,subject:author,commonWith:'father',inclusions:confirmed?{father:{active:true,reviewed:true,viewers:['father'],ai:false}}:{},title:'【演示】'+title,text:[text],year,date:year+'年 · 演示回忆',recorded:'演示数据',scope:'selected',viewers:['father'],category:'共同回忆',image:'family',source:PEOPLE[author].name+'的共同回忆演示',confirmedBy:author,quote:text.slice(0,52)}));
  }
  /** 创建隔离初始状态；家庭首页内容由独立模块按需创建。 */
  function initialState() {
    const members=['father','mother','xia','grandpa','nian'];
    const tasks=demoTasks();
    const stories=structuredClone(STORIES).map(story=>({...story,subject:'father',confirmedBy:'father',aiAllowed:true,viewers:story.scope==='family'?[...members]:[]}));
    stories.push(...demoCommonMemories());
    return {billingSeedDate:new Date().toISOString().slice(0,10),billingToday:new Date().toISOString().slice(0,10),personServices:{},familyHome:null,billingOrders:[],usageReceipts:[],referrals:[],rewardLedger:[],billingPeople:{},familyFocus:{xia:'father',nian:'father'},familyInvitations:{xia:['father','mother'],nian:['father']},familyAccess:{father:{archive:['xia','nian'],digital:['xia','nian'],space:['xia','nian']},mother:{archive:['xia'],digital:[],space:[]}},familyRequests:[],keepsakeBooks:[],keepsakeBookId:'',actor:'xia',route:'home',lifeTab:'overview',videoFilter:'all',archivePerson:'father',archiveAssets:null,archiveProfiles:null,archiveItemId:'',archiveChapterId:'',biographyMode:'read',archiveReturn:null,archivePlayback:{},familyTab:'列表',year:'1986',hotspot:'desk',guide:false,chatTarget:'father',chatContext:null,chatMessages:[],chatDrafts:{},questionDrafts:{},storyId:'first-order',saved:[],stories,members,invitations:[],pending:[],questions:tasks.questions,accessRequests:[],idSequence:0,materialDrafts:{},materialTabs:{},materialSubmissions:[],answerFeedback:tasks.answerFeedback,feedbackDrafts:{},feedbackReviewDrafts:{},feedbackReviewId:null,relationshipChapters:null,chapterDrafts:{},chapterNoteDrafts:{},chapterId:null,accounts:{father:{...newAccount(),videoDelivered:true,hasDigital:true,setupIncluded:true},xia:newAccount(),nian:newAccount()},record:emptyRecord(),fontLarge:false,modal:null,notice:''};
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
  /** 五位示例家人复用设计稿独立头像，避免从合照裁错人物；新增人物使用姓名缩写。 */
  function avatar(id, size='') {
    const p=PEOPLE[id];
    if (!p) return `<span class="avatar ${size}">家</span>`;
    const hasPortrait=['grandpa','father','mother','xia','nian'].includes(id);
    return hasPortrait ? `<span class="avatar ${size} ${id}"><img src="assets/zhumen/portrait-${id}.png" alt="${p.name}，设计稿中的示例人物"></span>` : `<span class="avatar ${size} ${p.color || ''}">${p.short}</span>`;
  }
  /** 内容标记同时使用文字，避免仅靠颜色传达意义。 */
  function badge(label, cls='') { return `<span class="badge ${cls}">${label}</span>`; }
  /** 获取当前账号对应的会员权益。 */
  function account() { return App.state.accounts[App.state.actor]; }
  /** 仅向当前访问者提供获授权的故事。 */
  function visibleStories() { return App.state.stories.filter(story=>App.FamilyContext.readable(story)); }
  /** 内存递增编号避免连续提交落在同一毫秒时覆盖记录或问题。 */
  function nextId(prefix) {App.state.idSequence++;return `${prefix}-${App.state.idSequence}`;}
  /** 按秒转换为录制时间显示。 */
  function duration(seconds) { return `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`; }
  window.App={state:initialState(),initialState,resetDemoState,emptyRecord,newAccount,nextId,PEOPLE,HOME_NAME,icon,escape,button,link,avatar,badge,account,visibleStories,duration,views:{}};
}


