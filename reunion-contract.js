/** 故人回忆回执的唯一数据契约；静态演示中的编号和自报姓名不构成身份认证。 */
'use strict';
{
  const MAX_PHOTO=2800000,MAX_REPLY=3000000;
  const id=value=>typeof value==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(value);
  /** 仅允许小体积位图，不接受外部URL、SVG或其他可执行文件。 */
  function photo(value) {return value===''||(typeof value==='string'&&value.length<=MAX_PHOTO&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value));}
  /** 朋友必须明确确认，回执只含本次补充，不包含联系方式及其他家庭内容。 */
  function valid(value) {
    const fields=['v','id','invite','owner','author','text','photo','confirmed'];
    return Boolean(value&&Object.keys(value).length===fields.length&&Object.keys(value).every(key=>fields.includes(key))&&value.v===1&&id(value.id)&&id(value.invite)&&id(value.owner)&&typeof value.author==='string'&&value.author.trim().length>0&&value.author.length<=30&&typeof value.text==='string'&&value.text.length<=1200&&photo(value.photo)&&(value.text.trim()||value.photo)&&value.confirmed===true);
  }
  /** 损坏或超限回执直接拒绝，不猜测旧结构或补填确认字段。 */
  function parse(raw) {try {if(typeof raw!=='string'||raw.length>MAX_REPLY)return null;const value=JSON.parse(raw);return valid(value)?value:null;}catch{return null;}}
  /** 随机编号避免刷新后重复计数；仅用于演示归属，不作为公开访问凭据。 */
  function nextId(prefix) {return prefix+'-'+Array.from(crypto.getRandomValues(new Uint32Array(4))).join('-');}
  window.ReunionContract={valid,parse,photo,nextId,MAX_REPLY};
}
