import { Toaster as SonnerToaster } from 'sonner'

/**
 * 全局 toast 容器。弃用 sonner `richColors`（内置配色与令牌体系脱节），
 * 颜色由 `components.css` 的 `[data-sonner-toast]` 规则挂 tokens.css 令牌：
 * 默认走 `--card`/`--t1`/`--border`，success/error/warning/info 走
 * `--Xxx-light` 底 + 主色字，light/dark/system 随令牌自动切换。
 */
export function Toaster() {
  return <SonnerToaster position="top-center" closeButton />
}
