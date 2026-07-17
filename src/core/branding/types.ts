/** 应用外壳与登录页共享的品牌展示模型。 */
export interface ShellBranding {
  /** 应用显示名称，来自运行时配置。 */
  name: string
  /** 品牌缩写标记，来自项目编译期配置。 */
  shortName: string
  /** 版本或发行说明文案，来自项目编译期配置。 */
  edition: string
}
