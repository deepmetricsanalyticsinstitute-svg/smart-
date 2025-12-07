
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { YearResult, formatCurrency } from '../utils/calculator';
import { TrendingUp, BarChart2 } from 'lucide-react';

interface GrowthChartProps {
  data: YearResult[];
  currency: string;
}

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const hasTotal = payload.some((p: any) => p.dataKey === 'total');
    const hasPrincipal = payload.some((p: any) => p.dataKey === 'principal');
    const hasReal = payload.some((p: any) => p.dataKey === 'realValue');

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm bg-opacity-95 backdrop-blur-sm">
        <p className="font-semibold text-slate-900 mb-2 border-b border-slate-100 pb-1">Year {label}</p>
        <div className="space-y-1.5">
          {hasTotal && (
            <p className="text-emerald-600 font-bold flex justify-between gap-4">
              <span>Total Balance:</span>
              <span>{formatCurrency(data.total, currency)}</span>
            </p>
          )}
          {hasReal && (
            <p className="text-amber-500 font-medium flex justify-between gap-4">
              <span>Purchasing Power:</span>
              <span>{formatCurrency(data.realValue, currency)}</span>
            </p>
          )}
          {hasPrincipal && (
            <p className="text-indigo-500 font-medium flex justify-between gap-4">
              <span>Total Invested:</span>
              <span>{formatCurrency(data.principal, currency)}</span>
            </p>
          )}
           {hasTotal && (
            <div className="pt-1 mt-1 border-t border-slate-100 text-slate-500 text-xs flex justify-between gap-4">
               <span>Interest Earned:</span>
               <span>{formatCurrency(data.interest, currency)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const GrowthChart: React.FC<GrowthChartProps> = ({ data, currency }) => {
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});
  const [useLogScale, setUseLogScale] = useState(false);

  const handleLegendClick = (e: any) => {
    const { dataKey } = e;
    setHiddenSeries((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  const symbol = currency;

  return (
    <div className="w-full h-[450px] sm:h-[550px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
           <TrendingUp size={20} className="text-emerald-600"/>
           Growth Trajectory
        </h3>
        <button
            onClick={() => setUseLogScale(!useLogScale)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all
              ${useLogScale 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'}
            `}
        >
            <BarChart2 size={14} />
            {useLogScale ? 'Logarithmic' : 'Linear'}
        </button>
      </div>
      
      <div className="flex-grow min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="year" 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
              dy={10}
              minTickGap={30}
            />
            <YAxis 
              tickFormatter={(value) => {
                  if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${symbol}${(value / 1000).toFixed(0)}k`;
                  return `${symbol}${value}`;
              }} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
              dx={-10}
              scale={useLogScale ? 'log' : 'auto'}
              domain={useLogScale ? ['auto', 'auto'] : [0, 'auto']}
              allowDataOverflow={true} // Helps with log scale consistency
            />
            <Tooltip 
              content={(props) => <CustomTooltip {...props} currency={currency} />} 
              cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right"
              height={36}
              onClick={handleLegendClick}
              wrapperStyle={{ cursor: 'pointer', paddingBottom: '10px' }}
              formatter={(value, entry: any) => {
                const isHidden = hiddenSeries[entry.dataKey];
                return (
                  <span className={`${isHidden ? 'line-through opacity-50' : ''} text-slate-600 font-medium ml-1`}>
                    {value}
                  </span>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
              name="Total Balance"
              hide={hiddenSeries['total'] === true}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#10b981' }}
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="realValue"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorReal)"
              name="Purchasing Power"
              hide={hiddenSeries['realValue'] === true}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#f59e0b' }}
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="principal"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorPrincipal)"
              name="Total Invested"
              hide={hiddenSeries['principal'] === true}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#6366f1' }}
              animationDuration={1000}
            />
            <Brush 
                dataKey="year" 
                height={30} 
                stroke="#cbd5e1"
                fill="#f8fafc"
                tickFormatter={(value) => `${value}y`}
                travellerWidth={10}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GrowthChart;
