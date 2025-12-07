

export interface CalculationParams {
  principal: number;
  rate: number;
  years: number;
  compoundsPerYear: number;
  contribution: number;
  inflationRate?: number;
}

export interface YearResult {
  year: number;
  principal: number; // Represents Total Invested (Initial + Contributions)
  interest: number;
  total: number;
  realValue: number;
}

export interface CalculationResult {
  futureValue: number;
  totalInterest: number;
  futureValueReal: number;
  breakdown: YearResult[];
}

// Standard FV Calculation with Contributions
export const calculateCompoundInterest = ({
  principal,
  rate,
  years,
  compoundsPerYear,
  contribution = 0,
  inflationRate = 0,
}: CalculationParams): CalculationResult => {
  const r = rate / 100;
  const n = compoundsPerYear;
  const t = years;
  const inf = inflationRate / 100;
  const pmt = contribution;
  
  // Rate per period
  const i = r / n;
  // Total number of periods
  const N = n * t;

  let amount = 0;

  // Formula: A = P(1 + i)^N + PMT * [ ((1 + i)^N - 1) / i ]
  if (rate === 0) {
    amount = principal + (pmt * N);
  } else {
    const compoundFactor = Math.pow(1 + i, N);
    amount = (principal * compoundFactor) + (pmt * (compoundFactor - 1) / i);
  }

  const totalInvested = principal + (pmt * N);
  const totalInterest = amount - totalInvested;
  const amountReal = amount / Math.pow(1 + inf, t);

  // Generate year-by-year breakdown for the chart
  const breakdown: YearResult[] = [];

  for (let j = 0; j <= Math.ceil(t); j++) {
    const timePoint = j;
    const currentN = n * timePoint;
    
    let yearAmount = 0;
    let currentInvested = principal + (pmt * currentN);

    if (timePoint === 0) {
      breakdown.push({
        year: 0,
        principal: principal,
        interest: 0,
        total: principal,
        realValue: principal,
      });
      continue;
    }

    if (rate === 0) {
      yearAmount = principal + (pmt * currentN);
    } else {
      const yearCompoundFactor = Math.pow(1 + i, currentN);
      yearAmount = (principal * yearCompoundFactor) + (pmt * (yearCompoundFactor - 1) / i);
    }

    const yearInterest = yearAmount - currentInvested;
    const yearReal = yearAmount / Math.pow(1 + inf, timePoint);

    breakdown.push({
      year: timePoint,
      principal: currentInvested, // Shows total money put in
      interest: yearInterest,
      total: yearAmount,
      realValue: yearReal,
    });
  }

  // Handle fractional final year if necessary
  if (!Number.isInteger(t) && t > 0) {
     const finalResult = {
        year: Number(t.toFixed(2)),
        principal: totalInvested,
        interest: totalInterest,
        total: amount,
        realValue: amountReal
     };
     // Replace the last integer year if it's past the time, or append
     if (breakdown[breakdown.length - 1].year > t) {
       breakdown.pop();
     }
     breakdown.push(finalResult);
  }

  return {
    futureValue: amount,
    totalInterest,
    futureValueReal: amountReal,
    breakdown,
  };
};

// Solve for P: P = [FV - PMT * (((1+i)^N - 1)/i)] / (1+i)^N
export const calculateRequiredPrincipal = (
  futureValue: number, 
  rate: number, 
  years: number, 
  compoundsPerYear: number,
  contribution: number = 0
): number => {
  const r = rate / 100;
  const n = compoundsPerYear;
  const t = years;
  const i = r / n;
  const N = n * t;
  const pmt = contribution;

  if (t <= 0) return futureValue;
  if (rate === 0) {
    return futureValue - (pmt * N);
  }

  const compoundFactor = Math.pow(1 + i, N);
  const annuityPart = pmt * (compoundFactor - 1) / i;
  
  return (futureValue - annuityPart) / compoundFactor;
};

// Solve for PMT: PMT = [FV - P(1+i)^N] / [ ((1+i)^N - 1) / i ]
export const calculateRequiredContribution = (
  principal: number,
  futureValue: number,
  rate: number,
  years: number,
  compoundsPerYear: number
): number => {
  const r = rate / 100;
  const n = compoundsPerYear;
  const t = years;
  const i = r / n;
  const N = n * t;

  if (t <= 0) return 0;
  if (rate === 0) {
    // FV = P + PMT*N => PMT = (FV - P) / N
    return (futureValue - principal) / N;
  }

  const compoundFactor = Math.pow(1 + i, N);
  const numerator = futureValue - (principal * compoundFactor);
  const denominator = (compoundFactor - 1) / i;

  return numerator / denominator;
};

// Solve for r using Binary Search (Numerical approximation)
// Equation: P(1+r/n)^N + PMT[((1+r/n)^N - 1)/(r/n)] - FV = 0
export const calculateRequiredRate = (
  principal: number, 
  futureValue: number, 
  years: number, 
  compoundsPerYear: number,
  contribution: number = 0
): number => {
  if (years <= 0) return 0;
  if (principal >= futureValue && contribution >= 0) return 0; // Loss or zero growth needed

  const n = compoundsPerYear;
  const N = n * years;
  const pmt = contribution;

  // Simple cases
  if (pmt === 0) {
     if (principal <= 0) return 0;
     // Standard formula
     const base = Math.pow(futureValue / principal, 1 / N);
     return n * (base - 1) * 100;
  }

  // Binary search for Rate
  let low = 0;
  let high = 10; // 1000%
  const tolerance = 0.000001;
  const maxIterations = 100;

  for (let iter = 0; iter < maxIterations; iter++) {
    const mid = (low + high) / 2;
    const r = mid;
    const i = r / n;
    
    let fvGuess = 0;
    if (r === 0) {
        fvGuess = principal + (pmt * N);
    } else {
        const factor = Math.pow(1 + i, N);
        fvGuess = (principal * factor) + (pmt * (factor - 1) / i);
    }

    if (Math.abs(fvGuess - futureValue) < tolerance) {
      return mid * 100;
    }

    if (fvGuess < futureValue) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return low * 100;
};

// Solve for t: 
// N = ln( (FV*i + PMT) / (P*i + PMT) ) / ln(1+i)
// t = N / n
export const calculateRequiredTime = (
  principal: number, 
  futureValue: number, 
  rate: number, 
  compoundsPerYear: number,
  contribution: number = 0
): number => {
  const r = rate / 100;
  const n = compoundsPerYear;
  const pmt = contribution;

  // Edge cases
  if (futureValue <= principal && pmt >= 0) return 0;
  
  if (rate === 0) {
    if (pmt <= 0) return 0; // Infinite time if no growth and no contribution
    // FV = P + PMT*N => N = (FV - P)/PMT
    return (futureValue - principal) / pmt / n;
  }

  const i = r / n;
  
  // Formula constraint: Argument of log must be positive
  const numeratorArg = futureValue * i + pmt;
  const denominatorArg = principal * i + pmt;

  if (numeratorArg <= 0 || denominatorArg <= 0) return 0; // Invalid scenario

  const numerator = Math.log(numeratorArg / denominatorArg);
  const denominator = Math.log(1 + i);
  
  const N = numerator / denominator;
  return N / n;
};

export const getYearsUntil = (targetDate: string): number => {
  const start = new Date();
  const end = new Date(targetDate);
  const diffTime = end.getTime() - start.getTime();
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0.1, diffYears);
};

export const formatCurrency = (value: number, symbol: string = '$'): string => {
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  
  return `${symbol}${formattedNumber}`;
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};
