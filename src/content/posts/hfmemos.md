---
title: 零成本 HuggingFace 搭建 Memos (方法已挂)
published: 2026-06-26
tags: [技术, 教程, 白嫖]
category: 教程
draft: false
---

# 基于 Hugging Face + Cloudflare Workers 零成本搭建 Memos 备忘录指南

> [!WARNING]
> **方法已失效，HF现已砍掉space的免费docker服务**

Memos是一款开源多功能自托管网页备忘录，即写即存，多端访问。

| 使用场景 |                           |
| -------- | ------------------------- |
| 个人     | 私密or公开日记/备忘录清单 |
| 群组     | 朋友圈/回忆录             |
| 学校     | 公共相册/表白墙运营       |

常规思路是购买一台vps来运行  
缺点：1.太贵了 2.门槛高（大厂的vps还要成年）3.难维护  
4.没有购买独立ip的vps在访问项目网址还必须要带上端口号，丑

使用HF的Space服务可以免费部署轻量的docker  
使用CF的Worker服务可以免费使memos用上自定义域名

---

## 🧱 核心架构与成本

- **计算后端**：Hugging Face Spaces (Docker 镜像，永久免费)
- **持久化存储**：Hugging Face Storage Buckets (提供免费容量，解决容器休眠丢数据问题)
- **网络与域名**：Cloudflare Workers (免费额度每日 10 万次，用于绕过 HF 域名付费限制并绑定自定义域名)
- **总成本**：0 元（不含顶级域名年费）

---

## 🛠️ 部署操作步骤

### 第一步：Hugging Face 容器部署与数据持久化

1.  **创建 Space**：在 Hugging Face 创建一个 Spaces 项目，License 随意，结构选择`Docker`，Docker template 选择 `Blank`
2.  **挂载存储桶**：进入该 Space 的 `Settings` 页面，往下滚动找到 `Storage Buckets` 栏目，点击 `Mount a bucket` 按钮，确保默认挂载路径（Mount path）为 `/data`
3.  **配置 Dockerfile**：在项目根目录创建或编辑 Dockerfile，写入以下代码：

```dockerfile
FROM ghcr.io/usememos/memos:0.29.1
USER 1000
CMD ["--port", "7860", "--data", "/data"]

```

这里版本如果写latest不知道为什么会使用0.24.0而非最新，如果以后有更新，直接改版本号就行（确信）  
4. **保存编译**：提交代码（Commit）后，等待 Space 状态变为绿色的 Running  
此时，Memos 官方提供的直连 .hf.space 地址已可以正常访问

### 第二步：Cloudflare Workers 覆写 Host 反向代理

由于直接将自定义域名 CNAME 解析到 Hugging Face 会触发其官方网关的付费检测并返回 404 错误，需通过 Worker 强行改写请求头进行伪装

1.  **创建 Worker**：登录 Cloudflare 控制台，进入 **版本管理** -> **Workers 和 Pages**，创建一个全新的 Worker
2.  **写入代理代码**：进入 Worker 的代码编辑器，清空默认代码，将以下脚本贴入并点击 **保存并部署**：

```javascript
export default {
    async fetch(request, env, ctx) {
        const targetUrl = "https://你的项目名.hf.space"; // 替换为 HF 给你的真实直连网址

        const url = new URL(request.url);
        const target = new URL(targetUrl);

        url.hostname = target.hostname;
        url.protocol = target.protocol;

        const newRequest = new Request(url, request);
        newRequest.headers.set("Host", target.hostname); // 核心：强行伪装 Host 头

        return fetch(newRequest);
    },
};
```

### 第三步：绑定自定义二级域名

1.  **清理冲突记录**：前往 Cloudflare 的 **DNS 记录** 页面，**删除** 之前手动为该二级域名（如 memos.yourdomain.com）添加的任何 CNAME 或 A 记录  
    （如果没有忽略就行）
2.  **绑定自定义域名**：返回刚才建好的 Worker 页面，进入 **设置 (Settings)** -> **域名和路由 (Domains & Routes)** -> 点击 **添加自定义域名**
3.  **完成解析**：输入你的二级域名并保存。Cloudflare 会自动接管该域名的 DNS 解析并签发 SSL 证书

## 🎯 运行机制与管理

- **数据存储逻辑**：系统配置、账号密码及日常文本、图片，全都会安全地实时写入挂载的 /data/memos_prod.db 数据库中，容器重启不会丢失
- **冷启动表现**：免费容器在长时间无人访问时会自动进入休眠状态。休眠后首次访问自定义域名，会触发 Workers 自动唤醒 HF 容器，页面加载可能稍有延迟（十几秒），随后即可使用
- **速度**: 国内连CF的网络很一般，会有点慢

### 扩展

一键将memos转成瀑布流相册  
https://pixmo.cc/

演示: https://nachaos.pixmo.cc/
