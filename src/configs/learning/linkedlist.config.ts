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
    },
    {
      id: 'delete',
      title: '删除节点',
      description: '找到目标节点的前驱节点，修改指针跳过目标节点',
      codeSnippet: `function deleteNode(value) {
  let curr = this.head
  while (curr.next.value !== value) {
    curr = curr.next
  }
  curr.next = curr.next.next
}`,
      highlightedLine: 6,
      highlightTerms: ['curr.next.next'],
    },
  ],
}
