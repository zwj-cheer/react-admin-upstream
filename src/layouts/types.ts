import type { RegisteredRoute } from '@/core/routing'

/** 已解析为可展示路由的侧边栏导航项。 */
export interface ShellNavigationItem {
  /** 后端菜单记录的稳定标识。 */
  menuId: string
  /** 菜单树深度，用于视觉缩进。 */
  depth: number
  /** 已完成权限过滤和 routeKey 关联的路由元数据。 */
  route: RegisteredRoute
}
