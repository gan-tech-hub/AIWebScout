# Phase 6: End-to-end Integration

## 目的

Chrome拡張で取得したページ情報を、認証済みユーザーとしてWeb APIへ送り、保存・AI分析・進行表示・履歴閲覧まで一続きにする。フェーズ6では新しいDB migrationは追加しない。

## 実装したフロー

1. Webアプリの`/login`でSupabase Authへログインする
2. Chrome拡張で現在ページを取得し、送信内容を確認する
3. `POST /api/captures/analyze`が入力をZodで検証する
4. RLSが有効なユーザーセッションで`captured_pages`と`analyses`を作成する
5. APIは`202 Accepted`と分析IDを返し、制御されたAIワークフローを非同期に開始する
6. 拡張は分析詳細画面を開く
7. Agent Workspaceが分析中は約1.5秒間隔で更新し、保存済み`agent_steps`と最終結果を段階的に表示する
8. ダッシュボード・履歴・設定はSupabaseの実データを表示・更新する

## 認証とCORS

- Web画面とRoute HandlerはSupabaseユーザーセッションを必須とする。
- Route HandlerはCookie認証に加え、将来のクライアント用にBearer tokenも受け付ける。
- Chrome拡張のOriginは`CHROME_EXTENSION_ORIGINS`の明示的な許可リストだけを反映する。
- `*`とcredentialの併用は行わない。
- 未ログイン時、拡張は「Webアプリでログイン」ボタンを表示する。
- service role keyとOpenAI API keyは拡張およびブラウザへ渡さない。

パッケージ化されていない拡張を読み込んだ後、`chrome://extensions`に表示される拡張IDを使ってWebアプリ直下の`.env.local`へ設定する。

```env
CHROME_EXTENSION_ORIGINS=chrome-extension://ここに拡張ID
```

複数Originを許可する場合はカンマ区切りにする。変更後はWeb開発サーバーを再起動する。

## API

| Method | Path                      | 用途                                 |
| ------ | ------------------------- | ------------------------------------ |
| POST   | `/api/captures/analyze`   | ページ保存と分析開始                 |
| GET    | `/api/analyses`           | ログインユーザーの分析一覧           |
| GET    | `/api/analyses/:id`       | ページ・ステップ・タグを含む分析詳細 |
| POST   | `/api/analyses/:id/retry` | 同じ取得ページを使った再分析         |
| GET    | `/api/profile`            | プロフィール取得                     |
| PUT    | `/api/profile`            | プロフィール更新                     |

成功・失敗とも共有API envelopeを返す。予期しない例外の内部情報はクライアントへ返さず、サーバーログへ限定する。

## Supabaseで確認すること

1. **Authentication → Providers → Email**を有効にする。
2. **Authentication → URL Configuration**のSite URLを`http://localhost:3000`にする。
3. メール確認を使う場合はRedirect URLsへ`http://localhost:3000/**`を追加する。
4. `/login`でアカウントを作成する。メール確認が有効なら確認後にログインする。

フェーズ2のmigrationとRLSが適用済みであれば追加SQLは不要。

## 手動動作確認

1. `.env.local`へSupabase、OpenAI、`CHROME_EXTENSION_ORIGINS`を設定する。
2. `corepack pnpm dev`を起動する。
3. `http://localhost:3000/login`でログインし、Settingsを保存する。
4. `corepack pnpm --filter @ai-web-scout/extension build`を実行し、`apps/extension/dist`をChromeで再読み込みする。
5. 通常のHTTPSページでサイドパネルを開き、「ページを取得」→「AIで分析」を押す。
6. 開いた分析詳細でステップが`pending / running / completed`へ変わり、Final Insightが表示されることを確認する。
7. DashboardとAnalysesへ同じ分析が表示されることを確認する。
8. 「再分析」で新しい分析IDへ遷移することを確認する。
9. 未ログイン状態では拡張にログイン導線が表示されることを確認する。

## エラー時の確認

- `401`: Webアプリへログインし直す。
- CORSエラー: 拡張IDと`CHROME_EXTENSION_ORIGINS`が一致しているか確認し、Webサーバーを再起動する。
- 分析失敗: Agent Workspaceの失敗ステップとサーバーログを確認する。APIキーやプロバイダー詳細は画面へ表示しない。
- URL切り替え後の取得失敗: サイドパネルの接続更新フローで現在ページへの権限を再付与する。

## MVP上の制約

- 非同期処理はNext.jsの`after()`で実行する。長時間処理、再試行保証、分散実行が必要になった時点でジョブキューへ分離する。
- 一覧表示はMVPの件数を想定したRepository取得であり、大量データ対応時にページネーションと集約クエリを追加する。
- リアルタイム表示は短いポーリングで実現する。将来はSupabase Realtimeまたはジョブイベントへ置換できる。
