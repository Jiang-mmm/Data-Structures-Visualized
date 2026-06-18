/**
 * 可视化布局公共工具函数
 * 提供 SVG viewBox 尺寸解析和居中坐标计算,确保各 visualizer 响应式布局一致性
 */

/**
 * 将值钳制为非负数
 * @param value 输入值
 * @returns Math.max(0, value)
 */
export function clampNonNegative(value: number): number {
  return Math.max(0, value)
}

/**
 * 从 SVG viewBox 属性解析实际坐标系尺寸
 * 当 viewBox 无效或不存在时,回退到 fallback 值
 *
 * SVG 使用 viewBox 坐标系(而非 width/height 属性)配合 CSS w-full/h-full,
 * 因此渲染时应基于 viewBox 尺寸计算定位,而非 options 传入的像素尺寸。
 *
 * @param svg SVG 元素
 * @param fallbackW 回退宽度(当 viewBox 无效时使用)
 * @param fallbackH 回退高度(当 viewBox 无效时使用)
 * @returns { width, height } 坐标系尺寸
 */
export function getViewBoxSize(
  svg: SVGSVGElement,
  fallbackW: number,
  fallbackH: number
): { width: number; height: number } {
  const vb = svg.getAttribute('viewBox')
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(Number)
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      return { width: parts[2], height: parts[3] }
    }
  }
  return { width: fallbackW, height: fallbackH }
}

/**
 * 计算居中起始坐标
 * 公式: (containerSize - totalSize) / 2,并钳制为非负值
 *
 * 当内容尺寸超过容器尺寸时,返回 0(左对齐/顶对齐),避免负坐标导致元素溢出可视区域。
 *
 * @param totalSize 内容总尺寸(宽度或高度)
 * @param containerSize 容器尺寸(SVG viewBox 宽度或高度)
 * @returns 居中起始坐标,最小为 0
 */
export function calculateCenterStart(totalSize: number, containerSize: number): number {
  return clampNonNegative((containerSize - totalSize) / 2)
}
