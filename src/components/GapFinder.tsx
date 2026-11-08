import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  ArrowRight,
  TrendingUp,
  FileText,
  FileDown,
  Layers,
} from 'lucide-react';
import { GapsResult, ResearchGap, TabType } from '../types';
import { findResearchGaps } from '../services/api';
import { downloadAsTextFile, formatGapsAsText } from '../utils/exportUtils';
import { LoadingState } from './LoadingState';
import { ErrorBanner } from './ErrorBanner';

interface GapFinderProps {
  initialTopic?: string;
  initialPaperText?: string;
  onSaveToNotebook: (type: 'gap', title: string, content: any) => void;
  onSelectGapForQuestions: (gapTitle: string) => void;
  setActiveTab: (tab: TabType) => void;
}

const SAMPLE_PAPER_FOR_GAPS = `Title: Digital Mental Health Interventions Among University Students: A Controlled Efficacy Trial

Abstract:
This study evaluated a 6-week smartphone-based Cognitive Behavioral Therapy (iCBT) application among 140 undergraduate students experiencing moderate test anxiety. Participants in the intervention arm showed a statistically significant 22% reduction in GAD-7 anxiety scores compared to waitlist controls (p = 0.012). However, participant adherence declined steeply, with a 41% attrition rate by Week 4. 

The sample was predominantly female (78%) and recruited exclusively from introductory psychology courses at a single private research university. Furthermore, the trial did not collect post-intervention follow-up data beyond 14 days, and participants with co-occurring depressive symptoms were excluded. We recommend further exploration of engagement strategies for digital therapeutics in higher education.`;

const SAMPLE_TOPIC_QUERY = {
  topic: 'Microplastics in freshwater ecosystems: trophic transfer and bioaccumulation',
  context:
    'Most existing studies focus on marine/oceanic microplastics and acute laboratory toxicity tests on single species (e.g., Daphnia magna). However, field data from urban river basins with fluctuating stormwater runoff is sparse, and multi-trophic bioaccumulation models spanning freshwater invertebrates to apex predators remain inconclusive.',
};

export const GapFinder: React.FC<GapFinderProps> = ({
  initialTopic = '',
  initialPaperText = '',
  onSaveToNotebook,
  onSelectGapForQuestions,
  setActiveTab,
}) => {
  const [mode, setMode] = useState<'paper' | 'topic'>(initialPaperText ? 'paper' : 'paper');
  const [paperText, setPaperText] = useState(initialPaperText || '');
  const [topic, setTopic] = useState(initialTopic);
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GapsResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [savedGaps, setSavedGaps] = useState<Record<number, boolean>>({});
  const [downloaded, setDownloaded] = useState(false);

  const handleFindGaps = async () => {
    if (mode === 'paper' && (!paperText.trim() || paperText.trim().length < 30)) {
      setError('Please paste or provide paper text, abstract, or summaries (at least 30 characters).');
      return;
    }
    if (mode === 'topic' && !topic.trim()) {
      setError('Please provide a research topic or domain.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await findResearchGaps({
        topic: mode === 'topic' ? topic.trim() : topic.trim() || 'Provided Paper Analysis',
        context: mode === 'topic' ? context : undefined,
        paperText: mode === 'paper' ? paperText.trim() : undefined,
      });
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to identify research gaps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    if (mode === 'paper') {
      setPaperText(SAMPLE_PAPER_FOR_GAPS);
    } else {
      setTopic(SAMPLE_TOPIC_QUERY.topic);
      setContext(SAMPLE_TOPIC_QUERY.context);
    }
    setError(null);
  };

  const handleCopyGap = (gap: ResearchGap, idx: number) => {
    const formatted = `[${gap.gapType}] ${gap.title}\n\nDESCRIPTION:\n${gap.description}\n\nPOTENTIAL CONTRIBUTION:\n${gap.potentialContribution}\n\nSUGGESTED METHODOLOGY:\n${gap.suggestedResearchApproach}\n\nFEASIBILITY: ${gap.feasibilityForStudents}`;
    navigator.clipboard.writeText(formatted);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSaveGap = (gap: ResearchGap, idx: number) => {
    onSaveToNotebook('gap', `[${gap.gapType}] ${gap.title}`, gap);
    setSavedGaps((prev) => ({ ...prev, [idx]: true }));
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const title = mode === 'paper' ? 'Provided_Paper_Gaps' : topic.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    const reportText = formatGapsAsText(result, title);
    downloadAsTextFile(`Research_Gaps_${title}.txt`, reportText);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleExploreQuestions = (gap: ResearchGap) => {
    const base = mode === 'paper' ? 'Addressing Study Gap' : topic;
    onSelectGapForQuestions(`${base}: ${gap.title}`);
    setActiveTab('questions');
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium backdrop-blur-xs mb-3">
            <Search className="w-3.5 h-3.5" />
            <span>Step 4: Finding Novelty</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Research Gap Finder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Uncover unexplored scholarly frontiers directly from provided research papers or topics. Identify methodological omissions, under-represented populations, conflicting findings, and future study opportunities.
          </p>
        </div>
      </div>

      {/* Input Box Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="space-y-4">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => { setMode('paper'); setError(null); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === 'paper'
                    ? 'bg-white text-blue-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>From Provided Papers (Direct Analysis)</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('topic'); setError(null); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === 'topic'
                    ? 'bg-white text-blue-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>From Research Topic / Domain</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {mode === 'paper' ? 'Load Sample Paper Text' : 'Load Sample Topic'}
            </button>
          </div>

          {/* Mode 1: From Provided Papers */}
          {mode === 'paper' ? (
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Paste Provided Research Paper Text, Abstract, or Paper Summary
              </label>
              <textarea
                rows={7}
                value={paperText}
                onChange={(e) => setPaperText(e.target.value)}
                placeholder="Paste the abstract, methodology, or results of one or more papers to detect unaddressed limitations, sample gaps, and future research directions..."
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Gemini will scrutinize the provided paper text to isolate what the authors left unanswered, study limitations, and generalizability barriers.
              </p>
            </div>
          ) : (
            /* Mode 2: From Topic */
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Research Topic or Domain
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Telehealth interventions for adolescent depression, Blockchain in supply chain transparency..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Known Literature or Current Knowledge State (Optional)
                </label>
                <textarea
                  rows={3}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Paste what existing papers have already covered, or any specific literature limits you've noticed..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-400">
              Categorizes 5 gaps: Methodological, Population, Contradictory, Theoretical & Practical
            </span>
            <button
              type="button"
              onClick={handleFindGaps}
              disabled={loading || (mode === 'paper' ? paperText.trim().length < 30 : !topic.trim())}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs hover:shadow transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Detecting Gaps...' : 'Identify Research Gaps'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      <ErrorBanner error={error} onRetry={handleFindGaps} onDismiss={() => setError(null)} />

      {/* Loading state */}
      {loading && (
        <LoadingState
          message="Scanning paper text and scholarly boundaries for unaddressed research gaps..."
          subMessage="Evaluating study limitations, sample demographics, untested variables, and future directions."
        />
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Summary Banner & Action Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1">
                  Literature Assessment & Gap Synthesis
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {result.gapSummary}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                title="Download gaps as .txt file"
              >
                {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileDown className="w-3.5 h-3.5 text-blue-600" />}
                <span>{downloaded ? 'Downloaded .txt' : 'Download Report (.txt)'}</span>
              </button>
            </div>
          </div>

          {/* 5 Gap Cards */}
          <div className="space-y-4">
            {result.gaps.map((gap, idx) => {
              const isSaved = savedGaps[idx];
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0">
                        0{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                        {gap.gapType}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">
                        Student Feasibility: <strong>{gap.feasibilityForStudents}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyGap(gap, idx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Copy gap summary"
                      >
                        {copiedIdx === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {copiedIdx === idx ? 'Copied' : 'Copy'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveGap(gap, idx)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors ${
                          isSaved
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Save to Notebook"
                      >
                        {isSaved ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {isSaved ? 'Saved' : 'Save'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mt-2">
                    {gap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {gap.description}
                  </p>

                  {/* Contribution & Suggested Study */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                    <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                      <span className="font-semibold text-emerald-950 block mb-1">
                        Academic Novelty & Contribution:
                      </span>
                      <span className="text-emerald-900 leading-relaxed">
                        {gap.potentialContribution}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                      <span className="font-semibold text-blue-950 block mb-1">
                        Recommended Research Study Design:
                      </span>
                      <span className="text-blue-900 leading-relaxed">
                        {gap.suggestedResearchApproach}
                      </span>
                    </div>
                  </div>

                  {/* Action Link to Questions */}
                  <div className="mt-4 pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleExploreQuestions(gap)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <span>Formulate Research Questions for this Gap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
