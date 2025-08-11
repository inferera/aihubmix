# Claude Code Router

<div align="center">
  <div style="margin-bottom: 20px;">
    <a href="./README.zh.md" style="margin: 0 10px; padding: 8px 16px; background-color: #f0f0f0; color: #333; text-decoration: none; border-radius: 4px;">中文</a>
    <a href="./README.md" style="margin: 0 10px; padding: 8px 16px; background-color: #f0f0f0; color: #333; text-decoration: none; border-radius: 4px;">English</a>
    <a href="./README.ja.md" style="margin: 0 10px; padding: 8px 16px; background-color: #007acc; color: white; text-decoration: none; border-radius: 4px;">日本語</a>
  </div>
</div>

複数のAIモデルをサポートする簡素化されたClaude Codeルーティングサービス。

## 機能

- 🚀 簡素化された設定管理
- 🔄 異なるAIモデルへの自動ルーティング
- ⚡ 高速な起動と停止
- 🔧 簡単な設定

## インストール

**要件：**
- Node.js >= 20

まず、Claude Codeがインストールされていることを確認してください：
```bash
npm install -g @anthropic-ai/claude-code
```

次に、@aihubmix/claude-codeをインストールします：
```bash
npm install -g @aihubmix/claude-code
```

## 設定

現在2つの設定方法がサポートされています。詳細な説明については[CONFIGURATION.md](./CONFIGURATION.md)をご覧ください。

### 1. 環境変数（推奨）

```bash
export AIHUBMIX_API_KEY="your-api-key-here"
export HOST="127.0.0.1"  # オプション
export PORT="3456"        # オプション
export LOG="true"         # オプション
export API_TIMEOUT_MS="30000"  # オプション
```

### 2. 設定ファイル

設定ファイルは`~/.aihubmix-claude-code/config.json`にあります：

```json
{
  "API_KEY": "your-api-key-here",
  "HOST": "127.0.0.1",
  "PORT": 3456,
  "LOG": true,
  "API_TIMEOUT_MS": 30000,
  "Router": {
    "default": "claude-sonnet-4-20250514",
    "background": "claude-3-5-haiku-20241022",
    "think": "claude-sonnet-4-20250514",
    "longContext": "gpt-4.1",
    "longContextThreshold": 60000,
    "webSearch": "gemini-2.0-flash-search"
  }
}
```

**注意**: 環境変数は設定ファイルよりも優先されます。

## 使用方法

### サービスの開始

```bash
acc start
```

### サービスの停止

```bash
acc stop
```

### サービスの再起動

```bash
acc restart
```

### ステータスの確認

```bash
acc status
```

### コードコマンドの実行

```bash
acc code "Write a Hello World function"
```

### バージョンの確認

```bash
acc version
```

### ヘルプの表示

```bash
acc help
```

## ルーティングルール

### デフォルトモデル設定

```json
{
  "default": "claude-sonnet-4-20250514",
  "background": "claude-3-5-haiku-20241022", 
  "think": "claude-sonnet-4-20250514",
  "longContext": "gpt-4.1",
  "longContextThreshold": 60000,
  "webSearch": "gemini-2.0-flash-search"
}
```

### ルーティングロジック

- **デフォルト**: `claude-sonnet-4-20250514`モデルを使用
- **バックグラウンドタスク**: モデルが`claude-3-5-haiku`の場合、`claude-sonnet-4-20250514`モデルを使用
- **思考タスク**: リクエストに`thinking`パラメータが含まれる場合、`claude-sonnet-4-20250514`モデルを使用
- **長文脈**: トークン数が60000を超える場合、`gpt-4.1`モデルを使用
- **ウェブ検索**: リクエストに`web_search`ツールが含まれる場合、`gemini-2.0-flash-search`モデルを使用

### カスタムルーター設定

設定ファイルの`Router`セクションをカスタマイズして、デフォルトのモデル設定をオーバーライドできます：

```json
{
  "Router": {
    "default": "your-custom-model",
    "background": "your-background-model", 
    "think": "your-thinking-model",
    "longContext": "your-long-context-model",
    "longContextThreshold": 50000,
    "webSearch": "your-web-search-model"
  }
}
```

#### ルーター設定項目

- **default**: 使用するデフォルトモデル
- **background**: バックグラウンドタスク用のモデル
- **think**: 思考タスク用のモデル  
- **longContext**: 長文脈タスク用のモデル
- **longContextThreshold**: 長文脈モデルをトリガーするトークン閾値（デフォルト60000）
- **webSearch**: ウェブ検索タスク用のモデル
