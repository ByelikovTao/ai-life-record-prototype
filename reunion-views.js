/** 故人共忆采用同一套纸笺样式；待核对和已收录内容分开，讲述者始终可见。 */
'use strict';
{
  const P=window.App,{escape:e,link:l}=P;
  const button=(label,action,extra='')=>`<button type="button" class="btn secondary" data-reunion="${action}" ${extra}>${label}</button>`;
  const heading=title=>`<p class="heritage-chapter-note">故人相逢 · 各记一面</p><h1 class="page-title">${title}</h1>`;
  /** 条目保留朋友署名；上传照片与文字不替代本人原始记录。 */
  function replyCard(row,review=false) {
    return `<article class="memory-share-card reunion-reply" data-reply-id="${e(row.id)}"><p class="memory-eyebrow">${e(row.author)}记得的那一面</p>${row.photo?`<img class="memory-feature-photo" src="${e(row.photo)}" alt="${e(row.author)}自愿补充的照片">`:''}${row.text?`<p class="memory-handwriting">${e(row.text)}</p>`:''}<p class="caption">朋友已确认这份补充${review?' · 等待你决定是否收录':' · 已由档案本人收录'}</p>${review?`<div class="memory-actions">${button('收进共忆相册','review',`data-id="${e(row.id)}" data-decision="accepted"`)}${button('暂不收录','review',`data-id="${e(row.id)}" data-decision="declined"`)}</div>`:''}</article>`;
  }
  /** 同一邀请的待核对与已收录内容分区展示，不展示被拒绝条目。 */
  function album() {
    const value=P.Reunion.current();if(!value)return `<div class="page memory-page">${heading('这本共忆相册暂不可查看')}<p>请回到发出邀请的账号。演示数据只保存在当前页面，刷新会清空。</p>${l('我的共忆相册','reunion-albums','btn secondary')}</div>`;
    const rows=P.Reunion.state().replies.filter(row=>row.invite===value.ref&&row.owner===P.state.actor),pending=rows.filter(row=>row.status==='pending'),accepted=rows.filter(row=>row.status==='accepted');
    const media=value.kind==='photo'?`<img class="memory-feature-photo" src="${e(value.src)}" alt="${e(value.title)}">`:`<video controls playsinline preload="metadata" poster="${e(value.poster)}" src="${e(value.src)}"></video>`;
    return `<div class="page memory-page">${heading('故人共忆')}<article class="memory-share-card">${media}<h2>${e(value.title)}</h2><p>${e(value.caption)}</p></article><section class="note section"><h2>邀请老朋友</h2><p>朋友无需登录，可写一句回忆或添一张照片。朋友先确认，你再决定收录。</p><label>共忆邀请链接<input readonly value="${e(value.url)}" aria-label="共忆邀请链接"></label><div class="memory-actions">${button('复制链接或选择分享','share')}<a class="btn secondary" href="${e(value.url)}" target="_blank" rel="noopener">体验朋友看到的页面</a></div></section><section class="section" data-reunion-pending><h2>故人来信 · 待核对 ${pending.length}</h2>${pending.length?pending.map(row=>replyCard(row,true)).join(''):'<p class="memory-empty">还没有待核对的回忆。慢慢等，故人总有自己的节奏。</p>'}</section><section class="section" data-reunion-accepted><h2>已经收进相册 ${accepted.length}</h2>${accepted.length?accepted.map(row=>replyCard(row)).join(''):'<p class="caption">收到补充后，选择收录的内容会出现在这里。</p>'}</section><details class="section"><summary>导入朋友确认的回忆回执</summary><p class="caption">同浏览器标签页可同步演示。跨设备请让朋友下载回执，再由你导入。尚未接入真实后台，刷新会清空演示数据。</p><label class="form-field">选择JSON回执文件<input id="reunion-import" type="file" accept="application/json,.json"></label></details><div class="memory-actions">${l('我的共忆相册','reunion-albums','text-link')}${l('再分享一段往事','share-memory','text-link')}</div></div>`;
  }
  /** 列表只包含本账号发出的邀请，不把家庭关系当作查看权限。 */
  function albums() {
    const rows=P.Reunion.state().invitations.filter(row=>row.owner===P.state.actor);
    return `<div class="page memory-page">${heading('我的共忆相册')}<p>同一段往事，珍藏不同人的记忆。</p>${rows.length?rows.map(row=>`<article class="memory-share-card"><h2>${e(row.title)}</h2><p>${e(row.caption)}</p>${button('翻开这本共忆','open',`data-id="${e(row.ref)}"`)}</article>`).join(''):'<p class="memory-empty section">还没有发出的共忆邀请，先选一张老朋友也记得的照片吧。</p>'}<button type="button" class="btn secondary" data-memory="open">挑一段往事</button>${l('返回归家','home','text-link section')}</div>`;
  }
  Object.assign(P.views,{'reunion-album':album,'reunion-albums':albums});
}
