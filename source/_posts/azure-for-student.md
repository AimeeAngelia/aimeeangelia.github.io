---
title: 折腾两天，我终于通过了 Azure for Students 认证
date: 2026-08-23 05:17:49
updated: 2026-09-24 16:20:00
cover: /images/azure-for-student/azure-student-cover.png
top_img: /images/azure-for-student/azure-student-cover.png
description: 学校邮箱、个人 Microsoft 账户和 GitHub Student Pack 到底该用哪一个？记录一次并不顺利的 Azure for Students 认证。
categories: [Azure]
tags:
  - Azure
  - Azure for Students
  - GitHub Student Pack
  - 学生优惠
  - 云计算
---

本来以为这件事很简单：填学校邮箱，收一封验证邮件，然后得到 100 美元额度。

结果我在个人 Microsoft 账户、学校组织账号和 GitHub Education 之间来回切了两天。每次都像只差最后一步，页面却只丢下一句没什么帮助的错误。

最后通过以后再回头看，最容易弄错的其实只有一件事：**登录 Azure 的账号和用来证明学生身份的邮箱，不一定是同一个账号。**

这篇就按我遇到问题的顺序记一下。以后再碰到类似的认证，至少不用从三个网站的登录页重新猜一遍。

<!-- more -->

{% note info 先说结果 %}
我最后用个人 Microsoft 账户承载 Azure 订阅，学校邮箱只负责学术验证。GitHub Student Pack 是另一条申请入口，不等于 Azure 已经自动认可了学生身份。
{% endnote %}

## 第一个坑：学校账号不能直接用

我最开始直接拿学校账号登录，看到的是这个页面：

![当前账户类型不受支持](/post/azure-for-student/01-account-type-not-supported.png)

```text
Your current account type is not supported
```

这句提示很容易让人怀疑学校不受支持，实际上更可能是账号类型不对。学校提供的 Microsoft 365 邮箱通常属于组织账号，而 Azure for Students 的这条注册流程需要先登录个人 Microsoft 账户。

我的处理方式是退出浏览器里所有 Microsoft 账号，开一个无痕窗口，再用个人账号进入 [Azure for Students](https://azure.microsoft.com/en-us/free/students/)；等页面要求验证学术身份时，才填写学校邮箱。

如果学校本身提供 Azure 教育租户或专门的申请入口，那就应该按学校的说明来。这里说的是从 Azure 官方学生页面申请的情况。

## 学校邮箱也没有一次通过

换对账号以后，认证仍然不算顺利。我先后遇到过学校域名未注册、验证邮件迟迟不到、链接打开后没有访问权限，以及一句非常笼统的“稍后重试”。

其中最让人没办法的是这个：

![验证服务暂时无法处理请求](/post/azure-for-student/03-no-customer-support.png)

```text
We are sorry, we can not process your request right now.
Please try after some time.
```

这种页面没有值得继续点的按钮。反复刷新、连续发送验证邮件，除了制造更多失效链接，基本不会让验证服务突然恢复。

后来我给自己定了一个比较朴素的排查顺序：

1. 国家和学校名称选官方写法，不用学院简称；
2. 检查学校邮箱的垃圾箱、隔离区和别名地址；
3. 只打开最新收到的验证邮件；
4. 如果页面开始混用多个账号，直接换无痕窗口重来；
5. 同一个错误持续出现，再去找支持，而不是继续改真实资料。

验证邮件有时会延迟。我遇到过隔了几个小时才一起到达的情况，所以短时间内收不到邮件，不一定是地址填错了。

至于“你的电子邮件域当前未向我们注册”，个人没办法在页面里手动添加学校。确认域名确实属于学校后，只能联系学校 IT，或者向 [Azure for Education Support](https://azureforeducation.microsoft.com/institutions/contact) 提交截图和学校信息。

## 我也试了 GitHub Student Pack

GitHub Education 已经审核过学生身份，所以我一度以为从 Student Developer Pack 进去会直接通过。实际并不是这样：GitHub 负责确认 Pack 权益，Azure 订阅最终还是由 Microsoft 创建。

GitHub Support 的回复里有一条很关键：Microsoft 账户的主邮箱，最好与申请 GitHub Student Developer Pack 时使用的邮箱一致。

![GitHub Support 关于邮箱匹配的回复](/post/azure-for-student/04-github-support-reply.png)

如果准备走这条路线，可以先确认：

- GitHub Education 状态仍然有效；
- Student Developer Pack 页面能看到 Azure 权益；
- GitHub 与 Microsoft 账户使用同一个主要邮箱；
- 从权益页面进入后，尽量不要在中途切换账号。

有可用学校邮箱时，我仍然建议先走 Azure 自己的学校邮箱验证。学校邮箱不被识别、但 GitHub Education 已经通过时，再把 Student Pack 当作备用入口。

## 看到订阅以后，才算真的成功

表单显示成功并不代表订阅已经可用。我是在 [Azure Portal](https://portal.azure.com/) 的“订阅”页面看到下面这项后，才终于确定这两天没有白折腾：

```text
Azure for Students
状态：Active / 已启用
```

这份学生订阅目前不要求信用卡，包含 100 美元 Azure Credit，有效期为 12 个月。额度和续期规则以后可能调整，准确内容还是看 [Azure for Students 官方页面](https://azure.microsoft.com/en-us/free/students/) 与 [Offer Details](https://azure.microsoft.com/en-us/pricing/offers/ms-azr-0170p/)。

{% note warning 免费额度不是无限资源 %}
额度用完或订阅到期后，如果不升级为即用即付，资源会被停用。创建虚拟机、数据库之前最好先看价格，不要把“免费申请”理解成“随便开都免费”。
{% endnote %}

## 通过认证后，我又撞上了区域限制

订阅成功后，我准备创建资源，才发现可选区域并不多。这次账号允许部署到：

```text
koreacentral
indiasouthcentral
indonesiacentral
japanwest
centralindia
```

这不是所有学生订阅共用的一张固定列表。我的订阅里有一条 `Allowed resource deployment regions` 策略，直接限制了资源位置。

在 Portal 里可以从这里查看：

```text
Policy
  → Assignments
  → Allowed resource deployment regions
  → Parameters / Allowed locations
```

也可以用 Azure CLI 查看订阅当前可见的位置：

```bash
az account list-locations \
  --subscription <subscription-id> \
  --output table
```

区域出现在列表里，也不代表每一种虚拟机和服务都能创建。学生订阅还可能遇到 SKU、容量和配额限制。我后来再看到部署失败，会先检查区域政策，再看具体规格，而不是立刻怀疑认证又失效了。

## 找支持时，先找对人

我在 GitHub 和 Microsoft 支持页面之间绕过几次。后来发现它们的边界其实很清楚：

| 遇到的问题 | 应该联系谁 |
|---|---|
| GitHub Education 未通过、Pack 里没有 Azure | GitHub Education Support |
| Microsoft 登录、学校邮箱验证失败 | Azure for Education Support |
| 订阅已经存在，但资源或计费异常 | Azure Portal 的 Help + support |
| 学校域名、教育租户或邮件拦截 | 学校 IT |

提交工单时，把错误原文、发生时间、完整截图和已经尝试过的方法一次写清楚，会比只发一句“无法认证”省很多来回。公开贴图则记得遮住邮箱、手机号、订阅 ID、Session ID 和验证码。

## 开始使用前顺手做的几件事

进入 Portal 后，我先在“成本管理 + 计费”里看了剩余额度和到期时间，并给订阅加上预算提醒。50%、80%、95% 各提醒一次，至少不会等资源突然停掉才发现额度已经见底。

还有一个容易忽略的地方：虚拟机关机以后，磁盘、快照、公网 IP 或数据库不一定停止计费。实验结束时，我现在会直接检查整个资源组；确认都不要了，再把资源组一起删掉。

最后把到期时间写进日历。学生订阅适合拿来学习和做短期实验，但重要数据不能只留在一个随时可能因额度或策略停用的资源里。

## 最后

这次真正耽误时间的不是哪一个报错，而是三个身份挤在同一条流程里：个人 Microsoft 账户负责登录和持有订阅，学校邮箱负责证明在读，GitHub Student Pack 则提供另一条权益入口。

页面如果一开始就把这句话写清楚，我大概能少折腾一天。

好在订阅最后还是开出来了。100 美元拿来试虚拟机、数据库和一些平时舍不得开通的云服务已经很够用——只是在按下“创建”以前，我现在会先多看一眼区域和价格。

## 相关链接

- [Azure for Students](https://azure.microsoft.com/en-us/free/students/)
- [Azure for Students Offer Details](https://azure.microsoft.com/en-us/pricing/offers/ms-azr-0170p/)
- [Azure for Education FAQ](https://learn.microsoft.com/en-us/azure/education-hub/faq)
- [GitHub Student Developer Pack](https://education.github.com/pack)
- [GitHub Education 常见问题排查](https://docs.github.com/en/education/about-github-education/github-education-for-students/solving-problems-with-your-github-education-access)
- [Azure for Education Support](https://azureforeducation.microsoft.com/institutions/contact)
