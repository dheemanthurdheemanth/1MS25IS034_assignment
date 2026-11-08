import React from 'react';
import {
  Compass,
  HelpCircle,
  FileText,
  Search,
  Library,
  Quote,
  BookMarked,
  Sparkles,
  FileDown,
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  savedCount: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  shortDesc: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'topic',
      label: 'Research Topic',
      shortDesc: 'Refine topic, keywords & scope',
      icon: Compass,
    },
    {
      id: 'questions',
      label: 'Research Questions',
      shortDesc: '5 structured academic questions',
      icon: HelpCircle,
    },
    {
      id: 'summarizer',
      label: 'Paper Summarizer',
      shortDesc: 'Methods, findings & limitations',
      icon: FileText,
    },
    {
      id: 'gaps',
      label: 'Research Gap Finder',
      shortDesc: 'Method, population & theory gaps',
      icon: Search,
    },
    {
      id: 'literature',
      label: 'Literature Review',
      shortDesc: 'Multi-paper synthesis matrix',
      icon: Library,
    },
    {
      id: 'citations',
      label: 'Citation Generator',
      shortDesc: 'Strict APA 7th & BibTeX references',
      icon: Quote,
    },
    {
      id: 'report',
      label: 'Export Report',
      shortDesc: 'Download research report (.txt)',
      icon: FileDown,
    },
    {
      id: 'notebook',
      label: 'Saved Workspace',
      shortDesc: 'Review notebook & saved history',
      icon: BookMarked,
      badge: savedCount > 0 ? String(savedCount) : undefined,
    },
  ];

  const handleSelect = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Navigation Container */}
      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 md:w-68 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out shrink-0 overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 flex flex-col justify-between h-full">
          <div>
            <div className="px-3 pb-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Research Toolkit
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                      isActive
                        ? 'bg-blue-50 text-blue-900 font-semibold shadow-xs ring-1 ring-blue-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100/70 group-hover:text-blue-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium tracking-tight">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.shortDesc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Academic Helper Callout */}
          <div className="mt-6 p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-blue-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Academic Integrity</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ResearchMate uses verified extraction and strict formatting to prevent citation hallucination.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
