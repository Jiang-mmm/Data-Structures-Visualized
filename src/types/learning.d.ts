/**
 * 学习模式（Learning Mode）类型声明
 *
 * 本文件定义学习模式相关的核心类型，可被项目任意模块引用。
 * 配置文件位于 src/configs/learning/ 目录下。
 */

/**
 * 单个学习步骤的配置
 * 用于描述算法执行过程中的一个步骤，包含代码片段和高亮信息
 */
export interface LearningStep {
  /** 步骤唯一标识，在同一算法内必须唯一，如 'init', 'compare' */
  id: string;

  /** 步骤标题，简短描述该步骤的核心动作 */
  title: string;

  /** 步骤详细描述，说明该步骤在算法中的作用 */
  description: string;

  /** 代码片段，展示该步骤对应的伪代码或实际代码 */
  codeSnippet: string;

  /** 需要高亮显示的行号，从 1 开始计数 */
  highlightedLine: number;

  /** 高亮关键词列表，用于 UI 视觉强调 */
  highlightTerms: string[];

  /** 可选的学习提示或常见陷阱，帮助加深理解 */
  tips?: string[];

  /** 可选的复杂度信息，如 { time: 'O(n²)', space: 'O(1)' } */
  complexity?: { time?: string; space?: string };
}

/**
 * 算法学习模式的完整配置
 * 包含算法标识符和该算法的所有学习步骤
 */
export interface LearningModeConfig {
  /** 算法标识，与 useLearningMode() 的参数对应 */
  algorithmKey: string;

  /** 该算法的所有学习步骤，按教学顺序排列 */
  steps: LearningStep[];
}
