# Supabase setup

## 1. プロジェクトを作成する

1. Supabase Dashboardへログインする。
2. **New project**からAI Web Scout用プロジェクトを作成する。
3. リージョンは利用者に近い場所を選択する。
4. Database passwordはパスワードマネージャーへ保存する。

## 2. migrationを適用する

リモートDBへ直接SQLを貼り付けず、Supabase CLIでmigration履歴を管理する。

```powershell
npx --yes supabase@2.109.1 init
npx --yes supabase@2.109.1 login
npx --yes supabase@2.109.1 link --project-ref YOUR_PROJECT_REF
npx --yes supabase@2.109.1 db push --dry-run
npx --yes supabase@2.109.1 db push
npx --yes supabase@2.109.1 migration list
```

`init`で既に初期化済みと表示された場合は、そのまま次へ進む。`link`ではプロジェクト作成時のDatabase passwordを求められる場合がある。`db push --dry-run`で対象が`20260722000100_create_ai_web_scout_schema.sql`だけであることを確認してから`db push`する。

適用後、Dashboardの**Table Editor**で5テーブルとRLSを確認する。既に適用済みのmigrationを再実行せず、変更は新しいmigrationファイルとして追加する。

## 3. RLSを確認する

SQL Editorで次を実行する。

```sql
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'profiles',
    'captured_pages',
    'analyses',
    'agent_steps',
    'analysis_tags'
  )
order by tablename, policyname;
```

5テーブルすべてに所有者限定policyが表示されることを確認する。

## 4. APIキーを設定する

Dashboardの**Project Settings → API**から次を取得する。

- Project URL
- Publishable keyまたはlegacy anon key

リポジトリ直下に、Git管理されない`.env.local`を作成する。

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

変数名は互換性のため`ANON_KEY`としているが、新しいSupabase projectではpublishable keyを設定してよい。

`SUPABASE_SERVICE_ROLE_KEY`は現フェーズの通常動作には不要である。取得する場合もブラウザ、Chrome拡張、`NEXT_PUBLIC_*`変数へ絶対に含めない。

## 5. Auth URLを設定する

Dashboardの**Authentication → URL Configuration**で次を設定する。

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/**`

MVPの認証方式はEmail Magic Linkを予定している。Auth画面とcallbackは後続フェーズで実装する。

## 6. 型を同期する

Dashboardの型生成機能、またはSupabase CLIで`public` schemaのTypeScript型を生成する。CLIを利用する場合は次の形式で実行する。

```powershell
npx --yes supabase@2.109.1 gen types typescript --linked --schema public
```

生成型は`apps/web/infrastructure/supabase/database.types.ts`と比較する。直接置き換えた場合は次を実行する。

```powershell
corepack pnpm typecheck
corepack pnpm test
```

## 7. 現フェーズの確認範囲

Supabase projectがなくても、migration構造、mapper、Repository、環境変数検証はローカルテストできる。実DBでのmigration適用とRLS動作確認は、上記セットアップ後に実施する。

## Troubleshooting: スキーマ適用済みで履歴だけ存在しない場合

`db push`が`type already exists`で失敗し、対象enum、5テーブル、RLS、各テーブル4件のpolicy、`updated_at`トリガーまで期待どおり存在する場合は、migration履歴だけが欠けている可能性がある。スキーマがmigrationと一致することを確認した後に限り、次で履歴を修復する。

```powershell
npx --yes supabase@2.109.1 migration repair --status applied 20260722000100
npx --yes supabase@2.109.1 migration list
npx --yes supabase@2.109.1 db push --dry-run
```

最後にLocalとRemoteのversionが一致し、`Remote database is up to date.`と表示されることを確認する。確認せずに`migration repair`を実行したり、`drop ... cascade`で既存オブジェクトを削除したりしない。
