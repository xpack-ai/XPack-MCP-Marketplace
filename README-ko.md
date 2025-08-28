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

**XPack** 는 세계 최초의 오픈 소스 MCP 마켓플레이스입니다. 몇 분 만에 나만의 MCP 서비스를 만들고 판매하세요.

<br>

✨ XPack으로 할 수 있는 일
- ✅ **OpenAPI → MCP 서비스 설정을 원클릭으로 생성**
- 🧾 **SEO 친화적 홈페이지 + 서비스 상세 페이지**
- 💳 **내장 과금(요청 수 / 토큰 사용량 기준)**
- 👥 **사용자 계정 관리**
- 🛠 **Stripe 결제 지원**
- 🔐 **이메일 & Google OAuth 로그인 지원**

모든 코드는 **Apache 2.0** 라이선스로 공개되어 있으며, 상업적 사용이 가능합니다.

<br>

# ✨ 빠른 시작
😍 정말 간단합니다. **한 줄 명령어**로 10분 만에 MCP 마켓을 배포할 수 있습니다.

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

[![10분 만에 MCP 마켓 배포하기](https://github.com/user-attachments/assets/8881d724-b6aa-47b7-bbd7-b587ef541957)](https://www.youtube.com/watch?v=XHJXyvDevd8)

<br>

# 📸 기능
![b2](https://github.com/user-attachments/assets/c8cc89a4-ab5f-4c90-8c97-9207b5c9f5c1)
![b3](https://github.com/user-attachments/assets/16f74c8a-b35e-40a7-8471-a5736de8e904)
![b4](https://github.com/user-attachments/assets/fc76c215-7544-4267-bc6f-22a719edec00)
![b5](https://github.com/user-attachments/assets/db40ea77-58c3-472d-ba94-35dc9716a980)

<br>

## 🖥️ 시스템 요구 사항

### ✅ 권장 하드웨어
- **CPU**: 8코어  
- **메모리**: 16 GB  
- **스토리지**: 200 GB  
- **운영체제**: Linux  
- **아키텍처**: AMD64  

### ✅ 최소 사양
- **CPU**: 2코어  
- **메모리**: 4 GB  
- **스토리지**: 200 GB  
- **운영체제**: Linux / macOS  
- **아키텍처**: AMD64 / ARM64  

<br>

## 📦 런타임 의존성

**XPack-MCP-Market** 실행에는 다음 서비스가 필요합니다(셀프 호스팅 또는 컨테이너).

| 구성 요소 | 최소 버전 |
|---|---|
| **MySQL**   | ≥ 5.7.x |
| **Redis**   | ≥ 6.2.x |
| **RabbitMQ**| ≥ 4.0   |

실행 전에 위 서비스가 준비되어 있고 올바르게 설정되었는지 확인하세요.

<br>

## 💿 배포

😍 **한 줄 명령어**로 10분 만에 MCP 마켓을 배포할 수 있습니다.

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

<details>
  <summary><h4>🔖 Docker-Compose 배포</h4></summary>

  이 방법을 사용하려면 [Docker](https://docs.docker.com/engine/install/) 와 [Docker Compose](https://docs.docker.com/compose/install/standalone/) 가 필요합니다.

  1. `docker-compose.yml` 편집
  ```
  vi docker-compose.yml
  ```
  <br>

  2. 설정 변경(원본 예시는 [docker-compose.yml](https://github.com/xpack-ai/XPack-MCP-Market/blob/main/scripts/docker-compose.yml) 참고)
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

  3. XPack-MCP-Market 시작
  ```
  docker-compose up -d
  ``` 

  <br>

  4. 브라우저에서 3000 포트로 접속
  * **관리자 로그인 주소**: http://{IP}:3000/admin-signin  
  * **관리자 계정**: admin  
  * **관리자 비밀번호**: 123456789
</details>

<details>
  <summary><h4>🔖 빌드</h4></summary>
  
  1. 리포지토리 클론
  ```
  git clone https://github.com/xpack-ai/XPack-MCP-Market.git
  ```
  2. 프로젝트 디렉토리로 이동
  ```
  cd XPack-MCP-Market
  ```
  ### 프런트엔드 빌드
  > 요구 사항:
  > - Node >= 22.x
  > - Pnpm >= 10.x
  
  1. 빌드 스크립트 실행
  ```
  cd scripts && ./frontend_build.sh && cd ../
  ```
  빌드가 완료되면 `frontend/out` 디렉터리에 생성됩니다.
  
  2. UI 서버 시작
  ```
  cd frontend/out && node server.js
  ```
  ### 백엔드 빌드
  > 요구 사항:
  > - Python >= 3.11
  
  #### `uv` 사용(권장)
  1. 가상 환경 생성
  ```
  uv venv
  ```
  2. 가상 환경 활성화
  ```
  source .venv/bin/activate
  ```
  3. 의존성 설치
  ```
  uv pip install -r requirements.txt
  ```
  4. 환경 변수 파일 복사
  ```
  cp .env.example .env
  ```
  5. 환경 변수 편집
  ```
  vi .env
  ```
  6. 관리자 백엔드 서비스 시작  
  **포그라운드**
  ```
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload
  ```
  **백그라운드**
  ```
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload &
  ```
  
  7. API → MCP 서비스 시작  
  **포그라운드**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload
  ``` 
  **백그라운드**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload &
  ```
  ### Docker 빌드
  ```
  docker build -t xpack-mcp-market --build-arg APP=xpack-mcp-market --build-arg VERSION=1.0.0 -f ./scripts/Dockerfile ./
  ```
</details>

# 📸 스크린샷
<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/5f71bfcf-c128-42ab-8077-3f2ede549f80" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/d7c0b40d-182e-47a6-bcdf-bd36970f5ee6" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/ae40f659-87ad-42d4-8379-b47a48eb6a29" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/1049f4e5-ec3f-4520-8480-6d6432d6f5d2" />

<br>

# 🧾 라이선스
XPack-MCP-Market 는 **Apache 2.0** 라이선스로 배포됩니다.  
자세한 내용은 [LICENSE](./LICENSE) 를 확인하세요.

<br>

# 📬 문의
- 🌐 Website: [https://xpack.ai](https://xpack.ai)
- 📧 Email: [contact@xpack.com](mailto:contact@xpack.com)
- 💬 Discord: [Link](https://discord.gg/cyZfcdCXkW)

<br>

# 🤝 파트너
- [Cursor](https://www.cursor.com/): Cursor는 AI를 에디터에 직접 통합하여 다음 편집 제안, 코드베이스 심층 이해, 자연어 편집 등을 제공하는 AI 코드 에디터입니다.

- [Dify](https://dify.ai/): Dify는 에이전틱 AI 개발 플랫폼으로, 에이전트 워크플로우, RAG, 통합, 가시성 등 AI 앱 구축에 필요한 모든 것을 제공합니다. 다양한 LLM과 플러그인을 지원합니다.

- [Trae](https://www.trae.ai/): Trae는 “The Real AI Engineer”를 표방하는 AI 네이티브 IDE로, 챗 기반 인터페이스로 코드 생성/도움을 제공하며 품질과 효율을 높입니다.

- [Windsurf](https://windsurf.com/): Windsurf는 AI 기반의 새로운 IDE입니다. 깊은 코드 이해를 위한 “Cascade”, 지능형 자동완성 “Windsurf Tab”, 코드 기억 “Memories” 등을 제공합니다.

- [Coze](https://www.coze.com/): Coze는 ByteDance의 차세대 AI 애플리케이션/챗봇 개발 플랫폼으로, 노코드 빌더와 워크플로우, 독자 데이터 연동, 플러그인·지식베이스로 손쉽게 강력한 봇을 만들 수 있습니다.

- [Claude Code](https://www.anthropic.com/claude-code): Claude Code는 터미널에 Claude Opus 4를 내장하는 CLI 도구로, 파일 편집/명령 실행/다중 파일 변경/IDE 통합을 지원합니다.

- [Flowith](https://flowith.io/): Flowith는 캔버스 기반 UI의 AI 작업 공간으로, 멀티 스레드형 에이전트 경험을 통해 지식 변환과 몰입 작업을 최적화합니다.

- [OpenManus](https://github.com/FoundationAgents/OpenManus): OpenManus는 범용 AI 에이전트 구축을 위한 오픈소스 프레임워크입니다. 다중 에이전트와 LLM/브라우저 자동화를 통합할 수 있습니다.

- [Fellou](https://fellou.ai/): Fellou는 사용자 대신 행동하는 “에이전틱 브라우저”로, 정보 수집부터 인사이트 제공까지 자동화하며 Notion/LinkedIn 등과도 연동됩니다.

- [Genspark](https://www.genspark.ai/): Genspark는 AI Slides/Sheets/Chat을 포함한 올인원 AI 동반자 제품으로, AI Pods를 통해 다양한 소스에서 콘텐츠를 생성합니다.

- [TEN](https://github.com/TEN-framework/ten-framework): TEN(The Embodied Narrator)은 실시간 멀티모달 음성 에이전트를 위한 오픈소스 프레임워크로, 아바타, MCP 연동, 하드웨어 통신, 화면 공유 감지 등을 제공합니다.

- [APIPark](https://apipark.com/): APIPark는 오픈소스 엔터프라이즈 API 개발자 포털이자 올인원 LLM 게이트웨이로, 통합 API 시그니처, 로드밸런싱, 트래픽 제어, 의미적 캐시, 프롬프트 관리, 데이터 마스킹 등을 지원합니다.

- [ChatGPT](https://chatgpt.com/): ChatGPT는 OpenAI가 개발한 대화형 AI로, 맥락 이해와 생성 능력을 바탕으로 후속 질문 처리와 다양한 플랫폼 통합을 지원합니다.

- [LangChain](https://www.langchain.com/): LangChain은 신뢰성 있는 에이전트/LLM 앱 개발 플랫폼으로, LangGraph/LangSmith/LangGraph Platform을 통해 코드 생성, 자동화, AI 검색을 지원합니다.

- [LEMON AI](https://lemonai.cc/): Lemon AI는 풀스택 오픈소스 에이전틱 AI 프레임워크로, 안전한 실행을 위한 내장 Code Interpreter VM 샌드박스를 제공합니다.

- [LobeChat](https://lobehub.com/): LobeChat은 개인 LLM 생산성 도구로, 개인 에이전트/전문 팀 구축, 플러그인 생태계, 지식 베이스, 이미지/음성 기능 등을 제공합니다.

- [VS Code](https://code.visualstudio.com/): Visual Studio Code는 확장성이 뛰어난 오픈소스 코드 에디터로, 다양한 언어를 지원하고 지능형 다음 편집 제안 및 “에이전트 모드” 같은 AI 기능을 갖추고 있습니다.

- [XRoute](https://xroute.ai): 여러 LLM을 단일 인터페이스로 제공하는 게이트웨이로, 더 나은 가격/처리량을 제공하며 구독이 필요 없습니다.

- [MemU](https://github.com/NevaMind-AI/memU): MemU는 AI 컴패니언을 위한 오픈소스 메모리 프레임워크입니다.
