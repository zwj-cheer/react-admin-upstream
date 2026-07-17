/**
 * 编译期品牌标识。应用显示名称唯一来源是 runtime.json 的 `app.name`，
 * 由 `src/app/` 组合层注入各壳层组件；此处只保留无法由运行时配置表达的标识。
 */
export interface ProjectBranding {
  /** 品牌缩写标记（侧边栏/登录页 logo 方块内的短文本，建议 1–3 字符）。 */
  shortName: string
  /** 版本/发行说明文案（显示在品牌名称下方的小字）。 */
  edition: string
}

export const projectBranding: ProjectBranding = {
  shortName: 'AW',
  edition: 'Upstream Template',
}
