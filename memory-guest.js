/** 独立访客页不加载APP、家庭资料或登录流程；联系方式只保留本页演示内存。 */
'use strict';
{
  const root=document.getElementById('guest-content');
  const e=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const raw=new URLSearchParams(location.search).get('s');
  const example={v:1,ref:'demo-memory',owner:'father',name:'陈远山',kind:'photo',title:'那年，我也有过发亮的梦想',caption:'还记得我们一起读书的日子吗？这张照片，送给也记得那段时光的你。',poster:'assets/zhumen/life-youth-demo.png',src:'assets/zhumen/life-youth-demo.png',year:'1979'};
  const item=raw===null?example:MemoryShareCodec.decode(raw);
  let booking=null;
  /** 无效链接不回退到其他人物资料，避免让访客误认内容。 */
  function render() {
    if(!item){root.innerHTML='<h1>这份回忆暂时无法打开</h1><p>链接可能不完整，请向分享给你的朋友重新索取。</p><p class="memory-fine">不会显示其他人的档案。</p>';return;}
    const media=item.kind==='photo'?`<img class="memory-feature-photo" src="${e(item.src)}" alt="${e(item.title)}，原型示例照片">`:`<video controls playsinline preload="metadata" poster="${e(item.poster)}" src="${e(item.src)}" aria-label="${e(item.title)}"></video>`;
    root.innerHTML=`<header><p class="memory-eyebrow">灯火传家 · 故人来信</p><h1>有些旧事，想与你说</h1><p>${e(item.name)}与你分享 · ${e(item.year)}</p></header><article class="memory-share-card">${media}<h2>${e(item.title)}</h2>${item.caption?`<p class="memory-handwriting">${e(item.caption)}</p>`:''}<p class="memory-fine">仅此一份分享 · 虚构人物及示例素材</p></article><section class="memory-guest-invitation"><h2>你也有一段想留下的故事吗？</h2><p>一张旧照片，一段亲口讲述。慢慢说，我们认真听。</p><button id="guest-open" class="memory-primary" type="button">请你们帮我留一段故事</button><p class="memory-fine">无需下载APP，不咨询也可以完整观看。</p></section><section id="guest-service" hidden><h2>先了解，再决定</h2><video controls playsinline preload="none" poster="assets/avatar/reference-person.png" src="assets/archive-demo/life-film.mp4" aria-label="人生影片演示样片"></video><p>先聊想记录的人和故事，再约访谈与线下拍摄；样片为演示，不代表正式客户成片。具体拍摄内容、时间与费用由团队沟通确认。</p><form id="guest-booking"><h2>方便时，和我们聊聊</h2><label for="guest-name">怎么称呼您<input id="guest-name" name="name" maxlength="30" autocomplete="off" required></label><label for="guest-phone">联系方式<input id="guest-phone" name="phone" type="tel" inputmode="tel" pattern="[+]?[0-9]{7,15}" maxlength="20" autocomplete="off" required placeholder="演示请填虚构号码"></label><label for="guest-time">方便联系的时间<select id="guest-time" name="time"><option>上午 9:00—12:00</option><option>下午 14:00—18:00</option><option>傍晚 18:00—20:00</option></select></label><label class="memory-consent"><input type="checkbox" name="consent" required>我愿意就本次拍摄咨询接受联系。</label><p class="memory-fine">演示预约，不会实际发送。表单仅保留在本页内存，刷新即清除；联系方式不写入分享链接。</p><button class="memory-primary" type="submit">提交演示预约</button></form><div id="guest-receipt" role="status"></div></section><footer>灯火传家 · 把平常的日子，留成故事。</footer>`;
    document.getElementById('guest-open').addEventListener('click',()=>{document.getElementById('guest-service').hidden=false;document.getElementById('guest-service').scrollIntoView({block:'start'});});
    document.getElementById('guest-booking').addEventListener('submit',submit);
    // 故人共忆的服务了解入口由访客主动点击，沿用同一预约表单。
    if(new URLSearchParams(location.search).get('consult')==='1'){document.getElementById('guest-service').hidden=false;document.getElementById('guest-service').scrollIntoView({block:'start'});}
  }
  /** 仅在访客主动提交且同意联系后生成演示回执；来源沿用本次分享编号，不暴露给其他访客。 */
  function submit(event) {
    event.preventDefault();if(booking)return;
    const form=event.currentTarget;if(!form.reportValidity())return;
    const data=new FormData(form),name=String(data.get('name')).trim(),phone=String(data.get('phone')).trim();
    if(!/^[+]?[0-9]{7,15}$/.test(phone)){form.elements.phone.setCustomValidity('请填写7至15位数字，可带国际区号加号');form.reportValidity();form.elements.phone.setCustomValidity('');return;}
    if(!name){form.elements.name.setCustomValidity('请填写称呼');form.reportValidity();form.elements.name.setCustomValidity('');return;}
    booking={name,phone,time:String(data.get('time')),ref:item.ref,owner:item.owner};
    form.hidden=true;document.getElementById('guest-receipt').innerHTML=`<h2>演示预约已登记</h2><p>${e(name)}，你选择的联系时间为${e(booking.time)}。</p><p>正式服务将由工作人员沟通。本演示不会实际联系你，也没有发送手机号。</p><p class="memory-fine">介绍来源已随本次分享记录，无需朋友再次证明。来源编号：${e(item.ref)}</p>`;
  }
  render();
}
