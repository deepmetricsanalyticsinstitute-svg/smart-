import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Option {
  label: string;
  value: string | number;
}

interface SelectGroupProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Option[];
  icon?: LucideIcon;
}

const SelectGroup: React.FC<SelectGroupProps> = ({
  label,
  value,
  onChange,
  options,
  icon: Icon,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-slate-500" />}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full appearance-none rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm shadow-sm transition-all"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SelectGroup;