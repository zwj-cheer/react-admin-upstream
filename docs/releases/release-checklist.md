# 稳定发布检查清单

- [ ] `pnpm verify` 通过。
- [ ] E2E、视觉与 a11y 项目在批准的浏览器环境中通过。
- [ ] Docker 镜像可构建，并以非 root 的 Caddy 用户运行。
- [ ] 镜像不包含真实的运行时 JSON 或 MSW worker。
- [ ] 运行时配置、index 与 immutable 资源的缓存头已验证。
- [ ] 发布中不出现 QRouter、payg、OPL、Open WebUI、真实凭据、令牌或 PII。
- [ ] CHANGELOG 与目标版本的升级指南完整。
- [ ] 独立示例下游保留品牌、路由、信任策略与服务适配器。
- [ ] 自第二个稳定发布起，示例项目已从上一个标签完成升级。
