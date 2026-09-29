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

Azure for Students 认证折腾了我两天。

一开始我以为填学校邮箱、收验证邮件就行，结果在个人 Microsoft 账户、学校组织账号和 GitHub Education 之间来回切。每次看起来都只差一步，页面给的错误又基本没什么帮助。

最后开通才弄明白：**登录 Azure 的账号和证明学生身份的邮箱，不一定是同一个账号。**

趁现在还记得，把中间遇到的几个坑记一下。

<!-- more -->

{% note info 先说结果 %}
我最后用个人 Microsoft 账户承载 Azure 订阅，学校邮箱只负责学术验证。GitHub Student Pack 是另一条申请入口，不等于 Azure 已经自动认可了学生身份。
{% endnote %}

## 学校账号不能直接用

我最开始直接拿学校账号登录，看到的是这个页面：

![当前账户类型不受支持](/post/azure-for-student/01-account-type-not-supported.png)

```text
Your current account type is not supported
```

这句提示看着很像是学校不受支持，实际卡住我的是账号类型。学校提供的 Microsoft 365 邮箱通常是组织账号，而 Azure for Students 这条注册流程要先登录个人 Microsoft 账户。

我退出了浏览器里的所有 Microsoft 账号，开无痕窗口，用个人账号进入 [Azure for Students](https://azure.microsoft.com/en-us/free/students/)。等页面要求验证学术身份时，再填学校邮箱。

如果学校本身提供 Azure 教育租户或专门的申请入口，那就应该按学校的说明来。这里说的是从 Azure 官方学生页面申请的情况。

## 学校邮箱验证也没一次通过

换对账号以后，认证仍然不算顺利。我先后遇到过学校域名未注册、验证邮件迟迟不到、链接打开后没有访问权限，以及一句非常笼统的“稍后重试”。

最没办法处理的是这个：

![验证服务暂时无法处理请求](/post/azure-for-student/03-no-customer-support.png)

```text
We are sorry, we can not process your request right now.
Please try after some time.
```

页面上已经没有什么能继续操作的东西了。反复刷新、连续发送验证邮件，只会多出一堆很快失效的链接。

后来我按这个顺序排查：

1. 国家和学校名称选官方写法，不用学院简称；
2. 检查学校邮箱的垃圾箱、隔离区和别名地址；
3. 只打开最新收到的验证邮件；
4. 如果页面开始混用多个账号，直接换无痕窗口重来；
5. 同一个错误持续出现，再去找支持，而不是继续改真实资料。

验证邮件有时会延迟。我遇到过隔了几个小时才一起到达的情况，短时间内没收到不一定是地址填错了。

如果提示“你的电子邮件域当前未向我们注册”，个人没办法在页面里把学校加进去。确认域名确实属于学校后，只能联系学校 IT，或者向 [Azure for Education Support](https://azureforeducation.microsoft.com/institutions/contact) 提交截图和学校信息。

## 又去试了 GitHub Student Pack

我的 GitHub Education 已经通过审核，于是又去试了 Student Developer Pack，以为这次总该直接通过了。

并没有。GitHub 负责确认 Pack 权益，Azure 订阅最后还是由 Microsoft 创建。

GitHub Support 的回复里有一条很关键：Microsoft 账户的主邮箱，最好与申请 GitHub Student Developer Pack 时使用的邮箱一致。

![GitHub Support 关于邮箱匹配的回复](/post/azure-for-student/04-github-support-reply.png)

走这条路线前可以先确认：

- GitHub Education 状态仍然有效；
- Student Developer Pack 页面能看到 Azure 权益；
- GitHub 与 Microsoft 账户使用同一个主要邮箱；
- 从权益页面进入后，尽量不要在中途切换账号。

有可用学校邮箱的话，我还是会先走 Azure 自己的验证。学校邮箱不被识别、GitHub Education 又已经通过时，再试 Student Pack。

## Portal 里看到订阅才算成功

表单显示成功后我仍然不太放心。直到 [Azure Portal](https://portal.azure.com/) 的“订阅”页面出现下面这项，才确定这两天没有白折腾：

```text
Azure for Students
状态：Active / 已启用
```

这份学生订阅目前不要求信用卡，包含 100 美元 Azure Credit，有效期 12 个月。额度和续期规则可能调整，准确内容还是看 [Azure for Students 官方页面](https://azure.microsoft.com/en-us/free/students/) 与 [Offer Details](https://azure.microsoft.com/en-us/pricing/offers/ms-azr-0170p/)。

{% note warning 免费额度不是无限资源 %}
额度用完或订阅到期后，如果不升级为即用即付，资源会被停用。创建虚拟机、数据库之前最好先看价格，不要把“免费申请”理解成“随便开都免费”。
{% endnote %}

## 开通后又撞上了区域限制

准备创建资源时，我才发现可选区域不多。这次账号允许部署到：

```text
koreacentral
indiasouthcentral
indonesiacentral
japanwest
centralindia
```

这不是所有学生订阅共用的固定列表。我的订阅里有一条 `Allowed resource deployment regions` 策略，资源位置被它限制了。

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

区域出现在列表里，也不代表每一种虚拟机和服务都能创建。学生订阅还会碰到 SKU、容量和配额限制。后来再看到部署失败，我会先看区域政策和具体规格，不再怀疑认证是不是又掉了。

## 支持该找谁

我在 GitHub 和 Microsoft 的支持页面之间绕了几次，它们处理的问题其实分得很清楚：

| 遇到的问题 | 应该联系谁 |
|---|---|
| GitHub Education 未通过、Pack 里没有 Azure | GitHub Education Support |
| Microsoft 登录、学校邮箱验证失败 | Azure for Education Support |
| 订阅已经存在，但资源或计费异常 | Azure Portal 的 Help + support |
| 学校域名、教育租户或邮件拦截 | 学校 IT |

提交工单时最好一次附上错误原文、发生时间、完整截图和已经试过的方法。公开贴图则记得遮住邮箱、手机号、订阅 ID、Session ID 和验证码。

## 开始用之前顺手设置一下

进入 Portal 后，我先在“成本管理 + 计费”里看了剩余额度和到期时间，又加了预算提醒：50%、80%、95% 各提醒一次。至少不会等资源突然停掉，才发现额度早就见底了。

虚拟机关机以后，磁盘、快照、公网 IP 或数据库不一定停止计费。实验结束时我会检查整个资源组，确认都不要了再一起删除。

到期时间也顺手写进了日历。重要数据还是另外留一份，不能只放在一个可能因为额度或策略停用的资源里。

页面如果一开始就写清楚“个人账户登录、学校邮箱验证”，我大概能少折腾一天。好在最后还是开出来了，之后创建资源前多看一眼区域和价格就行。

## 相关链接

- [Azure for Students](https://azure.microsoft.com/en-us/free/students/)
- [Azure for Students Offer Details](https://azure.microsoft.com/en-us/pricing/offers/ms-azr-0170p/)
- [Azure for Education FAQ](https://learn.microsoft.com/en-us/azure/education-hub/faq)
- [GitHub Student Developer Pack](https://education.github.com/pack)
- [GitHub Education 常见问题排查](https://docs.github.com/en/education/about-github-education/github-education-for-students/solving-problems-with-your-github-education-access)
- [Azure for Education Support](https://azureforeducation.microsoft.com/institutions/contact)
