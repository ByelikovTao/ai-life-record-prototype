/** 传家记首次体验：模拟应用市场、安装与验证码登录，全部状态仅保存在当前页面内存。 */
'use strict';
{
  const P=window.App,e=P.escape;
  const DEMO_PHONE='13800000000',DEMO_CODE='246810';
  const PREVIEWS=[
    {title:'把一生，留给最亲的人',tag:'人生首页',image:'assets/family.png',body:'一部人生影片，串起一家人的记忆。'},
    {title:'每一段经历，都值得珍藏',tag:'人生印记',image:'assets/works/father-work-book-days.svg',body:'影片、照片、著作与文章，慢慢汇成一本人生。'},
    {title:'想念的时候，和TA聊聊',tag:'与TA聊聊',image:'assets/family.png',body:'围绕留下的故事交流，听见熟悉的人生。'},
    {title:'再走进，记忆里的老家',tag:'回忆里的家',image:'assets/room-portrait.png',body:'环顾老屋、看看布局，找回熟悉的物件与故事。'}
  ];
  /** 三屏总览的既有内嵌预览保持业务画面；主原型包括深链接均先走下载登录。 */
  function initialSession(){return {page:'market',query:'',searched:false,installed:false,installing:false,authenticated:new URLSearchParams(location.search).get('embedded')==='1',phone:'',code:'',consent:false,actor:'father',sentPhone:'',error:''};}
  let session=initialSession();
  let installTimer;
  /** 操作使用独立事件属性，避免误入现有业务动作与导航分发。 */
  function button(text,action,cls='',extra=''){return `<button type="button" class="${cls}" data-entry="${action}" ${extra}>${text}</button>`;}
  /** 图标与品牌均为本地矢量素材，不依赖外网。 */
  function logo(){return '<img class="entry-logo" src="assets/chuanjiaji-icon.svg" alt="传家记应用图标">';}
  /** 市场搜索由用户提交关键词驱动，支持清空、无结果和再次搜索。 */
  function market(){
    const matches=session.searched&&/传家记|传家|家庭|人生|回忆/.test(session.query);
    return `<div class="market-heading"><span>发现值得留下的美好</span><h1>应用市场</h1></div>
      <form id="entry-search" class="market-search"><label class="sr-only" for="entry-query">搜索应用</label>${P.icon('search')}<input id="entry-query" name="query" type="search" placeholder="搜索应用、游戏" value="${e(session.query)}" maxlength="40"><button type="submit">搜索</button></form>
      ${session.searched?`<h2 class="entry-section-title">搜索结果</h2>${matches?`<div class="market-result">${button(`${logo()}<span><strong>传家记</strong><small>珍藏人生故事，让爱代代相传</small><small>家庭记录 · 生活</small></span>`,'detail','market-result-info')}${button('查看','detail','market-get')}</div><p class="entry-caption">找到 1 个相关应用</p>`:'<div class="entry-empty">暂未找到相关应用<p>试试搜索“传家记”</p></div>'}`:
      `<div class="market-feature"><span>为家人，留住时光</span><h2>有些故事<br>值得代代相传</h2>${button('搜索「传家记」 →','suggest','market-suggest')}</div><h2 class="entry-section-title">大家都在搜</h2>${button('传家记','suggest','market-chip')}<p class="entry-caption">应用市场展示与下载均为演示</p>`}`;
  }
  /** 预览图使用真实原型素材与对应功能文案；点击后可放大阅读。 */
  function preview(item,index){return `<article class="store-preview preview-${index}"><span>${item.tag}</span><h3>${item.title}</h3><div class="preview-screen"><img src="${item.image}" alt="${item.tag}功能示意"><strong>传家记 · ${item.tag}</strong><p>${item.body}</p>${index===2?'<div class="preview-bubble">爸，讲讲你年轻时的故事吧。</div>':''}</div></article>`;}
  /** 应用详情整合简介、预览图和获取状态，不虚构评分、下载量或真实上架信息。 */
  function detail(){
    const label=session.installing?'正在下载并安装…':session.installed?'打开':'获取';
    return `${button('‹ 搜索','market','entry-back')}<div class="store-identity">${logo()}<div><h1>传家记</h1><p>让人生有迹，让家风有传</p><span>家庭记录 · 生活</span></div></div>
      ${button(label,session.installed?'open':'install','entry-primary',session.installing?'disabled':'')}
      ${session.installing?'<div class="install-progress" role="status"><span></span><p>正在准备传家记，请稍候</p></div>':''}
      <div class="store-facts"><div><strong>家庭记忆</strong><span>人生故事与家风传承</span></div><div><strong>邀请家人</strong><span>共同参与，按授权查看</span></div></div>
      <h2 class="entry-section-title">预览</h2><div class="store-previews">${PREVIEWS.map((item,index)=>button(preview(item,index),'preview','preview-button',`data-index="${index}" aria-label="放大预览：${item.tag}"`)).join('')}</div>
      <section class="store-description"><h2>关于传家记</h2><p>传家记，属于一家人的人生记忆空间。把珍贵的影像、照片和讲述整理成人生档案，让家人看见来时的路，也让故事继续被听见。</p><ul><li>人生印记：收藏影片、照片、传记与个人作品。</li><li>与TA聊聊：围绕已留下的资料，继续聊聊人生故事。</li><li>回忆里的家：走进熟悉的老屋，重温物件背后的记忆。</li><li>家人共建：补充资料、核对讲述，留下彼此的共同回忆。</li></ul><p>由线下拍摄服务开通档案账号，家人受邀后免费参与，按授权查看。</p></section><p class="entry-caption">原型演示 · 暂定名称 · 未实际上架应用市场</p>`;
  }
  /** 演示填号入口置于表单上方；登录核对手机号、验证码与主动同意，身份映射现有示例账号。 */
  function login(){
    return `${button('‹ 应用详情','detail','entry-back')}<div class="login-brand">${logo()}<h1>欢迎来到传家记</h1><p>把一家人的故事，好好留下来。</p></div>
      ${button('填入演示手机号','fill','entry-fill')}
      <form id="entry-login" class="entry-login" novalidate><label for="entry-phone">手机号</label><input id="entry-phone" name="phone" type="tel" inputmode="numeric" autocomplete="off" maxlength="11" placeholder="请输入手机号" value="${e(session.phone)}">
      <label for="entry-code">验证码</label><div class="entry-code-row"><input id="entry-code" name="code" inputmode="numeric" autocomplete="off" maxlength="6" placeholder="请输入验证码" value="${e(session.code)}">${button(session.sentPhone?'重新获取':'获取验证码','send','entry-send')}</div>
      <fieldset><legend>选择演示身份</legend><label><input type="radio" name="actor" value="father" ${session.actor==='father'?'checked':''}> 档案本人 · 陈远山</label><label><input type="radio" name="actor" value="xia" ${session.actor==='xia'?'checked':''}> 受邀家人 · 陈知夏</label></fieldset>
      <label class="entry-consent"><input name="consent" type="checkbox" ${session.consent?'checked':''}><span>我已阅读并同意${button('用户协议','terms','entry-text')}和${button('隐私政策','privacy','entry-text')}</span></label>
      <p id="entry-error" class="entry-error" role="status" aria-live="polite">${e(session.error)}</p><button class="entry-primary" type="submit">登录，开启家人的故事</button></form>
      <div class="entry-demo"><strong>演示登录</strong><p>无需真实手机号，不发送短信。填写示例号码，点击获取验证码后完成登录。</p><p>档案本人已开通，家人身份已受邀。</p></div>`;
  }
  /** 登录前独占手机内容区，快捷导航也必须等登录完成后才能进入业务页。 */
  function render(){
    if(session.authenticated)return;
    P.MemorySpace?.unmount();P.DigitalHuman?.stop();P.PersonArchive?.stopPlayback();
    const phone=document.getElementById('phone');phone.classList.add('entry-mode');phone.classList.remove('space-mode');
    phone.classList.toggle('large-type',P.state.fontLarge);
    document.documentElement.style.setProperty('--unit',P.state.fontLarge?'2':'1');
    document.getElementById('app-content').innerHTML=`<div class="entry-page ${session.page==='login'?'login-page':''}">${session.page==='market'?market():session.page==='detail'?detail():login()}</div>`;
    document.getElementById('studio-nav').innerHTML='<p class="entry-caption">体验顺序：<br>搜索应用 → 获取并打开<br>→ 登录 → 首页</p>';
    document.getElementById('review-title').textContent=session.page==='login'?'从登录开始，走进一家人的故事':'从应用市场认识传家记';
    document.getElementById('review-description').textContent='完整体验搜索、详情预览、下载安装、验证码登录，再进入现有首页。所有账号、短信与安装均为本地演示。';
    document.getElementById('state-preview').textContent=JSON.stringify({体验步骤:session.page,已安装:session.installed,已登录:false},null,2);
  }
  /** 切换步骤重置滚动位置，输入验证失败重绘时保留当前阅读位置。 */
  function page(name){session.page=name;session.error='';render();document.getElementById('app-content').scrollTop=0;}
  /** 重绘前保留手机号和用户的主动勾选，不将示例手机号写入业务账号资料。 */
  function capture(){const form=document.getElementById('entry-login');if(form){session.phone=form.elements.phone.value.trim();session.code=form.elements.code.value.trim();session.actor=form.elements.actor.value;session.consent=form.elements.consent.checked;}}
  /** 演示下载延时可取消；重新体验不会被上一次下载的迟到回调改变状态。 */
  function install(){
    if(session.installed||session.installing)return;
    session.installing=true;render();
    installTimer=setTimeout(()=>{session.installing=false;session.installed=true;if(session.page==='detail')render();},1500);
  }
  /** 登录错误在原表单中反馈；只有正确验证码和主动同意才能进入首页。 */
  function submitLogin(){
    capture();
    if(!/^1[3-9]\d{9}$/.test(session.phone))session.error='请填写11位手机号，可使用演示号码。';
    else if(session.sentPhone!==session.phone)session.error='请先为当前手机号获取演示验证码。';
    else if(session.code!==DEMO_CODE)session.error='验证码不正确，请输入演示验证码246810。';
    else if(!session.consent)session.error='请先阅读并同意用户协议与隐私政策。';
    else {session.authenticated=true;P.state.history=[];P.changeActor(session.actor);P.navigate('home');return;}
    render();
  }
  /** 协议仅说明本地演示范围，不伪装成已发布服务的正式法律文本。 */
  function policy(privacy){P.modal(privacy?'隐私政策（演示）':'用户协议（演示）',`<p>传家记当前为产品原型，仅提供虚构人物与本地交互体验。</p><p>${privacy?'本演示不会发送手机号、验证码或家庭资料，不发送短信；输入仅在页面内存中保留，刷新清除。正式服务上线前将提供完整的个人信息处理说明。':'应用下载、账号登录及各项服务均为模拟。请勿输入真实敏感资料。正式服务的账号、授权及服务条款以上线版本为准。'}</p>`);}
  /** 单次注册事件，输入与点击均只在首次体验页面生效。 */
  document.addEventListener('click',event=>{
    const node=event.target.closest('[data-entry]');if(!node||node.disabled)return;
    const action=node.dataset.entry;capture();
    if(action==='suggest'){session.query='传家记';session.searched=true;page('market');}
    if(action==='detail'||action==='market')page(action);
    if(action==='install')install();
    if(action==='open'&&session.installed)page('login');
    if(action==='preview'){const index=Number(node.dataset.index);if(PREVIEWS[index])P.modal(PREVIEWS[index].tag,preview(PREVIEWS[index],index));}
    if(action==='fill'){session.phone=DEMO_PHONE;session.error='';render();}
    if(action==='send'){
      session.sentPhone=/^1[3-9]\d{9}$/.test(session.phone)?session.phone:'';
      // 演示获取成功即自动填入验证码，保留获取动作和当前手机号校验。
      session.code=session.sentPhone?DEMO_CODE:'';
      session.error=session.sentPhone?`演示验证码：${DEMO_CODE}（不发送短信），已自动填入。`:'请先填写手机号，或点击“填入演示手机号”。';render();
    }
    if(action==='terms'||action==='privacy')policy(action==='privacy');
  });
  document.addEventListener('submit',event=>{
    if(event.target.id==='entry-search'){event.preventDefault();session.query=event.target.elements.query.value.trim();session.searched=Boolean(session.query);render();}
    if(event.target.id==='entry-login'){event.preventDefault();submitLogin();}
  });
  /** 字号和角色预览引发重绘前，仍保留首次体验表单；刷新后重新从市场开始。 */
  document.addEventListener('input',event=>{if(event.target.closest('#entry-login'))capture();});
  document.addEventListener('change',event=>{if(event.target.closest('#entry-login'))capture();});
  P.EntryFlow={authenticated:()=>session.authenticated,render,reset(){clearTimeout(installTimer);P.closeModal();session=initialSession();if(session.authenticated)P.render();else page('market');}};
}
