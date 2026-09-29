---
name: zh-personal-blog
description: Draft, revise, and review Chinese personal-blog posts that grow from real experience, technical practice, projects, purchases, games, or everyday observations. Use for posts in this Hexo blog when the writing should be concrete, personal, lightly conversational, and free of generic AI or marketing prose.
---

# 中文个人博客写作

为 Marginalia 写出像个人长期记录、而不是内容产品的文章。文章可以完整，也可以只是一次排错、一项购买、一段体验或一个尚未完成的项目记录。

## 先确定材料边界

- 只把用户笔记、现有文件、实际运行结果、截图和可靠来源当作事实。
- 不虚构亲历、朋友对话、测试结果、价格、节省时间、情绪或“后来证明”。必要信息缺失时，保留未知、使用明确的待补标记，或向用户询问。
- 区分亲自观察、个人判断和外部事实。会变化的外部事实需要核实时，优先查一手来源。
- 修改现有文章时，保留 frontmatter、Hexo 标签、代码块、命令、路径、链接目标和图片引用，除非用户明确要求改动。

## 选择文章路线

只读取与当前文章相关的路线，不要为了保险把三份都加载：

- 配置、部署、排错、教程和技术体验：读取 [technical-note.md](references/technical-note.md)。
- 游戏、动漫、设备、购买、生活片段和兴趣清单：读取 [hobby-log.md](references/hobby-log.md)。
- 自制工具、网站主题、软件和持续开发项目：读取 [project-log.md](references/project-log.md)。

起草或进行明显改写时，再读取 [reference-style.md](references/reference-style.md)。它以 Homulilly 的代表文章作为第一版风格样本。仅校对错字或格式时不必加载文风资料。

## 写作原则

1. 从具体事情进入：遇到的问题、刚完成的操作、一次购买、某个结果或当时的念头。没有必要先解释时代背景或文章价值。
2. 结构服从材料。技术文章可以详细，兴趣记录可以一项只有一句；不要把所有内容拉成同样长度。
3. 具体信息承担可信度：时间、版本、路径、报错、价格、限制、失败尝试和截图，比形容词更重要。
4. 作者可以直接判断“喜欢”“麻烦”“不值”“先放着”，但判断必须来自用户提供的立场或已有文章，不替作者编态度。
5. 允许短句、括号、补充、删除线和后续 `Update`。具体强度参考同类样本，不要为了装真人而故意写错、堆网络用语或随机加入表情。
6. 不要求每篇文章都面面俱到。个人博客可以明确写“这里只记录我的情况”。
7. 小标题只在帮助定位时使用；简短文章不强行拆成“背景—分析—总结”。
8. 结尾可停在最后一个有用事实、当前判断、遗留问题或 TODO。没有新的内容就不要写总结和升华。

## 完稿检查

初稿完成后读取 [editorial-check.md](references/editorial-check.md)，做一次克制的审校。优先保留作者辨识度，不因某个单独词语或标点就重写整段。

默认只交付可直接使用的终稿。用户要求审校说明时，先列最关键的少量问题，再给终稿。
