import type { ReactNode } from 'react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { cn } from '@/core/utils'

/** 单个标签页定义（对齐 antd Tabs items 的常用子集；不支持可关闭、拖拽、右键菜单） */
export interface TabItem {
  /** 标签唯一标识，用作激活判定与 onChange 回传值，同一组内需唯一。 */
  key: string
  /** 标签头显示内容，调用方负责走 i18n。 */
  label: ReactNode
  /** 该标签对应的内容面板；省略时只渲染标签头（受控外部渲染内容时用）。 */
  children?: ReactNode
  /** 是否禁用该标签（不可点击、置灰）。 */
  disabled?: boolean
}

export interface TabsProps {
  /** 标签配置数组。 */
  items: TabItem[]
  /** 当前激活标签 key（受控，必传）。与 antd 差异：无非受控形态、无 defaultActiveKey。 */
  activeKey: string
  /** 激活标签变化回调；点击已激活或禁用项不触发。 */
  onChange: (key: string) => void
  /** 尺寸密度：'middle' 默认（14px 字号），'small' 收紧（13px 字号、更矮标签头）。 */
  size?: 'middle' | 'small'
  /** 附加到最外层容器的类名。 */
  className?: string
}

const TAB_SIZE: Record<'middle' | 'small', string> = {
  middle: 'px-1 pb-2.5 text-sm',
  small: 'px-1 pb-2 text-[13px]',
}

/**
 * 标签页：参数对齐 Ant Design Tabs 常用子集（items/activeKey/onChange/size），
 * 视觉对齐原型下划线式 tab——标签头底部 `--border` 分隔线，激活项金字加粗 + 2px 金色下划线。
 * 基于 Radix Tabs，键盘方向键切换、`aria-selected`/`role=tab` 无障碍属性内建。
 * items 提供 `children` 时渲染对应内容面板；否则只渲染标签头，由调用方按 activeKey 自行渲染内容。
 * 非目标：卡片型（type=card）、可关闭标签、位置（left/right/bottom）、附加内容（tabBarExtraContent）。
 */
export function Tabs({ items, activeKey, onChange, size = 'middle', className }: TabsProps) {
  return (
    <TabsPrimitive.Root
      className={cn('flex flex-col', className)}
      value={activeKey}
      onValueChange={onChange}
    >
      <TabsPrimitive.List className="flex items-center gap-5 border-b border-[var(--border)]">
        {items.map((item) => (
          <TabsPrimitive.Trigger
            className={cn(
              '-mb-px cursor-pointer border-0 border-b-2 border-transparent bg-transparent font-[inherit] font-medium text-[var(--t2)] transition-[color,border-color] duration-150 enabled:hover:text-[var(--t1)] disabled:cursor-not-allowed disabled:opacity-45 data-[state=active]:border-[var(--gold)] data-[state=active]:font-semibold data-[state=active]:text-[var(--gold)]',
              TAB_SIZE[size],
            )}
            disabled={item.disabled}
            key={item.key}
            value={item.key}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) =>
        item.children === undefined ? null : (
          <TabsPrimitive.Content className="pt-4 outline-none" key={item.key} value={item.key}>
            {item.children}
          </TabsPrimitive.Content>
        ),
      )}
    </TabsPrimitive.Root>
  )
}
