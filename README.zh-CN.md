# 团队任务版

[English](README.md) | 简体中文

## 下载 Windows 安装包

**[下载 team-todo-setup.exe](https://github.com/there-is-a-spirit-in-the-abyss/team-todo/releases/latest/download/team-todo-setup.exe)** · [全部版本与校验文件](https://github.com/there-is-a-spirit-in-the-abyss/team-todo/releases)

下载后双击 `.exe`，填写 SSH 登录信息，选择服务器目录，再点击部署。
电脑无需另外安装 Python、Node.js 或 SSH。默认服务器目录为 `/team-todo`。
部署后打开网页，注册自己的账号即可使用。
仓库保持私有期间，下载安装包需要登录有访问权限的 GitHub 账号。

详见[安装器使用说明](installer/README.md)。GitHub 发布工作流通过后，安装器会直接
拉取预构建的应用镜像；本地构建的安装器包含干净源码，由服务器上的 Docker 自动构建。

## 项目介绍

这是一个可以自行部署的团队任务树应用，支持本地账号、团队申请、多个项目、
共享暂存区和可视化进度。项目从汇漾的飞书团队模块独立而来，
无需飞书、Muse、大模型、邮箱或第三方身份服务，只需提供自己的服务器。

## 使用 Docker 快速启动

Windows 用户可以使用[中文图形安装器](installer/README.md)。安装器已包含客户端依赖，
自动连接服务器并完成部署，无需飞书或模型凭据。

手动部署时，先安装带有 Compose 的 Docker，再在项目目录执行：

```sh
docker compose up --build -d
```

打开 **http://localhost:8000**，注册自己的账号。
首次安装没有预置用户、团队、项目或任务。数据保存在 `team-data` 命名卷中，
容器重启和重建后仍保留。`docker compose down -v` 会删除该安装的数据卷，
只有明确需要删除数据时才使用。

服务器部署时，将 `.env.example` 复制为 `.env`，将 `PUBLIC_URL` 设置为实际访问地址，
例如 `https://tasks.example.com`，协议、主机名和端口必须完全一致。
应用仅监听本机回环地址，由 HTTPS 反向代理转发访问；也可以使用 SSH 隧道。
反向代理应保留 `Host`，并将请求转发到 `127.0.0.1:8000`。
每次修改操作都会检查请求来源，HTTPS 部署会自动使用安全会话 Cookie。

## 团队与任务规则

每套安装对应一个企业。使用唯一用户名、密码和显示名称注册，无需邮箱。
一个用户可以加入多个团队。登录后有三个入口：我的团队、创建团队和搜索团队。
搜索只接受完整的十位团队码，不公开企业目录。搜索结果会显示可申请、待审批或已加入；
申请被拒绝后可以再次申请。

团队中的每位当前成员都可以批准或拒绝入队申请。
只有当前创建者可以移除成员、转让团队或解散团队。
普通成员可以退出，创建者退出前需要先转让团队。
被移除的成员在后续请求中立即失去访问权限。
各团队的成员、项目、任务树和暂存区相互独立。

- 任何成员都可以创建项目和任务，任务始终保留原作者。
- 只有作者可以编辑任务、修改状态或删除任务分支。删除分支会同时删除其中由其他人
  创建的子任务，确认窗口会列出受影响内容。
- 所有成员都可以将完整分支移动到项目、其他任务或暂存区。系统拒绝形成循环，
  并保留分支内部的父子关系。
- 作者退群后，其任务可以由剩余成员维护。作者重新加入后，看到最新任务状态并恢复权限。
- 项目进度将已完成和已放弃任务视为结束。项目状态根据任务计算。
  从未使用的空项目会保留，曾经有任务的项目在清空后自动消失。
- 团队创建者没有额外的任务编辑权限。此版本不包含截止时间、提醒或周报功能。

多人同时修改时，过期版本会返回冲突，不会覆盖较新的内容；页面会刷新最新任务板供确认。

## 语言设置

应用默认使用美式英文（`en-US`），可以切换为简体中文（`zh-CN`）、
西班牙语（`es`）、巴西葡萄牙语（`pt-BR`）或德语（`de`）。
登录前即可切换语言，设置会保存在浏览器中；登录后也会保存到账号。
切换语言只影响界面文字，成员姓名、团队与项目名称、任务标题和备注均保持原样。

## 本地 Python 开发

需要 Python 3.11 及以上版本，以及用于构建前端的 Node.js 22 及以上版本。

```sh
python -m venv .venv
```

激活虚拟环境：Windows 执行 `.venv\Scripts\activate`，
Linux 或 macOS 执行 `source .venv/bin/activate`，然后继续执行：

```sh
python -m pip install '.[test]'
cd web
npm ci
npm run build
cd ..
python -m uvicorn team_todo.app:app --host 127.0.0.1 --port 8000
```

本地默认配置为 `PUBLIC_URL=http://localhost:8000`、
`DATABASE_PATH=data/team-todo.db` 和 `STATIC_DIR=web/dist`。
Python 应用通过环境变量读取配置，不会自动加载 `.env`；Compose 会读取 `.env` 进行变量替换。

使用 Vite 开发时，将后端 `PUBLIC_URL` 设置为 `http://127.0.0.1:5173`，
在 8000 端口启动后端，在 `web` 目录执行 `npm run dev`，并打开上述地址。
Vite 会将 `/api` 请求代理到后端。

## 密码恢复与备份

服务器管理员可以在本机重置用户密码。系统会私下提示输入密码，重置后撤销该用户的全部会话：

```sh
docker compose exec app python -m team_todo.manage reset-password USERNAME
```

本地运行时使用 `python -m team_todo.manage reset-password USERNAME`。
自动化管理可添加 `--password-stdin`，从标准输入读取一行密码。
避免将真实密码放入命令行或提交到文件中。

创建在线一致性 SQLite 备份：

```sh
docker compose exec app python -m team_todo.manage backup /app/data/backup.db
docker compose cp app:/app/data/backup.db ./backup.db
```

本地运行时使用 `python -m team_todo.manage backup /absolute/path/backup.db`。
备份可能包含私有业务数据，应与源码仓库分开保管。
恢复前停止应用、保留当前数据库，再用一致性备份替换；
不要将旧数据库的 WAL 或 SHM 文件与恢复后的数据库混用。
文件权限应允许容器中的用户标识 10001 读写恢复文件。

## 验证与源码交付

```sh
python -m pytest
cd web
npm test
npm run build
npm run test:e2e
```

浏览器测试需要 Chromium，可在 `web` 目录执行 `npx playwright install chromium` 安装。
测试通过真实接口操作虚构账号。应另行在 8000 端口启动测试后端，设置
`PUBLIC_URL=http://127.0.0.1:8791` 和 `DATABASE_PATH=.runtime/browser-test.db`，
然后在 `web` 中执行浏览器测试。Playwright 会在 8791 端口启动独立的 Vite 服务。
每次测试使用全新数据库，不能指向实际安装的数据。
例如，在项目根目录另外打开一个 PowerShell 终端：

```powershell
$env:PUBLIC_URL='http://127.0.0.1:8791'
$env:DATABASE_PATH='.runtime/browser-test.db'
.\.venv\Scripts\python -m uvicorn team_todo.app:app --host 127.0.0.1 --port 8000
```

已验证结果及环境限制记录在[验证报告](docs/VERIFICATION.md)，
实现约定见[设计文档](docs/DESIGN.md)。
源码交付不包含数据库、真实凭据、`.env`、运行日志、依赖目录和构建缓存。
自动化测试使用临时数据，不会安装演示账号或生产账号。
源码和 Windows 安装包通过本页顶部的仓库及发布页提供。
