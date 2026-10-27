/** 按当前成员生成关系图；隔代关系单独标识，不补造尚未记录的父母。 */
'use strict';
{
  const P=window.App,{button:b,avatar:a,escape:e}=P;
  /** 节点只表达已确认成员身份，点击后沿用人物详情。 */
  function node(id) {
    return b(`${a(id)}<strong>${e(P.PEOPLE[id].name)}</strong><small>${e(P.relation(id,'father'))}</small>`,'person','tree-person',`data-id="${e(id)}" data-tree-member="${e(id)}"`);
  }
  /** 以陈远山为关系参照分组，孙辈与旁系不会误挂在某位已知子女之下。 */
  function groups() {
    const result={ancestors:[],partner:[],children:[],grandchildren:[],others:[]};
    for(const id of P.state.members){
      if(id==='father' || !P.PEOPLE[id])continue;
      const relation=P.relation(id,'father');
      if(['父亲','母亲'].includes(relation))result.ancestors.push(id);
      else if(['妻子','丈夫'].includes(relation))result.partner.push(id);
      else if(['儿子','女儿'].includes(relation))result.children.push(id);
      else if(['孙子','孙女'].includes(relation))result.grandchildren.push(id);
      else result.others.push(id);
    }
    return result;
  }
  /** 每组分别解释关系证据，避免图形连线暗示未经记录的直接血缘。 */
  function branch(ids,title,note,kind='') {
    if(!ids.length)return '';
    return `<section class="lineage-branch ${kind}"><h3>${title}</h3><div class="lineage-members">${ids.map(node).join('')}</div><p>${note}</p></section>`;
  }
  /** 动态关系图与列表读取相同成员集合，缩放和回中动作沿用原型既有契约。 */
  function view() {
    const s=P.state,g=groups();
    const ancestors=branch(g.ancestors,'上一代','已记录与陈远山的父母关系；其他上一代资料可继续补充。');
    const children=branch(g.children,'子女','已确认是陈远山的子女；不据此推定其他尚未填写的关系。');
    const grandchildren=branch(g.grandchildren,'孙辈 · 父母资料待补充','已确认与陈远山的隔代关系，尚未记录其父母；不会默认挂在陈知夏名下。','lineage-indirect');
    const others=branch(g.others,'其他已确认亲属','下方称呼以陈远山为参照；父母或支系不明时先独立保留。','lineage-indirect');
    return `<div class="family-tree"><div class="family-tree-canvas" style="zoom:${s.treeZoom || 1}"><p class="lineage-caption">以陈远山为参照 · ${s.members.length} 位成员</p>${ancestors}<section class="lineage-focus"><h3>本人及配偶</h3><div class="lineage-members">${s.members.includes('father')?node('father'):''}${g.partner.length?'<span class="couple-line" aria-label="已确认配偶关系"></span>':''}${g.partner.map(node).join('')}</div></section>${children}${grandchildren}${others}</div></div><div class="tree-controls">${b('−','tree-zoom','icon-button soft','data-value="-1" aria-label="缩小关系树"')}${b('回到中心','tree-center','text-link')}${b('+','tree-zoom','icon-button soft','data-value="1" aria-label="放大关系树"')}</div>`;
  }
  P.FamilyTree={view};
}
