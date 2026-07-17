# UI 组件库重构与扩展计划

> 状态:待执行 · 执行规范:`ui-component-refactor` skill · 参考实现:`src/components/ui/table.tsx`(已完成)
> 视觉基准:原型 `http://localhost:5504/`(`assets/shared.css` + 各页面,如 `payg/balance-usage.html`)
> API 基准:Ant Design 对应组件的**常用子集**(明确非目标,拒绝长尾参数)

## 1. 总体原则

所有条目统一遵守 `ui-component-refactor` skill,此处只列增量约定:

1. **两层结构按需采用**:交互复杂的组件(Table/Select/Modal)分「低层基元 + 高层 antd 形态」;
   简单组件(Input/Tag)直接单层增强,不机械套结构。
2. **视觉唯一真相是原型**:每个组件的章节列出对应的原型 CSS 类,尺寸/圆角/配色照抄并翻译为
   `tokens.css` 令牌,不自行发挥。原型没有的形态(如 Modal 的 danger 页脚)对齐既有代码先例。
3. **移动端**:每个组件写明 768px 以下形态(内建降级 / 包装层负责 / 天然自适应三选一)。
4. **执行顺序即依赖顺序**:P0 内部有依赖(Icon → 其余;Pagination ← Table 复用),其余并行无碍。

## 2. 现状盘点

| 文件                                                         | 现状                                                               | 结论                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------- |
| `table.tsx`                                                  | 已完成两层重构(高层 `Table` + `TableRoot` 基元)                    | 作为范式参考                          |
| `button.tsx`                                                 | cva 变体齐全(default/primary/outline-accent/ghost/danger × 三尺寸) | 小改:补 `loading`                     |
| `input.tsx`                                                  | 原生透传 forwardRef                                                | 增强(P0)                              |
| `select.tsx`                                                 | 原生 `<select>` 透传                                               | 重构(P0)                              |
| `dialog.tsx`                                                 | shadcn 基元散件,调用方手拼 footer                                  | 加高层 `Modal`(P0)                    |
| `dropdown-menu.tsx`                                          | radix 基元散件                                                     | 加高层 `Dropdown`(P1)                 |
| `checkbox.tsx` / `switch.tsx` / `avatar.tsx` / `tooltip.tsx` | 够用                                                               | 不动                                  |
| `toast.tsx`                                                  | sonner 包装,`richColors` 与令牌体系脱节                            | 小改(P2)                              |
| `form.tsx`                                                   | 152B 占位                                                          | 不做 antd Form(skill 已排除),保持现状 |
| `common/Pagination.tsx`                                      | 仅上一页/下一页;`table.tsx` 内还有一份内联分页,重复                | 升级并收敛(P0)                        |
| `IconSprite.tsx` + `lucide-react` 混用                       | 图标双体系分裂                                                     | 统一(P0,见 §4)                        |

原型中出现、但仓库**没有**对应组件的高频形态(扩展目标,见 §5):
标签 `tbl-tag/ov-bal-tag`、分段切换 `ch-seg`、进度条 `ov-bal-pb`、统计卡 `ost`、
筛选栏 `filter-bar`、多选下拉 `multi-sel`、空态/骨架、Popconfirm(原型删除类操作是直接确认弹层)。

## 3. 视觉令牌对照表(原型 → tokens.css)

原型 `shared.css` 变量与仓库令牌已一一对应,组件实现时按此翻译,**禁止出现原型变量名或 hex**:

| 原型                                    | 仓库令牌                       | 用途              |
| --------------------------------------- | ------------------------------ | ----------------- |
| `--gold` / `--goldl`                    | `--gold` / `--gold-light`      | 主强调色 / 浅金底 |
| `--t1/t2/t3`                            | `--t1/t2/t3`                   | 文字三级          |
| `--bdr` / `--bdrm`                      | `--border` / `--border-strong` | 边框              |
| `--card` / `--bg`                       | `--card` / `--bg`              | 卡片 / 页面底     |
| `--greenl/bluel/purplel/orangel` + 主色 | `--green-light/...` + 主色     | 语义色标签        |
| `--shmd`                                | `--shadow-md`                  | 浮层阴影          |

通用尺寸基调(来自原型实测):卡片圆角 14–16px、控件圆角 8–10px、正文 13px、
辅助文字 12px、表头/眉标 11px 大写 + letter-spacing、控件内边距 7–9px × 10–16px。

## 4. 图标体系统一(P0,先行) ✅ 2026-07-14

**现状问题**:`public/icons.svg`(33 个 symbol,与原型 `assets/icons.svg` 同源)经
`IconSprite` 用于菜单/状态页;`lucide-react` 散用于 12+ 处按钮/组件内部。两套线宽不同
(sprite 1.8 / lucide 2.0),同屏混用有可见差异。

**方案**:sprite 为唯一业务图标来源,lucide 仅限 `src/components/ui/` 内部装饰性图标
(chevron、check、x 这类纯 UI 符号),不再出现在 `src/modules/`、`src/layouts/` 业务代码里。

1. 新建 `src/components/ui/icon.tsx`:
   - `export type IconName = 'user' | 'users' | ... `(由 `public/icons.svg` 的 33 个
     symbol id 生成的字面量联合,新增图标必须同步扩这个类型——拼错编译期报错)。
   - `Icon` props:`name: IconName`、`size?: 14 | 16 | 18 | 20`(默认 16,对应原型
     `icon-14/icon-16` 类)、原生 svg 属性透传;颜色恒为 `currentColor`。
   - 默认 `aria-hidden`;传 `label` 时输出 `role="img"` + `aria-label`。
2. 缺失图标补进 `public/icons.svg`:业务侧 lucide 现用的 `pencil`(编辑)、`trash`(删除)、
   `search`(搜索)、`key-round`(权限)、`languages`(语言)sprite 里没有,按原型笔触
   (24 viewBox / stroke 1.8 / round cap+join)补 symbol,不直接拷贝 lucide 路径数据。
3. 迁移:`src/modules/`、`src/layouts/` 里所有 lucide 导入改为 `<Icon name="..."/>`;
   `IconSprite` 的调用方(菜单树、Sidebar、状态页——name 来自运行时数据,保持 string 宽类型
   入口)迁到 `Icon` 的宽松重载或保留 `IconSprite` 作为运行时动态名入口,二选一后全仓统一。
4. 验收:`grep "from 'lucide-react'"` 在 `src/modules/ src/layouts/` 零结果;
   双主题下菜单/工具栏图标线宽一致。

## 5. 组件清单

### P0(基础层,先做)

#### 5.1 Icon —— 见 §4 ✅ 2026-07-14

实际偏差记录:

- 补入 sprite 的 symbol 共 7 个(计划列 5 个,另加 `chevron-up`、`logout`)。`logout` 直接
  取自原型 `assets/icons.svg` 的 `icon-logout`(同源笔触,非 lucide 拷贝)。
- `size` 联合额外含 `24`:状态页大图标圆底(`.status-page__icon`,对齐原型
  `.modal-confirm-icon` 的 24px 图标)需要。
- 运行时动态名入口二选一:保留 `IconSprite`(菜单树/Sidebar/路由注册表的 icon 来自运行时
  数据),未给 `Icon` 加宽松重载;`IconSprite` 补 JSDoc 写明与 `Icon` 的分工。
- `src/components/ui/` 内部 lucide(checkbox/dialog/table 的 check、x、chevron)按方案
  保留,不属于业务代码。
- 视觉基线因图标线宽变化按预期更新(`pnpm exec playwright test --project=visual
--update-snapshots`),5 条基线全部重录并复跑通过。

#### 5.2 Pagination(升级 + 收敛) ✅ 2026-07-14

- **antd 子集**:`current/pageSize/total/onChange`、页码按钮 + 省略号折叠(siblingCount=1)、
  `showTotal`(默认 i18n `common.pageInfo`)、`disabled`。非目标:pageSize 切换、快跳输入。
- **原型样式**:`.pg`——居中、gap 8、13px、`--t2`;当前页按钮 `--gold` 底白字。
- **迁移**:`common/Pagination.tsx` 移入 `ui/pagination.tsx`;`table.tsx` 删内联分页改复用;
  User/Role 列表页 props 改名(`page`→`current`);`components.css` 的 `.pagination` 类删除。
- **移动端**:页码折叠为「上一页 / x/y / 下一页」(390px 下省略页码按钮),内建降级。

实际偏差记录:

- `showTotal` 做成布尔开关(文案固定 i18n `common.pageInfo`),不支持 antd 的函数式签名;
  汇总文案在 <640px 隐藏,由「x / y」摘要取代。
- 移动端断点用 Tailwind `sm`(640px)而非 390px:`max-sm:hidden` 收页码按钮,与仓库既有
  响应式断点体系一致。
- 高层 `Table` 的 `TablePagination` 接口不变,内部渲染改走 `Pagination`(带 `showTotal`);
  `Button` 依赖与 `pageCount` 局部变量一并移除。
- 视觉基线因分页样式变化重录 5 条并复跑通过;`pnpm e2e` 7 条全过。

#### 5.3 Input(单层增强) ✅ 2026-07-14

- **antd 子集**:`allowClear`、`prefix/suffix`(ReactNode)、`status: 'error'`、
  `size: 'middle' | 'small'`。非目标:TextArea/Password/addon。
- **硬约束**:保持 forwardRef 兼容 react-hook-form `register`(LocalLoginForm、FormDialog 系列)。
- **原型样式**:`.filter-bar input`——8px 圆角、13px、focus 金边 + 12% 金色光晕(现实现已有)。
- **迁移**:User/Role 列表工具栏手拼的 Search 图标改走 `prefix`;表单校验错误接 `status`。
- **移动端**:天然自适应。

实际偏差记录:

- 无装饰 props 时渲染裸 `<input>`,DOM 与增强前完全一致(不引入包装节点),存量表单零影响;
  有 `prefix/suffix/allowClear` 时才外包 `relative` 容器。
- `allowClear` 通过原生 value setter + `input` 事件派发实现清除,受控用法与 react-hook-form
  `register` 均能正常收到 onChange;清除按钮 `aria-label` 走新 i18n 键 `common.clear`
  (zh/en 同步)。
- `status` 接入范围:LocalLoginForm、User/Role/MenuFormDialog 共 8 个字段;错误态输出
  `aria-invalid="true"`。
- `layout.css` 的 `.toolbar-search input` 左内边距与 `.toolbar-search__icon` 绝对定位规则
  删除(由 `prefix` 取代),`.toolbar-search` 仅保留宽度约束。
- 视觉基线无 diff(默认态样式不变),5 条基线直接通过,未重录。

#### 5.4 Select(两层重构) ✅ 2026-07-14

- 现原生 `<select>` 改名 `SelectNative` 保留;高层 `Select` 基于 radix Select/Popover。
- **antd 子集**:`options: {label, value, disabled?}[]`、`value/onChange`、`placeholder`、
  `allowClear`、`showSearch`(本地 label 过滤)、`mode: 'multiple'`(选中项浅金 tag)、
  `loading`、`disabled`、`size`。非目标:OptGroup、远程搜索、虚拟滚动、tags 输入。
- **原型样式**:触发器 `.multi-sel-btn`(8px 圆角、13px、右侧 ▾、有值时金字金边);
  面板 `.multi-drop`(8px 圆角、`--card` 底、`--shadow-md`、选项 hover `--bg` 底)。
- **迁移**:`SettingsDialog`、`MenuFormDialog` 的 `<select>` 迁高层(选项均为静态数组)。
- **移动端**:radix 面板自适应;390px 下面板宽度撑满触发器宽,不做抽屉化。

实际偏差记录:

- 高层 `Select` 基于 radix **Popover**(非 radix Select):radix Select 不支持多选,
  为统一单/多选与 showSearch 的实现选 Popover;键盘方向键为浏览器默认焦点行为,
  未实现 typeahead。
- props 为判别联合 `SelectSingleProps | SelectMultipleProps`:`mode: 'multiple'` 时
  `value/onChange` 类型自动切换为数组形状,编译期约束调用方。
- 单选 `onChange` 回传 `string | undefined`(allowClear 清除时 undefined),调用方需
  处理空值分支(SettingsDialog 用 `if (value)` 守卫)。
- `SelectNative` 保留 forwardRef 供 register 直接展开,但当前无调用方(MenuFormDialog
  两个字段均迁高层,routeKey 从 `register` 改 `Controller`);保留供下游表单枚举场景。
- 新 i18n 键 `common.deselect`(多选 tag 移除按钮的 aria-label,zh/en 同步)。
- 面板宽度用 radix `--radix-popover-trigger-width` 恒等触发器宽,天然覆盖 390px 形态。
- 视觉基线 5 条无 diff 直接通过(基线页面不含 Select);e2e 7 条全过
  (system-admin 用例实走 MenuFormDialog 创建流程)。

#### 5.5 Modal(dialog.tsx 加高层) ✅ 2026-07-14

- 基元(`Dialog*`)全部保留不改名。
- **antd 子集**:`open/onOpenChange`、`title`、`onOk/onCancel`、`okText/cancelText`
  (默认 i18n `common.confirm/cancel`)、`confirmLoading`、`okDanger`(危险确认,红底)、
  `footer: null`、`width`。非目标:`Modal.confirm` 静态方法、拖拽。
- **原型样式**:原型 `.modal` 与现 `DialogContent` 一致(2xl 圆角、p-7、遮罩 45% 黑);
  移动端原型是底部 sheet(`sheet-handle`)——本期不做 sheet 化,保持居中缩窄
  (`w-[min(520px,calc(100vw-32px))]` 已覆盖),sheet 列为后续项。
- **迁移**:`ConfirmDialog` 对外 API 不变、内部换 `Modal`;FormDialog 系列含 `<form>`
  提交语义,评估后可保留基元用法(写明原因即可,不强迁)。

实际偏差记录:

- `onOk` 不自动关闭弹窗、不吞 Promise 错误:关闭时机由调用方掌控(与 antd 的
  「resolve 即关」不同),JSDoc 写明。取消路径(遮罩/Escape/X/取消按钮)统一走
  `onCancel?.()` → `onOpenChange(false)`。
- 增补 `description` prop(antd Modal 没有,但仓库确认弹窗均带副标题,且 radix 要求
  Description 提升无障碍)。`title` 必填:radix Title 是无障碍硬要求。
- `width` 渲染为 `min(width px, calc(100vw - 32px))` 内联样式,窄屏不溢出;jsdom 不解析
  `min()`,单测不覆盖 width(浏览器端已验证 computed 400px)。
- `ConfirmDialog` 对外 API 不变,内部由 40 行基元组合缩为单个 `<Modal okDanger>` 调用;
  按钮文案保留 `common.delete`(非默认 `common.confirm`)。
- FormDialog 系列(User/Role/Menu)保留基元用法不迁:含 `<form onSubmit>` +
  type=submit 提交语义,Modal 的 onOk 按钮模型与之不匹配,强迁需牺牲原生表单校验/回车提交。

### P1(高频扩展)

#### 5.6 Tag ✅ 2026-07-14

- **antd 子集**:`color: 'gold' | 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'default'`、
  `icon?`、`closable/onClose`。cva 变体实现。
- **原型样式**:`.tbl-tag`——3px×7px 内边距、6px 圆角、11px、`--Xxx-light` 底 + 主色字;
  带呼吸点的状态形态对应 `.ov-bal-tag`(dot + 12px 圆角),做成 `dot?: boolean`。
- **迁移**:`components.css` 的 `.status-badge` 语义类改由 `<Tag color dot>` 替代,
  User/Role 列表状态列迁移后删旧类。

实际偏差记录:

- 迁移范围含 MenuTreePage(计划只列 User/Role):状态列 + 「未知路由」徽标共 4 处,
  `.status-badge` 类与其 `data-status` 变体全部删除,grep 零残留。
- 呼吸点动画 `tag-pulse`(opacity 1↔0.35,2s)加在 `components.css`,用 Tailwind
  `motion-safe:` 前缀,`prefers-reduced-motion` 自动停用。
- `closable` 不自持可见性(antd Tag 点关闭默认自隐藏):关闭按钮仅回调 `onClose`,
  显隐由调用方控制,与仓库受控惯例一致;按钮 aria-label 走新 i18n 键 `common.close`。
- 状态形态从旧 `.status-badge` 的 999px 胶囊改为原型 `.ov-bal-tag` 的 12px 圆角 +
  呼吸点,视觉基线 5 条按预期重录并复跑通过。

#### 5.7 Segmented(分段切换) ✅ 2026-07-14

- **antd 子集**:`options: {label, value}[]`、`value/onChange`、`size`。受控,无非受控形态。
- **原型样式**:`.ch-seg`——`--bg` 底 + 边框圆角 8px 外壳,按钮 5px×12px,激活项
  `--card` 底 + 金字 + 细阴影。原型高频形态(图表日/周/月/年切换)。
- **移动端**:超宽时横向滚动。

实际偏差记录:

- 无迁移目标(仓库当前无分段场景),纯新增待用;`role=radiogroup/radio` +
  `aria-checked` 语义,点击已激活项不回调。
- **附带修复(影响全局)**:发现 `base.css` 的 `button { color: inherit }` 非分层规则
  压过 Tailwind `@layer utilities` 工具类,导致所有 button 上的 `text-[var(--x)]`
  失效(Segmented 激活金字、Button primary 白字均中招)。改为
  `@import './base.css' layer(base)` 后修复;此前受影响处(主按钮文字色等)随之
  恢复正确,视觉基线 5 条整体重录。陷阱已回写 skill。

#### 5.8 Dropdown(dropdown-menu.tsx 加高层) ✅ 2026-07-14

- **antd 子集**:`menu: {items: {key, label, icon?, danger?, disabled?, type?: 'divider'}[], onClick(key)}`、
  `placement`(bottomLeft/bottomRight/topLeft/topRight → radix side/align)、`disabled`。
  非目标:多级子菜单、hover 触发。danger 项 `--red` 字。
- **注意**:AGENTS.md 约定 3,触发器 asChild 只接元素节点。
- **迁移**:`AccountMenu` 评估迁移,复杂自定义内容保留基元。

实际偏差记录:

- `AccountMenu` 评估后**保留基元**:含用户信息头(Label + disabled 邮箱项 + 分隔线)
  的自定义结构,且两项动作各带副作用(开弹窗/登出),`menu.onClick(key)` 单回调模型
  无净收益;计划本身允许此结论。
- 触发器 `children: ReactElement` 经 radix asChild 透传;AGENTS.md 约定 3 的
  NavLink 限制写入 JSDoc。
- 分割线项也要求 `key`(React 列表需要),与 antd 的可省略不同。
- 单测锁定:点击回传 key、divider/danger 渲染、disabled 项不回调、disabled 整体不展开
  (radix 菜单在 jsdom 用 pointerDown 触发)。

#### 5.9 Popconfirm ✅ 2026-07-14

- **antd 子集**:`title`、`onConfirm/onCancel`、`okText/cancelText`(i18n 默认)、
  `okDanger`。基于 radix Popover,面板样式对齐 `.multi-drop`(8px 圆角、shadow-md)。
- **场景**:行内轻量删除确认(重量级仍用 `ConfirmDialog`)。二者分工写进 JSDoc:
  不可恢复/批量 → Modal;单行可撤销级 → Popconfirm。

实际偏差记录:

- open 状态组件内部持有(非受控)——Popconfirm 语义上就是「点开即问」,不需要调用方
  管理 open;这是本批组件里唯一的非受控例外,理由写入实现。
- 异步确认:`onConfirm` 返回 Promise 时等待完成才关面板(期间确认按钮禁用),
  拒绝时保持打开;单测覆盖 pending/拒绝/成功三分支。
- 标题行带 `triangle-alert` 图标(antd 默认形态),okDanger 时图标转红、否则橙色。
- `onCancel` 仅取消按钮触发,Escape/点外部关闭不触发(与 antd 一致)。
- 面板固定 `side=top` + 自动翻转,不实现 placement 细分(非目标)。
- 仓库当前无行内轻量确认场景,纯新增待用,无迁移。

#### 5.10 Empty + Spin ✅ 2026-07-14

- `Empty`:`description?`(默认 i18n `common.empty`)、`icon?`;样式对齐 `.async-state`
  (220px 最小高、居中、`--t3`)。`AsyncState` 内部空态改用它。
- `Spin`:`spinning`、`children?`(包裹模式 = 半透明遮罩,复用 `Table` loading 层的实现,
  把那段遮罩从 table.tsx 抽出来共用);单独模式 = 行内转圈 + `common.loading`。
- **迁移**:`table.tsx` 的 loading 遮罩改用 `Spin` 包裹模式,消除重复。

实际偏差记录:

- `Empty` 增补 `children` slot(空态下常见「新建」按钮位)与 `className`
  (AsyncState 场景外允许收紧最小高)。
- `Spin` 单独模式 `spinning=false` 渲染 null(antd 是包裹模式概念,单独模式为本仓扩展);
  包裹模式遮罩即原 table.tsx 内联遮罩原样抽出(65% --card 混透明 + 14px 圆角)。
- 迁移:table.tsx loading 遮罩 → `<Spin>` 包裹模式;AsyncState 空态 → `<Empty />`、
  加载态 → `<Spin spinning />`(外层 `.async-state` 保留供 220px 占位与错误态)。
- 视觉基线 5 条无 diff(加载/空态不在基线截图路径),e2e 7 条全过。

### P2(增益项,按需)

| 组件                         | antd 子集                                           | 原型对应                                   | 说明                                                                                                                                             |
| ---------------------------- | --------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Card                         | `title/extra/children`,`hoverable`                  | `.card` / `.sec-hd`(标题 + 右侧动作)       | 现散落 `.card` 语义类,组件化后统一节标题形态                                                                                                     |
| Statistic                    | `title/value/suffix/trend`                          | `.ost`(图标 + 标签 + 大数字 + 副文)        | 仪表盘统计卡,`trend` 上/下用 green/red                                                                                                           |
| Progress                     | `percent/status`,渐变条                             | `.ov-bal-pb`(金→橙渐变、12px 高、6px 圆角) | shimmer 动效可选,`prefers-reduced-motion` 关闭                                                                                                   |
| Tabs                         | `items/activeKey/onChange`                          | 原型账号页横向 tab                         | radix Tabs 包装                                                                                                                                  |
| Alert                        | `type: info/success/warning/error`、`message`       | `.rc-note`(浅金底提示块)                   | 四语义色 × `-light` 底                                                                                                                           |
| DatePicker                   | 先做 `<Input type="date">` 增强版(range 由两个组成) | `.filter-bar input[type=date]`             | 完整日历面板成本高,先不做,列为非目标                                                                                                             |
| Toaster 调色 ✅ 2026-07-14   | —                                                   | —                                          | 实现走 `components.css` 的 `[data-sonner-toast]` 令牌规则(非 toastOptions,CSS 更薄);语义底用 `color-mix(主色 10%, --card)` 保证不透明,双主题实测 |
| Button loading ✅ 2026-07-14 | `loading` prop(转圈 + 禁用)                         | `.btn` 加载态                              | 已接入 Modal `confirmLoading`;asChild 下仅禁用不注入转圈                                                                                         |

**明确不做**:antd Form(skill 已排除)、Upload、Transfer、Cascader、TreeSelect、
完整 DatePicker 日历面板、Modal 移动端 sheet 化(单列后续项)。无场景不预建。

## 6. 执行方式

1. 每个条目独立一次会话,提示词模板:
   「按 ui-component-refactor skill + docs/plans/2026-07-14-002 §5.x 重构/新增 <组件>」。
   skill 管流程与红线,本文档管每个组件的差异化规格,两者冲突时以 skill 为准。
2. P0 内顺序:Icon → Pagination → Input → Select → Modal(Icon 是其余的依赖;
   Pagination 完成才能清 table.tsx 内联分页)。P1/P2 无依赖可并行。
3. 每条完成即按 skill 验证清单走完(单测 → `pnpm verify` → 浏览器冒烟三视口双主题 →
   `pnpm visual`/`pnpm e2e` 按覆盖情况),踩到新坑回写 skill 陷阱区。
4. 新组件落地后在本文档对应条目标记 ✅ 并记录实际偏差,保持文档与实现同步。

## 7. 验收总标准

- [x] `src/modules/` 与 `src/layouts/` 无 lucide-react 导入,图标线宽全仓一致
      (评审后收紧:全仓零 lucide,依赖已从 package.json 移除;sprite 为唯一来源,
      `icon.test.tsx` 双向断言 ICON_NAMES 与 symbol 集合相等)
- [x] 分页 UI 全仓唯一实现(`ui/pagination.tsx`)
- [x] 状态展示统一为 `Tag`,`.status-badge` 语义类删除
- [x] 所有新组件:中文 JSDoc props、类型从组件文件导出、i18n 双语言键齐、
      三主题 × 三视口通过、单测覆盖新契约
- [x] `pnpm verify` + `pnpm visual` + `pnpm e2e` 全绿

## 8. 多代理评审结论(2026-07-14,run 20260714-203744)

8 评审员 + Codex 跨模型对抗评审 + 14 条独立复验。已修复并验证:

1. **base.css 降层导致 focus-visible 金色焦点环被 utilities 阴影吞并**(adversarial)——
   焦点环从 box-shadow 改 outline,与阴影工具类正交;冒烟确认规则在层叠中生效。
2. Select showSearch 选中后搜索词残留(correctness)——统一 close() 清 query。
3. select.tsx 四处 as 断言(maintainability)——props.mode 判别自然收窄。
4. Popconfirm 陈旧异步 resolve 关闭新面板(julik-races)——会话令牌守卫 + 回归测试。
5. Input 禁用态清除按钮可用(testing)——补 !props.disabled 守卫。
6. Segmented 硬编码 rgba 阴影(standards)——改 var(--shadow)。
7. 三处内联转圈收敛为 SpinIndicator 原子(maintainability)。
8. Input allowClear 非受控 + RHF reset 显隐脱钩——JSDoc 收窄为「仅受控」契约。

评审后续三组(键盘可达性/图标体系/i18n 标签)同日完成:

- **键盘可达性**:Select 触发器改 div[role=combobox](真 button 子元素合法化),
  Enter/Space/ArrowDown 开面板、面板内 ArrowUp/Down/Home/End roving focus、
  开面板自动聚焦选中项;清除/tag 移除改真 `<button>`;Table 排序表头包真 button
  (继承表头字号/字距/大小写)。
- **图标体系**:checkbox/dialog/table 的 lucide 全部迁 sprite(补 `check` symbol,
  勾线宽 2.5 保持原视觉),lucide-react 从依赖移除;ICON_NAMES 改 as const 数组
  派生类型 + sprite 双向一致性测试;Icon size 联合扩 11/13。
- **i18n 标签**:common.pagination/moveUp/moveDown 三键双语新增,Pagination
  landmark、Dialog 关闭钮、MenuOrderControls 全部走 t();skill 视觉规则 4/5 改写,
  消除与 AGENTS.md 约定 10 的标准冲突(无 landmark 英文豁免)。

未修(有意保留):Table 幽灵页钳制(复验裁定受控设计 + 无调用方)、Segmented roving
tabindex(模式偏差非阻断)、加载态 aria-live(影响有限,待有 AT 需求再做)。
