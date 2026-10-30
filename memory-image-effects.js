/** AI影像示例目录：当前只提供已生成的两组效果，真实在线推理另行接入。 */
'use strict';
{
  const P=window.App;
  const recipes={
    restore:{label:'黑白修复上色',sourceId:'father-photo-youth',src:'assets/zhumen/life-youth-restored-demo.png',note:'让旧照片更清晰，保留原来的神态。'},
    young:{label:'模拟年轻模样',sourceId:'father-photo-portrait',src:'assets/zhumen/life-young-portrait-demo.png',note:'用现在的肖像想象青年模样，不认定为真实历史照片。'}
  };
  /** 效果与来源本人、来源照片同时匹配；不把一位人物的效果套给另一位。 */
  function presentation(item) {
    const kind=P.MemoryShare.draft().variant,recipe=recipes[kind];
    if(item.kind!=='photo'||!recipe||recipe.sourceId!==item.id||item.subject!==P.state.actor)return {src:item.src||item.poster,title:item.title,year:item.year,label:''};
    return {src:recipe.src,title:kind==='young'?P.PEOPLE[item.subject].name+' · 年轻模样（AI模拟）':item.title+' · AI修复示意',year:kind==='young'?'AI青春模拟':item.year+' · AI修复',label:kind==='young'?'AI年轻模拟 · 非历史照片':'AI修复示意 · 原片未覆盖'};
  }
  /** 打开对照不会修改分享稿；只有本人明确选用后才替换本次分享图片。 */
  function open(kind='restore',id) {
    const recipe=recipes[kind];if(!recipe)return;
    const item=P.PersonArchive.getItem(id||recipe.sourceId);
    if(!item||item.kind!=='photo'||item.subject!==P.state.actor)return P.toast('请由照片归属本人打开，当前暂无属于您的效果示例。');
    P.MemoryShare.state().effect={actor:P.state.actor,id:item.id,kind,ready:false};P.navigate('photo-restore');
  }
  /** 对照和选用每次核对来源授权，换账号或撤回照片后不能沿用旧结果。 */
  function current() {
    const effect=P.MemoryShare.state().effect,source=effect?.actor===P.state.actor?P.PersonArchive.getItem(effect.id):null;
    if(!source||source.subject!==P.state.actor)return null;
    return {...effect,source,recipe:recipes[effect.kind],supported:recipes[effect.kind]?.sourceId===source.id};
  }
  function result() {const value=current();if(value){P.MemoryShare.state().effect.ready=true;P.render();}}
  /** 切换效果重置公开确认及旧链接，寄语不跨不同来源照片自动搬运。 */
  function use() {
    const value=current();if(!value?.ready||!value.supported)return P.toast('请先查看当前照片的效果示例。');
    const draft=P.MemoryShare.draft();if(draft.assetId!==value.id)draft.caption='';
    Object.assign(draft,{assetId:value.id,variant:value.kind,confirmed:false,url:''});P.navigate('share-preview');
  }
  P.MemoryImageEffects={recipes,presentation,open,current,result,use};
}
