# XPack-MCP-Market
![b1](https://github.com/user-attachments/assets/3d50cd9a-9d28-4ec8-bb5f-d3668475b49e)

<p align="center">
  <a href="/README.md">English</a>
  | 
  <a href="/README-zh-cn.md">简体中文</a>
</p>

**XPack** is a lightweight, open-source marketplace framework for MCP (Model Context Protocol) services.  
It allows you to transform any OpenAPI into a monetizable MCP service and build your own API store in just minutes.

<br>

✨ With XPack, you can:
- ✅ **One-click OpenAPI → MCP service config**
- 🧾 **SEO-friendly homepage + mcp service page**
- 💳 **Built-in billing (per-call)**
- 👥 **User account management**
- 🛠 **Support Stripe Payment**
- 🔐 **Support Email & Google OAuth Sign in**

Everything is open-source and licensed under **Apache 2.0** — ready for commercial use.

<br>


# ✨ Quick Start
😍 Deploying XPack is incredibly simple. With just one command line, you can deploy your MCP Market in 10 minutes.

```bash
curl -sSO http://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

<br>


# 📸 Features
![b2](https://github.com/user-attachments/assets/c8cc89a4-ab5f-4c90-8c97-9207b5c9f5c1)
![b3](https://github.com/user-attachments/assets/16f74c8a-b35e-40a7-8471-a5736de8e904)
![b4](https://github.com/user-attachments/assets/fc76c215-7544-4267-bc6f-22a719edec00)
![b5](https://github.com/user-attachments/assets/db40ea77-58c3-472d-ba94-35dc9716a980)

<br>


## 🖥️ System Requirements

### ✅ Recommended Hardware
- **CPU**: 8 cores  
- **Memory**: 16 GB  
- **Storage**: 200 GB  
- **Operating System**: Linux  
- **Architecture**: AMD64  

### ✅ Minimum Requirements
- **CPU**: 2 cores  
- **Memory**: 4 GB  
- **Storage**: 200 GB  
- **Operating System**: Linux / macOS  
- **Architecture**: AMD64 / ARM64  

<br>


## 📦 Runtime Dependencies

**XPack-MCP-Market** requires the following services (self-hosted or containerized):

| Component   | Minimum Version |
|-------------|-----------------|
| **MySQL**   | ≥ 5.7.x         |
| **Redis**   | ≥ 6.2.x         |
| **RabbitMQ**| ≥ 4.0           |

Ensure these services are available and properly configured before running the backend.


<br>

## 💿 Deployment

😍 Deploying XPack is incredibly simple. With just one command line, you can deploy your MCP Market in 10 minutes.

```bash
curl -sSO http://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

<details>
  <summary><h4>🔖Docker-Compose Deployment</h4></summary>

  To install XPack-MCP-Market using this method, you need to have [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/standalone/) installed.

  1. Edit the `docker-compose.yml` file
  ```
  vi docker-compose.yml
  ```
  <br>

  2. Modify the configuration, you can reference the original file at [docker-compose.yml](https://github.com/xpack-ai/XPack-MCP-Market/blob/main/scripts/docker-compose.yml)
  ```
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

  <br>

  3. Start XPack-MCP-Market

  ```
  docker-compose up -d
  ``` 

  <br>

  4. Access `XPack-MCP-Market` in your browser at port 3000

</details>


<details>
  <summary><h4>🔖Build</h4></summary>
  1. Clone the XPack repository.
  ```
  git clone https://github.com/xpack-ai/XPack-MCP-Market.git
  ```
  2. Enter the project directory.
  ```
  cd XPack-MCP-Market
  ```
  ### Frontend Build
  > Requirements:
  > - Node >= 22.x
  > - Pnpm >= 10.x
  
  1. Execute the frontend build script
  ```
  cd scripts && ./frontend_build.sh && cd ../
  ```
  After compilation, the frontend code will be built into the `frontend/out` directory.
  
  2. Start the UI interface
  ```
  cd frontend/out && node server.js
  ```
  ### Backend Build
  > Requirements:
  > - Python >= 3.11
  
  #### Using`uv` (Recommended)
  1. Create virtual environment
  ```
  uv venv
  ```
  2. Activate virtual environment
  ```
  source .venv/bin/activate
  ```
  3. Install dependencies
  ```
  uv pip install -r requirements.txt
  ```
  4. Copy environment variable file
  ```
  cp .env.example .env
  ```
  5. Edit environment variables
  ```
  vi .env
  ```
  6. Start admin backend service
  **Foreground**
  ```
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload
  ```
  **Background**
  ```
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload &
  ```
  
  7. Start API to MCP service
  **Foreground**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload
  ``` 
  **Background**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload &
  ```
  ### Docker Build
  ```
  docker build -t xpack-mcp-market --build-arg APP=xpack-mcp-market --build-arg VERSION=1.0.0 -f ./scripts/Dockerfile ./
  ```
</details>

# 📸 Screenshots
<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/5f71bfcf-c128-42ab-8077-3f2ede549f80" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/d7c0b40d-182e-47a6-bcdf-bd36970f5ee6" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/ae40f659-87ad-42d4-8379-b47a48eb6a29" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/1049f4e5-ec3f-4520-8480-6d6432d6f5d2" />

<br>

# 🧾 License
XPack-MCP-Market is licensed under the Apache 2.0 License.  
For details, please see the [LICENSE](./LICENSE) file.

<br>

# 📬 Contact
- 🌐 Website: [https://xpack.ai](https://xpack.ai)
- 📧 Email: [contact@xpack.com](mailto:contact@xpack.com)
