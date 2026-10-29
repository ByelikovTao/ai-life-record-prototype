/** 人物档案示例目录：按资料归属人区分影片、照片、本人拍摄与作品，非真实客户存档。 */
'use strict';
{
  /** 家庭可见范围固定为这批初始成员，新成员需另行获得资料授权。 */
  const FAMILY=['father','mother','xia','grandpa','nian'];
  /** 章节保留叙述编排，已有事件只存 storyIds 引用；正文与授权由事件记录唯一维护。 */
  const people={
    father:{
      tagline:'把走过的路，慢慢讲给家人。',
      bioIntro:'陈远山，1963年出生。从离家工作时写下的家书，到1998年的第一笔订单，再到一家人围坐的今天，他想留下的，是选择背后的心情，以及家人相伴的细节。',
      author:'father',sourceLabel:'虚构人物传记 · 依据原型示例故事编排',scope:'family',viewers:[...FAMILY],
      sections:[
        {id:'father-origin',title:'一、从熟悉的家出发',years:'1963—1985',body:[
          '1963年，陈远山出生。关于最早的记忆，他想从家讲起：窗边的光、桌上的书，以及家人忙碌的身影。这些平常的场景，后来成了他辨认故乡的方式。'
        ]},
        {id:'father-letters',title:'二、离家之后，话写在信里',years:'1986—1997',body:[],storyIds:['old-home']},
        {id:'father-first-order',title:'三、第一笔订单来的那天',years:'1998',body:[],storyIds:['first-order']},
        {id:'father-family',title:'四、工作之外，还有一家人的日常',years:'1999—2025',body:[
          '工作的事情一件接着一件，家里的生活也在继续。陈远山逐渐意识到，一段人生并不只由重要决定组成，家人之间许多不起眼的照顾，同样值得被记住。',
          '女儿陈知夏有了自己的生活，家里也添了新的笑声。老照片、几封家书和偶尔拍下的片段，成为大家重新坐到一起时最容易打开的话题。'
        ]},
        {id:'father-today',title:'五、把没讲完的故事继续留下',years:'2026—现在',storyIds:['spring'],body:[
          '现在，他想把讲过和没讲完的经历逐渐整理起来。影片保留完整的叙述，照片留住一个瞬间，自己拍下的小片段则记录日子的变化。这份传记也会随着新的记录继续补充。'
        ]}
      ]
    },
    mother:{
      tagline:'家里的日常，也是一份值得留下的人生。',
      bioIntro:'林慧，1965年出生。她的示例传记从家庭生活与共同经历展开，记录她自己的感受，不以另一位家人的人生代替她的故事。',
      author:'mother',sourceLabel:'虚构人物传记示例 · 非客户真实资料',scope:'family',viewers:[...FAMILY],
      sections:[
        {id:'mother-beginning',title:'一、先从自己记得的日子说起',years:'1965—1997',body:[
          '1965年出生的林慧，想留下的第一部分，是属于自己的生活记忆。家人整理这份示例传记时，为尚未讲清楚的求学、工作与个人爱好保留了位置，不用猜测补齐。'
        ]},
        {id:'mother-shared-choice',title:'二、一起商量往后的生活',years:'1998',body:[
          '陈远山收到第一笔订单的那天，林慧陪他一起高兴。晚饭后，两个人坐下来商量接下来的安排。同一段共同经历，她记得的是对方进门时一直带着笑的样子。'
        ]},
        {id:'mother-everyday',title:'三、让家人听见她自己的声音',years:'2026—现在',body:[
          '春节的一顿饭、平时的一道家常菜，都可以成为林慧讲述生活的入口。这份传记与她的照片、拍摄片段分开保存，也等待她继续确认与补充属于自己的经历。'
        ]}
      ]
    },
    xia:{
      tagline:'听家里的故事，也留下我自己的生活。',
      bioIntro:'陈知夏，1992年出生。她既是家庭故事的参与者，也是自己人生的讲述者；她的照片、记录与拍摄片段归在自己的档案中。',
      author:'xia',sourceLabel:'虚构人物传记示例 · 非客户真实资料',scope:'family',viewers:[...FAMILY],
      sections:[
        {id:'xia-growing',title:'一、在家人的故事里长大',years:'1992—2015',body:[
          '陈知夏对家庭的认识，来自共同生活，也来自后来听到的讲述。她开始发现，父母熟悉的面孔背后，还有许多自己没有经历过、也没有认真问过的日子。'
        ]},
        {id:'xia-own-life',title:'二、给自己的经历留一个位置',years:'2016—2025',body:[
          '长大后的知夏有了自己的生活。她可以记录今天的心情，整理喜欢的照片，也可以决定哪些内容愿意与家人分享。自己的记录不会因为属于同一个家庭，就被放进父亲的传记。'
        ]},
        {id:'xia-family-record',title:'三、从一次团聚继续提问',years:'2026—现在',body:[
          '2026年春节，知夏和家人又坐到了一起。她听爸爸讲团圆，也第一次留意一道年年都会做的家常菜从哪里来。那些看似熟悉的日常，给了她继续提问和记录的理由。'
        ]}
      ]
    },
    nian:{
      tagline:'成长中的小事，慢慢记录就好。',
      bioIntro:'陈念念，2016年出生。这是由家人整理的成长档案示例，尚未收录她本人的照片和拍摄视频；空白处等待真实资料与合适的确认。',
      author:'father',sourceLabel:'家人成长记录示例 · 非本人访谈',scope:'family',viewers:[...FAMILY],
      sections:[
        {id:'nian-growth',title:'一、成长档案的起点',years:'2016—2025',body:[
          '家人为念念留出一份独立档案，记录她在成长中愿意分享的小事。尚未整理的具体经历保持空白，不使用成年家人的故事或照片代替她自己的资料。'
        ]},
        {id:'nian-now',title:'二、从今天愿意讲的话开始',years:'2026—现在',body:[
          '一次开心的见闻、一个想问爷爷的问题，都可以成为新的记录。当前内容仅展示家人整理成长资料的方式，没有建立念念的本人数字人。'
        ]}
      ]
    },
    grandpa:{
      tagline:'家人记得的故事，保留各自的来源。',
      bioIntro:'陈明德，1938年出生。这份档案由家人整理；目前仅保留已知的基本关系，尚未收录真实老照片、原始影片或完整口述传记。',
      author:'father',sourceLabel:'家人整理的历史人物档案示例 · 非本人访谈',scope:'family',viewers:[...FAMILY],
      sections:[
        {id:'grandpa-known',title:'一、已知的基本资料',years:'1938',body:[
          '现有示例资料记录了陈明德的姓名、出生年份，以及他与陈远山的父子关系。其余求学、工作和生活经历尚未整理，不根据年份或家族称呼补造故事。'
        ]},
        {id:'grandpa-collecting',title:'二、等待家人补充的记忆',years:'家人持续整理中',body:[
          '若家人找到原始照片、信件或影像，可以在核对人物、年代与讲述者后继续补充。不同人的回忆应分别保留来源，不把家人的叙述写成本人已经确认的访谈。'
        ]}
      ]
    }
  };
  /** 视频为可播放的图片编排演示；kind 区分人生影片与生活影像，拍摄类型由查看人物与拍摄者关系决定。 */
  const assets=[
    // 年代示意与故事共用授权及关联，不作为历史实拍资料。
    {"id":"father-photo-youth","subject":"father","kind":"photo","title":"青春求学 · 年代示意","date":"1979年场景 · 2026年生成","year":"1979","description":"AI依据虚构人物参考肖像生成的年代示意照片，非历史实拍。","poster":"assets/zhumen/life-youth-demo.png","author":"father","sourceLabel":"AI生成的年代示意照片 · 非历史实拍","scope":"family","viewers":["father","mother","xia","grandpa","nian"],"relatedStoryId":"school-days"},
    {"id":"father-photo-wedding","subject":"father","kind":"photo","title":"相伴成家 · 年代示意","date":"1989年场景 · 2026年生成","year":"1989","description":"AI依据虚构人物参考肖像生成的年代示意照片，非历史实拍。","poster":"assets/zhumen/life-wedding-demo.png","author":"father","sourceLabel":"AI生成的年代示意照片 · 非历史实拍","scope":"family","viewers":["father","mother","xia","grandpa","nian"],"relatedStoryId":"wedding-day"},
    {"id":"father-photo-career","subject":"father","kind":"photo","title":"创业起步 · 年代示意","date":"1998年场景 · 2026年生成","year":"1998","description":"AI依据虚构人物参考肖像生成的年代示意照片，非历史实拍。","poster":"assets/zhumen/life-career-demo.png","author":"father","sourceLabel":"AI生成的年代示意照片 · 非历史实拍","scope":"family","viewers":["father","mother","xia","grandpa","nian"],"relatedStoryId":"first-order"},

    {
      id:'father-life-film',subject:'father',kind:'film',title:'陈远山 · 走过的这些年',
      date:'2026年10月 · 示例交付',year:'2026',duration:12,
      description:'展示专业人生影片完成后如何存档与观看。当前演示片由示例图片编排，不是真实客户拍摄成片。',
      poster:'assets/avatar/reference-person.png',src:'assets/archive-demo/life-film.mp4',
      author:'father',sourceLabel:'人生影片播放演示 · 示例图片编排',scope:'family',viewers:[...FAMILY]
    },
    {
      id:'father-photo-portrait',subject:'father',kind:'photo',title:'人物肖像（参考图）',
      date:'2026年10月 · 示例归档',year:'2026',
      description:'由用户提供的参考肖像，用于展示人物照片归档和大图查看，不认定为陈远山本人的真实照片。',
      poster:'assets/avatar/reference-person.png',author:'father',sourceLabel:'用户提供的造型参考图 · 非客户本人存档',scope:'family',viewers:[...FAMILY]
    },
    {
      id:'father-photo-family',subject:'father',kind:'photo',title:'和家人坐在一起',
      date:'2026年 · 示例照片',year:'2026',description:'人物相关的家庭照片示例，和完整人生影片分别存档。画面为现有 AI 生成素材，不是历史实拍。',
      poster:'assets/family.png',author:'father',sourceLabel:'AI 生成的家庭照片示例',scope:'family',viewers:[...FAMILY],relatedStoryId:'spring'
    },
    {
      id:'father-photo-home',subject:'father',kind:'photo',title:'记忆里生活过的地方',
      date:'2026年 · 场景示意归档',year:'2026',description:'与陈远山人生相关的老家场景图，用于展示照片与地点的关联；不是1986年的原始老照片。',
      poster:'assets/room.png',author:'father',sourceLabel:'AI 生成的老家场景示例',scope:'family',viewers:[...FAMILY],relatedStoryId:'old-home'
    },
    {
      id:'father-clip-home',subject:'father',kind:'clip',title:'我拍下的家中一刻',
      date:'2026年10月 · 拍摄分类示例',year:'2026',duration:12,
      description:'视频入口中“本人拍摄”类型的生活影像示例，可查看拍摄人、时间和说明。演示画面由示例图片编排，并非本人真实拍摄。',
      poster:'assets/room.png',src:'assets/archive-demo/home-moment.mp4',
      author:'father',sourceLabel:'本人拍摄分类演示 · 非真实实拍视频',scope:'family',viewers:[...FAMILY],relatedStoryId:'old-home'
    },
    {
      id:'father-clip-reunion',subject:'xia',kind:'clip',title:'爸爸拍下的知夏与家人',
      date:'2026年春节 · 分类示例',year:'2026',duration:12,
      description:'资料围绕陈知夏存档，拍摄者为陈远山，因此也会出现在陈远山的视频入口的“本人拍摄”类型。当前为图片编排演示，不是实际春节录像。',
      poster:'assets/family.png',src:'assets/archive-demo/family-moment.mp4',
      author:'father',sourceLabel:'本人拍摄分类演示 · 非真实实拍视频',scope:'family',viewers:[...FAMILY],relatedStoryId:'spring'
    },
    {
      id:'father-clip-by-xia',subject:'father',kind:'clip',title:'知夏镜头里的爸爸',
      date:'2026年春节 · 分类示例',year:'2026',duration:12,
      description:'资料围绕陈远山存档，拍摄者为陈知夏。它属于“关于陈远山的视频”，不会被标成陈远山本人拍摄；当前为图片编排演示。',
      poster:'assets/family.png',src:'assets/archive-demo/family-moment.mp4',
      author:'xia',sourceLabel:'家人拍摄分类演示 · 非真实实拍视频',scope:'family',viewers:[...FAMILY],relatedStoryId:'spring'
    },
    {
      id:'father-clip-private',subject:'father',kind:'clip',title:'只留给自己的拍摄草稿',
      date:'2026年10月 · 私密示例',year:'2026',duration:12,
      description:'仅本人可见的拍摄草稿示例。进入某个人的档案或加入家庭，不会自动获得这段内容的查看权限。',
      poster:'assets/room.png',src:'assets/archive-demo/home-moment.mp4',
      author:'father',sourceLabel:'私密权限演示 · 非真实实拍视频',scope:'private',viewers:[]
    },
    // 著作、文章与书画统一作为作品资料，展示图复用已确认设计切图；不冒充出版物或真实原作。
    {"id": "father-work-book-days", "subject": "father", "kind": "work", "title": "著作 · 把日子过成故事", "date": "2018年 · 虚构作品示例", "year": "2018", "description": "一本围绕工作、家庭与日常选择编排的虚构随笔集。此处展示目录与两个短节选，不是完整出版物。", "poster": "assets/works/father-work-book-days.png", "author": "father", "sourceLabel": "原型虚构著作节选 · 文字与展示图均为演示内容", "scope": "family", "viewers": ["father", "mother", "xia", "grandpa", "nian"], "body": ["示例目录：一、从老家出发；二、第一次把事情做成；三、留一盏回家的灯；四、把平常日子记下来。", "节选《留一盏灯》：年轻时总觉得，日子要有很大的事情发生，才值得写下来。后来才明白，一碗热面、一句到了没有、一盏等人回家的灯，都在悄悄告诉我，自己为什么要往前走。", "节选《慢慢讲》：有些选择，当年只顾着做，没来得及解释。现在想把它们讲给家人听，不是为了证明自己总是对的，而是让他们知道，我也犹豫过，也因为有人陪着，才多走了一步。"]},
    {"id": "father-work-book-home", "subject": "father", "kind": "work", "title": "著作 · 老屋里的四季", "date": "2022年 · 虚构作品示例", "year": "2022", "description": "以老屋、四季和家庭记忆为主题的虚构散文集，展示内容提要与短节选，无真实出版信息。", "poster": "assets/works/father-work-book-home.png", "author": "father", "sourceLabel": "原型虚构著作节选 · 文字与展示图均为演示内容", "scope": "family", "viewers": ["father", "mother", "xia", "grandpa", "nian"], "body": ["内容提要：从春天窗前的光，到冬天饭桌旁的热气，用四个季节串起关于家与成长的记忆。", "节选《夏天的窗边》：午后的风从窗缝进来，把桌上摊开的书翻过一页。那时候觉得，窗外才是想去的远方；很多年以后，远方走过了，最想回去的却是这扇窗边。", "节选《冬天的一顿饭》：家里人陆续回来，门一开一合。菜可以晚一点上齐，话也不必一次说完，只要围着同一张桌子坐下，冬天就没有那么冷。"]},
    {"id": "father-work-essay-order", "subject": "father", "kind": "work", "title": "文章 · 第一笔订单之后", "date": "2020年 · 虚构作品示例", "year": "2020", "description": "关于创业与信任的虚构短文。与人生事件分开作为创作成果保存。", "poster": "assets/works/father-work-essay-order.png", "author": "father", "sourceLabel": "原型虚构文章 · 文字与展示图均为演示内容", "scope": "family", "viewers": ["father", "mother", "xia", "grandpa", "nian"], "body": ["第一笔订单来的时候，我最先想到的不是庆祝，而是能不能把答应的事做好。那张纸上的每一个字，都像在提醒我：别人已经把信任交过来了。", "后来做的事情多了，才慢慢懂得，生意里的长久关系，常常来自一些很小的坚持。答应什么时候回电话，就什么时候回；做不到的事情，早点说清楚。", "我想留给晚辈的，并不是某一种成功办法。只是希望他们遇到选择时，除了问值不值得，也问一句：这件事，我能不能对自己和相信我的人交代。"]},
    {"id": "father-work-essay-reunion", "subject": "father", "kind": "work", "title": "文章 · 团圆不必等到节日", "date": "2026年 · 虚构作品示例", "year": "2026", "description": "写给日常相处的虚构生活随笔，呈现文章阅读与资料追问的方式。", "poster": "assets/works/father-work-essay-reunion.png", "author": "father", "sourceLabel": "原型虚构文章 · 文字与展示图均为演示内容", "scope": "family", "viewers": ["father", "mother", "xia", "grandpa", "nian"], "body": ["以前总想着，等忙完这一阵，再好好陪家人。可这一阵后面，往往还有下一阵。回头看，真正让人记得的团圆，未必都安排在日历上。", "一起去买一次菜，饭后多坐十分钟，听孩子把一件小事讲完，这些都算。相处不一定需要很隆重，愿意把时间交给彼此，就已经有了分量。", "下次想家了，不妨先打个电话。也许没有什么特别的事可说，但熟悉的声音，本身就是一件值得留下的小事。"]},
    {"id": "father-work-calligraphy", "subject": "father", "kind": "work", "title": "书法 · 家和", "date": "2024年 · 虚构作品示例", "year": "2024", "description": "“家和”二字的书法作品归档示例。画面裁自已确认设计稿，是AI示意，不是真实书法扫描。", "poster": "assets/works/father-work-calligraphy.png", "author": "father", "sourceLabel": "原型虚构书法 · 文字与展示图均为演示内容", "scope": "family", "viewers": ["father", "mother", "xia", "grandpa", "nian"], "body": ["作品内容：家和。", "创作说明（虚构）：想把这两个字留在家里，提醒自己和晚辈，意见不一样时，也可以把话慢慢说清楚。", "展示说明：当前使用设计稿中的AI书法配图，正式资料可替换为整幅原作、局部细节与落款照片；本示例不提供真实书法家、尺寸或收藏鉴定信息。"]},
    {"id": "father-work-painting", "subject": "father", "kind": "work", "title": "绘画 · 山居小景", "date": "2025年 · 虚构作品示例", "year": "2025", "description": "以远山、树木与小屋构成的设计稿AI配图，用于演示绘画归档，不是陈远山真实画作。", "poster": "assets/works/father-work-painting.png", "author": "father", "sourceLabel": "原型虚构绘画 · 文字与展示图均为演示内容", "scope": "family", "viewers": ["father", "mother", "xia", "grandpa", "nian"], "body": ["画面说明：远处的山层层展开，近处是一间小屋和几棵树。画面留出大片天空，想表达安静、舒展的感觉。", "创作说明（虚构）：外出走过很多地方后，仍然喜欢有山、有树、有人家的景色。它像记忆里的一个去处，不必与某个真实地点完全对应。", "展示说明：当前画面为已确认设计稿中的AI绘画示意；正式归档可保存原作高清图、创作手记和细节照片。"]},
    {
      id:'old-home-letter',subject:'father',kind:'document',title:'离家后的家书 · 节选',
      date:'1986—1992年 · 虚构节选',year:'1986',description:'“那张一直没换的书桌”事件的书信资料示例，不是原始信件扫描。家书与该事件关联，不计入个人作品。',
      poster:'assets/room.png',author:'father',sourceLabel:'事件书信资料示例 · 虚构家书节选',scope:'family',viewers:[...FAMILY],relatedStoryId:'old-home',
      body:[
        '亲爱的家人：家里一切可好？今天又在窗边坐了一会儿，想起离家前你们收拾行李的样子。路上有许多新鲜事，等下次回去，再慢慢讲给你们听。',
        '这里的日子忙碌，我会好好照顾自己。你们也不要太累。想家的时候，我会把想说的话写下来，好像隔着信纸，仍能听见家里熟悉的声音。',
        '等到再见面，我们坐在一起吃顿饭。许多当时来不及讲清楚的事情，也许慢慢说，就能说得明白。'
      ]
    },
    {
      id:'mother-photo-family',subject:'mother',kind:'photo',title:'林慧的家庭相册 · 团聚',
      date:'2026年 · 示例归档',year:'2026',description:'林慧档案中的家庭相关照片示例。画面为共享示意素材，不认定其中人物为林慧本人。',
      poster:'assets/family.png',author:'mother',sourceLabel:'AI 生成的家庭关联照片示例',scope:'family',viewers:[...FAMILY]
    },
    {
      id:'mother-clip-home',subject:'mother',kind:'clip',title:'家里的日常',
      date:'2026年 · 拍摄分类示例',year:'2026',duration:12,description:'林慧视频入口中本人拍摄类型的演示条目，与陈远山的影像列表独立。当前画面由示例图片编排，不是她本人拍摄的录像。',
      poster:'assets/room.png',src:'assets/archive-demo/home-moment.mp4',
      author:'mother',sourceLabel:'本人拍摄分类演示 · 非真实实拍视频',scope:'family',viewers:[...FAMILY]
    },
    {
      id:'xia-photo-family',subject:'xia',kind:'photo',title:'知夏的相册 · 家人相伴',
      date:'2026年 · 示例归档',year:'2026',description:'陈知夏独立档案中的家庭照片示例，不会因为她是家人，就被混入父亲的个人照片统计。',
      poster:'assets/family.png',author:'xia',sourceLabel:'AI 生成的家庭关联照片示例',scope:'family',viewers:[...FAMILY],relatedStoryId:'spring'
    },
    {
      id:'xia-clip-reunion',subject:'xia',kind:'clip',title:'我想留下的团聚片段',
      date:'2026年春节 · 分类示例',year:'2026',duration:12,description:'陈知夏视频入口中本人拍摄类型的演示条目，由她的独立档案展示；当前使用示例图片编排，不是实际本人拍摄。',
      poster:'assets/family.png',src:'assets/archive-demo/family-moment.mp4',
      author:'xia',sourceLabel:'本人拍摄分类演示 · 非真实实拍视频',scope:'family',viewers:[...FAMILY]
    }
  ];
  /** 字幕属于对应的演示文件，可在播放器显示，也能在资料页阅读，不冒充本人原声转写。 */
  const captions={
    'assets/archive-demo/life-film.mp4':[
      {start:0,end:4,text:'每个普通的日子，都有值得留下的故事。'},
      {start:4,end:8,text:'一张书桌，一封家书，一家人相伴的时光。'},
      {start:8,end:12,text:'把这些人生片段，慢慢讲给家人听。'}
    ],
    'assets/archive-demo/home-moment.mp4':[
      {start:0,end:6,text:'窗边的书桌，和记忆里熟悉的房间。'},
      {start:6,end:12,text:'用一段影像，留下普通的一天。'}
    ],
    'assets/archive-demo/family-moment.mp4':[
      {start:0,end:6,text:'把一家人在一起的时光留下。'},
      {start:6,end:12,text:'影像留住重逢，也留住生活的片刻。'}
    ]
  };
  /** 地点作为探索视角，只关联原事件；是否能进入空间单独标记，不把事件页冒充漫游。 */
  const places=[
    {id:'old-house',subject:'father',title:'老家',description:'从窗边书桌与家书，了解离家前后的生活。',storyIds:['old-home'],hasSpace:true},
    {id:'first-office',subject:'father',title:'第一间办公室',description:'从第一笔订单，了解创业起点的经历。空间漫游暂未开放。',storyIds:['first-order'],hasSpace:false}
  ];
  window.App.ARCHIVE_DATA={
    notice:'人物与传记为虚构原型资料；视频由示例图片编排，参考肖像来自用户提供图片，不代表真实客户影片或本人实拍。',
    people,assets,captions,places
  };
}
