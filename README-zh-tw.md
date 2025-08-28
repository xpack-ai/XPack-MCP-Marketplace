# XPack
![b1](https://github.com/user-attachments/assets/3d50cd9a-9d28-4ec8-bb5f-d3668475b49e)

<p align="center">
  <a href="/README.md">English</a>
  | 
  <a href="/README-zh-cn.md">简体中文</a>
  |
  <a href="/README-ja.md">日本語</a>
  |
  <a href="/README-ko.md">한국어</a>
  |
  <a href="/README-fr.md">Français</a>
  |
  <a href="/README-de.md">Deutsch</a>
  |
  <a href="/README-zh-tw.md">繁體中文</a>
  |
  <a href="/README-es.md">Español</a>
</p>


**XPack** 是全球首個開源的 MCP 市集，讓你在幾分鐘內就能建立並販售自己的 MCP 服務。

<br>

✨ 使用 XPack 你可以：
- ✅ **一鍵將 OpenAPI 轉為 MCP 服務設定**
- 🧾 **SEO 友善的首頁與服務頁**
- 💳 **內建計費（按呼叫次數或 Token 使用量）**
- 👥 **使用者帳號管理**
- 🛠 **支援 Stripe 金流**
- 🔐 **支援 Email 與 Google OAuth 登入**

所有原始碼皆採用 **Apache 2.0** 授權，商用無虞。

<br>

# ✨ 快速開始
😍 部署非常簡單，以 **一行指令** 即可在 10 分鐘內架起你的 MCP 市集。

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

[![10 分鐘部署你的 MCP 市集](https://github.com/user-attachments/assets/8881d724-b6aa-47b7-bbd7-b587ef541957)](https://www.youtube.com/watch?v=XHJXyvDevd8)

<br>

# 📸 功能
![b2](https://github.com/user-attachments/assets/c8cc89a4-ab5f-4c90-8c97-9207b5c9f5c1)
![b3](https://github.com/user-attachments/assets/16f74c8a-b35e-40a7-8471-a5736de8e904)
![b4](https://github.com/user-attachments/assets/fc76c215-7544-4267-bc6f-22a719edec00)
![b5](https://github.com/user-attachments/assets/db40ea77-58c3-472d-ba94-35dc9716a980)

<br>

## 🖥️ 系統需求

### ✅ 建議硬體
- **CPU**：8 核心  
- **記憶體**：16 GB  
- **儲存空間**：200 GB  
- **作業系統**：Linux  
- **架構**：AMD64  

### ✅ 最低需求
- **CPU**：2 核心  
- **記憶體**：4 GB  
- **儲存空間**：200 GB  
- **作業系統**：Linux / macOS  
- **架構**：AMD64 / ARM64  

<br>

## 📦 執行相依

**XPack-MCP-Market** 需要以下服務（自架或容器化）：

| 元件 | 最低版本 |
|---|---|
| **MySQL**   | ≥ 5.7.x |
| **Redis**   | ≥ 6.2.x |
| **RabbitMQ**| ≥ 4.0   |

請先確保上述服務已可用且設定正確，再啟動後端。

<br>

## 💿 部署

😍 就這麼簡單：用 **一行指令**，10 分鐘內完成部署。

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

<details>
  <summary><h4>🔖 以 Docker-Compose 部署</h4></summary>

  使用此方法前，請先安裝 [Docker](https://docs.docker.com/engine/install/) 與 [Docker Compose](https://docs.docker.com/compose/install/standalone/)。

  1. 編輯 `docker-compose.yml`
  ```
  vi docker-compose.yml
  ```
  <br>

  2. 修改設定，可參考原始檔 [docker-compose.yml](https://github.com/xpack-ai/XPack-MCP-Market/blob/main/scripts/docker-compose.yml)
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

  3. 啟動 XPack-MCP-Market
  ```
  docker-compose up -d
  ``` 

  <br>

  4. 瀏覽器透過 3000 埠連線
  * **管理員登入**：http://{IP}:3000/admin-signin  
  * **帳號**：admin  
  * **密碼**：123456789
</details>

<details>
  <summary><h4>🔖 建置</h4></summary>
  
  1. 取得原始碼
  ```
  git clone https://github.com/xpack-ai/XPack-MCP-Market.git
  ```
  2. 進入專案資料夾
  ```
  cd XPack-MCP-Market
  ```
  ### 前端建置
  > 需求：
  > - Node >= 22.x
  > - Pnpm >= 10.x
  
  1. 執行建置腳本
  ```
  cd scripts && ./frontend_build.sh && cd ../
  ```
  完成後產出於 `frontend/out`。
  
  2. 啟動 UI
  ```
  cd frontend/out && node server.js
  ```
  ### 後端建置
  > 需求：
  > - Python >= 3.11
  
  #### 使用 `uv`（建議）
  1. 建立虛擬環境
  ```
  uv venv
  ```
  2. 啟用虛擬環境
  ```
  source .venv/bin/activate
  ```
  3. 安裝相依
  ```
  uv pip install -r requirements.txt
  ```
  4. 複製環境變數檔
  ```
  cp .env.example .env
  ```
  5. 編輯環境變數
  ```
  vi .env
  ```
  6. 啟動管理後端服務  
  **前景**
  ```
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload
  ```
  **背景**
  ```
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload &
  ```
  
  7. 啟動 API → MCP 服務  
  **前景**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload
  ``` 
  **背景**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload &
  ```
  ### Docker 建置
  ```
  docker build -t xpack-mcp-market --build-arg APP=xpack-mcp-market --build-arg VERSION=1.0.0 -f ./scripts/Dockerfile ./
  ```
</details>

# 📸 螢幕截圖
<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/5f71bfcf-c128-42ab-8077-3f2ede549f80" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/d7c0b40d-182e-47a6-bcdf-bd36970f5ee6" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/ae40f659-87ad-42d4-8379-b47a48eb6a29" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/1049f4e5-ec3f-4520-8480-6d6432d6f5d2" />

<br>

# 🧾 授權
XPack-MCP-Market 以 **Apache 2.0** 授權釋出。  
詳情請見 [LICENSE](./LICENSE)。

<br>

# 📬 聯絡方式
- 🌐 Website: [https://xpack.ai](https://xpack.ai)
- 📧 Email: [contact@xpack.com](mailto:contact@xpack.com)
- 💬 Discord：[Link](https://discord.gg/cyZfcdCXkW)

<br>

# 🤝 合作夥伴
- [Cursor](https://www.cursor.com/): Cursor 是一款將 AI 深度整合進編輯器的工具，提供下一步編輯建議、對程式碼庫的深度理解與自然語言編輯，顯著提升生產力。

- [Dify](https://dify.ai/): Dify 為領先的代理式（Agentic）AI 開發平台，涵蓋代理流程、RAG、整合與可觀測性等完整能力，支援多種 LLM 與外掛。

- [Trae](https://www.trae.ai/): Trae 是 AI 原生 IDE，以對話式介面協助產生與改寫程式碼，提升品質與效率。

- [Windsurf](https://windsurf.com/): Windsurf 為新一代 AI IDE，具備「Cascade」深度理解、「Windsurf Tab」智慧補全與「Memories」程式碼記憶等功能。

- [Coze](https://www.coze.com/): Coze 是 ByteDance 推出的次世代 AI 應用/聊天機器人平台，透過無程式碼工作流、外掛與知識庫，輕鬆建立強大的 Bot。

- [Claude Code](https://www.anthropic.com/claude-code): Claude Code 是 Anthropic 的 CLI 工具，將 Claude Opus 4 直接帶到終端機，可跨檔案編輯、執行指令並與 IDE/測試整合。

- [Flowith](https://flowith.io/): Flowith 是以畫布為核心的 AI 工作空間，透過多執行緒代理體驗，優化知識轉換與深度工作。

- [OpenManus](https://github.com/FoundationAgents/OpenManus): OpenManus 是用於構建通用 AI 代理的開源框架，支援多代理與 LLM API、瀏覽器自動化整合。

- [Fellou](https://fellou.ai/): Fellou 是能主動代辦任務的「Agentic Browser」，自動化資料蒐集與洞察產出，並和 Notion/LinkedIn 等常用工具整合。

- [Genspark](https://www.genspark.ai/): Genspark 是全方位 AI 夥伴（AI Slides、Sheets、Chat），以個人化工具與 AI Pods 從多來源生成內容。

- [TEN](https://github.com/TEN-framework/ten-framework): TEN（The Embodied Narrator）為即時多模態語音代理的開源框架，支援虛擬分身、MCP 整合、硬體通訊與畫面偵測。

- [APIPark](https://apipark.com/): APIPark 是開源企業級 API 開發者入口與整合式 LLM 閘道，提供統一 API 介面、負載平衡、流量控制、語意快取、提示管理與資料遮罩。

- [ChatGPT](https://chatgpt.com/): ChatGPT 是 OpenAI 的對話式 AI，具備進階語言理解與生成能力，支援追問、情境保留與多平台整合。

- [LangChain](https://www.langchain.com/): LangChain 是開發可靠代理與 LLM 應用的平台，涵蓋 LangGraph、LangSmith 與 LangGraph Platform 等產品。

- [LEMON AI](https://lemonai.cc/): Lemon AI 是首個全端、開源的 Agentic AI 框架，內建 Code Interpreter VM 沙盒以確保安全執行。

- [LobeChat](https://lobehub.com/): LobeChat 為個人 LLM 生產力工具，支援個人/團隊代理、外掛生態、知識庫與影像/語音功能。

- [VS Code](https://code.visualstudio.com/): Visual Studio Code 是高延展性的開源編輯器，支援多語言並內建多項 AI 功能（如下一步編輯建議與代理模式）。

- [XRoute](https://xroute.ai): 提供統一介面的 LLM 閘道，具更佳價格與吞吐量，無需訂閱。

- [MemU](https://github.com/NevaMind-AI/memU): MemU 是面向 AI 夥伴的開源記憶框架。
