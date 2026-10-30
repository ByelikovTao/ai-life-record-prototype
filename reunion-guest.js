/** 故人独立回忆页：先编辑、再预览、本人确认后才可同步或下载回执，不要求账号和手机号。 */
'use strict';
{
  const root=document.getElementById('reunion-content'),token=new URLSearchParams(location.search).get('s');
  const invitation=MemoryShareCodec.decode(token),draft={author:'',text:'',photo:''};
  const e=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let phase='edit',confirmed=null,fileVersion=0,reading=false;
  const channel='BroadcastChannel'in window?new BroadcastChannel('chuanjia-reunion-v1'):null;
  /** 预览照片时标明贡献者，文件只读入内存，不会在选择后自动上传。 */
  function photo() {return draft.photo?`<figure><img class="memory-feature-photo" src="${e(draft.photo)}" alt="我准备补充的照片"><figcaption>仅预览，确认后才能回传。</figcaption></figure>`:'';}
  /** 朋友可只写文字或只添照片，均先保留为本页草稿。 */
  function editor() {
    return `<form id="reunion-reply-form"><h2>我也记得，那时候的我们</h2><label for="reunion-author">老朋友怎么称呼你<input id="reunion-author" name="author" maxlength="30" value="${e(draft.author)}" autocomplete="off" required></label><label for="reunion-text">补一句你记得的事（也可只添照片）<textarea id="reunion-text" name="text" rows="5" maxlength="1200" placeholder="例如：那天拍完这张照片，我们还一起去吃了碗面。">${e(draft.text)}</textarea></label><label>添一张自己的照片（选填）<input id="reunion-photo" type="file" accept="image/png,image/jpeg,image/webp"></label><p class="memory-fine">支持PNG、JPG、WebP，最多2MB。文字或照片至少留一项，不需要手机号。</p><div id="reunion-photo-preview">${photo()}</div><button id="reunion-photo-remove" type="button" ${draft.photo?'':'hidden'}>移除这张照片</button><p id="reunion-file-status" role="status"></p><p id="reunion-form-error" role="alert"></p><button class="memory-primary" type="submit">先看看我的这段回忆</button></form>`;
  }
  /** 预览不发送，朋友可以返回修改或明确同意交给邀请人核对。 */
  function preview() {
    return `<section class="memory-share-card"><h2>先核对，再交给老朋友</h2><p>${e(draft.author)}记得的那一面</p>${photo()}${draft.text?`<p class="memory-handwriting">${e(draft.text)}</p>`:''}<label class="memory-consent"><input id="reunion-consent" type="checkbox">这是我愿意补充的内容，我确认有权提供所选照片，并同意由${e(invitation.name)}决定是否收进这份共忆相册。</label><p id="reunion-confirm-error" role="alert"></p><div class="memory-actions"><button id="reunion-submit" class="memory-primary" type="button">确认这段回忆</button><button id="reunion-back" type="button">返回修改</button></div></section>`;
  }
  /** 区分朋友确认与本人收录，不能把演示回传宣称为公开发布。 */
  function receipt() {
    return `<section class="memory-share-card" role="status"><h2>这段回忆，已经由你确认</h2><p>尚未公开收录，接下来由${e(invitation.name)}选择是否收进相册。</p><p>同浏览器中打开的档案主页可同步收到演示回执。跨设备请下载回执，发给老朋友导入；原型尚未接入真实后台。</p><button id="reunion-download" class="memory-primary" type="button">下载我确认的回忆回执</button><p class="memory-fine">只包含你的署名、补充文字及所选照片，不包含联系方式。刷新本页会清空未保存的演示内容。</p></section>`;
  }
  /** 邀请之外的家庭档案不加载；损坏或普通分享链接不当作共忆邀请使用。 */
  function render() {
    if(!invitation||!invitation.ref.startsWith('reunion-')){root.innerHTML='<h1>这份共忆邀请暂时无法打开</h1><p>请向老朋友索取完整的共忆邀请链接。</p>';return;}
    const media=invitation.kind==='photo'?`<img class="memory-feature-photo" src="${e(invitation.src)}" alt="${e(invitation.title)}，示例素材">`:`<video controls playsinline preload="metadata" poster="${e(invitation.poster)}" src="${e(invitation.src)}"></video>`;
    const consult=new URL('memory.html',location.href);consult.searchParams.set('s',token);consult.searchParams.set('consult','1');
    root.innerHTML=`<header><p class="memory-eyebrow">灯火传家 · 故人共忆</p><h1>那时候的我们，<br>你还记得吗？</h1><p>${e(invitation.name)}与你分享一段旧事</p><p class="memory-fine">只看看也很好；愿意的话，可以在下方补一段你的回忆。</p></header><article class="memory-share-card">${media}<h2>${e(invitation.title)}</h2><p class="memory-handwriting">${e(invitation.caption)}</p><p class="memory-fine">只开放这份示例回忆，不开放其他家庭档案。</p></article>${phase==='edit'?editor():phase==='preview'?preview():receipt()}<aside class="memory-guest-invitation"><h2>也想给自己的故事留个位置？</h2><p>不必急着决定。先了解怎样记录自己走过的日子。</p><a class="memory-primary" href="${e(consult.href)}">了解人生故事拍摄</a><p class="memory-fine">可选了解，不影响补充回忆，不要求转发或留资。</p></aside><footer>故人各记一面，往事便多一份温度。</footer>`;
    if(phase==='edit')bindEditor();
    if(phase==='preview'){
      document.getElementById('reunion-back').onclick=()=>{phase='edit';render();};
      document.getElementById('reunion-submit').onclick=submit;
    }
    if(phase==='done')document.getElementById('reunion-download').onclick=download;
  }
  /** 草稿由输入实时更新；先预览才确认，空内容和空署名都不会变成回执。 */
  function bindEditor() {
    const form=document.getElementById('reunion-reply-form');
    form.oninput=()=>{draft.author=form.elements.author.value.slice(0,30);draft.text=form.elements.text.value.slice(0,1200);};
    form.onsubmit=event=>{
      event.preventDefault();if(!form.reportValidity())return;
      if(reading){document.getElementById('reunion-form-error').textContent='照片仍在读取，请稍候再预览。';return;}
      if(!draft.author.trim()||(!draft.text.trim()&&!draft.photo)){document.getElementById('reunion-form-error').textContent='请留下称呼，并写一句回忆或添加一张照片。';return;}
      phase='preview';render();
    };
    document.getElementById('reunion-photo').onchange=readPhoto;
    document.getElementById('reunion-photo-remove').onclick=()=>{fileVersion++;reading=false;draft.photo='';document.getElementById('reunion-photo').value='';document.getElementById('reunion-photo-preview').innerHTML='';document.getElementById('reunion-photo-remove').hidden=true;document.getElementById('reunion-file-status').textContent='照片已移除。';};
  }
  /** 类型、体积与解码均通过才保留照片，取消或重新选择时丢弃迟到的读取结果。 */
  function readPhoto(event) {
    const file=event.target.files[0],version=++fileVersion,status=document.getElementById('reunion-file-status');
    reading=false;if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2*1024*1024){event.target.value='';status.textContent='请选择2MB以内的PNG、JPG或WebP照片。';return;}
    const reader=new FileReader();reading=true;status.textContent='正在读取照片预览…';
    reader.onload=()=>{
      if(version!==fileVersion||phase!=='edit')return;
      if(!ReunionContract.photo(reader.result)){reading=false;status.textContent='照片格式无法识别，请重新选择。';return;}
      const image=new Image();image.onload=()=>{if(version!==fileVersion||phase!=='edit')return;reading=false;draft.photo=reader.result;document.getElementById('reunion-photo-preview').innerHTML=photo();document.getElementById('reunion-photo-remove').hidden=false;status.textContent='照片已准备好，尚未回传。';};image.onerror=()=>{if(version===fileVersion){reading=false;status.textContent='照片无法解码，请重新选择。';}};image.src=reader.result;
    };
    reader.onerror=()=>{if(version===fileVersion){reading=false;status.textContent='读取失败，请重新选择。';}};reader.readAsDataURL(file);
  }
  /** 只有朋友明确确认后发出一次同浏览器通知；收录仍由档案本人单独决定。 */
  function submit() {
    if(confirmed)return;
    if(!document.getElementById('reunion-consent').checked){document.getElementById('reunion-confirm-error').textContent='请先确认愿意提供这段回忆，再交给老朋友。';return;}
    const value={v:1,id:ReunionContract.nextId('reply'),invite:invitation.ref,owner:invitation.owner,author:draft.author.trim(),text:draft.text.trim(),photo:draft.photo,confirmed:true};
    if(!ReunionContract.valid(value))return;
    confirmed=value;channel?.postMessage({type:'reunion-reply',reply:value});phase='done';render();
  }
  /** 跨设备回执由朋友自己下载和发送，不上传至第三方，也不在链接中放照片数据。 */
  function download() {
    if(!confirmed)return;
    const url=URL.createObjectURL(new Blob([JSON.stringify(confirmed,null,2)],{type:'application/json'})),link=document.createElement('a');
    link.href=url;link.download='故人共忆-确认回执.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  render();
}
