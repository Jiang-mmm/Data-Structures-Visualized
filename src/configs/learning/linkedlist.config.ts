import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const linkedlistConfig: LearningModeConfig = {
  algorithmKey: 'linkedlist',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.linkedlist.steps.init.title'),
      description: tStatic('learningSteps.linkedlist.steps.init.description'),
      codeSnippet: `class Node {
  constructor(value) {
    this.value = value
    this.next = null
  }
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.linkedlist.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.linkedlist.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.linkedlist.steps.init.complexityTime'), space: tStatic('learningSteps.linkedlist.steps.init.complexitySpace') },
    },
    {
      id: 'insert-head',
      title: tStatic('learningSteps.linkedlist.steps.insert-head.title'),
      description: tStatic('learningSteps.linkedlist.steps.insert-head.description'),
      codeSnippet: `function insertHead(value) {
  const node = new Node(value)
  node.next = this.head
  this.head = node
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.linkedlist.steps.insert-head.highlightTerms').split('|'),
      tips: tStatic('learningSteps.linkedlist.steps.insert-head.tips').split('|'),
    },
    {
      id: 'insert-tail',
      title: tStatic('learningSteps.linkedlist.steps.insert-tail.title'),
      description: tStatic('learningSteps.linkedlist.steps.insert-tail.description'),
      codeSnippet: `function insertTail(value) {
  const node = new Node(value)
  let curr = this.head
  while (curr.next) curr = curr.next
  curr.next = node
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.linkedlist.steps.insert-tail.highlightTerms').split('|'),
      tips: tStatic('learningSteps.linkedlist.steps.insert-tail.tips').split('|'),
    },
    {
      id: 'insert-at',
      title: tStatic('learningSteps.linkedlist.steps.insert-at.title'),
      description: tStatic('learningSteps.linkedlist.steps.insert-at.description'),
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
      highlightTerms: tStatic('learningSteps.linkedlist.steps.insert-at.highlightTerms').split('|'),
      tips: tStatic('learningSteps.linkedlist.steps.insert-at.tips').split('|'),
    },
    {
      id: 'delete',
      title: tStatic('learningSteps.linkedlist.steps.delete.title'),
      description: tStatic('learningSteps.linkedlist.steps.delete.description'),
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
      highlightTerms: tStatic('learningSteps.linkedlist.steps.delete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.linkedlist.steps.delete.tips').split('|'),
    },
    {
      id: 'search',
      title: tStatic('learningSteps.linkedlist.steps.search.title'),
      description: tStatic('learningSteps.linkedlist.steps.search.description'),
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
      highlightTerms: tStatic('learningSteps.linkedlist.steps.search.highlightTerms').split('|'),
      tips: tStatic('learningSteps.linkedlist.steps.search.tips').split('|'),
    },
    {
      id: 'reverse',
      title: tStatic('learningSteps.linkedlist.steps.reverse.title'),
      description: tStatic('learningSteps.linkedlist.steps.reverse.description'),
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
      highlightTerms: tStatic('learningSteps.linkedlist.steps.reverse.highlightTerms').split('|'),
      tips: tStatic('learningSteps.linkedlist.steps.reverse.tips').split('|'),
      complexity: { time: tStatic('learningSteps.linkedlist.steps.reverse.complexityTime'), space: tStatic('learningSteps.linkedlist.steps.reverse.complexitySpace') },
    },
    {
      id: 'detect-cycle',
      title: tStatic('learningSteps.linkedlist.steps.detect-cycle.title'),
      description: tStatic('learningSteps.linkedlist.steps.detect-cycle.description'),
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
      highlightTerms: tStatic('learningSteps.linkedlist.steps.detect-cycle.highlightTerms').split('|'),
      tips: tStatic('learningSteps.linkedlist.steps.detect-cycle.tips').split('|'),
      complexity: { time: tStatic('learningSteps.linkedlist.steps.detect-cycle.complexityTime'), space: tStatic('learningSteps.linkedlist.steps.detect-cycle.complexitySpace') },
    },
  ],
}
