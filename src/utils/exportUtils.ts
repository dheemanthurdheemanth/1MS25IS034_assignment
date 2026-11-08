import {
  PaperSummary,
  QuestionsResult,
  GapsResult,
  LiteratureReviewResult,
  CitationResult,
  SavedItem,
} from '../types';

export function downloadAsTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatSummaryAsText(summary: PaperSummary, title?: string): string {
  const banner = '='.repeat(70);
  const subBanner = '-'.repeat(70);

  return `${banner}
RESEARCHMATE — RESEARCH PAPER SUMMARY REPORT
${banner}
Date Generated: ${new Date().toLocaleString()}
${title ? `Source Title:   ${title}` : ''}
Significance:   ${summary.significanceRating || 'Peer-Reviewed Analysis'}
Keywords:       ${(summary.keyTerms || []).join(', ')}

${subBanner}
1. EXECUTIVE TL;DR
${subBanner}
${summary.tldr}

${subBanner}
2. RESEARCH OBJECTIVE & CORE PROBLEM
${subBanner}
${summary.researchObjective}

${subBanner}
3. STUDY METHODOLOGY & DATASET PARAMETERS
${subBanner}
${summary.methodology}

${subBanner}
4. KEY EMPIRICAL FINDINGS
${subBanner}
${summary.keyFindings.map((f, i) => `[${i + 1}] ${f}`).join('\n\n')}

${subBanner}
5. ACKNOWLEDGED LIMITATIONS & THREATS TO VALIDITY
${subBanner}
${summary.limitations.map((l) => `* ${l}`).join('\n')}

${subBanner}
6. PRACTICAL & FUTURE IMPLICATIONS
${subBanner}
${summary.implications}

${banner}
Generated with ResearchMate AI Assistant (Powered by Gemini AI)
${banner}
`;
}

export function formatQuestionsAsText(result: QuestionsResult, topic: string): string {
  const banner = '='.repeat(70);
  const subBanner = '-'.repeat(70);

  let out = `${banner}
RESEARCHMATE — 5 FORMULATED ACADEMIC RESEARCH QUESTIONS
${banner}
Date Generated: ${new Date().toLocaleString()}
Target Topic:   ${topic}

Overview:
${result.overview}

${subBanner}
FORMULATED QUESTIONS:
${subBanner}
`;

  result.questions.forEach((q, idx) => {
    out += `
QUESTION ${idx + 1} [${q.type.toUpperCase()}]
----------------------------------------------------------------------
Research Question:
  "${q.question}"

Academic Rationale:
  ${q.rationale}

Variables:
  Independent Variable: ${q.independentVariable || 'N/A'}
  Dependent Variable:   ${q.dependentVariable || 'N/A'}

Suggested Methodology:
  ${q.suggestedMethodology}

Working Hypothesis:
  ${q.draftHypothesis}
`;
  });

  out += `\n${banner}\nGenerated with ResearchMate AI Assistant\n${banner}\n`;
  return out;
}

export function formatGapsAsText(result: GapsResult, sourceOrTopic: string): string {
  const banner = '='.repeat(70);
  const subBanner = '-'.repeat(70);

  let out = `${banner}
RESEARCHMATE — ACADEMIC RESEARCH GAPS IDENTIFICATION REPORT
${banner}
Date Generated:   ${new Date().toLocaleString()}
Analyzed Subject: ${result.analyzedSourceTitle || sourceOrTopic}

Literature Plateau & Opportunity Summary:
${result.gapSummary}

${subBanner}
IDENTIFIED RESEARCH GAPS (5 TAXONOMIES):
${subBanner}
`;

  result.gaps.forEach((gap, idx) => {
    out += `
GAP ${idx + 1}: ${gap.title.toUpperCase()}
Type:        ${gap.gapType}
Feasibility: ${gap.feasibilityForStudents}

Description & Unexamined Frontier:
  ${gap.description}

Academic Contribution & Novelty:
  ${gap.potentialContribution}

Suggested Research Approach / Study Design:
  ${gap.suggestedResearchApproach}
----------------------------------------------------------------------`;
  });

  out += `\n\n${banner}\nGenerated with ResearchMate AI Assistant\n${banner}\n`;
  return out;
}

export function formatLiteratureReviewAsText(result: LiteratureReviewResult, papersCount: number): string {
  const banner = '='.repeat(70);
  const subBanner = '-'.repeat(70);

  let out = `${banner}
RESEARCHMATE — LITERATURE REVIEW SYNTHESIS REPORT
${banner}
Date Generated:    ${new Date().toLocaleString()}
Theme:             ${result.themeTitle}
Synthesized Papers: ${papersCount} Studies

${subBanner}
1. THEMATIC COMPARATIVE MATRIX
${subBanner}
`;

  result.thematicMatrix.forEach((m, idx) => {
    out += `Theme ${idx + 1}: ${m.theme}
Supporting Studies: ${(m.papersInAgreement || []).join(', ')}
Core Synthesis Argument:
  ${m.coreArgument}\n\n`;
  });

  out += `${subBanner}
2. POINTS OF ACADEMIC CONSENSUS
${subBanner}
${result.pointsOfConsensus.map((pt) => `* ${pt}`).join('\n')}

${subBanner}
3. POINTS OF DIVERGENCE & SCHOLARLY DEBATE
${subBanner}
${result.pointsOfDivergence.map((pt) => `* ${pt}`).join('\n')}

${subBanner}
4. INTEGRATED LITERATURE REVIEW SYNTHESIS DRAFT
${subBanner}
${result.synthesisNarrative}

${subBanner}
5. RECOMMENDED FUTURE RESEARCH TRAJECTORIES
${subBanner}
${result.recommendedFutureDirections.map((dir) => `* ${dir}`).join('\n')}

${banner}
Generated with ResearchMate AI Assistant
${banner}
`;
  return out;
}

export function formatCitationAsText(citation: CitationResult, title?: string): string {
  const banner = '='.repeat(70);
  const subBanner = '-'.repeat(70);

  return `${banner}
RESEARCHMATE — ACADEMIC CITATION DOSSIER
${banner}
Date Generated: ${new Date().toLocaleString()}
Work Title:     ${title || 'Academic Source'}

${subBanner}
1. APA 7TH EDITION (OFFICIAL REFERENCE LIST FORMAT)
${subBanner}
${citation.apa}

In-Text Parenthetical:
${citation.inTextParenthetical}

In-Text Narrative:
${citation.inTextNarrative}

${subBanner}
2. MLA 9TH EDITION
${subBanner}
${citation.mla}

${subBanner}
3. CHICAGO 17TH (NOTES & BIBLIOGRAPHY)
${subBanner}
${citation.chicago}

${subBanner}
4. IEEE FORMAT
${subBanner}
${citation.ieee}

${subBanner}
5. BIBTEX ENTRY
${subBanner}
${citation.bibtex}

${banner}
Provenance: Strict Deterministic Formatting (Zero Hallucinated Citations)
${banner}
`;
}

export interface MasterReportData {
  topic?: string;
  topicData?: any;
  questions?: QuestionsResult | null;
  summary?: PaperSummary | null;
  summaryTitle?: string;
  gaps?: GapsResult | null;
  gapsSource?: string;
  literature?: LiteratureReviewResult | null;
  literaturePapersCount?: number;
  citation?: CitationResult | null;
  citationTitle?: string;
  savedItems?: SavedItem[];
}

export function generateMasterAcademicReport(data: MasterReportData): string {
  const banner = '='.repeat(76);
  const subBanner = '-'.repeat(76);

  let report = `${banner}
                     RESEARCHMATE ACADEMIC RESEARCH DOSSIER
${banner}
Compiled On:      ${new Date().toLocaleString()}
Research Domain:  ${data.topic || 'Academic Research Exploration'}
Assistant Engine: Gemini AI Research Intelligence
Target Format:    Standard Academic Dossier Report (.txt)
${banner}

`;

  // 1. Topic & Scope
  if (data.topicData) {
    report += `
============================================================================
SECTION 1: RESEARCH TOPIC, REFINED TITLE & SCOPE ANALYSIS
============================================================================
Refined Academic Title:
  "${data.topicData.refinedTitle || data.topic}"

Scope Evaluation:
  ${data.topicData.scopeAnalysis || 'Adequate academic scope.'}

Theoretical / Conceptual Lenses:
  ${data.topicData.conceptualFramework || 'N/A'}

Boolean Literature Search Keywords:
  ${(data.topicData.keyKeywords || []).join(' | ')}

Recommended Scholarly Databases:
  ${(data.topicData.academicDatabases || []).join(', ')}

`;
  }

  // 2. Questions
  if (data.questions && data.questions.questions?.length > 0) {
    report += `
============================================================================
SECTION 2: FORMULATED ACADEMIC RESEARCH QUESTIONS (5 INQUIRY MODES)
============================================================================
Overview:
${data.questions.overview}

`;
    data.questions.questions.forEach((q, idx) => {
      report += `[Q${idx + 1}] Type: ${q.type}
Question:
  "${q.question}"
Rationale:
  ${q.rationale}
Methodology:
  ${q.suggestedMethodology}
Hypothesis:
  ${q.draftHypothesis}
Independent Variable: ${q.independentVariable || 'N/A'}
Dependent Variable:   ${q.dependentVariable || 'N/A'}

`;
    });
  }

  // 3. Summaries
  if (data.summary) {
    report += `
============================================================================
SECTION 3: RESEARCH PAPER SUMMARY ANALYSIS
============================================================================
Target Source: ${data.summaryTitle || 'Analyzed Study'}
Significance:  ${data.summary.significanceRating || 'High Academic Value'}

Executive TL;DR:
  ${data.summary.tldr}

Core Research Objective:
  ${data.summary.researchObjective}

Methodology & Dataset:
  ${data.summary.methodology}

Key Empirical Findings:
${data.summary.keyFindings?.map((f, i) => `  (${i + 1}) ${f}`).join('\n')}

Acknowledged Study Limitations:
${data.summary.limitations?.map((l) => `  * ${l}`).join('\n')}

Practical & Future Research Implications:
  ${data.summary.implications}

`;
  }

  // 4. Gaps
  if (data.gaps && data.gaps.gaps?.length > 0) {
    report += `
============================================================================
SECTION 4: IDENTIFIED RESEARCH GAPS FROM PROVIDED PAPERS / TOPIC
============================================================================
Assessment of Current Literature Plateau:
${data.gaps.gapSummary}

`;
    data.gaps.gaps.forEach((g, idx) => {
      report += `[Gap ${idx + 1}] ${g.title} (${g.gapType})
Student Feasibility: ${g.feasibilityForStudents}
Description:
  ${g.description}
Academic Novelty & Contribution:
  ${g.potentialContribution}
Recommended Research Study Design:
  ${g.suggestedResearchApproach}

`;
    });
  }

  // 5. Literature Review
  if (data.literature) {
    report += `
============================================================================
SECTION 5: LITERATURE REVIEW SYNTHESIS & THEMATIC MATRIX
============================================================================
Overarching Synthesis Theme:
${data.literature.themeTitle}

Thematic Matrix:
`;
    data.literature.thematicMatrix?.forEach((m, idx) => {
      report += `  Theme ${idx + 1}: ${m.theme}
  Papers in Agreement: ${(m.papersInAgreement || []).join(', ')}
  Synthesis Argument: ${m.coreArgument}\n\n`;
    });

    report += `Points of Academic Consensus:
${data.literature.pointsOfConsensus?.map((p) => `  * ${p}`).join('\n')}

Points of Divergence / Academic Debates:
${data.literature.pointsOfDivergence?.map((p) => `  * ${p}`).join('\n')}

Integrated Literature Review Narrative Draft:
${data.literature.synthesisNarrative}

`;
  }

  // 6. Citation
  if (data.citation) {
    report += `
============================================================================
SECTION 6: VERIFIED CITATION & BIBLIOGRAPHIC DATA
============================================================================
APA 7th Edition Reference:
  ${data.citation.apa}

In-Text Parenthetical:
  ${data.citation.inTextParenthetical}

In-Text Narrative:
  ${data.citation.inTextNarrative}

BibTeX Record:
${data.citation.bibtex}

`;
  }

  report += `
${banner}
END OF RESEARCHMATE ACADEMIC DOSSIER REPORT
Generated with ResearchMate AI Assistant for Academic Research
${banner}
`;

  return report;
}
