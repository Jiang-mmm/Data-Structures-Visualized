/**
 * v19 M3+ — 中文 locale 聚合层（占位）
 *
 * 当前 M2 阶段为占位文件。M3 阶段将开始将 `src/i18n/locales.ts` 的 zh 对象
 * 按 namespace 拆分为：
 *   - core/ (error / button / status / validate 等)
 *   - page/ (home / arrayPage / sortPage 等 17 个页面)
 *   - component/ (toast / logPanel / quiz 等 16+ 个组件)
 *   - algorithm/ (complexity / algorithms)
 *   - learning/ (31 个学习配置)
 *
 * ⚠️ 严格约束（D2=C）：
 * - locales.ts（根）的 zh 对象在 M3+ 阶段改造为聚合层，**不删除**保持向后兼容
 * - 新增命名空间必须放 `locales/{zh,en}/`，旧位置不再接受新键
 *
 * 状态：M2 占位（无内容），M3 起逐步填充
 */
export {}
