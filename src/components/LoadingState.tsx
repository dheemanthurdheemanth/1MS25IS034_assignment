import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';

interface LoadingStateProps {
  message: string;
  subMessage?: string;
}

const ACADEMIC_TIPS = [
  'Tip: A strong research question should be specific, original, researchable, and relevant.',
  'Tip: In APA 7th edition, italicize journal names and volume numbers, but never issue numbers.',
  'Tip: Research gaps exist not just in topics, but in methodology, geography, and demographics.',
  'Tip: A synthesis in literature review compares and contrasts studies rather than listing summaries.',
  'Tip: Formulate your research questions using independent and dependent variables for clear measurability.',
  'Tip: Always review the "Future Directions" section in published papers to discover fresh gap opportunities.',
];

export const LoadingState: React.FC<LoadingStateProps> = ({ message, subMessage }) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % ACADEMIC_TIPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-blue-50/70 border border-blue-100 rounded-xl text-center my-6">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin flex items-center justify-center" />
        <BookOpen className="w-5 h-5 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <h4 className="text-base font-semibold text-slate-800">{message}</h4>
      <p className="text-xs text-slate-500 mt-1 max-w-md">
        {subMessage || 'Gemini AI is analyzing academic structures and scholarly literature...'}
      </p>

      <div className="mt-4 pt-3 border-t border-blue-100/80 max-w-md flex items-center gap-2 text-xs text-blue-700/90 bg-white/70 px-3 py-2 rounded-lg">
        <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="italic">{ACADEMIC_TIPS[tipIndex]}</span>
      </div>
    </div>
  );
};
