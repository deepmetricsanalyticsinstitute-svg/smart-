import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/calculator';

interface ProgressBarProps {
  currentValue: number;
  targetValue: number;
  currency: string;
  goalName?: string | null;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentValue,
  targetValue,
  currency,
  goalName,
}) => {
  if (targetValue <= 0) return null;

  const progressPercentage = (currentValue / targetValue) * 100;
  const isGoalMet = currentValue >= targetValue;
  const progressWidth = Math.min(100, Math.max(0, progressPercentage));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            {isGoalMet ? (
              <CheckCircle2 size={18} className="text-emerald-500" />
            ) : (
              <Target size={18} className="text-slate-500" />
            )}
            {goalName ? `Goal: ${goalName}` : 'Goal Progress'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isGoalMet ? 'Target reached!' : 'Projected Value vs Target'}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`text-lg font-bold ${
              isGoalMet ? 'text-emerald-600' : 'text-slate-700'
            }`}
          >
            {progressPercentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ease-out ${
            isGoalMet ? 'bg-emerald-500' : 'bg-emerald-400'
          }`}
          style={{ width: `${progressWidth}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs font-medium text-slate-500">
        <span>{formatCurrency(currentValue, currency)}</span>
        <span>{formatCurrency(targetValue, currency)}</span>
      </div>
    </div>
  );
};

export default ProgressBar;