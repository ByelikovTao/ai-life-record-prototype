/** 家庭传承首页的唯一内容状态：家庭共用家训，人物独立维护源流、建谱致谢与精选引用。 */
'use strict';
{
  const P=window.App;
  /** 姓氏文化是带出处的公共背景，不构成本家庭的血缘或迁徙证明。 */
  const SURNAME_CULTURE={陈:{summary:'陈姓的一支源流与陈胡公有关。姓氏记下来处，家人续写自己的故事。',text:'陈姓的重要来源之一与陈胡公有关，后人以陈为姓。姓氏也有不同来源与支系；这里介绍姓氏文化，不据此认定本家庭的具体祖先。',source:'河南省政协《“陈”姓的始源在这里》',url:'https://hnzx.gov.cn/2023/04-19/4319231.html'}};
  /** 所有示例均为虚构；正式内容和未发布草稿分别保存，刷新由原型统一重置。 */
  function seed() {
    return {
      family:{name:'陈家',mottoOwner:'father',motto:{text:'诚实做人，认真做事。\n家人有难，彼此照应。',source:'从我这一代立下，留给家人一起践行。',kind:'new',date:'2026-10-29',confirmedBy:'father',revision:1},suggestions:[]},
      profiles:{
        father:{surname:'陈',origin:{text:'父亲陈明德，1938年出生，是我认识这个家的起点。祖籍、支系和更早的迁徙，还想和家人一起翻翻旧资料，慢慢补齐。',source:'陈远山口述 · 虚构家庭示例',confirmedBy:'father',revision:1},preface:{text:'感谢父亲陈明德和家人的信任与支持，让我执笔留住家的故事。\n记下家族来处，珍藏家人往事，让后辈知根念亲，代代相传。',confirmedBy:'father',date:'2026-10-29',revision:1},featured:['school-days','wedding-day','first-order','spring']},
        mother:{surname:'林',origin:null,preface:null,featured:[]}
      },drafts:{},review:null
    };
  }
  /** 重置时按需重建，不借用前一次演示或另一个人物的内容。 */
  function ensure() {return P.state.familyHome ||= seed();}
  /** 空人物档案只建立结构，尚未确认的家族经历和建谱致谢保持空白。 */
  function profile(person) {return ensure().profiles[person] ||= {surname:'',origin:null,preface:null,featured:[]};}
  /** 家庭共享内容只面向家庭成员；个人段落另行检查该人物档案的访问授权。 */
  function member() {return P.state.members.includes(P.state.actor);}
  /** 本人维护自己的序言与精选；家训统一由家庭指定的档案本人确认。 */
  function editable(kind,person) {return member()&&(kind==='motto'?P.state.actor===ensure().family.mottoOwner:P.state.actor===person);}
  /** 亲属关系不代替人物档案授权；私有草稿永不通过阅读接口返回。 */
  function readable(person) {return member()&&P.FamilyContext.allowed(person,'archive');}
  /** 发布内容按确认者校验；切换人物时家训始终来自同一家庭对象。 */
  function document(kind,person) {
    if(kind==='motto'){const family=ensure().family;return member()&&family.motto?.confirmedBy===family.mottoOwner?family.motto:null;}
    const item=profile(person)[kind];return readable(person)&&item?.confirmedBy===person?item:null;
  }
  /** 只选本档案已确认、仍获授权的经历；首页保存引用，不复制故事正文或资料。 */
  function candidates(person) {
    if(!readable(person))return [];
    return P.PersonArchive.events(person).filter(item=>!item.pending&&(item.commonWith===person?item.inclusions?.[person]?.reviewed:item.confirmedBy===person)).sort((left,right)=>String(left.year).localeCompare(String(right.year),'zh-CN',{numeric:true})||left.id.localeCompare(right.id));
  }
  /** 精选按经历年份正序排列，资料更新时间不参与排序，撤回后立即停止展示。 */
  function featured(person) {const ids=profile(person).featured;return candidates(person).filter(item=>ids.includes(item.id));}
  /** 图片仅来自当前事件关联且获授权的照片，不拿装饰图冒充史料佐证。 */
  function photo(story,person) {return P.PersonArchive.assets(person,'photo').find(item=>item.relatedStoryId===story.id)||null;}
  /** 首页亲缘摘要复用已确认称呼，未知父母与孙辈父母不生成连线。 */
  function relatives(person) {
    const groups={parents:[],couple:[],children:[],others:[]};
    for(const id of P.state.members.filter(id=>P.PEOPLE[id])){
      const relation=P.relation(id,person);
      if(['父亲','母亲','爸爸','妈妈'].includes(relation))groups.parents.push(id);
      else if(id===person||['妻子','丈夫'].includes(relation))groups.couple.push(id);
      else if(['儿子','女儿'].includes(relation))groups.children.push(id);
      else groups.others.push(id);
    }
    return groups;
  }
  /** 仅原型工具使用：清空新首页资料，保留既有故事、授权和记录草稿。 */
  function empty() {
    const home=ensure();home.family.motto=null;home.family.suggestions=[];home.drafts={};home.review=null;
    Object.values(home.profiles).forEach(value=>{value.origin=null;value.preface=null;value.featured=[];});
  }
  P.FamilyHome={ensure,profile,member,editable,readable,document,candidates,featured,photo,relatives,empty,culture:SURNAME_CULTURE};
}
