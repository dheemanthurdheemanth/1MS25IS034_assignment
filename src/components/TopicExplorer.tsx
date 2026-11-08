import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  BookOpen,
  Search,
  Layers,
  Database,
  FileDown,
} from 'lucide-react';
import { TopicResult, TabType } from '../types';
import { analyzeTopic } from '../services/api';
import { downloadAsTextFile } from '../utils/exportUtils';
import { LoadingState } from './LoadingState';
import { ErrorBanner } from './ErrorBanner';

interface TopicExplorerProps {
  onSelectTopicForQuestions: (topic: string, field?: string) => void;
  onSaveToNotebook: (type: 'topic', title: string, content: any) => void;
  setActiveTab: (tab: TabType) => void;
}

const SAMPLE_TOPICS = [
  {
    topic: 'The impact of AI-assisted coding tools on undergraduate computer science education',
    field: 'Computer Science & Education',
  },
  {
    topic: 'Microplastics contamination in urban freshwater ecosystems and bioaccumulation risks',
    field: 'Environmental Science',
  },
  {
    topic: 'Remote work flexibility and musculoskeletal health among Gen-Z knowledge workers',
    field: 'Occupational Health & Ergonomics',
  },
  {
    topic: 'Cognitive behavioral digital therapeutics for college student anxiety disorders',
    field: 'Psychology & Behavioral Health',
  },
];

export const TopicExplorer: React.FC<TopicExplorerProps> = ({
  onSelectTopicForQuestions,
  onSaveToNotebook,
  setActiveTab,
}) => {
  const [topic, setTopic] = useState('');
  const [field, setField] = useState('Computer Science & Education');
  const [academicLevel, setAcademicLevel] = useState('Undergraduate Thesis / Capstone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TopicResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadTxt = () => {
    if (!result) return;
    const banner = '='.repeat(70);
    const textReport = `${banner}
RESEARCHMATE — TOPIC ANALYSIS & SCOPE REPORT
${banner}
Original Topic:    ${topic}
Academic Field:    ${field}
Academic Level:    ${academicLevel}
Date Generated:    ${new Date().toLocaleString()}

REFINED FORMAL RESEARCH TITLE:
"${result.refinedTitle}"

SCOPE EVALUATION:
${result.scopeAnalysis}

SUB-TOPICS & INVESTIGATIVE ANGLES:
${result.subTopics?.map((s, i) => `[${i + 1}] ${s.title}\n    ${s.description}`).join('\n\n')}

THEORETICAL & CONCEPTUAL FRAMEWORK:
${result.conceptualFramework}

BOOLEAN SEARCH KEYWORDS:
${result.keyKeywords?.join(', ')}

RECOMMENDED SCHOLARLY DATABASES:
${result.academicDatabases?.join(', ')}

${banner}
Generated with ResearchMate AI Assistant
${banner}
`;
    downloadAsTextFile(`Topic_Analysis_${(result.refinedTitle || 'Topic').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.txt`, textReport);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleAnalyze = async () => {
    if (!topic.trim()) {
      setError('Please enter a research topic to analyze.');
      return;
    }
    setError(null);
    setLoading(true);
    setSaved(false);

    try {
      const data = await analyzeTopic(topic.trim(), field, academicLevel);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze topic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    onSaveToNotebook('topic', result.refinedTitle || topic, result);
    setSaved(true);
  };

  const handleLoadSample = (sample: { topic: string; field: string }) => {
    setTopic(sample.topic);
    setField(sample.field);
  };

  const handleProceedToQuestions = () => {
    if (!result) return;
    onSelectTopicForQuestions(result.refinedTitle || topic, field);
    setActiveTab('questions');
  };

  return (
    <div className="space-y-6">
      {/* Intro Hero Card */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium backdrop-blur-xs mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Step 1: Ideation & Refinement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Research Topic Explorer & Scope Refiner
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Transform broad ideas into precise, academically viable research titles. Refine your scope, discover theoretical frameworks, and extract high-impact search keywords.
          </p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Enter your research topic or area of interest
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The impact of smartphone usage on undergraduate attention span during lectures..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Quick sample topic buttons */}
          <div>
            <span className="text-xs font-medium text-slate-500 mr-2">Try a sample topic:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {SAMPLE_TOPICS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(s)}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors border border-slate-200 text-left"
                >
                  {s.topic.length > 55 ? s.topic.slice(0, 55) + '…' : s.topic}
                </button>
              ))}
            </div>
          </div>

          {/* Filter options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Academic Field / Discipline
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Computer Science & Education">Computer Science & Information Tech</option>
                <option value="Environmental Science & Ecology">Environmental Science & Ecology</option>
                <option value="Psychology & Behavioral Health">Psychology & Cognitive Science</option>
                <option value="Healthcare & Nursing">Medicine, Nursing & Public Health</option>
                <option value="Business, Economics & Management">Business, Economics & Management</option>
                <option value="Sociology & Public Policy">Sociology, Political Science & Law</option>
                <option value="Humanities & Literature">Humanities, History & Philosophy</option>
                <option value="Engineering & Applied Sciences">Engineering & Applied Physical Sciences</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Academic Level
              </label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Undergraduate Coursework">Undergraduate Coursework / Term Paper</option>
                <option value="Undergraduate Thesis / Capstone">Undergraduate Thesis / Senior Capstone</option>
                <option value="Master's Thesis">Master's Thesis / Graduate Research</option>
                <option value="Doctoral / Faculty Project">Doctoral Dissertation / Faculty Pilot</option>
              </select>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-slate-400">
              Powered by Gemini 3.8 Flash · Analyzes feasibility, keywords, and academic framework
            </p>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !topic.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs hover:shadow transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Analyzing Topic...' : 'Analyze & Refine Topic'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      <ErrorBanner error={error} onRetry={handleAnalyze} onDismiss={() => setError(null)} />

      {/* Loading state */}
      {loading && (
        <LoadingState
          message="Evaluating topic scope and academic viability..."
          subMessage="Refining terminology, isolating independent variables, and selecting conceptual frameworks."
        />
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Header result bar */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-900">Analysis Results</span>
              <span>·</span>
              <span>{field}</span>
              <span>·</span>
              <span>{academicLevel}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                title="Download topic analysis as .txt file"
              >
                {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileDown className="w-3.5 h-3.5 text-blue-600" />}
                <span>{downloaded ? 'Downloaded .txt' : 'Download Report (.txt)'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{saved ? 'Saved in Notebook' : 'Save to Notebook'}</span>
              </button>
              <button
                type="button"
                onClick={handleProceedToQuestions}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
              >
                <span>Generate Questions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Refined Title Card */}
          <div className="bg-white rounded-xl border border-blue-200/80 p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Recommended Formal Research Title
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  {result.refinedTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(result.refinedTitle, 'title')}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                title="Copy title"
              >
                {copiedKey === 'title' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Scope Critique */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-start gap-2.5 text-sm text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200/70">
                <Compass className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Scope Evaluation: </span>
                  {result.scopeAnalysis}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Topics & Angles */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Recommended Sub-Angles & Niches to Investigate</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.subTopics?.map((sub, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-blue-50/40 border border-blue-100 hover:border-blue-300 transition-colors"
                >
                  <div className="text-xs font-semibold text-blue-900 mb-1">
                    0{idx + 1}. {sub.title}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{sub.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Conceptual Framework & Theoretical Lenses */}
          {result.conceptualFramework && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Conceptual Framework & Theoretical Lenses</span>
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-indigo-50/40 p-4 rounded-lg border border-indigo-100/70">
                {result.conceptualFramework}
              </p>
            </div>
          )}

          {/* Keywords & Academic Databases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Keywords */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center justify-between mb-3">
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span>Boolean Search Keywords</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.keyKeywords.join(', '), 'keywords')}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {copiedKey === 'keywords' ? 'Copied!' : 'Copy All'}
                </button>
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.keyKeywords?.map((kw, i) => (
                  <span
                    key={i}
                    onClick={() => handleCopy(kw, `kw-${i}`)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-800 cursor-pointer transition-colors border border-slate-200"
                    title="Click to copy keyword"
                  >
                    <span>{kw}</span>
                    {copiedKey === `kw-${i}` ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-2.5 h-2.5 text-slate-400" />
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Academic Databases */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Recommended Scholarly Databases</span>
              </h4>
              <ul className="space-y-2">
                {result.academicDatabases?.map((db, i) => (
                  <li
                    key={i}
                    className="text-xs text-slate-700 flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>{db}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
