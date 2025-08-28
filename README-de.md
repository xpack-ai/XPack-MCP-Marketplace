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

**XPack** ist der erste Open‑Source‑MCP‑Marktplatz der Welt – damit erstellen und verkaufen Sie Ihre MCP‑Services in wenigen Minuten.

<br>

✨ Was XPack bietet
- ✅ **OpenAPI → MCP‑Servicekonfiguration per One‑Click**
- 🧾 **SEO‑optimierte Startseite & Service‑Seiten**
- 💳 **Integriertes Billing (pro Aufruf oder nach Token‑Verbrauch)**
- 👥 **Benutzerkontenverwaltung**
- 🛠 **Unterstützung für Stripe‑Zahlungen**
- 🔐 **Anmeldung via E‑Mail & Google OAuth**

Alles ist Open Source unter **Apache 2.0** – bereit für den kommerziellen Einsatz.

<br>

# ✨ Schnellstart
😍 Die Bereitstellung ist extrem einfach. Mit **einem einzigen Befehl** ist Ihr MCP‑Marktplatz in 10 Minuten online.

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

[![In 10 Minuten Ihren MCP‑Marktplatz deployen](https://github.com/user-attachments/assets/8881d724-b6aa-47b7-bbd7-b587ef541957)](https://www.youtube.com/watch?v=XHJXyvDevd8)

<br>

# 📸 Funktionen
![b2](https://github.com/user-attachments/assets/c8cc89a4-ab5f-4c90-8c97-9207b5c9f5c1)
![b3](https://github.com/user-attachments/assets/16f74c8a-b35e-40a7-8471-a5736de8e904)
![b4](https://github.com/user-attachments/assets/fc76c215-7544-4267-bc6f-22a719edec00)
![b5](https://github.com/user-attachments/assets/db40ea77-58c3-472d-ba94-35dc9716a980)

<br>

## 🖥️ Systemanforderungen

### ✅ Empfohlene Hardware
- **CPU**: 8 Kerne  
- **Arbeitsspeicher**: 16 GB  
- **Speicher**: 200 GB  
- **Betriebssystem**: Linux  
- **Architektur**: AMD64  

### ✅ Mindestanforderungen
- **CPU**: 2 Kerne  
- **Arbeitsspeicher**: 4 GB  
- **Speicher**: 200 GB  
- **Betriebssystem**: Linux / macOS  
- **Architektur**: AMD64 / ARM64  

<br>

## 📦 Laufzeitabhängigkeiten

Für **XPack‑MCP‑Market** werden folgende Dienste benötigt (selbst gehostet oder containerisiert):

| Komponente | Mindestversion |
|---|---|
| **MySQL**   | ≥ 5.7.x |
| **Redis**   | ≥ 6.2.x |
| **RabbitMQ**| ≥ 4.0   |

Stellen Sie sicher, dass diese Dienste verfügbar und korrekt konfiguriert sind, bevor Sie das Backend starten.

<br>

## 💿 Bereitstellung

😍 So einfach: Mit **einem Befehl** ist Ihr MCP‑Marktplatz in 10 Minuten bereit.

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

<details>
  <summary><h4>🔖 Docker‑Compose‑Bereitstellung</h4></summary>

  Für diese Methode benötigen Sie [Docker](https://docs.docker.com/engine/install/) und [Docker Compose](https://docs.docker.com/compose/install/standalone/).

  1. `docker-compose.yml` bearbeiten
  ```
  vi docker-compose.yml
  ```
  <br>

  2. Konfiguration anpassen (Beispiel: [docker-compose.yml](https://github.com/xpack-ai/XPack-MCP-Market/blob/main/scripts/docker-compose.yml))
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

  3. XPack‑MCP‑Market starten
  ```
  docker-compose up -d
  ``` 

  <br>

  4. Im Browser über Port 3000 öffnen
  * **Admin‑Login**: http://{IP}:3000/admin-signin  
  * **Benutzer**: admin  
  * **Passwort**: 123456789
</details>

<details>
  <summary><h4>🔖 Build</h4></summary>
  
  1. Repository klonen
  ```
  git clone https://github.com/xpack-ai/XPack-MCP-Market.git
  ```
  2. Projektordner öffnen
  ```
  cd XPack-MCP-Market
  ```
  ### Frontend‑Build
  > Voraussetzungen:
  > - Node >= 22.x
  > - Pnpm >= 10.x
  
  1. Build‑Skript ausführen
  ```
  cd scripts && ./frontend_build.sh && cd ../
  ```
  Der Frontend‑Code wird nach `frontend/out` gebaut.
  
  2. UI starten
  ```
  cd frontend/out && node server.js
  ```
  ### Backend‑Build
  > Voraussetzungen:
  > - Python >= 3.11
  
  #### Mit `uv` (empfohlen)
  1. Virtuelle Umgebung erstellen
  ```
  uv venv
  ```
  2. Aktivieren
  ```
  source .venv/bin/activate
  ```
  3. Abhängigkeiten installieren
  ```
  uv pip install -r requirements.txt
  ```
  4. Umgebungsdatei kopieren
  ```
  cp .env.example .env
  ```
  5. Variablen anpassen
  ```
  vi .env
  ```
  6. Admin‑Backend starten  
  **Vordergrund**
  ```
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload
  ```
  **Hintergrund**
  ```
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload &
  ```
  
  7. API‑→‑MCP‑Service starten  
  **Vordergrund**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload
  ``` 
  **Hintergrund**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload &
  ```
  ### Docker‑Build
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

# 🧾 Lizenz
XPack‑MCP‑Market steht unter der **Apache‑2.0‑Lizenz**.  
Details finden Sie in der Datei [LICENSE](./LICENSE).

<br>

# 📬 Kontakt
- 🌐 Website: [https://xpack.ai](https://xpack.ai)
- 📧 E‑Mail: [contact@xpack.com](mailto:contact@xpack.com)
- 💬 Discord: [Link](https://discord.gg/cyZfcdCXkW)

<br>

# 🤝 Partner
- [Cursor](https://www.cursor.com/): KI‑gestützter Code‑Editor mit Vorschlägen für die nächste Änderung, tiefem Codeverständnis und Bearbeitung in natürlicher Sprache – für mehr Produktivität.

- [Dify](https://dify.ai/): Führende agentische KI‑Plattform mit Workflows, RAG, Integrationen und Observability; unterstützt zahlreiche LLMs und Plugins.

- [Trae](https://www.trae.ai/): KI‑native IDE mit Chat‑Interface, die „The Real AI Engineer“ verkörpert – erleichtert Code‑Generierung und ‑Assistenz, steigert Qualität und Effizienz.

- [Windsurf](https://windsurf.com/): Neues IDE‑Konzept mit KI‑Features wie „Cascade“, „Windsurf Tab“ und „Memories“ für tiefes Codeverständnis und reibungslosen Flow.

- [Coze](https://www.coze.com/): Nächste Generation der No‑Code‑Plattform von ByteDance für KI‑Apps und Chatbots – mit Workflows, proprietären Daten, Plugins und Wissensbasen.

- [Claude Code](https://www.anthropic.com/claude-code): CLI‑Tool von Anthropic mit Claude Opus 4 direkt im Terminal; Datei‑/Projekt‑übergreifende Änderungen, Befehlsausführung, IDE‑Integration.

- [Flowith](https://flowith.io/): Canvas‑basierter KI‑Arbeitsraum für Produktivität und Deep Work mit Multi‑Thread‑Agenten.

- [OpenManus](https://github.com/FoundationAgents/OpenManus): Open‑Source‑Framework zum Aufbau allgemeiner KI‑Agenten; Multi‑Agent‑Fähigkeiten, LLM‑APIs und Browser‑Automatisierung integriert.

- [Fellou](https://fellou.ai/): „Agentic Browser“, der im Auftrag des Nutzers handelt – automatisiert Recherche und Erkenntnisse, mit Integrationen wie Notion/LinkedIn.

- [Genspark](https://www.genspark.ai/): All‑in‑One‑KI‑Begleiter (AI Slides, Sheets, Chat) mit personalisierten Tools und AI Pods zur Inhaltsgenerierung aus vielfältigen Quellen.

- [TEN](https://github.com/TEN-framework/ten-framework): Open‑Source‑Framework für Echtzeit, multimodale Sprach‑Agenten – inkl. Avatar, MCP‑Integration, Hardware‑Kommunikation und Bildschirmfreigabe‑Erkennung.

- [APIPark](https://apipark.com/): Open‑Source‑Entwicklerportal und All‑in‑One‑LLM‑Gateway – einheitliche APIs, Load‑Balancing, Traffic‑Kontrolle, semantischer Cache, Prompt‑Management und Data Masking.

- [ChatGPT](https://chatgpt.com/): Von OpenAI entwickelter KI‑Chatbot auf Basis großer Sprachmodelle – kontextbewusste Dialoge, Follow‑ups, Integrationen und Produktivitätsfunktionen.

- [LangChain](https://www.langchain.com/): Plattform für robuste Agenten‑/LLM‑Apps (LangGraph, LangSmith, LangGraph Platform) – Code‑Generierung, Automatisierung und AI Search.

- [LEMON AI](https://lemonai.cc/): Erster Full‑Stack, Open‑Source, agentischer KI‑Framework – inkl. integriertem Code‑Interpreter‑VM‑Sandbox für sichere Ausführung.

- [LobeChat](https://lobehub.com/): Persönliches LLM‑Produktivitätstool zum Aufbau persönlicher Agenten und Profi‑Teams; reiches Plugin‑Ökosystem, Wissensbasis, Bild/Audio‑Funktionen.

- [VS Code](https://code.visualstudio.com/): Weit verbreiteter, kostenloser Open‑Source‑Editor mit großer Erweiterbarkeit und KI‑Funktionen wie „Agent Mode“ und intelligenten Edit‑Vorschlägen.

- [XRoute](https://xroute.ai): Vereinheitlichte Schnittstelle für LLMs – bessere Preise, höhere Durchsätze, kein Abo nötig.

- [MemU](https://github.com/NevaMind-AI/memU): Open‑Source‑Memory‑Framework für KI‑Companions.
