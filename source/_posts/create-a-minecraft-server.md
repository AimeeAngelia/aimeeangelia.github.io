---
title: 一台 Minecraft 小服是怎么搭起来的
date: 2026-09-11 05:09:06
updated: 2026-09-24 16:20:00
cover: /images/minecraft-server/cover.png
top_img: /images/minecraft-server/cover.png
description: 记录我的 Minecraft 26.2 NeoForge 小服：为什么用 MCSManager、模组怎么取舍，以及客户端和备份怎样处理。
categories: [Minecraft]
tags:
  - Minecraft
  - NeoForge
  - MCSManager
  - Mod
---

这台服一开始只是想拿来和朋友玩。

真正搭起来才发现，让 Minecraft 跑起来并不费事；费事的是后面那些选择：模组放多少，客户端怎么统一，谁能动谁的箱子，服务器半夜卡了又该从哪里看。

我最后没有做成大型整合包，而是留在“原版生存加一点方便”的范围里。地图、物品查询、墓碑、领地和性能优化都有，大型科技、魔法与世界生成先不碰。这样少一点新鲜感，但存档更容易活得久。

这篇是这台小服的搭建记录，也留给以后忘记配置的自己。

<!-- more -->

## 现在的样子

服务端放在一台 Ubuntu 主机上，地址是 `192.168.1.239`，游戏文件位于：

```text
/opt/mc-server/server
```

Minecraft 使用 26.2，Loader 是 NeoForge 26.2.0.71。进程交给 MCSManager 管理，平时不用一直开着 SSH 窗口。

客户端则是 PCL2 中单独隔离出来的版本：

```text
D:\Program Files\PortableApps\PortableApps\PCL 正式版 2.13.1.1\.minecraft\versions\26.2-NeoForge_26.2.0.71
```

整套东西没有很复杂，大致就是：

```text
PCL2 客户端
  └─ Minecraft 26.2 + NeoForge + 客户端模组
                         │
                         ▼
Minecraft 服务端
  └─ /opt/mc-server/server
                         │
                         ▼
MCSManager
  └─ 启停、控制台、文件和计划任务
```

这里最值得提前定下来的不是内存，而是版本。Minecraft、NeoForge 和双端模组都固定版本，不让每个人随手下载一个“最新”。联机时报 `Mismatched mod list`，十次有九次不是玄学，就是双方的 jar 不一样。

## 先让 NeoForge 自己跑起来

我在 `/opt/mc-server` 下分了三个目录：

```text
/opt/mc-server/
├── backups/       # 备份
├── client-mods/   # 发给玩家的客户端模组
└── server/        # 正式服务端
```

先检查 Java：

```bash
java -version
```

这台机器现在用 OpenJDK 25。Minecraft 与 NeoForge 对 Java 的要求会变，不能看到“版本越高越好”就随便装，开服前最好再看一眼 [NeoForge 官方文档](https://docs.neoforged.net/user/docs/)。

把 installer 放进 `server` 后执行：

```bash
cd /opt/mc-server/server
java -jar neoforge-26.2.0.71-installer.jar --installServer
```

安装完成会出现 `run.sh`、`libraries/` 和 `user_jvm_args.txt`。第一次启动还会生成 `eula.txt`，确认接受 [Minecraft EULA](https://www.minecraft.net/eula) 后改成：

```properties
eula=true
```

内存先从一个不夸张的数值开始：

```text
-Xms2G
-Xmx4G
```

这套模组、少量玩家，用 4 GiB 作为上限够我起步。Minecraft 卡顿不一定是内存不够，一路把 `-Xmx` 往上加，最后很可能只是换来更长的垃圾回收。

NeoForge 的安装细节可以对照 [Installing a NeoForge Server](https://docs.neoforged.net/user/docs/server/)。我习惯先在命令行确认它能完整启动一次，再交给管理面板。这样面板启动失败时，至少知道问题在命令还是在游戏本身。

## 然后交给 MCSManager

为了让面板始终从正确目录启动，我在 `run.sh` 外面放了一个很薄的 `start.sh`：

```bash
#!/usr/bin/env bash
cd "$(dirname "$0")"
export PATH="/usr/bin:$PATH"
exec ./run.sh nogui "$@"
```

给它执行权限：

```bash
chmod +x /opt/mc-server/server/start.sh
```

MCSManager 实例里实际需要填的东西不多：

| 项目 | 设置 |
|---|---|
| 工作目录 | `/opt/mc-server/server` |
| 启动命令 | `./start.sh` |
| 停止命令 | `stop` |
| 编码 | `UTF-8` |
| 进程类型 | 普通进程 |

启动后看到：

```text
Done (...)! For help, type "help"
```

世界就加载完了。

我比较在意停止命令。更新或者重启时，用 `stop` 让服务端先保存玩家和区块，再结束 Java；不要把“结束进程”当成关服按钮。偶尔一次可能看不出问题，等哪天刚好撞上区块写入就不一定了。

MCSManager 还负责控制台、文件管理和计划任务，但它不是备份。面板能把服务器重新拉起来，不代表损坏的世界也会自己恢复。

## `server.properties` 我改了什么

完整配置很多，这台服真正改动的主要是下面这些：

```properties
difficulty=normal
gamemode=survival
max-players=20
motd=NeoForge 26.2 Modded Server

server-ip=
server-port=25565
view-distance=8
simulation-distance=8
pause-when-empty-seconds=60

allow-flight=true
spawn-protection=0
white-list=true
enforce-whitelist=true
enable-rcon=false
online-mode=true
```

`server-ip` 留空，没必要把服务端绑死在某张网卡上。视距和模拟距离都从 8 开始，实际玩过以后再调，不在开服第一天追求远景。

`spawn-protection=0` 是因为保护交给领地模组，避免出生点保护和领地规则叠在一起。`allow-flight=true` 则是为了少一点延迟或移动模组造成的误踢。

管理已经通过 MCSManager 控制台完成，所以 RCON 关掉。能少开一个入口，就少维护一个密码和端口。

服务器只给认识的人玩，白名单还是打开了：

```text
whitelist add <玩家名>
whitelist remove <玩家名>
whitelist reload
```

局域网小服也没有必要为了省一步登录验证就关闭正版验证。`online-mode=false` 会把身份校验问题留给服务器自己处理，除非很清楚相应风险，否则不要动它。

## 模组：先问“它解决什么”

刚开始整理模组时，很容易看到一个就想加一个。我的删选方式后来变得简单：如果说不出它在这台服里解决了什么问题，就先不装。

### 死亡和日常操作

**Gravestone** 把死亡掉落收进墓碑，回到死亡地点还能拿回来。**Death Backup** 再给管理员留一份恢复手段。两者看起来功能重复，其实一个面向玩家，一个用来处理墓碑异常。

**Carry On** 用来搬箱子和部分实体，整理基地省事很多；**Tax Free Levels** 去掉铁砧“过于昂贵”的硬上限，但经验消耗还在，没有直接把附魔改成免费。

这几项都动到了游戏规则或交互，客户端和服务端的版本要保持一致。

### 地图、领地和权限

地图用了 **Xaero's Minimap** 和 **Xaero's World Map**。二者界面统一，小地图标点也能自然接到世界地图，没必要再混用另一套地图模组。

领地是 **Open Parties and Claims**。直接在地图上圈区块，比让每个人记一串命令直观。权限再交给 **LuckPerms**，管理员需要什么就给什么，不把所有人都设成永久 OP。

小服最容易伤感情的通常不是打不过怪，而是谁顺手开错了箱子、拆错了一面墙。领地模组不浪漫，但很有用。

### 查配方和看信息

物品查询选 **JEI**，中文搜索再配 **JECharacters**。我没有同时装 JEI 和 REI，因为两套覆盖层、快捷键和搜索框放在一起，只会让界面更乱。

**Jade** 显示准星所指方块或实体的信息，**AppleSkin** 补充饥饿与饱和度预览。**Inventory Profiles Next** 负责背包整理和补货，它还需要 `libIPN`。

这些模组大多是在减少查 Wiki、翻箱子和手动整理的时间，不改变生存主线，所以留下来了。

### 性能模组

服务端放了 **FerriteCore、Lithium、ModernFix**，分别处理内存、游戏逻辑与加载方面的开销。它们能让资源使用好看一点，但不会拯救失控的强加载区块或离谱的视距。

客户端则使用 **Sodium、ImmediatelyFast、Dynamic FPS、Iris**。渲染优化和光影属于客户端体验，不需要因为名字里有“性能”就全部塞进服务端。

另外装了 **spark**。真正卡顿时，我宁愿先跑一次采样，看看到底是谁吃掉 Tick，也不想凭模组名字猜凶手。

{% note warning 别凭感觉判断安装端 %}
HUD、光影和按键功能通常只在客户端；领地、权限和世界规则必须在服务端；增加方块、实体或网络数据的模组通常需要双端。最终仍以模组作者的说明和启动日志为准。
{% endnote %}

Architectury API、Cloth Config、Collective、Kotlin for Forge、Searchables 这类依赖库，进游戏后可能完全看不到。看不到不代表没用，删之前先看是谁依赖它。

## 几个我改过的模组配置

Open Parties and Claims 接入 LuckPerms，并继续使用自己的队伍系统：

```toml
permissionSystem = "luck_perms"
primaryPartySystem = "default"
```

普通认领先给 50 个区块，强加载只给 5 个：

```toml
maxPlayerClaims = 50
maxPlayerClaimForceloads = 5
allowTouchingClaims = false
claimsSynchronization = "ALL"
```

强加载区块在附近没人时也会继续运行。农场多起来以后，这个数字比普通领地数量更值得克制。

墓碑只让主人破坏，打碎后直接拾取：

```toml
only_owners_can_break = true
break_pickup = true
sneak_pickup = false
```

Tax Free Levels 保留等级计算，但移除铁砧上限：

```json
{
  "levelBase": 30,
  "removeAnvilLimit": true
}
```

配置改完后正常重启。服务端运行时，不要一边在 MCSManager 文件管理器里保存，一边又通过 SSH 改同一个文件。

## PCL2 客户端

PCL2 里先安装 Minecraft 26.2，再安装 NeoForge 26.2.0.71，并打开版本隔离。隔离以后，这个实例拥有自己的 `mods/`、`config/` 和 `saves/`，不会和其他整合包互相污染。

服务器地址是：

```text
192.168.1.239:25565
```

这是局域网地址，只在同一网络内可用。需要从外面连接时，我更倾向先用可信的组网工具回到局域网，而不是把 MCSManager 和一堆管理端口一起暴露到公网。

给朋友发模组时，我会保留一份客户端包：

```text
client-pack/
├── mods/
├── config/
└── manifest.txt
```

`manifest.txt` 至少写清 Minecraft、NeoForge 和 jar 文件名。想严谨一点，再记录 SHA-256：

```powershell
Get-ChildItem .\mods\*.jar | Sort-Object Name |
  Get-FileHash -Algorithm SHA256 |
  Format-Table Hash, Path
```

这样有人连不上时，可以直接比较文件，而不是在群里问“你是不是都装了”。

## 比调参数更重要的是备份

平时最常用的控制台命令其实没几个：

```text
list
save-all flush
whitelist add <玩家名>
whitelist remove <玩家名>
spark profiler start
spark profiler stop
```

更新前我会先正常停服，然后把世界、模组、配置和权限一起打包：

```bash
cd /opt/mc-server/server
tar -czf "/opt/mc-server/backups/mc-$(date +%F-%H%M).tar.gz" \
  world config defaultconfigs mods \
  server.properties ops.json whitelist.json
```

备份只放在同一块磁盘上不太让人安心，所以还要定期复制到另一台设备。更重要的是偶尔真的恢复一次：压缩包能打开，不代表里面一定有完整世界。

更新也不赶进度。我通常先复制一个测试实例，只换一组相关组件，确认能启动、能打开旧存档、客户端能进服，再动正式目录。Java、NeoForge、几十个模组一起升级，出错以后基本只能靠运气猜。

## 出问题时先看哪里

启动失败先找日志中**最早出现的错误**：

```text
/opt/mc-server/server/logs/latest.log
/opt/mc-server/server/crash-reports/
```

最后一大段报错经常只是前面某个依赖缺失引发的连锁反应。常见原因无非是 Java 版本不对、缺少前置、NeoForge 版本不一致，或者把客户端专用模组放进了服务端。

连不上时则先看提示：

- `Connection refused`：服务端没有启动完，或者没有监听端口；
- `Connection timed out`：检查地址、防火墙和网络路径；
- `Not whitelisted`：把玩家加入白名单；
- `Mismatched mod list`：直接比较双方 jar 文件与版本。

如果是“能玩但是卡”，也先分清是哪一边。只有一个人的画面掉帧，多半看客户端渲染和光影；所有人都挖方块回弹，才去看服务端 TPS；只在探图时卡，就先降视距或考虑预生成区块。

## 先这样

这台服目前没有什么宏大的玩法设计，就是一套能和朋友安稳玩下去的原版增强环境。

NeoForge 负责加载模组，MCSManager 让我不用守着终端，领地避免误伤存档，spark 在卡顿时给一点线索。剩下的模组都只是让背包、地图和死亡没那么折磨人。

以后大概还会继续加东西，不过下一次看到“必装神级模组”时，我会先问一句：它到底解决了什么？
