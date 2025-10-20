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


**XPack** es el primer marketplace MCP de código abierto del mundo: crea y vende tus propios servicios MCP en cuestión de minutos.

<br>

✨ Con XPack puedes:
- ✅ **Generar con un clic la configuración OpenAPI → MCP**
- 🧾 **Portada y páginas de servicio optimizadas para SEO**
- 💳 **Facturación integrada (por llamada o por uso de tokens)**
- 👥 **Gestión de cuentas de usuario**
- 🛠 **Pagos con Stripe**
- 🔐 **Inicio de sesión con correo y Google OAuth**

Todo es open source bajo **Apache 2.0**, listo para uso comercial.

<br>

# ✨ Inicio rápido
😍 Poner XPack en marcha es facilísimo. Con **un solo comando** tendrás tu marketplace MCP online en 10 minutos.

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

[![Cómo desplegar tu marketplace MCP en 10 minutos](https://github.com/user-attachments/assets/8881d724-b6aa-47b7-bbd7-b587ef541957)](https://www.youtube.com/watch?v=XHJXyvDevd8)

<br>

# 📸 Funcionalidades
![b2](https://github.com/user-attachments/assets/c8cc89a4-ab5f-4c90-8c97-9207b5c9f5c1)
![b3](https://github.com/user-attachments/assets/16f74c8a-b35e-40a7-8471-a5736de8e904)
![b4](https://github.com/user-attachments/assets/fc76c215-7544-4267-bc6f-22a719edec00)
![b5](https://github.com/user-attachments/assets/db40ea77-58c3-472d-ba94-35dc9716a980)

<br>

## 🖥️ Requisitos del sistema

### ✅ Hardware recomendado
- **CPU**: 8 núcleos  
- **Memoria**: 16 GB  
- **Almacenamiento**: 200 GB  
- **Sistema operativo**: Linux  
- **Arquitectura**: AMD64  

### ✅ Mínimos
- **CPU**: 2 núcleos  
- **Memoria**: 4 GB  
- **Almacenamiento**: 200 GB  
- **Sistema operativo**: Linux / macOS  
- **Arquitectura**: AMD64 / ARM64  

<br>

## 📦 Dependencias de ejecución

**XPack-MCP-Market** requiere los siguientes servicios (autogestionados o en contenedores):

| Componente | Versión mínima |
|---|---|
| **MySQL**   | ≥ 5.7.x |
| **Redis**   | ≥ 6.2.x |
| **RabbitMQ**| ≥ 4.0   |

Asegúrate de que estos servicios estén disponibles y correctamente configurados antes de arrancar el backend.

<br>

## 💿 Despliegue

😍 Así de simple: con **un comando** tendrás tu marketplace MCP listo en 10 minutos.

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

<details>
  <summary><h4>🔖 Despliegue con Docker-Compose</h4></summary>

  Para este método, instala [Docker](https://docs.docker.com/engine/install/) y [Docker Compose](https://docs.docker.com/compose/install/standalone/).

  1. Edita `docker-compose.yml`
  ```
  vi docker-compose.yml
  ```
  <br>

  2. Ajusta la configuración (archivo de referencia: [docker-compose.yml](https://github.com/xpack-ai/XPack-MCP-Market/blob/main/scripts/docker-compose.yml))
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
        - "8000:80"
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

  3. Arranca XPack-MCP-Market
  ```
  docker-compose up -d
  ``` 

  <br>

  4. Accede por el puerto 3000 en el navegador
  * **Inicio de sesión admin**: http://{IP}:3000/admin-signin  
  * **Usuario**: admin  
  * **Contraseña**: 123456789
</details>

<details>
  <summary><h4>🔖 Compilación (Build)</h4></summary>
  
  1. Clona el repositorio
  ```
  git clone https://github.com/xpack-ai/XPack-MCP-Market.git
  ```
  2. Entra al proyecto
  ```
  cd XPack-MCP-Market
  ```
  ### Build del frontend
  > Requisitos:
  > - Node >= 22.x
  > - Pnpm >= 10.x
  
  1. Ejecuta el script de build
  ```
  cd scripts && ./frontend_build.sh && cd ../
  ```
  El código compilado quedará en `frontend/out`.
  
  2. Inicia la interfaz
  ```
  cd frontend/out && node server.js
  ```
  ### Build del backend
  > Requisitos:
  > - Python >= 3.11
  
  #### Con `uv` (recomendado)
  1. Crea el entorno virtual
  ```
  uv venv
  ```
  2. Actívalo
  ```
  source .venv/bin/activate
  ```
  3. Instala dependencias
  ```
  uv pip install -r requirements.txt
  ```
  4. Copia el archivo de entorno
  ```
  cp .env.example .env
  ```
  5. Edita las variables
  ```
  vi .env
  ```
  6. Inicia el servicio de administración  
  **Primer plano**
  ```
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload
  ```
  **Segundo plano**
  ````
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload &
  ```
  
  7. Inicia el servicio API → MCP  
  **Primer plano**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload
  ``` 
  **Segundo plano**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload &
  ```
  ### Build de Docker
  ```
  docker build -t xpack-mcp-market --build-arg APP=xpack-mcp-market --build-arg VERSION=1.0.0 -f ./scripts/Dockerfile ./
  ```
</details>

# 📸 Capturas
<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/5f71bfcf-c128-42ab-8077-3f2ede549f80" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/d7c0b40d-182e-47a6-bcdf-bd36970f5ee6" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/ae40f659-87ad-42d4-8379-b47a48eb6a29" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/1049f4e5-ec3f-4520-8480-6d6432d6f5d2" />

<br>

# 🧾 Licencia
XPack-MCP-Market se publica bajo **Apache 2.0**.  
Consulta [LICENSE](./LICENSE) para más detalles.

<br>

# 📬 Contacto
- 🌐 Sitio web: [https://xpack.ai](https://xpack.ai)
- 📧 Correo: [contact@xpack.com](mailto:contact@xpack.com)
- 💬 Discord: [Link](https://discord.gg/cyZfcdCXkW)

<br>

# 🤝 Socios
- [Cursor](https://www.cursor.com/): editor de código con IA integrada en el flujo de trabajo; sugerencias contextuales, comprensión profunda del repositorio y edición en lenguaje natural.

- [Dify](https://dify.ai/): plataforma líder para desarrollo de IA agentica; cubre flujos de agentes, RAG, integraciones y observabilidad; compatible con múltiples LLMs y plugins.

- [Trae](https://www.trae.ai/): IDE nativo de IA que apunta a “The Real AI Engineer”; interfaz conversacional con generación y asistencia de código para mejorar calidad y eficiencia.

- [Windsurf](https://windsurf.com/): nuevo IDE impulsado por IA con “Cascade”, “Windsurf Tab” y “Memories” para un entendimiento profundo del código y un flujo continuo.

- [Coze](https://www.coze.com/): plataforma de ByteDance para crear apps y chatbots con IA sin código; workflows, datos propios, plugins y bases de conocimiento.

- [Claude Code](https://www.anthropic.com/claude-code): herramienta CLI de Anthropic que integra Claude Opus 4 en la terminal; edición multiarchivo, ejecución de comandos e integración con IDEs y test.

- [Flowith](https://flowith.io/): espacio de trabajo de creación con interfaz de lienzo y agentes avanzados; optimiza productividad y trabajo profundo.

- [OpenManus](https://github.com/FoundationAgents/OpenManus): framework open source para construir agentes generales; multiactor y con integración de APIs LLM y automatización de navegador.

- [Fellou](https://fellou.ai/): “navegador agéntico” que actúa por ti; automatiza la recolección de información y entrega de insights; integra con Notion/LinkedIn.

- [Genspark](https://www.genspark.ai/): compañero de IA todo en uno (AI Slides, Sheets, Chat); herramientas personalizadas y AI Pods para generar contenido desde múltiples fuentes.

- [TEN](https://github.com/TEN-framework/ten-framework): framework open source para agentes de voz multimodales en tiempo real; avatar, integración MCP, comunicación hardware y detección de pantalla.

- [APIPark](https://apipark.com/): portal de desarrolladores API open source y pasarela LLM todo en uno; API unificadas, balanceo de carga, control de tráfico, caché semántico, gestión de prompts y enmascaramiento de datos.

- [ChatGPT](https://chatgpt.com/): chatbot de OpenAI basado en LLMs; diálogo natural, comprensión de contexto, seguimiento de conversación e integración con múltiples plataformas.

- [LangChain](https://www.langchain.com/): plataforma para desarrollar agentes y apps LLM confiables (LangGraph, LangSmith, LangGraph Platform); generación de código, automatización y búsqueda con IA.

- [LEMON AI](https://lemonai.cc/): primer framework agentico full‑stack, open source; incluye sandbox VM del intérprete de código para ejecución segura.

- [LobeChat](https://lobehub.com/): herramienta de productividad LLM personal; permite crear agentes personales y equipos profesionales; plugins, base de conocimiento, visión y voz.

- [VS Code](https://code.visualstudio.com/): editor de código open source extensible, con funciones de IA como sugerencias inteligentes y “modo agente”.

- [XRoute](https://xroute.ai): interfaz unificada para LLMs; mejores precios, mejor throughput, sin suscripción.

- [MemU](https://github.com/NevaMind-AI/memU): framework de memoria open source para compañeros de IA.
