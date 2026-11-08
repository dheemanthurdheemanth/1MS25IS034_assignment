import React, { useState } from 'react';
import {
  Library,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  Bookmark,
  FileCheck2,
  Users,
  Calendar,
  Layers,
  HelpCircle,
  GitCommit,
  BookOpen,
  FileDown,
  FileText,
} from 'lucide-react';
import { PaperEntry, LiteratureReviewResult } from '../types';
import { synthesizeLiterature } from '../services/api';
import { downloadAsTextFile, formatLiteratureReviewAsText } from '../utils/exportUtils';
import { LoadingState } from './LoadingState';
import { ErrorBanner } from './ErrorBanner';

interface LiteratureReviewProps {
  onSaveToNotebook: (type: 'literature', title: string, content: any) => void;
  importedPaper?: PaperEntry | null;
}

const SAMPLE_PAPERS: PaperEntry[] = [
  {
    id: 'paper-1',
    title: 'Cognitive Offloading in LLM-Assisted Programming: An Empirical Analysis',
    authors: 'Miller, K. & Zhao, T.',
    year: '2024',
    methodology: 'Experimental between-subjects trial (N=160 computer science undergraduates)',
    findings:
      'Students utilizing AI copilots completed programming tasks 34% faster but performed significantly worse on unassisted conceptual debugging assessments, indicating cognitive offloading.',
  },
  {
    id: 'paper-2',
    title: 'Scaffolded Prompt Engineering as Metacognitive Training for Novice Coders',
    authors: 'Santos, L., Dubois, M., & Weber, H.',
    year: '2025',
    methodology: 'Mixed-methods longitudinal classroom intervention (N=210)',
    findings:
      'When students were explicitly trained to decompose algorithms before prompting AI models, their conceptual understanding matched or exceeded control groups, showing that structured scaffolding mitigates cognitive offloading.',
  },
  {
    id: 'paper-3',
    title: 'The Illusion of Competence in AI-Mediated STEM Education',
    authors: 'Alvarez, R. & Tanaka, Y.',
    year: '2023',
    methodology: 'Qualitative thematic analysis & self-efficacy surveys (N=95)',
    findings:
      'Students consistently overestimated their mastery of core algorithmic patterns when using automated AI generation, confusing prompt fluency with deep foundational domain comprehension.',
  },
];

export const LiteratureReview: React.FC<LiteratureReviewProps> = ({
  onSaveToNotebook,
  importedPaper,
}) => {
  const [papers, setPapers] = useState<PaperEntry[]>(SAMPLE_PAPERS);
  const [synthesisGoal, setSynthesisGoal] = useState('Undergraduate Thesis Literature Review Chapter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LiteratureReviewResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Form state for adding a new paper
  const [newTitle, setNewTitle] = useState('');
  const [newAuthors, setNewAuthors] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newMethodology, setNewMethodology] = useState('');
  const [newFindings, setNewFindings] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Batch paste state
  const [showBatchPaste, setShowBatchPaste] = useState(false);
  const [batchRawSummaries, setBatchRawSummaries] = useState('');

  // Handle incoming paper imported from Paper Summarizer
  React.useEffect(() => {
    if (importedPaper && !papers.some((p) => p.id === importedPaper.id)) {
      setPapers((prev) => [importedPaper, ...prev]);
    }
  }, [importedPaper]);

  const handleAddPaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFindings.trim()) {
      setError('Paper title and key findings are required.');
      return;
    }

    const newPaper: PaperEntry = {
      id: `paper-${Date.now()}`,
      title: newTitle.trim(),
      authors: newAuthors.trim() || 'Author Unknown',
      year: newYear.trim() || String(new Date().getFullYear()),
      methodology: newMethodology.trim() || 'Empirical Study',
      findings: newFindings.trim(),
    };

    setPapers([...papers, newPaper]);
    setNewTitle('');
    setNewAuthors('');
    setNewYear('');
    setNewMethodology('');
    setNewFindings('');
    setShowAddForm(false);
    setError(null);
  };

  const handleBatchImport = () => {
    if (!batchRawSummaries.trim()) return;
    const split = batchRawSummaries
      .split(/\n\s*---\s*\n|\n\s*===\s*\n/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    if (split.length < 2) {
      setError('Please separate your paper summaries with "---" on a new line (provide at least 2 distinct summaries).');
      return;
    }

    const newEntries: PaperEntry[] = split.map((summaryText, i) => {
      const firstLine = summaryText.split('\n')[0].replace(/^Title:\s*|^\d+[\.\)]\s*/i, '').trim();
      return {
        id: `batch-${Date.now()}-${i}`,
        title: firstLine.length > 5 ? firstLine.slice(0, 90) : `Paper Summary ${papers.length + i + 1}`,
        authors: `Study ${papers.length + i + 1}`,
        year: 'Recent',
        findings: summaryText,
        methodology: 'Empirical Analysis',
      };
    });

    setPapers([...papers, ...newEntries]);
    setBatchRawSummaries('');
    setShowBatchPaste(false);
    setError(null);
  };

  const handleRemovePaper = (id: string) => {
    setPapers(papers.filter((p) => p.id !== id));
  };

  const handleLoadSamples = () => {
    setPapers(SAMPLE_PAPERS);
    setError(null);
  };

  const handleClearAll = () => {
    setPapers([]);
    setResult(null);
  };

  const handleSynthesize = async () => {
    if (papers.length < 2) {
      setError('Please provide at least 2 research papers or summaries to synthesize.');
      return;
    }
    setError(null);
    setLoading(true);
    setSaved(false);

    try {
      const data = await synthesizeLiterature(papers, synthesisGoal);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to synthesize literature review.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const reportText = formatLiteratureReviewAsText(result, papers.length);
    const filename = `Literature_Review_${(result.themeTitle || 'Synthesis').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.txt`;
    downloadAsTextFile(filename, reportText);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleCopyNarrative = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.synthesisNarrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    onSaveToNotebook('literature', result.themeTitle || 'Literature Review Synthesis', result);
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium backdrop-blur-xs mb-3">
            <Library className="w-3.5 h-3.5" />
            <span>Step 5: Multi-Paper Synthesis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Literature Review Organizer & Synthesizer
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Move beyond disjointed paper summaries. Organize multiple studies into a comparative thematic matrix, isolate points of academic consensus and divergence, and draft an integrated review narrative.
          </p>
        </div>
      </div>

      {/* Paper Management Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Included Research Studies ({papers.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add at least 2 papers to perform a cross-study academic synthesis
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSamples}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1"
            >
              Reload 3 Samples
            </button>
            {papers.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-slate-400 hover:text-red-600 px-2 py-1"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={() => { setShowBatchPaste(!showBatchPaste); setShowAddForm(false); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showBatchPaste ? 'Cancel Batch' : 'Batch Paste Summaries'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setShowAddForm(!showAddForm); setShowBatchPaste(false); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel' : 'Add Single Study'}</span>
            </button>
          </div>
        </div>

        {/* Batch Paste Form */}
        {showBatchPaste && (
          <div className="my-4 p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Paste Multiple Paper Summaries</span>
              </h4>
              <span className="text-[11px] text-indigo-700">Separate each paper summary with "---" on a new line</span>
            </div>
            <textarea
              rows={7}
              value={batchRawSummaries}
              onChange={(e) => setBatchRawSummaries(e.target.value)}
              placeholder="Paper 1 Title: AI Assisted Learning
Findings: Increased syntax speed by 35%...
---
Paper 2 Title: Metacognitive Prompt Scaffolding
Findings: Prompt structuring prevented cognitive offloading...
---
Paper 3 Title: Competence Illusions
Findings: Overestimation of mastery in unguided environments..."
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-indigo-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBatchPaste(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchImport}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Parse Summaries into Studies
              </button>
            </div>
          </div>
        )}

        {/* Add Paper Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddPaper}
            className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
          >
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              New Study Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Paper Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Deep Learning in Clinical Diagnosis: A Validation Study"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Authors
                </label>
                <input
                  type="text"
                  value={newAuthors}
                  onChange={(e) => setNewAuthors(e.target.value)}
                  placeholder="e.g., Gomez, J. & Patel, R."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Year
                </label>
                <input
                  type="text"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  placeholder="e.g., 2024"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Methodology & Sample Size
                </label>
                <input
                  type="text"
                  value={newMethodology}
                  onChange={(e) => setNewMethodology(e.target.value)}
                  placeholder="e.g., Randomized controlled trial (N=350)"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Core Findings & Arguments *
              </label>
              <textarea
                rows={3}
                required
                value={newFindings}
                onChange={(e) => setNewFindings(e.target.value)}
                placeholder="What did this study discover or argue? Paste findings or abstract excerpts..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save Paper
              </button>
            </div>
          </form>
        )}

        {/* Papers List */}
        {papers.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl my-4 border border-dashed border-slate-300">
            <p className="text-sm text-slate-600">No papers added yet.</p>
            <button
              type="button"
              onClick={handleLoadSamples}
              className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
            >
              Load 3 Pre-Populated Studies
            </button>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {papers.map((p, idx) => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700">Study #{idx + 1}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-slate-900">{p.authors}</span>
                    <span className="text-slate-500">({p.year})</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">{p.title}</h4>
                  {p.methodology && (
                    <p className="text-slate-600">
                      <strong>Method:</strong> {p.methodology}
                    </p>
                  )}
                  <p className="text-slate-700 leading-relaxed bg-white/70 p-2.5 rounded border border-slate-200/60 mt-1">
                    {p.findings}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemovePaper(p.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Remove paper"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Synthesis Goal & Trigger */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-1">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Target Literature Review Section
            </label>
            <input
              type="text"
              value={synthesisGoal}
              onChange={(e) => setSynthesisGoal(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSynthesize}
            disabled={loading || papers.length < 2}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Synthesizing Literature...' : 'Synthesize Literature Review'}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      <ErrorBanner error={error} onRetry={handleSynthesize} onDismiss={() => setError(null)} />

      {/* Loading state */}
      {loading && (
        <LoadingState
          message="Cross-synthesizing literature and constructing thematic matrix..."
          subMessage="Identifying common conceptual threads, reconciling divergent findings, and assembling scholarly prose."
        />
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="font-semibold text-sm text-slate-900">
                {result.themeTitle || 'Literature Review Synthesis'}
              </span>
              <p className="text-xs text-slate-500">
                Cross-analyzed {papers.length} scholarly sources
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                title="Download literature review as .txt file"
              >
                {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileDown className="w-3.5 h-3.5 text-blue-600" />}
                <span>{downloaded ? 'Downloaded .txt' : 'Download Report (.txt)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyNarrative}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Narrative' : 'Copy Review Text'}</span>
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

          {/* Thematic Comparative Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Comparative Thematic Synthesis Matrix</span>
            </h4>
            <div className="space-y-3">
              {result.thematicMatrix?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-blue-900">
                      Theme {idx + 1}: {item.theme}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      <Users className="w-3 h-3" />
                      <span>{item.papersInAgreement?.join(', ')}</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {item.coreArgument}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Consensus vs Divergence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consensus */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 mb-3">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Points of Academic Consensus</span>
              </div>
              <ul className="space-y-2">
                {result.pointsOfConsensus?.map((pt, i) => (
                  <li
                    key={i}
                    className="text-xs text-slate-700 flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100"
                  >
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Divergence */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
                <GitCommit className="w-4 h-4 text-amber-600" />
                <span>Points of Divergence & Academic Debate</span>
              </div>
              <ul className="space-y-2">
                {result.pointsOfDivergence?.map((pt, i) => (
                  <li
                    key={i}
                    className="text-xs text-slate-700 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/50 border border-amber-100"
                  >
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Synthesis Narrative Draft */}
          <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-xs relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Integrated Literature Review Draft Text
              </span>
              <button
                type="button"
                onClick={handleCopyNarrative}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {copied ? 'Copied to Clipboard!' : 'Copy Draft Text'}
              </button>
            </div>
            <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200 whitespace-pre-line text-xs sm:text-sm">
              {result.synthesisNarrative}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
