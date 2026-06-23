import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const doublyLinkedListConfig: LearningModeConfig = {
  algorithmKey: 'doublyLinkedList',
  steps: [
    {
      id: 'structure',
      title: tStatic('learningSteps.doublyLinkedList.steps.structure.title'),
      description: tStatic('learningSteps.doublyLinkedList.steps.structure.description'),
      codeSnippet: `class DoublyNode {
  constructor(value) {
    this.value = value
    this.prev = null   // 指向前一个节点
    this.next = null   // 指向后一个节点
  }
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.doublyLinkedList.steps.structure.highlightTerms').split('|'),
      tips: tStatic('learningSteps.doublyLinkedList.steps.structure.tips').split('|'),
      complexity: { time: tStatic('learningSteps.doublyLinkedList.steps.structure.complexityTime'), space: tStatic('learningSteps.doublyLinkedList.steps.structure.complexitySpace') },
    },
    {
      id: 'insert-head',
      title: tStatic('learningSteps.doublyLinkedList.steps.insert-head.title'),
      description: tStatic('learningSteps.doublyLinkedList.steps.insert-head.description'),
      codeSnippet: `function insertHead(value) {
  const node = new DoublyNode(value)
  node.next = this.head
  if (this.head) {
    this.head.prev = node
  }
  this.head = node
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.doublyLinkedList.steps.insert-head.highlightTerms').split('|'),
      tips: tStatic('learningSteps.doublyLinkedList.steps.insert-head.tips').split('|'),
    },
    {
      id: 'insert-tail',
      title: tStatic('learningSteps.doublyLinkedList.steps.insert-tail.title'),
      description: tStatic('learningSteps.doublyLinkedList.steps.insert-tail.description'),
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
      highlightTerms: tStatic('learningSteps.doublyLinkedList.steps.insert-tail.highlightTerms').split('|'),
      tips: tStatic('learningSteps.doublyLinkedList.steps.insert-tail.tips').split('|'),
    },
    {
      id: 'delete',
      title: tStatic('learningSteps.doublyLinkedList.steps.delete.title'),
      description: tStatic('learningSteps.doublyLinkedList.steps.delete.description'),
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
      highlightTerms: tStatic('learningSteps.doublyLinkedList.steps.delete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.doublyLinkedList.steps.delete.tips').split('|'),
    },
    {
      id: 'insert-at',
      title: tStatic('learningSteps.doublyLinkedList.steps.insert-at.title'),
      description: tStatic('learningSteps.doublyLinkedList.steps.insert-at.description'),
      codeSnippet: `function insertAt(index, value) {
  if (index === 0) return insertHead(value)
  const node = new DoublyNode(value)
  let curr = this.head
  for (let i = 0; i < index - 1; i++) {
    curr = curr.next
  }
  node.next = curr.next
  node.prev = curr
  if (curr.next) curr.next.prev = node
  curr.next = node
}`,
      highlightedLine: 8,
      highlightTerms: tStatic('learningSteps.doublyLinkedList.steps.insert-at.highlightTerms').split('|'),
      tips: tStatic('learningSteps.doublyLinkedList.steps.insert-at.tips').split('|'),
    },
    {
      id: 'search',
      title: tStatic('learningSteps.doublyLinkedList.steps.search.title'),
      description: tStatic('learningSteps.doublyLinkedList.steps.search.description'),
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
      highlightTerms: tStatic('learningSteps.doublyLinkedList.steps.search.highlightTerms').split('|'),
      tips: tStatic('learningSteps.doublyLinkedList.steps.search.tips').split('|'),
    },
    {
      id: 'reverse',
      title: tStatic('learningSteps.doublyLinkedList.steps.reverse.title'),
      description: tStatic('learningSteps.doublyLinkedList.steps.reverse.description'),
      codeSnippet: `function reverse() {
  let curr = this.head
  let temp = null
  while (curr) {
    temp = curr.prev
    curr.prev = curr.next
    curr.next = temp
    curr = curr.prev
  }
  if (temp) this.head = temp.prev
}`,
      highlightedLine: 5,
      highlightTerms: tStatic('learningSteps.doublyLinkedList.steps.reverse.highlightTerms').split('|'),
      tips: tStatic('learningSteps.doublyLinkedList.steps.reverse.tips').split('|'),
      complexity: { time: tStatic('learningSteps.doublyLinkedList.steps.reverse.complexityTime'), space: tStatic('learningSteps.doublyLinkedList.steps.reverse.complexitySpace') },
    },
    {
      id: 'detect-cycle',
      title: tStatic('learningSteps.doublyLinkedList.steps.detect-cycle.title'),
      description: tStatic('learningSteps.doublyLinkedList.steps.detect-cycle.description'),
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
      highlightTerms: tStatic('learningSteps.doublyLinkedList.steps.detect-cycle.highlightTerms').split('|'),
      tips: tStatic('learningSteps.doublyLinkedList.steps.detect-cycle.tips').split('|'),
      complexity: { time: tStatic('learningSteps.doublyLinkedList.steps.detect-cycle.complexityTime'), space: tStatic('learningSteps.doublyLinkedList.steps.detect-cycle.complexitySpace') },
    },
  ],
}
