import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputGroupProps {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  icon?: LucideIcon;
  type?: string;
  placeholder?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  suffix?: string;
  prefix?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({
  label,
  value,
  onChange,
  icon: Icon,
  type = "number",
  placeholder,
  min,
  max,
  step,
  suffix,
  prefix,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-slate-500" />}
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-slate-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full rounded-lg border-slate-300 border py-2.5 px-3 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm shadow-sm transition-all
            ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-12' : ''}
          `}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-slate-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputGroup;