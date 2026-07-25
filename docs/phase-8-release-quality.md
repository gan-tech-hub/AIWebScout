# Phase 8: Release Quality

## 目的

MVPを第三者がセットアップ・検証できる状態へ仕上げる。新機能を広げず、コード監査、回帰テスト、プライバシー、認証継続性、障害時UX、運用ドキュメントを完成させる。

## コード監査で追加した対策

### Capture privacy

- URLの`access_token`、`token`、`api_key`、`password`、`secret`、`session`などのクエリ値を`[REDACTED]`へ置換する。
- URLにusername/passwordが埋め込まれている場合は共有APIスキーマでも拒否する。
- 本文と選択テキストに加え、タイトルとmeta descriptionも秘匿化する。
- 通常のクエリ、path、fragmentは分析コンテキストとして維持する。

URL上では`[REDACTED]`が`%5BREDACTED%5D`とpercent encodingされる。これは期待する表示である。

### Authentication and headers

- Supabase SSR MiddlewareでセッションCookieを更新する。
- 認証・所有権判定は各ページとRoute Handlerで継続する。
- `X-Content-Type-Options`、`X-Frame-Options`、`Referrer-Policy`、`Permissions-Policy`を設定する。

### Failure UX and safe logging

- ログイン、プロフィール保存、再分析のネットワーク障害を捕捉し、日本語の再試行案内を表示する。
- AIバックグラウンド処理の失敗時は、ページ本文、プロバイダー応答、APIキーをログへ出さない。
- 記録対象を`analysisId`、`capturedPageId`、安全なエラーコードに限定する。
- `AI_TIMEOUT`、`AI_PROVIDER_ERROR`、`INVALID_AI_OUTPUT`などで運用上の切り分けを可能にする。

## Test coverage

フェーズ8完了時点のVitestは合計109件。

| 対象             | 主な検証                                                   |
| ---------------- | ---------------------------------------------------------- |
| Shared contracts | Capture/Profile/AIスキーマ、URL、上限、空本文、構造一致    |
| Chrome extension | DOM取得、権限エラー、秘匿化、API通信、タイムアウト         |
| API              | 認証、正常受付、JSON不正、Zod不正、検索条件                |
| Repository       | user_id条件、filter、limit、DBエラー変換                   |
| AI workflow      | bounded flow、Tool allowlist、Structured Outputs、失敗状態 |
| Presentation     | 履歴filter、推奨ラベル、ページ種別固有表示                 |
| Security         | migration/RLS構造、安全なAI失敗ログ                        |

品質ゲート:

```powershell
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build
```

## Manual acceptance

- 認証状態を維持してDashboardへアクセスできる。
- Settingsを保存できる。
- 拡張version `0.2.1`で通常ページを取得・分析できる。
- 別オリジン移動後の再接続が機能する。
- 機密URLテストで秘密値が表示されない。
- 全5ページ種別で日本語分析と適切な固有項目を確認できる。
- 再分析が新しい分析IDを作成する。
- AI一時失敗時は安全なエラーを表示し、再分析で復旧できる。

機密URL確認例:

```text
https://example.com/?page=2&access_token=test-secret
```

期待値:

- `page=2`は維持
- `test-secret`は消去
- `access_token=%5BREDACTED%5D`と表示

## Pollingと再分析

分析が`pending`または`running`の間、詳細画面は約1.5秒間隔でServer Componentを更新する。ターミナルに複数の`GET /analyses/{id}`が表示されるが、AI分析を再実行しているわけではない。

再分析は`POST /api/analyses/{id}/retry`で新しい分析レコードを作成する。`202`は正常受付を表す。MVPではAIプロバイダーの一時失敗に対する自動再試行を行わず、ユーザー操作の「再分析」で復旧する。

## Supabase作業

フェーズ8ではDB schemaとRLSを変更していないため、新しいmigration適用は不要。

## Release limitations

- `after()`は永続ジョブキューではなく、実行保証や自動再試行を提供しない。
- エラーコードは安全なカテゴリまで記録し、プロバイダーの生応答は保存しない。
- E2Eブラウザテスト、負荷テスト、アクセシビリティ自動監査はMVP後の対象。
- 公開前に保存期間、削除機能、利用規約、プライバシーポリシーを確定する。
