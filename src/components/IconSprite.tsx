import type { SVGProps } from 'react'
import { cn } from '@/core/utils'

export interface IconSpriteProps extends SVGProps<SVGSVGElement> {
  /**
   * 图标名（sprite symbol id 去掉 `icon-` 前缀），接受任意运行时字符串。
   * 仅用于图标名来自运行时数据的场景（菜单树、路由注册表等）；
   * 代码里写死的图标一律用 `@/components/ui/icon` 的 `Icon`（字面量联合，编译期校验）。
   */
  name: string
}

/**
 * 运行时动态图标入口，渲染 `public/icons.svg` sprite。
 * 尺寸随字号（1em × 1em，见 `base.css` 的 `.icon-sprite`），颜色为 `currentColor`。
 */
export function IconSprite({ name, className, ...props }: IconSpriteProps) {
  return (
    <svg aria-hidden="true" className={cn('icon-sprite', className)} {...props}>
      <use href={'/icons.svg#icon-' + name} />
    </svg>
  )
}
