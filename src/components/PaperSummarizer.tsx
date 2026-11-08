import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Target,
  FlaskConical,
  ListChecks,
  AlertTriangle,
  Lightbulb,
  Tag,
  Trash2,
} from 'lucide-react';
import { PaperSummary } from '../types';
import { summarizePaper } from '../services/api';
import { LoadingState } from './LoadingState';
import { ErrorBanner } from './ErrorBanner';

import { FileDown, ArrowRight, Library, Search } from 'lucide-react';
import { downloadAsTextFile, formatSummaryAsText } from '../utils/exportUtils';
import { TabType } from '../types';

interface PaperSummarizerProps {
  onSaveToNotebook: (type: 'summary', title: string, content: any) => void;
  onSendToLiteratureReview?: (paper: { title: string; findings: string; methodology?: string; authors?: string; year?: string }) => void;
  onSendToGapFinder?: (paperText: string) => void;
  setActiveTab?: (tab: TabType) => void;
}

const SAMPLE_PAPER_TEXT = `Title: Generative AI in Undergraduate Computer Science: Assessing Impact on Problem-Solving Velocity and Conceptual Grasp

Abstract:
The rapid proliferation of Large Language Model (LLM) programming assistants has sparked vigorous debate regarding undergraduate pedagogy. This randomized controlled study evaluates the effects of AI code generation tools on 240 undergraduate computer science students across an 8-week data structures and algorithms laboratory. Participants were stratified and assigned either to an AI-assisted group (utilizing guided code generation) or a traditional environment (standard IDE and documentation). 

Primary outcome metrics included timed problem-solving velocity, novel algorithmic comprehension on closed-book proctored exams, and debugging self-efficacy. Results demonstrated that the AI-assisted cohort achieved a 38.4% reduction in completion time for routine syntactic tasks (p < 0.001, d = 0.82). However, on unassisted conceptual synthesis examinations, the AI-assisted group scored significantly lower on algorithmic edge-case identification (-14.2%, p = 0.004) and exhibited higher cognitive passivity during code reviews. 

Furthermore, semi-structured interviews indicated a 62% reporting rate of 'syntax complacency.' We conclude that while generative AI significantly accelerates boilerplate implementation and lowers early frustration barriers, uncalibrated reliance induces conceptual fragility in algorithmic troubleshooting. We propose a hybrid pedagogical framework incorporating intentional manual debugging checkpoints to safeguard deep conceptual retention.`;

export const PaperSummarizer: React.FC<PaperSummarizerProps> = ({
  onSaveToNotebook,
  onSendToLiteratureReview,
  onSendToGapFinder,
  setActiveTab,
}) => {
  const [text, setText] = useState('');
  const [focus, setFocus] = useState('Comprehensive Academic Summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaperSummary | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSummarize = async () => {
    if (!text.trim() || text.trim().length < 40) {
      setError('Please enter or paste at least 40 characters of paper text.');
      return;
    }
    setError(null);
    setLoading(true);
    setSaved(false);

    try {
      const data = await summarizePaper(text.trim(), focus);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to summarize paper. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setText(SAMPLE_PAPER_TEXT);
    setError(null);
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  const getCleanTitle = () => {
    const firstLine = text.trim().split('\n')[0] || 'Research Paper';
    return firstLine.replace(/^Title:\s*/i, '').slice(0, 90);
  };

  const handleCopySummary = () => {
    if (!result) return;
    const formatted = `=== PAPER SUMMARY ===\nTL;DR: ${result.tldr}\n\nRESEARCH OBJECTIVE:\n${result.researchObjective}\n\nMETHODOLOGY:\n${result.methodology}\n\nKEY FINDINGS:\n${result.keyFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nLIMITATIONS:\n${result.limitations.map((l) => `- ${l}`).join('\n')}\n\nIMPLICATIONS:\n${result.implications}\n\nKEYWORDS: ${result.keyTerms.join(', ')}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const title = getCleanTitle();
    const textReport = formatSummaryAsText(result, title);
    const filename = `Summary_${title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 35)}.txt`;
    downloadAsTextFile(filename, textReport);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    const cleanTitle = getCleanTitle();
    onSaveToNotebook('summary', cleanTitle, result);
    setSaved(true);
  };

  const handleSendToLit = () => {
    if (!result) return;
    const title = getCleanTitle();
    const findingsSummary = `${result.tldr}\nKey Findings: ${result.keyFindings.slice(0, 2).join('; ')}\nLimitations: ${result.limitations.join('; ')}`;
    if (onSendToLiteratureReview) {
      onSendToLiteratureReview({
        title,
        findings: findingsSummary,
        methodology: result.methodology,
        authors: 'Analyzed Author(s)',
        year: String(new Date().getFullYear()),
      });
    }
    if (setActiveTab) {
      setActiveTab('literature');
    }
  };

  const handleSendToGaps = () => {
    if (!text.trim()) return;
    if (onSendToGapFinder) {
      onSendToGapFinder(text.trim());
    }
    if (setActiveTab) {
      setActiveTab('gaps');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium backdrop-blur-xs mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Step 3: Paper Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Academic Paper Summarizer
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Extract clear research objectives, experimental methodologies, empirical key findings, and critical study limitations from abstracts or full research paper excerpts.
          </p>
        </div>
      </div>

      {/* Input Box Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Paste Research Paper Text, Abstract, or Excerpt
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Load Sample Paper Abstract
                </button>
                {text && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs text-slate-400 hover:text-red-600 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the title, abstract, methodology, or results of a published paper here..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-xs leading-relaxed"
            />

            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>{wordCount} words · {text.length} characters</span>
              <span>Accepts up to ~25,000 characters</span>
            </div>
          </div>

          {/* Perspective Selector */}
          <div className="pt-1">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Summary Focus Lens
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                'Comprehensive Academic Summary',
                'Methodology & Sample Focus',
                'Key Findings & Metrics',
                'Critical Limitations & Gaps',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFocus(opt)}
                  className={`px-3 py-2 text-xs rounded-lg border text-left transition-all ${
                    focus === opt
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-400">
              Summarizes objectives, methods, quantitative findings, and limitations
            </span>
            <button
              type="button"
              onClick={handleSummarize}
              disabled={loading || text.trim().length < 40}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs hover:shadow transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Synthesizing Summary...' : 'Generate Academic Summary'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      <ErrorBanner error={error} onRetry={handleSummarize} onDismiss={() => setError(null)} />

      {/* Loading state */}
      {loading && (
        <LoadingState
          message="Analyzing paper text and isolating empirical claims..."
          subMessage="Extracting research objective, dataset parameters, effect sizes, and acknowledged limitations."
        />
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Summary Generated</span>
              <span>·</span>
              <span>Significance: <strong>{result.significanceRating}</strong></span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                title="Download report as .txt file"
              >
                {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileDown className="w-3.5 h-3.5 text-blue-600" />}
                <span>{downloaded ? 'Downloaded .txt' : 'Download Report (.txt)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{saved ? 'Saved in Notebook' : 'Save to Notebook'}</span>
              </button>
            </div>
          </div>

          {/* Workflow Quick Links */}
          <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
            <span className="font-semibold text-blue-900">Next Research Actions:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSendToLit}
                className="inline-flex items-center gap-1 font-medium text-blue-700 hover:text-blue-900"
              >
                <Library className="w-3.5 h-3.5 text-blue-600" />
                <span>Send to Literature Review</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleSendToGaps}
                className="inline-flex items-center gap-1 font-medium text-indigo-700 hover:text-indigo-900"
              >
                <Search className="w-3.5 h-3.5 text-indigo-600" />
                <span>Find Gaps in this Paper</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Executive TL;DR */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">
                  Executive TL;DR
                </span>
                <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
                  {result.tldr}
                </p>
              </div>
            </div>
          </div>

          {/* Objective & Methodology Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Research Objective & Core Question</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                {result.researchObjective}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                <FlaskConical className="w-4 h-4 text-indigo-600" />
                <span>Methodology, Dataset & Sample</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                {result.methodology}
              </p>
            </div>
          </div>

          {/* Key Findings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
              <ListChecks className="w-4 h-4 text-emerald-600" />
              <span>Key Empirical Findings & Takeaways</span>
            </div>
            <ul className="space-y-2.5">
              {result.keyFindings?.map((finding, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 text-xs sm:text-sm text-slate-800 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Limitations & Practical Implications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Acknowledged Limitations & Threats to Validity</span>
              </div>
              <ul className="space-y-2">
                {result.limitations?.map((lim, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-700 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/50 border border-amber-100"
                  >
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span>Practical & Future Academic Implications</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-blue-50/40 p-3.5 rounded-lg border border-blue-100">
                {result.implications}
              </p>

              {/* Key terms */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Key Scholarly Terms:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.keyTerms?.map((term, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded border border-slate-200"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
