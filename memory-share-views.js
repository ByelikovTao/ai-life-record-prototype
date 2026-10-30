/** 与故人说旧事的纸笺式流程；展示当前账号可确认的素材及独立修复示例。 */
'use strict';
{
  const P=window.App,{escape:e,link:l}=P;
  const button=(label,action,extra='')=>`<button type="button" class="btn secondary" data-memory="${action}" ${extra}>${label}</button>`;
  const top=title=>`<p class="heritage-chapter-note">留一段旧事，送给惦念的人</p><h1 class="page-title">${title}</h1>`;
  /** 首页只保留一个共忆入口，选材、分享和朋友补充在同一条流程内。 */
  function entry() {return `<aside class="memory-home-entry"><h3>故人共忆</h3><p>挑一张照片，或一段影片。送给老朋友，也听听他们记得的那一面。</p>${button('挑一段往事','open')}${l('我的共忆相册','reunion-albums','text-link')}</aside>`;}
  /** 家人可了解服务，但不能替档案本人发布公开片段。 */
  function compose() {
    const rows=P.MemoryShare.candidates(),value=P.MemoryShare.draft();
    if(!rows.length)return `<div class="page memory-page">${top('故人共忆')}<p class="note section">请由档案本人选择并确认分享内容。你仍可阅读已获授权的家庭资料。</p>${button('以陈远山本人身份体验','owner-demo')}<p class="caption">仅切换原型演示身份。</p></div>`;
    return `<div class="page memory-page">${top('故人共忆')}<p>选一份已有的回忆，写一句想说的话。朋友可以只看看，也可以补一段自己的回忆。</p><div id="memory-compose"><fieldset class="memory-options section"><legend>选照片或影片</legend>${rows.map(item=>`<label class="memory-option"><input type="radio" name="asset" value="${e(item.id)}" ${value.assetId===item.id?'checked':''}><img src="${e(item.poster)}" alt="${e(item.title)}"><span><strong>${e(item.title)}</strong><small>${e(item.year)} · ${item.kind==='photo'?'照片':'影片'}</small></span></label>`).join('')}</fieldset><label class="form-field" for="memory-caption">想对朋友说的话（选填）<textarea id="memory-caption" name="caption" maxlength="180" placeholder="例如：还记得那年咱们一起走过的路吗？">${e(value.caption)}</textarea></label></div>${button('先看看效果','preview')}<p class="caption section">只分享选中的这一份，其他家庭资料不会出现在链接里。链接可被转发，请在预览后确认。</p>${l('返回归家','home','text-link')}</div>`;
  }
  /** 两种AI体验均可选，示例来源在进入对照前说明，不自动替换分享图片。 */
  function effectsEntry() {
    const ids=P.MemoryShare.candidates().map(item=>item.id);
    const rows=Object.entries(P.MemoryImageEffects.recipes).filter(([,item])=>ids.includes(item.sourceId));
    if(!rows.length)return '';
    return `<section class="memory-effects"><h2>让旧时光，再清晰一点</h2><p>AI影像体验 · 可选，也可以直接分享原片。</p><div class="memory-effect-options">${rows.map(([kind,item])=>`<button type="button" data-memory="effect-open" data-kind="${kind}"><strong>${e(item.label)}</strong><small>${kind==='restore'?'查看黑白求学照的修复对照':'使用当前肖像，想象年轻模样'}</small></button>`).join('')}</div><small>展示预制AI示例，不自动处理或改写历史照片。</small></section>`;
  }
  /** 预览前和发布前分别核验授权，角色或素材授权改变后旧草稿不能继续发布。 */
  function preview() {
    const item=P.MemoryShare.selected(),value=P.MemoryShare.draft();
    if(!item)return `<div class="page memory-page">${top('内容暂不可分享')}<p>资料或登录身份已变化，请重新选择。</p>${l('重新挑选','share-memory','btn secondary')}</div>`;
    const presentation=P.MemoryImageEffects.presentation(item);
    const media=item.kind==='photo'?`<img class="memory-feature-photo" src="${e(P.MemoryShare.poster(item))}" alt="${e(item.title)}">`:`<video controls playsinline preload="metadata" poster="${e(item.poster)}" src="${e(item.src)}"></video>`;
    return `<div class="page memory-page">${top('先看看，正是想说的那段')}<article class="memory-share-card"><p>${e(P.PEOPLE[P.state.actor].name)}的一段旧事 · ${e(presentation.year)}</p>${media}<h2>${e(presentation.title)}</h2>${value.caption?`<p class="memory-handwriting">${e(value.caption)}</p>`:''}<small>${e(presentation.label||'灯火传家 · 原型示例素材')}</small></article>${item.kind==='photo'?effectsEntry():''}${value.variant!=='original'?button('恢复本次原片','effect-original'):''}${value.url?`<div class="note section"><h3>已确认，送给老朋友</h3><p>朋友无需登录，可完整观看，也可自愿补充回忆，由你决定是否收录。</p><label>分享链接<input readonly value="${e(value.url)}" aria-label="可复制的分享链接"></label><div class="memory-actions">${button('复制链接或选择分享','deliver')}<a class="btn secondary" href="${e(value.url)}" target="_blank" rel="noopener">打开朋友看到的页面</a>${l('查看共忆相册','reunion-album','text-link')}</div></div>`:`<label class="check-row section"><input id="memory-confirm" type="checkbox" ${value.confirmed?'checked':''}>我已核对，愿将这一份内容分享给朋友；朋友补充的回忆先由我决定是否收录。</label>${button('确认，生成分享链接','publish')}`}<div class="memory-actions section">${l('返回修改','share-memory','text-link')}${l('查看心意记录','share-gifts','text-link')}</div><p class="caption">静态演示：链接内容为确认时的快照，不提供服务端撤回，请只使用示例素材。</p></div>`;
  }
  /** 原片和AI效果并列核对，年轻模拟与历史修复使用不同来源与标记。 */
  function restoreView() {
    const value=P.MemoryImageEffects.current();
    if(!value)return `<div class="page memory-page">${top('先选一张照片')}<p>请由照片本人在分享预览或往事照片详情中打开AI影像体验。</p>${l('返回往事','life','btn secondary')}</div>`;
    const {source,recipe,ready,supported}=value;
    return `<div class="page memory-page">${top(recipe.label)}${effectsEntry()}<p class="section">${e(recipe.note)}</p><p class="caption">来源：${e(source.title)}。选用效果会替换本次分享图片，原档案保持不变。</p><div class="memory-comparison"><figure><img src="${e(source.poster)}" alt="${e(source.title)}原片"><figcaption>原片 · 示例照片</figcaption></figure>${ready&&supported?`<figure><img src="${e(recipe.src)}" alt="${e(recipe.label)}预制AI示例"><figcaption>${value.kind==='young'?'AI年轻模拟 · 非历史照片':'AI修复上色 · 原片未覆盖'}</figcaption></figure>`:''}</div>${!ready?button('查看AI示例效果','effect-result'):supported?`<p class="note">这是预制AI效果演示，未接入实时推理。${value.kind==='young'?'年轻样貌是模拟想象，不代表本人真实青年照片。':'细节及颜色由AI推测，不能作为历史事实。'}</p>${button('选用这张效果，重新核对分享','effect-use')}`:'<p class="note">这张照片暂无预制效果，原片未改变。可从上方选择属于本人的示例体验。</p>'}<div class="memory-actions section">${button('直接使用这张原片','open',`data-id="${e(source.id)}"`)}${l('返回分享前核对','share-preview','text-link')}</div></div>`;
  }
  /** 不设现金、积分和排名；模拟完成拍摄后给双方各一份记忆服务。 */
  function gifts() {
    const rows=P.MemoryShare.state().gifts.filter(row=>row.actor===P.state.actor);
    return `<div class="page memory-page">${top('收到的心意')}<p>你愿意把我们介绍给朋友，这份信任，我们认真记着。</p><section class="note section"><h2>朋友完成拍摄后</h2><p>送你一次新故事补录或小相册整理，送朋友一份记忆整理体验。没有现金返佣，不设排行榜；具体服务由工作人员沟通确认。</p></section>${rows.length?rows.map(row=>`<article class="memory-share-card section"><h3>${e(row.phase)}</h3><p>来源：${e(row.ref)}</p><p>给你的心意：${row.mine?'已登记服务礼':'待朋友完成拍摄'}</p><p>给朋友的心意：${row.friend?'已登记体验礼':'待完成拍摄后确认'}</p></article>`).join(''):'<p class="memory-empty section">还没有心意记录。分享是为了相聚，不必为了奖励打扰朋友。</p>'}<details class="section"><summary>演示服务进度</summary><p class="caption">仅操作当前账号的本地演示记录，不代表真实预约、付款或服务交付。</p>${button(!rows.length?'模拟朋友主动预约':rows[0].phase==='预约沟通'?'模拟完成拍摄':'模拟登记双方服务礼','gift-demo')}</details>${l('返回归家','home','text-link section')}</div>`;
  }
  P.MemoryShareViews={entry};Object.assign(P.views,{'share-memory':compose,'share-preview':preview,'share-gifts':gifts,'photo-restore':restoreView});
}
