import React from 'react';
import {
  GraduationCap,
  BookMarked,
  Menu,
  X,
  Sparkles,
  FileDown,
} from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  savedCount: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('topic')}
              className="flex items-center gap-3 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">
                    Research<span className="text-blue-600">Mate</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                    <Sparkles className="w-3 h-3 text-blue-500" /> AI Research Assistant
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden md:block">
                  Academic intelligence for college students & thesis researchers
                </p>
              </div>
            </button>
          </div>

          {/* Quick Actions & Saved Notebook Counter */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('report')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'report'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60'
              }`}
              title="Download research report as text file"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Report (.txt)</span>
            </button>

            <button
              onClick={() => setActiveTab('notebook')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500/20 ${
                activeTab === 'notebook'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
              }`}
              title="View your saved research notebook"
            >
              <BookMarked className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Research Notebook</span>
              {savedCount > 0 && (
                <span className="bg-blue-600 text-white text-[11px] font-semibold px-1.5 py-0.2 rounded-full min-w-5 text-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
