import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  Percent, 
  Calendar, 
  RefreshCw, 
  TrendingUp,
  Target,
  Calculator,
  ArrowRight,
  TrendingDown,
  Coins,
  X,
  Wallet,
} from 'lucide-react';
import InputGroup from './components/InputGroup';
import SelectGroup from './components/SelectGroup';
import GrowthChart from './components/GrowthChart';
import InsightCard from './components/InsightCard';
import GoalSetup from './components/GoalSetup';
import ProgressBar from './components/ProgressBar';
import { 
  calculateCompoundInterest, 
  calculateRequiredPrincipal,
  calculateRequiredRate,
  calculateRequiredTime,
  calculateRequiredContribution,
  formatCurrency, 
  CalculationParams,
  formatNumber
} from './utils/calculator';
import { generateInvestmentInsight } from './services/geminiService';

type CalculationMode = 'FV' | 'PV' | 'RATE' | 'TIME' | 'PMT';

function App() {
  // Mode State
  const [mode, setMode] = useState<CalculationMode>('FV');
  const [currency, setCurrency] = useState<string>('$');

  // Input States
  const [principal, setPrincipal] = useState<string>('10000');
  const [contribution, setContribution] = useState<string>('0');
  const [rate, setRate] = useState<string>('7');
  const [years, setYears] = useState<string>('10');
  const [targetValue, setTargetValue] = useState<string>('20000');
  const [compounds, setCompounds] = useState<string>('12');
  const [inflation, setInflation] = useState<string>('3.0');

  // Goal State
  const [goalName, setGoalName] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<string | null>(null);

  // AI insights
  const [insight, setInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  // Parse numeric values safely
  const principalNum = parseFloat(principal) || 0;
  const contributionNum = parseFloat(contribution) || 0;
  const rateNum = parseFloat(rate) || 0;
  const yearsNum = parseFloat(years) || 0;
  const targetValueNum = parseFloat(targetValue) || 0;
  const compoundsNum = parseInt(compounds);
  const inflationNum = parseFloat(inflation) || 0;

  // Compute the "Full Scenario" based on the mode
  const { params, calculatedValue } = useMemo(() => {
    let resultParams: CalculationParams = {
      principal: principalNum,
      rate: rateNum,
      years: yearsNum,
      compoundsPerYear: compoundsNum,
      contribution: contributionNum,
      inflationRate: inflationNum
    };
    let calculated = 0;

    switch (mode) {
      case 'FV':
        calculated = calculateCompoundInterest(resultParams).futureValue;
        break;
      
      case 'PV':
        // Solve for Principal (Lump Sum needed)
        calculated = calculateRequiredPrincipal(targetValueNum, rateNum, yearsNum, compoundsNum, contributionNum);
        resultParams.principal = calculated;
        break;
      
      case 'PMT':
        // Solve for Contribution
        calculated = calculateRequiredContribution(principalNum, targetValueNum, rateNum, yearsNum, compoundsNum);
        resultParams.contribution = calculated;
        break;

      case 'RATE':
        calculated = calculateRequiredRate(principalNum, targetValueNum, yearsNum, compoundsNum, contributionNum);
        resultParams.rate = calculated;
        break;

      case 'TIME':
        calculated = calculateRequiredTime(principalNum, targetValueNum, rateNum, compoundsNum, contributionNum);
        resultParams.years = calculated;
        break;
    }

    return { params: resultParams, calculatedValue: calculated };
  }, [mode, principalNum, rateNum, yearsNum, targetValueNum, compoundsNum, inflationNum, contributionNum]);

  // Generate chart data using the fully constructed params
  const results = useMemo(() => {
    return calculateCompoundInterest(params);
  }, [params]);

  const compoundingOptions = [
    { label: 'Annually (1x/yr)', value: 1 },
    { label: 'Semiannually (2x/yr)', value: 2 },
    { label: 'Quarterly (4x/yr)', value: 4 },
    { label: 'Monthly (12x/yr)', value: 12 },
    { label: 'Daily (365x/yr)', value: 365 },
  ];
  
  const modeOptions = [
    { label: 'Future Value', value: 'FV' },
    { label: 'Present Value (Required Principal)', value: 'PV' },
    { label: 'Recurring Contribution', value: 'PMT' },
    { label: 'Interest Rate', value: 'RATE' },
    { label: 'Time Period', value: 'TIME' },
  ];

  // Reset insight when parameters change
  useEffect(() => {
    if (insight) {
       // Optional: setInsight(null); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [principal, contribution, rate, years, targetValue, compounds, mode, currency, goalName, inflation]);

  const handleGenerateInsight = async () => {
    setIsInsightLoading(true);
    setInsight(null);
    const resultText = await generateInvestmentInsight(params, results, mode as any, currency, goalName || undefined);
    setInsight(resultText);
    setIsInsightLoading(false);
  };

  const handleApplyGoal = (goal: { 
    name: string; 
    targetAmount: string; 
    years: string; 
    date: string; 
    principal: string; 
    contribution: string; 
    mode: 'PV' | 'PMT';
  }) => {
    setGoalName(goal.name);
    setTargetDate(goal.date);
    setTargetValue(goal.targetAmount);
    setYears(goal.years);
    setPrincipal(goal.principal);
    setContribution(goal.contribution);
    setMode(goal.mode);
  };

  const clearGoal = () => {
    setGoalName(null);
    setTargetDate(null);
  };

  const getResultLabel = () => {
    switch(mode) {
      case 'FV': return 'Future Value';
      case 'PV': return 'Required Start Principal';
      case 'PMT': return 'Required Contribution';
      case 'RATE': return 'Required Annual Rate';
      case 'TIME': return 'Time Required';
    }
  };

  const getResultDisplay = () => {
    if (mode === 'RATE') return `${formatNumber(calculatedValue)}%`;
    if (mode === 'TIME') return `${formatNumber(calculatedValue)} Years`;
    return formatCurrency(calculatedValue, currency);
  };

  const getContributionLabel = () => {
    if (compoundsNum === 12) return "Monthly Contribution";
    if (compoundsNum === 1) return "Annual Contribution";
    if (compoundsNum === 4) return "Quarterly Contribution";
    return "Recurring Contribution";
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
               <TrendingUp className="text-emerald-600" size={32} />
            </div>
            Smart Compound Calculator
          </h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Plan your financial future. Calculate growth, needed contributions, or required timeline to hit your goals.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            
            <GoalSetup onApplyGoal={handleApplyGoal} currency={currency} />

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* Goal Active Banner */}
              {goalName && (
                <div className="bg-indigo-50 border-b border-indigo-100 p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-900">Goal: {goalName}</span>
                  </div>
                  <button 
                    onClick={clearGoal}
                    className="text-indigo-400 hover:text-indigo-600 p-1"
                    title="Clear goal"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="p-6">
                <div className="space-y-5">
                  <SelectGroup
                    label="Calculation Goal"
                    value={mode}
                    onChange={(val) => setMode(val as CalculationMode)}
                    options={modeOptions}
                    icon={Calculator}
                  />

                  <InputGroup
                    label="Currency Symbol"
                    value={currency}
                    onChange={setCurrency}
                    icon={Coins}
                    placeholder="$"
                  />

                  {/* Principal (Hidden if calculating PV) */}
                  {mode !== 'PV' && (
                    <InputGroup
                      label="Principal Amount"
                      value={principal}
                      onChange={setPrincipal}
                      icon={DollarSign}
                      prefix={currency}
                      placeholder="0.00"
                      min={0}
                    />
                  )}

                  {/* Future Value (Hidden if calculating FV) */}
                  {mode !== 'FV' && (
                    <InputGroup
                      label={goalName ? "Goal Target Amount" : "Target Future Value"}
                      value={targetValue}
                      onChange={setTargetValue}
                      icon={Target}
                      prefix={currency}
                      placeholder="0.00"
                      min={0}
                    />
                  )}
                  
                  {/* Contribution (Hidden if calculating PMT) */}
                  {mode !== 'PMT' && (
                     <InputGroup
                      label={getContributionLabel()}
                      value={contribution}
                      onChange={setContribution}
                      icon={Wallet}
                      prefix={currency}
                      placeholder="0.00"
                      min={0}
                    />
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Rate Input (Hidden if calculating Rate) */}
                    {mode !== 'RATE' && (
                      <InputGroup
                        label="Interest Rate"
                        value={rate}
                        onChange={setRate}
                        icon={Percent}
                        suffix="%"
                        placeholder="5.0"
                        step={0.1}
                      />
                    )}
                    
                    {/* Time Input (Hidden if calculating Time) */}
                    {mode !== 'TIME' && (
                      <InputGroup
                        label="Time Period"
                        value={years}
                        onChange={setYears}
                        icon={Calendar}
                        suffix="Years"
                        placeholder="10"
                        min={0.1}
                        max={100}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup
                      label="Inflation Rate"
                      value={inflation}
                      onChange={setInflation}
                      icon={TrendingDown}
                      suffix="%"
                      placeholder="3.0"
                      step={0.1}
                    />

                    <SelectGroup
                      label="Frequency"
                      value={compounds}
                      onChange={setCompounds}
                      options={compoundingOptions}
                      icon={RefreshCw}
                    />
                  </div>
                </div>
              </div>

              {/* Input Summary Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                   <div className="p-1.5 bg-emerald-100 rounded-full text-emerald-600">
                     <ArrowRight size={14} />
                   </div>
                   Solving for <span className="font-semibold text-slate-900">{getResultLabel()}</span>
                </div>
              </div>
            </div>

            {/* AI Insight Card */}
            <div className="block">
               <InsightCard 
                insight={insight} 
                loading={isInsightLoading} 
                onGenerate={handleGenerateInsight}
                hasResult={params.years > 0}
              />
            </div>
          </div>

          {/* Right Column: Results & Chart */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Goal Progress Component */}
            <ProgressBar 
              currentValue={results.futureValue}
              targetValue={targetValueNum}
              currency={currency}
              goalName={goalName}
            />

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Primary Result */}
              <div className="bg-emerald-600 text-white rounded-xl p-6 shadow-md shadow-emerald-200/50 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-emerald-100 font-medium text-xs uppercase tracking-wide">
                    {getResultLabel()}
                  </p>
                  <div className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight truncate">
                    {getResultDisplay()}
                  </div>
                  <p className="mt-1 text-emerald-100 text-xs opacity-80">
                    {goalName ? `Target: ${goalName}` : 'Nominal Value'}
                  </p>
                </div>
                {/* Decorative circle */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white opacity-10 rounded-full pointer-events-none"></div>
              </div>

              {/* Total Interest */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <p className="text-slate-500 font-medium text-xs uppercase tracking-wide">Total Interest</p>
                <div className="mt-2 text-2xl lg:text-3xl font-bold text-emerald-600 tracking-tight truncate">
                  +{formatCurrency(results.totalInterest, currency)}
                </div>
                <p className="mt-1 text-slate-400 text-xs">
                  {results.futureValue > 0 
                    ? ((results.totalInterest / results.futureValue) * 100).toFixed(1) 
                    : 0}% of total value
                </p>
              </div>

              {/* Real Value (Purchasing Power) */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <p className="text-slate-500 font-medium text-xs uppercase tracking-wide flex items-center gap-1">
                  Purchasing Power
                  <span className="text-amber-500" title="Adjusted for inflation">
                    <TrendingDown size={14} />
                  </span>
                </p>
                <div className="mt-2 text-2xl lg:text-3xl font-bold text-amber-500 tracking-tight truncate">
                  {formatCurrency(results.futureValueReal, currency)}
                </div>
                <p className="mt-1 text-slate-400 text-xs">
                  Real Value ({inflationNum}% inflation)
                </p>
              </div>
            </div>

            {/* Chart */}
            <GrowthChart data={results.breakdown} currency={currency} />
            
            {/* Disclaimer */}
             <div className="text-center text-slate-400 text-xs mt-8">
               <p>Calculations are for informational purposes only. Actual returns and inflation rates may vary.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;