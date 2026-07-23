# Phase 4: Chrome Extension Sensor

## 目的

Chrome拡張機能を、閲覧中のページから必要な情報だけを取得し、ユーザーが確認したうえでWebアプリへ渡す「センサー兼入口」として完成させる。AI処理、APIキー、データ永続化は拡張機能へ配置しない。

## 構成

```text
apps/extension/src/
  api/          API送信、エラー変換、分析画面への遷移
  background/   Side Panelを開くService Worker
  capture/      Active TabのDOM取得、正規化、検証
  sidepanel/    プレビュー、状態表示、ユーザー操作
  config.ts     公開可能なWebアプリ接続先
```

## 取得する情報

- `document.title`
- HTTPまたはHTTPSのURL
- フォームや編集領域などを除外した本文テキスト
- ユーザーが選択しているテキスト
- `meta[name="description"]`
- ISO 8601形式の取得日時

次の要素は複製DOMから削除してから本文を読み取る。

```text
input, textarea, select, option, [contenteditable],
script, style, noscript, template
```

HTMLそのものは保存・送信しない。編集可能領域内の選択文字列も除外する。さらに、カード番号、パスワード、APIキー、認証トークンらしい文字列を正規化時にマスクする。共通ZodスキーマでURL、日時、各文字数上限を検証し、本文は最大50,000文字へ切り詰める。本文が空でも、タイトルやメタ情報による後続分析を妨げない。

## 権限

| 権限                      | 用途                                       |
| ------------------------- | ------------------------------------------ |
| `activeTab`               | ユーザーが拡張を開いたタブだけを対象にする |
| `scripting`               | 明示操作後にページ情報を取得する           |
| `sidePanel`               | 確認UIをChrome Side Panelに表示する        |
| `http://localhost:3000/*` | ローカルWebアプリのAPIへ送信する           |

任意サイトを常時読み取る`<all_urls>`と`optional_host_permissions`は使用しない。拡張アイコンのLauncher PopupからSide Panelを開くユーザー操作により、Chromeの`activeTab`一時権限だけを取得する。権限は現在のタブに限定され、別オリジンへ移動すると失効する。本番のWebアプリへ接続する場合は、API通信用の`host_permissions`を実際のオリジンだけに変更して再ビルドする。

Chrome側に保持される`openPanelOnActionClick`の自動動作は起動時に明示的に無効化する。Actionには小さなLauncher Popupを設定し、そのボタン操作から対象タブ専用のSide Panelを開く。Popupを開くAction操作により`activeTab`が付与され、サイト単位の永続アクセス確認を不要にする。

### ページ移動後の再接続

同じオリジン内のページ移動では、Side Panelを開いたまま「再取得」できる。別オリジンへ移動すると、Chromeのセキュリティ仕様により`activeTab`権限が失効するため、拡張側だけで自動的に再許可することはできない。

この場合は、取得失敗を一般エラーとして扱わず「Reconnect required」と再接続の2ステップを表示する。ChromeツールバーのAI Web Scoutを押してLauncher Popupを開き、「現在のページに接続」を押すと、その明示的なAction操作によって新しいページへの`activeTab`権限を取得し、対象タブのSide Panelを最新状態で開き直す。

Side Panelから`chrome.action.openPopup()`でPopupを開いても、ツールバーのActionを直接実行した場合と同じ`activeTab`権限は得られないため、この方法は使用しない。

別オリジンへの移動による権限失効は想定内の状態であり、拡張機能の実行エラーとして`console.error`へ記録しない。Side Panelの再接続案内だけで扱う。予期しないスクリプト実行失敗は診断のためエラーとして記録する。

## API契約

`POST /api/captures/analyze` へ共有の `CapturePageInput` をJSONで送る。

成功データ：

```json
{
  "success": true,
  "data": {
    "capturedPageId": "uuid",
    "analysisId": "uuid",
    "status": "pending"
  },
  "error": null
}
```

応答もZodで検証する。成功後は `/analyses/{analysisId}` を新しいタブで開く。通信タイムアウト、ネットワーク障害、認証エラー、APIエラー、不正な応答を別々に扱い、内部エラーの詳細を画面へ露出しない。

フェーズ4時点ではRoute Handlerが未実装のため、「AIで分析」を押すと接続または応答エラーが安全に表示される。実APIとの結合はフェーズ6で行う。

## ビルドとChromeへの読み込み

プロジェクトルートで実行する。

```powershell
corepack pnpm --filter @ai-web-scout/extension build
```

1. Chromeで `chrome://extensions` を開く。
2. 「デベロッパーモード」を有効にする。
3. 「パッケージ化されていない拡張機能を読み込む」を選ぶ。
4. `apps/extension/dist` を指定する。
5. HTTPまたはHTTPSのページを開く。
6. ツールバーのAI Web Scoutを押してLauncher Popupを開く。
7. 「現在のページに接続」を押す。
8. Side Panelで「ページを取得」を押す。

ソースを変更した場合は再ビルドし、拡張機能一覧の更新ボタンを押してからSide Panelを開き直す。

別サイトへ移動した場合は、Side Panelで「再取得」を押し、表示された案内に従ってツールバーのAI Web Scoutから現在のページへ接続し直す。同じサイト内のページ移動では再接続は不要である。

## 接続先の変更

`apps/extension/.env.local` を作成する。

```dotenv
VITE_WEB_APP_URL=http://localhost:3000
```

`VITE_*` は拡張バンドルへ公開されるため、URL以外の秘密情報を設定してはいけない。接続先を変更した場合は、Manifestの`host_permissions`も同じオリジンに限定して変更する。

## 手動確認項目

- 通常のWebページでタイトル、URL、本文文字数、選択文字数、メタ情報が表示される。
- 選択テキストがある場合、送信内容の先頭に選択内容が表示される。
- `chrome://extensions`など取得不可ページで案内メッセージが表示される。
- 取得内容を確認するまで「AIで分析」が無効である。
- 取得中・送信中にボタンが二重実行できない。
- Webアプリ停止時に接続エラーが表示され、再取得できる。
- フォームに入力した値が本文プレビューへ含まれない。
- 別オリジンへ移動後、「再取得」から再接続導線へ進み、新しいページを取得できる。

## フェーズ4の境界

- 認証トークン受け渡しの最終方式
- API Route Handler
- Supabaseへの保存
- OpenAI分析
- リアルタイム進捗表示

これらはフェーズ5・6で実装または結合する。
