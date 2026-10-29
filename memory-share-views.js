/** 与故人说旧事的纸笺式流程；展示当前账号可确认的素材及独立修复示例。 */
'use strict';
{
  const P=window.App,{escape:e,link:l}=P;
  const button=(label,action,extra='')=>`<button type="button" class="btn secondary" data-memory="${action}" ${extra}>${label}</button>`;
  const top=title=>`<p class="heritage-chapter-note">留一段旧事，送给惦念的人</p><h1 class="page-title">${title}</h1>`;
  /** 首页入口不抢占影片与人生回望，没有推广奖励提醒。 */
  function entry() {return `<aside class="memory-home-entry"><h3>与故人说旧事</h3><p>挑一张照片，或一段影片。那些共同记得的日子，慢慢说。</p>${button('挑一段往事','open')}${l('收到的心意','share-gifts','text-link')}</aside>`;}
  /** 家人可了解服务，但不能替档案本人发布公开片段。 */
  function compose() {
    const rows=P.MemoryShare.candidates(),value=P.MemoryShare.draft();
    if(!rows.length)return `<div class="page memory-page">${top('与故人说旧事')}<p class="note section">请由档案本人选择并确认分享内容。你仍可阅读已获授权的家庭资料。</p>${button('以陈远山本人身份体验','owner-demo')}<p class="caption">仅切换原型演示身份。</p></div>`;
    return `<div class="page memory-page">${top('与故人说旧事')}<p>不用重新制作。选一份已有的回忆，写不写寄语都可以。</p><div id="memory-compose"><fieldset class="memory-options section"><legend>选照片或影片</legend>${rows.map(item=>`<label class="memory-option"><input type="radio" name="asset" value="${e(item.id)}" ${value.assetId===item.id?'checked':''}><img src="${e(item.poster)}" alt="${e(item.title)}"><span><strong>${e(item.title)}</strong><small>${e(item.year)} · ${item.kind==='photo'?'照片':'影片'}</small></span></label>`).join('')}</fieldset><label class="form-field" for="memory-caption">想对朋友说的话（选填）<textarea id="memory-caption" name="caption" maxlength="180" placeholder="例如：还记得那年咱们一起走过的路吗？">${e(value.caption)}</textarea></label></div>${button('先看看效果','preview')}<p class="caption section">只分享选中的这一份，其他家庭资料不会出现在链接里。链接可被转发，请在预览后确认。</p>${l('返回归家','home','text-link')}</div>`;
  }
  /** 预览前和发布前分别核验授权，角色或素材授权改变后旧草稿不能继续发布。 */
  function preview() {
    const item=P.MemoryShare.selected(),value=P.MemoryShare.draft();
    if(!item)return `<div class="page memory-page">${top('内容暂不可分享')}<p>资料或登录身份已变化，请重新选择。</p>${l('重新挑选','share-memory','btn secondary')}</div>`;
    const media=item.kind==='photo'?`<img class="memory-feature-photo" src="${e(P.MemoryShare.poster(item))}" alt="${e(item.title)}">`:`<video controls playsinline preload="metadata" poster="${e(item.poster)}" src="${e(item.src)}"></video>`;
    return `<div class="page memory-page">${top('先看看，正是想说的那段')}<article class="memory-share-card"><p>${e(P.PEOPLE[P.state.actor].name)}的一段旧事 · ${e(item.year)}</p>${media}<h2>${e(item.title)}</h2>${value.caption?`<p class="memory-handwriting">${e(value.caption)}</p>`:''}<small>灯火传家 · 原型示例素材</small></article>${value.url?`<div class="note section"><h3>已确认，可送给朋友</h3><p>朋友直接打开即可观看，无需登录。</p><label>分享链接<input readonly value="${e(value.url)}" aria-label="可复制的分享链接"></label><div class="memory-actions">${button('复制链接或选择分享','deliver')}<a class="btn secondary" href="${e(value.url)}" target="_blank" rel="noopener">打开朋友看到的页面</a></div></div>`:`<label class="check-row section"><input id="memory-confirm" type="checkbox" ${value.confirmed?'checked':''}>我已核对，愿将这一份内容通过链接分享给朋友。</label>${button('确认，生成分享链接','publish')}`}<div class="memory-actions section">${l('返回修改','share-memory','text-link')}${l('查看心意记录','share-gifts','text-link')}</div><p class="caption">静态演示：链接内容为确认时的快照，不提供服务端撤回，请只使用示例素材。</p></div>`;
  }
  /** 修复独立于分享，原片保留；只有指定样例有预制的前后效果。 */
  function restoreView() {
    const r=P.MemoryShare.state().restore,item=r?.actor===P.state.actor?P.PersonArchive.getItem(r.id):null;
    if(!item||item.subject!==P.state.actor)return `<div class="page memory-page">${top('先选一张老照片')}<p>在往事的照片详情里，可以独立打开修复体验。</p>${l('返回往事','life','btn secondary')}</div>`;
    const sample=item.id==='father-photo-youth';
    return `<div class="page memory-page">${top('老照片，再看清一点')}<p>原片始终保留，修复是可选体验，不影响日常分享。</p><div class="memory-comparison"><figure><img src="${e(item.poster)}" alt="${e(item.title)}的原片"><figcaption>原片 · 示例照片</figcaption></figure>${r.ready&&sample?'<figure><img src="assets/zhumen/life-youth-restored-demo.png" alt="预制AI修复示例，保留原构图"><figcaption>修复后 · AI预制效果</figcaption></figure>':''}</div>${!r.ready?button(sample?'查看修复示例':'了解这张照片的修复','restore-result'):sample?`<p class="note">${r.saved?'示例修复结果已保留，原片未被覆盖。':'清晰、自然，保留原来的神态。此处展示预制效果，尚未接入实时AI。'}</p>${!r.saved?button('保留这一版示例','restore-save'):button('分享修复后的照片','open',`data-id="${e(item.id)}" data-restored="1"`)}`:'<p class="note">这张照片没有预制修复结果，原片未改变。正式修复服务待接入，原型不会假装已处理。</p>'}<div class="memory-actions section">${button('直接分享原片','open',`data-id="${e(item.id)}"`)}${l('返回照片详情','archive-item/'+item.id,'text-link')}</div></div>`;
  }
  /** 不设现金、积分和排名；模拟完成拍摄后给双方各一份记忆服务。 */
  function gifts() {
    const rows=P.MemoryShare.state().gifts.filter(row=>row.actor===P.state.actor);
    return `<div class="page memory-page">${top('收到的心意')}<p>你愿意把我们介绍给朋友，这份信任，我们认真记着。</p><section class="note section"><h2>朋友完成拍摄后</h2><p>送你一次新故事补录或小相册整理，送朋友一份记忆整理体验。没有现金返佣，不设排行榜；具体服务由工作人员沟通确认。</p></section>${rows.length?rows.map(row=>`<article class="memory-share-card section"><h3>${e(row.phase)}</h3><p>来源：${e(row.ref)}</p><p>给你的心意：${row.mine?'已登记服务礼':'待朋友完成拍摄'}</p><p>给朋友的心意：${row.friend?'已登记体验礼':'待完成拍摄后确认'}</p></article>`).join(''):'<p class="memory-empty section">还没有心意记录。分享是为了相聚，不必为了奖励打扰朋友。</p>'}<details class="section"><summary>演示服务进度</summary><p class="caption">仅操作当前账号的本地演示记录，不代表真实预约、付款或服务交付。</p>${button(!rows.length?'模拟朋友主动预约':rows[0].phase==='预约沟通'?'模拟完成拍摄':'模拟登记双方服务礼','gift-demo')}</details>${l('返回归家','home','text-link section')}</div>`;
  }
  P.MemoryShareViews={entry};Object.assign(P.views,{'share-memory':compose,'share-preview':preview,'share-gifts':gifts,'photo-restore':restoreView});
}
