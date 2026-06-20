/**
 * 可视化器共享常量
 *
 * 提取各 visualizer 中值相同且语义一致的尺寸/时长常量,避免重复定义。
 * 仅包含跨多个 visualizer 完全相同的常量;值不同或语义不同的常量保留在各 visualizer 内。
 */

/** 树形结构节点半径（tree / avlTree / trie / heap 共用） */
export const DEFAULT_NODE_RADIUS = 22

/** 树形结构层级高度（tree / avlTree 共用） */
export const DEFAULT_LEVEL_HEIGHT = 80
