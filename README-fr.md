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

**XPack** est le premier marketplace MCP open‑source au monde. Créez et vendez vos services MCP en quelques minutes.

<br>

✨ Avec XPack, vous pouvez :
- ✅ **Générer en un clic la configuration OpenAPI → MCP**
- 🧾 **Page d’accueil et pages service optimisées pour le SEO**
- 💳 **Facturation intégrée (par appel ou à l’usage de jetons)**
- 👥 **Gestion des comptes utilisateurs**
- 🛠 **Prise en charge des paiements Stripe**
- 🔐 **Connexion via e‑mail et Google OAuth**

Tout est open source sous **Apache 2.0**, prêt pour un usage commercial.

<br>

# ✨ Démarrage rapide
😍 Déployer XPack est ultra simple. **Une seule commande** suffit pour mettre votre marketplace MCP en ligne en 10 minutes.

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

[![Déployer votre marketplace MCP en 10 minutes](https://github.com/user-attachments/assets/8881d724-b6aa-47b7-bbd7-b587ef541957)](https://www.youtube.com/watch?v=XHJXyvDevd8)

<br>

# 📸 Fonctionnalités
![b2](https://github.com/user-attachments/assets/c8cc89a4-ab5f-4c90-8c97-9207b5c9f5c1)
![b3](https://github.com/user-attachments/assets/16f74c8a-b35e-40a7-8471-a5736de8e904)
![b4](https://github.com/user-attachments/assets/fc76c215-7544-4267-bc6f-22a719edec00)
![b5](https://github.com/user-attachments/assets/db40ea77-58c3-472d-ba94-35dc9716a980)

<br>

## 🖥️ Configuration système requise

### ✅ Configuration recommandée
- **CPU** : 8 cœurs  
- **Mémoire** : 16 Go  
- **Stockage** : 200 Go  
- **Système** : Linux  
- **Architecture** : AMD64  

### ✅ Configuration minimale
- **CPU** : 2 cœurs  
- **Mémoire** : 4 Go  
- **Stockage** : 200 Go  
- **Système** : Linux / macOS  
- **Architecture** : AMD64 / ARM64  

<br>

## 📦 Dépendances d’exécution

**XPack‑MCP‑Market** nécessite les services suivants (auto‑hébergés ou en conteneur) :

| Composant | Version minimale |
|---|---|
| **MySQL**   | ≥ 5.7.x |
| **Redis**   | ≥ 6.2.x |
| **RabbitMQ**| ≥ 4.0   |

Assurez‑vous que ces services sont disponibles et correctement configurés avant de lancer le backend.

<br>

## 💿 Déploiement

😍 Tellement simple : **une commande** pour déployer votre marketplace MCP en 10 minutes.

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

<details>
  <summary><h4>🔖 Déploiement avec Docker‑Compose</h4></summary>

  Pour cette méthode, installez [Docker](https://docs.docker.com/engine/install/) et [Docker Compose](https://docs.docker.com/compose/install/standalone/).

  1. Éditez `docker-compose.yml`
  ```
  vi docker-compose.yml
  ```
  <br>

  2. Modifiez la configuration (exemple de référence : [docker-compose.yml](https://github.com/xpack-ai/XPack-MCP-Market/blob/main/scripts/docker-compose.yml))
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

  3. Démarrez XPack‑MCP‑Market
  ```
  docker-compose up -d
  ``` 

  <br>

  4. Accédez à l’interface sur le port 8000
  * **Connexion admin** : http://{IP}:8000/admin-signin  
  * **Utilisateur** : admin  
  * **Mot de passe** : 123456789
</details>

<details>
  <summary><h4>🔖 Build</h4></summary>
  
  1. Clonez le dépôt
  ```
  git clone https://github.com/xpack-ai/XPack-MCP-Market.git
  ```
  2. Ouvrez le projet
  ```
  cd XPack-MCP-Market
  ```
  ### Build frontend
  > Prérequis :
  > - Node >= 22.x
  > - Pnpm >= 10.x
  
  1. Lancez le script de build
  ```
  cd scripts && ./frontend_build.sh && cd ../
  ```
  Le frontend compilé est disponible dans `frontend/out`.
  
  2. Démarrez l’interface
  ```
  cd frontend/out && node server.js
  ```
  ### Build backend
  > Prérequis :
  > - Python >= 3.11
  
  #### Avec `uv` (recommandé)
  1. Créez l’environnement virtuel
  ```
  uv venv
  ```
  2. Activez‑le
  ```
  source .venv/bin/activate
  ```
  3. Installez les dépendances
  ```
  uv pip install -r requirements.txt
  ```
  4. Copiez le fichier d’environnement
  ```
  cp .env.example .env
  ```
  5. Modifiez les variables
  ```
  vi .env
  ```
  6. Démarrez le service d’administration  
  **Premier plan**
  ```
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload
  ```
  **Arrière‑plan**
  ```
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload &
  ```
  
  7. Démarrez le service API → MCP  
  **Premier plan**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload
  ``` 
  **Arrière‑plan**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload &
  ```
  ### Build Docker
  ```
  docker build -t xpack-mcp-market --build-arg APP=xpack-mcp-market --build-arg VERSION=1.0.0 -f ./scripts/Dockerfile ./
  ```
</details>

# 📸 Captures d’écran
<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/5f71bfcf-c128-42ab-8077-3f2ede549f80" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/d7c0b40d-182e-47a6-bcdf-bd36970f5ee6" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/ae40f659-87ad-42d4-8379-b47a48eb6a29" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/1049f4e5-ec3f-4520-8480-6d6432d6f5d2" />

<br>

# 🧾 Licence
XPack‑MCP‑Market est publié sous **Apache 2.0**.  
Pour plus d’informations, consultez le fichier [LICENSE](./LICENSE).

<br>

# 📬 Contact
- 🌐 Site web : [https://xpack.ai](https://xpack.ai)
- 📧 E‑mail : [contact@xpack.com](mailto:contact@xpack.com)
- 💬 Discord : [Link](https://discord.gg/cyZfcdCXkW)

<br>

# 🤝 Partenaires
- [Cursor](https://www.cursor.com/) : éditeur de code propulsé par l’IA, intégré au flux de travail, avec propositions d’édition, compréhension profonde du code et édition en langage naturel.

- [Dify](https://dify.ai/) : principale plateforme de développement d’IA agentique, couvrant workflows d’agents, RAG, intégrations et observabilité, avec prise en charge de nombreux LLM et plugins.

- [Trae](https://www.trae.ai/) : IDE natif IA visant “The Real AI Engineer”, interface conversationnelle, génération et assistance de code pour améliorer qualité et productivité.

- [Windsurf](https://windsurf.com/) : IDE nouvelle génération exploitant l’IA avec “Cascade”, “Windsurf Tab” et “Memories” pour une compréhension profonde et un flux ininterrompu.

- [Coze](https://www.coze.com/) : plateforme ByteDance pour créer des chatbots et apps IA sans code, avec workflows, données propriétaires, plugins, bases de connaissances et modèles prêts à l’emploi.

- [Claude Code](https://www.anthropic.com/claude-code) : outil CLI d’Anthropic intégrant Claude Opus 4 dans le terminal, avec édition multi‑fichiers, exécution de commandes et intégration IDE/tests.

- [Flowith](https://flowith.io/) : espace de création basé sur un canvas multi‑fils, optimisé pour la productivité et le deep work via des agents avancés.

- [OpenManus](https://github.com/FoundationAgents/OpenManus) : framework open‑source pour bâtir des agents IA généraux, multi‑agents, intégrable avec des API LLM et l’automatisation navigateur.

- [Fellou](https://fellou.ai/) : “navigateur agentique” qui agit pour l’utilisateur, automatisant la collecte d’infos et la synthèse, avec intégrations Notion/LinkedIn.

- [Genspark](https://www.genspark.ai/) : compagnon IA tout‑en‑un (AI Slides, Sheets, Chat), outils personnalisés et AI Pods pour générer du contenu à partir de multiples sources.

- [TEN](https://github.com/TEN-framework/ten-framework) : framework open‑source pour agents vocaux multimodaux en temps réel, avec avatar, intégration MCP, communication matérielle et détection d’écran.

- [APIPark](https://apipark.com/) : portail développeur API open‑source et passerelle LLM tout‑en‑un, avec API unifiées, répartition de charge, contrôle de trafic, cache sémantique, gestion de prompts et masquage de données.

- [ChatGPT](https://chatgpt.com/) : chatbot d’OpenAI fondé sur des LLM, dialogues naturels, compréhension du contexte, intégrations variées et fonctions avancées de productivité.

- [LangChain](https://www.langchain.com/) : plateforme robuste pour développer agents et apps LLM (LangGraph, LangSmith, LangGraph Platform), pour génération de code, automatisation et recherche IA.

- [LEMON AI](https://lemonai.cc/) : premier framework IA agentique full‑stack open‑source, avec bac à sable VM d’interpréteur de code pour une exécution sécurisée.

- [LobeChat](https://lobehub.com/) : outil de productivité LLM personnel, pour créer des agents personnels/équipes, avec vaste écosystème de plugins, base de connaissances et fonctions image/voix.

- [VS Code](https://code.visualstudio.com/) : éditeur de code open‑source très populaire et extensible, compatible avec de nombreuses langues et doté de fonctions IA comme le “mode agent”.

- [XRoute](https://xroute.ai) : interface unifiée pour les LLM, meilleurs prix, meilleur débit, sans abonnement.

- [MemU](https://github.com/NevaMind-AI/memU) : framework mémoire open‑source pour compagnons IA.
