# Memos 动态同步

把公开 Memos 实例里的动态，在**构建期**物化为 `src/content/moments/*.md`，
随后交给站点常规的 SSR 渲染链处理。

这样做的目的：不用把 Markdown 渲染器搬进浏览器，也不会丢掉首屏内容与 SEO，
同时让动态内容随构建自动更新。

## 工作原理

```
Memos API ──► scripts/memos/sync-moments.mjs ──► src/content/moments/*.md
                                                      │
                                      站点 SSR 渲染链（Astro + 站点 Markdown 插件链）
                                                      │
                                                  静态 HTML
```

- 脚本已挂在 `pnpm build` 的最前面，部署时自动执行；
- `pnpm memos:sync` 可单独手动运行，支持 `--dry-run`、`--quiet`、`--no-prune`；
- 页面运行期与 SSR 阶段**零外部请求**，与 Shirone「SSR 优先、按需加载」的约定一致。

## 数据映射

| Memos 字段 | moments 字段 | 说明 |
| --- | --- | --- |
| `createTime` | `published` | UTC 转站点时区，输出带偏移的 ISO |
| `pinned` | `pinned` | 置顶在列表最前 |
| `content` | 正文 | 原样交给 Markdown 渲染链 |
| `content` 中的 `#标签` | `tags` | 解析后并入标签并从正文移除（可关闭） |
| `attachments`（`image/*`） | `images` | 图片附件 |
| `state` | — | 只同步 `NORMAL`，归档/删除状态跳过 |

正文里的 `#标签` 会被并入 frontmatter 的 `tags`，因此在站点上可以直接按标签筛选。

## 图片策略

由 `memosConfig.imagePolicy` 控制：

- `"remote"`（默认）：保留 Memos 远端链接。仓库轻量，但依赖 Memos 服务可访问；
- `"local"`：下载到 `public/images/moments/`，由构建期生成响应式缩略图。
  仓库会变大，但不依赖 Memos 存活。

> 远端图片不会走进度构建期缩略图管线，因此没有 `thumbnailSrcset`；
> 本地图片才有 192 / 384 / 640 三档候选。

## 安全与稳健性

- **拉取失败不阻断部署**：网络异常、API 变更、服务下线时，脚本保留仓库中
  既有内容并以 0 退出。外部服务故障不会让站点发布失败；
- **只清理自己写过的文件**：生成清单 `src/content/moments/.memos-manifest.json`
  记录本脚本产出的文件与内容哈希。远端删除某条动态时，只删除清单中登记的对应
  文件，**手写的 moments 永远不会被触碰**；
- **增量写入**：内容哈希未变化的文件不重写，减少无意义的构建差异；
- **凭据不进仓库**：令牌从环境变量 `MEMOS_TOKEN` 读取（配置里的 `token` 字段
  仅作占位），脚本日志会做脱敏。

## 配置

见 `src/config/memosConfig.ts`，或通过内容仓的 `config/memos.yaml` 覆盖。

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `enable` | `true` | 关闭后脚本空转，`moments/` 保持仓库静态内容 |
| `apiUrl` | 本站 Memos 端点 | 可用 `MEMOS_API_URL` 覆盖 |
| `token` | 空 | 公开实例留空；可用 `MEMOS_TOKEN` 覆盖 |
| `pageSize` | `200` | 服务端上限 200 |
| `maxItems` | `0` | 0 表示不限制 |
| `imagePolicy` | `"remote"` | `"remote"` / `"local"` |
| `extractInlineTags` | `true` | 解析正文 `#标签` |
| `baseTags` | `["memos"]` | 所有动态统一附加的标签 |
| `defaultMood` | 空 | 留空则卡片不显示心情图标 |
| `pruneRemoved` | `true` | 清理远端已删除的生成文件 |
| `manifestFile` | `.memos-manifest.json` | 生成清单文件名 |

## 让新动态自动上线

同步发生在**构建时**，所以新动态要经过一次重新构建才会出现在站点上。
三种做法，按投入从低到高：

1. **手动**：在 Vercel 点 Redeploy，或在仓库里发一次任意提交；
2. **推荐**：Vercel 项目 → Settings → Git → Deploy Hooks 建一个 hook，
   把 URL 存成仓库 Secret `VERCEL_DEPLOY_HOOK`。
   仓库自带的 `.github/workflows/refresh-moments.yml` 会每天调用它重建站点
   （也可在 Actions 里手动触发）。未配置该 Secret 时该工作流会跳过而非报错；
3. **实时**：把 `moments` 页改成客户端拉取。代价是首屏无内容、SEO 丢失、
   需要把 Markdown 渲染能力带到浏览器，与主题设计取向相悖，不推荐。

## 从旧站迁移的历史

`src/content/moments/` 中的历史动态由同一套映射规则从 Memos API 一次性转换而来，
内容与旧站的日记页一致（含 2026-06 至 2026-08 的动态）。
