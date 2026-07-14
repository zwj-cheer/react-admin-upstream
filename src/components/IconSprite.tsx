import type { SVGProps } from 'react'
import { cn } from '@/core/utils'

export function IconSprite({
  name,
  className,
  ...props
}: SVGProps<SVGSVGElement> & { name: string }) {
  return (
    <svg aria-hidden="true" className={cn('icon-sprite', className)} {...props}>
      <use href={'/icons.svg#icon-' + name} />
    </svg>
  )
}
