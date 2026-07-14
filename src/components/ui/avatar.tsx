import { useState, type ImgHTMLAttributes } from 'react'
import { cn } from '@/core/utils'

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  name?: string
  src?: string
}

export function Avatar({ name, src, className, ...props }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const initial = name?.slice(0, 1) ?? 'A'

  if (src && !failed) {
    return (
      <img
        className={cn('ui-avatar', className)}
        src={src}
        alt={name ?? ''}
        onError={() => setFailed(true)}
        {...props}
      />
    )
  }

  return (
    <div className={cn('ui-avatar', className)} aria-label={name ?? undefined} {...props}>
      {initial}
    </div>
  )
}
