import type { LearningModeConfig } from './types'

/**
 * 排序对比页学习配置
 *
 * 引导用户理解多种排序算法的差异：
 * 1. 选择算法 — 理解每种算法的适用场景
 * 2. 初始化数组 — 观察同一数据集下不同算法的表现
 * 3. 第一轮比较 — 对比冒泡/选择/插入的初始行为
 * 4. 关键差异 — 时间复杂度与交换次数的差异
 * 5. 完成对比 — 综合评估各算法性能
 */
export const sortCompareConfig: LearningModeConfig = {
  algorithmKey: 'sortCompare',
  steps: [
    {
      id: 'select',
      title: '选择算法',
      description:
        '从顶部算法列表中选择 2~3 种排序算法进行对比。建议选择不同复杂度的算法（如冒泡 O(n²)、归并 O(n log n)、堆 O(n log n)），以便观察性能差异。',
      codeSnippet: `// 可选算法（12 种）
const algorithms = [
  'bubble',    // O(n²)    稳定
  'selection', // O(n²)    不稳定
  'insertion', // O(n²)    稳定
  'quick',     // O(n log n) 不稳定
  'merge',     // O(n log n) 稳定
  'heap',      // O(n log n) 不稳定
  // ... 更多
]`,
      highlightedLine: 2,
      highlightTerms: ['bubble', 'quick', 'merge', 'heap'],
      tips: [
        '稳定排序（冒泡、插入、归并）保持相等元素的相对顺序',
        '不稳定排序（选择、快排、堆）不保证相等元素的相对顺序',
      ],
      complexity: { time: 'O(n²) ~ O(n log n)', space: 'O(1) ~ O(n)' },
    },
    {
      id: 'init',
      title: '初始化数组',
      description:
        '点击「随机生成」按钮创建一个新的随机数组。所有选中的算法将使用同一份数据进行排序，确保对比公平。数组长度固定为 15 个元素（值范围 5~99）。',
      codeSnippet: `// 所有算法共享同一份数据
const data = Array.from({ length: 15 }, () =>
  Math.floor(Math.random() * 95) + 5
)

// 每个算法独立拷贝，互不影响
const arr1 = [...data] // bubble
const arr2 = [...data] // merge
const arr3 = [...data] // heap`,
      highlightedLine: 2,
      highlightTerms: ['data', '[...data]'],
      tips: ['使用同一份数据确保对比公平，避免数据差异影响结论'],
    },
    {
      id: 'firstRound',
      title: '第一轮比较',
      description:
        '点击「全部运行」后，所有算法并行执行。观察第一轮比较时的差异：冒泡排序比较相邻元素并逐步交换；选择排序先扫描全数组找最小值；插入排序将元素逐个插入已排序区。',
      codeSnippet: `// 冒泡：比较相邻元素
if (arr[j] > arr[j + 1]) swap(arr, j, j + 1)

// 选择：找最小值索引
if (arr[j] < arr[minIdx]) minIdx = j

// 插入：向左查找插入位置
while (j >= 0 && arr[j] > key) {
  arr[j + 1] = arr[j]
  j--
}`,
      highlightedLine: 2,
      highlightTerms: ['arr[j]', 'minIdx', 'key'],
      tips: [
        '冒泡排序每轮最多交换 n-1 次',
        '选择排序每轮最多交换 1 次',
        '插入排序对近乎有序的数据效率最高',
      ],
      complexity: { time: 'O(n²)', space: 'O(1)' },
    },
    {
      id: 'keyDiff',
      title: '关键差异',
      description:
        '观察每个算法面板顶部的比较次数（C）和交换次数（S）。冒泡排序交换次数最多；选择排序交换次数最少但比较次数多；归并和快排的比较次数显著少于 O(n²) 算法。',
      codeSnippet: `// 比较次数 vs 交换次数
算法         | 比较       | 交换
-------------|-----------|--------
冒泡 O(n²)   | ~n²/2     | ~n²/2
选择 O(n²)   | ~n²/2     | ≤ n
归并 O(nlogn)| ~nlogn    | ~nlogn
快排 O(nlogn)| ~nlogn    | ~nlogn
堆   O(nlogn)| ~2nlogn   | ~nlogn`,
      highlightedLine: 2,
      highlightTerms: ['比较', '交换', 'n²/2', 'nlogn'],
      tips: [
        '比较次数（C）反映算法的比较操作总量',
        '交换次数（S）反映算法的数据移动总量',
        '实际性能取决于两者之和及缓存友好性',
      ],
      complexity: { time: 'O(n²) vs O(n log n)', space: 'O(1) vs O(n)' },
    },
    {
      id: 'complete',
      title: '完成对比',
      description:
        '所有算法完成后，底部显示性能对比图表。对比柱状图直观展示各算法的比较次数和交换次数差异。可导出 CSV/JSON 数据用于课后分析。结论：O(n log n) 算法在数据量增大时优势明显。',
      codeSnippet: `// 性能对比结论
1. 数据量 n < 20：插入排序可能最快（常数因子小）
2. 数据量 n > 50：O(n log n) 算法显著领先
3. 稳定性需求：选择归并排序（稳定 + O(n log n)）
4. 内存受限：选择堆排序（O(1) 额外空间）
5. 平均最快：快速排序（常数因子最小）`,
      highlightedLine: 2,
      highlightTerms: ['n < 20', 'n > 50', 'O(n log n)'],
      tips: [
        '实际工程中常使用 TimSort（Python/Java 默认），结合了归并和插入排序的优点',
        '没有「最好」的排序算法，只有「最适合场景」的排序算法',
      ],
      complexity: { time: 'O(n log n) 最优', space: 'O(1) ~ O(n)' },
    },
  ],
}
