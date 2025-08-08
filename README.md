# hono-urusai-wrapper

這是一個基於 [Cloudflare Workers](https://workers.cloudflare.com/) 和 [Hono](https://hono.dev/) 框架開發的 Telegram Bot。

主要功能是接收使用者透過 Telegram 傳送的檔案，自動將其上傳至 [urusai.cc](https://urusai.cc/) 圖床，並將檔案資訊記錄到指定的 Google Sheets 中。

## ✨ 功能

*   **檔案上傳**: 接收 Telegram 使用者傳送的檔案。
*   **大小限制**: 自動拒絕超過 20MB 的檔案。
*   **圖床整合**: 將收到的檔案上傳到 `urusai.cc`。
*   **Google Sheets 記錄**: 透過 Google Apps Script 將 `urusai.cc` 回傳的檔案資訊（預覽網址、刪除網址等）新增到試算表中。
*   **即時狀態回饋**: 透過 Telegram Bot 的 `sendChatAction` 提供即時的處理狀態（例如：正在上傳檔案、正在輸入中）。

## 🚀 運作流程

1.  使用者將檔案傳送給此 Telegram Bot。
2.  Cloudflare Worker 接收到來自 Telegram Webhook 的請求。
3.  程式檢查檔案大小是否超過 20MB。
4.  程式從 Telegram 下載檔案。
5.  程式將檔案上傳到 `urusai.cc`。
6.  程式呼叫 Google Apps Script 的 Webhook，將 `urusai.cc` 回傳的檔案資訊傳遞過去。
7.  Google Apps Script 將資訊寫入指定的 Google Sheet。
8.  Bot 回傳成功訊息及檔案的預覽和刪除連結給使用者。

## ⚙️ 開始使用

### 前置需求

*   [Node.js](https://nodejs.org/) 和 [Bun](https://bun.sh/)
*   一個 [Cloudflare](https://www.cloudflare.com/) 帳號
*   一個 Telegram Bot Token
*   一個 Google Apps Script 的 Webhook URL

### 安裝

1.  複製此專案：
    ```bash
    git clone https://github.com/your-username/hono-urusai-wrapper.git
    cd hono-urusai-wrapper
    ```

2.  安裝依賴套件：
    ```bash
    bun install
    ```

### 環境變數設定

在專案根目錄建立一個 `.dev.vars` 檔案，並填入以下變數：

```
BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
APP_SCRIPT_URL="YOUR_GOOGLE_APPS_SCRIPT_URL"
SECRET_TOKEN="YOUR_SECRET_TOKEN_FOR_APP_SCRIPT"
```

若要部署到 Cloudflare，您也需要在 Cloudflare Worker 的設定中加入這些環境變數。

### 本地端開發

使用以下指令啟動本地開發伺服器：

```bash
bun run dev
```

### 部署

使用以下指令將此 Worker 部署到 Cloudflare：

```bash
bun run deploy
```

## 📜 可用腳本

*   `bun run dev`: 在本地端啟動開發伺服器。
*   `bun run deploy`: 將 Worker 部署到 Cloudflare 並壓縮程式碼。
