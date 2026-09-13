interface PageFact {
  label: string;
  value: string;
}

interface PageSection {
  body: string;
  title: string;
}

interface PageFaq {
  answer: string;
  question: string;
}

interface ComparisonRow {
  competitor: string;
  compressByUrl: string;
  dimension: string;
}

interface ComparisonSource {
  label: string;
  url: string;
}

interface PageComparison {
  competitorName: string;
  intro: string;
  reviewedOn: string;
  rows: readonly ComparisonRow[];
  sources: readonly ComparisonSource[];
}

export interface SeoToolPageContent {
  comparison?: PageComparison;
  facts: readonly PageFact[];
  faq: readonly PageFaq[];
  guideIntro: string;
  guideTitle: string;
  howItWorks: readonly PageSection[];
  privacy: string;
  relatedHeading: string;
  useCases: readonly string[];
  why: readonly PageSection[];
}
