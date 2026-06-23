/**
 * v20 M7 — learning config "array" 中文 locale（自动从 src/configs/learning/array.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const arrayLearningSteps = {
  steps: {
    "structure": {
      title: '数组结构',
      description: '数组在内存中连续存储，每个元素通过索引直接访问，支持 O(1) 随机读取',
      tips: '数组的连续存储使得缓存命中率高，这是数组遍历速度快的根本原因',
      highlightTerms: '索引|连续',
      complexityTime: '随机访问 O(1)',
      complexitySpace: 'O(n)',
    },
    "insert": {
      title: '插入操作',
      description: '在指定位置插入元素，需要将该位置之后的所有元素向后移动一位，时间复杂度 O(n)',
      tips: '尾部插入 O(1)，中间/头部插入 O(n)，这是数组的主要劣势',
      highlightTerms: 'arr[i - 1]|后移',
    },
    "delete": {
      title: '删除操作',
      description: '删除指定位置的元素，需要将该位置之后的所有元素向前移动一位，时间复杂度 O(n)',
      tips: '删除时如果不关心顺序，可以用 arr[i] = arr[arr.length-1] 来 O(1) 删除',
      highlightTerms: 'arr[i + 1]|前移',
    },
    "search": {
      title: '查找操作',
      description: '线性查找逐个比较元素，时间复杂度 O(n)；若数组有序可用二分查找 O(log n)',
      tips: '数组是最基础的数据结构，几乎所有其他数据结构都建立在数组之上',
      highlightTerms: 'arr[i] === target|O(n)',
    },
    "searchAll": {
      title: '查找全部',
      description: '线性查找收集所有匹配项的索引，时间复杂度 O(n)。适用于重复元素的场景',
      tips: '查找全部仍为 O(n)，无法利用有序性加速，因为需要检查每个元素',
      highlightTerms: 'indices.push(i)|O(n)',
    },
    "binarySearch": {
      title: '二分查找',
      description: '要求数组升序有序。每次比较中点元素，将搜索范围缩小一半，时间复杂度 O(log n)',
      tips: '二分查找的前提是数组有序，否则结果不可靠|每次迭代范围减半：n → n/2 → n/4 → ... → 1，共 log₂(n) 步|mid = (lo + hi) >> 1 等价于 Math.floor((lo + hi) / 2)，位运算更快',
      highlightTerms: 'mid = (lo + hi) >> 1|O(log n)',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(1)',
    },
  },
} as const
