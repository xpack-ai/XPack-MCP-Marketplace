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

**XPack** は世界初のオープンソース MCP マーケットプレイスです。数分で自分の MCP サービスを作成して販売できます。

<br>

✨ XPack でできること
- ✅ **OpenAPI → MCP サービス設定をワンクリック生成**
- 🧾 **SEO に強いトップページ + MCP サービスページ**
- 💳 **内蔵課金（リクエスト数 / トークン消費ベース）**
- 👥 **ユーザーアカウント管理**
- 🛠 **Stripe 決済対応**
- 🔐 **Email & Google OAuth サインイン対応**

すべて **Apache 2.0** のオープンソース。商用利用も安心です。

<br>

# ✨ クイックスタート
😍 導入はとても簡単。**1 行のコマンド**で、10 分であなたの MCP マーケットを立ち上げられます。

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

[![10分で MCP マーケットをデプロイする方法](https://github.com/user-attachments/assets/8881d724-b6aa-47b7-bbd7-b587ef541957)](https://www.youtube.com/watch?v=XHJXyvDevd8)

<br>

# 📸 機能
![b2](https://github.com/user-attachments/assets/c8cc89a4-ab5f-4c90-8c97-9207b5c9f5c1)
![b3](https://github.com/user-attachments/assets/16f74c8a-b35e-40a7-8471-a5736de8e904)
![b4](https://github.com/user-attachments/assets/fc76c215-7544-4267-bc6f-22a719edec00)
![b5](https://github.com/user-attachments/assets/db40ea77-58c3-472d-ba94-35dc9716a980)

<br>

## 🖥️ システム要件

### ✅ 推奨ハードウェア
- **CPU**: 8 コア  
- **メモリ**: 16 GB  
- **ストレージ**: 200 GB  
- **OS**: Linux  
- **アーキテクチャ**: AMD64  

### ✅ 最低要件
- **CPU**: 2 コア  
- **メモリ**: 4 GB  
- **ストレージ**: 200 GB  
- **OS**: Linux / macOS  
- **アーキテクチャ**: AMD64 / ARM64  

<br>

## 📦 実行時依存関係

**XPack-MCP-Market** を実行するには、以下のサービス（セルフホストまたはコンテナ）が必要です。

| コンポーネント | 最低バージョン |
|---|---|
| **MySQL**   | ≥ 5.7.x |
| **Redis**   | ≥ 6.2.x |
| **RabbitMQ**| ≥ 4.0   |

これらのサービスが利用可能で、正しく設定されていることを確認してください。

<br>

## 💿 デプロイ

😍 導入はとても簡単。**1 行のコマンド**で、10 分であなたの MCP マーケットを立ち上げられます。

```bash
curl -sSO https://xpack.ai/install/quick-start.sh; bash quick-start.sh
```

<details>
  <summary><h4>🔖 Docker-Compose デプロイ</h4></summary>

  この方法でインストールするには、[Docker](https://docs.docker.com/engine/install/) と [Docker Compose](https://docs.docker.com/compose/install/standalone/) が必要です。

  1. `docker-compose.yml` を編集
  ```
  vi docker-compose.yml
  ```
  <br>

  2. 設定を変更します。元のファイルは [docker-compose.yml](https://github.com/xpack-ai/XPack-MCP-Market/blob/main/scripts/docker-compose.yml) を参照してください。
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

  3. XPack-MCP-Market を起動
  ```
  docker-compose up -d
  ``` 

  <br>

  4. ブラウザでポート 3000 にアクセス
  * **管理画面ログイン**: http://{IP}:3000/admin-signin  
  * **管理ユーザー**: admin  
  * **管理パスワード**: 123456789
</details>

<details>
  <summary><h4>🔖 ビルド</h4></summary>
  
  1. リポジトリをクローン
  ```
  git clone https://github.com/xpack-ai/XPack-MCP-Market.git
  ```
  2. プロジェクトへ移動
  ```
  cd XPack-MCP-Market
  ```
  ### フロントエンドビルド
  > 要件:
  > - Node >= 22.x
  > - Pnpm >= 10.x
  
  1. ビルドスクリプトを実行
  ```
  cd scripts && ./frontend_build.sh && cd ../
  ```
  ビルド後、フロントエンドは `frontend/out` に出力されます。
  
  2. UI を起動
  ```
  cd frontend/out && node server.js
  ```
  ### バックエンドビルド
  > 要件:
  > - Python >= 3.11
  
  #### `uv` を使用（推奨）
  1. 仮想環境を作成
  ```
  uv venv
  ```
  2. 仮想環境を有効化
  ```
  source .venv/bin/activate
  ```
  3. 依存関係をインストール
  ```
  uv pip install -r requirements.txt
  ```
  4. 環境変数ファイルをコピー
  ```
  cp .env.example .env
  ```
  5. 環境変数を編集
  ```
  vi .env
  ```
  6. 管理用バックエンドサービスを起動  
  **フォアグラウンド**
  ```
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload
  ```
  **バックグラウンド**
  ```
  uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8001 --reload &
  ```
  
  7. API → MCP サービスを起動  
  **フォアグラウンド**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload
  ``` 
  **バックグラウンド**
  ```
  uvicorn services.api_service.main:app --host 0.0.0.0 --port 8002 --reload &
  ```
  ### Docker ビルド
  ```
  docker build -t xpack-mcp-market --build-arg APP=xpack-mcp-market --build-arg VERSION=1.0.0 -f ./scripts/Dockerfile ./
  ```
</details>

# 📸 スクリーンショット
<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/5f71bfcf-c128-42ab-8077-3f2ede549f80" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/d7c0b40d-182e-47a6-bcdf-bd36970f5ee6" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/ae40f659-87ad-42d4-8379-b47a48eb6a29" />

<img width="1415" height="797" alt="image" src="https://github.com/user-attachments/assets/1049f4e5-ec3f-4520-8480-6d6432d6f5d2" />

<br>

# 🧾 ライセンス
XPack-MCP-Market は **Apache 2.0** ライセンスで提供されています。  
詳細は [LICENSE](./LICENSE) をご覧ください。

<br>

# 📬 お問い合わせ
- 🌐 Website: [https://xpack.ai](https://xpack.ai)
- 📧 Email: [contact@xpack.com](mailto:contact@xpack.com)
- 💬 Discord：[Link](https://discord.gg/cyZfcdCXkW)

<br>

# 🤝 パートナー
- [Cursor](https://www.cursor.com/): Cursor は AI をエディタに統合し、次の編集候補、コードベースの深い理解、自然言語での編集などを提供する AI コードエディタです。開発効率を高めます。

- [Dify](https://dify.ai/): Dify はエージェンティック AI 開発プラットフォームのリーダーで、エージェントワークフロー、RAG、各種統合、可観測性など、AI アプリ構築に必要な一式を提供します。多数の LLM とプラグインに対応。

- [Trae](https://www.trae.ai/): Trae は「真の AI エンジニア」を体現することを目指した AI ネイティブ IDE。チャットベースの UI でコード生成や支援を行い、品質と生産性を向上させます。

- [Windsurf](https://windsurf.com/): Windsurf は AI を活用した新しい IDE。深いコード理解のための「Cascade」、賢い補完「Windsurf Tab」、コードベースの記憶「Memories」などを備え、開発の流れを途切れさせません。

- [Coze](https://www.coze.com/): Coze は ByteDance の次世代 AI アプリ/チャットボット開発プラットフォーム。ノーコードのビルダー、ワークフロー、独自データ接続、プラグイン/ナレッジベースで簡単に強力なボットを作成できます。

- [Claude Code](https://www.anthropic.com/claude-code): Claude Code は Anthropic の CLI ツール。ターミナルに Claude Opus 4 を組み込み、リポジトリ横断編集、コマンド実行、IDE 連携、テスト連携などを実現します。

- [Flowith](https://flowith.io/): Flowith はキャンバス型 UI の AI ワークスペース。マルチスレッドのエージェント体験で知識変換と深い作業に最適化し、従来のチャット型を越える体験を提供します。

- [OpenManus](https://github.com/FoundationAgents/OpenManus): OpenManus は汎用 AI エージェント構築のための OSS フレームワーク。複数エージェントに対応し、LLM API やブラウザ自動化ツールと統合可能です。

- [Fellou](https://fellou.ai/): Fellou は行動まで担う「エージェンティックブラウザ」。情報収集から洞察提示までを自動化し、Notion/LinkedIn などとも連携します。

- [Genspark](https://www.genspark.ai/): Genspark は AI Slides / Sheets / Chat などを備えたオールインワンの AI コンパニオン。AI Pods による多様なコンテンツ生成が可能です。

- [TEN](https://github.com/TEN-framework/ten-framework): TEN（The Embodied Narrator）はリアルタイム・マルチモーダル音声エージェントの OSS。アバター、MCP 連携、ハードウェア通信、画面共有検出などを備えます。

- [APIPark](https://apipark.com/): APIPark は OSS のエンタープライズ API デベロッパーポータルかつオールインワン LLM ゲートウェイ。統一 API、負荷分散、トラフィック制御、セマンティックキャッシュ、プロンプト管理、マスキング等で安全・安定運用を実現。

- [ChatGPT](https://chatgpt.com/): ChatGPT は OpenAI の対話型 AI。高度な言語理解と生成で、追質問対応や各種プラットフォーム統合を通じて生産性を高めます。

- [LangChain](https://www.langchain.com/): LangChain は堅牢なエージェント/LLM アプリ開発プラットフォーム。LangGraph / LangSmith / LangGraph Platform により、コード生成、自動化、AI 検索を横断的に支援します。

- [LEMON AI](https://lemonai.cc/): Lemon AI はフルスタックなオープンソース・エージェンティック AI フレームワーク。安全な実行のための組み込み Code Interpreter VM サンドボックスを備えます。

- [LobeChat](https://lobehub.com/): LobeHub の LobeChat は個人向け LLM 生産性ツール。個人エージェント/チーム構築、豊富なプラグイン、知識ベース、画像/音声対応などを提供します。

- [VS Code](https://code.visualstudio.com/): Visual Studio Code は拡張性が高い OSS エディタ。多言語対応と AI 機能（次の編集候補、エージェントモード等）を備えます。

- [XRoute](https://xroute.ai): 複数 LLM を単一インターフェースで扱えるゲートウェイ。より良い価格とスループット、サブスクリプション不要を提供します。

- [MemU](https://github.com/NevaMind-AI/memU): MemU は AI コンパニオン向けのオープンソース記憶フレームワークです。
