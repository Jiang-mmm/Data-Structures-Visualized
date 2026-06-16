import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{l as t,s as n}from"./vendor-react-X1CbZFwG.js";import{n as r,o as i,r as a,t as o,u as s}from"./index-BzVIc0ZK.js";var c=e(t(),1),l=n(),u=.5,d=2,f=.1,p=`ds-visualizer-show-grid`,m=`ds-visualizer-zoom`;function h(e,t){try{let n=localStorage.getItem(e);return n===null?t:n===`true`}catch{return t}}function g(e,t){try{let n=localStorage.getItem(e);return n===null?t:Number(n)}catch{return t}}function _({data:e,renderFn:t,svgRef:n,dimensions:i,containerRef:_,className:v=``,ariaLabel:y,renderOptions:b}){let{resolved:x}=r(),{theme:S}=o(),{t:C}=a(),w=x===`dark`,[T,E]=(0,c.useState)(()=>g(m,1)),[D,O]=(0,c.useState)(()=>h(p,!0)),[k,A]=(0,c.useState)({x:0,y:0}),j=(0,c.useRef)({initialDistance:0,initialZoom:1}),M=(0,c.useRef)({dragging:!1,startX:0,startY:0,startPanX:0,startPanY:0}),N=(0,c.useCallback)(()=>{E(e=>{let t=Math.min(d,+(e+f).toFixed(1));try{localStorage.setItem(m,String(t))}catch{}return t})},[]),P=(0,c.useCallback)(()=>{E(e=>{let t=Math.max(u,+(e-f).toFixed(1));try{localStorage.setItem(m,String(t))}catch{}return t})},[]),F=e=>{let t=e[0].clientX-e[1].clientX,n=e[0].clientY-e[1].clientY;return Math.sqrt(t*t+n*n)},I=(0,c.useCallback)(e=>{e.touches.length===2&&(e.preventDefault(),j.current.initialDistance=F(e.touches),j.current.initialZoom=T)},[T]),L=(0,c.useCallback)(e=>{if(e.touches.length===2){e.preventDefault();let t=F(e.touches)/j.current.initialDistance,n=Math.min(d,Math.max(u,+(j.current.initialZoom*t).toFixed(1)));E(n);try{localStorage.setItem(m,String(n))}catch{}}},[]),R=(0,c.useCallback)(e=>{(e.ctrlKey||e.metaKey)&&(e.preventDefault(),E(t=>{let n=e.deltaY>0?-.1:f,r=Math.min(d,Math.max(u,+(t+n).toFixed(1)));try{localStorage.setItem(m,String(r))}catch{}return r}))},[]),z=(0,c.useCallback)(e=>{e.button===0&&(M.current={dragging:!0,startX:e.clientX,startY:e.clientY,startPanX:k.x,startPanY:k.y},e.currentTarget.classList.add(`cursor-grabbing`))},[k]),B=(0,c.useCallback)(e=>{if(!M.current.dragging)return;let t=e.clientX-M.current.startX,n=e.clientY-M.current.startY;A({x:M.current.startPanX+t,y:M.current.startPanY+n})},[]),V=(0,c.useCallback)(e=>{M.current.dragging=!1,e.currentTarget.classList.remove(`cursor-grabbing`)},[]),H=(0,c.useCallback)(()=>{A({x:0,y:0})},[]);(0,c.useEffect)(()=>{let e=_?.current;if(e)return e.addEventListener(`wheel`,R,{passive:!1}),e.addEventListener(`touchstart`,I,{passive:!1}),e.addEventListener(`touchmove`,L,{passive:!1}),()=>{e.removeEventListener(`wheel`,R),e.removeEventListener(`touchstart`,I),e.removeEventListener(`touchmove`,L)}},[_,R,I,L]),(0,c.useEffect)(()=>{if(n?.current&&t&&e)try{let r=e,a=Array.isArray(e)?e.length:r?.nodes?.length||r?.length||1;s(`${t.name||`Visualizer`}:render (${a} items, ${i.width}x${i.height})`,()=>{t(n.current,e,{...i,isDark:w,...b})})}catch{}},[e,t,n,i,w,S,b]);let U=(0,c.useMemo)(()=>{let e=Math.round(i.width/T),t=Math.round(i.height/T);return`${Math.round((i.width-e)/2)-k.x/T} ${Math.round((i.height-t)/2)-k.y/T} ${e} ${t}`},[i.width,i.height,T,k.x,k.y]);return(0,l.jsxs)(`div`,{ref:_,onMouseDown:z,onMouseMove:B,onMouseUp:V,onMouseLeave:V,className:`
        flex-1 relative min-h-[200px] sm:min-h-[300px] lg:min-h-[400px] overflow-hidden bg-clip-padding
        border-b-2 border-ink dark:border-dark-border cursor-grab select-none
        ${v}
        ${D?`dot-grid dark:dot-grid`:``}
      `,children:[(0,l.jsx)(`svg`,{ref:n,viewBox:U,className:`w-full h-full`,preserveAspectRatio:`xMidYMid meet`,role:`img`,"aria-label":y||C(`visualizer.empty`)}),(0,l.jsxs)(`div`,{className:`absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 dark:bg-slate/90 backdrop-blur-sm border-2 border-ink/20 dark:border-dark-border/40 px-2 py-1 shadow-soft z-10 rounded-sm`,onMouseDown:e=>e.stopPropagation(),onMouseMove:e=>e.stopPropagation(),onMouseUp:e=>e.stopPropagation(),children:[(0,l.jsx)(`button`,{onClick:()=>O(e=>{let t=!e;try{localStorage.setItem(p,String(t))}catch{}return t}),className:`w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center transition-colors text-xs font-bold border-2
            ${D?`bg-accent-blue/15 border-accent-blue/50 text-accent-blue`:`bg-ink/5 dark:bg-dark-ink/5 border-ink/15 dark:border-dark-border/30 text-ink-light/50 dark:text-dark-ink-light/50 hover:border-ink/30 dark:hover:border-dark-border/50`}`,title:C(D?`visualizer.hideGrid`:`visualizer.showGrid`),"aria-label":C(D?`visualizer.hideGrid`:`visualizer.showGrid`),children:`#`}),(k.x!==0||k.y!==0)&&(0,l.jsx)(`button`,{onClick:H,"aria-label":C(`visualizer.center`)||`Center`,className:`w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center transition-colors text-xs font-bold border-2 bg-ink/5 dark:bg-dark-ink/5 border-ink/15 dark:border-dark-border/30 text-ink-light/50 dark:text-dark-ink-light/50 hover:border-ink/30 dark:hover:border-dark-border/50`,children:`⌖`}),(0,l.jsx)(`button`,{onClick:P,disabled:T<=u,"aria-label":C(`visualizer.zoomOut`)||`Zoom out`,className:`w-9 h-9 sm:w-6 sm:h-6 flex items-center justify-center text-ink-light dark:text-dark-ink-light hover:bg-ink/10 dark:hover:bg-dark-ink/10 disabled:opacity-30 transition-colors text-sm font-bold touch-manipulation`,children:`−`}),(0,l.jsxs)(`span`,{className:`font-mono text-xs text-ink-light dark:text-dark-ink-light min-w-[40px] text-center select-none`,"aria-live":`polite`,children:[Math.round(T*100),`%`]}),(0,l.jsx)(`button`,{onClick:N,disabled:T>=d,"aria-label":C(`visualizer.zoomIn`)||`Zoom in`,className:`w-9 h-9 sm:w-6 sm:h-6 flex items-center justify-center text-ink-light dark:text-dark-ink-light hover:bg-ink/10 dark:hover:bg-dark-ink/10 disabled:opacity-30 transition-colors text-sm font-bold touch-manipulation`,children:`+`})]})]})}var v=(0,c.memo)(_);function y(e,t){let n=null,r=((...r)=>{n&&clearTimeout(n),n=setTimeout(()=>e(...r),t)});return r.cancel=()=>{n&&clearTimeout(n),n=null},r}function b(){let e=(0,c.useRef)(null),t=(0,c.useRef)(null),n=(0,c.useRef)(null),[r,a]=(0,c.useState)({width:800,height:400}),o=(0,c.useCallback)(()=>{let t=e.current;if(!t)return!1;let n=t.getBoundingClientRect(),r=getComputedStyle(t),i=parseFloat(r.borderTopWidth)||0,o=parseFloat(r.borderBottomWidth)||0,s=parseFloat(r.borderLeftWidth)||0,c=parseFloat(r.borderRightWidth)||0,l=Math.max(100,Math.floor(n.width-s-c)),u=Math.max(100,Math.floor(n.height-i-o));return a(e=>e.width===l&&e.height===u?e:{width:l,height:u}),!0},[]);return(0,c.useLayoutEffect)(()=>{let n=t.current||e.current;if(!n)return;let r=n.clientWidth,i=n.clientHeight;r>=100&&i>=100&&a({width:Math.floor(r),height:Math.floor(i)})},[]),(0,c.useEffect)(()=>{o();let t=e.current;if(!t)return;let r,i=y(()=>{cancelAnimationFrame(r),r=requestAnimationFrame(o)},100),a=new ResizeObserver(()=>{i()});return a.observe(t),()=>{cancelAnimationFrame(r),i.cancel(),a.disconnect(),n.current&&=(n.current.abort(),null)}},[o]),{containerRef:e,svgRef:t,dimensions:r,getAnimationContext:(0,c.useCallback)(()=>{n.current&&n.current.abort();let e=i();return n.current=e,e},[]),abortAnimation:(0,c.useCallback)(()=>{n.current&&=(n.current.abort(),null)},[])}}function x(e,t=!0){let n=(0,c.useRef)(e),r=(0,c.useRef)(t);(0,c.useEffect)(()=>{n.current=e},[e]),(0,c.useEffect)(()=>{r.current=t},[t]);let i=(0,c.useCallback)(e=>{if(!r.current)return;let t=e.target.tagName,i=t===`INPUT`||t===`TEXTAREA`||t===`BUTTON`||e.target.isContentEditable,a=e.key.toLowerCase(),o=e.ctrlKey||e.metaKey,s=e.shiftKey;for(let[t,r]of Object.entries(n.current)){let n=t.split(`+`),c=n[n.length-1].toLowerCase(),l=n.includes(`ctrl`)||n.includes(`cmd`),u=n.includes(`shift`);if(!(i&&!l)&&a===c&&o===l&&s===u){e.preventDefault(),r();return}}},[]);(0,c.useEffect)(()=>(window.addEventListener(`keydown`,i),()=>window.removeEventListener(`keydown`,i)),[i])}function S(e,t,n){if(!t.length||!e.trim())return e;let r=t.map(e=>e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)),i=RegExp(`(${r.join(`|`)})`,`g`);return e.split(i).map((e,n)=>t.some(t=>e===t)?(0,l.jsx)(`span`,{className:`bg-accent-amber/20 text-accent-amber font-bold px-0.5`,children:e},n):e)}function C({step:e,currentStepIndex:t,totalSteps:n,progress:r,onNext:i,onPrev:o,onReset:s,onGoToStep:u,isAnimating:d}){let{t:f}=a(),[p,m]=(0,c.useState)(!1),[h,g]=(0,c.useState)(3e3),_=(0,c.useRef)(null),v=(0,c.useCallback)(()=>{m(!1),_.current&&=(clearTimeout(_.current),null)},[]);return(0,c.useEffect)(()=>{if(!p||d){v();return}if(t>=n-1){v();return}return _.current=setTimeout(()=>{i()},h),()=>{_.current&&clearTimeout(_.current)}},[p,t,n,d,h,i,v]),(0,c.useEffect)(()=>()=>{_.current&&clearTimeout(_.current)},[]),e?(0,l.jsxs)(`div`,{className:`bg-white dark:bg-slate border-2 border-ink dark:border-dark-border p-4`,children:[(0,l.jsx)(`div`,{className:`flex items-center gap-1.5 mb-3 flex-wrap`,children:Array.from({length:n},(e,n)=>(0,l.jsx)(`button`,{onClick:()=>u?.(n),disabled:d,className:`w-2.5 h-2.5 rounded-full transition-all duration-200 border
              ${n===t?`bg-accent-blue border-accent-blue scale-125`:n<t?`bg-accent-emerald/60 border-accent-emerald/60`:`bg-ink/10 dark:bg-dark-ink/20 border-ink/20 dark:border-dark-border hover:bg-ink/30`}
              disabled:cursor-not-allowed`,"aria-label":`${f(`stepExplainer.step`)} ${n+1}`},n))}),(0,l.jsxs)(`div`,{className:`flex items-center justify-between mb-3`,children:[(0,l.jsxs)(`div`,{className:`text-sm font-mono text-ink-light dark:text-dark-ink-light`,children:[f(`stepExplainer.step`),` `,t+1,` / `,n]}),(0,l.jsx)(`div`,{className:`w-32 h-2 bg-paper dark:bg-dark-paper border border-ink/10 dark:border-dark-border`,children:(0,l.jsx)(`div`,{className:`h-full bg-accent-blue transition-all duration-300`,style:{width:`${r}%`}})})]}),(0,l.jsx)(`h3`,{className:`text-lg font-bold text-ink dark:text-dark-ink mb-2`,children:e.title}),(0,l.jsx)(`p`,{className:`text-sm text-ink-light dark:text-dark-ink-light mb-4`,children:e.description}),(0,l.jsx)(`div`,{className:`bg-paper dark:bg-dark-paper border border-ink/10 dark:border-dark-border p-3 mb-4 font-mono text-xs max-h-48 overflow-y-auto scrollbar-thin`,children:e.codeSnippet.split(`
`).map((t,n)=>(0,l.jsxs)(`div`,{className:`py-0.5 ${n===e.highlightedLine-1?`bg-accent-blue/10 text-accent-blue`:`text-ink dark:text-dark-ink`}`,children:[(0,l.jsx)(`span`,{className:`inline-block w-6 text-right mr-2 text-ink-light dark:text-dark-ink-light`,children:n+1}),S(t,e.highlightTerms,n===e.highlightedLine-1)]},n))}),e.complexity&&(0,l.jsxs)(`div`,{className:`flex flex-wrap gap-2 mb-3`,children:[e.complexity.time&&(0,l.jsxs)(`span`,{className:`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold bg-accent-amber/10 text-accent-amber border border-accent-amber/30`,children:[`T: `,e.complexity.time]}),e.complexity.space&&(0,l.jsxs)(`span`,{className:`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30`,children:[`S: `,e.complexity.space]})]}),e.tips&&e.tips.length>0&&(0,l.jsx)(`div`,{className:`mb-3 space-y-1`,children:e.tips.map((e,t)=>(0,l.jsxs)(`div`,{className:`flex items-start gap-2 text-xs text-ink-light dark:text-dark-ink-light bg-accent-violet/5 dark:bg-accent-violet/10 border border-accent-violet/20 px-2.5 py-1.5`,children:[(0,l.jsx)(`span`,{className:`text-accent-violet font-bold flex-shrink-0 mt-px`,children:`!`}),(0,l.jsx)(`span`,{children:e})]},t))}),(0,l.jsxs)(`div`,{className:`flex items-center gap-2 mb-3`,children:[(0,l.jsx)(`button`,{onClick:()=>m(!p),disabled:d||t>=n-1,className:`px-3 py-1.5 text-xs font-bold border-2 border-ink dark:border-dark-border
            shadow-button dark:shadow-button-dark
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${p?`bg-accent-amber text-paper border-accent-amber`:`hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper`}`,children:f(p?`stepExplainer.pause`:`stepExplainer.autoPlay`)}),(0,l.jsxs)(`div`,{className:`flex items-center gap-1 text-xs text-ink-light dark:text-dark-ink-light`,children:[(0,l.jsxs)(`span`,{children:[f(`stepExplainer.speed`),`:`]}),[1e3,2e3,3e3,5e3].map(e=>(0,l.jsxs)(`button`,{onClick:()=>g(e),className:`px-1.5 py-0.5 border text-[10px] font-mono transition-colors
                ${h===e?`bg-ink text-paper dark:bg-dark-ink dark:text-dark-paper border-ink dark:border-dark-border`:`border-ink/20 dark:border-dark-border hover:bg-ink/10`}`,children:[e/1e3,`s`]},e))]})]}),(0,l.jsxs)(`div`,{className:`flex gap-2`,children:[(0,l.jsx)(`button`,{onClick:o,disabled:t===0||d,className:`flex-1 px-3 py-2 text-sm font-bold border-2 border-ink dark:border-dark-border
            shadow-button dark:shadow-button-dark
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper
            hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover
            active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
            transition-all duration-200`,children:f(`stepExplainer.prev`)}),(0,l.jsx)(`button`,{onClick:()=>{s(),v()},disabled:d,className:`px-3 py-2 text-sm font-bold border-2 border-ink dark:border-dark-border
            shadow-button dark:shadow-button-dark
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper
            hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover
            active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
            transition-all duration-200`,children:f(`stepExplainer.reset`)}),(0,l.jsx)(`button`,{onClick:i,disabled:t===n-1||d,className:`flex-1 px-3 py-2 text-sm font-bold bg-accent-blue text-paper border-2 border-accent-blue
            shadow-button dark:shadow-button-dark
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:brightness-90 hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover
            active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
            transition-all duration-200`,children:f(`stepExplainer.next`)})]})]}):(0,l.jsx)(`div`,{className:`bg-white dark:bg-slate border-2 border-ink dark:border-dark-border p-4`,children:(0,l.jsx)(`div`,{className:`text-center text-ink-light dark:text-dark-ink-light`,children:f(`stepExplainer.selectAlgorithm`)})})}var w=(0,c.memo)(C),T={bfs:{algorithmKey:`bfs`,steps:[{id:`init`,title:`初始化`,description:`创建队列，将起始节点加入队列`,codeSnippet:`function bfs(graph, start) {
  const queue = [start]
  const visited = new Set([start])
  const result = []
}`,highlightedLine:2,highlightTerms:[`queue`,`start`],tips:[`BFS 使用队列（FIFO），DFS 使用栈（LIFO），这是两者最本质的区别`],complexity:{time:`O(V+E)`,space:`O(V)`}},{id:`dequeue`,title:`出队`,description:`从队列头部取出一个节点`,codeSnippet:`while (queue.length > 0) {
  const node = queue.shift()
  result.push(node)
}`,highlightedLine:2,highlightTerms:[`shift`],tips:[`BFS 天然按层遍历，第一次到达的路径就是最短路径（无权图）`]},{id:`visit`,title:`访问节点`,description:`将当前节点标记为已访问`,codeSnippet:`  result.push(node)
  visited.add(node)`,highlightedLine:2,highlightTerms:[`visited`,`add`],tips:[`入队时就标记已访问，而不是出队时，可以避免重复入队`]},{id:`neighbors`,title:`遍历邻居`,description:`将未访问的邻居节点加入队列`,codeSnippet:`  for (const neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      visited.add(neighbor)
      queue.push(neighbor)
    }
  }`,highlightedLine:4,highlightTerms:[`push`,`queue`],tips:[`BFS 常用于：最短路径（无权图）、层序遍历、社交网络中找一度/二度好友`]}]},dfs:{algorithmKey:`dfs`,steps:[{id:`init`,title:`初始化`,description:`创建栈，将起始节点压入栈`,codeSnippet:`function dfs(graph, start) {
  const stack = [start]
  const visited = new Set()
  const result = []
}`,highlightedLine:2,highlightTerms:[`stack`,`start`],tips:[`DFS 也可以用递归实现，递归调用栈本质上就是一个栈结构`],complexity:{time:`O(V+E)`,space:`O(V)`}},{id:`pop`,title:`出栈`,description:`从栈顶取出一个节点`,codeSnippet:`while (stack.length > 0) {
  const node = stack.pop()
  if (visited.has(node)) continue
  visited.add(node)
  result.push(node)
}`,highlightedLine:2,highlightTerms:[`pop`],tips:[`出栈后先检查是否已访问，因为同一个节点可能被多次压入栈`]},{id:`visit`,title:`访问节点`,description:`将当前节点标记为已访问并加入结果`,codeSnippet:`  visited.add(node)
  result.push(node)`,highlightedLine:1,highlightTerms:[`visited`,`add`],tips:[`DFS 深度优先，会沿着一条路径走到底再回溯，适合检测环和拓扑排序`]},{id:`neighbors`,title:`遍历邻居`,description:`将未访问的邻居节点压入栈`,codeSnippet:`  for (const neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      stack.push(neighbor)
    }
  }`,highlightedLine:3,highlightTerms:[`push`,`stack`],tips:[`DFS 常用于：连通分量检测、环检测、路径查找、迷宫求解、拓扑排序`]}]},dijkstra:{algorithmKey:`dijkstra`,steps:[{id:`init`,title:`初始化`,description:`创建距离表，起始节点距离为 0，其余为无穷大。维护前驱节点表用于回溯路径`,codeSnippet:`function dijkstra(graph, start) {
  const distances = {}
  for (const node of graph) distances[node] = Infinity
  distances[start] = 0
  const previous = {}
  const visited = new Set()
}`,highlightedLine:4,highlightTerms:[`distances[start] = 0`,`Infinity`],tips:[`距离初始化为 Infinity 是为了方便后续比较，起始节点距离为 0`],complexity:{time:`O((V+E)log V)`,space:`O(V)`}},{id:`select`,title:`选择最近节点`,description:`从未访问节点中选择距离最小的节点，标记为已访问`,codeSnippet:`  while (visited.size < Object.keys(graph).length) {
    let node = null
    let minDist = Infinity
    for (const n in distances) {
      if (!visited.has(n) && distances[n] < minDist) {
        minDist = distances[n]
        node = n
      }
    }
    if (node === null) break
    visited.add(node)
  }`,highlightedLine:5,highlightTerms:[`distances[n]`,`minDist`,`visited`],tips:[`使用优先队列（最小堆）可以将选择操作从 O(V) 优化到 O(log V)`]},{id:`relax`,title:`松弛操作`,description:`遍历当前节点的所有邻居，计算经由当前节点到达邻居的距离，如果更短则更新`,codeSnippet:`    for (const [neighbor, weight] of graph[node]) {
      const newDist = distances[node] + weight
      if (newDist < (distances[neighbor] ?? Infinity)) {
        distances[neighbor] = newDist
        previous[neighbor] = node
      }
    }`,highlightedLine:3,highlightTerms:[`newDist`,`distances[neighbor]`],tips:[`"松弛"是图算法的核心概念：尝试找到更短的路径来更新距离`]},{id:`path`,title:`回溯路径`,description:`算法结束后，通过前驱节点表从终点回溯到起点，得到最短路径`,codeSnippet:`  function getPath(end) {
    const path = []
    let current = end
    while (current !== undefined) {
      path.unshift(current)
      current = previous[current]
    }
    return path[0] === start ? path : []
  }`,highlightedLine:5,highlightTerms:[`previous[current]`,`path`],tips:[`路径回溯是从终点向起点反向追踪，使用 unshift 构建正序路径`]},{id:`complete`,title:`算法完成`,description:`所有节点处理完毕，distances 表包含从起点到每个节点的最短距离`,codeSnippet:`  // 最终结果
  // distances: { A: 0, B: 3, C: 5, D: 7 }
  // previous:  { B: A, C: B, D: C }
  // 路径 A→D: A → B → C → D`,highlightedLine:2,highlightTerms:[`distances`,`previous`],tips:[`Dijkstra 不能处理负权边，负权图需要使用 Bellman-Ford 算法`],complexity:{time:`O((V+E)log V) 使用堆优化`,space:`O(V+E)`}}]},topoSort:{algorithmKey:`topoSort`,steps:[{id:`init`,title:`计算入度`,description:`遍历图中所有边，统计每个节点的入度（被指向的次数）`,codeSnippet:`function topoSort(graph) {
  const inDegree = {}
  for (const node of graph) inDegree[node] = 0
  for (const node of graph) {
    for (const neighbor of graph[node]) {
      inDegree[neighbor]++
    }
  }
}`,highlightedLine:6,highlightTerms:[`inDegree[neighbor]++`],tips:[`入度为 0 意味着该节点不依赖任何其他节点，可以最先执行`],complexity:{time:`O(V+E)`,space:`O(V)`}},{id:`queue`,title:`入度为 0 入队`,description:`将所有入度为 0 的节点加入队列，它们是拓扑排序的起始点`,codeSnippet:`  const queue = []
  for (const node in inDegree) {
    if (inDegree[node] === 0) {
      queue.push(node)
    }
  }
  const result = []`,highlightedLine:3,highlightTerms:[`inDegree[node] === 0`,`queue`],tips:[`如果有多个入度为 0 的节点，拓扑排序的结果不唯一`]},{id:`process`,title:`处理节点`,description:`出队一个节点加入结果，然后将其所有邻居的入度减 1`,codeSnippet:`  while (queue.length > 0) {
    const node = queue.shift()
    result.push(node)
    for (const neighbor of graph[node]) {
      inDegree[neighbor]--
      // 入度减为 0 则入队
    }
  }`,highlightedLine:5,highlightTerms:[`inDegree[neighbor]--`,`result.push`],tips:[`出队即"移除"该节点，相当于从图中删除它和它的所有出边`]},{id:`requeue`,title:`新节点就绪`,description:`当某节点的入度减为 0 时，说明它的所有前驱都已处理，可以入队`,codeSnippet:`      if (inDegree[neighbor] === 0) {
        queue.push(neighbor)
      }
    }
  }`,highlightedLine:2,highlightTerms:[`inDegree[neighbor] === 0`,`push`],tips:[`入度变为 0 是"所有依赖已满足"的信号，这是拓扑排序的核心思想`]},{id:`cycle`,title:`检测环与结果`,description:`如果结果长度不等于节点数，说明图中存在环，无法完成拓扑排序`,codeSnippet:`  if (result.length !== Object.keys(graph).length) {
    throw new Error('图中存在环，无法拓扑排序')
  }
  return result
  // 例: [A, B, C, D] 表示合法的执行顺序`,highlightedLine:2,highlightTerms:[`result.length`,`环`],tips:[`拓扑排序常用于：任务调度、课程安排、编译依赖、电子表格公式计算`],complexity:{time:`O(V+E)`,space:`O(V)`}}]},bubble:{algorithmKey:`bubble`,steps:[{id:`init`,title:`初始化`,description:`外层循环从左到右遍历数组，每轮将最大值"冒泡"到末尾`,codeSnippet:`function bubbleSort(arr) {
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
    }
  }
}`,highlightedLine:3,highlightTerms:[`n - 1`],tips:[`冒泡排序是最直观的排序算法，但效率较低，适合教学而非生产环境`],complexity:{time:`O(n²)`,space:`O(1)`}},{id:`compare`,title:`比较相邻元素`,description:`比较 arr[j] 和 arr[j+1]，判断是否需要交换`,codeSnippet:`    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // 需要交换
      }
    }`,highlightedLine:2,highlightTerms:[`arr[j]`,`arr[j + 1]`],tips:[`每轮比较范围缩小 i 个元素，因为末尾已有 i 个元素归位`]},{id:`swap`,title:`交换元素`,description:`如果左侧元素大于右侧，交换两个元素的位置`,codeSnippet:`      if (arr[j] > arr[j + 1]) {
        const temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
      }`,highlightedLine:2,highlightTerms:[`temp`,`arr[j]`],tips:[`冒泡排序是稳定排序——相等元素不会交换位置`]},{id:`sorted`,title:`已排序区域`,description:`每轮结束后，最大元素已到达正确位置，缩小比较范围`,codeSnippet:`  // 第 i 轮结束后
  // arr[n-i-1..n-1] 已排序
  // 下一轮只需比较 [0..n-i-2]
  // 最佳 O(n)：加 flag 检测已排序数组`,highlightedLine:2,highlightTerms:[`已排序`,`O(n)`],tips:[`添加一个 swapped 标志，如果某轮没有交换就可以提前终止，最佳情况 O(n)`]}]},quick:{algorithmKey:`quick`,steps:[{id:`init`,title:`选择基准`,description:`选择一个元素作为基准（pivot），通常选最后一个元素`,codeSnippet:`function quickSort(arr, low, high) {
  if (low >= high) return
  const pivot = arr[high]
  let i = low - 1
}`,highlightedLine:3,highlightTerms:[`pivot`],tips:[`pivot 的选择直接影响性能，三数取中法可以避免最坏情况`],complexity:{time:`平均 O(n log n)`,space:`O(log n)`}},{id:`partition`,title:`分区操作`,description:`遍历数组，将小于 pivot 的元素移到左侧，大于的移到右侧`,codeSnippet:`  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++
      swap(arr, i, j)
    }
  }`,highlightedLine:2,highlightTerms:[`arr[j]`,`pivot`],tips:[`分区是快排的核心，一次分区就能确定一个元素的最终位置`]},{id:`place`,title:`放置基准`,description:`将 pivot 放到正确位置（i+1），左侧都小于它，右侧都大于它`,codeSnippet:`  swap(arr, i + 1, high)
  const pi = i + 1
  // arr[pi] 已在正确位置`,highlightedLine:1,highlightTerms:[`pi`,`i + 1`],tips:[`分区完成后 pivot 就在最终位置，不需要再移动`]},{id:`recurse`,title:`递归排序`,description:`对基准左侧和右侧的子数组分别递归执行快速排序`,codeSnippet:`  quickSort(arr, low, pi - 1)   // 左半部分
  quickSort(arr, pi + 1, high)  // 右半部分
  // 最坏 O(n²)：数组已排序且 pivot 选首/尾`,highlightedLine:1,highlightTerms:[`quickSort`],tips:[`快排平均性能最优，但最坏 O(n²) 发生在数组已排序且 pivot 选首尾时`],complexity:{time:`最坏 O(n²)`,space:`O(log n)`}}]},merge:{algorithmKey:`merge`,steps:[{id:`init`,title:`初始化`,description:`将数组不断对半分割，直到每个子数组只有一个元素`,codeSnippet:`function mergeSort(arr, left, right) {
  if (left >= right) return
  const mid = Math.floor((left + right) / 2)
}`,highlightedLine:3,highlightTerms:[`mid`],tips:[`归并排序采用分治策略，分割阶段不涉及任何比较或交换`],complexity:{time:`O(n log n)`,space:`O(n)`}},{id:`split`,title:`递归分割`,description:`递归地对左半部分和右半部分分别进行归并排序`,codeSnippet:`  mergeSort(arr, left, mid)
  mergeSort(arr, mid + 1, right)
  // 左右两部分各自有序`,highlightedLine:1,highlightTerms:[`mergeSort`],tips:[`递归深度为 log n，每层总共需要 n 次操作，因此总复杂度 O(n log n)`]},{id:`merge`,title:`合并操作`,description:`创建临时数组，用双指针将两个有序子数组合并为一个有序数组`,codeSnippet:`  const leftArr = arr.slice(left, mid + 1)
  const rightArr = arr.slice(mid + 1, right + 1)
  let i = 0, j = 0, k = left
  while (i < leftArr.length && j < rightArr.length) {
    if (leftArr[i] <= rightArr[j]) {
      arr[k++] = leftArr[i++]
    } else {
      arr[k++] = rightArr[j++]
    }
  }`,highlightedLine:5,highlightTerms:[`leftArr[i]`,`rightArr[j]`],tips:[`使用 <= 而非 < 可以保证归并排序的稳定性`]},{id:`copy`,title:`复制剩余`,description:`将两个子数组中剩余的元素复制回原数组`,codeSnippet:`  while (i < leftArr.length) arr[k++] = leftArr[i++]
  while (j < rightArr.length) arr[k++] = rightArr[j++]
  // 合并完成，arr[left..right] 有序`,highlightedLine:1,highlightTerms:[`leftArr[i]`,`arr[k]`],tips:[`归并排序缺点是需要 O(n) 额外空间，但在链表排序和外部排序中优势明显`],complexity:{time:`O(n log n) 稳定`,space:`O(n)`}}]},heap:{algorithmKey:`heap`,steps:[{id:`init`,title:`建堆`,description:`从最后一个非叶子节点开始，自底向上执行堆化操作构建最大堆`,codeSnippet:`function heapSort(arr) {
  const n = arr.length
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i)
  }
}`,highlightedLine:3,highlightTerms:[`heapify`,`n / 2`],tips:[`建堆的时间复杂度是 O(n)，不是 O(n log n)，因为底层节点不需要下沉`],complexity:{time:`O(n log n)`,space:`O(1)`}},{id:`heapify`,title:`堆化操作`,description:`比较父节点与左右子节点，将最大值上浮到父节点位置`,codeSnippet:`function heapify(size, root) {
  let largest = root
  const left = 2 * root + 1
  const right = 2 * root + 2
  if (left < size && arr[left] > arr[largest])
    largest = left
  if (right < size && arr[right] > arr[largest])
    largest = right
}`,highlightedLine:5,highlightTerms:[`largest`,`arr[left]`],tips:[`堆化是一个自顶向下的递归过程，最坏下沉到叶子节点，深度为 log n`]},{id:`extract`,title:`提取堆顶`,description:`将堆顶（最大值）与末尾元素交换，缩小堆的范围`,codeSnippet:`  for (let i = n - 1; i > 0; i--) {
    swap(arr, 0, i)
    heapify(arr, i, 0)
  }`,highlightedLine:2,highlightTerms:[`swap`,`0`],tips:[`每次交换后堆大小减 1，已排序区域从末尾向前增长`]},{id:`sorted`,title:`排序完成`,description:`每次提取后重新堆化，重复直到堆大小为 1，数组完全有序`,codeSnippet:`  // 每轮：堆顶 → 末尾
  // 堆大小减 1
  // 重新堆化
  // 时间复杂度 O(n log n)，空间 O(1)`,highlightedLine:1,highlightTerms:[`O(n log n)`],tips:[`堆排序是唯一同时满足 O(n log n) 时间和 O(1) 空间的排序算法，但不稳定`],complexity:{time:`O(n log n) 稳定`,space:`O(1)`}}]},selection:{algorithmKey:`selection`,steps:[{id:`init`,title:`初始化`,description:`外层循环从数组起始位置开始，每轮从未排序部分选出最小元素`,codeSnippet:`function selectionSort(arr) {
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    // 从 i+1 开始寻找最小值
  }
}`,highlightedLine:4,highlightTerms:[`minIdx`,`i`],tips:[`选择排序每轮只做一次交换，这是它与冒泡排序的关键区别`],complexity:{time:`O(n²)`,space:`O(1)`}},{id:`scan`,title:`扫描未排序区域`,description:`遍历 i+1 到 n-1 的元素，找到最小值的索引`,codeSnippet:`    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j  // 更新最小值索引
      }
    }`,highlightedLine:2,highlightTerms:[`arr[j]`,`arr[minIdx]`,`minIdx`],tips:[`内层循环只做比较，不做交换，因此移动次数为 O(n)`],complexity:{time:`O(n²)`,space:`O(1)`}},{id:`swap`,title:`交换最小值`,description:`将找到的最小值与当前位置 i 交换，使其归位`,codeSnippet:`    if (minIdx !== i) {
      const temp = arr[i]
      arr[i] = arr[minIdx]
      arr[minIdx] = temp
    }`,highlightedLine:3,highlightTerms:[`arr[i]`,`arr[minIdx]`,`temp`],tips:[`选择排序是不稳定的排序：相等元素的相对顺序可能改变`]},{id:`progress`,title:`逐步缩小范围`,description:`每轮结束后，已排序区域扩大一位，下一轮从未排序区域继续选择`,codeSnippet:`  // 第 i 轮结束后
  // arr[0..i] 已排序（每轮确定一个位置）
  // arr[i+1..n-1] 未排序
  // 继续 i++ 进入下一轮`,highlightedLine:2,highlightTerms:[`已排序`,`未排序`],tips:[`无论输入数据如何，选择排序总是 O(n²)，没有最好情况优化`]}]},insertion:{algorithmKey:`insertion`,steps:[{id:`init`,title:`初始化`,description:`从第二个元素开始（i=1），将当前元素插入到左侧已排序区域的正确位置`,codeSnippet:`function insertionSort(arr) {
  const n = arr.length
  for (let i = 1; i < n; i++) {
    let j = i
    // 将 arr[j] 插入到左侧正确位置
  }
}`,highlightedLine:3,highlightTerms:[`i = 1`,`j`],tips:[`插入排序天然地将数组分为"已排序"和"未排序"两部分`],complexity:{time:`O(n²)`,space:`O(1)`}},{id:`compare`,title:`向前比较`,description:`将当前元素与左侧相邻元素比较，如果左侧更大则交换`,codeSnippet:`    while (j > 0) {
      if (arr[j - 1] > arr[j]) {
        // 左侧元素更大，需要交换
      } else {
        break  // 已找到正确位置
      }
    }`,highlightedLine:2,highlightTerms:[`arr[j - 1]`,`arr[j]`],tips:[`一旦遇到不大于当前元素的值就停止，这是插入排序的最佳情况优化`]},{id:`shift`,title:`移动元素`,description:`交换相邻元素，将当前元素逐步向左移动到正确位置`,codeSnippet:`      const temp = arr[j]
      arr[j] = arr[j - 1]
      arr[j - 1] = temp
      j--`,highlightedLine:4,highlightTerms:[`temp`,`j--`],tips:[`实际工程中常用"移位"代替"交换"来减少赋值次数`]},{id:`sorted`,title:`已排序区域增长`,description:`每轮结束后 arr[0..i] 有序，继续处理下一个元素`,codeSnippet:`  // 第 i 轮结束后
  // arr[0..i] 已排序
  // 下一轮 i++，取下一个未排序元素
  // 最佳情况 O(n)：数组已排序时只需一次比较`,highlightedLine:2,highlightTerms:[`已排序`,`O(n)`],tips:[`插入排序对近乎有序的数组效率极高，接近 O(n)，常用于混合排序算法的子过程`],complexity:{time:`最好 O(n)，最坏 O(n²)`,space:`O(1)`}}]},radix:{algorithmKey:`radix`,steps:[{id:`init`,title:`找到最大值`,description:`首先找到数组中的最大值，确定需要处理的位数`,codeSnippet:`function radixSort(arr) {
  const max = Math.max(...arr)
  let exp = 1  // 当前位数：个位、十位、百位...
  // 当 max/exp > 0 时继续处理
}`,highlightedLine:2,highlightTerms:[`max`,`exp`],tips:[`基数排序是非比较排序，时间复杂度可以突破 O(n log n) 的下界`],complexity:{time:`O(d·n)`,space:`O(n+k)`}},{id:`count`,title:`统计当前位`,description:`对当前位（个位/十位/...）统计 0-9 各数字出现的频率`,codeSnippet:`  const count = new Array(10).fill(0)
  for (let i = 0; i < n; i++) {
    const digit = Math.floor(arr[i] / exp) % 10
    count[digit]++
  }
  // 累加计数，转换为位置索引
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1]
  }`,highlightedLine:3,highlightTerms:[`digit`,`count[digit]`],tips:[`这里使用的是 LSD（最低位优先）基数排序，从个位开始逐步向高位处理`]},{id:`place`,title:`按位放置`,description:`根据当前位的值，将元素放入输出数组的正确位置（逆序遍历保证稳定性）`,codeSnippet:`  const output = new Array(n)
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10
    output[count[digit] - 1] = arr[i]
    count[digit]--
  }`,highlightedLine:4,highlightTerms:[`output`,`count[digit]`],tips:[`逆序遍历是为了保证排序的稳定性——相等元素保持原有相对顺序`]},{id:`nextdigit`,title:`处理下一位`,description:`将输出数组复制回原数组，exp 乘以 10 移动到下一位，重复上述过程`,codeSnippet:`  for (let i = 0; i < n; i++) {
    arr[i] = output[i]
  }
  exp *= 10  // 个位→十位→百位...
  // 重复直到所有位处理完毕`,highlightedLine:4,highlightTerms:[`exp *= 10`],tips:[`基数排序适合位数固定且范围不大的整数排序，d 为最大位数`],complexity:{time:`O(d·n)，d 为最大位数`,space:`O(n+k)，k 为基数`}}]},bucket:{algorithmKey:`bucket`,steps:[{id:`init`,title:`创建桶`,description:`确定桶的数量和范围，创建空桶数组`,codeSnippet:`function bucketSort(arr) {
  const min = Math.min(...arr)
  const max = Math.max(...arr)
  const bucketCount = Math.floor(Math.sqrt(n)) + 1
  const bucketRange = (max - min + 1) / bucketCount
  const buckets = Array.from({ length: bucketCount }, () => [])
}`,highlightedLine:4,highlightTerms:[`bucketCount`,`bucketRange`],tips:[`桶的数量通常取 √n，这是经验上的一个平衡点`],complexity:{time:`O(n+k)`,space:`O(n+k)`}},{id:`distribute`,title:`分配元素`,description:`遍历数组，将每个元素分配到对应的桶中`,codeSnippet:`  for (let i = 0; i < n; i++) {
    const bucketIdx = Math.min(
      Math.floor((arr[i] - min) / bucketRange),
      bucketCount - 1
    )
    buckets[bucketIdx].push(arr[i])
  }`,highlightedLine:6,highlightTerms:[`bucketIdx`,`push`],tips:[`Math.min 确保最大值不会越界到最后一个桶之外`]},{id:`sort`,title:`桶内排序`,description:`对每个桶内部单独排序（通常用插入排序或内置排序）`,codeSnippet:`  for (let b = 0; b < bucketCount; b++) {
    buckets[b].sort((a, c) => a - c)
    // 每个桶内部独立排序
    // 数据均匀分布时每个桶元素很少
  }`,highlightedLine:2,highlightTerms:[`sort`],tips:[`桶内排序的选择取决于数据分布，元素少时插入排序更高效`]},{id:`merge`,title:`合并结果`,description:`按桶的顺序将所有桶中的元素依次放回原数组`,codeSnippet:`  let idx = 0
  for (let b = 0; b < bucketCount; b++) {
    for (let j = 0; j < buckets[b].length; j++) {
      arr[idx++] = buckets[b][j]
    }
  }
  // 合并完成，数组已排序`,highlightedLine:4,highlightTerms:[`arr[idx]`,`buckets[b]`],tips:[`桶排序在数据均匀分布时接近 O(n)，分布极不均匀时退化为 O(n²)`],complexity:{time:`平均 O(n+k)，最坏 O(n²)`,space:`O(n+k)`}}]},linkedlist:{algorithmKey:`linkedlist`,steps:[{id:`init`,title:`链表结构`,description:`链表由节点组成，每个节点包含数据和指向下一个节点的指针`,codeSnippet:`class Node {
  constructor(value) {
    this.value = value
    this.next = null
  }
}`,highlightedLine:3,highlightTerms:[`value`,`next`],tips:[`链表不需要连续内存，插入/删除只需修改指针，但随机访问需要 O(n)`],complexity:{time:`访问 O(n)，插入/删除 O(1)`,space:`O(n)`}},{id:`insert-head`,title:`头插法`,description:`将新节点插入到链表头部，新节点指向原头节点`,codeSnippet:`function insertHead(value) {
  const node = new Node(value)
  node.next = this.head
  this.head = node
}`,highlightedLine:3,highlightTerms:[`node.next`,`head`],tips:[`头插法 O(1) 时间复杂度，但会使元素顺序反转`]},{id:`insert-tail`,title:`尾插法`,description:`遍历到链表末尾，将新节点连接到最后一个节点之后`,codeSnippet:`function insertTail(value) {
  const node = new Node(value)
  let curr = this.head
  while (curr.next) curr = curr.next
  curr.next = node
}`,highlightedLine:4,highlightTerms:[`curr.next`,`while`],tips:[`维护 tail 指针可以将尾插法优化到 O(1)，但增加维护成本`]},{id:`delete`,title:`删除节点`,description:`找到目标节点的前驱节点，修改指针跳过目标节点`,codeSnippet:`function deleteNode(value) {
  let curr = this.head
  while (curr.next.value !== value) {
    curr = curr.next
  }
  curr.next = curr.next.next
}`,highlightedLine:6,highlightTerms:[`curr.next.next`],tips:[`链表删除的关键是找到前驱节点，然后"跳过"目标节点`]}]},doublyLinkedList:{algorithmKey:`doublyLinkedList`,steps:[{id:`structure`,title:`双向链表结构`,description:`每个节点包含数据、指向前驱的 prev 指针和指向后继的 next 指针`,codeSnippet:`class DoublyNode {
  constructor(value) {
    this.value = value
    this.prev = null   // 指向前一个节点
    this.next = null   // 指向后一个节点
  }
}`,highlightedLine:4,highlightTerms:[`prev`,`next`],tips:[`双向链表比单链表多一个指针，但支持反向遍历和 O(1) 删除已知节点`],complexity:{time:`访问 O(n)，插入/删除 O(1)`,space:`O(n)`}},{id:`insert-head`,title:`头插法`,description:`新节点的 next 指向原头节点，原头节点的 prev 指向新节点，然后更新头指针`,codeSnippet:`function insertHead(value) {
  const node = new DoublyNode(value)
  node.next = this.head
  if (this.head) {
    this.head.prev = node
  }
  this.head = node
}`,highlightedLine:4,highlightTerms:[`this.head.prev`,`node`],tips:[`头插法需要处理链表为空的特殊情况（head 为 null）`]},{id:`insert-tail`,title:`尾插法`,description:`遍历到链表末尾，将新节点连接到尾部，并建立双向指针关系`,codeSnippet:`function insertTail(value) {
  const node = new DoublyNode(value)
  let curr = this.head
  while (curr.next) {
    curr = curr.next
  }
  curr.next = node
  node.prev = curr
}`,highlightedLine:6,highlightTerms:[`node.prev`,`curr`],tips:[`维护 tail 指针可以将尾插法优化到 O(1)，双向链表更容易维护`]},{id:`delete`,title:`删除节点`,description:`找到目标节点，将其前驱的 next 指向后继，后继的 prev 指向前驱`,codeSnippet:`function deleteNode(value) {
  let curr = this.head
  while (curr && curr.value !== value) {
    curr = curr.next
  }
  if (!curr) return
  if (curr.prev) curr.prev.next = curr.next
  if (curr.next) curr.next.prev = curr.prev
  if (curr === this.head) this.head = curr.next
}`,highlightedLine:6,highlightTerms:[`curr.prev.next`,`curr.next.prev`],tips:[`双向链表删除不需要找前驱节点，因为节点自带 prev 指针`]}]},tree:{algorithmKey:`tree`,steps:[{id:`init`,title:`二叉树结构`,description:`每个节点最多有两个子节点：左子节点和右子节点`,codeSnippet:`class TreeNode {
  constructor(value) {
    this.value = value
    this.left = null
    this.right = null
  }
}`,highlightedLine:4,highlightTerms:[`left`,`right`],tips:[`二叉搜索树（BST）的性质：左子树所有值 < 根 < 右子树所有值`],complexity:{time:`平均 O(log n)，最坏 O(n)`,space:`O(n)`}},{id:`insert`,title:`插入节点`,description:`比较值大小，小于当前节点向左走，大于向右走，找到空位插入`,codeSnippet:`function insert(node, value) {
  if (!node) return new TreeNode(value)
  if (value < node.value)
    node.left = insert(node.left, value)
  else
    node.right = insert(node.right, value)
  return node
}`,highlightedLine:3,highlightTerms:[`value < node.value`,`left`],tips:[`插入操作的效率取决于树的高度，平衡树 O(log n)，退化链表 O(n)`]},{id:`traversal`,title:`遍历方式`,description:`前序遍历（根-左-右）、中序遍历（左-根-右）、后序遍历（左-右-根）`,codeSnippet:`function inorder(node) {
  if (!node) return
  inorder(node.left)    // 先遍历左子树
  visit(node)           // 访问根节点
  inorder(node.right)   // 再遍历右子树
}`,highlightedLine:4,highlightTerms:[`visit`,`inorder`],tips:[`BST 的中序遍历结果是有序的，这是一个重要的性质`]},{id:`search`,title:`查找节点`,description:`利用 BST 性质，比较目标值与当前节点值，决定向左或向右搜索`,codeSnippet:`function search(node, value) {
  if (!node || node.value === value)
    return node
  if (value < node.value)
    return search(node.left, value)
  return search(node.right, value)
}`,highlightedLine:4,highlightTerms:[`value < node.value`,`search`],tips:[`AVL 树和红黑树通过旋转保持平衡，确保查找始终 O(log n)`]}]},hash:{algorithmKey:`hash`,steps:[{id:`init`,title:`哈希函数`,description:`将键通过哈希函数映射到数组索引，实现 O(1) 平均访问`,codeSnippet:`function hash(key, size) {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i)
  }
  return hash % size
}`,highlightedLine:6,highlightTerms:[`hash % size`],tips:[`好的哈希函数应均匀分布，减少冲突。常见的有乘法哈希、MurmurHash 等`],complexity:{time:`平均 O(1)，最坏 O(n)`,space:`O(n)`}},{id:`insert`,title:`插入键值对`,description:`计算哈希值确定桶位置，将键值对存入对应桶中`,codeSnippet:`function insert(key, value) {
  const index = hash(key, this.size)
  this.buckets[index].push({ key, value })
}`,highlightedLine:2,highlightTerms:[`hash(key)`,`push`],tips:[`当负载因子（元素数/桶数）超过 0.75 时，通常需要扩容并重新哈希`]},{id:`collision`,title:`冲突处理`,description:`当多个键映射到同一索引时，使用链地址法在桶中存储多个元素`,codeSnippet:`// 桶内链式存储
// bucket[2] -> (key1, val1) -> (key2, val2)
// 遍历链表找到目标键
function get(key) {
  const index = hash(key, this.size)
  return this.buckets[index]
    .find(item => item.key === key)
}`,highlightedLine:6,highlightTerms:[`find`,`item.key`],tips:[`冲突处理的两种主要方式：链地址法（本例）和开放寻址法`]},{id:`search`,title:`查找操作`,description:`计算哈希值定位桶，遍历桶内链表找到匹配的键`,codeSnippet:`function search(key) {
  const index = hash(key, this.size)
  const bucket = this.buckets[index]
  for (const item of bucket) {
    if (item.key === key) return item.value
  }
  return undefined
}`,highlightedLine:5,highlightTerms:[`item.key === key`],tips:[`哈希表是 JavaScript 对象/Map 的底层实现，是最重要的数据结构之一`]}]},array:{algorithmKey:`array`,steps:[{id:`structure`,title:`数组结构`,description:`数组在内存中连续存储，每个元素通过索引直接访问，支持 O(1) 随机读取`,codeSnippet:`// 数组：连续内存布局
// 索引:  0    1    2    3    4
// 值:   [8]  [3]  [12] [5]  [9]
// 地址: base + index * sizeof(int)`,highlightedLine:2,highlightTerms:[`索引`,`连续`],tips:[`数组的连续存储使得缓存命中率高，这是数组遍历速度快的根本原因`],complexity:{time:`随机访问 O(1)`,space:`O(n)`}},{id:`insert`,title:`插入操作`,description:`在指定位置插入元素，需要将该位置之后的所有元素向后移动一位，时间复杂度 O(n)`,codeSnippet:`function insert(arr, index, value) {
  for (let i = arr.length; i > index; i--) {
    arr[i] = arr[i - 1]  // 元素后移
  }
  arr[index] = value     // 插入新元素
}`,highlightedLine:3,highlightTerms:[`arr[i - 1]`,`后移`],tips:[`尾部插入 O(1)，中间/头部插入 O(n)，这是数组的主要劣势`]},{id:`delete`,title:`删除操作`,description:`删除指定位置的元素，需要将该位置之后的所有元素向前移动一位，时间复杂度 O(n)`,codeSnippet:`function remove(arr, index) {
  const value = arr[index]
  for (let i = index; i < arr.length - 1; i++) {
    arr[i] = arr[i + 1]  // 元素前移
  }
  arr.length--           // 缩减长度
  return value
}`,highlightedLine:4,highlightTerms:[`arr[i + 1]`,`前移`],tips:[`删除时如果不关心顺序，可以用 arr[i] = arr[arr.length-1] 来 O(1) 删除`]},{id:`search`,title:`查找操作`,description:`线性查找逐个比较元素，时间复杂度 O(n)；若数组有序可用二分查找 O(log n)`,codeSnippet:`function search(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i
  }
  return -1  // 未找到
}`,highlightedLine:3,highlightTerms:[`arr[i] === target`,`O(n)`],tips:[`数组是最基础的数据结构，几乎所有其他数据结构都建立在数组之上`]}]},stack:{algorithmKey:`stack`,steps:[{id:`structure`,title:`栈结构`,description:`栈是后进先出（LIFO）的线性结构，只能在栈顶进行插入和删除操作`,codeSnippet:`// 栈：后进先出 LIFO
//    ┌───┐
//    │ 9 │ ← 栈顶 (Top)
//    ├───┤
//    │ 5 │
//    ├───┤
//    │ 3 │
//    └───┘ ← 栈底 (Bottom)`,highlightedLine:2,highlightTerms:[`LIFO`,`栈顶`],tips:[`栈的应用：函数调用栈、括号匹配、表达式求值、浏览器前进/后退`],complexity:{time:`所有操作 O(1)`,space:`O(n)`}},{id:`push`,title:`入栈 Push`,description:`将新元素放到栈顶，栈顶指针上移，时间复杂度 O(1)`,codeSnippet:`function push(stack, value) {
  stack.top++
  stack.items[stack.top] = value
  // 栈顶指针上移，新元素成为栈顶
}`,highlightedLine:3,highlightTerms:[`stack.top`,`O(1)`],tips:[`入栈前应检查是否栈满（固定大小数组实现时）`]},{id:`pop`,title:`出栈 Pop`,description:`移除并返回栈顶元素，栈顶指针下移，时间复杂度 O(1)`,codeSnippet:`function pop(stack) {
  if (stack.top < 0) throw '栈空'
  const value = stack.items[stack.top]
  stack.top--
  return value  // 返回原栈顶元素
}`,highlightedLine:4,highlightTerms:[`stack.top--`,`栈空`],tips:[`出栈前必须检查栈是否为空，否则会产生下溢错误`]},{id:`peek`,title:`查看栈顶 Peek`,description:`仅查看栈顶元素而不移除，不改变栈的状态，时间复杂度 O(1)`,codeSnippet:`function peek(stack) {
  if (stack.top < 0) throw '栈空'
  return stack.items[stack.top]
  // 只读取，不修改栈顶指针
}`,highlightedLine:3,highlightTerms:[`items[stack.top]`,`只读取`],tips:[`JavaScript 中用数组模拟栈：push/pop 对应入栈/出栈`]}]},queue:{algorithmKey:`queue`,steps:[{id:`structure`,title:`队列结构`,description:`队列是先进先出（FIFO）的线性结构，从队尾入队、从队首出队`,codeSnippet:`// 队列：先进先出 FIFO
//  出队 ← [3] [5] [9] [12] ← 入队
//        队首(Front)    队尾(Rear)`,highlightedLine:2,highlightTerms:[`FIFO`,`队首`,`队尾`],tips:[`队列的应用：BFS 遍历、任务调度、消息队列、打印队列、缓冲区`],complexity:{time:`所有操作 O(1)`,space:`O(n)`}},{id:`enqueue`,title:`入队 Enqueue`,description:`将新元素添加到队尾，队尾指针后移，时间复杂度 O(1)`,codeSnippet:`function enqueue(queue, value) {
  queue.items.push(value)
  queue.rear++
  // 新元素进入队尾，等待被处理
}`,highlightedLine:2,highlightTerms:[`push`,`O(1)`],tips:[`循环队列可以避免"假溢出"问题，充分利用数组空间`]},{id:`dequeue`,title:`出队 Dequeue`,description:`移除并返回队首元素，队首指针后移，时间复杂度 O(1)`,codeSnippet:`function dequeue(queue) {
  if (queue.front > queue.rear) throw '队空'
  const value = queue.items[queue.front]
  queue.front++
  return value  // 返回队首元素
}`,highlightedLine:4,highlightTerms:[`queue.front++`,`队空`],tips:[`JavaScript 数组的 shift() 是 O(n)，用双指针可以避免这个问题`]},{id:`front`,title:`查看队首 Front`,description:`仅查看队首元素而不移除，不改变队列状态，时间复杂度 O(1)`,codeSnippet:`function front(queue) {
  if (queue.front > queue.rear) throw '队空'
  return queue.items[queue.front]
  // 只读取，不修改指针
}`,highlightedLine:3,highlightTerms:[`items[queue.front]`,`只读取`],tips:[`优先队列（堆）是队列的扩展：出队时返回优先级最高的元素`]}]},heapStructure:{algorithmKey:`heapStructure`,steps:[{id:`structure`,title:`堆结构`,description:`堆是完全二叉树，用数组存储：父节点 i 的左子为 2i+1，右子为 2i+2，最大堆中父节点 ≥ 子节点`,codeSnippet:`// 最大堆：父节点 ≥ 子节点
//       50
//      /  \\
//    30    40
//   /  \\
//  10   20
//
// 数组: [50, 30, 40, 10, 20]
// 父节点: (i-1)/2  左子: 2i+1  右子: 2i+2`,highlightedLine:2,highlightTerms:[`完全二叉树`,`≥`],tips:[`堆用数组存储完全二叉树，不需要指针，空间利用率高且缓存友好`],complexity:{time:`插入/提取 O(log n)，查看 O(1)`,space:`O(n)`}},{id:`insert`,title:`插入（上浮）`,description:`新元素先放到数组末尾，然后与父节点比较，若大于父节点则交换上浮，直到满足堆性质`,codeSnippet:`function insert(heap, value) {
  heap.push(value)
  let i = heap.length - 1
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2)
    if (heap[i] <= heap[parent]) break
    swap(heap, i, parent)  // 上浮
    i = parent
  }
}`,highlightedLine:6,highlightTerms:[`上浮`,`swap`],tips:[`上浮操作最多比较 log n 次（树的高度），因此插入复杂度 O(log n)`]},{id:`extract`,title:`提取堆顶（下沉）`,description:`将堆顶与末尾交换并移除，然后从堆顶开始与较大子节点比较下沉，直到满足堆性质`,codeSnippet:`function extractMax(heap) {
  const max = heap[0]
  heap[0] = heap[heap.length - 1]
  heap.pop()
  let i = 0
  while (true) {
    let largest = i
    const l = 2*i+1, r = 2*i+2
    if (l < heap.length && heap[l] > heap[largest])
      largest = l
    if (r < heap.length && heap[r] > heap[largest])
      largest = r
    if (largest === i) break
    swap(heap, i, largest)  // 下沉
    i = largest
  }
  return max
}`,highlightedLine:12,highlightTerms:[`下沉`,`largest`],tips:[`下沉时需要与较大的子节点交换，否则会破坏堆性质`]},{id:`peek`,title:`查看堆顶`,description:`直接返回数组首元素，即最大值，时间复杂度 O(1)`,codeSnippet:`function peek(heap) {
  if (heap.length === 0) throw '堆空'
  return heap[0]  // 最大值始终在堆顶
}`,highlightedLine:3,highlightTerms:[`heap[0]`,`O(1)`],tips:[`堆的典型应用：优先队列、堆排序、Top-K 问题、中位数维护、Dijkstra 优化`]}]},trie:{algorithmKey:`trie`,steps:[{id:`structure`,title:`字典树结构`,description:`Trie 是多叉树结构，每条边代表一个字符，从根到某节点的路径构成一个前缀`,codeSnippet:`// Trie（前缀树）
//        root
//       / | \\
//      a  b  c
//     /   |   \\
//    p    y    a
//   /     |     \\
//  e*     e*     t*
//
// * 标记单词结束 (isEnd)
// 路径 "a→p→e" = 单词 "ape"`,highlightedLine:2,highlightTerms:[`前缀`,`isEnd`],tips:[`Trie 的空间换时间：用 O(总字符数) 空间换取 O(单词长度) 的查找时间`],complexity:{time:`O(m)，m 为单词长度`,space:`O(总字符数)`}},{id:`insert`,title:`插入单词`,description:`逐字符沿路径向下，不存在则创建新节点，最后一个字符节点标记为单词结束`,codeSnippet:`function insert(root, word) {
  let node = root
  for (const ch of word) {
    if (!node.children[ch])
      node.children[ch] = new TrieNode()
    node = node.children[ch]
  }
  node.isEnd = true  // 标记单词结束
}`,highlightedLine:8,highlightTerms:[`isEnd`,`children[ch]`],tips:[`共享前缀的单词会共用路径节点，这是 Trie 节省空间的关键`]},{id:`search`,title:`查找单词`,description:`逐字符沿路径查找，若路径中断则不存在，到达末尾时检查 isEnd 标记`,codeSnippet:`function search(root, word) {
  let node = root
  for (const ch of word) {
    if (!node.children[ch])
      return false  // 路径中断
    node = node.children[ch]
  }
  return node.isEnd  // 必须是完整单词
}`,highlightedLine:4,highlightTerms:[`路径中断`,`isEnd`],tips:[`注意区分"查找单词"和"查找前缀"：前者需要检查 isEnd，后者不需要`]},{id:`prefix`,title:`前缀匹配`,description:`与查找类似，但不要求 isEnd 标记，只要路径存在即匹配成功，可用于自动补全`,codeSnippet:`function startsWith(root, prefix) {
  let node = root
  for (const ch of prefix) {
    if (!node.children[ch])
      return false  // 前缀不存在
    node = node.children[ch]
  }
  return true  // 路径存在即匹配
  // 可继续遍历子树获取所有匹配词
}`,highlightedLine:4,highlightTerms:[`前缀不存在`,`自动补全`],tips:[`Trie 的典型应用：搜索引擎自动补全、拼写检查、IP 路由表、词频统计`]}]},graph:{algorithmKey:`graph`,steps:[{id:`structure`,title:`图结构`,description:`图由顶点（节点）和边组成，边可以有方向和权重，常用邻接矩阵或邻接表存储`,codeSnippet:`// 图：顶点 + 边
//    A ──3── B
//    │╲      │
//    1  2    4
//    │   ╲   │
//    C──5── D
//
// 邻接表:
// A → [(B,3), (C,1), (D,2)]
// B → [(A,3), (D,4)]
// C → [(A,1), (D,5)]
// D → [(A,2), (B,4), (C,5)]`,highlightedLine:2,highlightTerms:[`顶点`,`边`,`邻接表`],tips:[`稀疏图用邻接表 O(V+E)，稠密图用邻接矩阵 O(V²)，根据边密度选择`],complexity:{time:`取决于操作`,space:`邻接表 O(V+E)，邻接矩阵 O(V²)`}},{id:`add-node`,title:`添加顶点`,description:`在图中新增一个顶点，初始化其邻接关系为空`,codeSnippet:`function addVertex(graph, id) {
  graph.nodes.push({ id, label: id })
  graph.adjacency[id] = []
  // 新顶点暂无边连接
}`,highlightedLine:3,highlightTerms:[`adjacency`,`push`],tips:[`添加顶点后还需要添加边才能建立节点间的关系`]},{id:`add-edge`,title:`添加边`,description:`在两个顶点之间建立连接，可指定权重，无向图需双向添加`,codeSnippet:`function addEdge(graph, from, to, weight) {
  graph.adjacency[from].push({ node: to, weight })
  // 无向图还需:
  graph.adjacency[to].push({ node: from, weight })
}`,highlightedLine:2,highlightTerms:[`adjacency[from]`,`weight`],tips:[`有向图只需添加一条边，无向图需要添加两条方向相反的边`]},{id:`traversal`,title:`图遍历`,description:`BFS 按层遍历（队列），DFS 沿路径深入（栈/递归），用于搜索和连通性检测`,codeSnippet:`// BFS: 队列 + 已访问集合
// DFS: 栈/递归 + 已访问集合
//
// 从起点出发:
// BFS → 逐层扩展，适合最短路径
// DFS → 深度优先，适合连通分量
//
// 时间复杂度: O(V + E)`,highlightedLine:5,highlightTerms:[`BFS`,`DFS`,`O(V + E)`],tips:[`图的常见算法：BFS/DFS 遍历、Dijkstra 最短路、拓扑排序、最小生成树（Kruskal/Prim）`]}]}},E=`ds-learning-step-`;function D(e){let t=T[e],[n,r]=(0,c.useState)(()=>{let t=localStorage.getItem(E+e),n=t===null?0:parseInt(t,10);return isNaN(n)?0:n}),[i,a]=(0,c.useState)(!1),o=t?.steps||[],s=o.length,l=Math.min(n,Math.max(0,s-1)),u=o[l]||null,d=s>0?(l+1)/s*100:0;return(0,c.useEffect)(()=>{s>0&&localStorage.setItem(E+e,String(l))},[e,l,s]),{currentStep:u,currentStepIndex:l,totalSteps:s,progress:d,isLearning:i,steps:o,nextStep:(0,c.useCallback)(()=>{r(e=>Math.min(e+1,s-1))},[s]),prevStep:(0,c.useCallback)(()=>{r(e=>Math.max(e-1,0))},[]),goToStep:(0,c.useCallback)(e=>{e>=0&&e<s&&r(e)},[s]),reset:(0,c.useCallback)(()=>{r(0)},[]),startLearning:(0,c.useCallback)(()=>{a(!0),r(0)},[]),stopLearning:(0,c.useCallback)(()=>{a(!1),r(0)},[]),hasSteps:s>0}}export{v as a,b as i,w as n,x as r,D as t};