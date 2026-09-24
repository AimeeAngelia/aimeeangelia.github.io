---
title: 搭建一台好玩又好管的 Minecraft NeoForge 服务器
date: 2026-09-11 05:09:06
updated: 2026-09-20 03:40:00
cover: /images/minecraft-server/cover.png
top_img: /images/minecraft-server/cover.png
description: 用 NeoForge、MCSManager 和一组克制的模组，搭建一台适合朋友联机、方便长期维护的 Minecraft 服务器。
categories: [Minecraft]
tags:
  - Minecraft
  - NeoForge
  - MCSManager
  - Mod
---

开一台 Minecraft 服务器不难，难的是让它在加入模组以后依然稳定、好玩，而且过几个月再回来时仍然知道该怎么维护。

这次我用 **Minecraft 26.2 + NeoForge 26.2.0.71** 搭建了一台朋友联机服：服务端运行在 Ubuntu 上，由 MCSManager 管理；客户端使用 PCL2，并通过版本隔离保存独立的模组和配置。本文从零整理整个过程，也解释每一组模组为什么值得留下。

<!-- more -->

{% note info 本文的目标 %}
保留原版生存的节奏，只增强地图、物品查询、死亡保护、领地与性能。大型科技、魔法和世界生成模组暂时不加，这样存档更轻，升级也更容易。
{% endnote %}

## 先设计，再开服

整套环境可以分成三层：

```text
PCL2 客户端
  └─ Minecraft 26.2 + NeoForge 26.2.0.71 + 客户端模组
                         │
                         │  192.168.1.239:25565
                         ▼
Minecraft 服务端
  └─ /opt/mc-server/server + 服务端模组 + 世界存档
                         │
                         ▼
MCSManager
  └─ 启停、控制台、文件管理与计划任务
```

这里最重要的原则是**版本固定**。Minecraft、NeoForge 和模组都使用明确版本，不让客户端各自下载“最新版”。小服最常见的连接失败，往往不是网络问题，而是双方的 Loader 或 jar 文件并不一致。

## 安装 NeoForge 服务端

### 准备 Java 与目录

先在服务器上确认 Java：

```bash
java -version
```

这台服务器使用 OpenJDK 25。不同 Minecraft 版本需要的 Java 版本可能不同，安装前应以 [NeoForge 官方文档](https://docs.neoforged.net/user/docs/) 为准。

服务端目录规划如下：

```text
/opt/mc-server/
├── backups/       # 备份
├── client-mods/   # 准备分发给客户端的模组
└── server/        # 服务端工作目录
```

进入工作目录，将 NeoForge installer 放进去：

```bash
cd /opt/mc-server/server
java -jar neoforge-26.2.0.71-installer.jar --installServer
```

安装完成后会生成 `run.sh`、`libraries/` 和 `user_jvm_args.txt`。第一次运行还会生成 `eula.txt`，阅读并同意 [Minecraft EULA](https://www.minecraft.net/eula) 后，将它改为：

```properties
eula=true
```

NeoForge 官方的完整安装步骤可以在 [Installing a NeoForge Server](https://docs.neoforged.net/user/docs/server/) 中找到。

### 启动脚本与内存

为了让 MCSManager 始终使用同一个入口，我在 `run.sh` 外包了一层 `start.sh`：

```bash
#!/usr/bin/env bash
cd "$(dirname "$0")"
export PATH="/usr/bin:$PATH"
exec ./run.sh nogui "$@"
```

然后赋予执行权限：

```bash
chmod +x /opt/mc-server/server/start.sh
```

内存写在 `user_jvm_args.txt`：

```text
-Xms2G
-Xmx4G
```

2 GiB 是启动时的堆大小，4 GiB 是上限。对于人数不多、以原版增强模组为主的服务器，这是一个合适的起点。内存并不是越多越好，真正卡顿时应该先看 TPS 和性能报告。

## 用 MCSManager 接管服务器

MCSManager 负责把游戏进程稳定地留在后台，并提供控制台和文件管理。创建实例时使用下面这组设置：

| 设置 | 内容 |
|---|---|
| 实例名称 | `Minecraft 26.2 NeoForge` |
| 工作目录 | `/opt/mc-server/server` |
| 启动命令 | `./start.sh` |
| 停止命令 | `stop` |
| 文件与终端编码 | `UTF-8` |
| 进程类型 | 普通进程 |

保存后进入实例控制台，点击启动。日志最后出现下面这行，就说明世界已经加载完成：

```text
Done (...)! For help, type "help"
```

{% note success 为什么使用 stop %}
`stop` 会先保存玩家与区块数据，再让 Java 进程退出。更新、重启和关机都应从 MCSManager 控制台正常停止，不要直接结束进程。
{% endnote %}

MCSManager 的安装与 Java 版实例说明可参考 [Quick start](https://docs.mcsmanager.com/) 和 [Setup Java Edition Server](https://docs.mcsmanager.com/setup_java_edition.html)。

## 配置一套适合小服的规则

`server.properties` 很长，但日常真正需要决定的项目并不多：

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
```

- `server-ip` 留空，让服务端自动监听可用网卡。
- `view-distance` 决定发送给客户端的区块范围，`simulation-distance` 决定实际进行 Tick 的范围。两者从 8 开始比较稳妥。
- `pause-when-empty-seconds=60` 会在无人在线时暂停世界 Tick，适合不是全天候有人挂机的朋友服。
- `spawn-protection=0` 把保护工作交给领地模组，避免两套规则叠加。
- `allow-flight=true` 可以减少移动模组、延迟或加载卡顿造成的误踢。
- MCSManager 已经能操作控制台，因此关闭 RCON，少维护一个入口。

正版账号联机时使用：

```properties
online-mode=true
```

仅在明确了解离线模式风险、并且服务器只用于受控网络时，才考虑 `online-mode=false`；无论哪种模式，朋友服都建议启用白名单。

添加玩家：

```text
whitelist add <玩家名>
whitelist reload
```

## 模组怎么选

我没有把所有“看起来不错”的模组都塞进去，而是按问题来选择：死亡太挫败、物品太难查、基地需要保护、客户端需要更流畅、管理员需要知道服务器为什么卡。

{% tabs mod-groups, 1 %}
<!-- tab 生存体验 -->

**Gravestone + Death Backup**

死亡后由 Gravestone 保存掉落物，玩家可以回到死亡地点取回；Death Backup 再保留一份管理员可恢复的数据。前者改善体验，后者处理墓碑异常，两层保护各司其职。

**Carry On**

可以搬运箱子和部分实体，整理基地非常方便。它会改变交互规则，所以服务端和客户端需要保持版本一致。

**Tax Free Levels**

移除铁砧“过于昂贵”的硬限制，但仍保留经验消耗。相比完全免费的附魔，它更接近原版节奏。

<!-- endtab -->
<!-- tab 地图与领地 -->

**Xaero's Minimap + Xaero's World Map**

小地图负责即时定位，世界地图负责探索记录。二者界面一致、数据互通，很适合长期生存。

**Open Parties and Claims**

直接在地图上认领区块，保护箱子、建筑和动物；队伍成员还可以共享位置。它比只靠出生点保护更直观。

**LuckPerms**

为领地管理和管理员命令提供细粒度权限。日常权限交给用户组，不需要把所有管理者都设成永久 OP。

<!-- endtab -->
<!-- tab 信息与操作 -->

**JEI + JECharacters**

JEI 用来查看物品与配方，JECharacters 增加中文拼音搜索。这里选择 JEI 而不是同时启用 JEI 与 REI，避免覆盖层和快捷键重复。

**Jade + AppleSkin**

Jade 显示准星所指方块或实体的信息，AppleSkin 补充饥饿值和饱和度预览。它们提供信息，但不改变生存玩法。

**Inventory Profiles Next**

提供背包整理、连续移动和补货功能，依赖 `libIPN`。

<!-- endtab -->
<!-- tab 性能与诊断 -->

**服务端：FerriteCore、Lithium、ModernFix**

分别从内存、游戏逻辑和加载流程减少开销。它们不会替代合理的视距与模组数量，但能让小型服务器的资源使用更平稳。

**客户端：Sodium、ImmediatelyFast、Dynamic FPS、Iris**

前三者负责渲染效率和后台降载，Iris 提供光影支持。它们属于客户端体验，不需要复制到服务端。

**spark**

当服务器卡顿时记录 Tick、CPU 与调用栈。先采样再调整，比凭感觉删模组可靠得多。

<!-- endtab -->
{% endtabs %}

### 依赖模组

Architectury API、Cloth Config、Collective、Kotlin for Forge、Searchables 等属于依赖库。它们本身不一定出现明显功能，但被其他模组需要，不能只因为“游戏里看不到”就删除。

{% note warning 模组放哪一端？ %}
渲染、光影、HUD、按键整理通常只放客户端；领地、权限、死亡数据和世界规则必须放服务端；会增加方块、实体或网络数据的模组通常需要双端安装。最可靠的判断依据仍然是模组作者说明与启动日志。
{% endnote %}

## 几项关键模组配置

### 领地与权限

Open Parties and Claims 使用 LuckPerms，并采用自带的队伍系统：

```toml
permissionSystem = "luck_perms"
primaryPartySystem = "default"
```

小服可以从每人 50 个认领区块、5 个强加载区块开始：

```toml
maxPlayerClaims = 50
maxPlayerClaimForceloads = 5
allowTouchingClaims = false
claimsSynchronization = "ALL"
```

强加载区块会在无人附近时继续运行，农场和机器太多会持续消耗 Tick，因此数量应明显少于普通领地。

### 墓碑与铁砧

墓碑只允许主人破坏，并在破坏后拾取物品：

```toml
only_owners_can_break = true
break_pickup = true
sneak_pickup = false
```

Tax Free Levels 保留 30 级作为经验计算基准，同时移除铁砧上限：

```json
{
  "levelBase": 30,
  "removeAnvilLimit": true
}
```

这些配置修改后都需要正常重启服务器。不要在实例运行时同时从面板和 SSH 编辑同一个文件。

## 配置 PCL2 客户端

客户端目录为：

```text
D:\Program Files\PortableApps\PortableApps\PCL 正式版 2.13.1.1\.minecraft\versions\26.2-NeoForge_26.2.0.71
```

在 PCL2 中完成下面几步：

1. 安装 Minecraft 26.2。
2. 安装 NeoForge 26.2.0.71。
3. 开启版本隔离，让这个实例拥有独立的 `mods/`、`config/` 和 `saves/`。
4. 将客户端模组复制进该版本的 `mods/`。
5. 启动一次，在主菜单确认 NeoForge 与模组均已加载。

服务器地址填写：

```text
192.168.1.239:25565
```

这是局域网地址。离开同一网络后，需要先通过可信的组网方式接入局域网，而不是把面板和管理端口一起暴露到互联网。

### 客户端与服务端怎样同步

建议为客户端包保留一份清单：

```text
client-pack/
├── mods/
├── config/
└── manifest.txt
```

`manifest.txt` 记录 Minecraft、NeoForge、模组文件名和 SHA-256。Windows 下可用 PowerShell 生成校验值：

```powershell
Get-ChildItem .\mods\*.jar | Sort-Object Name |
  Get-FileHash -Algorithm SHA256 |
  Format-Table Hash, Path
```

以后更新时先在测试实例中替换模组，确认能启动、能进服、能打开旧存档，再把同一批文件发给玩家。

## 日常管理

### 常用控制台命令

```text
list                         # 在线玩家
save-all flush               # 立即保存世界
whitelist add <玩家名>       # 添加白名单
whitelist remove <玩家名>    # 移除白名单
op <玩家名>                  # 授予 OP
deop <玩家名>                # 收回 OP
spark profiler start         # 开始性能采样
spark profiler stop          # 结束采样并生成报告
```

### 备份

一次完整备份至少应包含世界、模组、配置和玩家权限数据。最稳妥的做法是先在 MCSManager 中正常停止实例，再执行：

```bash
cd /opt/mc-server/server
tar -czf "/opt/mc-server/backups/mc-$(date +%F-%H%M).tar.gz" \
  world config defaultconfigs mods \
  server.properties ops.json whitelist.json
```

备份文件还要定期复制到另一块磁盘或另一台设备。真正更新前，先把备份恢复到一个测试目录并启动一次，确认它确实可用。

### 更新顺序

```text
正常停服
  → 完整备份
  → 在测试实例更新 NeoForge 与模组
  → 阅读完整启动日志
  → 客户端联机测试
  → 更新正式实例
```

不要在同一次更新中顺手升级 Java、NeoForge 和所有模组。一次只改变一组相关组件，出问题时才容易定位和回滚。

## 常见问题

{% tabs troubleshooting, 1 %}
<!-- tab 启动失败 -->

先查看 MCSManager 控制台中**最早出现的错误**，再检查：

```text
/opt/mc-server/server/logs/latest.log
/opt/mc-server/server/crash-reports/
```

常见原因是 Java 版本不匹配、缺少依赖、NeoForge 版本不一致，或者把客户端专用模组放进了服务端。

<!-- endtab -->
<!-- tab 无法连接 -->

- `Connection refused`：服务端没有监听端口，或正在启动/重启。
- `Connection timed out`：检查地址、主机防火墙与网络路径。
- `Not whitelisted`：将玩家加入白名单后执行 `whitelist reload`。
- `Mismatched mod list`：逐个比较双方 jar 文件名和版本。

<!-- endtab -->
<!-- tab 游戏卡顿 -->

- 只有一个人的画面卡：检查客户端光影、渲染距离和 Sodium/Iris 配置。
- 所有人挖方块回弹：检查服务端 TPS，并使用 spark 采样。
- 只有探图时卡：降低视距，或在低峰期预生成区块。
- 内存持续上涨：先分析模组和区块加载，不要只提高 `-Xmx`。

<!-- endtab -->
{% endtabs %}

## 完成

这套服务器没有追求“模组数量”，而是让每个组件都解决一个具体问题：NeoForge 提供模组环境，MCSManager 负责进程管理，领地和权限保护多人存档，体验模组减少重复操作，性能模组与 spark 让维护有据可查。

做到下面五件事，服务器就已经具备长期运行的基础：

- 固定 Minecraft、NeoForge 和模组版本；
- 分清客户端、服务端与双端模组；
- 用 `stop` 正常关闭实例；
- 更新前备份并在测试实例验证；
- 卡顿时先看日志和性能报告。

剩下的，就是进服造房子了。
