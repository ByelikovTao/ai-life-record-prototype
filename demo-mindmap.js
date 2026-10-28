/** 演示工具仅打开独立导图，不触发业务导航、重绘或账号切换。 */
'use strict';
{
  const dialog=document.getElementById('demo-mindmap');
  const canvas=document.getElementById('demo-mindmap-canvas');
  const zoom=document.getElementById('zoom-demo-mindmap');
  /** 每次打开均适应窗口并回到图顶，原型页面继续保留原有状态。 */
  document.getElementById('open-demo-mindmap').addEventListener('click',()=>{
    canvas.classList.remove('is-zoomed');zoom.setAttribute('aria-pressed','false');zoom.textContent='放大查看';
    dialog.showModal();canvas.scrollTop=0;canvas.scrollLeft=0;
  });
  /** 原生关闭恢复触发按钮的焦点，Esc同样沿用dialog默认关闭行为。 */
  document.getElementById('close-demo-mindmap').addEventListener('click',()=>dialog.close());
  /** 放大后允许横向浏览原尺寸导图，窄屏也能阅读具体功能。 */
  zoom.addEventListener('click',()=>{
    const enlarged=canvas.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed',String(enlarged));zoom.textContent=enlarged?'适应窗口':'放大查看';
  });
}
