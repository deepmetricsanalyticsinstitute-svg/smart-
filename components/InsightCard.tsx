import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface InsightCardProps {
  insight: string | null;
  loading: boolean;
  onGenerate: () => void;
  hasResult: boolean;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, loading, onGenerate, hasResult }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full mix-blend-multiply filter blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
          <Sparkles className="text-indigo-500" size={20} />
          AI Financial Advisor
        </h3>
        {hasResult && !loading && (
           <button
             onClick={onGenerate}
             className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
           >
             <RefreshCw size={12} />
             {insight ? 'Regenerate' : 'Generate'}
           </button>
        )}
      </div>

      <div className="relative z-10 min-h-[120px] text-sm text-slate-700 leading-relaxed">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-8 space-y-3">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <span className="text-slate-500 animate-pulse">Analyzing your growth potential...</span>
          </div>
        ) : insight ? (
          <div className="prose prose-sm prose-indigo max-w-none">
             <ReactMarkdown>{insight}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-6 text-center">
            <p className="text-slate-500 mb-4">
              Unlock personalized insights about your investment strategy powered by Gemini.
            </p>
            <button
              onClick={onGenerate}
              disabled={!hasResult}
              className={`
                px-5 py-2.5 rounded-lg font-medium text-white shadow-md transition-all
                ${hasResult 
                  ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5' 
                  : 'bg-slate-300 cursor-not-allowed'}
              `}
            >
              Generate Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightCard;