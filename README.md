# Hono Urusai Wrapper

一個基於 [Cloudflare Workers](https://workers.cloudflare.com/) 和 [Hono](https://hono.dev/) 框架開發的 Telegram 機器人，作為 [Urusai](https://urusai.cc/) 服務的封裝。

此機器人允許授權的使用者透過 Telegram 快速上傳檔案至 Urusai，並查詢已上傳的檔案與相簿。

## ✨ 主要功能

*   **檔案上傳**: 接收並上傳檔案至 Urusai 服務。
*   **檔案查詢**: 提供 `/query` 指令，可查詢 `file` (檔案) 或 `album` (相簿) 類型的資料。
*   **快捷選單**: 支援 `/menu` 指令，提供視覺化的按鈕以快速執行查詢。
*   **使用者授權**: 僅回應已在環境變數中設定的特定 Telegram User ID，忽略其他所有人的訊息。
*   **預設回覆**: 當授權使用者傳送非指令訊息時，會自動回覆 `Ｈｅｌｌｏ`。
*   **大小限制**: 自動拒絕超過 20MB 的檔案上傳。

## ⚙️ 設定與部署

### 1. 前置需求

*   [Node.js](https://nodejs.org/) (建議版本 18.x 或以上)
*   [Bun](https://bun.sh/) (用於安裝依賴套件)
*   一個 [Cloudflare](https://www.cloudflare.com/) 帳號
*   已安裝並登入 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### 2. 安裝專案

複製此專案並安裝依賴套件：

```bash
git clone <your-repository-url>
cd hono-urusai-wrapper
bun install
```

### 3. 設定環境變數 (Secrets)

本專案使用 Cloudflare Workers 的 Secrets 來管理敏感資訊。請在專案根目錄下，執行以下指令來設定必要的環境變數：

```bash
# 您的 Telegram Bot Token
npx wrangler secret put BOT_TOKEN

# 您的 Urusai 服務使用者名稱
npx wrangler secret put URUSAI_USERNAME

# 您的 Urusai 服務 API Token
npx wrangler secret put URUSAI_API_TOKEN

# 您自己的 Telegram User ID (用於授權)
npx wrangler secret put MY_TELEGRAM_ID
```
> **提示**: 您可以透過與 [@userinfobot](https://t.me/userinfobot) 對話來取得您的 Telegram User ID。

您可以使用 `npx wrangler secret list` 來確認已設定的 secrets。

### 4. 部署

完成設定後，使用以下指令將此 Worker 部署到 Cloudflare：

```bash
npx wrangler deploy
```
> **注意**: `wrangler.jsonc` 中的 `name` 欄位定義了您在 Cloudflare 上的服務名稱。

## 🤖 如何使用

部署成功後，即可在 Telegram 中與您的機器人互動：

*   `/menu`
    *   傳送此指令會顯示「檔案」和「相簿」兩個按鈕，方便您快速查詢。

*   `/query <type>`
    *   直接查詢指定類型的資料。
    *   範例: `/query file` 或 `/query album`。

*   **上傳檔案**
    *   直接將檔案（文件）傳送給機器人即可觸發上傳流程。

*   **其他訊息**
    *   若您是授權使用者，傳送任何非指令的訊息（如文字、貼圖），機器人都會回覆 `Ｈｅｌｌｏ`。