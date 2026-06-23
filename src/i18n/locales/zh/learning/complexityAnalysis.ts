/**
 * v20 M7 — learning config "complexityAnalysis" 中文 locale（自动从 src/configs/learning/complexityAnalysis.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const complexityAnalysisLearningSteps = {
  steps: {
    "concept": {
      title: '时间复杂度概念',
      description: '时间复杂度衡量算法运行时间随输入规模增长的趋势，而非具体执行时间，便于横向比较算法效率',
      tips: '时间复杂度是"增长趋势"而非"实际耗时"，O(n) 的算法在 n 小时可能比 O(log n) 还慢（常数项影响）',
      highlightTerms: 'O(n)|趋势|输入规模',
      complexityTime: '分析框架',
      complexitySpace: 'O(1)',
    },
    "bigO": {
      title: '大O表示法',
      description: '大O表示法描述算法上界，常见复杂度从优到劣：O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)',
      tips: 'O(log n) 意味着每轮把问题规模减半，2³² 个元素只需 32 次操作即可定位',
      highlightTerms: 'O(1)|O(log n)|O(n)|O(n²)',
    },
    "space": {
      title: '空间复杂度',
      description: '空间复杂度衡量算法运行过程中额外占用的内存随输入规模增长的趋势，包括辅助变量、递归栈、动态分配的结构',
      tips: '递归算法的空间复杂度要算上调用栈，深度为 d 的递归占用 O(d) 空间',
      highlightTerms: 'O(1)|O(n)|O(log n)|递归栈',
    },
    "cases": {
      title: '最好/最坏/平均情况',
      description: '同一算法在不同输入下表现不同。快速排序最坏 O(n²)（已排序输入），平均 O(n log n)；查找最好 O(1)（首元素命中），最坏 O(n)',
      tips: '工程实践中更关注平均情况，因为最坏情况往往需要特殊构造的输入；但实时系统需考虑最坏情况',
      highlightTerms: '最好情况|最坏情况|平均情况',
    },
    "amortized": {
      title: '均摊分析',
      description: '均摊分析评估一系列操作的总代价除以操作次数。动态数组扩容单次 O(n)，但 n 次插入均摊 O(1)，因为扩容频率随规模递减',
      tips: '均摊分析的三种方法：聚合法（求和平均）、记账法（预存代价）、势能法（势能函数）',
      highlightTerms: '均摊|O(1)|扩容',
      complexityTime: '均摊 O(1)',
      complexitySpace: 'O(n)',
    },
  },
} as const
