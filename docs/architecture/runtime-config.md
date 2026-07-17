# 运行时配置

浏览器总是在挂载 React 之前请求 `/config/runtime.json`。该文档以 `cache: 'no-store'` 和
`credentials: 'same-origin'` 拉取，解析为 JSON 后由严格的 Zod schema
（`src/core/config/runtimeConfig.schema.ts`）校验。解析入口在
`src/bootstrap/loadRuntimeConfig.ts`；校验通过的结果经 `RuntimeConfigProvider`
提供给整个应用。

`public/config/runtime.json` 纳入版本控制，作为本地默认配置。生产部署将各自的
`/srv/config/runtime.json` 挂载或发布到静态资源旁；容器镜像会剔除打包进产物的默认文件，
因此不会烘焙任何环境 API 或 IdP 值。

> 每当在 `public/config/runtime.json` 中增加、删除或修改字段，必须在同一次改动中更新本文档。
> 下方字段参考必须与 JSON 文件和 schema 保持一致。

## 字段参考

所有对象均为严格模式：出现未知字段会导致启动失败而不是被忽略。标注"可选"的字段可以省略，
schema 会应用其默认值。

### `schemaVersion`（必填）

- 类型：字面量 `1`。
- 作用：防止加载为不兼容 schema 版本编写的文档。任何其他值都会校验失败。

### `app`（必填）

- `app.name`（必填）：工作台显示名称。字符串，1–80 个字符。这是应用显示名称的
  唯一来源（侧边栏、登录页、顶栏兜底标题均使用它）；`src/project/branding.ts`
  只保留缩写标记与 edition 文案。

### `api`（必填）

- `api.baseUrl`（必填）：API 请求的基础路径或绝对 URL。非空字符串（例如 `/api`）。
  外部源必须同时在 `src/project/trustedOrigins.ts` 中注册。
- `api.timeoutMs`（可选，默认 `10000`）：请求超时毫秒数。整数，范围 `1000`–`120000`。

### `auth`（必填）

- `auth.mode`（必填）：`local`、`oidc`、`hybrid` 之一。
  - `local`：服务端 Cookie 会话与 CSRF 约定。
  - `oidc`：通过 `oidc-client-ts` 的授权码 + PKCE。
  - `hybrid`：同时提供两种登录入口；刷新后只恢复当前浏览器会话所选的来源。
- `auth.local`（可选，默认 `{ "csrfHeaderName": "x-csrf-token" }`）：
  - `auth.local.csrfHeaderName`（可选，默认 `x-csrf-token`）：携带 CSRF 令牌的请求头名称。
    非空字符串。
- `auth.oidc`（当 `mode` 为 `oidc` 或 `hybrid` 时必填，否则应省略）：公共客户端 OIDC 设置。
  绝不能在此放置 `clientSecret` 或任何凭据。
  - `oidc.authority`（必填）：签发方/authority URL。必须是合法 URL。
  - `oidc.clientId`（必填）：公共客户端 id。非空字符串。
  - `oidc.redirectPath`（必填）：回调路由。编译期白名单；当前仅接受 `/auth/callback`。
  - `oidc.postLogoutRedirectPath`（必填）：登出后路由。编译期白名单；当前仅接受 `/login`。
  - `oidc.scope`（必填）：OAuth scope。非空字符串（例如 `openid profile email`）。

### `defaults`（必填）

- `defaults.theme`（可选，默认 `system`）：`light`、`dark`、`system` 之一。
- `defaults.locale`（可选）：`zh-CN`、`en-US` 之一。省略时回退到浏览器语言。

### `ui`（可选，默认 `{ "accountMenu": { "sidebar": true, "header": false } }`）

- `ui.accountMenu.sidebar`（可选，默认 `true`）：在侧边栏显示账户菜单。
- `ui.accountMenu.header`（可选，默认 `false`）：在顶栏显示账户菜单。

### `mock`（可选，默认 `{ "enabled": false }`）

- `mock.enabled`（可选，默认 `false`）：启用 MSW mock 层。仅开发环境生效；生产环境拒绝
  `true`。

## 解析顺序

- 主题：已保存的用户偏好 → 运行时默认值 → 操作系统偏好 → light 兜底。
- 语言：已保存的用户偏好 → 运行时默认值 → 浏览器语言 → `zh-CN` 兜底。

## 信任边界

运行时 JSON 无法批准新的 API 或 OIDC 源。外部 HTTPS 源必须同时存在于
`src/project/trustedOrigins.ts`。

OIDC 导航路径同样是编译期信任边界。当前模板的 `redirectPath` 仅接受 `/auth/callback`，
`postLogoutRedirectPath` 仅接受 `/login`；新增路径需要在源码中注册路由并扩展对应的
schema 白名单。

对外部 API 使用 `local` 或 `hybrid` Cookie 登录时，该精确源必须在构建期设置
`allowCredentialedCookies: true`。后端必须返回精确的 `Access-Control-Allow-Origin`、
`Access-Control-Allow-Credentials: true`、合适的 `SameSite`/`Secure`/`HttpOnly` Cookie
属性，并实施 CSRF 防护。

生产环境拒绝缺失或无效的配置、未知字段、不受信任的源、不完整的 OIDC 字段以及 Mock 模式。
开发环境在文档缺失或无效时回退到同源本地登录配置并启用 MSW。
