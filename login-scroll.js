/** 登录后一次性的家训卷轴；读取已确认家训，离开、换账号与重置均释放计时。 */
'use strict';
{
  const P=window.App;
  const UNROLL_MS=1500,READ_MS=3000;
  let active=null;
  /** 关闭仅移除本次开屏，不改变首页路由，不把旧计时带入下一次登录。 */
  function close(focus=true) {
    if(!active)return;
    clearTimeout(active.timer);
    active.blocked.forEach(([element,inert])=>{element.inert=inert;});
    active.element.remove();active=null;
    if(focus)document.querySelector('#bottom-nav button')?.focus({preventScroll:true});
  }
  /** 家训来自家庭确认稿；未建立时使用品牌欢迎语，不补写或借用其他家庭内容。 */
  function show() {
    close(false);
    if(!P.EntryFlow.authenticated())return;
    const doc=P.FamilyHome.document('motto',P.FamilyContext.current());
    const surname=doc?P.FamilyHome.profile(P.FamilyHome.ensure().family.mottoOwner).surname:'';
    const title=doc?(surname?`${surname}氏家训`:'家庭家训'):'灯火传家';
    const lines=doc?doc.text.split('\n').filter(line=>line.trim()):['把一家人的故事，好好留下来。'];
    const element=document.createElement('section');
    element.className='login-scroll';element.setAttribute('role','dialog');
    element.setAttribute('aria-modal','true');element.setAttribute('aria-labelledby','login-scroll-title');
    element.innerHTML=`<div class="login-scroll-top"><span>传家记</span><button type="button" class="login-scroll-skip">跳过</button></div><div class="login-scroll-main"><p class="login-scroll-eyebrow">一卷家书 · 一脉相承</p><div class="login-scroll-wrap"><div class="login-scroll-paper"><div class="login-scroll-words"><h1 id="login-scroll-title">${P.escape(title)}</h1><div class="login-scroll-poem">${lines.map(line=>`<p>${P.escape(line)}</p>`).join('')}</div><span class="login-scroll-seal" aria-hidden="true">传<br>家</span></div></div><span class="login-scroll-rod is-top" aria-hidden="true"></span><span class="login-scroll-rod is-bottom" aria-hidden="true"></span></div><p class="login-scroll-footer">${doc?'家训在心，家风有传。':'欢迎归家。'}</p></div>`;
    const phone=document.getElementById('phone');
    const blocked=[...phone.children].map(child=>[child,child.inert]);
    blocked.forEach(([child])=>{child.inert=true;});phone.append(element);
    const skip=element.querySelector('button');
    skip.addEventListener('click',()=>close());
    element.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();close();}
      if(event.key==='Tab'){event.preventDefault();skip.focus();}
    });
    element.style.setProperty('--scroll-drop',`${element.querySelector('.login-scroll-paper').offsetHeight}px`);
    const instance={element,blocked,timer:null};active=instance;
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    instance.timer=setTimeout(()=>{if(active===instance)close();},(reduced?0:UNROLL_MS)+READ_MS);
    skip.focus({preventScroll:true});
  }
  P.LoginScroll={show,close};
}
