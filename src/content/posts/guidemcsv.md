---
title: GoatCraft-Solian官方服务器
description: Where sheep&human live in harmony
published: 2026-02-09
tags: [MC服务器, Solian, 教程]
category: 教程
draft: false
---

# GoatCraft

**Solsynth Network的官方MC服务器**  

→[GoatCraft官方文档](https://kb.solsynth.dev/goatcraft/)←  

**多节点**/**基岩互通**/**生存养老**  
版本1.21.8+  
支持Drasl第三方登录（无需正版Java账号）  

**官方领域**: **加入此→**[**Solian领域**](https://web.solian.app/#/realms/solsynth)**←以与社区连接！**  
***开发*频道**可以联系开发者，声明问题或提供建议~  
**摸鱼频道**可以获取服务器消息~  


## 快速导航

- [✉️ 服务器地址](#服务器地址)
- [🌐 在线 3D 地图](#在线-3d-地图)
- [🔑 第三方登录教程 (GCA)](#第三方登录教程)
- [📱 基岩版 (PE/BE) 登入](#基岩版登入)
- [🛡️ 领地与经济系统](#指令与领地与经济系统)
- [🧪 进阶玩法：黏液科技](#进阶玩法黏液科技)

---

## 服务器地址

请**优先选择分流地址**  
（右端可点按复制）  
- (CAN)  
```
frp-lab.com:40894
```

- (东莞)  
```
frp-pen.com:21019
```

- (长沙)  
```
frp-gym.com:56335
```

- (HKG)  
```
frp-pet.com:41311
```

- (主线, 请**不要作为首选！**)  
```
playmc.solsynth.dev
```

复制到游戏内，加入即可

## 在线 3D 地图
GoatCraft 内设基于 **BlueMap** 的云端地图，可实时查看世界动态  
* **访问地址**：[https://playmc.solsynth.dev/](https://playmc.solsynth.dev/)  
* **功能**：查看在线玩家位置、领地边界及 3D 建筑细节  
* **注意**：首次加载资源较多，建议在 Wi-Fi 环境下开启并耐心等待  

---

## 第三方登录教程

>GoatCraft Auth（简称 GCA）是一个外置的登录工具，允许玩家在不使用正版 Minecraft 账户的情况下登录 GoatCraft 服务器。这对于那些没有正版账户但仍然希望体验 GoatCraft 的玩家来说非常有用。    

使用 GCA 进行登录会带来许多好处，例如和 Solar Network 交互的一些功能  
如果你曾使用正版账号游玩，可以选择迁移至 GCA 登录，具体请看→[SolianGCA官方文档](https://kb.solsynth.dev/goatcraft/auth/)←  
下面是普通登录教程  

### 所需物品  

- 一个邮箱（拥有所有权）  
- 有第三方登录功能的启动器  
    站长已测试LauncherX(macOS)，HMCL(win)和FCL(android)  

### 操作步骤  

1. **注册服务器账号**  
点进这个网址  
https://authmc.solsynth.dev/  
点上面使用 **Solarpass** 登陆  
登录你刚才注册的账号  
起一个好听的名字  
复制你的**Minecraft Token**(密码)  

2. **登录启动器**  

    - HMCL系启动器  
    
    选择添加**认证服务器**  
    服务器地址  
    ```
    https://authmc.solsynth.dev/authlib-injector
    ```
    确定后，在**侧边栏**中，点击新添加的认证服务器，标签为“Drasl”  
    填写用户名（玩家名字）和密码（Token）  
    
    - 其他启动器（可能有偏差）  
    
    选择第三方登录  
    电子邮箱填登录邮箱  
    密码填你的**Minecraft Token**  
    Authlib服务器填
    ```
    https://authmc.solsynth.dev/authlib-injector
    ```  
    
填写完成后登录即可  

3. **填写服务器**  

→[点这里跳转](#服务器地址)到服务器地址选择

→[服务器地址原帖](https://solian.app/posts/0199bee5-8494-74b5-83f9-3380777db628)  


---

## 基岩版登入  

1. **下载**  
   - **安卓**  
    在Play商店购买正版  
    或去苦力怕论坛下载（免费）  
   - **苹果**  
    在AppStore购买正版  
    或去微信哈士奇公众号获取（金币免费兑换）  
2. **登录Microsoft账号**  
(基岩版无正版验证)  
用手机号/邮箱直接注册一个微软账号  
登录即可  
3. **添加服务器**  
名称随便  
地址填(只有主线能用，不能填分流)  
```
playmc.solsynth.dev  
```

端口保留默认  

---

## 指令与领地与经济系统

### 常用指令

* `/tpa [玩家]` - 请求传送到对方处
* `/tpahere [玩家]` - 请求对方传送到此处
* `/tpaccept` - 接受传送请求

### 领地管理 (Towny)

服务器采用 **Towny** 领地系统  
你可以加入城镇或创建自己的国家  
> 详细操作请参考 [Towny 插件官方文档](https://mineplugin.org/Towny/%E6%95%99%E7%A8%8B)

### Solar Network 社交互通
（仅限 Solarpass 登录）  
* **经济互通**：使用 `/sn` 命令可在游戏币与 **源点** 间互转  
    * 游戏币 → 源点：1:1 (含 20% 手续费)
    * 源点 → 游戏币：1:1 (免手续费)

### 玩家商店 (QuickShop)

1.  **创建**：手持物品，**左键点击**箱子，在聊天框输入单价  
2.  **管理**：潜行并右键点击商店可开启管理菜单  
*Powered by QuickShop-Hikari.*  

---

## 进阶玩法：黏液科技
GoatCraft 有 Slimefun4 安装，不过因为其开发已经停止， 目前 1.21.8 的实验版本可能不够稳定。  
不过如果你觉得原版玩完了也不放可以尝试一下  
→[Slimefun4 插件官方文档](https://slimefun-wiki.guizhanss.cn/Getting-Started)←  

本文部分摘抄自GoatCraft官方文档  