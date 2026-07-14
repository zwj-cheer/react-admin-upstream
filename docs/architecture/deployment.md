# Docker 与 Caddy 部署

镜像只构建一次，然后按环境挂载不同的运行时配置文档：

```text
/srv/config/runtime.json
```

镜像刻意不包含真实的运行时配置，并在运行时阶段移除 MSW worker。两个基础镜像标签都在
Dockerfile 中固定到多平台 manifest 摘要，重建不会静默选中不同的镜像内容。

Caddy 以非 root 的 `caddy` 用户监听 `8080` 端口。缓存规则如下：

- `/config/runtime.json`：no-store。
- `index.html` 与 SPA 回退：no-cache/no-store。
- `/assets/` 下带 hash 的文件：一年，immutable。
- 缺失的运行时配置、JavaScript、CSS 与 source-map 路径返回 404，而不是回退 HTML。

默认 CSP 为同源。`CSP_CONNECT_SRC` 只能通过受控的部署配置设置，并与
`src/project/trustedOrigins.ts` 及运行时 JSON 保持一致。

跨源 Cookie 认证还需要后端协同配置 CORS、Cookie 与 CSRF；只改前端 JSON 是不够的。

构建镜像后运行 `node scripts/verify-container.mjs <image-tag>`。该校验按配置启动镜像、
确认非 root 用户、证明部署注入前运行时 JSON 与 MSW 不存在，然后检查运行时 no-store 头、
immutable 资源、SPA 回退、真实资源 404 响应与安全响应头。
