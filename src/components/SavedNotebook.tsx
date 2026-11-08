import React, { useState } from 'react';
import {
  BookMarked,
  Download,
  Copy,
  Check,
  Trash2,
  Compass,
  HelpCircle,
  FileText,
  Search,
  Library,
  Quote,
  FileDown,
} from 'lucide-react';
import { SavedItem } from '../types';

interface SavedNotebookProps {
  items: SavedItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export const SavedNotebook: React.FC<SavedNotebookProps> = ({
  items,
  onRemoveItem,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const filteredItems =
    filter === 'all' ? items : items.filter((i) => i.type === filter);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'topic':
        return Compass;
      case 'question':
        return HelpCircle;
      case 'summary':
        return FileText;
      case 'gap':
        return Search;
      case 'literature':
        return Library;
      case 'citation':
        return Quote;
      default:
        return BookMarked;
    }
  };

  const generateMarkdown = () => {
    let md = `# ResearchMate — Academic Research Notebook\nGenerated on: ${new Date().toLocaleDateString()}\n\n---\n\n`;

    items.forEach((item, index) => {
      md += `## ${index + 1}. [${item.type.toUpperCase()}] ${item.title}\n`;
      md += `*Saved: ${new Date(item.date).toLocaleString()}*\n\n`;

      if (item.type === 'topic') {
        const t = item.content;
        md += `**Refined Title:** ${t.refinedTitle}\n\n`;
        md += `**Scope:** ${t.scopeAnalysis}\n\n`;
        md += `**Keywords:** ${t.keyKeywords?.join(', ')}\n\n`;
      } else if (item.type === 'question') {
        const q = item.content;
        md += `**Question:** ${q.question}\n\n`;
        md += `**Type:** ${q.type}\n\n`;
        md += `**Rationale:** ${q.rationale}\n\n`;
        md += `**Methodology:** ${q.suggestedMethodology}\n\n`;
        md += `**Hypothesis:** ${q.draftHypothesis}\n\n`;
      } else if (item.type === 'summary') {
        const s = item.content;
        md += `**TL;DR:** ${s.tldr}\n\n`;
        md += `**Objective:** ${s.researchObjective}\n\n`;
        md += `**Methodology:** ${s.methodology}\n\n`;
        md += `**Key Findings:**\n${s.keyFindings?.map((f: string) => `- ${f}`).join('\n')}\n\n`;
        md += `**Limitations:**\n${s.limitations?.map((l: string) => `- ${l}`).join('\n')}\n\n`;
      } else if (item.type === 'gap') {
        const g = item.content;
        md += `**Gap:** ${g.title}\n\n`;
        md += `**Description:** ${g.description}\n\n`;
        md += `**Contribution:** ${g.potentialContribution}\n\n`;
        md += `**Suggested Study:** ${g.suggestedResearchApproach}\n\n`;
      } else if (item.type === 'literature') {
        const l = item.content;
        md += `**Theme:** ${l.themeTitle}\n\n`;
        md += `### Synthesis Narrative:\n\n${l.synthesisNarrative}\n\n`;
      } else if (item.type === 'citation') {
        const c = item.content;
        md += `**APA 7th Reference:**\n> ${c.apa}\n\n`;
        md += `**In-Text Parenthetical:** ${c.inTextParenthetical}\n\n`;
        md += `**In-Text Narrative:** ${c.inTextNarrative}\n\n`;
      }

      md += `---\n\n`;
    });

    return md;
  };

  const handleCopyAll = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ResearchMate_Workspace_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ResearchMate_Workspace_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium backdrop-blur-xs mb-3">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Project Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Saved Research Workspace ({items.length})
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Review, organize, and export all generated topics, questions, summaries, gaps, literature matrices, and APA citations created during your research sessions.
          </p>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `All (${items.length})` },
            { id: 'topic', label: 'Topics' },
            { id: 'question', label: 'Questions' },
            { id: 'summary', label: 'Summaries' },
            { id: 'gap', label: 'Gaps' },
            { id: 'literature', label: 'Literature' },
            { id: 'citation', label: 'Citations' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                filter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Global Actions */}
        {items.length > 0 && (
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied All' : 'Copy All Markdown'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download .txt</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-600" />
              <span>Export .md</span>
            </button>

            <button
              type="button"
              onClick={onClearAll}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Clear all saved items"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">No saved items in this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            As you explore topics, formulate questions, analyze papers, and generate citations, click "Save to Notebook" on any card to store them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const Icon = getItemIcon(item.type);
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-200 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-sm sm:text-base font-semibold text-slate-900">
                  {item.title}
                </h4>

                {/* Render preview depending on type */}
                {item.type === 'citation' && (
                  <p className="text-xs font-serif text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 pl-6 -indent-6">
                    {item.content.apa}
                  </p>
                )}

                {item.type === 'question' && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <p><strong>Rationale:</strong> {item.content.rationale}</p>
                    <p><strong>Methodology:</strong> {item.content.suggestedMethodology}</p>
                  </div>
                )}

                {item.type === 'summary' && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <p><strong>TL;DR:</strong> {item.content.tldr}</p>
                    <p><strong>Methodology:</strong> {item.content.methodology}</p>
                  </div>
                )}

                {item.type === 'gap' && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <p><strong>Description:</strong> {item.content.description}</p>
                    <p><strong>Suggested Study:</strong> {item.content.suggestedResearchApproach}</p>
                  </div>
                )}

                {item.type === 'literature' && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-3">
                    {item.content.synthesisNarrative}
                  </div>
                )}

                {item.type === 'topic' && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <p><strong>Scope:</strong> {item.content.scopeAnalysis}</p>
                    <p><strong>Keywords:</strong> {item.content.keyKeywords?.join(', ')}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
