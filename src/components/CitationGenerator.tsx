import React, { useState } from 'react';
import {
  Quote,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Info,
  ExternalLink,
  FileDown,
} from 'lucide-react';
import { CitationResult } from '../types';
import { generateCitation, CitationFormDetails } from '../services/api';
import { downloadAsTextFile, formatCitationAsText } from '../utils/exportUtils';
import { ErrorBanner } from './ErrorBanner';

interface CitationGeneratorProps {
  onSaveToNotebook: (type: 'citation', title: string, content: any) => void;
}

const SAMPLE_JOURNAL_DETAILS: CitationFormDetails = {
  type: 'journal',
  authors: 'Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I.',
  year: '2017',
  title: 'Attention is all you need',
  source: 'Advances in Neural Information Processing Systems',
  volume: '30',
  issue: '1',
  pages: '5998-6008',
  doiOrUrl: 'https://doi.org/10.48550/arXiv.1706.03762',
};

const SAMPLE_BOOK_DETAILS: CitationFormDetails = {
  type: 'book',
  authors: 'Creswell, J. W., & Creswell, J. D.',
  year: '2018',
  title: 'Research design: Qualitative, quantitative, and mixed methods approaches',
  source: 'SAGE Publications',
  volume: '',
  issue: '',
  pages: '',
  doiOrUrl: '',
};

export const CitationGenerator: React.FC<CitationGeneratorProps> = ({
  onSaveToNotebook,
}) => {
  const [details, setDetails] = useState<CitationFormDetails>(SAMPLE_JOURNAL_DETAILS);
  const [activeFormat, setActiveFormat] = useState<'apa' | 'mla' | 'chicago' | 'ieee' | 'bibtex'>('apa');
  const [result, setResult] = useState<CitationResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadTxt = () => {
    if (!result) return;
    const textReport = formatCitationAsText(result, details.title);
    const filename = `Citation_${(details.title || 'APA_Reference').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.txt`;
    downloadAsTextFile(filename, textReport);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleInputChange = (field: keyof CitationFormDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!details.title.trim()) {
      setError('Paper or work title is required.');
      return;
    }
    setError(null);
    setSaved(false);

    try {
      const data = await generateCitation(details);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate citation.');
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = () => {
    if (!result) return;
    onSaveToNotebook('citation', details.title, {
      ...result,
      details,
    });
    setSaved(true);
  };

  const loadSample = (sample: CitationFormDetails) => {
    setDetails(sample);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium backdrop-blur-xs mb-3">
            <Quote className="w-3.5 h-3.5" />
            <span>Step 6: Verified Referencing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Academic Citation Generator (APA 7th & Beyond)
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Generate accurate APA 7th Edition reference list citations, parenthetical in-text citations, narrative citations, and BibTeX. Zero hallucinations: formatted directly from your input metadata.
          </p>
        </div>
      </div>

      {/* Input Card */}
      <form onSubmit={handleGenerate} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Source Metadata</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Load sample:</span>
            <button
              type="button"
              onClick={() => loadSample(SAMPLE_JOURNAL_DETAILS)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Journal Article
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => loadSample(SAMPLE_BOOK_DETAILS)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Academic Book
            </button>
          </div>
        </div>

        {/* Source Type Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Publication Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'journal', label: 'Journal Article' },
              { id: 'book', label: 'Book / Monograph' },
              { id: 'conference', label: 'Conference Paper' },
              { id: 'website', label: 'Report / Web Source' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleInputChange('type', t.id as any)}
                className={`px-3 py-2 text-xs rounded-lg border text-center transition-all ${
                  details.type === t.id
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Title of Article or Work *
          </label>
          <input
            type="text"
            required
            value={details.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Attention is all you need"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Authors and Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Author(s) (Last, F. M., & Last, F. M.)
            </label>
            <input
              type="text"
              value={details.authors}
              onChange={(e) => handleInputChange('authors', e.target.value)}
              placeholder="e.g., Vaswani, A., Shazeer, N., & Parmar, N."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Publication Year
            </label>
            <input
              type="text"
              value={details.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
              placeholder="e.g., 2021"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Source / Journal Name, Volume, Issue, Pages */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {details.type === 'book' ? 'Publisher' : 'Journal / Periodical Name'}
            </label>
            <input
              type="text"
              value={details.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              placeholder={details.type === 'book' ? 'e.g., MIT Press' : 'e.g., Nature Machine Intelligence'}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Volume & Issue
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={details.volume || ''}
                onChange={(e) => handleInputChange('volume', e.target.value)}
                placeholder="Vol (e.g. 12)"
                className="w-1/2 px-2.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <input
                type="text"
                value={details.issue || ''}
                onChange={(e) => handleInputChange('issue', e.target.value)}
                placeholder="No. (e.g. 4)"
                className="w-1/2 px-2.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Page Range
            </label>
            <input
              type="text"
              value={details.pages || ''}
              onChange={(e) => handleInputChange('pages', e.target.value)}
              placeholder="e.g., 104-118"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* DOI or URL */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            DOI or Direct URL
          </label>
          <input
            type="text"
            value={details.doiOrUrl || ''}
            onChange={(e) => handleInputChange('doiOrUrl', e.target.value)}
            placeholder="e.g., https://doi.org/10.1038/s41586-020-2649-2 or 10.1145/3313831.3376727"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Strict Provenance: 100% deterministic citation without synthetic web hallucinations</span>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-xs hover:shadow transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate APA Reference</span>
          </button>
        </div>
      </form>

      {/* Error Banner */}
      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {/* Result Section */}
      {result && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Reference Ready</span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">Source Authenticated</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                title="Download citation dossier as .txt file"
              >
                {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileDown className="w-3.5 h-3.5 text-blue-600" />}
                <span>{downloaded ? 'Downloaded .txt' : 'Download Dossier (.txt)'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{saved ? 'Saved in Notebook' : 'Save Reference'}</span>
              </button>
            </div>
          </div>

          {/* Style Selector Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-fit">
            {[
              { id: 'apa', label: 'APA 7th Edition' },
              { id: 'mla', label: 'MLA 9th' },
              { id: 'chicago', label: 'Chicago 17th' },
              { id: 'ieee', label: 'IEEE' },
              { id: 'bibtex', label: 'BibTeX' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setActiveFormat(fmt.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeFormat === fmt.id
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          {/* Formatted Reference Card */}
          <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-xs">
            <div className="flex items-start justify-between gap-4 mb-3">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Full Reference List Entry ({activeFormat.toUpperCase()})
              </span>
              <button
                type="button"
                onClick={() => handleCopy(result[activeFormat], 'active-ref')}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded bg-blue-50"
              >
                {copiedKey === 'active-ref' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedKey === 'active-ref' ? 'Copied' : 'Copy Entry'}</span>
              </button>
            </div>

            {activeFormat === 'bibtex' ? (
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
                {result.bibtex}
              </pre>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 leading-relaxed pl-8 -indent-8 font-serif">
                {result[activeFormat]}
              </div>
            )}
          </div>

          {/* In-Text Citations Grid (For APA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parenthetical */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-800">
                  Parenthetical In-Text Citation
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.inTextParenthetical, 'intext-par')}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {copiedKey === 'intext-par' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'intext-par' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-xs">
                {result.inTextParenthetical}
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                Use at the end of a cited sentence: "...was supported by recent findings {result.inTextParenthetical}."
              </p>
            </div>

            {/* Narrative */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-800">
                  Narrative In-Text Citation
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.inTextNarrative, 'intext-nar')}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {copiedKey === 'intext-nar' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'intext-nar' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-xs">
                {result.inTextNarrative}
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                Use directly inside sentence prose: "According to {result.inTextNarrative}, the experimental trial..."
              </p>
            </div>
          </div>

          {/* APA 7th Quick Reference Guide */}
          <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-semibold">
              <Info className="w-4 h-4 text-blue-600" />
              <span>APA 7th Edition Student Rules Reference:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>Up to 20 authors: List all authors. For 21+ authors, list first 19, insert an ellipsis (…), then the final author.</li>
              <li>Journal title and Volume number are <em>italicized</em>. Issue numbers are in parentheses, not italicized: <em>Nature</em>, <em>580</em>(7801).</li>
              <li>Always include DOIs as functional hyperlinks beginning with <code className="bg-white px-1 py-0.5 rounded border border-blue-100">https://doi.org/...</code>.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
