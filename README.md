# XPack
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

**XPack** is the world’s first open-source MCP marketplace, to quickly create and sell your own MCP services in just minutes.

<br>

✨ With XPack, you can:
- ✅ **One-click OpenAPI → MCP service config**
- 🧾 **SEO-friendly homepage + mcp service page**
- 💳 **Built-in billing (per-call or token usage)**
- 👥 **User account management**
- 🛠 **Support Stripe Payment**
- 🔐 **Support Email & Google OAuth Sign in**

Everything is open-source and licensed under **Apache 2.0** — ready for commercial use.

<br>


# ✨ Quick Start
😍 Deploying XPack is incredibly simple. With just one command line, you can deploy your MCP Market in 10 minutes.

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

[![Learn how to deploy your mcp market in 10 minutes](https://github.com/user-attachments/assets/8881d724-b6aa-47b7-bbd7-b587ef541957)](https://www.youtube.com/watch?v=XHJXyvDevd8)


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
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
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
        - "8000:80"       # Map port 8000 of the container to port 80 of the host, if you want to access XPack-MCP-Market in your browser at port 8000
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

  4. Access `XPack-MCP-Market` in your browser at port 8000

  * **Admin User Login Address**: http://{IP}:8000/admin
  * **Admin User**: admin
  * **Admin Password**: 123456789
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
- 💬 Discord：[Link](https://discord.gg/cyZfcdCXkW)

<br>

# 🤝 Partner
- [Cursor](https://www.cursor.com/): Cursor is an AI-powered code editor that integrates artificial intelligence directly into the coding workflow, offering features like intelligent next edit suggestions, deep codebase understanding for relevant answers, and natural language editing to streamline development tasks and boost developer productivity.

- [Dify](https://dify.ai/): Dify is a leading Agentic AI Development Platform that provides a comprehensive suite of tools for building and extending AI applications, offering everything needed for agentic workflows, RAG pipelines, integrations, and observability, while allowing users to amplify their applications with various global Large Language Models (LLMs) and versatile plugins.

- [Trae](https://www.trae.ai/): Trae is an AI-native Integrated Development Environment (IDE) product that aims to embody the concept of “The Real AI Engineer” through intelligent productivity, seamlessly integrating into the development process to enhance quality and efficiency, featuring a chat-based interaction interface and supporting code generation and assistance.

- [Windsurf](https://windsurf.com/): Windsurf is an AI code editor designed to provide a seamless and limitless flow for developers, introducing a new purpose-built IDE that leverages AI to enhance coding with features like "Cascade" for deep codebase understanding, "Windsurf Tab" for intelligent autocompletion, and "Memories" for remembering important aspects of the codebase.

- [Coze](https://www.coze.com/): Coze is a next-generation AI application and chatbot development platform by ByteDance, empowering users to easily create and deploy powerful AI chatbots across various platforms with a no-code bot builder, integrated workflow logic, access to proprietary data, and simplified creation through pre-built plugins, knowledge bases, and workflows.

- [Claude Code](https://www.anthropic.com/claude-code): Claude Code is a command-line AI tool by Anthropic that embeds the Claude Opus 4 model directly into the user’s terminal, providing deep codebase awareness, the ability to edit files and execute commands, and making coordinated changes across multiple files, all while integrating seamlessly with popular IDEs and leveraging existing test suites.

- [Flowith](https://flowith.io/): Flowith is an AI creation workspace designed to revolutionize productivity and deep work by transforming knowledge and streamlining tasks through a multi-thread interface powered by advanced AI agents, offering an intuitive canvas-based user experience unlike traditional chat-based AI tools, and including a 24/7 operational version for complex tasks.

- [OpenManus](https://github.com/FoundationAgents/OpenManus): OpenManus is an open-source framework dedicated to building general AI agents, aiming to provide a platform where users can create and deploy their own agents without an invite code, supporting multi-agent capabilities, and requiring configuration for Large Language Model (LLM) APIs while integrating with browser automation tools.

- [Fellou](https://fellou.ai/): Fellou is an innovative Agentic Browser designed to transcend traditional web browsing by actively performing actions on behalf of the user, automating the entire process of information gathering and insight delivery, and excelling in in-depth research with seamless integrations with popular tools like Notion and LinkedIn.

- [Genspark](https://www.genspark.ai/): Genspark is an ultimate all-in-one AI companion offering a comprehensive suite of tools like AI Slides, AI Sheets, and AI Chat, designed to enhance various aspects of productivity and content creation, with personalized tools and AI Pods for generating content from diverse sources.

- [TEN](https://github.com/TEN-framework/ten-framework): TEN (The Embodied Narrator) is an open-source framework for building real-time, multimodal conversational voice AI agents, including components like TEN Framework, TEN Turn Detection, TEN Agent, TMAN Designer, and TEN Portal, offering features like Real-time Avatar, seamless MCP integration, real-time hardware communication, and vision/screenshare detection.

- [APIPark](https://apipark.com/): APIPark is an open-source enterprise API developer portal and an all-in-one LLM gateway, providing fine-grained, visual management of LLMs in production environments with features like unified API signatures, load balancing, traffic control, intelligent semantic caching, flexible prompt management, and data masking, ensuring safer and more stable LLM calls.

- [ChatGPT](https://chatgpt.com/): ChatGPT is an AI chatbot developed by OpenAI, built upon large language models like GPT-3.5 and GPT-4, designed to generate human-like conversational dialogue, understand context, answer follow-up questions, and integrate with various platforms for enhanced productivity through advanced language understanding, generation, and multilingual capabilities.

- [LangChain](https://www.langchain.com/): LangChain is a robust platform engineered for the development of reliable agents and Large Language Model (LLM) applications, offering a comprehensive product suite that seamlessly integrates various tools across the entire application development lifecycle, including LangGraph, LangSmith, and the LangGraph Platform, with functionalities for code generation, automation, and AI Search.

- [LEMON AI](https://lemonai.cc/): Lemon AI is the first Full-stack, Open-source, Agentic AI framework, offering a fully local alternative to platforms like Manus & Genspark AI. It features an integrated Code Interpreter VM sandbox for safe execution.

- [LobeChat](https://lobehub.com/): LobeHub offers LobeChat, a personal LLM productivity tool designed to elevate the user experience beyond traditional chatbots by empowering individuals to build personal AI agents and professional teams, supporting a wide array of LLMs, offering a simple chat interface, visual recognition, voice interaction, a rich plugin ecosystem, and knowledge base functionalities.

- [VS Code](https://code.visualstudio.com/): Visual Studio Code (VS Code) is a widely popular, free, and open-source code editor by Microsoft, renowned for its extensibility and customization, supporting vast programming languages, and integrating AI capabilities like intelligent next edit suggestions and an advanced “agent mode” for complex tasks, with broad compatibility with various AI models.

- [XRoute](https://xroute.ai): The Unified Interface For LLMs, provides better prices, better throughput, and no subscription.

- [MemU](https://github.com/NevaMind-AI/memU): MemU is an open-source memory framework for AI companions
