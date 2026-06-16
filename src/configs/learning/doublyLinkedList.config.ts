import type { LearningModeConfig } from './types'

export const doublyLinkedListConfig: LearningModeConfig = {
  algorithmKey: 'doublyLinkedList',
  steps: [
    {
      id: 'structure',
      title: '双向链表结构',
      description: '每个节点包含数据、指向前驱的 prev 指针和指向后继的 next 指针',
      codeSnippet: `class DoublyNode {
  constructor(value) {
    this.value = value
    this.prev = null   // 指向前一个节点
    this.next = null   // 指向后一个节点
  }
}`,
      highlightedLine: 4,
      highlightTerms: ['prev', 'next'],
      tips: ['双向链表比单链表多一个指针，但支持反向遍历和 O(1) 删除已知节点'],
      complexity: { time: '访问 O(n)，插入/删除 O(1)', space: 'O(n)' },
    },
    {
      id: 'insert-head',
      title: '头插法',
      description: '新节点的 next 指向原头节点，原头节点的 prev 指向新节点，然后更新头指针',
      codeSnippet: `function insertHead(value) {
  const node = new DoublyNode(value)
  node.next = this.head
  if (this.head) {
    this.head.prev = node
  }
  this.head = node
}`,
      highlightedLine: 4,
      highlightTerms: ['this.head.prev', 'node'],
      tips: ['头插法需要处理链表为空的特殊情况（head 为 null）'],
    },
    {
      id: 'insert-tail',
      title: '尾插法',
      description: '遍历到链表末尾，将新节点连接到尾部，并建立双向指针关系',
      codeSnippet: `function insertTail(value) {
  const node = new DoublyNode(value)
  let curr = this.head
  while (curr.next) {
    curr = curr.next
  }
  curr.next = node
  node.prev = curr
}`,
      highlightedLine: 6,
      highlightTerms: ['node.prev', 'curr'],
      tips: ['维护 tail 指针可以将尾插法优化到 O(1)，双向链表更容易维护'],
    },
    {
      id: 'delete',
      title: '删除节点',
      description: '找到目标节点，将其前驱的 next 指向后继，后继的 prev 指向前驱',
      codeSnippet: `function deleteNode(value) {
  let curr = this.head
  while (curr && curr.value !== value) {
    curr = curr.next
  }
  if (!curr) return
  if (curr.prev) curr.prev.next = curr.next
  if (curr.next) curr.next.prev = curr.prev
  if (curr === this.head) this.head = curr.next
}`,
      highlightedLine: 6,
      highlightTerms: ['curr.prev.next', 'curr.next.prev'],
      tips: ['双向链表删除不需要找前驱节点，因为节点自带 prev 指针'],
    },
  ],
}
