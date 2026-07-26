import type { Metadata } from 'next';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  Code2,
  MapPin,
  Orbit,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AIプロダクト開発エンジニア募集 | Scout Labs',
  description:
    'Next.js、TypeScript、OpenAI APIを活用するAIプロダクト開発案件。フルリモート、週3〜5日、月額70〜90万円。',
  robots: {
    index: false,
    follow: false,
  },
};

const requiredSkills = [
  'TypeScriptを用いたWebアプリケーション開発経験',
  'ReactまたはNext.jsによるフロントエンド開発経験',
  'REST APIとデータベースを利用した機能開発経験',
  'GitHubを用いたチーム開発経験',
];

const preferredSkills = [
  'OpenAI APIなどを利用したLLMアプリケーションの開発経験',
  'SupabaseまたはPostgreSQLの設計・運用経験',
  'Chrome拡張機能やブラウザAPIの利用経験',
  'AIエージェント、Structured Outputs、Tool Callingへの理解',
];

const projectPoints = [
  {
    icon: CircleDollarSign,
    label: '報酬',
    value: '月額 70〜90万円',
    note: '経験・稼働率に応じて決定',
  },
  {
    icon: Clock3,
    label: '稼働',
    value: '週3〜5日',
    note: '月96〜160時間を想定',
  },
  {
    icon: MapPin,
    label: '勤務形態',
    value: 'フルリモート',
    note: '国内居住者／地方在住可',
  },
  {
    icon: CalendarDays,
    label: '期間',
    value: '3か月〜長期',
    note: '開始時期は相談可能',
  },
];

export default function DemoJobPage() {
  return (
    <main className="min-h-screen overflow-hidden pb-24">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-14rem] h-[34rem] w-[48rem] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[120px]" />
        <div className="absolute right-[-12rem] top-[30rem] h-[28rem] w-[28rem] rounded-full bg-cyan-400/10 blur-[110px]" />
      </div>

      <div className="border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200 shadow-[0_0_28px_rgba(139,92,246,0.16)]">
              <Orbit className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">
                Scout Labs
              </p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                Build useful intelligence
              </p>
            </div>
          </div>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-medium text-amber-200">
            ポートフォリオ用の架空求人
          </span>
        </div>
      </div>

      <article className="mx-auto max-w-6xl px-5 sm:px-8">
        <header className="pb-10 pt-14 sm:pb-14 sm:pt-20">
          <div className="mb-6 flex flex-wrap gap-2">
            {['業務委託', 'フルリモート', '週3日〜', 'AIプロダクト'].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-medium text-slate-300"
                >
                  {tag}
                </span>
              ),
            )}
          </div>

          <div className="max-w-4xl">
            <p className="mb-4 flex items-center gap-2 text-sm font-medium text-violet-300">
              <Sparkles className="size-4" />
              AI PRODUCT ENGINEERING
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-6xl">
              AIエージェント搭載サービスを育てる
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-cyan-300 bg-clip-text text-transparent">
                フルスタックエンジニア
              </span>
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg">
              閲覧情報を価値あるインサイトへ変換するAIプロダクトの開発案件です。
              Next.jsとOpenAI
              APIを中心に、ユーザーがAIの仕事を理解しながら活用できる体験を一緒に設計します。
            </p>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {projectPoints.map(({ icon: Icon, label, value, note }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {label}
                </span>
                <Icon className="size-4 text-violet-300" />
              </div>
              <p className="font-semibold text-white">{value}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
            </div>
          ))}
        </section>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="space-y-8">
            <JobSection
              eyebrow="MISSION"
              title="プロジェクトについて"
              icon={<BriefcaseBusiness className="size-5" />}
            >
              <p>
                Scout
                Labs株式会社は、調査・比較・意思決定にかかる時間を減らすAIプロダクトを開発する架空のスタートアップです。現在はMVPの検証を終え、分析精度とユーザー体験を高めるフェーズにあります。
              </p>
              <p>
                本案件では、AIエージェントの処理基盤、分析結果を可視化するWebアプリ、ブラウザから情報を取得するChrome拡張機能を横断して開発していただきます。
              </p>
            </JobSection>

            <JobSection
              eyebrow="RESPONSIBILITIES"
              title="主な業務内容"
              icon={<Code2 className="size-5" />}
            >
              <CheckList
                items={[
                  'Next.js App Routerを用いた分析ダッシュボードの機能開発',
                  'OpenAI APIを利用した構造化分析ワークフローの設計・改善',
                  'Chrome拡張機能とWeb API間の連携実装',
                  'Supabaseを利用したデータ設計、認証、RLSの改善',
                  'AI処理ステップとデータフローを可視化するUIの開発',
                  'Vitestを用いたテスト追加とコードレビュー',
                ]}
              />
            </JobSection>

            <div className="grid gap-8 md:grid-cols-2">
              <JobSection
                eyebrow="REQUIRED"
                title="必須スキル"
                icon={<ShieldCheck className="size-5" />}
              >
                <CheckList items={requiredSkills} />
              </JobSection>
              <JobSection
                eyebrow="PREFERRED"
                title="歓迎スキル"
                icon={<Sparkles className="size-5" />}
              >
                <CheckList items={preferredSkills} accent />
              </JobSection>
            </div>

            <JobSection
              eyebrow="TEAM & PROCESS"
              title="開発体制・進め方"
              icon={<Users className="size-5" />}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Detail
                  label="チーム構成"
                  value="PM 1名、デザイナー 1名、エンジニア 3名"
                />
                <Detail label="定例MTG" value="週1回・60分／オンライン" />
                <Detail
                  label="コミュニケーション"
                  value="Slack、GitHub、Notion"
                />
                <Detail label="開発プロセス" value="1週間単位のスプリント" />
                <Detail
                  label="コアタイム"
                  value="なし（平日日中に連絡可能な方）"
                />
                <Detail
                  label="契約形態"
                  value="準委任契約・月末締め翌月末払い"
                />
              </div>
            </JobSection>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl border border-violet-300/20 bg-gradient-to-b from-violet-400/[0.12] to-white/[0.04] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
                Project summary
              </p>
              <h2 className="mt-4 text-xl font-semibold text-white">
                募集概要
              </h2>
              <dl className="mt-6 space-y-5">
                <SummaryRow label="募集元" value="Scout Labs株式会社（架空）" />
                <SummaryRow label="ポジション" value="フルスタックエンジニア" />
                <SummaryRow label="報酬" value="月額70〜90万円" />
                <SummaryRow label="稼働時間" value="週24〜40時間" />
                <SummaryRow label="勤務場所" value="フルリモート" />
                <SummaryRow label="開始時期" value="相談可能" />
              </dl>
              <div className="mt-7 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs font-medium text-slate-300">選考フロー</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  書類確認 → カジュアル面談 → 技術面談 → 契約条件の確認
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950">
                詳細を確認する
                <ArrowRight className="size-4" />
              </div>
              <p className="mt-4 text-center text-[11px] leading-5 text-slate-500">
                このページはAI Web
                Scoutの動作確認・撮影用に作成された架空の求人情報です。
              </p>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}

function JobSection({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-violet-300/15 bg-violet-400/10 text-violet-300">
          {icon}
        </span>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        </div>
      </div>
      <div className="space-y-4 text-sm leading-7 text-slate-400">
        {children}
      </div>
    </section>
  );
}

function CheckList({
  items,
  accent = false,
}: {
  items: string[];
  accent?: boolean;
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            className={`mt-1.5 grid size-4 shrink-0 place-items-center rounded-full ${
              accent
                ? 'bg-cyan-300/15 text-cyan-300'
                : 'bg-violet-300/15 text-violet-300'
            }`}
          >
            <Check className="size-2.5" strokeWidth={3} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-300">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/[0.08] pb-4 last:border-0 last:pb-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1.5 text-sm font-medium leading-6 text-slate-200">
        {value}
      </dd>
    </div>
  );
}
