import React, { useState, useEffect } from 'react';
import { TabType, SavedItem } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TopicExplorer } from './components/TopicExplorer';
import { QuestionGenerator } from './components/QuestionGenerator';
import { PaperSummarizer } from './components/PaperSummarizer';
import { GapFinder } from './components/GapFinder';
import { LiteratureReview } from './components/LiteratureReview';
import { CitationGenerator } from './components/CitationGenerator';
import { SavedNotebook } from './components/SavedNotebook';
import { ReportExporter } from './components/ReportExporter';
import { CheckCircle2 } from 'lucide-react';
import { PaperEntry } from './types';

const STORAGE_KEY = 'researchmate_saved_items_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('topic');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cross-feature shared context
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentField, setCurrentField] = useState('');
  const [paperForLiterature, setPaperForLiterature] = useState<PaperEntry | null>(null);
  const [paperForGaps, setPaperForGaps] = useState<string>('');

  // Persistent notebook items
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedItems));
    } catch (err) {
      console.warn('Failed to save notebook items to localStorage:', err);
    }
  }, [savedItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveToNotebook = (
    type: SavedItem['type'],
    title: string,
    content: any
  ) => {
    const newItem: SavedItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type,
      title,
      content,
      date: new Date().toISOString(),
    };
    setSavedItems((prev) => [newItem, ...prev]);
    showToast(`Saved to Research Notebook!`);
  };

  const handleRemoveSavedItem = (id: string) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
    showToast('Item removed from notebook');
  };

  const handleClearAllSaved = () => {
    if (window.confirm('Are you sure you want to clear your saved notebook?')) {
      setSavedItems([]);
      showToast('Notebook cleared');
    }
  };

  const handleSelectTopicForQuestions = (topic: string, field?: string) => {
    setCurrentTopic(topic);
    if (field) setCurrentField(field);
  };

  const handleSendToGapFinder = (topic: string) => {
    setCurrentTopic(topic);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedItems.length}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          savedCount={savedItems.length}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Viewport Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'topic' && (
            <TopicExplorer
              onSelectTopicForQuestions={handleSelectTopicForQuestions}
              onSaveToNotebook={handleSaveToNotebook}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'questions' && (
            <QuestionGenerator
              initialTopic={currentTopic}
              initialField={currentField}
              onSaveToNotebook={handleSaveToNotebook}
              setActiveTab={setActiveTab}
              onSendToGapFinder={handleSendToGapFinder}
            />
          )}

          {activeTab === 'summarizer' && (
            <PaperSummarizer
              onSaveToNotebook={handleSaveToNotebook}
              onSendToLiteratureReview={(paper) => {
                setPaperForLiterature({
                  id: `imported-${Date.now()}`,
                  title: paper.title,
                  findings: paper.findings,
                  methodology: paper.methodology || 'Empirical Study',
                  authors: paper.authors || 'Analyzed Author',
                  year: paper.year || String(new Date().getFullYear()),
                });
                showToast('Paper summary added to Literature Review!');
              }}
              onSendToGapFinder={(text) => {
                setPaperForGaps(text);
                showToast('Paper transferred to Research Gap Finder!');
              }}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'gaps' && (
            <GapFinder
              initialTopic={currentTopic}
              initialPaperText={paperForGaps}
              onSaveToNotebook={handleSaveToNotebook}
              onSelectGapForQuestions={handleSelectTopicForQuestions}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'literature' && (
            <LiteratureReview
              onSaveToNotebook={handleSaveToNotebook}
              importedPaper={paperForLiterature}
            />
          )}

          {activeTab === 'citations' && (
            <CitationGenerator onSaveToNotebook={handleSaveToNotebook} />
          )}

          {activeTab === 'report' && (
            <ReportExporter
              savedItems={savedItems}
              currentTopic={currentTopic}
            />
          )}

          {activeTab === 'notebook' && (
            <SavedNotebook
              items={savedItems}
              onRemoveItem={handleRemoveSavedItem}
              onClearAll={handleClearAllSaved}
            />
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">ResearchMate</span>
            <span>·</span>
            <span>AI Academic Research Assistant</span>
            <span>·</span>
            <span>Powered by Gemini 3.8 Flash</span>
          </div>
          <div>
            Built for college students, thesis authors, and academic researchers
          </div>
        </div>
      </footer>
    </div>
  );
}
