import type { AnalysisResult, PageType } from '@ai-web-scout/shared';

type ValueFormat = 'text' | 'score' | 'difficulty' | 'test-status';

type FieldPresentation = {
  key: string;
  label: string;
  format?: ValueFormat;
};

const FIELDS_BY_PAGE_TYPE: Record<PageType, readonly FieldPresentation[]> = {
  job: [
    { key: 'jobTitle', label: '案件タイトル' },
    { key: 'company', label: '企業・募集元' },
    { key: 'responsibilities', label: '業務内容' },
    { key: 'requiredSkills', label: '必須スキル' },
    { key: 'preferredSkills', label: '歓迎スキル' },
    { key: 'compensation', label: '単価・報酬' },
    { key: 'workingHours', label: '稼働時間' },
    { key: 'workStyle', label: '勤務形態' },
    { key: 'remotePolicy', label: 'リモート可否' },
    { key: 'meetingConditions', label: 'MTG条件' },
    { key: 'contractType', label: '契約形態' },
    { key: 'skillFitScore', label: 'スキル適合度', format: 'score' },
    { key: 'conditionFitScore', label: '条件適合度', format: 'score' },
    { key: 'careerValue', label: 'キャリア上の価値' },
    { key: 'concerns', label: '懸念点' },
    { key: 'applicationRecommendation', label: '応募推奨' },
    { key: 'appealPoints', label: 'アピールポイント' },
    { key: 'nextQuestions', label: '次に確認すべき事項' },
  ],
  article: [
    { key: 'topic', label: '記事テーマ' },
    { key: 'overview', label: '記事概要' },
    { key: 'technicalPoints', label: '重要な技術ポイント' },
    { key: 'prerequisites', label: '前提知識' },
    { key: 'difficulty', label: '難易度', format: 'difficulty' },
    { key: 'practicalApplications', label: '実務への応用' },
    { key: 'skillRelevance', label: 'スキルとの関連性' },
    { key: 'learningPriority', label: '学習優先度', format: 'score' },
    { key: 'nextLearningTopics', label: '次に学ぶ内容' },
    { key: 'saveRecommendation', label: '保存推奨' },
  ],
  github: [
    { key: 'overview', label: 'リポジトリ概要' },
    { key: 'techStack', label: '技術スタック' },
    { key: 'directoryStructure', label: 'ディレクトリ構成' },
    { key: 'architectureGuess', label: 'アーキテクチャの推測' },
    { key: 'mainFeatures', label: '主な機能' },
    { key: 'codeQualityNotes', label: 'コード品質の注目点' },
    { key: 'readmeQuality', label: 'READMEの充実度' },
    { key: 'hasTests', label: 'テストの有無', format: 'test-status' },
    { key: 'learningValue', label: '学習価値' },
    { key: 'improvementIdeas', label: '改善候補' },
    { key: 'skillRelevance', label: 'スキルとの関連性' },
  ],
  company: [
    { key: 'name', label: '企業・サービス名' },
    { key: 'valueProposition', label: '提供価値' },
    { key: 'mainFeatures', label: '主な機能' },
    { key: 'targetUsers', label: '想定ユーザー' },
    { key: 'businessModelGuess', label: 'ビジネスモデルの推測' },
    { key: 'technicalHighlights', label: '技術的な注目点' },
    { key: 'differentiators', label: '差別化要素' },
    { key: 'userRelevance', label: 'ユーザーとの関連性' },
    { key: 'reasonsToExplore', label: '興味を持つべき理由' },
    { key: 'researchNext', label: '追加調査すべき内容' },
  ],
  general: [
    { key: 'purpose', label: 'ページの目的' },
    { key: 'usefulness', label: 'ユーザーにとっての有用性' },
    { key: 'reliabilityNotes', label: '信頼性に関する注意点' },
  ],
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
};

function formatValue(value: unknown, format: ValueFormat): string {
  if (format === 'test-status') {
    if (value === true) return 'あり';
    if (value === false) return 'なし';
    return '不明';
  }

  if (value === null || value === undefined || value === '') return '—';

  if (format === 'score' && typeof value === 'number') {
    return `${value} / 100`;
  }

  if (format === 'difficulty' && typeof value === 'string') {
    return DIFFICULTY_LABELS[value] ?? value;
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(' / ') : '—';
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  return '—';
}

export function toTypeSpecificEntries(
  result: AnalysisResult['typeSpecificResult'],
): Array<{ label: string; value: string }> {
  const data = result.data as Record<string, unknown>;
  return FIELDS_BY_PAGE_TYPE[result.pageType].map((field) => ({
    label: field.label,
    value: formatValue(data[field.key], field.format ?? 'text'),
  }));
}
