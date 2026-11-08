import React, { useState } from 'react';
import {
  FileDown,
  Sparkles,
  Copy,
  Check,
  FileText,
  Compass,
  HelpCircle,
  Search,
  Library,
  Quote,
  CheckSquare,
  Square,
  BookOpen,
} from 'lucide-react';
import { SavedItem } from '../types';
import {
  downloadAsTextFile,
  generateMasterAcademicReport,
  MasterReportData,
} from '../utils/exportUtils';

interface ReportExporterProps {
  savedItems: SavedItem[];
  currentTopic?: string;
}

export const ReportExporter: React.FC<ReportExporterProps> = ({
  savedItems,
  currentTopic,
}) => {
  const [includeTopic, setIncludeTopic] = useState(true);
  const [includeQuestions, setIncludeQuestions] = useState(true);
  const [includeSummaries, setIncludeSummaries] = useState(true);
  const [includeGaps, setIncludeGaps] = useState(true);
  const [includeLiterature, setIncludeLiterature] = useState(true);
  const [includeCitations, setIncludeCitations] = useState(true);

  const [copied, setCopied] = useState(false);
  const [downloadedTxt, setDownloadedTxt] = useState(false);
  const [downloadedMd, setDownloadedMd] = useState(false);

  // Extract latest items from savedItems or defaults
  const latestTopicItem = savedItems.find((i) => i.type === 'topic');
  const latestQuestionsItem = savedItems.find((i) => i.type === 'question');
  const allQuestionItems = savedItems.filter((i) => i.type === 'question');
  const latestSummaryItem = savedItems.find((i) => i.type === 'summary');
  const latestGapItem = savedItems.find((i) => i.type === 'gap');
  const allGapItems = savedItems.filter((i) => i.type === 'gap');
  const latestLitItem = savedItems.find((i) => i.type === 'literature');
  const latestCitationItem = savedItems.find((i) => i.type === 'citation');

  // Build report data object
  const reportData: MasterReportData = {
    topic: currentTopic || latestTopicItem?.title || 'Academic Inquiry Project',
    topicData: includeTopic ? latestTopicItem?.content : undefined,
    questions: includeQuestions
      ? latestQuestionsItem?.content?.questions
        ? latestQuestionsItem.content
        : allQuestionItems.length > 0
        ? {
            overview: 'Formulated academic questions saved in ResearchMate.',
            questions: allQuestionItems.map((q, idx) => ({
              id: idx + 1,
              type: q.content.type || 'Inquiry',
              question: q.title,
              rationale: q.content.rationale || '',
              suggestedMethodology: q.content.suggestedMethodology || '',
              draftHypothesis: q.content.draftHypothesis || '',
              independentVariable: q.content.independentVariable,
              dependentVariable: q.content.dependentVariable,
            })),
          }
        : undefined
      : undefined,
    summary: includeSummaries ? latestSummaryItem?.content : undefined,
    summaryTitle: latestSummaryItem?.title,
    gaps: includeGaps
      ? latestGapItem?.content?.gaps
        ? latestGapItem.content
        : allGapItems.length > 0
        ? {
            gapSummary: 'Collection of identified research gaps from provided literature.',
            gaps: allGapItems.map((g) => g.content),
          }
        : undefined
      : undefined,
    gapsSource: latestGapItem?.title,
    literature: includeLiterature ? latestLitItem?.content : undefined,
    literaturePapersCount: latestLitItem ? 3 : 0,
    citation: includeCitations ? latestCitationItem?.content : undefined,
    citationTitle: latestCitationItem?.title,
    savedItems,
  };

  const compiledText = generateMasterAcademicReport(reportData);

  const handleDownloadText = () => {
    const filename = `ResearchMate_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    downloadAsTextFile(filename, compiledText);
    setDownloadedTxt(true);
    setTimeout(() => setDownloadedTxt(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([compiledText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ResearchMate_Report_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadedMd(true);
    setTimeout(() => setDownloadedMd(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium backdrop-blur-xs mb-3">
            <FileDown className="w-3.5 h-3.5" />
            <span>Step 7: Research Export</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Export Academic Research Report (.txt)
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Download your consolidated academic research report as a clean, standardized text file. Compile topic analysis, formulated research questions, paper summaries, literature gaps, and APA citations into a single document.
          </p>
        </div>
      </div>

      {/* Configuration & Action Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Select Sections to Include in Text Report</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize which research modules are compiled into your final downloadable text report
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              {downloadedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileDown className="w-3.5 h-3.5 text-blue-600" />}
              <span>{downloadedMd ? 'Saved .md' : 'Export .md'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadText}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              {downloadedTxt ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <FileDown className="w-3.5 h-3.5" />}
              <span>{downloadedTxt ? 'Downloaded Report!' : 'Download Report (.txt)'}</span>
            </button>
          </div>
        </div>

        {/* Section Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'topic',
              label: 'Research Topic & Scope',
              icon: Compass,
              checked: includeTopic,
              toggle: () => setIncludeTopic(!includeTopic),
              available: Boolean(latestTopicItem),
            },
            {
              id: 'questions',
              label: '5 Research Questions',
              icon: HelpCircle,
              checked: includeQuestions,
              toggle: () => setIncludeQuestions(!includeQuestions),
              available: Boolean(latestQuestionsItem || allQuestionItems.length > 0),
            },
            {
              id: 'summary',
              label: 'Paper Summary',
              icon: FileText,
              checked: includeSummaries,
              toggle: () => setIncludeSummaries(!includeSummaries),
              available: Boolean(latestSummaryItem),
            },
            {
              id: 'gaps',
              label: 'Literature Research Gaps',
              icon: Search,
              checked: includeGaps,
              toggle: () => setIncludeGaps(!includeGaps),
              available: Boolean(latestGapItem || allGapItems.length > 0),
            },
            {
              id: 'literature',
              label: 'Literature Review Synthesis',
              icon: Library,
              checked: includeLiterature,
              toggle: () => setIncludeLiterature(!includeLiterature),
              available: Boolean(latestLitItem),
            },
            {
              id: 'citations',
              label: 'APA Citations & Bibliographies',
              icon: Quote,
              checked: includeCitations,
              toggle: () => setIncludeCitations(!includeCitations),
              available: Boolean(latestCitationItem),
            },
          ].map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={sec.toggle}
                className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                  sec.checked
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-2xs'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {sec.checked ? (
                  <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="text-xs font-semibold block truncate">{sec.label}</span>
                  <span className="text-[10px] text-slate-400">
                    {sec.available ? 'Saved data included' : 'Template structure'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Text Report Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            Plain Text Report Preview (.txt file contents)
          </span>
          <span className="text-xs text-slate-400">
            {compiledText.split('\n').length} lines · {compiledText.length} characters
          </span>
        </div>

        <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed select-all">
          {compiledText}
        </pre>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleDownloadText}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Research Report (.txt)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
