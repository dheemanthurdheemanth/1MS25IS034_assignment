export type TabType = 'topic' | 'questions' | 'summarizer' | 'gaps' | 'literature' | 'citations' | 'report' | 'notebook';

export interface TopicResult {
  refinedTitle: string;
  scopeAnalysis: string;
  subTopics: Array<{
    title: string;
    description: string;
  }>;
  keyKeywords: string[];
  academicDatabases: string[];
  conceptualFramework: string;
}

export interface ResearchQuestion {
  id: number;
  type: string;
  question: string;
  rationale: string;
  independentVariable?: string;
  dependentVariable?: string;
  suggestedMethodology: string;
  draftHypothesis: string;
}

export interface QuestionsResult {
  overview: string;
  questions: ResearchQuestion[];
}

export interface PaperSummary {
  tldr: string;
  researchObjective: string;
  methodology: string;
  keyFindings: string[];
  limitations: string[];
  implications: string;
  significanceRating: string;
  keyTerms: string[];
}

export interface ResearchGap {
  gapType: string;
  title: string;
  description: string;
  potentialContribution: string;
  suggestedResearchApproach: string;
  feasibilityForStudents: string;
}

export interface GapsResult {
  gapSummary: string;
  analyzedSourceTitle?: string;
  gaps: ResearchGap[];
}

export interface PaperEntry {
  id: string;
  title: string;
  authors: string;
  year: string;
  findings: string;
  methodology?: string;
}

export interface ThematicPoint {
  theme: string;
  papersInAgreement: string[];
  coreArgument: string;
}

export interface LiteratureReviewResult {
  themeTitle: string;
  thematicMatrix: ThematicPoint[];
  pointsOfConsensus: string[];
  pointsOfDivergence: string[];
  synthesisNarrative: string;
  recommendedFutureDirections: string[];
}

export interface CitationResult {
  apa: string;
  inTextParenthetical: string;
  inTextNarrative: string;
  mla: string;
  chicago: string;
  ieee: string;
  bibtex: string;
  sourceAudit: {
    providedFields: string[];
    strictFidelityConfirmed: boolean;
    disclaimer: string;
  };
}

export interface SavedItem {
  id: string;
  type: 'topic' | 'question' | 'summary' | 'gap' | 'literature' | 'citation';
  title: string;
  content: any;
  date: string;
}
