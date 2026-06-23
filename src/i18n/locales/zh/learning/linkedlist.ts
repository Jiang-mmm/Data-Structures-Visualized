/**
 * v20 M7 — learning config "linkedlist" 中文 locale（自动从 src/configs/learning/linkedlist.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const linkedlistLearningSteps = {
  steps: {
    "init": {
      title: '链表结构',
      description: '链表由节点组成，每个节点包含数据和指向下一个节点的指针',
      tips: '链表不需要连续内存，插入/删除只需修改指针，但随机访问需要 O(n)',
      highlightTerms: 'value|next',
      complexityTime: '访问 O(n)，插入/删除 O(1)',
      complexitySpace: 'O(n)',
    },
    "insert-head": {
      title: '头插法',
      description: '将新节点插入到链表头部，新节点指向原头节点',
      tips: '头插法 O(1) 时间复杂度，但会使元素顺序反转',
      highlightTerms: 'node.next|head',
    },
    "insert-tail": {
      title: '尾插法',
      description: '遍历到链表末尾，将新节点连接到最后一个节点之后',
      tips: '维护 tail 指针可以将尾插法优化到 O(1)，但增加维护成本',
      highlightTerms: 'curr.next|while',
    },
    "insert-at": {
      title: '按位置插入',
      description: '遍历到目标位置的前驱节点，将新节点插入到前驱与后继之间',
      tips: '需要处理 index=0 的特殊情况（等价于头插）|时间复杂度 O(n)，因为需要遍历到目标位置',
      highlightTerms: 'node.next|curr.next',
    },
    "delete": {
      title: '删除节点',
      description: '找到目标索引的前驱节点，修改指针跳过目标节点',
      tips: '链表删除的关键是找到前驱节点，然后"跳过"目标节点|删除头节点需要特殊处理，因为没有前驱',
      highlightTerms: 'curr.next.next',
    },
    "search": {
      title: '查找节点',
      description: '从头节点开始遍历，逐个比较节点值，返回匹配的索引',
      tips: '链表查找只能顺序遍历，无法像数组那样随机访问|时间复杂度 O(n)，这是链表相对于数组的主要劣势',
      highlightTerms: 'curr.value === value|while',
    },
    "reverse": {
      title: '反转链表',
      description: '使用三指针法（prev/curr/next）逐个翻转每个节点的指向',
      tips: '三指针法是反转链表的标准做法，时间 O(n)，空间 O(1)|关键：在修改 curr.next 之前，先用 next 保存下一个节点',
      highlightTerms: 'curr.next = prev|prev',
      complexityTime: 'O(n)',
      complexitySpace: 'O(1)',
    },
    "detect-cycle": {
      title: '环检测',
      description: 'Floyd 龟兔算法：快指针每次走两步，慢指针每次走一步，若相遇则存在环',
      tips: 'Floyd 算法时间 O(n)，空间 O(1)，是最优解|若存在环，快慢指针必在环内相遇；若无环，快指针先到达 null|相遇后，将其中一个指针重置到 head，两者同速前进，再次相遇点即为环入口',
      highlightTerms: 'slow === fast|fast.next.next',
      complexityTime: 'O(n)',
      complexitySpace: 'O(1)',
    },
  },
} as const
