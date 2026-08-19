import React, { useState, useEffect } from 'react';
import { CurrencyIcon, ExchangeIcon, RefreshIcon, ChevronDownIcon } from './common/icons';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rateToUSD: number; // 1 USD = rate units of this currency
}

const initialCurrencies: Currency[] = [
  { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le', flag: '🇸🇱', rateToUSD: 22.85 },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', rateToUSD: 1.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rateToUSD: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', rateToUSD: 0.79 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', rateToUSD: 1530.0 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭', rateToUSD: 15.4 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', rateToUSD: 1.38 },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', flag: '🌍', rateToUSD: 603.5 },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', flag: '🪙', rateToUSD: 0.0000108 },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', flag: '🔷', rateToUSD: 0.00038 },
];

interface CurrencyConverterProps {
  onAskAIWithBudget?: (text: string) => void;
  className?: string;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onAskAIWithBudget, className = '' }) => {
  const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('SLE');
  const [amount, setAmount] = useState<string>('100');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const fromCurr = currencies.find((c) => c.code === fromCurrency) || currencies[1];
  const toCurr = currencies.find((c) => c.code === toCurrency) || currencies[0];

  // Calculate live conversion
  const numAmount = parseFloat(amount) || 0;
  const amountInUSD = numAmount / fromCurr.rateToUSD;
  const convertedAmount = amountInUSD * toCurr.rateToUSD;

  // Direct 1:1 exchange rate
  const directRate = (1 / fromCurr.rateToUSD) * toCurr.rateToUSD;

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleRefresh = () => {
    setIsUpdating(true);
    setTimeout(() => {
      // Simulate live minute-by-minute rate micro-fluctuations
      setCurrencies((prev) =>
        prev.map((c) => {
          if (c.code === 'USD') return c;
          const fluctuation = (Math.random() - 0.5) * 0.002;
          return {
            ...c,
            rateToUSD: +(c.rateToUSD * (1 + fluctuation)).toFixed(c.code === 'BTC' || c.code === 'ETH' ? 8 : 2),
          };
        })
      );
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsUpdating(false);
    }, 450);
  };

  const handlePreset = (val: number) => {
    setAmount(val.toString());
  };

  const handleUseInChat = () => {
    if (!onAskAIWithBudget) return;
    const formattedFrom = `${fromCurr.symbol}${numAmount.toLocaleString()} ${fromCurr.code}`;
    const formattedTo = `${toCurr.symbol}${convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${toCurr.code}`;
    const prompt = `Can you plan a trip in Sierra Leone with a budget of ${formattedFrom} (approx. ${formattedTo}) paying with KUNKU PAY?`;
    onAskAIWithBudget(prompt);
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${className}`}>
      {/* Header Bar */}
      <div 
        className="px-4 py-3 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 flex items-center justify-between cursor-pointer border-b border-slate-100 dark:border-slate-800/60 select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CurrencyIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100">KUNKU Pay Live Rates</span>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              1 {fromCurr.code} = {directRate < 0.01 ? directRate.toFixed(6) : directRate.toFixed(2)} {toCurr.code}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            title="Refresh exchange rates"
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${isUpdating ? 'animate-spin text-blue-500' : ''}`}
          >
            <RefreshIcon className="h-4 w-4" />
          </button>
          <div className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Expandable Converter Body */}
      {isExpanded && (
        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Quick Rates Ticker */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">USD / SLE</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {(22.85).toFixed(2)} Le
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">EUR / SLE</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {(22.85 / 0.92).toFixed(2)} Le
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">GBP / SLE</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {(22.85 / 0.79).toFixed(2)} Le
              </span>
            </div>
          </div>

          {/* Amount Inputs & Currencies */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* From Box */}
            <div className="sm:col-span-5 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                You Send / Budget
              </label>
              <div className="flex items-center justify-between gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent font-bold text-lg text-slate-900 dark:text-slate-100 outline-none"
                />
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold rounded-lg px-2 py-1.5 outline-none cursor-pointer text-slate-800 dark:text-slate-100"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="sm:col-span-2 flex justify-center">
              <button
                type="button"
                onClick={handleSwap}
                title="Swap currencies"
                className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
              >
                <ExchangeIcon className="h-4 w-4" />
              </button>
            </div>

            {/* To Box */}
            <div className="sm:col-span-5 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Converted Amount
              </label>
              <div className="flex items-center justify-between gap-2">
                <div className="w-full font-bold text-lg text-blue-600 dark:text-blue-400 truncate">
                  {toCurr.symbol}{' '}
                  {convertedAmount < 0.001 && convertedAmount > 0
                    ? convertedAmount.toFixed(8)
                    : convertedAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                </div>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold rounded-lg px-2 py-1.5 outline-none cursor-pointer text-slate-800 dark:text-slate-100"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
              {[25, 50, 100, 250, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                >
                  {fromCurr.symbol}{preset}
                </button>
              ))}
            </div>
          </div>

          {/* KUNKU PAY Wallet Perks & AI Action Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>KUNKU PAY Rate: 0% fee applied • Updated {lastUpdated}</span>
            </div>

            {onAskAIWithBudget && (
              <button
                type="button"
                onClick={handleUseInChat}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>Plan trip with this budget</span>
                <span>✨</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;
