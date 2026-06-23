/**
 * v20 M7 — learning config "doublyLinkedList" 中文 locale（自动从 src/configs/learning/doublyLinkedList.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const doublyLinkedListLearningSteps = {
  steps: {
    "structure": {
      title: '双向链表结构',
      description: '每个节点包含数据、指向前驱的 prev 指针和指向后继的 next 指针',
      tips: '双向链表比单链表多一个指针，但支持反向遍历和 O(1) 删除已知节点',
      highlightTerms: 'prev|next',
      complexityTime: '访问 O(n)，插入/删除 O(1)',
      complexitySpace: 'O(n)',
    },
    "insert-head": {
      title: '头插法',
      description: '新节点的 next 指向原头节点，原头节点的 prev 指向新节点，然后更新头指针',
      tips: '头插法需要处理链表为空的特殊情况（head 为 null）',
      highlightTerms: 'this.head.prev|node',
    },
    "insert-tail": {
      title: '尾插法',
      description: '遍历到链表末尾，将新节点连接到尾部，并建立双向指针关系',
      tips: '维护 tail 指针可以将尾插法优化到 O(1)，双向链表更容易维护',
      highlightTerms: 'node.prev|curr',
    },
    "delete": {
      title: '删除节点',
      description: '找到目标节点，将其前驱的 next 指向后继，后继的 prev 指向前驱',
      tips: '双向链表删除不需要找前驱节点，因为节点自带 prev 指针',
      highlightTerms: 'curr.prev.next|curr.next.prev',
    },
    "insert-at": {
      title: '按位置插入',
      description: '遍历到目标位置，建立新节点与前驱、后继的双向指针关系',
      tips: '双向链表插入需要维护 4 个指针（2 个方向 × 2 个节点），比单链表多 2 个',
      highlightTerms: 'node.prev|curr.next.prev',
    },
    "search": {
      title: '查找节点',
      description: '从头节点遍历，逐个比较节点值。双向链表也可从尾部反向查找',
      tips: '双向链表查找复杂度与单链表相同 O(n)，但支持双向遍历',
      highlightTerms: 'curr.value === value|while',
    },
    "reverse": {
      title: '反转双向链表',
      description: '交换每个节点的 prev 和 next 指针，最后更新头指针',
      tips: '双向链表反转比单链表简单：直接交换每个节点的 prev/next|注意遍历方向：交换后 curr.next 变成了原 prev，所以用 curr.prev 前进',
      highlightTerms: 'curr.prev|curr.next',
      complexityTime: 'O(n)',
      complexitySpace: 'O(1)',
    },
    "detect-cycle": {
      title: '环检测',
      description: 'Floyd 龟兔算法同样适用于双向链表，快慢指针相遇即存在环',
      tips: '环检测算法与单链表完全一致，因为环只涉及 next 指针',
      highlightTerms: 'slow === fast|fast.next.next',
      complexityTime: 'O(n)',
      complexitySpace: 'O(1)',
    },
  },
} as const
