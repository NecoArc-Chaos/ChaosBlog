# ChaosBlog

[Neco-ArcChaos](https://github.com/NecoArc-Chaos) 的个人博客，基于 [Shirone](https://github.com/LyraVoid/Shirone) 主题（Astro 7 + Svelte 5 + Tailwind CSS 4）。

由原 [ChaosWebsite](https://github.com/NecoArc-Chaos/ChaosWebsite)（Mizuki 主题）迁移而来。

## 本地开发

```bash
corepack enable
pnpm install
pnpm dev
```

要求：Node.js >= 22.12，pnpm 9.x（仓库锁定 `pnpm@9.14.4`）。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm new-post <filename>` | 创建新文章 |
| `pnpm memos:sync` | 从 Memos API 同步动态到 moments（构建时自动执行） |
| `pnpm anime:sync --provider bangumi` | 同步 Bangumi 追番快照 |
| `pnpm format` | Biome 格式化（提交前必跑） |
| `pnpm check` | Astro 诊断 |
| `pnpm check:manifest` | 校验组件清单 |
| `pnpm test` | 运行测试 |
| `pnpm build` | 构建站点与 Pagefind 索引 |

## 部署

Vercel（构建命令 `pnpm build`，输出目录 `dist`）。站点地址：https://www.nachaos.xyz/

配好 `VERCEL_DEPLOY_HOOK` Secret 后，`.github/workflows/refresh-moments.yml`
会每天自动重建一次站点，让 Memos 上的新动态上线。

## 内容来源

- **文章**：`src/content/posts/`（8 篇，从 Mizuki 迁入）
- **动态（moments）**：由构建期从 `memos.nachaos.xyz` 拉取并物化为
  `src/content/moments/*.md`，见 [docs/memos-sync.md](./docs/memos-sync.md)
- **番剧**：Bangumi 快照模式（`src/data/anime-snapshots/bangumi.json`，uid 1200587），
  本地 `src/data/anime.ts` 作为兜底数据
- **音乐**：本地 4 首 + 网易云歌单（`mixed` 模式）
- **字体**：Maruko Gothic，构建时自动子集化

主题文档：[docs.shirone.mysqil.com](https://docs.shirone.mysqil.com/)
