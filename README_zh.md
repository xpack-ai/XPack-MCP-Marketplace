# XPack-MCP-Market
![fc52a21a-0ee9-4c95-a1c7-981ae1b397c9](https://github.com/user-attachments/assets/eb14b798-5717-4eab-b7d3-26addb2fa7ff)

## 硬件要求
**推荐配置**
- CPU：8核
- 内存：16G
- 硬盘存储：200G
- 操作系统：Linux
- 系统架构：AMD64

**最低配置**
- CPU：2核
- 内存：4G
- 硬盘存储：200G
- 操作系统：Linux / Mac
- 系统架构：AMD64 / ARM64

**程序依赖**
**XPack** 依赖 `MySQL、Redis、RabbitMQ`，所需版本如下：
- **MySQL:** >= 5.7.x
- **Redis:** >= 6.2.x
- **RabbitMQ:** >= 4.0

## 部署
### 脚本一键部署
> 支持的系统列表：
> - CentOS 7.9（7.x为代表）
> - CentOS 8.5（8.x为代表）
> - Ubuntu 20.04
> - Ubuntu 22.04
> - Debian 12.4
> - Alibaba Cloud Linux 3.2104
> - Alibaba Cloud Linux 2.1903

当前仅测试了上述部署的安装，若需要其他系统的一键部署，可给我们提交[Issue](https://github.com/xpack-ai/XPack-MCP-Market/issues)。
```bash
curl -sSO https://download.xpack.com/install/quick-start.sh; bash quick-start.sh
```

### Docker-Compose部署
使用此方法安装 **XPack-MCP-Market**，你需要安装 [Docker](https://docs.docker.com/engine/install/) 和 [Docker Compose](https://docs.docker.com/compose/install/standalone/)。

1. 编辑 `docker-compose.yml` 文件
```bash
vi docker-compose.yml
```

2. 修改文件配置，原文件可参考 [docker-compose.yml](https://github.com/xpack-ai/XPack-MCP-Market/blob/main/scripts/docker-compose.yml)
```yaml
version: '3'
services:
  xpack-mysql:
    image: mysql:8.0.37
    privileged: true
    restart: always
    container_name: xpack-mysql
    hostname: xpack-mysql
    command:
      - "--character-set-server=utf8mb4"
      - "--collation-server=utf8mb4_unicode_ci"
    ports:
      - "33306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=mysql_ZTdhRB
      - MYSQL_DATABASE=xpack
    volumes:
      - /var/lib/xpack/mysql:/var/lib/mysql
    networks:
      - xpack
  xpack-mcp-market:
    image: xpackai/xpack-mcp-market
    container_name: xpack-mcp-market
    privileged: true
    restart: always
    networks:
      - xpack
    ports:
      - "3000:3000"
      - "8002:8002"
    depends_on:
      - xpack-mysql
      - xpack-redis
      - xpack-rabbitmq
  xpack-redis:
    container_name: xpack-redis
    image: redis:7.2.4
    hostname: xpack-redis
    privileged: true
    restart: always
    ports:
      - 6379:6379
    command:
      - bash
      - -c
      - "redis-server --protected-mode yes --logfile redis.log --appendonly no --port 6379 --requirepass redis_6sJZDm"
    networks:
      - xpack
  xpack-rabbitmq:
    image: rabbitmq:4.1.2-alpine
    container_name: xpack-rabbitmq
    privileged: true
    restart: always
    environment:
      - RABBITMQ_DEFAULT_USER=rabbitmq
      - RABBITMQ_DEFAULT_PASS=rabbitmq_Gs123dA
    networks:
      - xpack
networks:
  xpack:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.101.0.0/24
```

3. 启动XPack-MCP-Market
```bash
docker-compose up -d
```

4. 浏览器访问XPack-MCP-Market，端口号默认为：3000


## 编译指南
### 前期准备
1. 拉取XPack-MCP-Market仓库
```bash
git clone https://github.com/xpack-ai/XPack-MCP-Market.git
```

2. 进入项目目录
```bash
cd XPack-MCP-Market
```

### 编译前端
> 环境要求：
> - Node >= 22.x
> - Pnpm >= 10.x

1. 执行前端编译脚本
```bash
cd scripts && ./frontend_build.sh && cd ../
```
编译完成后，前端代码将编译进 `frontend/out` 目录。

2. 启动UI界面
```bash
cd frontend/out && node server.js
```

### 编译后端
> 环境要求：
> - Python >= 3.11

#### 使用 `uv`（推荐）
1. 创建虚拟环境
```bash
uv venv
```

2. 激活虚拟环境
```bash
source .venv/bin/activate
```

3. 安装依赖
```bash
uv pip install -r requirements.txt
```

4. 复制环境变量文件
```bash
cp .env.example .env
```

5. 编辑环境变量
```bash
vi .env
```

6. 启动管理后台服务
**前台运行**
```bash
uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload
```
**后台运行**
```bash
uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload &
```

7. 启动API转MCP服务
**前台运行**
```bash
uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload
```
**后台运行**
```bash
uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload &
```

### Docker编译
```bash
docker build -t xpack --build-arg APP=xpack --build-arg VERSION=1.0.0 -f ./scripts/Dockerfile ./
```