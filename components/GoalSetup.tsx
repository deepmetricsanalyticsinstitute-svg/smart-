
import React, { useState } from 'react';
import { Target, Calendar, Calculator, ChevronDown, ChevronUp, DollarSign, Wallet } from 'lucide-react';
import InputGroup from './InputGroup';
import { getYearsUntil } from '../utils/calculator';

interface GoalSetupProps {
  onApplyGoal: (goal: { 
    name: string; 
    targetAmount: string; 
    years: string; 
    date: string; 
    principal: string; 
    contribution: string;
    mode: 'PV' | 'PMT' 
  }) => void;
  currency: string;
}

const GoalSetup: React.FC<GoalSetupProps> = ({ onApplyGoal, currency }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [date, setDate] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [plannedContribution, setPlannedContribution] = useState('');
  
  // Strategy: 
  // 'CONTRIBUTION': I have savings, how much to contribute monthly? (Solve for PMT)
  // 'PRINCIPAL': I can contribute X, how much start capital do I need? (Solve for PV)
  const [strategy, setStrategy] = useState<'CONTRIBUTION' | 'PRINCIPAL'>('CONTRIBUTION');

  const symbol = currency;

  const handleApply = () => {
    if (!name || !targetAmount || !date) return;
    
    const years = getYearsUntil(date);
    
    onApplyGoal({ 
      name, 
      targetAmount, 
      years: years.toFixed(2),
      date,
      principal: currentSavings || '0',
      contribution: plannedContribution || '0',
      mode: strategy === 'CONTRIBUTION' ? 'PMT' : 'PV'
    });
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-white hover:bg-emerald-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
            <Target size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-emerald-900 text-sm sm:text-base">Set a Financial Goal</h3>
            <p className="text-xs text-emerald-600/80">Tailor calculations for Retirement, House, or Education</p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={20} className="text-emerald-400" /> : <ChevronDown size={20} className="text-emerald-400" />}
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-emerald-100 space-y-5 bg-white animate-in slide-in-from-top-2 duration-200">
          
          <div className="space-y-4">
            <InputGroup
              label="Goal Name"
              value={name}
              onChange={setName}
              placeholder="e.g., Retirement Fund"
              type="text"
              icon={Target}
            />
            
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputGroup
                label="Target Amount"
                value={targetAmount}
                onChange={setTargetAmount}
                placeholder="100000"
                prefix={symbol}
                icon={DollarSign}
              />
              <InputGroup
                label="Target Date"
                value={date}
                onChange={setDate}
                type="date"
                icon={Calendar}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
            <h4 className="text-sm font-semibold text-slate-700">Calculation Strategy</h4>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setStrategy('CONTRIBUTION')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium border transition-all ${
                  strategy === 'CONTRIBUTION' 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Calculate Monthly Contribution
              </button>
              <button
                onClick={() => setStrategy('PRINCIPAL')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium border transition-all ${
                  strategy === 'PRINCIPAL' 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Calculate Starting Lump Sum
              </button>
            </div>

            {strategy === 'CONTRIBUTION' ? (
               <InputGroup
                label="Current Savings (Lump Sum)"
                value={currentSavings}
                onChange={setCurrentSavings}
                placeholder="0"
                prefix={symbol}
                icon={Wallet}
              />
            ) : (
               <InputGroup
                label="Planned Monthly Contribution"
                value={plannedContribution}
                onChange={setPlannedContribution}
                placeholder="500"
                prefix={symbol}
                icon={Wallet}
              />
            )}
            
            <p className="text-xs text-slate-500 italic">
              {strategy === 'CONTRIBUTION' 
                ? "We'll calculate how much you need to save each month to reach your goal."
                : "We'll calculate how much capital you need upfront to reach your goal with these contributions."}
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
             <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!name || !targetAmount || !date}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Calculator size={16} />
              Apply Goal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalSetup;
