---
title: 把 Ubuntu 终端重新收拾了一遍
date: 2026-09-29 17:15:55
updated: 2026-09-29 17:15:55
description: 记录 Ubuntu 26.04.1 下的一次终端美化：Alacritty、JetBrainsMono Nerd Font、Starship，以及 eza、bat、fzf 和 zoxide 的配置。
categories: [Linux]
tags:
  - Ubuntu
  - Alacritty
  - Starship
  - Bash
  - Terminal
---

前两天把 Ubuntu 的终端重新收拾了一遍。

这次没有只换一个提示符就结束，而是把 Alacritty、字体、配色、Starship 和几个常用命令行工具一起调了。最后用的是 Tokyo Night + JetBrainsMono Nerd Font + Starship Powerline，目录浏览和历史搜索也顺手换成了 eza、fzf 这些工具。

环境是 Ubuntu 26.04.1 LTS，桌面终端用 Alacritty 0.16.1，Shell 还是 Bash。主要桌面用户是 `zumi`，Codex 执行命令时又是 `root`，所以两边的配置都得顾到，不然很容易出现“这个窗口有主题，另一个窗口又回到原样”的情况。

<!-- more -->

## 最后装了哪些东西

这套配置主要用了下面几个工具：

| 软件 | 当时的版本 | 用途 |
|---|---:|---|
| Starship | 1.22.1 | 接管 Bash 提示符 |
| eza | 0.23.4 | 替代日常使用的 `ls` |
| bat | 0.25.0 | 带高亮和行号的文件预览 |
| fzf | 0.67.0 | 搜索历史命令、文件和目录 |
| zoxide | 0.9.8 | 按使用频率跳转目录 |

核心安装命令是：

```bash
sudo apt update
sudo apt install eza bat fzf zoxide fonts-font-awesome \
  fonts-material-design-icons-iconfont unzip curl
```

Starship 当时已经装好了，所以这里只补齐剩下的工具和字体支持包。

`bat` 在 Ubuntu 里的程序名是 `batcat`，后面需要再做一层别名。

## 先处理字体

Powerline 提示符和 eza 图标依赖 Nerd Font 里的私有区字符。普通 JetBrains Mono 虽然写代码没问题，碰到这些图标就可能出现方框、问号或者分隔符错位。

这次安装的是完整的 **JetBrainsMono Nerd Font**，一共 96 个 `.ttf` 文件，放在：

```text
/usr/local/share/fonts/JetBrainsMonoNerd/
```

装完刷新字体缓存：

```bash
fc-cache -f /usr/local/share/fonts/JetBrainsMonoNerd
```

然后用 `fc-list` 确认 Fontconfig 能找到它。

Alacritty 里最终使用的字体族是：

```text
JetBrainsMono Nerd Font Mono
```

这里特意选了 `Mono` 变体。终端里还是每个字符老老实实占同样宽度比较省心，表格、缩进和 Powerline 分隔符都不容易歪。

## Alacritty 外观

桌面用户的配置文件在：

```text
/home/zumi/.config/alacritty/alacritty.toml
```

`root` 也放了一份：

```text
/root/.config/alacritty/alacritty.toml
```

窗口部分没有调得太夸张，只留了一点边距和透明度：

```toml
[window]
padding = { x = 12, y = 10 }
dynamic_padding = true
opacity = 0.94
blur = true
decorations = "Full"
```

94% 的不透明度还能看出一点背景，但不至于影响读字。`blur = true` 是否真有模糊效果，还要看 Wayland 合成器支不支持。

字体大小设成 13，垂直往下偏移 1 像素：

```toml
[font]
size = 13.0
normal = { family = "JetBrainsMono Nerd Font Mono", style = "Regular" }
bold = { family = "JetBrainsMono Nerd Font Mono", style = "Bold" }
italic = { family = "JetBrainsMono Nerd Font Mono", style = "Italic" }
bold_italic = { family = "JetBrainsMono Nerd Font Mono", style = "Bold Italic" }
offset = { x = 0, y = 1 }
```

配色用 Tokyo Night，主背景和文字颜色是：

```toml
[colors.primary]
background = "#1a1b26"
foreground = "#c0caf5"
dim_foreground = "#a9b1d6"
```

其他几种常用颜色也一起对齐：

| 用途 | 颜色 |
|---|---|
| 红色 | `#f7768e` |
| 绿色 | `#9ece6a` |
| 黄色 | `#e0af68` |
| 蓝色 | `#7aa2f7` |
| 紫色 | `#bb9af7` |
| 青色 | `#7dcfff` |

回滚历史加到 10,000 行，光标用闪烁的 Beam，间隔 500 毫秒；选中文字后自动复制。都是小改动，但用久了比单纯换一张配色更明显。

配置写入时，桌面上已经开着两个 Alacritty 窗口。因为它们启动时配置文件还不存在，只把文件写到磁盘不一定能让旧进程立刻发现，所以又通过 Alacritty 的 IPC 套接字推送了一次运行时配置。

当时读回来的结果是：

```text
字体：JetBrainsMono Nerd Font Mono 13.0
背景：#1a1b26
透明度：0.94
边距：12 × 10
```

新开的窗口就不需要管这些了，会直接读取 TOML 文件。

## Starship 提示符

Starship 配置分别放在：

```text
/home/zumi/.config/starship.toml
/root/.config/starship.toml
```

左侧提示符用了两行布局。第一行放环境信息，第二行只留输入符号：

```text
操作系统 → 用户名 → 当前目录 → Git 信息 → 开发环境
❯
```

右侧显示上一条命令状态、执行耗时和时间。超过 500 毫秒的命令才显示耗时，快命令就不占位置了。

现在能看到这些内容：

- Ubuntu/Linux 图标；
- 用户名，`root` 会使用警示色；
- 当前目录和只读标记；
- Git 分支、工作区状态、领先或落后的提交数；
- Node.js、Python、Rust、Go、Java、PHP、C；
- Docker Context；
- 上一条命令的退出状态、耗时和当前时间。

目录最多显示四层，再深就折叠成 `…/`。`Documents`、`Downloads`、`Music` 和 `Pictures` 这些目录还会换成对应图标。

输入指示符也会跟着上一条命令变色：成功是绿色，失败是红色。

## Bash 里怎么接起来

配置涉及这四个文件：

```text
/home/zumi/.bashrc
/home/zumi/.bash_aliases
/root/.bashrc
/root/.bash_aliases
```

初始化顺序是 fzf、zoxide，最后再让 Starship 接管 `PS1`：

```bash
if command -v fzf >/dev/null 2>&1; then
    eval "$(fzf --bash)"
fi

if command -v zoxide >/dev/null 2>&1; then
    eval "$(zoxide init bash)"
fi

if command -v starship >/dev/null 2>&1; then
    eval "$(starship init bash)"
fi
```

每一段都先用 `command -v` 检查。以后某个工具被卸载了，Bash 至少不会因为 `.bashrc` 还留着初始化命令而报错。

`zumi` 原来的 `.bashrc` 里还有两处重复的 Starship 初始化，这次一起删掉，只留上面这一处。

### eza

我还是沿用熟悉的 `ls`、`ll`，底下换成 eza：

```bash
alias ls='eza --icons=auto --group-directories-first'
alias ll='eza -al --icons=auto --group-directories-first --git'
alias la='eza -a --icons=auto --group-directories-first'
alias l='eza -F --icons=auto --group-directories-first'
alias lt='eza --tree --level=2 --icons=auto --group-directories-first'
```

`ll` 会顺便显示隐藏文件和 Git 状态，`lt` 用来看两层目录树。目录一多时比原来的输出好认一些。

### bat

Ubuntu 的可执行文件叫 `batcat`，所以做了两个别名：

```bash
alias bat='batcat'
alias preview='batcat --color=always --style=numbers,changes'
export BAT_THEME='OneHalfDark'
```

没有直接覆盖 `cat`。有些时候就是想要最普通的原始输出，给 `cat` 换功能反而容易给自己添麻烦。

### fzf

fzf 占终端高度大约 45%，用了反向布局、圆角边框和 Tokyo Night 配色。Bash 集成加载后，可以直接用：

- `Ctrl+R`：搜索历史命令；
- `Ctrl+T`：搜索文件；
- `Alt+C`：搜索并进入目录。

快捷键如果没有反应，还要看看是不是被桌面环境截走了。

### zoxide

zoxide 会记住常去的目录，之后可以这样跳：

```bash
z project
z enough
zi
```

`z 关键词` 会选最匹配的历史目录，`zi` 则交给 fzf 选择，省掉逐层输入路径。

另外保留了几个简单的彩色别名：

```bash
alias grep='grep --color=auto'
alias ip='ip --color=auto'
alias diff='diff --color=auto'
```

这些别名只在交互式 Bash 里生效，不会突然改变普通脚本的行为。

## `TERM=dumb` 是怎么回事

配置过程中一度检测到 `TERM=dumb`，看起来像是终端根本不支持颜色。

后来确认这是自动化命令执行会话的环境，不是桌面上的 Alacritty。实际交互式窗口使用的是 `xterm-256color`，真彩色和图标都能正常显示。

同一台机器上同时有桌面终端、SSH 和自动化执行环境时，直接看某一次命令的 `TERM` 很容易走错方向。还是要回到真正显示界面的那个会话里确认。

## 配完以后检查了什么

这次没有只看一眼“好像能用”，几个配置分别做了检查：

1. 用 `bash -n` 检查 `.bashrc` 和 `.bash_aliases`；
2. 用 `starship print-config` 解析 Starship 配置；
3. 用 `alacritty migrate --dry-run` 检查 Alacritty TOML；
4. 用 `fc-list` 确认 Nerd Font 已注册；
5. 分别以 `root` 和 `zumi` 启动测试用交互式 Bash；
6. 确认 `ll`、`bat` 等别名存在；
7. 确认 `z` 已注册成 Shell 函数；
8. 确认 fzf 配置变量已经加载；
9. 检查 Starship 能识别 Bash，并正常渲染系统和目录模块；
10. 通过 Alacritty IPC 读回两个窗口的字体、背景、透明度和边距。

改配置最怕“当前窗口看着正常，重开以后全部消失”，所以 root、桌面用户和新旧窗口都分别看了一遍。

## 生效和恢复

新开的 Alacritty 窗口会自动加载配置。已经打开的 Bash 不会自己重读 `.bashrc`，可以执行：

```bash
source ~/.bashrc
```

或者直接再开一个窗口。

修改前保留了两份备份：

```text
/home/zumi/.bashrc.before-terminal-refresh
/home/zumi/.config/starship.toml.before-terminal-refresh
```

需要恢复时，先把当前配置也留一份，再复制旧文件回来：

```bash
cp ~/.bashrc ~/.bashrc.terminal-theme-copy
cp ~/.config/starship.toml ~/.config/starship.toml.terminal-theme-copy

cp ~/.bashrc.before-terminal-refresh ~/.bashrc
cp ~/.config/starship.toml.before-terminal-refresh ~/.config/starship.toml
source ~/.bashrc
```

Alacritty 在这次调整前没有用户级配置文件。要恢复默认外观，把现在的配置改名后重新打开窗口即可：

```bash
mv ~/.config/alacritty/alacritty.toml \
   ~/.config/alacritty/alacritty.toml.terminal-theme-copy
```

只是觉得字号不合适的话，没必要整套恢复。改 `alacritty.toml` 里的 `font.size` 就行；透明度也是同理，`1.0` 完全不透明，`0.94` 是现在使用的值。
