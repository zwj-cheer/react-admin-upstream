import { QueryClient } from '@tanstack/react-query'
import { AuthService } from '@/core/auth/authService'
import { configureOidc, getOidcAccessToken } from '@/core/auth/oidcAuth'
import type { RuntimeConfig } from '@/core/config/runtimeConfig.schema'
import type { Services } from '@/core/services/contracts'
import { createProjectServices } from '@/project/services'

/** 应用级运行时对象；只允许由 composition root 创建一次。 */
export interface AppRuntime {
  /** TanStack Query 的全局缓存客户端。 */
  queryClient: QueryClient
  /** 认证、用户、角色、菜单等服务端口实现。 */
  services: Services
  /** 认证会话协调器。 */
  authService: AuthService
}

/** 创建带统一默认策略的 QueryClient。测试应为每个用例创建独立实例。 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 15_000,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * 创建单次应用运行时。该函数位于 app 组合层，集中连接 project、adapter 与 core；
 * React 组件只消费这里创建好的实例，不在 render/useMemo/effect 中执行应用初始化。
 */
export function createAppRuntime(config: RuntimeConfig): AppRuntime {
  configureOidc(config)
  const queryClient = createQueryClient()
  const services = createProjectServices(config, getOidcAccessToken)
  return {
    queryClient,
    services,
    authService: new AuthService(config, services, queryClient),
  }
}

/** 启动必须覆盖整个应用生命周期的订阅，并返回首次会话恢复 Promise。 */
export function startAppRuntime(runtime: AppRuntime): Promise<void> {
  runtime.authService.start()
  return runtime.authService.restore()
}
