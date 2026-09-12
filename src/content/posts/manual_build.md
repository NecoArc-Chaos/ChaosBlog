---
title: 关于月姬R乱码修复
published: 2026-03-01
tags: [月姬R, 教程, NS模拟器, 技术]
category: 教程
draft: false
---

（本文只是整理了Aphcity大佬的发现，去给AphcityB站三连支持吧）  
原视频: <https://b23.tv/jXFjBj7>  

这个链接有每日自动构建修改后的版本  
<https://github.com/NecoArc-Chaos/Eden-for-Tsukihime-Remake>  

内含Android arm64-v8a和Windows x86-64的版本  
如果您的设备架构不同，可以尝试自行手动构建  

## 手动构建  

从[官网仓库](https://git.eden-emu.dev/eden-emu/eden/src/branch/master/docs/build/Android.md)克隆到本地  
补全所指示的依赖到Android Studio  
然后修改这个文件  

- src/video_core/texture_cache/util.cpp  
把大约在126行的代码  

```cpp
.depth = level == 0 && num_levels == 1
                     ? block_size.depth
                     : AdjustMipBlockSize<GOB_SIZE_Z>(num_tiles.depth, block_size.depth, level),
```

改为  

```cpp
.depth = AdjustMipBlockSize<GOB_SIZE_Z>(num_tiles.depth, block_size.depth, level),
```

删除171-177行（经过上一步修改）  
上一行是  

```cpp
[[nodiscard]] constexpr Extent3D TileShift(const LevelInfo& info, u32 level) {
//删掉以下代码，上面别删
    if (level == 0 && info.num_levels == 1) {
        return Extent3D{
            .width = info.block.width,
            .height = info.block.height,
            .depth = info.block.depth,
        };
    }
//注意别删多或删少了
```

将1310~1312行  

```cpp
static_assert(CalculateLevelSize(LevelInfo{{32, 32, 1}, {0, 0, 4}, {1, 1}, 4, 0, 1}, 0) == 0x40000);

static_assert(CalculateLevelSize(LevelInfo{{128, 8, 1}, {0, 4, 0}, {1, 1}, 4, 0, 1}, 0) == 0x40000);
```

改为  

```cpp
static_assert(CalculateLevelSize(LevelInfo{{32, 32, 1}, {0, 0, 4}, {1, 1}, 4, 0}, 0) == 0x4000);
```

然后按需构建即可  

（大概同样适用于PC, Linux等  
ps.我是小白，tm找半天都没找到Build - Select build variant在哪，最后发现有提供的script，就直接用了script  
报错就喂给ai～
