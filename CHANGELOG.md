# 变更日志

所有重要变更遵循语义化版本。

## [Unreleased]

### 新增

- React 19 管理后台上游模板。
- React 之前的运行时配置与偏好解析。
- 本地 Cookie、OIDC Code + PKCE 与混合认证模式。
- 基于能力的路由、导航与操作，响应校验失败即拒绝（fail-closed）。
- 通过 REST 适配器与 MSW 的用户、角色、菜单 CRUD。
- 源自 QRouter 的响应式中性视觉系统，支持 light/dark/system 主题与中英文。
- Docker/Caddy 交付，Vitest、Playwright 视觉/E2E 与 axe-core 门禁。
- `Icon` 组件（`src/components/ui/icon.tsx`）：`IconName` 字面量联合 + sprite 单一来源，
  业务代码（`src/modules/`、`src/layouts/`）不再直接使用 lucide-react；
  sprite 补入 chevron-up/pencil/trash/search/key-round/languages/logout 七个 symbol。
- `Pagination` 组件（`src/components/ui/pagination.tsx`）：antd 常用子集
  （current/pageSize/total/onChange/showTotal/disabled）+ 省略号折叠，移动端折叠为
  「上一页 · x / y · 下一页」；收敛 `common/Pagination.tsx` 与 `Table` 内联分页两处旧实现。
- `Input` 组件增强（`src/components/ui/input.tsx`）：antd 常用子集
  （allowClear/prefix/suffix/status/size），forwardRef 与 react-hook-form `register`
  保持兼容；列表页搜索框改走 `prefix` + `allowClear`，表单校验错误态接 `status`。
- `Select` 两层重构（`src/components/ui/select.tsx`）：原生透传改名 `SelectNative`，
  高层 `Select` 基于 radix Popover 实现 antd 常用子集（options/value/onChange/placeholder/
  allowClear/showSearch/mode:multiple/loading/disabled/size）；SettingsDialog 与
  MenuFormDialog 迁至高层。
- `Modal` 高层组件（`src/components/ui/dialog.tsx`）：antd 常用子集
  （open/onOpenChange/title/onOk/onCancel/okText/cancelText/confirmLoading/okDanger/
  footer:null/width），基元 `Dialog*` 全部保留；`ConfirmDialog` 内部迁移至 `Modal`，
  对外 API 不变。
- `Tag` 组件（`src/components/ui/tag.tsx`）：antd 常用子集（color 七语义色/icon/
  closable/onClose）+ 呼吸点 `dot` 形态；列表页状态列迁移至 `<Tag color dot>`，
  删除 `.status-badge` 语义类。
- `Segmented` 组件（`src/components/ui/segmented.tsx`）：antd 常用子集
  （options/value/onChange/size/disabled），视觉对齐原型 `.ch-seg`，超宽横向滚动。
- `Dropdown` 高层组件（`src/components/ui/dropdown-menu.tsx`）：antd 常用子集
  （menu.items(key/label/icon/danger/disabled/divider)/menu.onClick/placement/disabled），
  基元 `DropdownMenu*` 保留；AccountMenu 经评估保留基元组合。
- `Popconfirm` 组件（`src/components/ui/popconfirm.tsx`）：antd 常用子集
  （title/onConfirm/onCancel/okText/cancelText/okDanger），radix Popover 实现，
  支持异步确认（等待 Promise 完成后关闭）；与 ConfirmDialog 分工写入 JSDoc。
- `Empty` 与 `Spin` 组件（`src/components/ui/empty.tsx`、`spin.tsx`）：空态默认
  i18n 文案 + icon/children 扩展；Spin 支持包裹遮罩/行内转圈两模式，`Table` loading
  遮罩与 `AsyncState` 空态/加载态收敛至二者。
- `Button` 增加 `loading`（转圈 + 禁用），`Modal` 的 `confirmLoading` 接入该视觉；
  Toaster 弃用 sonner `richColors`，改由 `[data-sonner-toast]` 令牌规则调色，
  四语义态随 light/dark/system 自动切换。
- 键盘可达性（多代理评审跟进）：`Select` 触发器改 `role=combobox` + 面板方向键
  roving focus，清除/多选 tag 移除改真 `<button>`；`Table` 可排序表头包真 `<button>`。
- 图标单一来源收口：`checkbox`/`dialog`/`table` 内残余 lucide 全部迁 sprite
  （补 `check` symbol），移除 lucide-react 依赖；`ICON_NAMES` 与 sprite symbol
  由测试双向守护。

### 修复

- `base.css` 以 `layer(base)` 引入，修复非分层全局规则（`button { color: inherit }`）
  压过 Tailwind 工具类导致按钮文字色失效的问题。
- focus-visible 焦点环从 box-shadow 改 `outline`，不再被组件层 `shadow-*` 工具类
  吞并（降层后的层叠回归，多代理评审发现）。
- `Popconfirm` 陈旧异步确认 resolve 不再关闭重开的新面板（会话令牌守卫）；
  `Select` showSearch 选中后搜索词残留修复；`Input` 禁用态隐藏清除按钮。
- 所有 aria-label 收口至 i18n（分页 landmark、弹窗关闭、菜单排序上移/下移），
  新增 `common.pagination/moveUp/moveDown` 双语键。
- 头部图标按钮从描边卡片改为主流 ghost 形态（32px 透明底、hover 浅底、`--icon` 色），
  语言按钮 `inline-flex` 修复 WebKit 下图标与文字垂直堆叠。
