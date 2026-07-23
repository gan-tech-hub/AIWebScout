import type { PageType } from '@ai-web-scout/shared';
import type { AnalysisStrategy } from './types';

export const analysisStrategies: Record<PageType, AnalysisStrategy> = {
  job: {
    pageType: 'job',
    name: 'Opportunity Fit',
    purpose: '案件条件とユーザープロフィールを比較し、応募判断を支援する。',
    requiresProfile: true,
    focus: [
      '業務・必須スキル・条件を抽出する',
      'スキル適合度と条件適合度を分けて評価する',
      '不足情報と次に確認すべき事項を明示する',
    ],
  },
  article: {
    pageType: 'article',
    name: 'Knowledge Distillation',
    purpose: '技術記事を実務と学習計画へ接続する。',
    requiresProfile: false,
    focus: [
      '前提知識と難易度を評価する',
      '重要な技術ポイントを抽出する',
      '実務への応用と次の学習項目を提案する',
    ],
  },
  github: {
    pageType: 'github',
    name: 'Repository Intelligence',
    purpose: '取得済みページ情報だけからリポジトリの学習価値を評価する。',
    requiresProfile: false,
    focus: [
      '技術スタックと主な機能を抽出する',
      '根拠のないコード品質断定を避ける',
      'GitHub API未使用による不足情報を明示する',
    ],
  },
  company: {
    pageType: 'company',
    name: 'Company Signal',
    purpose: '企業・サービスの提供価値と追加調査事項を整理する。',
    requiresProfile: false,
    focus: [
      '提供価値・想定ユーザー・主要機能を抽出する',
      '推測とページ上の事実を区別する',
      '差別化要素と追加調査事項を示す',
    ],
  },
  general: {
    pageType: 'general',
    name: 'General Insight',
    purpose: '一般ページの目的・有用性・注意点を簡潔に整理する。',
    requiresProfile: false,
    focus: [
      'ページの目的と重要点を要約する',
      '信頼性に関する注意点を示す',
      '実行可能な次のアクションを提案する',
    ],
  },
};

export function selectAnalysisStrategy(pageType: PageType): AnalysisStrategy {
  return analysisStrategies[pageType];
}
