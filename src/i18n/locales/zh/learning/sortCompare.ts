/**
 * v20 M7 — learning config "sortCompare" 中文 locale（自动从 src/configs/learning/sortCompare.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const sortCompareLearningSteps = {
  steps: {
    "select": {
      title: '选择算法',
      description: '从顶部算法列表中选择 2~3 种排序算法进行对比。建议选择不同复杂度的算法（如冒泡 O(n²)、归并 O(n log n)、堆 O(n log n)），以便观察性能差异。',
      tips: '稳定排序（冒泡、插入、归并）保持相等元素的相对顺序|不稳定排序（选择、快排、堆）不保证相等元素的相对顺序',
      highlightTerms: 'bubble|quick|merge|heap',
      complexityTime: 'O(n²) ~ O(n log n)',
      complexitySpace: 'O(1) ~ O(n)',
    },
    "init": {
      title: '初始化数组',
      description: '点击「随机生成」按钮创建一个新的随机数组。所有选中的算法将使用同一份数据进行排序，确保对比公平。数组长度固定为 15 个元素（值范围 5~99）。',
      tips: '使用同一份数据确保对比公平，避免数据差异影响结论',
      highlightTerms: 'data|[...data]',
    },
    "firstRound": {
      title: '第一轮比较',
      description: '点击「全部运行」后，所有算法并行执行。观察第一轮比较时的差异：冒泡排序比较相邻元素并逐步交换；选择排序先扫描全数组找最小值；插入排序将元素逐个插入已排序区。',
      tips: '冒泡排序每轮最多交换 n-1 次|选择排序每轮最多交换 1 次|插入排序对近乎有序的数据效率最高',
      highlightTerms: 'arr[j]|minIdx|key',
      complexityTime: 'O(n²)',
      complexitySpace: 'O(1)',
    },
    "keyDiff": {
      title: '关键差异',
      description: '观察每个算法面板顶部的比较次数（C）和交换次数（S）。冒泡排序交换次数最多；选择排序交换次数最少但比较次数多；归并和快排的比较次数显著少于 O(n²) 算法。',
      tips: '比较次数（C）反映算法的比较操作总量|交换次数（S）反映算法的数据移动总量|实际性能取决于两者之和及缓存友好性',
      highlightTerms: '比较|交换|n²/2|nlogn',
      complexityTime: 'O(n²) vs O(n log n)',
      complexitySpace: 'O(1) vs O(n)',
    },
    "complete": {
      title: '完成对比',
      description: '所有算法完成后，底部显示性能对比图表。对比柱状图直观展示各算法的比较次数和交换次数差异。可导出 CSV/JSON 数据用于课后分析。结论：O(n log n) 算法在数据量增大时优势明显。',
      tips: '实际工程中常使用 TimSort（Python/Java 默认），结合了归并和插入排序的优点|没有「最好」的排序算法，只有「最适合场景」的排序算法',
      highlightTerms: 'n < 20|n > 50|O(n log n)',
      complexityTime: 'O(n log n) 最优',
      complexitySpace: 'O(1) ~ O(n)',
    },
  },
} as const
