/**
 * 轻量级模糊匹配工具
 *
 * 基于字符顺序的最长公共子序列（LCS）思想打分：
 * - 查询串中的每个字符按顺序在目标串中出现即可得分
 * - 连续匹配（bonus）和首字符匹配（start bonus）获得额外加分
 * - 不匹配字符会轻微惩罚，但不会导致完全失败（除非查询字符全部未出现）
 *
 * 复杂度：O(query.length × text.length)，适用于短查询（≤20）和短文本（≤100）。
 */

export interface FuzzyMatchResult {
  /** 是否匹配 */
  matched: boolean
  /** 分数，越高越靠前 */
  score: number
}

const CONSECUTIVE_MATCH_BONUS = 8
const START_MATCH_BONUS = 6
const BASE_MATCH_SCORE = 10
const MISS_PENALTY = 1
const CASE_MISMATCH_PENALTY = 2

/**
 * 对单个目标文本执行模糊匹配
 */
export function fuzzyMatch(query: string, text: string): FuzzyMatchResult {
  if (!query) {
    return { matched: true, score: 0 }
  }

  const lowerQuery = query.toLowerCase()
  const lowerText = text.toLowerCase()

  let queryIndex = 0
  let score = 0
  let lastMatchIndex = -1

  for (let textIndex = 0; textIndex < lowerText.length && queryIndex < lowerQuery.length; textIndex++) {
    if (lowerText[textIndex] === lowerQuery[queryIndex]) {
      score += BASE_MATCH_SCORE

      // 首字符匹配奖励
      if (textIndex === 0) {
        score += START_MATCH_BONUS
      }

      // 连续匹配奖励
      if (lastMatchIndex !== -1 && textIndex === lastMatchIndex + 1) {
        score += CONSECUTIVE_MATCH_BONUS
      }

      // 大小写精确匹配额外奖励
      if (text[textIndex] === query[queryIndex]) {
        score += 1
      }

      lastMatchIndex = textIndex
      queryIndex++
    } else if (lastMatchIndex !== -1) {
      // 已经开始匹配后，未匹配字符给予轻微惩罚
      score -= MISS_PENALTY
    }
  }

  // 大小写不一致的查询给予轻微惩罚
  if (lowerQuery !== query) {
    score -= CASE_MISMATCH_PENALTY
  }

  const matched = queryIndex === lowerQuery.length

  // 未完全匹配时，按已匹配比例给分但大幅降级
  if (!matched) {
    const coverage = queryIndex / lowerQuery.length
    return { matched: coverage >= 0.6, score: Math.floor(score * coverage * coverage) }
  }

  return { matched: true, score: Math.max(0, score) }
}

/**
 * 对一组候选文本执行模糊匹配，返回最佳分数
 */
export function fuzzyMatchAny(query: string, texts: string[]): FuzzyMatchResult {
  let best: FuzzyMatchResult = { matched: false, score: 0 }

  for (const text of texts) {
    const result = fuzzyMatch(query, text)
    if (result.matched && result.score > best.score) {
      best = result
    }
  }

  return best
}
