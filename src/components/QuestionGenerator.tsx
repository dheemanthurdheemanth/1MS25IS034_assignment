import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  ArrowRight,
  Filter,
  CheckCircle2,
  FileQuestion,
  FileDown,
} from 'lucide-react';
import { QuestionsResult, TabType } from '../types';
import { generateQuestions } from '../services/api';
import { downloadAsTextFile, formatQuestionsAsText } from '../utils/exportUtils';
import { LoadingState } from './LoadingState';
import { ErrorBanner } from './ErrorBanner';

interface QuestionGeneratorProps {
  initialTopic?: string;
  initialField?: string;
  onSaveToNotebook: (type: 'question', title: string, content: any) => void;
  setActiveTab: (tab: TabType) => void;
  onSendToGapFinder: (topic: string) => void;
}

export const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({
  initialTopic = '',
  initialField = '',
  onSaveToNotebook,
  setActiveTab,
  onSendToGapFinder,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [field, setField] = useState(initialField || 'Social & Behavioral Sciences');
  const [focusArea, setFocusArea] = useState('Undergraduate college students & higher education');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuestionsResult | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Record<number, boolean>>({});
  const [downloaded, setDownloaded] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please provide a research topic to generate questions.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const data = await generateQuestions(topic.trim(), field, focusArea);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyQuestion = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveQuestion = (q: any) => {
    onSaveToNotebook('question', q.question, q);
    setSavedIds((prev) => ({ ...prev, [q.id]: true }));
  };

  const handleSaveAll = () => {
    if (!result) return;
    result.questions.forEach((q) => {
      onSaveToNotebook('question', q.question, q);
    });
    const allSaved: Record<number, boolean> = {};
    result.questions.forEach((q) => {
      allSaved[q.id] = true;
    });
    setSavedIds(allSaved);
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const textReport = formatQuestionsAsText(result, topic);
    const filename = `Research_Questions_${topic.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.txt`;
    downloadAsTextFile(filename, textReport);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleLoadSample = () => {
    setTopic('The effectiveness of active learning pedagogies on undergraduate retention in STEM majors');
    setField('Education & STEM Pedagogy');
    setFocusArea('First-year university students from underrepresented backgrounds');
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium backdrop-blur-xs mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Step 2: Question Formulation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Academic Research Question Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Generate five methodologically sound, testable research questions. Each formulated question identifies key variables, research methodology, rationale, and draft hypotheses.
          </p>
        </div>
      </div>

      {/* Input Box Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Research Topic or Working Title
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Load STEM Example
              </button>
            </div>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The relationship between mindfulness meditation and executive functioning in college students during exam periods..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Discipline / Academic Field
              </label>
              <input
                type="text"
                value={field}
                onChange={(e) => setField(e.target.value)}
                placeholder="e.g., Psychology, Computer Science, Biology, Economics"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Demographic or Methodology Focus (Optional)
              </label>
              <input
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="e.g., First-generation college students, Quantitative survey"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-400">
              Produces 5 distinct inquiry formats: Descriptive, Correlational, Comparative, Evaluative & Applied
            </span>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs hover:shadow transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Generating Questions...' : 'Generate 5 Research Questions'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      <ErrorBanner error={error} onRetry={handleGenerate} onDismiss={() => setError(null)} />

      {/* Loading state */}
      {loading && (
        <LoadingState
          message="Formulating 5 academically rigorous research questions..."
          subMessage="Mapping independent and dependent variables, testing feasibility, and drafting hypotheses."
        />
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="font-semibold text-sm text-slate-900">
                Generated 5 Research Questions
              </span>
              <p className="text-xs text-slate-500 mt-0.5">{result.overview}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                title="Download questions as .txt file"
              >
                {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileDown className="w-3.5 h-3.5 text-blue-600" />}
                <span>{downloaded ? 'Downloaded .txt' : 'Download Report (.txt)'}</span>
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save All to Notebook</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSendToGapFinder(topic);
                  setActiveTab('gaps');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <span>Find Literature Gaps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Question Cards */}
          <div className="space-y-4">
            {result.questions.map((q, idx) => {
              const isSaved = savedIds[q.id];
              return (
                <div
                  key={q.id || idx}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-blue-700 tracking-wide uppercase">
                        {q.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyQuestion(q.question, q.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Copy question text"
                      >
                        {copiedId === q.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {copiedId === q.id ? 'Copied' : 'Copy'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveQuestion(q)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors ${
                          isSaved
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Save question"
                      >
                        {isSaved ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {isSaved ? 'Saved' : 'Save'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* The Question */}
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mt-3 leading-snug">
                    {q.question}
                  </h3>

                  {/* Academic Rationale */}
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {q.rationale}
                  </p>

                  {/* Variable breakdown & methodology grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                    {q.independentVariable && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-semibold text-slate-800 block mb-0.5">
                          Independent Variable:
                        </span>
                        <span className="text-slate-600">{q.independentVariable}</span>
                      </div>
                    )}

                    {q.dependentVariable && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-semibold text-slate-800 block mb-0.5">
                          Dependent Variable:
                        </span>
                        <span className="text-slate-600">{q.dependentVariable}</span>
                      </div>
                    )}

                    <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                      <span className="font-semibold text-blue-900 block mb-0.5">
                        Methodology:
                      </span>
                      <span className="text-blue-800">{q.suggestedMethodology}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                      <span className="font-semibold text-indigo-900 block mb-0.5">
                        Draft Hypothesis:
                      </span>
                      <span className="text-indigo-800 italic">{q.draftHypothesis}</span>
                    </div>
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
