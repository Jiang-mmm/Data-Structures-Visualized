import type { LearningModeConfig } from './types'

export const linkedlistConfig: LearningModeConfig = {
  algorithmKey: 'linkedlist',
  steps: [
    {
      id: 'init',
      title: '链表结构',
      description: '链表由节点组成，每个节点包含数据和指向下一个节点的指针',
      codeSnippet: `class Node {
  constructor(value) {
    this.value = value
    this.next = null
  }
}`,
      highlightedLine: 3,
      highlightTerms: ['value', 'next'],
      tips: ['链表不需要连续内存，插入/删除只需修改指针，但随机访问需要 O(n)'],
      complexity: { time: '访问 O(n)，插入/删除 O(1)', space: 'O(n)' },
    },
    {
      id: 'insert-head',
      title: '头插法',
      description: '将新节点插入到链表头部，新节点指向原头节点',
      codeSnippet: `function insertHead(value) {
  const node = new Node(value)
  node.next = this.head
  this.head = node
}`,
      highlightedLine: 3,
      highlightTerms: ['node.next', 'head'],
      tips: ['头插法 O(1) 时间复杂度，但会使元素顺序反转'],
    },
    {
      id: 'insert-tail',
      title: '尾插法',
      description: '遍历到链表末尾，将新节点连接到最后一个节点之后',
      codeSnippet: `function insertTail(value) {
  const node = new Node(value)
  let curr = this.head
  while (curr.next) curr = curr.next
  curr.next = node
}`,
      highlightedLine: 4,
      highlightTerms: ['curr.next', 'while'],
      tips: ['维护 tail 指针可以将尾插法优化到 O(1)，但增加维护成本'],
    },
    {
      id: 'insert-at',
      title: '按位置插入',
      description: '遍历到目标位置的前驱节点，将新节点插入到前驱与后继之间',
      codeSnippet: `function insertAt(index, value) {
  if (index === 0) return insertHead(value)
  const node = new Node(value)
  let curr = this.head
  for (let i = 0; i < index - 1; i++) {
    curr = curr.next
  }
  node.next = curr.next
  curr.next = node
}`,
      highlightedLine: 7,
      highlightTerms: ['node.next', 'curr.next'],
      tips: [
        '需要处理 index=0 的特殊情况（等价于头插）',
        '时间复杂度 O(n)，因为需要遍历到目标位置',
      ],
    },
    {
      id: 'delete',
      title: '删除节点',
      description: '找到目标索引的前驱节点，修改指针跳过目标节点',
      codeSnippet: `function deleteAt(index) {
  if (index === 0) {
    this.head = this.head.next
    return
  }
  let curr = this.head
  for (let i = 0; i < index - 1; i++) {
    curr = curr.next
  }
  curr.next = curr.next.next
}`,
      highlightedLine: 8,
      highlightTerms: ['curr.next.next'],
      tips: [
        '链表删除的关键是找到前驱节点，然后"跳过"目标节点',
        '删除头节点需要特殊处理，因为没有前驱',
      ],
    },
    {
      id: 'search',
      title: '查找节点',
      description: '从头节点开始遍历，逐个比较节点值，返回匹配的索引',
      codeSnippet: `function search(value) {
  let curr = this.head
  let index = 0
  while (curr) {
    if (curr.value === value) return index
    curr = curr.next
    index++
  }
  return -1
}`,
      highlightedLine: 5,
      highlightTerms: ['curr.value === value', 'while'],
      tips: [
        '链表查找只能顺序遍历，无法像数组那样随机访问',
        '时间复杂度 O(n)，这是链表相对于数组的主要劣势',
      ],
    },
    {
      id: 'reverse',
      title: '反转链表',
      description: '使用三指针法（prev/curr/next）逐个翻转每个节点的指向',
      codeSnippet: `function reverse() {
  let prev = null
  let curr = this.head
  while (curr) {
    const next = curr.next
    curr.next = prev
    prev = curr
    curr = next
  }
  this.head = prev
}`,
      highlightedLine: 4,
      highlightTerms: ['curr.next = prev', 'prev'],
      tips: [
        '三指针法是反转链表的标准做法，时间 O(n)，空间 O(1)',
        '关键：在修改 curr.next 之前，先用 next 保存下一个节点',
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
    {
      id: 'detect-cycle',
      title: '环检测',
      description: 'Floyd 龟兔算法：快指针每次走两步，慢指针每次走一步，若相遇则存在环',
      codeSnippet: `function hasCycle() {
  let slow = this.head
  let fast = this.head
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) return true
  }
  return false
}`,
      highlightedLine: 6,
      highlightTerms: ['slow === fast', 'fast.next.next'],
      tips: [
        'Floyd 算法时间 O(n)，空间 O(1)，是最优解',
        '若存在环，快慢指针必在环内相遇；若无环，快指针先到达 null',
        '相遇后，将其中一个指针重置到 head，两者同速前进，再次相遇点即为环入口',
      ],
      complexity: { time: 'O(n)', space: 'O(1)' },
    },
  ],
}
