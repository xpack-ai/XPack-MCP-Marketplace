# XPack（全球首个开源 MCP 交易计费平台）

![b1](https://github.com/user-attachments/assets/3d50cd9a-9d28-4ec8-bb5f-d3668475b49e)

<p align="center">
  <a href="/README.md">English</a>
  |
  <a href="/README-fr.md">Français</a>
  |
  <a href="/README-de.md">Deutsch</a>
  |
  <a href="/README-es.md">Español</a>
  |
  <a href="/README-ja.md">日本語</a>
  |
  <a href="/README-ko.md">한국어</a>
  |
  <a href="/README-zh-tw.md">繁體中文</a>
  | 
  <a href="/README-zh-cn.md">简体中文</a>
</p>

**XPack** 是全球首个开源 MCP 交易平台，帮助你在10分钟内快速搭建自己的 MCP 商店并立刻开始销售 MCP 服务。

<br>

✨ 使用 XPack，你可以：
- ✅ 一键将 OpenAPI 转换为 MCP 服务并且为 MCP 定价
- 🧾 自动生成 SEO 友好的主页和服务页
- 💳 内置计费功能（支持按次、按Token收费）
- 👥 管理注册用户、充值、交易记录等
- 🛠 集成 Stripe 支付
- 🔐 邮箱 & Google 登录认证
- 📊 用户调用统计

本项目基于 **Apache 2.0 协议开源**，可放心用于商业用途。

<br>

# ✨ 快速开始

😍 只需一行命令，即可在 10 分钟内部署你的 MCP 交易平台：

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

该脚本会自动安装 MySQL、Redis、RabbitMQ，并启动 XPack 服务。

<br>

# 📸 功能截图

![b2](https://github.com/user-attachments/assets/c8cc89a4-ab5f-4c90-8c97-9207b5c9f5c1)  
![b3](https://github.com/user-attachments/assets/16f74c8a-b35e-40a7-8471-a5736de8e904)  
![b4](https://github.com/user-attachments/assets/fc76c215-7544-4267-bc6f-22a719edec00)  
![b5](https://github.com/user-attachments/assets/db40ea77-58c3-472d-ba94-35dc9716a980)

<br>

## 🖥️ 系统要求

### ✅ 推荐配置
- **CPU**: 8 核  
- **内存**: 16 GB  
- **硬盘**: 200 GB  
- **操作系统**: Linux  
- **架构**: AMD64  

### ✅ 最低配置
- **CPU**: 2 核  
- **内存**: 4 GB  
- **硬盘**: 200 GB  
- **操作系统**: Linux / macOS  
- **架构**: AMD64 / ARM64  

<br>

## 📦 运行依赖

XPack-MCP-Market 依赖以下服务（可容器化或自行安装）：

| 组件        | 最低版本   |
|-------------|------------|
| **MySQL**   | ≥ 5.7.x    |
| **Redis**   | ≥ 6.2.x    |
| **RabbitMQ**| ≥ 4.0      |

请确保这些服务已正常运行并配置好连接参数。

<br>

## 💿 部署方式

### 🟢 快速部署命令

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

支持系统包括：
- CentOS 7.9 / 8.5
- Ubuntu 20.04 / 22.04 / 24.04
- Debian 12.4
- 阿里云 Linux 2.1903 / 3.2104

如需支持其他系统，请在 [Issues](https://github.com/xpack-ai/XPack-MCP-Market/issues) 提交反馈。

---

<details>
  <summary><h4>🔖Docker-Compose 部署</h4></summary>

  安装 Docker 和 Docker Compose 后：

  1. 编辑 `docker-compose.yml`
  ```bash
  vi docker-compose.yml
  ```

  2. 修改配置，可参考 [示例配置](https://github.com/xpack-ai/XPack-MCP-Market/blob/main/scripts/docker-compose.yml)

  3. 启动服务：
  ```bash
  docker-compose up -d
  ```

  4. 打开浏览器访问 `http://localhost:8000` 使用平台

</details>

<details>
  <summary><h4>🔖源码构建</h4></summary>

  ### 克隆仓库

  ```bash
  git clone https://github.com/xpack-ai/XPack-MCP-Market.git
  cd XPack-MCP-Market
  ```

  ### ✅ 前端构建（需 Node ≥22，pnpm ≥10）

  ```bash
  cd scripts && ./frontend_build.sh && cd ../
  cd frontend/out && node server.js
  ```

  ### ✅ 后端构建（需 Python ≥ 3.11）

  推荐使用 [`uv`](https://github.com/astral-sh/uv)

  ```bash
  uv venv
  source .venv/bin/activate
  uv pip install -r requirements.txt
  cp .env.example .env
  vi .env
  ```

  启动服务：

  - 管理后台（端口 8001）  
    ```bash
    uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload
    ```

  - MCP 服务接口（端口 8002）  
    ```bash
    uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload
    ```

</details>

<br>

# 🧾 开源协议

XPack-MCP-Market 遵循 [Apache 2.0 License](./LICENSE)，支持商业用途与二次开发。

<br>

# 💌 联系我们

- 官网: [https://xpack.ai](https://xpack.ai)  
- 邮箱: [contact@xpack.com](mailto:contact@xpack.com)
- Discord：[Link](https://discord.gg/cyZfcdCXkW)
